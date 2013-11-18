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
				dest: 'client/build.js'
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= project.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src : 'client/build.js',
				dest: 'client/build.js'
			}
		},

		jshint: {
			options: grunt.file.readJSON('client/.jshintrc'),
			files: ['client/js/*.js', 'client/js/lib/*.js', '!client/js/lib/sjcl.js']
		},

		less: {
			options: {
				cleancss: false
			},
			build: {
				src : 'client/css/*.less',
				dest: 'client/css/build.css'
			}
		},

		watch: {
			options: {
				spawn: false,
				atBegin: true,
				livereload: true
			},
			js: {
				files: ['<%= browserify.build.src %>'],
				tasks: ['browserify']
			},
			css: {
				files: ['<%= less.build.src %>'],
				tasks: ['less']
			}
		}
	});

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-browserify');

	// default task(s)
	grunt.registerTask('default', ['browserify', 'uglify', 'less']);
	grunt.registerTask('check', ['jshint']);

};