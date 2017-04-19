//////////////////////////////////////////////
// GENERAL GAME CONSTANTS / ENUMS
//////////////////////////////////////////////

const itemRanges = {
	"weak" : [ 1, 3 ],
	"mid" : [ 4, 6 ],
	"high" : [ 7, 9 ],
	"wild" : [ 1, 10]
};

const monsterRanges = {
	"weak" : [ 3, 6 ],
	"mid" : [ 7, 10 ],
	"high" : [ 11, 14 ],
	"higher" : [ 15, 18 ],
	"highest" : [ 19, 22 ]
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

const maxPlayers = 2;

//////////////////////////////////////////////
// GENERAL GAME CLASSES
//////////////////////////////////////////////

class User {

	constructor(name) {
		this.name = name;

		this.hosting = null;
	}

	static findUser(users, name) {
		for(var i = 0; i < users.length; i++) {
			if(users[i].name == name) {
				return users[i];
			}
		}
	}
}

class Player {

	constructor(client, user) {
		this.client = client;
		this.user = user;

		this.level = 1;
	}
}

//Game static variables
var gameIndex = 0;

class Game {

	constructor(server) {
		this.server = server;

		this.id = gameIndex++;
		this.players = [ ];
		this.state = GameState.SETUP;
		this.currentPlayer = 0;
	}

	send(message, client) {
		var receiving = client || this.server;
		console.log("Sending: " + message + " to: " + (receiving.id || "All"));
		receiving.emit("message", { message : message });
	};

	receive(message, client) {
		switch(this.state) {
		case GameState.SETUP:
			this.players.push(new Player(client, new User(message.name)));
			if(this.isFull()) {
				this.send("Game starting!");
				this.state = GameState.PLAYING;
			}
			break;
		case GameState.PLAYING:
			console.log("Received: " + message + " from: " + client.id);
			break;
		}
	};

	isFull() {
		return this.players.length == this.maxPlayers;
	}

	static getValueFromRange(range, game) {
		var avg_level = Math.floor(game.players.reduce(function(total_level, player) {
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

	static findGame(games, id) {
		for(var i = 0; i < games.length; i++) {
			if(games[i].id == id) {
				return games[i];
			}
		}
	}
}

//////////////////////////////////////////////
// HELPER CLASSES
//////////////////////////////////////////////

class Sprite {
	//TK
}

class Effect {
	//TK
}

//////////////////////////////////////////////
// GAME OBJECT CLASSES
//////////////////////////////////////////////

class Item {

	constructor(id, name, type, description, range, effect, disabled_jobs, sprite, game) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.description = description;
		this.range = range;
		this.effect = effect;
		this.disabled_jobs = disabled_jobs;
		this.sprite = sprite;

		this.value = Game.getValueFromRange(itemRanges[range], game);
 	}
}

class Monster {

	constructor(id, name, level, description, range, debuff_amount, debuff_job, item_reward, sprite, game) {
		this.id = id;
		this.name = name;
		this.level = level;
		this.description = description;
		this.range = range;
		this.debuff_amount = debuff_amount;
		this.debuff_job = debuff_job;
		this.item_reward = item_reward;
		this.sprite = sprite;

		this.value = Game.getValueFromRange(monsterRanges[range], game);
 	}
}

class Job {

	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

module.exports = {
	User : User,
	Player : Player,
	Game : Game,
	Sprite : Sprite,
	Effect : Effect,
	Item : Item,
	Monster : Monster,
	Job : Job,
	GameState : GameState,
	ItemType : ItemType
}