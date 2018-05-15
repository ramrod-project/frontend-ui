from django.shortcuts import render
from Backend.db_dir.custom_queries import get_brain_targets


def get_target_list(request):
    """
    get_target_list function returns the number of plugins, capabilities, host_dict
    dictionary to the home page ui.
    :param request: user request
    :return: explained above
    """
    return render(request,
                  'index_app/base_page.html',
                  context={'host_dict': get_brain_targets(), })
