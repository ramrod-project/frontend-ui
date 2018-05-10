from .project_db import db_connection, rtdb


def get_brain_targets():
    """
    get_brain_targets function from Brain.Targets table.
    :return: the query
    """
    db_name = "Brain"
    db_table = "Targets"
    query_plugin_names = rtdb.db(db_name).table(db_table).filter(rtdb.row['PluginName']).run(db_connection())
    return query_plugin_names


# TODO: COMMENTS
def get_specific_commands(user_selection):
    """
    get_specific_commands function queries Plugins.<PluginName> table
    the plugin name will be based off the user selection from the ui.
    It will return the list of commands onto w2.
    :param user_selection: request from user's plugin selection
    :return: list of commands from the plugin the user selected
    """
    command_list = list()

    cur = rtdb.db("Plugins").table(user_selection).filter(rtdb.row['CommandName']).run(db_connection())
    for item_cur in cur:
        command_list.append(dict(item_cur))
    return command_list
