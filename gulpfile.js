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


// mocha bdd tests
gulp.task('tests', function () {
	return gulp.src(['./tests/main.js'], {read: false})
		.pipe(mocha({reporter: 'spec'}));
});


// entry point
gulp.task('default', ['serve'], function () {
	gulp.watch(['./server/**/*.js'], ['apidoc']);
});
