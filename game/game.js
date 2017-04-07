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

var globalFunctions = require("./global");
var log = globalFunctions.log;

var server = require("../server");

var game = new Game();

function playRound() {
	switch(game.state) {
	case GameState.SETUP:
		state = GameState.PLAYING;
		break;
	case GameState.PLAYING:

		break;
	case GameState.GAME_OVER:
		break;
	}

	//Round logic
	////Round start
	////Active player vs monster
	////->Win
	//////Active player gets level + treasure
	//////New round
	////->Lose
	//////Active player loses a level and starts bleeding
	//////Random player selected to fight
	//////-->Win before player bleeds out
	////////Gets level and treasure
	////////New round
	//////-->Win after player bleeds out
	////////Gets level and treasure
	////////All lose 1 level (including active player, total of 2)
	////////New round
	//////-->Lose
	////////Starts bleeding out
	////////Another random player selected to fight
}

function test() {
	var item = new Item(0, "Name", ItemType.ONE_HAND, "Description", "mid", null, [ ], new Sprite(), game);
	var monster = new Monster(0, "Name", 5, "Description", "higher", 0, [ ], 3, new Sprite(), game);
	log(item);
	log(monster);
}

module.exports = game;