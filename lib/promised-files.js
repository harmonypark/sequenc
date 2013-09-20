var Q = require('q'),
	fs = require('fs'),
	fs2 = require('fs2');

var copy = exports.copy = function copy(source, target) {

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

var mkdir = exports.mkdir = function mkDir(path){

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

