from time import sleep
from brain import r as rtdb
from brain.connection import connect
from rethinkdb.errors import ReqlOpFailedError


# Function is used when testing job from Pending->Error
def switch_to_error():
    connection_var = connect()
    query_obj = rtdb.db("Brain").table("Jobs").filter(
        rtdb.row["Status"].ne("Error")).changes().run(connection_var)
    for query_item in query_obj:
        if query_item and query_item.get("new_val") and query_item['new_val'].get("id"):
            print(query_item['new_val']['id'])
            sleep(2)
            print(rtdb.db("Brain").table("Outputs").insert(
                {"OutputJob": query_item['new_val'],
                 "Content": "data\noutput\n{}\n\n".format(query_item['new_val']["JobCommand"]["Inputs"][0]["Value"])}).
                  run(connection_var))
            print(rtdb.db("Brain").table("Jobs").get(
                query_item['new_val']['id']).update({"Status": "Error"}).run(connection_var))


# Function is used when testing job from Pending->Done->Error
def switch_to_error2():
    connection_var = connect()
    query_obj = rtdb.db("Brain").table("Jobs").filter((
        rtdb.row["Status"].ne("Error") &
        rtdb.row["Status"].ne("Done"))).changes().run(connection_var)
    for query_item in query_obj:
        if query_item and query_item.get("new_val") and query_item['new_val'].get("id"):
            print(query_item['new_val']['id'])
            sleep(2)
            print(rtdb.db("Brain").table("Outputs").insert(
                {"OutputJob": query_item['new_val'],
                 "Content": "data\noutput\n{}\n\n".format(query_item['new_val']["JobCommand"]["Inputs"][0]["Value"])}).
                  run(connection_var))
            print(rtdb.db("Brain").table("Jobs").get(
                query_item['new_val']['id']).update({"Status": "Done"}).run(connection_var))
            print(rtdb.db("Brain").table("Jobs").get(
                query_item['new_val']['id']).update({"Status": "Error"}).run(connection_var))


if __name__ == "__main__":
    while True:
        try:
            switch_to_error()
        except ReqlOpFailedError:
            sleep(5)
