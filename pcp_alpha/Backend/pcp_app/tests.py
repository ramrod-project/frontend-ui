from multiprocessing import Process
from time import sleep, time
from uuid import uuid4
import json
import ast
import os
import signal
import pytest
from brain import connect, r, binary
from brain.queries import RPP
from copy import deepcopy

from test.test_w4_switch_to_done import switch_to_done
# from rethinkdb.errors import ReqlOpFailedError
from pcp_alpha.Backend.Backend_tests.helper_test_functions import \
    read_test_file, BACKEND_DIR, get_test, post_test
from pcp_alpha.Backend.db_dir.custom_data import location_generated_num
from pcp_alpha.Backend.db_dir.project_db import rtdb
from pcp_alpha.Backend.db_dir.custom_queries import get_specific_brain_targets, \
    get_specific_command, get_brain_targets
from pcp_alpha.Backend.db_dir import plugins
from pcp_alpha.Backend.pcp_app.views import get_commands_controller, \
    execute_sequence_controller, w4_output_controller, w4_output_controller_download, \
    new_target_form, val_target_form, val_edit_target_form, edit_target_form, \
    delete_specific_target, file_upload_list, persist_job_state, load_job_state, \
    del_file_from_list, get_file_listing, get_file, get_interfaces, stop_job, \
    get_state_names, get_saved_command_list, put_saved_command, \
    desired_plugin_state_controller, update_plugin

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
    "JobCommand": {"CommandName": "echo",
                   "Tooltip": "",
                   "Output": False,
                   "Inputs": [],
                   "OptionalInputs": []}
}
SAMPLE_ERROR_JOB = {
    "id": "138thg-eg98198-sf98gy3-feh8h8",
    "JobTarget": SAMPLE_TARGET,
    "Status": "Error",
    "StartTime": NOW,
    "JobCommand": {"CommandName": "Do stuff",
                   "Tooltip": "",
                   "Output": False,
                   "Inputs": [],
                   "OptionalInputs": []}
}

SAMPLE_MULTIPLE_JOBS = [{},
                        {'Status': 'Ready',
                         'StartTime': 1532026993.002,
                         'JobTarget': {'Port': '8002',
                                       'PluginName': 'Plugin1',
                                       'Location': '172.16.5.47'},
                         'JobCommand': {'Output': True,
                                        'Tooltip': '\nEcho\n\nClient Returns this string verbatim\n\n'
                                                   'Arguments:\n1. String to Echo\n\nReturns:\nString\n',
                                        'id': '1a0f09fd-4a1f-4d5c-adbd-9ff191db9144',
                                        'CommandName': 'echo',
                                        'Inputs': [{'Name': 'EchoString',
                                                    'Tooltip': 'This string will be echoed back',
                                                    'Type': 'textbox', 'Value': 'dd'}],
                                        'OptionalInputs': []}},
                        {'Status': 'Ready',
                         'StartTime': 1532026993.003,
                         'JobTarget': {'Port': '8002',
                                       'PluginName': 'Plugin1',
                                       'Location': '172.16.5.254'},
                         'JobCommand': {'Output': True,
                                        'Tooltip': '\nEcho\n\nClient Returns this string verbatim\n\n'
                                                   'Arguments:\n1. String to Echo\n\nReturns:\nString\n',
                                        'id': '1a0f09fd-4a1f-4d5c-adbd-9ff191db9144',
                                        'CommandName': 'echo',
                                        'Inputs': [{'Name': 'EchoString',
                                                    'Tooltip': 'This string will be echoed back',
                                                    'Type': 'textbox',
                                                    'Value': 'dd'}],
                                        'OptionalInputs': []}},
                        {'Status': 'Ready',
                         'StartTime': 1532026993.004,
                         'JobTarget': {'Port': '8002',
                                       'PluginName': 'Plugin1',
                                       'Location': '172.16.5.177'},
                         'JobCommand': {'Output': True,
                                        'Tooltip': '\nEcho\n\nClient Returns this string verbatim\n\n'
                                                   'Arguments:\n1. String to Echo\n\nReturns:\nString\n',
                                        'id': '1a0f09fd-4a1f-4d5c-adbd-9ff191db9144',
                                        'CommandName': 'echo',
                                        'Inputs': [{'Name': 'EchoString',
                                                    'Tooltip': 'This string will be echoed back',
                                                    'Type': 'textbox',
                                                    'Value': 'dd'}],
                                        'OptionalInputs': []
                                        }
                         }
                        ]


SAMPLE_OUTPUT = {
    "OutputJob": SAMPLE_JOB,
    "Content": "Sample output string"
}

SAMPLE_FILE_ID = "test.txt"


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
    def status_code_test2(url_str, post_data, function_obj, rf, target_id=None):
        """
        This function is used for current file to test
        status codes
        """
        request = rf.post(url_str, json.loads(str(post_data)))
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
        url_var = "/action/get_w3_data/"
        # with pytest.raises(json.JSONDecodeError):
        my_job = deepcopy(SAMPLE_JOB)
        del my_job["id"]
        jobs_json = json.dumps([my_job])
        json_data = {"jobs": jobs_json}
        response = post_test(url_var, json_data, execute_sequence_controller, rf)
        assert response.status_code == 200

    @staticmethod
    def test_execute_w3_data_ui_fail(rf):
        """
        This test is replicating when the user clicks on 'Execute Sequence'
        button at the bottom right of w3. With using false data.
        """
        url_var = "/action/get_w3_data/"
        with pytest.raises(json.JSONDecodeError):
            json_data = json.loads(str(SAMPLE_ERROR_JOB))
            response = post_test(url_var, json_data, execute_sequence_controller, rf)
            assert response.status_code == 200
            response = post_test(url_var, {}, execute_sequence_controller, rf)
            assert response.status_code == 200

    @staticmethod
    def test_execute_w4_data_ui(rf):
        """
        This test is replicating the data displayed in W4 when a user clicks
        on 'Execute Sequence' button at the bottom right of w3. With correct data.
        """
        first_url = "/action/get_w3_data/"
        process_obj = Process(target=switch_to_done)
        process_obj.start()
        sleep(2)
        with pytest.raises(json.JSONDecodeError):
            response = execute_sequence_controller(json.loads(str(rf.post(first_url))))
            assert "inserted" in str(response.content)
            assert response.status_code == 200
            sleep(5)
            second_url = "/action/get_output_data/?job_id={}".format(json.loads(
                response.getvalue().decode())['generated_keys'][0])
            assert w4_output_controller(rf.get(second_url, HTTP_USER_AGENT='Mozilla/5.0')).status_code == 200
            assert "sdfsdfsd" in str(w4_output_controller(rf.get(second_url, HTTP_USER_AGENT='Mozilla/5.0')).content)
        process_obj.terminate()
        os.kill(process_obj.pid, signal.SIGKILL)
            # process_obj.join(timeout=2)

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
        response = post_test(url_var, post_data, val_target_form, rf)
        assert response.status_code == 302
        assert response.url == "/"
        response = post_test(url_var, {}, val_target_form, rf)
        assert response.status_code == 200

    @staticmethod
    def test_w4_download(dummy_output_data, rf):
        """
        test download output data from W4
        """
        url_var = "/action/get_full_output_data?job_id=138thg-eg98198-sf98gy3-feh8h8"
        response = get_test(
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
        request = rf.get(url_var, HTTP_USER_AGENT='Mozilla/5.0')
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
        os.kill(process_var.pid, signal.SIGKILL)
        # process_var.join(timeout=2)

    def test_execute_w3_data_two(self, rf):
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3 but
        the command has two arguments.
        """
        job_url = "/action/get_w3_data/"
        with pytest.raises(json.JSONDecodeError):
            status_obj = self.status_code_test2(url_str=job_url,
                                                post_data=SAMPLE_JOB,
                                                function_obj=execute_sequence_controller,
                                                rf=rf)
            assert "inserted" in str(status_obj.content)
            status_obj = post_test(job_url, {}, execute_sequence_controller, rf)
            assert status_obj.status_code == 200

    def test_execute_multiple_jobs_in_w3(self, rf):
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3
        with multiple job rows.
        """
        job_url = "/action/get_w3_data/"
        with pytest.raises(json.JSONDecodeError):
            status_obj = self.status_code_test2(url_str=job_url,
                                                post_data=SAMPLE_JOB,
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
        response = post_test(url_var,
                                              post_data,
                                              val_edit_target_form,
                                              rf, target_id=target_key)
        assert response.status_code == 302
        assert response.url == "/"
        response = post_test(url_var, {},
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
        response = get_test(url_var, delete_specific_target, rf, target_id=target_key)
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
        response = get_test(url_var, file_upload_list, rf)
        assert response.status_code == 200
        with pytest.raises(json.JSONDecodeError):
            post_data = json.loads(str(SAMPLE_FILE_ID))
            response = post_test(url_var, post_data, file_upload_list, rf)
            assert response.status_code == 200
            response = post_test(url_var, {}, file_upload_list, rf)
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
            response = post_test(url_var, current_state, persist_job_state, rf)
            assert response.status_code == 200
            response = post_test(url_var, {}, persist_job_state, rf)
            assert response.status_code == 200

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
            response = post_test(url_var, current_state, persist_job_state, rf)
            assert response.status_code == 200
            response = post_test(url_var, {}, persist_job_state, rf)
            assert response.status_code == 200

    @staticmethod
    def test_job_state3(rf):
        """
        This test imitates load a job state in W3
        :param rf: request factory
        :return: status code
        """
        url_var = "action/load_state/?requested_state=kasjldfkjsakldjf"
        response = load_job_state(rf.get(url_var, HTTP_USER_AGENT='Mozilla/5.0'))
        assert response.status_code == 200

    @staticmethod
    def test_get_job_state(rf):
        """
        This test imitates saving a job state in W3
        :param rf: request factory
        :return: status code
        """
        url_var = "action/state_names/"
        response = get_state_names(rf.get(url_var, HTTP_USER_AGENT='Mozilla/5.0'))
        assert response.status_code == 200

    @staticmethod
    def test_del_file_from_list(rf):
        """
        This test imitates deleting file from file list
        :param rf:
        :return:
        """
        url_var = "del_file_upload/{}/".format(SAMPLE_FILE_ID)
        response = get_test(url_var, del_file_from_list, rf, target_id=SAMPLE_FILE_ID)
        assert response.status_code == 200

    @staticmethod
    def test_get_file_list(rf):
        """
        This test imitates populating a list of
        files to the ui from Brain.Files
        :param rf:
        :return:
        """
        binary.put_buffer(SAMPLE_FILE_ID,
                          read_test_file(SAMPLE_FILE_ID,
                                         BACKEND_DIR + "/Backend_tests/"))
        url_var = "file_listing/"
        response = get_test(url_var, get_file_listing, rf)
        db_file_list = ast.literal_eval(response.content.decode())
        assert response.status_code == 200
        assert SAMPLE_FILE_ID in db_file_list

    @staticmethod
    def test_get_file(rf):
        """
        This test imitates getting a file from
        Brain.Files
        :param rf:
        :return:
        """
        url_var = "file_download/{}/".format(SAMPLE_FILE_ID)
        response = get_test(url_var, get_file, rf, target_id=SAMPLE_FILE_ID)
        assert response.status_code == 200
        assert SAMPLE_FILE_ID in response['Content-Disposition']

    @staticmethod
    def test_get_interfaces(rf):
        """

        :param rf:
        :return:
        """
        url_var = "get_interfaces/"
        response = get_test(url_var, get_interfaces, rf)
        assert response.status_code == 200

    @staticmethod
    def test_stop_job(rf):
        """
        This test is replicating the data displayed in W4 when a user clicks
        on 'Execute Sequence' button at the bottom right of w3. With correct data.
        """
        first_url = "/action/get_w3_data/"
        with pytest.raises(json.JSONDecodeError):
            json_data = json.loads(str(SAMPLE_JOB))
            response = post_test(first_url, json_data, execute_sequence_controller, rf)
            assert "inserted" in str(response.content)
            assert response.status_code == 200
            job_id = json.loads(response.getvalue().decode())['generated_keys'][0]
            sleep(2)
            second_url = "/stop_job/{}/".format(job_id)
            assert stop_job(rf.get(second_url, HTTP_USER_AGENT='Mozilla/5.0'), job_id).status_code == 200

    @staticmethod
    def test_saved_commands(rf):
        """
        This test imitates load a job state in W3
        :param rf: request factory
        :return: status code
        """
        url_var = "action/get_saved_command_list/?plugin_name=Plugin1"
        response = get_saved_command_list(rf.get(url_var, HTTP_USER_AGENT='Mozilla/5.0'))
        assert response.status_code == 200

    @staticmethod
    def test_post_saved_command(rf):
        post_data = {
            "PluginName": "Plugin1",
            "Name": "sample",
            "Command_js": "{}",
        }
        url_var = "action/put_saved_command/"
        response = post_test(url_var,
                             post_data,
                             put_saved_command,
                             rf)
        assert response.status_code == 200

    @staticmethod
    def test_desired_plugin_state_restart(rf):
        desired_state = "restart"
        url_var = "/desired_plugin_state/?plugin_id_list=%22{}%22&desired_state={}".format(plugins[4]['id'],
                                                                                           desired_state)
        response = get_test(url_str=url_var, function_obj=desired_plugin_state_controller, rf=rf)
        request_id = rf.get(url_var).GET['plugin_id_list']
        assert "replaced" in str(response.content)
        assert request_id.replace('"', '') == plugins[4]['id']
        assert rf.get(url_var).GET['desired_state'] == desired_state
        assert response.status_code == 200

    @staticmethod
    def test_desired_plugin_state_stop(rf):
        desired_state = "stop"
        url_var = "/desired_plugin_state/?plugin_id_list=%22{}%22&desired_state={}".format(plugins[4]['id'],
                                                                                           desired_state)
        response = get_test(url_str=url_var, function_obj=desired_plugin_state_controller, rf=rf)
        request_id = rf.get(url_var).GET['plugin_id_list']
        assert "replaced" in str(response.content)
        assert request_id.replace('"', '') == plugins[4]['id']
        assert rf.get(url_var).GET['desired_state'] == desired_state
        assert response.status_code == 200

    @staticmethod
    def test_desired_plugin_state_activate(rf):
        desired_state = "activate"
        url_var = "/desired_plugin_state/?plugin_id_list=%22{}%22&desired_state={}".format(plugins[4]['id'],
                                                                                           desired_state)
        response = get_test(url_str=url_var, function_obj=desired_plugin_state_controller, rf=rf)
        request_id = rf.get(url_var).GET['plugin_id_list']
        assert "replaced" in str(response.content)
        assert request_id.replace('"', '') == plugins[4]['id']
        assert rf.get(url_var).GET['desired_state'] == desired_state
        assert response.status_code == 200

    @staticmethod
    def test_add_plugin_dupplicate_port(rf):
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3.
        """
        url_var = "/update_plugin/NEW/"
        plugin_data = {
            "Name": "Plugin3",
            "ServiceName": "Plugin3-4243tcp",
            "ServiceID": "cheeto3",
            "State": "Stopped",
            "DesiredState": "",
            "OS": "all",
            "Interface": "1.1.1.1",
            "Environment": [],
            "Environment[]": "",
            "ExternalPorts": ["2/tcp"],
            "ExternalPorts[]": "2/tcp",
            "InternalPorts": ["2/tcp"],
            "InternalPorts[]": "2/tcp",
            "Extra": True,
        }
        RPP.insert({"Interface": "1.1.1.1", "TCPPorts": ["2"]}).run(connect())
        response = post_test(url_var, plugin_data, update_plugin, rf, target_id="NEW")
        assert response.status_code == 400

    @staticmethod
    def test_add_plugin_ok(rf):
        """
        This test is replicating when the user clicks on
        'Execute Sequence' button at the bottom right of w3.
        """
        url_var = "/update_plugin/NEW/"
        plugin_data = {
            "id": "NEW",
            "Name": "Plugin3",
            "ServiceName": "Plugin3-4243tcp",
            "ServiceID": "cheeto3",
            "State": "Stopped",
            "DesiredState": "",
            "OS": "all",
            "Interface": "1.1.1.1",
            "Environment": [],
            "Environment[]": "",
            "ExternalPorts": ["12/tcp"],
            "ExternalPorts[]": "12/tcp",
            "InternalPorts": ["12/tcp"],
            "InternalPorts[]": "12/tcp",
            "Extra": True,
        }
        RPP.insert({"Interface": "1.1.1.1", "TCPPorts": ["11"]}).run(connect())
        response = post_test(url_var, plugin_data, update_plugin, rf, target_id="NEW")
        assert response.status_code == 200
