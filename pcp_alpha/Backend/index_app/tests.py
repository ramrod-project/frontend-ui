from django.contrib.auth import authenticate
import pytest


pytestmark = pytest.mark.django_db(transaction=True)


def test_home_page(client):
    home_url = 'http://127.0.0.1/'

    username = "pcpuser"
    password = "pcpuser123"
    user = authenticate(username=username, password=password)

    if user is not None:
        home_content = client.get(home_url).content
        assert home_content.status_code == 200
