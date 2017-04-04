// ////////////////////
// I N I T
// ///////////////////////////////////////
var gameInfoTrans = 30;

$(window).on("load", function() {
	

	$(".create-game-button").click(function() {
		if (!$(".game-info-c").hasClass("active")) {
			showGameInfo();
		}
	});

	showActivePlayers();
});

function showGameInfo() {
	$(".game-info-c").addClass("active");
	$(this).addClass("active");

	setTimeout(function() {$(".game-host").addClass("active");}, gameInfoTrans);
	setTimeout(function() {$(".p1").addClass("active");}, gameInfoTrans * 2);
	setTimeout(function() {$(".p2").addClass("active");}, gameInfoTrans * 3);
	setTimeout(function() {$(".p3").addClass("active");}, gameInfoTrans * 4);
	setTimeout(function() {$(".p4").addClass("active");}, gameInfoTrans * 5);
	setTimeout(function() {$(".start-game-button").addClass("active");}, gameInfoTrans * 6);
}

function showActivePlayers() {
	var i = 0;
	$(".player").each(function() {
		var $el = $(this);
		setTimeout(function() {
			$el.addClass("active");
		}, (gameInfoTrans * i++));
	});
}