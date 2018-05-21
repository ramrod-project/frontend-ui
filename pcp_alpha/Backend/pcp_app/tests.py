from test.test_w4_switch_to_done import switch_to_done
from multiprocessing import Process
from time import sleep
from pcp_alpha.Backend.db_dir.project_db import check_dev_env
from Backend.db_dir.project_db import db_connection, rtdb
from Backend.db_dir.custom_queries import get_specific_brain_targets, get_specific_command

from uuid import uuid4
import pytest


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
