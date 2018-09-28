from django.test import TestCase
from .views import render_log_page, log_data_controller
from pcp_alpha.Backend.Backend_tests.helper_test_functions import get_test


def test_render_logs_page(rf):
    """

    :param rf:
    :return:
    """
    url_var = "logs_page/"
    response = get_test(url_var, render_log_page, rf)
    assert response.status_code == 200


def test_render_logs_data(rf):
    """

    :param rf:
    :return:
    """
    url_var = "logs_data/"
    response = get_test(url_var, log_data_controller, rf)
    assert response.status_code == 200
