var MicroEvent=function(){};MicroEvent.prototype={bind:function(a,b){this._events=this._events||{},this._events[a]=this._events[a]||[],this._events[a].push(b)},unbind:function(a,b){if(this._events=this._events||{},a in this._events!=!1){var c=this._events[a].indexOf(b);-1!==c?this._events[a].splice(c,1):this._events[a]=[]}},trigger:function(a){if(this._events=this._events||{},a in this._events!=!1)for(var b=0;b<this._events[a].length;b++)this._events[a][b].apply(this,Array.prototype.slice.call(arguments,1))}},MicroEvent.mixin=function(a){for(var b=["bind","unbind","trigger"],c=0;c<b.length;c++)"function"==typeof a?a.prototype[b[c]]=MicroEvent.prototype[b[c]]:a[b[c]]=MicroEvent.prototype[b[c]]},"undefined"!=typeof module&&"exports"in module&&(module.exports=MicroEvent),"undefined"!=typeof define&&define([],function(){return MicroEvent});