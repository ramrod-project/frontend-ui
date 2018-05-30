from os import environ
import sys
from time import sleep

import rethinkdb as rtdb
from rethinkdb.errors import ReqlDriverError

from .custom_data import location_generated_num, read_file_tt, delete_file_tt, write_file_tt


# May need to modify in the future to check environments
def check_dev_env():
    """
    check_dev_env function check's which environment (prod or dev)
    to connect to the brain.
    :return: 0 (prod env) or 1 (dev env)
    """
    env_tag = environ.get('STAGE')
    if env_tag == "PROD":
        return_int = 0
    else:
        return_int = 1

    return return_int


def db_connection():
    """
    Function db_connection open's a connection with rethinkdb
    check production environment or development environment
    :return: dev or prod db connection
    """
    env_tag = environ.get('STAGE')

    dbconn = None
    while not dbconn:
        try:
            if env_tag == 'PROD':
                dbconn = rtdb.connect('rethinkdb')
                print("log: connection to the REAL Docker Brain container")
            elif env_tag == 'DEV':
                dbconn = rtdb.connect("rethinkdb_test", 28015)
                print("log: connection to the Brain from localhost")
            else:
                dbconn = rtdb.connect("127.0.0.1", 28015)
                print("log: connection to the Brain (docker network)")
        except ReqlDriverError:
            print("log: can not connect to a db, BABOON ERROR")
            sleep(2)
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
    if check_dev_env() != 1:  # For Production Environment
        if rtdb.db_list().contains("Brain").run(db_con_var):  # db Brain exist
            print("log: db Brain exist")

            if rtdb.db("Brain").table_list().contains(
                    "Targets"
                ).run(db_con_var) and \
                rtdb.db("Brain").table_list().contains(
                    "Jobs"
                ).run(db_con_var) and \
                rtdb.db("Brain").table_list().contains(
                    "Outputs").run(db_con_var):
                print("log: Targets, Jobs, and Outputs tables exist in Brain")

                # Check if Brain.Targets has data,
                # prod doesn't insert dummy data
                target_data = rtdb.db("Brain").table("Targets").has_fields(
                    "PluginName"
                ).run(db_con_var)
                jobs_data = rtdb.db("Brain").table("Jobs").has_fields(
                    "JobTarget"
                ).run(db_con_var)
                output_data = rtdb.db("Brain").table("Outputs").has_fields(
                    "OutputJob"
                ).run(db_con_var)

                validate_data([
                    ("Targets", target_data),
                    ("Jobs", jobs_data),
                    ("Outputs", output_data)
                ])

            else:  # tables don't exist
                print("log: db No tables exist in Brain db")
        else:  # db Brain doesn't exist
            print("log: db Brain DOESN'T exist")

    else:  # For Development Environment
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

    if check_dev_env() != 1:  # For Production Environment
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
    else:  # if Plugins does exit locally
        if rtdb.db_list().contains("Plugins").run(db_connection()) is not True:
            print("\nlog: db Plugins doesn't exist locally")
            rtdb.db_create("Plugins").run(db_connection())
            print("log: db Plugins didn't exist, was created to locally")

            rtdb.db("Plugins").table_create("Plugin1").run(db_connection())
            print("log: db Plugins.Plugin1 table was created to locally")
        else:  # if Plugins does exit locally
            print("\nlog: db Plugins exist locally")
            if rtdb.db("Plugins").table_list().contains(
                    "Plugin1"
                ).run(db_connection()):

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
