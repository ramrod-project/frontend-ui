import json
import brain.queries
from brain.binary import put_buffer, list_dir, get, delete
import brain

from .project_db import connect, rtdb


# Note: Refactor this file as a CRUD class in the future
def get_brain_targets():
    """
    get_brain_targets function from Brain.Targets table.
    :return: the query
    """
    items = []
    for item in brain.queries.get_targets():
        item['json'] = json.dumps(item)
        items.append(item)
    return items


def get_specific_commands(user_selection):
    """
    get_specific_commands function queries Plugins.<PluginName> table
    the plugin name will be based off the user selection from the ui.
    It will return the query onto w2 as a dictionary nested in a list.
    :param user_selection: request from user's plugin selection
    :return: Query as a dictionary nested in a list to w2
    """
    command_list = list()
    try:
        for item_cur in brain.queries.get_plugin_commands(user_selection):
            command_list.append(dict(item_cur))
    except ValueError as err:
        command_list.append(str(err).split(":")[0][:-3])
    return command_list


def get_specific_brain_targets(plugin_name_job):
    """
    get_specific_brain_targets function queries a specific PluginName
    :param plugin_name_job: PluginName from W3
    :return: query
    """
    query_specific_plugin_name = brain.queries.get_targets_by_plugin(plugin_name_job)
    return query_specific_plugin_name


def get_specific_command(w3_plugin_name, w3_command_name):
    """
    get_specific_command function queries a specific CommandName from the
    PluginName in W3
    :param w3_plugin_name: PluginName from W3
    :param w3_command_name: CommandName from W3
    :return: <dict> Command
    """
    db_name = "Plugins"
    db_table = w3_plugin_name
    command = brain.queries.get_plugin_command(w3_plugin_name, w3_command_name)
    return command


def insert_brain_jobs_w3(w3_jobs):
    """
    insert_brain_jobs_w3 function inserts data from W3 in Brain.Jobs table
    :param w3_jobs: controller job
    :return: nothing for the moment
    """
    assert isinstance(w3_jobs, list)
    inserted = {"generated_keys": [],
                "inserted": 0}
    for param_item in w3_jobs:
        if not param_item:
            # fake an ID
            inserted["generated_keys"].append("invalid-job")
        else:
            print("param_item:\n{}\n".format(param_item))
            attempted = brain.queries.insert_jobs([param_item], verify_jobs=False)
            inserted["generated_keys"].extend(attempted["generated_keys"])
            inserted["inserted"] += 1

    print("log: db job from W3 was inserted to Brain.Jobs")
    print("inserted:\n{}\n".format(inserted))
    return inserted


def get_specific_brain_output(job_id):
    """
    get_specific_brain_output function checks to if Bain.Jobs Status is 'Done'
    if the status is done this function will return data for W4
    :return: Brain.Outputs Content if Status is Done or 0 if the data set doesn't exists
    """
    return brain.queries.is_job_done(job_id)


def get_brain_output_content(job_id, max_size=1024):
    """
    get_specific_brain_output function checks to if Bain.Jobs Status is 'Done'
    if the status is done this function will return data for W4
    :return: Brain.Outputs Content if Status is Done or 0 if the data set doesn't exists
    """
    content = None
    if brain.queries.is_job_done(job_id):
        content = brain.queries.get_output_content(job_id, max_size=max_size)
    return content


def insert_new_target(plugin_name, location_num, port_num, optional_char):
    """
    insert_new_target function gets called when the user's input is validated
    and inserts a new target to Brain.Targets table.
    :param plugin_name: user input plugin name
    :param location_num: user input location number
    :param port_num: user input port number
    :param optional_char: user input optional
    :return: the insert
    """
    target_dict = {
        "PluginName": plugin_name,
        "Location": location_num,
        "Port": port_num,
        "Optional": {"init": optional_char}
    }
    inserted_new_target = brain.queries.insert_target(target_dict)
    print("log: db New target was inserted to Brain.Targets")
    print("{}\n".format(inserted_new_target))
    return inserted_new_target


def persist_jobs_state(current_state):
    """

    :param current_state:
    :return:
    """
    conn = connect()
    rbx = rtdb.db("Brain")
    current_state["id"] = 1  # static ID so it overwrites
    if not rbx.table_list().contains("UIW3").run(conn):
        rbx.table_create("UIW3").run(conn)
    output = rbx.table("UIW3").insert(current_state,
                                      conflict="replace").run(conn)
    return output


def load_jobs_state():
    """
    :return:
    """
    output = None
    conn = connect()
    rbx = rtdb.db("Brain")
    if rbx.table_list().contains("UIW3").run(conn):
        output = rbx.table("UIW3").get(1).run(conn)
    return output


def upload_file_to_brain(file_name, binary_file_obj):
    """

    :param file_name:
    :param binary_file_obj:
    :return:
    """
    outcome = put_buffer(file_name, binary_file_obj)
    return outcome


def del_file_upload_from_brain(file_id):
    success = True
    try:
        delete(file_id)
    except ValueError:
        success = False
    return success


def get_file_uploads():
    """
        alias function
    :return:
    """
    return get_brain_files()


def get_brain_files():
    """

    :return: <list> of <str>
    """
    try:
        response = list_dir()
    except ValueError:
        response = []
    return response


def get_brain_file(file_id):
    """

    :param file_id:
    :return:
    """
    try:
        response = get(file_id)
    except ValueError:
        response = None
    return response


def get_plugin_list_query():
    """

    :return:
    """
    # This function will be modified in the future
    return_plugin_list = list()
    plugin_list = brain.controller.plugins.get_plugins()
    for plugin_item in plugin_list:
        return_plugin_list.append(plugin_item)
    return return_plugin_list


def get_interface_list():
    """

    :return:
    """
    return brain.controller.plugins.get_interfaces()


def update_plugin_to_brain(plugin):
    """

    :param plugin:
    :return:
    """
    response = None
    if plugin["id"] == "NEW":
        all_ports = "-".join(plugin['ExternalPorts']).replace("/", "")
        del (plugin['id'])  # allow database to generate a new id
        plugin["ServiceName"] = "{}-{}".format(plugin["Name"],
                                               all_ports)
        plugin["InternalPorts"] = plugin['ExternalPorts']
        plugin["State"] = ""
        plugin["ServiceID"] = "NEW"
        response = brain.controller.plugins.create_plugin(plugin,
                                                          verify_plugin=True)
    else:
        response = brain.controller.plugins.update_plugin(plugin,
                                                          verify_plugin=True)
    return response


def desired_plugin_state_brain(plugin_id, desired_state):
    """

    :param plugin_id: 
    :param desired_state: 
    :return: 
    """
    return_object = None
    if desired_state == 'activate':
        return_object = brain.controller.plugins.activate(plugin_id)
    elif desired_state == 'restart':
        return_object = brain.controller.plugins.restart(plugin_id)
    elif desired_state == 'stop':
        return_object = brain.controller.plugins.stop(plugin_id)
    return return_object
