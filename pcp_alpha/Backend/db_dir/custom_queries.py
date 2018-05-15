from .project_db import db_connection, rtdb
import sys
import time


def get_brain_targets():
    """
    get_brain_targets function from Brain.Targets table.
    :return: the query
    """
    db_name = "Brain"
    db_table = "Targets"
    query_plugin_names = rtdb.db(db_name).table(db_table).pluck('PluginName', 'Location').run(db_connection())
    return query_plugin_names


def get_specific_commands(user_selection):
    """
    get_specific_commands function queries Plugins.<PluginName> table
    the plugin name will be based off the user selection from the ui.
    It will return the query onto w2 as a dictionary nested in a list.
    :param user_selection: request from user's plugin selection
    :return: Query as a dictionary nested in a list to w2
    """
    command_list = list()

    cur = rtdb.db("Plugins").table(user_selection).pluck('OptionalInput',
                                                         'Inputs',
                                                         'Tooltip',
                                                         'CommandName',
                                                         'Output').run(db_connection())
    for item_cur in cur:
        command_list.append(dict(item_cur))
    return command_list


def get_specific_brain_targets(w3PluginNameJob):
    """
    get_specific_brain_targets function queries a specific PluginName
    :param w3PluginNameJob: PluginName from W3
    :return: query
    """
    db_name = "Brain"
    db_table = "Targets"
    query_specific_plugin_name = rtdb.db(db_name).table(db_table).filter({"PluginName": w3PluginNameJob}).run()
    return query_specific_plugin_name


def get_specific_command(w3_plugin_name, w3_command_name):
    """
    get_specific_command function queries a specific CommandName from the
    PluginName in W3
    :param w3_plugin_name: PluginName from W3
    :param w3_command_name: CommandName from W3
    :return: query
    """
    db_name = "Plugins"
    db_table = w3_plugin_name
    query_specific_plugin_name = rtdb.db(db_name).table(db_table).filter({"CommandName": w3_command_name}).run(db_connection())
    return query_specific_plugin_name


def insert_brain_jobs_w3(job):
    """
    insert_brain_jobs_w3 function inserts data from W3 in Brain.Jobs table
    :param job: controller job
    :return: nothing for the moment
    """
    db_name = "Brain"
    db_table = "Jobs"

    inserted = rtdb.db(db_name).table(db_table).insert([
        {"id": job["id"],
         "JobTarget": job["JobTarget"],
         "Status": job["Status"],
         "StartTime": job["StartTime"],
         "JobCommand": job["JobCommand"]}
    ]).run()
    print("log: db job from W3 was inserted to Brain.Jobs")
    print(inserted)
    assert inserted['inserted'] == 1


def test_query(job_id_here):
    print("test_query CALLED")
    db_name = "Brain"
    db_table = "Jobs"
    query_status2 = rtdb.db(db_name).table(db_table).filter({'id': job_id_here, 'Status': "Done"}).run(db_connection())
    return query_status2


def get_specific_brain_output(job_id):
    """
    get_specific_brain_output function checks to if Bain.Jobs Status is 'Done'
    if the status is done this function will return data for W4
    :return: query
    """
    db_name = "Brain"
    db_table = "Jobs"
    check_query_int = 0
    timeout = time.time() + 10  # n of seconds to check till while loop breaks
    counter_int = 0

    while True:
        test_int = 0
        counter_int += 1

        for query_item in rtdb.db(db_name).table(db_table).filter({'id': job_id,
                                                                   'Status': "Done"}).run(db_connection()):
            check_query_int = 1
            if query_item != "":
                print("NOT EQUAL NONE")
                # return query_item  # return Brain.Outputs Content
            else:
                print("EQUALS NONE")

        if test_int == 5 or time.time() > timeout or check_query_int == 1:
            break
        test_int -= 1
        time.sleep(1)
    return 0



