// This file relates to plugin list on the right side panel


//See The Brain Documentation
var PLUGIN_STATE = "State";
var PLUGIN_DESIRED_STATE = "DesiredState";
var PLUGIN_OS = "OS";
var PLUGIN_NAME = "Name";
var PLUGIN_INTERFACE = "Interface";
var PLUGIN_ENVIRONMENT = "Environment";
var PLUGIN_EXTERNAL_PORTS = "ExternalPorts";
var PLUGIN_INTERNAL_PORTS = "InternalPorts";
var ITEM_SPLITTER = ",";

var BLANK_PLUGIN = {
    "id": "NEW",
    "Name": "Name",
    "State": "",
    "DesiredState": "Activate",
    "OS": "all",
    "Interface": "",
    "Environment":[],
    "ExternalPorts": [],
    "InternalPorts": []
};

var plugin_list_map = {};
var interfaces = [];
var plugin_names = [];

var env_rgx = /[0-9a-zA-Z_]{3,100}=[0-9a-zA-Z_]{3,100}(,)*/;
var port_rgx2 = /(\d{2,4})\/(tcp|udp)((,)(\d{2,4})\/(tcp|udp))*/;



function add_plugin_name(name){
    if (plugin_names.indexOf(name) < 0){
        plugin_names.push(name);
        $("#plugin-name").append($("<option/>")
            .val(name)
            .text(name));
    }
}

function get_interfaces(){
    $.ajax({
        type: "GET",
        url: "/get_interfaces/",
        datatype: 'json',
        success: function(data) {
            interfaces = data;
            var iface = $("#plugin-interface");
            iface.empty();
            for (var i=0; i<data.length; i++){
                iface.append($("<option/>")
                    .val(data[i])
                    .text(data[i])
                );
            }
        },
        error: function (data) {
            console.log("ERROR @ update_interfaces ajax function");
        }
    });
}


// Modify function for future activate, restart, and stop plugin task
function desired_plugin_state(plugin_id, desired_state) {
    $.ajax({
        type: "GET",
        url: "/desired_plugin_state/",
        data: {"plugin_id": plugin_id, "desired_state": desired_state},
        datatype: 'json',
        success: function(data) {
            console.log("SUCCESS @ activate_plugin ajax function");
            console.log(data);
        },
        error: function (data) {
            console.log("ERROR @ activate_plugin ajax function");
        }
    });
}

function display_plugin_list(plugin_data, plugin_index) {
    var plugin_list_dom = $(".plugin_list_display"),
        bp = "<br/>";
    plugin_list_dom
        .append($("<li/>").attr({"class": "plugin_button"})
            .append($("<div/>")
                .attr({"class": "form-group pcp_div_custom"})
                .append($("<label/>")
                    .attr({"class": "control-sidebar-subheading"})
                    // Modal form when plugin name is clicked on, and passing plugin id
                    //<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-whatever="@fat">Open modal for @fat</button>
                    .append($("<button/>").attr({"id": ""+plugin_data['id'],
                                            "class": "btn btn-primary",
                                            "data-toggle":"modal",
                                            "data-target":"#controller-modal",
                                            "data-whatever": plugin_data['id'],
                                            "whatever": "/update_plugin/"+plugin_data['id']+"/"})
                        .text(plugin_data['Name'])
                        .tooltip({
                            classes: {"ui-tooltip": "ui-corner-all ui-widget-shadow ui-state-highlight"},
                            items: 'button',
                            content: "DesiredState: "+plugin_data['DesiredState']+bp+
                            "ExternalPorts: "+plugin_data['ExternalPorts']+bp+
                            "Interface: "+plugin_data['Interface']+bp+
                            "InternalPorts: "+plugin_data['InternalPorts']+bp+
                            "Name: "+plugin_data['Name']+bp+
                            "OS: "+plugin_data['OS']+bp+
                            "State: "+plugin_data['State']+bp+
                            "id: "+plugin_data['id'],
                        })
                    )
                    .append("&emsp;&emsp;&emsp;")
                    // Activate button
                    .append($("<a/>")
                        .attr({"href": "#",
                            "id": "activate_button"+plugin_index,
                            "class":"btn btn-social-icon btn-pcp_button_color1 btn-xs",
                            "onclick": "desired_plugin_state('"+plugin_data['id']+"', 'activate')",
                            "data-toggle": "tooltip",
                            "title": "Activate  "+plugin_data['Name']})
                        .append($("<i/>")
                            .attr({"id": "activate_button_two"+plugin_index ,"class": "fa fa-thumbs-o-up"})
                        )
                    )
                    .append("&nbsp;")
                    // Restart button
                    .append($("<a/>")
                        .attr({"href": "#",
                            "id": "restart_button"+plugin_index,
                            "class":"btn btn-social-icon btn-pcp_button_color2 btn-xs",
                            "onclick": "desired_plugin_state('"+plugin_data['id']+"', 'restart')",
                            "data-toggle": "tooltip",
                            "title": "Restart  "+plugin_data['Name']})
                        .append($("<i/>")
                            .attr({"id": "restart_button_two"+plugin_index ,"class": "fa fa-refresh"})
                        )
                    )
                    .append("&nbsp;")
                    // Stop button
                    .append($("<a/>")
                        .attr({"href": "#",
                            "id": "stop_button"+plugin_index,
                            "class":"btn btn-social-icon btn-google btn-xs",
                            "onclick": "desired_plugin_state('"+plugin_data['id']+"', 'stop')",
                            "data-toggle": "tooltip",
                            "title": "Stop  "+plugin_data['Name']})
                        .append($("<i/>")
                            .attr({"id": "stop_button_two"+plugin_index ,"class": "fa fa-hand-stop-o"})
                        )
                    )
                    // Plugin json data (hidden on ui)
                    .append($("<span/>")
                        .attr({"id": "pluginidjson"+plugin_data['id'], "style": "display:none"})
                        .text(JSON.stringify(plugin_data))
                    )
                )
            )
        );
}

function get_plugin_list() {
    // ajax call to get_plugin_list controller from pcp_app/views.py
    var plugin_list_refresh = $("#plugin_list_refresh"),
        plugin_list_dom = $(".plugin_list_display");
    plugin_list_dom.empty();
    plugin_list_refresh.addClass("fa-spin");
    get_interfaces();
    $("#add_plugin_id")
        .attr({"data-toggle":"modal",
               "data-target":"#controller-modal",
               "data-whatever": "NEW"});

    $.ajax({
        type: "GET",
        url: "/get_plugin_list/",
        datatype: 'json',
        success: function(data) {
            plugin_list_map = {};
            for (var count=0; count<data.length; count++){
                plugin_list_map[data[count]['id']] = data[count];
                add_plugin_name(data[count]["Name"]);
                display_plugin_list(data[count], count);
                $("#activate_button"+count).hide();
                $("#restart_button"+count).hide();
                $("#stop_button"+count).hide();
            }
            plugin_list_map[BLANK_PLUGIN["id"]] = BLANK_PLUGIN;
            plugin_list_refresh.removeClass("fa-spin");
        },
        error: function (data) {
            console.log("ERROR @ get_plugin_list function");
            plugin_list_refresh.removeClass("fa-spin");
        }
    });
}


function onclick_plugin_save(event){
    var plugin = {};
    $("#plugin-save").attr({"disabled":true});
    plugin["id"] = $("#plugin-id").val();
    plugin[PLUGIN_DESIRED_STATE] = $("#plugin-desired").val();
    plugin[PLUGIN_EXTERNAL_PORTS] =  $("#plugin-external-ports").val().split(ITEM_SPLITTER);
    plugin[PLUGIN_INTERNAL_PORTS] =  $("#plugin-internal-ports").val().split(ITEM_SPLITTER);
    plugin[PLUGIN_NAME] = $("#plugin-name").val();
    plugin[PLUGIN_INTERFACE] = $("#plugin-interface").val();
    plugin[PLUGIN_OS] = $("#plugin-os").val();
    plugin[PLUGIN_ENVIRONMENT] = $("#plugin-environment").val().split(ITEM_SPLITTER);
    $.ajax({
        type: "POST",
        url: "/update_plugin/"+plugin['id']+"/",
        data: plugin,
        datatype: 'json',
        success: function(data) {
            get_plugin_list();
            $("#plugin-save").attr({"disabled":false});
            $("#plugin-response").addClass("btn-pcp_button_color1");
            $("#plugin-response").text("Changes Successful - May now close window - "+JSON.stringify(data))
        },
        error: function (data) {
            $("#plugin-response").text("Changes Failed - "+JSON.stringify(data));
            $("#plugin-response").addClass("ui-state-error");
            $("#plugin-save").attr({"disabled":false});
        }
    });
}

function verify_plugin_name(){
    var plugin_name = $("#plugin-name"),
        content = plugin_name[0].value,
        helper_checker = 0;
    for(var counter = 1; counter < plugin_name[0].length; counter++){
        var plugin_name_option = $("#plugin-name option#"+counter);
        if(plugin_name_option[0].selected === true) {
            $("#plugin-save")[0].disabled = false;
            helper_checker = 1;
            break;
        } else {
            $("#plugin-save")[0].disabled = true;
        }
    }
    if(helper_checker === 1) {
        $("#pf_name").removeClass("has-error");
        $("#pf_name_help").hide();
    } else {
        $("#pf_name").addClass("has-error");
        $("#pf_name_help").show();
    }
    return !$("#plugin-save")[0].disabled;
}

function verify_desired_state(){
    console.log("verify_desired_state");
    var desired_state = $("#plugin-desired"),
        content = desired_state[0].value,
        helper_checker = 0;
    for(var counter = 1; counter < desired_state[0].length; counter++){
        var plugin_desired_option = $("#plugin-desired option#"+counter);
        if(plugin_desired_option[0].selected === true) {
            $("#plugin-save")[0].disabled = false;
            helper_checker = 1;
            break;
        } else {
            $("#plugin-save")[0].disabled = true;
        }
    }
}

function verify_plugin_interface(){
    console.log("verify_plugin_interface");
    var plugin_interface = $("#plugin-interface"),
        helper_checker = 0;
    for(var counter = 1; counter < plugin_interface[0].length; counter++){
        var plugin_interface_option = $("#plugin-interface option#"+counter);
        if(plugin_interface_option[0].selected === true) {
            $("#plugin-save")[0].disabled = false;
            helper_checker = 1;
            break;
        } else {
            $("#plugin-save")[0].disabled = true;
        }
    }
    if(helper_checker === 1) {
        $("#pf_interface").removeClass("has-error");
        $("#pf_interface_help").hide();
    } else {
        $("#pf_interface").addClass("has-error");
        $("#pf_interface_help").show();
    }
    return !$("#plugin-save")[0].disabled;
}

function verify_plugin_external_ports(){
    var plugin_port = $("#plugin-external-ports"),
        content = plugin_port[0].value;
    if(!port_rgx2.test(content)){
        $("#pf_port").addClass("has-error");
        $("#pf_ep_help").show();
        $("#plugin-save")[0].disabled = true;
    } else {
        $("#pf_port").removeClass("has-error");
        $("#pf_ep_help").hide();
        $("#plugin-save")[0].disabled = false;
    }
    return !$("#plugin-save")[0].disabled;
}

function verify_plugin_environment(){
    console.log("verify_plugin_environment");
    var plugin_environment = $("#plugin-environment"),
        content = plugin_environment[0].value;
    if(!env_rgx.test(content)){
        $("#pf_environment").addClass("has-error");
        $("#pf_environment_help").show();
        $("#plugin-save")[0].disabled = true;
    } else {
        $("#pf_environment").removeClass("has-error");
        $("#pf_environment_help").hide();
        $("#plugin-save")[0].disabled = false;
    }
    return !$("#plugin-save")[0].disabled;
}

function verify_plugin_os(){
    var plugin_os = $("#plugin-os"),
        helper_checker = 0;
    for(var counter = 1; counter < plugin_os[0].length; counter++){
        var plugin_os_option = $("#plugin-os option#"+counter);
        if(plugin_os_option[0].selected === true) {
            $("#plugin-save")[0].disabled = false;
            helper_checker = 1;
            break;
        } else {
            $("#plugin-save")[0].disabled = true;
        }
    }
    if(helper_checker === 1) {
        $("#pf_os").removeClass("has-error");
        $("#pf_os_help").hide();
    } else {
        $("#pf_os").addClass("has-error");
        $("#pf_os_help").show();
    }
    return !$("#plugin-save")[0].disabled;
}


$(document).ready(function() {
    // refresh button to refresh plugin list
    $("#plugin-save").click(onclick_plugin_save);
    $("#plugin_list_refresh").click(get_plugin_list);

    get_plugin_list();
    // Show restart and stop buttons
    $(document).on('mouseenter', '.plugin_button', function () {
        $(this).find(".btn-google").show();
        $(this).find(".btn-pcp_button_color1").show();
        $(this).find(".btn-pcp_button_color2").show();
    // Hide restart and stop buttons
    }).on('mouseleave', '.plugin_button', function () {
        $(this).find(".btn-google").hide();
        $(this).find(".btn-pcp_button_color1").hide();
        $(this).find(".btn-pcp_button_color2").hide();
    });
    $("#plugin-name").change(verify_plugin_name);
    $("#plugin-name").keyup(verify_plugin_name);

    $("#plugin-desired").change(verify_desired_state);
    $("#plugin-desired").keyup(verify_desired_state);

    $("#plugin-interface").change(verify_plugin_interface);
    $("#plugin-interface").keyup(verify_plugin_interface);

    $("#plugin-external-ports").change(verify_plugin_external_ports);
    $("#plugin-external-ports").keyup(verify_plugin_external_ports);

    $("#plugin-environment").change(verify_plugin_environment);
    $("#plugin-environment").keyup(verify_plugin_environment);

    $("#plugin-os").change(verify_plugin_os);
    $("#plugin-os").keyup(verify_plugin_os);
});


$('#controller-modal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var plugin_id = button.data('whatever'); // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  if (plugin_id == "NEW"){
    modal.find('.plugin-name').show();
    modal.find('.plugin-iports').hide();
  } else {
    modal.find('.plugin-name').hide();
    modal.find('.plugin-iports').hide();
  }
  $("#plugin-response")
      .text("")
      .removeClass("ui-state-error")
      .removeClass("btn-pcp_button_color1");
  modal.find('.plugin-id').val(plugin_list_map[plugin_id]["id"]);
  modal.find('.modal-title').text('Plugin: ' + plugin_list_map[plugin_id]["Name"]);
  modal.find('.plugin-name').val(plugin_list_map[plugin_id]["Name"]);
  modal.find('.plugin-state').val(plugin_list_map[plugin_id]["State"]);
  modal.find('.plugin-ports').val(plugin_list_map[plugin_id]["ExternalPorts"].join(ITEM_SPLITTER));
  modal.find('.plugin-iports').val(plugin_list_map[plugin_id]["InternalPorts"].join(ITEM_SPLITTER));
  modal.find('.plugin-interface').val(plugin_list_map[plugin_id]["Interface"]);
  modal.find('.plugin-desired').val(plugin_list_map[plugin_id]["DesiredState"]);
  modal.find('.plugin-env').val(plugin_list_map[plugin_id]["Environment"].join(ITEM_SPLITTER));
  modal.find('.plugin-os').val(plugin_list_map[plugin_id]["OS"]);
});