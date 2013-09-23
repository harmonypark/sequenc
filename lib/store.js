'use strict';

var knox = require('knox'),
	s3Client;

try {

	s3Client = knox.createClient({
		key: process.env.AWS_ACCESS_KEY_ID,
		secret: process.env.AWS_ACCESS_SECRET_KEY,
		bucket: process.env.AWS_S3_BUCKET
	});

} catch(err){

	console.error( err );

}

module.exports = {
	S3: s3Client
};