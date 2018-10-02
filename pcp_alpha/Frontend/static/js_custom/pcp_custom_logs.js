/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp for logs using javascript.
-----------------------------------------------------------------------------------------------------
*/
var LOGS_DATA_TABLE = $('#logs_table').DataTable({
    searching: false
});

function update_logs_data_table(param_ts, param_sh, param_sc, param_ll, param_lm){
    var _dt = new Date(Number(param_ts));
    var display_date = $.datepicker.formatDate('mm/dd/yy ', _dt);
    display_date += ("0" + _dt.getHours()).slice(-2);
    display_date += ":";
    display_date += ("0" + _dt.getMinutes()).slice(-2);
    display_date += ":";
    display_date += ("0" + _dt.getSeconds()).slice(-2);

    LOGS_DATA_TABLE.row.add([display_date, param_sh, param_sc, param_ll, param_lm]).draw( false );
}

function logs_change_ws_callback(message){
    var log_data_js = JSON.parse(message.data);
    update_logs_data_table(log_data_js.rt,
                           log_data_js.shost,
                           log_data_js.sourceServiceName,
                           log_data_js.Severity,
                           log_data_js.msg
    );
}


function get_data_logs(){
    $.ajax({
        type: "GET",
        url: "/logs_data/",
        datatype: 'json',
        success: function(data){
            for (var count=0; count<data.length; count++){
                update_logs_data_table(data[count].rt,
                                       data[count].shost,
                                       data[count].sourceServiceName,
                                       data[count].Severity,
                                       data[count].msg);
            }
        },
        error: function(data){
            console.log("Error @ get_data_logs");
        }
    });
}


$(document).ready(function() {
    get_data_logs();
} );
