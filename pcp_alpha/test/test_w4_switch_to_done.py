import rethinkdb as r
from time import sleep

if __name__ == "__main__":
    c = r.connect()
    q = r.db("Brain").table("Jobs").filter(r.row["Status"].ne("Done")).changes().run(c)
    for x in q:
        if x and x.get("new_val") and x['new_val'].get("id"):
            print(x['new_val']['id'])
            sleep(2)
            print(r.db("Brain").table("Outputs").insert({"JobCommand":x['new_val'], "Content": x['new_val']["JobCommand"]["Inputs"][0]["Value"]}).run(c))
            print(r.db("Brain").table("Jobs").get(x['new_val']['id']).update({"Status": "Done"}).run(c))

