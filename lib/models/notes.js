/**
 * Object Relational Mapping Model.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var restify = require('restify'),
	db      = require('../db'),
	notes   = db.define('notes', {
		// link to the table users - owner of the note
		userId: {type: 'integer', unsigned: true, required: true, index: true},

		// note encrypted data
		data: {type: 'text', big: true},

		// sha512 hash of data before encryption
		hash: {type: 'text', size: 128},

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
 * @param {function} callback error/success handler
 */
notes.list = function ( token, callback ) {
	// is user authorized
	db.models.sessions.check(token, function ( error, session ) {
		if ( error ) {
			return callback(error);
		}

		// get all notes
		notes.find({userId: session.userId}, {order: '-updateTime'}, function ( error, noteList ) {
			var data = [];

			if ( error ) {
				console.log(error);
				return callback(new restify.errors.InternalServerError('data search failure'));
			}

			if ( noteList ) {
				// reformat data
				noteList.forEach(function ( item ) {
					data.push({
						id:         item.id,
						data:       item.data,
						hash:       item.hash,
						createTime: item.createTime,
						updateTime: item.updateTime,
						readTime:   item.readTime
					});
				});
			}

			callback(null, data);
		});
	});
};


/**
 * Create new user note.
 *
 * @param {string} token user session token
 * @param {Object} noteData data to save
 * @param {string} noteData.data note encrypted data
 * @param {string} noteData.hash hash of note data before encryption
 * @param {function} callback error/success handler
 */
notes.insert = function ( token, noteData, callback ) {
	// incoming params are given
	if ( noteData.data && noteData.hash ) {
		// data/hash size is correct
		if ( noteData.data.length <= global.config.dataSize && noteData.hash.length <= global.config.hashSize ) {
			// is user authorized
			db.models.sessions.check(token, function ( error, session ) {
				var time = +new Date();

				if ( error ) {
					return callback(error);
				}

				// insert a new note
				notes.create({userId: session.userId, data: noteData.data, hash: noteData.hash, createTime: time, updateTime: time}, function ( error, note ) {
					if ( error ) {
						console.log(error);
						return callback(new restify.errors.InternalServerError('data creation failure'));
					}

					callback(null, note);
				});
			});
		} else {
			callback(new restify.errors.InvalidContentError('content data is too big'));
		}
	} else {
		callback(new restify.errors.MissingParameterError('empty data or hash'));
	}
};


// actual node saving procedure
function noteUpdate ( session, noteData, callback ) {
	// find the note
	notes.get(parseInt(noteData.id, 10), function ( error, note ) {
		var time = +new Date();

		if ( error ) {
			console.log(error);
			return callback(new restify.errors.NotFoundError('resource was not found'));
		}

		// correct ownership
		if ( !note || session.userId !== note.userId ) {
			return callback(new restify.errors.BadRequestError('invalid note id'));
		}

		// clone note data to note history table
		db.models.notesHistory.create({noteId: note.id, data: note.data, hash: note.hash, time: note.updateTime}, function ( error ) {
			if ( error ) {
				console.log(error);
				return callback(new restify.errors.InternalServerError('data creation failure'));
			}

			// update note
			note.save({data: noteData.data, hash: noteData.hash, updateTime: time}, function ( error ) {
				if ( error ) {
					console.log(error);
					return callback(new restify.errors.InternalServerError('data saving failure'));
				}

				callback(null, true);
			});
		});
	});
}


/**
 * Update a user note with new data.
 *
 * @param {string} token user session token
 * @param {Object} noteData data to save
 * @param {string} noteData.id note id
 * @param {string} noteData.data note encrypted data
 * @param {string} noteData.hash hash of note data before encryption
 * @param {function} callback error/success handler
 */
notes.update = function ( token, noteData, callback ) {
	// incoming params are given
	if ( noteData.id && noteData.data && noteData.hash ) {
		// data/hash size is correct
		if ( noteData.data.length <= global.config.dataSize && noteData.hash.length <= global.config.hashSize ) {
			// is user authorized
			db.models.sessions.check(token, function ( error, session ) {
				if ( error ) {
					return callback(error);
				}

				// add to history and update note
				db.transaction(function ( error, transaction ) {
					if ( error ) {
						console.log(error);
						return callback(new restify.errors.InternalServerError('transaction initialization failure'));
					}

					// all the work
					noteUpdate(session, noteData, function ( error ) {
						if ( error ) {
							// cancel everything
							transaction.rollback(function () {});
							return callback(error);
						}

						// fix changes
						transaction.commit(function ( error ) {
							if ( error ) {
								console.log(error);
								return callback(new restify.errors.InternalServerError('transaction committing failure'));
							}

							// ok
							callback(null, true);
						});
					});
				});
			});
		} else {
			callback(new restify.errors.InvalidContentError('content data is too big'));
		}
	} else {
		callback(new restify.errors.MissingParameterError('empty note attributes'));
	}
};
