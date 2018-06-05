var selected_target_template = {}
var inc = 1;
$(document).ready(function() {
	$("tr.clickable-row").click(get_commands_func);   // displays commands in w2

	var row_selection = $('#target_table').DataTable({  //for w1+w3
	    searching: false,
	    paging: false,
	    bInfo: false,
        rowReorder: true,
        select: true
	});

	$(".gridSelect tbody tr").click(target_select_func(row_selection));  // highlight target in w1 to drag to w3
	$("#addjob_button").click(add_new_job);               // add new job in w3
	$("#addjob_button").click(function(){
	    inc++;
	    $("#addjob_button")[0].value = inc;
	});

	$("#clear_buttonid").click(clear_new_jobs);           // clear content in w3
	$("#execute_button").click(execute_sequence);         // execute sequence button in 23

    $("#w3_drop_to_all").attr({"ondrop": "drop_command_to_multiple(event)",
                               "ondragover": "allowDropCommand(event)"});

});

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w2
-----------------------------------------------------------------------------------------------------
*/

// List of commands based off of plugin name

var current_command_template = {}

function get_commands_func(){
    $(".tooltipHeader").empty();

    // plugin name the user clicked
    var row_id = $(this)[0].id.substring(10, $(this)[0].id.length);

    var plugin_name_var = $("#name_tag_id"+row_id+" a span")[1].innerText;
//    console.log(plugin_name_var);

    $.ajax({
        type: "GET",
        url: "/action/get_command_list/",
        data: {"plugin_name": plugin_name_var},
        datatype: 'json',
        success: function(data) {
            // empty content in w2
        	$(".theContent").empty();
        	$(".theContentArgument").empty();
        	$(".theContentHeader").empty();
        	$(".tooltipContent").empty();

            // display command(s) in w2
            if (data.length == 1){
                $(".theContent").append($("<li/>").text(data));
            }
            else{
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
        	//console.log(data);
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

// Add new job
function add_new_job(){
    var value = $("#addjob_button")[0].value;

    // content for w3
    if(value == 0 || value == 1) {
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row", "onclick": "#", "id":"jobrow"+1, "class": "draggable_tr divw3row"}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text("1"))),
            $("<td/>").attr({"id": "pluginid" + 1,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "addressid" + 1,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "commandid" + 1,
                             "ondrop": "drop_command(event)",
                             "ondragover": "allowDropCommand(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "jobstatusid" + 1})
        ));

        // W4 Rows
        $(".W4BodyContent").append($("<tr/>").append(
        $("<th/>").text("1"),
        $("<th/>").append($("<a/>").attr({'id': 'updateid1'}).text("terminal1")),
        $("<th/>").attr({"id": "updatestatusid" + 1})
        ));

    }
    else {
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row", "onclick": "#", "id":"jobrow"+value, "class": "draggable_tr divw3row"}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text(value))),
            $("<td/>").attr({"id": "pluginid" + value,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "addressid" + value,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
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
    inc = 1;
    $("#addjob_button")[0].value = 0;
}

// Drag and drop function(s) for w1+w3 or w2+w3

// Drag and drop function(s) for targets
// Note: Drop function needs to be validated
function target_select_func(row_selection){
//    console.log("target_select_func function was called");
    row_selection.on('select', function(e, dt, type, indexes) {
        var selected_var = $(".gridSelect tbody tr.selected");
        if(selected_var.length > 1){
            console.log("draggable object for more than one object");
        } else {
            console.log("draggable object for one object");
        }
    });

//    DRAG
	$(".gridSelect tbody tr, .gridSelect2 tbody tr").draggable({
	    helper: function(){
//	        console.log("draggable");
	        var selected_var = $(".gridSelect tbody tr.selected");
            if (selected_var.length === 0) {
                selected_var = $(this).addClass('selected');
            }
//            console.log(selected_var);
            var container = $('<table/>').attr({'id':'draggingContainer'});
            container.append(selected_var.clone().removeClass("selected"));
//            console.log(container);
            return container;
	    }
	});

    $(document).on('mouseenter', '.divw3row', function () {
        var hover_object = $(this);
        var hover_object_id = hover_object[0].id;
        var hover_object_num = hover_object_id.substring(6, hover_object_id.length);
        // animation of some sort?

        // status box
        var plugin_name_text = hover_object[0].children[1].innerText;
        var location_text = hover_object[0].children[2].innerText;
        var command_text = hover_object[0].children[3].innerText;
        var status_text = hover_object[0].children[4].innerText;

        if (plugin_name_text && location_text && command_text != "" && status_text == false){
//            $("#jobstatusid"+hover_object_num).empty()
            $("#jobstatusid"+hover_object_num).append($("<span/>").attr({"class": "label label-warning"}).text("Preparing"));
        }
        //DROP
        $(".gridSelect, .divw3row").droppable({
            drop: function (event, ui) {
//                console.log("DROP");
                var selected_var = ui.helper.children();

                for(var int = 0; int < selected_var.length; int++){
                    var row_id = selected_var[int].id;
                    var row_id_str = row_id.substring(10,row_id.length);
                    var row_js = JSON.parse($("#nameidjson" + row_id_str)[0].innerText);

                    if (int != 0){
                        hover_object.nextUntil()[(int -1)].children[1].append(row_js.PluginName);
                        hover_object.nextUntil()[(int -1)].children[2].append(row_js.Location);
                    } else{
                        hover_object[0].children[1].append(row_js.PluginName);  // PluginName
                        hover_object[0].children[2].append(row_js.Location);  //Location
                    }

                    // status box
                    if (hover_object[0].children[1].innerText && hover_object[0].children[2].innerText && hover_object[0].children[3].innerText != ""){
                        if (int != 0){
                            var plugin_name_text = hover_object.nextUntil()[(int -1)].children[1].innerText;
                            var location_text = hover_object.nextUntil()[(int -1)].children[2].innerText;
                            var command_text = hover_object.nextUntil()[(int -1)].children[3].innerText;

                            if (plugin_name_text && location_text && command_text != ""){
                                $("#jobstatusid"+(parseInt(hover_object_num)+int)).empty();
                                $("#jobstatusid"+(parseInt(hover_object_num)+int)).append($("<span/>").attr({"class": "label label-warning"}).text("Preparing"));
                            }
                        } else {
                            $("#jobstatusid"+(parseInt(hover_object_num)+int)).empty();
                            $("#jobstatusid"+(parseInt(hover_object_num)+int)).append($("<span/>").attr({"class": "label label-warning"}).text("Preparing"));
                        }
                    }
                }
                $('.selected');
            }
        });
    }).on('mouseleave', '.divw3row', function () {
        // if animations, animations would reset
    });
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
    console.log("drop_command");
    var num_jobs = $("#addjob_button")[0].value;
    var w3_rows = $("#third_box_content tr");



    ev.preventDefault();
    var command_json = ev.dataTransfer.getData("text");
    $("#w3_drop_to_all").css("display", "none");
    var command = JSON.parse(command_json);
    //ev.target.appendChild(argumentid_var);
    var command_hole = $(ev.target);
    while (command_hole[0].tagName != "TD"){
        command_hole = command_hole.parent();
    }
    command_hole.empty();
    var new_div = document.createElement("div");
    drop_command_into_hole(command, command_json, command_hole);

    for (var j = 0; j < num_jobs - 1 ; j++){
        var what = w3_rows[j];
        var plugin_name_text = w3_rows[j].children[1].innerText;
        var location_text = w3_rows[j].children[2].innerText;
        var command_text = w3_rows[j].children[3].innerText;
        var w3_status = w3_rows[j].children[4].innerText;

        if(plugin_name_text && command_text){
            console.log("TRUE");
            $("#jobstatusid"+(j+1)).empty()
            $("#jobstatusid"+(j+1)).append($("<span/>").attr({"class": "label label-warning"}).text("Preparing"));
        } else {
            console.log("FALSE");
        }
    }
}

function drop_command_to_multiple(ev) {
    ev.preventDefault();
    var command_json = ev.dataTransfer.getData("text");
    $("#w3_drop_to_all").css("display", "none");
    var command = JSON.parse(command_json);
    var num_jobs = $("#addjob_button")[0].value;
    for (var j = 1; j < num_jobs; j++){
        var command_td = $("#commandid"+j);
        if (command_td.length == 1){
            drop_command_into_hole(command, command_json, command_td);
            $("#jobstatusid"+j).empty()
            $("#jobstatusid"+j).append($("<span/>").attr({"class": "label label-warning"}).text("Preparing"));
        }
    }
}

function drop_command_into_hole(command, command_json, command_td){
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
}

// Execute Sequence function down below are for w3+w4
function execute_sequence(){
//    console.log("execute_sequence function has been called");
    var jobs = []
    var num_jobs = $("#addjob_button")[0].value;
    var w3_rows = $("#third_box_content tr");

    for (var j = 0; j < num_jobs - 1; j++){
        var w3_status = w3_rows[j].children[4].innerText;
        if(w3_status == false){
            $("#updatestatusid"+(j+1)).append($("<span/>").attr({"class": "label label-danger"}).text("Error"));
            $("#jobstatusid"+(j+1)).append($("<span/>").attr({"class": "label label-danger"}).text("Error"));
            jobs.push({});
        } else {
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
                       "JobCommand": command}
            jobs.push(job);
        }
    }
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
                    execute_sequence_output(job_ids[index], index+1);
                }
            }
        },
        error: function (data) {
            console.log("ERROR @ execute_sequence function")
        }

    })
}

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w4
-----------------------------------------------------------------------------------------------------
*/
// Modify function add depth parameter, increment depth when it errors
function execute_sequence_output(specific_id, updateid, counter=0, backoff=2000){
//    console.log("execute_sequence_output function");
    $.ajax({
        type: "GET",
        url: "/action/get_output_data/",
        data: {"job_id": specific_id},
        datatype: 'json',
        success: function(data) {
            for (var j = 1; j < inc; j++){
                if($("#jobstatusid"+j)[0].innerText == 'Error'){
                } else {
                    $("#updatestatusid"+j).empty();
                    $("#updatestatusid"+j).append($("<span/>").attr({"class": "label label-info"}).text("Done"));
                    $("#jobstatusid"+j).empty();
                    $("#jobstatusid"+j).append($("<span/>").attr({"class": "label label-info"}).text("Done"));
                }
            }

            if (data != 0){  // returns query
//                console.log("Does not equal to zero");
                //data output here
                $("#updateid"+updateid).empty();
                $('<pre id="updatecontent'+updateid+'"></pre>').appendTo("#updateid"+updateid);
                $("#updatecontent"+updateid).append(JSON.stringify(data['Content']));
                var download_link = $('<a>[Download]</a>');
                download_link.attr({"href": "/action/get_full_output_data/?job_id="+specific_id});
                //download_link.appendTo($("#updateid"+updateid));
                $("#updateid"+updateid).append($("<div style='background-color: white'/>").append(download_link));
                $("#updateid"+updateid).parent().css("background-color", "Fuchsia");


            } else {  // doesn't return query
//                console.log("data equals to zero");
                $("#updateid"+updateid).empty();
                $("#updateid"+updateid).append("No data to return at the moment :(");
                $("#updateid"+updateid).parent().css("background-color", "white");
            }
        },
        error: function (data) {
            // sleep
            // increment depth
            // re-call execute_sequence_output function again
            console.log("ERROR @ execute_sequence_output function");
//            console.log(data);
        }
    }).fail(function(data){
//        console.log("FAIL FUNCTION");

        var status = data.status;
        var reason = data.responseJSON.reason;

//        console.log(status);
//        console.log(reason);

        if(counter == 10){
//            console.log("About to BREAK");
            $("#updateid"+updateid).empty();
            $("#updateid"+updateid).append("No data to return at the moment :(");
            $("#updateid"+updateid).parent().css("background-color", "white");
        } else {
            counter++;
//            console.log("Check again");
            setTimeout( function() { execute_sequence_output(specific_id, updateid, counter); }, backoff*2 );
        }

    })
}
