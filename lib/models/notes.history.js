/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify      = require('restify'),
	db           = require('../db'),
	notesHistory = db.define('notesHistory', {
		// link to the table notes - owner of the note data
		noteId: {type: 'integer', unsigned: true, required: true, index: true},

		// note encrypted data
		data: {type: 'text', big: true},

		// sha512 hash of data before encryption
		hash: {type: 'text', size: 128},

		// creation time
		time: {type: 'integer', unsigned: true, size: 8, defaultValue: 0}
	});


/**
 * Get a note old values list.
 *
 * @param {string} token user session token
 * @param {number} noteId given note id
 * @param {function} callback error/success handler
 */
notesHistory.list = function ( token, noteId, callback ) {
	// incoming params are given
	if ( noteId ) {
		// is user authorized
		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			// get the given note
			db.models.notes.find({id: parseInt(noteId, 10)}).only('userId').run(function ( error, notesList ) {
				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('data search failure'));
				}

				// correct ownership
				if ( notesList.length === 0 || session.userId !== notesList[0].userId ) {
					return callback(new restify.errors.BadRequestError('invalid note id'));
				}

				// get ordered note history records
				notesHistory.find({noteId: noteId}, {order: '-time'}, function ( error, dataList ) {
					var data = [];

					if ( error ) {
						console.log(error);
						return callback(new restify.errors.InternalServerError('data search failure'));
					}

					if ( dataList ) {
						// reformat data
						dataList.forEach(function ( item ) {
							data.push({
								data: item.data,
								hash: item.hash,
								time: item.time
							});
						});
					}

					callback(null, data);
				});
			});
		});
	} else {
		callback(new restify.errors.MissingParameterError('empty note id'));
	}

};
