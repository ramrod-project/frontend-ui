import json
import brain.queries
from brain.binary import put_buffer, list_dir, get, delete
from brain.jobs import InvalidStateTransition, STOP, transition
from brain.static import STATUS_FIELD
import brain

from .project_db import connect, rtdb
RBX = rtdb.db("Brain")

def update_plugin_to_brain(plugin):
    """

    :param plugin:
    :return:
    """
    response = None
    if plugin["id"] == "NEW":
        all_ports = "-".join(plugin['ExternalPorts']).replace("/", "")
        interface_str = plugin['Interface'].replace(".","_")
        del (plugin['id'])  # allow database to generate a new id
        plugin["ServiceName"] = "{}-{}-{}".format(plugin["Name"],
                                                  interface_str,
                                                  all_ports)
        plugin["InternalPorts"] = plugin['ExternalPorts']
        plugin["State"] = "Available"
        plugin["ServiceID"] = "NEW"
        response = brain.controller.plugins.create_plugin(plugin,
                                                          verify_plugin=True)
    else:
        response = brain.controller.plugins.update_plugin(plugin,
                                                          verify_plugin=True)
    return response


def desired_plugin_state_brain(plugin_id_list, desired_state):
    """

    :param plugin_id_list:
    :param desired_state:
    :return:
    """
    return_objects = list()
    for plugin_id_item in plugin_id_list:
        if desired_state == 'activate':
            return_object = brain.controller.plugins.activate(plugin_id_item.strip('\"'))
        elif desired_state == 'restart':
            return_object = brain.controller.plugins.restart(plugin_id_item.strip('\"'))
        else:
            return_object = brain.controller.plugins.stop(plugin_id_item.strip('\"'))
        return_objects.append(return_object)
    return return_objects


def update_brain_stop_job(job_id):
    job_obj = brain.queries.get_job_by_id(job_id)
    success = True
    if job_obj:
        try:
            new_state = transition(job_obj[STATUS_FIELD], STOP)
            success = brain.queries.update_job_status(job_id, new_state)
            success = success["r.db('Brain').table('Jobs')"]
        except InvalidStateTransition:
            success = {"errors": 1}
    return success


def db_get_saved_command_list(plugin_name):
    response = []
    conn = connect()
    if RBX.table_list().contains("UIW2").run(conn):
        w2_filter = {"PluginName": plugin_name}
        cur = RBX.table("UIW2").filter(w2_filter).order_by("Name").run(conn)
        for saved in cur:
            response.append(saved)
    return response


def db_put_saved_command(plugin_data):
    conn = connect()
    if not RBX.table_list().contains("UIW2").run(conn):
        RBX.table_create("UIW2",
                         primary_key="Name").run(conn)
    response = RBX.table("UIW2").insert(plugin_data).run(conn)
    return response
