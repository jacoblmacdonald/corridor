// ////////////////////
// I N I T
// ///////////////////////////////////////
//animation
var gameInfoTrans = 30;

//game info
var socket = io();
var TEST_USER = "username" + (getUrlVars("id") || 0); //TEMP

$(window).on("load", function() {
	$(".create-game-button").click(function() {
		if (!$(".game-info-c").hasClass("active")) {
			socket.emit("create", { name : TEST_USER });
		}
	});

	$(".start-game-button").click(function() {
		socket.emit("start", { username : TEST_USER });
		//window.location.href = "/corridor";
	});

	$(".username").text(TEST_USER);

	socket.emit("loaded", { username : TEST_USER });
});

// ////////////////////
// I N I T
// ///////////////////////////////////////

socket.on("created", function(message) {
	console.log("creating game "+ message.gameId);
	if (message.host == TEST_USER) {
		showGameInfo(message.gameId, [TEST_USER]);
		$(".start-game-button").data("id", message.gameId);
	} else {
		showPlayerJoin(message.host, message.gameId);
	}
});

socket.on("joined", function(message) {
	showGameInfo(message.gameId, message.usernames);
});


socket.on("connected", function(message) {
	console.log(message.users);
	showActivePlayers(message.users);
	for (var i = 0; i < message.users.length; i++) {
		if (message.users[i][1] !== null) {
			showPlayerJoin(message.users[i][0], message.users[i][1]);
		}
	}
});

socket.on("started", function(message) {
	window.location.href = "/corridor?id=" + message.gameId;
});


// ////////////////////
// D I S P L A Y
// ///////////////////////////////////////

function showGameInfo(id, players) {
	//refresh everything
	$(".game-host").removeClass("active");
	$(".start-game-button").removeClass("active");
	$(".game-player").each(function() {
		$(this).removeClass("active");
		$(this).removeClass("joined");
		$(".text", this).html("...waiting for player");
	});

	//update game id
	CURRENT_GAME_ID = id;

	//show joined players
	for (var i = 1; i <= players.length; i++) {
		$(".p"+i).addClass("joined");
		$(".p"+i+" .text").html(players[i - 1]);
	}

	$(".game-host").html(players[0]+"'s game");

	//actually display stuff
	$(".game-info-c").addClass("active");
	setTimeout(function() {$(".game-host").addClass("active");}, gameInfoTrans);
	setTimeout(function() {$(".p1").addClass("active");}, gameInfoTrans * 2);
	setTimeout(function() {$(".p2").addClass("active");}, gameInfoTrans * 3);
	setTimeout(function() {$(".p3").addClass("active");}, gameInfoTrans * 4);
	setTimeout(function() {$(".p4").addClass("active");}, gameInfoTrans * 5);
	setTimeout(function() {$(".start-game-button").addClass("active");}, gameInfoTrans * 6);
}

function showActivePlayers(users) {
	$(".all-players").html();
	for (var i = 0; i < users.length; i++) {
		if(users[i][0] != TEST_USER) {
			$(".all-players").append("<div class='player' data-username='" + users[i][0] + "'><p class='v-small'>" + users[i][0] + "<span class='join' data-id='0'>join game</span></p></div>")
		}
	}
	
	var i = 0;
	$(".player").each(function() {
		var $el = $(this);
		$(".v-small .join", $el).click(function() {
			processJoin($el);
		});
		setTimeout(function() {
			$el.addClass("active");
		}, (gameInfoTrans * i++));
	});
}

function showPlayerJoin(user, id) {
	$(".player[data-username='"+user+"'] .v-small .join").data("id", id)
	$(".player[data-username='"+user+"'] .v-small .join").addClass("active");
}

function processJoin(e) {
	if(e.hasClass("active")) {
		var id = $(".v-small .join", e).data("id");
		socket.emit("join", { name : TEST_USER, gameId : id});
		console.log("joining game "+ id);
	}
}

function getUrlVars(key) { //TEMP
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars[key];
}