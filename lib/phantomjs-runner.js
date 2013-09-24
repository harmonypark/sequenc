'use strict';

var _ = require('lodash'),
	path = require('path'),
	spawn = require('child_process').spawn,
	Q = require('q'),
	uuid = require('node-uuid'),
	defaults = {
		output: 'PNG',
		width: 800,
		height: 600,
		duration: 0,
		rate: 25
	};

module.exports = function( options ) {

	options = _.defaults(options || {}, defaults);

	var script = options.script,
		uri = options.uri,
		id = options.id || uuid.v1(),
		output = options.output,
		duration = options.duration,
		width = options.width,
		height = options.height,
		rate = options.rate,
		deferred = Q.defer(),
		child,
		lastMessage;

	if(!script){

		deferred.reject('phantomjs can not run with no scipt specified!');

	} else {

		child = spawn(
	    	'phantomjs',
		    [script, uri, id, output, duration, width, height, rate],
		    {stdio: ['pipe', 'pipe', 'pipe']}
		);

		child.on('close', function(status){
			if(status !== 0){
				deferred.reject( 'phantomjs quit with a status code: ' + status );
			} else {
				deferred.resolve( lastMessage );
			}
		});

		child.stdout.on('data', function( data ){
			var json, complete, total;

			try {
				json = JSON.parse(data.toString());
			} catch (err) {
				// Do nothing
			}

			if(json){
				deferred.notify(json);
				lastMessage = json;
			}
		});

		child.stderr.on('data', function( data ){
			var json;

			try {
				json = JSON.parse(data.toString());
			} catch (err) {
				// Do nothing
			}

			if(json){
				deferred.notify(json);
			}
		});

	}

	return deferred.promise;
};