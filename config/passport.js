var LocalStrategy   = require('passport-local').Strategy;

var config = require('./defaults');
var r = require('rethinkdbdash')(config.db);
const bcrypt = require('bcrypt');

var get = require('../api/getters');
const uuidV1 = require('uuid/v1');

function validateEmail(mail){  
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){  
        return (true)  
    }    
        return (false)  
}  


module.exports = function(passport){
	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
    	console.log("Serialize");
    	console.log(user.id);
  		done(null, user.id);
	});

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
    	console.log("Deserialize");
       	get.byUsername(username).then(function(user) {
            if(user){
                return done(null, user);
        	}
        });
    });


    passport.use('local-signup', new LocalStrategy({
    	passReqToCallback : true
    },
    	function(req, username, password, done){
        const email = req.body.email;
        if(!validateEmail(email)) {
            return done(null, false); 
        }
        //Check if email exists
        get.byEmailAddress(email).then(function(user) {
        if(user[0]) {
        	console.log("EMAIL EXISTS");
          return done(null, false);
        } else {
            get.byUsername(username).then(function(user) {
                if(user){
                	console.log("USERNAME EXISTS");
                    return done(null, false);
                }
                else{
                    var signUp = require("../api/signup");
                    signUp(username, email, password, function(){
                    	r.table('Users').get(username).run(function(err, user){
       						return done(null, user);
       					});
                    });
                    }
                })
            }
        })}
        
    ));

    passport.use('local-login', new LocalStrategy({
    	passReqToCallback: true
    },
    	function(req,username, password, done){
    		get.byUsername(username).then(function(user){
    			if(!user){
    				console.log("USERNAME EXISTS");
    				return done(null, false);
    			}
    			const match = bcrypt.compareSync(password, user.password);
    			if(!match){
    				console.log("PASSWORDS DON'T MATCH");
    				return done(null,false);
    			}
    			return done(null, user);
    		});
    	}));

};