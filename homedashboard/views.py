from django.shortcuts import render
from django.views.generic import ListView
from .models import Home, Screenshot
from rest_framework import viewsets, permissions
from .serializers import HomeSerializer, SimpleDashboardSerializer

# Create your views here.
class HomeListView(ListView):
    model = Home
    context_object_name = 'homes'
    template_name = "index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["cities"] = Home.objects.values('city').distinct()
        context["years"] = Home.objects.values('year_of_construction').distinct()
        context["property_types"] = Home.objects.values('type_of_property').distinct()
        return context
    


class DashboardViewSet(viewsets.ModelViewSet):
    queryset = Home.objects.order_by('-id')
    serializer_class = SimpleDashboardSerializer


class HomeViewSet(viewsets.ModelViewSet):
    queryset = Home.objects.all()
    serializer_class = HomeSerializer
