""""
Docstrings
"""
import ast
import pytest
from pcp_alpha.Backend.pcp_app.views import get_plugin_list, update_plugin, \
    desired_plugin_state_controller
from pcp_alpha.Backend.Backend_tests.helper_test_functions import get_test, \
    SAMPLE_GOOD_PLUGIN_ID, SAMPLE_BAD_PLUGIN_ID


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
        db_plugins = ast.literal_eval(response.content.decode())
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
        db_plugins = ast.literal_eval(response.content.decode())
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
        url_var = "update_plugin/{}/".format(SAMPLE_GOOD_PLUGIN_ID)
        update_data = {'id': '2-2-B', 'DesiredState': '', 'Name': 'Plugin2', 'Interface': '10.10.10.10', 'OS': 'posix', 'ExternalPorts': ['4242/tcp'], 'Environment': ['STAGE=DEV,NORMAL=2']}
        response = rf.post(url_var, update_data)


    @staticmethod
    def test_plugin_state(rf):
        url_var = 'desired_plugin_state/'
        response = get_test(url_var, desired_plugin_state_controller, rf)
        assert response.status_code == 200
