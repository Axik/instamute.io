function togglePlayPause(button) {
    var audio = button.parentNode.parentNode.querySelector("audio");
    var playpause = button;
    if (audio.paused || audio.ended) {
        playpause.title = "pause";
        playpause.className = "btn btn btn-lg";
        playpause.innerHTML = playpause.innerHTML.replace("Unmute", "Mute");
        audio.play();
    } else {
        playpause.className = "btn btn-danger btn-lg";
        playpause.title = "play";
        playpause.innerHTML = playpause.innerHTML.replace("Mute", "Unmute");
        audio.pause();
    }
}

function setVolume(volume_node, value) {
    var audio = volume_node.parentNode.parentNode.parentNode.querySelector("audio");
    audio.volume = value;
}


function bind_slider() {
    $("button[id=gaymute]").each(function () {
        $(this).popover({
          trigger: 'hover',
          placement: 'right',
          content: 'Mute him'
        });
    });

    $("input[type=range]").each(function() {
        if (this.ranged === true) {
            return;
        }
        $(this).slider({
            min: 0,
            max: 1,
            step: 0.01,
            value: 1,
            tooltip: "hide"
        });
        this.ranged = true;
    });

    $("input[type=range]").on("slide", function(slideEvent) {
        setVolume(this, slideEvent.value);
    });
    $("input[type=range]").on("clicked", function(slideEvent) {
        setVolume(this, slideEvent.value);
    });
}

function mute_controller(button){
    var mute = true;
    if (button.className === "btn btn-lg") {
        button.className = "btn btn-danger btn-lg";
        button.innerHTML = button.innerHTML.replace("Mute", "Unmute")
    } else {
        mute = false;
        button.className = "btn btn-lg";
        button.innerHTML = button.innerHTML.replace("Unmute", "Mute")
    }

    $("button[id=gaymute]").each(function () {
        $(this).trigger('click');
    });

    $("#mute_me").trigger('click');
};

$(document).ready(function() {
    bind_slider();
    $('#copy_link_button').zclip({
        path: this.data_link,
        copy: function() {
            return "Open " + $("#copy_link").val() +
                 "  in your browser to join my voice chat room and " +
                "win some more ELO! No signup and completely anonymous!"
        },
        afterCopy: function() {
            $("#jsallert").css({'display': ''});
            $("#jsallert").html('Ready to paste!');
            setTimeout(function(){$("#jsallert").hide()}, 1500);


        }
    });

    $('#mute_all').popover({
      trigger: 'hover',
      placement: 'right',
      content: 'Mute all in this room'
    });
});
