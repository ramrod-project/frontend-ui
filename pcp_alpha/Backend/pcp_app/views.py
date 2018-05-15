from django.http import HttpResponse
# from django.shortcuts import render  # import will be used for a future ticket pcp-68
from Backend.db_dir.custom_queries import get_specific_commands, get_specific_brain_targets, \
    get_specific_command, insert_brain_jobs_w3

from uuid import uuid4
import json


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


def execute_sequence(request):
    """
    execute_sequence function is called when the user clicks on
    'Execute Sequence' button in W3
    :param request: user request
    :return: returns data from w3 to the ui
    """
    command_item = ""
    target_item = ""

    if request.method == 'GET':
        exe_target_plugin = request.GET.get('target_plugin')
        exe_targ_location = request.GET.get('target_location')
        exe_command_name = request.GET.get('command_name')
        exe_command_args = request.GET.get('command_args')

        print("\nexe_target_plugin == {}".format(exe_target_plugin))
        print("exe_targ_location == {}".format(exe_targ_location))
        print("exe_command_name == {}".format(exe_command_name))
        print("exe_command_args == {}\n".format(exe_command_args))

        # Later modify with more than one argument
        spec_command = get_specific_command(exe_target_plugin, exe_command_name)
        for command_item in spec_command:
            command_item['Inputs'][0]['Value'] = str(exe_command_args)
            break

        for target_item in get_specific_brain_targets(exe_target_plugin):
            break

        job = {"id": str(uuid4()),
               "JobTarget": target_item,
               "Status": "Ready",
               "StartTime": 0,
               "JobCommand": command_item}

        # inserting to Brain.Jobs
        insert_brain_jobs_w3(job)
        return HttpResponse(json.dumps(job),
                            content_type="application/json")


# This function is for a future ticket pcp-68
def new_target_form(request):
    pass


# This function is for a future ticket pcp-68
def val_target_form(request):
    pass

