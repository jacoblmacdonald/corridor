// ////////////////////
// I N I T
// ///////////////////////////////////////

//var socket = io();
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

	$(".login-error").html("");
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

function clearErrors() {
	$(".email-t .error").html("");
	$(".user-t .error").html("");
	$(".pass-t .error").html("");
	$(".pass2-t .error").html("");
	$(".login-error").html("");
}

function processLogin() {
	clearErrors();
	const username = $(".input-username").val();
	const password = $(".input-password").val();
	var c = true;

	if (username == "") {
		$(".user-t .error").html(" username cannot be blank");
		c = false;
	}

	if (password == "") {
		$(".pass-t .error").html(" password cannot be blank");
		c = false;
	}

	if (c) {
		//Create Object With Login Data
		var loginData = {
			username: username,
			password: password
		};

		//Do checks for correct information (ie no blank fields)
		//Send to node, if success:

		$.ajax({
			type: 'POST',
			data: JSON.stringify(loginData),
			contentType: 'application/json',
			url: '/login',
			success: function(data){
				//console.log('success');
				//console.log(data);
				if (data == "success") {
					window.location.href = "/";
				} else {
 					$(".login-error").html("incorrect information, please try again");
 				}
			}
		});



	}
	
}

// ////////////////////
// S I G N U P
// ///////////////////////////////////////



function processSignup() {
	clearErrors();
	const username = $(".signup-username").val();
	const email = $(".signup-email").val();
	const pass1 = $(".signup-password").val();
	const pass2 = $(".signup-password2").val();
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
		//Create Object With Login Data
		const signUpData = {
			email: email,
			username: username,
			password: pass1
		};

		$.ajax({
			type: 'POST',
			data: JSON.stringify(signUpData),
			contentType: 'application/json',
			url: '/register',
			success: function(data){
				if (data == "success") {
					window.location.href = "/";
				} else {
 					$(".login-error").html("username already taken :<");
 				}
			}
		});

	}
}