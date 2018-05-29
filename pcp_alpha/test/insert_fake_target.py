import rethinkdb as rtdb
from rethinkdb.errors import ReqlDriverError
from time import sleep
import sys
from random import randint


def location_generated_num(host_network_num):
    ran_host_num = randint(1, 255)
    return "".join([str(host_network_num), str(ran_host_num)])


def db_connection():

    dbconn = None
    while not dbconn:
        try:
            dbconn = rtdb.connect()
            print("log: connection to the Brain from a docker image locally")
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
                rtdb.db("Brain").table_drop("Targets").run(db_con_var)
                print("log: db Brain.Targets table has been dropped from Brain to insert new data")

                rtdb.db("Brain").table_create("Targets").run(db_con_var)
                print("log: db Brain.Targets table was created to locally since they were drop to insert new data")
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
                rtdb.db("Brain").table_drop("Jobs").run(db_con_var)
                print("log: db Brain.Jobs table has been dropped from Brain to insert new data")

                rtdb.db("Brain").table_create("Jobs").run(db_con_var)
                print("log: db Brain.Jobs table was created to locally since they were drop to insert new data")
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
                rtdb.db("Brain").table_drop("Outputs").run(db_con_var)
                print("log: db Brain.Outputs table has been dropped from Brain to insert new data")

                rtdb.db("Brain").table_create("Outputs").run(db_con_var)
                print("log: db Brain.Outputs table was created to locally since they were drop to insert new data")
            except:
                e = sys.exc_info()[0]
                print("EXCEPT == {}".format(e))
        else:
            print("log: db Brain.Outputs doesnt exist")
            rtdb.db("Brain").table_create("Outputs").run(db_con_var)
            print("log: db Brain.Outputs table was created to locally since it didn't exist")

        # insert dummy data
        rtdb.db("Brain").table("Targets").insert([
            {"PluginName": "Harness",
             "Location": location_generated_num("172.16.5."),
             "Port": "8002",
             "Optional": "Document Here"}
        ]).run(db_con_var)
        print("log: db Dummy data was inserted to Brain.Targets locally")


if __name__ == '__main__':
    confirm_brain_db_info()
