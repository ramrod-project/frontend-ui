/*
-----------------------------------------------------------------------------
This file was created for project pcp to contain websockets connection logic
-----------------------------------------------------------------------------
*/

var status_ws = new WebSocket('ws://localhost:3000/monitor');

// Handle connection opening
status_ws.onopen = function () {
    console.log("Websocket connected!");
    status_ws.send("status");
}

// receive message
status_ws.onmessage = function (message) {
    console.log(message);
    /*// Create a new list item based on message
    var newmessage = document.createElement("li");
    var text = document.createTextNode(message.data);
    newmessage.appendChild(text);
    
    // Append to the messages list
    document.getElementById("messages").appendChild(newmessage);*/
}