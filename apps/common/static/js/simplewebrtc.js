! function(e) {
    if ("function" == typeof bootstrap) bootstrap("simplewebrtc", e);
    else if ("object" == typeof exports) module.exports = e();
    else if ("function" == typeof define && define.amd) define(e);
    else if ("undefined" != typeof ses) {
        if (!ses.ok()) return;
        ses.makeSimpleWebRTC = e
    } else "undefined" != typeof window ? window.SimpleWebRTC = e() : global.SimpleWebRTC = e()
}(function() {
    var define, ses, bootstrap, module, exports;
    return function(e, t, n) {
        function o(n, r) {
            if (!t[n]) {
                if (!e[n]) {
                    var s = "function" == typeof require && require;
                    if (!r && s) return s(n, !0);
                    if (i) return i(n, !0);
                    throw new Error("Cannot find module '" + n + "'")
                }
                var a = t[n] = {
                    exports: {}
                };
                e[n][0].call(a.exports, function(t) {
                    var i = e[n][1][t];
                    return o(i ? i : t)
                }, a, a.exports)
            }
            return t[n].exports
        }
        for (var i = "function" == typeof require && require, r = 0; r < n.length; r++) o(n[r]);
        return o
    }({
        1: [

            function(e, t) {
                function n(e) {
                    var t, n, s = this,
                        a = e || {}, p = this.config = {
                            url: "http://10.2.2.109:8888",
                            debug: !1,
                            localVideoEl: "",
                            remoteVideosEl: "",
                            enableDataChannels: !0,
                            autoRequestMedia: !1,
                            autoRemoveVideos: !0,
                            adjustPeerVolume: !0,
                            peerVolumeWhenSpeaking: .25,
                            media: {
                                video: !0,
                                audio: !0
                            }
                        };
                    this.logger = function() {
                        return e.debug ? e.logger || console : e.logger || c
                    }();
                    for (t in a) this.config[t] = a[t];
                    this.capabilities = r, i.call(this), n = this.connection = u.connect(this.config.url), n.on("connect", function() {
                        s.emit("connectionReady", n.socket.sessionid), s.sessionReady = !0, s.testReadiness()
                    }), n.on("message", function(e) {
                        var t, n = s.webrtc.getPeers(e.from, e.roomType);
                        "offer" === e.type ? (t = n.length ? n[0] : s.webrtc.createPeer({
                            id: e.from,
                            type: e.roomType,
                            enableDataChannels: s.config.enableDataChannels && "screen" !== e.roomType,
                            sharemyscreen: "screen" === e.roomType && !e.broadcaster,
                            broadcaster: "screen" !== e.roomType || e.broadcaster ? null : s.connection.socket.sessionid
                        }), t.handleMessage(e)) : n.length && n.forEach(function(t) {
                            t.handleMessage(e)
                        })
                    }), n.on("remove", function(e) {
                        e.id !== s.connection.socket.sessionid && s.webrtc.removePeers(e.id, e.type)
                    }), e.logger = this.logger, e.debug = !1, this.webrtc = new o(e), ["mute", "unmute", "pauseVideo", "resumeVideo", "pause", "resume", "sendToAll", "sendDirectlyToAll"].forEach(function(e) {
                        s[e] = s.webrtc[e].bind(s.webrtc)
                    }), this.webrtc.on("*", function() {
                        s.emit.apply(s, arguments)
                    }), p.debug && this.on("*", this.logger.log.bind(this.logger, "SimpleWebRTC event:")), this.webrtc.on("localStream", function() {
                        s.testReadiness()
                    }), this.webrtc.on("message", function(e) {
                        s.connection.emit("message", e)
                    }), this.webrtc.on("peerStreamAdded", this.handlePeerStreamAdded.bind(this)), this.webrtc.on("peerStreamRemoved", this.handlePeerStreamRemoved.bind(this)), this.config.adjustPeerVolume && (this.webrtc.on("speaking", this.setVolumeForAll.bind(this, this.config.peerVolumeWhenSpeaking)), this.webrtc.on("stoppedSpeaking", this.setVolumeForAll.bind(this, 1))), n.on("stunservers", function(e) {
                        s.webrtc.config.peerConnectionConfig.iceServers = e, s.emit("stunservers", e)
                    }), n.on("turnservers", function(e) {
                        s.webrtc.config.peerConnectionConfig.iceServers = s.webrtc.config.peerConnectionConfig.iceServers.concat(e), s.emit("turnservers", e)
                    }), this.webrtc.on("audioOn", function() {
                        s.webrtc.sendToAll("unmute", {
                            name: "audio"
                        })
                    }), this.webrtc.on("audioOff", function() {
                        s.webrtc.sendToAll("mute", {
                            name: "audio"
                        })
                    }), this.webrtc.on("videoOn", function() {
                        s.webrtc.sendToAll("unmute", {
                            name: "video"
                        })
                    }), this.webrtc.on("videoOff", function() {
                        s.webrtc.sendToAll("mute", {
                            name: "video"
                        })
                    }), this.config.autoRequestMedia && this.startLocalVideo()
                }
                var o = e("webrtc"),
                    i = e("wildemitter"),
                    r = e("webrtcsupport"),
                    s = e("attachmediastream"),
                    a = e("getscreenmedia"),
                    c = e("mockconsole"),
                    u = e("socket.io-client");
                n.prototype = Object.create(i.prototype, {
                    constructor: {
                        value: n
                    }
                }), n.prototype.leaveRoom = function() {
                    this.roomName && (this.connection.emit("leave"), this.webrtc.peers.forEach(function(e) {
                        e.end()
                    }), this.getLocalScreen() && this.stopScreenShare(), this.emit("leftRoom", this.roomName), this.roomName = void 0)
                }, n.prototype.handlePeerStreamAdded = function(e) {
                    var t = this,
                        n = this.getRemoteVideoContainer(),
                        o = s(e.stream);
                    e.videoEl = o, o.id = this.getDomId(e), n && n.appendChild(o), this.emit("videoAdded", o, e), window.setTimeout(function() {
                        var n = !1;
                        t.webrtc.localStream.getAudioTracks().forEach(function(e) {
                            n = !e.enabled
                        }), n && e.send("mute", {
                            name: "audio"
                        }), n = !1, t.webrtc.localStream.getVideoTracks().forEach(function(e) {
                            n = !e.enabled
                        }), n && e.send("mute", {
                            name: "video"
                        })
                    }, 250)
                }, n.prototype.handlePeerStreamRemoved = function(e) {
                    var t = this.getRemoteVideoContainer(),
                        n = e.videoEl;
                    this.config.autoRemoveVideos && t && n && t.removeChild(n), n && this.emit("videoRemoved", n, e)
                }, n.prototype.getDomId = function(e) {
                    return [e.id, e.type, e.broadcaster ? "broadcasting" : "incoming"].join("_")
                }, n.prototype.setVolumeForAll = function(e) {
                    this.webrtc.peers.forEach(function(t) {
                        t.videoEl && (t.videoEl.volume = e)
                    })
                }, n.prototype.joinRoom = function(e, t) {
                    var n = this;
                    this.roomName = e, this.connection.emit("join", e, function(o, i) {
                        if (o) n.emit("error", o);
                        else {
                            var r, s, a, c;
                            for (r in i.clients) {
                                s = i.clients[r];
                                for (a in s) s[a] && (c = n.webrtc.createPeer({
                                    id: r,
                                    type: a,
                                    enableDataChannels: n.config.enableDataChannels && "screen" !== a,
                                    receiveMedia: {
                                        mandatory: {
                                            OfferToReceiveAudio: "screen" !== a,
                                            OfferToReceiveVideo: !0
                                        }
                                    }
                                }), c.start())
                            }
                        }
                        t && t(o, i), n.emit("joinedRoom", e)
                    })
                }, n.prototype.getEl = function(e) {
                    return "string" == typeof e ? document.getElementById(e) : e
                }, n.prototype.startLocalVideo = function() {
                    var e = this;
                    this.webrtc.startLocalMedia(this.config.media, function(t, n) {
                        t ? e.emit("localMediaError", t) : s(n, e.getLocalVideoContainer(), {
                            muted: !0,
                            mirror: !0
                        })
                    })
                }, n.prototype.stopLocalVideo = function() {
                    this.webrtc.stopLocalMedia()
                }, n.prototype.getLocalVideoContainer = function() {
                    var e = this.getEl(this.config.localVideoEl);
                    if (e && "VIDEO" === e.tagName) return e.oncontextmenu = function() {
                        return !1
                    }, e;
                    if (e) {
                        var t = document.createElement("video");
                        return t.oncontextmenu = function() {
                            return !1
                        }, e.appendChild(t), t
                    }
                }, n.prototype.getRemoteVideoContainer = function() {
                    return this.getEl(this.config.remoteVideosEl)
                }, n.prototype.shareScreen = function(e) {
                    var t = this;
                    a(function(n, o) {
                        var i = document.createElement("video"),
                            r = t.getRemoteVideoContainer();
                        i.oncontextmenu = function() {
                            return !1
                        }, n ? (n.media = "screen", t.emit("localMediaError", n)) : (t.webrtc.localScreen = o, i.id = "localScreen", s(o, i), r && r.appendChild(i), o.onended = function() {
                            t.emit("localScreenRemoved", i), t.stopScreenShare()
                        }, t.emit("localScreenAdded", i), t.connection.emit("shareScreen"), t.webrtc.peers.forEach(function(e) {
                            var n;
                            "video" === e.type && (n = t.webrtc.createPeer({
                                id: e.id,
                                type: "screen",
                                sharemyscreen: !0,
                                enableDataChannels: !1,
                                receiveMedia: {
                                    mandatory: {
                                        OfferToReceiveAudio: !1,
                                        OfferToReceiveVideo: !1
                                    }
                                },
                                broadcaster: t.connection.socket.sessionid
                            }), n.start())
                        })), e && e(n, o)
                    })
                }, n.prototype.getLocalScreen = function() {
                    return this.webrtc.localScreen
                }, n.prototype.stopScreenShare = function() {
                    this.connection.emit("unshareScreen");
                    var e = document.getElementById("localScreen"),
                        t = this.getRemoteVideoContainer(),
                        n = this.getLocalScreen();
                    this.config.autoRemoveVideos && t && e && t.removeChild(e), e && this.emit("videoRemoved", e), n && n.stop(), this.webrtc.peers.forEach(function(e) {
                        e.broadcaster && e.end()
                    }), delete this.webrtc.localScreen
                }, n.prototype.testReadiness = function() {
                    var e = this;
                    this.webrtc.localStream && this.sessionReady && e.emit("readyToCall", e.connection.socket.sessionid)
                }, n.prototype.createRoom = function(e, t) {
                    2 === arguments.length ? this.connection.emit("create", e, t) : this.connection.emit("create", e)
                }, n.prototype.sendFile = function() {
                    return r.dataChannel ? void 0 : this.emit("error", new Error("DataChannelNotSupported"))
                }, t.exports = n
            }, {
                attachmediastream: 5,
                getscreenmedia: 6,
                mockconsole: 7,
                "socket.io-client": 8,
                webrtc: 2,
                webrtcsupport: 4,
                wildemitter: 3
            }
        ],
        4: [

            function(e, t) {
                var n, o = !1,
                    i = !1,
                    r = window.navigator.userAgent.toLowerCase(); - 1 !== r.indexOf("firefox") ? (n = "moz", i = !0) : -1 !== r.indexOf("chrome") && (n = "webkit", o = !0);
                var s = window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
                    a = window.mozRTCIceCandidate || window.RTCIceCandidate,
                    c = window.mozRTCSessionDescription || window.RTCSessionDescription,
                    u = window.webkitMediaStream || window.MediaStream,
                    p = "https:" === window.location.protocol && window.navigator.userAgent.match("Chrome") && parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10) >= 26,
                    l = window.webkitAudioContext || window.AudioContext;
                t.exports = {
                    support: !! s,
                    dataChannel: o || i || s && s.prototype && s.prototype.createDataChannel,
                    prefix: n,
                    webAudio: !(!l || !l.prototype.createMediaStreamSource),
                    mediaStream: !(!u || !u.prototype.removeTrack),
                    screenSharing: !! p,
                    AudioContext: l,
                    PeerConnection: s,
                    SessionDescription: c,
                    IceCandidate: a
                }
            }, {}
        ],
        3: [

            function(e, t) {
                function n() {
                    this.callbacks = {}
                }
                t.exports = n, n.prototype.on = function(e) {
                    var t = 3 === arguments.length,
                        n = t ? arguments[1] : void 0,
                        o = t ? arguments[2] : arguments[1];
                    return o._groupName = n, (this.callbacks[e] = this.callbacks[e] || []).push(o), this
                }, n.prototype.once = function(e) {
                    function t() {
                        n.off(e, t), r.apply(this, arguments)
                    }
                    var n = this,
                        o = 3 === arguments.length,
                        i = o ? arguments[1] : void 0,
                        r = o ? arguments[2] : arguments[1];
                    return this.on(e, i, t), this
                }, n.prototype.releaseGroup = function(e) {
                    var t, n, o, i;
                    for (t in this.callbacks)
                        for (i = this.callbacks[t], n = 0, o = i.length; o > n; n++) i[n]._groupName === e && (i.splice(n, 1), n--, o--);
                    return this
                }, n.prototype.off = function(e, t) {
                    var n, o = this.callbacks[e];
                    return o ? 1 === arguments.length ? (delete this.callbacks[e], this) : (n = o.indexOf(t), o.splice(n, 1), this) : this
                }, n.prototype.emit = function(e) {
                    var t, n, o = [].slice.call(arguments, 1),
                        i = this.callbacks[e],
                        r = this.getWildcardCallbacks(e);
                    if (i)
                        for (t = 0, n = i.length; n > t && i[t]; ++t) i[t].apply(this, o);
                    if (r)
                        for (t = 0, n = r.length; n > t && r[t]; ++t) r[t].apply(this, [e].concat(o));
                    return this
                }, n.prototype.getWildcardCallbacks = function(e) {
                    var t, n, o = [];
                    for (t in this.callbacks) n = t.split("*"), ("*" === t || 2 === n.length && e.slice(0, n[1].length) === n[1]) && (o = o.concat(this.callbacks[t]));
                    return o
                }
            }, {}
        ],
        5: [

            function(e, t) {
                t.exports = function(e, t, n) {
                    var o, i = window.URL,
                        r = {
                            autoplay: !0,
                            mirror: !1,
                            muted: !1
                        }, s = t || document.createElement("video");
                    if (n)
                        for (o in n) r[o] = n[o];
                    if (r.autoplay && (s.autoplay = "autoplay"), r.muted && (s.muted = !0), r.mirror && ["", "moz", "webkit", "o", "ms"].forEach(function(e) {
                        var t = e ? e + "Transform" : "transform";
                        s.style[t] = "scaleX(-1)"
                    }), i && i.createObjectURL) s.src = i.createObjectURL(e);
                    else if (s.srcObject) s.srcObject = e;
                    else {
                        if (!s.mozSrcObject) return !1;
                        s.mozSrcObject = e
                    }
                    return s
                }
            }, {}
        ],
        7: [

            function(e, t) {
                for (var n = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), o = n.length, i = function() {}, r = {}; o--;) r[n[o]] = i;
                t.exports = r
            }, {}
        ],
        8: [

            function(require, module, exports) {
                var io = "undefined" == typeof module ? {} : module.exports;
                ! function() {
                    if (function(e, t) {
                        var n = e;
                        n.version = "0.9.16", n.protocol = 1, n.transports = [], n.j = [], n.sockets = {}, n.connect = function(e, o) {
                            var i, r, s = n.util.parseUri(e);
                            t && t.location && (s.protocol = s.protocol || t.location.protocol.slice(0, -1), s.host = s.host || (t.document ? t.document.domain : t.location.hostname), s.port = s.port || t.location.port), i = n.util.uniqueUri(s);
                            var a = {
                                host: s.host,
                                secure: "https" == s.protocol,
                                port: s.port || ("https" == s.protocol ? 443 : 80),
                                query: s.query || ""
                            };
                            return n.util.merge(a, o), (a["force new connection"] || !n.sockets[i]) && (r = new n.Socket(a)), !a["force new connection"] && r && (n.sockets[i] = r), r = r || n.sockets[i], r.of(s.path.length > 1 ? s.path : "")
                        }
                    }("object" == typeof module ? module.exports : this.io = {}, this), function(e, t) {
                        var n = e.util = {}, o = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                            i = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
                        n.parseUri = function(e) {
                            for (var t = o.exec(e || ""), n = {}, r = 14; r--;) n[i[r]] = t[r] || "";
                            return n
                        }, n.uniqueUri = function(e) {
                            var n = e.protocol,
                                o = e.host,
                                i = e.port;
                            return "document" in t ? (o = o || document.domain, i = i || ("https" == n && "https:" !== document.location.protocol ? 443 : document.location.port)) : (o = o || "localhost", i || "https" != n || (i = 443)), (n || "http") + "://" + o + ":" + (i || 80)
                        }, n.query = function(e, t) {
                            var o = n.chunkQuery(e || ""),
                                i = [];
                            n.merge(o, n.chunkQuery(t || ""));
                            for (var r in o) o.hasOwnProperty(r) && i.push(r + "=" + o[r]);
                            return i.length ? "?" + i.join("&") : ""
                        }, n.chunkQuery = function(e) {
                            for (var t, n = {}, o = e.split("&"), i = 0, r = o.length; r > i; ++i) t = o[i].split("="), t[0] && (n[t[0]] = t[1]);
                            return n
                        };
                        var r = !1;
                        n.load = function(e) {
                            return "document" in t && "complete" === document.readyState || r ? e() : (n.on(t, "load", e, !1), void 0)
                        }, n.on = function(e, t, n, o) {
                            e.attachEvent ? e.attachEvent("on" + t, n) : e.addEventListener && e.addEventListener(t, n, o)
                        }, n.request = function(e) {
                            if (e && "undefined" != typeof XDomainRequest && !n.ua.hasCORS) return new XDomainRequest;
                            if ("undefined" != typeof XMLHttpRequest && (!e || n.ua.hasCORS)) return new XMLHttpRequest;
                            if (!e) try {
                                return new(window[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")
                            } catch (t) {}
                            return null
                        }, "undefined" != typeof window && n.load(function() {
                            r = !0
                        }), n.defer = function(e) {
                            return n.ua.webkit && "undefined" == typeof importScripts ? (n.load(function() {
                                setTimeout(e, 100)
                            }), void 0) : e()
                        }, n.merge = function(e, t, o, i) {
                            var r, s = i || [],
                                a = "undefined" == typeof o ? 2 : o;
                            for (r in t) t.hasOwnProperty(r) && n.indexOf(s, r) < 0 && ("object" == typeof e[r] && a ? n.merge(e[r], t[r], a - 1, s) : (e[r] = t[r], s.push(t[r])));
                            return e
                        }, n.mixin = function(e, t) {
                            n.merge(e.prototype, t.prototype)
                        }, n.inherit = function(e, t) {
                            function n() {}
                            n.prototype = t.prototype, e.prototype = new n
                        }, n.isArray = Array.isArray || function(e) {
                            return "[object Array]" === Object.prototype.toString.call(e)
                        }, n.intersect = function(e, t) {
                            for (var o = [], i = e.length > t.length ? e : t, r = e.length > t.length ? t : e, s = 0, a = r.length; a > s; s++)~ n.indexOf(i, r[s]) && o.push(r[s]);
                            return o
                        }, n.indexOf = function(e, t, n) {
                            for (var o = e.length, n = 0 > n ? 0 > n + o ? 0 : n + o : n || 0; o > n && e[n] !== t; n++);
                            return n >= o ? -1 : n
                        }, n.toArray = function(e) {
                            for (var t = [], n = 0, o = e.length; o > n; n++) t.push(e[n]);
                            return t
                        }, n.ua = {}, n.ua.hasCORS = "undefined" != typeof XMLHttpRequest && function() {
                            try {
                                var e = new XMLHttpRequest
                            } catch (t) {
                                return !1
                            }
                            return void 0 != e.withCredentials
                        }(), n.ua.webkit = "undefined" != typeof navigator && /webkit/i.test(navigator.userAgent), n.ua.iDevice = "undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)
                    }("undefined" != typeof io ? io : module.exports, this), function(e, t) {
                        function n() {}
                        e.EventEmitter = n, n.prototype.on = function(e, n) {
                            return this.$events || (this.$events = {}), this.$events[e] ? t.util.isArray(this.$events[e]) ? this.$events[e].push(n) : this.$events[e] = [this.$events[e], n] : this.$events[e] = n, this
                        }, n.prototype.addListener = n.prototype.on, n.prototype.once = function(e, t) {
                            function n() {
                                o.removeListener(e, n), t.apply(this, arguments)
                            }
                            var o = this;
                            return n.listener = t, this.on(e, n), this
                        }, n.prototype.removeListener = function(e, n) {
                            if (this.$events && this.$events[e]) {
                                var o = this.$events[e];
                                if (t.util.isArray(o)) {
                                    for (var i = -1, r = 0, s = o.length; s > r; r++)
                                        if (o[r] === n || o[r].listener && o[r].listener === n) {
                                            i = r;
                                            break
                                        }
                                    if (0 > i) return this;
                                    o.splice(i, 1), o.length || delete this.$events[e]
                                } else(o === n || o.listener && o.listener === n) && delete this.$events[e]
                            }
                            return this
                        }, n.prototype.removeAllListeners = function(e) {
                            return void 0 === e ? (this.$events = {}, this) : (this.$events && this.$events[e] && (this.$events[e] = null), this)
                        }, n.prototype.listeners = function(e) {
                            return this.$events || (this.$events = {}), this.$events[e] || (this.$events[e] = []), t.util.isArray(this.$events[e]) || (this.$events[e] = [this.$events[e]]), this.$events[e]
                        }, n.prototype.emit = function(e) {
                            if (!this.$events) return !1;
                            var n = this.$events[e];
                            if (!n) return !1;
                            var o = Array.prototype.slice.call(arguments, 1);
                            if ("function" == typeof n) n.apply(this, o);
                            else {
                                if (!t.util.isArray(n)) return !1;
                                for (var i = n.slice(), r = 0, s = i.length; s > r; r++) i[r].apply(this, o)
                            }
                            return !0
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(exports, nativeJSON) {
                        "use strict";

                        function f(e) {
                            return 10 > e ? "0" + e : e
                        }

                        function date(e) {
                            return isFinite(e.valueOf()) ? e.getUTCFullYear() + "-" + f(e.getUTCMonth() + 1) + "-" + f(e.getUTCDate()) + "T" + f(e.getUTCHours()) + ":" + f(e.getUTCMinutes()) + ":" + f(e.getUTCSeconds()) + "Z" : null
                        }

                        function quote(e) {
                            return escapable.lastIndex = 0, escapable.test(e) ? '"' + e.replace(escapable, function(e) {
                                var t = meta[e];
                                return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
                            }) + '"' : '"' + e + '"'
                        }

                        function str(e, t) {
                            var n, o, i, r, s, a = gap,
                                c = t[e];
                            switch (c instanceof Date && (c = date(e)), "function" == typeof rep && (c = rep.call(t, e, c)), typeof c) {
                                case "string":
                                    return quote(c);
                                case "number":
                                    return isFinite(c) ? String(c) : "null";
                                case "boolean":
                                case "null":
                                    return String(c);
                                case "object":
                                    if (!c) return "null";
                                    if (gap += indent, s = [], "[object Array]" === Object.prototype.toString.apply(c)) {
                                        for (r = c.length, n = 0; r > n; n += 1) s[n] = str(n, c) || "null";
                                        return i = 0 === s.length ? "[]" : gap ? "[\n" + gap + s.join(",\n" + gap) + "\n" + a + "]" : "[" + s.join(",") + "]", gap = a, i
                                    }
                                    if (rep && "object" == typeof rep)
                                        for (r = rep.length, n = 0; r > n; n += 1) "string" == typeof rep[n] && (o = rep[n], i = str(o, c), i && s.push(quote(o) + (gap ? ": " : ":") + i));
                                    else
                                        for (o in c) Object.prototype.hasOwnProperty.call(c, o) && (i = str(o, c), i && s.push(quote(o) + (gap ? ": " : ":") + i));
                                    return i = 0 === s.length ? "{}" : gap ? "{\n" + gap + s.join(",\n" + gap) + "\n" + a + "}" : "{" + s.join(",") + "}", gap = a, i
                            }
                        }
                        if (nativeJSON && nativeJSON.parse) return exports.JSON = {
                            parse: nativeJSON.parse,
                            stringify: nativeJSON.stringify
                        };
                        var JSON = exports.JSON = {}, cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                            gap, indent, meta = {
                                "\b": "\\b",
                                "   ": "\\t",
                                "\n": "\\n",
                                "\f": "\\f",
                                "\r": "\\r",
                                '"': '\\"',
                                "\\": "\\\\"
                            }, rep;
                        JSON.stringify = function(e, t, n) {
                            var o;
                            if (gap = "", indent = "", "number" == typeof n)
                                for (o = 0; n > o; o += 1) indent += " ";
                            else "string" == typeof n && (indent = n); if (rep = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length)) throw new Error("JSON.stringify");
                            return str("", {
                                "": e
                            })
                        }, JSON.parse = function(text, reviver) {
                            function walk(e, t) {
                                var n, o, i = e[t];
                                if (i && "object" == typeof i)
                                    for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (o = walk(i, n), void 0 !== o ? i[n] = o : delete i[n]);
                                return reviver.call(e, t, i)
                            }
                            var j;
                            if (text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function(e) {
                                return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
                            })), /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({
                                "": j
                            }, "") : j;
                            throw new SyntaxError("JSON.parse")
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof JSON ? JSON : void 0), function(e, t) {
                        var n = e.parser = {}, o = n.packets = ["disconnect", "connect", "heartbeat", "message", "json", "event", "ack", "error", "noop"],
                            i = n.reasons = ["transport not supported", "client not handshaken", "unauthorized"],
                            r = n.advice = ["reconnect"],
                            s = t.JSON,
                            a = t.util.indexOf;
                        n.encodePacket = function(e) {
                            var t = a(o, e.type),
                                n = e.id || "",
                                c = e.endpoint || "",
                                u = e.ack,
                                p = null;
                            switch (e.type) {
                                case "error":
                                    var l = e.reason ? a(i, e.reason) : "",
                                        f = e.advice ? a(r, e.advice) : "";
                                    ("" !== l || "" !== f) && (p = l + ("" !== f ? "+" + f : ""));
                                    break;
                                case "message":
                                    "" !== e.data && (p = e.data);
                                    break;
                                case "event":
                                    var h = {
                                        name: e.name
                                    };
                                    e.args && e.args.length && (h.args = e.args), p = s.stringify(h);
                                    break;
                                case "json":
                                    p = s.stringify(e.data);
                                    break;
                                case "connect":
                                    e.qs && (p = e.qs);
                                    break;
                                case "ack":
                                    p = e.ackId + (e.args && e.args.length ? "+" + s.stringify(e.args) : "")
                            }
                            var d = [t, n + ("data" == u ? "+" : ""), c];
                            return null !== p && void 0 !== p && d.push(p), d.join(":")
                        }, n.encodePayload = function(e) {
                            var t = "";
                            if (1 == e.length) return e[0];
                            for (var n = 0, o = e.length; o > n; n++) {
                                var i = e[n];
                                t += "ï¿½" + i.length + "ï¿½" + e[n]
                            }
                            return t
                        };
                        var c = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
                        n.decodePacket = function(e) {
                            var t = e.match(c);
                            if (!t) return {};
                            var n = t[2] || "",
                                e = t[5] || "",
                                a = {
                                    type: o[t[1]],
                                    endpoint: t[4] || ""
                                };
                            switch (n && (a.id = n, a.ack = t[3] ? "data" : !0), a.type) {
                                case "error":
                                    var t = e.split("+");
                                    a.reason = i[t[0]] || "", a.advice = r[t[1]] || "";
                                    break;
                                case "message":
                                    a.data = e || "";
                                    break;
                                case "event":
                                    try {
                                        var u = s.parse(e);
                                        a.name = u.name, a.args = u.args
                                    } catch (p) {}
                                    a.args = a.args || [];
                                    break;
                                case "json":
                                    try {
                                        a.data = s.parse(e)
                                    } catch (p) {}
                                    break;
                                case "connect":
                                    a.qs = e || "";
                                    break;
                                case "ack":
                                    var t = e.match(/^([0-9]+)(\+)?(.*)/);
                                    if (t && (a.ackId = t[1], a.args = [], t[3])) try {
                                        a.args = t[3] ? s.parse(t[3]) : []
                                    } catch (p) {}
                                    break;
                                case "disconnect":
                                case "heartbeat":
                            }
                            return a
                        }, n.decodePayload = function(e) {
                            if ("ï¿½" == e.charAt(0)) {
                                for (var t = [], o = 1, i = ""; o < e.length; o++) "ï¿½" == e.charAt(o) ? (t.push(n.decodePacket(e.substr(o + 1).substr(0, i))), o += Number(i) + 1, i = "") : i += e.charAt(o);
                                return t
                            }
                            return [n.decodePacket(e)]
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(e, t) {
                        function n(e, t) {
                            this.socket = e, this.sessid = t
                        }
                        e.Transport = n, t.util.mixin(n, t.EventEmitter), n.prototype.heartbeats = function() {
                            return !0
                        }, n.prototype.onData = function(e) {
                            if (this.clearCloseTimeout(), (this.socket.connected || this.socket.connecting || this.socket.reconnecting) && this.setCloseTimeout(), "" !== e) {
                                var n = t.parser.decodePayload(e);
                                if (n && n.length)
                                    for (var o = 0, i = n.length; i > o; o++) this.onPacket(n[o])
                            }
                            return this
                        }, n.prototype.onPacket = function(e) {
                            return this.socket.setHeartbeatTimeout(), "heartbeat" == e.type ? this.onHeartbeat() : ("connect" == e.type && "" == e.endpoint && this.onConnect(), "error" == e.type && "reconnect" == e.advice && (this.isOpen = !1), this.socket.onPacket(e), this)
                        }, n.prototype.setCloseTimeout = function() {
                            if (!this.closeTimeout) {
                                var e = this;
                                this.closeTimeout = setTimeout(function() {
                                    e.onDisconnect()
                                }, this.socket.closeTimeout)
                            }
                        }, n.prototype.onDisconnect = function() {
                            return this.isOpen && this.close(), this.clearTimeouts(), this.socket.onDisconnect(), this
                        }, n.prototype.onConnect = function() {
                            return this.socket.onConnect(), this
                        }, n.prototype.clearCloseTimeout = function() {
                            this.closeTimeout && (clearTimeout(this.closeTimeout), this.closeTimeout = null)
                        }, n.prototype.clearTimeouts = function() {
                            this.clearCloseTimeout(), this.reopenTimeout && clearTimeout(this.reopenTimeout)
                        }, n.prototype.packet = function(e) {
                            this.send(t.parser.encodePacket(e))
                        }, n.prototype.onHeartbeat = function() {
                            this.packet({
                                type: "heartbeat"
                            })
                        }, n.prototype.onOpen = function() {
                            this.isOpen = !0, this.clearCloseTimeout(), this.socket.onOpen()
                        }, n.prototype.onClose = function() {
                            this.isOpen = !1, this.socket.onClose(), this.onDisconnect()
                        }, n.prototype.prepareUrl = function() {
                            var e = this.socket.options;
                            return this.scheme() + "://" + e.host + ":" + e.port + "/" + e.resource + "/" + t.protocol + "/" + this.name + "/" + this.sessid
                        }, n.prototype.ready = function(e, t) {
                            t.call(this)
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(e, t, n) {
                        function o(e) {
                            if (this.options = {
                                port: 80,
                                secure: !1,
                                document: "document" in n ? document : !1,
                                resource: "socket.io",
                                transports: t.transports,
                                "connect timeout": 1e4,
                                "try multiple transports": !0,
                                reconnect: !0,
                                "reconnection delay": 500,
                                "reconnection limit": 1 / 0,
                                "reopen delay": 3e3,
                                "max reconnection attempts": 10,
                                "sync disconnect on unload": !1,
                                "auto connect": !0,
                                "flash policy port": 10843,
                                manualFlush: !1
                            }, t.util.merge(this.options, e), this.connected = !1, this.open = !1, this.connecting = !1, this.reconnecting = !1, this.namespaces = {}, this.buffer = [], this.doBuffer = !1, this.options["sync disconnect on unload"] && (!this.isXDomain() || t.util.ua.hasCORS)) {
                                var o = this;
                                t.util.on(n, "beforeunload", function() {
                                    o.disconnectSync()
                                }, !1)
                            }
                            this.options["auto connect"] && this.connect()
                        }

                        function i() {}
                        e.Socket = o, t.util.mixin(o, t.EventEmitter), o.prototype.of = function(e) {
                            return this.namespaces[e] || (this.namespaces[e] = new t.SocketNamespace(this, e), "" !== e && this.namespaces[e].packet({
                                type: "connect"
                            })), this.namespaces[e]
                        }, o.prototype.publish = function() {
                            this.emit.apply(this, arguments);
                            var e;
                            for (var t in this.namespaces) this.namespaces.hasOwnProperty(t) && (e = this.of(t), e.$emit.apply(e, arguments))
                        }, o.prototype.handshake = function(e) {
                            function n(t) {
                                t instanceof Error ? (o.connecting = !1, o.onError(t.message)) : e.apply(null, t.split(":"))
                            }
                            var o = this,
                                r = this.options,
                                s = ["http" + (r.secure ? "s" : "") + ":/", r.host + ":" + r.port, r.resource, t.protocol, t.util.query(this.options.query, "t=" + +new Date)].join("/");
                            if (this.isXDomain() && !t.util.ua.hasCORS) {
                                var a = document.getElementsByTagName("script")[0],
                                    c = document.createElement("script");
                                c.src = s + "&jsonp=" + t.j.length, a.parentNode.insertBefore(c, a), t.j.push(function(e) {
                                    n(e), c.parentNode.removeChild(c)
                                })
                            } else {
                                var u = t.util.request();
                                u.open("GET", s, !0), this.isXDomain() && (u.withCredentials = !0), u.onreadystatechange = function() {
                                    4 == u.readyState && (u.onreadystatechange = i, 200 == u.status ? n(u.responseText) : 403 == u.status ? o.onError(u.responseText) : (o.connecting = !1, !o.reconnecting && o.onError(u.responseText)))
                                }, u.send(null)
                            }
                        }, o.prototype.getTransport = function(e) {
                            for (var n, o = e || this.transports, i = 0; n = o[i]; i++)
                                if (t.Transport[n] && t.Transport[n].check(this) && (!this.isXDomain() || t.Transport[n].xdomainCheck(this))) return new t.Transport[n](this, this.sessionid);
                            return null
                        }, o.prototype.connect = function(e) {
                            if (this.connecting) return this;
                            var n = this;
                            return n.connecting = !0, this.handshake(function(o, i, r, s) {
                                function a(e) {
                                    return n.transport && n.transport.clearTimeouts(), n.transport = n.getTransport(e), n.transport ? (n.transport.ready(n, function() {
                                        n.connecting = !0, n.publish("connecting", n.transport.name), n.transport.open(), n.options["connect timeout"] && (n.connectTimeoutTimer = setTimeout(function() {
                                            if (!n.connected && (n.connecting = !1, n.options["try multiple transports"])) {
                                                for (var e = n.transports; e.length > 0 && e.splice(0, 1)[0] != n.transport.name;);
                                                e.length ? a(e) : n.publish("connect_failed")
                                            }
                                        }, n.options["connect timeout"]))
                                    }), void 0) : n.publish("connect_failed")
                                }
                                n.sessionid = o, n.closeTimeout = 1e3 * r, n.heartbeatTimeout = 1e3 * i, n.transports || (n.transports = n.origTransports = s ? t.util.intersect(s.split(","), n.options.transports) : n.options.transports), n.setHeartbeatTimeout(), a(n.transports), n.once("connect", function() {
                                    clearTimeout(n.connectTimeoutTimer), e && "function" == typeof e && e()
                                })
                            }), this
                        }, o.prototype.setHeartbeatTimeout = function() {
                            if (clearTimeout(this.heartbeatTimeoutTimer), !this.transport || this.transport.heartbeats()) {
                                var e = this;
                                this.heartbeatTimeoutTimer = setTimeout(function() {
                                    e.transport.onClose()
                                }, this.heartbeatTimeout)
                            }
                        }, o.prototype.packet = function(e) {
                            return this.connected && !this.doBuffer ? this.transport.packet(e) : this.buffer.push(e), this
                        }, o.prototype.setBuffer = function(e) {
                            this.doBuffer = e, !e && this.connected && this.buffer.length && (this.options.manualFlush || this.flushBuffer())
                        }, o.prototype.flushBuffer = function() {
                            this.transport.payload(this.buffer), this.buffer = []
                        }, o.prototype.disconnect = function() {
                            return (this.connected || this.connecting) && (this.open && this.of("").packet({
                                type: "disconnect"
                            }), this.onDisconnect("booted")), this
                        }, o.prototype.disconnectSync = function() {
                            var e = t.util.request(),
                                n = ["http" + (this.options.secure ? "s" : "") + ":/", this.options.host + ":" + this.options.port, this.options.resource, t.protocol, "", this.sessionid].join("/") + "/?disconnect=1";
                            e.open("GET", n, !1), e.send(null), this.onDisconnect("booted")
                        }, o.prototype.isXDomain = function() {
                            var e = n.location.port || ("https:" == n.location.protocol ? 443 : 80);
                            return this.options.host !== n.location.hostname || this.options.port != e
                        }, o.prototype.onConnect = function() {
                            this.connected || (this.connected = !0, this.connecting = !1, this.doBuffer || this.setBuffer(!1), this.emit("connect"))
                        }, o.prototype.onOpen = function() {
                            this.open = !0
                        }, o.prototype.onClose = function() {
                            this.open = !1, clearTimeout(this.heartbeatTimeoutTimer)
                        }, o.prototype.onPacket = function(e) {
                            this.of(e.endpoint).onPacket(e)
                        }, o.prototype.onError = function(e) {
                            e && e.advice && "reconnect" === e.advice && (this.connected || this.connecting) && (this.disconnect(), this.options.reconnect && this.reconnect()), this.publish("error", e && e.reason ? e.reason : e)
                        }, o.prototype.onDisconnect = function(e) {
                            var t = this.connected,
                                n = this.connecting;
                            this.connected = !1, this.connecting = !1, this.open = !1, (t || n) && (this.transport.close(), this.transport.clearTimeouts(), t && (this.publish("disconnect", e), "booted" != e && this.options.reconnect && !this.reconnecting && this.reconnect()))
                        }, o.prototype.reconnect = function() {
                            function e() {
                                if (n.connected) {
                                    for (var e in n.namespaces) n.namespaces.hasOwnProperty(e) && "" !== e && n.namespaces[e].packet({
                                        type: "connect"
                                    });
                                    n.publish("reconnect", n.transport.name, n.reconnectionAttempts)
                                }
                                clearTimeout(n.reconnectionTimer), n.removeListener("connect_failed", t), n.removeListener("connect", t), n.reconnecting = !1, delete n.reconnectionAttempts, delete n.reconnectionDelay, delete n.reconnectionTimer, delete n.redoTransports, n.options["try multiple transports"] = i
                            }

                            function t() {
                                return n.reconnecting ? n.connected ? e() : n.connecting && n.reconnecting ? n.reconnectionTimer = setTimeout(t, 1e3) : (n.reconnectionAttempts++ >= o ? n.redoTransports ? (n.publish("reconnect_failed"), e()) : (n.on("connect_failed", t), n.options["try multiple transports"] = !0, n.transports = n.origTransports, n.transport = n.getTransport(), n.redoTransports = !0, n.connect()) : (n.reconnectionDelay < r && (n.reconnectionDelay *= 2), n.connect(), n.publish("reconnecting", n.reconnectionDelay, n.reconnectionAttempts), n.reconnectionTimer = setTimeout(t, n.reconnectionDelay)), void 0) : void 0
                            }
                            this.reconnecting = !0, this.reconnectionAttempts = 0, this.reconnectionDelay = this.options["reconnection delay"];
                            var n = this,
                                o = this.options["max reconnection attempts"],
                                i = this.options["try multiple transports"],
                                r = this.options["reconnection limit"];
                            this.options["try multiple transports"] = !1, this.reconnectionTimer = setTimeout(t, this.reconnectionDelay), this.on("connect", t)
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), function(e, t) {
                        function n(e, t) {
                            this.socket = e, this.name = t || "", this.flags = {}, this.json = new o(this, "json"), this.ackPackets = 0, this.acks = {}
                        }

                        function o(e, t) {
                            this.namespace = e, this.name = t
                        }
                        e.SocketNamespace = n, t.util.mixin(n, t.EventEmitter), n.prototype.$emit = t.EventEmitter.prototype.emit, n.prototype.of = function() {
                            return this.socket.of.apply(this.socket, arguments)
                        }, n.prototype.packet = function(e) {
                            return e.endpoint = this.name, this.socket.packet(e), this.flags = {}, this
                        }, n.prototype.send = function(e, t) {
                            var n = {
                                type: this.flags.json ? "json" : "message",
                                data: e
                            };
                            return "function" == typeof t && (n.id = ++this.ackPackets, n.ack = !0, this.acks[n.id] = t), this.packet(n)
                        }, n.prototype.emit = function(e) {
                            var t = Array.prototype.slice.call(arguments, 1),
                                n = t[t.length - 1],
                                o = {
                                    type: "event",
                                    name: e
                                };
                            return "function" == typeof n && (o.id = ++this.ackPackets, o.ack = "data", this.acks[o.id] = n, t = t.slice(0, t.length - 1)), o.args = t, this.packet(o)
                        }, n.prototype.disconnect = function() {
                            return "" === this.name ? this.socket.disconnect() : (this.packet({
                                type: "disconnect"
                            }), this.$emit("disconnect")), this
                        }, n.prototype.onPacket = function(e) {
                            function n() {
                                o.packet({
                                    type: "ack",
                                    args: t.util.toArray(arguments),
                                    ackId: e.id
                                })
                            }
                            var o = this;
                            switch (e.type) {
                                case "connect":
                                    this.$emit("connect");
                                    break;
                                case "disconnect":
                                    "" === this.name ? this.socket.onDisconnect(e.reason || "booted") : this.$emit("disconnect", e.reason);
                                    break;
                                case "message":
                                case "json":
                                    var i = ["message", e.data];
                                    "data" == e.ack ? i.push(n) : e.ack && this.packet({
                                        type: "ack",
                                        ackId: e.id
                                    }), this.$emit.apply(this, i);
                                    break;
                                case "event":
                                    var i = [e.name].concat(e.args);
                                    "data" == e.ack && i.push(n), this.$emit.apply(this, i);
                                    break;
                                case "ack":
                                    this.acks[e.ackId] && (this.acks[e.ackId].apply(this, e.args), delete this.acks[e.ackId]);
                                    break;
                                case "error":
                                    e.advice ? this.socket.onError(e) : "unauthorized" == e.reason ? this.$emit("connect_failed", e.reason) : this.$emit("error", e.reason)
                            }
                        }, o.prototype.send = function() {
                            this.namespace.flags[this.name] = !0, this.namespace.send.apply(this.namespace, arguments)
                        }, o.prototype.emit = function() {
                            this.namespace.flags[this.name] = !0, this.namespace.emit.apply(this.namespace, arguments)
                        }
                    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports), function(e, t, n) {
                        function o() {
                            t.Transport.apply(this, arguments)
                        }
                        e.websocket = o, t.util.inherit(o, t.Transport), o.prototype.name = "websocket", o.prototype.open = function() {
                            var e, o = t.util.query(this.socket.options.query),
                                i = this;
                            return e || (e = n.MozWebSocket || n.WebSocket), this.websocket = new e(this.prepareUrl() + o), this.websocket.onopen = function() {
                                i.onOpen(), i.socket.setBuffer(!1)
                            }, this.websocket.onmessage = function(e) {
                                i.onData(e.data)
                            }, this.websocket.onclose = function() {
                                i.onClose(), i.socket.setBuffer(!0)
                            }, this.websocket.onerror = function(e) {
                                i.onError(e)
                            }, this
                        }, o.prototype.send = t.util.ua.iDevice ? function(e) {
                            var t = this;
                            return setTimeout(function() {
                                t.websocket.send(e)
                            }, 0), this
                        } : function(e) {
                            return this.websocket.send(e), this
                        }, o.prototype.payload = function(e) {
                            for (var t = 0, n = e.length; n > t; t++) this.packet(e[t]);
                            return this
                        }, o.prototype.close = function() {
                            return this.websocket.close(), this
                        }, o.prototype.onError = function(e) {
                            this.socket.onError(e)
                        }, o.prototype.scheme = function() {
                            return this.socket.options.secure ? "wss" : "ws"
                        }, o.check = function() {
                            return "WebSocket" in n && !("__addTask" in WebSocket) || "MozWebSocket" in n
                        }, o.xdomainCheck = function() {
                            return !0
                        }, t.transports.push("websocket")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), function(e, t) {
                        function n() {
                            t.Transport.websocket.apply(this, arguments)
                        }
                        e.flashsocket = n, t.util.inherit(n, t.Transport.websocket), n.prototype.name = "flashsocket", n.prototype.open = function() {
                            var e = this,
                                n = arguments;
                            return WebSocket.__addTask(function() {
                                t.Transport.websocket.prototype.open.apply(e, n)
                            }), this
                        }, n.prototype.send = function() {
                            var e = this,
                                n = arguments;
                            return WebSocket.__addTask(function() {
                                t.Transport.websocket.prototype.send.apply(e, n)
                            }), this
                        }, n.prototype.close = function() {
                            return WebSocket.__tasks.length = 0, t.Transport.websocket.prototype.close.call(this), this
                        }, n.prototype.ready = function(e, o) {
                            function i() {
                                var t = e.options,
                                    i = t["flash policy port"],
                                    s = ["http" + (t.secure ? "s" : "") + ":/", t.host + ":" + t.port, t.resource, "static/flashsocket", "WebSocketMain" + (e.isXDomain() ? "Insecure" : "") + ".swf"];
                                n.loaded || ("undefined" == typeof WEB_SOCKET_SWF_LOCATION && (WEB_SOCKET_SWF_LOCATION = s.join("/")), 843 !== i && WebSocket.loadFlashPolicyFile("xmlsocket://" + t.host + ":" + i), WebSocket.__initialize(), n.loaded = !0), o.call(r)
                            }
                            var r = this;
                            return document.body ? i() : (t.util.load(i), void 0)
                        }, n.check = function() {
                            return "undefined" != typeof WebSocket && "__initialize" in WebSocket && swfobject ? swfobject.getFlashPlayerVersion().major >= 10 : !1
                        }, n.xdomainCheck = function() {
                            return !0
                        }, "undefined" != typeof window && (WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = !0), t.transports.push("flashsocket")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports), "undefined" != typeof window) var swfobject = function() {
                        function e() {
                            if (!X) {
                                try {
                                    var e = M.getElementsByTagName("body")[0].appendChild(y("span"));
                                    e.parentNode.removeChild(e)
                                } catch (t) {
                                    return
                                }
                                X = !0;
                                for (var n = q.length, o = 0; n > o; o++) q[o]()
                            }
                        }

                        function t(e) {
                            X ? e() : q[q.length] = e
                        }

                        function n(e) {
                            if (typeof P.addEventListener != O) P.addEventListener("load", e, !1);
                            else if (typeof M.addEventListener != O) M.addEventListener("load", e, !1);
                            else if (typeof P.attachEvent != O) g(P, "onload", e);
                            else if ("function" == typeof P.onload) {
                                var t = P.onload;
                                P.onload = function() {
                                    t(), e()
                                }
                            } else P.onload = e
                        }

                        function o() {
                            W ? i() : r()
                        }

                        function i() {
                            var e = M.getElementsByTagName("body")[0],
                                t = y(A);
                            t.setAttribute("type", R);
                            var n = e.appendChild(t);
                            if (n) {
                                var o = 0;
                                ! function() {
                                    if (typeof n.GetVariable != O) {
                                        var i = n.GetVariable("$version");
                                        i && (i = i.split(" ")[1].split(","), J.pv = [parseInt(i[0], 10), parseInt(i[1], 10), parseInt(i[2], 10)])
                                    } else if (10 > o) return o++, setTimeout(arguments.callee, 10), void 0;
                                    e.removeChild(t), n = null, r()
                                }()
                            } else r()
                        }

                        function r() {
                            var e = $.length;
                            if (e > 0)
                                for (var t = 0; e > t; t++) {
                                    var n = $[t].id,
                                        o = $[t].callbackFn,
                                        i = {
                                            success: !1,
                                            id: n
                                        };
                                    if (J.pv[0] > 0) {
                                        var r = m(n);
                                        if (r)
                                            if (!v($[t].swfVersion) || J.wk && J.wk < 312)
                                                if ($[t].expressInstall && a()) {
                                                    var p = {};
                                                    p.data = $[t].expressInstall, p.width = r.getAttribute("width") || "0", p.height = r.getAttribute("height") || "0", r.getAttribute("class") && (p.styleclass = r.getAttribute("class")), r.getAttribute("align") && (p.align = r.getAttribute("align"));
                                                    for (var l = {}, f = r.getElementsByTagName("param"), h = f.length, d = 0; h > d; d++) "movie" != f[d].getAttribute("name").toLowerCase() && (l[f[d].getAttribute("name")] = f[d].getAttribute("value"));
                                                    c(p, l, n, o)
                                                } else u(r), o && o(i);
                                                else w(n, !0), o && (i.success = !0, i.ref = s(n), o(i))
                                    } else if (w(n, !0), o) {
                                        var y = s(n);
                                        y && typeof y.SetVariable != O && (i.success = !0, i.ref = y), o(i)
                                    }
                                }
                        }

                        function s(e) {
                            var t = null,
                                n = m(e);
                            if (n && "OBJECT" == n.nodeName)
                                if (typeof n.SetVariable != O) t = n;
                                else {
                                    var o = n.getElementsByTagName(A)[0];
                                    o && (t = o)
                                }
                            return t
                        }

                        function a() {
                            return !U && v("6.0.65") && (J.win || J.mac) && !(J.wk && J.wk < 312)
                        }

                        function c(e, t, n, o) {
                            U = !0, _ = o || null, C = {
                                success: !1,
                                id: n
                            };
                            var i = m(n);
                            if (i) {
                                "OBJECT" == i.nodeName ? (S = p(i), T = null) : (S = i, T = n), e.id = N, (typeof e.width == O || !/%$/.test(e.width) && parseInt(e.width, 10) < 310) && (e.width = "310"), (typeof e.height == O || !/%$/.test(e.height) && parseInt(e.height, 10) < 137) && (e.height = "137"), M.title = M.title.slice(0, 47) + " - Flash Player Installation";
                                var r = J.ie && J.win ? ["Active"].concat("").join("X") : "PlugIn",
                                    s = "MMredirectURL=" + P.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + r + "&MMdoctitle=" + M.title;
                                if (typeof t.flashvars != O ? t.flashvars += "&" + s : t.flashvars = s, J.ie && J.win && 4 != i.readyState) {
                                    var a = y("div");
                                    n += "SWFObjectNew", a.setAttribute("id", n), i.parentNode.insertBefore(a, i), i.style.display = "none",
                                    function() {
                                        4 == i.readyState ? i.parentNode.removeChild(i) : setTimeout(arguments.callee, 10)
                                    }()
                                }
                                l(e, t, n)
                            }
                        }

                        function u(e) {
                            if (J.ie && J.win && 4 != e.readyState) {
                                var t = y("div");
                                e.parentNode.insertBefore(t, e), t.parentNode.replaceChild(p(e), t), e.style.display = "none",
                                function() {
                                    4 == e.readyState ? e.parentNode.removeChild(e) : setTimeout(arguments.callee, 10)
                                }()
                            } else e.parentNode.replaceChild(p(e), e)
                        }

                        function p(e) {
                            var t = y("div");
                            if (J.win && J.ie) t.innerHTML = e.innerHTML;
                            else {
                                var n = e.getElementsByTagName(A)[0];
                                if (n) {
                                    var o = n.childNodes;
                                    if (o)
                                        for (var i = o.length, r = 0; i > r; r++) 1 == o[r].nodeType && "PARAM" == o[r].nodeName || 8 == o[r].nodeType || t.appendChild(o[r].cloneNode(!0))
                                }
                            }
                            return t
                        }

                        function l(e, t, n) {
                            var o, i = m(n);
                            if (J.wk && J.wk < 312) return o;
                            if (i)
                                if (typeof e.id == O && (e.id = n), J.ie && J.win) {
                                    var r = "";
                                    for (var s in e) e[s] != Object.prototype[s] && ("data" == s.toLowerCase() ? t.movie = e[s] : "styleclass" == s.toLowerCase() ? r += ' class="' + e[s] + '"' : "classid" != s.toLowerCase() && (r += " " + s + '="' + e[s] + '"'));
                                    var a = "";
                                    for (var c in t) t[c] != Object.prototype[c] && (a += '<param name="' + c + '" value="' + t[c] + '" />');
                                    i.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + r + ">" + a + "</object>", F[F.length] = e.id, o = m(e.id)
                                } else {
                                    var u = y(A);
                                    u.setAttribute("type", R);
                                    for (var p in e) e[p] != Object.prototype[p] && ("styleclass" == p.toLowerCase() ? u.setAttribute("class", e[p]) : "classid" != p.toLowerCase() && u.setAttribute(p, e[p]));
                                    for (var l in t) t[l] != Object.prototype[l] && "movie" != l.toLowerCase() && f(u, l, t[l]);
                                    i.parentNode.replaceChild(u, i), o = u
                                }
                            return o
                        }

                        function f(e, t, n) {
                            var o = y("param");
                            o.setAttribute("name", t), o.setAttribute("value", n), e.appendChild(o)
                        }

                        function h(e) {
                            var t = m(e);
                            t && "OBJECT" == t.nodeName && (J.ie && J.win ? (t.style.display = "none", function() {
                                4 == t.readyState ? d(e) : setTimeout(arguments.callee, 10)
                            }()) : t.parentNode.removeChild(t))
                        }

                        function d(e) {
                            var t = m(e);
                            if (t) {
                                for (var n in t) "function" == typeof t[n] && (t[n] = null);
                                t.parentNode.removeChild(t)
                            }
                        }

                        function m(e) {
                            var t = null;
                            try {
                                t = M.getElementById(e)
                            } catch (n) {}
                            return t
                        }

                        function y(e) {
                            return M.createElement(e)
                        }

                        function g(e, t, n) {
                            e.attachEvent(t, n), B[B.length] = [e, t, n]
                        }

                        function v(e) {
                            var t = J.pv,
                                n = e.split(".");
                            return n[0] = parseInt(n[0], 10), n[1] = parseInt(n[1], 10) || 0, n[2] = parseInt(n[2], 10) || 0, t[0] > n[0] || t[0] == n[0] && t[1] > n[1] || t[0] == n[0] && t[1] == n[1] && t[2] >= n[2] ? !0 : !1
                        }

                        function b(e, t, n, o) {
                            if (!J.ie || !J.mac) {
                                var i = M.getElementsByTagName("head")[0];
                                if (i) {
                                    var r = n && "string" == typeof n ? n : "screen";
                                    if (o && (x = null, E = null), !x || E != r) {
                                        var s = y("style");
                                        s.setAttribute("type", "text/css"), s.setAttribute("media", r), x = i.appendChild(s), J.ie && J.win && typeof M.styleSheets != O && M.styleSheets.length > 0 && (x = M.styleSheets[M.styleSheets.length - 1]), E = r
                                    }
                                    J.ie && J.win ? x && typeof x.addRule == A && x.addRule(e, t) : x && typeof M.createTextNode != O && x.appendChild(M.createTextNode(e + " {" + t + "}"))
                                }
                            }
                        }

                        function w(e, t) {
                            if (H) {
                                var n = t ? "visible" : "hidden";
                                X && m(e) ? m(e).style.visibility = n : b("#" + e, "visibility:" + n)
                            }
                        }

                        function k(e) {
                            var t = /[\\\"<>\.;]/,
                                n = null != t.exec(e);
                            return n && typeof encodeURIComponent != O ? encodeURIComponent(e) : e
                        }
                        var S, T, _, C, x, E, O = "undefined",
                            A = "object",
                            j = "Shockwave Flash",
                            D = "ShockwaveFlash.ShockwaveFlash",
                            R = "application/x-shockwave-flash",
                            N = "SWFObjectExprInst",
                            I = "onreadystatechange",
                            P = window,
                            M = document,
                            L = navigator,
                            W = !1,
                            q = [o],
                            $ = [],
                            F = [],
                            B = [],
                            X = !1,
                            U = !1,
                            H = !0,
                            J = function() {
                                var e = typeof M.getElementById != O && typeof M.getElementsByTagName != O && typeof M.createElement != O,
                                    t = L.userAgent.toLowerCase(),
                                    n = L.platform.toLowerCase(),
                                    o = n ? /win/.test(n) : /win/.test(t),
                                    i = n ? /mac/.test(n) : /mac/.test(t),
                                    r = /webkit/.test(t) ? parseFloat(t.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : !1,
                                    s = !1,
                                    a = [0, 0, 0],
                                    c = null;
                                if (typeof L.plugins != O && typeof L.plugins[j] == A) c = L.plugins[j].description, !c || typeof L.mimeTypes != O && L.mimeTypes[R] && !L.mimeTypes[R].enabledPlugin || (W = !0, s = !1, c = c.replace(/^.*\s+(\S+\s+\S+$)/, "$1"), a[0] = parseInt(c.replace(/^(.*)\..*$/, "$1"), 10), a[1] = parseInt(c.replace(/^.*\.(.*)\s.*$/, "$1"), 10), a[2] = /[a-zA-Z]/.test(c) ? parseInt(c.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0);
                                else if (typeof P[["Active"].concat("Object").join("X")] != O) try {
                                    var u = new(window[["Active"].concat("Object").join("X")])(D);
                                    u && (c = u.GetVariable("$version"), c && (s = !0, c = c.split(" ")[1].split(","), a = [parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10)]))
                                } catch (p) {}
                                return {
                                    w3: e,
                                    pv: a,
                                    wk: r,
                                    ie: s,
                                    win: o,
                                    mac: i
                                }
                            }();
                        return function() {
                            J.w3 && ((typeof M.readyState != O && "complete" == M.readyState || typeof M.readyState == O && (M.getElementsByTagName("body")[0] || M.body)) && e(), X || (typeof M.addEventListener != O && M.addEventListener("DOMContentLoaded", e, !1), J.ie && J.win && (M.attachEvent(I, function() {
                                "complete" == M.readyState && (M.detachEvent(I, arguments.callee), e())
                            }), P == top && function() {
                                if (!X) {
                                    try {
                                        M.documentElement.doScroll("left")
                                    } catch (t) {
                                        return setTimeout(arguments.callee, 0), void 0
                                    }
                                    e()
                                }
                            }()), J.wk && function() {
                                return X ? void 0 : /loaded|complete/.test(M.readyState) ? (e(), void 0) : (setTimeout(arguments.callee, 0), void 0)
                            }(), n(e)))
                        }(),
                        function() {
                            J.ie && J.win && window.attachEvent("onunload", function() {
                                for (var e = B.length, t = 0; e > t; t++) B[t][0].detachEvent(B[t][1], B[t][2]);
                                for (var n = F.length, o = 0; n > o; o++) h(F[o]);
                                for (var i in J) J[i] = null;
                                J = null;
                                for (var r in swfobject) swfobject[r] = null;
                                swfobject = null
                            })
                        }(), {
                            registerObject: function(e, t, n, o) {
                                if (J.w3 && e && t) {
                                    var i = {};
                                    i.id = e, i.swfVersion = t, i.expressInstall = n, i.callbackFn = o, $[$.length] = i, w(e, !1)
                                } else o && o({
                                    success: !1,
                                    id: e
                                })
                            },
                            getObjectById: function(e) {
                                return J.w3 ? s(e) : void 0
                            },
                            embedSWF: function(e, n, o, i, r, s, u, p, f, h) {
                                var d = {
                                    success: !1,
                                    id: n
                                };
                                J.w3 && !(J.wk && J.wk < 312) && e && n && o && i && r ? (w(n, !1), t(function() {
                                    o += "", i += "";
                                    var t = {};
                                    if (f && typeof f === A)
                                        for (var m in f) t[m] = f[m];
                                    t.data = e, t.width = o, t.height = i;
                                    var y = {};
                                    if (p && typeof p === A)
                                        for (var g in p) y[g] = p[g];
                                    if (u && typeof u === A)
                                        for (var b in u) typeof y.flashvars != O ? y.flashvars += "&" + b + "=" + u[b] : y.flashvars = b + "=" + u[b];
                                    if (v(r)) {
                                        var k = l(t, y, n);
                                        t.id == n && w(n, !0), d.success = !0, d.ref = k
                                    } else {
                                        if (s && a()) return t.data = s, c(t, y, n, h), void 0;
                                        w(n, !0)
                                    }
                                    h && h(d)
                                })) : h && h(d)
                            },
                            switchOffAutoHideShow: function() {
                                H = !1
                            },
                            ua: J,
                            getFlashPlayerVersion: function() {
                                return {
                                    major: J.pv[0],
                                    minor: J.pv[1],
                                    release: J.pv[2]
                                }
                            },
                            hasFlashPlayerVersion: v,
                            createSWF: function(e, t, n) {
                                return J.w3 ? l(e, t, n) : void 0
                            },
                            showExpressInstall: function(e, t, n, o) {
                                J.w3 && a() && c(e, t, n, o)
                            },
                            removeSWF: function(e) {
                                J.w3 && h(e)
                            },
                            createCSS: function(e, t, n, o) {
                                J.w3 && b(e, t, n, o)
                            },
                            addDomLoadEvent: t,
                            addLoadEvent: n,
                            getQueryParamValue: function(e) {
                                var t = M.location.search || M.location.hash;
                                if (t) {
                                    if (/\?/.test(t) && (t = t.split("?")[1]), null == e) return k(t);
                                    for (var n = t.split("&"), o = 0; o < n.length; o++)
                                        if (n[o].substring(0, n[o].indexOf("=")) == e) return k(n[o].substring(n[o].indexOf("=") + 1))
                                }
                                return ""
                            },
                            expressInstallCallback: function() {
                                if (U) {
                                    var e = m(N);
                                    e && S && (e.parentNode.replaceChild(S, e), T && (w(T, !0), J.ie && J.win && (S.style.display = "block")), _ && _(C)), U = !1
                                }
                            }
                        }
                    }();
                    ! function() {
                        if ("undefined" != typeof window && !window.WebSocket) {
                            var e = window.console;
                            if (e && e.log && e.error || (e = {
                                log: function() {},
                                error: function() {}
                            }), !swfobject.hasFlashPlayerVersion("10.0.0")) return e.error("Flash Player >= 10.0.0 is required."), void 0;
                            "file:" == location.protocol && e.error("WARNING: web-socket-js doesn't work in file:///... URL unless you set Flash Security Settings properly. Open the page via Web server i.e. http://..."), WebSocket = function(e, t, n, o, i) {
                                var r = this;
                                r.__id = WebSocket.__nextId++, WebSocket.__instances[r.__id] = r, r.readyState = WebSocket.CONNECTING, r.bufferedAmount = 0, r.__events = {}, t ? "string" == typeof t && (t = [t]) : t = [], setTimeout(function() {
                                    WebSocket.__addTask(function() {
                                        WebSocket.__flash.create(r.__id, e, t, n || null, o || 0, i || null)
                                    })
                                }, 0)
                            }, WebSocket.prototype.send = function(e) {
                                if (this.readyState == WebSocket.CONNECTING) throw "INVALID_STATE_ERR: Web Socket connection has not been established";
                                var t = WebSocket.__flash.send(this.__id, encodeURIComponent(e));
                                return 0 > t ? !0 : (this.bufferedAmount += t, !1)
                            }, WebSocket.prototype.close = function() {
                                this.readyState != WebSocket.CLOSED && this.readyState != WebSocket.CLOSING && (this.readyState = WebSocket.CLOSING, WebSocket.__flash.close(this.__id))
                            }, WebSocket.prototype.addEventListener = function(e, t) {
                                e in this.__events || (this.__events[e] = []), this.__events[e].push(t)
                            }, WebSocket.prototype.removeEventListener = function(e, t) {
                                if (e in this.__events)
                                    for (var n = this.__events[e], o = n.length - 1; o >= 0; --o)
                                        if (n[o] === t) {
                                            n.splice(o, 1);
                                            break
                                        }
                            }, WebSocket.prototype.dispatchEvent = function(e) {
                                for (var t = this.__events[e.type] || [], n = 0; n < t.length; ++n) t[n](e);
                                var o = this["on" + e.type];
                                o && o(e)
                            }, WebSocket.prototype.__handleEvent = function(e) {
                                "readyState" in e && (this.readyState = e.readyState), "protocol" in e && (this.protocol = e.protocol);
                                var t;
                                if ("open" == e.type || "error" == e.type) t = this.__createSimpleEvent(e.type);
                                else if ("close" == e.type) t = this.__createSimpleEvent("close");
                                else {
                                    if ("message" != e.type) throw "unknown event type: " + e.type;
                                    var n = decodeURIComponent(e.message);
                                    t = this.__createMessageEvent("message", n)
                                }
                                this.dispatchEvent(t)
                            }, WebSocket.prototype.__createSimpleEvent = function(e) {
                                if (document.createEvent && window.Event) {
                                    var t = document.createEvent("Event");
                                    return t.initEvent(e, !1, !1), t
                                }
                                return {
                                    type: e,
                                    bubbles: !1,
                                    cancelable: !1
                                }
                            }, WebSocket.prototype.__createMessageEvent = function(e, t) {
                                if (document.createEvent && window.MessageEvent && !window.opera) {
                                    var n = document.createEvent("MessageEvent");
                                    return n.initMessageEvent("message", !1, !1, t, null, null, window, null), n
                                }
                                return {
                                    type: e,
                                    data: t,
                                    bubbles: !1,
                                    cancelable: !1
                                }
                            }, WebSocket.CONNECTING = 0, WebSocket.OPEN = 1, WebSocket.CLOSING = 2, WebSocket.CLOSED = 3, WebSocket.__flash = null, WebSocket.__instances = {}, WebSocket.__tasks = [], WebSocket.__nextId = 0, WebSocket.loadFlashPolicyFile = function(e) {
                                WebSocket.__addTask(function() {
                                    WebSocket.__flash.loadManualPolicyFile(e)
                                })
                            }, WebSocket.__initialize = function() {
                                if (!WebSocket.__flash) {
                                    if (WebSocket.__swfLocation && (window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation), !window.WEB_SOCKET_SWF_LOCATION) return e.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf"), void 0;
                                    var t = document.createElement("div");
                                    t.id = "webSocketContainer", t.style.position = "absolute", WebSocket.__isFlashLite() ? (t.style.left = "0px", t.style.top = "0px") : (t.style.left = "-100px", t.style.top = "-100px");
                                    var n = document.createElement("div");
                                    n.id = "webSocketFlash", t.appendChild(n), document.body.appendChild(t), swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION, "webSocketFlash", "1", "1", "10.0.0", null, null, {
                                        hasPriority: !0,
                                        swliveconnect: !0,
                                        allowScriptAccess: "always"
                                    }, null, function(t) {
                                        t.success || e.error("[WebSocket] swfobject.embedSWF failed")
                                    })
                                }
                            }, WebSocket.__onFlashInitialized = function() {
                                setTimeout(function() {
                                    WebSocket.__flash = document.getElementById("webSocketFlash"), WebSocket.__flash.setCallerUrl(location.href), WebSocket.__flash.setDebug( !! window.WEB_SOCKET_DEBUG);
                                    for (var e = 0; e < WebSocket.__tasks.length; ++e) WebSocket.__tasks[e]();
                                    WebSocket.__tasks = []
                                }, 0)
                            }, WebSocket.__onFlashEvent = function() {
                                return setTimeout(function() {
                                    try {
                                        for (var t = WebSocket.__flash.receiveEvents(), n = 0; n < t.length; ++n) WebSocket.__instances[t[n].webSocketId].__handleEvent(t[n])
                                    } catch (o) {
                                        e.error(o)
                                    }
                                }, 0), !0
                            }, WebSocket.__log = function(t) {
                                e.log(decodeURIComponent(t))
                            }, WebSocket.__error = function(t) {
                                e.error(decodeURIComponent(t))
                            }, WebSocket.__addTask = function(e) {
                                WebSocket.__flash ? e() : WebSocket.__tasks.push(e)
                            }, WebSocket.__isFlashLite = function() {
                                if (!window.navigator || !window.navigator.mimeTypes) return !1;
                                var e = window.navigator.mimeTypes["application/x-shockwave-flash"];
                                return e && e.enabledPlugin && e.enabledPlugin.filename ? e.enabledPlugin.filename.match(/flashlite/i) ? !0 : !1 : !1
                            }, window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION || (window.addEventListener ? window.addEventListener("load", function() {
                                WebSocket.__initialize()
                            }, !1) : window.attachEvent("onload", function() {
                                WebSocket.__initialize()
                            }))
                        }
                    }(),
                    function(e, t, n) {
                        function o(e) {
                            e && (t.Transport.apply(this, arguments), this.sendBuffer = [])
                        }

                        function i() {}
                        e.XHR = o, t.util.inherit(o, t.Transport), o.prototype.open = function() {
                            return this.socket.setBuffer(!1), this.onOpen(), this.get(), this.setCloseTimeout(), this
                        }, o.prototype.payload = function(e) {
                            for (var n = [], o = 0, i = e.length; i > o; o++) n.push(t.parser.encodePacket(e[o]));
                            this.send(t.parser.encodePayload(n))
                        }, o.prototype.send = function(e) {
                            return this.post(e), this
                        }, o.prototype.post = function(e) {
                            function t() {
                                4 == this.readyState && (this.onreadystatechange = i, r.posting = !1, 200 == this.status ? r.socket.setBuffer(!1) : r.onClose())
                            }

                            function o() {
                                this.onload = i, r.socket.setBuffer(!1)
                            }
                            var r = this;
                            this.socket.setBuffer(!0), this.sendXHR = this.request("POST"), n.XDomainRequest && this.sendXHR instanceof XDomainRequest ? this.sendXHR.onload = this.sendXHR.onerror = o : this.sendXHR.onreadystatechange = t, this.sendXHR.send(e)
                        }, o.prototype.close = function() {
                            return this.onClose(), this
                        }, o.prototype.request = function(e) {
                            var n = t.util.request(this.socket.isXDomain()),
                                o = t.util.query(this.socket.options.query, "t=" + +new Date);
                            if (n.open(e || "GET", this.prepareUrl() + o, !0), "POST" == e) try {
                                n.setRequestHeader ? n.setRequestHeader("Content-type", "text/plain;charset=UTF-8") : n.contentType = "text/plain"
                            } catch (i) {}
                            return n
                        }, o.prototype.scheme = function() {
                            return this.socket.options.secure ? "https" : "http"
                        }, o.check = function(e, o) {
                            try {
                                var i = t.util.request(o),
                                    r = n.XDomainRequest && i instanceof XDomainRequest,
                                    s = e && e.options && e.options.secure ? "https:" : "http:",
                                    a = n.location && s != n.location.protocol;
                                if (i && (!r || !a)) return !0
                            } catch (c) {}
                            return !1
                        }, o.xdomainCheck = function(e) {
                            return o.check(e, !0)
                        }
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
                    function(e, t) {
                        function n() {
                            t.Transport.XHR.apply(this, arguments)
                        }
                        e.htmlfile = n, t.util.inherit(n, t.Transport.XHR), n.prototype.name = "htmlfile", n.prototype.get = function() {
                            this.doc = new(window[["Active"].concat("Object").join("X")])("htmlfile"), this.doc.open(), this.doc.write("<html></html>"), this.doc.close(), this.doc.parentWindow.s = this;
                            var e = this.doc.createElement("div");
                            e.className = "socketio", this.doc.body.appendChild(e), this.iframe = this.doc.createElement("iframe"), e.appendChild(this.iframe);
                            var n = this,
                                o = t.util.query(this.socket.options.query, "t=" + +new Date);
                            this.iframe.src = this.prepareUrl() + o, t.util.on(window, "unload", function() {
                                n.destroy()
                            })
                        }, n.prototype._ = function(e, t) {
                            e = e.replace(/\\\//g, "/"), this.onData(e);
                            try {
                                var n = t.getElementsByTagName("script")[0];
                                n.parentNode.removeChild(n)
                            } catch (o) {}
                        }, n.prototype.destroy = function() {
                            if (this.iframe) {
                                try {
                                    this.iframe.src = "about:blank"
                                } catch (e) {}
                                this.doc = null, this.iframe.parentNode.removeChild(this.iframe), this.iframe = null, CollectGarbage()
                            }
                        }, n.prototype.close = function() {
                            return this.destroy(), t.Transport.XHR.prototype.close.call(this)
                        }, n.check = function(e) {
                            if ("undefined" != typeof window && ["Active"].concat("Object").join("X") in window) try {
                                var n = new(window[["Active"].concat("Object").join("X")])("htmlfile");
                                return n && t.Transport.XHR.check(e)
                            } catch (o) {}
                            return !1
                        }, n.xdomainCheck = function() {
                            return !1
                        }, t.transports.push("htmlfile")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports),
                    function(e, t, n) {
                        function o() {
                            t.Transport.XHR.apply(this, arguments)
                        }

                        function i() {}
                        e["xhr-polling"] = o, t.util.inherit(o, t.Transport.XHR), t.util.merge(o, t.Transport.XHR), o.prototype.name = "xhr-polling", o.prototype.heartbeats = function() {
                            return !1
                        }, o.prototype.open = function() {
                            var e = this;
                            return t.Transport.XHR.prototype.open.call(e), !1
                        }, o.prototype.get = function() {
                            function e() {
                                4 == this.readyState && (this.onreadystatechange = i, 200 == this.status ? (r.onData(this.responseText), r.get()) : r.onClose())
                            }

                            function t() {
                                this.onload = i, this.onerror = i, r.retryCounter = 1, r.onData(this.responseText), r.get()
                            }

                            function o() {
                                r.retryCounter++, !r.retryCounter || r.retryCounter > 3 ? r.onClose() : r.get()
                            }
                            if (this.isOpen) {
                                var r = this;
                                this.xhr = this.request(), n.XDomainRequest && this.xhr instanceof XDomainRequest ? (this.xhr.onload = t, this.xhr.onerror = o) : this.xhr.onreadystatechange = e, this.xhr.send(null)
                            }
                        }, o.prototype.onClose = function() {
                            if (t.Transport.XHR.prototype.onClose.call(this), this.xhr) {
                                this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = i;
                                try {
                                    this.xhr.abort()
                                } catch (e) {}
                                this.xhr = null
                            }
                        }, o.prototype.ready = function(e, n) {
                            var o = this;
                            t.util.defer(function() {
                                n.call(o)
                            })
                        }, t.transports.push("xhr-polling")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
                    function(e, t, n) {
                        function o() {
                            t.Transport["xhr-polling"].apply(this, arguments), this.index = t.j.length;
                            var e = this;
                            t.j.push(function(t) {
                                e._(t)
                            })
                        }
                        var i = n.document && "MozAppearance" in n.document.documentElement.style;
                        e["jsonp-polling"] = o, t.util.inherit(o, t.Transport["xhr-polling"]), o.prototype.name = "jsonp-polling", o.prototype.post = function(e) {
                            function n() {
                                o(), i.socket.setBuffer(!1)
                            }

                            function o() {
                                i.iframe && i.form.removeChild(i.iframe);
                                try {
                                    s = document.createElement('<iframe name="' + i.iframeId + '">')
                                } catch (e) {
                                    s = document.createElement("iframe"), s.name = i.iframeId
                                }
                                s.id = i.iframeId, i.form.appendChild(s), i.iframe = s
                            }
                            var i = this,
                                r = t.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
                            if (!this.form) {
                                var s, a = document.createElement("form"),
                                    c = document.createElement("textarea"),
                                    u = this.iframeId = "socketio_iframe_" + this.index;
                                a.className = "socketio", a.style.position = "absolute", a.style.top = "0px", a.style.left = "0px", a.style.display = "none", a.target = u, a.method = "POST", a.setAttribute("accept-charset", "utf-8"), c.name = "d", a.appendChild(c), document.body.appendChild(a), this.form = a, this.area = c
                            }
                            this.form.action = this.prepareUrl() + r, o(), this.area.value = t.JSON.stringify(e);
                            try {
                                this.form.submit()
                            } catch (p) {}
                            this.iframe.attachEvent ? s.onreadystatechange = function() {
                                "complete" == i.iframe.readyState && n()
                            } : this.iframe.onload = n, this.socket.setBuffer(!0)
                        }, o.prototype.get = function() {
                            var e = this,
                                n = document.createElement("script"),
                                o = t.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
                            this.script && (this.script.parentNode.removeChild(this.script), this.script = null), n.async = !0, n.src = this.prepareUrl() + o, n.onerror = function() {
                                e.onClose()
                            };
                            var r = document.getElementsByTagName("script")[0];
                            r.parentNode.insertBefore(n, r), this.script = n, i && setTimeout(function() {
                                var e = document.createElement("iframe");
                                document.body.appendChild(e), document.body.removeChild(e)
                            }, 100)
                        }, o.prototype._ = function(e) {
                            return this.onData(e), this.isOpen && this.get(), this
                        }, o.prototype.ready = function(e, n) {
                            var o = this;
                            return i ? (t.util.load(function() {
                                n.call(o)
                            }), void 0) : n.call(this)
                        }, o.check = function() {
                            return "document" in n
                        }, o.xdomainCheck = function() {
                            return !0
                        }, t.transports.push("jsonp-polling")
                    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), "function" == typeof define && define.amd && define([], function() {
                        return io
                    })
                }()
            }, {}
        ],
        6: [

            function(e, t) {
                var n = e("getusermedia"),
                    o = {};
                t.exports = function(e, t) {
                    var i, r = 2 === arguments.length,
                        s = r ? t : e;
                    if ("undefined" == typeof window || "http:" === window.location.protocol) return i = new Error("NavigatorUserMediaError"), i.name = "HTTPS_REQUIRED", s(i);
                    if (window.navigator.userAgent.match("Chrome")) {
                        var a = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
                        if (a >= 26 && 33 >= a) e = r && e || {
                            video: {
                                mandatory: {
                                    maxWidth: window.screen.width,
                                    maxHeight: window.screen.height,
                                    maxFrameRate: 3,
                                    chromeMediaSource: "screen"
                                }
                            }
                        }, n(e, s);
                        else {
                            var c = window.setTimeout(function() {
                                return i = new Error("NavigatorUserMediaError"), i.name = "EXTENSION_UNAVAILABLE", s(i)
                            }, 1e3);
                            o[c] = [s, r ? constraint : null], window.postMessage({
                                type: "getScreen",
                                id: c
                            }, "*")
                        }
                    }
                }, window.addEventListener("message", function(e) {
                    if (e.origin == window.location.origin)
                        if ("gotScreen" == e.data.type && o[e.data.id]) {
                            var t = o[e.data.id],
                                i = t[1],
                                r = t[0];
                            if (delete o[e.data.id], "" === e.data.sourceId) {
                                var s = s = new Error("NavigatorUserMediaError");
                                s.name = "PERMISSION_DENIED", r(s)
                            } else i = i || {
                                audio: !1,
                                video: {
                                    mandatory: {
                                        chromeMediaSource: "desktop",
                                        chromeMediaSourceId: e.data.sourceId,
                                        maxWidth: window.screen.width,
                                        maxHeight: window.screen.height,
                                        maxFrameRate: 3
                                    }
                                }
                            }, n(i, r)
                        } else "getScreenPending" == e.data.type && window.clearTimeout(e.data.id)
                })
            }, {
                getusermedia: 9
            }
        ],
        10: [

            function(e, t) {
                var n = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                t.exports = function(e, t) {
                    var o, i = 2 === arguments.length,
                        r = {
                            video: !0,
                            audio: !0
                        }, s = "PERMISSION_DENIED",
                        a = "CONSTRAINT_NOT_SATISFIED";
                    return i || (t = e, e = r), n ? (n.call(navigator, e, function(e) {
                        t(null, e)
                    }, function(e) {
                        var n;
                        "string" == typeof e ? (n = new Error("NavigatorUserMediaError"), n.name = e === s ? s : a) : (n = e, n.name || (e.name = n[s] ? s : a)), t(n)
                    }), void 0) : (o = new Error("NavigatorUserMediaError"), o.name = "NOT_SUPPORTED_ERROR", t(o))
                }
            }, {}
        ],
        11: [

            function(e, t) {
                var n, o = !1,
                    i = !1,
                    r = navigator.userAgent.toLowerCase(); - 1 !== r.indexOf("firefox") ? (n = "moz", i = !0) : -1 !== r.indexOf("chrome") && (n = "webkit", o = !0);
                var s = window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
                    a = window.mozRTCIceCandidate || window.RTCIceCandidate,
                    c = window.mozRTCSessionDescription || window.RTCSessionDescription,
                    u = window.webkitMediaStream || window.MediaStream,
                    p = navigator.userAgent.match("Chrome") && parseInt(navigator.userAgent.match(/Chrome\/(.*) /)[1], 10) >= 26,
                    l = window.webkitAudioContext || window.AudioContext;
                t.exports = {
                    support: !! s,
                    dataChannel: o || i || s && s.prototype && s.prototype.createDataChannel,
                    prefix: n,
                    webAudio: !(!l || !l.prototype.createMediaStreamSource),
                    mediaStream: !(!u || !u.prototype.removeTrack),
                    screenSharing: !! p,
                    AudioContext: l,
                    PeerConnection: s,
                    SessionDescription: c,
                    IceCandidate: a
                }
            }, {}
        ],
        9: [

            function(e, t) {
                var n = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia || window.navigator.msGetUserMedia;
                t.exports = function(e, t) {
                    var o, i = 2 === arguments.length,
                        r = {
                            video: !0,
                            audio: !0
                        }, s = "PERMISSION_DENIED",
                        a = "CONSTRAINT_NOT_SATISFIED";
                    return i || (t = e, e = r), n ? (n.call(window.navigator, e, function(e) {
                        t(null, e)
                    }, function(e) {
                        var n;
                        "string" == typeof e ? (n = new Error("NavigatorUserMediaError"), n.name = e === s ? s : a) : (n = e, n.name || (e.name = n[s] ? s : a)), t(n)
                    }), void 0) : (o = new Error("NavigatorUserMediaError"), o.name = "NOT_SUPPORTED_ERROR", t(o))
                }
            }, {}
        ],
        2: [

            function(e, t) {
                function n(e) {
                    var t = this,
                        n = e || {};
                    this.config = {
                        debug: !1,
                        localVideoEl: "",
                        remoteVideosEl: "",
                        autoRequestMedia: !1,
                        peerConnectionConfig: {
                            iceServers: [{
                                url: "stun:stun.l.google.com:19302"
                            }]
                        },
                        peerConnectionContraints: {
                            optional: [{
                                DtlsSrtpKeyAgreement: !0
                            }]
                        },
                        autoAdjustMic: !1,
                        media: {
                            audio: !0,
                            video: !0
                        },
                        receiveMedia: {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        },
                        detectSpeakingEvents: !0,
                        enableDataChannels: !0
                    };
                    var o;
                    this.screenSharingSupport = i.screenSharing, this.logger = function() {
                        return e.debug ? e.logger || console : e.logger || p
                    }();
                    for (o in n) this.config[o] = n[o];
                    i.support || this.logger.error("Your browser doesn't seem to support WebRTC"), this.peers = [], a.call(this), this.config.debug && this.on("*", function(e, n, o) {
                        var i;
                        i = t.config.logger === p ? console : t.logger, i.log("event:", e, n, o)
                    })
                }

                function o(e) {
                    var t = this;
                    this.id = e.id, this.parent = e.parent, this.type = e.type || "video", this.oneway = e.oneway || !1, this.sharemyscreen = e.sharemyscreen || !1, this.browserPrefix = e.prefix, this.stream = e.stream, this.enableDataChannels = void 0 === e.enableDataChannels ? this.parent.config.enableDataChannels : e.enableDataChannels, this.receiveMedia = e.receiveMedia || this.parent.config.receiveMedia, this.channels = {}, this.pc = new s(this.parent.config.peerConnectionConfig, this.parent.config.peerConnectionContraints), this.pc.on("ice", this.onIceCandidate.bind(this)), this.pc.on("addStream", this.handleRemoteStreamAdded.bind(this)), this.pc.on("addChannel", this.handleDataChannelAdded.bind(this)), this.pc.on("removeStream", this.handleStreamRemoved.bind(this)), this.pc.on("negotiationNeeded", this.emit.bind(this, "negotiationNeeded")), this.pc.on("iceConnectionStateChange", this.emit.bind(this, "iceConnectionStateChange")), this.pc.on("signalingStateChange", this.emit.bind(this, "signalingStateChange")), this.logger = this.parent.logger, "screen" === e.type ? this.parent.localScreen && this.sharemyscreen && (this.logger.log("adding local screen stream to peer connection"), this.pc.addStream(this.parent.localScreen), this.broadcaster = e.broadcaster) : this.pc.addStream(this.parent.localStream), a.call(this), this.on("*", function() {
                        t.parent.emit.apply(t.parent, arguments)
                    })
                }
                var i = e("webrtcsupport"),
                    r = e("getusermedia"),
                    s = e("rtcpeerconnection"),
                    a = e("wildemitter"),
                    c = e("hark"),
                    u = e("mediastream-gain"),
                    p = e("mockconsole");
                n.prototype = Object.create(a.prototype, {
                    constructor: {
                        value: n
                    }
                }), n.prototype.createPeer = function(e) {
                    var t;
                    return e.parent = this, t = new o(e), this.peers.push(t), t
                }, n.prototype.startLocalMedia = function(e, t) {
                    var n = this,
                        o = e || {
                            video: !0,
                            audio: !0
                        };
                    r(o, function(e, i) {
                        e || (o.audio && n.config.detectSpeakingEvents && n.setupAudioMonitor(i), n.localStream = i, n.config.autoAdjustMic && (n.gainController = new u(i), n.setMicIfEnabled(.5)), n.emit("localStream", i)), t && t(e, i)
                    })
                }, n.prototype.stopLocalMedia = function() {
                    this.localStream && (this.localStream.stop(), this.emit("localStreamStopped"))
                }, n.prototype.mute = function() {
                    this._audioEnabled(!1), this.hardMuted = !0, this.emit("audioOff")
                }, n.prototype.unmute = function() {
                    this._audioEnabled(!0), this.hardMuted = !1, this.emit("audioOn")
                }, n.prototype.setupAudioMonitor = function(e) {
                    this.logger.log("Setup audio");
                    var t, n = c(e),
                        o = this;
                    n.on("speaking", function() {
                        o.emit("speaking"), o.hardMuted || (o.setMicIfEnabled(1), o.sendToAll("speaking", {}))
                    }), n.on("stopped_speaking", function() {
                        t && clearTimeout(t), t = setTimeout(function() {
                            o.emit("stoppedSpeaking"), o.hardMuted || (o.setMicIfEnabled(.5), o.sendToAll("stopped_speaking", {}))
                        }, 1e3)
                    }), this.config.enableDataChannels && n.on("volume_change", function(e, t) {
                        o.emit("volumeChange", e, t), o.hardMuted || o.peers.forEach(function(t) {
                            if (t.enableDataChannels) {
                                var n = t.getDataChannel("hark");
                                if ("open" != n.readyState) return;
                                n.send(JSON.stringify({
                                    type: "volume",
                                    volume: e
                                }))
                            }
                        })
                    })
                }, n.prototype.setMicIfEnabled = function(e) {
                    this.config.autoAdjustMic && this.gainController.setGain(e)
                }, n.prototype.pauseVideo = function() {
                    this._videoEnabled(!1), this.emit("videoOff")
                }, n.prototype.resumeVideo = function() {
                    this._videoEnabled(!0), this.emit("videoOn")
                }, n.prototype.pause = function() {
                    this._audioEnabled(!1), this.pauseVideo()
                }, n.prototype.resume = function() {
                    this._audioEnabled(!0), this.resumeVideo()
                }, n.prototype._audioEnabled = function(e) {
                    this.setMicIfEnabled(e ? 1 : 0), this.localStream.getAudioTracks().forEach(function(t) {
                        t.enabled = !! e
                    })
                }, n.prototype._videoEnabled = function(e) {
                    this.localStream.getVideoTracks().forEach(function(t) {
                        t.enabled = !! e
                    })
                }, n.prototype.removePeers = function(e, t) {
                    this.getPeers(e, t).forEach(function(e) {
                        e.end()
                    })
                }, n.prototype.getPeers = function(e, t) {
                    return this.peers.filter(function(n) {
                        return !(e && n.id !== e || t && n.type !== t)
                    })
                }, n.prototype.sendToAll = function(e, t) {
                    this.peers.forEach(function(n) {
                        n.send(e, t)
                    })
                }, n.prototype.sendDirectlyToAll = function(e, t, n) {
                    this.peers.forEach(function(o) {
                        o.enableDataChannels && o.sendDirectly(e, t, n)
                    })
                }, o.prototype = Object.create(a.prototype, {
                    constructor: {
                        value: o
                    }
                }), o.prototype.handleMessage = function(e) {
                    var t = this;
                    this.logger.log("getting", e.type, e), e.prefix && (this.browserPrefix = e.prefix), "offer" === e.type ? this.pc.handleOffer(e.payload, function(e) {
                        e || t.pc.answer(t.receiveMedia, function(e, n) {
                            t.send("answer", n)
                        })
                    }) : "answer" === e.type ? this.pc.handleAnswer(e.payload) : "candidate" === e.type ? this.pc.processIce(e.payload) : "speaking" === e.type ? this.parent.emit("speaking", {
                        id: e.from
                    }) : "stopped_speaking" === e.type ? this.parent.emit("stopped_speaking", {
                        id: e.from
                    }) : "mute" === e.type ? this.parent.emit("mute", {
                        id: e.from,
                        name: e.payload.name
                    }) : "unmute" === e.type && this.parent.emit("unmute", {
                        id: e.from,
                        name: e.payload.name
                    })
                }, o.prototype.send = function(e, t) {
                    var n = {
                        to: this.id,
                        broadcaster: this.broadcaster,
                        roomType: this.type,
                        type: e,
                        payload: t,
                        prefix: i.prefix
                    };
                    this.logger.log("sending", e, n), this.parent.emit("message", n)
                }, o.prototype.sendDirectly = function(e, t, n) {
                    var o = {
                        type: t,
                        payload: n
                    };
                    this.logger.log("sending via datachannel", e, t, o);
                    var i = this.getDataChannel(e);
                    return "open" != i.readyState ? !1 : (i.send(JSON.stringify(o)), !0)
                }, o.prototype._observeDataChannel = function(e) {
                    var t = this;
                    e.onclose = this.emit.bind(this, "channelClose", e), e.onerror = this.emit.bind(this, "channelError", e), e.onmessage = function(n) {
                        t.emit("channelMessage", t, e.label, JSON.parse(n.data), e, n)
                    }, e.onopen = this.emit.bind(this, "channelOpen", e)
                }, o.prototype.getDataChannel = function(e, t) {
                    if (!i.dataChannel) return this.emit("error", new Error("createDataChannel not supported"));
                    var n = this.channels[e];
                    return t || (t = {}), n ? n : (n = this.channels[e] = this.pc.createDataChannel(e, t), this._observeDataChannel(n), n)
                }, o.prototype.onIceCandidate = function(e) {
                    this.closed || (e ? this.send("candidate", e) : this.logger.log("End of candidates."))
                }, o.prototype.start = function() {
                    var e = this;
                    this.enableDataChannels && this.getDataChannel("simplewebrtc"), this.pc.offer(this.receiveMedia, function(t, n) {
                        e.send("offer", n)
                    })
                }, o.prototype.end = function() {
                    this.closed || (this.pc.close(), this.handleStreamRemoved())
                }, o.prototype.handleRemoteStreamAdded = function(e) {
                    var t = this;
                    this.stream ? this.logger.warn("Already have a remote stream") : (this.stream = e.stream, this.stream.onended = function() {
                        t.end()
                    }, this.parent.emit("peerStreamAdded", this))
                }, o.prototype.handleStreamRemoved = function() {
                    this.parent.peers.splice(this.parent.peers.indexOf(this), 1), this.closed = !0, this.parent.emit("peerStreamRemoved", this)
                }, o.prototype.handleDataChannelAdded = function(e) {
                    this.channels[e.label] = e, this._observeDataChannel(e)
                }, t.exports = n
            }, {
                getusermedia: 10,
                hark: 13,
                "mediastream-gain": 14,
                mockconsole: 7,
                rtcpeerconnection: 12,
                webrtcsupport: 11,
                wildemitter: 3
            }
        ],
        15: [

            function(e, t, n) {
                function o(e) {
                    return Array.isArray(e) || "object" == typeof e && "[object Array]" === Object.prototype.toString.call(e)
                }

                function i(e) {
                    "object" == typeof e && "[object RegExp]" === Object.prototype.toString.call(e)
                }

                function r(e) {
                    return "object" == typeof e && "[object Date]" === Object.prototype.toString.call(e)
                }
                e("events"), n.isArray = o, n.isDate = function(e) {
                    return "[object Date]" === Object.prototype.toString.call(e)
                }, n.isRegExp = function(e) {
                    return "[object RegExp]" === Object.prototype.toString.call(e)
                }, n.print = function() {}, n.puts = function() {}, n.debug = function() {}, n.inspect = function(e, t, c, u) {
                    function p(e, c) {
                        if (e && "function" == typeof e.inspect && e !== n && (!e.constructor || e.constructor.prototype !== e)) return e.inspect(c);
                        switch (typeof e) {
                            case "undefined":
                                return f("undefined", "undefined");
                            case "string":
                                var u = "'" + JSON.stringify(e).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                                return f(u, "string");
                            case "number":
                                return f("" + e, "number");
                            case "boolean":
                                return f("" + e, "boolean")
                        }
                        if (null === e) return f("null", "null");
                        var h = s(e),
                            d = t ? a(e) : h;
                        if ("function" == typeof e && 0 === d.length) {
                            if (i(e)) return f("" + e, "regexp");
                            var m = e.name ? ": " + e.name : "";
                            return f("[Function" + m + "]", "special")
                        }
                        if (r(e) && 0 === d.length) return f(e.toUTCString(), "date");
                        var y, g, v;
                        if (o(e) ? (g = "Array", v = ["[", "]"]) : (g = "Object", v = ["{", "}"]), "function" == typeof e) {
                            var b = e.name ? ": " + e.name : "";
                            y = i(e) ? " " + e : " [Function" + b + "]"
                        } else y = ""; if (r(e) && (y = " " + e.toUTCString()), 0 === d.length) return v[0] + y + v[1];
                        if (0 > c) return i(e) ? f("" + e, "regexp") : f("[Object]", "special");
                        l.push(e);
                        var w = d.map(function(t) {
                            var n, i;
                            if (e.__lookupGetter__ && (e.__lookupGetter__(t) ? i = e.__lookupSetter__(t) ? f("[Getter/Setter]", "special") : f("[Getter]", "special") : e.__lookupSetter__(t) && (i = f("[Setter]", "special"))), h.indexOf(t) < 0 && (n = "[" + t + "]"), i || (l.indexOf(e[t]) < 0 ? (i = null === c ? p(e[t]) : p(e[t], c - 1), i.indexOf("\n") > -1 && (i = o(e) ? i.split("\n").map(function(e) {
                                return "  " + e
                            }).join("\n").substr(2) : "\n" + i.split("\n").map(function(e) {
                                return "   " + e
                            }).join("\n"))) : i = f("[Circular]", "special")), "undefined" == typeof n) {
                                if ("Array" === g && t.match(/^\d+$/)) return i;
                                n = JSON.stringify("" + t), n.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (n = n.substr(1, n.length - 2), n = f(n, "name")) : (n = n.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), n = f(n, "string"))
                            }
                            return n + ": " + i
                        });
                        l.pop();
                        var k = 0,
                            S = w.reduce(function(e, t) {
                                return k++, t.indexOf("\n") >= 0 && k++, e + t.length + 1
                            }, 0);
                        return w = S > 50 ? v[0] + ("" === y ? "" : y + "\n ") + " " + w.join(",\n  ") + " " + v[1] : v[0] + y + " " + w.join(", ") + " " + v[1]
                    }
                    var l = [],
                        f = function(e, t) {
                            var n = {
                                bold: [1, 22],
                                italic: [3, 23],
                                underline: [4, 24],
                                inverse: [7, 27],
                                white: [37, 39],
                                grey: [90, 39],
                                black: [30, 39],
                                blue: [34, 39],
                                cyan: [36, 39],
                                green: [32, 39],
                                magenta: [35, 39],
                                red: [31, 39],
                                yellow: [33, 39]
                            }, o = {
                                    special: "cyan",
                                    number: "blue",
                                    "boolean": "yellow",
                                    undefined: "grey",
                                    "null": "bold",
                                    string: "green",
                                    date: "magenta",
                                    regexp: "red"
                                }[t];
                            return o ? "[" + n[o][0] + "m" + e + "[" + n[o][1] + "m" : e
                        };
                    return u || (f = function(e) {
                        return e
                    }), p(e, "undefined" == typeof c ? 2 : c)
                }, n.log = function() {}, n.pump = null;
                var s = Object.keys || function(e) {
                        var t = [];
                        for (var n in e) t.push(n);
                        return t
                    }, a = Object.getOwnPropertyNames || function(e) {
                        var t = [];
                        for (var n in e) Object.hasOwnProperty.call(e, n) && t.push(n);
                        return t
                    }, c = Object.create || function(e, t) {
                        var n;
                        if (null === e) n = {
                            __proto__: null
                        };
                        else {
                            if ("object" != typeof e) throw new TypeError("typeof prototype[" + typeof e + "] != 'object'");
                            var o = function() {};
                            o.prototype = e, n = new o, n.__proto__ = e
                        }
                        return "undefined" != typeof t && Object.defineProperties && Object.defineProperties(n, t), n
                    };
                n.inherits = function(e, t) {
                    e.super_ = t, e.prototype = c(t.prototype, {
                        constructor: {
                            value: e,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0
                        }
                    })
                };
                var u = /%[sdj%]/g;
                n.format = function(e) {
                    if ("string" != typeof e) {
                        for (var t = [], o = 0; o < arguments.length; o++) t.push(n.inspect(arguments[o]));
                        return t.join(" ")
                    }
                    for (var o = 1, i = arguments, r = i.length, s = String(e).replace(u, function(e) {
                            if ("%%" === e) return "%";
                            if (o >= r) return e;
                            switch (e) {
                                case "%s":
                                    return String(i[o++]);
                                case "%d":
                                    return Number(i[o++]);
                                case "%j":
                                    return JSON.stringify(i[o++]);
                                default:
                                    return e
                            }
                        }), a = i[o]; r > o; a = i[++o]) s += null === a || "object" != typeof a ? " " + a : " " + n.inspect(a);
                    return s
                }
            }, {
                events: 16
            }
        ],
        17: [

            function(e, t, n) {
                ! function() {
                    var e = this,
                        o = e._,
                        i = {}, r = Array.prototype,
                        s = Object.prototype,
                        a = Function.prototype,
                        c = r.push,
                        u = r.slice,
                        p = r.concat,
                        l = s.toString,
                        f = s.hasOwnProperty,
                        h = r.forEach,
                        d = r.map,
                        m = r.reduce,
                        y = r.reduceRight,
                        g = r.filter,
                        v = r.every,
                        b = r.some,
                        w = r.indexOf,
                        k = r.lastIndexOf,
                        S = Array.isArray,
                        T = Object.keys,
                        _ = a.bind,
                        C = function(e) {
                            return e instanceof C ? e : this instanceof C ? (this._wrapped = e, void 0) : new C(e)
                        };
                    "undefined" != typeof n ? ("undefined" != typeof t && t.exports && (n = t.exports = C), n._ = C) : e._ = C, C.VERSION = "1.6.0";
                    var x = C.each = C.forEach = function(e, t, n) {
                        if (null == e) return e;
                        if (h && e.forEach === h) e.forEach(t, n);
                        else if (e.length === +e.length) {
                            for (var o = 0, r = e.length; r > o; o++)
                                if (t.call(n, e[o], o, e) === i) return
                        } else
                            for (var s = C.keys(e), o = 0, r = s.length; r > o; o++)
                                if (t.call(n, e[s[o]], s[o], e) === i) return; return e
                    };
                    C.map = C.collect = function(e, t, n) {
                        var o = [];
                        return null == e ? o : d && e.map === d ? e.map(t, n) : (x(e, function(e, i, r) {
                            o.push(t.call(n, e, i, r))
                        }), o)
                    };
                    var E = "Reduce of empty array with no initial value";
                    C.reduce = C.foldl = C.inject = function(e, t, n, o) {
                        var i = arguments.length > 2;
                        if (null == e && (e = []), m && e.reduce === m) return o && (t = C.bind(t, o)), i ? e.reduce(t, n) : e.reduce(t);
                        if (x(e, function(e, r, s) {
                            i ? n = t.call(o, n, e, r, s) : (n = e, i = !0)
                        }), !i) throw new TypeError(E);
                        return n
                    }, C.reduceRight = C.foldr = function(e, t, n, o) {
                        var i = arguments.length > 2;
                        if (null == e && (e = []), y && e.reduceRight === y) return o && (t = C.bind(t, o)), i ? e.reduceRight(t, n) : e.reduceRight(t);
                        var r = e.length;
                        if (r !== +r) {
                            var s = C.keys(e);
                            r = s.length
                        }
                        if (x(e, function(a, c, u) {
                            c = s ? s[--r] : --r, i ? n = t.call(o, n, e[c], c, u) : (n = e[c], i = !0)
                        }), !i) throw new TypeError(E);
                        return n
                    }, C.find = C.detect = function(e, t, n) {
                        var o;
                        return O(e, function(e, i, r) {
                            return t.call(n, e, i, r) ? (o = e, !0) : void 0
                        }), o
                    }, C.filter = C.select = function(e, t, n) {
                        var o = [];
                        return null == e ? o : g && e.filter === g ? e.filter(t, n) : (x(e, function(e, i, r) {
                            t.call(n, e, i, r) && o.push(e)
                        }), o)
                    }, C.reject = function(e, t, n) {
                        return C.filter(e, function(e, o, i) {
                            return !t.call(n, e, o, i)
                        }, n)
                    }, C.every = C.all = function(e, t, n) {
                        t || (t = C.identity);
                        var o = !0;
                        return null == e ? o : v && e.every === v ? e.every(t, n) : (x(e, function(e, r, s) {
                            return (o = o && t.call(n, e, r, s)) ? void 0 : i
                        }), !! o)
                    };
                    var O = C.some = C.any = function(e, t, n) {
                        t || (t = C.identity);
                        var o = !1;
                        return null == e ? o : b && e.some === b ? e.some(t, n) : (x(e, function(e, r, s) {
                            return o || (o = t.call(n, e, r, s)) ? i : void 0
                        }), !! o)
                    };
                    C.contains = C.include = function(e, t) {
                        return null == e ? !1 : w && e.indexOf === w ? -1 != e.indexOf(t) : O(e, function(e) {
                            return e === t
                        })
                    }, C.invoke = function(e, t) {
                        var n = u.call(arguments, 2),
                            o = C.isFunction(t);
                        return C.map(e, function(e) {
                            return (o ? t : e[t]).apply(e, n)
                        })
                    }, C.pluck = function(e, t) {
                        return C.map(e, C.property(t))
                    }, C.where = function(e, t) {
                        return C.filter(e, C.matches(t))
                    }, C.findWhere = function(e, t) {
                        return C.find(e, C.matches(t))
                    }, C.max = function(e, t, n) {
                        if (!t && C.isArray(e) && e[0] === +e[0] && e.length < 65535) return Math.max.apply(Math, e);
                        var o = -1 / 0,
                            i = -1 / 0;
                        return x(e, function(e, r, s) {
                            var a = t ? t.call(n, e, r, s) : e;
                            a > i && (o = e, i = a)
                        }), o
                    }, C.min = function(e, t, n) {
                        if (!t && C.isArray(e) && e[0] === +e[0] && e.length < 65535) return Math.min.apply(Math, e);
                        var o = 1 / 0,
                            i = 1 / 0;
                        return x(e, function(e, r, s) {
                            var a = t ? t.call(n, e, r, s) : e;
                            i > a && (o = e, i = a)
                        }), o
                    }, C.shuffle = function(e) {
                        var t, n = 0,
                            o = [];
                        return x(e, function(e) {
                            t = C.random(n++), o[n - 1] = o[t], o[t] = e
                        }), o
                    }, C.sample = function(e, t, n) {
                        return null == t || n ? (e.length !== +e.length && (e = C.values(e)), e[C.random(e.length - 1)]) : C.shuffle(e).slice(0, Math.max(0, t))
                    };
                    var A = function(e) {
                        return null == e ? C.identity : C.isFunction(e) ? e : C.property(e)
                    };
                    C.sortBy = function(e, t, n) {
                        return t = A(t), C.pluck(C.map(e, function(e, o, i) {
                            return {
                                value: e,
                                index: o,
                                criteria: t.call(n, e, o, i)
                            }
                        }).sort(function(e, t) {
                            var n = e.criteria,
                                o = t.criteria;
                            if (n !== o) {
                                if (n > o || void 0 === n) return 1;
                                if (o > n || void 0 === o) return -1
                            }
                            return e.index - t.index
                        }), "value")
                    };
                    var j = function(e) {
                        return function(t, n, o) {
                            var i = {};
                            return n = A(n), x(t, function(r, s) {
                                var a = n.call(o, r, s, t);
                                e(i, a, r)
                            }), i
                        }
                    };
                    C.groupBy = j(function(e, t, n) {
                        C.has(e, t) ? e[t].push(n) : e[t] = [n]
                    }), C.indexBy = j(function(e, t, n) {
                        e[t] = n
                    }), C.countBy = j(function(e, t) {
                        C.has(e, t) ? e[t]++ : e[t] = 1
                    }), C.sortedIndex = function(e, t, n, o) {
                        n = A(n);
                        for (var i = n.call(o, t), r = 0, s = e.length; s > r;) {
                            var a = r + s >>> 1;
                            n.call(o, e[a]) < i ? r = a + 1 : s = a
                        }
                        return r
                    }, C.toArray = function(e) {
                        return e ? C.isArray(e) ? u.call(e) : e.length === +e.length ? C.map(e, C.identity) : C.values(e) : []
                    }, C.size = function(e) {
                        return null == e ? 0 : e.length === +e.length ? e.length : C.keys(e).length
                    }, C.first = C.head = C.take = function(e, t, n) {
                        return null == e ? void 0 : null == t || n ? e[0] : 0 > t ? [] : u.call(e, 0, t)
                    }, C.initial = function(e, t, n) {
                        return u.call(e, 0, e.length - (null == t || n ? 1 : t))
                    }, C.last = function(e, t, n) {
                        return null == e ? void 0 : null == t || n ? e[e.length - 1] : u.call(e, Math.max(e.length - t, 0))
                    }, C.rest = C.tail = C.drop = function(e, t, n) {
                        return u.call(e, null == t || n ? 1 : t)
                    }, C.compact = function(e) {
                        return C.filter(e, C.identity)
                    };
                    var D = function(e, t, n) {
                        return t && C.every(e, C.isArray) ? p.apply(n, e) : (x(e, function(e) {
                            C.isArray(e) || C.isArguments(e) ? t ? c.apply(n, e) : D(e, t, n) : n.push(e)
                        }), n)
                    };
                    C.flatten = function(e, t) {
                        return D(e, t, [])
                    }, C.without = function(e) {
                        return C.difference(e, u.call(arguments, 1))
                    }, C.partition = function(e, t) {
                        var n = [],
                            o = [];
                        return x(e, function(e) {
                            (t(e) ? n : o).push(e)
                        }), [n, o]
                    }, C.uniq = C.unique = function(e, t, n, o) {
                        C.isFunction(t) && (o = n, n = t, t = !1);
                        var i = n ? C.map(e, n, o) : e,
                            r = [],
                            s = [];
                        return x(i, function(n, o) {
                            (t ? o && s[s.length - 1] === n : C.contains(s, n)) || (s.push(n), r.push(e[o]))
                        }), r
                    }, C.union = function() {
                        return C.uniq(C.flatten(arguments, !0))
                    }, C.intersection = function(e) {
                        var t = u.call(arguments, 1);
                        return C.filter(C.uniq(e), function(e) {
                            return C.every(t, function(t) {
                                return C.contains(t, e)
                            })
                        })
                    }, C.difference = function(e) {
                        var t = p.apply(r, u.call(arguments, 1));
                        return C.filter(e, function(e) {
                            return !C.contains(t, e)
                        })
                    }, C.zip = function() {
                        for (var e = C.max(C.pluck(arguments, "length").concat(0)), t = new Array(e), n = 0; e > n; n++) t[n] = C.pluck(arguments, "" + n);
                        return t
                    }, C.object = function(e, t) {
                        if (null == e) return {};
                        for (var n = {}, o = 0, i = e.length; i > o; o++) t ? n[e[o]] = t[o] : n[e[o][0]] = e[o][1];
                        return n
                    }, C.indexOf = function(e, t, n) {
                        if (null == e) return -1;
                        var o = 0,
                            i = e.length;
                        if (n) {
                            if ("number" != typeof n) return o = C.sortedIndex(e, t), e[o] === t ? o : -1;
                            o = 0 > n ? Math.max(0, i + n) : n
                        }
                        if (w && e.indexOf === w) return e.indexOf(t, n);
                        for (; i > o; o++)
                            if (e[o] === t) return o;
                        return -1
                    }, C.lastIndexOf = function(e, t, n) {
                        if (null == e) return -1;
                        var o = null != n;
                        if (k && e.lastIndexOf === k) return o ? e.lastIndexOf(t, n) : e.lastIndexOf(t);
                        for (var i = o ? n : e.length; i--;)
                            if (e[i] === t) return i;
                        return -1
                    }, C.range = function(e, t, n) {
                        arguments.length <= 1 && (t = e || 0, e = 0), n = arguments[2] || 1;
                        for (var o = Math.max(Math.ceil((t - e) / n), 0), i = 0, r = new Array(o); o > i;) r[i++] = e, e += n;
                        return r
                    };
                    var R = function() {};
                    C.bind = function(e, t) {
                        var n, o;
                        if (_ && e.bind === _) return _.apply(e, u.call(arguments, 1));
                        if (!C.isFunction(e)) throw new TypeError;
                        return n = u.call(arguments, 2), o = function() {
                            if (!(this instanceof o)) return e.apply(t, n.concat(u.call(arguments)));
                            R.prototype = e.prototype;
                            var i = new R;
                            R.prototype = null;
                            var r = e.apply(i, n.concat(u.call(arguments)));
                            return Object(r) === r ? r : i
                        }
                    }, C.partial = function(e) {
                        var t = u.call(arguments, 1);
                        return function() {
                            for (var n = 0, o = t.slice(), i = 0, r = o.length; r > i; i++) o[i] === C && (o[i] = arguments[n++]);
                            for (; n < arguments.length;) o.push(arguments[n++]);
                            return e.apply(this, o)
                        }
                    }, C.bindAll = function(e) {
                        var t = u.call(arguments, 1);
                        if (0 === t.length) throw new Error("bindAll must be passed function names");
                        return x(t, function(t) {
                            e[t] = C.bind(e[t], e)
                        }), e
                    }, C.memoize = function(e, t) {
                        var n = {};
                        return t || (t = C.identity),
                        function() {
                            var o = t.apply(this, arguments);
                            return C.has(n, o) ? n[o] : n[o] = e.apply(this, arguments)
                        }
                    }, C.delay = function(e, t) {
                        var n = u.call(arguments, 2);
                        return setTimeout(function() {
                            return e.apply(null, n)
                        }, t)
                    }, C.defer = function(e) {
                        return C.delay.apply(C, [e, 1].concat(u.call(arguments, 1)))
                    }, C.throttle = function(e, t, n) {
                        var o, i, r, s = null,
                            a = 0;
                        n || (n = {});
                        var c = function() {
                            a = n.leading === !1 ? 0 : C.now(), s = null, r = e.apply(o, i), o = i = null
                        };
                        return function() {
                            var u = C.now();
                            a || n.leading !== !1 || (a = u);
                            var p = t - (u - a);
                            return o = this, i = arguments, 0 >= p ? (clearTimeout(s), s = null, a = u, r = e.apply(o, i), o = i = null) : s || n.trailing === !1 || (s = setTimeout(c, p)), r
                        }
                    }, C.debounce = function(e, t, n) {
                        var o, i, r, s, a, c = function() {
                                var u = C.now() - s;
                                t > u ? o = setTimeout(c, t - u) : (o = null, n || (a = e.apply(r, i), r = i = null))
                            };
                        return function() {
                            r = this, i = arguments, s = C.now();
                            var u = n && !o;
                            return o || (o = setTimeout(c, t)), u && (a = e.apply(r, i), r = i = null), a
                        }
                    }, C.once = function(e) {
                        var t, n = !1;
                        return function() {
                            return n ? t : (n = !0, t = e.apply(this, arguments), e = null, t)
                        }
                    }, C.wrap = function(e, t) {
                        return C.partial(t, e)
                    }, C.compose = function() {
                        var e = arguments;
                        return function() {
                            for (var t = arguments, n = e.length - 1; n >= 0; n--) t = [e[n].apply(this, t)];
                            return t[0]
                        }
                    }, C.after = function(e, t) {
                        return function() {
                            return --e < 1 ? t.apply(this, arguments) : void 0
                        }
                    }, C.keys = function(e) {
                        if (!C.isObject(e)) return [];
                        if (T) return T(e);
                        var t = [];
                        for (var n in e) C.has(e, n) && t.push(n);
                        return t
                    }, C.values = function(e) {
                        for (var t = C.keys(e), n = t.length, o = new Array(n), i = 0; n > i; i++) o[i] = e[t[i]];
                        return o
                    }, C.pairs = function(e) {
                        for (var t = C.keys(e), n = t.length, o = new Array(n), i = 0; n > i; i++) o[i] = [t[i], e[t[i]]];
                        return o
                    }, C.invert = function(e) {
                        for (var t = {}, n = C.keys(e), o = 0, i = n.length; i > o; o++) t[e[n[o]]] = n[o];
                        return t
                    }, C.functions = C.methods = function(e) {
                        var t = [];
                        for (var n in e) C.isFunction(e[n]) && t.push(n);
                        return t.sort()
                    }, C.extend = function(e) {
                        return x(u.call(arguments, 1), function(t) {
                            if (t)
                                for (var n in t) e[n] = t[n]
                        }), e
                    }, C.pick = function(e) {
                        var t = {}, n = p.apply(r, u.call(arguments, 1));
                        return x(n, function(n) {
                            n in e && (t[n] = e[n])
                        }), t
                    }, C.omit = function(e) {
                        var t = {}, n = p.apply(r, u.call(arguments, 1));
                        for (var o in e) C.contains(n, o) || (t[o] = e[o]);
                        return t
                    }, C.defaults = function(e) {
                        return x(u.call(arguments, 1), function(t) {
                            if (t)
                                for (var n in t) void 0 === e[n] && (e[n] = t[n])
                        }), e
                    }, C.clone = function(e) {
                        return C.isObject(e) ? C.isArray(e) ? e.slice() : C.extend({}, e) : e
                    }, C.tap = function(e, t) {
                        return t(e), e
                    };
                    var N = function(e, t, n, o) {
                        if (e === t) return 0 !== e || 1 / e == 1 / t;
                        if (null == e || null == t) return e === t;
                        e instanceof C && (e = e._wrapped), t instanceof C && (t = t._wrapped);
                        var i = l.call(e);
                        if (i != l.call(t)) return !1;
                        switch (i) {
                            case "[object String]":
                                return e == String(t);
                            case "[object Number]":
                                return e != +e ? t != +t : 0 == e ? 1 / e == 1 / t : e == +t;
                            case "[object Date]":
                            case "[object Boolean]":
                                return +e == +t;
                            case "[object RegExp]":
                                return e.source == t.source && e.global == t.global && e.multiline == t.multiline && e.ignoreCase == t.ignoreCase
                        }
                        if ("object" != typeof e || "object" != typeof t) return !1;
                        for (var r = n.length; r--;)
                            if (n[r] == e) return o[r] == t;
                        var s = e.constructor,
                            a = t.constructor;
                        if (s !== a && !(C.isFunction(s) && s instanceof s && C.isFunction(a) && a instanceof a) && "constructor" in e && "constructor" in t) return !1;
                        n.push(e), o.push(t);
                        var c = 0,
                            u = !0;
                        if ("[object Array]" == i) {
                            if (c = e.length, u = c == t.length)
                                for (; c-- && (u = N(e[c], t[c], n, o)););
                        } else {
                            for (var p in e)
                                if (C.has(e, p) && (c++, !(u = C.has(t, p) && N(e[p], t[p], n, o)))) break;
                            if (u) {
                                for (p in t)
                                    if (C.has(t, p) && !c--) break;
                                u = !c
                            }
                        }
                        return n.pop(), o.pop(), u
                    };
                    C.isEqual = function(e, t) {
                        return N(e, t, [], [])
                    }, C.isEmpty = function(e) {
                        if (null == e) return !0;
                        if (C.isArray(e) || C.isString(e)) return 0 === e.length;
                        for (var t in e)
                            if (C.has(e, t)) return !1;
                        return !0
                    }, C.isElement = function(e) {
                        return !(!e || 1 !== e.nodeType)
                    }, C.isArray = S || function(e) {
                        return "[object Array]" == l.call(e)
                    }, C.isObject = function(e) {
                        return e === Object(e)
                    }, x(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function(e) {
                        C["is" + e] = function(t) {
                            return l.call(t) == "[object " + e + "]"
                        }
                    }), C.isArguments(arguments) || (C.isArguments = function(e) {
                        return !(!e || !C.has(e, "callee"))
                    }), "function" != typeof / . / && (C.isFunction = function(e) {
                        return "function" == typeof e
                    }), C.isFinite = function(e) {
                        return isFinite(e) && !isNaN(parseFloat(e))
                    }, C.isNaN = function(e) {
                        return C.isNumber(e) && e != +e
                    }, C.isBoolean = function(e) {
                        return e === !0 || e === !1 || "[object Boolean]" == l.call(e)
                    }, C.isNull = function(e) {
                        return null === e
                    }, C.isUndefined = function(e) {
                        return void 0 === e
                    }, C.has = function(e, t) {
                        return f.call(e, t)
                    }, C.noConflict = function() {
                        return e._ = o, this
                    }, C.identity = function(e) {
                        return e
                    }, C.constant = function(e) {
                        return function() {
                            return e
                        }
                    }, C.property = function(e) {
                        return function(t) {
                            return t[e]
                        }
                    }, C.matches = function(e) {
                        return function(t) {
                            if (t === e) return !0;
                            for (var n in e)
                                if (e[n] !== t[n]) return !1;
                            return !0
                        }
                    }, C.times = function(e, t, n) {
                        for (var o = Array(Math.max(0, e)), i = 0; e > i; i++) o[i] = t.call(n, i);
                        return o
                    }, C.random = function(e, t) {
                        return null == t && (t = e, e = 0), e + Math.floor(Math.random() * (t - e + 1))
                    }, C.now = Date.now || function() {
                        return (new Date).getTime()
                    };
                    var I = {
                        escape: {
                            "&": "&amp;",
                            "<": "&lt;",
                            ">": "&gt;",
                            '"': "&quot;",
                            "'": "&#x27;"
                        }
                    };
                    I.unescape = C.invert(I.escape);
                    var P = {
                        escape: new RegExp("[" + C.keys(I.escape).join("") + "]", "g"),
                        unescape: new RegExp("(" + C.keys(I.unescape).join("|") + ")", "g")
                    };
                    C.each(["escape", "unescape"], function(e) {
                        C[e] = function(t) {
                            return null == t ? "" : ("" + t).replace(P[e], function(t) {
                                return I[e][t]
                            })
                        }
                    }), C.result = function(e, t) {
                        if (null == e) return void 0;
                        var n = e[t];
                        return C.isFunction(n) ? n.call(e) : n
                    }, C.mixin = function(e) {
                        x(C.functions(e), function(t) {
                            var n = C[t] = e[t];
                            C.prototype[t] = function() {
                                var e = [this._wrapped];
                                return c.apply(e, arguments), $.call(this, n.apply(C, e))
                            }
                        })
                    };
                    var M = 0;
                    C.uniqueId = function(e) {
                        var t = ++M + "";
                        return e ? e + t : t
                    }, C.templateSettings = {
                        evaluate: /<%([\s\S]+?)%>/g,
                        interpolate: /<%=([\s\S]+?)%>/g,
                        escape: /<%-([\s\S]+?)%>/g
                    };
                    var L = /(.)^/,
                        W = {
                            "'": "'",
                            "\\": "\\",
                            "\r": "r",
                            "\n": "n",
                            "  ": "t",
                            "\u2028": "u2028",
                            "\u2029": "u2029"
                        }, q = /\\|'|\r|\n|\t|\u2028|\u2029/g;
                    C.template = function(e, t, n) {
                        var o;
                        n = C.defaults({}, n, C.templateSettings);
                        var i = new RegExp([(n.escape || L).source, (n.interpolate || L).source, (n.evaluate || L).source].join("|") + "|$", "g"),
                            r = 0,
                            s = "__p+='";
                        e.replace(i, function(t, n, o, i, a) {
                            return s += e.slice(r, a).replace(q, function(e) {
                                return "\\" + W[e]
                            }), n && (s += "'+\n((__t=(" + n + "))==null?'':_.escape(__t))+\n'"), o && (s += "'+\n((__t=(" + o + "))==null?'':__t)+\n'"), i && (s += "';\n" + i + "\n__p+='"), r = a + t.length, t
                        }), s += "';\n", n.variable || (s = "with(obj||{}){\n" + s + "}\n"), s = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + s + "return __p;\n";
                        try {
                            o = new Function(n.variable || "obj", "_", s)
                        } catch (a) {
                            throw a.source = s, a
                        }
                        if (t) return o(t, C);
                        var c = function(e) {
                            return o.call(this, e, C)
                        };
                        return c.source = "function(" + (n.variable || "obj") + "){\n" + s + "}", c
                    }, C.chain = function(e) {
                        return C(e).chain()
                    };
                    var $ = function(e) {
                        return this._chain ? C(e).chain() : e
                    };
                    C.mixin(C), x(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(e) {
                        var t = r[e];
                        C.prototype[e] = function() {
                            var n = this._wrapped;
                            return t.apply(n, arguments), "shift" != e && "splice" != e || 0 !== n.length || delete n[0], $.call(this, n)
                        }
                    }), x(["concat", "join", "slice"], function(e) {
                        var t = r[e];
                        C.prototype[e] = function() {
                            return $.call(this, t.apply(this._wrapped, arguments))
                        }
                    }), C.extend(C.prototype, {
                        chain: function() {
                            return this._chain = !0, this
                        },
                        value: function() {
                            return this._wrapped
                        }
                    }), "function" == typeof define && define.amd && define("underscore", [], function() {
                        return C
                    })
                }.call(this)
            }, {}
        ],
        18: [

            function(e, t) {
                function n() {
                    this.callbacks = {}
                }
                t.exports = n, n.prototype.on = function(e) {
                    var t = 3 === arguments.length,
                        n = t ? arguments[1] : void 0,
                        o = t ? arguments[2] : arguments[1];
                    return o._groupName = n, (this.callbacks[e] = this.callbacks[e] || []).push(o), this
                }, n.prototype.once = function(e) {
                    function t() {
                        n.off(e, t), r.apply(this, arguments)
                    }
                    var n = this,
                        o = 3 === arguments.length,
                        i = o ? arguments[1] : void 0,
                        r = o ? arguments[2] : arguments[1];
                    return this.on(e, i, t), this
                }, n.prototype.releaseGroup = function(e) {
                    var t, n, o, i;
                    for (t in this.callbacks)
                        for (i = this.callbacks[t], n = 0, o = i.length; o > n; n++) i[n]._groupName === e && (i.splice(n, 1), n--, o--);
                    return this
                }, n.prototype.off = function(e, t) {
                    var n, o = this.callbacks[e];
                    return o ? 1 === arguments.length ? (delete this.callbacks[e], this) : (n = o.indexOf(t), o.splice(n, 1), this) : this
                }, n.prototype.emit = function(e) {
                    var t, n, o, i = [].slice.call(arguments, 1),
                        r = this.callbacks[e],
                        s = this.getWildcardCallbacks(e);
                    if (r)
                        for (o = r.slice(), t = 0, n = o.length; n > t && o[t]; ++t) o[t].apply(this, i);
                    if (s)
                        for (n = s.length, o = s.slice(), t = 0, n = o.length; n > t && o[t]; ++t) o[t].apply(this, [e].concat(i));
                    return this
                }, n.prototype.getWildcardCallbacks = function(e) {
                    var t, n, o = [];
                    for (t in this.callbacks) n = t.split("*"), ("*" === t || 2 === n.length && e.slice(0, n[0].length) === n[0]) && (o = o.concat(this.callbacks[t]));
                    return o
                }
            }, {}
        ],
        12: [

            function(e, t) {
                function n(e, t) {
                    var n, o = this;
                    a.call(this), e = e || {}, e.iceServers = e.iceServers || [], this.pc = new c(e, t), this.pc.on("*", function() {
                        o.emit.apply(o, arguments)
                    }), this.pc.onremovestream = this.emit.bind(this, "removeStream"), this.pc.onnegotiationneeded = this.emit.bind(this, "negotiationNeeded"), this.pc.oniceconnectionstatechange = this.emit.bind(this, "iceConnectionStateChange"), this.pc.onsignalingstatechange = this.emit.bind(this, "signalingStateChange"), this.pc.onaddstream = this._onAddStream.bind(this), this.pc.onicecandidate = this._onIce.bind(this), this.pc.ondatachannel = this._onDataChannel.bind(this), this.localDescription = {
                        contents: []
                    }, this.remoteDescription = {
                        contents: []
                    }, this.localStream = null, this.remoteStreams = [], this.config = {
                        debug: !1,
                        ice: {},
                        sid: "",
                        isInitiator: !0,
                        sdpSessionID: Date.now(),
                        useJingle: !1
                    };
                    for (n in e) this.config[n] = e[n];
                    this.config.debug && this.on("*", function() {
                        var t = e.logger || console;
                        t.log("PeerConnection event:", arguments)
                    })
                }
                var o = e("underscore"),
                    i = e("util"),
                    r = e("webrtcsupport"),
                    s = e("sdp-jingle-json"),
                    a = e("wildemitter"),
                    c = e("traceablepeerconnection");
                i.inherits(n, a), n.prototype.__defineGetter__ && (n.prototype.__defineGetter__("signalingState", function() {
                    return this.pc.signalingState
                }), n.prototype.__defineGetter__("iceConnectionState", function() {
                    return this.pc.iceConnectionState
                })), n.prototype.addStream = function(e) {
                    this.localStream = e, this.pc.addStream(e)
                }, n.prototype.processIce = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    if (e.contents) {
                        var i = o.pluck(this.remoteDescription.contents, "name"),
                            a = e.contents;
                        a.forEach(function(e) {
                            var t = e.transport || {}, o = t.candidates || [],
                                a = i.indexOf(e.name),
                                c = e.name;
                            o.forEach(function(e) {
                                console.log("addicecandidate");
                                var t = s.toCandidateSDP(e) + "\r\n";
                                n.pc.addIceCandidate(new r.IceCandidate({
                                    candidate: t,
                                    sdpMLineIndex: a,
                                    sdpMid: c
                                }))
                            })
                        })
                    } else n.pc.addIceCandidate(new r.IceCandidate(e.candidate));
                    t()
                }, n.prototype.offer = function(e, t) {
                    var n = this,
                        i = 2 === arguments.length,
                        r = i ? e : {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        };
                    t = i ? t : e, t = t || function() {}, this.pc.createOffer(function(e) {
                        n.pc.setLocalDescription(e, function() {
                            var i, r = {
                                    type: "offer",
                                    sdp: e.sdp
                                };
                            n.config.useJingle && (i = s.toSessionJSON(e.sdp, n.config.isInitiator ? "initiator" : "responder"), i.sid = n.config.sid, n.localDescription = i, o.each(i.contents, function(e) {
                                var t = e.transport || {};
                                t.ufrag && (n.config.ice[e.name] = {
                                    ufrag: t.ufrag,
                                    pwd: t.pwd
                                })
                            }), r.jingle = i), n.emit("offer", r), t(null, r)
                        }, function(e) {
                            n.emit("error", e), t(e)
                        })
                    }, function(e) {
                        n.emit("error", e), t(e)
                    }, r)
                }, n.prototype.handleOffer = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    e.type = "offer", e.jingle && (e.sdp = s.toSessionSDP(e.jingle, n.config.sdpSessionID)), n.pc.setRemoteDescription(new r.SessionDescription(e), function() {
                        t()
                    }, t)
                }, n.prototype.answerAudioOnly = function(e) {
                    var t = {
                        mandatory: {
                            OfferToReceiveAudio: !0,
                            OfferToReceiveVideo: !1
                        }
                    };
                    this._answer(t, e)
                }, n.prototype.answerBroadcastOnly = function(e) {
                    var t = {
                        mandatory: {
                            OfferToReceiveAudio: !1,
                            OfferToReceiveVideo: !1
                        }
                    };
                    this._answer(t, e)
                }, n.prototype.answer = function(e, t) {
                    var n = 2 === arguments.length,
                        o = n ? t : e,
                        i = n ? e : {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        };
                    this._answer(i, o)
                }, n.prototype.handleAnswer = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    e.jingle && (e.sdp = s.toSessionSDP(e.jingle, n.config.sdpSessionID), n.remoteDescription = e.jingle), n.pc.setRemoteDescription(new r.SessionDescription(e), function() {
                        t(null)
                    }, t)
                }, n.prototype.close = function() {
                    this.pc.close(), this.emit("close")
                }, n.prototype._answer = function(e, t) {
                    t = t || function() {};
                    var n = this;
                    if (!this.pc.remoteDescription) throw new Error("remoteDescription not set");
                    n.pc.createAnswer(function(e) {
                        n.pc.setLocalDescription(e, function() {
                            var o = {
                                type: "answer",
                                sdp: e.sdp
                            };
                            if (n.config.useJingle) {
                                var i = s.toSessionJSON(e.sdp);
                                i.sid = n.config.sid, n.localDescription = i, o.jingle = i
                            }
                            n.emit("answer", o), t(null, o)
                        }, function(e) {
                            n.emit("error", e), t(e)
                        })
                    }, function(e) {
                        n.emit("error", e), t(e)
                    }, e)
                }, n.prototype._onIce = function(e) {
                    var t = this;
                    if (e.candidate) {
                        var n = e.candidate,
                            i = {
                                candidate: e.candidate
                            };
                        if (t.config.useJingle) {
                            if (!t.config.ice[n.sdpMid]) {
                                var r = s.toSessionJSON(t.pc.localDescription.sdp, t.config.isInitiator ? "initiator" : "responder");
                                o.each(r.contents, function(e) {
                                    var n = e.transport || {};
                                    n.ufrag && (t.config.ice[e.name] = {
                                        ufrag: n.ufrag,
                                        pwd: n.pwd
                                    })
                                })
                            }
                            i.jingle = {
                                contents: [{
                                    name: n.sdpMid,
                                    creator: t.config.isInitiator ? "initiator" : "responder",
                                    transport: {
                                        transType: "iceUdp",
                                        ufrag: t.config.ice[n.sdpMid].ufrag,
                                        pwd: t.config.ice[n.sdpMid].pwd,
                                        candidates: [s.toCandidateJSON(n.candidate)]
                                    }
                                }]
                            }
                        }
                        this.emit("ice", i)
                    } else this.emit("endOfCandidates")
                }, n.prototype._onDataChannel = function(e) {
                    this.emit("addChannel", e.channel)
                }, n.prototype._onAddStream = function(e) {
                    this.remoteStreams.push(e.stream), this.emit("addStream", e)
                }, n.prototype.createDataChannel = function(e, t) {
                    var n = this.pc.createDataChannel(e, t);
                    return n
                }, t.exports = n
            }, {
                "sdp-jingle-json": 20,
                traceablepeerconnection: 19,
                underscore: 17,
                util: 15,
                webrtcsupport: 11,
                wildemitter: 18
            }
        ],
        14: [

            function(e, t) {
                function n(e) {
                    if (this.support = o.webAudio && o.mediaStream, this.gain = 1, this.support) {
                        var t = this.context = new o.AudioContext;
                        this.microphone = t.createMediaStreamSource(e), this.gainFilter = t.createGain(), this.destination = t.createMediaStreamDestination(), this.outputStream = this.destination.stream, this.microphone.connect(this.gainFilter), this.gainFilter.connect(this.destination), e.removeTrack(e.getAudioTracks()[0]), e.addTrack(this.outputStream.getAudioTracks()[0])
                    }
                    this.stream = e
                }
                var o = e("webrtcsupport");
                n.prototype.setGain = function(e) {
                    this.support && (this.gainFilter.gain.value = e, this.gain = e)
                }, n.prototype.getGain = function() {
                    return this.gain
                }, n.prototype.off = function() {
                    return this.setGain(0)
                }, n.prototype.on = function() {
                    this.setGain(1)
                }, t.exports = n
            }, {
                webrtcsupport: 11
            }
        ],
        21: [

            function(e, t) {
                var n = t.exports = {};
                n.nextTick = function() {
                    var e = "undefined" != typeof window && window.setImmediate,
                        t = "undefined" != typeof window && window.postMessage && window.addEventListener;
                    if (e) return function(e) {
                        return window.setImmediate(e)
                    };
                    if (t) {
                        var n = [];
                        return window.addEventListener("message", function(e) {
                            var t = e.source;
                            if ((t === window || null === t) && "process-tick" === e.data && (e.stopPropagation(), n.length > 0)) {
                                var o = n.shift();
                                o()
                            }
                        }, !0),
                        function(e) {
                            n.push(e), window.postMessage("process-tick", "*")
                        }
                    }
                    return function(e) {
                        setTimeout(e, 0)
                    }
                }(), n.title = "browser", n.browser = !0, n.env = {}, n.argv = [], n.binding = function() {
                    throw new Error("process.binding is not supported")
                }, n.cwd = function() {
                    return "/"
                }, n.chdir = function() {
                    throw new Error("process.chdir is not supported")
                }
            }, {}
        ],
        16: [

            function(e, t, n) {
                function o(e, t) {
                    if (e.indexOf) return e.indexOf(t);
                    for (var n = 0; n < e.length; n++)
                        if (t === e[n]) return n;
                    return -1
                }
                var i = e("__browserify_process");
                i.EventEmitter || (i.EventEmitter = function() {});
                var r = n.EventEmitter = i.EventEmitter,
                    s = "function" == typeof Array.isArray ? Array.isArray : function(e) {
                        return "[object Array]" === Object.prototype.toString.call(e)
                    }, a = 10;
                r.prototype.setMaxListeners = function(e) {
                    this._events || (this._events = {}), this._events.maxListeners = e
                }, r.prototype.emit = function(e) {
                    if ("error" === e && (!this._events || !this._events.error || s(this._events.error) && !this._events.error.length)) throw arguments[1] instanceof Error ? arguments[1] : new Error("Uncaught, unspecified 'error' event.");
                    if (!this._events) return !1;
                    var t = this._events[e];
                    if (!t) return !1;
                    if ("function" == typeof t) {
                        switch (arguments.length) {
                            case 1:
                                t.call(this);
                                break;
                            case 2:
                                t.call(this, arguments[1]);
                                break;
                            case 3:
                                t.call(this, arguments[1], arguments[2]);
                                break;
                            default:
                                var n = Array.prototype.slice.call(arguments, 1);
                                t.apply(this, n)
                        }
                        return !0
                    }
                    if (s(t)) {
                        for (var n = Array.prototype.slice.call(arguments, 1), o = t.slice(), i = 0, r = o.length; r > i; i++) o[i].apply(this, n);
                        return !0
                    }
                    return !1
                }, r.prototype.addListener = function(e, t) {
                    if ("function" != typeof t) throw new Error("addListener only takes instances of Function");
                    if (this._events || (this._events = {}), this.emit("newListener", e, t), this._events[e])
                        if (s(this._events[e])) {
                            if (!this._events[e].warned) {
                                var n;
                                n = void 0 !== this._events.maxListeners ? this._events.maxListeners : a, n && n > 0 && this._events[e].length > n && (this._events[e].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length), console.trace())
                            }
                            this._events[e].push(t)
                        } else this._events[e] = [this._events[e], t];
                        else this._events[e] = t;
                    return this
                }, r.prototype.on = r.prototype.addListener, r.prototype.once = function(e, t) {
                    var n = this;
                    return n.on(e, function o() {
                        n.removeListener(e, o), t.apply(this, arguments)
                    }), this
                }, r.prototype.removeListener = function(e, t) {
                    if ("function" != typeof t) throw new Error("removeListener only takes instances of Function");
                    if (!this._events || !this._events[e]) return this;
                    var n = this._events[e];
                    if (s(n)) {
                        var i = o(n, t);
                        if (0 > i) return this;
                        n.splice(i, 1), 0 == n.length && delete this._events[e]
                    } else this._events[e] === t && delete this._events[e];
                    return this
                }, r.prototype.removeAllListeners = function(e) {
                    return 0 === arguments.length ? (this._events = {}, this) : (e && this._events && this._events[e] && (this._events[e] = null), this)
                }, r.prototype.listeners = function(e) {
                    return this._events || (this._events = {}), this._events[e] || (this._events[e] = []), s(this._events[e]) || (this._events[e] = [this._events[e]]), this._events[e]
                }, r.listenerCount = function(e, t) {
                    var n;
                    return n = e._events && e._events[t] ? "function" == typeof e._events[t] ? 1 : e._events[t].length : 0
                }
            }, {
                __browserify_process: 21
            }
        ],
        13: [

            function(e, t) {
                function n(e, t) {
                    var n = -1 / 0;
                    e.getFloatFrequencyData(t);
                    for (var o = 0, i = t.length; i > o; o++) t[o] > n && t[o] < 0 && (n = t[o]);
                    return n
                }
                var o = e("wildemitter"),
                    i = window.webkitAudioContext || window.AudioContext,
                    r = null;
                t.exports = function(e, t) {
                    var s = new o;
                    if (!i) return s;
                    var t = t || {}, a = t.smoothing || .5,
                        c = t.interval || 100,
                        u = t.threshold,
                        p = t.play,
                        l = !0;
                    r || (r = new i);
                    var f, h, d;
                    d = r.createAnalyser(), d.fftSize = 512, d.smoothingTimeConstant = a, h = new Float32Array(d.fftSize), e.jquery && (e = e[0]), e instanceof HTMLAudioElement ? (f = r.createMediaElementSource(e), "undefined" == typeof p && (p = !0), u = u || -65) : (f = r.createMediaStreamSource(e), u = u || -45), f.connect(d), p && d.connect(r.destination), s.speaking = !1, s.setThreshold = function(e) {
                        u = e
                    }, s.setInterval = function(e) {
                        c = e
                    }, s.stop = function() {
                        l = !1, s.emit("volume_change", -100, u), s.speaking && (s.speaking = !1, s.emit("stopped_speaking"))
                    };
                    var m = function() {
                        setTimeout(function() {
                            if (l) {
                                var e = n(d, h);
                                s.emit("volume_change", e, u), e > u ? s.speaking || (s.speaking = !0, s.emit("speaking")) : s.speaking && (s.speaking = !1, s.emit("stopped_speaking")), m()
                            }
                        }, c)
                    };
                    return m(), s
                }
            }, {
                wildemitter: 3
            }
        ],
        20: [

            function(e, t, n) {
                var o = e("./lib/tosdp"),
                    i = e("./lib/tojson");
                n.toSessionSDP = o.toSessionSDP, n.toMediaSDP = o.toMediaSDP, n.toCandidateSDP = o.toCandidateSDP, n.toSessionJSON = i.toSessionJSON, n.toMediaJSON = i.toMediaJSON, n.toCandidateJSON = i.toCandidateJSON
            }, {
                "./lib/tojson": 23,
                "./lib/tosdp": 22
            }
        ],
        22: [

            function(e, t, n) {
                var o = {
                    initiator: "sendonly",
                    responder: "recvonly",
                    both: "sendrecv",
                    none: "inactive",
                    sendonly: "initator",
                    recvonly: "responder",
                    sendrecv: "both",
                    inactive: "none"
                };
                n.toSessionSDP = function(e, t, o) {
                    var i = ["v=0", "o=- " + (t || e.sid || Date.now()) + " " + (o || Date.now()) + " IN IP4 0.0.0.0", "s=-", "t=0 0"],
                        r = e.groups || [];
                    r.forEach(function(e) {
                        i.push("a=group:" + e.semantics + " " + e.contents.join(" "))
                    });
                    var s = e.contents || [];
                    return s.forEach(function(e) {
                        i.push(n.toMediaSDP(e))
                    }), i.join("\r\n") + "\r\n"
                }, n.toMediaSDP = function(e) {
                    var t = [],
                        i = e.description,
                        r = e.transport,
                        s = i.payloads || [],
                        a = r && r.fingerprints || [],
                        c = [i.media, "1"];
                    i.encryption && i.encryption.length > 0 || a.length > 0 ? c.push("RTP/SAVPF") : c.push("RTP/AVPF"), s.forEach(function(e) {
                        c.push(e.id)
                    }), t.push("m=" + c.join(" ")), t.push("c=IN IP4 0.0.0.0"), t.push("a=rtcp:1 IN IP4 0.0.0.0"), r && (r.ufrag && t.push("a=ice-ufrag:" + r.ufrag), r.pwd && t.push("a=ice-pwd:" + r.pwd), r.setup && t.push("a=setup:" + r.setup), a.forEach(function(e) {
                        t.push("a=fingerprint:" + e.hash + " " + e.value)
                    })), t.push("a=" + (o[e.senders] || "sendrecv")), t.push("a=mid:" + e.name), i.mux && t.push("a=rtcp-mux");
                    var u = i.encryption || [];
                    u.forEach(function(e) {
                        t.push("a=crypto:" + e.tag + " " + e.cipherSuite + " " + e.keyParams + (e.sessionParams ? " " + e.sessionParams : ""))
                    }), s.forEach(function(e) {
                        var n = "a=rtpmap:" + e.id + " " + e.name + "/" + e.clockrate;
                        if (e.channels && "1" != e.channels && (n += "/" + e.channels), t.push(n), e.parameters && e.parameters.length) {
                            var o = ["a=fmtp:" + e.id];
                            e.parameters.forEach(function(e) {
                                o.push((e.key ? e.key + "=" : "") + e.value)
                            }), t.push(o.join(" "))
                        }
                        e.feedback && e.feedback.forEach(function(n) {
                            "trr-int" === n.type ? t.push("a=rtcp-fb:" + e.id + " trr-int " + n.value ? n.value : "0") : t.push("a=rtcp-fb:" + e.id + " " + n.type + (n.subtype ? " " + n.subtype : ""))
                        })
                    }), i.feedback && i.feedback.forEach(function(e) {
                        "trr-int" === e.type ? t.push(e.value) : t.push("a=rtcp-fb:* " + e.type + (e.subtype ? " " + e.subtype : ""))
                    });
                    var p = i.headerExtensions || [];
                    p.forEach(function(e) {
                        t.push("a=extmap:" + e.id + (e.senders ? "/" + o[e.senders] : "") + " " + e.uri)
                    });
                    var l = i.sourceGroups || [];
                    l.forEach(function(e) {
                        t.push("a=ssrc-group:" + e.semantics + " " + e.sources.join(" "))
                    });
                    var f = i.sources || [];
                    f.forEach(function(e) {
                        for (var n = 0; n < e.parameters.length; n++) {
                            var o = e.parameters[n];
                            t.push("a=ssrc:" + (e.ssrc || i.ssrc) + " " + o.key + (o.value ? ":" + o.value : ""))
                        }
                    });
                    var h = r.candidates || [];
                    return h.forEach(function(e) {
                        t.push(n.toCandidateSDP(e))
                    }), t.join("\r\n")
                }, n.toCandidateSDP = function(e) {
                    var t = [];
                    t.push(e.foundation), t.push(e.component), t.push(e.protocol), t.push(e.priority), t.push(e.ip), t.push(e.port);
                    var n = e.type;
                    return t.push("typ"), t.push(n), ("srflx" === n || "prflx" === n || "relay" === n) && e.relAddr && e.relPort && (t.push("raddr"), t.push(e.relAddr), t.push("rport"), t.push(e.relPort)), t.push("generation"), t.push(e.generation || "0"), "a=candidate:" + t.join(" ")
                }
            }, {}
        ],
        19: [

            function(e, t) {
                function n(e) {
                    return "type: " + e.type + "\r\n" + e.sdp
                }

                function o(e, t) {
                    var n = this;
                    s.call(this), this.peerconnection = new r.PeerConnection(e, t), this.trace = function(e, t) {
                        n.emit("PeerConnectionTrace", {
                            time: new Date,
                            type: e,
                            value: t || ""
                        })
                    }, this.onicecandidate = null, this.peerconnection.onicecandidate = function(e) {
                        n.trace("onicecandidate", JSON.stringify(e.candidate, null, " ")), null !== n.onicecandidate && n.onicecandidate(e)
                    }, this.onaddstream = null, this.peerconnection.onaddstream = function(e) {
                        n.trace("onaddstream", e.stream.id), null !== n.onaddstream && n.onaddstream(e)
                    }, this.onremovestream = null, this.peerconnection.onremovestream = function(e) {
                        n.trace("onremovestream", e.stream.id), null !== n.onremovestream && n.onremovestream(e)
                    }, this.onsignalingstatechange = null, this.peerconnection.onsignalingstatechange = function(e) {
                        n.trace("onsignalingstatechange", n.signalingState), null !== n.onsignalingstatechange && n.onsignalingstatechange(e)
                    }, this.oniceconnectionstatechange = null, this.peerconnection.oniceconnectionstatechange = function(e) {
                        n.trace("oniceconnectionstatechange", n.iceConnectionState), null !== n.oniceconnectionstatechange && n.oniceconnectionstatechange(e)
                    }, this.onnegotiationneeded = null, this.peerconnection.onnegotiationneeded = function(e) {
                        n.trace("onnegotiationneeded"), null !== n.onnegotiationneeded && n.onnegotiationneeded(e)
                    }, n.ondatachannel = null, this.peerconnection.ondatachannel = function(e) {
                        n.trace("ondatachannel", e), null !== n.ondatachannel && n.ondatachannel(e)
                    }
                }
                var i = e("util"),
                    r = e("webrtcsupport"),
                    s = e("wildemitter");
                i.inherits(o, s), void 0 !== o.prototype.__defineGetter__ && (o.prototype.__defineGetter__("signalingState", function() {
                    return this.peerconnection.signalingState
                }), o.prototype.__defineGetter__("iceConnectionState", function() {
                    return this.peerconnection.iceConnectionState
                }), o.prototype.__defineGetter__("localDescription", function() {
                    return this.peerconnection.localDescription
                }), o.prototype.__defineGetter__("remoteDescription", function() {
                    return this.peerconnection.remoteDescription
                })), o.prototype.addStream = function(e) {
                    this.trace("addStream", e.id), this.peerconnection.addStream(e)
                }, o.prototype.removeStream = function(e) {
                    this.trace("removeStream", e.id), this.peerconnection.removeStream(e)
                }, o.prototype.createDataChannel = function(e, t) {
                    return this.trace("createDataChannel", e, t), this.peerconnection.createDataChannel(e, t)
                }, o.prototype.setLocalDescription = function(e, t, o) {
                    var i = this;
                    this.trace("setLocalDescription", n(e)), this.peerconnection.setLocalDescription(e, function() {
                        i.trace("setLocalDescriptionOnSuccess"), t()
                    }, function(e) {
                        i.trace("setLocalDescriptionOnFailure", e), o(e)
                    })
                }, o.prototype.setRemoteDescription = function(e, t, o) {
                    var i = this;
                    this.trace("setRemoteDescription", n(e)), this.peerconnection.setRemoteDescription(e, function() {
                        i.trace("setRemoteDescriptionOnSuccess"), t()
                    }, function(e) {
                        i.trace("setRemoteDescriptionOnFailure", e), o(e)
                    })
                }, o.prototype.close = function() {
                    this.trace("stop"), null !== this.statsinterval && (window.clearInterval(this.statsinterval), this.statsinterval = null), "closed" != this.peerconnection.signalingState && this.peerconnection.close()
                }, o.prototype.createOffer = function(e, t, o) {
                    var i = this;
                    this.trace("createOffer", JSON.stringify(o, null, " ")), this.peerconnection.createOffer(function(t) {
                        i.trace("createOfferOnSuccess", n(t)), e(t)
                    }, function(e) {
                        i.trace("createOfferOnFailure", e), t(e)
                    }, o)
                }, o.prototype.createAnswer = function(e, t, o) {
                    var i = this;
                    this.trace("createAnswer", JSON.stringify(o, null, " ")), this.peerconnection.createAnswer(function(t) {
                        i.trace("createAnswerOnSuccess", n(t)), e(t)
                    }, function(e) {
                        i.trace("createAnswerOnFailure", e), t(e)
                    }, o)
                }, o.prototype.addIceCandidate = function(e) {
                    this.trace("addIceCandidate", JSON.stringify(e, null, " ")), this.peerconnection.addIceCandidate(e)
                }, o.prototype.getStats = function(e) {
                    navigator.mozGetUserMedia || this.peerconnection.getStats(e)
                }, t.exports = o
            }, {
                util: 15,
                webrtcsupport: 11,
                wildemitter: 18
            }
        ],
        23: [

            function(e, t, n) {
                var o = e("./parsers"),
                    i = Math.random();
                n._setIdCounter = function(e) {
                    i = e
                }, n.toSessionJSON = function(e, t) {
                    for (var i = e.split("\r\nm="), r = 1; r < i.length; r++) i[r] = "m=" + i[r], r !== i.length - 1 && (i[r] += "\r\n");
                    var s = i.shift() + "\r\n",
                        a = o.lines(s),
                        c = {}, u = [];
                    i.forEach(function(e) {
                        u.push(n.toMediaJSON(e, s, t))
                    }), c.contents = u;
                    var p = o.findLines("a=group:", a);
                    return p.length && (c.groups = o.groups(p)), c
                }, n.toMediaJSON = function(e, t, i) {
                    var r = o.lines(e),
                        s = o.lines(t),
                        a = o.mline(r[0]),
                        c = {
                            creator: i,
                            name: a.media,
                            description: {
                                descType: "rtp",
                                media: a.media,
                                payloads: [],
                                encryption: [],
                                feedback: [],
                                headerExtensions: []
                            },
                            transport: {
                                transType: "iceUdp",
                                candidates: [],
                                fingerprints: []
                            }
                        }, u = c.description,
                        p = c.transport,
                        l = o.findLine("a=ssrc:", r);
                    l && (u.ssrc = l.substr(7).split(" ")[0]);
                    var f = o.findLine("a=mid:", r);
                    f && (c.name = f.substr(6)), o.findLine("a=sendrecv", r, s) ? c.senders = "both" : o.findLine("a=sendonly", r, s) ? c.senders = "initiator" : o.findLine("a=recvonly", r, s) ? c.senders = "responder" : o.findLine("a=inactive", r, s) && (c.senders = "none");
                    var h = o.findLines("a=rtpmap:", r);
                    h.forEach(function(e) {
                        var t = o.rtpmap(e);
                        t.feedback = [];
                        var n = o.findLines("a=fmtp:" + t.id, r);
                        n.forEach(function(e) {
                            t.parameters = o.fmtp(e)
                        });
                        var i = o.findLines("a=rtcp-fb:" + t.id, r);
                        i.forEach(function(e) {
                            t.feedback.push(o.rtcpfb(e))
                        }), u.payloads.push(t)
                    });
                    var d = o.findLines("a=crypto:", r, s);
                    d.forEach(function(e) {
                        u.encryption.push(o.crypto(e))
                    }), o.findLine("a=rtcp-mux", r) && (u.mux = !0);
                    var m = o.findLines("a=rtcp-fb:*", r);
                    m.forEach(function(e) {
                        u.feedback.push(o.rtcpfb(e))
                    });
                    var y = o.findLines("a=extmap:", r);
                    y.forEach(function(e) {
                        var t = o.extmap(e),
                            n = {
                                sendonly: "responder",
                                recvonly: "initiator",
                                sendrecv: "both",
                                inactive: "none"
                            };
                        t.senders = n[t.senders], u.headerExtensions.push(t)
                    });
                    var g = o.findLines("a=ssrc-group:", r);
                    u.sourceGroups = o.sourceGroups(g || []);
                    var v = o.findLines("a=ssrc:", r);
                    u.sources = o.sources(v || []);
                    var b = o.findLines("a=fingerprint:", r, s);
                    b.forEach(function(e) {
                        var t = o.fingerprint(e),
                            n = o.findLine("a=setup:", r, s);
                        n && (t.setup = n.substr(8)), p.fingerprints.push(t)
                    });
                    var w = o.findLine("a=ice-ufrag:", r, s),
                        k = o.findLine("a=ice-pwd:", r, s);
                    if (w && k) {
                        p.ufrag = w.substr(12), p.pwd = k.substr(10), p.candidates = [];
                        var S = o.findLines("a=candidate:", r, s);
                        S.forEach(function(e) {
                            p.candidates.push(n.toCandidateJSON(e))
                        })
                    }
                    return c
                }, n.toCandidateJSON = function(e) {
                    var t = o.candidate(e.split("\r\n")[0]);
                    return t.id = (i++).toString(36).substr(0, 12), t
                }
            }, {
                "./parsers": 24
            }
        ],
        24: [

            function(e, t, n) {
                n.lines = function(e) {
                    return e.split("\r\n").filter(function(e) {
                        return e.length > 0
                    })
                }, n.findLine = function(e, t, n) {
                    for (var o = e.length, i = 0; i < t.length; i++)
                        if (t[i].substr(0, o) === e) return t[i];
                    if (!n) return !1;
                    for (var r = 0; r < n.length; r++)
                        if (n[r].substr(0, o) === e) return n[r];
                    return !1
                }, n.findLines = function(e, t, n) {
                    for (var o = [], i = e.length, r = 0; r < t.length; r++) t[r].substr(0, i) === e && o.push(t[r]);
                    if (o.length || !n) return o;
                    for (var s = 0; s < n.length; s++) n[s].substr(0, i) === e && o.push(n[s]);
                    return o
                }, n.mline = function(e) {
                    for (var t = e.substr(2).split(" "), n = {
                            media: t[0],
                            port: t[1],
                            proto: t[2],
                            formats: []
                        }, o = 3; o < t.length; o++) t[o] && n.formats.push(t[o]);
                    return n
                }, n.rtpmap = function(e) {
                    var t = e.substr(9).split(" "),
                        n = {
                            id: t.shift()
                        };
                    return t = t[0].split("/"), n.name = t[0], n.clockrate = t[1], n.channels = 3 == t.length ? t[2] : "1", n
                }, n.fmtp = function(e) {
                    for (var t, n, o, i = e.substr(e.indexOf(" ") + 1).split(";"), r = [], s = 0; s < i.length; s++) t = i[s].split("="), n = t[0].trim(), o = t[1], n && o ? r.push({
                        key: n,
                        value: o
                    }) : n && r.push({
                        key: "",
                        value: n
                    });
                    return r
                }, n.crypto = function(e) {
                    var t = e.substr(9).split(" "),
                        n = {
                            tag: t[0],
                            cipherSuite: t[1],
                            keyParams: t[2],
                            sessionParams: t.slice(3).join(" ")
                        };
                    return n
                }, n.fingerprint = function(e) {
                    var t = e.substr(14).split(" ");
                    return {
                        hash: t[0],
                        value: t[1]
                    }
                }, n.extmap = function(e) {
                    var t = e.substr(9).split(" "),
                        n = {}, o = t.shift(),
                        i = o.indexOf("/");
                    return i >= 0 ? (n.id = o.substr(0, i), n.senders = o.substr(i + 1)) : (n.id = o, n.senders = "sendrecv"), n.uri = t.shift() || "", n
                }, n.rtcpfb = function(e) {
                    var t = e.substr(10).split(" "),
                        n = {};
                    return n.id = t.shift(), n.type = t.shift(), "trr-int" === n.type ? n.value = t.shift() : n.subtype = t.shift() || "", n.parameters = t, n
                }, n.candidate = function(e) {
                    for (var t = e.substring(12).split(" "), n = {
                            foundation: t[0],
                            component: t[1],
                            protocol: t[2].toLowerCase(),
                            priority: t[3],
                            ip: t[4],
                            port: t[5],
                            type: t[7],
                            generation: "0"
                        }, o = 8; o < t.length; o += 2) "raddr" === t[o] ? n.relAddr = t[o + 1] : "rport" === t[o] ? n.relPort = t[o + 1] : "generation" === t[o] && (n.generation = t[o + 1]);
                    return n.network = "1", n
                }, n.sourceGroups = function(e) {
                    for (var t = [], n = 0; n < e.length; n++) {
                        var o = e[n].substr(13).split(" ");
                        t.push({
                            semantics: o.shift(),
                            sources: o
                        })
                    }
                    return t
                }, n.sources = function(e) {
                    for (var t = [], n = {}, o = 0; o < e.length; o++) {
                        var i = e[o].substr(7).split(" "),
                            r = i.shift();
                        if (!n[r]) {
                            var s = {
                                ssrc: r,
                                parameters: []
                            };
                            t.push(s), n[r] = s
                        }
                        i = i.join(" ").split(":");
                        var a = i.shift(),
                            c = i.join(":") || null;
                        n[r].parameters.push({
                            key: a,
                            value: c
                        })
                    }
                    return t
                }, n.groups = function(e) {
                    for (var t, n = [], o = 0; o < e.length; o++) t = e[o].substr(8).split(" "), n.push({
                        semantics: t.shift(),
                        contents: t
                    });
                    return n
                }
            }, {}
        ]
    }, {}, [1])(1)
});
var io = "undefined" == typeof module ? {} : module.exports;
! function() {
    ! function(e, t) {
        var n = e;
        n.version = "0.9.11", n.protocol = 1, n.transports = [], n.j = [], n.sockets = {}, n.connect = function(e, o) {
            var i, r, s = n.util.parseUri(e);
            t && t.location && (s.protocol = s.protocol || t.location.protocol.slice(0, -1), s.host = s.host || (t.document ? t.document.domain : t.location.hostname), s.port = s.port || t.location.port), i = n.util.uniqueUri(s);
            var a = {
                host: s.host,
                secure: "https" == s.protocol,
                port: s.port || ("https" == s.protocol ? 443 : 80),
                query: s.query || ""
            };
            return n.util.merge(a, o), (a["force new connection"] || !n.sockets[i]) && (r = new n.Socket(a)), !a["force new connection"] && r && (n.sockets[i] = r), r = r || n.sockets[i], r.of(s.path.length > 1 ? s.path : "")
        }
    }("object" == typeof module ? module.exports : this.io = {}, this),
    function(e, t) {
        var n = e.util = {}, o = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
            i = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
        n.parseUri = function(e) {
            for (var t = o.exec(e || ""), n = {}, r = 14; r--;) n[i[r]] = t[r] || "";
            return n
        }, n.uniqueUri = function(e) {
            var n = e.protocol,
                o = e.host,
                i = e.port;
            return "document" in t ? (o = o || document.domain, i = i || ("https" == n && "https:" !== document.location.protocol ? 443 : document.location.port)) : (o = o || "localhost", i || "https" != n || (i = 443)), (n || "http") + "://" + o + ":" + (i || 80)
        }, n.query = function(e, t) {
            var o = n.chunkQuery(e || ""),
                i = [];
            n.merge(o, n.chunkQuery(t || ""));
            for (var r in o) o.hasOwnProperty(r) && i.push(r + "=" + o[r]);
            return i.length ? "?" + i.join("&") : ""
        }, n.chunkQuery = function(e) {
            for (var t, n = {}, o = e.split("&"), i = 0, r = o.length; r > i; ++i) t = o[i].split("="), t[0] && (n[t[0]] = t[1]);
            return n
        };
        var r = !1;
        n.load = function(e) {
            return "document" in t && "complete" === document.readyState || r ? e() : (n.on(t, "load", e, !1), void 0)
        }, n.on = function(e, t, n, o) {
            e.attachEvent ? e.attachEvent("on" + t, n) : e.addEventListener && e.addEventListener(t, n, o)
        }, n.request = function(e) {
            if (e && "undefined" != typeof XDomainRequest && !n.ua.hasCORS) return new XDomainRequest;
            if ("undefined" != typeof XMLHttpRequest && (!e || n.ua.hasCORS)) return new XMLHttpRequest;
            if (!e) try {
                return new(window[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")
            } catch (t) {}
            return null
        }, "undefined" != typeof window && n.load(function() {
            r = !0
        }), n.defer = function(e) {
            return n.ua.webkit && "undefined" == typeof importScripts ? (n.load(function() {
                setTimeout(e, 100)
            }), void 0) : e()
        }, n.merge = function(e, t, o, i) {
            var r, s = i || [],
                a = "undefined" == typeof o ? 2 : o;
            for (r in t) t.hasOwnProperty(r) && n.indexOf(s, r) < 0 && ("object" == typeof e[r] && a ? n.merge(e[r], t[r], a - 1, s) : (e[r] = t[r], s.push(t[r])));
            return e
        }, n.mixin = function(e, t) {
            n.merge(e.prototype, t.prototype)
        }, n.inherit = function(e, t) {
            function n() {}
            n.prototype = t.prototype, e.prototype = new n
        }, n.isArray = Array.isArray || function(e) {
            return "[object Array]" === Object.prototype.toString.call(e)
        }, n.intersect = function(e, t) {
            for (var o = [], i = e.length > t.length ? e : t, r = e.length > t.length ? t : e, s = 0, a = r.length; a > s; s++)~ n.indexOf(i, r[s]) && o.push(r[s]);
            return o
        }, n.indexOf = function(e, t, n) {
            for (var o = e.length, n = 0 > n ? 0 > n + o ? 0 : n + o : n || 0; o > n && e[n] !== t; n++);
            return n >= o ? -1 : n
        }, n.toArray = function(e) {
            for (var t = [], n = 0, o = e.length; o > n; n++) t.push(e[n]);
            return t
        }, n.ua = {}, n.ua.hasCORS = "undefined" != typeof XMLHttpRequest && function() {
            try {
                var e = new XMLHttpRequest
            } catch (t) {
                return !1
            }
            return void 0 != e.withCredentials
        }(), n.ua.webkit = "undefined" != typeof navigator && /webkit/i.test(navigator.userAgent), n.ua.iDevice = "undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)
    }("undefined" != typeof io ? io : module.exports, this),
    function(e, t) {
        function n() {}
        e.EventEmitter = n, n.prototype.on = function(e, n) {
            return this.$events || (this.$events = {}), this.$events[e] ? t.util.isArray(this.$events[e]) ? this.$events[e].push(n) : this.$events[e] = [this.$events[e], n] : this.$events[e] = n, this
        }, n.prototype.addListener = n.prototype.on, n.prototype.once = function(e, t) {
            function n() {
                o.removeListener(e, n), t.apply(this, arguments)
            }
            var o = this;
            return n.listener = t, this.on(e, n), this
        }, n.prototype.removeListener = function(e, n) {
            if (this.$events && this.$events[e]) {
                var o = this.$events[e];
                if (t.util.isArray(o)) {
                    for (var i = -1, r = 0, s = o.length; s > r; r++)
                        if (o[r] === n || o[r].listener && o[r].listener === n) {
                            i = r;
                            break
                        }
                    if (0 > i) return this;
                    o.splice(i, 1), o.length || delete this.$events[e]
                } else(o === n || o.listener && o.listener === n) && delete this.$events[e]
            }
            return this
        }, n.prototype.removeAllListeners = function(e) {
            return void 0 === e ? (this.$events = {}, this) : (this.$events && this.$events[e] && (this.$events[e] = null), this)
        }, n.prototype.listeners = function(e) {
            return this.$events || (this.$events = {}), this.$events[e] || (this.$events[e] = []), t.util.isArray(this.$events[e]) || (this.$events[e] = [this.$events[e]]), this.$events[e]
        }, n.prototype.emit = function(e) {
            if (!this.$events) return !1;
            var n = this.$events[e];
            if (!n) return !1;
            var o = Array.prototype.slice.call(arguments, 1);
            if ("function" == typeof n) n.apply(this, o);
            else {
                if (!t.util.isArray(n)) return !1;
                for (var i = n.slice(), r = 0, s = i.length; s > r; r++) i[r].apply(this, o)
            }
            return !0
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),
    function(exports, nativeJSON) {
        "use strict";

        function f(e) {
            return 10 > e ? "0" + e : e
        }

        function date(e) {
            return isFinite(e.valueOf()) ? e.getUTCFullYear() + "-" + f(e.getUTCMonth() + 1) + "-" + f(e.getUTCDate()) + "T" + f(e.getUTCHours()) + ":" + f(e.getUTCMinutes()) + ":" + f(e.getUTCSeconds()) + "Z" : null
        }

        function quote(e) {
            return escapable.lastIndex = 0, escapable.test(e) ? '"' + e.replace(escapable, function(e) {
                var t = meta[e];
                return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
            }) + '"' : '"' + e + '"'
        }

        function str(e, t) {
            var n, o, i, r, s, a = gap,
                c = t[e];
            switch (c instanceof Date && (c = date(e)), "function" == typeof rep && (c = rep.call(t, e, c)), typeof c) {
                case "string":
                    return quote(c);
                case "number":
                    return isFinite(c) ? String(c) : "null";
                case "boolean":
                case "null":
                    return String(c);
                case "object":
                    if (!c) return "null";
                    if (gap += indent, s = [], "[object Array]" === Object.prototype.toString.apply(c)) {
                        for (r = c.length, n = 0; r > n; n += 1) s[n] = str(n, c) || "null";
                        return i = 0 === s.length ? "[]" : gap ? "[\n" + gap + s.join(",\n" + gap) + "\n" + a + "]" : "[" + s.join(",") + "]", gap = a, i
                    }
                    if (rep && "object" == typeof rep)
                        for (r = rep.length, n = 0; r > n; n += 1) "string" == typeof rep[n] && (o = rep[n], i = str(o, c), i && s.push(quote(o) + (gap ? ": " : ":") + i));
                    else
                        for (o in c) Object.prototype.hasOwnProperty.call(c, o) && (i = str(o, c), i && s.push(quote(o) + (gap ? ": " : ":") + i));
                    return i = 0 === s.length ? "{}" : gap ? "{\n" + gap + s.join(",\n" + gap) + "\n" + a + "}" : "{" + s.join(",") + "}", gap = a, i
            }
        }
        if (nativeJSON && nativeJSON.parse) return exports.JSON = {
            parse: nativeJSON.parse,
            stringify: nativeJSON.stringify
        };
        var JSON = exports.JSON = {}, cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap, indent, meta = {
                "\b": "\\b",
                "    ": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                '"': '\\"',
                "\\": "\\\\"
            }, rep;
        JSON.stringify = function(e, t, n) {
            var o;
            if (gap = "", indent = "", "number" == typeof n)
                for (o = 0; n > o; o += 1) indent += " ";
            else "string" == typeof n && (indent = n); if (rep = t, t && "function" != typeof t && ("object" != typeof t || "number" != typeof t.length)) throw new Error("JSON.stringify");
            return str("", {
                "": e
            })
        }, JSON.parse = function(text, reviver) {
            function walk(e, t) {
                var n, o, i = e[t];
                if (i && "object" == typeof i)
                    for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (o = walk(i, n), void 0 !== o ? i[n] = o : delete i[n]);
                return reviver.call(e, t, i)
            }
            var j;
            if (text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function(e) {
                return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4)
            })), /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({
                "": j
            }, "") : j;
            throw new SyntaxError("JSON.parse")
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof JSON ? JSON : void 0),
    function(e, t) {
        var n = e.parser = {}, o = n.packets = ["disconnect", "connect", "heartbeat", "message", "json", "event", "ack", "error", "noop"],
            i = n.reasons = ["transport not supported", "client not handshaken", "unauthorized"],
            r = n.advice = ["reconnect"],
            s = t.JSON,
            a = t.util.indexOf;
        n.encodePacket = function(e) {
            var t = a(o, e.type),
                n = e.id || "",
                c = e.endpoint || "",
                u = e.ack,
                p = null;
            switch (e.type) {
                case "error":
                    var l = e.reason ? a(i, e.reason) : "",
                        f = e.advice ? a(r, e.advice) : "";
                    ("" !== l || "" !== f) && (p = l + ("" !== f ? "+" + f : ""));
                    break;
                case "message":
                    "" !== e.data && (p = e.data);
                    break;
                case "event":
                    var h = {
                        name: e.name
                    };
                    e.args && e.args.length && (h.args = e.args), p = s.stringify(h);
                    break;
                case "json":
                    p = s.stringify(e.data);
                    break;
                case "connect":
                    e.qs && (p = e.qs);
                    break;
                case "ack":
                    p = e.ackId + (e.args && e.args.length ? "+" + s.stringify(e.args) : "")
            }
            var d = [t, n + ("data" == u ? "+" : ""), c];
            return null !== p && void 0 !== p && d.push(p), d.join(":")
        }, n.encodePayload = function(e) {
            var t = "";
            if (1 == e.length) return e[0];
            for (var n = 0, o = e.length; o > n; n++) {
                var i = e[n];
                t += "ï¿½" + i.length + "ï¿½" + e[n]
            }
            return t
        };
        var c = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
        n.decodePacket = function(e) {
            var t = e.match(c);
            if (!t) return {};
            var n = t[2] || "",
                e = t[5] || "",
                a = {
                    type: o[t[1]],
                    endpoint: t[4] || ""
                };
            switch (n && (a.id = n, a.ack = t[3] ? "data" : !0), a.type) {
                case "error":
                    var t = e.split("+");
                    a.reason = i[t[0]] || "", a.advice = r[t[1]] || "";
                    break;
                case "message":
                    a.data = e || "";
                    break;
                case "event":
                    try {
                        var u = s.parse(e);
                        a.name = u.name, a.args = u.args
                    } catch (p) {}
                    a.args = a.args || [];
                    break;
                case "json":
                    try {
                        a.data = s.parse(e)
                    } catch (p) {}
                    break;
                case "connect":
                    a.qs = e || "";
                    break;
                case "ack":
                    var t = e.match(/^([0-9]+)(\+)?(.*)/);
                    if (t && (a.ackId = t[1], a.args = [], t[3])) try {
                        a.args = t[3] ? s.parse(t[3]) : []
                    } catch (p) {}
                    break;
                case "disconnect":
                case "heartbeat":
            }
            return a
        }, n.decodePayload = function(e) {
            if ("ï¿½" == e.charAt(0)) {
                for (var t = [], o = 1, i = ""; o < e.length; o++) "ï¿½" == e.charAt(o) ? (t.push(n.decodePacket(e.substr(o + 1).substr(0, i))), o += Number(i) + 1, i = "") : i += e.charAt(o);
                return t
            }
            return [n.decodePacket(e)]
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),
    function(e, t) {
        function n(e, t) {
            this.socket = e, this.sessid = t
        }
        e.Transport = n, t.util.mixin(n, t.EventEmitter), n.prototype.heartbeats = function() {
            return !0
        }, n.prototype.onData = function(e) {
            if (this.clearCloseTimeout(), (this.socket.connected || this.socket.connecting || this.socket.reconnecting) && this.setCloseTimeout(), "" !== e) {
                var n = t.parser.decodePayload(e);
                if (n && n.length)
                    for (var o = 0, i = n.length; i > o; o++) this.onPacket(n[o])
            }
            return this
        }, n.prototype.onPacket = function(e) {
            return this.socket.setHeartbeatTimeout(), "heartbeat" == e.type ? this.onHeartbeat() : ("connect" == e.type && "" == e.endpoint && this.onConnect(), "error" == e.type && "reconnect" == e.advice && (this.isOpen = !1), this.socket.onPacket(e), this)
        }, n.prototype.setCloseTimeout = function() {
            if (!this.closeTimeout) {
                var e = this;
                this.closeTimeout = setTimeout(function() {
                    e.onDisconnect()
                }, this.socket.closeTimeout)
            }
        }, n.prototype.onDisconnect = function() {
            return this.isOpen && this.close(), this.clearTimeouts(), this.socket.onDisconnect(), this
        }, n.prototype.onConnect = function() {
            return this.socket.onConnect(), this
        }, n.prototype.clearCloseTimeout = function() {
            this.closeTimeout && (clearTimeout(this.closeTimeout), this.closeTimeout = null)
        }, n.prototype.clearTimeouts = function() {
            this.clearCloseTimeout(), this.reopenTimeout && clearTimeout(this.reopenTimeout)
        }, n.prototype.packet = function(e) {
            this.send(t.parser.encodePacket(e))
        }, n.prototype.onHeartbeat = function() {
            this.packet({
                type: "heartbeat"
            })
        }, n.prototype.onOpen = function() {
            this.isOpen = !0, this.clearCloseTimeout(), this.socket.onOpen()
        }, n.prototype.onClose = function() {
            this.isOpen = !1, this.socket.onClose(), this.onDisconnect()
        }, n.prototype.prepareUrl = function() {
            var e = this.socket.options;
            return this.scheme() + "://" + e.host + ":" + e.port + "/" + e.resource + "/" + t.protocol + "/" + this.name + "/" + this.sessid
        }, n.prototype.ready = function(e, t) {
            t.call(this)
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),
    function(e, t, n) {
        function o(e) {
            if (this.options = {
                port: 80,
                secure: !1,
                document: "document" in n ? document : !1,
                resource: "socket.io",
                transports: t.transports,
                "connect timeout": 1e4,
                "try multiple transports": !0,
                reconnect: !0,
                "reconnection delay": 500,
                "reconnection limit": 1 / 0,
                "reopen delay": 3e3,
                "max reconnection attempts": 10,
                "sync disconnect on unload": !1,
                "auto connect": !0,
                "flash policy port": 10843,
                manualFlush: !1
            }, t.util.merge(this.options, e), this.connected = !1, this.open = !1, this.connecting = !1, this.reconnecting = !1, this.namespaces = {}, this.buffer = [], this.doBuffer = !1, this.options["sync disconnect on unload"] && (!this.isXDomain() || t.util.ua.hasCORS)) {
                var o = this;
                t.util.on(n, "beforeunload", function() {
                    o.disconnectSync()
                }, !1)
            }
            this.options["auto connect"] && this.connect()
        }

        function i() {}
        e.Socket = o, t.util.mixin(o, t.EventEmitter), o.prototype.of = function(e) {
            return this.namespaces[e] || (this.namespaces[e] = new t.SocketNamespace(this, e), "" !== e && this.namespaces[e].packet({
                type: "connect"
            })), this.namespaces[e]
        }, o.prototype.publish = function() {
            this.emit.apply(this, arguments);
            var e;
            for (var t in this.namespaces) this.namespaces.hasOwnProperty(t) && (e = this.of(t), e.$emit.apply(e, arguments))
        }, o.prototype.handshake = function(e) {
            function n(t) {
                t instanceof Error ? (o.connecting = !1, o.onError(t.message)) : e.apply(null, t.split(":"))
            }
            var o = this,
                r = this.options,
                s = ["http" + (r.secure ? "s" : "") + ":/", r.host + ":" + r.port, r.resource, t.protocol, t.util.query(this.options.query, "t=" + +new Date)].join("/");
            if (this.isXDomain() && !t.util.ua.hasCORS) {
                var a = document.getElementsByTagName("script")[0],
                    c = document.createElement("script");
                c.src = s + "&jsonp=" + t.j.length, a.parentNode.insertBefore(c, a), t.j.push(function(e) {
                    n(e), c.parentNode.removeChild(c)
                })
            } else {
                var u = t.util.request();
                u.open("GET", s, !0), this.isXDomain() && (u.withCredentials = !0), u.onreadystatechange = function() {
                    4 == u.readyState && (u.onreadystatechange = i, 200 == u.status ? n(u.responseText) : 403 == u.status ? o.onError(u.responseText) : (o.connecting = !1, !o.reconnecting && o.onError(u.responseText)))
                }, u.send(null)
            }
        }, o.prototype.getTransport = function(e) {
            for (var n, o = e || this.transports, i = 0; n = o[i]; i++)
                if (t.Transport[n] && t.Transport[n].check(this) && (!this.isXDomain() || t.Transport[n].xdomainCheck(this))) return new t.Transport[n](this, this.sessionid);
            return null
        }, o.prototype.connect = function(e) {
            if (this.connecting) return this;
            var n = this;
            return n.connecting = !0, this.handshake(function(o, i, r, s) {
                function a(e) {
                    return n.transport && n.transport.clearTimeouts(), n.transport = n.getTransport(e), n.transport ? (n.transport.ready(n, function() {
                        n.connecting = !0, n.publish("connecting", n.transport.name), n.transport.open(), n.options["connect timeout"] && (n.connectTimeoutTimer = setTimeout(function() {
                            if (!n.connected && (n.connecting = !1, n.options["try multiple transports"])) {
                                for (var e = n.transports; e.length > 0 && e.splice(0, 1)[0] != n.transport.name;);
                                e.length ? a(e) : n.publish("connect_failed")
                            }
                        }, n.options["connect timeout"]))
                    }), void 0) : n.publish("connect_failed")
                }
                n.sessionid = o, n.closeTimeout = 1e3 * r, n.heartbeatTimeout = 1e3 * i, n.transports || (n.transports = n.origTransports = s ? t.util.intersect(s.split(","), n.options.transports) : n.options.transports), n.setHeartbeatTimeout(), a(n.transports), n.once("connect", function() {
                    clearTimeout(n.connectTimeoutTimer), e && "function" == typeof e && e()
                })
            }), this
        }, o.prototype.setHeartbeatTimeout = function() {
            if (clearTimeout(this.heartbeatTimeoutTimer), !this.transport || this.transport.heartbeats()) {
                var e = this;
                this.heartbeatTimeoutTimer = setTimeout(function() {
                    e.transport.onClose()
                }, this.heartbeatTimeout)
            }
        }, o.prototype.packet = function(e) {
            return this.connected && !this.doBuffer ? this.transport.packet(e) : this.buffer.push(e), this
        }, o.prototype.setBuffer = function(e) {
            this.doBuffer = e, !e && this.connected && this.buffer.length && (this.options.manualFlush || this.flushBuffer())
        }, o.prototype.flushBuffer = function() {
            this.transport.payload(this.buffer), this.buffer = []
        }, o.prototype.disconnect = function() {
            return (this.connected || this.connecting) && (this.open && this.of("").packet({
                type: "disconnect"
            }), this.onDisconnect("booted")), this
        }, o.prototype.disconnectSync = function() {
            var e = t.util.request(),
                n = ["http" + (this.options.secure ? "s" : "") + ":/", this.options.host + ":" + this.options.port, this.options.resource, t.protocol, "", this.sessionid].join("/") + "/?disconnect=1";
            e.open("GET", n, !1), e.send(null), this.onDisconnect("booted")
        }, o.prototype.isXDomain = function() {
            var e = n.location.port || ("https:" == n.location.protocol ? 443 : 80);
            return this.options.host !== n.location.hostname || this.options.port != e
        }, o.prototype.onConnect = function() {
            this.connected || (this.connected = !0, this.connecting = !1, this.doBuffer || this.setBuffer(!1), this.emit("connect"))
        }, o.prototype.onOpen = function() {
            this.open = !0
        }, o.prototype.onClose = function() {
            this.open = !1, clearTimeout(this.heartbeatTimeoutTimer)
        }, o.prototype.onPacket = function(e) {
            this.of(e.endpoint).onPacket(e)
        }, o.prototype.onError = function(e) {
            e && e.advice && "reconnect" === e.advice && (this.connected || this.connecting) && (this.disconnect(), this.options.reconnect && this.reconnect()), this.publish("error", e && e.reason ? e.reason : e)
        }, o.prototype.onDisconnect = function(e) {
            var t = this.connected,
                n = this.connecting;
            this.connected = !1, this.connecting = !1, this.open = !1, (t || n) && (this.transport.close(), this.transport.clearTimeouts(), t && (this.publish("disconnect", e), "booted" != e && this.options.reconnect && !this.reconnecting && this.reconnect()))
        }, o.prototype.reconnect = function() {
            function e() {
                if (n.connected) {
                    for (var e in n.namespaces) n.namespaces.hasOwnProperty(e) && "" !== e && n.namespaces[e].packet({
                        type: "connect"
                    });
                    n.publish("reconnect", n.transport.name, n.reconnectionAttempts)
                }
                clearTimeout(n.reconnectionTimer), n.removeListener("connect_failed", t), n.removeListener("connect", t), n.reconnecting = !1, delete n.reconnectionAttempts, delete n.reconnectionDelay, delete n.reconnectionTimer, delete n.redoTransports, n.options["try multiple transports"] = i
            }

            function t() {
                return n.reconnecting ? n.connected ? e() : n.connecting && n.reconnecting ? n.reconnectionTimer = setTimeout(t, 1e3) : (n.reconnectionAttempts++ >= o ? n.redoTransports ? (n.publish("reconnect_failed"), e()) : (n.on("connect_failed", t), n.options["try multiple transports"] = !0, n.transports = n.origTransports, n.transport = n.getTransport(), n.redoTransports = !0, n.connect()) : (n.reconnectionDelay < r && (n.reconnectionDelay *= 2), n.connect(), n.publish("reconnecting", n.reconnectionDelay, n.reconnectionAttempts), n.reconnectionTimer = setTimeout(t, n.reconnectionDelay)), void 0) : void 0
            }
            this.reconnecting = !0, this.reconnectionAttempts = 0, this.reconnectionDelay = this.options["reconnection delay"];
            var n = this,
                o = this.options["max reconnection attempts"],
                i = this.options["try multiple transports"],
                r = this.options["reconnection limit"];
            this.options["try multiple transports"] = !1, this.reconnectionTimer = setTimeout(t, this.reconnectionDelay), this.on("connect", t)
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
    function(e, t) {
        function n(e, t) {
            this.socket = e, this.name = t || "", this.flags = {}, this.json = new o(this, "json"), this.ackPackets = 0, this.acks = {}
        }

        function o(e, t) {
            this.namespace = e, this.name = t
        }
        e.SocketNamespace = n, t.util.mixin(n, t.EventEmitter), n.prototype.$emit = t.EventEmitter.prototype.emit, n.prototype.of = function() {
            return this.socket.of.apply(this.socket, arguments)
        }, n.prototype.packet = function(e) {
            return e.endpoint = this.name, this.socket.packet(e), this.flags = {}, this
        }, n.prototype.send = function(e, t) {
            var n = {
                type: this.flags.json ? "json" : "message",
                data: e
            };
            return "function" == typeof t && (n.id = ++this.ackPackets, n.ack = !0, this.acks[n.id] = t), this.packet(n)
        }, n.prototype.emit = function(e) {
            var t = Array.prototype.slice.call(arguments, 1),
                n = t[t.length - 1],
                o = {
                    type: "event",
                    name: e
                };
            return "function" == typeof n && (o.id = ++this.ackPackets, o.ack = "data", this.acks[o.id] = n, t = t.slice(0, t.length - 1)), o.args = t, this.packet(o)
        }, n.prototype.disconnect = function() {
            return "" === this.name ? this.socket.disconnect() : (this.packet({
                type: "disconnect"
            }), this.$emit("disconnect")), this
        }, n.prototype.onPacket = function(e) {
            function n() {
                o.packet({
                    type: "ack",
                    args: t.util.toArray(arguments),
                    ackId: e.id
                })
            }
            var o = this;
            switch (e.type) {
                case "connect":
                    this.$emit("connect");
                    break;
                case "disconnect":
                    "" === this.name ? this.socket.onDisconnect(e.reason || "booted") : this.$emit("disconnect", e.reason);
                    break;
                case "message":
                case "json":
                    var i = ["message", e.data];
                    "data" == e.ack ? i.push(n) : e.ack && this.packet({
                        type: "ack",
                        ackId: e.id
                    }), this.$emit.apply(this, i);
                    break;
                case "event":
                    var i = [e.name].concat(e.args);
                    "data" == e.ack && i.push(n), this.$emit.apply(this, i);
                    break;
                case "ack":
                    this.acks[e.ackId] && (this.acks[e.ackId].apply(this, e.args), delete this.acks[e.ackId]);
                    break;
                case "error":
                    e.advice ? this.socket.onError(e) : "unauthorized" == e.reason ? this.$emit("connect_failed", e.reason) : this.$emit("error", e.reason)
            }
        }, o.prototype.send = function() {
            this.namespace.flags[this.name] = !0, this.namespace.send.apply(this.namespace, arguments)
        }, o.prototype.emit = function() {
            this.namespace.flags[this.name] = !0, this.namespace.emit.apply(this.namespace, arguments)
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),
    function(e, t, n) {
        function o() {
            t.Transport.apply(this, arguments)
        }
        e.websocket = o, t.util.inherit(o, t.Transport), o.prototype.name = "websocket", o.prototype.open = function() {
            var e, o = t.util.query(this.socket.options.query),
                i = this;
            return e || (e = n.MozWebSocket || n.WebSocket), this.websocket = new e(this.prepareUrl() + o), this.websocket.onopen = function() {
                i.onOpen(), i.socket.setBuffer(!1)
            }, this.websocket.onmessage = function(e) {
                i.onData(e.data)
            }, this.websocket.onclose = function() {
                i.onClose(), i.socket.setBuffer(!0)
            }, this.websocket.onerror = function(e) {
                i.onError(e)
            }, this
        }, o.prototype.send = t.util.ua.iDevice ? function(e) {
            var t = this;
            return setTimeout(function() {
                t.websocket.send(e)
            }, 0), this
        } : function(e) {
            return this.websocket.send(e), this
        }, o.prototype.payload = function(e) {
            for (var t = 0, n = e.length; n > t; t++) this.packet(e[t]);
            return this
        }, o.prototype.close = function() {
            return this.websocket.close(), this
        }, o.prototype.onError = function(e) {
            this.socket.onError(e)
        }, o.prototype.scheme = function() {
            return this.socket.options.secure ? "wss" : "ws"
        }, o.check = function() {
            return "WebSocket" in n && !("__addTask" in WebSocket) || "MozWebSocket" in n
        }, o.xdomainCheck = function() {
            return !0
        }, t.transports.push("websocket")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
    function(e, t, n) {
        function o(e) {
            e && (t.Transport.apply(this, arguments), this.sendBuffer = [])
        }

        function i() {}
        e.XHR = o, t.util.inherit(o, t.Transport), o.prototype.open = function() {
            return this.socket.setBuffer(!1), this.onOpen(), this.get(), this.setCloseTimeout(), this
        }, o.prototype.payload = function(e) {
            for (var n = [], o = 0, i = e.length; i > o; o++) n.push(t.parser.encodePacket(e[o]));
            this.send(t.parser.encodePayload(n))
        }, o.prototype.send = function(e) {
            return this.post(e), this
        }, o.prototype.post = function(e) {
            function t() {
                4 == this.readyState && (this.onreadystatechange = i, r.posting = !1, 200 == this.status ? r.socket.setBuffer(!1) : r.onClose())
            }

            function o() {
                this.onload = i, r.socket.setBuffer(!1)
            }
            var r = this;
            this.socket.setBuffer(!0), this.sendXHR = this.request("POST"), n.XDomainRequest && this.sendXHR instanceof XDomainRequest ? this.sendXHR.onload = this.sendXHR.onerror = o : this.sendXHR.onreadystatechange = t, this.sendXHR.send(e)
        }, o.prototype.close = function() {
            return this.onClose(), this
        }, o.prototype.request = function(e) {
            var n = t.util.request(this.socket.isXDomain()),
                o = t.util.query(this.socket.options.query, "t=" + +new Date);
            if (n.open(e || "GET", this.prepareUrl() + o, !0), "POST" == e) try {
                n.setRequestHeader ? n.setRequestHeader("Content-type", "text/plain;charset=UTF-8") : n.contentType = "text/plain"
            } catch (i) {}
            return n
        }, o.prototype.scheme = function() {
            return this.socket.options.secure ? "https" : "http"
        }, o.check = function(e, o) {
            try {
                var i = t.util.request(o),
                    r = n.XDomainRequest && i instanceof XDomainRequest,
                    s = e && e.options && e.options.secure ? "https:" : "http:",
                    a = n.location && s != n.location.protocol;
                if (i && (!r || !a)) return !0
            } catch (c) {}
            return !1
        }, o.xdomainCheck = function(e) {
            return o.check(e, !0)
        }
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
    function(e, t) {
        function n() {
            t.Transport.XHR.apply(this, arguments)
        }
        e.htmlfile = n, t.util.inherit(n, t.Transport.XHR), n.prototype.name = "htmlfile", n.prototype.get = function() {
            this.doc = new(window[["Active"].concat("Object").join("X")])("htmlfile"), this.doc.open(), this.doc.write("<html></html>"), this.doc.close(), this.doc.parentWindow.s = this;
            var e = this.doc.createElement("div");
            e.className = "socketio", this.doc.body.appendChild(e), this.iframe = this.doc.createElement("iframe"), e.appendChild(this.iframe);
            var n = this,
                o = t.util.query(this.socket.options.query, "t=" + +new Date);
            this.iframe.src = this.prepareUrl() + o, t.util.on(window, "unload", function() {
                n.destroy()
            })
        }, n.prototype._ = function(e, t) {
            this.onData(e);
            try {
                var n = t.getElementsByTagName("script")[0];
                n.parentNode.removeChild(n)
            } catch (o) {}
        }, n.prototype.destroy = function() {
            if (this.iframe) {
                try {
                    this.iframe.src = "about:blank"
                } catch (e) {}
                this.doc = null, this.iframe.parentNode.removeChild(this.iframe), this.iframe = null, CollectGarbage()
            }
        }, n.prototype.close = function() {
            return this.destroy(), t.Transport.XHR.prototype.close.call(this)
        }, n.check = function(e) {
            if ("undefined" != typeof window && ["Active"].concat("Object").join("X") in window) try {
                var n = new(window[["Active"].concat("Object").join("X")])("htmlfile");
                return n && t.Transport.XHR.check(e)
            } catch (o) {}
            return !1
        }, n.xdomainCheck = function() {
            return !1
        }, t.transports.push("htmlfile")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports),
    function(e, t, n) {
        function o() {
            t.Transport.XHR.apply(this, arguments)
        }

        function i() {}
        e["xhr-polling"] = o, t.util.inherit(o, t.Transport.XHR), t.util.merge(o, t.Transport.XHR), o.prototype.name = "xhr-polling", o.prototype.heartbeats = function() {
            return !1
        }, o.prototype.open = function() {
            var e = this;
            return t.Transport.XHR.prototype.open.call(e), !1
        }, o.prototype.get = function() {
            function e() {
                4 == this.readyState && (this.onreadystatechange = i, 200 == this.status ? (r.onData(this.responseText), r.get()) : r.onClose())
            }

            function t() {
                this.onload = i, this.onerror = i, r.retryCounter = 1, r.onData(this.responseText), r.get()
            }

            function o() {
                r.retryCounter++, !r.retryCounter || r.retryCounter > 3 ? r.onClose() : r.get()
            }
            if (this.isOpen) {
                var r = this;
                this.xhr = this.request(), n.XDomainRequest && this.xhr instanceof XDomainRequest ? (this.xhr.onload = t, this.xhr.onerror = o) : this.xhr.onreadystatechange = e, this.xhr.send(null)
            }
        }, o.prototype.onClose = function() {
            if (t.Transport.XHR.prototype.onClose.call(this), this.xhr) {
                this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = i;
                try {
                    this.xhr.abort()
                } catch (e) {}
                this.xhr = null
            }
        }, o.prototype.ready = function(e, n) {
            var o = this;
            t.util.defer(function() {
                n.call(o)
            })
        }, t.transports.push("xhr-polling")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),
    function(e, t, n) {
        function o() {
            t.Transport["xhr-polling"].apply(this, arguments), this.index = t.j.length;
            var e = this;
            t.j.push(function(t) {
                e._(t)
            })
        }
        var i = n.document && "MozAppearance" in n.document.documentElement.style;
        e["jsonp-polling"] = o, t.util.inherit(o, t.Transport["xhr-polling"]), o.prototype.name = "jsonp-polling", o.prototype.post = function(e) {
            function n() {
                o(), i.socket.setBuffer(!1)
            }

            function o() {
                i.iframe && i.form.removeChild(i.iframe);
                try {
                    s = document.createElement('<iframe name="' + i.iframeId + '">')
                } catch (e) {
                    s = document.createElement("iframe"), s.name = i.iframeId
                }
                s.id = i.iframeId, i.form.appendChild(s), i.iframe = s
            }
            var i = this,
                r = t.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
            if (!this.form) {
                var s, a = document.createElement("form"),
                    c = document.createElement("textarea"),
                    u = this.iframeId = "socketio_iframe_" + this.index;
                a.className = "socketio", a.style.position = "absolute", a.style.top = "0px", a.style.left = "0px", a.style.display = "none", a.target = u, a.method = "POST", a.setAttribute("accept-charset", "utf-8"), c.name = "d", a.appendChild(c), document.body.appendChild(a), this.form = a, this.area = c
            }
            this.form.action = this.prepareUrl() + r, o(), this.area.value = t.JSON.stringify(e);
            try {
                this.form.submit()
            } catch (p) {}
            this.iframe.attachEvent ? s.onreadystatechange = function() {
                "complete" == i.iframe.readyState && n()
            } : this.iframe.onload = n, this.socket.setBuffer(!0)
        }, o.prototype.get = function() {
            var e = this,
                n = document.createElement("script"),
                o = t.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
            this.script && (this.script.parentNode.removeChild(this.script), this.script = null), n.async = !0, n.src = this.prepareUrl() + o, n.onerror = function() {
                e.onClose()
            };
            var r = document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(n, r), this.script = n, i && setTimeout(function() {
                var e = document.createElement("iframe");
                document.body.appendChild(e), document.body.removeChild(e)
            }, 100)
        }, o.prototype._ = function(e) {
            return this.onData(e), this.isOpen && this.get(), this
        }, o.prototype.ready = function(e, n) {
            var o = this;
            return i ? (t.util.load(function() {
                n.call(o)
            }), void 0) : n.call(this)
        }, o.check = function() {
            return "document" in n
        }, o.xdomainCheck = function() {
            return !0
        }, t.transports.push("jsonp-polling")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), "function" == typeof define && define.amd && define([], function() {
        return io
    })
}();
