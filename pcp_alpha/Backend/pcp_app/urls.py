from django.urls import path

from .views import get_commands_controller, new_target_form, val_target_form, execute_sequence_controller, \
    w4_output_controller, w4_output_controller_download, edit_target_form, val_edit_target_form, \
    persist_job_state, load_job_state

app_name = 'pcp_app'

urlpatterns = [
    path('action/get_command_list/', get_commands_controller),  # url for get_commands_controller controller
    path('action/get_w3_data/', execute_sequence_controller),   # url for execute sequence in W3
    path('action/get_output_data/', w4_output_controller),      # url for execute w4_output_controller controller
    path('action/get_full_output_data/', w4_output_controller_download),  # url for execute w4_output_controller controller
    path('new_target_form/', new_target_form),                  # url to render new target form
    path('action/val_target_form/', val_target_form),           # url for val_capability_form controller
    path('edit_target_form/<target_id>/', edit_target_form),           # url to render edit target form
    path('action/val_edit_target_form/<target_id>/', val_edit_target_form),  # url for val_capability_form controller
    path('action/save_state/', persist_job_state),              # url for save_state
    path('action/load_state/', load_job_state),              # url for save_state
    ]
