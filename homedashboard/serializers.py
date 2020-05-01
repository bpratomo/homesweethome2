from rest_framework import serializers
from .models import Home

class DashboardSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Home
        fields = [
            'price',
            'area',
            'energy_label',
            'city',
            'type_of_property',
            'region',
            'postcode',
            'number_of_bedrooms',
            'year_of_construction'
        ]