/**
 * 从原有pull2refresh.js中剥离出的用于pulldown and invoke的手势操作
 * 基于此模块实现了头条wap首页下拉刷新的功能
 */

module.exports = (function ($, win) {
    var doc = win.document;

    var DIRECTION = {
        NONE: 0, // 初始化用
        NOOP: 1,
        UP: 2,
        RIGHT: 3,
        DOWN: 4,
        LEFT: 5,
        LEFT_RIGHT: 6, // left or right
    };

    var DEFAULT_OPTS = {
        con: '',
        minDistance: 4,
        onPullStart: function () {},
        onMove: function () {},
        onPullEnd: function () {},
    };

    var Instance = function Instance (opts) {
        if (typeof opts.con === 'string') {
            opts.con = doc.querySelector(opts.con);
        }
        this.options = $.extend({}, DEFAULT_OPTS, opts);

        this.hasTouch = false;
        this.direction = DIRECTION.NONE;
        this.distanceX = this.startY = this.startX = 0;
        this.isPull = false;

        this.initEvent();
    };

    Instance.prototype = {
        initEvent: function () {
            var _this = this;
            this._touchStart = function (e) { _this.__start(e); };
            this._touchMove = function (e) { _this.__move(e); };
            this._touchEnd = function (e) { _this.__end(e); };

            this.options.con.addEventListener('touchstart', this._touchStart, false);
            this.options.con.addEventListener('touchmove', this._touchMove, false);
            this.options.con.addEventListener('touchend', this._touchEnd, false);
        },

        detachEvent: function () {
            this.options.con.removeEventListener('touchstart', this._touchStart, false);
            this.options.con.removeEventListener('touchmove', this._touchMove, false);
            this.options.con.removeEventListener('touchend', this._touchEnd, false);
        },

        __start: function (a) {
            a = a.targetTouches;
            if (1 !== a.length) {
                return;
            }
            // console.clear();
            this.startX = a[0].pageX;
            this.startY = a[0].pageY;
            this.direction = DIRECTION.NONE;
            this.distanceX = 0;
            this.hasTouch = true;
            this.startScrollY = win.scrollY;
        },

        __move: function (a) {
            if (this.hasTouch) {
                if (this.direction === DIRECTION.UP) {
                    return;
                }
                var c = a.targetTouches[0];

                if (this.direction === DIRECTION.NONE) {
                    this.distanceX = c.pageX - this.startX;
                    this.distanceY = c.pageY - this.startY;

                    var absDistanceY = Math.abs(this.distanceY),
                        absDistanceX = Math.abs(this.distanceX);

                    if (absDistanceX + absDistanceY > this.options.minDistance) {

                        /**
                         * 基于sin30 = 0.5，判定该向左右还是上下移动
                         * 1.73约等于根号3
                         */
                        if (absDistanceX > 1.73 * absDistanceY) {
                            this.direction = DIRECTION.LEFT_RIGHT; // 左右
                            this.options.onPullStart(a, this.distanceX);
                        } else if (absDistanceY > 1.73 * absDistanceX) {
                            this.direction = this.distanceY < 0
                                ? DIRECTION.UP
                                : DIRECTION.DOWN;
                        } else {
                            this.direction = DIRECTION.NOOP; // 没有方向
                        }

                        if (this.startScrollY < 10 && this.distanceY > 0) {
                            this.direction = DIRECTION.DOWN;
                        }
                    }

                    if (this.startScrollY < 10
                        && this.direction === DIRECTION.DOWN
                        && this.distanceY > this.options.minDistance) {
                        this.isPull = true;
                        this.options.onPullStart(a, this.distanceY);
                    }
                }

                if (this.isPull && this.direction === DIRECTION.DOWN) {
                    // console.log("move_2");
                    this.distanceY = c.pageY - this.startY;
                    this.refreshY = parseInt(this.distanceY * this.options.pullRatio);
                    this.options.onMove(a, this.distanceY);
                }
                if(this.direction == DIRECTION.LEFT_RIGHT){
                    this.distanceX = c.pageX - this.startX;
                    this.options.onMove(a, this.distanceX);
                }
            }
        },

        __end: function (a) {
            // this.direction : 0没有滑动 1左右 2上下
            if (this.hasTouch
                && (DIRECTION.LEFT_RIGHT === this.direction
                    || DIRECTION.DOWN === this.direction)
            ) {
                if (this.direction === DIRECTION.LEFT_RIGHT) {
                    a.preventDefault();
                    this.options.onPullEnd(a, this.distanceX, DIRECTION.LEFT_RIGHT);
                }
                if (this.direction === DIRECTION.DOWN && this.isPull) {
                    a.preventDefault();
                    this.options.onPullEnd(a, this.distanceY, DIRECTION.DOWN);
                }
            }

            /**
             * 之前是在if里面，这个应该拿出来重置状态比较好吧？@wangwei
             */
            this.hasTouch = false;
            this.isPull = false;
        },
    };


    return {
        init: function (opts) {
            return new Instance(opts);
        },
        DIRECTION: DIRECTION,
    };
}($, window));
