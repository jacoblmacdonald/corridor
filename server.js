
var SERVER_PORT = 3000;
var LOG_CONNECTIONS_CONSOLE = true;

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);





function getHomePage(request,response){
    if(LOG_CONNECTIONS_CONSOLE){
        console.log('Serving::Person has connected and requested home page');
    }
    response.sendFile(__dirname + '/Templates/login.html');
}


app.get('/', getHomePage);

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
    console.log(http.address());
});


