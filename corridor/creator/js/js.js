// ////////////////////
// I N I T
// //////////////////////////////////////////

var itemType = "";
var types = ["monster","weapon","item"];
var colors = [
"#FF0000", "#FF9900", "#FFCC00", "#FFFF00", "#B2FF00", "#66FF00", "#33FF70", "#00FFE1", "#0088F0", "#0011FF", "#7534ff"];
var bkColor = "#111";
var screenColor = "#141414";
var activeColor = "";
var numCells = 20;
var creatorWidth = 500;
var screenWidth = 300;
var boxWidth = 80;

var object = [];

$(window).on("load", function() {
	populateTypes();
	populateColors();
	populateCells();
	populateScreen();
	populateIcon();
	buttonHovers();

	$(".radio").click(function() {updateRadio($(this));});
	$(".color").click(function() {updateColor($(this));});
	$(".eraser").click(function() {updateEraser();});
	$(".cell").mousemove(function(e) {
		if (e.which == 1) {updateCell($(this));}
	});
	$(".cell").click(function(e) {updateCell($(this));});
	$(".submit-button").click(function() {submitObject();});
	$(".load-button").click(function() {
		$(".loader").val("");
		$(".loader").trigger("click");
	});
	$(".loader").change(function() {loadObject();});

	printUpdate();
});

function printUpdate() {
	console.log("=======");
	console.log("item type: " + itemType);
	console.log("active color: " + activeColor);
}

// ////////////////////
// S I D E B A R
// //////////////////////////////////////////

function populateTypes() {
	for (var i = 0; i < types.length; i++) {
		$(".type-input").append("<div class='radio' data-type='"+types[i]+"'><div class='checkbox'></div><p class='v-small'>"+types[i]+"</p></div>");
	}
	updateRadio($(".radio[data-type='"+types[0]+"']"))
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

function updateLevel(text) {
	$("input[name=level]").val(text);
}

function updateRadio(e) {
	$(".radio").removeClass("active");
	e.addClass("active");
	itemType = e.data("type");

	printUpdate();
}

function updateRadioByText(text) {
	$(".radio").removeClass("active");
	$(".radio[data-type='"+text+"']").addClass("active");
	iitemType = text;

	printUpdate();
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

	printUpdate();
}

function updateEraser() {
	$(".color").removeClass("active");
	$(".color").each(function() {
		deactivateColor($(this));
	});
	activeColor = screenColor;
	$(".eraser").addClass("active");

	printUpdate();
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
	var values = text.split(",");
	var index = 0;
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			$(".cell[data-x='"+j+"'][data-y='"+i+"']").css("background-color", values[index]);
			$(".cell[data-x='"+j+"'][data-y='"+i+"']").data("color", values[index]);
			$(".screen-cell[data-x="+j+"][data-y="+i+"]").css("background-color", values[index]);
			$(".box-cell[data-x="+j+"][data-y="+i+"]").css("background-color", values[index]);
			object[i][j] = values[index];
			index++;
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
	$.ajax({
		url:"php/write-object.php",
		type:"POST",
		data:{
			"object":object,
			"type":itemType,
			"level":$("input[name=level]").val(),
			"name":$("input[name=name]").val()
		},
		success:function(data) {
			console.log("sucessfully sent object to file :D");
			location.reload();
		}
	});
}

// ////////////////////
// L O A D
// //////////////////////////////////////////
function loadObject() {
	var filename = "php/" + $('.loader').val().split('\\').pop();
	var lines = getFile(filename).split("\n");
	for (var i = 0; i < lines.length; i++) {
		if (lines[i] == "name:") {
			updateName(lines[++i]);
		} else if (lines[i] == "type:") {
			updateRadioByText(lines[++i]);
		} else if (lines[i] == "object:") {
			updateCreator(lines[++i]);
		} else if (lines[i] == "level:") {
			updateLevel(lines[++i]);
		}
	}
}

function getFile(path) {
	newfile = "";
	$.ajax({
    	async: false,
     	type: 'GET',
     	dataType: "text",
     	url: path,
     	success: function(data) {
       		newFile = data;
       		console.log("successfully got object from file :D");
     	}
	});
	return newFile;
}