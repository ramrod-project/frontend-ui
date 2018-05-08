from django.http import HttpResponse
from django.shortcuts import render

from .forms import CapabilitiesForm
from .models import CapabilitiesModel
from Backend.index_app.views import host_dict
# Not using imports that give the # of plugins and # of capabilities
# from Backend.db_dir.custom_data import get_plugin_num, get_capability_num

import json


def get_command_list(request):
    """
    get_command_list function returns a specific list of capabilities
    as a json depending on the plugin name the user clicked.
    :param request: user request
    :return: list of capabilities as a json
    """
    if request.method == 'GET':
        user_select = request.GET.get('plugin_name')
        capability_list_str = str(CapabilitiesModel.objects.get(plugin_capability_name=user_select)).split("-")[1]
        return HttpResponse(json.dumps(capability_list_str),
                            content_type="application/json")


def new_target_form(request):
    """
    new_capability_form function get's called when a user clicks on
    'Add Capability' on the left side panel and will render a form
    template so the user can add a list of capabilities into the system
    that belong to a certain plugin name.
    :param request: user request
    :return: user to form page, number of plugins, number of capabilities
    """
    return render(request,
                  'pcp_app/target_form.html',
                  context={
                           # 'plugin_num': get_plugin_num(),
                           # 'capability_num': get_capability_num(),
                           })


def val_target_form(request):
    """
    val_target_form function is validating the user input from adding
    a list of capabilities tied with a plugin name form.  If the validation
    is success, the new list of capabilities that belong to a certain plugin
    name is added to the database.
    :param request: user request
    :return:
    """
    if request.method == 'POST':

        # request get user input for plugin name and the list of capabilities
        input_capability_name = request.POST.get('capability_name')
        input_plugin_name = request.POST.get('plugin_capability_name')

        # calling custom form
        form = CapabilitiesForm(request.POST)

        # validating form
        if form.is_valid():
            new_cap = form.save(commit=False)
            new_cap.capability_name = input_capability_name
            new_cap.plugin_capability_name = input_plugin_name

            new_cap.save()
            form.save_m2m()

            return render(request,
                          'index_app/base_page.html',
                          context={'host_dict': host_dict,
                                   # 'plugin_num': get_plugin_num(),
                                   # 'capability_num': get_capability_num(),
                                   })
    else:
        form = CapabilitiesForm()
    return render(request,
                  'pcp_app/target_form.html',
                  context={
                           # 'plugin_num': get_plugin_num(),
                           # 'capability_num': get_capability_num(),
                          })

