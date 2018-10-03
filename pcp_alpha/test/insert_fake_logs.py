import rethinkdb as rtdb
from rethinkdb.errors import ReqlDriverError
from time import sleep
import sys
from pcp_alpha.Backend.db_dir.custom_data import gen_logs_data


def db_connection():
    """
    
    :return: 
    """
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

    :return:
    """
    check_int = 0
    db_con_var = db_connection()

    if rtdb.db_list().contains("Brain").run(db_con_var) is not True:  # if Brain doesn't exist locally
        print("log: db Brain doesn't exist locally")
        rtdb.db_create("Brain").run(db_con_var)
        print("log: db Brain was created to locally since it didn't exist")

        # create local Brain.Logs table
        rtdb.db("Brain").table_create("Logs").run(db_con_var)
        print("log: db Brain.Logs table was created to locally")
        # create local Brain.Jobs table
        rtdb.db("Brain").table_create("Jobs").run(db_con_var)
        print("log: db Brain.Jobs table was created to locally")
        # create local Brain.Outputs table
        rtdb.db("Brain").table_create("Outputs").run(db_con_var)
        print("log: db Brain.Outputs table was created to locally")
    else:  # if Brain does exist locally
        print("log: db Brain exist locally")

        # Brain.Logs does exist
        if rtdb.db("Brain").table_list().contains("Logs").run(db_con_var):
            print("\nlog: db Brain.Logs table exist locally, inserting dummy data")
            # try:
            #     rtdb.db("Brain").table_drop("Logs").run(db_con_var)
            #     print("log: db Brain.Logs table has been dropped from Brain to insert new data")
            #
            #     rtdb.db("Brain").table_create("Logs").run(db_con_var)
            #     print("log: db Brain.Logs table was created to locally since they were drop to insert new data")
            # except:
            #     e = sys.exc_info()[0]
            #     print("EXCEPT == {}".format(e))
        else:
            print("log: db Brain.Logs doesnt exist")
            rtdb.db("Brain").table_create("Logs").run(db_con_var)
            print("log: db Brain.Logs table was created to locally since it didn't exist")

        # insert dummy data
        rtdb.db("Brain").table("Logs").insert(gen_logs_data(20)).run(db_con_var)
        print("log: db Dummy data was inserted to Brain.Logs locally")


if __name__ == '__main__':
    confirm_brain_db_info()
