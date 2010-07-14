// REFACTORING #7: Reuse Objects with Extensible Setup Params
//
// IMPROVEMENTS
// 1. The internal constant values of all these objects can now
//    be set (or overridden) by passing an options object to
//    each object's 'setup' method. This means that these objects
//    could easily be reused on different pages or in different
//    applications simply by passing appropriate values as params.
//
// For example:
//
// $(function() {
//   MyPusher.setup({ 
//     pusher_key: 'oasd9873hf83ja8g', 
//     pusher_channel: 'new_app_channel'
//   });
//   Messages.setup({ 
//     message_list: $("#my_messages")
//   });
//   NoMessagesNotice.setup();
//   NewMessageForm.setup({
//     form          : $("#new_message_form"),
//     name_field    : $('#new_message_name'),
//     body_field    : $('#new_message_body'),
//     submit_button : $('#new_submit_button')
//   });
// });

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
  setup: function(opts) {
    if(opts == null) opts = {};
    this.path_to_fallback_swf = opts.path_to_fallback_swf || "/javascripts/support/WebSocketMain.swf";
    this.pusher_key           = opts.pusher_key           || '2f26b8b3ea8bbda5ec02';
    this.pusher_channel       = opts.pusher_channel       || 'refactor_demo';
    
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
  setup: function(opts) {
    if(opts == null) opts = {};
    this.message_list = opts.message_list || $('#messages');
    
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
  setup: function(opts) {
    if(opts == null) opts = {};
    this.form          = opts.form          || $("#message_form");
    this.name_field    = opts.name_field    || $('#message_name');
    this.body_field    = opts.body_field    || $('#message_body');
    this.submit_button = opts.submit_button || $('#submit_button');
    
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