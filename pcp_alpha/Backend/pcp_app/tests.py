from multiprocessing import Process
from time import sleep
from uuid import uuid4
import json
import pytest
from rethinkdb.errors import ReqlOpFailedError
from pcp_alpha.test.test_w4_switch_to_done import switch_to_done
from pcp_alpha.Backend.db_dir.project_db import check_dev_env
from pcp_alpha.Backend.db_dir.custom_data import location_generated_num
from pcp_alpha.Backend.db_dir.project_db import db_connection, rtdb
from pcp_alpha.Backend.db_dir.custom_queries import get_specific_brain_targets, get_specific_command
from pcp_alpha.Backend.pcp_app.views import get_commands_controller, execute_sequence_controller, \
    w4_output_controller, new_target_form, val_target_form

ECHO_JOB_ID = str(uuid4())


@pytest.mark.incremental
class TestDataHandling(object):
    @staticmethod
    def status_code_test(url_str, function_obj, rf):
        response = None
        if check_dev_env() is not None:
            request = rf.get(url_str)
            response = function_obj(request)
        return response

    @staticmethod
    def test_display_capability_list():
        """
        This test is replicating when a user clicks on a
        plugin from W1 and command list will be displayed in W2.
        """
        if check_dev_env() is not None:
            cur_var = rtdb.db("Plugins").table("Plugin1").pluck('OptionalInput',
                                                                'Inputs',
                                                                'Tooltip',
                                                                'CommandName',
                                                                'Output').run(db_connection())
            for plugin_item in cur_var:
                assert isinstance(plugin_item, dict)

    def test_capability_ui(self, rf):
        """
        This test is replicating when a user clicks on a
        plugin from W1 and command list will be displayed in W2.
        """
        home_url = '/action/get_command_list/?plugin_name=Plugin1'
        status_obj = self.status_code_test(url_str=home_url,
                                           function_obj=get_commands_controller,
                                           rf=rf)
        assert "echo" in str(status_obj.content)
        assert status_obj.status_code == 200

    @staticmethod
    def test_capability_ui_failed(rf):
        """
        This test is replicating when a user clicks on a plugin from  W1 and
        command list will be displayed in W2.  But this test fails on purpose.
        """
        home_url = '/action/get_command_list/?plugin_name=Plugin8'

        if check_dev_env() is not None:
            request = rf.get(home_url)
            with pytest.raises(ReqlOpFailedError):
                response = get_commands_controller(request)
                assert not response.status_code == 200

    @staticmethod
    def test_execute_w3_data():
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3.
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
                {"id": ECHO_JOB_ID,
                 "JobTarget": target_item,
                 "Status": "Ready",
                 "StartTime": 0,
                 "JobCommand": job_command}
            ]).run(db_connection())
            assert inserted['inserted'] == 1

    def test_execute_w3_data_ui(self, rf):
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3.
        """
        url_var = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%7" \
                  "B%22PluginName%22%3A%22Plugin1%22%2C%22Location%22%3A%" \
                  "22172.16.5.179%22%2C%22Port%22%3A0%7D%2C%22Status%22%3A%" \
                  "22Ready%22%2C%22StartTime%22%3A0%2C%22JobCommand%22%3A%7B" \
                  "%22CommandName%22%3A%22echo%22%2C%22Tooltip%22%3A%22%5CnEc" \
                  "ho%5Cn%5CnClient%20Returns%20this%20string%20verbatim%5Cn%5" \
                  "CnArguments%3A%5Cn1.%20String%20to%20Echo%5Cn%5CnReturns%3A%" \
                  "5CnString%5Cn%22%2C%22Output%22%3Atrue%2C%22Inputs%22%3A%5B%7" \
                  "B%22Value%22%3A%22sdfsdfsdf%22%2C%22Type%22%3A%22textbox%22%2C" \
                  "%22Name%22%3A%22EchoString%22%2C%22Tooltip%22%3A%22This%20strin" \
                  "g%20will%20be%20echoed%20back%22%7D%5D%7D%7D%5D"
        status_obj = self.status_code_test(url_str=url_var,
                                           function_obj=execute_sequence_controller,
                                           rf=rf)
        assert "inserted" in str(status_obj.content)
        assert status_obj.status_code == 200

    @staticmethod
    def test_execute_w3_data_ui_fail(rf):
        """
        This test is replicating when the user clicks on 'Execute Sequence'
        button at the bottom right of w3. With using false data.
        """
        url_var = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%7B%22Plugin" \
                  "Name%22%3A%22Plugin1%22%2C%22Location%22%3A%22172.16.5.179%22%2" \
                  "C%22Port%22%3A0%7D%2C%22Status%22%3A%22Ready%22%2C%22StartTime%2" \
                  "2%3A0%2C%22JobCommand%22%3A%7B%22CommandName%22%3A%22echo%22%2C%2" \
                  "2Tooltip%22%3A%22%5CnEcho%5Cn%5CnClient%20Returns%20this%20string%" \
                  "20verbatim%5Cn%5CnArguments%3A%5Cn1.%20String%20to%20Echo%5Cn%5CnRe" \
                  "turns%3A%5CnString%5Cn%22%2C%22Output%22%3Atrue%2C%22Inputs%22%3A%5B" \
                  "%7B%22Value%22%3A%22sdfsdfsdf%22%2C%22Type%22%3A%22textbox%22%2C%22Na" \
                  "me%22%3A%22EchoString%22%2C%22Tooltip%22%3A%22This%20string%20will%20b" \
                  "e%20echoed%20back%22%7D%5D%7D%7D%5"
        if check_dev_env() is not None:
            request = rf.get(url_var)
            with pytest.raises(json.JSONDecodeError):
                response = execute_sequence_controller(request)
                assert not response.status_code == 200

    @staticmethod
    def test_execute_w4_data_ui(rf):
        """
        This test is replicating the data displayed in W4 when a user clicks
        on 'Execute Sequence' button at the bottom right of w3. With correct data.
        """
        first_url = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%" \
                    "7B%22PluginName%22%3A%22Plugin1%22%2C%22Location%22%" \
                    "3A%22172.16.5.179%22%2C%22Port%22%3A0%7D%2C%22Status%" \
                    "22%3A%22Ready%22%2C%22StartTime%22%3A0%2C%22JobCommand" \
                    "%22%3A%7B%22CommandName%22%3A%22echo%22%2C%22Tooltip%22" \
                    "%3A%22%5CnEcho%5Cn%5CnClient%20Returns%20this%20string%2" \
                    "0verbatim%5Cn%5CnArguments%3A%5Cn1.%20String%20to%20Echo%" \
                    "5Cn%5CnReturns%3A%5CnString%5Cn%22%2C%22Output%22%3Atrue%2" \
                    "C%22Inputs%22%3A%5B%7B%22Value%22%3A%22sdfsdfsdf%22%2C%22Ty" \
                    "pe%22%3A%22textbox%22%2C%22Name%22%3A%22EchoString%22%2C%22T" \
                    "ooltip%22%3A%22This%20string%20will%20be%20echoed%20back%22%7D%5D%7D%7D%5D"

        if check_dev_env() is not None:
            process_obj = Process(target=switch_to_done)
            process_obj.start()
            sleep(2)
            request_insert = rf.get(first_url)
            response = execute_sequence_controller(request_insert)
            assert "inserted" in str(response.content)
            assert response.status_code == 200
            sleep(5)
            url = "/action/get_output_data/?job_id={}".format(json.loads(
                response.getvalue().decode())['generated_keys'][0])
            request2 = rf.get(url)
            response2 = w4_output_controller(request2)
            assert response2.status_code == 200
            assert "sdfsdfsd" in str(response2.content)
            process_obj.terminate()
            process_obj.join(timeout=2)

    @staticmethod
    def test_execute_w4_data_ui_fail(rf):
        """
        This test is replicating the data displayed in W4 when a user clicks
        on 'Execute Sequence' button at the bottom right of w3. With wrong data.
        """
        url_var = "/action/get_output_data/?job_id=60d5405c-81b0-4248-aead-9e4f8d38cd14"
        if check_dev_env() is not None:
            request = rf.get(url_var)
            response = w4_output_controller(request)
            assert response.status_code == 418

    @staticmethod
    def test_display_w4_data():
        """
        This test is replicating the data displayed in W4 when a user clicks
        on 'Execute Sequence' button at the bottom right of w3.
        """
        brain_db = "Brain"
        output_table = "Outputs"
        if check_dev_env() is not None:
            process_var = Process(target=switch_to_done)
            process_var.start()
            sleep(2)
            command_document = rtdb.db(brain_db).table(output_table).filter({
                "JobCommand": {'id': ECHO_JOB_ID}}).run(db_connection())
            for query_item in command_document:
                assert isinstance(query_item, dict)
            process_var.terminate()
            process_var.join(timeout=2)

    def test_render_target_form(self, rf):
        """
        This test checks if it renders the
        form correctly to add new targets.
        """
        url_var = "/new_target_form/"
        status_obj = self.status_code_test(url_str=url_var, function_obj=new_target_form, rf=rf)
        assert status_obj.status_code == 200

    @staticmethod
    def test_add_target():
        """
        This test is replicating the data if the form is validated it
        will insert the new target to Brain.Targets table.
        """
        if check_dev_env() is not None:
            plugin_name = "Plugin1"
            location_num = location_generated_num("172.16.5.")
            port_num = "8002"
            optional_char = ""
            inserted_new_target = rtdb.db("Brain").table("Targets").insert([
                {"PluginName": plugin_name,
                 "Location": location_num,
                 "Port": port_num,
                 "Optional": optional_char}
            ]).run(db_connection())
            assert inserted_new_target['inserted'] == 1

    def test_validate_form(self, rf):
        """
        This test checks the url_var validation is ran correctly.
        """
        url_var = "/action/val_target_form/"
        status_obj = self.status_code_test(url_str=url_var, function_obj=val_target_form, rf=rf)
        assert status_obj.status_code == 200
