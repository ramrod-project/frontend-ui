from django.http import HttpResponse
from django.shortcuts import render
from Backend.db_dir.custom_queries import get_brain_targets, get_specific_commands

import json


# This function is for a future ticket pcp-73
# TODO: COMMENTS
def get_command_list(request):
    """
    get_capability_list function returns a specific list of capabilities
    as a json depending on the plugin name the user clicked.
    :param request: user request
    :return: list of capabilities as a json
    """
    if request.method == 'GET':
        user_select = request.GET.get('plugin_name')

        return HttpResponse(json.dumps(get_specific_commands(user_select)),
                            content_type="application/json")


# This function is for a future ticket pcp-68
def new_target_form(request):
    pass


# This function is for a future ticket pcp-68
def val_target_form(request):
    pass

