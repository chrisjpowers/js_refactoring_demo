// REFACTOR #6: DRY Up Constant Values
//
// IMPROVEMENTS
// 1. All these constants are only defined in a single place,
//    so updating these values in the future becomes very simple.
// 2. Making these constants object attributes allows them to be
//    used DRYly by other objects.

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
    this.path_to_fallback_swf = "/javascripts/support/WebSocketMain.swf";
    this.pusher_key = '2f26b8b3ea8bbda5ec02';
    this.pusher_channel = 'refactor_demo';
    
    WebSocket.__swfLocation = this.path_to_fallback_swf;
    var pusher = new Pusher(this.pusher_key, this.pusher_channel);
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
    this.message_list = $('#messages');
    
    $(MyPusher).bind('new_message_received', this.on_new_message_received);
  },
  
  on_new_message_received: function(event, name, body) {
    Messages.add(name, body);
  },
  
  add: function(name, body) {
    this.message_list.prepend("<li><strong>" + sanitize(name) + 
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
    Messages.message_list.append("<li class='blank'>There are no messages...</li>");
  },
  
  hide: function() {
    Messages.message_list.find(".blank").remove();
  }
};

var NewMessageForm = {
  setup: function() {
    this.form = $("#message_form");
    this.name_field = $('#message_name');
    this.body_field = $('#message_body');
    this.submit_button = $('#submit_button');
    
    this.form.submit(this.on_form_submit);
  },
  
  has_valid_name: function() {
    return this.name_field.val() != '';
  },
  
  has_valid_body: function() {
    return this.body_field.val() != '';
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
    NewMessageForm.body_field.val('');
    NewMessageForm.enable_form();
  },
  
  disable_form: function() {
    this.submit_button.attr('disabled', true).text('Submitting...');
  },
  
  enable_form: function() {
    this.submit_button.attr('disabled', false).text('Submit');
  }
};