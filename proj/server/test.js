
var fs = require('fs')
	,url = require("url")
	,path = require('path')
	,mimes = {
		'css': 'text/css',
		'js': 'text/javascript',
		'html': 'text/html'
	};

var app = require('http').createServer(function(req, res){
	var pathname = url.parse(req.url).pathname;
	var statpath = 'assets';
	var realpath = statpath + pathname;
	realpath = (realpath == 'assets/' ? 'assets/test.html': realpath);
	var ext = path.extname(realpath).slice(1);
	var content_type = mimes[ext] || 'text/plain';
	fs.realpath(realpath, function(err, resovled){
		fs.readFile( resovled, 'binary', function(err, file){
			res.writeHead(200, {'Content-Type': content_type});
			res.write(file, "binary");
			res.end();
		});
	});
	
	
}).listen(8080);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});