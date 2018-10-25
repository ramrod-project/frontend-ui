/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp any js file that needs anything related to logs.
-----------------------------------------------------------------------------------------------------
*/
function right_side_panel_log_msg_format(rt, sh, ss, sev, msg){
    var bp = "<br/>";
    return "RT: "+ rt + bp +
        "SourceHost: "+ sh + bp +
        "SourceServiceName: "+ ss + bp +
        "Severity: "+ sev + bp +
        "Message: "+ msg;
}

function get_data_logs(page_location="home"){
    $.ajax({
        type: "GET",
        url: "/logs_data/",
        datatype: 'json',
        success: function(data){
            for (var count=0; count<data.length; count++){
                if (data[count].Severity >= 30 || data[count].Severity === undefined) {
                    sidebar_log_list("danger",
                    right_side_panel_log_msg_format(date_time_test(data[count].rt),
                        data[count].shost,
                        data[count].sourceServiceName,
                        data[count].Severity,
                        data[count].msg
                    )
                    );
                }

                if (page_location === "logs"){
                    update_logs_data_table(
                        data[count].rt,
                        data[count].shost,
                        data[count].sourceServiceName,
                        data[count].Severity,
                        data[count].msg
                    );
                }
            }
        },
        error: function(data){
            console.log("Error @ get_data_logs");
        }
    });
}

function sidebar_log_prep(message){
    var log_data_js = JSON.parse(message);
    return right_side_panel_log_msg_format(date_time_test(log_data_js.rt),
        log_data_js.shot,
        log_data_js.sourceServiceName,
        log_data_js.Severity,
        log_data_js.msg
    );
}
