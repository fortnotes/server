/**
 * Central Web Server.
 * Main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var util   = require('util'),
	querystring = require('querystring'),
	cookie = require('cookie'),
	rest   = require('./rest').init({
		port: 8080
	});


// curl -v http://localhost:8080/sessions
rest.on('get:sessions', function ( event ) {

});


// curl -v --data "email=test@gmail.com" http://localhost:8080/sessions
rest.on('post:sessions', function ( event ) {
	var email = querystring.parse(event.data).email;

	//console.log(event.response);
	event.response.setHeader('Set-Cookie', ['token=qwe; expires=Fri, 31 Dec 2016 23:59:59 GMT']);

	//return {method: event.method, path: event.path, data: querystring.parse(event.data)};
	return email;
});


rest.on('get:users', function ( event ) {
	var cookieData = event.request.headers.cookie;
	//console.log(util.inspect(event, {depth: 1, colors: true}));
	//console.log(event.request.headers.cookie);

	//event.response.end('get:users');
	return {method: event.method, path: event.path, cookie: cookieData ? cookie.parse(cookieData) : {}};
});

rest.on('post:users', function ( event ) {
	//console.log(util.inspect(event, {depth: 1, colors: true}));
	//event.response.end('post:users');
	return {method: event.method, path: event.path, data: event.data};
});

// global modules and config
//var http   = require('http'),
//	url    = require('url'),
//	//files  = new (require('node-static')).Server(),
//	config = require('./config/main'),
//	//api    = require('./api/main');
//	api    = require('./api.v1');
//	/*api    = {
//		v1 : require('./api.v1')
//		//v1 : require('../api/v1/main')
//	};*/
//
//http.createServer(function (request, response) {
//	// prepare
//	var urlParts  = url.parse(request.url, true),           // all url params
//		pathParts = urlParts.pathname.slice(1).split('/'),  // ["api", "v1", "notes"]
//		//pathRoot  = pathParts.shift(),                      // "api" or "client"
//		method    = request.method.toLowerCase(),
//		postData  = '',
//		apiResponse = function(result){
//			response.end(JSON.stringify(result));
//		},
//		apiVersion, apiContext, apiMethod;
//
//	//apiVersion = pathParts.shift();
//
//	// start building the response
//	response.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
//
//	apiContext = pathParts.shift();
//
//	//console.log(apiContext);
//	//console.log(method);
//	//console.log(api[apiContext][method]);
//	//console.log(api[apiContext]);
//
//	// check API context
//	if ( api[apiContext] ) {
//		apiMethod = api[apiContext][method];
//		// check API method
//		if ( typeof apiMethod === 'function' ) {
//			// split by request method
//			if ( method === 'post' ) {
//				// reset
//				postData = '';
//				// join all chunks
//				request.on('data', function(data){ postData += data; });
//				// all data is collected
//				request.on('end', function(){
//					// CRUD call with all left params + post data
//					apiMethod(pathParts, urlParts.query, JSON.parse(postData), request, apiResponse);
//				});
//			} else {
//				// CRUD call with all left params
//				apiMethod(pathParts, urlParts.query, request, apiResponse);
//			}
//		} else {
//			// wrong API method
//			apiResponse({code:4});
//		}
//	} else {
//		// wrong API context
//		apiResponse({code:3});
//	}
//
//	console.log('%s\t%s', request.method, request.url);
//
//	// connection abort handling
//	response.on('close', function () {
//		//TODO: clear resources
//	});
//}).listen(config.server.port).on('listening', function() {
//	console.log('FortNotes server is running at http://localhost:%s/', config.server.port);
//});
