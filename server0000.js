var connect = require('connect');
var serveStatic = require('serve-static');
const express = require('express');
var api = require('etherscan-api').init('41C25BI5DEW1WCVN7Z3VX2VH411MFHM9PQ');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var firebase = require("firebase");
//require('firebase/database');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

var config = {
  apiKey: "AIzaSyB6sGgioVysu3zWtQGTjr8CI1srmz3MVvk",
  authDomain: "thrintel-market.firebaseapp.com",
  databaseURL: "https://thrintel-market.firebaseio.com",
  storageBucket: "thrintel-market.appspot.com",
};
firebase.initializeApp(config);

// If an incoming request uses
// a protocol other than HTTPS,
// redirect that request to the
// same url but with HTTPS
const forceSSL = function() {
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
  app.use(forceSSL());


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
    console.log("user ID: " + req.body.uid);
    var userToken = req.body.uid
    
    var secret = speakeasy.generateSecret({length: 20});
    console.log("secret: " + secret.base32 + " otpauth_url: " + secret.otpauth_url); // Save this value to your DB for the user

    var base32 = secret.base32
    var otpauth_url = secret.otpauth_url

    firebase.database().ref("/users/" + userToken + "/secret").set({
        base32
    });

    firebase.database().ref("/users/" + userToken + "/otpauth_url").set({
        otpauth_url
    });
    
    firebase.database().ref("/users/" + userToken + "/userToken").set({
        userToken
    });
    console.log("generating data complete")
    res.send("success")
});

app.post('/getQRCode', function(req, res){
    console.log("user ID used for QR Code: " + req.body.uid);
    
    firebase.database().ref("/users/" + /*firebase.auth().currentUser.uid*/ req.body.uid + "/secret").orderByChild("base32").on("child_added", function (snapshot) {
        var secret = snapshot.val();
        console.log("secret: " + secret)

        var token = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          })

         /* QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
            console.log("image data: " + image_data); // A data URI for the QR code image
            res.send(image_data)
          });*/
    
        
        
      //console.log("address: " + address)
      //document.getElementById("accwallet").value = address;
      //getBalance({account:address})
  }, function (errorObject) {
        console.log("error loading secret: " + errorObject);
  });

    firebase.database().ref("/users/" + /*firebase.auth().currentUser.uid*/ req.body.uid + "/otpauth_url").orderByChild("otpauth_url").on("child_added", function (snapshot) {
        var otpauth_url = snapshot.val();
        console.log("otpauth_url: " + otpauth_url)

          QRCode.toDataURL(otpauth_url, function(err, image_data) {
            console.log("image data: " + image_data); // A data URI for the QR code image
            res.send(image_data)
          });

  }, function (errorObject) {
        console.log("error loading otpauth_url: " + errorObject);
        res.send(errorObject)
  });
    
    //get secret from database
    /*var secret = ...

var token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});*/

    
});


app.post('/verifyQRCode', function(req, res){

 console.log(req.body.token) 
 var userToken = req.body.token 
  
//get secret
    firebase.database().ref("/users/" + /*firebase.auth().currentUser.uid*/ req.body.uid + "/secret").orderByChild("base32").on("child_added", function (snapshot) {
        var secret = snapshot.val();
        console.log("secret: " + secret)

        var verified = speakeasy.totp.verify({
  			secret: secret,
  			encoding: 'base32',
  			token: userToken
			});

        console.log("verified: " + verified)
        res.send(verified)

  }, function (errorObject) {
        console.log("error loading secret: " + errorObject);
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
app.listen(process.env.PORT || 3000);
