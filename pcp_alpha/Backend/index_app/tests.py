from django.contrib.auth import authenticate
import pytest


pytestmark = pytest.mark.django_db(transaction=True)


@pytest.mark.urls('Backend.index_app.urls')
def test_home_page(client):
    username = "pcpuser"
    password = "pcpuser123"
    user = authenticate(username=username, password=password)

    if user is not None:
        assert 'Success' in client.get('/').content
