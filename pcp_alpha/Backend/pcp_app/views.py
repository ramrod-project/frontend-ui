"""
Views python file for pcp_app 'django' app.
"""
import json
from django.http import HttpResponse
from django.shortcuts import redirect
from django.template import loader
from ua_parser import user_agent_parser
from Backend.db_dir.custom_queries import get_specific_commands, insert_brain_jobs_w3, \
    get_specific_brain_output, get_brain_output_content, insert_new_target, get_brain_targets
from .forms import TargetForm


def get_commands_controller(request):
    """
    get_commands_controller function returns a specific list of capabilities
    as a json depending on the plugin name the user clicked.
    :param request: user request
    :return: list of capabilities as a json
    """
    user_select = None
    if request.method != 'GET':
        print("get_commands_controller function returned == {}".format(str(user_select)))
    else:
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
    response = None
    if request.method != 'GET':
        print("execute_sequence_controller function returned == {}".format(str(response)))
    else:
        jobs = json.loads(request.GET.get('jobs'))

        # inserting to Brain.Jobs
        response = insert_brain_jobs_w3(jobs)
    return HttpResponse(json.dumps(response),
                        content_type="application/json")


def _w4_get_content(job_id):
    updated_job = get_specific_brain_output(job_id)
    if not updated_job:
        result = {
            'status': '418',
            'reason': 'Status != Done',
            'Content': None
        }
    else:
        result = {
            'status': '200',
            "Content": get_brain_output_content(job_id)
        }
    return result


def w4_output_controller(request):
    response = None
    if request.method != 'GET':
        print("w4_output_controller function returned == {}".format(str(response)))
    else:
        controller_job_id = request.GET.get('job_id')
        result = _w4_get_content(controller_job_id)
        response = HttpResponse(json.dumps(result),
                                content_type='application/json')
        response.status_code = int(result['status'])
    return response


def w4_output_controller_download(request):
    if request.method == 'GET':
        ua = user_agent_parser.ParseOS(request.META.get("HTTP_USER_AGENT"))
        controller_job_id = request.GET.get('job_id')
        content = get_brain_output_content(controller_job_id, max_size=None)
        if "windows" in ua.get("family").lower() and isinstance(content, str):
            content = content.replace("\n", "\r\n")
        response = HttpResponse(content,
                                content_type='application/octet-stream')
        response['Content-Disposition'] = 'attachment; \
                                           filename="{}.txt"'.format(controller_job_id)
        response.status_code = 200
    return response


def new_target_form(request):
    """
    new_target_form function renders a form to add new
    targets by clicking 'Add Target' on the left side panel
    ticket pcp-68
    :param request: user request
    :return: New Target Form
    """
    template = loader.get_template('pcp_app/target_form.html')
    return HttpResponse(template.render(context=None, request=request))


def val_target_form(request):
    """
    val_target_form functions validates the form based
    off of the user inputs.  If all goes well the new target
    will be added to Brain.Targets and render the user back
    to the home page.
    ticket pcp-68
    :param request: user request
    :return: inserts new target to Brain.Target and renders operator to home page
    """
    if request.method == 'POST':
        # get user inputs
        req_plugin_name = request.POST.get('plugin_name')
        req_location_num = request.POST.get('location_num')
        req_port_num = request.POST.get('port_num')
        req_optional_char = request.POST.get('optional_char')

        # form template
        form = TargetForm(request.POST)

        # validate form based off user inputs
        if form.is_valid():
            # insert new target
            insert_new_target(plugin_name=req_plugin_name,
                              location_num=req_location_num,
                              port_num=req_port_num,
                              optional_char=req_optional_char)
            return redirect('/')
    else:
        form = TargetForm()
    template = loader.get_template('pcp_app/target_form.html')
    return HttpResponse(template.render(context=None, request=request))
