"""
Views python file for pcp_app 'django' app.
"""
import json
import brain
from django.http import HttpResponse
from django.shortcuts import redirect
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from ua_parser import user_agent_parser
from Backend.db_dir.custom_queries import get_specific_commands, insert_brain_jobs_w3, \
    get_specific_brain_output, get_brain_output_content, insert_new_target, get_brain_targets, \
    persist_jobs_state, load_jobs_state, upload_file_to_brain, del_file_upload_from_brain, \
    get_brain_files, get_brain_file, get_plugin_list_query, desired_plugin_state_brain, \
    get_interface_list, update_plugin_to_brain

from .forms import TargetForm


@csrf_exempt
def persist_job_state(request):
    """
    current_state = {"id_map": {},
                     "id_reverse_map": {},
                     "jobs": [],
                     "sequences": {},
                     "active_sequence": ""}

    persist_job_state ensures the current UI state is stored in the database
    :param request: user request
    :return: <str> json output
    """
    if request.method == 'POST':
        current_state = request.POST.get('current_state')
        current_state = json.loads(current_state)
        return HttpResponse(json.dumps(persist_jobs_state(current_state)),
                            content_type="application/json")


def load_job_state(request):
    """
    current_state = {"id_map": {},
                     "id_reverse_map": {},
                     "jobs": [],
                     "sequences": {},
                     "active_sequence": ""}

    persist_job_state ensures the current UI state is stored in the database
    :param request: user request
    :return: <str> json output
    """
    if request.method == 'GET':
        return HttpResponse(json.dumps(load_jobs_state()),
                            content_type="application/json")


def get_commands_controller(request):
    """
    get_commands_controller function returns a specific list of capabilities
    as a json depending on the plugin name the user clicked.
    :param request: user request
    :return: list of capabilities as a json
    """
    user_select = None
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
    response = None
    if request.method == 'GET':
        jobs = json.loads(request.GET.get('jobs'))

        # inserting to Brain.Jobs
        response = insert_brain_jobs_w3(jobs)
    return HttpResponse(json.dumps(response),
                        content_type="application/json")


def _w4_get_content(job_id):
    """
    Checking on specific data
    :param job_id: user request
    :return: content depending on job status
    """
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
    """
    Outputs data in W4
    :param request: user request
    :return: job content
    """
    response = None
    if request.method == 'GET':
        controller_job_id = request.GET.get('job_id')
        result = _w4_get_content(controller_job_id)
        response = HttpResponse(json.dumps(result),
                                content_type='application/json')
        response.status_code = int(result['status'])
    return response


def w4_output_controller_download_filename(job_id, job_number):
    """

    :param job_id:
    :param job_number:
    :return:
    """
    filename = job_id
    job = get_specific_brain_output(job_id)
    if job:
        filename = "{}_{}_{}_{}".format(job_number,
                                        job['JobTarget']['PluginName'],
                                        job['JobTarget']['Location'],
                                        job['JobCommand']['CommandName'])
    filename = "{}.txt".format(filename)
    return filename


def w4_output_controller_download(request):
    """
    User can download content in W4 by clicking on link
    :param request: user request
    :return: content data onto a file
    """
    response = None
    fng = w4_output_controller_download_filename  # file name generator :-D
    if request.method == 'GET':
        user_agent = user_agent_parser.ParseOS(request.META.get("HTTP_USER_AGENT"))
        controller_job_id = request.GET.get('job_id')
        controller_job_number = request.GET.get('job_number', "")
        content = get_brain_output_content(controller_job_id, max_size=None)
        if "windows" in user_agent.get("family").lower() and isinstance(content, str):
            content = content.replace("\n", "\r\n")
        response = HttpResponse(content,
                                content_type='application/octet-stream')
        content_dispo = 'attachment; \
                         filename="{}"'.format(fng(controller_job_id,
                                                   controller_job_number))
        response['Content-Disposition'] = content_dispo
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
    return HttpResponse(template.render(
        context={'plugin_list': get_plugin_list_query(), },
        request=request))


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
    return HttpResponse(template.render(
        context={'plugin_list': get_plugin_list_query(), },
        request=request))


def edit_target_form(request, target_id):
    """
    This function render the edit form after the user clicks
    on the edit button from Target List or W1
    :param request: user request
    :param target_id: target id
    :return: template with target info as placeholders
    """
    template = loader.get_template('pcp_app/edit_target_form.html')
    brain_connection = brain.connect()
    get_brain_target = brain.r.db("Brain").table("Targets").filter(
        {"id": str(target_id)}).run(brain_connection)
    return HttpResponse(template.render(
        context={"edit_target_dict": get_brain_target,
                 'plugin_list': get_plugin_list_query(), },
        request=request))


def val_edit_target_form(request, target_id):
    """
    This function validates the input fields and after successfully
    validating the target will update with the new input fields
    :param request: user request
    :param target_id: target id
    :return: home page with an updated target list
    """
    if request.method == 'POST':
        edit_plugin_name = request.POST.get('plugin_name')
        edit_location_num = request.POST.get('location_num')
        edit_port_num = request.POST.get('port_num')
        edit_optional_char = request.POST.get('optional_char')

        # edit form template
        form = TargetForm(request.POST)

        if form.is_valid():
            brain_connection = brain.connect()
            brain.r.db("Brain").table("Targets").get(str(target_id)).update(
                {"PluginName": str(edit_plugin_name),
                 "Location": str(edit_location_num),
                 "Port": str(edit_port_num),
                 "Optional": str(edit_optional_char)}).run(brain_connection)
            return redirect('/')
    else:
        form = TargetForm()
    return redirect('/edit_target_form/{}/'.format(target_id))


def delete_specific_target(request, target_id):
    """
    This function deletes a specific target from Brain.Targets
    :param request: user request
    :param target_id: target it
    :return: home page and deletion of the specific target user requested
    """
    if request.method == 'GET':
        brain_connection = brain.connect()
        brain.r.db("Brain").table("Targets").get(str(target_id)).delete(
            return_changes=True).run(brain_connection)
        return redirect('/')


def file_upload_list(request):
    """
    This function is the controller for file uploads
    :param request: user request
    :return: response if file can be uploaded or not
    """
    json_return = ""
    if request.method == 'POST':
        file = request.FILES['file']
        json_return = upload_file_to_brain(str(file), file.read())
    return HttpResponse(json.dumps(json_return), content_type='application/json')


def del_file_from_list(request, file_id):
    """
    Delete's file from Brain.Files and
    in the user interface as well
    :param request:
    :param file_id:
    :return:
    """
    if request.method == 'GET':
        print("delete this Brain.Files field id == {}".format(file_id))
        del_file_upload_from_brain(file_id)
    return HttpResponse()


def get_file_listing(request):
    """
    Populates file list to ui
    :param request: user request
    :return:
    """
    json_return = get_brain_files()
    return HttpResponse(json.dumps(json_return), content_type='application/json')


def get_file(request, file_id):
    """
    User downloads file
    :param request: user request
    :param file_id: file id from the ui -> url
    :return: response
    """
    brain_data = get_brain_file(file_id)
    if brain_data:
        content = brain_data['Content']
        response = HttpResponse(content,
                                content_type='application/octet-stream')
        content_dispo = 'attachment; \
                         filename="{}"'.format(file_id)
        response['Content-Disposition'] = content_dispo
        response.status_code = 200
    else:
        response = HttpResponse()
    return response


def add_plugin(request):
    """
    pcp-507 task
    Add plugin form
    :param request:
    :return:
    """
    pass


def get_plugin_list(request):
    """

    :param request:
    :return:
    """
    if request.method == "GET":
        json_plugin_list_return = get_plugin_list_query()
        return HttpResponse(json.dumps(json_plugin_list_return),
                            content_type='application/json')


@csrf_exempt
def update_plugin(request, plugin_id):
    """
    Update plugin controller, and return plugin data
    back to Modal Form
    :param request:
    :param plugin_id:
    :return:
    """

    output = {}
    if request.method == 'POST':
        plugin_data = request.POST.dict()
        plugin_data['ExternalPorts'] = request.POST.getlist("ExternalPorts[]")
        output = update_plugin_to_brain(plugin_data)
    response = HttpResponse(json.dumps(output),
                            content_type='application/json')
    response.status_code = 200
    return response


def desired_plugin_state_controller(request):
    """
    User clicks on activate, restart, or stop button
    next to the plugin name in the plugin list
    :param request:
    :return:
    """
    if request.method == 'GET':
        plugin_id = request.GET.get('plugin_id')
        desired_state = request.GET.get('desired_state')
        response = HttpResponse(json.dumps(desired_plugin_state_brain(
            plugin_id, desired_state)),
            content_type='application/json')
        response.status_code = 200
        return response


def get_interfaces(request):
    """
    User clicks on stop plugin button next to the
    plugin name in the plugin list
    :param request:
    :return:
    """
    # Delete or modify lines below for future stop plugin task
    interfaces = []
    if request.method == 'GET':
        interfaces = get_interface_list()
    return HttpResponse(json.dumps(interfaces),
                        content_type='application/json')

