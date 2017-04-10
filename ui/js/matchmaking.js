// ////////////////////
// I N I T
// ///////////////////////////////////////
//animation
var gameInfoTrans = 30;

//game info
var socket = io();
var TEST_USER = "username7";
var CURRENT_GAME_ID = 0;

$(window).on("load", function() {
	

	$(".create-game-button").click(function() {
		if (!$(".game-info-c").hasClass("active")) {
			socket.emit("create", { name : TEST_USER });
		}
	});

	$(".start-game-button").click(function() {
		socket.emit("start", { gameId : CURRENT_GAME_ID });
		//window.location.href = "/corridor";
	});

	$(".logout-button").click(function() {
		//alright arvind here is your logout button :)))
	});

	socket.emit("loaded", { username : TEST_USER });
});

// ////////////////////
// I N I T
// ///////////////////////////////////////

socket.on("created", function(message) {
	console.log("creating game "+ message.gameId);
	if (message.host == TEST_USER) {
		showGameInfo(message.gameId, [TEST_USER]);
	} else {
		showPlayerJoin(message.host, message.gameId);
	}
});

socket.on("joined", function(message) {
	showGameInfo(message.gameId, message.usernames);
});


socket.on("connected", function(message) {
	console.log(message.users);
	for (var i = 0; i < message.users.length; i++) {
		if (message.users[i][1] !== null) {
			showPlayerJoin(message.users[i][0], message.users[i][1]);
		}
	}
	showActivePlayers();
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

function showActivePlayers() {
	for (var i = 0; i < 20; i++) {
		$(".all-players").append("<div class='player' data-username='username"+i+"'><p class='v-small'>username "+i+"<span class='join' data-id='0'>join game</span></p></div>")
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