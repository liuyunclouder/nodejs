var app = require('express')()
  , server = require('http').createServer(app);

server.listen(1122);

app.get('/', function (req, res) {
  res.download(__dirname + '/downloadfile.pdf');
});