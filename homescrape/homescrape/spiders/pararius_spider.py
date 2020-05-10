import scrapy 
import time
from datetime import datetime
from homescrape.items import HomeItem, ScreenshotItem, DistanceItem


list_of_cities = [
    'amsterdam',
    'utrecht',
    'rotterdam',
    'delft',
    'leiden',
    'den-haag',
    'hilversum',
    'almere',
]

start_url_setting = [
    'https://www.pararius.com/apartments/'+city for city in list_of_cities
    ]


# Conversion function 
def convert_currency_text_to_number(currency_text):
    currency_text = currency_text[:currency_text.find(' ')]
    currency_number = float(currency_text.replace('€','').replace(',',''))
    return currency_number

def convert_area_text_to_number(area_text):
    length_of_number = area_text.find(' ')
    area_number = float(area_text[:length_of_number].replace(',',''))
    return area_number


def convert_string_to_datetime(datetime_string):
    datetime_string = datetime_string.replace('From ','')
    if datetime_string == 'Immediately':
        datetime_value = datetime.now()

    else:
        datetime_value = datetime.strptime(datetime_string,'%d-%m-%Y')

    return datetime_value

def get_text(response, xpath_selector):
    return response.xpath(xpath_selector).get()


class ParariusSpider(scrapy.Spider):
    name = 'pararius'

    start_urls = start_url_setting
    def parse(self, response):
        # #Follow links to each specific house
        for href in response.xpath("//ul[@class='search-list']/li//h2/a/@href"):
            time.sleep(3)
            # print('traversing to house {}'.format(href))
            yield response.follow(href, self.parse_property)

        # Follow links to next page (maximum 5 pages)
        for href in response.xpath("//a[@aria-label='Next']/@href"):
            page_number = href.get().split('-')[-1]
            if page_number == '6': # maximum page number
                break
            else:
                time.sleep(3)
                print('traversing to next page {}'.format(href))
                yield response.follow(href, self.parse)

        
    def parse_property(self,response):
        # print("parse_property function triggered")


        url_elements = response.url.split('/')
        

        p = HomeItem()
        p['id_from_website']            = url_elements[-2]
        p['property_name']              = url_elements[-1]
        p['street']                     = response.xpath("//a[@class='breadcrumbs__link breadcrumbs__link--street']/text()").get() 
        p['region']                     = response.xpath("//a[@class='breadcrumbs__link breadcrumbs__link--district']/text()").get() 
        p['postcode']                   = response.xpath("//div[@class ='listing-detail-summary__location']/text()").get()[:7] 
        p['price']                      = float(response.xpath("//meta[@itemprop='price']/@content").get())

        #######################################################################################################################################################################
        feature_description_text        =  response.xpath("//dd[@class='listing-features__description listing-features__description--for_rent_price']/span/text()").get() 
        p['including_utilities']          = "including" in feature_description_text.lower()
        p['state_of_furnishing']        = "unfurnished" if "unfurnished" in feature_description_text else "furnished"

        p['area']                       = convert_area_text_to_number(response.xpath("//dd[contains(@class,'surface_area')]/span/text()").get())
        p['number_of_bedrooms']         = response.xpath("//dd[contains(@class,'number_of_bedrooms')]/span/text()").get()

        p['energy_label']               = response.xpath("//dd[contains(@class,'energy-label')]/span/text()").get()

        #######################################################################################################################################################################

        description_paragraphs          = response.xpath("//div[contains(@class,'additional')]//p")
        description_text                = []
        for paragraph in description_paragraphs:
            raw_text = paragraph.get()
            clean_text = raw_text.replace('<p>','').replace('</p>','')
            description_text.append(paragraph.get())

        p['description_from_tenant']    = ' '.join(description_text)
        # p['tenant_contact_information'] = str(response.xpath("//a[contains(@class, 'telephone')]/@data-telephone").get())
        p['property_website_source']    = 'Pararius'
        p['property_source_url']        = response.url
        p['city']                       = url_elements[-3]
        p['type_of_property']           = response.xpath("//dd[contains(@class,'dwelling')]/span/text()").get()

        #######################################################################################################################################################################

        available_from_string           = response.xpath("//dd[contains(@class,'acceptance')]/span/text()").get()

        p['available_from']             = convert_string_to_datetime(available_from_string)

        offered_since_string            = response.xpath("//dd[contains(@class,'offered')]/span/text()").get()
        p['offered_since']              = convert_string_to_datetime(offered_since_string) 

        year_of_construction_el         = response.xpath("//dd[contains(@class,'construction_period')]/span/text()").get()
        p['year_of_construction']       = int(year_of_construction_el) if year_of_construction_el.isdigit() else None


        homerecord = p.save()



        # Save screenshot links
        # first screenshot
        link_to_screenshot = response.xpath('//div[@class="carrousel__item"]//source/@srcset').getall()
        for link in link_to_screenshot:
            if "https://" in link and "media.pararius.nl" in link: 
                s = ScreenshotItem(link=link, 
                                    home = homerecord
                                    )
                s.save()
                         


    # def parse_distances(self,response):
    #     print('parsing distance function activated')
    #     print(response.meta['homerecord'])

    #     # Transit distances
    #     category = 'transit'
    #     base_xpath_selector = '//ul[contains(@class, "points-of-interest__list--transit")]/li/ul/li[@class="points-of-interest__poi"]'
    #     list_of_transits_labels = response.xpath(base_xpath_selector+'/span[@class="points-of-interest__label"]/text()').getall()
    #     list_of_transits_distances = response.xpath(base_xpath_selector+'/span[@class="points-of-interest__distance"]/text()').getall()

    #     for i in range(len(list_of_transits_labels)):
    #         print(list_of_transits_labels[i]+list_of_transits_distances[i])

        # Education distances


        # Grocery distances

