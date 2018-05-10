from random import randint


def location_generated_num(host_network_num):
    ran_host_num = randint(1, 255)
    return "".join([str(host_network_num), str(ran_host_num)])
