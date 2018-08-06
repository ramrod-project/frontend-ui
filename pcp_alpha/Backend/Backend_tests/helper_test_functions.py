# Helpful functions to used in tests
from random import randint

SAMPLE_GOOD_PLUGIN_ID = randint(1, 3)
SAMPLE_BAD_PLUGIN_ID = 4


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
