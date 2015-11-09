// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var course = require('./course.js');
var redis = require('redis');
var request = require('request');

var config = require('./config_course.json');
var arr = Object.keys(config).map(function(k) { return config[k] });

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 16390;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// middle-ware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:16390/api)
router.get('/', function(req, res) {
   // Checking Course Instance
	 res.json({ message: 'Welcome to our Course api!!' });
});

// more routes for our API will happen here



/************************************************************
*
* Course API Endpoints
*
*************************************************************/

//API endpoint to add student to the students table
router.route('/course')

    // create a new course (accessed at POST http://localhost:16390/api/course)
    .post(function(req, res) {
      course.addCourse(req, res, handleResult);
      function handleResult(response)
        {
          console.log('Callback received');
          console.log("Status code " +response.statusCode);
          if(response.statusCode == 200){
            console.log('200');
            res.status(200);
            res.json({ message: 'Course added!'});

          }

          else if(response.statusCode == 500){
            console.log('500');
            res.status(500);
            res.json({ message: 'Internal Server Error!'});

          }
           else if(response.statusCode == 409){
            console.log('409');
            res.status(409);
            res.json({ message: 'Course already exists.'});

          }
        }
    });



//API end point to get course details (accessed at POST http://localhost:16390/api/course/id)

router.route('/course/:course_id')

    // get the student with that id (accessed at GET http://localhost:16390/api/course/:course_id)
    .get(function(req, res) {

        course.getCourseDetails(req,res,handleResult);
        function handleResult(response, err)
        {
            if(err)
            {
                console.error(err.stack || err.message);
                return;
            }
            res.json(response.body);
           console.log("Request handled");
        }// Logic to show course details
    })
	// update the student with this id (accessed at PUT http://localhost:16390/api/course/:course_id)
    .put(function(req, res) {
    	//Logic to update student details
      course.updateCourse(req, res, handleResult);
      function handleResult(response)
        {
          console.log('Callback received');
          console.log("Status code " +response.statusCode);
          if(response.statusCode == 200){
            console.log('200');
            res.status(200);
            res.json({ message: 'Course updated!'});

          }

          else if(response.statusCode == 500){
            console.log('500');
            res.status(500);
            res.json({ message: 'Internal Server Error!'});

          }
           else if(response.statusCode == 400){
            console.log('400');
            res.status(400);
            res.json({ message: 'Bad request. Please check body parameters.'});

          }
            else if(response.statusCode == 417){
            console.log('417');
            res.status(417);
            res.json({ message: 'Updating a course that does not exist'});
          }
        }
    })

    .delete(function(req, res) {
    	//Logic to upadte student details

      course.deleteCourse(req, res, handleResult);
    	 function handleResult(response)
        {
          console.log('Callback received');
          console.log(response);
          console.log("Status code " +response.statusCode);
          if(response.statusCode == 200){
            console.log('200');
            res.status(200);
            res.json({ message: 'Successfully deleted course'});

          }

          else if(response.statusCode == 500){
            console.log('500');
            res.status(500);
            res.json({ message: 'Internal Server Error!'});

          }
           else if(response.statusCode == 417){
            console.log('417');
            res.status(417);
            res.json({ message: 'Expectation Failed. Deleting a course that does not exist'});

          }
        }

    });


router.route('/course/:course_id/student')

   .post(function(req, res) {
     course.addStudentToCourse(req,res,handleResult);
         function handleResult(response)
        {
          console.log('Callback received');
          console.log(response);
          console.log("Status code " +response.statusCode);
          if(response.statusCode == 200){
            console.log('200');
            res.status(200);
            res.json({ message: 'Course added!'});

          }

          else if(response.statusCode == 500){
            console.log('500');
            res.status(500);
            res.json({ message: 'Internal Server Error!'});

          }
           else if(response.statusCode == 417){
            console.log('417');
            res.status(417);
            res.json({ message: 'Expectation Failed. Adding Student to Course that does not exist.'});

          }
        }

    //API end point to get student details (accessed at POST http://localhost:8080/api/student/id)
    router.route('/course/:course_id/student/:student_id')


    // get the student with that id (accessed at GET http://localhost:8080/api/student/:student_id)
    .delete(function(req, res) {

      course.deleteStudentFromCourse(req,res,handleResult);
     function handleResult(response)
        {
          console.log('Callback received');
          console.log(response);
          console.log("Status code " +response.statusCode);
          if(response.statusCode == 200){
            console.log('200');
            res.status(200);
            res.json({ message: 'Course updated!'});

          }

          else if(response.statusCode == 500){
            console.log('500');
            res.status(500);
            res.json({ message: 'Internal Server Error!'});

          }
           else if(response.statusCode == 417){
            console.log('417');
            res.status(417);
            res.json({ message: 'Expectation Failed. Invalid operation'});

          }
        }

    });

// Listening for RI scenes
var subscriber = redis.createClient(6379, 'localhost' , {no_ready_check: true});
subscriber.on('connect', function() {
    console.log('Connected to Subscriber Redis');
});

subscriber.on("message", function(channel, message) {
  console.log("Message '" + message + "' on channel '" + channel + "' arrived!")
  console.log(message);
  parsedMessage = JSON.parse(message);
  //message event, origin, studentname and coursename
  var messageEvent = parsedMessage.event;
  var messageOrigin = parsedMessage.origin;
  var lname = parsedMessage.lname;
  var courseno = parsedMessage.courseno;

  for(var key in arr){
		if(messageEvent == arr[key].event){
      console.log(messageEvent);
      if (arr[key].req_method == "DELETE")
        url = arr[key].publicurl + courseno + arr[key].extension + lname;
      else
        url = arr[key].publicurl + courseno + arr[key].extension;
      request({ url : url,
   		   method : arr[key].req_method,
   		   json : parsedMessage
   	}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
     console.log(response.statusCode);
    } else {
      console.log(response.statusCode);
    }
  });
}
}
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

subscriber.subscribe("course");
