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
	mocha   = require('gulp-mocha');


gulp.task('lint', function () {
	return gulp
		.src([
			'./bin/**/*.js',
			'./config/**/*.js',
			'./lib/**/*.js',
			'./tests/**/*.js'
		])
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format());
});


// build REST documentation
gulp.task('apidoc', function () {
	apidoc.exec({
		src: './lib/resources/',
		dest: './doc/apidoc/',
		debug: false
	});
});


// mocha bdd tests
gulp.task('tests', function () {
	return gulp.src(['./tests/main.js'], {read: false})
		.pipe(mocha({reporter: 'spec'}))
		.on('end', function () {
			process.exit();
		});
});


// entry point
gulp.task('default', ['lint'], function () {
	// rebuild docs
	gulp.watch(['./lib/resources/**/*.js'], ['apidoc']);
});
