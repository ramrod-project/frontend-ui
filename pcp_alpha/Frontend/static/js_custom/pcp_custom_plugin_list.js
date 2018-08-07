// This file relates to plugin list on the right side panel

var plugin_list_map = {};

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
    plugin_list_refresh.addClass("fa-spin");
    $.ajax({
        type: "GET",
        url: "/get_plugin_list/",
        datatype: 'json',
        success: function(data) {
            plugin_list_dom.empty();
            plugin_list_map = {};
            for (var count=0; count<data.length; count++){
                plugin_list_map[data[count]['id']] = data[count];
                display_plugin_list(data[count], count);
                $("#activate_button"+count).hide();
                $("#restart_button"+count).hide();
                $("#stop_button"+count).hide();
            }
            plugin_list_refresh.removeClass("fa-spin");
        },
        error: function (data) {
            console.log("ERROR @ get_plugin_list function");
            plugin_list_refresh.removeClass("fa-spin");
        }
    });
}

$(document).ready(function() {
    // refresh button to refresh plugin list
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
  var button = $(event.relatedTarget);  // Button that triggered the modal
  var plugin_id = button.data('whatever');  // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this);
  modal.find('.modal-title').text('Plugin: ' + plugin_list_map[plugin_id]["Name"]);
  modal.find('.plugin-state').val(plugin_list_map[plugin_id]["State"]);
  modal.find('.plugin-ports').val(plugin_list_map[plugin_id]["ExternalPorts"].join());
  modal.find('.plugin-interface')
      .append($("<option/>")
          .attr({"selected": true})
          .val(plugin_list_map[plugin_id]["Interface"])
          .text(plugin_list_map[plugin_id]["Interface"])
      );
  modal.find('.plugin-os').val(plugin_list_map[plugin_id]["OS"]);
});