from .custom_data import location_generated_num
import rethinkdb as rtdb
import docker
import sys


def check_dev_env():
    client = docker.from_env()
    if len(client.containers.list()) != 0:
        return_int = 0
    else:
        return_int = 1
    return return_int


def db_connection():
    """
    Function db_connection open's a connection with rethinkdb
    check production first then development
    :return: db connection
    """
    client = docker.from_env()

    # Open a connection with rethinkdb either using docker image or local
    # Note: May need to modify later
    if len(client.containers.list()) != 0:
        dbconn = rtdb.connect().repl()
        print("log: connection to the Brain from docker image is connected")
    else:
        dbconn = rtdb.connect("localhost", 28015).repl()
        print("log: connection to the Brain from local is connected")

    return dbconn


def confirm_brain_db_info():
    """
    confirm_brain_db_info function checks to see if it's using a local
    rethinkdb connection or docker's brain instance connection.  It also
    checks to see if Brain db exist and if any tables exist within the
    Brain db.
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
        else:  # if Brain does exit locally
            print("log: db Brain exist locally")
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

        # insert dummy data
        rtdb.db("Brain").table("Targets").insert([
            {"PluginName": "plugin1",
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
    Plugins db
    :return: nothing at the moment
    """
    if rtdb.db_list().contains("Plugins").run():
        print("log: db Plugins exist")

        # Checking any tables exist within Plugins db
        if rtdb.db("Plugins").table_list().run():
            print("log: Plugins tables are listed down below:\n{}".format(rtdb.db("Plugins").table_list().run()))
        else:
            print("log: Plugins tables don't exist\n")
    else:
        print("log: db Plugins DOESN'T exist\n")


def confirm_db_info():
    print("\nlog: ###### DB Logs ######")
    confirm_brain_db_info()
    confirm_plugin_db_info()

