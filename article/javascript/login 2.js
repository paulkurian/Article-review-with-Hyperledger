var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const {google} = require('googleapis');
const OAuth2 =google.auth.OAuth2;
var plus = google.plus('v1');
const ClientId = "527034111921-kjvg4peji2gbjgs0pvkiefl3ou3s505t.apps.googleusercontent.com";
const ClientSecret = "8i6_y9FGrIttCYHbvk6_KXSz";
const RedirectionUrl = "http://localhost:3000/home";

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'nodelogin'
});


// connection.connect(function(err) {

// if (err) throw err;
// connection.query("SELECT * FROM ACCOUNTS",function(err, result, fields){
// if (err) throw err;
// console.log(result);
// connection.end();
// });
// });



var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}

function getAuthUrl () {
    var oauth2Client = getOAuthClient();
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/plus.me',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt:'consent',
        scope: scopes // If you only need one scope you can pass it as string
    });

    return url;
}

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));



app.get('/', function(request, response) {
	var url = getAuthUrl();
	response.render('login',{obj:url})

});

// app.get('/test', function(request, response) {
// 	if (request.session.loggedin) {
// 		response.sendFile(path.join(__dirname + '/test.html'));

// 		//response.send('Welcome back, ' + request.session.username + '!');
// 	} else {
// 		//response.send('Please login to view this page!');
// 	}
// 	response.end();
// });

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});


app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/addarticle', function(request, response) {
	response.sendFile(path.join(__dirname + '/AddArticle.html'));
});


app.post('/register', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	console.log(email)

	if (username && password && email) {

		connection.query('INSERT INTO `accounts` (`username`, `password`, `email`) VALUES (?, ?, ?);', [username, password,email], function(error, results, fields) {
			console.log(results.length)
			if (results) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Please enter valid data VALUES');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



app.post('/addarticle', function(request, response) {
	var url = request.body.username;
	var author = request.body.password;
	var publisher = request.body.email;
	console.log(email)

	if (username && password && email) {

		connection.query('INSERT INTO `accounts` (`username`, `password`, `email`) VALUES (?, ?, ?);', [username, password,email], function(error, results, fields) {
			console.log(results.length)
			if (results) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Please enter valid data VALUES');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;

	console.log(username)

	if (username && password) {
		
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			console.log(results)
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

var obj = [{ first: "John" ,
			last: "Doe" },

			{first:"paul",
			 last:"kurian"},

			{first:"Aditya",
			last:"Singh" }]



app.post('/pow', function(request, response) {
	var url = request.body.test.name;
	//var author = request.body.password;
	//var publisher = request.body.email;
	console.log(url)
// 	$(document).ready(function(){
//   	$("button").click(function(){
//     alert("Value: " + $("#test").val());
//   });
// });

});

app.get('/home', function(req, res) {
	var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code;
    console.log(code)
    oauth2Client.getToken(code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
      	//const data = oauth2Client.getToken(code);
      	//console.log(data.toString())
      	
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;

        //const me =  plus.people.get({ userId: 'me' });
        //const userGoogleId = me.data.id;
  		//const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
        var p = new Promise(function (resolve, reject) {
        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
            resolve(response || err);
        });
        }).then(function (Gobj) {

        	console.log(Gobj.data.emails[0].value)
        	email=Gobj.data.emails[0].value;
        	res.send(`
            <h3> Hello ${email} </h3>
        `);
        })

      }
      else{
        res.send(`
            <h1> login failed </h1>
        `);
      }
    });
});

app.listen(3000);






