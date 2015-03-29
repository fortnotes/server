/**
 * Gulp main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var gulp    = require('gulp'),
	apidoc  = require('gulp-apidoc'),
	plumber = require('gulp-plumber'),
	eslint  = require('gulp-eslint'),
	nodemon = require('gulp-nodemon'),
	mocha   = require('gulp-mocha');


gulp.task('lint', function () {
	return gulp
		.src([
			//'./client/app/js/**/*.js',
			'./client/config/**/*.js',
			'./server/**/*.js'
		])
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format());
});


// build REST documentation
gulp.task('apidoc', function () {
	apidoc.exec({
		src: './server/',
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
	return gulp.src('./server/tests/*.js', {read: false})
		.pipe(mocha({reporter: 'spec'}));
});


// entry point
gulp.task('default', ['serve'], function () {
	gulp.watch(['./server/**/*.js'], ['apidoc']);
});
