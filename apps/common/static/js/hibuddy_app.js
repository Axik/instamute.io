/* globals EventSource, MicroEvent,
   RTCPeerConnection, RTCSessionDescription, RTCIceCandidate */

function HiBuddyApp(room) {
    this.room = room;
    this.me = undefined;
}

HiBuddyApp.prototype = {
    start: function(stream, callback) {
        this.stream = stream;
        this.onRemoteStream = callback;
        this.peers = {};
        this.config = {
            iceServers: [{
                // please contact me if you plan to use this server
                url: 'turn:webrtc.monkeypatch.me:6424?transport=udp',
                credential: 'hibuddy',
                username: 'hibuddy'
            }]
        };
        this.source = new EventSource("http://" + window.location.hostname + ":8888/rooms/" + this.room + "/signalling");
        this.source.on = this.source.addEventListener.bind(this.source);
        this.source.on("uid", this._onUID.bind(this));
        this.source.on("newbuddy", this._onNewBuddy.bind(this));
        this.source.on("offer", this._onOffer.bind(this));
        this.source.on("answer", this._onAnswer.bind(this));
        this.source.on("icecandidate", this._onIceCandidate.bind(this));
    },

    _onUID: function(event) {
        var message = JSON.parse(event.data);
        this.me = message.uid;
        console.log('UID: ' + this.me);
    },

    _onNewBuddy: function(event) {

        var peerConnection = new RTCPeerConnection(this.config);
        peerConnection = this._setupPeerConnection(peerConnection);
        var message = JSON.parse(event.data);
        console.log("New user" + message.uid);
        this.peers[message.uid] = peerConnection;
        this._sendOffer(peerConnection);
        this.trigger("newbuddy");
    },

    _onOffer: function(event) {
        var message = JSON.parse(event.data);
        var peerConnection = new RTCPeerConnection(this.config);
        peerConnection = this._setupPeerConnection(peerConnection);
        this.peers[message.from] = peerConnection;
        console.log(message.from);

        var offer = new RTCSessionDescription(message.offer);
        peerConnection.setRemoteDescription(offer, function() {
            this._sendAnswer(peerConnection);
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
        var peerConnection = this.peers[message.from];


        peerConnection.addIceCandidate(candidate);
    },

    _onIceStateChange: function(peerConnection) {
        // XXX: display an error if the ice connection failed
        console.log("ice: " + peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === "failed") {
            console.error("Something went wrong: the connection failed");
            this.trigger("failure");
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
                candidate: candidate
            });
        }
    },

    _onAddStream: function(event) {
        this.onRemoteStream(event.stream);
    },

    _setupPeerConnection: function(pc) {
        var closure = function(){
            this._onIceStateChange(pc);
        };
        pc.onaddstream = this._onAddStream.bind(this);
        pc.oniceconnectionstatechange = closure.bind(this);
        pc.onicecandidate = this._onNewIceCandidate.bind(this);
        pc.addStream(this.stream);
        return pc;
    },

    _sendOffer: function(peerConnection) {
        // Create offer

        peerConnection.createOffer(function(offer) {
            peerConnection.setLocalDescription(offer, function() {
                // Send offer
                this._post({
                    type: 'offer',
                    from: this.me,
                    offer: offer
                });
            }.bind(this));
        }.bind(this), function() {});
    },

    _sendAnswer: function(peerConnection) {
        // Create answer
        peerConnection.createAnswer(function(answer) {
            peerConnection.setLocalDescription(answer, function() {
                // Send answer
                this._post({
                    type: 'answer',
                    from: this.me,
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

MicroEvent.mixin(HiBuddyApp);
HiBuddyApp.prototype.on = HiBuddyApp.prototype.bind;
