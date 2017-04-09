//DB Connection
var config = require('../config/defaults');
var r = require('rethinkdbdash')(config.db);

//Setup Bcrypt
const uuidV1 = require('uuid/v1');
var bcrypt = require('bcrypt');
const saltRounds = 10;
	
var signUp = function(username, email, pwd){
	var salt = bcrypt.genSaltSync(saltRounds);
	var hashed = bcrypt.hashSync(pwd, salt);

	r.table('Users').insert({
		username: username,
		email: email,
		password: hashed
	}).run(function(err, result){
		if(err) console.log(err);
		console.log(result);
	});
	
}
module.exports = signUp;