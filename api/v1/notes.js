/**
 * RESTful web API module
 * Notes
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

/**
 * read
 */
module.get = function ( path, query, request, callback ) {
	//console.log(query);
	query.skip  = parseInt(query.skip,  10) || 0;
	query.limit = parseInt(query.limit, 10) || 20;
	//console.log(mongoDb);
	//console.log(response);
	mongoNotes.find({}, {sort:{mtime:-1}, skip:query.skip, limit:query.limit}).toArray(function(err, docs) {
		callback({code: 1, data: docs || []});
	});
};


/**
 * update
 * @return {Object} operation status and data
 */
module.put = function ( path, query, request, callback ) {
	return {code: 1};
};


/**
 * create
 */
module.post = function ( path, query, postData, request, callback ) {
	//postData._id = new mongodb.ObjectID();
	delete postData._id;
	//postData._id = 123;
	//console.log(postData);
	mongoNotes.insert(postData, {}, function(err) {
		//console.log(postData);
		callback({code: 1, data: {_id:postData._id}});
	});
};


/**
 * remove
 * @return {Object} operation status and data
 */
module.delete = function () {
	return {code: 1};
};
