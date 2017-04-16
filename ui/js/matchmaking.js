// ////////////////////
// I N I T
// ///////////////////////////////////////
//animation
var gameInfoTrans = 30;

//game info
var socket = io();
var CURRENT_USER = "";

$(window).on("load", function() {
	getSession();
});

// ////////////////////
// I N I T
// ///////////////////////////////////////

function getSession() {

	$.ajax({
		type: 'GET',
		//data: JSON.stringify(loginData),
		contentType: 'application/json',
		url: '/getThisUser',
		success: function(data){
			CURRENT_USER = data;
			startPage();
		}
	});
}

function startPage() {
	$(".username").html(CURRENT_USER);
	
	$(".create-game-button").click(function() {
		if (!$(".game-info-c").hasClass("active")) {
			socket.emit("create", { username : CURRENT_USER });
		}
	});

	$(".start-game-button").click(function() {
		socket.emit("start", { username : CURRENT_USER });
		//window.location.href = "/corridor";
	});

	$(".logout-button").click(function() {
		//alright arvind here is your logout button :)))
	});

	socket.emit("loaded", { username : CURRENT_USER });
}

// ////////////////////
// S O C K E T S
// ///////////////////////////////////////

socket.on("created", function(message) {
	if (message.host == CURRENT_USER) {
		showGameInfo([ CURRENT_USER ]);
	} else {
		showPlayerJoin(message.host);
	}
});

socket.on("joined", function(message) {
	showGameInfo(message.usernames);
});


socket.on("connected", function(message) {
	showActivePlayers(message.users);
	for (var i = 0; i < message.users.length; i++) {
		if (message.users[i][1]) {
			showPlayerJoin(message.users[i][0]);
		}
	}
});

socket.on("started", function(message) {
	window.location.href = "/corridor?id=" + message.gameId;
});



// ////////////////////
// D I S P L A Y
// ///////////////////////////////////////

function showGameInfo(players) {
	if(players[0] != CURRENT_USER) {
		$(".start-game-button").off("click");
		$(".start-game-button p").text("waiting for host");
	}

	//refresh everything
	$(".game-host").removeClass("active");
	$(".start-game-button").removeClass("active");
	$(".game-player").each(function() {
		$(this).removeClass("active");
		$(this).removeClass("joined");
		$(".text", this).html("...waiting for player");
	});

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
	$(".all-players").html("");
	for (var i = 0; i < users.length; i++) {
		if(users[i][0] != CURRENT_USER) {
			$(".all-players").append("<div class='player' data-username='" + users[i][0] + "'><p class='v-small'>" + users[i][0] + "<span class='join' data-host=''>join game</span></p></div>")
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

function showPlayerJoin(host) {
	$(".player[data-username='"+host+"'] .v-small .join").data("host", host)
	$(".player[data-username='"+host+"'] .v-small .join").addClass("active");
}

function processJoin(e) {
	if(e.hasClass("active")) {
		var host = $(".v-small .join", e).data("host");
		socket.emit("join", { username : CURRENT_USER, hostname : host});
	}
}