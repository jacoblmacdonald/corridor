const config = require('../config/defaults');
const r = require('rethinkdbdash')(config.db);
const passport = require('passport')  
const LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(  
  function(username, password, done) {

  }
));