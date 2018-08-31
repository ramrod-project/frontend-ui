from django.urls import path

from .views import get_commands_controller, new_target_form, val_target_form, execute_sequence_controller, \
    w4_output_controller, w4_output_controller_download, edit_target_form, val_edit_target_form, \
    persist_job_state, load_job_state, delete_specific_target, file_upload_list, del_file_from_list, \
    get_file_listing, get_file, get_plugin_list, update_plugin, desired_plugin_state_controller, \
    get_interfaces


app_name = 'pcp_app'

urlpatterns = [
    path('action/get_command_list/', get_commands_controller),  # url for get_commands_controller controller
    path('action/get_w3_data/', execute_sequence_controller),   # url for execute sequence in W3
    path('action/get_output_data/', w4_output_controller),      # url for execute w4_output_controller controller
    path('action/get_full_output_data/', w4_output_controller_download),  # url for w4_output_controller_download
    path('new_target_form/', new_target_form),                  # url to render new target form
    path('action/val_target_form/', val_target_form),           # url for val_capability_form controller
    path('edit_target_form/<target_id>/', edit_target_form),           # url to render edit target form
    path('action/val_edit_target_form/<target_id>/', val_edit_target_form),  # url for val_capability_form controller
    path('action/save_state/', persist_job_state),              # url for save_state
    path('action/load_state/', load_job_state),                 # url for save_state
    path('delete_target_row/<target_id>/', delete_specific_target),         # url to delete specific target
    path('file_upload/', file_upload_list),  # file upload
    path('file_listing/', get_file_listing),  # populate file list to ui
    path('del_file_upload/<file_id>/', del_file_from_list),  # delete file from file list and from db
    path('file_download/<file_id>/', get_file),  # download file @ W4
    path('get_plugin_list/', get_plugin_list),
    path('update_plugin/<plugin_id>/', update_plugin),
    path('get_interfaces/', get_interfaces),
    path('desired_plugin_state/', desired_plugin_state_controller),  # url for desired state action controller
    ]
