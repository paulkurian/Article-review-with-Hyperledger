var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var md5 = require('js-md5');


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

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
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
	        
			

	    } catch(error){
	        console.error(`Failed to register user `+username+`: ${error}`);
	        process.exit(1);
	    }
	    
}



app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/authorpub', function(request, response) {
	if (request.session.loggedin) {
	response.render('authorscore')
	} else {
		response.redirect('/');
	}
	
});


app.post('/authorpub', function(request, response) {
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
	     response.sendFile(path.join(__dirname + '/vote.html'));
	     // response.render('votingresult',{out:JSON.stringify(msg)});
	     //response.sendFile(path.join(__dirname + 'views/votingresult.ejs'));

	 }).catch(function(msg){
	     console.log(msg.toString());
	     response.render('votingresult',{out:JSON.stringify(msg)});
	 });

	 votedFor[request.session.username].push(url)







});


app.listen(3000);


