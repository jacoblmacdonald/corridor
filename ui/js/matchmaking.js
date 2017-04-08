// ////////////////////
// I N I T
// ///////////////////////////////////////
//animation
var gameInfoTrans = 30;

//game info
var socket = io();
var TEST_USER = "username7";
var CURRENT_GAME_ID = 0;

//Game created (received by everyone)
socket.on("created", function(message) {
	//alert(message.host);
	console.log("creating game "+ message.gameId);
	if (message.host == TEST_USER) {
		showGameInfo(message.gameId, [TEST_USER]);
	} else {
		//$(".player[data-username='"+message.host+"']").addClass("active");
		$(".player[data-username='"+message.host+"'] .v-small .join").data("id", message.gameId)
		$(".player[data-username='"+message.host+"'] .v-small .join").addClass("active");
	}
});

//Game joined (received by all users in the joined game)
socket.on("joined", function(message) {
	// TODO: message.usernames contains an array of all users in the match
	//// send to showGameInfo()
	showGameInfo(message.gameId, message.usernames);
});

$(window).on("load", function() {
	

	$(".create-game-button").click(function() {
		if (!$(".game-info-c").hasClass("active")) {
			//socket.emit("create", { name : TEST_USER });
			socket.emit("create", { name : TEST_USER });
		}
	});

	$(".start-game-button").click(function() {
		//figure out who has joined the game and start it

		socket.emit("start", { gameId : CURRENT_GAME_ID });
		//window.location.href = "/corridor";
	});

	showActivePlayers();
});

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
	//console.log(players);

	//show joined players
	for (var i = 1; i <= players.length; i++) {
		console.log(players[i-1]);
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

function processJoin(e) {
	//alert("clicked");
	if(e.hasClass("active")) {
		var id = $(".v-small .join", e).data("id");
		socket.emit("join", { name : TEST_USER, gameId : id});
		console.log("joining game "+ id);
	}
}