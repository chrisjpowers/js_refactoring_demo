// REFACTOR #4: Move Logic to the Proper Object
//
// IMPROVEMENTS:
// 1. Objects are most effective when they have a simple set of
//    responsibilities. The MyPusher object shouldn't have to
//    worry about how Message adding or notice hiding works, these
//    details should be handled by their own objects.
// 2. Proper modularization results in loosely coupled objects that
//    can be easily refactored internally without affecting the
//    objects that they interact with.
// 3. And, as usual, legibility improves when functionality is
//    properly modularized into understandable namespaces.

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
    NoMessagesNotice.hide()
    // add the new message
    Messages.add(data.name, data.body);
  }
};

var Messages = {
  add: function(name, body) {
    $("#messages").prepend("<li><strong>" + sanitize(name) + 
                           ":</strong> " + sanitize(body) + "</li>");
  }
};

var NoMessagesNotice = {
  display: function() {
    $("#messages").append("<li class='blank'>There are no messages...</li>");
  },
  
  hide: function() {
    $("#messages .blank").remove();
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
      NewMessageForm.display_error('Please enter your name.');
    }
    // validate body field
    else if(!NewMessageForm.has_valid_body()) {
      NewMessageForm.display_error('Please enter a message.');
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
  },
  
  display_error: function(msg) {
    alert(msg);
  }
};