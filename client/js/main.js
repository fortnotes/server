/**
 * Main application entry point
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var aes    = require('./aes'),
	api    = require('./api'),
	config = require('./config'),
	pages  = require('./pages'),
	Notes  = require('./collection.notes');


// authenticated?
if ( config.apiKey ) {
	// it appears the user is logged in but validation is required
	api.put('sessions/' + config.apiKey, function(err, response){
		// session is valid
		if ( response.code === 1 ) {
			pages.list.show();
			console.log('%c%s %o', 'color:green', 'session is valid, last access time:', new Date(response.atime));
		} else {
			// authentication has expired
			pages.auth.show();
			console.log('%c%s', 'color:red', 'session is invalid, need to login');
			localStorage.clear();
		}
	});

	// collect all sessions info
	api.get('sessions', function ( err, response ) {
		if ( response.code === 1 ) {
			response.data.forEach(function ( session ) {
				console.log('session', new Date(session.atime), session._id, JSON.parse(aes.decrypt(session.data)));
			});
		}
	});

	/*
	api.get('sessions/' + config.apiKey, function(err, response){
	console.log('current session', response);
	console.log('current session data', JSON.parse(aes.decrypt(response.data.data)));
	});/**/
} else {
	pages.auth.show();
}


//app.init();

// test data
aes.salt = '0fb449e1ae2dc62c11f64a415e66610fa7945ce62033866788db5cc0e2ffb0da';
aes.setPass('qwerty');

var notes = new Notes();
notes.addListener('fetch', function(status){
	console.log('notes fetch', status);
});
notes.fetch();
console.log(notes);