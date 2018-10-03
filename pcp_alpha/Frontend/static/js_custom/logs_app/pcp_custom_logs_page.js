/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp for logs specifically the logs page using javascript.
-----------------------------------------------------------------------------------------------------
*/

var LOGS_DATA_TABLE = $('#logs_table').DataTable({
    searching: false
});

function update_logs_data_table(param_ts, param_sh, param_sc, param_ll, param_lm){
    LOGS_DATA_TABLE.row.add([date_time_test(param_ts), param_sh, param_sc, param_ll, param_lm]).draw( false );
}

function logs_change_ws_callback(message){
    var log_data_js = JSON.parse(message.data);
    update_logs_data_table(log_data_js.rt,
                           log_data_js.shost,
                           log_data_js.sourceServiceName,
                           log_data_js.Severity,
                           log_data_js.msg
    );
    // update the right side panel
    var message_data = message.data;
    if(message_data.includes("{")){
        sidebar_log_list("danger", sidebar_log_prep(message_data));
    }
}

$(document).ready(function() {
    get_data_logs("logs");
} );
