from django.shortcuts import render
from django.views.generic import ListView
from .models import Home, Screenshot

# Create your views here.
class HomeListView(ListView):
    model = Home
    context_object_name = 'homes'
    template_name = "index.html"

