// REFACTORING #1: Modularize and Namespace Chunks of Logic
//
// IMPROVEMENTS:
// 1. All of the code that was previously isolated inside the 
//    jQuery initialization can now be called explicitly and
//    is therefore both testable and reusable.
// 2. The functionality is now better split up into three different parts,
//    making the program easier to understand and edit.
// 3. By using meaningful function names like setup() and display(),
//    it's much easier to understand what happens when this app is fired up.

$(function() {
  // setup Pusher
  MyPusher.setup();
  
  // Display 'no messages' notice
  NoMessagesNotice.display();
  
  // setup new message form for AJAX
  NewMessageForm.setup();
});

function sanitize(str) {
  return str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
}

var MyPusher = {
  setup: function() {
    WebSocket.__swfLocation = "/javascripts/support/WebSocketMain.swf";
    var pusher = new Pusher('2f26b8b3ea8bbda5ec02', 'refactor_demo');
    pusher.bind('message_posted', function(data) {
      // remove 'no messages' notice
      $("#messages .blank").remove();
      // add the new message
      $("#messages").prepend("<li><strong>" + sanitize(data.name) + 
                             ":</strong> " + sanitize(data.body) + "</li>");
    });
  }
};

var NoMessagesNotice = {
  display: function() {
    $("#messages").append("<li class='blank'>There are no messages...</li>");
  }
};

var NewMessageForm = {
  setup: function() {
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
  }
};