//////////////////////
// E X P R E S S
/////////////////////////////////////////
const express = require("express");
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const routes = require('./routes');
const chat = require('./Chat/Chat-Backend');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');


const r = require('./api/rethinkdb');


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
var users = [ ];


var http = require('http').Server(app);
var server = require('socket.io')(http);
//////////////////////
// S O C K E T S
/////////////////////////////////////////


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
	
	chat(client, server);


});
//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//////////////////////
// P A S S P O R T
/////////////////////////////////////////
const config = require('./config/defaults');
const passport = require('passport');
require('./config/passport')(passport);
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

// Socket Io
server.use(passportSocketIo.authorize({
	key: 'connect.sid',
	secret: config.sessionSecret,
	store: store,
	passport: passport,
	cookieParser: cookieParser
}));




//Init & Connect To Passport
app.use(passport.initialize());
app.use(passport.session());

require('./routes.js')(app, passport);

http.listen(process.env.PORT || 3000, function() {
	console.log("listening on http://localhost:3000");
});

module.exports = server;