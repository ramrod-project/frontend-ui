from django.shortcuts import render
from Backend.db_dir.custom_queries import get_brain_targets, get_file_uploads


def get_index_data(request):
    """
    get_index_data function returns the number of plugins, capabilities, host_dict
    dictionary to the home page ui.
    :param request: user request
    :return: explained above
    """
    for items in get_file_uploads():
        print(items)
    return render(request,
                  'index_app/base_page.html',
                  context={'host_dict': get_brain_targets(),
                           'file_upload_dict': get_file_uploads(), })
