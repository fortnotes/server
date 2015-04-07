/**
 * Object Relational Mapping.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var orm = require('orm'),
	db;


// global options
orm.settings.set('connection.debug', global.config.debug);
orm.settings.set('instance.cache',   false);

// init
db = orm.connect(global.config.database);

db.on('connect', function ( error ) {
	function loadResult ( error ) {
		if ( error ) { throw error; }
	}

	if ( error ) { throw error; }

	db.use(require('orm-transaction'));

	// models
	db.load('./models/keys',       loadResult);
	db.load('./models/notes',      loadResult);
	db.load('./models/notes.data', loadResult);
	db.load('./models/users',      loadResult);
	db.load('./models/sessions',   loadResult);

	//db.models.sessions.hasOne('user', db.models.users, {index: true});

	db.sync(function ( error ) {
		if ( error ) { throw error; }
	});
});


// handle Ctrl+C in terminal
process.on('SIGINT', function () {
	console.log('close database connection');
	db.close();
	process.exit();
});


// public
module.exports = db;
