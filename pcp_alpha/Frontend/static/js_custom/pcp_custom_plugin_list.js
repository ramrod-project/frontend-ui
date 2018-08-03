// This file relates to plugin list on the right side panel

function display_plugin_list(plugin_data){
    var plugin_list_dom = $(".plugin_list_display");
    plugin_list_dom
    .append($("<li/>")
        .append($("<div/>")
            .attr({"class": "form-group pcp_div_custom"})
            .append($("<label/>")
                .attr({"class": "control-sidebar-subheading"})
                .append($("<a/>").attr({"style": "color:white;",
                                        "onmouseover": "this.style.color='aqua'" ,
                                        "onmouseout":"this.style.color='white'",
                                        "href": "#"}).text(plugin_data['Name'])
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
            display_plugin_list(data[count]);
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
});
