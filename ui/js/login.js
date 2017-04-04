// ////////////////////
// I N I T
// ///////////////////////////////////////

var colors = [
"#FF0000", "#FF9900", "#FFCC00", "#FFFF00", "#B2FF00", "#66FF00", "#33FF70", "#00FFE1", "#0088F0", "#0011FF", "#7534ff", "#fff"];
var colorDelay = 0.1;
var colorTrans = 2;
var waitTime = 50;

$(window).on("load", function() {
	beginTitleAnimation();

	$(".login-submit").click(function() {
		processLogin();
	});
});

// ////////////////////
// A N I M A T I O N
// ///////////////////////////////////////

function beginTitleAnimation() {
	for(var i = 0; i < colors.length; i++) {
		$(".title-c").append("<p class='v-ultra' style='color:"+colors[i]+";transition:top "+colorTrans+"s "+colorDelay*i+"s ease-in-out;'>corridor</p>");
	}
	setTimeout(function() {
		$(".title-c p").addClass("active");
	}, waitTime);
}

// ////////////////////
// L O G I N
// ///////////////////////////////////////

function processLogin() {
	var username = $(".input-username").val();
	var password = $(".input-password").val();
	console.log("attempting login with");
	console.log("username: "+username);
	console.log("password: "+password);
	console.log("\n");

	//Do checks for correct information (ie no blank fields)
	//Send to node, if success:
	window.location.href = "/matchmaking";
}