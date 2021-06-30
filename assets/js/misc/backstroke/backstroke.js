(function() {

    function lineLength(points) {
        var totalLength = 0;
        var startX, startY, endX, endY;
        endX = points[0];
        endY = points[1];
        for (var i = 2; i < points.length; i+=2) {
            startX = endX;
            startY = endY;
            endX = points[i];
            endY = points[i+1];
            var dx = Math.abs(endX - startX);
            var dy = Math.abs(endY - startY);
            totalLength += Math.sqrt(dx*dx + dy*dy);
        }
        return totalLength;
    }

    /* https://stackoverflow.com/questions/11068240/what-is-the-most-efficient-way-to-parse-a-css-color-in-javascript */
    let parseColor = function(color) {
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        var ctx = canvas.getContext('2d');
        // In order to detect invalid values,
        // we can't rely on col being in the same format as what fillStyle is computed as,
        // but we can ask it to implicitly compute a normalized value twice and compare.
        ctx.fillStyle = '#000';
        ctx.fillStyle = color;
        var computed = ctx.fillStyle;
        ctx.fillStyle = '#fff';
        ctx.fillStyle = color;
        if (computed !== ctx.fillStyle) {
            return; // invalid color
        }
        ctx.fillRect(0, 0, 1, 1);
        return [ ... ctx.getImageData(0, 0, 1, 1).data ];
    };

    /* Inclusive */
    function clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    }


    function toColor(r, g, b, a = 1){
        var str = 'rgba('
            + clamp(r, 0, 255) + ","
            + clamp(g, 0, 255) + ","
            + clamp(b, 0, 255) + ","
            + clamp(a, 0, 1) + ")";
        return str;
    }

    /* https://stackoverflow.com/a/49434653/6822172 */
    function normal_random() {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) return normal_random(); // resample between 0 and 1
        return num;
    }
    /* Generate a random int between lower (inclusive) and upper (exclusive) */
    /* set normal=true to use a normal distribution (rather than uniform)
        so that numbers will center around the midpoint */
    var rint = function(lower, upper, normal=false){
        var random = normal ? normal_random : Math.random;
        return Math.floor(random()*(upper-lower+1)+lower);
    };

    /**
     * Curve calc function for canvas 2.3.4 - (c) Epistemex 2013-2016 - www.epistemex.com - MIT License
     * Modified to better suit our purposes by Jet Holt in 2021
     * We use this both to curve the line through points,
     * but also to break the line into little segments that we can draw one by one.
     * Modificaitons made:
     *  * Remove unnecessary close option
     *  * Cache inner loop calculations between calls
     */

    /**
     * Calculates an array containing points representing a cardinal spline through given point array.
     * Points must be arranged as: [x1, y1, x2, y2, ..., xn, yn].
     *
     * The points for the cardinal spline are returned as a new array.
     *
     */
    var curveCache = {};
    function getCurvePoints(points, options, numFrames) {

        tension = (typeof options.tension === 'number') ? options.tension : 0.5;

        var pts,															// for cloning point array
            i = 1,
            l = points.length,
            rPos = 0,
            rLen = (l-2) * numFrames + 2,
            res = new Float32Array(rLen),
            cache = null,
            cachePtr = 4;

        // clone points into pts
        pts = points.slice(0);

        pts.unshift(points[1]);											// copy 1st point and insert at beginning
        pts.unshift(points[0]);
        pts.push(points[l - 2], points[l - 1]);							// duplicate end-points too

        // cache inner-loop calculations as they are based on numFrames alone
        if(numFrames in curveCache) {
            cache = curveCache[numFrames];
        } else {
            cache = new Float32Array((numFrames + 2) * 4);
            curveCache[numFrames] = cache;
            cache[0] = 1;                                                       // 1,0,0,0
            for (; i < numFrames; i++) {
                var st = i / numFrames,
                    st2 = st * st,
                    st3 = st2 * st,
                    st23 = st3 * 2,
                    st32 = st2 * 3;

                cache[cachePtr++] = st23 - st32 + 1;                            // c1
                cache[cachePtr++] = st32 - st23;                                // c2
                cache[cachePtr++] = st3 - 2 * st2 + st;                         // c3
                cache[cachePtr++] = st3 - st2;                                  // c4
            }

            cache[++cachePtr] = 1;                                              // 0,1,0,0
        }


        // calc. points
        for (var i = 2, t; i < l; i += 2) {

            var pt1 = pts[i],
                pt2 = pts[i+1],
                pt3 = pts[i+2],
                pt4 = pts[i+3],

                t1x = (pt3 - pts[i-2]) * tension,
                t1y = (pt4 - pts[i-1]) * tension,
                t2x = (pts[i+4] - pt1) * tension,
                t2y = (pts[i+5] - pt2) * tension,
                c = 0, c1, c2, c3, c4;

            for (t = 0; t < numFrames; t++) {

                c1 = cache[c++];
                c2 = cache[c++];
                c3 = cache[c++];
                c4 = cache[c++];

                res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
                res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
            }
        }

        // add last point
        l = points.length - 2;
        res[rPos++] = points[l++];
        res[rPos] = points[l];

        return res;
    }


    /**
     * Brush by Akimitsu Hamamuro (http://codepen.io/akm2/pen/BonIh) - MIT License
     * Modified to better suit our purposes by Jet Holt in 2021
     * Modificaitons made:
     *  * Added the ability to 'jitter' colors (randomly pushing rgb up and down for some hairs)
     *  * //Ink Amount only affects opacity, not hair thickness
     */

    var Brush = (function() {

        /**
         * @constructor
         * @public
         * we t
         */
        function Brush(x, y, color, size, inkAmount, angle, dripping, splashing) {
            this.x = x || 0;
            this.y = y || 0;
            if (color !== undefined) this.color = parseColor(color);
            if (size !== undefined) this.size = size;
            if (inkAmount !== undefined) this.inkAmount = inkAmount;
            if (angle !== undefined) this.angle = angle;
            if (dripping !== undefined) this.dripping = dripping;
            if (splashing !== undefined) this.splashing = splashing;

            this._drops = [];
            this._resetTip();
        }

        Brush.prototype = {
            _SPLASHING_BRUSH_SPEED: 75,

            angle:      0,
            x:          0,
            y:          0,
            color:      [0, 0, 0],
            size:       70,
            inkAmount:  0.5,
            splashing:  true,
            dripping:   true,
            jitterColors: true,
            maxHairs:   500,
            _latestPos: null,
            _strokeId:  null,
            _drops:     null,

            isStroke: function() {
                return Boolean(this._strokeId);
            },

            startStroke: function() {
                if (this.isStroke()) return;

                this._resetTip();

                // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
                this._strokeId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r, v;
                    r = Math.random() * 16 | 0;
                    v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },

            endStroke: function() {
                this._strokeId = this._latestPos = null;
            },

            render: function(ctx, x, y) {
                var isStroke = this.isStroke(),
                    dx, dy,
                    i, len;

                if (!this._latestPos) this._latestPos = {};
                this._latestPos.x = this.x;
                this._latestPos.y = this.y;
                this.x = x;
                this.y = y;

                if(this._latestPos.x === this.x && this._latestPos.y === this.y) {
                    return;
                }

                if (this._drops.length) {
                    var drops  = this._drops,
                        drop,
                        sizeSq = this.size * this.size;

                    for (i = 0, len = drops.length; i < len; i++) {
                        drop = drops[i];

                        dx = this.x - drop.x;
                        dy = this.y - drop.y;

                        if (
                            (isStroke && sizeSq > dx * dx + dy * dy && this._strokeId !== drop.strokeId) ||
                            drop.life <= 0
                        ) {
                            drops.splice(i, 1);
                            len--;
                            i--;
                            continue;
                        }

                        drop.render(ctx);
                    }
                }

                if (isStroke) {
                    var tip = this._tip,
                        strokeId = this._strokeId,
                        dist;

                    dx = this.x - this._latestPos.x;
                    dy = this.y - this._latestPos.y;

                    /*
					 * Google Chrome has a bug where perfectly straight strokes
					 * with lineWidths below 0.0625 do not render.
					 * We compensate for this by making sure our lines are never perfectly straight
                     * https://bugs.chromium.org/p/chromium/issues/detail?id=1162604
                     */
                    dx = dx === 0 ? 0.0001 : dx;
					dy = dy === 0 ? 0.0001 : dy;

                    dist = Math.sqrt(dx * dx + dy * dy);

                    if (this.splashing && dist > this._SPLASHING_BRUSH_SPEED) {
                        var maxNum = (dist - this._SPLASHING_BRUSH_SPEED) * 0.5 | 0,
                            r, a, sr, sx, sy;

                        ctx.save();
                        ctx.fillStyle = toColor(this.color[0], this.color[1], this.color[2]);
                        ctx.beginPath();
                        for (i = 0, len = maxNum * Math.random() | 0; i < len; i++) {
                            r = (dist - 1) * Math.random() + 1;
                            a = Math.PI * 2 * Math.random();
                            sr = 5 * Math.random();
                            sx = this.x + r * Math.sin(a);
                            sy = this.y + r * Math.cos(a);
                            ctx.moveTo(sx + sr, sy);
                            ctx.arc(sx, sy, sr, 0, Math.PI * 2, false);
                        }
                        ctx.fill();
                        ctx.restore();

                    } else if (this.dripping && dist < this.inkAmount * 2 && Math.random() < 0.05) {
                        this._drops.push(new Drop(
                            this.x,
                            this.y,
                            (this.size + this.inkAmount) * 0.5 * ((0.25 - 0.1) * Math.random() + 0.1),
                            toColor(this.color[0], this.color[1], this.color[2]),
                            this._strokeId
                        ));
                    }

                    for (i = 0, len = tip.length; i < len; i++) {
                        if(i===0){
                            tip[i].isthefirst = true;
                        }
                        tip[i].render(ctx, dx, dy, dist);
                    }
                }
            },

            dispose: function() {
                this._tip.length = this._drops.length = 0;
            },

            _resetTip: function() {
                var tip = this._tip = [],
                    rad = this.size * 0.5,
                    x0, y0, a0, x1, y1, a1, cv, sv, color,
                    i, len;

                //a1  = Math.PI * 2 * Math.random();
                a1  = this.angle;
                len = rad * rad * Math.PI / this.inkAmount | 0;
                if (len < 1) len = 1;
                if (len > this.maxHairs) len = this.maxHairs;

                color = toColor(this.color[0], this.color[1], this.color[2], this.inkAmount);
                for (i = 0; i < len; i++) {
                    x0 = rad * Math.random();
                    y0 = x0 * 0.5;
                    a0 = Math.PI * 2 * Math.random();
                    x1 = x0 * Math.sin(a0);
                    y1 = y0 * Math.cos(a0);
                    cv = Math.cos(a1);
                    sv = Math.sin(a1);
                    if (this.jitterColors) {
                        color = toColor(
                            rint(this.color[0] - 20, this.color[0] + 20, true),
                            rint(this.color[1] - 20, this.color[1] + 20, true),
                            rint(this.color[2] - 20, this.color[2] + 20, true),
                            rint(this.inkAmount-0.1, this.inkAmount+0.1, true)
                            )
                    }

                    tip.push(new Hair(
                        this.x + x1 * cv - y1 * sv,
                        this.y + x1 * sv + y1 * cv,
                        this.inkAmount,
                        color
                    ));
                }
            }
        };


        /**
         * Hair
         * @private
         */
        function Hair(x, y, inkAmount, color) {
            this.x = x || 0;
            this.y = y || 0;
            this.inkAmount = inkAmount;
            this.color = color;

            this._latestPos = { x: this.x, y: this.y };
        }

        Hair.prototype = {
            x:          0,
            y:          0,
            inkAmount:  7,
            color:      '#000',
            _latestPos: null,

            render: function(ctx, offsetX, offsetY, offsetLength) {
                this._latestPos.x = this.x;
                this._latestPos.y = this.y;
                this.x += offsetX;
                this.y += offsetY;

            	var per = offsetLength ? this.inkAmount / offsetLength : 0;
                if      (per > 1) per = 1;
                else if (per < 0) per = 0;

                ctx.save();
                ctx.lineCap = ctx.lineJoin = 'round';
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 0.15 + (per * this.inkAmount);
                ctx.beginPath();
                ctx.moveTo(this._latestPos.x, this._latestPos.y);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                ctx.restore();
            }
        };


        /**
         * Drop
         * @private
         */
        function Drop(x, y, size, color, strokeId) {
            this.x = x || 0;
            this.y = y || 0;
            this.size = size;
            this.color = color;
            this.strokeId = strokeId;

            this.life = this.size * 1.5;
            this._latestPos = { x: this.x, y: this.y };
        }

        Drop.prototype = {
            x:          0,
            y:          0,
            size:       7,
            color:      '#000',
            strokeId:   null,
            life:       0,
            _latestPos: null,
            _xOffRatio: 0,

            render: function(ctx) {
                if (Math.random() < 0.03) {
                    this._xOffRatio += 0.06 * Math.random() - 0.03;
                } else if (Math.random() < 0.1) {
                    this._xOffRatio *= 0.003;
                }

                this._latestPos.x = this.x;
                this._latestPos.y = this.y;
                this.x += this.life * this._xOffRatio;
                this.y += (this.life * 0.5) * Math.random();

                this.life -= (0.05 - 0.01) * Math.random() + 0.01;

                ctx.save();
                ctx.lineCap = ctx.lineJoin = 'round';
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.size + this.life * 0.3;
                ctx.beginPath();
                ctx.moveTo(this._latestPos.x, this._latestPos.y);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                ctx.restore();
                ctx.restore();
            }
        };

        return Brush;

    })();


    /* Backstroke Utils */

    var factor = 1;
    var drawIndex = 4;
    var randomDraw;
    /* Returns an array of tuples,
       [leftEdge, rightEdge, topEdge, bottomEdge]
       for each line in the target. */
    var findTextBoundaries = function(target) {
        /* We want to go know where each line begins and ends:
        We'll figure this out by checking the offset of each word
        and comparing it to the the previous word.
        Reducing in size indicates that the word began a new line */
        var elements = Array.from(target.childNodes);

        /* Recreate the text content but wrapping each word in it's own span */
        var spans = [];
        /* Depth first traversal over every element in target */
        while (elements.length > 0) {
            var elem = elements.shift();
            var children = elem.childNodes;
            elements = Array.from(children).concat(elements);
            /* If the elem is a text node, wrap each word in a span */
            if (elem.nodeType === 3) {
                var text = elem.textContent;
                var words = text.split(/ +/);
                var replacement = [];
                for (var i = 0; i < words.length; i++) {
                    /* Recreate the spaces */
                    if (i !== 0) replacement.push(document.createTextNode(" "));

                    var word = words[i];
                    if (word.length === 0) continue;

                    var span = document.createElement("SPAN");
                    span.className = "____findTextBoundaries"
                    span.textContent = words[i];
                    spans.push(span);
                    replacement.push(span);
                }
                elem.replaceWith(...replacement);
            }
        }

        /* We can now measure the position of each span and compare it to it's predecessor
        to determine where lines of text begin and end */
        var previousSpanEnd = null;
        var previousSpanTop = null;
        var textIndexes = [];
        var adjustment = 0;
        for (var i in spans) {
            var spanStart = spans[i].offsetLeft;
            var spanEnd = spanStart + spans[i].offsetWidth;
            var spanTop = spans[i].offsetTop;
            var spanBottom = spanTop + spans[i].offsetHeight;

            if (previousSpanEnd === null) {
                textIndexes.push([spanStart, null, spanTop, spanBottom]);
            } else if (spanTop > previousSpanTop ) {
                textIndexes[textIndexes.length - 1][1] = previousSpanEnd;
                textIndexes.push([spanStart, null, spanTop, spanBottom]);
            }
            previousSpanTop = spanTop
            previousSpanEnd = spanEnd;

            /* Track if there is any negative offsetLeft, we'll fix that later */
            adjustment = Math.min(spanStart,adjustment);
        }
        if(textIndexes.length) {
            textIndexes[textIndexes.length - 1][1] = previousSpanEnd;
        }

        /* Right aligned and center aligned elements where the nth line is
           longer than the first line can have negative offsetWidths.
           We want to normalise to remove this factor so that there are no negatives */
        adjustment = Math.abs(adjustment);
        for (var i in textIndexes) {
            var index = textIndexes[i];
            index[0] += adjustment;
            index[1] += adjustment;
        }

        /* Remove the spans we added earlier, restoring the target to it's inital state */
        for (var i in spans) {
            var span = spans[i];
            span.replaceWith(span.textContent);
        }

        /* Return both the textIndexes,
        and the adjustment we had to make to negative indexes */
        return [textIndexes, adjustment];
    }
    /* Determine which lines we should draw on for a given x
        Useful when drawing vertical lines. */
    var checkDepth = function(textIndexes, x) {
        /* Create an array and add the indexes of each line of text that contains x */
        var textCovers = [];
        for (var j = 0; j < textIndexes.length; j++) {
            if (textIndexes[j][0] <= x && textIndexes[j][1] >= x)
                textCovers.push(textIndexes[j]);
        }

        /* Upper, Lower */
        if (textCovers.length) {
            return [textCovers[0][2], textCovers[textCovers.length-1][3]];
        } else {
            return [Number.MAX_VALUE, Number.MIN_VALUE];
        }
    }

    function contiguousLines(textIndexes) {
        /* We know that we always have one line so we're safe to do [0] */
        var contiguousAreas = [[textIndexes[0]]];
        var currentContiguousArea = contiguousAreas[0];
        var lastL = currentContiguousArea[0][0];
        var lastR = currentContiguousArea[0][1];
        for (var i = 1; i < textIndexes.length; i++) {
            var thisL = textIndexes[i][0];
            var thisR = textIndexes[i][1];

            if (thisR <= lastL || thisL >= lastR) {
                /* When no overlap, create a new contiguous area */
                currentContiguousArea = [textIndexes[i]];
                contiguousAreas.push(currentContiguousArea);
            } else {
                /* Otherwise, add this line to the current area */
                currentContiguousArea.push(textIndexes[i]);
            }
            lastL = thisL;
            thisR = lastR;
        }
        return contiguousAreas;
    }

    function areaDimensions(textIndexes) {
        var leftEdge = textIndexes[0][0];
        var rightEdge = textIndexes[0][1];
        var topEdge = textIndexes[0][2];
        var bottomEdge = textIndexes[0][3];
        for (var i = 1; i < textIndexes.length; i++) {
            leftEdge = Math.min(leftEdge, textIndexes[i][0]);
            rightEdge = Math.max(rightEdge, textIndexes[i][1]);
            topEdge = Math.min(topEdge, textIndexes[i][2]);
            bottomEdge = Math.max(bottomEdge, textIndexes[i][3]);
        }
        return [leftEdge, rightEdge, topEdge, bottomEdge];
    }

    function extend(target, source) {
        if (!target) target = {};
        for (var key in source)
            target[key] = source[key];
        return target;
    }

    function embellishLine(points, options) {
        console.log(points);
        var newPoints = [];
        var startX, startY, endX, endY;
        endX = points[0];
        endY = points[1];

        for (var i = 2; i < points.length; i+=2) {
            startX = endX;
            startY = endY;
            newPoints.push(startX, startY);
            endX = points[i];
            endY = points[i+1];

            var dx = endX - startX;
            var dy = endY - startY;

            var embellishments = rint(0,4);
            var dx2 = dx/(embellishments);
            var dy2 = dy/(embellishments);
            for (var j = 1; j < embellishments; j++) {
                var x = startX + (dx2 * j);
                var y = startY + (dy2 * j);
                var curviness = 1.0 - clamp(options.straightness, 0.0, 1.0);
                if (dx > dy) {
                    y += curviness * (Math.random() - 0.5) * 1.5 * dy2;
                } else {
                    /*x += curviness * rint(-2,2) * dx2*/;
                }
                newPoints.push(x, y);
            }
        }
        newPoints.push(endX, endY);
        console.log(newPoints);
        return newPoints
    }

    function drawLine(ctx, points, size, duration, options, resolve) {
        var frames = Math.ceil(parseFloat(duration) * 60);
        var embellishedPoints = embellishLine(points, options)
        var curvedPoints = getCurvePoints(embellishedPoints, options, frames);

        var frame = 1,
            elapsed,
            time,
            t,
            point,
            x = curvedPoints[0],
            y = curvedPoints[1];

        var brush = new Brush(x, y,
            options.color, size, options.inkAmount,
            options.angle, options.dripping, options.splashing
        );
        brush.startStroke(x, y);

        (function calc() {
            time = frame / parseFloat(frames);
            t = time;

            options.easing = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;
            if (typeof options.easing === "function") {
                t = options.easing(t);
            }

            if (time > 1) {
                t = 1;
            }

            var length = curvedPoints.length;
            var i = Math.round((length * t) / 2) * 2;
            if (i >= length) i = length - 2;

            newx = curvedPoints[i];
            newy = curvedPoints[i + 1];
            if (newx !== x && newy !== y) {
                x = newx, y = newy;
                brush.render(ctx, x, y);
            }

            if (time >= 1) {
                brush.endStroke();
                resolve();
            } else {
                frame++;
                requestAnimationFrame(calc);
            }
        })();
    }

    function Backstroke(selector, incomingOptions) {

        // Default values

        this.options = {
            patterns: [0, 1, 2, 3, 4, 5],
            duration: 2,
            fps: 60,
            delay: 0,
            color: '#ccc',
            inkAmount: 1,
            redrawOnResize: true,
            noRandom: false,
            dripping: true,
            splashing: true,
            straightness: 0.0,
            tension: 0.5,
            lineScale: 1.0,
            scrollIntoView: false,
            tight: true,
            queue: false,
            done: function(){}
        };

        // Merge provided options and default options
        for (var opt in this.options)
            if (incomingOptions.hasOwnProperty(opt))
                this.options[opt] = incomingOptions[opt];

        /* Determine which element(s) are our targets */
        var elements;
        if (typeof selector === 'string') {
            // Support for selector
            elements = document.querySelectorAll(selector);
        } else if (selector instanceof Element || selector instanceof HTMLDocument) {
            // Support for DOM nodes
            elements = [selector];
        } else if (selector.length) {
            // Support for array based queries (such as jQuery)
            elements = selector;
        }

        for (var e = 0; e < elements.length; e++) {
            var target = elements[e];

            var sty = window.getComputedStyle(target);
            var paddingX = parseFloat(sty.getPropertyValue("padding-left")) +
                                parseFloat(sty.getPropertyValue("padding-right"));
            var paddingY = parseFloat(sty.getPropertyValue("padding-top")) +
                                parseFloat(sty.getPropertyValue("padding-bottom"));
            var width = target.offsetWidth - paddingX;
            var height = target.offsetHeight - paddingY;


            /* Fix target position */
            var position = sty.getPropertyValue('position');
            if (position === 'static') {
                target.style.position = 'relative';
            }

            /* Determine where each line of the target starts and ends,
                as well as determining line height.
            */
            var [lineIndexes, adjustment] = findTextBoundaries(target);
            var numLines = lineIndexes.length;
            if (numLines === 0) return;
            var lineHeight = height / numLines;

            /* Create the canvas (with a little margin so paint can splash) */
            var canvas = document.createElement('canvas');
            var marginX = Math.min(target.offsetWidth,200);
            var marginY = Math.min(target.offsetHeight,200);
            canvas.style.position = 'absolute';
            canvas.style.zIndex = -1;
            canvas.style.left = -marginX - adjustment + 'px';
            canvas.style.top  = -marginY + 'px';
            canvas.width  = target.offsetWidth + 2*marginX;
            canvas.height = target.offsetHeight + 2*marginY;
            target.appendChild(canvas);
            var ctx = canvas.getContext('2d');

            /* Pick the pattern to use */
            var pattern = this.options.patterns[rint(0,this.options.patterns.length)];
            pattern = 0;

            var totalLength = 0;
            var lines = [];
            function addline(startX, startY, endX, endY) {

            }
            var startX, startY, endX, endY, size;

            /* If the lines we are drawing are discontiguous,
                draw them independently */
            var contiguousAreas = contiguousLines(lineIndexes);
            for (var area = 0; area < contiguousAreas.length; area++) {
                var textIndexes = contiguousAreas[area];
                var dimensions = areaDimensions(textIndexes);
                var [leftEdge, rightEdge, topEdge, bottomEdge] = dimensions;
                var areaWidth = rightEdge - leftEdge;
                var areaHeight = bottomEdge - topEdge;
                var areaLines = textIndexes.length;

                if (pattern === 0) {
                    /* This style swipes right then left then right again */
                    size = lineHeight * 2 + rint(0,6);

                    endX = textIndexes[0][0];
                    endY = topEdge + lineHeight*0.2;
                    var offset = Math.min(Math.sqrt(textIndexes[0][1] - textIndexes[0][0]), 60);
                    if (!options.tight) {
                        /* The first line sticks out a bit to the left */
                        endX -= offset;
                    }

                    for (var i = 0; i < areaLines; i++) {
                        /* Left to right */
                        var odd = i%2;
                        var subIfOdd = (1-2*odd);

                        /* Line starts from the end of the last line */
                        startX = endX;
                        startY = endY + lineHeight*0.1;
                        endX = textIndexes[i][1 - odd];
                        endY = textIndexes[i][2 + odd] + subIfOdd * (lineHeight*0.4 + rint(-2,3));
                        if (!options.tight) {
                            /* Padding */
                            endX += subIfOdd * (10 + rint(0,3));
                        }

                        lines.push([ startX, startY, endX, endY ]);
                    }

                    /* The last line is special (Left to right) */
                    startX = endX
                    startY = endY;
                    endX = textIndexes[areaLines - 1][1];
                    endY = textIndexes[areaLines - 1][3] - lineHeight*0.2;
                    if (!options.tight) {
                        /* The last line sticks out a bit to the right */
                        endX += offset + rint(0,3);
                        endY += rint(0,3);
                    }
                    lines.push([ startX, startY, endX, endY ]);
                } else if (pattern === 1) {
                    /* This style draws a horizontal line for each line */
                    size = lineHeight*2.5 + rint(0,6)
                    for (var i = 0; i < areaLines; i++) {
                        startX = textIndexes[i][0] - 15 + rint(0,10);
                        startY = lineHeight * (i + 0.5) - 2 + rint(0,5);
                        endX = textIndexes[i][1] + 15 - rint(0,10);
                        endY = lineHeight * (i + 0.5) - 3 + rint(0,7);
                        lines.push([ startX, startY, endX, endY ]);
                    }
                } else if (pattern === 2) {
                    /* This style zigzags up and down from left to right */
                    size = lineHeight + rint(0,6);
                    var xOffset = lineHeight / 2;
                    var xRandom = Math.floor(xOffset / 10);
                    var yOffset = lineHeight / 8;
                    var yRandom = Math.floor(yOffset / 10);
                    var zigzags = Math.ceil(myWidth / (xOffset*2));
                    xOffset = (myWidth / zigzags)/2;
                    var xPad = -((zigzags * xOffset) - myWidth)/2
                    var duration = 0.04;
                    var [topDepth, bottomDepth] = checkDepth(myTextIndexes, leftEdge);
                    for (var i = /*xPad + */leftEdge; (i < rightEdge/* + xPad*/); i+=2*xOffset) {
                        /* First stroke is delayed */
                        /* Whichever is lower for topDepth and higher for bottomDepth */
                        var depths0 = checkDepth(myTextIndexes, i);
                        var depths1 = checkDepth(myTextIndexes, i + 2*xOffset);
                        var depths2 = checkDepth(myTextIndexes, i + 1*xOffset);
                        var depths3 = checkDepth(myTextIndexes, i + 3*xOffset);

                        /* Stroke to bottom right */
                        /* Start from last time's depth to prevent disjointedness */
                        var startX = i/* + rint(0,xRandom)*/;
                        var startY = topDepth + yOffset + rint(0,yRandom);

                        /* Determine the correct depths now */
                        bottomDepth = Math.max(depths0[1], depths1[1]);
                        topDepth = Math.min(depths2[0], depths3[0]);

                        var endX = i + xOffset/* - rint(0,xRandom)*/;
                        var endY = bottomDepth - yOffset + rint(0,yRandom);
                        lines.push([ startX, startY, endX, endY ]);

                        if (i + xOffset < rightEdge/* + xPad */) {
                            /* Stroke to top right */
                            var startX = i + xOffset/* + rint(0,xRandom)*/;
                            var startY = bottomDepth - yOffset + rint(0,yRandom);
                            var endX = i + 2*xOffset/* - rint(0,xRandom)*/;
                            var endY = topDepth + yOffset + rint(0,yRandom);
                            lines.push([ startX, startY, endX, endY ]);
                        }
                    }
                } else if (pattern === 3) {
                    /* This style draws lines in a < shape */
                    size = lineHeight + rint(0,6);

                    /* Always draw a line that slopes up for the first line */
                    var startX = textIndexes[0][0] - 10 + rint(0,5);
                    var startY = 0.75*lineHeight + rint(0,3);
                    var endX = textIndexes[0][1] - 5 + rint(0,11);
                    var endY = - 2 + rint(0,3);
                    lines.push([ startX, startY, endX, endY ]);

                    /* If exactly two lines, draw a horizontal line between them */
                    if (areaLines === 2) {
                        startX = - 15 + rint(0,10);
                        startY = 0.5*height - 2 + rint(0,5);
                        endX = width + 15 - rint(0,10);
                        endY = 0.5*height - 3 + rint(0,7);
                        lines.push([ startX, startY, endX, endY ]);
                    }
                    /* If more than two lines, draw more lines in the middle */
                    for (var i = 1; i < numLines - 1; i++) {
                        var textIndex = textIndexes[i];
                        if ( i < Math.floor(numLines/2)) {
                            /* Draw a line sloping up */
                            startX = textIndex[0] - 10 + rint(0,5);
                            startY = (i+0.75)*lineHeight + rint(0,3);
                            endX = textIndex[1] - 5 + rint(0,11);
                            endY = (i+0.25)*lineHeight - 2 + rint(0,3);
                            lines.push([startX, startY, endX, endY ]);
                        } else if ( i === Math.floor(numLines/2)) {
                            /* Draw a straight line */
                            startX = textIndex[0] - 15 + rint(0,10);
                            startY = lineHeight * (i + 0.5) - 2 + rint(0,5);
                            endX = textIndex[1] + 15 - rint(0,10);
                            endY = lineHeight * (i + 0.5) - 3 + rint(0,7);
                            lines.push([ startX, startY, endX, endY ]);
                        } else {
                            /* Draw a line sloping down */
                            startX = textIndex[0] - 10 + rint(0,5);
                            startY = (i+0.25)*lineHeight + rint(0,3);
                            endX = textIndex[1] - 5 + rint(0,11);
                            endY = (i+0.75)*lineHeight - 2 + rint(0,3);
                            lines.push([ startX, startY, endX, endY ]);
                        }
                    }
                    /* Always draw a line that slopes down for the last line */
                    startX = textIndexes[textIndexes.length-1][0] - 10 + rint(0,5);
                    startY = height - 0.75*lineHeight + rint(0,3);
                    endX = textIndexes[textIndexes.length-1][1] - 10 + rint(0,3);
                    endY = height + rint(0,3);
                    lines.push([ startX, startY, endX, endY ]);
                } else if (pattern === 4) {
                    /* This style draws straight vertical lines */
                    size = xOffset*2 + rint(0,3);
                    var topDepth = 0;
                    var bottomDepth = 0;
                    var xOffset = lineHeight / 2;
                    var draws = Math.ceil(width / xOffset);
                    var xPad = ((draws * xOffset) - width)/2
                    for (var i = -xPad; i <= (width) + xPad; i+= xOffset ) {

                        var depths0 = checkDepth(textIndexes, i - 0.7*xOffset);
                        var depths1 = checkDepth(textIndexes, i + 0.7*xOffset);
                        topDepth = Math.min(depths0[0], depths1[0]);
                        bottomDepth = Math.max(depths0[1], depths1[1]);
                        var startX = i - 5 + rint(-6,7);
                        var startY = (lineHeight * topDepth) - 3 - rint(0,lineHeight/5, true);
                        var endX = i - 5 + rint(-5,6);
                        var endY = (lineHeight * (bottomDepth+1)) + 3 + rint(0,lineHeight/5,true);
                        lines.push([startX, startY, endX, endY]);
                    }
                } else if (pattern === 5) {
                    /* Temporary drawing type that will replace type 1 */
                    /* This does a kind of scribbling out effect.
                    We imagine the canvas to be a pen drawing up and to the right
                    (at a 45 angle from the horizontal plane)
                    until it reaches the edge (which will differ based on the text)
                    followed by a drawing down and to the left from wherever the previous
                    line ended
                    (the second line at a 67.5 angle from the horizontal plane)

                    This is sketched below with angles labelled.

                                       +         +        +   ...  ------
                                     //        //       /             o /
                                   / /       / /      /           67.5 /
                                 /  /      /  /     /                 /
                               /   /     /   /    /                  /
                             /    /    /    /   /                   /
                           /     /   /     /  /                    /
                         /      /  /      / /                     /
                       /o45    //        //                      /
                     +------  +         +   ...

                    */
                    var deg45 = 45*(Math.PI/180);
                    var deg67 = 67.5*(Math.PI/180);

                    /* We want to determine which line is the leftmost line of text
                     that we will paint on the initial stroke.
                     We do this by calculating where the line would cross y=0 when following a 45degree
                     line. Whichever line of text's x crossing point is the lowest.
                     is the leftmost line of text. */
                    var smallestX = Number.MAX_VALUE;
                    var leftmostLine = 0;
                    for (var t = 0; t < numLines; t++) {
                        var textIndex = textIndexes[t];
                        var startX = textIndex[0];
                        var startY = textIndex[3];
                        var endY = 0;
                        var endX = startX + Math.tan(deg45) * startY;
                        if (endX <= smallestX) {
                            smallestX = endX;
                            leftmostLine = t;
                        }
                    }

                    var i = textIndexes[leftmostLine][0];
                    var topLine = leftmostLine;
                    var bottomLine = leftmostLine;
                    var backlineStartX = Number.MAX_VALUE;
                    var backlineEndX = i;
                    var backlineEndY = textIndexes[bottomLine][3]-0.75*lineHeight;
                    while (i <= width) {
                        /* From the current position at the bottom of `bottomLine`,
                        calculate where we cross the top of each line above,
                        when travelling at a 45degree angle from the horizontal plane
                        calculate where they cross the top of the start line,
                        when following a 60degree line.
                        Whichever crossing point is the furthest in x that does not exceed  */
                        var lineStartX = backlineEndX;
                        var lineStartY = backlineEndY;
                        var lineEndX = 0;
                        var lineEndY = 0;
                        for (var j = 0; j <= bottomLine; j++) {
                            var textIndex = textIndexes[j];
                            var myLineEndY = textIndex[2];
                            var opposite = Math.tan(deg45) * (lineStartY - myLineEndY);
                            var myLineEndX = lineStartX + opposite;
                            /* If the line goes past the furthest point of this line of text, truncate it
                            and calculate where the Y should end up. */
                            if (myLineEndX > textIndex[1]) {
                                myLineEndX = textIndex[1] + 1;
                                var adjacent = (myLineEndX - lineStartX) / Math.tan(deg45);
                                myLineEndY = lineStartY - adjacent;
                            }
                            /* If the calculated crossing point is further than the start of
                            our line of text, and also further than the line of text above,
                            take the new values. */
                            if (myLineEndX > textIndex[0] &&
                                myLineEndX > lineEndX) {
                                lineEndX = myLineEndX;
                                lineEndY = myLineEndY;
                                topLine = j;
                            }
                        }

                        /* Forward Stroke */
                        lines.push([lineStartX, lineStartY, lineEndX, lineEndY]);

                        /* Now we do the back stroke, which is basically the same calculation as above but a bit different */
                        backlineStartX = lineEndX;
                        backlineStartY = lineEndY;
                        /* We change the endX in the for loop below */
                        backlineEndX = Number.MAX_VALUE;
                        backlineEndY = 0;
                        /* Iterating from bottom line up */
                        for (var j = numLines - 1; j >= topLine; j--) {
                            var textIndex = textIndexes[j];
                            /* When ending at the bottom of the current line,
                            calculate the crossing point at our given angle */
                            var myLineEndY = textIndex[3];
                            var adjacent = (myLineEndY - backlineStartY) / Math.tan(deg67);
                            var myLineEndX = backlineStartX - adjacent;

                            /* If the line goes past the starting point of this line of text,
                            (ie the backstroke goes too far to the left)
                            truncate it and calculate where the Y should end up. */
                            if (myLineEndX < textIndex[0]) {
                                myLineEndX = textIndex[0] - 1;
                                var opposite = (backlineStartX - myLineEndX) * Math.tan(deg67);
                                myLineEndY = backlineStartY + opposite;
                            }
                            /* If the calculated crossing point is less than the end of
                            our line of text, and also less than the line of text below,
                            take the new values. */
                            if (myLineEndX < textIndex[1] &&
                                myLineEndX < backlineEndX) {
                                backlineEndX = myLineEndX;
                                backlineEndY = myLineEndY;
                                bottomLine = j;
                            }
                        }
                        /* If we weren't successful, just pick a value. */
                        if (backlineEndX === Number.MAX_VALUE) {
                            backlineEndX = myLineEndX;
                            backlineEndY = myLineEndY;
                        }

                        /* Backward Stroke */
                        lines.push([backlineStartX, backlineStartY, backlineEndX, backlineEndY]);
                        if (backlineEndX !== i) {
                            i = backlineEndX;
                        } else {
                            /* Failsafe incase something goes wrong */
                            i += 150;
                        }
                    }
                }
            }

            /* We've got the main lines for the pattern now, let's render it */


            /* Queue each line one after another as promises.
               The drawLine function resolves the promise
               and causes the next line to start drawing.
            */
            var promise = Promise.resolve();
            lines.reduce(function(p, l, i) {
              return p.then(function(v) {
                return new Promise(function(resolve) {
                    /* Generate the durations for the lines based on number of lines. */
                    var duration = (options.duration / lines.length);
                    var points = l;

                    /* Add in the margins */
                    points = points.map(function(elem, index){
                        return index % 2 === 0 ?
                            elem + marginX:
                            elem + marginY;
                    });

                    /* Chromium has a bug where perfectly straight lines aren't rendered if
                    linewidth is below 0.0625 (brushstroke lines often are).
                    https://bugs.chromium.org/p/chromium/issues/detail?id=1162604
                    So we make sure our lines aren't perfectly straight. */
                    if (points[0] === points[2]) {
                        points[2] = points[2] + 0.001;
                    }
                    if (points[1] === points[3]) {
                        points[3] = points[3] + 0.001;
                    }

                    if (options.delay && i === 0) {
                        setTimeout(function () {
                            drawLine(ctx, points, size, duration, options, resolve);
                        }, options.delay * 1000);
                        return;
                    } else {
                        drawLine(ctx, points, size, duration, options, resolve);
                    }


                });
              });
            }, promise);
        }


    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = Backstroke;
    else
        window.Backstroke = Backstroke;
})();