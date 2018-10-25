# Dummy data for development

from .custom_data import (
    location_generated_num,
    read_file_tt,
    delete_file_tt,
    write_file_tt
)


# Plugins
plugins = [{
    "id": "1-1-A-AA",
    "Name": "Plugin1",
    "ServiceName": "",
    "ServiceID": "",
    "State": "Available",
    "DesiredState": "",
    "OS": "nt",
    "Interface": "",
    "Environment": [],
    "ExternalPorts": [],
    "InternalPorts": [],
},
{
    "id": "1-1-A-AAA",
    "Name": "Plugin3",
    "ServiceName": "",
    "ServiceID": "",
    "State": "Available",
    "DesiredState": "",
    "OS": "all",
    "Interface": "",
    "Environment": [],
    "ExternalPorts": [],
    "InternalPorts": [],
    "Extra": False
},
{
    "id": "1-1-A-A",
    "Name": "Plugin2",
    "ServiceName": "",
    "ServiceID": "",
    "State": "Available",
    "DesiredState": "",
    "OS": "posix",
    "Interface": "",
    "Environment": [],
    "ExternalPorts": [],
    "InternalPorts": [],
    "Extra": True,
},
{
    "id": "1-1-A",
    "Name": "Plugin1",
    "ServiceName": "Plugin1-9999tcp",
    "ServiceID": "cheeto1",
    "State": "Available",
    "DesiredState": "",
    "OS": "posix",
    "Interface": "192.16.5.240",
    "Environment": ["STAGE=DEV", "NORMAL=1"],
    "ExternalPorts": ["9999/tcp"],
    "InternalPorts": ["9999/tcp"],
    "Extra": False,
}, {
    "id": "2-2-B",
    "Name": "Plugin2",
    "ServiceName": "Plugin2-4242tcp",
    "ServiceID": "cheeto2",
    "State": "Restarting",
    "DesiredState": "",
    "OS": "nt",
    "Interface": "10.10.10.10",
    "Environment": ["STAGE=DEV", "NORMAL=2"],
    "ExternalPorts": ["4242/tcp"],
    "InternalPorts": ["4242/tcp"],
    "Extra": True,
}, {
    "id": "3-3-C",
    "Name": "Plugin3",
    "ServiceName": "Plugin3-4243tcp",
    "ServiceID": "cheeto3",
    "State": "Stopped",
    "DesiredState": "",
    "OS": "all",
    "Interface": "192.16.5.240",
    "Environment": ["STAGE=DEV", "NORMAL=3"],
    "ExternalPorts": ["4243/udp"],
    "InternalPorts": ["4243/udp"],
    "Extra": True,
}]


# Targets
_TEST_TARGETS = [
    {
        "PluginName": "Plugin1",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    },
    {
        "PluginName": "Plugin1",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    },
    {
        "PluginName": "Plugin1",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    },
    {
        "PluginName": "Plugin2",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    },
    {
        "PluginName": "Plugin3",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    },
    {
        "PluginName": "Plugin4",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    },
    {
        "PluginName": "Plugin5",
        "Location": location_generated_num("172.16.5."),
        "Port": "8002",
        "Optional": {"init": "hello",
                     "Specific": {"abc": "def"}}
    }
]


# Commands
# Commands for Plugin1
_TEST_COMMANDS = [
    #  read_file command
    {
        "CommandName": "read_file",
        "Tooltip": read_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "FilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  delete_file command
    {
        "CommandName": "delete_file",
        "Tooltip": delete_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "FilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  send_file command
    {
        "CommandName": "send_file",
        "Tooltip": write_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "SourceFilePath",
                "Type": "file_list",
                "Tooltip": "Must be uploaded here first",
                "Value": "File"
            },
            {
                "Name": "DestinationFilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  echo command
    {
        "CommandName": "echo",
        "Tooltip": '\nEcho\n\nClient Returns this string verbatim\n'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    {
        "CommandName": "terminal_input",
        "Tooltip": "Special!",
        "Output": True,
        "Inputs": [
            {
                "Name": "Command",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": ""
            },
        ],
        "OptionalInputs": []
    },
]

# Commands for Plugin2
_TEST_COMMANDS2 = [
    #  read_file command
    {
        "CommandName": "read_file",
        "Tooltip": read_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "FilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  delete_file command
    {
        "CommandName": "delete_file",
        "Tooltip": delete_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "FilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  send_file command
    {
        "CommandName": "send_file",
        "Tooltip": write_file_tt,
        "Output": True,
        "Inputs": [
            {
                "Name": "SourceFilePath",
                "Type": "file_list",
                "Tooltip": "Must be uploaded here first",
                "Value": "File"
            },
            {
                "Name": "DestinationFilePath",
                "Type": "textbox",
                "Tooltip": "Must be the fully qualified path",
                "Value": "remote filename"
            },
        ],
        "OptionalInputs": []
    },
    #  echo command
    {
        "CommandName": "echo",
        "Tooltip": '\nEcho\n\nClient Returns this string verbatim\n'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    {
        "CommandName": "terminal_input",
        "Tooltip": "Special!",
        "Output": True,
        "Inputs": [
            {
                "Name": "Command",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": ""
            },
        ],
        "OptionalInputs": []
    },
    #  test command 1
    {
        "CommandName": "command1",
        "Tooltip": '\ncommand1\n\nThis is for testing testinskldfjslkdjfslkjdfksj\nits like echo'
                   '\nArguments:\n1. String to Echo\n\n2. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 2
    {
        "CommandName": "command2",
        "Tooltip": '\ncommand2\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\n1. String to Echo\n\n1. String to Echo\n\n1. String to Echo\n'
                   '\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 3
    {
        "CommandName": "command3",
        "Tooltip": '\ncommand3\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 4
    {
        "CommandName": "command4",
        "Tooltip": '\ncommand4\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 5
    {
        "CommandName": "command5",
        "Tooltip": '\ncommand5\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 6
    {
        "CommandName": "command6",
        "Tooltip": '\ncommand6\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 7
    {
        "CommandName": "command7",
        "Tooltip": '\ncommand7\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 8
    {
        "CommandName": "command8",
        "Tooltip": '\ncommand8\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 9
    {
        "CommandName": "command9",
        "Tooltip": '\ncommand9\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 10
    {
        "CommandName": "command10",
        "Tooltip": '\ncommand10\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 11
    {
        "CommandName": "command11",
        "Tooltip": '\ncommand11\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 12
    {
        "CommandName": "command12",
        "Tooltip": '\ncommand12\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 13
    {
        "CommandName": "command13",
        "Tooltip": '\ncommand13\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 14
    {
        "CommandName": "command14",
        "Tooltip": '\ncommand14\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 15
    {
        "CommandName": "command15",
        "Tooltip": '\ncommand15\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 16
    {
        "CommandName": "command16",
        "Tooltip": '\ncommand16\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 17
    {
        "CommandName": "command17",
        "Tooltip": '\ncommand17\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 18
    {
        "CommandName": "command18",
        "Tooltip": '\ncommand15\n\nThis is for testing\nits like echo'
                   '\ncommand18:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
    #  test command 19
    {
        "CommandName": "command19",
        "Tooltip": '\ncommand19\n\nThis is for testing\nits like echo'
                   '\nArguments:\n1. String to Echo\n\nReturns:\nString\n',
        "Output": True,
        "Inputs": [
            {
                "Name": "EchoString",
                "Type": "textbox",
                "Tooltip": "This string will be echoed back",
                "Value": "echo user input"
            },
        ],
        "OptionalInputs": []
    },
]


# Port Data
TEST_PORT_DATA = {
    "InterfaceName": "eth0",
    "Interface": "192.16.5.240",
    "TCPPorts": ["9999", "4243"],
    "UDPPorts": []
}

TEST_PORT_DATA2 = {
    "InterfaceName": "eth0",
    "Interface": "10.10.10.10",
    "TCPPorts": [],
    "UDPPorts": ["4242"]
}
