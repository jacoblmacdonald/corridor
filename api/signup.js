var r = require('rethinkdb');
var config = require('../config/defaults');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var connection - r.connect(config.db);

var signUp = function(message){
	const pwd = message.password;
	bcrypt.hash(pwd, saltRounds, function(err, hash) {
  		console.log(hash);
	});
}



module.exports = signUp;