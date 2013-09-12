/*
* https://groups.google.com/forum/#!msg/phantomjs/wluVGGjhL90/oGBXqh7QP44J
* https://lists.ffmpeg.org/pipermail/ffmpeg-user/2012-May/006641.html
*/

var page = require('webpage').create(),
	system = require('system'),
	// waitFor = require('../lib/waitfor'),
	url = system.args[1] || 'http://google.com',
	outputDir = system.args[2] || './tmp',
	duration = system.args[3] || 1,
	fs = require('fs'),
	frames = duration*25,
	currFrame = 0,
	width = 720,
	height = 720,
	resources = [],
	input;

page.clipRect = { top: 0, left: 0, width: width, height: height};
page.viewportSize = { width: width, height: height};


var d = page.open(url);

d.then(function() {
		setTimeout(function(){
			setInterval(function(){
   			// page.sendEvent('mousemove', Math.floor(Math.random()*width*0.1+width*0.5), Math.floor(Math.random()*height*0.1+height*0.5));
		        page.render("./tmp/frame"+currFrame+'.png');

		        if( currFrame == frames ){
		            phantom.exit();
		        }

		        currFrame++;

		    }, 1000/25);
		}, 1000);
    });
