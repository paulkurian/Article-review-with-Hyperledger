var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
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
// connection.connect(function(err) {
// if (err) throw err;
// connection.query("SELECT * FROM ACCOUNTS",function(err, result, fields){
// 	if (err) throw err;
//     console.log(result);
//     connection.end();
// 	});
// });


var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));



async function query(username) {
	const { FileSystemWallet, Gateway } = require('fabric-network');
	const fs = require('fs');


	const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
	const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
	const ccp = JSON.parse(ccpJSON);
		try {
		const args=process.argv;
		console.log(username)
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = new FileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists(username);
		if (!userExists) {
		    console.log('An identity for the user '+username+' does not exist in the wallet');
		    console.log('Run the registerUser.js application before retrying');
		    return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: false } });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		const contract = network.getContract('article');

		// Evaluate the specified transaction.
		// queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
		// queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
		var result = await contract.evaluateTransaction('queryAllArticles');
		//console.log("HIquery");
		//console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
		return result;

    } catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
async function vote(username,voteFunc, url) {
	const { FileSystemWallet, Gateway } = require('fabric-network');
	const fs = require('fs');

	console.log(voteFunc);
	console.log(username)
	console.log(url)
	const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
	const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
	const ccp = JSON.parse(ccpJSON);
		try {
		const args=process.argv;
		console.log(username)
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = new FileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const userExists = await wallet.exists(username);
		if (!userExists) {
		    console.log('An identity for the user '+username+' does not exist in the wallet');
		    console.log('Run the registerUser.js application before retrying');
		    return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: false } });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		const contract = network.getContract('article');

		// Evaluate the specified transaction.
		// queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
		// queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
		await contract.submitTransaction(voteFunc,url,username);
		//console.log("HIquery");
		//console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
		await gateway.disconnect();
		return("Success")

    } catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        return ("You have already voted for this article")
    }
}

async function addarticle(username,url,publisher,Author) {
	const { FileSystemWallet, Gateway } = require('fabric-network');
	const fs = require('fs');

	
	const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
	const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
	const ccp = JSON.parse(ccpJSON);
    try {

        const args=process.argv;
        console.log(username)
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(username);
        if (!userExists) {
            console.log('An identity for the user '+ username +'does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: username, discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('article');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        await contract.submitTransaction('addArticle',url,publisher,Author);

        console.log('Transaction has been submitted'+url+publ);

        // Disconnect from the gateway.
        await gateway.disconnect();
        return("Success")

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
				console.log(results)

				if (results.length > 0) {
					request.session.loggedin = true;
					request.session.username = username;

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
		
		query(request.session.username).then(function(msg){
		    

		    testObj=msg.toString();
		    //console.log(testObj)
		    obj=JSON.parse(testObj)
		    // console.log(obj[0])
		     //console.log(obj[0].Record.publisher)
		    //response.send(obj[0].Key);
		    response.render('index',{obj:obj})

			// }	
		 }).catch(function(msg){
		     console.log(msg.toString());
		     response.render(JSON.stringify(msg));
		 });

		
		



	} else {
		response.send('Please login to view this page!');
	}
	//response.end();
});


app.post('/vote', function(request, response) {

	var url = request.body.url
	var voteFunc
	var reliability = request.body.reliability

	if (reliability=="reliable"){
		voteFunc="voteGood"
	} else{
		voteFunc="voteBad"
	}
	var outcome;
	vote(request.session.username,voteFunc,url).then(function(msg){
		    

		  //console.log(typeof msg+"heyt"); 
		   
		   response.render('voted',{out:msg})
		   
			// }	
		 }).catch(function(msg){
		     //console.log(msg);
		     //response.render(JSON.stringify(msg));
		     response.render('voted',{out:msg})
		 });

	
});
app.get('/addarticle', function(request, response) {
	response.sendFile(path.join(__dirname + '/AddArticle.html'));
	
});

app.post('/addarticle', function(request, response) {
	var url = request.body.url
	var Author = request.body.Author
	var Publisher = request.body.Publisher

	

	addarticle(request.session.username,url,Publisher,Author).then(function(msg){
		    

		  console.log(msg+"hegfsuykdhjbnakwsdt"); 
		   

		   response.redirect('/home');
		   
		   
			// }	
		 }).catch(function(msg){
		     console.log(msg);
		     //response.render(JSON.stringify(msg));
		     
		 });

	
});
app.listen(3000);


