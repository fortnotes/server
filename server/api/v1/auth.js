/**
 * RESTful web API module
 * Authentication
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';


exports.get = function ( path, query, request, callback ) {
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
};


module.post = function ( path, query, postData, request, callback ) {
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
};
