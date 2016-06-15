var uber = require('node-uber');

// create new Uber instance
var uber = new uber({
  client_id: 'Mt9Mjhd_p0Qx8fcZUZJLQb_O9bxvQaEp',
  client_secret: 'iysLR04aF_hl6riJczD2o17_x8E0sHPM8mtJhUB7',
  server_token: 'p6HtaGXHb-pf8PDQyT7ZyU-Feew_Z6wrdXbtTZ2I',
  redirect_uri: 'https://localhost:6000/callback',
  name: 'TestAppYu',
  language: 'en_US', // optional, defaults to en_US
  sandbox: true // optional, defaults to false
});

// get authorization URL
var authURL = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
console.log(authURL);

https://login.uber.com/oauth/authorize?response_type=code&redirect_uri=https%3A%2F%2Flocalhost%2Fcallback&scope=history%20profile%20request%20places&client_id=Mt9Mjhd_p0Qx8fcZUZJLQb_O9bxvQaEp


uber.authorization({
    // this code will be provided via the callback after logging in using the authURL
    authorization_code: 'ATh5UxwFguJ59jHyPeyrwP8sjBo7CR#_ '
}, function(err, access_token, refresh_token) {
    if (err) console.error(err);
    else {
        console.log('Your access_token is: ' + access_token);
        console.log('Your refresh_token is: ' + refresh_token);

        uber.products.getAllForLocation(3.1357, 101.6880, function(err, res) {
            if (err) console.error(err);
            else console.log(res);
        });
    }
});