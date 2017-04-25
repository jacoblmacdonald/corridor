"use strict";

//////////////////////////////////////////////
// GENERAL GAME CONSTANTS / ENUMS
//////////////////////////////////////////////
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
const MAX_LEVEL = 10;
const WIZARD_REROLL_CHANCE = 0.5;

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
		this.games.push(new Game(this, gameId, usernames));
	}

	onSetup(gameId, username, socket) {
		var game = this.findGame(gameId);
		this.addUserToGame(game, username, socket);
		if(game.isReady()) {
			game.start();
		}
	}

	destroy(gameId) {
		for(var i = 0; i < this.games.length; i++) {
			if(this.games[i].id == gameId) {
				this.games.splice(i, 1);
			}
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
		return m;
	}

	static wizardRoll(item, game) {
		if(Math.random() > WIZARD_REROLL_CHANCE) {
			item.range = "wild";
			item.value = game.getValueFromRange(itemRanges[item.range]);
			item.rerolled = true;
		}
	}

	static convertSpriteToSVG(sprite) {
		var svg = "";
		svg += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
		svg += "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
		svg += "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"30\" height=\"30\" viewBox=\"0 0 30 30\">";
		for(var i = 0; i < sprite.length; i++) {
			for(var j = 0; j < sprite[i].length; j++) {
				svg += "<rect x=\"" + j + "\" y=\"" + i + "\" width=\"1\" height=\"1\" style=\"fill:" + sprite[i][j] + ";\"/>";
			}
		}
		svg += "</svg>";
		return svg;
	}
}

class Player {

	constructor(name) {
		this.name = name;

		this.socket = null;
		this.level = 1;
		this.totalPower = 1;
		this.items = [null, null, null, null, null, null, null, null, null ,null, null, null, null, null, null, null, null, null];
		this.class = "none";
		this.currentOTUAmt = 0;
		this.ready = false;
		// store a list of all OTUs used by player in current round.
		// use this to sum up additional buff from these items
		// clear this list and its buff after each round

		/* all items are stored in one array, this makes searching and switching much easier
		items[0] = left_arm
		items[1] = head
		items[2] = armor
		items[3] = right_arm
		itmes[4 - 15] = bag
		*/

	}

	levelUp() {
		return ++this.level == MAX_LEVEL;
	}

	levelDown() {
		if(this.level != 1) { this.level--; }
	}

	getAttackPower() {
		return this.totalPower + this.currentOTUAmt;
	}

	switchItems(fromIndex, toIndex) {		
		var player = this;
		var fromItem = player.items[fromIndex];
		var toItem = player.items[toIndex];

		var refusedReason = null;

		if((toIndex == 0 || toIndex == 3) && fromItem != null && !(fromIndex == 0 || fromIndex == 3)) {
			if(fromItem.type != "1 hand" && fromItem.type != "2 hand") {
				refusedReason = "Cannot equip that item to a hand slot.";
			}
			else if(fromItem.type == "2 hand" && (
				(toIndex == 0 && player.items[3] != null) ||
				(toIndex == 3 && player.items[0] != null)
			)) {
				refusedReason = "Cannot equip a 2-handed weapon while holding another weapon";
			}
			else if(fromItem.type == "1 hand" && (
				(toIndex == 0 && player.items[3] != null && player.items[3].type == "2 hand") ||
				(toIndex == 3 && player.items[0] != null && player.items[0].type == "2 hand")
			)) {
				refusedReason = "Cannot equip a 1-handed weapon while holding a 2-handed weapon";
			}
		}
		else if((fromIndex == 0 || fromIndex == 3) && toItem != null && !(toIndex == 0 || toIndex == 3)) {
			if(toItem.type != "1 hand" && toItem.type != "2 hand") {
				refusedReason = "Cannot equip that item to a hand slot.";
			}
			else if(toItem.type == "2 hand" && (
				(fromIndex == 0 && player.items[3] != null) ||
				(fromIndex == 3 && player.items[0] != null)
			)) {
				refusedReason = "Cannot equip a 2-handed weapon while holding another weapon";
			}
			else if(toItem.type == "1 hand" && (
				(fromItem == 0 && player.items[3].type != null && player.items[3].type == "2 hand") ||
				(fromItem == 3 && player.items[0].type != null && player.items[0].type == "2 hand")
			)) {
				refusedReason = "Cannot equip a 1-handed weapon while holding a 2-handed weapon";
			}
		}
		if(
			(toIndex == 1 && fromItem != null && fromItem.type != "head") ||
			(fromIndex == 1 && toItem != null && toItem.type != "head")
		) {
			refusedReason = "Cannot equip that item to the head slot.";
		}
		else if(
			(toIndex == 2 && fromItem != null && fromItem.type != "armor") ||
			(fromIndex == 2 && toItem != null && toItem.type != "armor")
		) {
			refusedReason = "Cannot equip that item to the armor slot.";
		}
		if(
			(toIndex >= 0 && toIndex <= 3 && fromItem != null && fromItem.use_by != "all" && fromItem.use_by != player.class.toLowerCase()) ||
			(fromIndex >= 0 && fromIndex <= 3 && toItem != null && toItem.use_by != "all" && toItem.use_by != player.class.toLowerCase())
		) {
			refusedReason = "Cannot equip that item as your current class.";
		}
		if(refusedReason) {
			player.socket.emit("refuse_switch", { "reason" : refusedReason });
		}
		else {
			player.items[fromIndex] = toItem;
			player.items[toIndex] = fromItem;

			player.updateTotalPower();

			player.socket.emit("give_switch", {fromIndex:fromIndex, fromItem:player.items[fromIndex], toIndex:toIndex, toItem:player.items[toIndex], level:player.level, totalPower:player.totalPower, otuAmt:player.currentOTUAmt});
		}
	}

	dropItem(item) {
		var player = this;
		player.items[item] = null;

		player.updateTotalPower();

		player.socket.emit("item_dropped", {item:item, level:player.level, totalPower:player.totalPower, otuAmt:player.currentOTUAmt});
	}

	//for OTUS
	useItem(item, game) {
		var player = this;

		if (player.items[item].type == "class") {
			var newClass = player.items[item].name.split(" ")[0];
			if(
				(player.items[0] != null && player.items[0].use_by != "all" && player.items[0].use_by != newClass) ||
				(player.items[1] != null && player.items[1].use_by != "all" && player.items[1].use_by != newClass) ||
				(player.items[2] != null && player.items[2].use_by != "all" && player.items[2].use_by != newClass) ||
				(player.items[3] != null && player.items[3].use_by != "all" && player.items[3].use_by != newClass)
			) {
				player.socket.emit("refuse_switch", { "reason" : "An equipped item cannot be used as that class." });
			}
			else {
			
				player.class = newClass;
				
				player.items[item] = null;

				if(player.class == "Wizard") {
					player.items.forEach(function(item) {
						if(item != null) {
							Factory.wizardRoll(item, game);
						}
					});
				}

				player.updateTotalPower();

				player.socket.emit("class_changed", {items:player.items, totalPower:player.totalPower, otuAmt:player.currentOTUAmt, class:player.class});
			}
		} else {
			if(player.items[item].use_by != "all" && player.items[item].use_by != player.class.toLowerCase()) {
				player.socket.emit("refuse_switch", { "reason" : "Cannot use that item as your current class." });
			}
			else {
				player.currentOTUAmt += player.items[item].value;
				var otuName = player.items[item].name;
				var otuAmt = player.items[item].value;
				player.items[item] = null;

				player.updateTotalPower();

				player.socket.emit("item_used", {item:item, itemName:otuName, itemAmt:otuAmt, level:player.level, totalPower:player.totalPower, otuAmt:player.currentOTUAmt});
			}
		}
	}

	updateTotalPower() {
		var player = this;
		player.totalPower = player.level;
		for (var i = 0; i < 4; i++) {
			if (player.items[i] != null) {
				player.totalPower += player.items[i].value;
				if(player.class == "Warrior") {
					player.totalPower++;
				}
			}
		}
	}
}

class Game {

	constructor(gamemaker, id, usernames) {
		this.gamemaker = gamemaker;
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
		this.avgPlayerLevel = 1;
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

		game.nextMonster();

		game.players.forEach(function(player) {
			for(var i = 4; i < 4 + STARTING_HAND; i++) {
				player.items[i] = game.draw();
			}

			player.socket.emit("ready", {
				current_player : game.currentPlayer,
				items : player.items,
				monster : game.monsters[game.currentMonster]
			});

			game.sendPlayers();
		});
	}

	sendPlayers() {
		var game = this;
		this.players.forEach(function(player) {
			player.socket.emit("update_players", {
				"players" : game.players.map(function(player) {
					return {
						"name" : player.name,
						"level" : player.level,
						"totalPower" : player.totalPower,
						"currentOTUAmt" : player.currentOTUAmt,
						"class" : player.class
					};
				}),
				"currentPlayer" : game.currentPlayer
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
		while(
			(this.avgPlayerLevel <= 6 && this.items[this.itemIndex].range == "high") ||
			(this.avgPlayerLevel <= 3 && this.items[this.itemIndex].range != "low")
		) {
			this.itemIndex++;
			if(this.itemIndex == this.items.length) {
				this.shuffle();
				this.itemIndex = 0;
			}
		}
		return this.items[this.itemIndex++];
	}

	getUsernames() {
		return this.players.map(function(player) {
			return player.name;
		});
	}

	getValueFromRange(range) {
		var min = range[0], max = range[1];

		//For calculating value
		//Get random number between min and max
		var value = Math.random() * (max - min) + min;

		//Add average player level for scaling
		value += this.avgPlayerLevel;

		//Round
		return Math.round(value);
	}

	updateAverageLevel() {
		this.avgPlayerLevel = Math.floor(this.players.reduce(function(total_level, player) {
			return total_level + player.level;
		}, 0) / this.players.length);
	}

	nextPlayer() {
		this.players[this.currentPlayer].currentOTUAmt = 0;
		this.currentPlayer = ++this.currentPlayer % this.players.length;
	}

	nextMonster() {
		this.currentMonster = ++this.currentMonster % this.monsters.length;
		while(
			(this.avgPlayerLevel <= 6 && this.monsters[this.currentMonster].range == "high") ||
			(this.avgPlayerLevel <= 3 && this.monsters[this.currentMonster].range != "low")
		) {
			this.currentMonster = ++this.currentMonster % this.monsters.length;
		}
	}

	attack(player) {
		var game = this;
		var numReady = 0;
		this.players.forEach(function(player) {
			if (player.ready == true) {
				numReady++;
			}
		});
		console.log("numReady: "+numReady);
		console.log("numPlayers: "+this.players.length);

		if (numReady == this.players.length - 1) {

			var player = this.findPlayer(player);
			var monster = this.monsters[this.currentMonster];
			var success;
			if(player.class == "Troll") {
				monster.value -= 2;
			}
			if(player.getAttackPower() > monster.value) {
				for(var i = 0; i < monster.item_reward; i++) {
					for(var j = 4; j < player.items.length; j++) {
						if(player.items[j] == null) {
							if(player.class == "Wizard") {
								player.items[j] = Factory.wizardRoll(this.draw(), this);
							}
							else {
								player.items[j] = this.draw();
							}
							break;
						}
					}
				}
				if(player.levelUp()) {
					this.players.forEach(function(p) {
						p.socket.emit("victory", { "winner" : player.name, "level" : MAX_LEVEL });
					});
					this.gamemaker.destroy(this.id);
					return;
				}
				this.updateAverageLevel();
				player.updateTotalPower();
				this.nextMonster();
				success = true;
			}
			else {
				player.levelDown();
				this.updateAverageLevel();
				player.updateTotalPower();
				success = false;
			}
			this.nextPlayer();var game = this;
			this.players.forEach(function(player) {
				player.ready = false;
				player.socket.emit("attack_result", {
					success : success,
					items : player.items,
					level : player.level,
					totalPower : player.totalPower,
					otuAmt : player.currentOTUAmt,
					monster : game.monsters[game.currentMonster],
					currentPlayer : game.currentPlayer
				});
			});

			this.sendPlayers();
		} else {
			//console log not every player is ready
			var player = this.findPlayer(player);
			player.socket.emit("cant_attack_yet", {error:"Waiting for all players to be ready!"});
		}

		
	}

	setPlayerReady(player) {
		var game = this;
		var foundPlayer = game.findPlayer(player);
		foundPlayer.ready = true;
		this.players.forEach(function(player) {
			player.socket.emit("player_is_ready", {playerName:foundPlayer.name});
		});
	}

	dropItem(player, item) {
		var game = this;
		var foundPlayer = game.findPlayer(player);
		foundPlayer.dropItem(item);
		game.sendPlayers();
	}

	useItem(player, item) {
		var game = this;
		var foundPlayer = game.findPlayer(player);
		foundPlayer.useItem(item, game);
		game.sendPlayers();
	}

	attackMonsterWithItem(player, item) {
		var game = this;
		var foundPlayer = game.findPlayer(player);
		if(foundPlayer.items[item].use_by != "all" && foundPlayer.items[item].use_by != foundPlayer.class.toLowerCase()) {
			foundPlayer.socket.emit("refuse_switch", { "reason" : "Cannot use that item as your current class." });
		}
		else {
			var monster = this.monsters[this.currentMonster];
			monster.value -= foundPlayer.items[item].value;
			foundPlayer.items[item] = null;

			this.players.forEach(function(player) {
				player.socket.emit("monster_attacked_with_item", {item:item, monsterVal:monster.value, usingPlayer:foundPlayer.name});
			});
		}
	}

	buffMonsterWithItem(player, item) {
		var game = this;
		var foundPlayer = game.findPlayer(player);
		if(foundPlayer.items[item].use_by != "all" && foundPlayer.items[item].use_by != foundPlayer.class.toLowerCase()) {
			foundPlayer.socket.emit("refuse_switch", { "reason" : "Cannot use that item as your current class." });
		}
		else {
			var monster = this.monsters[this.currentMonster];
			monster.value += foundPlayer.items[item].value;
			foundPlayer.items[item] = null;

			this.players.forEach(function(player) {
				player.socket.emit("monster_buffed_with_item", {item:item, monsterVal:monster.value, usingPlayer:foundPlayer.name});
			});
		}
	}

	switchItems(player, fromIndex, toIndex) {
		var game = this;
		var foundPlayer = game.findPlayer(player);
		foundPlayer.switchItems(fromIndex, toIndex);
		game.sendPlayers();
	}

	giveItem(player, fromIndex, toPlayer) {
		var game = this;
		var fromPlayer = game.findPlayer(player);
		var newPlayer = game.findPlayer(toPlayer);
		//console.log(fromPlayer.name+" give item "+fromIndex+ " to "+newPlayer.name);
		var item = fromPlayer.items[fromIndex];

		var newItemIndex = 0;
		for(var j = 4; j < newPlayer.items.length; j++) {
			if(newPlayer.items[j] == null) {
				newPlayer.items[j] = item;
				newItemIndex = j;
				break;
			}
		}

		fromPlayer.items[fromIndex] = null;

		fromPlayer.updateTotalPower();

		//fromPlayer.socket.emit("you_have_switched", {});

		fromPlayer.socket.emit("you_gave", {fromIndex:fromIndex, level:fromPlayer.level, totalPower:fromPlayer.totalPower, otuAmt:fromPlayer.currentOTUAmt});

		newPlayer.socket.emit("you_got", {items:newPlayer.items, fromPlayer:player, itemName:item.name});

	}

	findPlayer(player) {
		for(var i = 0; i < this.players.length; i++) {
			if(this.players[i].name == player) {
				return this.players[i];
			}
		}
	}

	gg() {
		this.players.forEach(function(p) {
			p.socket.emit("game_over", {message:"game over :("});
		});
		this.gamemaker.destroy(this.id);

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

		this.rerolled = false;
		this.value = game.getValueFromRange(itemRanges[this.range]);
		this.svg = Factory.convertSpriteToSVG(this.sprite);
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

		this.value = game.getValueFromRange(monsterRanges[this.range]);
		this.svg = Factory.convertSpriteToSVG(this.sprite);
 	}
}

class Job {
	//If Warrior, all items buff + 1
	//If Wizard, chance to make any item wild
	//If Troll, all monsters - 2
	//If Priest, all OTUs known


	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

module.exports = GameMaker;