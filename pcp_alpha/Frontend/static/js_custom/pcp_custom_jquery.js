/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp to add jquery functionality and other javascript resources.
-----------------------------------------------------------------------------------------------------
*/
var MAX_MANUAL_CHECK_COUNT = 30;
var INITIAL_JOB_STATUS = "Waiting";
var inc = 0;
var hover_int = 0;
var sequences = {"1": new Set()};
var sequence_starttime_map = {"1":  Math.floor((new Date().valueOf())/1000).toString()};
var id_map = {};
var id_status_map = {};
var id_reverse_map = {};
var id_replication_map = {};
var current_plugin_commands = [];
var ws_map = {};
var active_sequence = "1";
var exec_int = 0;
var job_select_table;
var w3_highlighted_row,
    w3_content_index,
    w3_highlighted_array = [],
    as_highlighted_checker = {},
    start_timer_interval,
    start_timer_map = {};

var timer_on = 1,
    time_var,
    test_server = 'ws://' + window.location.hostname + ':3000/monitor',
    test_ws = new WebSocket(test_server);
as_highlighted_checker[active_sequence] = 0;


$(document).ready(function() {
    // W4 header height === W4 header height
    var w3_header_height = $("div.box-header.w3_header_class").height();
    $("div.box-header.w4_header_class").height(w3_header_height);

    syncScroll($(".w3TableScroll"), $(".w4TableScroll"));
    syncScroll($(".w4TableScroll"), $(".w3TableScroll"));

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
    // $(".dataTables_empty").empty();
    $('#job_table tbody').on( 'click', 'tr', function () {
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

    ws_map["status"] = open_websocket("status", status_change_ws_callback);
    ws_map["files"] = open_websocket("files", files_change_ws_callback);
    ws_map['plugins'] = open_websocket("plugins", plugins_change_ws_callback);
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
            console.log("draggable object for more than one object");
            drag_target();
        } else {
            console.log("draggable object for one object");
        }
    });

    // Date Time picker
    $("#job_sequence_timer").datetimepicker({
                                             minDate: new Date(),
                                             onClose: function(dateText, inst) {
                                                 var date_split = dateText.split(" ");
                                                 var mdy = date_split[0].split("/");
                                                 var hm = date_split[1].split(":");
                                                 var dt_obj = new Date(Number(mdy[2]),
                                                                       Number(mdy[0])-1,
                                                                       mdy[1],
                                                                       hm[0],
                                                                       hm[1], 0, 0);
                                                 var py_dt = Math.floor(dt_obj.getTime()/1000).toString();
                                                 $("#job_sequence_time_unix")[0].value = py_dt;
                                                 sequence_starttime_map[active_sequence] = py_dt;
                                             },
                                             onSelect: function (selectedDateTime){
                                             }});
    var startup_date = new Date();
    $("#job_sequence_time_unix")[0].value = Math.floor(startup_date.getTime()/1000).toString();
    $("#job_sequence_timer").datepicker( "setDate", startup_date );


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

});

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
    }
}

function status_change_ws_callback(message) {
    console.log(message);
    var data = null;
    if ('data' in message && message.data != null && message.data[0] == "{") {
        data = JSON.parse(message.data);
        var job_id = null;
        if ("id" in data) {
            job_id = data.id;
            if (job_id in id_reverse_map) {
                var job_dom_id = id_reverse_map[job_id];
                id_status_map[job_dom_id] = data.status;
                status_change_update_dom(job_dom_id, data.status);
            }
        }
    }
}

function files_change_ws_callback(message){
    if (message.data.length > 0 && message.data[0] == "{"){
        $("#upload_files_need_refreshed").show();
    }

}

function plugins_change_ws_callback(message){
    if (message.data.length > 0 && message.data[0] == "{"){
        $("#plugins_need_refreshed").show();
    }
}

// ** TESTING ONLY **
// Testing the websocket - for job status
function test_ws_callback(message) {
    console.log(message);
    var data = {};
    if ('data' in message) {
        data = JSON.parse(message.data);
    }
    console.log(data);
    var job_id = null;
    if ("id" in data) {
        job_id = data.id;
    }
    console.log(job_id);
    console.log(id_reverse_map);
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
            target_json = $("#name_tag_id"+row_id+" a span")[0].innerHTML,
            target = JSON.parse(target_json);
        if (target.PluginName.toLowerCase().includes(filter_content)  || target.Location.toLowerCase().includes(filter_content) ){
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

function onLoadTest(element, element_two){
    $(element).addClass('loaded');
    $(element_two).addClass('loaded');
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
        w3_scroll = $(".w3TableScroll"),
        w4_scroll = $(".w4TableScroll");

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
            w3_scroll[0].style.maxHeight = "330px";
            w4_scroll[0].style.maxHeight = "330px";
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
            w3_scroll[0].style.maxHeight = "330px";
            w4_scroll[0].style.maxHeight = "330px";
        }
    } else if (widget === 'w3') {
        if(w3_col_id[0].children[0].classList[1] !== "fa-minus") {
            w1_scroll.removeAttr('style');
            w2_scroll.removeAttr('style');
            setTimeout(function() {
                onLoadTest(w1_scroll, w2_scroll);
            }, 500);
        }
        else if(w3_col_id[0].children[0].classList[1] === "fa-minus") {
            w1_scroll.removeClass('loaded');
            w2_scroll.removeClass('loaded');
            w1_scroll[0].style.maxHeight = "330px";
            w2_scroll[0].style.maxHeight = "330px";
        }
    } else if (widget === 'w4'){
        if(w4_col_id[0].children[0].classList[1] !== "fa-minus") {
            w1_scroll.removeAttr('style');
            w2_scroll.removeAttr('style');
            setTimeout(function() {
                onLoadTest(w1_scroll, w2_scroll);
            }, 500);
        }
        else if(w4_col_id[0].children[0].classList[1] === "fa-minus") {
            w1_scroll.removeClass('loaded');
            w2_scroll.removeClass('loaded');
            w1_scroll[0].style.maxHeight = "330px";
            w2_scroll[0].style.maxHeight = "330px";
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
//    console.log("get_commands_func");  // debug
//    console.log($(this)[0].parentElement.id);

    // plugin name the user clicked
    var row_id = $(this)[0].parentElement.id.substring(10, $(this)[0].id.length);
    var plugin_name_var = $("#name_tag_id"+row_id+" a span")[1].innerText;
    var check_content_var = false;
    var quick_action_button;
    var argid = 0;

    $.ajax({
        type: "GET",
        url: "/action/get_command_list/",
        data: {"plugin_name": plugin_name_var},
        datatype: 'json',
        success: function(data) {
            // check if w2 should re-render or not
            current_plugin_commands = data;
            if($(".theContent li a").length > 0){
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

        	$(".theContent").empty();
            
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
            $(".theContentHeader")
                .append("<h2 class='box-title'/>")
                .text(plugin_name_var + "  command list");

            // User selects a command from W2
            $("a.acommandclass").click(function(){
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
                $(".tooltipContent")
                    .append("<pre>" + current_command_template.Tooltip + "</pre>");

                //footer
                $(".theContentArgument").empty();
                $(".theContentArgument")
                    .append($("<div id='commandIdBuilder'/>")
                        .text($(this)[0].text));
                // JSON development data on W2 footer
                // $(".theContentArgument")
                //     .append($("<div id='JSON_Command_DATA'/>")
                //         .addClass("text-muted small")
                //         .text(JSON.stringify(current_command_template)));

                // quick action button to add command template to a highlighted job row
                quick_action_button = $("<a/>")
                        .attr({"href": "#",
                            "id": "add_command_to_job_id",
                            "class":"btn btn-social-icon btn-linkedin btn-xs pull-right"})
                        .append($("<i/>").attr({"id": "add_command_to_job_id2" ,"class": "fa fa-tasks"}));
                $("#commandIdBuilder").append(quick_action_button);


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
        	console.log("ERROR @ get_commands_func function");
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
                .attr({"style": "display:none"})
                .append(target_js_str));

    }
}

function load_job_state(){
    $("#download_status").removeClass("fa-cloud-download");
    $("#download_status").removeClass("fa-money");
    $("#download_status").addClass("fa-hourglass-end");
    $.ajax({
        type: "GET",
        url: "/action/load_state/",
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
            set_w3_job_status(full_update=true);
            synchronize_job_sequence_tabs(active_sequence);
            synchronize_output_sequence_tabs(active_sequence);
            $("#download_status").removeClass("fa-hourglass-end");
            $("#download_status").addClass("fa-money");
            setTimeout( function() {
                $("#download_status").removeClass("fa-money");
                $("#download_status").addClass("fa-cloud-download");
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
    $("#upload_status").removeClass("fa-cloud-upload");
    $("#upload_status").removeClass("fa-money");
    $("#upload_status").addClass("fa-hourglass-end");
    var local_sequences = JSON.parse(JSON.stringify(sequences, json_set_to_list));
    var data_package = {"id_map": id_map,
                        "id_reverse_map": id_reverse_map,
                        "id_status_map": id_status_map,
                        "sequence_starttime_map": sequence_starttime_map,
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
    // console.log("add_target_to_job_sc");  // debug
    var w1_target_row_id = $(this)[0].parentElement.parentElement.parentElement.id.substring(10, $(this)[0].id.length),
        row_js_str = $("#nameidjson" + w1_target_row_id)[0].innerText;
        // json_target_id = $(this)[0].parentElement.parentElement.parentElement.children[0].children[0].children[0].id,
        // json_target_data = $("#"+json_target_id)[0].innerText;

    quick_action_function(row_js_str, "pluginid", "target");
    set_w3_job_status();


}

function add_command_to_job_sc_button(){
    // console.log("add_command_to_job_sc_button");
    var command_temp_str = JSON.stringify(current_command_template);  // command template as a string
    quick_action_function(command_temp_str,"commandid", "command");
    set_w3_job_status();  // setting w3 job status
}

function hide_current_sequence(e){
    sequences[active_sequence] = new Set();
    synchronize_sequence_tab_rows(active_sequence);
}
function add_sequence_tab(clear=true){
    var next_tab =  $("#jobq_tabs").children().length;
    if (clear){
        sequences[next_tab] = new Set();
    }
    var new_tab_start_time =  Math.floor((new Date().valueOf()) / 1000);
    sequence_starttime_map[next_tab] = new_tab_start_time.toString();
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
    $("#outq_"+next_tab).tab('show');
    $("#jobq_"+next_tab).tab('show')
}
function synchronize_job_sequence_tabs(tab_id){
    active_sequence = tab_id;
    var other_tab = $('#output_tabs a[href="#outq_'+tab_id+'"]');
    other_tab.tab('show');
    synchronize_sequence_tab_rows(tab_id);
    as_checker_func(active_sequence);
}
function synchronize_output_sequence_tabs(tab_id){
    active_sequence = tab_id;
    var other_tab = $('#jobq_tabs a[href="#jobq_'+tab_id+'"]');
    other_tab.tab('show');
    synchronize_sequence_tab_rows(tab_id);
    as_checker_func(active_sequence);
}
function synchronize_sequence_tab_rows(sequence_id){
    var _dt = new Date(Number(sequence_starttime_map[sequence_id]) * 1000);
    var display_date = $.datepicker.formatDate('mm/dd/yy ', _dt);
        display_date += ("0" + _dt.getHours()).slice(-2);
        display_date += ":";
        display_date += ("0" + _dt.getMinutes()).slice(-2);
    $("#job_sequence_time_unix")[0].value = sequence_starttime_map[sequence_id];
    $("#job_sequence_timer")[0].value = display_date;
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
    // console.log("add_new_job");
    inc++;
    $("#addjob_button")[0].value = inc;

    var value = $("#addjob_button")[0].value;
    sequences[active_sequence].add(value);
    // content for w3
    $(".thirdBoxContent")
        .append($("<tr/>")
            .attr({"role": "row","onclick": "#","id":"jobrow"+value,"class": "draggable_tr divw3row",
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

// Clear job content in w3
function clear_new_jobs(){
    $(".thirdBoxContent").empty();
    $("#W4Rows").empty();
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
   // console.log("drag_target");
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
    // console.log("display_drop_all");
    $("#w3_drop_target_to_all").css("display", "");
    // hover_int = 1;
}
function hide_drop_all(){
    $("#w3_drop_target_to_all").css("display", "none");
    hover_int = 0;
}

function hover_w3_for_target(){
//    console.log("hover_w3_for_target");
    $("#w3_drop_target_to_all").mouseover(hover_drop);
    $("#w3_drop_target_to_all").mouseover(hover_leave);
    $("#third_box_content tr").mouseover(hover_drop);
    $("#third_box_content tr").mouseleave(hover_leave);
}

//    future animation
function hover_leave(){
//    console.log("hover_leave");  // debug
    hover_int = 0;
}

function hover_drop(){
    // console.log("hover_drop");
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
        console.log("not dragging the object over a validated job row");
        hover_int = 0;
    }
}

// Drop target to W3
function drop_target(hover_object){
    // console.log("drop_target");  // debug
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
                // console.log(selected_var);
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
                                                   current_status[0].innerText == "Invalid" ||
                                                   current_status[0].innerText == "Preparing" ||
                                                   current_status[0].innerText == "Stopped"  ||
                                                   current_status[0].innerText == "Error")));
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
//    console.log("drop_command");  // debug
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
            console.log("Status is done and plugin and command are filled up in the job row");
        }
    }
}


function drop_command_to_multiple(ev) {
   // console.log("drop_command_to_multiple");  // debug
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
   // console.log("drop_command_into_hole");
    var current_status = $("#jobstatusid"+row_id+" span");
    var MAX_DISPLAY_ARGUMENT = 36;
    if ((current_status.length == 0) ||
        (current_status.length >=1 && command_td.length == 1 && ( current_status[0].innerText == "Invalid" ||
                                                                  current_status[0].innerText == "Valid" ||
                                                                  current_status[0].innerText == "Preparing" ||
                                                                  current_status[0].innerText == "Stopped"  ||
                                                                  current_status[0].innerText == "Error")
        )
    ){
        command_td.empty();
        var new_div = document.createElement("div");
        new_div.innerText = command_json;
        new_div.style.display = 'none';
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
    } else {
        console.error("Can't drop command into job "+row_id+" (job already in Brain)");
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
}

// Execute Sequence function down below are for w3+w4
function execute_sequence(){
   // console.log("execute_sequence function has been called");  // debug
    exec_int = 1;
    hide_drop_all();
    var jobs = prepare_jobs_list();
    var jobs_json = JSON.stringify(jobs);
    var sequence_start_time;
    $.ajax({
        type: "GET",
        url: "/action/get_w3_data/",
        data: {"jobs": jobs_json},
        datatype: 'json',
        success: function(data) {
            var job_ids = data.generated_keys;
            job_id = job_ids[0];
            sequence_start_time = parseInt(sequence_starttime_map[active_sequence]);
            for (var index = 0; index < job_ids.length; ++index) {
                if (job_ids[index] != "invalid-job"){
                    var dom_id = index+1;
                    id_reverse_map[job_ids[index]] = dom_id;
                    id_map[index+1] = job_ids[index];

                    if (ws_map['status'].readyState === ws_map['status'].OPEN) {
                        $("#updateid" + dom_id).empty();
                        final_countdown_function(sequence_start_time, dom_id);
                    } else {
                        execute_sequence_output(job_ids[index]);
                    }

                }
            }
        },
        error: function (data) {
            console.log("ERROR @ execute_sequence function")
        },
        complete: function(data){
            exec_int = 0;
        }
    })
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


function render_job_output_to_page(job_guid, data){
    var updateid = id_reverse_map[job_guid];
    clearInterval(start_timer_map[updateid]);
    $("#updateid"+updateid).empty();
    $("#updateid"+updateid).attr({"class": ""});
    $("#update_spin"+updateid).remove();
    $('<pre id="updatecontent'+updateid+'"></pre>').appendTo("#updateid"+updateid);
    $("#updatecontent"+updateid).text(data['Content']);
    var download_link = $('<a>[Download]</a>');
    download_link.attr({"href": "/action/get_full_output_data/?job_id="+job_guid+"&job_number="+updateid});
    $("#updateid"+updateid)
        .append($("<div style='background-color: white'/>")
            .append(download_link));
    $("#updateid"+updateid).parent().css("background-color", "Fuchsia");
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
}

function render_job_output_to_secondary(secondary_id, data)
{
    console.log(data);
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
            console.log("SUCCESS @ execute_sequence_output  function");

            if (data != 0){  // returns query
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
            console.log("ERROR @ execute_sequence_output function");
            $("#updateid"+updateid).empty();
            $("#updateid"+updateid).attr({"class": "fa fa-refresh fa-spin"});
        }
    }).fail(function(data){
        console.log("FAIL @ execute_sequence_output  function");

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

function syncScroll(element1, element2) {
    element1.scroll(function (e) {
        var ignore = ignoreScrollEvents;
        ignoreScrollEvents = false;
        if (ignore) return;
        ignoreScrollEvents = true;
        element2.scrollTop(element1.scrollTop())
    })
  }