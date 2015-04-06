/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('restify');


// public
module.exports = function ( db ) {
	var notes = db.define('notes', {
		// link to the table users - owner of the note
		userId: {type: 'integer', unsigned: true, required: true, index: true},

		// creation time
		ctime: {type: 'integer', size: 8, unsigned: true, defaultValue: 0},

		// last time note data was saved
		mtime: {type: 'integer', size: 8, unsigned: true, defaultValue: 0},

		// last time note was fully shown
		atime: {type: 'integer', size: 8, unsigned: true, defaultValue: 0}
	});


	/**
	 * Get a list of user notes.
	 *
	 * @param {string} token user session token
	 * @param {Function} callback error/success handler
	 */
	notes.list = function ( token, callback ) {
		// is valid user
		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			notes.find({userId: session.userId}).only('id', 'ctime', 'mtime', 'atime').run(function ( error, noteList ) {
				var data = [];

				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('notes search failure'));
				}

				// reformat data
				noteList.forEach(function ( item ) {
					data.push({
						id:        item.id,
						ctime:     item.ctime,
						mtime:     item.mtime,
						atime:     item.atime
					});
				});

				callback(null, data);
			});
		});
	};


	/**
	 * Create new user note.
	 *
	 * @param {string} token user session token
	 * @param {Function} callback error/success handler
	 */
	notes.add = function ( token, callback ) {
		// is valid user
		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			// insert
			notes.create({userId: session.userId, ctime: +new Date()}, function ( error, note ) {
				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('user creation failure'));
				}

				callback(null, note);
			});
		});
	};
};
