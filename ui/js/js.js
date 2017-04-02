var files = []

class object {
	constructor(name, type, level, object) {
		this.name = name;
		this.type = type;
		this.level = level;
		this.object = object;
	}
}

var objects = [];
var colors = [
"#FF0000", "#FF9900", "#FFCC00", "#FFFF00", "#B2FF00", "#66FF00", "#33FF70", "#00FFE1", "#0088F0", "#0011FF", "#7534ff", "#fff"];
var colorDelay = 0.1;
var colorTrans = 2;
var waitTime = 50;

$(window).on("load", function() {
	beginTitleAnimation();
});

function loadObjects() {

}

function beginTitleAnimation() {
	for(var i = 0; i < colors.length; i++) {
		$(".title-c").append("<p class='v-ultra' style='color:"+colors[i]+";transition:top "+colorTrans+"s "+colorDelay*i+"s ease-in-out;'>corridor</p>");
	}
	setTimeout(function() {
		$(".title-c p").addClass("active");
	}, waitTime);
	
}