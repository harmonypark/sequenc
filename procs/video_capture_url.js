'use strict';

var _ = require('underscore'),
	spawn = require('child_process').spawn,
	uuid = require('node-uuid'),
	fs = require('fs'),
	phantom, ffmpeg;


function runPhantom( options ){

	options = options || {};

	var uri = options.uri,
		duration = options.duration,
		jobId = options.jobId,
		width = options.width,
		height = options.height;

	return spawn(
	    'phantomjs',
	    ['./phantomjs_scripts/frame-render.js', uri, duration, jobId, width, height]
	);
}

function runFfmpeg( options ){

	options = options || {};

	var inFormat = options.inFormat || 'png',
		outFormat = options.outFormat || 'mp4',
		jobId = options.jobId;

	return spawn(
        'ffmpeg',
        ['-start_number', '0', '-r', '25', '-i', './tmp/' + jobId + '/' +'_%d.' + inFormat, '-y', './tmp/' + jobId + '/' + 'out.' + outFormat]
	);
}

exports.run = function(job, done){

	var data = job.data || {},
		jobId = uuid.v1();

	phantom = runPhantom(_.extend({jobId: jobId}, data));

	phantom.on('close', function( status ){

		if(status !== 0){
			done(exports.type + ' process: ' + status);
		} else {
			ffmpeg = runFfmpeg({
				jobId: jobId
			});

			ffmpeg.on('close', function (status) {
				if(status !== 0){
					done(exports.type + ' process: ' + data);
				} else {
					done(null);
				}
			});

			ffmpeg.stderr.on('data', function (data) {
				console.log(data.toString())
			});
		}


	});

};

exports.type = "capture_video";
exports.concur = 10;
exports.schema = {
	'title': 'Process',
	'description': 'URL to Video conversion',
	'type': 'object',
	'properties': {
		'uri': {
			'description': 'URI to capture for a process',
			'type': 'string',
			'minLength': 5,
			'required': true
		}
	}
};

