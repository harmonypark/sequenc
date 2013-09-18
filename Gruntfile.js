'use strict';

module.exports = function (grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		watch: {
			server: {
				files: [
		          '{,*/}*.js',
		        ]
			}
		},
		nodemon: {
		  dev: {
		  	options: {
		  		nodeArgs: ['--debug'],
		  		watchedExtensions: ['js'],
		  		ignoredFiles: ['README.md', 'node_modules/**', 'Gruntfile.js', 'tmp']
		  	}
		  }
		}
   	});

	grunt.registerTask('runRedis', function () {
		grunt.util.spawn({
		  cmd: 'redis-server',
		  opts: {
		    stdio: 'inherit'
		  }
		}, function () {
		  grunt.fail.fatal(new Error("Redis quit"));
		});
	});

	grunt.registerTask('server', function (target) {
	    grunt.task.run([
	      'runRedis',
	      'nodemon:dev'
	    ]);
  	});

};