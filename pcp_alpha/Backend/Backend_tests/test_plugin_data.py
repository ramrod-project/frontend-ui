""""
Docstrings
"""
import ast
import pytest
import json
import random
from pcp_alpha.Backend.pcp_app.views import get_plugin_list, update_plugin, \
    desired_plugin_state_controller
from pcp_alpha.Backend.db_dir.custom_queries import desired_plugin_state_brain
from .helper_test_functions import get_test, \
    SAMPLE_GOOD_PLUGIN_ID, SAMPLE_BAD_PLUGIN_ID, SAMPLE_DESIRED_STATE, post_test


@pytest.mark.incremental
class TestPluginData(object):
    """
    Docstrings
    """

    @staticmethod
    def test_get_plugins(rf):
        """
        Test get plugins to display plugin names
        in plugins list on the right side panel
        :param rf:
        :return:
        """
        url_var = "get_plugin_list/"
        response = get_test(url_var, get_plugin_list, rf)
        assert response.status_code == 200

    @staticmethod
    def test_get_plugins_two(rf):
        """
        Test get plugins to display plugin names
        in plugins list on the right side panel
        :param rf:
        :return:
        """
        url_var = "get_plugin_list/"
        response = get_test(url_var, get_plugin_list, rf)
        db_plugins = json.loads(response.content)
        for key, value in db_plugins[0].items():
            if value == SAMPLE_GOOD_PLUGIN_ID:
                assert value == SAMPLE_GOOD_PLUGIN_ID
        assert response.status_code == 200

    @staticmethod
    def test_bad_get_plugins(rf):
        """
        :param rf:
        :return:
        """
        url_var = "get_plugin_list/"
        response = get_test(url_var, get_plugin_list, rf)
        db_plugins = json.loads(response.content)
        for key, value in db_plugins[0].items():
            if value != SAMPLE_BAD_PLUGIN_ID:
                assert value != SAMPLE_BAD_PLUGIN_ID

    @staticmethod
    def test_get_plugin_data(rf):
        """
        Test when a user clicks on a plugin name,
        plugin data will return for update plugin form
        :param rf:
        :return:
        """
        url_var = "update_plugin/{}/".format(SAMPLE_GOOD_PLUGIN_ID)
        response = get_test(url_var, update_plugin, rf, target_id=SAMPLE_GOOD_PLUGIN_ID)
        assert response.status_code == 405

    @staticmethod
    def test_update_plugin_data(rf):
        """
        Test when a user clicks on a plugin name,
        plugin data will return for update plugin form
        :param rf:
        :return:
        """
        url_var = "update_plugin/2-2-B/"
        update_data = {'id': '2-2-B',
                       'DesiredState': '',
                       'Interface': '10.10.10.10',
                       'OS': 'posix',
                       'ExternalPorts[]': ['1111/tcp'],
                       'Environment[]': ['STAGE=DEV', 'NORMAL=2'],
                       'Extra': True}
        response = post_test(url_var, update_data, update_plugin, rf, target_id="2-2-B")
        assert response.status_code == 200

    @staticmethod
    def test_create_plugin_data(rf):
        """
        Test when a user clicks on a plugin name,
        plugin data will return for update plugin form
        :param rf:
        :return:
        """
        url_var = "update_plugin/2-2-B/"
        update_data = {'id': 'NEW',
                       'DesiredState': '',
                       'Name': 'Plugin2',
                       'Interface': '10.10.10.10',
                       'OS': 'posix',
                       'ExternalPorts[]': ['4242/tcp'],
                       'Environment[]': ['STAGE=DEV', 'NORMAL=2'],
                       'Extra': True}
        response = post_test(url_var, update_data, update_plugin, rf, target_id="NEW")
        assert response.status_code == 200

    # @staticmethod
    # def test_plugin_state(rf):
    #     url_var = 'desired_plugin_state/'
    #     response = get_test(url_var, desired_plugin_state_controller, rf)
    #     assert response.status_code == 200

    # @staticmethod
    # def test_plugin_state_two():
    #     random_id = "{}".format(SAMPLE_GOOD_PLUGIN_ID)
    #     desired_plugin_state_brain(random_id, random.choice(SAMPLE_DESIRED_STATE))
