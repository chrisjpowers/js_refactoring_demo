// REFACTORING #3: Extract Inline Business Logic into Individual Functions
//
// IMPROVEMENTS:
// 1. Once extracted into functions, this logic can be reused DRYly
//    throughout the application.
// 2. Because business logic can change over the lifetime of an app,
//    keeping that logic centralized in one place makes it easy to
//    updated and maintain.
// 3. Code legibility improves now that meaningful function names are
//    being used -- a developer doesn't have to understand how the 
//    logic algorhythm works to understand what it does.

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
    pusher.bind('message_posted', this.display_new_message);
  },
  
  display_new_message: function(data) {
    // remove 'no messages' notice
    MyPusher.hide_no_messages_notice();
    // add the new message
    MyPusher.add_new_message(data.name, data.body);
  },
  
  hide_no_messages_notice: function() {
    $("#messages .blank").remove();
  },
  
  add_new_message: function(name, body) {
    $("#messages").prepend("<li><strong>" + sanitize(name) + 
                           ":</strong> " + sanitize(body) + "</li>");
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
  
  has_valid_name: function() {
    return $('#message_name').val() != '';
  },
  
  has_valid_body: function() {
    return $('#message_body').val() != '';
  },
  
  on_form_submit: function(event) {
    // validate name field
    if(!NewMessageForm.has_valid_name()) {
      alert('Please enter your name.');
    }
    // validate body field
    else if(!NewMessageForm.has_valid_body()) {
      alert('Please enter a message.');
    }
    else {
      // Disable form while submitting
      NewMessageForm.disable_form();
      // Post form to server
      $.post('/', $(this).serialize(), NewMessageForm.on_form_submitted);
    }
    event.preventDefault();
  },
  
  on_form_submitted: function() {
    // On success, clear body field and re-enable form
    $('#message_body').val('');
    NewMessageForm.enable_form();
  },
  
  disable_form: function() {
    $('#submit_button').attr('disabled', true).text('Submitting...');
  },
  
  enable_form: function() {
    $('#submit_button').attr('disabled', false).text('Submit');
  }
};