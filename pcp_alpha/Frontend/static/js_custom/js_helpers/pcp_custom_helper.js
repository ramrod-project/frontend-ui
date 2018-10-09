/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp where helper functions can be developed here for all js files.
-----------------------------------------------------------------------------------------------------
*/

function date_time_test(date_param){
    var _dt = new Date(Number(date_param)),
        display_date = $.datepicker.formatDate('mm/dd/yy ', _dt);
    display_date += ("0" + _dt.getHours()).slice(-2);
    display_date += ":";
    display_date += ("0" + _dt.getMinutes()).slice(-2);
    display_date += ":";
    display_date += ("0" + _dt.getSeconds()).slice(-2);
    return display_date;
}
