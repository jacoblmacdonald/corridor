//////////////////////
// R O U T E S
/////////////////////////////////////////

//Import express module and init express router
var express = require("express");
var router = express.Router();

//DB Connection
var config = require('./config/defaults');
var r = require('rethinkdbdash')(config.db);

function validateEmail(mail){  
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){  
        return (true)  
    }    
        return (false)  
}  

function getUserByEmailAddress(emailAddress) {
  return r.table('Users')
    .getAll(emailAddress, {index: 'email'}).run();
}

function getUserByUsername(username) {
  return r.table('Users')
    .getAll(username, {index: 'username'}).run();
}

//Posts
router.post('/register', function(req, res){
    const username = req.body.username;
    const pwd = req.body.password;
    const email = req.body.email;

    if(!validateEmail(email)) {
        return res.send('Not a valid email address'); 
    }
    //Check if email exists
    getUserByEmailAddress(email).then(function(user) {
    if(user[0]) {
      return res.send("Email Address Is In Use");
    } else {
        getUserByUsername(username).then(function(user) {
            if(user[0]){
                return res.send("Username is Taken");
            }
            else{
                var signUp = require("./api/signup");
                signUp(username, email, pwd);
            }
        })
    }});

});

//Gets
router.get('/', function(req, res){
    res.sendFile(__dirname + '/ui/login.html');
});
router.get("/matchmaking", function(req,res){
    res.sendFile(__dirname + '/ui/matchmaking.html');
});
router.get("/signup", function(req,res){
    res.sendFile(__dirname + '/ui/signup.html');
});
router.get("/corridor", function(req,res){
    res.sendFile(__dirname + '/ui/corridor.html');
});
router.get("/item-creator", function(req,res){
    res.sendFile(__dirname + '/ui/item-creator.html');
});
router.get("/monster-creator", function(req,res){
    res.sendFile(__dirname + '/ui/game.html');
});
router.get("/game", function(req,res){
    res.sendFile(__dirname + '/ui/login.html');
});
router.get( '/*' , function(req, res) {
    //This is the current file they have requested
    var file = req.params[0];
    res.sendFile( __dirname + '/' + file );

});

module.exports = router;