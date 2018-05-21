from django.contrib.auth import authenticate
from .views import get_commands_controller, execute_sequence_controller, w4_output_controller

import pytest


pytestmark = pytest.mark.django_db(transaction=True)


def test_display_capability_list_data(rf):
    """
    This test is testing to pull the command list and
    display it to W2.
    Task pcp-141
    :param rf: request
    :return: pass (status code of 200) or fail
    """
    username = "pcpuser"
    password = "pcpuser123"
    user = authenticate(username=username, password=password)

    if user is not None:
        request = rf.get('action/get_capability_list/')
        response = get_commands_controller(request)
        assert response.status_code == 200


def test_execute_w3_data(rf):
    """
    This test is testing data in w3 when the user clicks on
    'Execute Sequence' button at the bottom right of w3.
    Task pcp-142
    :param rf: request
    :return: pass (status code of 200) or fail
    """
    username = "pcpuser"
    password = "pcpuser123"

    user = authenticate(username=username, password=password)

    if user is not None:
        request = rf.get('action/get_w3_data/')
        response = execute_sequence_controller(request)
        assert response.status_code == 200


def test_display_w4_data(rf):
    """
    This test is testing to display data in w4.  The data
    that displays depends on the status of the job.
    Task pcp-140
    :param rf: request
    :return: pass (status code of 200) or fail
    """
    username = "pcpuser"
    password = "pcpuser123"

    user = authenticate(username=username, password=password)

    if user is not None:
        request = rf.get('action/get_output_data/')
        response = w4_output_controller(request)
        assert response.status_code == 200

