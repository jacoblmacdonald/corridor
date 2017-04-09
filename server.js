//////////////////////
// E X P R E S S
/////////////////////////////////////////
const express = require("express");
const app = express();
const session = require('express-session');
const routes = require('./routes');

//////////////////////
// R E T H I N K D B 
/////////////////////////////////////////
const config = require('./config/defaults');
const r = require('rethinkdbdash')(config.db);

//////////////////////
// P A S S P O R T
/////////////////////////////////////////
const passport = require('passport');
//Create A RethinkDB Store to hold Session data
const RDBStore = require('session-rethinkdb')(session);
const store = new RDBStore(r, {
    table: "Sessions"
});

//Init Sessions
app.use(session({  
  secret: config.sessionSecret,
  store: store,
  resave: true,
  saveUninitialized: false
}));
//Init & Connect To Passport
app.use(passport.initialize());
app.use(passport.session());


var classes = require("./game/classes");
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

//////////////////////
// S O C K E T S
/////////////////////////////////////////
var http = require('http').Server(app);
var server = require('socket.io')(http);

server.on("connection", function(client) {
	console.log(client.id + " connected");
	client.emit("connected");

    client.on("login", function(message){
        console.log(message);
    });

    client.on("signUp", function(message){
        var signUp = require("./api/signup");
        signUp(message);
    })

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

app.use('/', routes);

http.listen(process.env.PORT || 3000, function() {
	console.log("listening on http://localhost:3000");
});

module.exports = server;