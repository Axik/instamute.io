function togglePlayPause(button) {
    var audio = button.parentNode.parentNode.querySelector("audio")
    var playpause = document.getElementById(button.id);
    if (audio.paused || audio.ended) {
        playpause.title = "pause";
        playpause.className = "btn btn-danger btn-lg"
        playpause.innerHTML = playpause.innerHTML.replace("Unmute", "Mute");
        audio.play();
    } else {
        playpause.className = "btn btn-success btn-lg"
        playpause.title = "play";
        playpause.innerHTML = playpause.innerHTML.replace("Mute", "Unmute");
        audio.pause();
    }
}

function setVolume(volume_node, value) {
    var audio = volume_node.parentNode.parentNode.parentNode.querySelector("audio")
    audio.volume = value;
}

function copy(str) {
    //for IE ONLY!
    window.clipboardData.setData('Text', str);
}

$(document).ready(function() {
    $("input[type=range]").slider({
        min: 0,
        max: 1,
        step: 0.01,
        value: 1,
        tooltip: "hide",
    });
    $("input[type=range]").on("slide", function(slideEvent) {
        setVolume(this, slideEvent.value);
    });
    $('#copy_link_button').zclip({
        path: this.data_link,
        copy: function() {
            return $("#copy_link").val()
        },
        afterCopy: function() {},
    });

})
