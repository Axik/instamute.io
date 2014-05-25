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
        video: true,
        audio: true
    }, function(localStream) {
        var el = document.querySelector("nav");
        var toolbar = new HiBuddyToolbar(el, localStream);

        localVideo.src = URL.createObjectURL(localStream);
        localVideo.play();

        hibuddy.start(localStream, function(remoteStream, from) {

//            todo: imporove this!!!
            var div = document.createElement('div');
            div.class="col-xs-6 col-md-3";

            var video_tab = document.createElement('video');
            video_tab.id = from;
            div.appendChild(video_tab);
            parent_div.appendChild(div);
            video_tab.src = URL.createObjectURL(remoteStream);
            video_tab.play();
        });

    }, function(err) {
        console.error("getUserMedia Failed: " + err);
    });

}());
