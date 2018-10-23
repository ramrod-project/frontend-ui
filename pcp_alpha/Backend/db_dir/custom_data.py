from random import randint, randrange
# import datetime
import time


def location_generated_num(host_network_num):
    ran_host_num = randint(1, 255)
    return "".join([str(host_network_num), str(ran_host_num)])


def time_generator():
    # this cast time to integer millisecond 1970
    return int(time.time()*1000) + randint(1, 10000)


# def datetime_random_generator():
#     return datetime.datetime(int(datetime.datetime.now().strftime("%Y")),
#                              randint(1, int(datetime.datetime.now().strftime("%m"))),
#                              randint(1, 30),
#                              randint(1, 25),
#                              randint(1, 60),
#                              randint(1, 60)
#                              ).strftime("%B %A %H:%M:%S")


# def rt_random_generator():
#     random_rt = "{} {} {} {} {} {}".format(int(datetime.datetime.now().strftime("%Y")),
#                                            randint(1, int(datetime.datetime.now().strftime("%m"))),
#                                            randint(1, 30),
#                                            randint(1, 25),
#                                            randint(1, 60),
#                                            randint(1, 60)
#                                            )
#     return random_rt


def random_container():
    container_list = ["pcp-test_backend",
                      "pcp-test_database",
                      "pcp-test_frontend",
                      "pcp-test_websockets",
                      "AuxiliaryServices",
                      "Harness-5000"]
    random_index = randrange(len(container_list))
    return container_list[random_index]


def gen_logs_data(param_num):
    data_logs_list = []
    for i in range(param_num):
        data_logs_list.append({"rt": time_generator(),
                               "Severity": randint(1, 10),
                               "msg": "Random msg #{}".format(i),
                               "msgDoc": {"a": "Random msgDoc #{}".format(i)},
                               "shost": "host {}".format(randint(1, 10)),
                               "sourceServiceName": random_container()})

    return data_logs_list


#####################################################
# Dummy data.  Below mimic character data in a file
#####################################################
read_file_tt = """
Read File:

This command reads a file (requires full file path)
from the endpoint and returns the content of that file
to this host

Arguments:
1: Remote filename (string format)

Returns: The File itself

"""

delete_file_tt = """
Delete File:

This command Deletes a file from the endpoint

Arguments:
1: Remote filename (string format)

Returns: None

"""

write_file_tt = """
Write File:

This command writes a file
to the endpoint and returns
to the status code

Arguments:
1: Source File (must be uploaded)
2: Remote filename (string format)

Returns: Status code
"""

write_file_tt = """
Write File:

This command writes a file
to the endpoint and returns
to the status code

Arguments:
1: Source File (must be uploaded)
2: Remote filename (string format)

Returns: Status code
"""
