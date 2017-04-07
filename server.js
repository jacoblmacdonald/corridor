const express = require("express");
const app = express();
const SERVER_PORT = 3000;
var LOG_CONNECTIONS_CONSOLE = true;

var http = require('http').Server(app);
var server = require('socket.io')(http);
var db = require('./api/defaultUser');

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

//get functions
function getHomePage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/login.html');
    //if logged in, switch to matchmaking page
}

function getSignupPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/signup.html');
}

function getMatchmakingPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/matchmaking.html');
}

function getCorridorPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/corridor.html');
}

function getItemCreatorPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/item-creator.html');
}

function getMonsterCreatorPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/monster-creator.html');
}

function getGamePage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/game.html');
}

app.get('/', getHomePage);
app.get("/matchmaking", getMatchmakingPage);
app.get("/signup", getSignupPage);
app.get("/corridor", getCorridorPage);
app.get("/item-creator", getItemCreatorPage);
app.get("/monster-creator", getMonsterCreatorPage);
app.get("/game", getGamePage);

app.get( '/*' , function( req, res, next ) {
    //This is the current file they have requested
    var file = req.params[0];
    //For debugging, we can track what files are requested.
    if(LOG_CONNECTIONS_CONSOLE) console.log('\t :: Express :: file requested : ' + file);
    //Send the requesting client the file.
    res.sendFile( __dirname + '/' + file );

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

http.listen(process.env.PORT || SERVER_PORT, function() {
	console.log("listening on " + SERVER_PORT);
});

game.setup(0, server);

module.exports = server;