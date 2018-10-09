from django.urls import path
from .views import render_log_page, log_data_controller


app_name = 'logs_app'
urlpatterns = [
    path('logs_page/', render_log_page),  # logs page
    path('logs_data/', log_data_controller),
    ]
