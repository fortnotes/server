/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify   = require('restify'),
	db        = require('../db'),
	notesData = db.define('notesData', {
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
 * @param {number} noteId note id to update
 * @param {string} data note encrypted data
 * @param {string} hash hash of data before encryption
 * @param {Function} callback error/success handler
 */
notesData.add = function ( token, noteId, data, hash, callback ) {
	// correct incoming params
	if ( noteId && data && hash ) {
		// is user authorized
		db.models.sessions.check(token, function ( error, session ) {
			if ( error ) {
				return callback(error);
			}

			// find the note
			db.models.notes.get(noteId, function ( error, note ) {
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
					notesData.create({noteId: note.id, data: data, hash: hash, createTime: time}, function ( error, note ) {
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
		callback(new restify.errors.BadRequestError('empty or invalid request parameters'));
	}
};
