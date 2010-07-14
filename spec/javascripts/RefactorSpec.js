describe("setting up", function() {
  beforeEach(function() {
    spyOn(MyPusher, 'setup');
    spyOn(Messages, 'setup');
    spyOn(NoMessagesNotice, 'setup');
    spyOn(NewMessageForm, 'setup');
  });
  
  it("should setup all objects on load", function() {
    setup_app();
    expect(MyPusher.setup).toHaveBeenCalled();
    expect(Messages.setup).toHaveBeenCalled();
    expect(NoMessagesNotice.setup).toHaveBeenCalled();
    expect(NewMessageForm.setup).toHaveBeenCalled();
  });
});

describe("Messages", function() {
  var message_list;
  
  beforeEach(function() {
    message_list = $("<div id='message_list'></div>");
    Messages.setup({
      message_list: message_list
    });
  });
  
  it("should listen for new_message_received and add the message", function() {
    $(MyPusher).trigger('new_message_received', ['Joe', 'Hello']);
    expect(Messages.message_list.html()).toEqual("<li><strong>Joe:</strong> Hello</li>");
  });
  
  it("should sanitize nasty messages", function() {
    Messages.add("<script>Evil</script>", "<script>McEvilson</script>");
    var safe_string = "<li><strong>&lt;script&gt;Evil&lt;/script&gt;:</strong> &lt;script&gt;McEvilson&lt;/script&gt;</li>";
    expect(Messages.message_list.html()).toEqual(safe_string);
  });
});

describe("NoMessagesNotice", function() {
  var message_list = null;
  
  beforeEach(function() {
    message_list = $("<div id='message_list'></div>");
    Messages.setup({
      message_list: message_list
    });
    NoMessagesNotice.setup();
  });
  
  it("should display the no messages notice on setup", function() {
    expect(Messages.message_list.html()).toEqual("<li class=\"blank\">There are no messages...</li>")
  });
  
  it("should hide the message when a real one is added", function() {
    $(MyPusher).trigger('new_message_received', ['Joe', 'Hello']);
    expect(Messages.message_list.html()).not.toContain("<li class=\"blank\">There are no messages...</li>");
  });
});

describe("NewMessageForm", function() {
  var form, name_field, body_field, submit_button;
  beforeEach(function() {
    form = $("<form></form>");
    name_field = $("<input name='name'></input>");
    body_field = $("<textarea name='body'></textarea>");
    submit_button = $("<button>Submit!</button>");
    
    form.append(name_field);
    form.append(body_field);
    form.append(submit_button);
    
    NewMessageForm.setup({
      form: form,
      name_field: name_field,
      body_field: body_field,
      submit_button: submit_button
    });
  });
  
  describe("has_valid_name", function() {
    it("should return false if name is blank", function() {
      name_field.val("");
      expect(NewMessageForm.has_valid_name()).toBeFalsy();
    });
    
    it("should return true if name is not blank", function() {
      name_field.val("Mr. Crackers");
      expect(NewMessageForm.has_valid_name()).toBeTruthy();
    });
  });
  
  describe("has_valid_body", function() {
    it("should return false if body is blank", function() {
      body_field.val("");
      expect(NewMessageForm.has_valid_body()).toBeFalsy();
    });
    
    it("should return true if body is not blank", function() {
      body_field.val("Mr. Crackers says hello...");
      expect(NewMessageForm.has_valid_body()).toBeTruthy();
    });
  });
  
  describe("form enable/disable", function() {
    it("should disable submit and change text to Submitting...", function() {
      NewMessageForm.disable_form();
      expect(submit_button.text()).toEqual("Submitting...");
      expect(submit_button.attr('disabled')).toBeTruthy();
    });
    
    it("should enable submit and change text to Submit", function() {
      NewMessageForm.disable_form();
      NewMessageForm.enable_form();
      expect(submit_button.text()).toEqual("Submit");
      expect(submit_button.attr('disabled')).toBeFalsy();
    });
  });
  
  describe("display_error", function() {
    it("should alert the message", function() {
      spyOn(window, 'alert');
      NewMessageForm.display_error('oh noes!');
      expect(window.alert).toHaveBeenCalledWith('oh noes!');
    });
  });
  
  describe("form submission", function() {
    beforeEach(function() {
      // enter valid form data
      name_field.val('Name');
      body_field.val('Body');
    });
    
    it("should alert if no valid name", function() {
      spyOn(NewMessageForm, 'display_error');
      name_field.val("");
      form.submit();
      expect(NewMessageForm.display_error).toHaveBeenCalledWith('Please enter your name.');
    });
    
    it("should alert if no valid body", function() {
      spyOn(NewMessageForm, 'display_error');
      body_field.val("");
      form.submit();
      expect(NewMessageForm.display_error).toHaveBeenCalledWith('Please enter a message.');
    });
    
    it("should disable the form", function() {
      spyOn(NewMessageForm, 'disable_form');
      form.submit();
      expect(NewMessageForm.disable_form).toHaveBeenCalled();
    });
    
    it("should POST the data to '/'", function() {
      spyOn($, 'post');
      form.submit();
      expect($.post).toHaveBeenCalledWith('/', "name=Name&body=Body", NewMessageForm.on_form_submitted);
    });
  });
  
  describe("form submitted successfully", function() {
    it("should enable the form", function() {
      spyOn(NewMessageForm, 'enable_form');
      NewMessageForm.on_form_submitted();
      expect(NewMessageForm.enable_form).toHaveBeenCalled();
    });
    
    it("should clear the body field", function() {
      NewMessageForm.on_form_submitted();
      expect(body_field.val()).toEqual('');
    });
  });
});
