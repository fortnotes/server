/**
 * Central Web Server
 * main entry point
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// global modules and config
var http         = require('http'),
	url          = require('url'),
	staticModule = require('node-static'),
	staticServer = new staticModule.Server({cache:0}),
	//browserify   = require('browserify')(),
	config       = require('./config/loader.js'),
	api          = {
		v1 : require('./api.v1.js')
	};

http.createServer(function (request, response) {
	// prepare request query
	var urlParts  = url.parse(request.url, true),           // all url params
		pathParts = urlParts.pathname.slice(1).split('/'),  // ["api", "v1", "notes"]
		pathRoot  = pathParts.shift(),                      // "api" or "client"
		method    = request.method.toLowerCase(),
		postData  = '',
		apiVersion, apiContext, apiMethod, apiResponse = function(result){
			response.end(JSON.stringify(result));
		};
	//console.log(request);

	/* jshint indent:false */
	switch ( pathRoot ) {
		// REST interface
		case 'api':
			apiVersion = pathParts.shift();
			// start building the response
			response.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
			// check API version
			if ( api[apiVersion] ) {
				apiContext = pathParts.shift();
				// check API context
				if ( api[apiVersion][apiContext] ) {
					apiMethod = api[apiVersion][apiContext][method];
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
			} else {
				// wrong API version
				apiResponse({code:2});
			}
			break;

		// serve static files
		case 'client':
			/*if ( config.debug ) {
				if ( request.url === '/client/app.js' ) {

				}
			}*/
			// send file content
			staticServer.serve(request, response, function ( error ) {
				if ( error && error.status === 404 ) {
					// If the file wasn't found
					response.writeHead(302, {'Location': '/client/index.html'});
					response.end();
				}
			});
			break;

		// fail
		default:
			// need to do some reading
			response.writeHead(302, {'Location':'http://github.com/darkpark/fortnotes.git'});
			response.end();
	}
	console.log('%s\t%s', request.method, request.url);

}).listen(config.server.port).on('listening', function() {
	console.log('FortNotes server is running at http://localhost:%s/', config.server.port);
});