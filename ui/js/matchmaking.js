// ////////////////////
// I N I T
// ///////////////////////////////////////
var gameInfoTrans = 30;
var socket = io();

//Game created (received by everyone)
socket.on("created", function(message) {
	// TODO: add "join game" button next to username stored in message.name, with a data-id of message.gameId
	// If message.name is not in the list of usernames, then this is the creator, so add the gameId to the START GAME button to enable it
	//// $(".start-game-button").data("id", message.gameId);
});

//Game joined (received by all users in the joined game)
socket.on("joined", function(message) {
	// TODO: message.usernames contains an array of all users in the match
	//// send to showGameInfo()
});

$(window).on("load", function() {
	

	$(".create-game-button").click(function() {
		if (!$(".game-info-c").hasClass("active")) {
			showGameInfo();
			socket.emit("create", { name : "username" });
		}
	});

	$(".start-game-button").click(function() {
		//figure out who has joined the game and start it

		socket.emit("start", { gameId : 0 });
		window.location.href = "/corridor";
	});

	$(".join").click(function() {
		if($(this).hasClass("active")) {
			socket.emit("join", { name : "username", gameId : $(this).data("id") });
		}
	});

	showActivePlayers();
});

function showGameInfo() {
	$(".game-info-c").addClass("active");
	$(this).addClass("active");

	setTimeout(function() {$(".game-host").addClass("active");}, gameInfoTrans);
	setTimeout(function() {$(".p1").addClass("active");}, gameInfoTrans * 2);
	setTimeout(function() {$(".p2").addClass("active");}, gameInfoTrans * 3);
	setTimeout(function() {$(".p3").addClass("active");}, gameInfoTrans * 4);
	setTimeout(function() {$(".p4").addClass("active");}, gameInfoTrans * 5);
	setTimeout(function() {$(".start-game-button").addClass("active");}, gameInfoTrans * 6);
}

function showActivePlayers() {
	var i = 0;
	$(".player").each(function() {
		var $el = $(this);
		setTimeout(function() {
			$el.addClass("active");
		}, (gameInfoTrans * i++));
	});
}