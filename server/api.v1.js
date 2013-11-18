/**
 * Central Web Server
 * RESTful web API module
 * @module api
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// global modules and config
var mongodb       = require('mongodb'),
	dbLink        = null,
	mongoNotes    = null,
	mongoUsers    = null,
	mongoSessions = null,
	crypto        = require('crypto'),
	config        = require('./config/loader.js');


// db connect
mongodb.MongoClient.connect('mongodb://' + config.database.host + ':' + config.database.port + '/' + config.database.base, {}, function ( error, db ) {
	if ( error ) { throw error; }
	dbLink        = db;
	mongoNotes    = db.collection('notes');
	mongoUsers    = db.collection('users');
	mongoSessions = db.collection('sessions');
	console.log('FortNotes mongo database is ready');
});


/**
 * @namespace
 */
module.exports.users = {
	/**
	 * read
	 * @return {Object} operation status and data
	 */
	'get': function () {
		return {code: 1};
	},

	/**
	 * update
	 * @return {Object} operation status and data
	 */
	'put': function () {
		return {code: 1};
	},

	/**
	 * create
	 * @return {Object} operation status and data
	 */
	'post': function () {
		return {code: 1};
	},

	/**
	 * remove
	 * @return {Object} operation status and data
	 */
	'delete': function () {
		return {code: 1};
	}
};


/**
 * @namespace
 */
module.exports.notes = {
	/**
	 * read
	 */
	'get': function ( path, query, callback ) {
		//console.log(query);
		query.skip  = parseInt(query.skip,  10) || 0;
		query.limit = parseInt(query.limit, 10) || 20;
		//console.log(mongoDb);
		//console.log(response);
		mongoNotes.find({}, {sort:{mtime:-1}, skip:query.skip, limit:query.limit}).toArray(function(err, docs) {
			callback({code: 1, data: docs || []});
		});
	},

	/**
	 * update
	 * @return {Object} operation status and data
	 */
	'put': function ( path, query, callback ) {
		return {code: 1};
	},

	/**
	 * create
	 */
	'post': function ( path, query, postData, callback ) {
		//postData._id = new mongodb.ObjectID();
		delete postData._id;
		//postData._id = 123;
		//console.log(postData);
		mongoNotes.insert(postData, {}, function(err) {
			//console.log(postData);
			callback({code: 1, data: {_id:postData._id}});
		});
	},

	/**
	 * remove
	 * @return {Object} operation status and data
	 */
	'delete': function () {
		return {code: 1};
	}
};


/**
 * @namespace
 */
module.exports.tags = {

};

/**
 * @namespace
 */
module.exports.auth = {
	'get': function ( path, query, callback ) {
		var name = path[0],
			pass = path[1];

		if ( name && pass ) {
			// full data
			mongoUsers.findOne({name:name, pass:pass}, function(err, doc) {
				if ( doc ) {
					var key = new Buffer(String.fromCharCode.apply(null, crypto.randomBytes(38))).toString('base64').slice(0, 64);
					mongoSessions.insert({_id:key, uid:doc._id}, {}, function(err) {
						callback({code:1, step:2, key:key});
					});
				} else {
					callback({code:5, step:2});
				}
			});
		} else if ( name ) {
			// only name so return salt for pass hash generation
			mongoUsers.findOne({name:name}, function(err, doc) {
				callback({code:1, step:1, salt:doc.salt});
			});
		} else {
			callback({code:5});
		}


		//query.skip  = parseInt(query.skip,  10) || 0;
		//query.limit = parseInt(query.limit, 10) || 20;
		//console.log(mongoDb);
		//console.log(response);
		//mongoNotes.find({}, {sort:{mtime:-1}, skip:query.skip, limit:query.limit}).toArray(function(err, docs) {
			//callback({code: 1, key: btoa(String.fromCharCode.apply(null, crypto.randomBytes(128)))});

		//var key = new Buffer(String.fromCharCode.apply(null, crypto.randomBytes(32))).toString('base64');
		//callback({code: 1, key: key, len: key.length});
		//});
	}
};