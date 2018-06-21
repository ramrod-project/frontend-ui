/*
-----------------------------------------------------------------------------------------------------
This file was created for project pcp to add jquery functionality and other javascript resources.
-----------------------------------------------------------------------------------------------------
*/

var inc = 0;
var hover_int = 0;
var sequences = {"1": new Set()};
var id_map = {};
var id_reverse_map = {};
var ws_map = {};
var active_sequence = "1";
var exec_int = 0;

$(document).ready(function() {
	$("tr td.clickable-row-col1").click(get_commands_func);   // displays commands in w2
	$("tr td.clickable-row-col2").click(get_commands_func);   // displays commands in w2
	$("tr td.clickable-row-col3").click(get_commands_func);   // displays commands in w2
	$("tr td span a.btn-linkedin").click(add_target_to_job_sc_button);  // target to job shortcut button

	var row_selection = $('#target_table').DataTable({  //for w1+w3
	    searching: false,
	    paging: false,
	    bInfo: false,
        rowReorder: true,
        select: true                                    // highlight target row in w1
	});

    row_selection.on('select', function(e, dt, type, indexes) {  // user clicks on target row to start drag
        var selected_var = $(".gridSelect tbody tr.selected");
        if(selected_var.length > 0){
            console.log("draggable object for more than one object");
            drag_target();
        } else {
            console.log("draggable object for one object");
        }
    });

	$("#addjob_button").click(function(){

	});
	$("#addjob_button").click(add_new_job);               // add new job in w3
	$("#clear_buttonid").click(clear_new_jobs);           // clear content in w3
	$("#execute_button").click(execute_sequence);         // execute sequence button in 23
    $("#w3_drop_to_all").attr({"ondrop": "drop_command_to_multiple(event)",
                               "ondragover": "allowDropCommand(event)"});
    $("#dvader_nooo_id").click(easter_egg_one);           // dvader nooo audio
    $("#searchNameHere_id").change(filter_w1);
    $("#searchNameHere_id").keyup(filter_w1);
    $("#w1_command_active_filter").css("display", "none");
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
                        var row_js = JSON.parse($("#nameidjson" + row_id_str)[0].innerText);
                        $("#addressid"+i)[0].innerText = row_js.Location;
                        $("#pluginid"+i)[0].innerText = row_js.PluginName;
                    }
                }
                set_w3_job_status();
                $('.selected');
            }
        }
    });

});

function debug_local(param1){
    return console.log(JSON.stringify(param1));
}

/*
-----------------------------------------------------------------------------------------------------
Websockets functions
-----------------------------------------------------------------------------------------------------
*/

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
    }

    // receive message
    ws.onmessage = function (message) {
        callback(message);
    }
    return ws;
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
ws_map["status"] = open_websocket("status", test_ws_callback);
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

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w2
-----------------------------------------------------------------------------------------------------
*/

// List of commands based off of plugin name
var current_command_template = {}

function filter_w1(){
    var filter_content = $("#searchNameHere_id")[0].value.toLowerCase();
    var filter_display = $("#w1_command_active_filter");
    var num_targets = 2;
    if (filter_content.length == 0){
        filter_display.css("display", "none");
    } else {
        filter_display.css("display", "");
        filter_display[0].innerText = "Currently filtering on: "+filter_content;
    }
    var to_filter = $("#target_box_contentid tr");
    for (var row_i = 0; row_i < to_filter.length; row_i++){
        var row_id = to_filter[row_i].id.substring(10, to_filter[row_i].id.length);
        var target_json = $("#name_tag_id"+row_id+" a span")[0].innerHTML;
        var target = JSON.parse(target_json);
        if (target.PluginName.toLowerCase().includes(filter_content)  || target.Location.toLowerCase().includes(filter_content) ){
            $(to_filter[row_i]).css("display", "");
        } else {
            $(to_filter[row_i]).css("display", "none");
        }
    }
}
function get_commands_func(){
//    console.log("get_commands_func");  // debug
//    console.log($(this)[0].parentElement.id);

    // plugin name the user clicked
    var row_id = $(this)[0].parentElement.id.substring(10, $(this)[0].id.length);
    var plugin_name_var = $("#name_tag_id"+row_id+" a span")[1].innerText;
    var check_content_var = false;

    $.ajax({
        type: "GET",
        url: "/action/get_command_list/",
        data: {"plugin_name": plugin_name_var},
        datatype: 'json',
        success: function(data) {

            // check if w2 should re-render or not
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
                    $(".theContent").append($("<li id='commandid' class='commandclass' onclick='#'/>").append(
                    $("<a id='acommandid' class='acommandclass' href='#'/>").text(data[i].CommandName)));
                }
            }
            $(".theContent").append("<div/>").attr({"style": "width:250px"});
            $(".theContentHeader").append("<h2 class='box-title'/>").text(plugin_name_var + "  command list");

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
                $(".tooltipHeader").append($("<p/>").append($("<b/>").text("Tooltip:")));
                $(".tooltipContent").empty();
                $(".tooltipContent").append("<pre>" + current_command_template.Tooltip + "</pre>");

                //footer
                $(".theContentArgument").empty();
                $(".theContentArgument").append($("<a id='commandIdBuilder'/>").text($(this)[0].text))
                $(".theContentArgument").append($("<div id='JSON_Command_DATA'/>").text(JSON.stringify(current_command_template)))
                for (var input_i = 0; input_i < current_command_template['Inputs'].length; input_i++){
                    //currently assumes input type is textbox
                    var new_input = document.createElement("input");
                    new_input.label = "argumentid_("+input_i+")";
                    new_input.id = "argumentid_"+input_i;
                    new_input.onchange = update_argument;
                    new_input.onkeyup = update_argument;
                    new_input.placeholder = current_command_template["Inputs"][input_i]['Value'];
                    $("#commandIdBuilder").append($("<br>")).append(new_input);
                }
            });
        },
        error: function (data) {
        	console.log("ERROR @ get_commands_func function");
        }
    })
}
function update_argument(event){
    var source = event.target || event.srcElement;
    var cmditem = source.id.substring(11,source.id.length);
    console.warn("updating commdn item "+ cmditem);
    current_command_template["Inputs"][cmditem]["Value"] = source.value;
    document.getElementById("JSON_Command_DATA").innerText = JSON.stringify(current_command_template);
}
/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w3
-----------------------------------------------------------------------------------------------------
*/


function load_job_state(){
    $.ajax({
        type: "GET",
        url: "/action/load_state/",
        datatype: 'json',
        success: function(data) {
            clear_new_jobs();
            for (var i = 0; i < data.jobs.length; i++){
                var job_id = i + 1;
                add_new_job();
                $("#pluginid"+job_id).append(data.jobs[i].plugin);
                $("#addressid"+job_id).append(data.jobs[i].address);
                var command_td = $("#commandid"+job_id);
                drop_command_into_hole(data.jobs[i].job,
                                       JSON.stringify(data.jobs[i].job),
                                        command_td,
                                        job_id);
            }
            sequences = JSON.parse(JSON.stringify(data.sequences), json_list_to_set);
            active_sequence = data.active_sequence;
            id_map = data.id_map;
            id_reverse_map = data.id_reverse_map;
            for(var i in sequences){
                if ($('#jobq_tabs a[href="#jobq_'+i+'"]').length == 0){
                    add_sequence_tab(false);
                }
            }
            set_w3_job_status();
            synchronize_job_sequence_tabs(active_sequence);
            synchronize_output_sequence_tabs(active_sequence);
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
                        "jobs": [],
                        "sequences": local_sequences,
                        "active_sequence": active_sequence};
    var num_jobs = $("#addjob_button")[0].value;
    for (var i = 1; i <= Number(num_jobs); i++){
        var plugin_name = $("#pluginid"+i)[0].innerText;
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
        data_package.jobs.push({"plugin": plugin_name,
                                "address": address,
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
    })
    var call_db = "1";
}

function add_target_to_job_sc_button(){
//    console.log("add_target_to_job_sc");  // debug

    add_new_job();
    var row_id = $(this)[0].parentElement.parentElement.parentElement.id.substring(10, $(this)[0].id.length);
    var plugin_name_var = $("#name_tag_id"+row_id+" a span")[1].innerText;
    var location_num_var = $("#address_tag_id"+row_id)[0].innerText
    $("#pluginid"+inc).append(plugin_name_var);
    $("#addressid"+inc).append(location_num_var);


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
    $('#new_jobq_button').before('<li onclick="synchronize_job_sequence_tabs('+next_tab+')"><a href="#jobq_'+next_tab+'" data-toggle="tab">'+next_tab+'</a></li>');
    $('#jobq_content').append('<div class="tab-pane" id="jobq_'+next_tab+'"></div>');
    console.warn("adding sequence ");
    //ADD THE OUTPUT TAB TOO!
    var output_tab = $("#output_tabs").append('<li onclick="synchronize_output_sequence_tabs('+next_tab+')"><a href="#outq_'+next_tab+'" data-toggle="tab">'+next_tab+'</a></li>');
    $('#outq_content').append('<div class="tab-pane" id="outq_'+next_tab+'"></div>');
    $("#outq_"+next_tab).tab('show');
    $("#jobq_"+next_tab).tab('show')
}
function synchronize_job_sequence_tabs(tab_id){
    active_sequence = tab_id;
    var other_tab = $('#output_tabs a[href="#outq_'+tab_id+'"]');
    other_tab.tab('show');
    synchronize_sequence_tab_rows(tab_id);
}
function synchronize_output_sequence_tabs(tab_id){
    active_sequence = tab_id;
    var other_tab = $('#jobq_tabs a[href="#jobq_'+tab_id+'"]');
    other_tab.tab('show');
    synchronize_sequence_tab_rows(tab_id);
}
function synchronize_sequence_tab_rows(sequence_id){
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
    var row_var = $("<td/>").attr({"id": id_parameter + num_parameter}).append($("<a/>").attr(
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
    if(value == 1) {
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row",
                                                      "onclick": "#",
                                                      "id":"jobrow" + value,
                                                      "class": "draggable_tr divw3row"}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text("1"))),
            add_new_plugin_location_job_row("pluginid", value),
            add_new_plugin_location_job_row("addressid", value),
            $("<td/>").attr({"id": "commandid" + value,
                             "ondrop": "drop_command(event)",
                             "ondragover": "allowDropCommand(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "jobstatusid" + value})
        ));

        // W4 Rows
        $(".W4BodyContent").append($("<tr/>").append(
        $("<th/>").text("1"),
        $("<th/>").append($("<a/>").attr({'id': 'updateid1'}).text("terminal1")),
        $("<th/>").attr({"id": "updatestatusid" + value})
        ));

    }
    else {
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row",
                                                      "onclick": "#",
                                                      "id":"jobrow"+value,
                                                      "class": "draggable_tr divw3row"}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text(value))),
            add_new_plugin_location_job_row("pluginid", value),
            add_new_plugin_location_job_row("addressid", value),
            $("<td/>").attr({"id": "commandid" + value,
                             "ondrop": "drop_command(event)",
                             "ondragover": "allowDropCommand(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "jobstatusid" + value})
        ));

        // W4 Rows
        $(".W4BodyContent").append($("<tr/>").append(
        $("<th/>").text(value),
        $("<th/>").append($("<a/>").attr({'id': 'updateid'+value}).text("terminal" + value)),
        $("<th/>").attr({"id": "updatestatusid" + value})
        ));
    }


}

// Clear job content in w3
function clear_new_jobs(){
    $(".thirdBoxContent").empty();
    $("#W4Rows").empty();
    id_reverse_map = {};
    id_map = {}
    for (var key in sequences){
        sequences[key] = new Set();
    }
    inc = 0;
    $("#addjob_button")[0].value = 0;
}

// Drag and drop function(s) for w1+w3 or w2+w3
// Drag and drop function(s) for targets
// Note: Drop function needs to be validated

// DRAG
function drag_target(){
    console.log("drag_target");
	$(".gridSelect tbody tr, .gridSelect2 tbody tr").draggable({
	    helper: function(){
	        var selected_var = $(".gridSelect tbody tr.selected");
            var container_to_drag;

	        if (selected_var[0] == $(this)[0]){
	            container_to_drag = selected_var;
	        } else {
	            container_to_drag = $(this);
	        }

            if (container_to_drag.length === 0) {
                container_to_drag = $(this).addClass('selected');
            } else if (container_to_drag.length == 1) {
                display_drop_all();
            }
            var container = $('<table/>').attr({'id':'draggingContainer'});
            container.append(container_to_drag.clone().removeClass("selected"));
            hover_w3_for_target();
            return container;
	    },
	    revert: function(){
	        hide_drop_all();
	        return true;
        }
	});
}
function display_drop_all(){
    $("#w3_drop_target_to_all").css("display", "");
    hover_int = 1;
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
//    console.log("hover_drop");
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
        $("#jobstatusid"+hover_object_num).append($("<span/>").attr({"class": "label label-warning"}).text("Preparing"));
    }
    if (hover_int != 0){
        drop_target(hover_object);
    } else {
        console.log("not dragging the object over a validated job row");
    }
}

// Drop target to W3
function drop_target(hover_object){
    console.log("drop_target");  // debug
    // hover_object is the row that is being hovered over
    // selected_var.length == # of targets dragging
    // hover_object.nextUntil().length == # of rows of every sequence in W3 - 1
    // next_location_num not being used but maybe in the future
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

                    if (int != 0){
                        var counter = list_cap;
                        while(hover_object.nextUntil().length > counter){
                            var next_plugin_name = hover_object.nextUntil()[counter].children[1].innerText;
                            var next_location_num = hover_object.nextUntil()[counter].children[2].innerText;
                            if (hover_object.nextUntil()[counter].style.display != 'none' && next_plugin_name.length < 1){
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
                        selected_row = hover_object[0];
                    }
                    if (selected_row != undefined){
                        var selected_row_id = selected_row.id.substring(6, selected_row.id.length);
                        if (job_row_is_mutable(selected_row_id)) {
                            $(selected_row.children[1]).empty(); //plugin column
                            $(selected_row.children[2]).empty(); //location column
                            selected_row.children[1].append(row_js.PluginName);
                            selected_row.children[2].append(row_js.Location);
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
                   (current_status.length >=1 && ( current_status[0].innerText == "Preparing" ||
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
function set_w3_job_status(){
    console.log("set_w3_job_status");
    var num_jobs = $("#addjob_button")[0].value;
    var w3_rows = $("#third_box_content tr");

    for (var j = 0; j < num_jobs; j++){
        var what = w3_rows[j];
        var plugin_name_text = what.children[1].innerText;
        var location_text = what.children[2].innerText;
        var command_text = what.children[3].innerText;
        var w3_status = what.children[4].innerText;
        var error_msg = 0;


        if(plugin_name_text && command_text && w3_status != "Done" && exec_int != 1){
            $("#jobstatusid"+(j+1)).empty()

            $("#jobstatusid"+(j+1)).append($("<span/>").attr({"class": "label label-warning"}).text("Preparing"));
        } else {
            console.log("Status is done and plugin and command are filled up in the job row");
//            error_msg = 1;
        }
    }
    //
//    if (error_msg == 1){
//
//    }
}


function drop_command_to_multiple(ev) {
//    console.log("drop_command_to_multiple");  // debug
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
//    console.log("drop_command_into_hole");  // debug
    var current_status = $("#jobstatusid"+row_id+" span");
    if ((current_status.length == 0) ||
        (current_status.length >=1 && command_td.length == 1 && ( current_status[0].innerText == "Preparing" ||
                                                                  current_status[0].innerText == "Stopped"  ||
                                                                  current_status[0].innerText == "Error")
        )
    ){
        command_td.empty();
        var new_div = document.createElement("div");
        new_div.innerText = command_json;
        new_div.style.display = 'none';
        var display_string = command['CommandName'] + " ("

        for (var j = 0; j < command["Inputs"].length; j++){
            display_string += " "+command["Inputs"][j]["Value"]
        }
        display_string += " )";
        command_td[0].appendChild(new_div);
        var display_div = document.createElement("div");
        display_div.innerText = display_string;
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
            $("#updatestatusid"+(j+1)).append($("<span/>").attr({"class": "label label-danger"}).text("Error"));
            $("#jobstatusid"+(j+1)).append($("<span/>").attr({"class": "label label-danger"}).text("Error"));
            jobs.push({});
        } else if (w3_status == "Preparing") {
            $(".gridSelect, #jobrow"+(j+1)).droppable({
                disabled: true
            });
            $("#updatestatusid"+(j+1)).empty();
            $("#updatestatusid"+(j+1)).append($("<span/>").attr({"class": "label label-success"}).text("Ready"));
            $("#jobstatusid"+(j+1)).empty();
            $("#jobstatusid"+(j+1)).append($("<span/>").attr({"class": "label label-success"}).text("Ready"));

            var uid = j+1;
            var terminal = $("#updateid"+uid).parent();
            var plugin_name = $("#pluginid"+(j+1))[0].textContent;
            var location = $("#addressid"+(j+1))[0].textContent;
            var command_json = $("#commandid"+(j+1)+" div")[0].innerText;
            var command = JSON.parse(command_json);
            var job = {"JobTarget": {"PluginName": plugin_name,
                                     "Location": location,
                                     "Port":  0,},
                       "Status": "Ready",
                       "StartTime": 0,
                       "JobCommand": command};
            jobs.push(job);
        } else {
            jobs.push({});
        }
    }
    return jobs;
}

// Execute Sequence function down below are for w3+w4
function execute_sequence(){
//    console.log("execute_sequence function has been called");  // debug
    exec_int = 1;
    hide_drop_all();
    var jobs = prepare_jobs_list();

    var jobs_json = JSON.stringify(jobs);
    $.ajax({
        type: "GET",
        url: "/action/get_w3_data/",
        data: {"jobs": jobs_json},
        datatype: 'json',
        success: function(data) {
            var job_ids = data.generated_keys;
            job_id = job_ids[0];
            for (var index = 0; index < job_ids.length; ++index) {
                if (job_ids[index] != "invalid-job"){
                    id_reverse_map[job_ids[index]] = index+1;
                    id_map[index+1] = job_ids[index];
                    execute_sequence_output(job_ids[index]);
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
function render_job_output_to_page(job_guid, data){
    var updateid = id_reverse_map[job_guid];
    $("#updateid"+updateid).empty();
    $("#updateid"+updateid).attr({"class": ""});
    $('<pre id="updatecontent'+updateid+'"></pre>').appendTo("#updateid"+updateid);
    $("#updatecontent"+updateid).append(JSON.stringify(data['Content']));
    var download_link = $('<a>[Download]</a>');
    download_link.attr({"href": "/action/get_full_output_data/?job_id="+job_guid});
    $("#updateid"+updateid).append($("<div style='background-color: white'/>").append(download_link));
    $("#updateid"+updateid).parent().css("background-color", "Fuchsia");
    $("#updatestatusid"+updateid).empty();
    $("#updatestatusid"+updateid).append($("<span/>").attr({"class": "label label-info"}).text("Done"));
    $("#jobstatusid"+updateid).empty();
    $("#jobstatusid"+updateid).append($("<span/>").attr({"class": "label label-info"}).text("Done"));
}

function render_job_output_timeout(job_guid){
    var updateid = id_reverse_map[job_guid];
    $("#updateid"+updateid).empty();
    $("#updateid"+updateid).append("No data to return at the moment :(");
    $("#updateid"+updateid).parent().css("background-color", "white");
    $("#updateid"+updateid).empty();
    $("#updateid"+updateid).attr({"class": ""});
    $("#updateid"+updateid).append("No data to return at the moment :(");
    $("#updateid"+updateid).parent().css("background-color", "white");
    // W3 status
    $("#jobstatusid"+updateid).empty();
    $("#jobstatusid"+updateid).append($("<span/>").attr({"class": "label label-danger"}).text("Error"));
    // W4 status
    $("#updatestatusid"+updateid).empty();
    $("#updatestatusid"+updateid).append($("<span/>").attr({"class": "label label-danger"}).text("Error"));
}


// Modify function add depth parameter, increment depth when it errors
function execute_sequence_output(specific_id, counter=0, backoff=2000){
//    console.log("execute_sequence_output function");  // debug
    var updateid = id_reverse_map[specific_id];
    $.ajax({
        type: "GET",
        url: "/action/get_output_data/",
        data: {"job_id": specific_id},
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
        if(counter == 10){
            render_job_output_timeout(specific_id);
        } else {
            counter++;
            setTimeout( function() { execute_sequence_output(specific_id, counter); }, backoff*2 );
        }
    })
}
