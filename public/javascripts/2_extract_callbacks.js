// REFACTORING #2: Extract Anonymous Callbacks into Named Functions
//
// IMPROVEMENTS:
// 1. Anonymous functions are, well, anonymous. This is a real problem
//    if you want to test that function, since it can't be explicitly
//    called. Now these functions can be called directly in tests.
// 2. These functions can now be reused in other parts of the app,
//    where before they could only be used as a callback to the one
//    function.
// 3. Again, using meaningful function names like on_form_submit make
//    the code much more legible.

$(document).ready(setup_app);

function setup_app() {
  // setup Pusher
  MyPusher.setup();
  
  // Display 'no messages' notice
  NoMessagesNotice.display();
  
  // setup new message form for AJAX
  NewMessageForm.setup();
}

function sanitize(str) {
  return str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
}

var MyPusher = {
  setup: function() {
    WebSocket.__swfLocation = "/javascripts/support/WebSocketMain.swf";
    var pusher = new Pusher('2f26b8b3ea8bbda5ec02', 'refactor_demo');
    pusher.bind('message_posted', this.display_new_message);
  },
  
  display_new_message: function(data) {
    // remove 'no messages' notice
    $("#messages .blank").remove();
    // add the new message
    $("#messages").prepend("<li><strong>" + sanitize(data.name) + 
                           ":</strong> " + sanitize(data.body) + "</li>");
  }
};

var NoMessagesNotice = {
  display: function() {
    $("#messages").append("<li class='blank'>There are no messages...</li>");
  }
};

var NewMessageForm = {
  setup: function() {
    $("#message_form").submit(this.on_form_submit);
  },
  
  on_form_submit: function(event) {
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
      $.post('/', $(this).serialize(), NewMessageForm.on_form_submitted);
    }
    event.preventDefault();
  },
  
  on_form_submitted: function() {
    // On success, clear body field and re-enable form
    $('#message_body').val('');
    $('#submit_button').attr('disabled', false).text('Submit');
  }
};