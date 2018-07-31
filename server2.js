var connect = require('connect');
var serveStatic = require('serve-static');
const express = require('express');
var api = require('etherscan-api').init('41C25BI5DEW1WCVN7Z3VX2VH411MFHM9PQ');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var firebase = require("firebase");
require('firebase/database');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

//Generate secret key and QR image for user

// If an incoming request uses
// a protocol other than HTTPS,
// redirect that request to the
// same url but with HTTPS
/*const forceSSL = function() {
    return function (req, res, next) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
      }
      next();
    }
  }
  
  // Instruct the app .
  // to use the forceSSL
  // middleware
  app.use(forceSSL());*/


app.use(express.static(__dirname + '/'));

/*app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + 'index.html'));
  });*/

app.post('/getBalance', function(req, res){
	console.log(req.body.account);
    //getBalance(req.body.account);	
    var balance = api.account.balance(/*'0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'*/req.body.account);

    balance.then(function(balanceData){
        console.log(balanceData);
        res.send(balanceData)
    });

    //res.send(balance)
    
    
});

app.post('/generate2FAData', function(req, res){
    console.log(req.body.uid);
    var userToken = req.body.uid
    
    var secret = speakeasy.generateSecret({length: 20});
    console.log(secret.base32); // Save this value to your DB for the user

    firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/secret").set({
        secret
    });
    
    firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/userToken").set({
        userToken
    });
});

app.post('/getQRCode', function(req, res){
    console.log(req.body.uid);
    
    firebase.database().ref("/users/" + /*firebase.auth().currentUser.uid*/ req.body.uid + "/secret").orderByChild("secret").on("child_added", function (snapshot) {
        var secret = snapshot.val();
        var token = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          })
          QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
            console.log(image_data); // A data URI for the QR code image
          });
    
        
        res.send(image_data)
      //console.log("address: " + address)
      //document.getElementById("accwallet").value = address;
      //getBalance({account:address})
  }, function (errorObject) {
        console.log("error loading eth address: " + errorObject);
  });
    
    //get secret from database
    /*var secret = ...

var token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});*/

    
});


app.post('/verifyQRCode', function(req, res){

    
//get secret
    firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/secret").orderByChild("secret").on("child_added", function (snapshot) {
        var secret = snapshot.val();
        var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: req.body.uid
          });
    
        
        res.send(verified)
      //console.log("address: " + address)
      //document.getElementById("accwallet").value = address;
      //getBalance({account:address})
  }, function (errorObject) {
        console.log("error loading eth address: " + errorObject);
  });
/*

// Load the secret.base32 from their user record in database
var secret = ...

// Verify that the user token matches what it should at this moment
var verified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: req.body.uid
});*/
});

function getBalance(account) {
		
    var balance = api.account.balance(/*'0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'*/account);

    balance.then(function(balanceData){
        console.log(balanceData);
    });
  };


function generate2FAData(userID){
    var secret = speakeasy.generateSecret({length: 20});
    console.log(secret.base32); // Save this value to your DB for the user

    QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
    console.log(image_data); // A data URI for the QR code image
  });
};

connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});