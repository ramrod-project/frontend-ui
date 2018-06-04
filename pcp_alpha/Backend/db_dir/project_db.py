import sys
from brain import connect, r as rtdb
from brain import check_dev_env, check_prod_env
from brain.connection import BrainNotReady

from .custom_data import location_generated_num, read_file_tt, delete_file_tt, write_file_tt


def db_connection():
    """
    Function db_connection open's a connection with rethinkdb
    check production environment or development environment
    :return: dev or prod db connection
    """
    dbconn = None
    while not dbconn:
        try:
            dbconn = connect()
        except BrainNotReady:
            print("BABOON ERROR: Brain is still not ready")
            break
    return dbconn


def validate_data(db_data):
    for data in db_data:
        for document in data[1]:
            check_int = 1
            print("Brain.{} document == {}\n".format(data[0], document))
            if check_int == 0:
                print("log: Brain.{} doesn't have any data".format(data[0]))
            else:
                print("log: Brain.{} has data in the table".format(data[0]))


def confirm_brain_db_info():
    """
    confirm_brain_db_info function checks to see if it's using a local
    rethinkdb connection or docker's brain instance connection.  It also
    checks to see if Brain db exist and if any tables exist within the
    Brain db.  If db and tables don't exist they will
    be created only locally.
    :return: nothing at the moment
    """
    db_con_var = db_connection()
    if check_dev_env():  # For Development Environment
        if rtdb.db_list().contains("Brain").run(db_con_var) is not True:
            print("log: db Brain doesn't exist locally")
            rtdb.db_create("Brain").run(db_con_var)
            print("log: db Brain was created to locally since it didn't exist")

            # create local Brain.Targets table
            for table_name in ["Targets", "Jobs", "Outputs"]:
                rtdb.db("Brain").table_create(table_name).run(db_con_var)
                print("log: db Brain.{} table was created to locally"
                      .format(table_name))
        else:  # if Brain does exist locally
            print("log: db Brain exist locally")
            for table_name in ["Targets", "Jobs", "Outputs"]:
                # Brain.{table_name} does exist
                if rtdb.db("Brain").table_list().contains(
                        table_name).run(db_con_var):
                    print("\nlog: db Brain.{} table exist locally"
                          .format(table_name))
                    try:
                        rtdb.db("Brain").table(
                            table_name
                        ).delete().run(db_con_var)
                        print("log: db Brain.{} table has been cleared."
                              .format(table_name))
                    except:
                        err = sys.exc_info()[0]
                        print("EXCEPT == {}".format(err))
                else:
                    print("log: db Brain.{} doesnt exist"
                          .format(table_name))
                    rtdb.db("Brain").table_create(table_name).run(db_con_var)
                    print("log: db Brain.{} table was created to locally \
                          since it didn't exist".format(table_name))

        rtdb.db("Brain").table("Targets").insert([
            {"PluginName": "Plugin1",
             "Location": location_generated_num("172.16.5."),
             "Port": "8002",
             "Optional": "Document Here"},
            # TODO: Delete after task-153 is done
            {"PluginName": "Plugin3",
             "Location": location_generated_num("172.16.5."),
             "Port": "8002",
             "Optional": "Document Here"},
            {"PluginName": "Plugin2",
             "Location": location_generated_num("172.16.5."),
             "Port": "8002",
             "Optional": "Document Here"}
        ]).run(db_con_var)
        print("log: db Dummy data was inserted to Brain.Targets locally")


def confirm_plugin_db_info():
    """
    confirm_plugin_db_info function checks to see if the
    Plugins db exist and if any tables exist within the
    Plugins db.  If db and tables don't exist they will
    be created only locally.
    :return: nothing at the moment
    """

    if check_prod_env():  # For Production Environment
        if rtdb.db_list().contains("Plugins").run(db_connection()):
            print("\nlog: db Plugins exist")

            if rtdb.db("Plugins").table_list().run(db_connection()):
                print("log: db Plugins tables are listed down below:\n{}"
                      .format(rtdb.db("Plugins").table_list()
                              .run(db_connection())))
            else:
                print("log: db Plugins tables don't exist\n")
        else:
            print("\nlog: db Plugins DOESN'T exist\n")
    else:  # is check_dev_env()-- if Plugins does exit locally
        if rtdb.db_list().contains("Plugins").run(db_connection()) is not True:
            print("\nlog: db Plugins doesn't exist locally")
            rtdb.db_create("Plugins").run(db_connection())
            print("log: db Plugins didn't exist, was created to locally")

            rtdb.db("Plugins").table_create("Plugin1").run(db_connection())
            print("log: db Plugins.Plugin1 table was created to locally")
        else:  # if Plugins does exit locally
            print("\nlog: db Plugins exist locally")
            if rtdb.db("Plugins").table_list().contains(
                    "Plugin1").run(db_connection()):

                try:
                    rtdb.db("Plugins").table(
                        "Plugin1"
                    ).delete().run(db_connection())
                    print("log: db Plugins.Plugin1 table was cleared \
                          for new data.")
                except:
                    err = sys.exc_info()[0]
                    print("EXCEPT == {}".format(err))
            else:
                print("log: db Plugins.Plugin1 doesnt exist")
                rtdb.db("Plugins").table_create(
                    "Plugin1"
                ).run(db_connection())
                print("log: db Plugins.Plugin1 table was created \
                      locally since it didn't exist")

        rtdb.db("Plugins").table("Plugin1").insert([
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
                        "Type": "textbox",
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
        ]).run(db_connection())
        print("log: db Dummy data was inserted to Plugins.Plugin1 locally\n")


def confirm_db_info():
    print("\nlog: ###### DB Logs ######")
    db_connection()
    confirm_brain_db_info()
    confirm_plugin_db_info()
