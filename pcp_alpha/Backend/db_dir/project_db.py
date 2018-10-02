"""Project db module (to be moved to brain)

Includes multiple functions for integrating with
and validating information in the Brain.
"""
import sys
from copy import deepcopy
from random import randint
from brain import connect, r as rtdb
from brain import check_dev_env, check_prod_env
from . import plugins, _TEST_COMMANDS2
from Backend.db_dir.custom_data import gen_logs_data

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
        "Optional": {"init": "hello",
                     "Common": {"User": "xxx"}}
    },
    # {
    #     "PluginName": "Plugin1",
    #     "Location": location_generated_num("172.16.5."),
    #     "Port": "8002",
    #     "Optional": {"init": "hello",
    #                  "Specific": {"abc": "def"}}
    # },
    {
        "PluginName": "Plugin2",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": "Document Here"
    },
    {
        "PluginName": "Plugin3",
        "Location": location_generated_num("172.16.5."),
        "Port": "8003",
        "Optional": "Document Here"
    },
    {
        "PluginName": "Plugin4",
        "Location": location_generated_num("172.16.5."),
        "Port": "8004",
        "Optional": "Document Here"
    },
    {
        "PluginName": "Plugin5",
        "Location": location_generated_num("172.16.5."),
        "Port": "5005",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    },
    # {
    #     "PluginName": "Plugin6",
    #     "Location": location_generated_num("172.16.5."),
    #     "Port": "8002",
    #     "Optional": "Document Here"
    # },
    # {
    #     "PluginName": "Plugin7",
    #     "Location": location_generated_num("172.16.5."),
    #     "Port": "8002",
    #     "Optional": "Document Here"
    # },
    # {
    #     "PluginName": "Plugin8",
    #     "Location": location_generated_num("172.16.5."),
    #     "Port": "8002",
    #     "Optional": "Document Here"
    # },

    {
        "PluginName": "Plugin1",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "goodbye",
                     "Common": {"Checkin": 0,
                                "Admin": False,
                                "User": "yyy"},
                     "Specific": {'Drive': 't',
                                  'InternalLocation': 't',
                                  'Location': '127.0.0.1',
                                  'Admin': False,
                                  'ContactTime': 1536764446.644752,
                                  'telemetry': {"name": "hi",
                                                "exit": 20,
                                                "exitmethod": 0,
                                                "user": "ok",
                                                "host": "here",
                                                "desk": "firm",
                                                "ip": "yes",
                                                "adm": "please"}
                                 }
                     }
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
                   '\nArguments:\n1. String to Echo'
                   '\nOptArguments:\n1. String to Put on STDOUT\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": [
            {
                "Name": "OptionalEchoString",
                "Type": "textbox",
                "Tooltip": "This string will be printed to remote stderr",
                "Value": ""
            },
        ]
    },
    {
        "CommandName": "terminal_input",
        "Tooltip": "Special!",
        "Output": True,
        "Inputs": [
            {
                "Name": "Command",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": ""
            },
        ],
        "OptionalInputs": []
    },
]

TEST_SAVED_COMMANDS =[
    {"Name": "test_saved_command_1",
     "PluginName": "Plugin1",
     "Command": deepcopy(_TEST_COMMANDS[0])
     },
    {"Name": "a_first_test_saved_command_1",
     "PluginName": "Plugin1",
     "Command": deepcopy(_TEST_COMMANDS[2])
     }
]
for _TEST_SAVE_COMMAND in TEST_SAVED_COMMANDS:
    _TEST_SAVE_COMMAND["Command"]["Inputs"][0]['Value'] = str(randint(9999, 9999999))

TEST_PORT_DATA = {
    "InterfaceName": "eth0",
    "Interface": "192.16.5.240",
    "OS": "posix",
    "NodeHostName": "linuxHost",
    "TCPPorts": ["9999", "4243"],
    "UDPPorts": []
}

TEST_PORT_DATA2 = {
    "InterfaceName": "eth0",
    "Interface": "10.10.10.10",
    "OS": "nt",
    "NodeHostName": "ntHost1",
    "TCPPorts": [],
    "UDPPorts": ["4242"]
}
TEST_PORT_DATA3 = {
    "InterfaceName": "eth0",
    "Interface": "10.10.10.12",
    "OS": "posix",
    "NodeHostName": "linuxHost2",
    "TCPPorts": [],
    "UDPPorts": []
}
TEST_PORT_DATA4 = {
    "InterfaceName": "eth0",
    "Interface": "10.10.10.11",
    "OS": "nt",
    "NodeHostName": "ntHost2",
    "TCPPorts": [],
    "UDPPorts": []
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
    if "Plugin2" in tables:
        print("\nlog: db {}.{} table exist locally"
              .format(database, "Plugin2"))
        table_clear(database, "Plugin2")

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
    if not check_dev_env():  # Check for Development Environment
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
            tables_create("Plugins", ["Plugin1", "Plugin2"])
        else:  # if Plugins does exit locally
            print("\nlog: db Plugins exist locally")
            non_existing_tables = tables_check("Plugins", ["Plugin1", "Plugin2"])
            tables_create("Plugins", non_existing_tables)
        rtdb.db("Plugins").table("Plugin1").insert(
            _TEST_COMMANDS
        ).run(db_con_var)
        rtdb.db("Plugins").table("Plugin2").insert(
            _TEST_COMMANDS2
        ).run(db_con_var)
        rtdb.db("Controller").table("Plugins").delete().run(db_con_var)
        rtdb.db("Controller").table("Plugins")\
            .insert(plugins).run(db_con_var)
        rtdb.db("Controller").table("Ports").delete().run(db_con_var)
        rtdb.db("Controller").table("Ports") \
            .insert([TEST_PORT_DATA,
                     TEST_PORT_DATA2]).run(db_con_var)
        # Brain.Logs
        rtdb.db("Brain").table("Logs").delete().run(db_con_var)
        rtdb.db("Brain").table("Logs").insert(gen_logs_data(50)).run(db_con_var)
        print("\nlog: db Dummy data was inserted to Brain.Logs locally\n")

        if rtdb.db("Brain").table_list().contains("UIW2").run(db_con_var):
            rtdb.db("Brain").table("UIW2").delete().run(db_con_var)
        else:
            rtdb.db("Brain").table_create("UIW2").run(db_con_var)
        rtdb.db("Brain").table("UIW2").insert(TEST_SAVED_COMMANDS).run(db_con_var)

        print("log: db Dummy data was inserted to Plugins.Plugin1 locally\n")


def confirm_db_info():
    """
    Runs all the db confirm functions
    """
    print("\nlog: ###### DB Logs ######")
    connect()
    confirm_brain_db_info()
    confirm_plugin_db_info()
