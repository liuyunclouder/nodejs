var express = require('express');

var app = express.createServer();
app.use(express.bodyParser());
app.all('/', function (req, res) {
    res.send('from jaw');
});

app.listen(3000);