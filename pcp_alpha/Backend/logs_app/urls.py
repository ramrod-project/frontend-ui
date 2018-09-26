from django.urls import path
from .views import get_log_data


app_name = 'logs_app'
urlpatterns = [
    path('logs_page/', get_log_data),  # logs page
    ]
