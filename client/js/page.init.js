'use strict';

var io           = require('./lib/io'),
	//sjcl         = require('./lib/sjcl'),
	config       = require('./config'),
	apiKey       = localStorage.getItem('config.auth.key');


if ( apiKey ) {

	// test call
	io.ajax(config.urls.api + 'sessions', {
		headers: {key: apiKey},
		onload: function(response){
			response = JSON.parse(response);
			console.log('all sessions', response);
		}
	});


	// test call
	io.ajax(config.urls.api + 'sessions/' + apiKey, {
		headers: {key: apiKey},
		onload: function(response){
			response = JSON.parse(response);
			console.log('current session', response);
		}
	});

}