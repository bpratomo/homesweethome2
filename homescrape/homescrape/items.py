# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class HomescrapeItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    pass

from scrapy_djangoitem import DjangoItem



from homedashboard.models import Home,Screenshot


class HomeItem(DjangoItem):
    django_model = Home

class ScreenshotItem(DjangoItem):
    django_model = Screenshot


