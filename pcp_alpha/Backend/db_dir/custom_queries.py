from .project_db import db_connection, rtdb


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
    query_specific_plugin_name = rtdb.db(db_name).table(db_table).filter({"PluginName": w3PluginNameJob}).run(db_connection())
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


def get_specific_brain_output():
    db_name = "Brain"
    db_table = "Jobs"

    # query for Bain.Jobs Status is 'Done'
    query_status = rtdb.db(db_name).table(db_table).filter({"Status": "Done"}).run(db_connection())

    print("*"*28)
    # Check if the query is empty
    for document in query_status:
        # Note: If statement down below or...
        # Add a while loop to keep checking as a boolean
        if document is True:
            print("query_status is True")
        else:
            print("query_status is False")
        if document is None:  # Status does not equal to Done
            print("query_status equals to None")
        else:                 # Status equals Done
            print("query_status doesn't equal to None")
            # return query_status

