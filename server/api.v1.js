/**
 * Central Web Server.
 * RESTful web API module.
 *
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
	config        = require('./config/main');


// db connect
mongodb.MongoClient.connect('mongodb://' + main.database.host + ':' + main.database.port + '/' + main.database.base, {}, function ( error, db ) {
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
exports.users = {
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
exports.notes = {
	/**
	 * read
	 */
	'get': function ( path, query, request, callback ) {
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
	'put': function ( path, query, request, callback ) {
		return {code: 1};
	},

	/**
	 * create
	 */
	'post': function ( path, query, postData, request, callback ) {
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
exports.tags = {

};


/**
 * @namespace
 */
exports.auth = {
	'get': function ( path, query, request, callback ) {
		var name = path[0];

		if ( name ) {
			// only name so return salt for pass hash generation
			mongoUsers.findOne({name:name}, function(err, doc) {
				if ( doc ) {
					callback({code:1, salt:doc.salt, ip:request.headers['X-Forwarded-For'] || request.connection.remoteAddress});
				} else {
					callback({code:5});
				}
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
	},

	'post': function ( path, query, postData, request, callback ) {
		var name = path[0],
			pass = path[1];

		if ( name && pass ) {
			// full data
			mongoUsers.findOne({name:name, pass:pass}, function(err, doc) {
				if ( doc ) {
					// valid user
					var time = +new Date(),
						key  = new Buffer(String.fromCharCode.apply(null, crypto.randomBytes(40))).toString('base64').replace('/', '').slice(0, 64);
					// create a session and store user ip, user agent, geo data and so on
					mongoSessions.insert({_id:key, uid:doc._id, ctime:time, atime:time, data:postData}, {}, function(err) {
						if ( !err ) {
							// update user atime
							mongoUsers.update({_id:doc._id}, {$set:{atime:time}}, function(){});
							callback({code:1, sjcl:doc.sjcl, key:key});
						} else {
							callback({code:5});
						}
					});
				} else {
					callback({code:5});
				}
			});
		} else {
			callback({code:5});
		}
	}
};


function authCheck ( key, onSuccess ) {
	if ( key ) {

	}
	mongoSessions.findOne({_id:key}, {_id:0, ctime:1, atime:1}, function(err, doc) {

	});
}

/**
 * @namespace
 */
exports.sessions = {
	'get': function ( path, query, request, callback ) {
		var key = request.headers.key;
		if ( key ) {
			// authorized
			mongoSessions.findOne({_id:key}, {_id:0, uid:1, ctime:1, atime:1}, function(err, session) {
				if ( session ) {
					//console.log(session);
					// authorized
					if ( path[0] ) {
						// single current key info
						mongoSessions.findOne({_id:path[0]}, {_id:0, ctime:1, atime:1, data:1}, function(err, doc) {
							//console.log(err);
							//console.log(doc);
							if ( doc ) {
								callback({code:1, data:doc});
							} else {
								callback({code:5});
							}
						});
					} else {
						// all keys
						// filter options
						query.skip  = parseInt(query.skip,  10) || 0;
						query.limit = parseInt(query.limit, 10) || 20;
						mongoSessions.find(
							{uid:session.uid},
							{uid:0},
							{sort:{atime:-1}, skip:query.skip, limit:query.limit}
						).toArray(function(err, docs) { callback({code: 1, data: docs || []}); });
					}
				} else {
					callback({code:5});
				}
			});
		} else {
			callback({code:5});
		}
	},

	'put': function ( path, query, request, callback ) {
		var key = path[0];

		if ( key ) {
			// get the session
			mongoSessions.findOne({_id:key}, {_id:1, atime:1}, function(err, session) {
				if ( session ) {
					// update session atime
					mongoSessions.update({_id:key}, {$set:{atime:+new Date()}}, function(){});
					// send the last access time to the client
					callback({code:1, atime:session.atime});
				} else {
					callback({code:5});
				}
			});
		} else {
			callback({code:5});
		}
	}
};
