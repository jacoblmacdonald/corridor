const config = require('../config/defaults');
const r = require('rethinkdbdash')(config.db);
const passport = require('passport')  
const LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(  
  function(username, password, done) {
  	r.table('Users')
  	.filter({username: username})
  	.run(function(err, cursor){
  		if(err) return done(null, false);
  		else if()
  	})
  }
));