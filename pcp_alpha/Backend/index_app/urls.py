from django.urls import path

from .views import get_target_list

app_name = 'index_app'
urlpatterns = [
    path('', get_target_list, name='home'),  # default home page
    ]
