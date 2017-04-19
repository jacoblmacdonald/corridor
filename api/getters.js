var r = require('./rethinkdb');

function byEmailAddress(emailAddress) {
  return r.table('Users')
    .getAll(emailAddress, {index: 'email'}).run();
}

function byUsername(username) {
  return r.table('Users')
    .get(username).run();
}

module.exports ={
	byUsername,
	byEmailAddress
}
