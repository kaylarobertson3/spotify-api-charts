
// SETUP ====================================================

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const handlebars = require('express-handlebars');

// handlebars will be our templating engine
// app.engine('handlebars', handlebars());
// app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Static
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static('public'));


// if app is in production (heroku), use this
if (process.env.NODE_ENV != 'production') {
    app.use('/bundle.js', require('http-proxy-middleware')({target: 'http://localhost:8081/'}));
}

//
// const https = require('https');
// const fs = require('fs');
// const querystring = require('querystring');
//
// END SETUP =================================================

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/callback', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(8888, () => {
    console.log("I'm listening on 8888.");
});
