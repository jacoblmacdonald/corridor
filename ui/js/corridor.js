//game info
var socket = io();

socket.on("failure", function() {
	window.location.href = "/matchmaking?id=0";
});

socket.on("setup", function(message) {
	console.log(message.usernames);
	alert(message);
});

$(window).on("load", function() {
	socket.emit("setup", { gameId : getUrlVars("id") });
});

function getUrlVars(key) { //TEMP
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars[key];
}