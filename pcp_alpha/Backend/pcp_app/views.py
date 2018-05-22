from django.http import HttpResponse
# from django.shortcuts import render  # import will be used for a future ticket pcp-68
from Backend.db_dir.custom_queries import get_specific_commands, get_specific_brain_targets, \
    get_specific_command, insert_brain_jobs_w3, get_specific_brain_output, get_specific_brain_output_content
from django.template import loader

import json


def get_commands_controller(request):
    """
    get_commands_controller function returns a specific list of capabilities
    as a json depending on the plugin name the user clicked.
    :param request: user request
    :return: list of capabilities as a json
    """
    if request.method == 'GET':
        user_select = request.GET.get('plugin_name')
        return HttpResponse(json.dumps(get_specific_commands(user_select)),
                            content_type="application/json")


def execute_sequence_controller(request):
    """
    execute_sequence_controller function is called when the user clicks on
    'Execute Sequence' button in W3
    :param request: user request
    :return: returns data from w3 to the ui
    """
    command_item = ""
    target_item = ""

    if request.method == 'GET':
        jobs = json.loads(request.GET.get('jobs'))

        # inserting to Brain.Jobs
        response = insert_brain_jobs_w3(jobs)
        return HttpResponse(json.dumps(response),
                            content_type="application/json")


def _w4_get_content(job_id):
    updated_job = get_specific_brain_output(job_id)
    check_int = 0
    for item in updated_job:
        check_int = 1
        break
    if check_int != 1:
        result = {
            'status': '418',
            'reason': 'Status != Done',
            'Content': None
        }
    else:
        result = {
            'status': '200',
            "Content": get_specific_brain_output_content(job_id)
        }
    return result


def w4_output_controller(request):
    if request.method == 'GET':
        controller_job_id = request.GET.get('job_id')
        result = _w4_get_content(controller_job_id)
        response = HttpResponse(json.dumps(result), content_type='application/json')
        response.status_code = int(result['status'])
        return response


def w4_output_controller_download(request):
    if request.method == 'GET':
        controller_job_id = request.GET.get('job_id')
        content = get_specific_brain_output_content(controller_job_id, max_size=None)
        response = HttpResponse(content, content_type='application/octet-stream')
        response['Content-Disposition'] = 'attachment; filename="{}.txt"'.format(controller_job_id)
        response.status_code = 200
        return response


# This function is for a future ticket pcp-68
def new_target_form(request):
    template = loader.get_template('pcp_app/target_form_mod1.html')
    return HttpResponse(template.render(context=None, request=request))


# This function is for a future ticket pcp-68
def val_target_form(request):
    pass

