/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// public
module.exports = function ( db ) {
	db.define('tags', {
		// link to the table users - owner of the tags
		userId: {type: 'integer', unsigned: true, required: true, index: true},

		// tags encrypted data
		data: {type: 'text', big: true},

		// sha512 hash of tags data before encryption
		hash: {type: 'text', size: 128},

		// modification time
		mtime: {type: 'integer', size: 8, unsigned: true, defaultValue: 0}
	});
};
