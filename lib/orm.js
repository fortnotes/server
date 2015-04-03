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
//db = orm.connect('sqlite://./db.sqlite');
//db = orm.connect('mysql://fortnotes:fortpass@localhost/fortnotes');
db = orm.connect(global.config.database);

db.on('connect', function ( error ) {
	function loadResult ( error ) {
		if ( error ) { throw error; }
	}

	if ( error ) { throw error; }

	db.use(require('orm-transaction'));

	// models
	db.load('../models/keys',     loadResult);
	db.load('../models/notes',    loadResult);
	db.load('../models/users',    loadResult);
	db.load('../models/sessions', loadResult);

	//db.models.sessions.hasOne('user', db.models.users, {index: true});

	db.sync(function ( error ) {
		if ( error ) { throw error; }

		/*db.models.sessions.request('qwe@rty.com', function ( error, session ) {
			console.log(error);
			console.log(session.id);
		});/**/

		/*db.models.sessions.confirm(1, '2x8ZKRuNjhIupAv4', function ( error, session ) {
			console.log(error);
			console.log(session.id);
		});/**/

		/*db.models.sessions.check('Rf+PvDzP2nyHS1m0GgLh7u5R3jYe34X7nJE5ClhEe7L6mdC0aOvWtKYG2rHm8fzF8GsHIMmctFOVWyJuioTUUm0kyblxl5ct/R9Re9b+lB1+w5YstCfISDae6NA9mVDU', function ( error, session ) {
			console.log(error);
			console.log(session.id);
		});/**/
	});
});

// handle Ctrl+C in terminal
process.on('SIGINT', function () {
	console.log('close database connection');
	db.close();
	process.exit();
});

// public export
module.exports = db;
