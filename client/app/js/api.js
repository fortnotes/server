/**
 * Application API wrapper.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var io     = require('./lib/io'),
	config = require('./config');


function api ( method, url, data, callback ) {
	io.ajax(config.apiUrl + url, {
		method : method,
		data   : data,
		headers: config.apiKey ? {key: config.apiKey} : {},
		onload : function ( response, status ) {
			var data  = null,
				error = null;
			if ( response && status === 200 ) {
				// seems valid
				try {
					data = JSON.parse(response);
				} catch ( e ) { error = e; }
			} else {
				console.log('!!!!');
				error = new Error('empty response or invalid status');
			}
			callback(error, data);
		},
		onerror: function ( e ) {
			callback(e, null);
		},
		ontimeout: function () {
			callback(new Error('request timed out'), null);
		}
	});
}

// public export
module.exports.get = function ( url, callback ) {
	return api('get', url, null, callback);
};

module.exports.head = function ( url, callback ) {
	return api('head', url, null, callback);
};

module.exports.post = function ( url, data, callback ) {
	return api('post', url, data, callback);
};

module.exports.put = function ( url, callback ) {
	return api('put', url, null, callback);
};

module.exports.delete = function ( url, callback ) {
	return api('delete', url, null, callback);
};
