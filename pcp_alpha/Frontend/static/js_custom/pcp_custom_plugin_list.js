// This file relates to plugin list on the right side panel


//See The Brain Documentation
var PLUGIN_STATE = "State";
var PLUGIN_DESIRED_STATE = "DesiredState";
var PLUGIN_OS = "OS";
var PLUGIN_NAME = "Name";
var PLUGIN_INTERFACE = "Interface";
var PLUGIN_EXTERNAL_PORTS = "ExternalPorts";
var PLUGIN_INTERNAL_PORTS = "InternalPorts";

var BLANK_PLUGIN = {
    "id": "NEW",
    PLUGIN_NAME: "Name",
    PLUGIN_STATE: "",
    PLUGIN_DESIRED_STATE: "Activate",
    PLUGIN_OS: "all",
    PLUGIN_INTERFACE: "",
    PLUGIN_EXTERNAL_PORTS: [],
    PLUGIN_INTERNAL_PORTS: []
};

var plugin_list_map = {};
var interfaces = [];
var plugin_names = [];



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
    var plugin_list_dom = $(".plugin_list_display");
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
                        .text(plugin_data['Name']))
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
    plugin[PLUGIN_EXTERNAL_PORTS] =  $("#plugin-external-ports").val().split();
    plugin[PLUGIN_NAME] = $("#plugin-name").val();
    plugin[PLUGIN_INTERFACE] = $("#plugin-interface").val();
    plugin[PLUGIN_OS] = $("#plugin-os").val();
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


$(document).ready(function() {
    // refresh button to refresh plugin list
    $("#plugin-save").click(onclick_plugin_save);
    $("#plugin_list_refresh").click(get_plugin_list);

    get_plugin_list();
    // Show and hide restart and stop buttons
    $(document).on('mouseenter', '.plugin_button', function () {
        $(this).find(".btn-google").show();
        $(this).find(".btn-pcp_button_color1").show();
        $(this).find(".btn-pcp_button_color2").show();

    }).on('mouseleave', '.plugin_button', function () {
        $(this).find(".btn-google").hide();
        $(this).find(".btn-pcp_button_color1").hide();
        $(this).find(".btn-pcp_button_color2").hide();
    });
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
  modal.find('.plugin-state').val(plugin_list_map[plugin_id]["State"]);
  modal.find('.plugin-ports').val(plugin_list_map[plugin_id]["ExternalPorts"].join());
  modal.find('.plugin-iports').val(plugin_list_map[plugin_id]["InternalPorts"].join());
  modal.find('.plugin-interface').val(plugin_list_map[plugin_id]["Interface"]);
  modal.find('.plugin-os').val(plugin_list_map[plugin_id]["OS"]);
});