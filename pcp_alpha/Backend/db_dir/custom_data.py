from Backend.pcp_app.models import CapabilitiesModel

# Global Queryset of CapabilitiesModel
mod = CapabilitiesModel.objects.all()


def get_plugin_num():
    """
    get_plugin_num function returns the number of plugin names
    from CapabilitiesModel.
    :return: number of plugin names
    """
    plugin_num = 0
    for item in mod:
        plugin_num += 1
    return plugin_num


def get_capability_num():
    """
    get_capability_num function returns the number of capability names
    from CapabilitiesModel.
    :return: number of capability names
    """
    capability_num = 0
    for item in mod:
        capabilitylist = str(item).split("-")[1].split(",")
        for sec_item in capabilitylist:
            capability_num += 1
    return capability_num
