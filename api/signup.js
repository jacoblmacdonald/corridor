//DB Connection
var config = require('../config/defaults');
var r = require('rethinkdbdash')(config.db);

//Setup Bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;

var signUp = function(message){
	const pwd = message.password;
	bcrypt.hash(pwd, saltRounds, function(err, hash) {
  		console.log(hash);
	});
}


module.exports = signUp;