'use strict';

var _ = require('lodash'),
	path = require('path'),
	spawn = require('child_process').spawn,
	uuid = require('node-uuid'),
	proFiles = require('../lib/promised-files'),
	phantom, ffmpeg;

function runPhantom( options ){

	options = options || {};

	var uri = options.uri,
		duration = options.duration,
		jobId = options.jobId,
		width = options.width,
		height = options.height,
		outFormat = options.outFormat,
		frameRate = options.frameRate;

	return spawn(
	    'phantomjs',
	    ['./phantomjs_scripts/frame-render.js', uri, duration, jobId, width, height, outFormat, frameRate],
	    {stdio: ['pipe', 'pipe', 'pipe']}
	);
}

function runFfmpeg( options ){

	options = options || {};

	var inFormat = options.inFormat || 'PNG',
		outFormat = options.outFormat || 'MP4',
		jobId = options.jobId;

	return spawn(
        'ffmpeg',
        ['-start_number', '0', '-r', '25', '-i', './tmp/' + jobId + '/' +'_%d.' + inFormat, '-y', './tmp/' + jobId + '/' + 'out.' + outFormat]
	);
}

exports.run = function(job, done){

	// TODO: get rid of lame format string mapping

	var input = job.input || {},
		format = input.format,
		duration = parseInt(input.duration),
		inFormat = ((!duration) ? (format || 'PNG') : 'PNG').toUpperCase(),
		outFormat = ((!duration) ? (format || 'PNG') : ((format === 'GIF' || format === 'gif') ? format : 'MP4')).toUpperCase(),
		jobId = uuid.v1(),
		jobTotal = 1;

	phantom = runPhantom(_.extend({jobId: jobId, outFormat: inFormat}, input));

	phantom.on('close', function( status ){

		if(status !== 0){

			return done(exports.type + ' process: ' + status);

		} else {

			if(!duration) {

				onprocend( status );

			} else {

				ffmpeg = runFfmpeg({
					jobId: jobId,
					inFormat: inFormat,
					outFormat: outFormat
				});

				ffmpeg.on('close', onprocend);
			}


		}

	});

	phantom.stdout.on('data', function(data){
		data = JSON.parse(data.toString());
		var complete = data.complete || 0,
			total = jobTotal = data.total + 2; // extra steps for ffmpeg conversion and file upload

		return job.progress(complete, total);
	});

	// phantom.stderr.on('data', function(data){

	// });

	function onprocend( status ){

		if(status !== 0){
			return onfail(data);
		} else {

			var fileName = (duration) ? 'out.' + outFormat : '_0.' + outFormat,
				tempLoc = './tmp/' + jobId,
				newLoc = './store/' + jobId;

			job.progress(jobTotal - 1, jobTotal);

			proFiles.s3Upload(tempLoc.concat('/', fileName))
				.then( onsuccess )
				.fail( onfail )
				.done( _.partial( proFiles.rmdir, tempLoc, {recursive: true, force: true} ) );

		}
	}

	function onfail(err){
		return done(exports.type + ' process: ' + err);
	}

	function onsuccess( path ){
		job.progress(jobTotal, jobTotal);
		return done(null, { path: path });
	}

};

exports.type = "capture";
exports.concur = 2;
exports.schema = {
	'title': 'Process',
	'description': 'URL to Media conversion',
	'type': 'object',
	'properties': {
		'uri': {
			'description': 'URI to capture for a process',
			'type': 'string',
			'minLength': 5,
			'required': true
		},
		'duration': {
			'description': 'Duration of capture process in seconds',
			'type': 'integer',
			'maximum': 10 //seconds
		}
	}
};

