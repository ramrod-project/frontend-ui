

plugins = [{
    "id": "1-1-A",
    "Name": "Plugin1",
    "ServiceName": "Plugin1-a",
    "ServiceID": "cheeto1",
    "State": "Available",
    "DesiredState": "",
    "OS": "posix",
    "Interface": "192.16.5.240",
    "Environment": ["STAGE=DEV", "NORMAL=1"],
    "ExternalPorts": ["9999/tcp"],
    "InternalPorts": ["9999/tcp"]
}, {
    "id": "2-2-B",
    "Name": "Plugin2",
    "ServiceName": "Plugin2-a",
    "ServiceID": "cheeto2",
    "State": "Restarting",
    "DesiredState": "",
    "OS": "nt",
    "Interface": "10.10.10.10",
    "Environment": ["STAGE=DEV", "NORMAL=2"],
    "ExternalPorts": ["4242/tcp"],
    "InternalPorts": ["4242/tcp"]
}, {
    "id": "3-3-C",
    "Name": "Plugin3",
    "ServiceName": "Plugin3-a",
    "ServiceID": "cheeto3",
    "State": "Stopped",
    "DesiredState": "",
    "OS": "all",
    "Interface": "192.16.5.240",
    "Environment": ["STAGE=DEV", "NORMAL=3"],
    "ExternalPorts": ["4243/udp"],
    "InternalPorts": ["4243/udp"]
}]
