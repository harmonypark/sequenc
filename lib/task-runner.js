var spawn = require('child_process').spawn,
	procs = {};

exports = module.exports = {
	create: function( options ){
		var proc = spawn('echo', ['hello world!']);
		procs[proc.pid] = proc;
		return proc;
	},
	destroy: function( id ){

	},
	get: function( id ){
		return procs[id];
	}
};

// renderer = spawn(
//     './node_modules/slimerjs-0.8.2/slimerjs',
//     ['./scripts/frame-render.js', 'http://localhost:9000/embed.html', '.tmp/', 5]
// 	);

// renderer.on('exit', function(code){
// 	ffmpeg = spawn('ffmpeg',['-r', '25', '-i', './tmp/frame%d.png', '-y', '-r', '25', 'test.gif']);
// 	ffmpeg.on('exit', function(){
// 		console.log('done')
// 	})
// });