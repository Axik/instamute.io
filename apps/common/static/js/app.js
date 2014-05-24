/* globals HiBuddyApp */

(function() {
    var room = window.location.pathname.split('/')[2];
    var hibuddy = new HiBuddyApp(room);
    var toolbar;

    var localVideo = document.getElementById('local-video');
    var remoteVideo = document.getElementById('remote-video');
    var allowMedia = document.getElementById('allow-media');
    var shareUrl = document.getElementById('share-url');
    var connecting = document.getElementById('connecting');
    var error = document.getElementById('error');
    var parent_div = document.getElementById('videos')

    shareUrl.querySelector("input").value = window.location;

    // function display(element) {
    //   var elements = [allowMedia, shareUrl, connecting, remoteVideo, error];
    //   elements.forEach(function(elem) {
    //     if (element !== elem)
    //       elem.classList.add("hidden");
    //   });
    //   element.classList.remove("hidden");
    // }

    var counter = 0;
    var last_vid = 0;
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
        video: true,
        audio: true
    }, function(localStream) {
        var el = document.querySelector("nav");
        var toolbar = new HiBuddyToolbar(el, localStream);

        localVideo.src = URL.createObjectURL(localStream);
        localVideo.play();

        hibuddy.start(localStream, function(remoteStream) {
            last_vid = document.createElement('video');
            last_vid.id = counter;
            counter = counter + 1
            parent_div.appendChild(last_vid);
            last_vid.src = URL.createObjectURL(remoteStream);
            last_vid.play();
        });

    }, function(err) {
        console.error("getUserMedia Failed: " + err);
    });

}());
