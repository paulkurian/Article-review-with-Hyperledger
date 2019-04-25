var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'nodelogin'
});


connection.connect(function(err) {
if (err) throw err;
connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', ["test", "test"],function(err, result, fields){
	if (err) throw err;
    console.log(result.length);
    connection.end();
});
});