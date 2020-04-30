from django.db import models

# Create your models here.

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
    
class Screenshot(models.Model):
    home = models.ForeignKey(Home, on_delete=models.CASCADE)
    link = models.TextField()

class Distance(models.Model):
    home = models.ForeignKey(Home, on_delete=models.CASCADE)
    category = models.TextField()
    distance_item_name = models.TextField()
    distance_in_meters = models.FloatField()
