$(function () {
  var socket = io.connect('http://localhost');
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