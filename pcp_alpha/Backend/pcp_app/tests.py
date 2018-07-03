from multiprocessing import Process
from time import sleep, time
from uuid import uuid4
import json
import pytest
from brain import connect, r

from test.test_w4_switch_to_done import switch_to_done
# from rethinkdb.errors import ReqlOpFailedError
from pcp_alpha.Backend.db_dir.custom_data import location_generated_num
from pcp_alpha.Backend.db_dir.project_db import rtdb
from pcp_alpha.Backend.db_dir.custom_queries import get_specific_brain_targets, \
    get_specific_command, get_brain_targets
from pcp_alpha.Backend.pcp_app.views import get_commands_controller, \
    execute_sequence_controller, w4_output_controller, w4_output_controller_download, \
    new_target_form, val_target_form, val_edit_target_form, edit_target_form, \
    delete_specific_target, file_upload_list, persist_job_state, load_job_state

ECHO_JOB_ID = str(uuid4())
NOW = time()

SAMPLE_TARGET = {
    "id": "w93hyh-vc83j5i-v82h54u-b6eu4n",
    "PluginName": "Plugin1",
    "Location": "127.0.0.1",
    "Port": "8000",
    "Optional": {
        "TestVal1": "Test value",
        "TestVal2": "Test value 2"
    }
}
SAMPLE_JOB = {
    "id": "138thg-eg98198-sf98gy3-feh8h8",
    "JobTarget": SAMPLE_TARGET,
    "Status": "Done",
    "StartTime": NOW,
    "JobCommand": {"CommandName": "Do stuff",
                   "Tooltip": "",
                   "Output": False,
                   "Inputs": [],
                   "OptionalInputs": []}
}
SAMPLE_OUTPUT = {
    "OutputJob": SAMPLE_JOB,
    "Content": "Sample output string"
}


@pytest.fixture(scope="function")
def dummy_output_data():
    """
    This test is used for other functions test
    in order to have data to test
    """
    conn = connect()
    r.db("Brain").table("Jobs").insert(
        SAMPLE_JOB
    ).run(conn)
    r.db("Brain").table("Outputs").insert(
        SAMPLE_OUTPUT
    ).run(conn)
    yield
    r.db("Brain").table("Outputs").delete().run(conn)
    r.db("Brain").table("Jobs").delete().run(conn)


@pytest.mark.incremental
class TestDataHandling(object):
    """
    This class is used to test ui features.
    """
    @staticmethod
    def status_code_test(url_str, function_obj, rf, target_id=None):
        """
        This function is used for current file to test
        status codes
        """
        request = rf.get(url_str)
        if target_id is not None:
            response = function_obj(request, target_id)
        else:
            response = function_obj(request)
        return response

    @staticmethod
    def get_test(url_str, function_obj, rf, target_id=None):
        """
        This function is used with functions from
        pcp_app/views.py
        """
        request = rf.get(url_str, HTTP_USER_AGENT="Mozilla/5.0 "
                                                  "(Windows NT 6.1; WOW64; rv:40.0) "
                                                  "Gecko/20100101 Firefox/40.1")
        # response = function_obj(request)
        if target_id is not None:
            response = function_obj(request, target_id)
        else:
            response = function_obj(request)
        return response

    @staticmethod
    def post_test(url_str, post_data, function_obj, rf, target_id=None):
        """
        This function is used for forms to imitate user's inputting
        data and doing a request.POST
        """
        request = rf.post(url_str, post_data)
        if target_id is not None:
            response = function_obj(request, target_id)
        else:
            response = function_obj(request)
        return response

    @staticmethod
    def test_display_capability_list():
        """
        This test is replicating when a user clicks on a
        plugin from W1 and command list will be displayed in W2.
        """
        cur_var = rtdb.db("Plugins").table("Plugin1").pluck('OptionalInput',
                                                            'Inputs',
                                                            'Tooltip',
                                                            'CommandName',
                                                            'Output').run(connect())
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
        request = rf.get(home_url)
        response = get_commands_controller(request)
        assert "`Plugins.Plugin8` does not exist" in str(response.content)

    @staticmethod
    def test_execute_w3_data():
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3.
        """
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
        ]).run(connect())
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
        first_url = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%7B%22Plugin" \
                    "Name%22%3A%22Plugin1%22%2C%22Location%22%3A%22172.16.5.179%22%2" \
                    "C%22Port%22%3A0%7D%2C%22Status%22%3A%22Ready%22%2C%22StartTime%" \
                    "22%3A0%2C%22JobCommand%22%3A%7B%22CommandName%22%3A%22echo%22%2C" \
                    "%22Tooltip%22%3A%22%5CnEcho%5Cn%5CnClient%20Returns%20this%20stri" \
                    "ng%20verbatim%5Cn%5CnArguments%3A%5Cn1.%20String%20to%20Echo%5Cn%5" \
                    "CnReturns%3A%5CnString%5Cn%22%2C%22Output%22%3Atrue%2C%22Inputs%22" \
                    "%3A%5B%7B%22Value%22%3A%22sdfsdfsdf%22%2C%22Type%22%3A%22textbox%22" \
                    "%2C%22Name%22%3A%22EchoString%22%2C%22Tooltip%22%3A%22This%20string%" \
                    "20will%20be%20echoed%20back%22%7D%5D%7D%7D%5D"
        process_obj = Process(target=switch_to_done)
        process_obj.start()
        sleep(2)
        response = execute_sequence_controller(rf.get(first_url))
        assert "inserted" in str(response.content)
        assert response.status_code == 200
        sleep(5)
        second_url = "/action/get_output_data/?job_id={}".format(json.loads(
            response.getvalue().decode())['generated_keys'][0])
        assert w4_output_controller(rf.get(second_url)).status_code == 200
        assert "sdfsdfsd" in str(w4_output_controller(rf.get(second_url)).content)
        process_obj.terminate()
        process_obj.join(timeout=2)

    @staticmethod
    def test_target_form_post(rf):
        """Test posting a target

        Sends POST to the val_target_form method
        to ensure it processes POST requests.

        Arguments:
            rf {RequestFactory} -- used for mocking
            requests.
        """
        post_data = {
            "plugin_name": "Plugin1",
            "location_num": "127.0.0.1",
            "port_num": "8000",
            "optional_char": ""
        }
        url_var = "/action/val_target_form"
        response = TestDataHandling.post_test(url_var, post_data, val_target_form, rf)
        assert response.status_code == 302
        assert response.url == "/"
        response = TestDataHandling.post_test(url_var, {}, val_target_form, rf)
        assert response.status_code == 200

    @staticmethod
    def test_w4_download(dummy_output_data, rf):
        """
        test download output data from W4
        """
        url_var = "/action/get_full_output_data?job_id=138thg-eg98198-sf98gy3-feh8h8"
        response = TestDataHandling.get_test(
            url_var,
            w4_output_controller_download,
            rf
        )
        assert response.status_code == 200
        assert response.content.decode("utf-8") == SAMPLE_OUTPUT["Content"]

    @staticmethod
    def test_execute_w4_data_ui_fail(rf):
        """
        This test is replicating the data displayed in W4 when a user clicks
        on 'Execute Sequence' button at the bottom right of w3. With wrong data.
        """
        url_var = "/action/get_output_data/?job_id=60d5405c-81b0-4248-aead-9e4f8d38cd14"
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
        process_var = Process(target=switch_to_done)
        process_var.start()
        sleep(2)
        command_document = rtdb.db(brain_db).table(output_table).filter({
            "JobCommand": {'id': ECHO_JOB_ID}}).run(connect())
        for query_item in command_document:
            assert isinstance(query_item, dict)
        process_var.terminate()
        process_var.join(timeout=2)

    def test_execute_w3_data_two(self, rf):
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3 but
        the command has two arguments.
        """
        job_url = "/action/get_w3_data/?jobs=%5B%7B%22JobTarget%22%3A%7B%22PluginName%22%3A%" \
                  "22Plugin1%22%2C%22Location%22%3A%22172.16.5.140%22%2C%22Port%22%3A0%7D%2C" \
                  "%22Status%22%3A%22Ready%22%2C%22StartTime%22%3A0%2C%22JobCommand%22%3A%7B" \
                  "%22Tooltip%22%3A%22%5CnWrite%20File%3A%5Cn%5CnThis%20command%20writes%20a" \
                  "%20file%5Cnto%20the%20endpoint%20and%20returns%5Cnto%20the%20status%20code" \
                  "%5Cn%5CnArguments%3A%5Cn1%3A%20Source%20File%20(must%20be%20uploaded)%5Cn2" \
                  "%3A%20Remote%20filename%20(string%20format)%5Cn%5CnReturns%3A%20Status%" \
                  "20code%5Cn%22%2C%22Output%22%3Atrue%2C%22CommandName%22%3A%22send_file%22" \
                  "%2C%22Inputs%22%3A%5B%7B%22Type%22%3A%22textbox%22%2C%22Value%22%3A%22file1" \
                  "%22%2C%22Tooltip%22%3A%22Must%20be%20uploaded%20here%20first%22%2C%22Name%" \
                  "22%3A%22SourceFilePath%22%7D%2C%7B%22Type%22%3A%22textbox%22%2C%22Value%22" \
                  "%3A%22file2%22%2C%22Tooltip%22%3A%22Must%20be%20the%20fully%20qualified%20path" \
                  "%22%2C%22Name%22%3A%22DestinationFilePath%22%7D%5D%2C%22OptionalInputs%22%" \
                  "3A%5B%5D%2C%22id%22%3A%2220188422-03e0-4e33-848a-b528ef504517%22%7D%7D%5D"
        status_obj = self.status_code_test(url_str=job_url,
                                           function_obj=execute_sequence_controller,
                                           rf=rf)
        assert "inserted" in str(status_obj.content)
        assert status_obj.status_code == 200

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
        plugin_name = "Plugin1"
        location_num = location_generated_num("172.16.5.")
        port_num = "8002"
        optional_char = ""
        inserted_new_target = rtdb.db("Brain").table("Targets").insert([
            {"PluginName": plugin_name,
             "Location": location_num,
             "Port": port_num,
             "Optional": optional_char}
        ]).run(connect())
        assert inserted_new_target['inserted'] == 1

    def test_validate_form(self, rf):
        """
        This test checks the url_var validation is ran correctly.
        """
        url_var = "/action/val_target_form/"
        status_obj = self.status_code_test(url_str=url_var,
                                           function_obj=val_target_form,
                                           rf=rf)
        assert status_obj.status_code == 200

    def test_render_edit_target_form(self, rf):
        """
        This test checks if it renders the
        form correctly to edit targets.
        """
        target_key = ""
        for target_item in get_brain_targets():
            target_key = target_item["id"]
        url_var = "/edit_target_form/{}".format(target_key)
        status_obj = self.status_code_test(url_str=url_var,
                                           function_obj=edit_target_form,
                                           rf=rf, target_id=target_key)
        assert status_obj.status_code == 200

    @staticmethod
    def test_edit_target_form():
        """
        This test is imitating editing a new target and
        updating it back to Brain.Targets.
        """
        target_key = ""
        for target_item in get_brain_targets():
            target_key = target_item["id"]

        plugin_name = "Plugin1"
        location_num = location_generated_num("172.16.5.")
        port_num = "8005"
        optional_char = "optional here"
        r.db("Brain").table("Targets").get(target_key).update(
            {"PluginName": plugin_name,
             "id": target_key,
             "Location": location_num,
             "Port": port_num,
             "Optional": optional_char}
        ).run(connect())
        update_new_target2 = r.db("Brain").table("Targets").get(target_key).update(
            {"PluginName": plugin_name,
             "Location": location_num,
             "Port": port_num[:2] + "1",
             "Optional": optional_char}
        ).run(connect())
        assert update_new_target2['replaced'] == 1

    @staticmethod
    def test_edit_target_form_post(rf):
        """
        This test imitates a editing a target by using the
        form and doing a request.POST
        """
        target_key = ""
        for target_item in get_brain_targets():
            target_key = target_item["id"]

        post_data = {
            "plugin_name": "Plugin1",
            "location_num": "127.0.0.1",
            "port_num": "8000",
            "optional_char": ""
        }
        url_var = "action/val_edit_target_form/{}/".format(target_key)
        response = TestDataHandling.post_test(url_var,
                                              post_data,
                                              val_edit_target_form,
                                              rf, target_id=target_key)
        assert response.status_code == 302
        assert response.url == "/"
        response = TestDataHandling.post_test(url_var, {},
                                              val_edit_target_form,
                                              rf, target_id=target_key)
        assert response.status_code == 302

    @staticmethod
    def test_edit_target_delete_get(rf):
        """
        This test imitates deleting a target from the
        edit target form and doing a request.GET
        """
        target_key = ""
        for target_item in get_brain_targets():
            target_key = target_item["id"]
        url_var = "delete_target_row/{}/".format(target_key)
        response = TestDataHandling.get_test(url_var, delete_specific_target, rf, target_id=target_key)
        assert response.status_code == 302
        assert response.url == "/"

    @staticmethod
    def test_file_upload(rf):
        """
        This test imitates uploading a file
        :param rf: request factory
        :return: status code
        """
        url_var = "file_upload/"
        response = TestDataHandling.get_test(url_var, file_upload_list, rf)
        assert response.status_code == 200

    @staticmethod
    def test_job_state(rf):
        """
        This test imitates saving a job state in W3
        :param rf: request factory
        :return: status code
        """
        url_var = "action/save_state/"
        post_data = {"replaced": 1, "inserted": 0, "deleted": 0, "errors": 0, "unchanged": 0, "skipped": 0}

        with pytest.raises(json.JSONDecodeError):
            current_state = json.loads(str(post_data))
            response = TestDataHandling.post_test(url_var, current_state, persist_job_state, rf)
            assert response.status_code == 302
            response = TestDataHandling.post_test(url_var, {}, persist_job_state, rf)
            assert response.status_code == 302

    @staticmethod
    def test_job_state2(rf):
        """
        This test imitates saving a job state in W3
        as a second test
        :param rf: request factory
        :return: status code
        """
        url_var = "action/save_state/"
        post_data = {
            "id_map": {"1": "9859bfb8-8676-4595-8ce2-176957574875"},
            "id_reverse_map": {"9859bfb8-8676-4595-8ce2-176957574875": 1},
            "jobs": [{"plugin": "Plugin1",
                      "address": "172.16.5.49",
                      "job": {"Output": True,
                              "OptionalInputs": [],
                              "Tooltip":"\nEcho\n\nClient Returns this string "
                                        "verbatim\n\nArguments:\n1. String to "
                                        "Echo\n\nReturns:\nString\n",
                              "CommandName": "echo",
                              "Inputs":[{"Tooltip": "This string will be echoed back",
                                         "Type": "textbox",
                                         "Name": "EchoString",
                                         "Value": "dd"}],
                              "id": "c8999a01-91fb-43f7-8bc5-7aa8ec789688"},
                      "status": "None"}],
            "sequences": {"1": ["1"]},
            "active_sequence": "1"
        }

        with pytest.raises(json.JSONDecodeError):
            current_state = json.loads(str(post_data))
            response = TestDataHandling.post_test(url_var, current_state, persist_job_state, rf)
            assert response.status_code == 302
            response = TestDataHandling.post_test(url_var, {}, persist_job_state, rf)
            assert response.status_code == 302

    @staticmethod
    def test_job_state3(rf):
        """
        This test imitates saving a job state in W3
        as a second test
        :param rf: request factory
        :return: status code
        """
        url_var = "action/load_state/"
        response = TestDataHandling.get_test(url_var, load_job_state, rf)
        assert response.status_code == 200
