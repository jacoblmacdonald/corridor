// ////////////////////
// I N I T
// ///////////////////////////////////////

//game info
var socket = io();
var CURRENT_USER = "";

$(window).on("load", function() {
	getSession();
});

function getSession() {
	$.ajax({
		type: 'GET',
		//data: JSON.stringify(loginData),
		contentType: 'application/json',
		url: '/getThisUser',
		success: function(data){
			CURRENT_USER = data;
			startPage();
		}
	});
}

function startPage() {
	socket.emit("setup", { "gameId" : getId(), "username" : CURRENT_USER });
}

function getId() {
    return window.location.href.split("=")[1];
}

socket.on("ready", function(message) {
	console.log(message.usernames);
	console.log(message.items);
});