const express = require("express");
const app = express();
const port = 3000;

var http = require('http').Server(app);
var server = require('socket.io')(http);

var classes = require("./classes");
var User = classes.User;
var Player = classes.Player;
var Game = classes.Game;
var Sprite = classes.Sprite;
var Effect = classes.Effect;
var Item = classes.Item;
var Monster = classes.Monster;
var Job = classes.Job;
var GameState = classes.GameState;
var ItemType = classes.ItemType;

var games = [ ];

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.get("/game", function(req, res) {
	res.sendFile(__dirname + "/game.html");
});

server.on("connection", function(client) {
	console.log(client.id + " connected");
	client.emit("connected");

	//Do something (in game)
	client.on("action", function(message) {
		game.receive(message, client);
	});

	//Join a game
	//message: { name, gameId }
	client.on("join", function(message) {
		Game.findGame(message.gameId).players.push(new Player(this, message.name));
	});

	//Create a game
	//message: { name }
	client.on("create", function(message) {
		var game = games.push(new Game(server, client));
		game.players.push(new Player(this, new User(message.name)));
		server.emit("created", { id : game.id });
	});
});

http.listen(process.env.PORT || port, function() {
	console.log("listening on " + port);
});

game.setup(0, server);

module.exports = server;