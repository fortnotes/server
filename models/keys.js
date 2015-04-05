/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// public
module.exports = function ( db ) {
	db.define('keys', {
		// link to the table users - owner of the key
		userId: {type: 'integer', unsigned: true, required: true, index: true},

		// public and private key data
		pub: {type: 'text', size: 4096, required: true},
		key: {type: 'text', size: 4096, required: true},

		// creation time
		ctime: {type: 'integer', size: 8, unsigned: true, defaultValue: 0},

		// termination time
		ttime: {type: 'integer', size: 8, unsigned: true, defaultValue: 0}
	});
};
