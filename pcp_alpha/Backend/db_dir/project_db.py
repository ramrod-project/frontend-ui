from .custom_data import location_generated_num, read_file_tt, delete_file_tt, write_file_tt
import rethinkdb as rtdb
import sys
from time import sleep
from os import environ
from rethinkdb.errors import ReqlDriverError


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
                print("log: connection to the Brain from a docker image locally")
            else:
                dbconn = rtdb.connect("127.0.0.1", 28015)
                print("log: connection to the Brain from local is connected")
        except ReqlDriverError as err:
            print("log: can not connect to a db, BABOON ERROR")
            sleep(2)
    return dbconn


def confirm_brain_db_info():
    """
    confirm_brain_db_info function checks to see if it's using a local
    rethinkdb connection or docker's brain instance connection.  It also
    checks to see if Brain db exist and if any tables exist within the
    Brain db.  If db and tables don't exist they will
    be created only locally.
    :return: nothing at the moment
    """
    check_int = 0
    db_con_var = db_connection()
    if check_dev_env() != 1:  # For Production Environment
        if rtdb.db_list().contains("Brain").run(db_con_var):  # db Brain exist
            print("log: db Brain exist")

            # Checking Targets, Jobs, Outputs table exist
            if rtdb.db("Brain").table_list().contains("Targets").run(db_con_var) and \
                    rtdb.db("Brain").table_list().contains("Jobs").run(db_con_var) and \
                    rtdb.db("Brain").table_list().contains("Outputs").run(db_con_var):  # yes tables exist
                print("log: db Targets, Jobs, and Outputs tables exist in Brain")

                # Check if Brain.Targets has data, prod doesn't insert dummy data
                target_data = rtdb.db("Brain").table("Targets").has_fields("PluginName").run(db_con_var)
                jobs_data = rtdb.db("Brain").table("Jobs").has_fields("JobTarget").run(db_con_var)
                output_data = rtdb.db("Brain").table("Outputs").has_fields("OutputJob").run(db_con_var)

                # Check Brain.Targets has any data in the table
                for document in target_data:
                    check_int = 1
                    print("Brain.Targets document == {}\n".format(document))
                if check_int == 0:
                    print("log: Brain.Targets doesn't have any PluginNames added")
                else:
                    print("log: Brain.Targets has PluginNames in the table")

                # Check Brain.Jobs has any data in the table
                for document in jobs_data:
                    check_int = 1
                    print("Brain.Jobs document == {}\n".format(document))
                if check_int == 0:
                    print("log: Brain.Jobs doesn't have any JobTarget added")
                else:
                    print("log: Brain.Jobs has JobTarget in the table")

                # Check Brain.Outputs has any data in the table
                for document in output_data:
                    check_int = 1
                    print("Brain.Outputs document == {}\n".format(document))
                if check_int == 0:
                    print("log: Brain.Outputs doesn't have any OutputJob added")
                else:
                    print("log: Brain.Outputs has OutputJob in the table")

            else:  # tables don't exist
                print("log: db No tables exist in Brain db")
        else:  # db Brain doesn't exist
            print("log: db Brain DOESN'T exist")

    else:  # For Development Environment
        if rtdb.db_list().contains("Brain").run(db_con_var) is not True:  # if Brain doesn't exist locally
            print("log: db Brain doesn't exist locally")
            rtdb.db_create("Brain").run(db_con_var)
            print("log: db Brain was created to locally since it didn't exist")

            # create local Brain.Targets table
            rtdb.db("Brain").table_create("Targets").run(db_con_var)
            print("log: db Brain.Targets table was created to locally")
            # create local Brain.Jobs table
            rtdb.db("Brain").table_create("Jobs").run(db_con_var)
            print("log: db Brain.Jobs table was created to locally")
            # create local Brain.Outputs table
            rtdb.db("Brain").table_create("Outputs").run(db_con_var)
            print("log: db Brain.Outputs table was created to locally")
        else:  # if Brain does exist locally
            print("log: db Brain exist locally")

            # Brain.Targets does exist
            if rtdb.db("Brain").table_list().contains("Targets").run(db_con_var):
                print("\nlog: db Brain.Targets table exist locally")

                try:
                    rtdb.db("Brain").table("Targets").delete().run(db_con_var)
                    print("log: db Brain.Targets table has been cleared.")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Brain.Targets doesnt exist")
                rtdb.db("Brain").table_create("Targets").run(db_con_var)
                print("log: db Brain.Targets table was created to locally since it didn't exist")

            # Brain.Jobs does exist
            if rtdb.db("Brain").table_list().contains("Jobs").run(db_con_var):
                print("\nlog: db Brain.Jobs table exist locally")

                try:
                    rtdb.db("Brain").table("Jobs").delete().run(db_con_var)
                    print("log: db Brain.Jobs table has been cleared.")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Brain.Jobs doesnt exist")
                rtdb.db("Brain").table_create("Jobs").run(db_con_var)
                print("log: db Brain.Jobs table was created to locally since it didn't exist")

            # Brain.Outputs does exist
            if rtdb.db("Brain").table_list().contains("Outputs").run(db_con_var):
                print("\nlog: db Brain.Outputs table exist locally")

                try:
                    rtdb.db("Brain").table("Outputs").delete().run(db_con_var)
                    print("log: db Brain.Outputs table has been cleared")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Brain.Outputs doesnt exist")
                rtdb.db("Brain").table_create("Outputs").run(db_con_var)
                print("log: db Brain.Outputs table was created to locally since it didn't exist")

        # insert dummy data
        rtdb.db("Brain").table("Targets").insert([
            {"PluginName": "Plugin1",
             "Location": location_generated_num("172.16.5."),
             "Port": "8002",
             "Optional": "Document Here"}
        ]).run(db_con_var)
        print("log: db Dummy data was inserted to Brain.Targets locally")
        # db_connection().close()


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

            # Checking any tables exist within Plugins db
            if rtdb.db("Plugins").table_list().run(db_connection()):
                print("log: Plugins tables are listed down below:\n{}".format(rtdb.db("Plugins").table_list().run(db_connection())))
            else:
                print("log: Plugins tables don't exist\n")
        else:
            print("\nlog: db Plugins DOESN'T exist\n")
    else:  # if Plugins does exit locally
        if rtdb.db_list().contains("Plugins").run(db_connection()) is not True:  # if Plugins doesn't exist locally
            print("\nlog: db Plugins doesn't exist locally")
            rtdb.db_create("Plugins").run(db_connection())
            print("log: db Plugins was created to locally since it didn't exist")

            # create local Plugins.Plugin1 table
            rtdb.db("Plugins").table_create("Plugin1").run(db_connection())
            print("log: db Plugins.Plugin1 table was created to locally")
        else:  # if Plugins does exit locally
            print("\nlog: db Plugins exist locally")
            if rtdb.db("Plugins").table_list().contains("Plugin1").run(db_connection()):

                try:
                    rtdb.db("Plugins").table_drop("Plugin1").run(db_connection())
                    print("log: db Plugins.Plugin1 table has been dropped from Plugins to insert new data")

                    rtdb.db("Plugins").table_create("Plugin1").run(db_connection())
                    print("log: db Plugins.Plugin1 table was created to locally since they were drop to add new data")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Plugins.Plugin1 doesnt exist")
                rtdb.db("Plugins").table_create("Plugin1").run(db_connection())
                print("log: db Plugins.Plugin1 table was created to locally since it didn't exist")

        # insert dummy data
        rtdb.db("Plugins").table("Plugin1").insert([
            #  read_file command
            {"CommandName": "read_file",
             "Tooltip": read_file_tt,
             "Output": True,
             "Inputs": [
                 {"Name": "FilePath",
                  "Type": "textbox",
                  "Tooltip": "Must be the fully qualified path",
                  "Value": "remote filename"
                  },
             ],
             "OptionalInputs": []
             },
            #  delete_file command
            {"CommandName": "delete_file",
             "Tooltip": delete_file_tt,
             "Output": True,
             "Inputs": [
                 {"Name": "FilePath",
                  "Type": "textbox",
                  "Tooltip": "Must be the fully qualified path",
                  "Value": "remote filename"
                  },
                ],
                "OptionalInputs": []
             },
            #  send_file command
            {"CommandName": "send_file",
             "Tooltip": write_file_tt,
             "Output": True,
             "Inputs": [
                 {"Name": "SourceFilePath",
                  "Type": "textbox",
                  "Tooltip": "Must be uploaded here first",
                  "Value": "File"
                  },
                 {"Name": "DestinationFilePath",
                  "Type": "textbox",
                  "Tooltip": "Must be the fully qualified path",
                  "Value": "remote filename"
                  },
             ],
             "OptionalInputs": []
             },
            #  echo command
            {"CommandName": "echo",
             "Tooltip": '\nEcho\n\nClient Returns this string verbatim\n'
                        '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
             "Output": True,
             "Inputs": [
                 {"Name": "EchoString",
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
    # confirm_plugin_db_info()

