// window.performance
if (!window.performance) {
    window.performance = window.performance || {};
    performance.now = (function() {
      return performance.now       ||
             performance.mozNow    ||
             performance.msNow     ||
             performance.oNow      ||
             performance.webkitNow ||
             function() { return Date.now(); };
    })();
}

// requestAnimationFrame / clearAnimationFrame
(function() {

    var vendors = ['ms', 'moz', 'webkit', 'o'],
        lastTime = 0,
        x = 0;

    if (!window.requestAnimationFrame) {

        for(x = 0; x < vendors.length; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelRequestAnimationFrame = window[vendors[x]+
              'CancelRequestAnimationFrame'];
        }

        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

}());

// Date.now
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}