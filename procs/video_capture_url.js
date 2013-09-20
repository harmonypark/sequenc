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
	    ['./phantomjs_scripts/frame-render.js', uri, duration, jobId, width, height, outFormat, frameRate]
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

	var data = job.data || {},
		format = data.format,
		duration = data.duration,
		inFormat = ((!duration) ? (format || 'PNG') : 'PNG').toUpperCase(),
		outFormat = ((!duration) ? (format || 'GIF') : ((format === 'GIF' || format === 'gif') ? format : 'MP4')).toUpperCase(),
		jobId = uuid.v1();

	phantom = runPhantom(_.extend({jobId: jobId, outFormat: inFormat}, data));

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

	function onprocend( status ){
		if(status !== 0){

			return onfail(data);

		} else {

			var fileName = (duration) ? 'out.' + outFormat : '_0.' + outFormat,
				tempLoc = './tmp/' + jobId,
				newLoc = './store/' + jobId;

			proFiles.mkdir(newLoc)
				.then(_.partial(proFiles.copy, tempLoc.concat('/', fileName), newLoc.concat('/', fileName)))
				.then(_.partial(onsuccess, {file: path.resolve( newLoc.concat('/', fileName) )}))
				.fail( onfail )
				.done( _.partial( proFiles.rmdir, tempLoc, {recursive: true, force: true} ) );

		}
	}

	function onfail(err){
		console.log(err)
		return done(exports.type + ' process: ' + err);
	}

	function onsuccess(data){
		return done(null, data);
	}

};

exports.type = "capture";
exports.concur = 10;
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
		}
	}
};

