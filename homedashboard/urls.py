from django.urls import path
from .views import HomeListView

urlpatterns = [
    path("browse/",HomeListView.as_view(),name='homelistview')
]
