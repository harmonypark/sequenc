/*
* https://groups.google.com/forum/#!msg/phantomjs/wluVGGjhL90/oGBXqh7QP44J
* https://lists.ffmpeg.org/pipermail/ffmpeg-user/2012-May/006641.html
*/

var page = require('webpage').create(),
	system = require('system'),
	url = system.args[1],
	id = system.args[2],
	out = system.args[3] || 'PNG',
	duration = parseInt(system.args[4]) || 0,
	width = parseInt(system.args[5]) || 800,
	height = parseInt(system.args[6]) || 600,
	rate = parseInt(system.args[7]) || 25,
	frames = (duration) ? duration * rate : 1,
	currFrame = 0, files = [];

if(!url || !id){
	phantom.exit(1);
}

page.clipRect = { top: 0, left: 0, width: width, height: height};
page.viewportSize = { width: width, height: height};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    system.stderr.write(JSON.stringify({errors: trace}));
};

page.open(url, function(status) {

	var dirPath = './tmp/' + id, fileName;

	if(status !== 'success'){
		return phantom.exit(1);
	}

	setTimeout(function(){

		setInterval(function(){

			if( currFrame === frames ){
	            phantom.exit(0);
	        }

	        fileName = '_' + currFrame + '.' + out;
	        path = dirPath + '/' + fileName;
	        page.render(path);
	        files.push({
       			name: fileName,
       			path: path,
       			dir: dirPath
	       	});

	        currFrame++;

	       	system.stdout.write(JSON.stringify({
	       		complete: currFrame,
	       		total: frames,
	       		files: files,
	       		id: id
	       	}));

	    }, 1000/rate);

	}, 1000);

});