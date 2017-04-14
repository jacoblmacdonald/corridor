var boxWidth = 80 - 4;
var numCells = 30;
var boxCellSize = boxWidth / numCells;

var found_items = [];

$(window).on("load", function() {
	$(".box").click(function() {
		if ($(this).hasClass("active")) {
			$(".box").removeClass("active");
		} else {
			$(".box").removeClass("active");
			$(this).addClass("active");
		}
	});

	initBoxes(); 

	//for testing
	//populateLoad();
});

// ////////////////////
// L O A D (TESTING)
// //////////////////////////////////////////

function populateLoad() {
	$.ajax({
		type: 'GET',
		//data: JSON.stringify(userData),
		contentType: 'application/json',
		url: '/items-list',
		success: function(data){
			//console.log(data);
			var items = JSON.parse(data);
			//console.log(items[0].id);

			grabItem(0, items);
		}
	});
}

function grabItem(index, items) {
	//console.log(index);
	if (index < items.length) {
		var itemData = {
			id:items[index].id
		}
		$.ajax({
			type: 'POST',
			data: JSON.stringify(itemData),
			contentType: 'application/json',
			url: '/grab-item',
			success: function(data){
				//console.log(data);
				found_items.push(JSON.parse(data)[0]);
				grabItem(++index, items);
			}
		});
	} else {
		loadBag();
	}
}

function loadBag() {
	/*
	console.log("loading item");
	console.log(item.id);
	console.log(item.range);
	console.log(item.type);
	console.log(item.use_by_class);
	console.log(item.description);
	console.log(item.sprite);
	*/
	/*
	var index = 0;
	$(".bag-box").each(function() {
		console.log(index);
		updateBox($(this), found_items[index].sprite);
		index++;
	});
	*/
	for (var i = 0; i < found_items.length; i++) {
		updateBox($(".bag-box.bag-"+i), found_items[i]);
	}
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

function updateBox(b, object) {
	var sprite = object.sprite;
	//console.log(sprite)
	for (var i = 0; i < numCells; i++) {
		for (var j = 0; j < numCells; j++) {
			if (i < sprite.length) {
				$(".box-cell[data-x="+j+"][data-y="+i+"]", b).css("background-color", sprite[i][j]);
			}
		}
	}
}