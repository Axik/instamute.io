/* globals HiBuddyApp */

(function() {
    var room = window.location.pathname.split('/')[2];
    var hibuddy = new HiBuddyApp(room);
    var toolbar;

    var localVideo = document.getElementById('local-audio');
    var remoteVideo = document.getElementById('remote-video');
    var allowMedia = document.getElementById('allow-media');
    var shareUrl = document.getElementById('share-url');
    var connecting = document.getElementById('connecting');
    var error = document.getElementById('error');
    var parent_div = document.getElementById('videos');
    var stream_proto = document.getElementById('my_stream');

    shareUrl.querySelector("input").value = window.location;
    // todo: figure out with this
    // function display(element) {
    //   var elements = [allowMedia, shareUrl, connecting, remoteVideo, error];
    //   elements.forEach(function(elem) {
    //     if (element !== elem)
    //       elem.classList.add("hidden");
    //   });
    //   element.classList.remove("hidden");
    // }

    //    hibuddy.on("newbuddy", function() {
    //        console.log("newbuddy");
    //
    //    });
    hibuddy.on("connected", function() {
        allowMedia.classList.add("hidden");
    });
    hibuddy.on("failure", function(failure) {
        error.textContent = failure;
    });


    navigator.getUserMedia({
        video: false,
        audio: true
    }, function(localStream) {
        var el = document.querySelector("nav");
        var toolbar = new HiBuddyToolbar(el, localStream);

        localVideo.src = URL.createObjectURL(localStream);
        localVideo.play();

        hibuddy.start(localStream, function(remoteStream, from) {

            var stream_clone = stream_proto.cloneNode(true);
            stream_clone.id = from;
            var audio_input = stream_clone.querySelector('#local-audio');
            audio_input.id = from;
            parent_div.appendChild(stream_clone);
            audio_input.src = URL.createObjectURL(remoteStream);
            audio_input.removeAttribute("muted")
            audio_input.play();
        });

    }, function(err) {
        console.error("getUserMedia Failed: " + err);
    });

}());
