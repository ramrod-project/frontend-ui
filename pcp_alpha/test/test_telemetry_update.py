from brain import connect
from brain.queries import RBT
from random import randint


c = connect()
for x in RBT.run(c):
    pass
print(x)
x['Optional'] = {'Common': {'User': str(randint(1, 1000))}}
RBT.get(x['id']).update(x).run(c)
