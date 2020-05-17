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
    # General metadata information
    id_from_website = models.TextField()
    property_website_source = models.TextField(default='')
    property_source_url = models.TextField(default='')
    property_name = models.TextField()

    # Location
    street = models.TextField(default='')
    region = models.TextField(default='')
    city = models.TextField(default='')
    postcode = models.TextField(default='')

    # Renting information
    tenant_contact_information = models.TextField(default='')
    description_from_tenant = models.TextField()
    offered_since = models.DateTimeField()
    available_from = models.DateTimeField()
    price = models.FloatField()
    rental_period = models.TextField(default='',null=True) 

    # building information
    year_of_construction = models.IntegerField(null=True)
    type_of_property = models.TextField(default='')
    type_of_construction = models.TextField(default='')
    area = models.FloatField()
    number_of_bedrooms = models.IntegerField()
    number_of_rooms = models.IntegerField()
    number_of_bathrooms = models.IntegerField()
    state_of_furnishing = models.TextField()

    # Utilities & Amenities
    including_utilities = models.BooleanField()
    energy_label = models.TextField(null=True)
    facilities = models.TextField(null=True)
    balcony_present = models.BooleanField(default=False) 
    garden_present = models.BooleanField(default=False)  
    storage_present = models.BooleanField(default=False) 
    garage_present = models.BooleanField(default=False) 

class Screenshot(models.Model):
    sequence = models.IntegerField(default=0)
    home = models.ForeignKey(
        Home, related_name='screenshots', on_delete=models.CASCADE)
    link = models.TextField()
    srcset = models.TextField()

    def __str__(self):
        return '%s' % (self.link)


