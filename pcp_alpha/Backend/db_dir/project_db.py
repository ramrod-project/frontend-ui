from .custom_data import location_generated_num, read_file_tt, delete_file_tt, write_file_tt
import rethinkdb as rtdb
import sys
import subprocess
# import docker
# from time import sleep


# May need to modify in the future to check environments
def check_dev_env():
    """
    check_dev_env function check's which environment (prod or dev)
    to connect to the brain.
    :return: 0 (prod env) or 1 (dev env)
    """
    s = subprocess.check_output('docker ps', shell=True)
    if s.find('myP'.encode()) != -1:
        return_int = 0
    else:
        return_int = 1

    # client = docker.from_env()
    # if len(client.containers.list()) != 0:
    #     return_int = 0
    # else:
    #     return_int = 1
    return return_int


def db_connection():
    """
    Function db_connection open's a connection with rethinkdb
    check production environment or development environment
    :return: dev or prod db connection
    """
    if check_dev_env() != 1:
        dbconn = rtdb.connect().repl()
        print("log: connection to the Brain from docker image is connected")
    else:
        dbconn = rtdb.connect("127.0.0.1", 28015).repl()
        print("log: connection to the Brain from local is connected")

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

    if check_dev_env() != 1:  # For Production Environment
        if rtdb.db_list().contains("Brain").run():  # db Brain exist
            print("log: db Brain exist")

            # Checking Targets, Jobs, Outputs table exist
            if rtdb.db("Brain").table_list().contains("Targets").run() and \
                    rtdb.db("Brain").table_list().contains("Jobs").run() and \
                    rtdb.db("Brain").table_list().contains("Outputs").run():  # yes tables exist
                print("log: db Targets, Jobs, and Outputs tables exist in Brain")

                # Check if Brain.Targets has data, if not insert dummy data
                plugin_name_data = rtdb.db("Brain").table("Targets").has_fields("PluginName").run()
                for document in plugin_name_data:
                    check_int = 1
                    print("Brain.Targets document == {}\n".format(document))
                if check_int == 0:
                    print("log: Brain.Targets doesn't have any PluginNames added")
                else:
                    print("log: Brain.Targets has PluginNames in the table")
            else:  # tables don't exist
                print("log: db No tables exist in Brain db")
        else:  # db Brain doesn't exist
            print("log: db Brain DOESN'T exist")

    else:  # For Development Environment
        if rtdb.db_list().contains("Brain").run() is not True:  # if Brain doesn't exist locally
            print("log: db Brain doesn't exist locally")
            rtdb.db_create("Brain").run()
            print("log: db Brain was created to locally since it didn't exist")

            # create local Brain.Targets table
            rtdb.db("Brain").table_create("Targets").run()
            print("log: db Brain.Targets table was created to locally")
            # create local Brain.Jobs table
            rtdb.db("Brain").table_create("Jobs").run()
            print("log: db Brain.Jobs table was created to locally")
            # create local Brain.Outputs table
            rtdb.db("Brain").table_create("Outputs").run()
            print("log: db Brain.Outputs table was created to locally")
        else:  # if Brain does exit locally
            print("log: db Brain exist locally")

            # Brain.Targets does exist
            if rtdb.db("Brain").table_list().contains("Targets").run():

                try:
                    rtdb.db("Brain").table_drop("Targets").run()
                    print("log: db Brain.Targets table has been dropped from Brain to insert new data")

                    rtdb.db("Brain").table_create("Targets").run()
                    print("log: db Brain.Targets table was created to locally since they were drop to add new data")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Brain.Targets doesnt exist")
                rtdb.db("Brain").table_create("Targets").run()
                print("log: db Brain.Targets table was created to locally since it didn't exist")

            # Brain.Jobs does exist
            if rtdb.db("Brain").table_list().contains("Jobs").run():

                try:
                    rtdb.db("Brain").table_drop("Jobs").run()
                    print("log: db Brain.Jobs table has been dropped from Brain to insert new data")

                    rtdb.db("Brain").table_create("Jobs").run()
                    print("log: db Brain.Jobs table was created to locally since they were drop to add new data")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Brain.Jobs doesnt exist")
                rtdb.db("Brain").table_create("Jobs").run()
                print("log: db Brain.Jobs table was created to locally since it didn't exist")

            # Brain.Outputs does exist
            if rtdb.db("Brain").table_list().contains("Outputs").run():

                try:
                    rtdb.db("Brain").table_drop("Outputs").run()
                    print("log: db Brain.Outputs table has been dropped from Brain to insert new data")

                    rtdb.db("Brain").table_create("Outputs").run()
                    print("log: db Brain.Outputs table was created to locally since they were drop to add new data")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Brain.Outputs doesnt exist")
                rtdb.db("Brain").table_create("Outputs").run()
                print("log: db Brain.Outputs table was created to locally since it didn't exist")

        # insert dummy data
        rtdb.db("Brain").table("Targets").insert([
            {"PluginName": "Plugin1",
             "Location": location_generated_num("172.16.5."),
             "Port": "8002",
             "Optional": "Document Here"}
        ]).run()
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
        if rtdb.db_list().contains("Plugins").run():
            print("\nlog: db Plugins exist")

            # Checking any tables exist within Plugins db
            if rtdb.db("Plugins").table_list().run():
                print("log: Plugins tables are listed down below:\n{}".format(rtdb.db("Plugins").table_list().run()))
            else:
                print("log: Plugins tables don't exist\n")
        else:
            print("\nlog: db Plugins DOESN'T exist\n")
    else:  # if Plugins does exit locally
        if rtdb.db_list().contains("Plugins").run() is not True:  # if Plugins doesn't exist locally
            print("\nlog: db Plugins doesn't exist locally")
            rtdb.db_create("Plugins").run()
            print("log: db Plugins was created to locally since it didn't exist")

            # create local Plugins.Plugin1 table
            rtdb.db("Plugins").table_create("Plugin1").run()
            print("log: db Plugins.Plugin1 table was created to locally")
        else:  # if Plugins does exit locally
            print("\nlog: db Plugins exist locally")
            if rtdb.db("Plugins").table_list().contains("Plugin1").run():

                try:
                    rtdb.db("Plugins").table_drop("Plugin1").run()
                    print("log: db Plugins.Plugin1 table has been dropped from Plugins to insert new data")

                    rtdb.db("Plugins").table_create("Plugin1").run()
                    print("log: db Plugins.Plugin1 table was created to locally since they were drop to add new data")
                except:
                    e = sys.exc_info()[0]
                    print("EXCEPT == {}".format(e))
            else:
                print("log: db Plugins.Plugin1 doesnt exist")
                rtdb.db("Plugins").table_create("Plugin1").run()
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
        ]).run()
        print("log: db Dummy data was inserted to Plugins.Plugin1 locally")


def confirm_db_info():
    print("\nlog: ###### DB Logs ######")
    db_connection()
    confirm_brain_db_info()
    confirm_plugin_db_info()
    # confirm_plugin_db_info()

