var app = require('express').createServer();
var fs=require('fs');


app.get('/', function(req, res){
	fs.readFile('/test.html', "binary", function(err, file) {
		if (err) {
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.end(err);
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(file, "binary");
			res.end();
		}

	});
});

app.listen(8080);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
  socket.emit('cloud', { my: 'PS3', cost: 'so much'});
  socket.on('Message',function(data){
	console.dir(data);
	socket.emit('got message',{ messge: 'got it!'});
  })
});

console.log('server running in localhost:8080');
