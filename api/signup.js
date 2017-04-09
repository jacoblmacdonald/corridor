//DB Connection
var config = require('../config/defaults');
var r = require('rethinkdbdash')(config.db);

//Setup Bcrypt
const uuidV1 = require('uuid/v1');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var createUser = function(username, email, pwd){
	var id = uuidV1();
	var salt = bcrypt.genSaltSync(saltRounds);
	var hashed = bcrypt.hashSync(pwd, salt);

	r.table('Users').insert({
		id: id,
		username: username,
		email: email,
		password: hashed
	}).run(function(err, result){
		if(err) console.log(err);
		console.log(result);
	});
}
var signUp = function(credentials){
	const username = credentials.username.toLowerCase();
	const email = credentials.email;
	const pwd = credentials.password;

	r.table('Users').filter({
		username: username
	}).run(function(err, result){
		if(result) return;
		else createUser(username, email, pwd);
	});
	
}
module.exports = signUp;