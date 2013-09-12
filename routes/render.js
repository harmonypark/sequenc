'use strict';
module.exports  = function( app ){
	app.get('/api/render', function(req, res, next){

	});

	app.post('/api/render', function(req, res, next){
		res.send(201, 'created');
	});

	app.put('/api/render/:id', function(req, res, next){

	});
};