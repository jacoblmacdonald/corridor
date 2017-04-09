//////////////////////
// R O U T E S
/////////////////////////////////////////

//Import express module and init express router
var express = require("express");
var router = express.Router();

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