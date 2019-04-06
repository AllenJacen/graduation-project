/**
 * require lib/touchPull.js
 * require lib/canvasUtils.js
 * 基于Canvas实现类似Google Android版本的Inbox下拉刷新模块
 */

var responsive = require('./responsive');
var TouchPull = require('./touchPull.js');
var CanvasUtils = require('./canvasUtils.js');

var SVGUtil = (function ($, win) {

    // Helper method to convert degrees to radians
    function getRadians (degrees) {
        return degrees * (Math.PI / 180);
    }

    function drawArrow (w, arrowObj) {
        // w = 10;
        var p1 = [0, 0];
        var p2 = [p1[0], p1[1] + w];
        var p3 = [p1[0] + w / 2, p1[1] + w / 2];
        var center = [p1[0], p1[1] + w / 2];

        var arrow = arrowObj;
        var ret = [];
        ret.push('M' + p1.join(','));
        ret.push('L' + p2.join(','));
        ret.push('L' + p3.join(','));
        ret.push('L' + p1.join(','));
        arrow.find('path').attr('d', ret.join(' '));

        arrow[0].setAttribute('refX', center[0]);
        arrow[0].setAttribute('refY', center[1]);
    }

    function drawArc (opts) {
        opts = $.extend({
            x: 0,
            y: 0,
            radius: 0,
            margin: 0,
            startDegree: 0,
            endDegree: 0,
            arrowSize: 0,
            arrowObj: $('#markerArrow'),
            pathObj: $('#svgPath'),
            color: '#ff0000'
        }, opts);

        var radius = opts.radius,
            margin = opts.margin;

        var x = radius + margin + radius * Math.sin(getRadians(opts.endDegree));
        var y = radius + margin - radius * Math.cos(getRadians(opts.endDegree));

        var sx = radius + margin + radius * Math.sin(getRadians(opts.startDegree));
        var sy = radius + margin - radius * Math.cos(getRadians(opts.startDegree));

        sx = responsive.px2px(sx);
        sy = responsive.px2px(sy);
        radius = responsive.px2px(radius);
        x = responsive.px2px(x);
        y = responsive.px2px(y);

        var d = [['M' + sx, sy].join(',')];
        d.push([
            ['A' + radius, radius].join(','),
            '0',
            [(opts.endDegree - opts.startDegree) > 180 ? '1' : '0', '1'].join(','),
            [x, y].join(',')
        ].join(' '));
        var ret = d.join(' ');
        $(opts.pathObj).attr('d', ret).css('stroke', opts.color);
        $(opts.arrowObj).find('path').css('fill', opts.color);

        drawArrow(opts.arrowSize, $(opts.arrowObj));
    }

    return {
        drawArc: drawArc
    };

}(window.jQuery || window.Zepto, window));

var PullRefresh = (function ($, win) {
    var doc = win.document;

    // 确定帧动画绘制方法，使用原生或者setTimeout
    var rAF = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function (callback) { window.setTimeout(callback, 1000 / 60); };

    var DEFAULT_PROP = {
        con: '',
        minDistance: 4
    };

    var DEFAULT_FUNCTION = [
        'onPullStart',
        'onMove',
        'onRelease',
        'needRefresh',
        'doRefresh',
        'noop'
    ];

    var CANVAS_SHOW_DISTANCE = 30;
    var PULLTIP_INIT_Y = 10;
    var ANIM_TIMEOUT = 300;
    var PULLTIP_MAX_Y = function () {
        return 85 * ((responsive || {dpr: 1}).dpr || 1);
    };
    var ARROWED_ARC_GAP_DEGREE = 10;

    var getPullTipMoveDistance = function (y) {
        var distance = y * 5 / 12;
        return distance;
    };

    /**
     * 先判定canvas特性是否支持
     * 然后判定在一些特定操作系统的浏览器上，过滤支持不好的手机型号
     * @return {Boolean} true or false
     */
    var NOT_SUPPORT_CANVAS = (function () {
        var elem = document.createElement('canvas');
        var supportCanvas = !!(elem.getContext && elem.getContext('2d'));

        var ua = navigator.userAgent.toLowerCase();
        var isChrome = ua.match(/chrome\/([\d.]+)/),
            isSafari = ua.match(/version\/([\d.]+).*safari/),
            isFF = ua.match(/firefox\/([\d.]+)/);
        var isMX = ua.match(/mx[\d.]+/);
        var notSupportOnSomeOS = false;
        if (isMX && isSafari) {
            notSupportOnSomeOS = true;
        }
        return !supportCanvas && notSupportOnSomeOS;
    }());

    var NOT_SUPPORT_SVG = (function () {
        return true;
        var supportSVG = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
        var isIOS = $.browser.ios;
        // for now we only support svg under ios platform.
        return !supportSVG || !isIOS;
    }());

    /**
     * [Instance description]
     * @param {[type]} opts
     *   @param {String} con container
     *   @param {Number} minDistance min distance to append loading tooltip default 4(px)
     *   @param {Function} onPullStart
     *   @param {Function} onMove
     *   @param {Function} onRelease 当用户touchend时候，做一些动画处理的方法，需要Promise机制的支持
     *   @param {Function} doRefresh 需要refresh时候，加载服务器端接口，需要Promise机制的支持，以便回调
     *   @param {Function} noop 当不需要refresh的时候，执行该方法
     */
    var Instance = function Instance (opts) {
        if (typeof opts.con === 'string') {
            opts.con = doc.querySelector(opts.con);
        }
        var funcs = {};
        var self = this;
        $.each(DEFAULT_FUNCTION, function (idx, fn) {
            funcs[fn] = self['_' + fn].bind(self);
        });

        this.options = $.extend({}, DEFAULT_PROP, funcs, opts);

        this.shouldRefresh = false;
        this.isRefreshing = false;
        this.$pullTip = null;

        // do not recommend to overwrite onPullEnd.
        funcs.onPullEnd = this._onPullEnd.bind(this);
        opts = $.extend({}, funcs, opts);
        this.touchPull = TouchPull.init(opts);
        // this.addPullTip(this.options.con);
        this.refreshTimes = 0;
    };


    // var logger = function(m) {
    //     var h = $('#logger').html();
    //     if(arguments.length>1) {
    //         m = [].slice.call(arguments, 0);
    //         m = m.join('~');
    //     }
    //     $('#logger').html(h+m+'<br>');
    //     clearTimeout(window.__logger_timeId);
    //     window.__logger_timeId = setTimeout(function() {
    //         $('#logger').html('');
    //     }, 3000);
    // }

    // window.onerror = function(err, url, line, column, eObj) {
    //     alert('err')
    //     // logger('error', err, url, line);
    // }

    // window.__logger = logger;
    //

    Instance.prototype = {
        _onPullStart: function (event, distance) {
            if (this.isRefreshing) {
                return;
            }
            event.preventDefault();
            this.addPullTip(this.options.con);
        },

        _onMove: function (event, distance) {
            if (this.isRefreshing) {
                return;
            }
            event.preventDefault();
            var d = getPullTipMoveDistance(distance);
            d = this.isRefreshing ? d + this.minRefreshDistance : d;
            this.movePullTip(d);
            this.changePullTip(d, this.options.con);
        },

        _onPullEnd: function (event, distance, direction) {
            if (this.isRefreshing) {
                return;
            }
            var self = this;


            /**
             * 先根据touchend时候的distance，确定是否需要refresh
             * 然后执行onRelease进行动画
             * 动画结束后，启动服务器数据加载
             * 并在服务器返回后，reset
             * 若不需要refresh，则noop
             */
            this.options.needRefresh(distance);
            this.options.onRelease().then(function () {
                // if(typeof gaevent === "function") {
                //     win.gaevent('refresh','drag_refresh_new');
                // }
                if (self.options.needRefresh()) {


                    // track event when refresh is needed
                    // to check with drag_refresh
                    // if(typeof gaevent === "function") {
                    //     win.gaevent('refresh','drag_refresh_OK_new');
                    // }
                    win._vis_opt_queue = win._vis_opt_queue || [];
                    win._vis_opt_queue.push(function () {
                        _vis_opt_goal_conversion(13359);
                    });

                    self.isRefreshing = true;
                    self.refreshTimes += 1;
                    self.options.doRefresh().always(function () {
                        self.reset();
                    });
                } else {
                    self.reset();
                    self.options.noop();
                }
            });
        },

        transitionDefer: null,
        onTransitionEnd: function () {
            var self = this;
            if (self.shouldRefresh) {
                self.canvasObj.startAuto();
            } else {
                self.reset();
            }
            setTimeout(function () {
                self.transitionDefer.resolve();
            }, false);
        },

        /**
         * Need Promise
         * @return a Promise Object
         */
        _onRelease: function () {
            this.transitionDefer = $.Deferred();
            if (this.pullTipExist()) {
                var pullTip = this.$pullTip[0];
                pullTip.addEventListener('webkitTransitionEnd',
                    this.onTransitionEnd.bind(this), false);

                var d = this.shouldRefresh ? this.minRefreshDistance : 0;
                var noRotate = true;
                this.movePullTip(d, 'all ' + ANIM_TIMEOUT + 'ms linear', noRotate);
            } else {
                this.transitionDefer.resolve();
            }
            return this.transitionDefer;
        },

        /**
         * [_doRefresh description]
         * Need support Promise!!!
         * @return {[type]}
         */
        _doRefresh: function () {
            var d = $.Deferred();
            d.resolve();
            return d;
        },

        _noop: function () {

        },

        _needRefresh: function (distance) {
            distance = getPullTipMoveDistance(distance);
            // console.log(distance, this.minRefreshDistance);
            if (!this.shouldRefresh && distance >= this.minRefreshDistance) {
                this.shouldRefresh = true;
            }
            return this.shouldRefresh;
        },

        pullTipExist: function () {
            return this.$pullTip && this.$pullTip[0];
        },

        reset: function () {
            var curValue = this.isRefreshing;
            this.isRefreshing = false;
            this.shouldRefresh = false;
            this.removePullTip(curValue);
        },

        canvasObj: (function () {
            // pullRefresh对象
            var pullRefreshObj = null,
                canvasOrSVG = null,
                context = null,
                isSVG = false,
                // 绘图圆点x、y
                X = 100,
                Y = 100,
                // 半径
                RADIUS = 50,
                // margin
                MARGIN = 0,
                // 线条粗细
                LINE_WIDTH = 15,
                // 自动绘制的开关标志位
                isAuto = false,
                // 自动绘制的速度
                SPEED = 5,
                // 绘制的起始位置
                START_ANGLE = 0,
                // 自动绘制旋转一周时间
                AUTO_ROTATE_TIME = 1500,
                // 自动绘制圆圈一周时间
                AUTO_ARC_TIME = 1000,

                COLORS = [
                    'green',
                    'red',
                    'blue',
                    '#f3b000'
                ],

                prevColor = COLORS[0],
                curIdx = 1;

            /**
             * 随机选取一种颜色，目前按照inbox方式，顺序选取
             * @return {int} 下标值
             */
            function getRandColor () {
                var idx = (curIdx + 1) % COLORS.length;
                curIdx = idx;
                return idx;
            }

            // 绘制与擦除过程中需要配置的属性集合
            var drawProps = {
                startAngle: START_ANGLE,
                speed: SPEED,
                color: COLORS[0],
                counterClockwise: false,
                globalCompositeOperation: 'source-out',
                lineWidth: LINE_WIDTH
            };
            var eraseProps = {
                startAngle: START_ANGLE,
                speed: SPEED,
                color: 'white',
                counterClockwise: false,
                globalCompositeOperation: 'destination-out',
                lineWidth: LINE_WIDTH + 40 // artefacts appear unless we increase lineWidth for erase
            };

            // Let's work in degrees as they're easier for humans to understand
            var currentDegrees = START_ANGLE,
                currentArrowedArcDegree = START_ANGLE,
                currentProps = drawProps,
                status = 'draw',
                deltaDegree = 50,
                maxDegree = 0;

            /**
             * 根据起始角度，计算此次终止位置的角度值
             * @param  {[type]} startAngle [description]
             * @return {[type]}            [description]
             */
            function getMaxDegree (startAngle) {
                return 360 + startAngle - deltaDegree;
            }

            /**
             * 清理绘图区域
             * @return {[type]} [description]
             */
            function clearContext () {
                if (!isSVG) {
                    context.clearRect(0, 0, X * 2, Y * 2);
                }
            }

            /**
             * 调用arc方法绘制弧线
             * @param  {[type]} opts [description]
             *   @param {float} start 起始角度
             *   @param {float} end 终止角度
             *   @param {int} lineWidth 线条粗细
             *   @param {String} color color
             *   @param {Boolean} counterClockwise 是否逆时针绘制
             *   @param {String} co globalCompositeOperation
             *   @param {Boolean} clearRect 是否进行区域清理
             * @return {[type]}      [description]
             */
            function contextDraw (opts) {
                if (NOT_SUPPORT_CANVAS) {
                    return;
                }
                var start = opts.start,
                    end = opts.end,
                    lineWidth = opts.lineWidth,
                    color = opts.color,
                    counterClockwise = opts.counterClockwise,
                    co = opts.co,
                    clearRect = opts.clearRect;

                if (clearRect) {
                    clearContext();
                }
                context.save();
                context.globalCompositeOperation = co;
                context.beginPath();
                context.arc(
                    X,
                    Y,
                    RADIUS,
                    getRadians(start),
                    getRadians(end),
                    counterClockwise
                );
                context.lineWidth = lineWidth;
                context.strokeStyle = color;
                context.stroke();
                context.restore();
            }

            /**
             * 用于requestFrameAnimation触发每帧绘制时候，记录起始时间
             * 以便计算当前帧基于上次绘制过去多长时间，
             * 以便计算此帧需要绘制的距离
             */
            var drawArcStartTime = 0;

            /**
             * 自动绘制圆圈时候调用该方法
             * 方法根据currentProps，以及计算得来的起止角度，绘制一段圆圈
             * 或者在终止角度达到maxdegree时候，切换到擦除属性上进行擦除操作
             * @return {[type]} [description]
             */
            function drawArc () {
                if (NOT_SUPPORT_CANVAS) {
                    return;
                }
                var s = currentProps.speed;
                var start = currentProps.startAngle,
                    end = currentDegrees,
                    color = currentProps.color,
                    lineWidth = currentProps.lineWidth,
                    counterClockwise = currentProps.counterClockwise,
                    co = currentProps.globalCompositeOperation;

                // autodraw will calc speed based on 60frames
                var st = drawArcStartTime || +new Date();
                end = +new Date();
                s = 360 / AUTO_ARC_TIME * (end - st);
                drawArcStartTime = end;

                currentDegrees += s;
                end = Math.min(maxDegree, currentDegrees);

                var clearRect = status === 'draw';

                if (!isSVG) {
                    contextDraw({
                        start: start,
                        end: end,
                        color: color,
                        lineWidth: lineWidth,
                        counterClockwise: counterClockwise,
                        co: co,
                        clearRect: clearRect
                    });

                    // console.log(currentDegrees, maxDegree, s)

                    // Start erasing when we hit maxDegree
                    // console.log(currentDegrees, maxDegree, isAuto, currentProps.speed)
                    if (currentDegrees >= maxDegree) {
                        // canvasOrSVG.width = canvasOrSVG.width;
                        context.closePath();
                        currentProps = status !== 'erase' ? eraseProps : drawProps;
                        status = status !== 'erase' ? 'erase' : 'draw';
                        if (status === 'draw') {
                            prevColor = currentProps.color;
                            var idx = getRandColor(prevColor);
                            currentProps.color = COLORS[idx];

                            currentProps.startAngle = (currentProps.startAngle - deltaDegree) % 360;
                            currentDegrees = currentProps.startAngle;
                            maxDegree = getMaxDegree(currentDegrees);
                        } else {
                            currentDegrees = currentProps.startAngle = drawProps.startAngle;
                        }
                    }
                }
            }

            /**
             * 基于拖拽的距离，绘制带箭头的圆圈
             * 主要用于用户pulldown时候的canvas绘制，包括向上拉动时候，逆时针绘制
             * @param  {[type]} distance [description]
             * @return {[type]}          [description]
             */
            function drawArrowedArcByDis (distance) {
                if (NOT_SUPPORT_CANVAS) {
                    return;
                }
                var s = drawProps.speed;
                var start = drawProps.startAngle,
                    end = drawProps.startAngle,
                    color = COLORS[0];


                if (!isNaN(distance)) {
                    distance = Math.min(
                        pullRefreshObj.minRefreshDistance - CANVAS_SHOW_DISTANCE,
                        distance);

                    var ratio = (distance) / (pullRefreshObj.minRefreshDistance - CANVAS_SHOW_DISTANCE);
                    var deltaDis = (maxDegree - ARROWED_ARC_GAP_DEGREE) * ratio - drawProps.startAngle;
                    s = deltaDis;
                }

                end += s;

                currentArrowedArcDegree = end;

                drawArcedArrow({
                    start: start,
                    end: end,
                    color: color,
                    distance: distance
                });
            }

            /**
             * 固定终止角度，通过变化起始角度来绘制带箭头圆环消失的过程
             * @return {[type]} [description]
             */
            function drawArrowedArcWithFixedEnd () {
                var initDistance = pullRefreshObj.minRefreshDistance - CANVAS_SHOW_DISTANCE;
                var speed = initDistance / AUTO_ARC_TIME * 1.3;
                var color = COLORS[0];

                var distance = initDistance;
                var st = +new Date();
                var defer = $.Deferred();
                var animFunc = function () {
                    if (distance >= 0) {
                        var ed = +new Date();
                        distance -= speed * (ed - st);
                        st = ed;

                        var ratio = (distance) / (
                            pullRefreshObj.minRefreshDistance
                            - CANVAS_SHOW_DISTANCE);
                        var deltaDis = (maxDegree - ARROWED_ARC_GAP_DEGREE) * ratio
                            - drawProps.startAngle;
                        var start = currentArrowedArcDegree - deltaDis;
                        start = Math.min(start, currentArrowedArcDegree);
                        drawArcedArrow({
                            start: start,
                            end: currentArrowedArcDegree,
                            color: color,
                            distance: distance
                        });
                        rAF(animFunc);
                    } else {
                        defer.resolve();
                    }
                };
                rAF(animFunc);
                return defer;
            }

            /**
             * 调用CanvasUtils.drawArcedArrow方法，绘制带箭头的弧线
             * @param  {[type]} opts [description]
             *   @param {Float} distance 下拉距离，借此计算起止角度与箭头大小，以及opacity
             *   @param {String} color
             *   @param {Float} start
             *   @param {Float} end
             *  @return {[type]}      [description]
             */
            function drawArcedArrow (opts) {
                var distance = opts.distance;
                var arrowSize = isSVG ? 10 : 25;
                var arrowMove = LINE_WIDTH;
                var ratio = distance / (pullRefreshObj.minRefreshDistance - CANVAS_SHOW_DISTANCE);
                if (!isNaN(distance)) {
                    arrowSize = arrowSize * ratio;
                    arrowMove = LINE_WIDTH * ratio;
                }

                clearContext();
                if (!isSVG) {
                    context.strokeStyle = opts.color;
                    context.fillStyle = opts.color;
                    CanvasUtils.drawArcedArrow(
                        context,
                        X,
                        Y,
                        RADIUS,
                        getRadians(opts.start),
                        getRadians(opts.end),
                        false,
                        1,
                        2,
                        getRadians(45),
                        arrowSize,
                        LINE_WIDTH,
                        arrowMove
                    );
                } else {
                    SVGUtil.drawArc({
                        x: X,
                        y: Y,
                        radius: RADIUS,
                        margin: MARGIN,
                        startDegree: opts.start,
                        endDegree: opts.end,
                        arrowSize: arrowSize,
                        arrowObj: $(canvasOrSVG).find('#markerArrow'),
                        pathObj: $(canvasOrSVG).find('#svgPath'),
                        color: opts.color
                    });
                }

            }

            /**
             * 根据transform的matrix值，获得当前元素的translateY偏移量
             * @param  {String} matrixStr matrix(1,0,0,1,x,y)
             * @return {[type]}           [description]
             */
            function getYFromMatrix (matrixStr) {
                var ret = 0;
                if (matrixStr) {
                    matrixStr = matrixStr.replace('matrix(', '').replace(')', '');
                    matrixStr = matrixStr.replace(/\s+/ig, '');
                    var items = matrixStr.split(',');
                    ret = items[5] || 0;
                }
                return ret;
            }

            /**
             * 当用户touchend时候，且不满足refresh条件，
             * 则需要绘制圆圈重置回初始位置的动画
             * @return {[type]} [description]
             */
            function clearCurrent () {
                var curY = getYFromMatrix(pullRefreshObj.$pullTip.css('transform'));
                // do nothing when loading icon position less than CANVAS_SHOW_DISTANCE
                if (curY < CANVAS_SHOW_DISTANCE) {
                    return;
                }
                var timeout = ANIM_TIMEOUT;

                var s = (curY) / timeout;
                var dis = curY;
                var st = +new Date();
                var animFunc = function () {
                    if (dis > CANVAS_SHOW_DISTANCE && pullRefreshObj.$pullTip) {
                        var end = +new Date();
                        var f = s * (end - st);
                        dis -= f;
                        rotate(dis - CANVAS_SHOW_DISTANCE);
                        drawArrowedArcByDis(dis - CANVAS_SHOW_DISTANCE);
                        changeOpacity(dis - CANVAS_SHOW_DISTANCE);
                        st = end;
                        rAF(animFunc);
                    }
                };

                rAF(animFunc);
            }

            /**
             * 基于icon当前位置，设置canvas区域的透明度
             * @param  {[type]} distance [description]
             * @return {[type]}          [description]
             */
            function changeOpacity (distance) {
                var opacity = 1.0 * distance / (pullRefreshObj.minRefreshDistance - CANVAS_SHOW_DISTANCE);
                $(canvasOrSVG).css('opacity', opacity);
            }

            /**
             * 基于当前位置，绘制canvas区域的旋转角度
             * @param  {Float}  value    当前位置值，或者isDegree=true时候，则直接为角度值
             * @param  {Boolean} isDegree 判定value是否为角度值，true则直接用，无需转换
             * @return {[type]}           [description]
             */
            function rotate (value, isDegree) {
                var degree = value;
                if (!isDegree) {
                    degree = Math.max(0, (value - CANVAS_SHOW_DISTANCE)
                        / pullRefreshObj.minRefreshDistance * 360);
                }
                canvasOrSVG.style.webkitTransition = 'none';
                canvasOrSVG.style.webkitTransform = 'rotate(' + degree + 'deg)';
            }

            // Helper method to convert degrees to radians
            function getRadians (degrees) {
                return degrees * (Math.PI / 180);
            }

            var forceStopTimeId = -1;

            /**
             * force removing the loading icon when timeout
             * @param  {[type]} timeout default = 8
             * @return {[type]}         [description]
             */
            function forceStopTimer (timeout) {
                clearTimeout(forceStopTimeId);
                timeout = timeout || 8 * 1000;
                forceStopTimeId = setTimeout(function () {
                    pullRefreshObj.reset();
                }, timeout);
            }
            return {
                init: function ($con, parent) {
                    this.reset();
                    drawArcStartTime = 0;
                    isAuto = false;
                    canvasOrSVG = $con.find('#load-tip-svg')[0] || $con.find('#load-tip-canvas')[0];
                    context = canvasOrSVG.getContext ? canvasOrSVG.getContext('2d') : canvasOrSVG;
                    isSVG = canvasOrSVG.getContext ? false : true;
                    currentArrowedArcDegree = currentDegrees = START_ANGLE;
                    drawProps.startAngle = eraseProps.startAngle = START_ANGLE;
                    maxDegree = getMaxDegree(currentDegrees);
                    curIdx = 1;
                    drawProps.color = COLORS[curIdx];

                    status = 'draw';
                    currentProps = drawProps;
                    pullRefreshObj = parent;
                    if (!isSVG) {
                        X = Y = 100;
                        MARGIN = 0;
                        RADIUS = 50;
                    } else {
                        MARGIN = 9;
                        X = Y = RADIUS = (40 - 2 * MARGIN) / 2;
                    }
                },
                reset: function () {
                    canvasOrSVG = null;
                    context = null;
                },
                drawArrowedArcByDis: function (distance) {
                    drawArrowedArcByDis(distance);
                },
                drawArc: function (distance) {
                    if (!NOT_SUPPORT_CANVAS) {
                        drawArc(distance);
                    } else {
                        console.log('not support');
                    }
                },
                clearCurrent: function () {
                    if (!NOT_SUPPORT_CANVAS) {
                        clearCurrent();
                    } else {
                        console.log('not support');
                    }
                },
                rotate: rotate,
                changeOpacity: changeOpacity,
                autoRotate: function () {
                    var rotate = canvasOrSVG.style.webkitTransform;
                    rotate = rotate.replace('rotate(', '').replace('deg', '').replace(')', '');
                    var curDegree = parseFloat(rotate);
                    var spf = 360 / AUTO_ROTATE_TIME; // speed per frame
                    var self = this;

                    var st = +new Date();
                    var animFunc = function () {
                        if (isAuto) {
                            var end = +new Date();
                            var d = curDegree + spf * (end - st);
                            st = end;
                            // console.log(d);
                            self.rotate(d, true);
                            curDegree = d;
                            rAF(animFunc);
                        }
                    };

                    rAF(animFunc);
                },
                autoDraw: function () {
                    if (NOT_SUPPORT_CANVAS) {
                        return;
                    }
                    var animFunc = function () {
                        if (isAuto) {
                            if (!isSVG) {
                                drawArc();
                                rAF(animFunc);
                            } else {
                                isAuto = false;
                                // svg can not use addClass method to add class...
                                $(context).attr('class', 'spinner');
                            }
                        }
                    };
                    var defer = drawArrowedArcWithFixedEnd();
                    defer.done(function () {
                        rAF(animFunc);
                    });
                },
                startAuto: function () {
                    isAuto = true;
                    pullRefreshObj.touchPull.detachEvent();
                    this.autoDraw();
                    this.autoRotate();
                    forceStopTimer();
                },
                stopAuto: function () {
                    isAuto = false;
                    pullRefreshObj.touchPull.initEvent();
                    clearTimeout(forceStopTimeId);
                }
            };
        }()),

        initCanvas: function () {
            this.canvasObj.init(this.$pullTip, this);
        },

        addPullTip: function (con) {
            this.removePullTip();
            con = this.options.con;
            var $pullTip = this.$pullTip;
            if ($pullTip) {
                return;
            }

            var strAry = [];
            strAry.push('<div class=\'list_top\'>');
            strAry.push('<div class=\'list_top_con v2\'>');
            if (!NOT_SUPPORT_SVG) {
                var refY = responsive.px2px(5),
                    point = responsive.px2px(20),
                    radius = responsive.px2px(11),
                    markerWidth = responsive.px2px(10),
                    dashArray = responsive.px2px(70),
                    strokeWidth = responsive.px2px(3.5);
                var markerPath = ['M0,0', 'L0,' + markerWidth, 'L' + refY + ',' + refY, 'L0,0'].join(' ');
                strAry.push('<svg id="load-tip-svg" class="">\
                                <marker id="markerArrow" markerWidth="' + markerWidth + '" markerHeight="' + markerWidth + '" refX="0" refY="' + refY + '"\
                                   orient="auto" markerUnits="userSpaceOnUse">\
                                    <path d="' + markerPath + '" style="fill: #660000;" />\
                                </marker>\
                                <path stroke-width="' + strokeWidth + '" stroke-linecap="round" id="svgPath" marker-end="url(#markerArrow)" d="M125,25 A100,100 0 0,1 125,25"\
                                      style="stroke:#660000; fill:none;"/>    \
                                <circle style="stroke-dasharray:' + dashArray + ';" id="svgCircle" class="path" fill="none" stroke-width="' + strokeWidth + '" stroke-linecap="round" cx="' + point + '" cy="' + point + '" r="' + radius + '"></circle> \
                            </svg>');
            } else {
                strAry.push('<canvas \
                            id=\'load-tip-canvas\' \
                            width=\'200\' \
                            height=\'200\' \
                            class=\'' + (NOT_SUPPORT_CANVAS ? 'not-support' : '') + '\'></canvas>');
            }

            strAry.push('</div></div>');
            this.$pullTip = $(strAry.join('')).insertAfter('body');
            $pullTip = this.$pullTip;
            this.minRefreshDistance = $pullTip.outerHeight();
            var pullTip = $pullTip[0];
            pullTip.style.webkitTransition = 'none';
            pullTip.style.webkitTransform = 'translate3d(0,' + PULLTIP_INIT_Y + 'px,0)';
            pullTip.style.top = con.getBoundingClientRect().top - this.minRefreshDistance + 'px';
            this.initCanvas();
        },

        movePullTip: function (distance, transition, noRotate) {
            if (this.pullTipExist()) {
                var d = Math.min(PULLTIP_MAX_Y(), distance);
                this.$pullTip[0].style.webkitTransition = transition || 'none';
                this.$pullTip[0].style.webkitTransform = 'translate3d(0,' + d + 'px,0)';

                if (distance === 0) {
                    this.canvasObj.clearCurrent();
                } else if (distance > CANVAS_SHOW_DISTANCE) {
                    if (!this.shouldRefresh) {
                        if (distance <= PULLTIP_MAX_Y() - 5) {
                            this.canvasObj.rotate(distance);
                        }
                        this.canvasObj.drawArrowedArcByDis(distance - CANVAS_SHOW_DISTANCE);
                        this.canvasObj.changeOpacity(distance - CANVAS_SHOW_DISTANCE);
                    } else if (!this.isRefreshing && noRotate !== true) {
                        this.canvasObj.rotate(distance);
                    }
                }

            }
        },

        changePullTip: function (distance, con) {
            if (this.pullTipExist()) {
            }
        },

        removePullTip: function (isRefreshing) {
            if (this.pullTipExist()) {
                if (isRefreshing) {
                    var self = this;
                    self.canvasObj.stopAuto();
                    self.$pullTip[0].style.webkitTransition = 'all ' + 100 + 'ms linear';
                    self.$pullTip.css('opacity', 0.1);
                    self.$pullTip[0].style.webkitTransform += ' scale(0.1)';
                } else {
                    this.$pullTip[0].removeEventListener(
                        'webkitTransitionEnd',
                        this.onTransitionEnd,
                        false);
                    this.$pullTip.remove();
                    this.$pullTip = null;
                    $(window).trigger('pullrefresh_pulltip_removed');
                }
            }
        }
    };

    var PullRefresh = {
        init: function (opts) {
            return new Instance(opts);
        }
    };

    return PullRefresh;
}($, window));

module.exports = PullRefresh;
