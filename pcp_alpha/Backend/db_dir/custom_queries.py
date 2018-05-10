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
