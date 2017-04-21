//////////////////////////////////////////////
// GENERAL GAME CONSTANTS / ENUMS
//////////////////////////////////////////////
"use strict"; 
const r = require('../api/rethinkdb');

const async = require("async");

const itemRanges = {
	"low" : [ 1, 3 ],
	"med" : [ 4, 6 ],
	"high" : [ 7, 9 ],
	"wild" : [ 1, 10]
};

const monsterRanges = {
	"low" : [ 3, 6 ],
	"med" : [ 7, 10 ],
	"high" : [ 11, 14 ],
	"higher" : [ 15, 18 ],
	"highest" : [ 19, 22 ],
	"wild" : [3, 22]
};

const GameState = {
	SETUP : 0,
	PLAYING : 1,
	GAME_OVER : 2
};

const ItemType = {
	OTU : 0,
	ONE_HAND : 1,
	TWO_HAND : 2,
	HEAD : 3,
	ARMOR : 4
};

const STARTING_HAND = 6;

//////////////////////////////////////////////
// GENERAL GAME CLASSES
//////////////////////////////////////////////

class GameMaker {

	constructor(server) {
		this.server = server;
		this.games = [ ];
	}

	findGame(gameId) {
		for(var i = 0; i < this.games.length; i++) {
			if(this.games[i].id == gameId) {
				return this.games[i];
			}
		}
	}

	addUserToGame(game, username, socket) {
		game.players.forEach(function(player) {
			if(player.name == username) {
				player.socket = socket;
			}
		});
	}

	onGameStarted(gameId, usernames) {
		this.games.push(new Game(gameId, usernames));
	}

	onSetup(gameId, username, socket) {
		var game = this.findGame(gameId);
		this.addUserToGame(game, username, socket);
		if(game.isReady()) {
			game.start();
		}
	}
}

class Factory {

	static getItems() {
		return r.db("Corridor").table("Items").filter({published: true}).run();
	}

	static getMonsters() {
		return r.db("Corridor").table("Monsters").filter({published:true}).run();
	}

	static createItem(itemJSON, game) {
		return new Item(
			itemJSON.id,
			itemJSON.type,
			itemJSON.description,
			itemJSON.range,
			itemJSON.use_by_class,
			itemJSON.sprite,
			game
		);
	}

	static createMonster(monsterJSON, game) {
		var m = new Monster(
			monsterJSON.id,
			monsterJSON.description,
			monsterJSON.range,
			monsterJSON.buff_lvl,
			monsterJSON.buff_class,
			monsterJSON.num_treasures,
			monsterJSON.sprite,
			game
		);
		//console.log(m);
		return m;
	}
}

class Player {

	constructor(name) {
		this.name = name;

		this.socket = null;
		this.level = 1;
		this.items = [null, null, null, null, null, null, null, null, null ,null, null, null, null, null, null, null];

		/* all items are stored in one array, this makes searching and switching much easier
		items[0] = left_arm
		items[1] = head
		items[2] = armor
		items[3] = right_arm
		itmes[4 - 15] = bag
		*/

	}

	switchItems(fromIndex, toIndex) {
		var player = this;

		console.log(player.name+" before switch:");

		var fromItem = player.items[fromIndex];
		var toItem = player.items[toIndex];


		if (fromItem != null) {
			console.log(fromItem.name);
		} else {
			console.log("null");
		}
		if (toItem != null) {
			console.log(toItem.name);
		} else {
			console.log("null");
		}
		
		//check to see if items can be switched, if so;
		player.items[fromIndex] = toItem;
		player.items[toIndex] = fromItem;


		console.log(player.name+" after switch:");
		if (player.items[fromIndex] != null) {
			console.log(player.items[fromIndex].name);
		} else {
			console.log("null");
		}
		if (player.items[toIndex] != null) {
			console.log(player.items[toIndex].name);
		} else {
			console.log("null");
		}

		player.socket.emit("give_switch", {fromIndex:fromIndex, fromItem:player.items[fromIndex], toIndex:toIndex, toItem:player.items[toIndex]});
	}

	dropItem(item) {
		var player = this;
		player.items[item] = null;

		player.socket.emit("item_dropped", {item:item});
	}
}

class Game {

	constructor(id, usernames) {
		this.id = id;

		this.players = usernames.map(function(username) {
			return new Player(username);
		});
		this.items = [ ];
		this.monsters = [ ];
		this.currentMonster = 0;
		this.itemIndex = 0;
		this.state = GameState.SETUP;
		this.currentPlayer = 0;
	}

	isReady() {
		var ready = true;
		this.players.forEach(function(player) {
			if(player.socket == null) {
				ready = false;
			}
		});
		return ready;
	}

	createMonstersDeck() {
		var game = this;
		Factory.getMonsters().then(function(monsters) {
			monsters.forEach(function(monster) {
				game.monsters.push(Factory.createMonster(monster, game));
			});
			return game.createItemsDeck();
		});

	}

	createItemsDeck() {
		var game = this;
		Factory.getItems().then(function(items) {
			items.forEach(function(item) {
				game.items.push(Factory.createItem(item, game));
			});
			for(var i = game.items.length - 1; i >= 0; i--) {
				var clone;
				clone = JSON.parse(JSON.stringify(game.items[i]));
				game.items.push(clone);
				clone = JSON.parse(JSON.stringify(game.items[i]));
				game.items.push(clone);
				clone = JSON.parse(JSON.stringify(game.items[i]));
				game.items.push(clone);
				clone = JSON.parse(JSON.stringify(game.items[i]));
				game.items.push(clone);
				clone = JSON.parse(JSON.stringify(game.items[i]));
				game.items.push(clone);
				clone = JSON.parse(JSON.stringify(game.items[i]));
				game.items.push(clone);
			}//TODO: TEMP

			return game.sendContent();
		});
	}

	sendContent() {
		var game = this;
		game.shuffle();
		//console.log(game.monsters);

		game.players.forEach(function(player) {
			for(var i = 4; i < 4 + STARTING_HAND; i++) {
				player.items[i] = game.draw();
			}

			player.socket.emit("ready", {
				usernames : game.getUsernames(),
				current_player : game.currentPlayer,
				items : player.items,
				monster : game.monsters[game.currentMonster]
			});	
		});
	}

	start() {
		var game = this;
		game.createMonstersDeck();
	}

	shuffle() {
		var tempItems = [ ];
		var tempMonsters = [ ];
		while(this.items.length) {
			var index = Math.floor(Math.random() * this.items.length);
			tempItems.push(this.items[index]);
			this.items.splice(index, 1);
		}
		while(this.monsters.length) {
			var index = Math.floor(Math.random() * this.monsters.length);
			tempMonsters.push(this.monsters[index]);
			this.monsters.splice(index, 1);
		}
		this.items = tempItems;
		this.monsters = tempMonsters;
	}

	draw() {
		if(this.itemIndex == this.items.length) {
			this.shuffle();
			this.itemIndex = 0;
		}
		return this.items[this.itemIndex++];
	}

	getUsernames() {
		return this.players.map(function(player) {
			return player.name;
		});
	}

	getValueFromRange(range) {
		var avg_level = Math.floor(this.players.reduce(function(total_level, player) {
			return total_level + player.level;
		}, 0) / 4);
		var min = range[0], max = range[1];

		//For calculating value
		//Get random number between min and max
		var value = Math.random() * (max - min) + min;

		//Add average player level for scaling
		value += avg_level;

		//Round
		return Math.round(value);
	}

	dropItem(player, item) {
		var game = this;
		var foundPlayer = game.findPlayer(player);
		console.log(foundPlayer);
		foundPlayer.dropItem(item);
	}

	switchItems(player, fromIndex, toIndex) {
		var game = this;
		//console.log(player);
		//console.log(fromItem);
		//console.log(toItem);
		var foundPlayer = game.findPlayer(player);
		console.log(foundPlayer);
		foundPlayer.switchItems(fromIndex, toIndex);
	}

	findPlayer(player) {
		for(var i = 0; i < this.players.length; i++) {
			if(this.players[i].name == player) {
				return this.players[i];
			}
		}
	}
}

//////////////////////////////////////////////
// GAME OBJECT CLASSES
//////////////////////////////////////////////

class Item {

	constructor(name, type, description, range, use_by, sprite, game) {
		this.name = name;
		this.type = type;
		this.description = description;
		this.range = range;
		this.use_by = use_by;
		this.sprite = sprite;

		this.value = game.getValueFromRange(itemRanges[range]);
 	}
}

class Monster {

	constructor(name, description, range, debuff_amount, debuff_job, item_reward, sprite, game) {
		this.name = name;
 		this.description = description;
 		this.range = range;
 		this.debuff_amount = debuff_amount;
		this.debuff_job = debuff_job;
 		this.item_reward = item_reward;
 		this.sprite = sprite;

		this.value = game.getValueFromRange(monsterRanges[range], game);
 	}
}

class Job {

	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

module.exports = GameMaker;