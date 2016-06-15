var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.listen(8080, function () {
  console.log('Ready');
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//QbDemo - Additional dependencies and middle layers
var session = require('express-session');

app.use(session({ resave: false, saveUninitialized: false, secret: 'smith' }));
var uber = require('node-uber');
var request = require('request');
var qs = require('querystring');
var debug = require('debug')('myfirstexpressapp:server');

var consumerKey = '<Paste your QuickBooks app consumerKey here>';
var consumerSecret = '<Paste your QuickBooks app consumerSecret here>';
var accessToken = {};
var realmId = '';


var uber = new uber({
  client_id: 'Mt9Mjhd_p0Qx8fcZUZJLQb_O9bxvQaEp',
  client_secret: 'iysLR04aF_hl6riJczD2o17_x8E0sHPM8mtJhUB7',
  server_token: 'p6HtaGXHb-pf8PDQyT7ZyU-Feew_Z6wrdXbtTZ2I',
  redirect_uri: 'https://localhost:8080/callback',
  name: 'TestAppYu',
  language: 'en_US', // optional, defaults to en_US
  sandbox: true // optional, defaults to false
});

app.get('/requestToken', function(request, response) {
	    console.log("getauturl");
  var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
    console.log(url);
  response.redirect(url);
      console.log("redirectauturl");

});

 app.get('/callback', function(request, response) {
    uber.authorization({
      authorization_code: request.query.code
    }, function(err, access_token, refresh_token) {
      if (err) {
        console.error(err);
      } else {
        // store the user id and associated access token
        accessToken = access_token;
        // redirect the user back to your actual app
        response.redirect('/close.html?_host_Info=Excel|Win32|16.01|en-US|telemetry|isDialog');
      }
    });
});


app.get('/getAccounts', function(request, response) {
  // extract the query from the request URL
 // var query = url.parse(request.url, true).query;


    uber.user.getProfile(function(err, res) {
      if (err) {
        console.error(err);
        response.sendStatus(500);
      } else {
        var me = response.json(res);
        console.log(JSON.stringify(me));
        response.send(me);
      }
    });
  
});

app.get('/', function (req, res) {
    res.redirect('/home.html');
})
/*//QbDemo - Set up HTTP routes for auth flow
app.get('/requestToken', function (req, res) {
    var postBody = {
        url: QuickBooks.REQUEST_TOKEN_URL,
        oauth: {
            callback: 'https://localhost:6000/callback/',
            consumer_key: consumerKey,
            consumer_secret: consumerSecret
        }
    }
    
    debug(postBody);
    
    request.post(postBody, function (e, r, data) {
        var requestToken = qs.parse(data)
        req.session.oauth_token_secret = requestToken.oauth_token_secret
        debug(requestToken)
        res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token)
    })
})

app.get('/callback', function (req, res) {
    var postBody = {
        url: QuickBooks.ACCESS_TOKEN_URL,
        oauth: {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            token: req.query.oauth_token,
            token_secret: req.session.oauth_token_secret,
            verifier: req.query.oauth_verifier,
            realmId: req.query.realmId
        }
    }

    request.post(postBody, function (e, r, data) {
            
        //save the accessToken & realmId
        accessToken = qs.parse(data)
        realmId = postBody.oauth.realmId

        debug(accessToken)
        debug(postBody.oauth.realmId)

        res.redirect('/close.html?_host_Info=Excel|Win32|16.01|en-US|telemetry|isDialog') 
        //Note: The query string is only needed to workaround a known issue which causes context loss on server-side redirects.
    })
})
*/
app.get('/getToken', function (req, res) {

    debug("Requested: " + accessToken)
    res.set("Expires", "0");
    res.send(accessToken);

})


app.get('/clearToken', function (req, res) {

    debug("Token cleared")
    accessToken = {};
    res.set("Expires", "0");
    res.status(200).end();

})

//Qbdemo - Setup routes for querying data
// app.get('/getAccounts', function (req, res) {

//     if (authenticated(res))
//         getAccounts(function (accounts) { res.send(accounts) });

// })

app.get('/getPurchases', function (req, res) {
    if (authenticated(res))
        getPurchases(function (purchases) { res.send(purchases) });

})

function authenticated(res) {
    var authenticated = false;

    if (accessToken.oauth_token &&
        accessToken.oauth_token_secret) {
        authenticated = true;
    }
    else {
        res.status(401).end();
        debug("Unauthenticated Request")
    }

    return authenticated;

}

function getAccounts(callback) {
  
    // save the access token somewhere on behalf of the logged in user
    var qbo = new QuickBooks(consumerKey,
        consumerSecret,
        accessToken.oauth_token,
        accessToken.oauth_token_secret,
        realmId,
        true, // use the Sandbox
        false); // turn debugging on

    // test out account access
    qbo.findAccounts(function (_, accounts) {
        debug(accounts.QueryResponse.Account.length + " accounts retrieved.")
        callback(accounts);
    })

}

function getPurchases(callback) {
  
    // save the access token somewhere on behalf of the logged in user
    var qbo = new QuickBooks(consumerKey,
        consumerSecret,
        accessToken.oauth_token,
        accessToken.oauth_token_secret,
        realmId,
        true, // use the Sandbox
        false); // turn debugging on

    // test out account access
    qbo.findPurchases(function (_, purchases) {
        debug(purchases.QueryResponse.Purchase.length + " purchases retrieved.")
        callback(purchases);
    })

}




module.exports = app;
