'use strict';

var io           = require('./lib/io'),
	aes          = require('./aes'),
	config       = require('./config');


if ( config.apiKey ) {

	// test call
	io.ajax(config.apiUrl + 'sessions', {
		headers: {key: config.apiKey},
		onload: function(response){
			response = JSON.parse(response);
			console.log('all sessions', response);
		}
	});


	// test call
	io.ajax(config.apiUrl + 'sessions/' + config.apiKey, {
		headers: {key: config.apiKey},
		onload: function(response){
			response = JSON.parse(response);
			console.log('current session', response);
			console.log('current session data', JSON.parse(aes.decrypt(response.data.data)));
		}
	});

}