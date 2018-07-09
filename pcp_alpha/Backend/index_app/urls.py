from django.urls import path

from .views import get_index_data

app_name = 'index_app'
urlpatterns = [
    path('', get_index_data, name='home'),  # default home page
    ]
