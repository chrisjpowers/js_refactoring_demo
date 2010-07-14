// This is the original code -- it works, but making changes
// and additions would be a serious pain in the neck.
// Time to start refactoring...
//
// PROBLEMS
// 1. The code lacks legibility -- a reader would probably be
//    lost if it weren't for the code comments.
// 2. Because all of the code is wrapped up in anonymous functions,
//    these functions cannot be unit tested.
// 3. Logic for different display items is scattered throughout,
//    which makes it difficult to update the code.
// 4. While it would certainly be possible to add features and
//    make changes to this codebase, each change would bring
//    additional confusion and code-debt. The goal of refactoring
//    is to bring clarity to the code so that future changes can
//    bring further clarity.
//
// REFACTORING STEPS
// 1. Modularize and Namespace Chunks of Logic
// 2. Extract Anonymous Callbacks into Named Functions
// 3. Extract Inline Business Logic into Individual Functions
// 4. Move Logic to the Proper Object
// 5. Introduce Event Broadcasting
// 6. DRY Up Constant Values
// 7. Reuse Objects with Extensible Setup Params

$(document).ready(function() {
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