/*
*
*/

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
var async = require('async');
var url = require('url');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req,res) {
  var queryData = url.parse(req.url, true).query;
  console.log(req.url);
  invokeandProcessResponse(req ,null, function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });

});

var invokeandProcessResponse = function(req, callback){
  var instancetoRouteTo;
  var reqMethod;
  var bodyParameters;
  console.log(req.body);
  console.log(JSON.stringify(req.body));
  if(req.method == 'GET')
  {
    if(req.url.split('/')[1] == "student")
    {
      instanceToRouteTo = 'http://localhost:16385/api';
      instanceToRouteTo += req.url;
    }
    else if (req.url.split('/')[1] == "course")
    {
      instanceToRouteTo = 'http://localhost:16390/api';
      instanceToRouteTo += req.url;
    }
    reqMethod = "GET";
    bodyParameters = "";
  }
  else if(req.method == 'POST')
  {

    if(req.url.split('/')[1] == "student")
    {
      instanceToRouteTo = 'http://localhost:16385/api';
      instanceToRouteTo += req.url;
    }
    else if(req.url.split('/')[1] == "course")
    {
      instanceToRouteTo = 'http://localhost:16390/api';
      instanceToRouteTo += req.url;
    }
    reqMethod = req.method;
    bodyParameters = req.body;
  }
  else if (req.method == 'PUT')
  {
    if(req.url.split('/')[1] == "student")
    {
      instanceToRouteTo = 'http://localhost:16385/api';
      instanceToRouteTo += req.url;
    }
    else if(req.url.split('/')[1] == "course")
    {
      instanceToRouteTo = 'http://localhost:16390/api';
      instanceToRouteTo += req.url;
    }

    reqMethod = req.method;
    bodyParameters = req.body;
  }
  else if(req.method == 'DELETE')
  {
    if(req.url.split('/')[1] == "student")
    {
      instanceToRouteTo = 'http://localhost:16385/api';
      instanceToRouteTo += req.url;
    }
    else if(req.url.split('/')[1] == "course")
    {
      instanceToRouteTo = 'http://localhost:16390/api';
      instanceToRouteTo += req.url;
    }
    reqMethod = "DELETE";
    bodyParameters = req.body;
  }
  console.log('Sending ' +req.method+ ' request to ' + instanceToRouteTo);
  request({ url : instanceToRouteTo,
    method : req.method,
    json : bodyParameters
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, response.body);
    } else {
      callback(error);
    }
  })
}
// more routes for our API will happen here


/************************************************************
*
* Student API Endpoints
*
*************************************************************/


//API endpoint to add student to the students table
router.route('/student')

// create a new student (accessed at POST http://localhost:8080/api/student)
.post(function(req, res) {


  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });

  // res.json({ message: 'Student created!' });
  //Logic to save the student to db

});



//API end point to get student details (accessed at POST http://localhost:8080/api/student/id)
router.route('/student/:student_id')

// get the student with that id (accessed at GET http://localhost:8080/api/student/:student_id)
.get(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });


})

// update the student with this id (accessed at PUT http://localhost:8080/api/student/:student_id)
.put(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });

})


.delete(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });

});

//API end point to get student details (accessed at POST http://localhost:8080/api/student/id)
router.route('/student/:student_id/courses')

// get the student with that id (accessed at GET http://localhost:8080/api/student/:student_id)
.get(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
});
//API end point to get student details (accessed at POST http://localhost:8080/api/student/id)
router.route('/student/:student_id/course/:course_id')

// get the student with that id (accessed at GET http://localhost:8080/api/student/:student_id)
.get(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
});

/************************************************************
*
* Course API Endpoints
*
*************************************************************/

//API endpoint to add student to the students table
router.route('/course')

// create a new course (accessed at POST http://localhost:8080/api/course)
.post(function(req, res) {
  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
  //  res.json({ message: 'Course created!' });
  //Logic to save the student to db

});



//API end point to get course details (accessed at POST http://localhost:8080/api/course/id)
router.route('/course/:course_id')

// get the student with that id (accessed at GET http://localhost:8080/api/course/:course_id)
.get(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });

})


// update the student with this id (accessed at PUT http://localhost:8080/api/course/:course_id)
.put(function(req, res) {
  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
  res.json({ message: 'Course updated!' });

})

.delete(function(req, res) {
  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
  res.json({ message: 'Course updated!' });

});


//API end point to get student details (accessed at POST http://localhost:8080/api/student/id)
router.route('/course/:course_id/students')

// get the student with that id (accessed at GET http://localhost:8080/api/student/:student_id)
.get(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
});
//API end point to get student details (accessed at POST http://localhost:8080/api/student/id)
router.route('/course/:course_id/student/:student_id')

// get the student with that id (accessed at GET http://localhost:8080/api/student/:student_id)
.get(function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
