/* global global:true, requestAnimationFrame, performance */

global = typeof global === 'object' && global ? global : this;

(function (exports) {

    var performance = exports.performance,

        ACTION = 0,
        SCOPE = 1,
        ARGS = 2;

    function Scheduler () {
        this._FRAME_TIME = 10;
        this._frameContext = {
            expiry: undefined,
            complete: {},
            resume: {}
        };
    }

    Scheduler.prototype = {

        abort: function () {
            // TODO: Missing functionality.
        },

        // Assumes execute is only called once until callback is invoked.
        // @param {Array}       action
        // @param {Function}    function
        // @param {Object}      [scope]
        // @param {Array}       [args]
        // @param {Number}      id
        execute: function (action, next) {
            var FRAME_TIME = this._FRAME_TIME,
                frameContext = this._frameContext;

            requestAnimationFrame(function invoke (ts) {
                var halt = false,
                    allowResume,
                    scope,
                    args,
                    result,
                    fn;

                if (stats) {
                    stats.begin();
                }

                // Update the frameContext with a fresh expiry time.
                frameContext.expiry = ts + FRAME_TIME;

                // Continue invoking queued actions until an action explicitly
                // requests a break/resume, no actions remain, or the expiry
                // time is met or exceeded.
                while (!halt) {
                    fn = action[ACTION];
                    scope = action[SCOPE];
                    args = action[ARGS];
                    allowResume = fn.name !== '';

                    if (allowResume) {
                        // Decorate named functions with a frameContext. It's
                        // impossible to get the frame context without a named
                        // function.
                        fn.frameContext = frameContext;
                    }

                    // Sacrifice additional lookups to ssve time on call vs apply.
                    // Silly?
                    if (scope && args) {
                        result = fn.apply(scope, args);
                    } else if (scope) {
                        result = fn.call(scope);
                    } else if (args) {
                        result = fn.apply(null, args);
                    } else {
                        result = fn();
                    }

                    if (allowResume) {
                        delete fn.frameContext;
                        // Frame was managing its own time and requested a resume
                        // upon next frame.
                        halt = result === frameContext.resume;
                    }

                    if (!halt) {
                        // Frame was naive or a resumable frame finished before
                        // the expriry. So, manage expiry pipelining directly.
                        action = next();
                        halt = !action || performance.now() >= frameContext.expiry;
                    }
                }

                if (action) {
                    requestAnimationFrame(invoke);
                }

                if (stats) {
                    stats.end();
                }
            });
        }

    };

    exports.AnimationFrameScheduler = Scheduler;

}(global));