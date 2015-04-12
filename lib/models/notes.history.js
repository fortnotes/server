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
		createTime: {type: 'integer', unsigned: true, size: 8, defaultValue: 0}
	});


/**
 * Add new note data.
 *
 * @param {string} token user session token
 * @param {Object} noteData note data to save
 * @param {number} noteData.id note id to update
 * @param {string} noteData.data note encrypted data
 * @param {string} noteData.hash hash of note data before encryption
 * @param {Function} callback error/success handler
 */
notesHistory.add = function ( token, noteData, callback ) {
	// incoming params are given
	if ( noteData.id && noteData.data && noteData.hash ) {
		// data/hash size is correct
		if ( noteData.data.length <= global.config.dataSize && noteData.hash.length <= global.config.hashSize ) {
			// is user authorized
			db.models.sessions.check(token, function ( error, session ) {
				if ( error ) {
					return callback(error);
				}

				// find the note
				db.models.notes.get(noteData.id, function ( error, note ) {
					var time = +new Date();

					if ( error ) {
						console.log(error);
						return callback(new restify.errors.InternalServerError('note search failure'));
					}

					if ( session.userId !== note.userId ) {
						return callback(new restify.errors.BadRequestError('invalid note id'));
					}

					// mark as updated
					note.save({updateTime: time}, function ( error, note ) {
						if ( error ) {
							console.log(error);
							return callback(new restify.errors.InternalServerError('note saving failure'));
						}

						// add note data
						notesHistory.create({noteId: note.id, data: noteData.data, hash: noteData.hash, createTime: time}, function ( error, note ) {
							if ( error ) {
								console.log(error);
								return callback(new restify.errors.InternalServerError('note data creation failure'));
							}

							callback(null, note);
						});
					});
				});
			});
		} else {
			callback(new restify.errors.NotAcceptableError('too big note data or hash'));
		}
	} else {
		callback(new restify.errors.BadRequestError('empty or invalid request parameters'));
	}
};
