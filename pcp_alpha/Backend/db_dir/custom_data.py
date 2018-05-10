from random import randint


def location_generated_num(host_network_num):
    ran_host_num = randint(1, 255)
    return "".join([str(host_network_num), str(ran_host_num)])


##################################################
# Dummy data for files
##################################################
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
