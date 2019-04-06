/**
 * http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
 * Used for draw arrows and arc with arrwos on canvas
 */

var CanvasUtils = function () {
    var drawHead = function (ctx, x0, y0, x1, y1, x2, y2, style) {
        'use strict';
        if (typeof (x0) === 'string') { x0 = parseFloat(x0); }
        if (typeof (y0) === 'string') { y0 = parseFloat(y0); }
        if (typeof (x1) === 'string') { x1 = parseFloat(x1); }
        if (typeof (y1) === 'string') { y1 = parseFloat(y1); }
        if (typeof (x2) === 'string') { x2 = parseFloat(x2); }
        if (typeof (y2) === 'string') { y2 = parseFloat(y2); }
        var radius = 3;
        var twoPI = 2 * Math.PI;

        // all cases do this.
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        switch (style) {
            case 0:
                // curved filled, add the bottom as an arcTo curve and fill
                var backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                ctx.arcTo(x1, y1, x0, y0, 0.55 * backdist);
                ctx.fill();
                break;
            case 1:
                // straight filled, add the bottom as a line and fill.
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x0, y0);
                ctx.fill();
                break;
            case 2:
                // unfilled head, just stroke.
                ctx.stroke();
                break;
            case 3:
                // filled head, add the bottom as a quadraticCurveTo curve and fill
                var cpx = (x0 + x1 + x2) / 3;
                var cpy = (y0 + y1 + y2) / 3;
                ctx.quadraticCurveTo(cpx, cpy, x0, y0);
                ctx.fill();
                break;
            case 4:
          // filled head, add the bottom as a bezierCurveTo curve and fill
                var cp1x, cp1y, cp2x, cp2y, backdist;
                var shiftamt = 5;
                if (x2 == x0) {
        // Avoid a divide by zero if x2==x0
                    backdist = y2 - y0;
                    cp1x = (x1 + x0) / 2;
                    cp2x = (x1 + x0) / 2;
                    cp1y = y1 + backdist / shiftamt;
                    cp2y = y1 - backdist / shiftamt;
                } else {
                    backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                    var xback = (x0 + x2) / 2;
                    var yback = (y0 + y2) / 2;
                    var xmid = (xback + x1) / 2;
                    var ymid = (yback + y1) / 2;

                    var m = (y2 - y0) / (x2 - x0);
                    var dx = (backdist / (2 * Math.sqrt(m * m + 1))) / shiftamt;
                    var dy = m * dx;
                    cp1x = xmid - dx;
                    cp1y = ymid - dy;
                    cp2x = xmid + dx;
                    cp2y = ymid + dy;
                }

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
                ctx.fill();
                break;
        }
        ctx.restore();
    };

    /**
     * [drawArcedArrow description]
     * @param  {[type]} ctx
     * @param  {[type]} x
     * @param  {[type]} y
     * @param  {[type]} r
     * @param  {[type]} startangle
     * @param  {[type]} endangle
     * @param  {[type]} anticlockwise
     * @param  {[type]} style
     * @param  {[type]} which
     * @param  {[type]} angle
     * @param  {[type]} d
     * @param  {[type]} lineWidth
     * @param  {[type]} arrowMove 线条越粗，箭头的位置就越要靠前，否则会被粗线遮挡
     * @return {[type]}
     */
    var drawArcedArrow = function (ctx, x, y, r, startangle, endangle, anticlockwise, style, which, angle, d, lineWidth, arrowMove) {
        'use strict';
        style = typeof (style) !== 'undefined' ? style : 3;
        which = typeof (which) !== 'undefined' ? which : 1; // end point gets arrow
        angle = typeof (angle) !== 'undefined' ? angle : Math.PI / 8;
        d = typeof (d) !== 'undefined' ? d : 10;
        lineWidth = typeof (lineWidth) !== 'undefined' ? lineWidth : 1;
        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(x, y, r, startangle, endangle, anticlockwise);
        ctx.stroke();
        var sx, sy, lineangle, destx, desty;
        // ctx.strokeStyle='rgba(0,0,0,0)';    // don't show the shaft
        if (which & 1) { // draw the destination end
            sx = Math.cos(startangle) * r + x;
            sy = Math.sin(startangle) * r + y;
            lineangle = Math.atan2(x - sx, sy - y);
            if (anticlockwise) {
                destx = sx + 10 * Math.cos(lineangle);
                desty = sy + 10 * Math.sin(lineangle);
            } else {
                destx = sx - 10 * Math.cos(lineangle);
                desty = sy - 10 * Math.sin(lineangle);
            }
            drawArrow(ctx, sx, sy, destx, desty, style, 2, angle, d);
        }
        if (which & 2) { // draw the origination end
            var test = 0;
            sx = Math.cos(endangle) * r + x;
            sy = Math.sin(endangle) * r + y;
            lineangle = Math.atan2(x - sx, sy - y);
            if (anticlockwise) {
                destx = sx - 10 * Math.cos(lineangle);
                desty = sy - 10 * Math.sin(lineangle);
            } else {
                destx = sx + 10 * Math.cos(lineangle);
                desty = sy + 10 * Math.sin(lineangle);
            }
            drawArrow(ctx, sx - arrowMove * Math.sin(endangle), sy + arrowMove * Math.cos(endangle), destx - arrowMove * Math.sin(endangle), desty + arrowMove * Math.cos(endangle), style, 2, angle, d);
        }
        ctx.restore();
    };

    /**
     * Draw an arrow on canvas
     * @param  {[type]} ctx
     * @param  {[type]} x1 startX
     * @param  {[type]} y1 startY
     * @param  {[type]} x2 endX
     * @param  {[type]} y2 endY
     * @param  {[type]} style type of head to draw
     *  0 - filled head with back a curve drawn with arcTo
     *  1 - filled head with back a straight line
     *  2 - unfilled but stroked head
     *  3(default) - filled head with back a curve drawn with quadraticCurveTo
     *  4 - filled head with back a curve drawn with bezierCurveTo
     *  function(ctx,x0,y0,x1,y1,x2,y2,style)
     * @param  {[type]} which which end(s) get the arrow
     *  0 - neither
     *  1(default) - x2,y2 end
     *  2 - x1,y1 end
     *  3 - (that's 1+2) both ends
     * @param  {[type]} angle
     *  the angle θ from shaft to one side of arrow head
     *  default π/8 radians (22 1/2°, half of a 45°)
     * @param  {[type]} d
     *  the distance d in pixels from arrow point back along the shaft to the back of the arrow head
     *  default 10px
     * @return {[type]}
     */
    var drawArrow = function (ctx, x1, y1, x2, y2, style, which, angle, d) {
        'use strict';
        // Ceason pointed to a problem when x1 or y1 were a string, and concatenation
        // would happen instead of addition
        if (typeof (x1) === 'string') { x1 = parseFloat(x1); }
        if (typeof (y1) === 'string') { y1 = parseFloat(y1); }
        if (typeof (x2) === 'string') { x2 = parseFloat(x2); }
        if (typeof (y2) === 'string') { y2 = parseFloat(y2); }
        style = typeof (style) !== 'undefined' ? style : 3;
        which = typeof (which) !== 'undefined' ? which : 1; // end point gets arrow
        angle = typeof (angle) !== 'undefined' ? angle : Math.PI / 8;
        d = typeof (d) !== 'undefined' ? d : 10;
        // default to using drawHead to draw the head, but if the style
        // argument is a function, use it instead
        var toDrawHead = typeof (style) !== 'function' ? drawHead : style;

        // For ends with arrow we actually want to stop before we get to the arrow
        // so that wide lines won't put a flat end on the arrow.
        //
        var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var ratio = (dist - d / 3) / dist;
        var tox, toy, fromx, fromy;
        if (which & 1) {
            tox = Math.round(x1 + (x2 - x1) * ratio);
            toy = Math.round(y1 + (y2 - y1) * ratio);
        } else {
            tox = x2;
            toy = y2;
        }
        if (which & 2) {
            fromx = x1 + (x2 - x1) * (1 - ratio);
            fromy = y1 + (y2 - y1) * (1 - ratio);
        } else {
            fromx = x1;
            fromy = y1;
        }

        // Draw the shaft of the arrow
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();

        // calculate the angle of the line
        var lineangle = Math.atan2(y2 - y1, x2 - x1);
        // h is the line length of a side of the arrow head
        var h = Math.abs(d / Math.cos(angle));

        if (which & 1) { // handle far end arrow head
            var angle1 = lineangle + Math.PI + angle;
            var topx = x2 + Math.cos(angle1) * h;
            var topy = y2 + Math.sin(angle1) * h;
            var angle2 = lineangle + Math.PI - angle;
            var botx = x2 + Math.cos(angle2) * h;
            var boty = y2 + Math.sin(angle2) * h;
            toDrawHead(ctx, topx, topy, x2, y2, botx, boty, style);
        }
        if (which & 2) { // handle near end arrow head
            var angle1 = lineangle + angle;
            var topx = x1 + Math.cos(angle1) * h;
            var topy = y1 + Math.sin(angle1) * h;
            var angle2 = lineangle - angle;
            var botx = x1 + Math.cos(angle2) * h;
            var boty = y1 + Math.sin(angle2) * h;
            toDrawHead(ctx, topx, topy, x1, y1, botx, boty, style);
        }
    };
    return {
        drawArrow: drawArrow,
        drawArcedArrow: drawArcedArrow
    };
}();

module.exports = CanvasUtils;