
/*
 * GET home page.
 */

// exports.index = function(req, res){
//   res.render('index', { title: 'Cloud' });
// };

// exports.reg = function (req, res) {
//     // res.send('gotcha!' + new Date());
//     res.render('reg', { title: '用户注册' });
// };

module.exports = function (app) {
    var qs = require('querystring');

    app.get('/', function (req, res) {
        res.render('index', {
            title: '首页'
        });
    });

    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '用户注册'
        });
    });

    app.post('/reg', function (req, res) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            req.body = qs.parse(body);

             // console.log(req.headers);
            if (req.body['password-repeat'] != req.body['password']) {
             // req.end('error', 'you got an error!');
             // return res.redirect('reg');
             console.log(req.body);
            }
        });

    });
};