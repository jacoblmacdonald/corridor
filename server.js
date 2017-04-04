//Server Consts
var SERVER_PORT = 3000;
var LOG_CONNECTIONS_CONSOLE = true;

//Modules
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var db = require('./api/connection');


//get functions
function getHomePage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/login.html');
    //if logged in, switch to matchmaking page
}

function getSignupPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/signup.html');
}

function getMatchmakingPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/matchmaking.html');
}

function getCorridorPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/corridor.html');
}

function getCreatorPage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/ui/creator.html');
}

app.get('/', getHomePage);
app.get("/matchmaking", getMatchmakingPage);
app.get("/signup", getSignupPage);
app.get("/corridor", getCorridorPage);
app.get("/creator", getCreatorPage);

app.get( '/*' , function( req, res, next ) {
    //This is the current file they have requested
    var file = req.params[0];
    //For debugging, we can track what files are requested.
    if(LOG_CONNECTIONS_CONSOLE) console.log('\t :: Express :: file requested : ' + file);
    //Send the requesting client the file.
    res.sendFile( __dirname + '/' + file );

});

//socket.io code

io.on('connection', function(client){

    client.emit('connected', {message: 'HEY YOU CONNECTED!'});

});



http.listen(process.env.PORT|| SERVER_PORT, function(){
    console.log('Listening on port ' + SERVER_PORT);
});


