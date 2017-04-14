const r = require('./api/rethinkdb');

//////////////////////
// R O U T E S
/////////////////////////////////////////

module.exports = function(app, passport){
    app.post('/register', passport.authenticate('local-signup',{
        failureRedirect: '/signup'}), function(req, res){
            return res.send("success");
        });

    app.post('/login', passport.authenticate('local-login',{
        failureRedirect: '/'}), function(req, res){
            return res.send("success");
        });
  
    app.post("/item-upload", function(req, res) {
    const id = req.body.id;
    const type = req.body.type;
    const range = req.body.range;
    const use_by_class = req.body.use_by_class;
    const description = req.body.description;
    const sprite = req.body.sprite;
    const creator_id = req.user.id;
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

    app.post("/monster-upload", function(req, res) {
        const id = req.body.id;
        const range = req.body.range;
        const description = req.body.description;
        const num_treasures = req.body.num_treasures;
        const buff_class = req.body.buff_class;
        const buff_lvl = req.body.buff_lvl;
        const sprite = req.body.sprite;
        const creator_id = req.user.id;
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

    app.get("/items-list", function(req, res) {
        const creator_id = req.user.id;
        r.db('Corridor').table('Items').filter({'creator_id':creator_id}).orderBy(r.desc("id")).pluck("id").run(function(err, cursor) {
            return res.send(JSON.stringify(cursor, null, 2));
        });
    });

    app.get("/monster-list", function(req, res) {
        const creator_id = req.user.id;
        r.db('Corridor').table('Monsters').filter({'creator_id':creator_id}).orderBy(r.desc("id")).pluck("id").run(function(err, cursor) {
            return res.send(JSON.stringify(cursor, null, 2));
        });
    });

    app.post("/grab-item", function(req, res) {
        const id = req.body.id;
        const creator_id = req.user.id;
        r.db('Corridor').table('Items').filter({
            'creator_id' : creator_id,
            'id' : id
        }).run(function(err, cursor){
            return res.send(JSON.stringify(cursor, null, 2));
        });
    });

    app.post("/grab-monster", function(req, res) {
        const id = req.body.id;
        const creator_id = req.user.id;
        r.db('Corridor').table('Monsters').filter({
            'creator_id' : creator_id,
            'id' : id
        }).run(function(err, cursor){
            return res.send(JSON.stringify(cursor, null, 2));
        });
    });


    //Gets
    app.get('/', function(req, res){
        if(req.isAuthenticated()) return res.sendFile(__dirname + '/ui/matchmaking.html');
        return res.sendFile(__dirname + '/ui/login.html');
    });
    app.get("/matchmaking", isLoggedIn, function(req,res){
        return res.sendFile(__dirname + '/ui/matchmaking.html');
    });
    app.get("/signup", function(req,res){
        return res.sendFile(__dirname + '/ui/signup.html');
    });
    app.get("/corridor", isLoggedIn, function(req,res){
        return res.sendFile(__dirname + '/ui/corridor.html');
    });
    app.get("/item-creator", isLoggedIn, function(req,res){
        res.sendFile(__dirname + '/ui/item-creator.html');
    });
    app.get("/monster-creator", isLoggedIn, function(req,res){
        res.sendFile(__dirname + '/ui/monster-creator.html');
    });
    app.get("/game", isLoggedIn, function(req,res){
        res.sendFile(__dirname + '/game.html');
    });
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
    app.get('/getThisUser', isLoggedIn, function(req, res) {
        const user = req.user.id;
        return res.send(user);
    });
    app.get( '/*' , function(req, res) {
        //This is the current file they have requested
        var file = req.params[0];
        res.sendFile( __dirname + '/' + file );

    });

    function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
    }
};
