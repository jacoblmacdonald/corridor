//////////////////////
// E X P R E S S
/////////////////////////////////////////
const express = require("express");
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const chat = require('./chat/socket');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const r = require('./api/rethinkdb');

//////////////////////
// S O C K E T S
/////////////////////////////////////////
var http = require('http').Server(app);
var server = require('socket.io')(http);

var Matchmaker = require("./game/matchmaker");
var matchmaker = new Matchmaker(server);
var Gamemaker = require("./game/game");
var gamemaker = new Gamemaker(server);

server.on("connection", function(client) {
  
	/**
	 * Please keep this cleaner...
	 */
	chat(client, server);
	// ^ encapsulate pl0x


	var username = client.request.user['id'];
	console.log(username + " connected");

 	
 	//Load the matchmaking screen
    client.on("loaded", function(message) {
        matchmaker.onUserLoaded(username, this);
    });

	//Create a game
	client.on("create", function(message) {
		matchmaker.onLobbyCreated(username);
	});

	//Join a game
	client.on("join", function(message) {
		//console.log("attempting join");
		matchmaker.onLobbyJoined(username, message.hostname);
	});

	//Start a game
	client.on("start", function(message) {
	    var lobby = matchmaker.onGameStarted(username);
	    gamemaker.onGameStarted(lobby.id, lobby.getUsernames());
	});

    //Setup a game
    client.on("setup", function(message) {
    	gamemaker.onSetup(message.gameId, username, client);
    });

	//Do something (in game)
	client.on("action", function(message) {
		game.receive(message, client);
	});

	//switch item
	client.on("switch_item", function(message) {
		//game.
	});
});
//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
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

// Socket Io & Passport**
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