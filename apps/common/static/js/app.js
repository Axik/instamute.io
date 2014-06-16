/* globals VoiceApp */

(function() {
    var room = window.location.pathname.split('/')[2];
    var voice_app = new VoiceApp(room);

    var localAudio = document.getElementById('local-audio');
    var parent_div = document.getElementById('videos');
    var stream_proto = document.getElementById('my_stream');
    var mute_me = document.getElementById('mute_me');

    voice_app.on("connected", function() {});

    voice_app.on("failure", function(failure) {
        $("#modal-failure").modal();
        setTimeout(function() {
            $("#modal-failure").modal('hide');
        }, 10000);
    });

    voice_app.on("dropped", function(from) {
        console.log('On drop' + from);
        var audio_div = document.getElementById(from);
        if (audio_div) {
            audio_div.remove();
        }
    });

    voice_app.on("rejected", function() {
        $("#max_size_modal").modal()
    });

    navigator.getUserMedia({
        video: false,
        audio: true
    }, function(localStream) {
        var speechEvents = hark(localStream, {});
        var row_speaking = localAudio.parentNode;

        speechEvents.on('speaking', function() {
            row_speaking.className = 'row speaking';
        });

        speechEvents.on('stopped_speaking', function() {
            row_speaking.className = 'row';
        });
        localAudio.src = URL.createObjectURL(localStream);
        localAudio.play();
        mutter = function() {
            var audioTracks = localStream.getAudioTracks();
            for (var i = 0, l = audioTracks.length; i < l; i++) {
                audioTracks[i].enabled = !audioTracks[i].enabled;
            }
            if (this.className === "btn btn-warning btn-lg") {
                this.className = "btn btn-danger btn-lg";
                this.innerHTML = this.innerHTML.replace("Mute", "Unmute")
            } else {
                this.className = "btn btn-warning btn-lg";
                this.innerHTML = this.innerHTML.replace("Unmute", "Mute")
            }
        };
        mute_me.onclick = mutter;
        voice_app.start(localStream, function(remoteStream, from) {

            var stream_clone = stream_proto.cloneNode(true);
            stream_clone.id = from;
            var audio_input = stream_clone.querySelector('#local-audio');
            audio_input.id = from;
            parent_div.appendChild(stream_clone);
            audio_input.src = URL.createObjectURL(remoteStream);
            audio_input.removeAttribute("muted");
            audio_input.play();
            var username = stream_clone.querySelector('#username');
            username.innerHTML = from;
            bind_slider();
        });

    }, function(err) {
        console.error("getUserMedia Failed: " + err);
    });

}());
