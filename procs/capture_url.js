'use strict';

var _ = require('lodash'),
	uuid = require('node-uuid'),
	phRunner = require('../lib/phantomjs-runner'),
	ffmpegSeq = require('../lib/ffmpeg-seq'),
	proFiles = require('../lib/promised-files'),
	phantom, ffmpeg;

exports.run = function(job, done){

	// TODO: get rid of lame format string mapping

	var input = job.input || {},
		format = input.format,
		duration = parseInt(input.duration),
		phOutput = ((!duration) ? (format || 'PNG') : 'PNG').toUpperCase(),
		outFormat = ((!duration) ? (format || 'PNG') : ((format === 'GIF' || format === 'gif') ? format : 'MP4')).toUpperCase(),
		id = uuid.v1();

	phantom = phRunner(_.extend({
		script: './phantomjs_scripts/frame-render.js',
		output: phOutput,
		id: id
	}, input))
		.then( onphcomplete )
		.fail( onfail )
		.progress( onprogress );

	function onphcomplete( data ){
		data = data || {};
		var files = data.files;

		if(data && files.length > 1){
			return ffmpeg = ffmpegSeq({
					input: files[0].dir + '/_%d.' + phOutput,
					output: 'out.' + outFormat,
					id: data.id
				})
				.then( onprocend )
				.fail( onfail );

		} else if( files ){
			return onprocend( data );
		} else {
			return onfail('files wen\'t missing...')
		}
	}

	function onprocend( data ){

		var fileName = data.files[0].name,
			tempLoc = './tmp/' + data.id;

		return proFiles.s3Upload(tempLoc.concat('/', fileName))
			.then( onsuccess )
			.fail( onfail )
			.done( cleanup );
	}

	function onprogress( data ){
		data = data || {};

		var complete = data.complete,
			total = (data.total || 1) + 2; // extra steps for ffmpeg conversion and file upload

		if(complete){
			return job.progress(complete, total);
		} else {
			return;
		}
	}

	function onsuccess( path ){
		return done(null, { path: path });
	}

	function onfail( err ){
		cleanup();
		return done(exports.type + ' process: ' + err);
	}

	function cleanup(){
		var tempLoc = './tmp/' + id;
		return proFiles.rmdir(tempLoc, {recursive: true, force: true});
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

