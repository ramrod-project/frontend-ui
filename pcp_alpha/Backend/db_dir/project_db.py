"""Project db module (to be moved to brain)

Includes multiple functions for integrating with
and validating information in the Brain.
"""
import sys
from brain import connect, r as rtdb
from brain import check_dev_env, check_prod_env

from .custom_data import (
    location_generated_num,
    read_file_tt,
    delete_file_tt,
    write_file_tt
)


_TEST_TARGETS = [
    {
        "PluginName": "Plugin1",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": "Document Here"
    },
    {
        "PluginName": "Plugin1",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": "Document Here"
    },
    {
        "PluginName": "Plugin1",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": "Document Here"
    }
]

_TEST_COMMANDS = [
    #  read_file command
    {
        "CommandName": "read_file",
        "Tooltip": read_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "FilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  delete_file command
    {
        "CommandName": "delete_file",
        "Tooltip": delete_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "FilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  send_file command
    {
        "CommandName": "send_file",
        "Tooltip": write_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "SourceFilePath",
                "Type": "file_list",
                "Tooltip": "Must be uploaded here first",
                "Value": "File"
            },
            {
                "Name": "DestinationFilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  echo command
    {
        "CommandName": "echo",
        "Tooltip": '\nEcho\n\nClient Returns this string verbatim\n'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
]

plugin1_controller = {
    "id": "1",
    "Name": "Plugin1",
    "State": "Available",
    "DesiredState": "",
    "Interface": location_generated_num("192.16.5."),
    "ExternalPorts": ["9999"],
    "InternalPorts": ["9999"]
}

plugin2_controller = {
    "id": "2",
    "Name": "Plugin2",
    "State": "Available",
    "DesiredState": "",
    "Interface": location_generated_num("192.16.5."),
    "ExternalPorts": ["4242"],
    "InternalPorts": ["4242"]
}

plugin3_controller = {
    "id": "3",
    "Name": "Plugin3",
    "State": "Available",
    "DesiredState": "",
    "Interface": location_generated_num("192.16.5."),
    "ExternalPorts": ["4243"],
    "InternalPorts": ["4243"]
}


def table_clear(database, table):
    """Clears data from a table

    Clears all data from a given table
    in a database.

    Arguments:
        database {str} -- database name
        table {str} -- name of the table to clear.
    """
    db_con_var = connect()
    try:
        rtdb.db(database).table(
            table
        ).delete().run(db_con_var)
        print(
            "log: db {}.{} table has been cleared."
            .format(database, table)
        )
    except rtdb.ReqlError as err:
        err = sys.exc_info()[0]
        print("EXCEPT == {}".format(err))


def tables_create(database, tables):
    """Create a list of tables in the database

    Creates tables in a database from provided
    list.

    Arguments:
        database {str} -- a string denoting the
        name of the database.
        tables {list<str>} -- a list of table names to
        check for.
    """
    db_con_var = connect()
    for table_name in tables:
        try:
            rtdb.db(database).table_create(table_name).run(db_con_var)
            print("log: db {}.{} table was created to locally \
                since it didn't exist".format(database, table_name))
        except rtdb.ReqlError as err:
            err = sys.exc_info()[0]
            print("EXCEPT == {}".format(err))


def tables_check(database, tables):
    """Takes a list of tables and checks for them

    This function takes a list of table names and
    checks if they exist in the database.

    Arguments:
        database {string} -- a string denoting the
        name of the database.
        tables {list<str>} -- a list of table names to
        check for.

    Returns:
        {list} -- a list of tables that do not exist
        in the database.
    """
    db_con_var = connect()
    for i, table_name in enumerate(tables):
        # {database}.{table_name} does exist
        if rtdb.db(database).table_list().contains(
                table_name).run(db_con_var):
            print("\nlog: db {}.{} table exist locally"
                  .format(database, table_name))
            table_clear(database, table_name)
            del tables[i]
        else:
            print("log: db {}.{} doesnt exist"
                  .format(database, table_name))
    return tables


def confirm_brain_db_info():
    """
    confirm_brain_db_info function checks to see if it's using a local
    rethinkdb connection or docker's brain instance connection.  It also
    checks to see if Brain db exist and if any tables exist within the
    Brain db.  If db and tables don't exist they will
    be created only locally.
    :return: nothing at the moment
    """
    if not check_dev_env(): # Check for Development Environment
        return
    db_con_var = connect()
    if rtdb.db_list().contains("Brain").run(db_con_var) is not True:
        print("log: db Brain doesn't exist locally")
        rtdb.db_create("Brain").run(db_con_var)
        print("log: db Brain was created to locally since it didn't exist")

        # create local Brain tables
        tables_create("Brain", ["Targets", "Jobs", "Outputs"])
    else:  # if Brain does exist locally
        print("log: db Brain exist locally")
        non_existing_tables = tables_check(
            "Brain",
            ["Targets", "Jobs", "Outputs"]
        )
        tables_create("Brain", non_existing_tables)

    rtdb.db("Brain").table("Targets").insert(
        _TEST_TARGETS
    ).run(db_con_var)
    print("log: db Dummy data was inserted to Brain.Targets locally")


def confirm_plugin_db_info():
    """
    confirm_plugin_db_info function checks to see if the
    Plugins db exist and if any tables exist within the
    Plugins db.  If db and tables don't exist they will
    be created only locally.
    """
    db_con_var = connect()
    if check_prod_env():  # For Production Environment
        if rtdb.db_list().contains("Plugins").run(db_con_var):
            print("\nlog: db Plugins exist")
            if rtdb.db("Plugins").table_list().run(db_con_var):
                print("log: db Plugins tables are listed down below:\n{}"
                      .format(rtdb.db("Plugins").table_list()
                              .run(db_con_var)))
            else:
                print("log: db Plugins tables don't exist\n")
        else:
            print("\nlog: db Plugins DOESN'T exist\n")
    else:  # is check_dev_env()-- if Plugins does exit locally
        if rtdb.db_list().contains("Plugins").run(db_con_var) is not True:
            print("\nlog: db Plugins doesn't exist locally")
            rtdb.db_create("Plugins").run(db_con_var)
            print("log: db Plugins didn't exist, was created to locally")
            tables_create("Plugins", ["Plugin1"])
        else:  # if Plugins does exit locally
            print("\nlog: db Plugins exist locally")
            non_existing_tables = tables_check("Plugins", ["Plugin1"])
            tables_create("Plugins", non_existing_tables)
        rtdb.db("Plugins").table("Plugin1").insert(
            _TEST_COMMANDS
        ).run(db_con_var)
        rtdb.db("Controller").table("Plugins").delete().run(db_con_var)
        rtdb.db("Controller").table("Plugins")\
            .insert([plugin1_controller,
                     plugin2_controller,
                     plugin3_controller]).run(db_con_var)
        print("log: db Dummy data was inserted to Plugins.Plugin1 locally\n")


def confirm_db_info():
    """
    Runs all the db confirm functions
    """
    print("\nlog: ###### DB Logs ######")
    connect()
    confirm_brain_db_info()
    confirm_plugin_db_info()
