var pg = require('pg');
var connectionString = 'postgres://postgres:postgres@localhost:5433/infinity_student_db';
var redis = require('redis');
var client = new pg.Client(connectionString);
client.connect();

var subscriber = redis.createClient(6379, 'localhost' , {no_ready_check: true});
subscriber.on('connect', function() {
    console.log('Connected to Subscriber Redis');
});

var publisher = redis.createClient(6379, 'localhost' , {no_ready_check: true});
publisher.on('connect', function() {
     console.log('Connected to Publisher Redis');
 });



exports.addStudent = function(req, res, callback)
{
console.log('Connected to database');
console.log(req.body.sid);
var query = client.query("insert into ms_student_tbl values($1, $2, $3, $4, $5, $6, $7)", [req.body.sid, req.body.fname, req.body.lname, req.body.phno, req.body.degree, req.body.year, req.body.address], function(err)
{
if(err)
 {
  console.log('Student already exists.');
  res.status(409);
 }
 else
 {
 	query.on('end', function(error, result) {
     if(error){
     res.status(500);	
      }

//No error
else{
	res.status(200);
	console.log("Successfully added student.");
    }    
 });
 }
 callback(res);
});
}

exports.addCoursetoStudent = function(req,res,callback)
{
var lname = req.body.lname;
var courseno = req.body.courseno;

var queryForCheckingExistenceOfPair = client.query("select * from ms_student_course_tbl where courseno = $1 and lname = $2", [courseno, lname], function(err, result){
rowCount = result.rows.length;
if(rowCount == 0)
{
var query = client.query("insert into ms_student_course_tbl values($1, $2)", [lname,courseno], function(err)
{
	if(err)
	{
	console.log('Trying to add course to a student that does not exist');
    res.status(417);
	}
	else
	{
		query.on('end', function(error, result) {

			if(error)
			{
				res.status(500);
			}
			else
			{
				res.status(200);
				console.log("Row successfully inserted");
					message =   {
	                      "origin":"student" ,
	                      "event":"course_added_to_student",
												"lname" : lname,
												"courseno" : courseno
	                  };
	         console.log(typeof(message.origin));
	         publisher.publish('RI', JSON.stringify(message));
			}
			

});
	}

callback(res);

});
}
});
}


exports.getStudentDetails = function(req,res,callback)
{
var course_nos = [];
var responseJson;
console.log('Connected to database');
console.log(req.params.student_id);
var flag = false;


var query = client.query("Select * from ms_student_tbl left outer join ms_student_course_tbl on (ms_student_tbl.lname = ms_student_course_tbl.lname) where ms_student_tbl.lname= $1", [req.params.student_id]);
query.on('row', function(row) {
	flag = true;
	console.log(row.courseno);
	course_nos.push(row.courseno);
	responseJson = "{'fname':"+ row.fname + ", 'lname':" + req.params.student_id + ", 'sid':"+ row.sid + ", 'phno' :" + row.phno + ", 'degree_level':" + row.degree_level + ", 'year' :" + row.year + ", 'address':" + row.address + ", 'course_nos': " + course_nos + "}";
  });
query.on('end', function(result){

	if(flag)
	{
	console.log(responseJson);
	res.json(responseJson);
    }
    else
    {
     res.json({message:'Student does not exist'});
    }
	callback(res);
});
}



exports.updateStudent = function(req,res,callback)
{

var queryString= 'update ms_student_tbl set ';
var student_lname = req.params.student_id;

for (var key in req.body) {
  if (req.body.hasOwnProperty(key)) {
    console.log(key + " -> " + req.body[key]);
    queryString = queryString  + key + ' = ' + "'"+req.body[key] + "'" + ',';

  }
}
queryString = queryString.substring(0, queryString.length - 1);
queryString = queryString + ' where lname = $1';

console.log(queryString);

var query = client.query(queryString, [student_lname], function(err)
{
  if(err)
  {
  console.log('error');
  res.status(400);
  callback(res); 
  }
  else
  {
  	query.on('end', function(result) {

  		console.log("rowcount" + result.rowCount);

if(result.rowCount == 0)
{
	res.status(417);
	callback(res);
}

//No error
else{
	res.status(200);	
	console.log("Row successfully updated");
	callback(res);
   }	
	//client.end();
});
}
});

}



exports.deleteStudent = function(req, res, callback)
{

	console.log('Connected to database to delete student');

	var student_lname = req.params.student_id;

	var queryForStudentDatabase = 'Delete from ms_student_tbl where lname = $1';

	var queryForRelationshipDatabase =  'Delete from ms_student_course_tbl where lname = $1';

	var query = client.query(queryForRelationshipDatabase, [student_lname]);
	query.on('end', function(result) {
    console.log("Deleted from relationship");
	var relationshipDeleteQuery = client.query(queryForStudentDatabase, [student_lname]);
	relationshipDeleteQuery.on('end', function(result) {
		if(result.rowCount == 0)
		{
			res.status(417);
		}
		else
		{
			res.status(200);
			 console.log("Deleted from student table");
		message =   {
										"origin":"student" ,
										"event":"student_removed_from_all",
										"lname" : student_lname,
										"courseno" : "All"
								};
			 console.log(typeof(message.origin));
			 publisher.publish('RI', JSON.stringify(message));
	         console.log("Row successfully deleted");
		} 
		callback(res);
});
});
}



exports.deleteCourseFromStudent = function(req)
{

var courseno = req.params.course_id;
var lname = req.params.student_id;
var queryForCourseStudentDatabase;
var query;

var queryForCheckingExistenceOfPair;


if(lname == 'All')
{
    queryForCheckingExistenceOfPair = client.query("select * from ms_student_course_tbl where courseno = $1 limit 1", [courseno]);
    queryForCheckingExistenceOfPair.on('row', function(row){

    queryForCourseStudentDatabase = 'Delete from ms_student_course_tbl where courseno = $1';
    query = client.query(queryForCourseStudentDatabase, [courseno]);

	query.on('end', function(result) {

		message =   {
										"origin":"student" ,
										"event":"course_removed_from_student",
										"lname" : lname,
										"courseno" : courseno
								};
			 console.log(typeof(message.origin));
			 publisher.publish('RI', JSON.stringify(message));
	console.log("Row successfully deleted");
	//client.end();
});
});
}
else
{
	queryForCheckingExistenceOfPair = client.query("select * from ms_student_course_tbl where courseno = $1 and lname = $2", [courseno, lname]);
	    queryForCheckingExistenceOfPair.on('row', function(row){

    queryForCourseStudentDatabase = 'Delete from ms_student_course_tbl where courseno = $1';
    query = client.query(queryForCourseStudentDatabase, [courseno]);

	query.on('end', function(result) {

		message =   {
										"origin":"student" ,
										"event":"course_removed_from_student",
										"lname" : lname,
										"courseno" : courseno
								};
			 console.log(typeof(message.origin));
			 publisher.publish('RI', JSON.stringify(message));
	console.log("Row successfully deleted");
	//client.end();
});
});
}
}
