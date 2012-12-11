var http = require('http'),
    fs = require('fs');

var server = http.createServer(function (req, res) {
  fs.readFile('./index-socket-test.html', 'utf-8', function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
}).listen(5566);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('message', function (data) {
    console.log('hi received');
  });
  socket.on('disconnect', function () { });
});