var LocalStrategy   = require('passport-local').Strategy;

const r = require('../api/rethinkdb');
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
  		done(null, user.id);
	});

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
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
        const thisUser = username.toLowerCase();
        const mail = email.toLowerCase();
        if(!validateEmail(mail)) {
            return done(null, false, {message: "Email Already Registered."}); 
        }
        //Check if email exists
        get.byEmailAddress(mail).then(function(user) {
        if(user[0]) {
          return done(null, false);
        } else {
            get.byUsername(thisUser).then(function(user) {
                if(user){
                	console.log("USERNAME EXISTS");
                    return done(null, false, {message: "Sorry, That Username Is Taken"});
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
            const thisUser = username.toLowerCase();
    		get.byUsername(thisUser).then(function(user){
    			if(!user){
    				return done(null, false, {message: "Sorry, Username Doesn't Exist"});
    			}
    			const match = bcrypt.compareSync(password, user.password);
    			if(!match){
    				console.log("PASSWORDS DON'T MATCH");
    				return done(null,false, {message: "Incorrect Password"});
    			}
    			return done(null, user);
    		});
    	}));

};