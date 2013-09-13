'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	grunt.initConfig({
		watch: {
			server: {
				files: [
		          '{,*/}*.js',
		        ]
			}
		}
   	});

   	grunt.registerTask('server', function (target) {

	    grunt.task.run([
	      'watch'
	    ]);

  	});

};