var r =  require('rethinkdb');

//attempt to connect to database
var db = r.connect({
    host: '54.242.80.51',
    database: 'Corridor'}, function(err, conn){
        if(err) return console.log(err);
        else return console.log("Successfully connected to rethinkdb.");
    });

//export connection module
module.exports = db;