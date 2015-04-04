/**
 * Gulp main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path    = require('path'),
	gulp    = require('gulp'),
	apidoc  = require('gulp-apidoc'),
	plumber = require('gulp-plumber'),
	eslint  = require('gulp-eslint'),
	nodemon = require('gulp-nodemon'),
	mocha   = require('gulp-mocha');


gulp.task('lint', function () {
	return gulp
		.src([
			//'./client/app/js/**/*.js',
			'./bin/**/*.js',
			'./config/**/*.js',
			'./lib/**/*.js',
			'./models/**/*.js',
			'./resources/**/*.js',
			'./tests/**/*.js'
		])
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format());
});


// build REST documentation
gulp.task('apidoc', function () {
	apidoc.exec({
		src: './resources/',
		dest: './doc/api/',
		debug: false
	});
});


// serve API requests
gulp.task('serve', function () {
	nodemon({
		script: './server/main.js',
		watch: ['./server/'],
		ext: 'js'
	});
});


// unit tests
gulp.task('tests', function () {
	var argv = require('minimist')(process.argv.slice(2)),
		file = argv.config || path.join(__dirname, 'config.json');

	// map loaded configuration to global scope
	global.config = require(file);

	// set logging verbosity level
	global.config.debug = !!argv.debug;

	console.log('Config file name: %s', file);
	console.log('(to use another config file use flag --config <file>)');

	return gulp.src('./tests/*.js', {read: false})
		.pipe(mocha({reporter: 'spec'}));
});


// entry point
gulp.task('default', ['serve'], function () {
	gulp.watch(['./server/**/*.js'], ['apidoc']);
});
