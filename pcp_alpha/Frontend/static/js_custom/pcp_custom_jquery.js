var inc = 1;
$(document).ready(function() {
	$("tr.clickable-row").click(get_commands_func);   // displays commands in w2
	$("#addjob_button").click(add_new_job);               // add new job in w3 
	$("#addjob_button").click(function(){
	    inc++;
	    $("#addjob_button")[0].value = inc;
	});

	$("#clear_buttonid").click(clear_new_jobs);           // clear content in w3
	$("#execute_button").click(execute_sequence);         // execute sequence button in 23
});

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w2
-----------------------------------------------------------------------------------------------------
*/

// List of commands based off of plugin name

var current_command_template = {}

function get_commands_func(){
    console.log("get_commands_func function has been called");
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
            console.log(data);
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
        	console.log(data);
//        	$(".theContent").empty();
//        	$(".theContent").append($("<li/>").text("An error has occurred");
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
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row", "onclick": "#", "id":"jobrow"+1}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text("1"))),
            $("<td/>").attr({"id": "pluginid" + 1,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "addressid" + 1,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "commandid" + 1,
                             "ondrop": "drop_command(event)",
                             "ondragover": "allowDropCommand(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text("")))
        ));

        // W4 Rows
        $(".W4BodyContent").append($("<tr/>").append(
        $("<th/>").text("1"),
        $("<th/>").append($("<a/>").attr({'id': 'updateid1'}).text("terminal1"))
        ));

    }
    else {
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row", "onclick": "#", "id":"jobrow"+value}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text(value))),
            $("<td/>").attr({"id": "pluginid" + value,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "addressid" + value,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "commandid" + value,
                             "ondrop": "drop_command(event)",
                             "ondragover": "allowDropCommand(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text("")))
        ));

        // W4 Rows
        $(".W4BodyContent").append($("<tr/>").append(
        $("<th/>").text(value),
        $("<th/>").append($("<a/>").attr({'id': 'updateid'+value}).text("terminal" + value))
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
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    var row_data = ev.target.cells[0].id;
    var source_id = row_data.substring(11,row_data.length);
    var target_js =  JSON.parse($("#nameidjson"+source_id)[0].innerText);
    ev.dataTransfer.setData("text", JSON.stringify([target_js]));
}

function drop(ev) {
    ev.preventDefault();
    var target_json = ev.dataTransfer.getData("text");
    var target_js = JSON.parse(target_json)[0];//Loop this at a later date
    var drop_row = ev.target.id.substring(8, ev.target.id.length);
    $("#pluginid"+drop_row+" a span")[0].innerText = target_js.PluginName;
    $("#addressid"+drop_row+" a span")[0].innerText = target_js.Location;
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
}

function drop_command(ev) {
    ev.preventDefault();
    var command_json = ev.dataTransfer.getData("text");
    var command = JSON.parse(command_json);
    //ev.target.appendChild(argumentid_var);
    var command_hole = $(ev.target);
    while (command_hole[0].tagName != "TD"){
        command_hole = command_hole.parent();
    }
    command_hole.empty();
    var new_div = document.createElement("div");
    new_div.innerText = command_json;
    command_hole[0].appendChild(new_div);
    new_div.style.display = 'none';
    var display_string = command['CommandName'] + " ("
    for (var j = 0; j < command["Inputs"].length; j++){
        display_string += " "+command["Inputs"][j]["Value"]
    }
    display_string += " )"
    var display_div = document.createElement("div");
    display_div.innerText = display_string;
    command_hole[0].appendChild(display_div);

}

// Execute Sequence function down below are for w3+w4
function execute_sequence(){
//    console.log("execute_sequence function has been called");

    var jobs = []
    var num_jobs = $("#addjob_button")[0].value;
    for (var j = 1; j < num_jobs; j++){
        var uid = j;
        var terminal = $("#updateid"+uid).parent();
        terminal.css("background-color", "Chartreuse");
        var plugin_name = $("#pluginid"+j+" a span")[0].innerText;
        var location = $("#addressid"+j+" a span")[0].innerText;
        var command_json = $("#commandid"+j+" div")[0].innerText;
        var command = JSON.parse(command_json);
        var job = {"JobTarget": {"PluginName": plugin_name,
                                 "Location": location,
                                 "Port":  0,},
                   "Status": "Ready",
                   "StartTime": 0,
                   "JobCommand": command}
        jobs.push(job);
    }
    var jobs_json = JSON.stringify(jobs);
    $.ajax({
        type: "GET",
        url: "/action/get_w3_data/",
        data: {"jobs": jobs_json},
        datatype: 'json',
        success: function(data) {
//            console.log(data);
            var job_ids = data.generated_keys;
            job_id = job_ids[0];
            for (var index = 0; index < job_ids.length; ++index) {
                execute_sequence_output(job_ids[index], index+1);
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
    console.log("execute_sequence_output function");
    console.log("counter below");
    console.log(counter);


    $.ajax({
        type: "GET",
        url: "/action/get_output_data/",
        data: {"job_id": specific_id},
        datatype: 'json',
        success: function(data) {

            if (data != 0){  // returns query
                console.log("Does not equal to zero");
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
                console.log("data equals to zero");
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
            console.log(data);
        }
    }).fail(function(data){
        console.log("FAIL FUNCTION");

        var status = data.status;
        var reason = data.responseJSON.reason;

        console.log(status);
        console.log(reason);

        if(counter == 10){
            console.log("About to BREAK");
            $("#updateid"+updateid).empty();
            $("#updateid"+updateid).append("No data to return at the moment :(");
            $("#updateid"+updateid).parent().css("background-color", "white");
        } else {
            counter++;
            console.log("Check again");
            setTimeout( function() { execute_sequence_output(specific_id, updateid, counter); }, backoff*2 );
        }

    })
}
