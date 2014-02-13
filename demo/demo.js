/*global global:true, queue, images, performance */

/*

    `test=1`
        `max` controls the number of iterations
            default 30000000
    `test=2`
        `useScheduler` controls whether image loading is controlled through scheduler
            default true
        `useCompositing` controls whether images are turned into compositing layers
            default true
        'useWebP' controls whether WebP images are loaded vs JPG
            default false
        `max` number of images to load up to a max of 6639
            default 6639

    `grumpy` displays a spinning grumpy cat image
        default false

    'fps' displays the FPS gauge
        default true

 */

// -----------------------------------------------------------------------------

var search = location.search,
    test = /[&?]test=(\d)[&?]?/.exec(search) ? parseInt(RegExp.$1, 10) : undefined,
    max = /[&?]max=(\d+)[&?]?/.exec(search) ? parseInt(RegExp.$1, 10) : undefined;

// -----------------------------------------------------------------------------

if (/[&?]grumpy=true[&?]?/.test(search)) {
    document.querySelector('.grumpy-cat').style.display = 'block';
}

// -----------------------------------------------------------------------------

window.onload = function () {
    queue.resume();
};

// -----------------------------------------------------------------------------

if (test === 1) {
    var total = 0,
        count = 0,
        logEvery = 10,
        spy = function spy () {
            var frameContext = spy.frameContext,
                expiry = frameContext.expiry,
                complete = 0;

            if (count === 0) {
                console.log('Starting', this.iterations, 'loops log every', logEvery, 'th call');
            }

            while (this.iterations && this.iterations--) {
                complete++;
                if (performance.now() >= expiry) {
                    break;
                }
            }

            count++;
            total += complete;
            if (count % logEvery === 0 || this.iterations === 0) {
                console.log('Counted', complete, 'Total counted', total, 'Total remaining', this.iterations);
            }

            return this.iterations ? frameContext.resume : frameContext.complete;
        };

    queue.add(spy, {
        iterations: max > 0 ? max : 30000000
    });
}

// -----------------------------------------------------------------------------

if (test === 2) {

    (function (loader, images, fixture) {

        function doneCallback (img, src) {
            img.src = src;
            src = fixture.shift();
            if (src) {
                start(img, src);
            }
        }

        function start (img, src) {
            if (src) {
                loader.load(src, doneCallback, null, img, src);
            }
        }

        images.forEach(function (img,i) {
            var width = 166,
                height = 236;

            queue.add(function setupImage () {
                var perRow = 5,
                    row = Math.floor(i / perRow),
                    col = i % perRow;

                if (/[&?]useCompositing=false[&$]?/.test(location.search)) {
                    img.style.top = row * height + 'px'; img.style.left = col * width + 'px';
                } else {
                    img.style.transform = 'translate3d(' + (col * width) + 'px, ' + (row * height) + 'px, 0)';
                    img.style.webkitTransform = 'translate3d(' + (col * width) + 'px, ' + (row * height) + 'px, 0)';
                    img.style.msTransform = 'translate3d(' + (col * width) + 'px, ' + (row * height) + 'px, 0)';

                    // Whatever Firefox.
                    // img.style.MozTransform = 'translate3d(' + (col * width) + 'px, ' + (row * height) + 'px, 0)';
                }

                start(img, fixture.shift());
            });
        });

    }(
        new global.ImageLoader(),
        [].slice.call(document.querySelectorAll('img.art')),
        /[&?]useWebP=true[&$]?/.test(location.search) ?
            imagesWebP.slice(0, max > 0 ? max : undefined) :
            imagesJPG.slice(0, max > 0 ? max : undefined),
        queue
    ));

}