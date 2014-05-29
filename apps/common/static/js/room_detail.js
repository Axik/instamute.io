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

function setVolume(volume_range) {
    var volume = volume_range;
    var audio = volume_range.parentNode.parentNode.querySelector("audio")
    audio.volume = volume.value;
}
