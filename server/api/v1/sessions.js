/**
 * RESTful web API module.
 * User sessions.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

module.get = function ( path, query, request, callback ) {
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
};


module.put = function ( path, query, request, callback ) {
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
};
