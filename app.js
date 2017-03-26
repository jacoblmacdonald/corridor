const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
   res.send('corridor - Node + Express Setup');
});

app.listen(port, (err) => {
   if(err){
   	return console.log("Alright you got shafted by ", err);
   }
   console.log("corridor is up and running at http://localhost:%s", port);
});