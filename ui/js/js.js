// ////////////////////
// I N I T
// ///////////////////////////////////////
var socket = io();
var CURRENT_USER = "";
var ALL_USERS = [];

var ITEM_LIST = ["switch", "drop"];

var boxWidth = 80 - 4;
var numCells = 30;
var boxCellSize = boxWidth / numCells;

var found_items = [];

$(window).on("load", function() {getSession();});

// ////////////////////
// I N I T (SERVER)
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
	socket.emit("setup", { "gameId" : getId(), "username" : CURRENT_USER });
}

function getId() {
    return window.location.href.split("=")[1];
}

socket.on("ready", function(message) {
	console.log(message.usernames);
	console.log(message.items);
	ALL_USERS = message.usernames;
	loadPage(message.items);
});

// ////////////////////
// I N I T (FRONTEND)
// ///////////////////////////////////////

function loadPage(items) {
	initClicks();
	populatePlayers();
	initBoxes();

	for (var i = 0; i < items.length; i++) {
		addItemToBag(items[i]);
	}
}

function populatePlayers() {
	for (var i = 0; i < ALL_USERS.length; i++) {
		$(".players-side-bar").append("<p class='v-small'>"+ALL_USERS[i]+"</p>");
	}
}

function initClicks() {
	$(".box").click(function() {
		if ($(this).hasClass("active")) {
			$(".box").removeClass("active");
		} else {
			$(".box").removeClass("active");
			$(this).addClass("active");
		}
	});
}

// ////////////////////
// G A M E   S T U F F
// //////////////////////////////////////////

function addItemToBag(item) {
	updateBox($(".bag-box.empty").first(), item.sprite);
	$(".bag-box.empty").first().removeClass("empty");
}

// ////////////////////
// B O X E S
// //////////////////////////////////////////
function initBoxes() {
	$(".box").each(function() {
		console.log("creating new box");
		for (var i = 0; i < numCells; i++) {
			for (var j = 0; j < numCells; j++) {
				$(this).append("<div class='box-cell' data-x='"+j+"' data-y='"+i+"' style='width:"+boxCellSize+";height:"+boxCellSize+";'></div>");
			}
		}
	});
}

function updateBox(b, sprite) {
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			if (i < sprite.length) {
				$(".box-cell[data-x="+j+"][data-y="+i+"]", b).css("background-color", sprite[i][j]);
			}
		}
	}
	updateBoxMenu(b, "this");
}

function updateBoxMenu(b, type) {
	$(".box-menu", b).html("");
	for (var i = 0; i < ITEM_LIST.length; i++) {
		$(".box-menu", b).append("<p class='v-small'>"+ITEM_LIST[i]+"</p>")
	}
}