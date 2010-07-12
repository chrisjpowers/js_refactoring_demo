// This is the original code -- it works, but making changes
// and additions would be a serious pain in the neck.
// Time to start refactoring...

$(function() {
  // setup Pusher
  WebSocket.__swfLocation = "/javascripts/support/WebSocketMain.swf";
  var pusher = new Pusher('2f26b8b3ea8bbda5ec02', 'refactor_demo');
  pusher.bind('message_posted', function(data) {
    // remove 'no messages' notice
    $("#messages .blank").remove();
    // add the new message
    $("#messages").prepend("<li><strong>" + sanitize(data.name) + 
                           ":</strong> " + sanitize(data.body) + "</li>");
  });
  
  // Display 'no messages' notice
  $("#messages").append("<li class='blank'>There are no messages...</li>");
  
  // setup AJAX form
  $("#message_form").submit(function(event) {
    // validate name field
    if($('#message_name').val() == '') {
      alert('Please enter your name.');
    }
    // validate body field
    else if($('#message_body').val() == '') {
      alert('Please enter a message.');
    }
    else {
      // Disable form while submitting
      $('#submit_button').attr('disabled', true).text('Submitting...');
      // Post form to server
      $.post('/', $(this).serialize(), function() {
        // On success, clear body field and re-enable form
        $('#message_body').val('');
        $('#submit_button').attr('disabled', false).text('Submit');
      });
    }
    event.preventDefault();
  });
});

function sanitize(str) {
  return str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
}