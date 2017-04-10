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

router.post("/item-upload", function(req, res) {
    const id = req.body.id;
    const type = req.body.type;
    const range = req.body.range;
    const use_by_class = req.body.use_by_class;
    const description = req.body.description;
    const sprite = req.body.sprite;
    const creator_id = req.body.creator_id;
    const published = req.body.published;

    r.db('Corridor').table('Items').filter({
        'id' : id,
        'creator_id' : creator_id
    }).run().then(function(item){
        if(item[0]){
            r.db('Corridor').table('Items').get(id).replace({
                'id' : id,
                'type' :type,
                'range' :range,
                'use_by_class' :use_by_class,
                'description' :description,
                'sprite' :sprite,
                'creator_id' :creator_id,
                'published' : published
            }).run()
            return res.send("Item of the same name already exists");
        }
        else{
            r.db('Corridor').table('Items').insert({
                'id' : id,
                'type' :type,
                'range' :range,
                'use_by_class' :use_by_class,
                'description' :description,
                'sprite' :sprite,
                'creator_id' :creator_id,
                'published' : published
            }).run()
            return res.send("Item Successfully uploaded");
        }
    })
});

router.post("/monster-upload", function(req, res) {
    const id = req.body.id;
    const range = req.body.range;
    const description = req.body.description;
    const num_treasures = req.body.num_treasures;
    const buff_class = req.body.buff_class;
    const buff_lvl = req.body.buff_lvl;
    const sprite = req.body.sprite;
    const creator_id = req.body.creator_id;
    const published = req.body.published;

    r.db('Corridor').table('Monsters').filter({
        'id' : id,
        'creator_id' : creator_id
    }).run().then(function(item){
        if(item[0]){
            r.db('Corridor').table('Monsters').get(id).replace({
                'id' : id,
                'range' :range,
                'description' :description,
                'num_treasures' : num_treasures,
                'buff_class' : buff_class,
                'buff_lvl' : buff_lvl,
                'sprite' :sprite,
                'creator_id' :creator_id,
                'published' : published
            }).run()
            return res.send("Monster of the same name already exists");
        }
        else{
        r.db('Corridor').table('Monsters').insert({
            'id' : id,
            'range' :range,
            'description' :description,
            'num_treasures' : num_treasures,
            'buff_class' : buff_class,
            'buff_lvl' : buff_lvl,
            'sprite' :sprite,
            'creator_id' :creator_id,
            'published' : published
        }).run()
        return res.send("Monster Successfully uploaded");
        }
    })
});

router.post("/items-list", function(req, res) {
    r.db('Corridor').table('Items').filter({'creator_id':'raf'}).orderBy(r.desc("id")).pluck("id").run(function(err, cursor) {
        return res.send(JSON.stringify(cursor, null, 2));
        //cursor.toArray(function(err, result) {
            //return res.send(result);
        //});
    });
});

router.post("/grab-item", function(req, res) {
    const id = req.body.id;
    const creator_id = req.body.creator_id;
    r.db('Corridor').table('Items').filter({
        'creator_id' : creator_id,
        'id' : id
    }).run(function(err, cursor){
        return res.send(JSON.stringify(cursor, null, 2));
    });
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
    res.sendFile(__dirname + '/ui/monster-creator.html');
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