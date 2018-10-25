/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp for logs specifically the logs page using javascript.
-----------------------------------------------------------------------------------------------------
*/

var increment_num = 0;
var log_datatable_id = 0;


var LOGS_DATA_TABLE = $('#logs_table').DataTable({
    searching: false,
    'createdRow': function( row, data, dataIndex ) {
        $(row).eq(0).attr('id', log_datatable_id);
        log_datatable_id++;
    },
});

function update_logs_data_table(param_ts, param_sh, param_sc, param_ll, param_lm){
    if(param_sh === undefined){
        param_sh = "";
    }
    if(param_ll === undefined){
        param_ll = "";
    }
    LOGS_DATA_TABLE.row.add([date_time_test(param_ts), param_sh, param_sc, param_ll, param_lm]).draw( false );
    data_logs_limit(LOGS_DATA_TABLE);
}

function logs_change_ws_callback(message){
    var log_data_js = JSON.parse(message.data);
    update_logs_data_table(
        log_data_js.rt,
        log_data_js.shost,
        log_data_js.sourceServiceName,
        log_data_js.Severity,
        log_data_js.msg
    );
    // update the right side panel
    var message_data = message.data;
    if(message_data.includes("{") && log_data_js.Severity >= 30){
        sidebar_log_list("danger", sidebar_log_prep(message_data));
    }
}

function data_logs_limit(log_data){
    if(log_data.data().length > 3000) {
        LOGS_DATA_TABLE.row("#"+increment_num).remove().draw();
        increment_num++;
    }
}

$(document).ready(function() {
    get_data_logs("logs");
} );
