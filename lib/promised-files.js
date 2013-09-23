var Q = require('q'),
	fs = require('fs'),
	fs2 = require('fs2'),
	s3 = require('./store').S3,
	mime = require('mime'),
	p = require('path');

var copy = exports.copy = function copy( source, target ) {

	var deferred = Q.defer(), rd, wr;

	rd = fs.createReadStream(source);

	rd.on("error", function(err) {
		deferred.reject(err);
	});

	wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		deferred.reject(err);
	});

	wr.on("close", function(ex) {
		deferred.resolve(target);
	});

	rd.pipe(wr);

	return deferred.promise;
}

var mkdir = exports.mkdir = function mkDir( path ){

	var deferred = Q.defer();

	fs.mkdir(path, function(ex){
		if(ex){
			deferred.reject(ex);
		} else {
			deferred.resolve(path);
		}
	});

	return deferred.promise;
}

var rmdir = exports.rmdir = fs2.rmdir;

var s3Upload = exports.s3Upload = function s3Upload( path ){

	var deferred = Q.defer(),
		remotePath,
		fileName,
		fileExt,
		fileType,
		req;

	fs.stat( path, function( err, stat ){

	   	if(err){
			return deferred.reject(err);
	   	}

	   	remotePath = p.dirname(path).split('/').reduce(function(p, c, i, arr){
	   		return (arr.indexOf(c) === arr.length - 1) ? p + c : p;
	   	}, '');

	   	fileName = p.basename(path);
	   	fileExt = p.extname(path);
	   	fileType = mime.lookup(fileExt);

		req = s3.put( p.join(remotePath, fileName), {
			'Content-Length': stat.size,
			'Content-Type': fileType,
			'x-amz-acl': 'public-read',
        	'x-amz-meta-acl': 'public'
		});

		fs.createReadStream( path ).pipe( req );

		req.on('response', function(res){
			if (200 == res.statusCode) {
				deferred.resolve( req.url );
			} else {
				deferred.reject('Failed uploading to S3, file: %s', path);
			}
		});

		req.on('error', deferred.reject);

	});

	return deferred.promise;
};

