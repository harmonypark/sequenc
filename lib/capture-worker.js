var http = require('http'),
	phantomjs = require('phantomjs'),
	spawn = require('child_process').spawn,
  	fs = require('fs'),
  	renderer,
  	ffmpeg;

renderer = spawn(
    './node_modules/slimerjs-0.8.2/slimerjs',
    ['./scripts/frame-render.js', 'http://localhost:9000/embed.html', '.tmp/', 5]
	);

renderer.on('exit', function(code){
	ffmpeg = spawn('ffmpeg',['-r', '25', '-i', './tmp/frame%d.png', '-y', '-r', '25', 'test.gif']);
	ffmpeg.on('exit', function(){
		console.log('done')
	})
});