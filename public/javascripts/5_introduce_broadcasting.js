// REFACTORING #5: Introduce Broadcasting
//
// IMPROVEMENTS
// 1. By using jQuery custom event broadcasting rather than having
//    MyPusher tell all the other objects what to do, we benefit from
//    further detachment of these objects. Now MyPusher's job is much
//    more simple, and it is up to all the other objects to determine
//    how (and if) it should handle a 'new_message_received' event.
// 2. It is much easier for new objects that are added later to hook
//    into this event, and any conditional logic is handled within the
//    listening object rather than within MyPusher.
// 3. If, for example, we decide that we no longer want to display
//    the NoMessagesNotice anymore, we can now completely remove that
//    object from the code without having *any* negative impact on the 
//    other objects. That's the beauty of loosely coupled objects!

$(function() {
  // setup Pusher
  MyPusher.setup();
  
  Messages.setup();
  
  // Display 'no messages' notice
  NoMessagesNotice.setup();
  
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
    // We could do some validation on 'data' here before
    // triggering our own 'new_message_received' event.
    $(MyPusher).trigger('new_message_received', [data.name, data.body]);
  }
};

var Messages = {
  setup: function() {
    $(MyPusher).bind('new_message_received', this.on_new_message_received);
  },
  
  on_new_message_received: function(event, name, body) {
    Messages.add(name, body);
  },
  
  add: function(name, body) {
    $("#messages").prepend("<li><strong>" + sanitize(name) + 
                           ":</strong> " + sanitize(body) + "</li>");
  }
};

var NoMessagesNotice = {
  setup: function() {
    $(MyPusher).bind('new_message_received', this.on_new_message_received);
    this.display();
  },
  
  on_new_message_received: function(event, name, body) {
    NoMessagesNotice.hide();
  },
  
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