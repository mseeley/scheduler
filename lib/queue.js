/* global global:true */

global = typeof global === 'object' && global ? global : this;

(function (exports) {

    var STATE_PAUSED = 'paused',
        STATE_IDLE = 'idle',
        STATE_ACTIVE = 'active',

        ACTION = 0,
        SCOPE = 1,
        ARGS = 2,
        ID = 3,

        pool = [],

        Queue = function (scheduler) {
            this._actions = [];
            this._scheduler = scheduler;
        };

    Queue.prototype = {
        _uid: 0,
        _actions: undefined,
        state: STATE_PAUSED,
        add: function (action, scope /*[, rest ] */) {
            var actionId = ++this._uid,
                len = arguments.length,
                node = pool.pop() || [];

            node[ID] = actionId;
            node[ACTION] = action;

            if (len > 1) {
                node[SCOPE] = scope;
            }

            if (len > 2) {
                // This array is never resused. Trashy. :/
                // Consider pulling from pool and using push.apply instead.
                node[ARGS] = node.slice.call(arguments, 2);
            }

            this._actions.push(node);

            if (this.state === STATE_IDLE) {
                this.resume();
            }

            return actionId;
        },
        remove: function (actionId) {
            // Untested!
            var actions = this._actions,
                n = actions.length;

            // I wonder if it's faster to create a new array of all nodes,
            // skipping the one with matching action ID
            while (--n && actions[n][ID] !== actionId);
            if (n >= 0) {
                actions.splice(n, 1);
            }
        },
        pause: function () {
            // TODO: abort the scheduler
            this.state = STATE_PAUSED;
        },
        resume: function () {
            var actions = this._actions,
                self = this;

            if (this.state === STATE_PAUSED) {
                this.state = STATE_IDLE;
            }

            if (this.state === STATE_IDLE && actions.length) {
                this.state = STATE_ACTIVE;
                this._scheduler.execute(
                    actions[0],
                    function next () {
                        var lastAction = actions.shift(),
                            nextAction = actions[0];

                        lastAction.length = 0;
                        pool.push(lastAction);

                        if (!nextAction) {
                            // Careful, this is a dangerous place to change
                            // state. Very side-effecty.
                            self.state = STATE_IDLE;
                        }

                        return nextAction;
                    }
                );
            }
        }
    };

    exports.Queue = Queue;

}(global));