from test.test_w4_switch_to_done import switch_to_done
from multiprocessing import Process
from time import sleep
from pcp_alpha.Backend.db_dir.project_db import check_dev_env
from Backend.db_dir.project_db import db_connection, rtdb
from Backend.db_dir.custom_queries import get_specific_brain_targets, get_specific_command
from Backend.pcp_app.views import get_commands_controller, execute_sequence_controller, w4_output_controller

from pytest import raises
from rethinkdb.errors import ReqlOpFailedError

from uuid import uuid4
import pytest
from json.decoder import JSONDecodeError
import json


echo_job_id = str(uuid4())


@pytest.mark.incremental
class TestDataHandling(object):
    def test_display_capability_list_data(self):
        """
        This test is replicating when a user clicks on a
        plugin from W1 a command list will be displayed
        in W2.
        Task pcp-141
        """

        if check_dev_env() is not None:
            cur = rtdb.db("Plugins").table("Plugin1").pluck('OptionalInput',
                                                            'Inputs',
                                                            'Tooltip',
                                                            'CommandName',
                                                            'Output').run(db_connection())
            for plugin_item in cur:
                assert isinstance(plugin_item, dict)

    def test_capability_ui(self, rf):

        home_url = '/action/get_command_list/?plugin_name=Plugin1'

        if check_dev_env() is not None:
            request = rf.get(home_url)
            response = get_commands_controller(request)
            assert "echo" in str(response.content)
            assert response.status_code == 200

    def test_capability_ui_failed(self, rf):

        home_url = '/action/get_command_list/?plugin_name=Plugin8'

        if check_dev_env() is not None:
            request = rf.get(home_url)

            with raises(ReqlOpFailedError):
                response = get_commands_controller(request)

    def test_execute_w3_data(self):
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3.
        Task pcp-142
        """

        if check_dev_env() is not None:
            job_command = ""
            target_item = ""
            brain_db = "Brain"
            plugin_table = "Plugin1"
            command = "echo"
            jobs_table = "Jobs"

            for command_item in get_specific_command(plugin_table, command):
                job_command = command_item

            for target_item in get_specific_brain_targets(plugin_table):
                break

            inserted = rtdb.db(brain_db).table(jobs_table).insert([
                {"id": echo_job_id,
                 "JobTarget": target_item,
                 "Status": "Ready",
                 "StartTime": 0,
                 "JobCommand": job_command}
            ]).run(db_connection())
            assert inserted['inserted'] == 1

    def test_execute_w3_data_ui(self, rf):
        url = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%7B%22PluginName%22%3A%22Plugin1%22%2C%22" \
              "Location%22%3A%22172.16.5.179%22%2C%22Port%22%3A0%7D%2C%22Status%22%3A%22Ready%22%2C%22StartTime" \
              "%22%3A0%2C%22JobCommand%22%3A%7B%22CommandName%22%3A%22echo%22%2C%22Tooltip%22%3A%22%5CnEcho%5Cn%" \
              "5CnClient%20Returns%20this%20string%20verbatim%5Cn%5CnArguments%3A%5Cn1.%20String%20to%20Echo%5Cn%5" \
              "CnReturns%3A%5CnString%5Cn%22%2C%22Output%22%3Atrue%2C%22Inputs%22%3A%5B%7B%22Value%22%3A%22sdfsdfsd" \
              "f%22%2C%22Type%22%3A%22textbox%22%2C%22Name%22%3A%22EchoString%22%2C%22Tooltip%22%3A%22This%20string%2" \
              "0will%20be%20echoed%20back%22%7D%5D%7D%7D%5D"

        if check_dev_env() is not None:
            request = rf.get(url)
            response = execute_sequence_controller(request)
            assert "inserted" in str(response.content)
            assert response.status_code == 200

    def test_execute_w3_data_ui_fail(self, rf):
        url = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%7B%22PluginName%22%3A%22Plugin1%22%2C%22" \
              "Location%22%3A%22172.16.5.179%22%2C%22Port%22%3A0%7D%2C%22Status%22%3A%22Ready%22%2C%22StartTime" \
              "%22%3A0%2C%22JobCommand%22%3A%7B%22CommandName%22%3A%22echo%22%2C%22Tooltip%22%3A%22%5CnEcho%5Cn%" \
              "5CnClient%20Returns%20this%20string%20verbatim%5Cn%5CnArguments%3A%5Cn1.%20String%20to%20Echo%5Cn%5" \
              "CnReturns%3A%5CnString%5Cn%22%2C%22Output%22%3Atrue%2C%22Inputs%22%3A%5B%7B%22Value%22%3A%22sdfsdfsd" \
              "f%22%2C%22Type%22%3A%22textbox%22%2C%22Name%22%3A%22EchoString%22%2C%22Tooltip%22%3A%22This%20string%2" \
              "0will%20be%20echoed%20back%22%7D%5D%7D%7D%5"

        if check_dev_env() is not None:
            request = rf.get(url)

            with raises(JSONDecodeError):
                response = execute_sequence_controller(request)

    def test_execute_w4_data_ui(self, rf):
        url2 = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%7B%22PluginName%22%3A%22Plugin1%22%2C%22" \
               "Location%22%3A%22172.16.5.179%22%2C%22Port%22%3A0%7D%2C%22Status%22%3A%22Ready%22%2C%22StartTime" \
               "%22%3A0%2C%22JobCommand%22%3A%7B%22CommandName%22%3A%22echo%22%2C%22Tooltip%22%3A%22%5CnEcho%5Cn%" \
               "5CnClient%20Returns%20this%20string%20verbatim%5Cn%5CnArguments%3A%5Cn1.%20String%20to%20Echo%5Cn%5" \
               "CnReturns%3A%5CnString%5Cn%22%2C%22Output%22%3Atrue%2C%22Inputs%22%3A%5B%7B%22Value%22%3A%22sdfsdfsd" \
               "f%22%2C%22Type%22%3A%22textbox%22%2C%22Name%22%3A%22EchoString%22%2C%22Tooltip%22%3A%22This%20string%2" \
               "0will%20be%20echoed%20back%22%7D%5D%7D%7D%5D"

        if check_dev_env() is not None:
            p = Process(target=switch_to_done)
            p.start()
            sleep(2)

            request_insert = rf.get(url2)

            response = execute_sequence_controller(request_insert)
            assert "inserted" in str(response.content)
            assert response.status_code == 200
            sleep(5)

            url = "/action/get_output_data/?job_id={}".format(json.loads(response.getvalue().decode())['generated_keys'][0])
            request2 = rf.get(url)
            response2 = w4_output_controller(request2)

            assert response2.status_code == 200
            assert "sdfsdfsd" in str(response2.content)

            p.terminate()
            p.join(timeout=2)

    def test_execute_w4_data_ui_fail(self, rf):
        url = "/action/get_output_data/?job_id=60d5405c-81b0-4248-aead-9e4f8d38cd14"

        if check_dev_env() is not None:
            request = rf.get(url)
            response = w4_output_controller(request)
            assert response.status_code == 418

    def test_display_w4_data(self):
        """
        This test is replicating the data displayed in W4 when
        a user clicks on 'Execute Sequence' button at the bottom
        right of w3.
        Task pcp-140
        :return: pass (status code of 200) or fail
        """
        brain_db = "Brain"
        output_table = "Outputs"

        if check_dev_env() is not None:
            p = Process(target=switch_to_done)
            p.start()
            sleep(2)

            c = rtdb.db(brain_db).table(output_table).filter({
                "JobCommand": {'id': echo_job_id}}).run(db_connection())

            for query_item in c:
                assert isinstance(query_item, dict)

            p.terminate()
            p.join(timeout=2)
