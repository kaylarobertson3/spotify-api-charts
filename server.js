
// SETUP ====================================================

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Static
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static('public'));


// if app is in production (heroku), use this
if (process.env.NODE_ENV != 'production') {
    app.use('/bundle.js', require('http-proxy-middleware')({target: 'http://localhost:8081/'}));
}

// END SETUP =================================================

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/callback', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// app.listen(8888, () => {
//     console.log("I'm listening on 8080.");
// });

app.listen(process.env.PORT || 8080);
