var qs = require('querystring'),
    fs = require('fs'),
    path=require("path"),
    mime = require('mime'),
    http = require('http'),
    async = require('async');

module.exports = function (app) {
    var Users = ['cloud', 'tree'];

    app.get('/', function (req, res) {
        var username = undefined;
        if (req.cookies['uname'] && Users.indexOf(req.cookies['uname']) !== -1) {
            username = req.cookies['uname'];
        }

        res.render('index', {
            title: '首页',
            username: username
        });
    });

    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '用户注册'
        });
    });

    app.post('/reg', function (req, res) {
        if (req.body['password-repeat'] == req.body['password']) {
            res.cookie('uname', req.body.username);
            res.end('Congratulations!your username is ' + req.body.username);
        } else {
            res.redirect('back');
        }

    });

    app.get('/login', function (req, res) {
        res.render('login', {
            title: '用户登录'
        });
    });

    app.post('/login', function (req, res) {
        if (req.body['username'] && Users.indexOf(req.body['username']) !== -1) {
            res.cookie('uname', req.body['username']);
            res.redirect('..');
        } else {
            res.redirect('back');
        }

    });

    app.get('/logout', function (req, res) {
        res.clearCookie('uname');
        res.redirect('..');
    });

    app.get('/unit_test', function (req, res) {

        fs.readFile('./test/brix-packet.js', 'utf-8', function (err, data) {
            var comment = getUnitTestSrc(data),
                content = assembleUnitTestContent(comment);

            fs.writeFileSync('./test/brix-packet-spec.js', content, 'utf-8');

            res.render('index-unitTest', {
                title: 'w',
                specPath: './test/brix-packet-spec.js'
            }, function (err, html) {
                if (err) {
                    console.log(err);
                } else {
                    html += req.cookies;
                    res.end(html);
                }
            });

        });
        
    });

    app.get('/upload', checkLogin, function (req, res) {
        console.log(req.url);
        console.log(req.originalUrl);
       res.render('upload', {
        title: 'upload'
       });
    });

    app.post('/upload', checkLogin, function (req, res) {
       fs.readFile(req.files.image.path, function (err, data) {
            console.log(__dirname);
           var newPath = __dirname + '/../upload/cloud.jpg';
           console.log(newPath);
           fs.writeFile(newPath, data, function (err) {
               res.redirect('back');
           });
       });
    });

    app.get('/get_file', checkLogin, function (req, res) {
       var filename = __dirname + '/../cloud.jpg';

       // fs.readFile(filename, function(err,file){
       //      if (err) {
       //          console.log(err);
       //      }
       //     var contentType=mime.lookup(filename);
       //     console.log(contentType);
       //     // console.log(file);
       //     res.set({
       //         "Content-Type":contentType,
       //         "Content-Length":file.length,
       //         "Server":"NodeJs("+process.version+")"
       //     });
       //     res.send(file);
       //     res.end();
       //  });
        res.sendfile(filename);

       
    });


    app.get('/watch_file', function (req, res) {
       fs.watchFile(__dirname+'/../../server/test.js', function (curr, prev) {
           console.log(curr.mtime);
           console.log(prev.mtime);
       });
       res.end(__dirname+'/../../server/test.js');
    });


    app.get('/upload_socket', function (req, res) {
        fs.readFile(__dirname + '/../index.html',
        function (err, data) {
          if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
          }
          res.writeHead(200);
          res.end(data);
        });
    });

    app.get('/chat', function (req, res) {
       res.render('chat', {
        title: 'chat'
       });
    });

    app.get('/test', function (req, res) {
      var start = new Date();
      async.parallel([
        function (callback) {
          setTimeout(callback, 100);
        },
        function (callback) {
          setTimeout(callback, 300);
        },
        function (callback) {
          setTimeout(callback, 200);
        }
        ], function (err, results) {
          res.end('completed in ' + (new Date() - start) + 'ms');
        });

    });



    function checkLogin (req, res, next) {
        if (req.cookies['uname'] && Users.indexOf(req.cookies['uname']) !== -1) {
            next();
        } else {
            res.redirect('login');
        }
        
    }

    function getUnitTestSrc (data) {
        var pattern = /^\/\*([\S\s]*?)\*\/$/gim,
            re = null,
            src_arr = [];

        while ((re = pattern.exec(data)) !== null) {
            var tmp = re[1].toString().trim(),
                matchArr = /^@title\s(.*)[\r\n]([\S\s]*)/gi.exec(tmp);

            src_arr.push({
                title: matchArr[1].trim(),
                body: matchArr[2].trim()
            });
        }

        console.log(src_arr);
        
        return src_arr;
    }

    function assembleUnitTestContent (srcArr) {
        var tmp = 'describe("defaultTestGroup", function () {\r\n';

        srcArr.forEach(function (v) {
            tmp += 'it(' + '"' + v['title'] + '"' + ', ' + v['body'] + ');\r\n';
        });
        tmp += '});\r\n';
        return tmp;
    }

};


    // clientReq.end();


