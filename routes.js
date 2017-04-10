//////////////////////
// R O U T E S
/////////////////////////////////////////

module.exports = function(app, passport){
    app.post('/register', passport.authenticate('local-signup',{
        failureRedirect: '/signup'}), function(req, res){
            return res.redirect('/matchmaking');
        });

    app.post('/login', passport.authenticate('local-login',{
        failureRedirect: '/'}), function(req, res){
            console.log("SUCCESS!");
            return res.redirect('/matchmaking');
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

}