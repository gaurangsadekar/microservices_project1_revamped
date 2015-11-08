var pg = require('pg');
var connectionString = 'postgres://postgres:postgres@localhost:5432/infinity_student_db';
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



exports.addStudent = function(req)
{
console.log('Connected to database');
console.log(req.body.sid);
var query = client.query("insert into ms_student_tbl values($1, $2, $3, $4, $5, $6, $7)", [req.body.sid, req.body.fname, req.body.lname, req.body.phno, req.body.degree, req.body.year, req.body.address]);
query.on('end', function(result) {
console.log("Row successfully inserted");
});
}

exports.addCoursetoStudent = function(req)
{

var lname = req.body.lname;
var courseno = req.body.courseno;


var queryForCheckingExistenceOfPair = client.query("select * from ms_student_course_tbl where courseno = $1 and lname = $2", [courseno, lname], function(err, result){
rowCount = result.rows.length;
if(rowCount == 0)
{
var query = client.query("insert into ms_student_course_tbl values($1, $2)", [lname,courseno]);
query.on('end', function(result) {
				message =   {
	                      "origin":"student" ,
	                      "event":"course_added_to_student",
												"lname" : lname,
												"courseno" : courseno
	                  };
	         console.log(typeof(message.origin));
	         publisher.publish('RI', JSON.stringify(message));
console.log("Row successfully inserted");
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
var query = client.query("Select * from ms_student_tbl left outer join ms_student_course_tbl on (ms_student_tbl.lname = ms_student_course_tbl.lname) where ms_student_tbl.lname= $1", [req.params.student_id]);
query.on('row', function(row) {
	console.log(row.courseno);
	console.log(str);
	course_nos.push(row.courseno);
	responseJson = "{'fname':"+ row.fname + ", 'lname':" + req.params.student_id + ", 'sid':"+ row.sid + ", 'phno' :" + row.phno + ", 'degree_level':" + row.degree_level + ", 'year' :" + row.year + ", 'address':" + row.address + ", 'course_nos': " + course_nos + "}";
  });
query.on('end', function(result){
	console.log(responseJson);
	res.json(responseJson);
	callback(res);
});
}



exports.updateStudent = function(req)
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

var query = client.query(queryString, [student_lname]);
query.on('end', function(result) {
console.log("Row successfully updated");
	//client.end();
});
}


exports.deleteStudent = function(req)
{

	console.log('Connected to database to delete student');

	var student_lname = req.params.student_id;

	var queryForStudentDatabase = 'Delete from ms_student_tbl where lname = $1';

	var queryForRelationshipDatabase =  'Delete from ms_student_course_tbl where lname = $1';

	var query = client.query(queryForRelationshipDatabase, [student_lname]);
	query.on('end', function(result) {
	console.log("Row successfully deleted");


	var relationshipDeleteQuery = client.query(queryForStudentDatabase, [student_lname]);
	query.on('end', function(result) {
		message =   {
										"origin":"student" ,
										"event":"student_removed_from_all",
										"lname" : lname,
										"courseno" : "all"
								};
			 console.log(typeof(message.origin));
			 publisher.publish('RI', JSON.stringify(message));

	console.log("Row successfully deleted");
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


if(lname == 'all')
{
    queryForCheckingExistenceOfPair = client.query("select * from ms_student_course_tbl where courseno = $1", [courseno]);
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