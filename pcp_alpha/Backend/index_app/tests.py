from django.contrib.auth import authenticate
import pytest
from pytest import fixture, raises
import docker
# import rethinkdb as r
# from time import sleep

# sleep(7)

# CLIENT = docker.from_env()


pytestmark = pytest.mark.django_db(transaction=True)


# @fixture(scope="module")
# def something():
#     CLIENT.containers.run(
#         "ramrodpcp/database-brain",
#         name="Brain",
#         detach=True,
#         ports={"28015/tcp": 28015},
#         remove=True
#     )
#     sleep(4)
#     yield "127.0.0.1"
#
#     containers = CLIENT.containers.list()
#     for container in containers:
#         if container.name == "Brain":
#             container.stop()
#             break


def test_home_page(client):
    home_url = 'http://127.0.0.1/'

    username = "pcpuser"
    password = "pcpuser123"
    user = authenticate(username=username, password=password)

    if user is not None:
        home_content = client.get(home_url).content
        assert home_content.status_code == 200
