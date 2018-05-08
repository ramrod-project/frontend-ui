from django.urls import path

from .views import get_command_list, new_target_form, val_target_form

app_name = 'pcp_app'

urlpatterns = [
    path('action/get_command_list/', get_command_list),  # url for get_capability_list controller
    path('new_target_form/', new_target_form),                 # url to render new target form
    path('action/val_target_form/', val_target_form),  # url for val_capability_form controller
    ]
