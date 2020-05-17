import scrapy 
import time
from datetime import datetime
from homescrape.items import HomeItem, ScreenshotItem


list_of_cities = [
    'amsterdam',
    'utrecht',
    'rotterdam',
    'delft',
    'leiden',
    'den-haag',
    'hilversum',
    'almere',
    'purmerend',
    'zaandam',
    'haarlem',
    'hoofddorp',
    'deventer',
    'eindhoven',
    'amstelveen',
    'zeist',
    'soest',
    'amersfoort',
    'apeldoorn',
    'arnhem',
    'tilburg',
    'breda',
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

def get_dd_text(response, target_class):
    xpath_string = "//dd[contains(@class,'"+ target_class +"')]/span/text()"
    return response.xpath(xpath_string).get()


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
            if page_number == '10': # maximum page number
                break
            else:
                time.sleep(3)
                # print('traversing to next page {}'.format(href))
                yield response.follow(href, self.parse)

        
    def parse_property(self,response):
        print("parse_property function triggered")


        url_elements = response.url.split('/')
        

        p = HomeItem()
        #######################################################################################################################################################################
        # General metadata information
        p['id_from_website']            = url_elements[-2]
        p['property_website_source']    = 'Pararius'
        p['property_source_url']        = response.url
        p['property_name']              = url_elements[-1]
        #######################################################################################################################################################################
        # Location
        p['city']                       = url_elements[-3]
        p['street']                     = response.xpath("//a[@class='breadcrumbs__link breadcrumbs__link--street']/text()").get() 
        p['region']                     = response.xpath("//a[@class='breadcrumbs__link breadcrumbs__link--district']/text()").get() 
        p['postcode']                   = response.xpath("//div[@class ='listing-detail-summary__location']/text()").get()[:7] 

        #######################################################################################################################################################################
        # Renting information 
        p['price']                      = float(response.xpath("//meta[@itemprop='price']/@content").get())
        p['tenant_contact_information'] = str(response.xpath("//a[contains(@class, 'telephone')]/@data-telephone").get())
        feature_description_text        =  get_dd_text(response,"for_rent_price")

        description_paragraphs          = response.xpath("//div[contains(@class,'additional')]//p")
        description_text                = []
        for paragraph in description_paragraphs:
            raw_text = paragraph.get()
            clean_text = raw_text.replace('<p>','').replace('</p>','')
            description_text.append(paragraph.get())
        p['description_from_tenant']    = ' '.join(description_text)

        available_from_string           = get_dd_text(response,"acceptance")
        p['available_from']             = convert_string_to_datetime(available_from_string)

        offered_since_string            = get_dd_text(response,"offered")
        p['offered_since']              = convert_string_to_datetime(offered_since_string) 
        p['rental_period']              = get_dd_text(response,'contract_duration')

        #######################################################################################################################################################################
        # building information 
        year_of_construction_el         = get_dd_text(response,"construction_period")
        p['year_of_construction']       = int(year_of_construction_el) if year_of_construction_el.isdigit() else None
        
        p['area']                       = convert_area_text_to_number(get_dd_text(response,"surface_area"))
        p['type_of_property']           = get_dd_text(response,'dwelling')
        p['type_of_construction']       = get_dd_text(response,'construction_type')
        p['number_of_bedrooms']         = get_dd_text(response,'number_of_bedrooms')
        p['number_of_rooms']            = get_dd_text(response,'number_of_rooms')
        p['number_of_bathrooms']        = get_dd_text(response,'number_of_bathrooms')
        p['state_of_furnishing']        = "semi-furnished" if "semi-furnished" in feature_description_text else "furnished"

        #######################################################################################################################################################################
        # utilities and amenities
        p['energy_label']               = get_dd_text(response,'energy-label')
        p['including_utilities']        = True if "including" in feature_description_text.lower() else False
        p['facilities']                 = get_dd_text(response,"facilities")
        p['balcony_present']            = True if get_dd_text(response,"balcony")  == "Present" else False
        p['garden_present']             = True if get_dd_text(response,"garden")   == "Present" else False
        p['storage_present']            = True if get_dd_text(response,"storage")  == "Present" else False
        p['garage_present']             = True if get_dd_text(response,"garage")   == "Present" else False


        homerecord = p.save()


        #######################################################################################################################################################################
        # Save screenshot links
        link_to_srcset = response.xpath('//div[contains(@class,"carrousel--listing-detail")]//source/@srcset').getall()
        link_to_screenshot = response.xpath('//div[contains(@class,"carrousel--listing-detail")]//img/@src').getall()
        carousel_size = len(link_to_srcset)
        for counter in range(carousel_size):
            srcset = link_to_srcset[counter]
            src = link_to_screenshot[counter]

            if "https://" in link and "media.pararius.nl" in src: 
                s = ScreenshotItem(
                    sequence = counter,
                    srcset = srcset,
                    link=src, 
                    home = homerecord
                                    )
                s.save()
                         



