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

var screenWidth = 300;
var screenCellSize = screenWidth / numCells;

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
	console.log(message.monster);
	console.log(message.current_player);
	ALL_USERS = message.usernames;
	loadPage(message.items, message.monster, message.current_player);
});

// ////////////////////
// I N I T (FRONTEND)
// ///////////////////////////////////////

function loadPage(items, monster, current_player) {
	initClicks();
	populatePlayers();
	initBoxes();
	initScreen();
	updateScreen(monster);
	updateCurrentPlayer(current_player);

	for (var i = 0; i < items.length; i++) {
		addItemToBag(items[i]);
	}
}

function populatePlayers() {
	for (var i = 0; i < ALL_USERS.length; i++) {
		$(".players-side-bar").append("<p class='v-small p-"+i+"'>"+ALL_USERS[i]+"</p>");
	}
}

function updateCurrentPlayer(p) {
	$(".players-side-bar p").removeClass("active");
	$(".p-"+p).addClass("active");

}

function initClicks() {
	$(".box").click(function(e) {
		if ($(e.target).hasClass("list-item")) {

		} else {
			if ($(this).hasClass("active")) {
				$(".box").removeClass("active");
			} else {
				$(".box").removeClass("active");
				$(this).addClass("active");
			}
		}
	});

	$(document).on('click', ".list-switch" , function() {
    	switchItems($(this));
	});

	$(document).on('click', ".list-drop" , function() {
    	dropItem($(this));
	});

	$(document).on('click', ".list-use" , function() {
    	deployItem($(this));
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
		$(".box-menu", b).append("<p class='v-small list-item list-"+ITEM_LIST[i]+"'>"+ITEM_LIST[i]+"</p>")
	}
}

// ////////////////////
// B O X   M E N U
// //////////////////////////////////////////
function switchItems(e) {
	alert(":)");
}

function dropItem(e) {

}

function deployItem(e) {

}

// ////////////////////
// S C R E E N
// //////////////////////////////////////////
function initScreen() {
	console.log("creating screen");
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			$(".screen").append("<div class='screen-cell' data-x='"+j+"' data-y='"+i+"' style='width:"+screenCellSize+";height:"+screenCellSize+";'></div>");
		}
	}
}

function updateScreen(monster) {
	console.log("updating screen with: "+monster.name);
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			if (i < monster.sprite.length) {
				$(".screen-cell[data-x="+j+"][data-y="+i+"]").css("background-color", monster.sprite[i][j]);
			}
		}
	}
}