var envify = require("envify/custom");

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		envify: {
			dev: {
				options: {
					env: {
						NODE_ENV: "development"
					}
				},
				files: [
					'app/webroot/js/dev/**/*.js'
				]
			},
			prod: {
				options: {
					env: {
						NODE_ENV: "production"
					}
				},
				files: [
					'app/webroot/js/prod/**/*.js'
				]
			}
		},
		sass: {
			options: {
				sourceMap: true,
				outputStyle: 'compressed'
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'app/webroot/scss/',
					src: ['*.scss', '**/*.scss'],
					dest: 'app/webroot/css/',
					ext: '.css'
				}]
			}
		},
		watch: {
			css: {
				files: [
					'app/webroot/scss/**/*.scss'
				],
				tasks: ['sass']
			},
			browserify: {
 				files: [
					"js/src/**/app.jsx"
				],
				tasks: ['browserify:prod', 'uglify:browserify']
			}
		},
		uglify: {
			browserify: {
				cwd: "app/webroot/js/prod/",
				src: "**/*.js",
				dest: "app/webroot/js/min/",
				expand: true,
				flatten: false
			}
		},
		browserify: {
			dev: {
				options: {
					extensions: ['jsx', 'js'],
					transform: [
						[ 'babelify', { presets: [ 'es2015', 'react', 'stage-0' ]} ],
						[ 'sassify', { 'auto-inject': true, base64Encode: false, sourceMap: false } ]
					],
					watch: true,
					keepAlive: true,
					browserifyOptions: {
						paths: [
							'node_modules/',
							'app/webroot/js/src/',
							'./'
						]
					}
				},
				files: [{
					"expand": true,
					"cwd": "app/webroot/js/src/",
					"src": ["**/app.jsx"],
					"dest": "app/webroot/js/dev/",
					"ext": ".js"
				}]
			},
			prod: {
				options: {
					extensions: ['jsx', 'js'],
					transform: [
						[ 'babelify', { presets: [ 'es2015', 'react', 'stage-0' ]} ],
						[ 'sassify', { 'auto-inject': true, base64Encode: false, sourceMap: false } ],
						[ 'envify', { global: true, NODE_ENV: "production" } ],
					],
					watch: true,
					// keepAlive: true,
					browserifyOptions: {
						paths: [
							'node_modules/',
							'app/webroot/js/src/',
							'./'
						]
					}
				},
				files: [{
					"expand": true,
					"cwd": "app/webroot/js/src/",
					//"src": "**/*.jsx",
					"src": [
						"**/app.jsx",
					],
					"dest": "app/webroot/js/prod/",
					"ext": ".js"
				}]
			}
		},
	});
	//grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks("grunt-browserify");
	// grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-envify');

	grunt.registerTask('default',['watch']);

	// Run before working in Development
	grunt.registerTask('react-development', ['browserify:dev']);

	// Run before publishing to Production
	grunt.registerTask('react-production', ['browserify:prod', 'uglify:browserify']);
}
