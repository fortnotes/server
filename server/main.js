/**
 * Central Web Server.
 * Main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// global modules and config
var http   = require('http'),
	url    = require('url'),
	//files  = new (require('node-static')).Server(),
	config = require('./config/main'),
	//api    = require('./api/main');
	api    = require('./api.v1');
	/*api    = {
		v1 : require('./api.v1')
		//v1 : require('../api/v1/main')
	};*/

http.createServer(function (request, response) {
	// prepare
	var urlParts  = url.parse(request.url, true),           // all url params
		pathParts = urlParts.pathname.slice(1).split('/'),  // ["api", "v1", "notes"]
		//pathRoot  = pathParts.shift(),                      // "api" or "client"
		method    = request.method.toLowerCase(),
		postData  = '',
		apiResponse = function(result){
			response.end(JSON.stringify(result));
		},
		apiVersion, apiContext, apiMethod;

	//apiVersion = pathParts.shift();

	// start building the response
	response.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});

	apiContext = pathParts.shift();

	//console.log(apiContext);
	//console.log(method);
	//console.log(api[apiContext][method]);
	//console.log(api[apiContext]);

	// check API context
	if ( api[apiContext] ) {
		apiMethod = api[apiContext][method];
		// check API method
		if ( typeof apiMethod === 'function' ) {
			// split by request method
			if ( method === 'post' ) {
				// reset
				postData = '';
				// join all chunks
				request.on('data', function(data){ postData += data; });
				// all data is collected
				request.on('end', function(){
					// CRUD call with all left params + post data
					apiMethod(pathParts, urlParts.query, JSON.parse(postData), request, apiResponse);
				});
			} else {
				// CRUD call with all left params
				apiMethod(pathParts, urlParts.query, request, apiResponse);
			}
		} else {
			// wrong API method
			apiResponse({code:4});
		}
	} else {
		// wrong API context
		apiResponse({code:3});
	}

	console.log('%s\t%s', request.method, request.url);

	// connection abort handling
	response.on('close', function () {
		//TODO: clear resources
	});
}).listen(config.server.port).on('listening', function() {
	console.log('FortNotes server is running at http://localhost:%s/', config.server.port);
});
