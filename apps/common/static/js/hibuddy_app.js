/* globals EventSource, MicroEvent,
   RTCPeerConnection, RTCSessionDescription, RTCIceCandidate */
(function(window, navigator) {
  navigator.getUserMedia = (navigator.getUserMedia       ||
                            navigator.mozGetUserMedia    ||
                            navigator.webkitGetUserMedia);
  window.RTCSessionDescription = (window.RTCSessionDescription    ||
                                  window.mozRTCSessionDescription ||
                                  window.webkitRTCSessionDescription);
  window.RTCIceCandidate = (window.RTCIceCandidate    ||
                            window.mozRTCIceCandidate ||
                            window.webkitRTCIceCandidate);
  window.RTCPeerConnection =  (window.RTCPeerConnection    ||
                               window.mozRTCPeerConnection ||
                               window.webkitRTCPeerConnection);
}(window, navigator));


function VoiceApp(room) {
    this.room = room;
    this.me = undefined;
}

var peer_config = {};


function parse_sheet(uri) {
    var parts = uri.split(':');
    var turn = parts[0];
    var ip_parts = parts[1].split('@');
    var username = ip_parts[0];
    var host = ip_parts[1];
    var tail = parts[2];
    return {username: username, url: turn + ':' + host + ':' + tail };
}


window.turnserversDotComAPI.iceServers(function(data) {
    compat = parse_sheet(data[1].url);
//    stun + turn over udp
    peer_config = {
                iceServers: [
                    data[0],
                    {
                        credential: data[1].credential,
                        url: compat.url,
                        username: compat.username
                    }
                ]
            };
});

VoiceApp.prototype = {
    start: function(stream, callback) {
        this.stream = stream;
        this.onRemoteStream = callback;
        this.peers = {};
        this.source = new EventSource("http://" + window.location.hostname + ":8888/rooms/" + this.room + "/signalling");
        this.source.on = this.source.addEventListener.bind(this.source);
        this.source.on("uid", this._onUID.bind(this));
        this.source.on("newbuddy", this._onNewBuddy.bind(this));
        this.source.on("offer", this._onOffer.bind(this));
        this.source.on("answer", this._onAnswer.bind(this));
        this.source.on("icecandidate", this._onIceCandidate.bind(this));
        this.source.on("invite", this._onInvite.bind(this));
        this.source.on("dropped", this._onDropped.bind(this));
    },

    _onUID: function(event) {
        var message = JSON.parse(event.data);
        this.me = message.uid;
        console.log('UID: ' + this.me);
    },

    _onInvite: function(event) {
        var message = JSON.parse(event.data);
        var peerConnection = this._get_or_create_peer(message);
        peerConnection.from = message.from;
    },

    _onDropped: function(event) {
        var message = JSON.parse(event.data);
        from = message.from;
        delete this.peers[from];
        this.trigger("dropped", from);
    },

    _onNewBuddy: function(event) {

        var peerConnection = new RTCPeerConnection(peer_config);
        var message = JSON.parse(event.data);
        peerConnection.from = message.uid;
        peerConnection = this._setupPeerConnection(peerConnection);
        console.log("New user" + message.uid);
        this.peers[message.uid] = peerConnection;
        this._post({
                type: 'invite',
                from: this.me,
                to: message.uid,
                invite: 'invite'
            });
        this._sendOffer(peerConnection, message.uid);
        this.trigger("newbuddy");
    },

    _onOffer: function(event) {
        var message = JSON.parse(event.data);
        var peerConnection = new RTCPeerConnection(peer_config);
        this.peers[message.from] = peerConnection;
        peerConnection.from = message.from;
        peerConnection = this._setupPeerConnection(peerConnection);

        var offer = new RTCSessionDescription(message.offer);
        peerConnection.setRemoteDescription(offer, function() {
            this._sendAnswer(peerConnection, message.from);
        }.bind(this));

    },

    _onAnswer: function(event) {
        var message = JSON.parse(event.data);

        var answer = new RTCSessionDescription(message.answer);
        var peerConnection = this.peers[message.from];
        console.log('_onAnswer:' + message.from);
        if (peerConnection === undefined) {return;}
        peerConnection.setRemoteDescription(answer, function() {
            console.log("done");
        }.bind(this));
    },

    _onIceCandidate: function(event) {
        var message = JSON.parse(event.data);
        console.log('_onIceCandidate:' + message.from);
        var candidate = new RTCIceCandidate(message.candidate);
        var peerConnection = this._get_or_create_peer(message);


        peerConnection.addIceCandidate(candidate);
    },

    _get_or_create_peer: function(message){
        var from = message.from;
        var peerConnection = this.peers[from];
        if (peerConnection === undefined){
            var _peerConnection = new RTCPeerConnection(peer_config);
            _peerConnection.from = from;
            peerConnection = this._setupPeerConnection(_peerConnection);
            this.peers[from] = peerConnection;
            return peerConnection;

        }
        return peerConnection;
    },

    _onIceStateChange: function(peerConnection) {
        // XXX: display an error if the ice connection failed
        console.log("ice: " + peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === "failed") {
            console.error("Something went wrong: the connection failed");
            this.trigger("failure");
        }

        if (peerConnection.iceConnectionState === "disconnected") {
            this.trigger("disconnected");
        }

        if (peerConnection.iceConnectionState === "connected"){
            this.trigger("connected");
            this._post({
                    type: 'connected',
                    from: this.me,
                answer: 'answer'
                });
        }
    },

    _onNewIceCandidate: function(event) {
        if (event.candidate) {
            var candidate = {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex
            };
            this._post({
                type: 'icecandidate',
                from: this.me,
                to: event.from,
                candidate: candidate
            });
        }
    },

    _setupPeerConnection: function(pc) {
        var closure = function(){
            this._onIceStateChange(pc);
        };

        _onAddStream = function(event) {
            this.onRemoteStream(event.stream, pc.from);
        };

        pc.onaddstream = _onAddStream.bind(this);
        pc.oniceconnectionstatechange = closure.bind(this);
        pc.onicecandidate = this._onNewIceCandidate.bind(this);
        pc.addStream(this.stream);
        return pc;
    },

    _sendOffer: function(peerConnection, to) {
        // Create offer
        peerConnection.createOffer(function(offer) {
            peerConnection.setLocalDescription(offer, function() {
                // Send offer
                this._post({
                    type: 'offer',
                    from: this.me,
                    to: to,
                    offer: offer
                });
            }.bind(this));
        }.bind(this), function() {});
    },

    _sendAnswer: function(peerConnection, to) {
        // Create answer
        peerConnection.createAnswer(function(answer) {
            peerConnection.setLocalDescription(answer, function() {
                // Send answer
                this._post({
                    type: 'answer',
                    from: this.me,
                    to: to,
                    answer: answer
                });
            }.bind(this));
        }.bind(this), function() {});
    },

    _post: function(data) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://' + window.location.hostname + ':8000/rooms/' + this.room + '/signalling', true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(data));
    }

};

MicroEvent.mixin(VoiceApp);
VoiceApp.prototype.on = VoiceApp.prototype.bind;
