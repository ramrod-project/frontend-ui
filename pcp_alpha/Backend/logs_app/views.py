""" Docstrings """
# import json
from django.shortcuts import render
# from django.http import HttpResponse
from pcp_alpha.Backend.db_dir.custom_queries import get_log_data
from pcp_alpha.Backend import cc_helper_function_one


def render_log_page(request):
    """
    Renders log page with logs data
    :return: log page in the ui
    """
    return render(request,
                  'logs_app/logs_page.html',
                  context={})  # query logs table here to render page with logs data


def log_data_controller(request):
    """

    :param request:
    :return:
    """
    # if request.method == "GET":
    #     json_log_data = get_log_data()
    #     return HttpResponse(json.dumps(json_log_data),
    #                         content_type='application/json')
    return cc_helper_function_one(request, "GET", get_log_data)
