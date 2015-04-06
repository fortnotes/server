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
		createTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0},

		// last time note data was saved
		updateTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0},

		// last time note was fully shown
		readTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0}
	});


	/**
	 * Get a list of user notes.
	 *
	 * @param {string} token user session token
	 * @param {Function} callback error/success handler
	 */
	notes.list = function ( token, callback ) {
		// is user authorized
		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			// get all notes
			notes.find({userId: session.userId}).only('id', 'createTime', 'updateTime', 'readTime').run(function ( error, noteList ) {
				var data = [];

				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('notes search failure'));
				}

				// reformat data
				noteList.forEach(function ( item ) {
					data.push({
						id:         item.id,
						createTime: item.createTime,
						updateTime: item.updateTime,
						readTime:   item.readTime
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
		// is user authorized
		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			// insert a new note
			notes.create({userId: session.userId, createTime: +new Date()}, function ( error, note ) {
				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('user creation failure'));
				}

				callback(null, note);
			});
		});
	};
};
