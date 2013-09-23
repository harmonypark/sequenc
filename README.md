Sequenc
=======

Sequenc is a Node.js application dedicated to run jobs that take long to execute. Whether you need to convert a video or crawl handful of webpages and expect results to arrive later Sequenc to the rescue! 

Currently website capture and conversion process which uses PhantomJs and ffmpeg is the only job processor that is implemented. It can capture arbitary url as a static image or video.

## Installing

### Requirements

* [Node.js](http://nodejs.org) >= 0.10.0
* [Phantomjs](http://phantomjs.org/) >= 1.9.2
* [ffmpeg](http://www.ffmpeg.org/)
* AWS S3 credentials and bucket to store job results

### Dev requirements

* [Grunt](http://gruntjs.com/)

### Local setup

* `npm install` to install package dependancies
* Sequenc expects to find exported `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET_KEY`, `AWS_S3_BUCKET` env variables in order to upload job results to S3
* `node index.js` to start the app or `grunt server` to run it via [nodemon](https://github.com/remy/nodemon)

### Heroku setup
* Create an app on heroku
* `git remote add heroku https://yourapp.herokuapp...`
* This app uses .buildpacks file to get all dependacies on heroku, add buildpack-multi to your app: `heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git`
* Set all required env variables on heroku like `heroku config:set NODE_ENV=production`
* `git push heroku master` to deploy

## Using

### Procs

Processes to digest your jobs lie in `./procs/`. More info to come...

### REST JSON API

#### POST /jobs

Create a job:

    $ curl -H "Content-Type: application/json" -X POST -d \
      '{
        "uri": "http://mashable.com",
        "type": "capture",
        "height": 1200,
        "duration": 3,
        "format": "gif"
      }' http://localhost:3000/jobs
         
         
Response:

    {
      "state": "inactive",
      "message": "job accepted",
      "id": 1,
      "_links": [
          {
              "self": {
                  "href": "http://localhost:3000/jobs/1"
              }
          }
      ]
    }

Querying "self" link will get you status of the job:

    {
      "id": "1",
      "type": "capture",
      "input": {
          "uri": "http://mashable.com",
          "type": "capture",
          "height": 1200,
          "duration": 3,
          "format": "gif"
      },
      "priority": 0,
      "progress": "12",
      "state": "active",
      "created_at": "1379954952350",
      "updated_at": "1379954955490",
      "attempts": {
          "remaining": null
      }
    }
    
Once job is complete it will redirect you to /jobs/:id/output which will attempt to serve job results (from file locally or via redirect to a file stored on S3)
      




