var express = require('express'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    // exec = require('child_process').exec,
    util = require('util'),
    // MongoStore = require('connect-mongo')(express),
    // MongooseStore = require('./models/mongoose.js').init();
    settings = require('./settings'),
    Files = {};

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express. session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      db: settings.db
    })
  }));
  var routes = require('./routes')(app);
  // app.use(app.router);
  // app.use(express.router(routes));
  app.use('/test', express.static(path.join(__dirname, 'test')));
  app.use('/upload', express.static(path.join(__dirname, 'upload')));
  app.use('/socket.io', express.static(path.join(__dirname, '/../node_modules')));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


var serverInstance = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


var io = require('socket.io').listen(serverInstance);

io.sockets.on('connection', function (socket) {
    socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
      var Name = data['Name'];
      Files[Name] = {  //Create a new Entry in The Files Variable
        FileSize : data['Size'],
        Data   : "",
        Downloaded : 0
      };
      var Place = 0;
      try{
        var Stat = fs.statSync('Temp/' +  Name);
        if(Stat.isFile())
        {
          Files[Name]['Downloaded'] = Stat.size;
          Place = Stat.size / 524288;
        }
      }
      catch(er){} //It's a New File
      fs.open("Temp/" + Name, 'a', 0755, function(err, fd){
        if(err)
        {
          console.log(err);
        }
        else
        {
          Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
          socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
        }
      });
  });
  
  socket.on('Upload', function (data){
      var Name = data['Name'];
      Files[Name]['Downloaded'] += data['Data'].length;
      Files[Name]['Data'] += data['Data'];
      if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
      {
        fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
          var inp = fs.createReadStream("Temp/" + Name);
          var out = fs.createWriteStream("Video/" + Name);
          util.pump(inp, out, function(){
            fs.unlink("Temp/" + Name, function () { //This Deletes The Temporary File
              /*exec("ffmpeg -i Video/" + Name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Video/" + Name  + ".jpg", function(err){
                socket.emit('Done', {'Image' : 'Video/' + Name + '.jpg'});
              });*/
              socket.emit('Done', {'Image' : 'images/preview.jpg'});
            });
          });
        });
      }
      else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
        fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
          Files[Name]['Data'] = ""; //Reset The Buffer
          var Place = Files[Name]['Downloaded'] / 524288;
          var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
          socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
        });
      }
      else
      {
        var Place = Files[Name]['Downloaded'] / 524288;
        var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
        socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
      }
    });

    socket.on('fileChosen', function (data) {
      console.log(data.msg);
    });

    socket.on('send:coords', function (data) {
      socket.broadcast.emit('load:coords', data);
    });
});
