// ////////////////////
// I N I T
// //////////////////////////////////////////

var CURRENT_USER = "";
var monsterRange = "";
var buffClass = "";
var buffAmt = 0;
var ranges = ["low","med","high", "wild"];
var classes = ["none", "warrior", "wizard", "troll", "priest"];
var colors = [
"#ffffff","#b5b5b5","#FF0000", "#FF9900", "#FFCC00", "#FFFF00", "#B2FF00", "#66FF00", "#33FF70", "#00FFE1", "#0088F0", "#0011FF", "#7534ff"];
var bkColor = "#111";
var screenColor = "#141414";
var activeColor = "";
var numCells = 30;
var creatorWidth = 500;
var screenWidth = 300;
var boxWidth = 80 - 4;

var object = [];

$(window).on("load", function() {
	getSession();
});

function getSession() {
/*
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
	*/
	startPage();
}

function startPage() {
	populateRanges();
	populateClasses();
	populateColors();
	populateCells();
	populateScreen();
	populateIcon();
	buttonHovers();

	$(".r-class").click(function() {updateBuffClass($(this));});
	$(".r-range").click(function() {updateRange($(this));});
	$(".color").click(function() {updateColor($(this));});
	$(".eraser").click(function() {updateEraser();});
	$(".cell").mousemove(function(e) {
		if (e.which == 1) {updateCell($(this));}
	});
	$(".cell").click(function(e) {updateCell($(this));});
	$(".submit-button").click(function() {submitObject();});
	$(".load-button").click(function() {
		toggleLoad();
	});
	//$(".loader").change(function() {loadObject();});

	populateLoad();
	//printUpdate();
}

function printUpdate() {
	//console.log("=======");
	//console.log("buff class: " + buffClass);
	//console.log("item range: " + monsterRange);
	//console.log("active color: " + activeColor);
}

// ////////////////////
// S I D E B A R
// //////////////////////////////////////////

function populateClasses() {
	for (var i = 0; i < classes.length; i++) {
		$(".buff-input").append("<div class='radio r-class' data-class='"+classes[i]+"'><div class='checkbox'></div><p class='v-small'>"+classes[i]+"</p></div>");
	}
	updateBuffClass($(".r-class[data-class='"+classes[0]+"']"));
}

function populateRanges() {
	for (var i = 0; i < ranges.length; i++) {
		$(".range-input").append("<div class='radio r-range' data-type='"+ranges[i]+"'><div class='checkbox'></div><p class='v-small'>"+ranges[i]+"</p></div>");
	}
	updateRange($(".r-range[data-type='"+ranges[0]+"']"))
}

function populateColors() {
	for (var i = 0; i < colors.length; i++) {
		$(".color-selector").append("<p class='v-small color' data-color='"+colors[i]+"'>"+colors[i]+"</p>");
	}
	$(".color").each(function() {
		$(this).css("color", $(this).data("color"));
		$(this).hover(function() {
			activateColor($(this));
		}, function() {
			deactivateColor($(this));
		})
	});
	updateColor($(".color[data-color='"+colors[0]+"']"));
}

function activateColor(e) {
	e.css("background-color", e.data("color"));
	e.css("color", bkColor);
}

function deactivateColor(e) {
	if (!e.hasClass("active")) {
		e.css("background-color", "initial");
		e.css("color", e.data("color"));
	}
}

function updateName(text) {
	$("input[name=name]").val(text);
}

function updateDescription(text) {
	$(".monster-desc").val(text);
}

function updateNumTreasures(text) {
	$("input[name=num-treasures]").val(text);
}

function updateBuffClass(e) {
	$(".r-class").removeClass("active");
	e.addClass("active");
	buffClass = e.data("class");
	if (e.data("class") == "none") {
		$(".buff-amt-p").removeClass("active");
		$(".buff-c input").removeClass("active");
	} else {
		$(".buff-amt-p").addClass("active");
		$(".buff-c input").addClass("active");
	}
}

function updateBuffClassByText(text) {
	$(".r-class").removeClass("active");
	//e.addClass("active");
	$(".r-class[data-class='"+text+"']").addClass("active");
	buffClass = text;
	if (buffClass == "none") {
		$(".buff-amt-p").removeClass("active");
		$(".buff-c input").removeClass("active");
	} else {
		$(".buff-amt-p").addClass("active");
		$(".buff-c input").addClass("active");
	}
}

function updateBuffLevel(text) {
	$("input[name=buff-amount]").val(text);
}

function updateRange(e) {
	$(".r-range").removeClass("active");
	e.addClass("active");
	monsterRange = e.data("type");

	//printUpdate();
}

function updateRangeByText(text) {
	$(".r-range").removeClass("active");
	$(".r-range[data-type='"+text+"']").addClass("active");
	monsterRange = text;

	//printUpdate();
}

function updateColor(e) {
	$(".color").removeClass("active");
	e.addClass("active");

	$(".color").each(function() {
		deactivateColor($(this));
	});

	activateColor(e);
	activeColor = e.data("color");

	$(".eraser").removeClass("active");

	//printUpdate();
}

function updateEraser() {
	$(".color").removeClass("active");
	$(".color").each(function() {
		deactivateColor($(this));
	});
	activeColor = screenColor;
	$(".eraser").addClass("active");

	//printUpdate();
}

function buttonHovers() {
	$(".load-button").hover(function() {
		$(this).css("border-color", activeColor);
		$(this).children("p").css("color", activeColor);
	}, function() {
		$(this).css("border-color", "#fff");
		$(this).children("p").css("color", "#fff");
	});

	$(".submit-button").hover(function() {
		$(this).css("border-color", activeColor);
		$(this).children("p").css("color", activeColor);
	}, function() {
		$(this).css("border-color", "#fff");
		$(this).children("p").css("color", "#fff");
	});
}

// ////////////////////
// C R E A T O R
// //////////////////////////////////////////

function populateCells() {
	var cellSize = creatorWidth / numCells;
	for (var i = 0; i < numCells; i++) {
		object.push([]);
		for (var j = 0; j < numCells; j++) {
			$(".creator").append("<div class='cell' data-x='"+j+"' data-y='"+i+"' data-color='"+screenColor+"'></div>");
			object[i][j] = screenColor;
		}
	}

	$(".cell").each(function() {
		$(this).css("width", cellSize);
		$(this).css("height", cellSize);

		$(this).hover(function() {
			activateCell($(this));
		}, function() {
			deactivateCell($(this));
		});
	});
}

function activateCell(e) {
	e.css("background-color", activeColor);
}

function deactivateCell(e) {
	e.css("background-color", e.data("color"));
}

function updateCell(e) {
	e.data("color", activeColor);
	activateCell(e);
	object[e.data("y")][e.data("x")] = activeColor;

	$(".screen-cell[data-x="+e.data("x")+"][data-y="+e.data("y")+"]").css("background-color", activeColor);
	$(".box-cell[data-x="+e.data("x")+"][data-y="+e.data("y")+"]").css("background-color", activeColor);
}

function updateCreator(text) {
	//var values = text.split(",");
	//var index = 0;
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			$(".cell[data-x='"+j+"'][data-y='"+i+"']").css("background-color", text[i][j]);
			$(".cell[data-x='"+j+"'][data-y='"+i+"']").data("color", text[i][j]);
			$(".screen-cell[data-x="+j+"][data-y="+i+"]").css("background-color", text[i][j]);
			$(".box-cell[data-x="+j+"][data-y="+i+"]").css("background-color", text[i][j]);
			object[i][j] = text[i][j];
			//index++;
		}
	}
}

// ////////////////////
// S C R E E N
// //////////////////////////////////////////

function populateScreen() {
	var cellSize = screenWidth / numCells;
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			$(".screen").append("<div class='screen-cell' data-x='"+j+"' data-y='"+i+"'></div>");
		}
	}

	$(".screen-cell").each(function() {
		$(this).css("width", cellSize);
		$(this).css("height", cellSize);
	});
}

// ////////////////////
// I C O N
// //////////////////////////////////////////
function populateIcon() {
var cellSize = boxWidth / numCells;
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			$(".box").append("<div class='box-cell' data-x='"+j+"' data-y='"+i+"'></div>");
		}
	}

	$(".box-cell").each(function() {
		$(this).css("width", cellSize);
		$(this).css("height", cellSize);
	});
}

// ////////////////////
// S U B M I T
// //////////////////////////////////////////
function submitObject() {
	console.log("========================\n");
	console.log("saving monster with attributes:");
	console.log("NAME: "+$("input[name=name]").val());
	console.log("RANGE: "+monsterRange);
	console.log("DESCRIPTION: "+$(".monster-desc").val());
	console.log("NUM TREASURES: "+$("input[name=num-treasures]").val());
	console.log("DE-BUFF CLASS: "+buffClass);
	console.log("DE-BUFF Lvl: "+$("input[name=buff-amount]").val());
	console.log("SPRITE: "+object);
	console.log("========================\n");

	const monsterData = {
		id: $("input[name=name]").val(),
		range: monsterRange,
		description: $(".monster-desc").val(),
		num_treasures: $("input[name=num-treasures]").val(),
		buff_class: buffClass,
		buff_lvl: $("input[name=buff-amount]").val(),
		sprite: object,
		//creator_id: CURRENT_USER, //change this
		published: 'False'
	};

	$.ajax({
		type: 'POST',
		data: JSON.stringify(monsterData),
		contentType: 'application/json',
		url: '/monster-upload',
		success: function(data){
			console.log(data);
		}
	});
}

// ////////////////////
// L O A D
// //////////////////////////////////////////

function populateLoad() {
	$.ajax({
		type: 'GET',
		//data: JSON.stringify(itemData),
		contentType: 'application/json',
		url: '/monster-list',
		success: function(data){
			//console.log(data);
			var monsters = JSON.parse(data);
			//console.log(items[0].id);

			for (var i = 0; i < monsters.length; i++) {
				$(".load-window").append("<p class='v-small'>"+monsters[i].id+"</p>");
			}

			$(".load-window .v-small").each(function() {
				$(this).click(function() {
					grabItem($(this));
				});
			});
		}
	});
}

function grabItem(el) {

	var monsterData = {
		id: el.html()
	};

	//console.log("grabbing item "+monsterData.id);

	$.ajax({
		type: 'POST',
		data: JSON.stringify(monsterData),
		contentType: 'application/json',
		url: '/grab-monster',
		success: function(data){
			console.log(JSON.parse(data)[0]);
			loadObject(JSON.parse(data)[0]);
		}
	});
	
}

function toggleLoad() {
	$(".load-window").toggleClass("active");
}

function loadObject(data) {

	//console.log(data);
	updateName(data.id);
	updateRangeByText(data.range);
	updateDescription(data.description);
	updateNumTreasures(data.num_treasures);
	updateBuffClassByText(data.buff_class);
	updateBuffLevel(data.buff_lvl);
	updateCreator(data.sprite);

}