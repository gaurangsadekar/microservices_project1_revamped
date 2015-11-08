var pg = require('pg');
var connectionString = 'postgres://postgres:postgres@localhost:5432/infinity_student_db';
//var redis = require('redis');
var client = new pg.Client(connectionString);
client.connect();




exports.addColumn = function(req){	
console.log('Method Called');

var column_name = req.body.column_name;

var column_type = req.body.column_name;


var query = client.query("Alter Table ms_student_tbl Add Column " + column_name + " " + column_type);

query.on('end', function(result) {
console.log("Row successfully inserted");
	//client.end();
});

}