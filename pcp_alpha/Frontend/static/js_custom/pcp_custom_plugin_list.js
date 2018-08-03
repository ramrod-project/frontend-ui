// This file relates to plugin list on the right side panel

function display_plugin_list(plugin_data, plugin_index){
    var plugin_list_dom = $(".plugin_list_display");
    plugin_list_dom
        .append($("<li/>").attr({"class": "plugin_button"})
            .append($("<div/>")
                .attr({"class": "form-group pcp_div_custom"})
                .append($("<label/>")
                    .attr({"class": "control-sidebar-subheading"})
                    // Modal form when plugin name is clicked on, and passing plugin id
                    .append($("<a/>").attr({
                                            "style": "color:white;",
                                            "href": "/update_plugin/"+plugin_data['id']+"/"}).text(plugin_data['Name'])
                        .append("&emsp;&emsp;&emsp;")
                        .append($("<a/>")
                            .attr({"href": "#",
                                "id": "restart_button"+plugin_index,
                                "class":"btn btn-social-icon btn-pcp_button_color1 btn-xs",
                                "data-toggle": "tooltip",
                                "title": "Restart  "+plugin_data['Name']})
                            .append($("<i/>")
                                .attr({"id": "restart_button_two"+plugin_index ,"class": "fa fa-refresh"})
                            )
                        )
                        .append("&nbsp;")
                        .append($("<a/>")
                            .attr({"href": "#",
                                "id": "stop_button"+plugin_index,
                                "class":"btn btn-social-icon btn-google btn-xs",
                                "data-toggle": "tooltip",
                                "title": "Stop  "+plugin_data['Name']})
                            .append($("<i/>")
                                .attr({"id": "stop_button_two"+plugin_index ,"class": "fa fa-hand-stop-o"})
                            )
                        )
                    )
                )
            )
        );
}

function get_plugin_list(){
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
        for (var count=0; count<data.length; count++){
            display_plugin_list(data[count], count);
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
    // Show and hide restart and stop buttons
    $(document).on('mouseenter', '.plugin_button', function () {
        $(this).find(".btn-google").show();
        $(this).find(".btn-pcp_button_color1").show();

    }).on('mouseleave', '.plugin_button', function () {
        $(this).find(".btn-google").hide();
        $(this).find(".btn-pcp_button_color1").hide();
    });
});
