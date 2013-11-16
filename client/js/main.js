/**
 * Main application entry point
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var aes   = require('./aes'),
	Notes = require('./collection.notes');


//app.init();

// test data
aes.salt = '0fb449e1ae2dc62c11f64a415e66610fa7945ce62033866788db5cc0e2ffb0da';
aes.setPass('qwerty');

var notes = new Notes();
notes.addListener('fetch', function(status){
	console.log('notes fetch', status);
});
notes.fetch();
console.log(notes);