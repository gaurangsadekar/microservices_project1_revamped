var pg = require('pg');
var connectionString = 'postgres://postgres:postgres@localhost:5432/infinity_student_db';
//var redis = require('redis');
var client = new pg.Client(connectionString);
client.connect();




exports.addColumn = function(req){	
console.log('Method Called');

var column_name = req.body.column_name;

var column_type = req.body.column_type;

var tableName = req.params.tableName;


var query = client.query("Alter Table "+ tableName + " Add Column " + column_name + " " + column_type, function(err){
if(err){
res.status(500);
}
else{
res.status(200);
}

});

query.on('end', function(result, err) {

callback(res);

});

}