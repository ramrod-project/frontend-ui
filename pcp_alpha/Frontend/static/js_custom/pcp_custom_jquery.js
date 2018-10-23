/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp to add jquery functionality and other javascript resources.
-----------------------------------------------------------------------------------------------------
*/
var MAX_MANUAL_CHECK_COUNT = 30;
var INITIAL_JOB_STATUS = "Waiting";
var JOB_CAN_TERMINATE = {"Waiting":true, "Ready":true};
var JOB_CAN_NOT_TERMINATE = {"Pending":true, "Active":true};
var inc = 0;
var hover_int = 0;
var active_sequence = "1";
var sequences = {"1": new Set()};
var sequence_starttime_map = {"1":  Math.floor((new Date().valueOf())/1000).toString()};
var sequence_expiretime_map = {"1": undefined};
var id_map = {};
var id_status_map = {};
var status_deferred_updates = [];
var id_reverse_map = {};
var id_replication_map = {};
var target_id_map = {};
var current_plugin_commands = [];
var current_saved_commands = {};
var current_selected_plugin = "";
var ws_map = {};
var exec_int = 0;
var job_select_table;
var ignoreScrollEvents = false;
var w3_highlighted_row,
    w3_content_index,
    w3_highlighted_array = [],
    as_highlighted_checker = {},
    start_timer_interval,
    countdown_map = {},
    start_timer_map = {};
var scroll_position = 0,
    scroll_checker = 0;
var num_jobs_to_ex = [];
var job_row_checker = 0;
var debug_msg_checker = 0;

var timer_on = 1,
    time_var,
    test_server = 'ws://' + window.location.hostname + ':3000/monitor',
    test_ws = new WebSocket(test_server);
as_highlighted_checker[active_sequence] = 0;


$(document).ready(function() {
    // W4 header height === W4 header height
    var w3_header_height = $("div.box-header.w3_header_class").height();
    $("div.box-header.w4_header_class").height(w3_header_height);

    // If w3 and w4 have scroll bars, they will be in synch together
    // syncScroll($("#w3TableScroll"), $("#w4TableScroll"));
    // syncScroll($("#w4TableScroll"), $("#w3TableScroll"));

    //W2 Saver
    close_command_loader();
    $("#w2toss_button").click(close_command_loader);
    $("#w2_up_check_button").click(save_command_by_name);
    //$("#w2_dn_check_button").click(load_command_by_name);
    $("#w2_persist_button").click(save_command_to_cloud);
    $("#w2_loader_button").click(load_command_from_cloud);

    //W3 Saver
    $("#w3_current_selector").hide();
    $("#w3_dn_check_button").hide();
    $("#w3_up_check_button").hide();
    $("#w3toss_button").hide();
    $("#w3_selector_loading").hide();
    $("#w3_namer").hide();
    $("#w3toss_button").click(close_state_loader);
    $("#w3_up_check_button").click(save_job_state_by_name);
    $("#w3_dn_check_button").click(load_job_state_by_name);


    $("#terminal-save").click(onclick_terminal_submit);
    $("#terminal-cmd").keyup(function(e){
        if(e.keyCode == 13) {
            onclick_terminal_submit();
        }
    });
    $(".terminal_opener_sc").click(function(event){
        var row_id = get_number_from_id(this.id, "open_terminal_id");
        var target_js = $("#nameidjson"+row_id);
        console.warn(target_js.text());
    });
    $('#terminal-modal').on('show.bs.modal', terminal_opener);
    $("#terminal-modal").on("shown.bs.modal", terminal_opened);
    job_select_table = $('#job_table').DataTable({
	    searching: false,
	    paging: false,
	    bInfo: false,
        ordering: false,
        select: true
    });

    ex_seq_unselect();

    ws_map["status"] = open_websocket("status", status_change_ws_callback);
    ws_map["files"] = open_websocket("files", files_change_ws_callback);
    ws_map['plugins'] = open_websocket("plugins", plugins_change_ws_callback);
    ws_map['telemetry'] = open_websocket("telemetry", telemetry_change_ws_callback);
    ws_map['logs'] = open_websocket("logs", logs_change_ws_callback);
    start_ping_pong();

    $("#upload_files_need_refreshed").hide();


    clear_new_jobs();
    synchronize_job_sequence_tabs(active_sequence);
	$("tr td.clickable-row-col1").click(get_commands_func);   // displays commands in w2
	$("tr td.clickable-row-col2").click(get_commands_func);   // displays commands in w2
	$("tr td.clickable-row-col3").click(get_commands_func);   // displays commands in w2
	$("tr td span a.btn-linkedin").click(add_target_to_job_sc_button);  // target to job shortcut button

	var target_row_selection = $('#target_table').DataTable({  //for w1+w3
	    searching: false,
	    paging: false,
	    bInfo: false,
        columnDefs: [
            { type: 'natural-nohtml', targets: [0, 1] }
        ],
        rowReorder: true,
        select: true                                    // highlight target row in w1
	});

    target_row_selection.on('select', function(e, dt, type, indexes) {  // user clicks on target row to start drag
        var selected_var = $(".gridSelect tbody tr.selected");
        if(selected_var.length > 0){
            drag_target();
        }
    });

    // Date Time picker
    $("#job_sequence_timer").datetimepicker({
                                             minDate: new Date(),
                                             onClose: function(dateText, inst) {
                                                 var py_dt = datetext_to_unix_time(dateText);
                                                 $("#job_sequence_time_unix")[0].value = py_dt;
                                                 sequence_starttime_map[active_sequence] = py_dt;
                                             },
                                             onSelect: function (selectedDateTime){
                                             }});
    $("#job_sequence_expire").datetimepicker({
                                             minDate: new Date(),
                                             onClose: function(dateText, inst) {
                                                 var py_dt = datetext_to_unix_time(dateText);
                                                 $("#job_sequence_expire_unix")[0].value = py_dt;
                                                 sequence_expiretime_map[active_sequence] = py_dt;
                                             },
                                             onSelect: function (selectedDateTime){
                                             }});
    var startup_date = new Date();
    $("#job_sequence_time_unix")[0].value = Math.floor(startup_date.getTime()/1000).toString();
    $("#job_sequence_timer").datepicker( "setDate", startup_date );
    var startup_expire = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000); //72 hours in future
    $("#job_sequence_expire_unix")[0].value = Math.floor(startup_expire.getTime()/1000).toString();
    $("#job_sequence_expire").datepicker( "setDate", startup_expire );
    sequence_expiretime_map[active_sequence] = $("#job_sequence_expire_unix")[0].value;

    $("#truncate_output_to").change(change_truncate_value);
    change_truncate_value();

	$("#addjob_button").click(add_new_job);               // add new job in w3
    $("#addjob_top_button").click(add_new_job);               // add new job in w3
	$("#clear_buttonid").click(clear_new_jobs);           // clear content in w3
	$("#execute_button").click(execute_sequence);         // execute sequence button in 23
    $("#w3_drop_to_all").attr({"ondrop": "drop_command_to_multiple(event)",
                               "ondragover": "allowDropCommand(event)"});
    $("#nooo_id").click(easter_egg_one);           // nooo audio
    $("#searchNameHere_id").change(filter_w1);
    $("#searchNameHere_id").keyup(filter_w1);
    $("#w1_command_active_filter").css("display", "none");

    $("#searchCommand_id")[0].value = "";
    $("#searchCommand_id").change(filter_w2);
    $("#searchCommand_id").keyup(filter_w2);
    $("#w2_command_active_filter").css("display", "none");

    $("#new_jobq_button").click(add_sequence_tab);
    $("#clear_seq_buttonid").click(hide_current_sequence);
    $("#persist_button").click(save_job_state);
    $("#loader_button").click(load_job_state);
    generate_target_id_map();
    $("#w3_drop_target_to_all").droppable({
        drop: function (event, ui){
            var selected_var = ui.helper.children();
            if (selected_var.length == 1){
                var num_jobs = $("#addjob_button")[0].value;
                for (var i=1; i<=num_jobs; i++){
                    if (($("#jobrow"+i).css("display") != "none") && job_row_is_mutable(i)) {
                        var row_id = selected_var[0].id;
                        var row_id_str = row_id.substring(10,row_id.length);
                        var row_js_str = $("#nameidjson" + row_id_str)[0].innerText;
                        var row_js = JSON.parse(row_js_str);
                        drop_target_into_job_row(i.toString(), row_js, row_js_str);
                    }
                }
                set_w3_job_status();
                $('.selected');
            }
        }
    });
    get_data_logs("home");

});

function sidebar_log_list(param_type, notification_msg){
    var wrapper_height = $("#content-wrapper-id").height();
    var log_header_height =- $("#debug_sidebar_id ").height();
    var sub_height = $(".main-header").height() + $("#sidebar-tabs-id").height() +
        log_header_height + $(".control-sidebar-heading").height(); // which is 120
    var sidebar_max_height = wrapper_height - sub_height;
    $("#div-sidebar-log-id").css({'max-height': ''+sidebar_max_height,
        'overflow': 'auto',
        'overflow-x': 'hidden'});
    if(param_type === "danger"){
        debug_msg_checker++;
        $("#control-sidebar-menu-id")
            .prepend($("<li/>")
                .append($("<a/>")
                    .attr({"href": "javascript:;"})
                    .append($("<h4/>")
                        .attr({"class": "control-sidebar-subheading"})
                        .text("Message "+debug_msg_checker))
                    .append($("<h4/>")
                        .attr({"class": "control-sidebar-subheading"})
                        .append($("<p/>")
                            .html(notification_msg)))));

    }
    // if the length is more than 10 start deleting the first index
    var log_list_len = $("#control-sidebar-menu-id.control-sidebar-menu li").length;
    var log_list_id = $("#control-sidebar-menu-id");
    if (log_list_len > 10){
        // start deleting the older messages
        log_list_id[0].children[10].remove();
    }
}

function notification_function(msg1, msg2, msg3 = "directed to Job #", param_type="info"){
    var notification_msg = msg1 + " " + msg3 + " " + msg2;
    $.notify({
        // options
        icon: 'glyphicon glyphicon-warning-sign',
        title: 'PCP Notification: ',
        message: notification_msg,
        // url: 'https://github.com/mouse0270/bootstrap-notify',
        target: '_blank'
    },{
        // settings
        element: 'body',
        position: null,
        type: param_type,
        allow_dismiss: true,
	    newest_on_top: false,
        showProgressbar: false,
        placement: {
            from: "top",
            align: "right"
	    },
        offset: 20,
        spacing: 10,
        z_index:1031,
        delay: 4000,
        timer: 1000,
        url_target: '_blank',
        mouse_over: null,
        animate: {
            enter: 'animated bounceInLeft',
            exit: 'animated bounceOutRight'
        },
        onShow: null,
        onShown: null,
        onClose: null,
        onClosed: null,
        icon_type: 'class',
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<span data-notify="icon"></span> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
    sidebar_log_list(param_type, notification_msg);
}

function unselect_job_row(job_num, param2=1){
    var job_row_var = $("#jobrow"+job_num);
    if ($("#jobrow"+job_num).hasClass('selected')){
        $("#jobrow"+job_num).removeClass('selected');
        // remove selected and from the selected list
        var w3_content_row = w3_highlighted_array.indexOf(job_row_var[0].rowIndex);
        if(w3_content_row > -1){
            w3_highlighted_array.splice(w3_content_row, 1);
        }
        if(param2 !== 1){
            ex_seq_unselect(0);
        }
    }
}

function ex_seq_unselect(param=1){
    // once sequence is executed it will
    // de-select all job rows if selected.
    if (param ===1){
        $('#job_table tbody').off('click');
        $('#job_table tbody').on( 'click', 'tr', function () {
            var row_index = $(this)[0].rowIndex;
            w4_output_collapse2(row_index);
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
                w3_content_index = w3_highlighted_array.indexOf($(this)[0].rowIndex);
                if (w3_content_index > -1){
                    w3_highlighted_array.splice(w3_content_index, 1);
                    as_highlighted_checker[active_sequence] = 0;
                }

            }
            else {
                job_select_table.$("tr.selected").removeClass('selected');
                $(this).addClass('selected');
                w3_highlighted_row = $(this)[0].rowIndex;
                w3_highlighted_array.push(w3_highlighted_row);
                as_highlighted_checker[active_sequence] = 1;
            }
        });
    } else {
        $('#job_table tbody').off('click');
    }
}

function datetext_to_unix_time(dateText){
     var date_split = dateText.split(" ");
     var mdy = date_split[0].split("/");
     var hm = date_split[1].split(":");
     var dt_obj = new Date(Number(mdy[2]),
                           Number(mdy[0])-1,
                           mdy[1],
                           hm[0],
                           hm[1], 0, 0);
     var py_dt = Math.floor(dt_obj.getTime()/1000).toString();
     return py_dt;
}
$(window).scroll(function () {
    var current_scroll_pos = $(this).scrollTop();
    scroll_checker = current_scroll_pos;
    if (current_scroll_pos > scroll_position && $("#tooltipColumn").hasClass("fixed_tooltip")) {
        //Scrolling
        $("#tooltipColumn").removeClass("fixed_tooltip");
    }
});
function fixed_tooltip(){
    if(scroll_checker === 0 && $("#preToolTipContent")[0]){
        $("#tooltipColumn").addClass("fixed_tooltip");
    } else {
        $("#tooltipColumn").removeClass("fixed_tooltip");
    }
}

function generate_target_id_map(){
    var rows = $("#target_box_contentid tr td a span");
    for (var i in rows){
        var row_id = rows[i].id;
        if (row_id !== undefined && row_id.indexOf("nameidjson")!==-1){
            var row_js = JSON.parse(rows[i].innerText);
            var row_num = get_number_from_id(row_id, "nameidjson");
            target_id_map[row_js.id] = row_num;
            render_target_tooltip(row_js)
        }
    }
}

function recursive_pretty_print(obj, depth=0) {
    var result = "";
    for (var key in obj) {
        result = result + Array(depth+1).join("    ");
        if (typeof(obj[key]) == 'object') {
            result = result + key + "\n";
            result = result + recursive_pretty_print(obj[key], depth+1);
        } else {
            result = result + key + ": " + obj[key];
            result = result + "\n";
        }
    }
    return result;
}

function render_target_tooltip(data_js){
    var tooltip_content = recursive_pretty_print(data_js.Optional);
    $("#target_row"+target_id_map[data_js.id])[0].title = tooltip_content;

}
/*
-----------------------------------------------------------------------------------------------------
Websockets functions
-----------------------------------------------------------------------------------------------------
*/
function ws_ping() {
    test_ws.send('__ping__');
    time_var = setTimeout(function () {
        // connection closed, restart web socket
        // console.log("websocket closed");
        ws_map["status"] = open_websocket("status", status_change_ws_callback);
        ws_map["files"] = open_websocket("files", files_change_ws_callback);
        ws_map['plugins'] = open_websocket("plugins", plugins_change_ws_callback);
        ws_map['logs'] = open_websocket("logs", logs_change_ws_callback);
        start_ping_pong();
    }, 5000);
}

function ws_pong() {
    clearTimeout(time_var);
}

function start_ping_pong(){
    test_ws.onopen = function () {
        setInterval(ws_ping, 20000);
    };

    test_ws.onmessage = function (evt) {
        var msg = evt.data;
        if (msg === '__pong__') {
            // console.log("message is pong");
            ws_pong();
            // return;
        }
    }
}

function open_websocket(selection, callback) {
    // Create a new websocket
    var server = 'ws://' + window.location.hostname + ':3000/monitor';
    var ws = new WebSocket(server);
    console.log("Created new websocket to " + server);

    // Handle connection opening
    // Use 'selection' string to select feed
    ws.onopen = function () {
        ws.send(selection);
        console.log("Websocket connected to feed " + selection);
    };

    // receive message
    ws.onmessage = function (message) {
        callback(message);
    };
    return ws;
}

function status_change_update_dom(job_dom_id, status){
    $("#jobstatusid"+job_dom_id).empty();
    $("#jobstatusid"+job_dom_id)
        .append($("<span/>")
            .attr({"class": "label label-"+status})
            .text(status));
    $("#updatestatusid"+job_dom_id).empty();
    $("#updatestatusid"+job_dom_id)
        .append($("<span/>")
            .attr({"class": "label label-"+status})
            .text(status));
    if (status == "Done"){
        execute_sequence_output(id_map[job_dom_id]);
    } else if (status == "Error" || status == "Stopped") {
        clearInterval(start_timer_map[job_dom_id]);
        clearInterval(countdown_map[job_dom_id]);
        $("#update_spin"+job_dom_id).remove();
        $("#updateid"+job_dom_id).empty();
        $("#updateid"+job_dom_id).append($("<span/>").text(status));
    }
}

function status_change_ws_callback(message) {
    var data_list = null;
    var data;
    if ('data' in message && message.data != null && message.data[0] === "[") {
        data_list = JSON.parse(message.data);
        for (var i in data_list){
            data = data_list[i];
            var job_id = null;
            if ("id" in data) {
                job_id = data.id;
                if (job_id in id_reverse_map) {
                    var job_dom_id = id_reverse_map[job_id];
                    id_status_map[job_dom_id] = data.status;
                    status_change_update_dom(job_dom_id, data.status);
                    if(data.status === "Done" || data.status === "Stopped"){
                        $("#stopjob"+job_dom_id).hide();
                        $("#resetjob"+job_dom_id).hide();
                        $("#trashjob"+job_dom_id).show();
                    }
                    else if(data.status === "Error"){
                        $("#stopjob"+job_dom_id).hide();
                        $("#resetjob"+job_dom_id).show();
                    }
                    else if (!(data.status in JOB_CAN_TERMINATE) || !(data.status in JOB_CAN_NOT_TERMINATE)){
                        $("#stopjob"+job_dom_id).hide();
                        $("#resetjob"+job_dom_id).hide();
                    }
                } else {
                    if(exec_int === 1) {
                        status_deferred_updates.push(data);
                    }
                }
            }
        }
    }
}
function respool_deferred_status_changes(){
    var respool = [];
    while (status_deferred_updates.length > 0){
        respool.push(status_deferred_updates.shift())
    }
    status_change_ws_callback({data: JSON.stringify(respool)});
}

function files_change_ws_callback(message){
    if (message.data.length > 0 && message.data[0] === "{"){
        $("#upload_files_need_refreshed").show();
    }

}

function plugins_change_ws_callback(message){
    if (message.data.length > 0 && message.data[0] === "{"){
        $("#plugins_need_refreshed").show();
    }
}
function telemetry_change_ws_callback(message){
    if (message.data.length > 0 && message.data[0] === "{"){
        var data_js = JSON.parse(message.data);
        $("#target_row"+target_id_map[data_js.id])[0].title = recursive_pretty_print(data_js.Optional);
    }
}

function logs_change_ws_callback(message){
    // update the right side panel
    var message_data = message.data;
    if(message_data.includes("{")){
        sidebar_log_list("danger", sidebar_log_prep(message_data));
    }
}

// ** TESTING ONLY **
// Testing the websocket - for job status
function test_ws_callback(message) {
    // console.log(message);
    var data = {};
    if ('data' in message) {
        data = JSON.parse(message.data);
    }
    // console.log(data);
    var job_id = null;
    if ("id" in data) {
        job_id = data.id;
    }
    // console.log(job_id);
    // console.log(id_reverse_map);
    if (job_id in id_reverse_map) {
         console.log("In map!");
    }
}
//ws_map["status"] = open_websocket("status", test_ws_callback);
// ** TESTING ONLY **


/*
-----------------------------------------------------------------------------------------------------
Functions down below are little bunny easter eggs
-----------------------------------------------------------------------------------------------------
*/

function easter_egg_one(){
    var audio_id = document.getElementById("easter_egg_one_id");
    audio_id.play();
}
// function easter_egg_two(){
    // final countdown 5 seconds
// }

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w2
-----------------------------------------------------------------------------------------------------
*/

// List of commands based off of plugin name
var current_command_template = {};

// TODO: Perhaps make one filter function in the future
function filter_w1(){
    var filter_content = $("#searchNameHere_id")[0].value.toLowerCase(),
        filter_display = $("#w1_command_active_filter"),
        to_filter = $("#target_box_contentid tr");

    if (filter_content.length === 0){
        filter_display.css("display", "none");
    } else {
        filter_display.css("display", "");
        filter_display[0].innerText = "Currently filtering on: "+filter_content;
    }

    for (var row_i = 0; row_i < to_filter.length; row_i++){
        var row_id = to_filter[row_i].id.substring(10, to_filter[row_i].id.length),
            target_json = $("#name_tag_id"+row_id+" a span")[0].innerHTML;
        if (target_json.toLowerCase().includes(filter_content)){
            $(to_filter[row_i]).css("display", "");
        } else {
            $(to_filter[row_i]).css("display", "none");
        }
    }
}

function filter_w2() {
    var filter_content = $("#searchCommand_id")[0].value.toLowerCase(),
        filter_display = $("#w2_command_active_filter"),
        to_filter = $(".theContent");

    if (filter_content.length === 0){
        filter_display.css("display", "none");
    } else {
        filter_display.css("display", "");
        filter_display[0].innerText = "Currently filtering on: "+filter_content;
    }

    for (var row_i = 0; row_i < to_filter[0].children.length; row_i++){
        if (current_plugin_commands[row_i].CommandName.toLowerCase().includes(filter_content) ||
            current_plugin_commands[row_i].Tooltip.toLowerCase().includes(filter_content)){
            $(to_filter[0].children[row_i]).css("display", "");
            // if tooltip & box footer was opened before the user was
            // searching the tooltip content & box footer will disappear
            $(".tooltipHeader").empty();
            $(".tooltipContent").empty();
            $(".theContentArgument").empty();
        } else {
            $(to_filter[0].children[row_i]).css("display", "none");
        }
    }
}

function onLoadTest(element, element_two, w2_tooltip=0){
    if (w2_tooltip !== 0){
        $(element).addClass('loaded');
        $(element_two).addClass('loaded');
        $(w2_tooltip).addClass('loaded');
    } else {
        $(element).addClass('loaded');
        $(element_two).addClass('loaded');
    }
}
// abstract this later
// also add animations for top widgets for bottom widgets when minimized
function widget_expand_or_collapse(widget){
    var w1_col_box = $("#w1_box"),
        w2_col_box = $("#w2_box"),
        w3_col_id = $("#w3_collapse_id"),
        w4_col_id = $("#w4_collapse_id"),
        w1_scroll = $(".w1TableScroll"),
        w2_scroll = $(".w2TableScroll"),
        w3_scroll = $("#w3TableScroll"),
        w4_scroll = $("#w4TableScroll"),
        tooltip_scroll = $(".tooltipScroll");

    if (widget === 'w1'){
        if (!w1_col_box.boxWidget()[0].classList.contains('collapsed-box')) {
            w3_scroll.removeAttr('style');
            w4_scroll.removeAttr('style');
            setTimeout(function() {
                onLoadTest(w3_scroll, w4_scroll);
            }, 400);
        } else {
            w3_scroll.removeClass('loaded');
            w4_scroll.removeClass('loaded');
            w3_scroll[0].style.maxHeight = "360px";
            w4_scroll[0].style.maxHeight = "360px";
        }
    } else if (widget === 'w2') {
        if (!w2_col_box.boxWidget()[0].classList.contains('collapsed-box')) {
            w3_scroll.removeAttr('style');
            w4_scroll.removeAttr('style');
            setTimeout(function() {
                onLoadTest(w3_scroll, w4_scroll);
            }, 400);
        } else {
            w3_scroll.removeClass('loaded');
            w4_scroll.removeClass('loaded');
            w3_scroll[0].style.maxHeight = "360px";
            w4_scroll[0].style.maxHeight = "360px";
        }
    } else if (widget === 'w3') {
        if(w3_col_id[0].children[0].classList[1] !== "fa-minus") {
            w1_scroll.removeAttr('style');
            w2_scroll.removeAttr('style');
            tooltip_scroll.removeAttr('style');
            setTimeout(function() {
                onLoadTest(w1_scroll, w2_scroll, tooltip_scroll);
            }, 500);
        }
        else if(w3_col_id[0].children[0].classList[1] === "fa-minus") {
            w1_scroll.removeClass('loaded');
            w2_scroll.removeClass('loaded');
            tooltip_scroll.removeClass('loaded');
            w1_scroll[0].style.maxHeight = "360px";
            w2_scroll[0].style.maxHeight = "360px";
            tooltip_scroll[0].style.maxHeight = "280px";
        }
    } else if (widget === 'w4'){
        if(w4_col_id[0].children[0].classList[1] !== "fa-minus") {
            w1_scroll.removeAttr('style');
            w2_scroll.removeAttr('style');
            tooltip_scroll.removeAttr('style');
            setTimeout(function() {
                onLoadTest(w1_scroll, w2_scroll, tooltip_scroll);
            }, 500);
        }
        else if(w4_col_id[0].children[0].classList[1] === "fa-minus") {
            w1_scroll.removeClass('loaded');
            w2_scroll.removeClass('loaded');
            tooltip_scroll.removeClass('loaded');
            w1_scroll[0].style.maxHeight = "360px";
            w2_scroll[0].style.maxHeight = "360px";
            tooltip_scroll[0].style.maxHeight = "280px";
        }
    }
}

// W3 and W4 internal collapse buttons
function bw_collapse_buttons(w3_col_id, w4_col_id){
    if (w4_col_id[0].children[0].className !== "fa fa-plus" ||
        w3_col_id[0].children[0].className !== "fa fa-plus"){

        w3_col_id[0].children[0].className = "fa fa-plus";
        w4_col_id[0].children[0].className = "fa fa-plus";
    } else {
        w3_col_id[0].children[0].className = "fa fa-minus";
        w4_col_id[0].children[0].className = "fa fa-minus";
    }
}

// Collapse buttons for top widgets
function synch_widget_collapse(widget){
    var w3_col_id = $("#w3_collapse_id"),
        w4_col_id = $("#w4_collapse_id");
    if (widget === 'w1'){
        $("#w2_box").boxWidget('toggle');
    } else if (widget === 'w2') {
        $("#w1_box").boxWidget('toggle');
    } else if (widget === 'w3') {
        $("#w3_box").boxWidget('toggle');
        $("#w4_box").boxWidget('toggle');
        bw_collapse_buttons(w3_col_id, w4_col_id);
    } else if (widget === 'w4'){
        $("#w4_box").boxWidget('toggle');
        $("#w3_box").boxWidget('toggle');
        bw_collapse_buttons(w3_col_id, w4_col_id);
    }
    widget_expand_or_collapse(widget);
}


function add_intput_to_command_builder(input_id, input_i, template_key){
    var new_input;
    var new_selector;
    new_input = document.createElement("input");
    // if input.type == file_list
    if (current_command_template[template_key][input_i]['Type'] === 'file_list'){
        var file_list = $(".upload_file_list li div label");
        // file list dropdown
        new_selector = $("<select/>")
            .attr({"class": "form-control mySelect",
                   "style": "width:250px"})
            .attr("id", "argumentid_"+input_id)
            .css("display", "none");

        $("#commandIdBuilder")
            .append($("<div/>")
                .attr({"class": "form-group"})
                .append(new_selector.css("display", "")));

        for (var n=0; n<file_list.length; n++){
            current_command_template[template_key][input_i]['Value'] = file_list[n].innerText;
            $(".mySelect")
                .change(update_argument)
                .append(
                    $("<option/>")
                        .attr("value", file_list[n].innerText)
                        .text(file_list[n].innerText));
        }
    }
    // if input.type == textbox
    else {
        new_input.label = "argumentid_("+input_i+")";
        new_input.id = "argumentid_"+input_id;
        new_input.title = current_command_template[template_key][input_i]["Tooltip"];
        new_input.onchange = update_argument;
        new_input.onkeyup = update_argument;
        new_input.placeholder = current_command_template[template_key][input_i]['Value'];

        var new_input_holder = $("<div/>").append(new_input);
        $("#commandIdBuilder").append(new_input_holder);
        $("#"+new_input.id).tooltip({
                                      classes: {"ui-tooltip": "highlight"},
                                      items: 'span',
                                      position: {
                                        my: "left top",
                                        at: "right+5",
                                        collision: "none"
                                      }
                                    });
    }
}




function get_commands_func(){
    // plugin name the user clicked
    var row_id = $(this)[0].parentElement.id.substring(10, $(this)[0].id.length);
    var plugin_name_var = $("#name_tag_id"+row_id+" a span")[1].innerText;
    current_selected_plugin = plugin_name_var;
    var check_content_var = false;
    var quick_action_button;
    var argid = 0;
    if ($("#tooltipColumn").hasClass("fixed_tooltip")) {
        $("#tooltipColumn").removeClass("fixed_tooltip");
    }
    close_command_loader();
    $.ajax({
        type: "GET",
        url: "/action/get_command_list/",
        data: {"plugin_name": plugin_name_var},
        datatype: 'json',
        success: function(data) {
            // check if w2 should re-render or not
            current_plugin_commands = data;
            if($(".theContent li a").length > 0 && $(".theContent li a").length === data.length){
                for(var int = 0; int < $(".theContent li a").length; int++){
                    if(data[0].CommandName == $(".theContent li a")[int].text){
                        check_content_var = true;
                    }
                }
            }
            // empty content in w2 if different plugin name was clicked previously
            if (!check_content_var){
                $(".tooltipHeader").empty();
                $(".tooltipContent").empty();
                $(".theContentArgument").empty();
            }

        	$("#theContent").empty();

            // display command(s) in w2
            if (data.length == 1){
                $(".theContent").append($("<li/>").text(data));
            } else {  // no commands for plugin
                for(var i = 0; i < data.length; i++) {
                    $(".theContent")
                        .append($("<li id='commandid' class='commandclass' onclick='#'/>")
                            .append($("<a/>")
                                .attr({"id": "acommandid"+(i+1), "class": "acommandclass", "href": "#"})
                                .text(data[i].CommandName)));
                }
            }
            // $(".theContent")
            //     .append("<div/>")
            //     .attr({"style": "width:250px"});
            $("#theContentHeader")
                .append("<h2 class='box-title'/>")
                .text(plugin_name_var + "  command list");

            // User selects a command from W2
            $("a.acommandclass").click(function(){
                $("#w2_persist_button").show();
                //Compare user selection of command to query
                for(var i2 = 0; i2 < data.length; i2++) {
                    if(data[i2].CommandName == $(this)[0].text){
                        arg_int = data[i2].Inputs.length;
                        current_command_template = data[i2];
                    }
                }
                //tooltip
                $(".tooltipHeader").empty();
                $(".tooltipHeader")
                    .append($("<p/>")
                        .append($("<b/>")
                            .text("Tooltip:")));
                $(".tooltipContent").empty();
                $("#preToolTipContent").empty();
                $(".tooltipContent")
                    .append("<pre id='preToolTipContent'>" + current_command_template.Tooltip + "</pre>");

                // $("#toolTipTest")
                var header = document.getElementById("toolTipTest");
                var sticky = header.offsetTop;
                  if (window.pageYOffset > sticky) {
                      header.classList.add("sticky");
                  } else {
                      header.classList.remove("sticky");
                  }

                //footer
                $(".theContentArgument").empty();
                $(".theContentArgument")
                    .append($("<div id='commandIdBuilder'/>")
                        .text($(this)[0].text));
                // JSON development data on W2 footer
                $(".theContentArgument")
                    .append($("<div id='JSON_Command_DATA'/>")
                        .addClass("text-muted small")
                        .text(JSON.stringify(current_command_template)));

                // quick action button to add command template to a highlighted job row
                quick_action_button = $("<a/>")
                        .attr({"href": "#",
                            "id": "add_command_to_job_id",
                            "class":"btn btn-social-icon btn-linkedin btn-xs pull-right"})
                        .append($("<i/>").attr({"id": "add_command_to_job_id2" ,"class": "fa fa-tasks"}));
                $("#commandIdBuilder").append(quick_action_button);

                argid = 0;
                for (var input_i = 0; input_i < current_command_template['Inputs'].length; input_i++){
                    add_intput_to_command_builder(argid, input_i, "Inputs");
                    argid = argid + 1;
                }
                for (var input_oi = 0; input_oi < current_command_template["OptionalInputs"].length; input_oi++){
                    add_intput_to_command_builder(argid, input_oi, "OptionalInputs");
                    argid = argid + 1;
                }
                $("a#add_command_to_job_id").click(add_command_to_job_sc_button);  // command to job shortcut button
            });
        },
        error: function (data) {
        	console.warn("ERROR @ get_commands_func function");
        }
    })
}

function update_argument(event){
    var source = event.target || event.srcElement;
    var cmditem = get_number_from_id(source.id, "argumentid_");
    var assumed_input = "Inputs";
    if (Number(cmditem) >= current_command_template[assumed_input].length){
        cmditem = cmditem - current_command_template[assumed_input].length;
        assumed_input = "OptionalInputs";
    }
    console.warn("updating commdn item "+ cmditem);
    current_command_template[assumed_input][cmditem]["Value"] = source.value;
    document.getElementById("JSON_Command_DATA").innerText = JSON.stringify(current_command_template);
}

function close_command_loader(){
    $("#w2_builder").show();
    $("#w2_builder_saved_command_list").hide();
    $("#w2_current_selector").empty();
    $("#w2_current_selector").hide();
    $("#w2_up_check_button").hide();
    $("#w2_dn_check_button").hide();
    $("#w2toss_button").hide();
    $("#w2_selector_loading").hide();
    $("#w2_current_selector").hide();
    $("#w2_namer").hide();
    $(".tooltipHeader").empty();
    $(".theContentArgument").empty();
    $(".tooltipContent").empty();
    $("#w2_save_feedback").hide();
    $("#w2_persist_button").hide();
    $("#w2_loader_button").hide();
    if (current_selected_plugin.length > 0){
        $("#w2_loader_button").show();
    }
}

function load_command_from_cloud(){
    close_command_loader();
    $("#w2toss_button").show();
    $("#w2_builder").hide();
    $("#w2_loader_button").hide();
    $("#w2_builder_saved_command_list").show();
    $(".theContentArgument")
        .append($("<div id='commandIdBuilder'/>"))
        .append($("<div id='JSON_Command_DATA'/>")
            .addClass("text-muted small"));
    $("#savedContent").empty();
    load_command_for_plugin_from_cloud(current_selected_plugin);
}

function render_command_to_json_display(event){
    var source = event.target || event.srcElement;
    var saved_cmd_name = source.innerHTML;
    current_command_template = current_saved_commands[saved_cmd_name];
    var quick_action_button = $("<a/>")
                        .attr({"href": "#",
                            "id": "add_command_to_job_id",
                            "class":"btn btn-social-icon btn-linkedin btn-xs pull-right"})
                        .append($("<i/>").attr({"id": "add_command_to_job_id2" ,"class": "fa fa-tasks"}));
    $("#JSON_Command_DATA").text(JSON.stringify(current_saved_commands[saved_cmd_name]));
    $("#commandIdBuilder").empty();
    $("#commandIdBuilder").text(saved_cmd_name);
    $("#commandIdBuilder").append(quick_action_button);
    $("a#add_command_to_job_id").click(add_command_to_job_sc_button);
}

function render_saved_command_to_dom(saved_command_name){
    var new_cmd = $("<a>")
        .text(saved_command_name)
        .attr({"href": "#"});
    new_cmd.click(render_command_to_json_display);
    $("#saved_cmd_list")
        .append($("<li>")
            .append(new_cmd));
}

function load_command_for_plugin_from_cloud(plugin_name_var){
    $.ajax({
        type: "GET",
        url: "/action/get_saved_command_list/",
        data: {"plugin_name": plugin_name_var},
        datatype: 'json',
        success: function (data) {
            $("#savedContentHeader").text(plugin_name_var + " saved command list");
            $("#savedContent")
                .append($("<ol>")
                    .attr({"id": "saved_cmd_list"}));
            for(var i=0; i <  data.saved.length; i++){
                current_saved_commands[data.saved[i].Name] = data.saved[i].Command;
                render_saved_command_to_dom(data.saved[i].Name);
            }

        },
    });
}

function save_command_to_cloud(){
    //close_command_loader();
    $("#w2_namer").show();
    $("#w2_up_check_button").show();
    $("#w2toss_button").show();
}


function save_command_by_name(event){
    var source = event.target || event.srcElement;
    var plugin_name = current_selected_plugin;
    var user_completed_command = current_command_template;
    var save_name = $("#w2_namer").val();
    $("#w2_up_check_button i").removeClass("fa-check");
    $("#w2_up_check_button i").addClass("fa-hourglass-end");
    $("#w2_save_feedback").hide();
    if (save_name.length > 0){
        $.ajax({
            type: "POST",
            url: "/action/put_saved_command/",
            data: {"PluginName": current_selected_plugin,
                   "Command_js": JSON.stringify(user_completed_command),
                   "Name": save_name
            },
            datatype: 'json',
            success: function (data) {
                $("#w2_up_check_button i").removeClass("fa-hourglass-end");
                $("#w2_up_check_button i").addClass("fa-money");
                if (data.errors > 0){
                    $("#w2_save_feedback").text(data.first_error);
                    $("#w2_save_feedback").show();
                } else {
                    var msg1 = "Saved command: ";
                    var msg2 = save_name;
                    var msg3 = plugin_name + " / ";
                    notification_function(msg1, msg2, msg3);
                }
                setTimeout( function() {
                    $("#w2_up_check_button i").removeClass("fa-money");
                    $("#w2_up_check_button i").addClass("fa-check");
                }, 2000);
            },
            error(data){
                $("#w2_save_feedback").text(data);
                $("#w2_save_feedback").show();
            }
        });
    }

}

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w3
-----------------------------------------------------------------------------------------------------
*/
function drop_target_into_job_row(job_row_id, target_js, target_js_str=""){
    /*
    Params:
    job_row_id == destination job row
    target_js == json target
    target_js_str == json target as a string
     */
    if (job_row_is_mutable(job_row_id)){
        if (target_js_str.length == 0){
            target_js_str = JSON.stringify(target_js)
        }
        $("#pluginid"+job_row_id).empty();
        $("#addressid"+job_row_id).empty();
        $("#addressid"+job_row_id)[0].innerText = target_js.Location;
        $("#pluginid"+job_row_id)[0].innerText = target_js.PluginName+":"+target_js.Port;
        $("#pluginid"+job_row_id)
            .append($("<span/>")
                .attr({"id": "jobTargetidJSON"+job_row_id, "style": "display:none"})
                .append(target_js_str));
        var notification_msg1 = "Target " + target_js.PluginName,
            notification_msg2 = ""+job_row_id;
        notification_function(notification_msg1, notification_msg2);

    }
}


function load_job_state(){
    close_state_loader();
    var dropdown_names = $("#w3_current_selector");
    dropdown_names.empty();

    $("#w3_dn_check_button").show();
    $("#w3toss_button").show();
    $("#w3_selector_loading").show();
    $.ajax({
        type: "GET",
        url: "/action/state_names/",
        datatype: 'json',
        success: function (data) {
            var name_selector = $("#w3_current_selector");
            for(var i=0; i <  data.length; i++){
                name_selector.append($("<option/>")
                    .val(data[i])
                    .text(data[i])
                );
            }
            $("#w3_selector_loading").hide();
            $("#w3_current_selector").show();
        }
    });
}

function close_state_loader(){
    $("#w3_current_selector").hide();
    $("#w3_dn_check_button").hide();
    $("#w3_selector_loading").hide();
    $("#w3_namer").hide();
    $("#w3_up_check_button").hide();
    $("#w3toss_button").hide();
}

function load_job_state_by_name(){
    $("#download_status").removeClass("fa-cloud-download");
    $("#download_status").removeClass("fa-money");
    $("#download_status").addClass("fa-hourglass-end");
    $.ajax({
        type: "GET",
        url: "/action/load_state/",
        data: {"requested_state": $("#w3_current_selector").val()},
        datatype: 'json',
        success: function(data) {
            clear_new_jobs();
            for (var i = 0; i < data.jobs.length; i++){
                var job_id = i + 1;
                add_new_job();
                if (data.jobs[i].target_js != null && data.jobs[i].target_js.length > 5){
                    var job_target_js = JSON.parse(data.jobs[i].target_js);
                    drop_target_into_job_row(job_id, job_target_js, data.jobs[i].target_js);
                }
                if (data.jobs[i].job != null){
                    var command_td = $("#commandid"+job_id);
                    drop_command_into_hole(data.jobs[i].job,
                                           JSON.stringify(data.jobs[i].job),
                                            command_td,
                                            job_id);
                }
            }
            sequences = JSON.parse(JSON.stringify(data.sequences), json_list_to_set);
            active_sequence = data.active_sequence;
            id_map = data.id_map;
            id_reverse_map = data.id_reverse_map;
            id_status_map = data.id_status_map;
            for(var i in sequences){
                if ($('#jobq_tabs a[href="#jobq_'+i+'"]').length == 0){
                    add_sequence_tab(false);
                }
            }
            sequence_starttime_map = data.sequence_starttime_map; // must remain below add_sequence_tab loop
            sequence_expiretime_map = data.sequence_expiretime_map;
            set_w3_job_status(full_update=true);
            synchronize_job_sequence_tabs(active_sequence);
            synchronize_output_sequence_tabs(active_sequence);
            $("#download_status").removeClass("fa-hourglass-end");
            $("#download_status").addClass("fa-money");
            setTimeout( function() {
                $("#download_status").removeClass("fa-money");
                $("#download_status").addClass("fa-cloud-download");
                close_state_loader();
                }, 3000);
        }
    })
}
function json_set_to_list(key, value) {
  if (typeof value === 'object' && value instanceof Set) {
    return [...value];
  }
  return value;
}
function json_list_to_set(key, value) {
  if (typeof value === 'object' && value.constructor === Array) {
    return new Set(value);
  }
  return value;
}


function save_job_state(){
    close_state_loader();
    $("#w3_namer").show();
    $("#w3_up_check_button").show();
    $("#w3toss_button").show();
}


function save_job_state_by_name(){
    $("#upload_status").removeClass("fa-cloud-upload");
    $("#upload_status").removeClass("fa-money");
    $("#upload_status").addClass("fa-hourglass-end");
    var state_name = $("#w3_namer").val();
    var local_sequences = JSON.parse(JSON.stringify(sequences, json_set_to_list));
    var data_package = {"id": state_name,
                        "id_map": id_map,
                        "id_reverse_map": id_reverse_map,
                        "id_status_map": id_status_map,
                        "sequence_starttime_map": sequence_starttime_map,
                        "sequence_expiretime_map": sequence_expiretime_map,
                        "jobs": [],
                        "sequences": local_sequences,
                        "active_sequence": active_sequence};
    var num_jobs = $("#addjob_button")[0].value;
    for (var i = 1; i <= Number(num_jobs); i++){
        var plugin_name = $("#pluginid"+i)[0].innerText;
        var plugin_target = $("#pluginid"+i+" span")[0].innerText;
        var address = $("#addressid"+i)[0].innerText;
        var job_cell = $("#commandid"+i+" div");
        var job_str = undefined;
        var job_js = null;

        if (job_cell.length >= 1){
            job_str = job_cell[0].innerText;
            if (job_str != undefined){
                job_js = JSON.parse(job_str);
            }
        }
        data_package.jobs.push({"target_js": plugin_target,
                                 "job": job_js,
                                 "status": null});
    }
    var data_json = JSON.stringify(data_package);
    $.ajax({
        type: "POST",
        url: "/action/save_state/",
        data: {"current_state": data_json},
        datatype: 'json',
        success: function(data) {
            var job_ids = data;
            $("#upload_status").removeClass("fa-hourglass-end");
            $("#upload_status").addClass("fa-money");
            setTimeout( function() {
                $("#upload_status").removeClass("fa-money");
                $("#upload_status").addClass("fa-cloud-upload");
                close_state_loader();
                }, 3000 );
        }
    });
}

function as_checker_func(as){
    var highlighted_job_row = w3_highlighted_array;
    as_highlighted_checker[as] = 0;
    try {
        sequences[as].forEach(function(value) {
            if (highlighted_job_row.includes(Number(value))){
                as_highlighted_checker[as] = 1;
            }
        });
    } catch (e) {
        if (e!==BreakException) throw e;
    }
    return as_highlighted_checker[as]
}

function quick_action_function(source, source_widget_id, source_widget){
    /*
    Quick action button handler for commands & targets
    Params:
    source =
    source_widget_id == commandid or pluginid
    source_widget = target or command
     */

    var BreakException= {};
    var highlighted_job_row = w3_highlighted_array,
        command_temp_str = JSON.stringify(current_command_template),
        new_job_row_arry_checker = [];

    // For Targets
    if (source_widget !== "command"){
        var row_js = JSON.parse(source);
        if (inc === 0){  // check if job rows doesn't exist in W3, create row
            add_new_job();
            drop_target_into_job_row(inc, row_js, source);
        } else if (inc !== 0 && as_highlighted_checker[active_sequence] !== 0){
            try {
                sequences[active_sequence].forEach(function(value) {
                    if (highlighted_job_row.includes(Number(value))){
                        drop_target_into_job_row(""+value, row_js, source);
                    }
                });
            } catch(e) {
                if (e!==BreakException) throw e;
            }
        } else {  // else if no job rows are highlighted, and job rows exist
            try {
                sequences[active_sequence].forEach(function(value) {
                    if ($("tr td#" + source_widget_id + value)[0].textContent === "") {
                        drop_target_into_job_row(""+value, row_js, source);
                        throw BreakException;
                    } else {
                        new_job_row_arry_checker.push(value);
                    }
                });
            } catch (e) {
                if (e!==BreakException) throw e;
            }
        }
        // if all job rows iterated and all filled, create  new job row
        if (new_job_row_arry_checker.length === sequences[active_sequence].size) {
            add_new_job();
            drop_target_into_job_row(inc, row_js, source);
        }
    // For Commands
    } else {
        // check if job rows doesn't exist in W3, create row
        if (inc === 0) {
            add_new_job();
            drop_command_into_hole(current_command_template,
                                   command_temp_str,
                                   $("tr td#" + source_widget_id + inc),
                                   "" + inc);
        // If job row or rows are highlighted
        } else if (inc !== 0 && as_highlighted_checker[active_sequence] !== 0) {
            try {
                sequences[active_sequence].forEach(function(value) {
                    if (highlighted_job_row.includes(Number(value))){
                        drop_command_into_hole(current_command_template,
                            command_temp_str,
                            $("tr td#" + source_widget_id + value),
                            ""+value);
                    }
                });
            } catch(e) {
                if (e!==BreakException) throw e;
            }
        // else if no job rows are highlighted, and job rows exist
        } else {
            try {
                sequences[active_sequence].forEach(function(value) {
                    if ($("tr td#" + source_widget_id + value)[0].textContent === ""){
                        drop_command_into_hole(current_command_template,
                            command_temp_str,
                            $("tr td#" + source_widget_id + value),
                            ""+value);
                        throw BreakException;
                    } else {
                        new_job_row_arry_checker.push(value);
                  }
                });
            } catch(e) {
                if (e!==BreakException) throw e;
            }
        }
        // if all job rows iterated and all filled, create  new job row
        if (new_job_row_arry_checker.length === sequences[active_sequence].size) {
            add_new_job();
            drop_command_into_hole(current_command_template,
                command_temp_str,
                $("tr td#" + source_widget_id + inc),
                "" + inc);
        }
    }
}

function add_target_to_job_sc_button(){
    var w1_target_row_id = $(this)[0].parentElement.parentElement.parentElement.id.substring(10, $(this)[0].id.length),
        row_js_str = $("#nameidjson" + w1_target_row_id)[0].innerText;
    quick_action_function(row_js_str, "pluginid", "target");
    set_w3_job_status();


}

function add_command_to_job_sc_button(){
    var command_temp_str = JSON.stringify(current_command_template);  // command template as a string
    quick_action_function(command_temp_str,"commandid", "command");
    set_w3_job_status();  // setting w3 job status
}

function hide_current_sequence(e){
    sequences[active_sequence] = new Set();
    synchronize_sequence_tab_rows(active_sequence);
}
function delay_goto_tab(next_tab, delay_ms){
    setTimeout(
        function() {
            synchronize_job_sequence_tabs(next_tab);
            synchronize_output_sequence_tabs(next_tab);
        }
        , delay_ms
    );
}
function add_sequence_tab(clear=true){
    var next_tab =  $("#jobq_tabs").children().length;
    if (clear){
        sequences[next_tab] = new Set();
    }
    var new_tab_start_time =  Math.floor((new Date().valueOf()) / 1000);
    var new_tab_expire_time = new_tab_start_time + 3 * 24 * 60* 60;
    sequence_starttime_map[next_tab] = new_tab_start_time.toString();
    sequence_expiretime_map[next_tab] = new_tab_expire_time.toString();
    $('#new_jobq_button')
        .before('<li id="jobB_'+next_tab+'" onclick="synchronize_job_sequence_tabs('+next_tab+')"><a href="#jobq_'+next_tab+'" data-toggle="tab">'+next_tab+'</a></li>');
    $('#jobq_content')
        .append('<div class="tab-pane" id="jobq_'+next_tab+'"></div>');
    console.warn("adding sequence ");
    //ADD THE OUTPUT TAB TOO!
    var output_tab = $("#output_tabs")
        .append('<li id="outB_'+next_tab+'" onclick="synchronize_output_sequence_tabs('+next_tab+')"><a href="#outq_'+next_tab+'" data-toggle="tab">'+next_tab+'</a></li>');
    $('#outq_content')
        .append('<div class="tab-pane" id="outq_'+next_tab+'"></div>');
    delay_goto_tab(next_tab, 33);
}

function synchronize_job_sequence_tabs(tab_id){
    if (exec_int === 1){
        delay_goto_tab(active_sequence, 5);
    } else {
        active_sequence = tab_id;
        var other_tab = $('#output_tabs a[href="#outq_'+tab_id+'"]');
        other_tab.tab('show');
        synchronize_sequence_tab_rows(tab_id);
        as_checker_func(active_sequence);
    }
}
function synchronize_output_sequence_tabs(tab_id){
    if (exec_int === 1){
        delay_goto_tab(active_sequence, 5);
    } else {
        active_sequence = tab_id;
        var other_tab = $('#jobq_tabs a[href="#jobq_' + tab_id + '"]');
        other_tab.tab('show');
        synchronize_sequence_tab_rows(tab_id);
        as_checker_func(active_sequence);
    }
}
function synchronize_sequence_tab_rows(sequence_id){
    var _dt = new Date(Number(sequence_starttime_map[sequence_id]) * 1000);
    var display_date = $.datepicker.formatDate('mm/dd/yy ', _dt);
        display_date += ("0" + _dt.getHours()).slice(-2);
        display_date += ":";
        display_date += ("0" + _dt.getMinutes()).slice(-2);
    $("#job_sequence_time_unix")[0].value = sequence_starttime_map[sequence_id];
    $("#job_sequence_timer")[0].value = display_date;
    var _et = new Date(Number(sequence_expiretime_map[sequence_id]) * 1000);
    var display_expire_date = $.datepicker.formatDate('mm/dd/yy ', _et);
        display_expire_date += ("0" + _et.getHours()).slice(-2);
        display_expire_date += ":";
        display_expire_date += ("0" + _et.getMinutes()).slice(-2);
    $("#job_sequence_expire_unix")[0].value = sequence_expiretime_map[sequence_id];
    $("#job_sequence_expire")[0].value = display_expire_date;

    var job_row_ids = $("#third_box_content tr" );
    var ouput_row_objs = $("#W4Rows tr");
    for (var i = 1; i <= job_row_ids.length; i++){
        var output_i = i-1; //because numbers are dumb
        var job_obj = $("#jobrow"+i);
        var output_obj = $(ouput_row_objs[output_i]);
        if (sequences[sequence_id].has(String(i))){
            job_obj.show();
            output_obj.show();
        } else {
            job_obj.hide();
            output_obj.hide();
        }
    }
    var dan = "1";
}

function add_new_plugin_location_job_row(id_parameter, num_parameter){
    var row_var = $("<td/>")
        .attr({"id": id_parameter + num_parameter})
        .append($("<a/>").attr(
    {"href": "#"}).append($("<span/>").text("")));
    return row_var;
}

// Add new job
function add_new_job(){
    inc++;
    $("#addjob_button")[0].value = inc;

    var value = $("#addjob_button")[0].value;
    sequences[active_sequence].add(value);
    // content for w3
    $(".thirdBoxContent")
        .append($("<tr/>")
            .attr({"role": "row","onclick": "anchor_w4_output("+value+")","id":"jobrow"+value,"class": "draggable_tr divw3row",
                "style": "z-index: 200"})
            .append($("<td/>")
                    .append($("<div/>")
                        .append($("<a/>")
                            .attr({"href": '#','id': 'trashjob'+value})
                            .addClass("fa fa-trash-o"))
                        .append($("<span/>")
                            .text(value)
                            .addClass("pull-right"))),
        add_new_plugin_location_job_row("pluginid", value),
        add_new_plugin_location_job_row("addressid", value),
        $("<td/>").attr({"id": "commandid" + value,
                         "ondrop": "drop_command(event)",
                         "ondragover": "allowDropCommand(event)"})
            .append($("<a/>")
                .attr({"href": "#"})
                .append($("<span/>")
                    .text(""))),
        $("<td/>").attr({"id": "jobstatusid" + value})
    ));

    // W4 Rows
    $(".W4BodyContent")
        .append($("<tr/>")
            .append($("<td/>")
                    .text(value),$("<td/>")
                    .append($("<a/>")
                        .attr({'id': 'updateid'+value})
                        .text("terminal" + value)),
    $("<td/>").attr({"id": "updatestatusid" + value})));
    $("#trashjob"+value).click(delete_job_from_w3);

}
function delete_job_from_w3(event){
    var source = event.target || event.srcElement;
    var job_item = source.id.substring(8,source.id.length);
    sequences[active_sequence].delete(job_item);
    $("#jobrow"+job_item).hide();
    synchronize_output_sequence_tabs(active_sequence);
    var dan = "ok";
}
function stop_job_from_w3(event){
    var source = event.target || event.srcElement;
    var job_item = get_number_from_id(source.id, "stopjob");
    $(source).removeClass("fa-fire-extinguisher");
    $(source).addClass("fa-hourglass-start");
    $.ajax({
        type: "GET",
        url: "/stop_job/"+id_map[job_item]+"/",
        datatype: 'json',
        success: function(data) {
            if (data.errors == 0){
                $(source).hide();
                if ($("#jobrow"+job_item).hasClass("selected")){
                    as_highlighted_checker[active_sequence]--;
                    $("#jobrow"+job_item).removeClass("selected");
                }
                as_highlighted_checker[active_sequence]
            } else {
                $(source).removeClass("fa-hourglass-start");
                $(source).addClass("fa-fire-extinguisher");
            }
        }
    });
}

function reset_job_from_w3(event){
    var source = event.target,
        job_item = get_number_from_id(source.id, "resetjob"),
        parse_job_num = parseInt(job_item),
        job_target_row_json = $("#jobTargetidJSON"+job_item),
        job_command_row_json = $("#jobCommandidJSON"+job_item),
        row_js = JSON.parse(job_target_row_json[0].textContent),
        new_job_array_checker = [],
        row_command_str_js = job_command_row_json[0].textContent,
        row_command_js = JSON.parse(row_command_str_js);

    if(inc === parse_job_num) {
        add_new_job();
        drop_target_into_job_row(inc, row_js, job_target_row_json[0].textContent);
        drop_command_into_hole(row_command_js,
                               row_command_str_js,
                               $("tr td#commandid"+inc),
                               inc);
    }
    // iterate through active sequence to see if target, and command columns are filled
    else if (inc !== parse_job_num && inc > parse_job_num){
        try{
            sequences[active_sequence].forEach(function(value) {
                if ($("tr td#pluginid" + value)[0].textContent === "" && $("tr td#commandid" + value)[0].textContent === "") {
                    drop_target_into_job_row(""+value, row_js, job_target_row_json[0].textContent);
                    drop_command_into_hole(row_command_js, row_command_str_js, $("tr td#commandid"+value), value);
                    throw BreakException;
                } else {
                    new_job_array_checker.push(value);
                }
            });
        } catch (e) {
            if (e!==BreakException) throw e;
        }
    }
    // if all job rows iterated and all filled, create  new job row
    if (new_job_array_checker.length === sequences[active_sequence].size) {
        add_new_job();
        drop_target_into_job_row(inc, row_js, job_target_row_json[0].textContent);
        drop_command_into_hole(row_command_js, row_command_str_js, $("tr td#commandid"+inc), "" + inc);
    }
}

// Clear job content in w3
function clear_new_jobs(){
    $(".thirdBoxContent").empty();
    $("#W4Rows").empty();
    for (var member in id_reverse_map) {
        clearInterval(start_timer_map[id_reverse_map[member]]);
        clearInterval(countdown_map[id_reverse_map[member]]);
        delete id_reverse_map[member];
    }
    id_reverse_map = {};
    id_map = {};
    id_status_map = {};
    for (var key in sequences){
        sequences[key] = new Set();
        var seq_button = $("#jobB_"+key);
        if (seq_button.length > 0){
            seq_button.remove();
        }
        var out_button = $("#outB_"+key);
        if (out_button.length > 0){
            out_button.remove();
        }
    }
    inc = 0;
    active_sequence = "1";
    var new_default_start_time = Math.floor((new Date().valueOf())/1000);
    sequence_starttime_map = {"1": new_default_start_time.toString()};
    $("#addjob_button")[0].value = 0;
}

// Drag and drop function(s) for w1+w3 or w2+w3
// Drag and drop function(s) for targets
// Note: Drop function needs to be validated

// DRAG
function drag_target(){
	$(".gridSelect tbody tr").draggable({
        // appendTo: $("#third_box_content"),
        appendTo: "body",
	    helper: function(){
	        var selected_var = $(".gridSelect tbody tr.selected");
            var container_to_drag;

	        if (selected_var[0] == $(this)[0]){
	            container_to_drag = selected_var;
	        } else if (selected_var[0].classList.contains('selected') && $(this)[0].classList.contains('selected')) {
	            container_to_drag = selected_var;
	        } else {
	            container_to_drag = $(this);
	        }

            if (container_to_drag.length === 0) {
                container_to_drag = $(this).addClass('selected');
            } else if (container_to_drag.length === 1) {
                display_drop_all();
            }
            // var container = $('<table/>').attr({'id':'draggingContainer'}).addClass('custom_drag');
	        var container = $('<table/>').attr({'id':'draggingContainer'});
            container.append(container_to_drag.clone().removeClass("selected"));
            $("#third_box_content tr").addClass('w3_box_css');
            hover_w3_for_target();
            return container;
	    },
	    revert: function(){
	        hide_drop_all();
	        hover_int = 0;
	        // $("#draggingContainer").removeClass('custom_drag');
	        $("#third_box_content tr").removeClass('w3_box_css');
	        return true;
        }
	});
}
function display_drop_all(){
    $("#w3_drop_target_to_all").css("display", "");
    // hover_int = 1;
}
function hide_drop_all(){
    $("#w3_drop_target_to_all").css("display", "none");
    hover_int = 0;
}

function hover_w3_for_target(){
    $("#w3_drop_target_to_all").mouseover(hover_drop);
    $("#w3_drop_target_to_all").mouseover(hover_leave);
    $("#third_box_content tr").mouseover(hover_drop);
    $("#third_box_content tr").mouseleave(hover_leave);
}

//    future animation
function hover_leave(){
    hover_int = 0;
}

function hover_drop(){
    hover_int = 1;
    var hover_object = $(this);
    var hover_object_id = hover_object[0].id;
    var hover_object_num = hover_object_id.substring(6, hover_object_id.length);

    // status box
    var plugin_name_text = hover_object[0].children[1].innerText;
    var location_text = hover_object[0].children[2].innerText;
    var command_text = hover_object[0].children[3].innerText;
    var status_td = hover_object[0].children[4];
    var status_text = false;
    if (status_td != undefined){
        status_text = hover_object[0].children[4].innerText;
    }
    if (plugin_name_text && location_text && command_text != "" && status_text == false && exec_int != 1){
        $("#jobstatusid"+hover_object_num)
            .append($("<span/>")
                .attr({"class": "label label-warning"})
                .text("Preparing"));
    }
    if (hover_int != 0){
        drop_target(hover_object);
    } else {
        // console.log("not dragging the object over a validated job row");
        hover_int = 0;
    }
}

// Drop target to W3
function drop_target(hover_object){
    // hover_object is the row that is being hovered over
    // selected_var.length == # of targets dragging
    // hover_object.nextUntil().length == # of rows of every sequence in W3 - 1
    // next_location_num not being used but maybe in the future
    var json_target_id,
        json_target_data;
        // json_target_text_data;
    $(".gridSelect, .divw3row").droppable({
        drop: function (event, ui) {
            if (hover_int != 0){
                var selected_var = ui.helper.children();
                var list_cap = 0;

                for(var int = 0; int < selected_var.length; int++){
                    var row_id = selected_var[int].id;
                    var row_id_str = row_id.substring(10,row_id.length);
                    var row_js = JSON.parse($("#nameidjson" + row_id_str)[0].innerText);
                    var selected_row = undefined;

                    if (int !== 0){
                        var counter = list_cap;
                        while(hover_object.nextUntil().length > counter){
                            var next_plugin_name = hover_object.nextUntil()[counter].children[1].innerText;
                            var next_location_num = hover_object.nextUntil()[counter].children[2].innerText;
                            if (hover_object.nextUntil()[counter].style.display !== 'none' && next_plugin_name.length < 1){
                                selected_row = hover_object.nextUntil()[counter];
                                counter++;
                                list_cap = counter;
                                break;
                            }
                            counter++;
                            list_cap = counter;
                        }
//                        selected_row = hover_object.nextUntil(':hidden')[(int -1)];  // this was used before
                    } else {
                        // hover_object is the job row that you dropped container(s) to
                        selected_row = hover_object[0];
                    }
                    if (selected_row !== undefined){
                        var selected_row_id = selected_row.id.substring(6, selected_row.id.length);
                        if (job_row_is_mutable(selected_row_id)) {
                            $(selected_row.children[1]).empty(); //plugin column
                            $(selected_row.children[2]).empty(); //location column
                            selected_row.children[1].append(row_js.PluginName);
                            selected_row.children[2].append(row_js.Location);

                            // json target data
                            json_target_id = selected_var[int].children[0].children[0].children[0].id;
                            json_target_data = $("#"+json_target_id)[0].innerText;
                            drop_target_into_job_row(selected_row_id, row_js);
                        }
                    }
                }
                set_w3_job_status();
                $('.selected');
            }
        }
    });
}

function job_row_is_mutable(job_row){
    var result = false;
    var num_jobs = $("#addjob_button")[0].value;
    if (Number(job_row) <= Number(num_jobs)){
        var current_status = $("#jobstatusid"+job_row+" span");
        result =  ((current_status.length == 0) ||
                   (current_status.length >=1 && ( current_status[0].innerText == "Valid" ||
                                                   current_status[0].innerText == "Invalid")));
    }
    return result;
}
function job_row_is_imutable(job_row){
    return !job_row_is_mutable(job_row);
}
// Drag and drop function(s) for command
// Note: Drop function needs to be validated
function allowDropCommand(ev) {
    ev.preventDefault();
}

function drag_command(ev) {
//    ev.dataTransfer.setData("text", ev.explicitOriginalTarget.firstElementChild.id);  // Former code
    //ev.dataTransfer.setData("text", ev.originalTarget.id);
    ev.dataTransfer.setData("text", JSON.stringify(current_command_template));
    $("#w3_drop_to_all").css("display", "");
}
function drag_end_command(event){
    $("#w3_drop_to_all").css("display", "none");
}

function drop_command(ev) {
    ev.preventDefault();
    var command_json = ev.dataTransfer.getData("text");
    $("#w3_drop_to_all").css("display", "none");
    var command = JSON.parse(command_json);
    //ev.target.appendChild(argumentid_var);
    var command_hole = $(ev.target);

    while (command_hole[0].tagName != "TD"){
        command_hole = command_hole.parent();
    }
    var row_id = command_hole[0].id.substring(9, command_hole[0].id.length);
    drop_command_into_hole(command, command_json, command_hole, row_id);
    set_w3_job_status();
}
function set_w3_job_status(full_update=false){
    var num_jobs = $("#addjob_button")[0].value;
    var w3_rows = $("#third_box_content tr");

    for (var j = 0; j < num_jobs; j++){
        var what = w3_rows[j];
        var plugin_name_text = what.children[1].innerText;
        var location_text = what.children[2].innerText;
        var command_text = what.children[3].innerText;
        var w3_status = what.children[4].innerText;

        var job_id = j+1;

        if(plugin_name_text && command_text && !(job_id in id_status_map) && exec_int != 1){
            $("#jobstatusid"+(j+1)).empty();
            $("#jobstatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-Valid"})
                    .text("Valid"));
        } else if (job_id in id_status_map){
            var known_status = id_status_map[job_id];
            $("#jobstatusid"+(j+1)).empty();
            $("#jobstatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-"+known_status})
                    .text(known_status));
            $("#updatestatusid"+(j+1)).empty();
            $("#updatestatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-"+known_status})
                    .text(known_status));
            if (full_update){
                status_change_update_dom(job_id, known_status);
            }
        } else {
            $("#jobstatusid"+(j+1)).empty();
            $("#jobstatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-Invalid"})
                    .text("Invalid"));
            // console.log("Status is done and plugin and command are filled up in the job row");
        }
    }
}


function drop_command_to_multiple(ev) {
    ev.preventDefault();
    var command_json = ev.dataTransfer.getData("text");
    $("#w3_drop_to_all").css("display", "none");
    var command = JSON.parse(command_json);
    var num_jobs = $("#addjob_button")[0].value;
    if (num_jobs < 1){
        num_jobs++;
        add_new_job();
    }
    for (var j = 1; j <= num_jobs; j++){
        var command_row = $("#jobrow"+j);
        if ($("#jobrow"+j).css('display') != 'none'){
            var command_td = $("#commandid"+j);
            drop_command_into_hole(command, command_json, command_td, j)
        }
    }
    set_w3_job_status();
}

function drop_command_into_hole(command, command_json, command_td, row_id){
   /*
   command == object json
   command_json == json string
   command_td == destination job command column
   row_id == destination job command row
   */
    var current_status = $("#jobstatusid"+row_id+" span");
    var MAX_DISPLAY_ARGUMENT = 36;
    if (job_row_is_mutable(row_id)){
        command_td.empty();
        var new_div = document.createElement("div");
        new_div.innerText = command_json;
        new_div.style.display = 'none';
        new_div.setAttribute("id", "jobCommandidJSON"+row_id);
        var display_string = command['CommandName'] + " (";
        var args_str = "";
        var args_str_truncated = "";
        for (var j = 0; j < command["Inputs"].length; j++){
            args_str += " "+command["Inputs"][j]["Value"];
            var arg_truncated = command["Inputs"][j]["Value"].substring(0, MAX_DISPLAY_ARGUMENT);
            if (arg_truncated.length >= MAX_DISPLAY_ARGUMENT){
                arg_truncated += "...";
            }
            args_str_truncated += arg_truncated;
        }
        display_string += args_str_truncated + " )";
        command_td[0].appendChild(new_div);
        var display_div = document.createElement("div");
        display_div.innerText = display_string;
        display_div.title = command['CommandName'] + " (" + args_str + " )";
        $(display_div)
            .tooltip({open: function (event, ui) {
                                ui.tooltip.css("max-width", "50%");
                            },
                      classes: {"ui-tooltip": "ui-corner-all ui-widget-shadow bg-light-blue-active color-palette"}
            });
        command_td[0].appendChild(display_div);
        var notification_msg1 = "Command " + command.CommandName,
        notification_msg2 = ""+row_id;
        notification_function(notification_msg1, notification_msg2);
    } else {
        // console.error("Can't drop command into job "+row_id+" (job already in Brain)");
        // notification warning
        var msg1 = "Can't drop command into job",
            msg3 = row_id,
            msg2 = "(job already in Brain)",
            info_type = "danger";
        notification_function(msg1, msg2, msg3, info_type);
    }
}

function prepare_jobs_list(){
    var jobs = [];
    var num_jobs = $("#addjob_button")[0].value;
    var w3_rows = $("#third_box_content tr");
    for (var j = 0; j < num_jobs; j++){
        if ($(w3_rows[j]).css('display') == 'none'){
            jobs.push({});
            continue;
        }
        var w3_status = w3_rows[j].children[4].innerText;
        if(w3_status == false){
            $("#updatestatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-danger"})
                    .text("Error"));
            $("#jobstatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-danger"})
                    .text("Error"));
            jobs.push({});
        } else if (w3_status == "Valid") {
            $(".gridSelect, #jobrow"+(j+1)).droppable({
                disabled: true
            });
            $("#updatestatusid"+(j+1)).empty();
            $("#updatestatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-"+INITIAL_JOB_STATUS})
                    .text(INITIAL_JOB_STATUS));
            $("#jobstatusid"+(j+1)).empty();
            $("#jobstatusid"+(j+1))
                .append($("<span/>")
                    .attr({"class": "label label-"+INITIAL_JOB_STATUS})
                    .text(INITIAL_JOB_STATUS));
            $("#trashjob"+(j+1)).hide();
            var uid = j+1;
            var terminal = $("#updateid"+uid).parent();
            var plugin_name_data = $("#pluginid"+(j+1))[0].textContent;  // correct json target data with plugin name
            var json_target_data = JSON.parse($("#pluginid"+(j+1)+" span")[0].innerText);
            var command_json = $("#commandid"+(j+1)+" div")[0].innerText;
            var command = JSON.parse(command_json);
            var job = {"JobTarget": {"PluginName": String(json_target_data.PluginName),
                                     "Location": String(json_target_data.Location),
                                     "Port":  String(json_target_data.Port),},
                       "Status": INITIAL_JOB_STATUS,
                       "StartTime": Number(sequence_starttime_map[active_sequence])+(uid/1000),
                       "ExpireTime": Number(sequence_expiretime_map[active_sequence])+(uid/1000),
                       "JobCommand": command};
            id_status_map[uid] = INITIAL_JOB_STATUS;
            jobs.push(job);
        } else {
            jobs.push({});
        }
    }
    return jobs;
}

function start_timer(dom_id){
    var seconds = 0,
        minutes = 0,
        hours = 0,
        days = 0,
        display_a = document.createElement("a");
    display_a.className = "fa fa-refresh fa-spin";
    display_a.id = "update_spin"+dom_id;

    start_timer_map[dom_id] = setInterval( function(){
        ++seconds%60;
        if (seconds >= 60) {
            seconds = 0;
            ++minutes%60;
            if (minutes >= 60) {
                minutes = 0;
                ++hours%24;
                if (hours >= 24) {
                    hours = 0;
                    ++days%24;
                }
            }
        }
        $("#updateid" + dom_id).text(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
        $("#updateid" + dom_id)[0].parentElement.append(display_a);
    }, 1000);
}

function final_countdown_function(start_time, dom_id) {
    var interval_var = setInterval(function() {
        var right_meow = String(new Date().getTime()/1000).substring(0, 10),
            distance = start_time - right_meow,
            // Time calculations for days, hours, minutes and seconds
            days = Math.floor(distance / (60 * 60 * 24)),
            hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60)),
            minutes = Math.floor((distance % (60 * 60)) / (60)),
            seconds = Math.floor((distance % (60)));

        $("#updateid" + dom_id).text(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");

        // If the count down is over, write some text
        if (distance < 0) {
            $("#updateid" + dom_id).empty();
            start_timer(dom_id);
            clearInterval(interval_var);
        }

    },1000);
    countdown_map[dom_id] = interval_var;
}

// Execute Sequence function down below are for w3+w4
function execute_sequence(){
    hide_drop_all();
    var desired_start = Number(sequence_starttime_map[active_sequence]);
    var desired_expire = Number(sequence_expiretime_map[active_sequence]);
    if (desired_start < desired_expire){
        exec_int = 1;
        $("#execute_button").attr({"disabled":true});
        var jobs = prepare_jobs_list();
        var jobs_json = JSON.stringify(jobs);
        var sequence_start_time;
        $.ajax({
            type: "POST",
            url: "/action/get_w3_data/",
            data: {"jobs": jobs_json},
            datatype: 'json',
            success: function(data) {
                var job_ids = data.generated_keys;
                job_id = job_ids[0];
                sequence_start_time = parseInt(sequence_starttime_map[active_sequence]);
                for (var index = 0; index < job_ids.length; ++index) {
                    var dom_id = index+1;
                    if (job_ids[index] != "invalid-job"){
                        var job_row_var = $("#jobrow"+dom_id);
                        id_reverse_map[job_ids[index]] = dom_id;
                        id_map[index+1] = job_ids[index];
                        $("#trashjob"+dom_id)
                            .parent()
                            // stop job
                            .append(
                                $("<a>")
                                    .attr({"id": "stopjob"+dom_id})
                                    .addClass("fa fa-fire-extinguisher")
                            )
                            // reset job
                            .append($("<a>")
                                    .attr({"id": "resetjob"+dom_id, "style": "display: none;"})
                                    .addClass("fa fa-rotate-left"));
                        $("#stopjob"+dom_id).click(stop_job_from_w3);
                        $("#resetjob"+dom_id).click(reset_job_from_w3);
                        if (ws_map['status'].readyState === ws_map['status'].OPEN) {
                            $("#updateid" + dom_id).empty();
                            final_countdown_function(sequence_start_time, dom_id);
                        } else {
                            execute_sequence_output(job_ids[index]);
                        }
                        unselect_job_row(dom_id, 0);
                        num_jobs_to_ex.push(index);
                    } else {
                        if (!id_map.hasOwnProperty(dom_id) && dom_id in sequences[active_sequence]){
                            id_status_map[dom_id] = "Error";
                            status_change_update_dom(dom_id, "Error");
                            notification_function("command ", "not appropriate for target", "", "danger");
                            $("#updateid"+ dom_id).text("Command not appropriate for target")
                        }
                    }
                }
            },
            error: function (data) {
                console.warn("ERROR @ execute_sequence function")
            },
            complete: function(data){
                console.warn("spoolling changes");
                respool_deferred_status_changes();
                exec_int = 0;
                $("#execute_button").attr({"disabled":false});
            }
        })
    } else {
        alert("Sequence Expire must be later than sequence start");
    }
}

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w4
-----------------------------------------------------------------------------------------------------
*/
function change_truncate_value(){
    var tot = $("#truncate_output_to");
    if(tot.is(":checked")) {
        tot.val("1024");
    } else {
        tot.val("0");
    }
}

function w4_output_collapse2(job_row){
    // W4 output un-collapse by w3
    if ($("#updateid"+job_row)[0].children.length > 0 && $("#updatestatusid"+job_row)[0].innerText !== "Error") {
        var w4_output_var = $("#w4_output_collapsible_button"+job_row);
        w4_output_var[0].classList.toggle("active2");
        var w4_content = w4_output_var[0].nextSibling;
        var w4_pre_tag = w4_output_var[0].nextSibling.firstChild;
        if (w4_content.style.maxHeight) {
            w4_content.style.maxHeight = null;
        } else {
            w4_content.style.maxHeight = (w4_pre_tag.scrollHeight+35) + "px";
            // notification
            var notification_msg1 = "Job # " + job_row,
            notification_msg2 = "job output # "+job_row,
            notification_msg3 = "revealed";
            notification_function(notification_msg1, notification_msg2, notification_msg3);
        }
    }
}

function w4_output_collapse(){
    // w4 output un-collapse by click on w4 output job
    var this_var = $(this),
        job_num = this_var[0].innerText.split("Job Output ")[1],
        job_row_var = $("#jobrow"+job_num),
        w4_content = this_var[0].nextSibling,
        w4_pre_tag = this_var[0].nextSibling.firstChild;
    this_var[0].classList.toggle("active2");

    if (w4_content.style.maxHeight) {
        w4_content.style.maxHeight = null;
    } else {
        w4_content.style.maxHeight = (w4_pre_tag.scrollHeight+35) + "px";
    }
    // checking if job row is highlighted.
    if (w3_highlighted_array.includes(Number(job_num))){
        job_row_var.removeClass('selected');
        var w3_content_row = w3_highlighted_array.indexOf(job_row_var[0].rowIndex);
        if(w3_content_row > -1){
            w3_highlighted_array.splice(w3_content_row, 1);
            as_highlighted_checker[active_sequence] = 0;
        }
    } else {
        job_row_var.addClass('selected');
        w3_highlighted_array.push(job_row_var[0].rowIndex);
        as_highlighted_checker[active_sequence] = 1;
    }
}

function render_job_output_to_page(job_guid, data){
    var updateid = id_reverse_map[job_guid];
    clearInterval(start_timer_map[updateid]);
    $("#updateid"+updateid).empty();
    $("#updateid"+updateid).attr({"class": ""});
    $("#update_spin"+updateid).remove();
    $('<button class="w4_output_collapsible_button" id="w4_output_collapsible_button'+updateid+'">Job Output '+updateid+'</button>')
        .appendTo("#updateid"+updateid);
    $('<div class="w4_output_content" id="w4_output_content'+updateid+'"></div>').appendTo("#updateid"+updateid);
    $('<pre id="updatecontent'+updateid+'"></pre>').appendTo("#w4_output_content"+updateid);
    $("#updatecontent"+updateid).text(data['Content']);
    var download_link = $('<a>[Download]</a>');
    download_link.attr({"href": "/action/get_full_output_data/?job_id="+job_guid+"&job_number="+updateid});
    $("#w4_output_content"+updateid)
        .append($("<div/>").attr({"id": "download_link_id"+updateid})
            .append(download_link));
    $("#updatestatusid"+updateid).empty();
    $("#updatestatusid"+updateid)
        .append($("<span/>")
            .attr({"class": "label label-Done"})
            .text("Done"));
    $("#jobstatusid"+updateid).empty();
    $("#jobstatusid"+updateid)
        .append($("<span/>")
            .attr({"class": "label label-Done"})
            .text("Done"));
    if (id_replication_map.hasOwnProperty(updateid)){
        render_job_output_to_secondary(id_replication_map[updateid], data);
    }
    // w4 output un-collapse by click on w4 output job
    $("#w4_output_collapsible_button"+updateid).click(w4_output_collapse);
}

function render_job_output_to_secondary(secondary_id, data)
{
    var replica = $("#"+secondary_id);
    replica.empty();
    replica
        .append(
            $("<pre>")
                .attr({"class": "terminal-window"})
                .text(data['Content'])
        )
}


function render_job_output_timeout(job_guid){
    var updateid = id_reverse_map[job_guid];
    $("#updateid"+updateid).empty();
    $("#updateid"+updateid).attr({"class": ""});
    $("#update_spin"+updateid).remove();
    $("#updateid"+updateid)
        .append("No data to return at the moment :(");
    $("#updateid"+updateid)
        .parent()
        .append($("<i/>")
            .attr({"class": "fa fa-wrench", "onclick": "execute_sequence_output_retry('"+job_guid+"')"}));
    $("#updateid"+updateid).parent().css("background-color", "white");
    // W3 status
    $("#jobstatusid"+updateid).empty();
    $("#jobstatusid"+updateid)
        .append($("<span/>")
            .attr({"class": "label label-Error"})
            .text("Error"));
    // W4 status
    $("#updatestatusid"+updateid).empty();
    $("#updatestatusid"+updateid)
        .append($("<span/>")
            .attr({"class": "label label-Error"})
            .text("Error"));
}

function execute_sequence_output_retry(job_guid){
    var updateid = id_reverse_map[job_guid];
    $("#updateid"+updateid).parent().children()[1].remove(); //remove the wrench
    execute_sequence_output(job_guid);
}

// Modify function add depth parameter, increment depth when it errors
function execute_sequence_output(specific_id, counter=0, backoff=2000){
    var updateid = id_reverse_map[specific_id];
    var trunc_output_size = $("#truncate_output_to").val();
    $.ajax({
        type: "GET",
        url: "/action/get_output_data/",
        data: {"job_id": specific_id,
               "truncate": trunc_output_size},
        datatype: 'json',
        success: function(data) {
            unselect_job_row(updateid);
            job_row_checker++;
            if (job_row_checker >= num_jobs_to_ex.length){
                ex_seq_unselect(1); // select job row is turned back on
                job_row_checker = 0;
                num_jobs_to_ex = [];
            }

            if (data !== 0){  // returns query
                render_job_output_to_page(specific_id, data);
            } else {  // doesn't return query
                render_job_output_timeout(specific_id);
            }
        },
        error: function (data) {
            // sleep
            // increment depth
            // re-call execute_sequence_output function again

//            It's waiting for data in W4
            console.warn("ERROR @ execute_sequence_output function");
            $("#updateid"+updateid).empty();
            $("#updateid"+updateid).attr({"class": "fa fa-refresh fa-spin"});
        }
    }).fail(function(data){
        console.warn("FAIL @ execute_sequence_output  function");

        var status = data.status;
        if(counter >= MAX_MANUAL_CHECK_COUNT){
            render_job_output_timeout(specific_id);
        } else {
            counter++;
            setTimeout( function() { execute_sequence_output(specific_id, counter); }, backoff*2 );
        }
    })
}


function onclick_terminal_submit(event){
    var terminal_cmd = $("#terminal-cmd");
    var cmd_string = terminal_cmd.val();
    if (cmd_string.length > 0){
        var target_js = $("#terminal-active-target-str").val();
        var ti_command = {
            "CommandName":"terminal_input",
            "Tooltip": "",
            "Output": true,
            "Inputs": [{
                "Name": "command",
                "Type": "textbox",
                "Tooltip": "",
                "Value": cmd_string
            }]
        };
        current_command_template = ti_command;
        //put the target+command in w3 to make a job
        quick_action_function(target_js, "pluginid", "target");
        add_command_to_job_sc_button();
        var current_id = $("#addjob_button")[0].value;
        var secondary_output_domid = "specialupdateid"+current_id;
        id_replication_map[current_id] = secondary_output_domid;
        var console_io = make_one_terminal_command(secondary_output_domid, cmd_string);
        var output_list = $("#terminal-active-history");
        output_list.append(console_io);
        terminal_cmd.val("");
        var container = document.getElementById('terminal-cmd-list');
        var scrollTo = document.getElementById('terminal-cmd-bottom');
        container.scrollTop = scrollTo.offsetTop;
        execute_sequence();
    }
}
function make_one_terminal_command(secondary_output_domid, cmd_string, out_string="..."){
    return $("<li/>")
            .append($("<ul/>")
                .attr({"class":"terminal-contents"})
                .append($("<li/>")
                    .text(cmd_string)
                )
                .append($("<li/>")
                    .attr({"id": secondary_output_domid})
                    .append($("<pre/>")
                        .attr({"class":"terminal-window"})
                        .text(out_string)
                    )
                )
            )
}

function terminal_opener(event) {
    if(w3_highlighted_array.length > 0){
        sequences[active_sequence].forEach(function(value) {
            if (w3_highlighted_array.includes(Number(value))){
                as_highlighted_checker[active_sequence] = 0;
                var job_row_var = $("#jobrow"+value);
                job_row_var.removeClass('selected');
                w4_output_collapse2(job_row_var[0].rowIndex);
                var w3_content_row = w3_highlighted_array.indexOf(job_row_var[0].rowIndex);
                if(w3_content_row > -1){
                    w3_highlighted_array.splice(w3_content_row, 1);
                }
            }
        });
    }

    var button = $(event.relatedTarget); // Button that triggered the modal
    var terminal_data = button.data('terminaldata'); // Extract info from data-* attributes
    var history = $("#terminal-active-history");
    history.empty();
    var modal = $(this);
    $("#terminal-active-target-str").val(JSON.stringify(terminal_data.target));
    $("#terminal-modal-target").text(terminal_data.target.Location);
    $("#terminal-modal-plugin").text(terminal_data.target.PluginName);
    $("#terminal-modal-port").text(terminal_data.target.Port);
    var visible_commands = $("#third_box_content tr:visible");
    var visible_ouput = $("#W4Rows tr:visible");
    for (var i=0; i<visible_commands.length; i++){
        var get_job_row_id = get_number_from_id(visible_commands[i].id, "jobrow");
        if(job_row_is_mutable(get_job_row_id)){
            continue;
        }
        var command_td = $(visible_commands[i]).find("td")[3];
        var target_cells = $(visible_commands[i]).find("td span");
        var target = null;
        if (target_cells.length > 2){
            target = JSON.parse(target_cells[1].innerText);
        }
        var command_js = JSON.parse(command_td.children[0].innerText);
        if (target !== null
            && target.PluginName == terminal_data.target.PluginName
            && target.Port == terminal_data.target.Port
            && target.Location == terminal_data.target.Location
            && command_js.CommandName == "terminal_input"){
            var out_str = " ... ";
            var shortid = command_td.id.substring(9,command_td.id.length);
            var update_content = $("#updateid"+shortid+" pre");
            if (update_content.length > 0){
                out_str = update_content[0].innerText;
            }
            var console_io = make_one_terminal_command("specialupdateid"+shortid, command_js.Inputs[0].Value, out_str);
            var output_list = $("#terminal-active-history");
            output_list.append(console_io);
        }
    }
}

function terminal_opened(event){
    $("#terminal-cmd").focus();
}

function get_number_from_id(id_str, pretext){
    return id_str.substring(pretext.length, id_str.length);
}

// Two scroll bars will be in synch together
function syncScroll(element1, element2) {
    element1.scroll(function (e) {
        var ignore = ignoreScrollEvents;
        ignoreScrollEvents = false;
        if (ignore) return;
        ignoreScrollEvents = true;
        element2.scrollTop(element1.scrollTop())
    })
}

function anchor_w4_output(job_row){
    var current_status = $("#jobstatusid"+job_row+" span");
    if (current_status[0].innerText !== "Error") {
        setTimeout(function (){
            var sequence_size = sequences[1].size;
            if (job_row === sequence_size || job_row === (sequence_size - 1)) {
                var element = document.getElementById("download_link_id"+job_row);
                element.scrollIntoView({behavior: "smooth"});
            } else {
                var element = document.getElementById("updateid"+job_row);
                element.scrollIntoView({behavior: "smooth"});
            }
        }, 500);
    }
}