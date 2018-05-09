import rethinkdb as rtdb

# functions:
# - db connection function
#   Two versions: prod and dev
# - check db's and tables exist function (if yes drop tables them and re-create them).
#   Two versions: prod and dev
# - input test data for dev


def db_connection():
    """
    Function db_connection open's a connection with rethinkdb
    check production first then development
    :return: db connection
    """
    # TODO: Logic to check docker image brain is listening. If yes connect, if no connect to local db
    dbconn = rtdb.connect().repl()
    print("log: connection to the Brain from docker image connected")
    return dbconn


def confirm_brain_db_info():
    """
    confirm_brain_db_info function checks to see if the
    Brain db exist and if any tables exist within the
    Brain db
    :return: nothing at the moment
    """
    if rtdb.db_list().contains("Brain").run():
        print("log: db Brain exist")

        # Checking Targets, Jobs, Outputs table
        if rtdb.db("Brain").table_list().contains("Targets").run() and \
                rtdb.db("Brain").table_list().contains("Jobs").run() and \
                rtdb.db("Brain").table_list().contains("Outputs").run():
            print("log: table Targets, Jobs, and Outputs exist")

            target_ls = rtdb.db("Brain").table("Targets").get_all().run()
            print("#" * 29)
            for document in target_ls:
                print("document == {}\n".format(document))
        else:
            print("log: No tables exist in Brain db")
    else:
        print("log: db Brain DOESN'T exist")


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

