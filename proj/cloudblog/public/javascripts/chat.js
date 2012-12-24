$(function () {
  var domain = getDomain();

  var socket = io.connect(domain);
  $('#msg-sender').click(function (e) {
    e.preventDefault();
    var msg = $('.faux-input').val();
    $("#chat-msg-container").append(msg);
    socket.emit('send:coords', msg);
  });

  socket.on('load:coords', function (data) {
    $("#chat-msg-container").append(data);
  });
});

function getDomain () {
  var domainName = 'http://localhost';
  if (/herokuapp/i.test(window.location.href)) {
      domainName = 'http://liuyunclouder.herokuapp.com';
  }
  return domainName;
}