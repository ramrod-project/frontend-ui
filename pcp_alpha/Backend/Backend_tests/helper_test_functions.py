# Helpful functions to used in tests
import os
from random import SystemRandom
from pcp_alpha.Backend.db_dir.project_db import rtdb, connect


BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_test_file(filename, directory):
    file_object = open(directory+filename)
    try:
        data = file_object.read()
    except IOError:
        data = None
    finally:
        file_object.close()
    return data


def return_random_plugin_id():
    return_plugin_list = list()
    plugin_list = rtdb.db("Controller").table("Plugins").run(connect())
    for plugin_item in plugin_list:
        return_plugin_list.append(plugin_item['id'])
    srandom = SystemRandom()
    return srandom.choice(return_plugin_list)


def get_test(url_str, function_obj, rf, target_id=None):
    """
    This function is used with functions from
    pcp_app/views.py
    """
    request = rf.get(url_str, HTTP_USER_AGENT="Mozilla/5.0 "
                                              "(Windows NT 6.1; WOW64; rv:40.0) "
                                              "Gecko/20100101 Firefox/40.1")
    # response = function_obj(request)
    if target_id is not None:
        response = function_obj(request, target_id)
    else:
        response = function_obj(request)
    return response


def post_test(url_str, post_data, function_obj, rf, target_id=None):
    """
    This function is used for forms to imitate user's inputting
    data and doing a request.POST
    """
    request = rf.post(url_str, post_data)
    if target_id is not None:
        response = function_obj(request, target_id)
    else:
        response = function_obj(request)
    return response


SAMPLE_GOOD_PLUGIN_ID = return_random_plugin_id()
SAMPLE_BAD_PLUGIN_ID = "bad_plugin_id"
