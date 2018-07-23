$(document).ready(function() {
    /*
    Below populate_file_listing() was commented out because
    it was duplicating two file lists
    */

    // populate_file_listing();

    $("#fg_name_help").hide();
    $("#plugin_name").change(verify_name);
    $("#plugin_name").keyup(verify_name);

    $("#fg_location_help").hide();
    $("#location_num").change(verify_location);
    $("#location_num").keyup(verify_location);

    $("#fg_port_help").hide();
    $("#port_num").change(verify_port);
    $("#port_num").keyup(verify_port);

    $("#fg_optional_help").hide();
    $("#optional_char").change(verify_optional);
    $("#optional_char").keyup(verify_optional);

    $("#add_target_submit").mouseover(verify_all);
    verify_all();
});

var ipv4_rgx = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
var ipv6_rgx = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/
var name_rgx = /[0-9a-zA-Z_]{3,100}/;
var port_rgx = /\d{2,4}/;
var optl_rgx = /.{0,100}/;

function verify_optional(){
    var optional_char = $("#optional_char");
    var content = optional_char[0].value;
    if(!optl_rgx.test(content)){
        $("#fg_optional").addClass("has-error");
        $("#fg_optional_help").show();
        $("#add_target_submit")[0].disabled = true;
    } else {
        $("#fg_optional").removeClass("has-error");
        $("#fg_optional_help").hide();
        $("#add_target_submit")[0].disabled = false;
    }
    return ! $("#add_target_submit")[0].disabled;
}

function verify_port(){
    var port_num = $("#port_num");
    var content = port_num[0].value;
    if(!port_rgx.test(content)){
        $("#fg_port").addClass("has-error");
        $("#fg_port_help").show();
        $("#add_target_submit")[0].disabled = true;
    } else {
        $("#fg_port").removeClass("has-error");
        $("#fg_port_help").hide();
        $("#add_target_submit")[0].disabled = false;
    }
    return ! $("#add_target_submit")[0].disabled;
}

function verify_name(){
    var plugin_name = $("#plugin_name");
    var content = plugin_name[0].value;
    if(!name_rgx.test(content)){
        $("#fg_name").addClass("has-error");
        $("#fg_name_help").show();
        $("#add_target_submit")[0].disabled = true;
    } else {
        $("#fg_name").removeClass("has-error");
        $("#fg_name_help").hide();
        $("#add_target_submit")[0].disabled = false;
    }
    return ! $("#add_target_submit")[0].disabled;
}

function verify_location(){
    var location_box = $("#location_num");
    var content = location_box[0].value;
    if(!ipv4_rgx.test(content) && !ipv6_rgx.test(content)){
        $("#fg_location").addClass("has-error");
        $("#fg_location_help").show();
        $("#add_target_submit")[0].disabled = true;
    } else {
        $("#fg_location").removeClass("has-error");
        $("#fg_location_help").hide();
        $("#add_target_submit")[0].disabled = false;
    }
    return ! $("#add_target_submit")[0].disabled;
}

function verify_all(){
    if (!verify_name() || !verify_location() || !verify_name() || !verify_optional()){
        $("#add_target_submit")[0].disabled = true;
    } else {
        $("#add_target_submit")[0].disabled = false;
    }
    return ! $("#add_target_submit")[0].disabled
}