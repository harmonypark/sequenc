/*
* https://groups.google.com/forum/#!msg/phantomjs/wluVGGjhL90/oGBXqh7QP44J
* https://lists.ffmpeg.org/pipermail/ffmpeg-user/2012-May/006641.html
*/

var page = require('webpage').create(),
	system = require('system'),
	url = system.args[1],
	duration = parseInt(system.args[2]) || 0,
	dirPrefix = system.args[3],
	width = parseInt(system.args[4]) || 800,
	height = parseInt(system.args[5]) || 600,
	outFormat = system.args[6] || 'PNG',
	frameRate = parseInt(system.args[7]) || 25,
	frames = (duration) ? duration * frameRate : 1,
	currFrame = 0;

page.clipRect = { top: 0, left: 0, width: width, height: height};
page.viewportSize = { width: width, height: height};

page.open(url, function(status) {

	if(status !== 'success'){
		system.stderr.write('Failed to open ' + url);
		return phantom.exit(1);
	}

	setTimeout(function(){
		setInterval(function(){
			if( currFrame === frames ){
	            return phantom.exit(0);
	        }
	        page.render('./tmp/' + dirPrefix + '/' + '_' + currFrame + '.' + outFormat);
	        currFrame++;
	    }, 1000/frameRate);

	}, 1000);
});