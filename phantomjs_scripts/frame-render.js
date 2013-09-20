/*
* https://groups.google.com/forum/#!msg/phantomjs/wluVGGjhL90/oGBXqh7QP44J
* https://lists.ffmpeg.org/pipermail/ffmpeg-user/2012-May/006641.html
*/

var page = require('webpage').create(),
	system = require('system'),
	// waitFor = require('../lib/waitfor'),
	url = system.args[1],
	duration = system.args[2] || 1,
	dirPrefix = system.args[3],
	width = system.args[4] || 800,
	height = system.args[5] || 600,
	frameRate = 25,
	frames = duration * frameRate,
	currFrame = 0,
	resources = [],
	input;

page.clipRect = { top: 0, left: 0, width: width, height: height};
page.viewportSize = { width: width, height: height};


page.open(url, function(status) {

	if(status !== 'success'){
		system.stderr.write('Failed to open ' + url);
		phantom.exit(1);
	}

	setTimeout(function(){
		setInterval(function(){
	        page.render('./tmp/' + dirPrefix + '/' + '_' + currFrame + '.png');
	        if( currFrame == frames ){
	            phantom.exit(0);
	        }
	        currFrame++;
	    }, 1000/frameRate);
	}, 1000);
});