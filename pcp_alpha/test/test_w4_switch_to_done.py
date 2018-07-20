from time import sleep
import rethinkdb as rtdb
from rethinkdb.errors import ReqlOpFailedError, ReqlDriverError
import brain.jobs as BJ


def switch_to_done(straight_to_done=True):
    connection_var = rtdb.connect()
    query_obj = rtdb.db("Brain").table("Jobs").changes(squash=False).run(connection_var)
    for query_item in query_obj:
        if query_item and query_item.get("new_val") and query_item['new_val'].get("id") and \
                query_item['new_val'].get("Status") != "Done":
            print(query_item['new_val']['id'])
            print(query_item['new_val']['Status'])
            current_status = query_item['new_val'].get("Status")
            if not straight_to_done:
                sleep(5)
                if current_status == BJ.PENDING:
                    new_status = BJ.transition(current_status, BJ.ACTIVE)
                else:
                    new_status = BJ.transition_success(current_status)
            else:
                new_status = BJ.DONE
            print(new_status)
            if new_status == BJ.DONE:
                print(rtdb.db("Brain").table("Outputs").insert(
                    {"OutputJob": query_item['new_val'],
                     "Content": query_item['new_val']["JobCommand"]["Inputs"][0]["Value"]}).
                      run(connection_var))
            print(rtdb.db("Brain").table("Jobs").get(
                query_item['new_val']['id']).update({"Status": new_status}).run(connection_var))
            sleep(3)


if __name__ == "__main__":
    while True:
        try:
            switch_to_done(straight_to_done=False)
        except (ReqlOpFailedError, ReqlDriverError):
            sleep(5)

