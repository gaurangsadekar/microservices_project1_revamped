// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
var redis = require('redis');
var config = require('./config_student.json');
var arr = Object.keys(config).map(function(k) { return config[k] });
var pg = require('pg');
var connectionString = 'postgres://postgres:postgres@localhost:5432/infinity_rules_db';
var client = new pg.Client(connectionString);
client.connect();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 16385;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// middle-ware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {

  invokeandProcessResponse(req , function(err, result){
    if(err){
      res.send(500, { error: 'something blew up' });
    } else {
      res.send(result);
    }
  });
});



var invokeandProcessResponse = function(req, callback){
  var query = client.query("select * from tbl_rules");
  var rows = [];
  query.on('row', function(row) {
    rows.push(row);
    console.log(row);
    console.log("Row successfully retrieved.");
  });
  query.on('end', function(res){
    console.log(rows[0]);
    var instanceToRouteTo;
    console.log(req.method);
    var firstCharacterString, firstCharacter;
    var reqMethod;
    var bodyParameters;

    reqMethod = req.method;
    bodyParameters = req.body;
    if(req.method == "POST" )
    {
      firstCharacterString = bodyParameters['lastname'];

    }
    else if (req.method == "GET" || req.method == "PUT" || req.method == "DELETE")
    {
      firstCharacterString = req.url.split('/')[2];
    }

    firstCharacter = firstCharacterString[0];
    console.log(firstCharacter);
    if(firstCharacter >= 'A' && firstCharacter <= 'F')
    {
      instanceToRouteTo = rows[0].instancetorouteto;
      instanceToRouteTo += req.url;
    }
    else if (firstCharacter >= "G" && firstCharacter <= 'Q')
    {
      instanceToRouteTo = rows[1].instancetorouteto;
      instanceToRouteTo += req.url;
    }
    else if (firstCharacter >= 'R' && firstCharacter <= 'Z')	{
      instanceToRouteTo = rows[2].instancetorouteto;
      instanceToRouteTo += req.url;
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
  });
}
  // m


// more routes for our API will happen here
router.route('/studentRouter/:ruleId')

// create a new student (accessed at POST http://localhost:8080/api/student)
.put(function(req, res) {
  console.log("Updating " + req.body['instanceurl'] + " with rule id " + req.url.split('/')[2]);
    var query = client.query("update tbl_rules set instancetorouteto=$1 where ruleid=$2", [req.body['instanceurl'],req.url.split('/')[2]]);
    query.on('end', function(result) {
        console.log("Updated " + req.body['instanceurl'] + " with rule id " + req.url.split('/')[2]);
          res.json({message : 'Updated'});
    });


  //     res.json({ message: 'Student created!' });
  //Logic to save the student to db

});

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

// API endpoint for getting courses of a particular student
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


//API end point to get student details (accessed at POST http://localhost:8080/api/student/id)


var subscriber = redis.createClient(6379, 'localhost' , {no_ready_check: true});

subscriber.on('connect', function() {
    console.log('Connected to Subscriber Redis');
});

var publisher = redis.createClient(6379, 'localhost' , {no_ready_check: true});
publisher.on('connect', function() {
    console.log('Connected to Publisher Redis');
});

subscriber.on("message", function(channel, message) {
  console.log("Message '" + message + "' on channel '" + channel + "' arrived!")
  var parsedMessage = JSON.parse(message);
  console.log(parsedMessage);
  //message event, origin, studentname and coursename
  var messageEvent = parsedMessage.event;
  var messageOrigin = parsedMessage.origin;
  var lname = parsedMessage.lname;
  var courseno = parsedMessage.courseno;
  var url;
  for(var key in arr){
		if(messageEvent == arr[key].event){
      console.log("Event:" + arr[key].event);
      if (arr[key].req_method == "DELETE") {
        console.log(arr[key].req_method);
        url = arr[key].publicurl + "/" + courseno + "/" + lname;
      }
      else {
        url = arr[key].publicurl;
      }
      request( { url : url,
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

//subscriber.subscribe("student");
