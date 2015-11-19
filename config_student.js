var pg = require('pg');
var connectionString = 'postgres://postgres:postgres@localhost:5432/infinity_student_db';
//var redis = require('redis');
var client = new pg.Client(connectionString);
client.connect();




exports.addColumn = function(req,res,callback){

var column_name = req.body.column_name;

var column_type = req.body.column_type;

var table_name = req.params.tableName;


var query = client.query("Alter Table " + table_name + " Add Column " + column_name + " " + column_type, function(err){

if(err){
	console.log(err);
res.status(500);
}
else{
res.status(200);
}

});

query.on('end', function(result,err) {
	//client.end();
if(!err)
{
callback(res);
}

});

}

exports.deleteColumn = function(req,res,callback){

var column_name = req.body.column_name;

var table_name = req.params.tableName;


var query = client.query("Alter Table " + table_name + " drop Column " + column_name , function(err){

if(err){
	console.log(err);
res.status(500);
}
else{
res.status(200);
}

});

query.on('end', function(result,err) {
	//client.end();
if(!err)
{
callback(res);
}

});

}
