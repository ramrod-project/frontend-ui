import pytest
from pcp_alpha.Backend.db_dir.project_db import check_dev_env, db_connection, rtdb
from .views import get_target_list


@pytest.mark.incremental
class TestIndex(object):
    def test_home_page(self, rf):
        """
        This test checks if the web server displays
        the home page.
        :param rf: RequestFactory
        """
        home_url = '/'

        if check_dev_env() is not None:
            request = rf.get(home_url)
            response = get_target_list(request)
            assert response.status_code == 200

    def test_target_list(self):
        """
        This test replicates the target list displayed
        in W1.
        """
        db_name = "Brain"
        db_table = "Targets"
        query_plugin_names = rtdb.db(db_name).table(db_table).pluck('PluginName', 'Location').run(db_connection())

        for plugin_item in query_plugin_names:
            assert isinstance(plugin_item, dict)
