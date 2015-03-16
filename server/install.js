/**
 * Central Web Server.
 * module to setup the environment before use.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// global modules and config
var mongoClient = require('mongodb').MongoClient,
	config      = require('./config/main');

//TODO: implement

// db connect
/*mongoClient.connect('mongodb://' + config.database.host + ':' + config.database.port + '/' + config.database.base, {}, function ( error, db ) {
	if ( error ) { throw error; }

	db.collection('users').createIndex({a:1}, {unique:true, w:1}, function ( e ) { if ( e ) throw e; });
	db.collection('notes').createIndex({a:1}, {unique:true, w:1}, function ( e ) { if ( e ) throw e; });
	db.collection('tags' ).createIndex({a:1}, {unique:true, w:1}, function ( e ) { if ( e ) throw e; });

	console.log('MongoDB init is completed.');

	db.close();
});/**/

//process.on('uncaughtException', function(err) {
//	console.log(err);
//});
