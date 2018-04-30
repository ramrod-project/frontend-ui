from django.urls import path

from .views import get_host_list

app_name = 'index_app'
urlpatterns = [
    path('', get_host_list, name='home'),  # default home page
    ]
