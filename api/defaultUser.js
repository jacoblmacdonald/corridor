const config = require('../config/defaults');
const r = require('rethinkdbdash')(config.db);


r.table('Users').isEmpty().run(function(err,cursor){
	if(err) throw err;
});