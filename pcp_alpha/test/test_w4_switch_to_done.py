from time import sleep
import rethinkdb as rtdb
from rethinkdb.errors import ReqlOpFailedError, ReqlDriverError


def switch_to_done():
    connection_var = rtdb.connect()
    query_obj = rtdb.db("Brain").table("Jobs").filter(
        rtdb.row["Status"].ne("Done") and rtdb.row["Status"].ne("Error")
    ).changes(squash=False).run(connection_var)
    for query_item in query_obj:
        if query_item and query_item.get("new_val") and query_item['new_val'].get("id") and \
                query_item['new_val'].get("Status") != "Done":
            print(query_item['new_val']['id'])
            print(query_item['new_val']['id'])
            sleep(5)
            print(rtdb.db("Brain").table("Outputs").insert(
                {"OutputJob": query_item['new_val'],
                 "Content": query_item['new_val']["JobCommand"]["Inputs"][0]["Value"]}).
                  run(connection_var))
            print(rtdb.db("Brain").table("Jobs").get(
                query_item['new_val']['id']).update({"Status": "Done"}).run(connection_var))


if __name__ == "__main__":
    while True:
        try:
            switch_to_done()
        except (ReqlOpFailedError, ReqlDriverError):
            sleep(5)

