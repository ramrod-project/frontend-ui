var inc = 1;
$(document).ready(function() {
	$("tr.clickable-row").click(get_capabilities_func);   // displays commands in w2
	$("#addjob_button").click(add_new_job);               // add new job in w3 
	$("#addjob_button").click(function(){
	    inc++;
	    $("#addjob_button")[0].value = inc;
	});

	$("#clear_buttonid").click(clear_new_jobs);           // clear content in w3
//	$("#execute_button").click(execute_sequence);         // execute sequence button in 23
});

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w2
-----------------------------------------------------------------------------------------------------
*/

// List of commands based off of plugin name
function get_capabilities_func(){
    $(".tooltipHeader").empty();

    // plugin name the user clicked
    var plugin_name_var = $(this)[0].firstElementChild.textContent;
    console.log(plugin_name_var);

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
        	for(var i = 0; i < data.length; i++) {
                $(".theContent").append($("<li id='commandid' class='commandclass' onclick='#'/>").append($("<a id='acommandid' class='acommandclass' href='#'/>").text(data[i].CommandName)));
            }
            $(".theContent").append("<div/>").attr({"style": "width:250px"});
            $(".theContentHeader").append("<h2 class='box-title'/>").text(plugin_name_var + "  command list");

            // User selects a command from W2
            $("a.acommandclass").click(function(){
                //Compare user selection of command to query
                for(var i2 = 0; i2 < data.length; i2++) {
                    if(data[i2].CommandName == $(this)[0].text){
                        arg_int = data[i2].Inputs.length;
                    }
                }
                //tooltip
                $(".tooltipHeader").empty();
                $(".tooltipHeader").append($("<p/>").append($("<b/>").text("Tooltip:")));
                $(".tooltipContent").empty();
                for(var i = 0; i < data.length; i++) {
                    if(data[i].CommandName == $(this)[0].text){
                        $(".tooltipContent").append("<pre>" + data[i].Tooltip + "</pre>");
                    }
                }

                //footer
                $(".theContentArgument").empty();
                var input_str = "<input id='argumentid' placeholder='Argument 1 Here'/>"
                var int = 1;
                var argumentid_num = 2;
                while (int < arg_int){
                var argumentid_num = int + 1;
                var input_str2 = " &nbsp;&nbsp; " + "<input id='argumentid"+ int + "' placeholder='Argument " + argumentid_num + " Here'/>"
                    input_str = input_str + input_str2;
                    int++;
                }
                $(".theContentArgument").append("<a id='commandIdBuilder'>" +$(this)[0].text + "</a>" + " &nbsp;&nbsp; " + input_str);

            });
        },
        error: function (data) {
        	console.log("ERROR FUNCTION CALLED");
        	console.log(data);
        }
    })
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
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row", "onclick": "#"}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text("1"))),
            $("<td/>").attr({"id": "pluginid" + 1,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "addressid" + 1,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"ondrop": "drop_command(event)",
                             "ondragover": "allowDropCommand(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text("")))
        ));
    }
    else {
        $(".thirdBoxContent").append($("<tr/>").attr({"role": "row", "onclick": "#"}).append(
            $("<td/>").append($("<a/>").attr({"href": "#"}).append($("<span/>").text(value))),
            $("<td/>").attr({"id": "pluginid" + value,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"id": "addressid" + value,
                             "ondrop": "drop(event)",
                             "ondragover": "allowDrop(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text(""))),
            $("<td/>").attr({"ondrop": "drop_command(event)",
                             "ondragover": "allowDropCommand(event)"}).append($("<a/>").attr({"href": "#"}).append($("<span/>").text("Command Here")))
        ));
    }


}

// Clear job content in w3
function clear_new_jobs(){
    $(".thirdBoxContent").empty();
    inc = 1;
    $("#addjob_button")[0].value = 0;
}

// Drag and drop function(s) for w1+w3 or w2+w3
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.cells[0].id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var data_copy = document.getElementById(data).cloneNode(true);

    var addressid_data = document.getElementById(data);
    var addressid_var;
    if(addressid_data){
        addressid_var = addressid_data.nextElementSibling.id;
    }

    var data_copy2 = document.getElementById(addressid_var).cloneNode(true);
    data_copy2.id = "newIdTwo";

    data_copy.id = "newId";
    ev.target.appendChild(data_copy);
    ev.target.nextElementSibling.appendChild(data_copy2);
}

// Drag and drop function(s) for command
// Note: Drop function for command is not currently done
function drag_command(ev) {
    ev.dataTransfer.setData("text", ev.explicitOriginalTarget.firstElementChild.id);
}

function allowDropCommand(ev) {
    ev.preventDefault();
}

function drop_command(ev) {
    ev.preventDefault();

    var data = ev.dataTransfer.getData("text");
    var data_copy = document.getElementById(data).cloneNode(true);

    var argumentid_data = document.getElementById(data);
    var argumentid_var;
    if(argumentid_data){
        argumentid_var = argumentid_data.nextElementSibling.value;
    }

    data_copy.id = "newCommandId";
    ev.target.appendChild(data_copy);
}

// Execute Sequence function down below are for w3+w4
function execute_sequence(){
    console.log("execute_sequence function has been called");
}

/*
-----------------------------------------------------------------------------------------------------
Functions down below are for w4
-----------------------------------------------------------------------------------------------------
*/