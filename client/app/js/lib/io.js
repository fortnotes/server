/**
 * IO helpers.
 *
 * @namespace
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// declarations
var io = {},
	defaults = {
		method    : 'GET',  // HTTP method to use, such as "GET", "POST", "PUT", "DELETE", etc.
		async     : true,   // whether or not to perform the operation asynchronously
		headers   : {},     // list of HTTP request headers
		type      : 'text', // "", "arraybuffer", "blob", "document", "json", "text"
		data      : null,   // data to send (plain object)
		timeout   : 30000,  // amount of milliseconds a request can take before being terminated
		onload    : null,   // callback when the request has successfully completed
		onerror   : null,   // callback when the request has failed
		ontimeout : null    // callback when the author specified timeout has passed before the request could complete
	},
	defaultsKeys = Object.keys(defaults);


/**
 * Main method to send ajax requests
 * @param {String} url
 * @param {Object} options Plain object with call parameters
 * @return {XMLHttpRequest|Boolean} false in case wrong params
 * @example
 *		TODO: add
 */
io.ajax = function ( url, options ) {
	var index, headersKeys;
	// init
	options = options || {};
	// valid non-empty string
	if ( url && (typeof url === 'string' || url instanceof String) && url.length > 0 ) {
		// plain object is given as param
		if ( options && typeof options === 'object') {
			// extend with default options
			for ( index = 0 ; index < defaultsKeys.length ; index++ ) {
				// in case not redefined
				if ( options[defaultsKeys[index]] === undefined ) {
					options[defaultsKeys[index]] = defaults[defaultsKeys[index]];
				}
			}
		}

		var client = new XMLHttpRequest();
		// init a request
		client.open(options.method, url, options.async);

		// apply the given headers
		if ( options.headers && typeof options.headers === 'object') {
			headersKeys = Object.keys(options.headers);
			for ( index = 0; index < headersKeys.length; index++ ) {
				client.setRequestHeader(headersKeys[index], options.headers[headersKeys[index]]);
			}
		}

		// set response type and timeout
		client.responseType = options.type;
		client.timeout      = options.timeout;

		// callbacks
		if ( options.onload && typeof options.onload === 'function' ) {
			client.onload = function(){
				options.onload.call(this, this.response, this.status);
			};
		}
		client.onerror   = options.onerror;
		client.ontimeout = options.ontimeout;

		// actual request
		//client.send(this.encode(options.data));
		client.send(options.data ? JSON.stringify(options.data) : null);

		return client;
	}
	return false;
};


/**
 * Serializes the given data for sending to the server via ajax call
 * @param {Object} data Plain object to serialize
 * @return {String} null if no data to encode
 * @example
 *		TODO: add
 */
io.encode = function ( data ) {
	var result = [], index = 0, keys;
	// input plain object validation
	if ( data && typeof data === 'object') {
		keys = Object.keys(data);
		// apply encoding
		for ( ; index < keys.length; index++ ) {
			result.push(encodeURIComponent(keys[index]) + '=' + encodeURIComponent(data[keys[index]]));
		}
		// build the list of params
		if ( result.length > 0 ) {
			return result.join('&');
		}
	}
	return null;
};


// public export
module.exports = io;
