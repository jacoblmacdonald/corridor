"use strict";

class User {

	constructor(name, socket) {
		this.name = name;
		this.socket = socket;

		this.isHost = false;
	}
}

var lobbyIndex = 0;
class Lobby {

	constructor(host) {
		this.host = host;

		this.players = [ host ];
		this.id = lobbyIndex++;
	}

	getUsernames() {
		return this.players.map(function(player) {
			return player.name;
		});
	}
}

class Matchmaker {

	constructor(server) {
		this.server = server;

		this.users = [ ];
		this.lobbies = [ ];
	}

	findUser(username) {
		for(var i = 0; i < this.users.length; i++) {
			if(this.users[i].name == username) {
				return this.users[i];
			}
		}
	}

	addUser(username, socket) {
		if(!this.findUser(username)) {
			this.users.push(new User(username, socket));
		}
	}

	findLobby(hostname) {
		for(var i = 0; i < this.lobbies.length; i++) {
			if(this.lobbies[i].host.name == hostname) {
				return this.lobbies[i];
			}
		}
	}

	sendUpdatedUserList() {
		this.server.emit("connected", {
		    users : this.users.map(function(user) {
		        return [ user.name, user.isHost ];
		    })
		});
	}

	onUserLoaded(username, socket) {
		this.addUser(username, socket);
		this.sendUpdatedUserList();
	}

	onLobbyCreated(hostname) {
		var user = this.findUser(hostname);
		user.isHost = true;

		var lobby = new Lobby(user);
		this.lobbies.push(lobby);
		
		this.server.emit("created", { host : hostname });
	}

	onLobbyJoined(username, hostname) {
		var lobby = this.findLobby(hostname);
		lobby.players.push(this.findUser(username));
        lobby.players.forEach(function(player) {
            player.socket.emit("joined", { usernames : lobby.getUsernames() });
        });
	}

	onGameStarted(hostname) {
		var lobby = this.findLobby(hostname);
		lobby.players.forEach(function(player) {
		    player.socket.emit("started", { gameId : lobby.id });
		});

		this.users = this.users.filter(function(user) {
			var keep = true;
			lobby.players.forEach(function(player) {
				if(user.name == player.name) {
					keep = false;
				}
			});
			return keep;
		});

		this.lobbies = this.lobbies.filter(function(l) {
			return l.id !== lobby.id;
		});

		this.sendUpdatedUserList();

		return lobby;
	}
}

module.exports = Matchmaker;