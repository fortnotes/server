/**
 * Config
 */

'use strict';

module.exports = function ( grunt ) {

	// prepare configuration
	grunt.initConfig({
		project: grunt.file.readJSON('package.json'),

		uglify: {
			options: {
				banner: '/*! <%= project.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: { src: ['client/js/*.js'], dest: 'client/app.js', filter: 'isFile' }
		},

		jshint: {
			options: grunt.file.readJSON('client/.jshintrc'),
			files: ['client/js/*.js', '!client/js/core.js']
		},

		less: {
			options: {
				paths: ['client/css'],
				cleancss: false
			},
			build: { src: ['client/css/*.less'], dest: 'client/app.css' }
		}
	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');

	// default task(s)
	grunt.registerTask('default', ['uglify', 'less']);
	grunt.registerTask('check', ['jshint']);

};