from django.shortcuts import render
from Backend.pcp_app.custom_data import get_plugin_num, get_capability_num


# host_dict is replicating Brain.Targets table
host_dict = {'172.16.2.11': 'plugin1',
             '172.16.2.26': 'plugin3',
             '172.16.2.18': 'plugin2',
             '172.16.2.7': 'plugin4',
             '172.16.2.15': 'plugin3'}


def get_host_list(request):
    """
    get_host_list function returns the number of plugins, capabilities, host_dict
    dictionary to the home page ui.
    :param request: user request
    :return: explained above
    """
    return render(request,
                  'index_app/base_page.html',
                  context={'plugin_num': get_plugin_num(),
                           'capability_num': get_capability_num(),
                           'host_dict': host_dict, })
