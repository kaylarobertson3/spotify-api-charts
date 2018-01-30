
// SETUP ====================================================

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Static
app.use('/public', express.static(__dirname + '/public'));

// END SETUP =================================================

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/callback', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


// START SERVER ====================================================

app.listen(process.env.PORT || 8888, function() {
    console.log("I'm listening at 8888");
});
