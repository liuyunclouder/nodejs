var page = require('webpage').create();
page.open('http://www.google.com/', function (s) {
    var title = page.evaluate(function () {
        // var posts = document.getElementsByClassName("header");
        // posts[0].style.backgroundColor = "#000000";
        return document.title;
    });
    page.clipRect = { top: 0, left: 0, width: 1000, height: 700 };
    page.render(title + ".png");
    phantom.exit();
});