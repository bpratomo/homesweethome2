from django.db import models
import uuid

# Create your models here.

class ScrapeId(models.Model):
    scrapedate = models.DateTimeField(auto_now_add=True, blank=True)
    scrapeId = models.UUIDField(default=uuid.uuid4)

    def __str__(self):
        pass

    class Meta:
        db_table = ''
        managed = True
        verbose_name = 'ScrapeId'
        verbose_name_plural = 'ScrapeIds'


class Home(models.Model):
    id_from_website = models.TextField()
    property_name = models.TextField()
    street = models.TextField(default='')
    region = models.TextField(default='')
    postcode = models.TextField(default='')
    price = models.FloatField()
    including_utilities = models.BooleanField()
    area = models.FloatField()
    number_of_bedrooms = models.IntegerField()
    state_of_furnishing = models.TextField()
    available_from = models.DateTimeField()
    offered_since = models.DateTimeField()
    energy_label = models.TextField(null=True)
    description_from_tenant = models.TextField()
    tenant_contact_information = models.TextField(default='')
    property_website_source = models.TextField(default='')
    property_source_url = models.TextField(default='')
    city = models.TextField(default='')
    type_of_property = models.TextField(default='')
    year_of_construction = models.IntegerField(null=True)
    
class Screenshot(models.Model):
    home = models.ForeignKey(Home,related_name='screenshots', on_delete=models.CASCADE)
    link = models.TextField()

    def __str__(self):
        return '%s' % (self.link)

class Distance(models.Model):
    home = models.ForeignKey(Home, on_delete=models.CASCADE)
    category = models.TextField()
    distance_item_name = models.TextField()
    distance_in_meters = models.FloatField()
