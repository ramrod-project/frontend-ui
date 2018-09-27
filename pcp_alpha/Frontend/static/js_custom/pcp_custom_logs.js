/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp for logs using javascript.
-----------------------------------------------------------------------------------------------------
*/
var LOGS_DATATABLE = $('#logs_table').DataTable({
    searching: false
});

function update_logs_data_table(counter, param_ts, param_sh, param_sc, param_ll, param_lm){
    var _dt = new Date(Number(param_ts));
    var display_date = $.datepicker.formatDate('mm/dd/yy ', _dt);
    display_date += ("0" + _dt.getHours()).slice(-2);
    display_date += ":";
    display_date += ("0" + _dt.getMinutes()).slice(-2);
    display_date += ":";
    display_date += ("0" + _dt.getSeconds()).slice(-2);

    LOGS_DATATABLE.row.add([display_date, param_sh, param_sc, param_ll, param_lm]).draw( false );
}


function get_data_logs(){
    $.ajax({
        type: "GET",
        url: "/logs_data/",
        datatype: 'json',
        success: function(data){
            console.log("Success @ get_data_logs");
            for (var count=0; count<data.length; count++){
                update_logs_data_table(count,
                                       data[count].rt,
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
    // var logs_datatable_var = $('#logs_table').DataTable({
    //     searching: false
    // });
    get_data_logs();
} );
