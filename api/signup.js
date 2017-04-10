//DB Connection
var config = require('../config/defaults');
var r = require('rethinkdbdash')(config.db);

//Setup Bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;


	
var signUp = function(username, email, pwd, callbackFunction){
	var salt = bcrypt.genSaltSync(saltRounds);
	var hashed = bcrypt.hashSync(pwd, salt);
	r.table('Users').insert({
		id: username,
		email: email,
		password: hashed
	}).run(function(err, result){
		if(err) console.log(err);
		callbackFunction();
		return;
	});

}
module.exports = signUp;