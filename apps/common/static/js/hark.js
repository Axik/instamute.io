!function(a){if("function"==typeof bootstrap)bootstrap("hark",a);else if("object"==typeof exports)module.exports=a();else if("function"==typeof define&&define.amd)define(a);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeHark=a}else"undefined"!=typeof window?window.hark=a():global.hark=a()}(function(){return function(a,b,c){function d(c,f){if(!b[c]){if(!a[c]){var g="function"==typeof require&&require;if(!f&&g)return g(c,!0);if(e)return e(c,!0);throw new Error("Cannot find module '"+c+"'")}var h=b[c]={exports:{}};a[c][0].call(h.exports,function(b){var e=a[c][1][b];return d(e?e:b)},h,h.exports)}return b[c].exports}for(var e="function"==typeof require&&require,f=0;f<c.length;f++)d(c[f]);return d}({1:[function(a,b){function e(a,b){var c=-1/0;a.getFloatFrequencyData(b);for(var d=4,e=b.length;e>d;d++)b[d]>c&&b[d]<0&&(c=b[d]);return c}var d=a("wildemitter"),f=window.webkitAudioContext||window.AudioContext,g=null;b.exports=function(a,b){var c=new d;if(!f)return c;var b=b||{},h=b.smoothing||.1,i=b.interval||50,j=b.threshold,k=b.play,l=b.history||10,m=!0;g||(g=new f);var n,o,p;p=g.createAnalyser(),p.fftSize=512,p.smoothingTimeConstant=h,o=new Float32Array(p.fftSize),a.jquery&&(a=a[0]),a instanceof HTMLAudioElement||a instanceof HTMLVideoElement?(n=g.createMediaElementSource(a),"undefined"==typeof k&&(k=!0),j=j||-50):(n=g.createMediaStreamSource(a),j=j||-50),n.connect(p),k&&p.connect(g.destination),c.speaking=!1,c.setThreshold=function(a){j=a},c.setInterval=function(a){i=a},c.stop=function(){m=!1,c.emit("volume_change",-100,j),c.speaking&&(c.speaking=!1,c.emit("stopped_speaking"))},c.speakingHistory=[];for(var q=0;l>q;q++)c.speakingHistory.push(0);var r=function(){setTimeout(function(){if(m){var a=e(p,o);c.emit("volume_change",a,j);var b=0;if(a>j&&!c.speaking){for(var d=c.speakingHistory.length-3;d<c.speakingHistory.length;d++)b+=c.speakingHistory[d];b>=2&&(c.speaking=!0,c.emit("speaking"))}else if(j>a&&c.speaking){for(var d=0;d<c.speakingHistory.length;d++)b+=c.speakingHistory[d];0==b&&(c.speaking=!1,c.emit("stopped_speaking"))}c.speakingHistory.shift(),c.speakingHistory.push(0+(a>j)),r()}},i)};return r(),c}},{wildemitter:2}],2:[function(a,b){function d(){this.callbacks={}}b.exports=d,d.prototype.on=function(a){var d=3===arguments.length,e=d?arguments[1]:void 0,f=d?arguments[2]:arguments[1];return f._groupName=e,(this.callbacks[a]=this.callbacks[a]||[]).push(f),this},d.prototype.once=function(a){function h(){d.off(a,h),g.apply(this,arguments)}var d=this,e=3===arguments.length,f=e?arguments[1]:void 0,g=e?arguments[2]:arguments[1];return this.on(a,f,h),this},d.prototype.releaseGroup=function(a){var b,c,d,e;for(b in this.callbacks)for(e=this.callbacks[b],c=0,d=e.length;d>c;c++)e[c]._groupName===a&&(e.splice(c,1),c--,d--);return this},d.prototype.off=function(a,b){var d,c=this.callbacks[a];return c?1===arguments.length?(delete this.callbacks[a],this):(d=c.indexOf(b),c.splice(d,1),this):this},d.prototype.emit=function(a){var e,f,h,b=[].slice.call(arguments,1),c=this.callbacks[a],d=this.getWildcardCallbacks(a);if(c)for(h=c.slice(),e=0,f=h.length;f>e&&h[e];++e)h[e].apply(this,b);if(d)for(f=d.length,h=d.slice(),e=0,f=h.length;f>e&&h[e];++e)h[e].apply(this,[a].concat(b));return this},d.prototype.getWildcardCallbacks=function(a){var b,c,d=[];for(b in this.callbacks)c=b.split("*"),("*"===b||2===c.length&&a.slice(0,c[0].length)===c[0])&&(d=d.concat(this.callbacks[b]));return d}},{}]},{},[1])(1)});