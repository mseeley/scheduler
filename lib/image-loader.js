/*global global:true, queue */

global = typeof global === 'object' && global ? global : this;

(function (exports, Image, queue) {

    var TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        pool = [];
        // // Un-named functions with no arguments travel fastest through
        // // the frame scheduler.
        // loadImage = function () {
        //     // Invoked in scope of the args array build in load()
        //     var img = pool.pop() || new Image();
        //     img.onload = img.onerror = imageComplete;

        //     // Data hitchhikes on the image
        //     img.args = this;
        //     img.src = this.src;
        // },
        // releaseImage = function () {
        //     // Invoked in scope of the downloaded Image
        //     this.onload = this.onerror = undefined;
        //     this.src = TRANSPARENT_PIXEL;

        //     // Clean up the hitchhiker
        //     delete this.args;
        //     pool.push(this);
        // },
        // imageComplete = function () {
        //     // Invoked in scope of the downloaded Image
        //     var args = this.args;

        //     queue.add(releaseImage, this);

        //     if (args.length) {
        //         queue.add.apply(queue, args);
        //     }

        //     // ... and args is garbage collected
        // };

    function ImageLoader () {}

    ImageLoader.prototype = {
        // Hack to avoid function allocations. Oddly this results in more
        // memory usage consistently.
        // load: function (src, callback, scope /*, rest */) {
        //     // Hacks to avoid allocation. Hide data on the args object. See
        //     // original version below.
        //     var args;
        //     if (src) {
        //         args = pool.slice.call(arguments, 1);
        //         args.src = src;
        //         queue.add(loadImage, args);
        //     }
        // }

        load: function (src, callback, scope, arg) {
            // Array args are not pooled. :/
            var args = pool.slice.call(arguments, 1),
                complete = function complete () {
                    var self = this;

                    queue.add(function () {
                        self.onload = self.onerror = undefined;
                        self.src = TRANSPARENT_PIXEL;
                        pool.push(self);
                    });

                    if (callback) {
                        queue.add.apply(queue, args);
                    }
                },
                load = function load () {
                    var img = pool.pop() || new Image();
                    img.onload = img.onerror = complete;
                    img.src = src;
                };

            if (src) {
                queue.add(load);
            }
        }
    };

    // Change behavior to illustrate FPS chatter when not scheduling img loading.
    if (/[&?]useScheduler=false[&$]?/.test(location.search)) {
        ImageLoader.prototype.load = function (src, callback, scope, arg) {
            var complete = function complete () {
                    this.onload = this.onerror = undefined;
                    this.src = TRANSPARENT_PIXEL;
                    pool.push(this);

                    if (callback) {
                        callback.call(scope, arg);
                    }
                },
                load = function load () {
                    var img = pool.pop() || new Image();
                    img.onload = img.onerror = complete;
                    img.src = src;
                };

            if (src) {
                load();
            }
        };

        requestAnimationFrame(function stat () {
            stats.begin();
            stats.end();
            requestAnimationFrame(stat);
        });
    }

    exports.ImageLoader = ImageLoader;

}(global, global.Image, queue));
