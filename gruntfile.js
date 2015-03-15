/**
 * Config
 */

'use strict';

module.exports = function ( grunt ) {
	// load all grunt tasks matching the `grunt-*` pattern
	require('load-grunt-tasks')(grunt);

	// prepare configuration
	grunt.initConfig({
		project: grunt.file.readJSON('package.json'),

		nodemon: {
			run: {
				options: {
					nodeArgs: ['--debug'],
					watchedFolders: ['server']
				}
			}
		},

		jade: {
			dev: {
				options: {
					pretty: true,
					data: {
						debug: true,
						title: '<%= project.name %>'
					}
				},
				files: {
					'client/pub/index.html': ['client/jade/main.jade']
				}
			}
		},

		browserify: {
			dev: {
				options: {
					ignore: ['crypto'],
					debug: true
				},
				files: {
					'client/pub/app.js': 'client/js/main.js'
					//src : ['client/js/*.js', 'client/js/lib/*.js'],
					//src : ['client/js/main.js'],
					//src : ['client/js/tst/*.js'],
					//dest: 'client/pub/app.js'
				}
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= project.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src : 'client/pub/app.js',
				dest: 'client/pub/app.js'
			}
		},

		jshint: {
			options: {
				jshintrc: true
			},
			//options: grunt.file.readJSON('client/.jshintrc'),
			//files: ['client/js/*.js', 'client/js/lib/*.js', '!client/js/lib/sjcl.js']
			files: ['client/js/**/*.js', '!client/js/lib/sjcl.js']
		},

		less: {
			dev: {
				options: {
					cleancss: false
				},
				files: {
					'client/pub/app.css': 'client/less/main.less'
				}
			}
		},

		watch: {
			options: {
				spawn: false,
				atBegin: true,
				livereload: true
			},
			html: {
				files: ['client/index.html'],
				tasks: []
			},
			js: {
				files: ['<%= browserify.dev.files %>'],
				tasks: ['browserify']
			},
			css: {
				files: ['<%= less.dev.files %>'],
				tasks: ['less']
			}
		},

		concurrent: {
			tasks: ['nodemon', 'watch'],
			options: {
				logConcurrentOutput: true
			}
		}
	});

	// load plugins
//	grunt.loadNpmTasks('grunt-contrib-watch');
//	grunt.loadNpmTasks('grunt-contrib-uglify');
//	grunt.loadNpmTasks('grunt-contrib-jshint');
//	grunt.loadNpmTasks('grunt-contrib-less');
//	grunt.loadNpmTasks('grunt-contrib-jade');
//	grunt.loadNpmTasks('grunt-browserify');
//	grunt.loadNpmTasks('grunt-concurrent');
//	grunt.loadNpmTasks('grunt-nodemon');

	// default task(s)
	//grunt.registerTask('default', ['browserify', 'uglify', 'less']);
	grunt.registerTask('default', ['concurrent']);
	grunt.registerTask('check', ['jshint']);

};
