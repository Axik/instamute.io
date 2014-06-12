function Chatter() {

  this.message_proto = document.getElementById("chat-stub");
  this.send_button = document.getElementById("btn-chat");
  this.message_stream = document.getElementById("chatters");
  this.input = document.getElementById("btn-input");
  this.icon_src = "http://placehold.it/50/FA6F57/fff&amp;text=" + "Me";

  this.send_button.addEventListener("click", this.send.bind(this));
  document.addEventListener("keydown", this.enter_pressed.bind(this), false);
}

Chatter.prototype = {
    send: function(event) {
        if (!this.input.value) {
            return true;
        }
        var text_msg = this.input.value;
        var new_msg = this.message_proto.cloneNode(true);
        new_msg.querySelector("#u-message").innerHTML = text_msg;
        new_msg.removeAttribute("hidden");
        this.message_stream.appendChild(new_msg);
        this.input.value = ""
  },

    enter_pressed: function(event) {
        if (event.which == 13 || event.keyCode == 13){
            this.send(event);
            return false;
        }
        return true;
  }
};
