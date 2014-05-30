function togglePlayPause(button) {
    var audio = button.parentNode.parentNode.querySelector("audio")
    var playpause = document.getElementById(button.id);
    if (audio.paused || audio.ended) {
        playpause.title = "pause";
        playpause.innerHTML;
        audio.play();
    } else {
        playpause.title = "play";
        audio.pause();
    }
}

function setVolume(volume_node, value) {
    var audio = volume_node.parentNode.parentNode.parentNode.querySelector("audio")
    audio.volume = value;
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
})
