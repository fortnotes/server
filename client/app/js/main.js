/**
 * Main application entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var aes    = require('./aes'),
	api    = require('./api'),
	config = require('./config'),
	pages  = require('./pages'),
	Notes  = require('./collection.notes.js');


// authenticated?
if ( config.apiKey ) {
	// it appears the user is logged in but validation is required
	api.put('sessions/' + config.apiKey, function(err, response){
		var pass;
		// session is valid
		if ( response.code === 1 ) {
			console.log('%c%s %o', 'color:green', 'session is valid, last access time:', new Date(response.atime));
			pages.list.show();

			// apply saved pass salt and hash
			aes.salt = localStorage.getItem('config.pass.salt');
			aes.hash = localStorage.getItem('config.pass.hash');

			// ask a user pass and check it
			pass = window.prompt('Provide your password to unlock data', '');
			if ( pass && aes.checkPass(pass) ) {
				aes.setPass(pass);
				console.log('%c%s', 'color:blue', 'pass is valid');

				// collect all sessions info
				api.get('sessions', function ( err, response ) {
					if ( response.code === 1 ) {
						response.data.forEach(function ( session ) {
							console.log('session', new Date(session.atime), session._id, JSON.parse(aes.decrypt(session.data)));
						});
					}
				});

				var notes = new Notes();
				notes.addListener('fetch', function(status){
					console.log('notes fetch', status);
				});
				notes.fetch();
				console.log(notes);
			} else {
				console.log('%c%s', 'color:red', 'pass is invalid');
				return;
			}
		} else {
			// authentication has expired
			pages.auth.show();
			console.log('%c%s', 'color:red', 'session is invalid, need to login');
			localStorage.clear();
			return;
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

localStorage.setItem('debug', 1);

//app.init();

// test data
//aes.salt = '0fb449e1ae2dc62c11f64a415e66610fa7945ce62033866788db5cc0e2ffb0da';
//aes.setPass('qwerty');

