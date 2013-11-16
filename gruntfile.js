/**
 * Config
 */

'use strict';

module.exports = function ( grunt ) {

	// prepare configuration
	grunt.initConfig({
		project: grunt.file.readJSON('package.json'),

		browserify: {
			build: {
				src : ['client/js/*.js', 'client/js/lib/*.js'],
				dest: 'client/app.js'
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= project.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src : 'client/app.js',
				dest: 'client/app.js'
			}
		},

		jshint: {
			options: grunt.file.readJSON('client/.jshintrc'),
			files: ['client/js/*.js', 'client/js/lib/*.js', '!client/js/lib/sjcl.js']
		},

		less: {
			options: {
				//paths: ['client/css'],
				cleancss: true
			},
			build: {
				src : 'client/less/*.less',
				dest: 'client/app.css'
			}
		}
	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-browserify');

	// default task(s)
	grunt.registerTask('default', ['browserify', 'uglify', 'less']);
	grunt.registerTask('check', ['jshint']);

};