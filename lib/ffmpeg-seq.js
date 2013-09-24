var _ = require('lodash'),
	path = require('path'),
	spawn = require('child_process').spawn,
	Q = require('q'),
	defaults = {
		rate: 25
	};

module.exports = function( options ){

	options = _.defaults(options || {}, defaults);

	var output = options.output || 'out.MP4',
		input = options.input,
		rate = options.rate,
		id = options.id,
		dir = path.dirname(input),
		outputPath = dir + '/' + output,
		deferred = Q.defer(),
		child;

	if(!input){

		deferred.reject('ffmpeg can not run with no input file specified!');

	} else {

		child = spawn(
	        'ffmpeg',
	        ['-start_number', '0', '-r', rate, '-i', input, '-y', outputPath],
	        {stdio: ['pipe', 'pipe', 'pipe']}
		);

		child.on('close', function(status){

			if(status !== 0){
				deferred.reject( 'ffmpeg quit with a status code: ' + status );
			} else {
				deferred.resolve( {
					files: [{
						name: output,
						path: outputPath,
						dir: dir
					}],
					id: id
				});
			}
		});

		child.stdout.on('data', function( data ){
			deferred.notify(data.toString());

		});

		child.stderr.on('data', function( data ){
			deferred.notify(data.toString());
		});

	}

	return deferred.promise;

};