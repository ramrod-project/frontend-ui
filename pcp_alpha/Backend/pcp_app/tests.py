from django.contrib.auth import authenticate
from .views import get_command_list, execute_sequence

import pytest


pytestmark = pytest.mark.django_db(transaction=True)


def test_capability_data(rf):
    username = "pcpuser"
    password = "pcpuser123"

    user = authenticate(username=username, password=password)

    if user is not None:
        request = rf.get('action/get_capability_list/')
        response = get_command_list(request)
        assert response.status_code == 200


def test_execute_data(rf):
    username = "pcpuser"
    password = "pcpuser123"

    user = authenticate(username=username, password=password)

    if user is not None:
        request = rf.get('action/get_w3_data/')
        response = execute_sequence(request)
        assert response.status_code == 200

