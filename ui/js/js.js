// ////////////////////
// I N I T
// ///////////////////////////////////////
var socket = io();
var CURRENT_USER = "";
var CURRENT_CLASS = null;

var ITEM_LIST = ["switch", "drop"];
var OTU_LIST = ["buff-self", "attack-monster", "buff-monster", "switch", "drop"];
var CLASS_LIST = ["change-class", "switch", "drop"];

var boxWidth = 80 - 4;
var numCells = 30;
var boxCellSize = boxWidth / numCells;

var screenWidth = 300;
var screenCellSize = screenWidth / numCells;

var found_items = [];

var SWITCHING_ITEMS = false;
var SWITCH_BOX_FROM = -1;
var SWITCH_BOX_TO = -1;

var USE_SVGS = true;
var USE_LOADER = false;

var loadingAnimationFinished = false;
var loaded = false;

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
	setTimeout(function() {
		loadingAnimationFinished = true;
		if(loaded) {
			$("body").addClass("loaded");
		}
	}, USE_LOADER ? 5000 : 1);
	socket.emit("setup", { "gameId" : getId(), "username" : CURRENT_USER });
}

function getId() {
    return window.location.href.split("=")[1];
}

socket.on("ready", function(message) {
	loadPage(message.items, message.monster, message.current_player);
});

// ////////////////////
// I N I T (FRONTEND)
// ///////////////////////////////////////

function loadPage(items, monster, current_player) {
	initClicks();
	if(!USE_SVGS) {
		initBoxes();
		initScreen();
	}
	updateScreen(monster);
	clearOTUS();
	updateBag(items);

	$(".name-row .left").html(CURRENT_USER);

	$(".main-button").click(function() {
		if ($(this).hasClass("clicked")) {

		} else {
			$(this).addClass("clicked");
			switch($(this).data("mode")) {
			case "attack":
				attack();
				break;
			case "idle":
				setReadyMode();
				break;
			case "ready":
				setIdleMode();
				break;
			}
		}
	});

	loaded = true;
	if(loadingAnimationFinished) {
		$("body").addClass("loaded");
	}
}

function updateAllItems(items) {
	for(var i = 0; i < items.length; i++) {
		updateDropItem(i);
		if(items[i]) {
			updateBox($(".box[data-index='" + i + "']"), items[i]);
		}
	}
}

function updateBag(items) {
	for (var i = 4; i < items.length; i++) {
		updateDropItem(i);
		if(items[i]) {
			updateBox($(".box[data-index='" + i + "']"), items[i]);
		}
	}
}

function populatePlayers(players, current_player) {
	$(".players-side-bar").html("");
	for (var i = 0; i < players.length; i++) {
		var $player = $("<div class='p-" + i + "'></div>").appendTo($(".players-side-bar"));
		$player.append("<p class='v-small username'>" + players[i].name + "</p>");
		$player.append("<p class='v-small'>level " + players[i].level + (players[i].class != "none" ? " <span class='" + players[i].class + "'>" + players[i].class + "</span>" : "") + "</p>");
		$player.append("<p class='v-small'>" + players[i].totalPower + (players[i].currentOTUAmt != 0 ? " <span class='highlight'>(+" + players[i].currentOTUAmt + ")</span>" : "") + " power</p>");
	}
	updateCurrentPlayer(current_player);
}

function updateCurrentPlayer(p) {
	$(".players-side-bar div").removeClass("active");
	$(".p-" + p).addClass("active");

	if ($(".p-" + p + " .username").html() == CURRENT_USER) {
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
			if ($(this).hasClass("active") || (!SWITCHING_ITEMS && $(".box-menu", this).html() == "")) {
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

	$(document).on('click', ".list-buff-self" , function() {
		$(this).parent().parent().removeClass("active");
    	unfadeBoxes();
    	deployItem($(this));
	});

	$(document).on('click', ".list-attack-monster" , function() {
		$(this).parent().parent().removeClass("active");
    	unfadeBoxes();
    	attackMonster($(this));
	});

	$(document).on('click', ".list-buff-monster" , function() {
		$(this).parent().parent().removeClass("active");
    	unfadeBoxes();
    	buffMonster($(this));
	});

	$(document).on('click', ".list-change-class" , function() {
		$(this).parent().parent().removeClass("active");
    	unfadeBoxes();
    	changeClass($(this));
	});
}

// ////////////////////
// G A M E   S T U F F
// //////////////////////////////////////////

function setAttacKMode() {
	$(".main-button").data("mode", "attack");
	$(".main-button p").html("attack");
}

function setIdleMode() {
	$(".main-button").data("mode", "idle");
	$(".main-button p").html("ready");
}

function setReadyMode() {
	$(".main-button").data("mode", "ready");
	$(".main-button p").html("waiting...");
}

function updateLevel(i) {
	$(".name-row .right").html("lvl: "+i);
}

function updateTotalPower(i, j) {
	if (j > 0) {
		$(".power-row .right").html(i+"<span class='v-large otuAmt'> (+"+j+")</span>");
	} else {
		$(".power-row .right").html(i);
	}
}

function updateClass(i) {
	$(".Warrior, .Wizard, .Troll, .Priest").removeClass("Warrior Wizard Troll Priest");
	$(".class-row .right").html("<span class='" + i + "'>" + i + "</span>");
	CURRENT_CLASS = i;
	if(CURRENT_CLASS == "Troll") {
		$(".troll-debuff").addClass("Troll");
	}
}

function endGame(winner, level) {
	if(CURRENT_USER == winner) {
		alert("YOU HAVE REACHED LEVEL " + level + "! CONGRATULATIONS!");
	}
	else {
		alert("PLAYER " + winner.toUpperCase + " HAS REACHED LEVEL " + level + "! YOU LOSE!");
	}
	window.location.href = "/";
}

function updateMonsterValue(val) {
	$(".monster-lvl .lvl").text("level "+val);
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
		for (var i = 0; i < numCells; i++) {
			for (var j = 0; j < numCells; j++) {
				$(this).append("<div class='box-cell' data-x='"+j+"' data-y='"+i+"' style='width:"+boxCellSize+";height:"+boxCellSize+";'></div>");
			}
		}
	});
}

function updateBox(b, item) {
	if (item == null) {
		if(!USE_SVGS) {
			for (var i = 0; i < numCells; i++) {
				for (var j = 0; j < numCells; j++) {
					$(".box-cell[data-x="+j+"][data-y="+i+"]", b).css("background-color", "#111");
				}
			}
		}
		else {
			$("svg", b).remove();
		}
		$(".box-level p", b).html("");
		b.removeClass("high");
		b.removeClass("med");
		b.removeClass("low");
		b.removeClass("wild");
		updateBoxMenu(b, null);
	} else {
		if(!USE_SVGS) {
			for (var i = 0; i < numCells; i++) {
				for (var j = 0; j < numCells; j++) {
					if (i < item.sprite.length) {
						$(".box-cell[data-x="+j+"][data-y="+i+"]", b).css("background-color", item.sprite[i][j]);
					}
				}
			}
		}
		else {
			$("svg", b).remove();
			$(b).append(item.svg);
		}
		if(item.type == "otu") {
			if(CURRENT_CLASS != "Priest") {
				if(item.rerolled && CURRENT_CLASS == "Wizard") {
					$(".box-level p", b).html("?").addClass("Wizard");
				}
				else {
					if (item.range = "low") {
						$(".box-level p", b).html("L");
						b.addClass("low");
					} else if (item.range = "med") {
						$(".box-level p", b).html("M");
						b.addClass("med");
					} else if (item.range = "high") {
						$(".box-level p", b).html("H");
						b.addClass("high");
					} else if (item.range = "wild") {
						$(".box-level p", b).html("W");
						b.addClass("wild");
					}
				}
			}
			else {
				$(".box-level p", b).html(item.value).addClass("Priest");
			}
		}
		else if(item.type == "class") {
			$(".box-level p", b).html("c");
		}
		else {
			if(CURRENT_CLASS != "Warrior") {
				if(item.rerolled && CURRENT_CLASS == "Wizard") {
					$(".box-level p", b).html(item.value).addClass("Wizard");
				}
				else {
					$(".box-level p", b).html(item.value);
				}
			}
			else {
				$(".box-level p", b).html(item.value + 1).addClass("Warrior");
			}
		}
		updateBoxMenu(b, item);
	}
}

function updateBoxMenu(b, item) {
	$(".box-menu", b).html("");
	if(item != null) {
		$(".box-menu", b).append("<p class='v-small'>" + item.name + "</p><br>");
		if (item.type == "otu") {
			$(".box-menu", b).append("<p class='v-small item-range'>range: " + item.range + "</p><br>");
			for (var i = 0; i < OTU_LIST.length; i++) {
				$(".box-menu", b).append("<p class='v-small list-item list-"+OTU_LIST[i]+"'>"+OTU_LIST[i]+"</p>");
			}
		} else if (item.type == "class"){
			for (var i = 0; i < CLASS_LIST.length; i++) {
				$(".box-menu", b).append("<p class='v-small list-item list-"+CLASS_LIST[i]+"'>"+CLASS_LIST[i]+"</p>");
			}
		} else {
			$(".box-menu", b).append("<p class='v-small'>" + item.type + "</p><br>");
			$(".box-menu", b).append("<p class='v-small'>power: " + item.value + "</p><br>");
			for (var i = 0; i < ITEM_LIST.length; i++) {
				$(".box-menu", b).append("<p class='v-small list-item list-"+ITEM_LIST[i]+"'>"+ITEM_LIST[i]+"</p>");
			}
		}
		if(item.rerolled == true && CURRENT_CLASS == "Wizard") {
			$(".box-menu .item-range", b).addClass("Wizard");
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
		updateBox($(".box[data-index='" + message.fromIndex + "']"), null);
	} else {
		updateBox($(".box[data-index='" + message.fromIndex + "']"), message.fromItem);
	}
	
	if (message.toItem == null) {
		updateBox($(".box[data-index='" + message.toIndex + "']"), null);
	} else {
		updateBox($(".box[data-index='" + message.toIndex + "']"), message.toItem);
	}
}

function updateDropItem(index) {
	updateBox($(".box[data-index='"+index+"'"), null);
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
	var i = $(e).parent().parent().data("index");
	attemptDrop(i);
}

function deployItem(e) {
	var i = $(e).parent().parent().data("index");
	attemptUse(i);
}

function attackMonster(e) {
	var i = $(e).parent().parent().data("index");
	attemptAttackMonster(i);
}

function buffMonster(e) {
	var i = $(e).parent().parent().data("index");
	attemptBuffMonster(i);
}

//uses same protocol as use otu item
function changeClass(e) {
	var i = $(e).parent().parent().data("index");
	attemptUse(i);
}

// ////////////////////
// S C R E E N
// //////////////////////////////////////////
function initScreen() {
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			$(".screen").append("<div class='screen-cell' data-x='"+j+"' data-y='"+i+"' style='width:"+screenCellSize+";height:"+screenCellSize+";'></div>");
		}
	}
}

function updateScreen(monster) {
	if(!USE_SVGS) {
		for (var i = 0; i < numCells; i++) {
			for (var j = 0; j < numCells; j++) {
				if (i < monster.sprite.length) {
					$(".screen-cell[data-x="+j+"][data-y="+i+"]").css("background-color", monster.sprite[i][j]);
				}
			}
		}
	}
	else {
		$(".screen svg").remove();
		$(".screen").append(monster.svg);
	}

	$(".monster-lvl .lvl").text("level "+monster.value);
	$(".monster-name").html(monster.name);
	$(".monster-desc").html(monster.description);
	$(".monster-reward").html("reward: " + monster.item_reward + " item(s)");
}

// ////////////////////
// S O C K E T
// //////////////////////////////////////////
function attack() {
	socket.emit("attack", {"gameId" :getId()});
}

function attemptDrop(i) {
	socket.emit("drop_item", {"gameId" :getId(), "drop_item": i});
}

function attemptUse(i) {
	socket.emit("use_item", {"gameId" :getId(), "used_item": i});
}

function attemptAttackMonster(i) {
	socket.emit("attack_monster_with_item", {"gameId" :getId(), "used_item": i});
}

function attemptBuffMonster(i) {
	socket.emit("buff_monster_with_item", {"gameId" :getId(), "used_item": i});
}

function attemptSwitch() {
	if (SWITCH_BOX_FROM != -1 && SWITCH_BOX_TO != -1) {
		socket.emit("switch_item", { "gameId" : getId(), "switch_from" : SWITCH_BOX_FROM, "switch_to" : SWITCH_BOX_TO });
		//socket.emit("setup", { "gameId" : getId(), "username" : CURRENT_USER });
	}
	clearSwitchBox();
	//unfadeBoxes();
	$(".box").removeClass("active");
}

//message.item is usually just an index in the below functions

socket.on("attack_result", function(message) {
	//updateLevel(message.level);
	//updateTotalPower(message.totalPower, message.otuAmt);
	//updateScreen(message.monster);
	//clearOTUS();
	//updateBag(message.items);
	//alert(message.success ? "Monster Defeated" : "Player Defeated");//TODO: add some UI for this
	$(".main-button").removeClass("clicked");
	if (message.success) {
		showMonsterDefeatAnimation(message);
	} else {
		showPlayerDefeatAnimation(message);
	}
});

socket.on("update_players", function(message) {
	console.log(message);
	populatePlayers(message.players, message.currentPlayer);
});

socket.on("refuse_switch", function() {
	$(".box").removeClass("active");
	unfadeBoxes();
	clearSwitchBox();
});

socket.on("give_switch", function(message) {
	$(".box").removeClass("active");
	unfadeBoxes();
	clearSwitchBox();
	updateItem(message);
	updateLevel(message.level);
	updateTotalPower(message.totalPower, message.otuAmt);
});

socket.on("item_dropped", function(message) {
	updateDropItem(message.item);
	updateLevel(message.level);
	updateTotalPower(message.totalPower, message.otuAmt);
});

socket.on("item_used", function(message) {
	updateDropItem(message.item);
	updateLevel(message.level);
	updateTotalPower(message.totalPower, message.otuAmt);
	addOTU(message.itemName, message.itemAmt);
});

socket.on("class_changed", function(message) {
	updateClass(message.class);
	updateAllItems(message.items);
	updateTotalPower(message.totalPower, message.otuAmt);
});

socket.on("victory", function(message) {
	endGame(message.winner, message.level);
});

socket.on("monster_attacked_with_item", function(message) {
	console.log(message);
	showMonsterAttackedAnimation(message);
});

socket.on("monster_buffed_with_item", function(message) {
	console.log(message);
	showMonsterBuffedAnimation(message);
});

// ////////////////////
// A N I M A T I O N S
// //////////////////////////////////////////
function clearColor() {
	$(".screen-c").removeClass("flash-green");
	$(".box").removeClass("flash-green");
	$(".screen-c").removeClass("flash-red");
	$(".box").removeClass("flash-red");
}

function setGreen() {
	$(".screen-c").addClass("flash-green");
	$(".box").addClass("flash-green");
}

function setRed() {
	$(".screen-c").addClass("flash-red");
	$(".box").addClass("flash-green");
}

function hideScreen(text) {
	$(".screen-text").html(text);
	$(".screen-text").addClass("active");
	$(".screen").addClass("hidden");
	$(".screen-info-c").addClass("hidden");

}

function showScreen() {
	$(".screen-text").removeClass("active");
	$(".screen").removeClass("hidden");
	$(".screen-info-c").removeClass("hidden");
}

function showMonsterDefeatAnimation(message) {
	var animTime = 100;
	hideScreen("monster defeated");
	setGreen();
	setTimeout(function() {
		clearColor();
	}, animTime);
	setTimeout(function() {
		setGreen();
	}, animTime * 2);
	setTimeout(function() {
		clearColor();
	}, animTime * 3);
	setTimeout(function() {
		setGreen();
	}, animTime * 4);
	setTimeout(function() {
		clearColor();
	}, animTime * 5);
	setTimeout(function() {
		setGreen();
	}, animTime * 6);
	setTimeout(function() {
		clearColor();
	}, animTime * 7);
	setTimeout(function() {
		setGreen();
	}, animTime * 8);
	setTimeout(function() {
		clearColor();
	}, animTime * 9);
	setTimeout(function() {
		setGreen();
	}, animTime * 10);
	setTimeout(function() {
		clearColor();
	}, animTime * 11);
	setTimeout(function() {
		setGreen();
	}, animTime * 12);
	setTimeout(function() {
		clearColor();
		showScreen();
		updateLevel(message.level);
		updateTotalPower(message.totalPower, message.otuAmt);
		updateScreen(message.monster);
		clearOTUS();
		updateBag(message.items);
	}, animTime * 13);
}

function showPlayerDefeatAnimation(message) {
	var animTime = 100;
	hideScreen("player defeated");
	setRed();
	setTimeout(function() {
		clearColor();
	}, animTime);
	setTimeout(function() {
		setRed();
	}, animTime * 2);
	setTimeout(function() {
		clearColor();
	}, animTime * 3);
	setTimeout(function() {
		setRed();
	}, animTime * 4);
	setTimeout(function() {
		clearColor();
	}, animTime * 5);
	setTimeout(function() {
		setRed();
	}, animTime * 6);
	setTimeout(function() {
		clearColor();
	}, animTime * 7);
	setTimeout(function() {
		setRed();
	}, animTime * 8);
	setTimeout(function() {
		clearColor();
	}, animTime * 9);
	setTimeout(function() {
		setRed();
	}, animTime * 10);
	setTimeout(function() {
		clearColor();
	}, animTime * 11);
	setTimeout(function() {
		setRed();
	}, animTime * 12);
	setTimeout(function() {
		clearColor();
		showScreen();
		updateLevel(message.level);
		updateTotalPower(message.totalPower, message.otuAmt);
		updateScreen(message.monster);
		clearOTUS();
		updateBag(message.items);
	}, animTime * 13);
}

function showMonsterAttackedAnimation(message) {
	var animTime = 100;
	hideScreen("monster attacked by "+ message.usingPlayer);
	setGreen();
	setTimeout(function() {
		clearColor();
	}, animTime);
	setTimeout(function() {
		setGreen();
	}, animTime * 2);
	setTimeout(function() {
		clearColor();
	}, animTime * 3);
	setTimeout(function() {
		setGreen();
	}, animTime * 4);
	setTimeout(function() {
		clearColor();
	}, animTime * 5);
	setTimeout(function() {
		setGreen();
	}, animTime * 6);
	setTimeout(function() {
		clearColor();
	}, animTime * 7);
	setTimeout(function() {
		setGreen();
	}, animTime * 8);
	setTimeout(function() {
		clearColor();
	}, animTime * 9);
	setTimeout(function() {
		setGreen();
	}, animTime * 10);
	setTimeout(function() {
		clearColor();
	}, animTime * 11);
	setTimeout(function() {
		setGreen();
	}, animTime * 12);
	setTimeout(function() {
		clearColor();
		showScreen();
		updateMonsterValue(message.monsterVal);
		if (message.usingPlayer == CURRENT_USER) {
			updateDropItem(message.item);
		}
	}, animTime * 13);
}

function showMonsterBuffedAnimation(message) {
	var animTime = 100;
	hideScreen("monster buffed by "+ message.usingPlayer);
	setRed();
	setTimeout(function() {
		clearColor();
	}, animTime);
	setTimeout(function() {
		setRed();
	}, animTime * 2);
	setTimeout(function() {
		clearColor();
	}, animTime * 3);
	setTimeout(function() {
		setRed();
	}, animTime * 4);
	setTimeout(function() {
		clearColor();
	}, animTime * 5);
	setTimeout(function() {
		setRed();
	}, animTime * 6);
	setTimeout(function() {
		clearColor();
	}, animTime * 7);
	setTimeout(function() {
		setRed();
	}, animTime * 8);
	setTimeout(function() {
		clearColor();
	}, animTime * 9);
	setTimeout(function() {
		setRed();
	}, animTime * 10);
	setTimeout(function() {
		clearColor();
	}, animTime * 11);
	setTimeout(function() {
		setRed();
	}, animTime * 12);
	setTimeout(function() {
		clearColor();
		showScreen();
		updateMonsterValue(message.monsterVal);
		if (message.usingPlayer == CURRENT_USER) {
			updateDropItem(message.item);
		}
	}, animTime * 13);
}