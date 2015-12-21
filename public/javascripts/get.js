$(function () {
  var socket = io.connect(window.location.origin);
  var $console = $('#textArea');

  socket.on('debug-listing', function (post) {
    var text = $console.val();
    $console.val(text + post + '\n\n'); // printing out everything for debugging
    $console.scrollTop($console[0].scrollHeight);
  });

  socket.on('new-listing', function (post) {
    console.log(post.data);
  });
});