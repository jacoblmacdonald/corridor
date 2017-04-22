// ////////////////////
// I N I T
// ///////////////////////////////////////
var socket = io();
var CURRENT_USER = "";
var ALL_USERS = [];

var ITEM_LIST = ["switch", "drop"];
var OTU_LIST = ["use", "switch", "drop"];

var boxWidth = 80 - 4;
var numCells = 30;
var boxCellSize = boxWidth / numCells;

var screenWidth = 300;
var screenCellSize = screenWidth / numCells;

var found_items = [];

var SWITCHING_ITEMS = false;
var SWITCH_BOX_FROM = -1;
var SWITCH_BOX_TO = -1;

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
	clearOTUS();

	for (var i = 4; i < 10; i++) { //dont hard code pls
		//console.log(items.length);
		addItemToBag(items[i]);
	}

	$(".name-row .left").html(CURRENT_USER);
}

function populatePlayers() {
	for (var i = 0; i < ALL_USERS.length; i++) {
		$(".players-side-bar").append("<p class='v-small p-"+i+"'>"+ALL_USERS[i]+"</p>");
	}
}

function updateCurrentPlayer(p) {
	$(".players-side-bar p").removeClass("active");
	$(".p-"+p).addClass("active");

	console.log($(".p-"+p).html());
	if ($(".p-"+p).html() == CURRENT_USER) {
		setAttacKMode();
	} else {
		setIdleMode();
	}
}

function initClicks() {
	$(".box").click(function(e) {
		if ($(e.target).hasClass("list-item")) {
			//this space is left blank on purpose
		} else {
			if ($(this).hasClass("active")) {
				$(".box").removeClass("active");
				unfadeBoxes();
				clearSwitchBox();
			} else {
				if (SWITCHING_ITEMS) {
					SWITCH_BOX_TO = $(this).data("index");
					attemptSwitch();
				} else {
					$(".box").removeClass("active");
					$(this).addClass("active");
					fadeBoxes();
					unfadeBox($(this));
				}
			}
		}
	});

	$(".game-c").click(function(e) {
		if ($(e.target).hasClass("box") || $(e.target).hasClass("list-item")) {

		} else {
			clearSwitchBox();
			unfadeBoxes();
			$(".box").removeClass("active");
		}
		
	});

	$(document).on('click', ".list-switch" , function() {
    	switchItems($(this));
    	$(this).parent().parent().removeClass("active");
	});

	$(document).on('click', ".list-drop" , function() {
    	dropItem($(this));
    	$(this).parent().parent().removeClass("active");
    	unfadeBoxes();
	});

	$(document).on('click', ".list-use" , function() {
		$(this).parent().parent().removeClass("active");
    	unfadeBoxes();
    	deployItem($(this));
	});
}

// ////////////////////
// G A M E   S T U F F
// //////////////////////////////////////////

function addItemToBag(item) {
	updateBox($(".bag-box.empty").first(), item.sprite, item.type);
	$(".bag-box.empty").first().removeClass("empty");
}

function setAttacKMode() {
	$(".main-button p").html("ATTACK");
}

function setIdleMode() {
	$(".main-button p").html("ready");
}

function updateLevel(i) {
	$(".name-row .right").html("lvl: "+i);
}

function updateTotalPower(i, j) {
	if (j > 0) {
		$(".power-row .right").html(i+"<span class='v-large otuAmt'> ("+j+")</span>");
	} else {
		$(".power-row .right").html(i);
	}
}

// ////////////////////
// O T U  I T E M  R O W
// //////////////////////////////////////////
function clearOTUS() {
	$(".otu-item-row").remove();
}

function addOTU(name, val) {
	$(".build-info").append("<div class='otu-item-row'><p class='left v-small'>"+name+"</p><p class='right v-small'>"+val+"</p></div>");
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

function updateBox(b, sprite, type) {
	if (sprite == null) {
		for (var i = 0; i < numCells; i++) {
			for (var j = 0; j < numCells; j++) {
				$(".box-cell[data-x="+j+"][data-y="+i+"]", b).css("background-color", "#111");
			}
		}
		updateBoxMenu(b, type);
	} else {
		for (var i = 0; i < numCells; i++) {
			for (var j = 0; j < numCells; j++) {
				if (i < sprite.length) {
					$(".box-cell[data-x="+j+"][data-y="+i+"]", b).css("background-color", sprite[i][j]);
				}
			}
		}
		updateBoxMenu(b, type);
	}
}

function updateBoxMenu(b, type) {
	$(".box-menu", b).html("");
	if (type == "otu") {
		for (var i = 0; i < OTU_LIST.length; i++) {
			$(".box-menu", b).append("<p class='v-small list-item list-"+OTU_LIST[i]+"'>"+OTU_LIST[i]+"</p>")
		}
	} else {
		for (var i = 0; i < ITEM_LIST.length; i++) {
			$(".box-menu", b).append("<p class='v-small list-item list-"+ITEM_LIST[i]+"'>"+ITEM_LIST[i]+"</p>")
		}
	}
}

function fadeBoxes() {
	$(".box").addClass("fade");
}

function unfadeBoxes() {
	$(".box").removeClass("fade");
}

function unfadeBox(e) {
	e.removeClass("fade");
}

function clearSwitchBox() {
	SWITCHING_ITEMS = false;
	SWITCH_BOX_FROM = -1;
	SWITCH_BOX_TO = -1;
}

function updateItem(message) {
	if (message.fromItem == null) {
		updateBox($(".box[data-index='"+message.fromIndex+"'"), null, null);
	} else {
		updateBox($(".box[data-index='"+message.fromIndex+"'"), message.fromItem.sprite, message.fromItem.type);
	}
	
	if (message.toItem == null) {
		updateBox($(".box[data-index='"+message.toIndex+"'"), null, null);
	} else {
		updateBox($(".box[data-index='"+message.toIndex+"'"), message.toItem.sprite, message.toItem.type);
	}
}

function updateDropItem(index) {
	updateBox($(".box[data-index='"+index+"'"), null, null);
}

// ////////////////////
// B O X   M E N U
// //////////////////////////////////////////
function switchItems(e) {
	SWITCHING_ITEMS = true;
	SWITCH_BOX_FROM = e.parent().parent().data("index");
	//e
	//alert("attempting switch from "+ SWITCH_BOX_FROM);
}

function dropItem(e) {
	console.log(e);
	var i = $(e).parent().parent().data("index");
	attemptDrop(i);
}

function deployItem(e) {
	var i = $(e).parent().parent().data("index");
	attemptUse(i);
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

	$(".monster-lvl").html("level "+monster.value);
	$(".monster-name").html(monster.name);
	$(".monster-desc").html(monster.description);
}

// ////////////////////
// S O C K E T
// //////////////////////////////////////////
function attemptDrop(i) {
	socket.emit("drop_item", {"gameId" :getId(), "drop_item": i});
}

function attemptUse(i) {
	socket.emit("use_item", {"gameId" :getId(), "used_item": i});
}

function attemptSwitch() {
	if (SWITCH_BOX_FROM != -1 && SWITCH_BOX_TO != -1) {
		//console.log("attempting switch from "+ SWITCH_BOX_FROM + " to " + SWITCH_BOX_TO);

		socket.emit("switch_item", { "gameId" : getId(), "switch_from" : SWITCH_BOX_FROM, "switch_to" : SWITCH_BOX_TO });

		//socket.emit("setup", { "gameId" : getId(), "username" : CURRENT_USER });
	}
	clearSwitchBox();
	//unfadeBoxes();
	$(".box").removeClass("active");
}

socket.on("give_switch", function(message) {
	//alert("got switch");
	$(".box").removeClass("active");
	unfadeBoxes();
	clearSwitchBox();
	console.log(message.fromIndex);
	console.log(message.fromItem);
	console.log(message.toIndex);
	console.log(message.toItem);
	updateItem(message);
	updateLevel(message.level);
	updateTotalPower(message.totalPower, message.otuAmt);
});

socket.on("item_dropped", function(message) {
	console.log(message);
	updateDropItem(message.item);
	updateLevel(message.level);
	updateTotalPower(message.totalPower, message.otuAmt);
});

socket.on("item_used", function(message) {
	console.log(message);
	updateDropItem(message.item);
	updateLevel(message.level);
	updateTotalPower(message.totalPower, message.otuAmt);
	addOTU(message.itemName, message.itemAmt);
});