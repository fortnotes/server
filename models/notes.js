/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// public
module.exports = function ( db ) {
	var notes = db.define('notes', {
		// link to the table users - owner of the note
		userId: {type: 'integer', unsigned: true, required: true, index: true},

		// active till termination
		//active: {type: 'boolean', defaultValue: true},

		// creation time
		ctime: {type: 'integer', unsigned: true, defaultValue: 0},

		// last time note data was saved
		mtime: {type: 'integer', unsigned: true, defaultValue: 0},

		// last time note was fully shown
		atime: {type: 'integer', unsigned: true, defaultValue: 0}
	});
};
