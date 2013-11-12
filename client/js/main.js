requirejs.config({
	shim: {
		sjcl: {exports: 'sjcl'}
	}
});

//requirejs(["stxt/web"], function(web) { web.go() });

require(['aes', 'collection.notes'], function ( aes, Notes ) {
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
});


/**
 * FortNotes Application base
 * @namespace
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */
//(function(app){
//	'use strict';
//
//	/**
//	 * main entry point
//	 */
//	app.init = function(){
//		console.log('DOM fully loaded and parsed, all scripts as well.');
//
//	};
//
//	app.lock = function(){
//
//	};
//
//	app.unlock = function(){
//
//	};
//})(app);