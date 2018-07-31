var connect = require('connect');
var serveStatic = require('serve-static');
const express = require('express');
var api = require('etherscan-api').init('41C25BI5DEW1WCVN7Z3VX2VH411MFHM9PQ');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

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

function getBalance(account) {
		
    var balance = api.account.balance(/*'0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'*/account);

    balance.then(function(balanceData){
        console.log(balanceData);
    });
  };

/*connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});*/

app.listen(process.env.PORT || 3000);
