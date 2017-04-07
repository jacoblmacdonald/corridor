const express = require("express");
const app = express();
const port = 3000;

var http = require('http').Server(app);
var server = require('socket.io')(http);

var game = require("./game/game");

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.get("/game", function(req, res) {
	res.sendFile(__dirname + "/game.html");
});

server.on("connection", function(client) {
	console.log(client.id + " connected");
	client.emit("connected");

	client.on("message", function(message) {
		game.receive(message, client);
	});
});

http.listen(process.env.PORT || port, function() {
	console.log("listening on " + port);
});

game.setup(0, server);

module.exports = server;