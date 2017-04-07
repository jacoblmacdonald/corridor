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

	$(".signup-submit").click(function() {
		processSignup();
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

// ////////////////////
// S I G N U P
// ///////////////////////////////////////

function clearErrors() {
	$(".email-t .error").html("");
	$(".user-t .error").html("");
	$(".pass-t .error").html("");
	$(".pass2-t .error").html("");
}

function processSignup() {
	clearErrors();
	var username = $(".signup-username").val();
	var email = $(".signup-email").val();
	var pass1 = $(".signup-password").val();
	var pass2 = $(".signup-password2").val();
	var c = true;
	if (username == "") {
		$(".user-t .error").html(" username cannot be blank");
		c = false;
	}

	if (email == "") {
		$(".email-t .error").html(" email cannot be blank");
		c = false;
	}

	if (pass1.length < 8) {
		$(".pass-t .error").html(" password must be at least 8 characters");
		c = false;
	}

	if (pass1 != pass2) {
		$(".pass2-t .error").html(" password does not match");
		c = false;
	}

	if (c == true) {
		console.log("attempting signup with");
		console.log("username: "+username);
		console.log("email: "+email);
		console.log("password: "+pass1);
		console.log("\n");

		//Do checks for correct information (ie no blank fields)
		//Send to node, if success:
		window.location.href = "/matchmaking";
	}
}