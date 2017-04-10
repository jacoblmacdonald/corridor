//Global functions

var log = function(...messages) {
	messages.forEach(function(message) {
		console.log(message);
	});
}

module.exports = {
	log : log
};