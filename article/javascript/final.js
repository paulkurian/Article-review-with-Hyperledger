var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var md5 = require('js-md5');
const {google} = require('googleapis');
const OAuth2 =google.auth.OAuth2;
var plus = google.plus('v1');
const ClientId = "527034111921-kjvg4peji2gbjgs0pvkiefl3ou3s505t.apps.googleusercontent.com";
const ClientSecret = "8i6_y9FGrIttCYHbvk6_KXSz";
const RedirectionUrl = "http://localhost:3000/interm";

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'nodelogin'
});
'use strict';

const articles= [
	{id: 1, url: "Edict", Author: "Paul", Publisher: "The Edict"},
	{id: 2, url: "NY", Author: "Aditya", Publisher: "The New York Times"},
	{id: 3, url: "WSJ", Author: "Deva", Publisher: "Wall Street Journal"},
	{id: 4, url: "TWP", Author: "Mahavir Jhawar", Publisher: "The Washington Post"},
];

const admin = ["paul.kurian_ug19@ashoka.edu.in","aditya.singh_ug19@ashoka.edu.in"];
var registered_users = new Set();
var no_of_votes=0;


function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

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

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

var votedFor = {}

var $;
$ = require('jquery');

async function query(args) {
	const { FileSystemWallet, Gateway } = require('fabric-network');
	const fs = require('fs');


	const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
	const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
	const ccp = JSON.parse(ccpJSON);
		try {
		
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = new FileSystemWallet(walletPath);
		//console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists(args[0]);
		if (!userExists) {
		    console.log('An identity for the user '+args[0]+' does not exist in the wallet');
		    console.log('Run the registerUser.js application before retrying');
		    return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: args[0], discovery: { enabled: false } });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		const contract = network.getContract('article');

		

		args.splice(0,1)
        
		var result = await contract.evaluateTransaction(...args);
		//console.log("HIquery");
		//console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
		return result;

    } catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}


async function invoke(args) {
	const { FileSystemWallet, Gateway } = require('fabric-network');
	const fs = require('fs');

	
	const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
	const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
	const ccp = JSON.parse(ccpJSON);
    try {

        
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(args[0]);
        if (!userExists) {
            console.log('An identity for the user '+ args[0] +'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: args[0], discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('article');

        args.splice(0,1)
        console.log(args)

        await contract.submitTransaction(...args);

        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
        return("Transaction was Successful")

    } catch (error) {
        return(`Failed to submit transaction: ${error}`);
  
    }
}

async function regUser(username) {
		const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
		const fs = require('fs');


		const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
		const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
		const ccp = JSON.parse(ccpJSON);

	    try {
	        
	        // Create a new file system based wallet for managing identities.
	        const walletPath = path.join(process.cwd(), 'wallet');
	        const wallet = new FileSystemWallet(walletPath);
	        console.log(`Wallet path: ${walletPath}`);

	        // Check to see if we've already enrolled the user.
	        const userExists = await wallet.exists(username);

	        if (userExists) {
	            console.log('An identity for the user "'+username+'" already exists in the wallet');
	            return;
	        }

	        // Check to see if we've already enrolled the admin user.
	        const adminExists = await wallet.exists('admin');
	        if (!adminExists) {
	            console.log('An identity for the admin user "admin" does not exist in the wallet');
	            console.log('Run the enrollAdmin.js application before retrying');
	            return;
	        }

	        // Create a new gateway for connecting to our peer node.
	        const gateway = new Gateway();
	        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

	        // Get the CA client object from the gateway for interacting with the CA.
	        const ca = gateway.getClient().getCertificateAuthority();
	        const adminIdentity = gateway.getCurrentIdentity();

	        // Register the user, enroll the user, and import the new identity into the wallet.
	        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: username, role: 'client' }, adminIdentity);
	        const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });
	        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
	        wallet.import(username, userIdentity);
	        console.log('Successfully registered and enrolled user '+username+' and imported it into the wallet');
	        registered_users.add(username);
	        
			

	    } catch(error){
	        console.error(`Failed to register user `+username+`: ${error}`);
	        process.exit(1);
	    }
	    
}



app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.get('/', function(request, response) {
	var url = getAuthUrl();
		response.render('login',{obj:url})
});

app.get('/logout', function(request, response) {
	var url = getAuthUrl();
	response.render('login',{obj:url})
});


app.get('/interm', function(request, response) {
	var oauth2Client = getOAuthClient();
    // var session = request.session;
    var code = request.query.code;
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
        // 	response.send(`
        //     <h3> Hello ${email} </h3>

        // `);
        console.log(typeof email)
        request.session.loggedin=true;
		votedFor[email]=[]
        request.session.username=email;
        regUser(request.session.username).then(function(){
				response.redirect('/welcome');	    
		}).catch(function(){
		    console.log("Error from regUser");
		    //response.render(JSON.stringify(msg));
		});
        })

    	

        


      }
      else{
        response.send(`
            <h1> login failed </h1>
        `);
      }
    });
});


app.get('/welcome', function(request, response) {
	response.render('welcome',{out: email});
});


app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/authorpub', function(request, response) {
	if (request.session.loggedin) {
	response.sendFile(path.join(__dirname + '/authorpub.html'));
	} else {
		response.redirect('/');
	}
	
});


app.post('/authorpubrcv', function(request, response) {
	var name=request.body.name;
	var authpub = request.body.authpub;
	var funcname = authpub
		args=[request.session.username,funcname,name]
	query(args).then(function(msg){
		    

		  //console.log(typeof msg+"heyt"); 
		   
		   response.render('authorscore',{obj:msg})
		   
			// }	
		 }).catch(function(msg){
		     //console.log(msg);
		     //response.render(JSON.stringify(msg));
		     response.render(msg)
		 });
	

	
});

app.post('/register', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	console.log(email)

	if (username && password && email) {

		connection.query('INSERT INTO `accounts` (`username`, `password`, `email`) VALUES (?, ?, ?);', [username, password,email], function(error, results, fields) {
			//console.log(results.length)
			if (results) {
				request.session.loggedin = true;
				request.session.username = username;
				
				regUser(username).then(function(){
					    
					}).catch(function(){
					    console.log("Error from regUser");
					    //response.render(JSON.stringify(msg));
					});

				response.redirect('/');
			} else {
				response.send('Please enter valid data VALUES');
			}			
			//response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		//response.end();
	}
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	

	
	console.log(username)
	
	

	if (username && password) {
		
			console.log("Hi")
		
		
			connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
				

				if (results.length > 0) {
					request.session.loggedin = true;
					request.session.username = username;
					votedFor[username]=[]
					 


					regUser(username).then(function(){
					    
					}).catch(function(){
					    console.log("Error from regUser");
					    //response.render(JSON.stringify(msg));
					});
					response.redirect('/home');
				} else {
					response.send('Incorrect Username and/or Password!');
				}			
				//response.end();
			});
		
	} else {
		response.send('Please enter Username and Password!');
		//response.end();
	}
});


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.get('/home', function(request, response) {



var testObj




	if (request.session.loggedin) {
		
		console.log('welcome')
		console.log(votedFor)
		var funcname = "queryAllArticles"
		args=[request.session.username,funcname]
		
		query(args).then(function(msg){
		    

		    testObj=msg.toString();
		    obj=JSON.parse(testObj)
		    var final_obj=[];
		    for(var propt in obj){
		    console.log(obj[propt].Key);
		     if (obj[propt].Record.voters.includes(md5("article"+request.session.username))){

		     	final_obj.push(obj[propt])
		     }
			}

			console.log(JSON.stringify(final_obj))





		    response.render('index',{data:final_obj})

	
		 }).catch(function(msg){
		     console.log(msg.toString());
		     response.render(JSON.stringify(msg));
		 });

		
		



	} else {
		response.send('Please login to view this page!');
	}
	
});
app.get('/worldstate', function(request, response) {



var testObj




	if (request.session.loggedin) {
		
		console.log('welcome')
		console.log(votedFor)
		var funcname = "queryAllArticles"
		args=[request.session.username,funcname]
		
		query(args).then(function(msg){
		    

		    testObj=msg.toString();
		    obj=JSON.parse(testObj)
		    console.log(testObj)
		    var json = JSON.stringify(obj);
		    var fs = require('fs');
			fs.writeFile('worldstate.json', json, 'utf8', function(err){
			    if(err) throw err;
			  });

		    response.render('worldstate', {data: obj});
		   
			

	
		 }).catch(function(msg){
		     console.log(msg.toString());
		     response.render(JSON.stringify(msg));
		 });

		
		



	} else {
		response.send('Please login to view this page!');
	}
	
});

app.post('/hometovote', function(request, response) {
 response.redirect('/vote');	
  
});



// app.get('/vote', function(request, response) {
// response.redirect('/');	
// });
// app.post('/vote', function(request, response) {

// 	var url = request.body.url
	
// 	var reliability = request.body.reliability
// 	var funcname
	

// 	if (reliability=="reliable"){
// 		funcname="voteGood"
// 	} else{
// 		funcname="voteBad"
// 	}
// 	args=[request.session.username,funcname,url,request.session.username]
// 	invoke(args).then(function(msg){
		    


		   
// 		   response.render('voted',{out:msg})
		   
	
// 		 }).catch(function(msg){

// 		     response.render('voted',{out:msg})
// 		 });

	
// });



app.get('/vote', function(request, response) {
	if (request.session.loggedin) {
	response.sendFile(path.join(__dirname + '/vote.html'));
	} else {
		response.redirect('/');
	}
});

app.post('/voted', function(request, response) {
	var url = request.body.url
	var Author = request.body.Author
	var Publisher = request.body.Publisher
	var reliability = request.body.reliability

	var funcname
	

	if (reliability=="reliable"){
		funcname="voteGood"
	} else{
		funcname="voteBad"
	}

	var args=[request.session.username,funcname,url,Publisher,Author,request.session.username]
	var obj

		
	invoke(args).then(function(msg){
	    

	    testObj=msg.toString();
	    
	    no_of_votes=no_of_votes+1;
	   
	    response.render('votingresult', {out:JSON.stringify(msg)});

	 }).catch(function(msg){
	     console.log(msg.toString());
	     response.render('votingresult',{out:JSON.stringify(msg)});
	 });

	 votedFor[request.session.username].push(url)







});


app.post('/worldstatevote', function(request, response) {
	var url = request.body.url
	var Author = request.body.author
	var Publisher = request.body.publisher
	var reliability = request.body.vote

	var funcname
	

	if (reliability=="reliable"){
		funcname="voteGood"
	} else{
		funcname="voteBad"
	}
	// if (Author==""||Publisher==""){
	// 	console.log("yup")
	// 	response.render('wsprelim',{out:{url:url, vote:reliability}})
	// }

	var args=[request.session.username,funcname,url,Publisher,Author,request.session.username]
	console.log("HiPaul"+args)
	var obj

		
	invoke(args).then(function(msg){
	    

	    testObj=msg.toString();
	    
	     console.log("Vidurrrrrrr")
	     //response.sendFile(path.join(__dirname + '/vote.html'));
	     no_of_votes=no_of_votes+1;
	     response.send({out:JSON.stringify(msg)});
	     //response.sendFile(path.join(__dirname + 'views/votingresult.ejs'));

	 }).catch(function(msg){
	     console.log(msg.toString());
	     response.render('votingresult',{out:JSON.stringify(msg)});
	 });

	 votedFor[request.session.username].push(url)







});

app.get('/wsprelim', function(request, response) {
	var message = request.query.response;
	console.log(message)

	var send_string = '';

	if (message == 'succ') {
		send_string = 'Successful Transaction'
	}
	else {
		send_string = 'Unsuccessful transaction. You have already voted.'
	}

	response.render('wsprelim.ejs', {out: send_string})
});


app.get('/admindata', function(request, response) {
	if(admin.includes(request.session.username)){

	var funcname = "queryAllArticles"
		args=[request.session.username,funcname]
		
		

		
		query(args).then(function(msg){
		    var author_list=new Set();
			var publisher_list=new Set();
			var ledgerlength=0;
		    testObj=msg.toString();
		    obj=JSON.parse(testObj)
		    var final_obj=[];
		    for(var propt in obj){
		    	author_list.add(obj[propt].Record.author)
		    	console.log (obj[propt].Record.author)
		    	console.log(author_list.size);
		    	publisher_list.add(obj[propt].Record.publisher)
		    	ledgerlength=ledgerlength+1;
		    	

		     }
		    response.render('admindata.ejs', {out: {users:registered_users.size, nvoters: no_of_votes, nauthors: author_list.size, npublishers: publisher_list.size, nledger:ledgerlength }})
			});
	

	//response.render('admindata.ejs', {out: {users:registered_users, nvoters: no_of_votes, nauthors: author_list.length, npublishers: publisher_list.length, nledger:ledgerlength }})
	}
	else{
		response.send("Sorry you are not an admin");
	}

});

app.post('/wsauthpubvoted', function(request, response) {
	var url = request.body.url
	var Author = request.body.author
	var Publisher = request.body.publisher
	var reliability = request.body.reliability

	var funcname
	

	if (reliability=="reliable"){
		funcname="voteGood"
	} else{
		funcname="voteBad"
	}

	var args=[request.session.username,funcname,url,Publisher,Author,request.session.username]
	var obj

		
	invoke(args).then(function(msg){
	    

	    testObj=msg.toString();
	    
	    no_of_votes=no_of_votes+1;
	   
	    response.render('votingresult', {out:JSON.stringify(msg)});

	 }).catch(function(msg){
	     console.log(msg.toString());
	     response.render('votingresult',{out:JSON.stringify(msg)});
	 });

	 votedFor[request.session.username].push(url)

	

});

app.get('/wsauthpub', function(request, response) {
	var url = request.query.url;
	var reliability = request.query.reliability;

	

	

	response.render('wsprelimauthpub.ejs', {out: {url:url, reliability:reliability}})
});

app.listen(3000);


