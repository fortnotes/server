/**
 * Gulp main entry point.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path       = require('path'),
	gulp       = require('gulp'),
	apidoc     = require('gulp-apidoc'),
	plumber    = require('gulp-plumber'),
	eslint     = require('gulp-eslint');


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


// entry point
gulp.task('default', [], function () {
	gulp.watch(['./server/**/*.js'], ['apidoc']);
});
