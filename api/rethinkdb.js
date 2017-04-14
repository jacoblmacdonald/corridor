//////////////////////
// R E T H I N K D B 
/////////////////////////////////////////
const config = require('../config/defaults');
const r = require('rethinkdbdash')(config.db);

module.exports = r; 