(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        // 浏览器全局变量(root 即 window)
        root.Player = factory();
    }
}(this, function() {

    var videojs = null;
    if (typeof window.videojs === 'undefined' && typeof require === 'function') {
        //videojs = require("common/widgets/v-player/video-m.js");
    } else {
        //videojs = window.videojs;
    }
    /**
     * [util 工具类]
     * @type {Object}
     */
    var util = {};
    /**
     * [function 返回数组的指定项]
     * @param  {[type]} array [description]
     * @param  {[type]} item  [description]
     * @return {[type]}       [description]
     */
    util.indexOf = function(array, item) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == item) {
                return i;
            }
        }
        return -1;
    };
    /**
     * [function 判断是否为函数]
     * @param  {[type]} source [description]
     * @return {[type]}        [description]
     */
    util.isFunction = function(source) {
        return '[object Function]' == Object.prototype.toString.call(source);
    };
    /**
     * [isIE 判断是不是ie]
     * @return {Boolean} [如果是ie返回版本号，不是则返回false]
     */
    util.isIE = function() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };
    /**
     * [function 对象浅复制]
     * @param  {[type]} dst [description]
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    util.extend = function(dst, obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                dst[i] = obj[i];
            }
        }
    };
    /**
     * [function 获取一个随机的5位字符串]
     * @param  {[type]} prefix [description]
     * @return {[type]}        [description]
     */
    util.getName = function(prefix) {
        return prefix + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };
    /**
     * [function 在页面中注入js脚本]
     * @param  {[type]} url     [description]
     * @param  {[type]} charset [description]
     * @return {[type]}         [description]
     */
    util.createScript = function(url, charset) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        charset && script.setAttribute('charset', charset);
        script.setAttribute('src', url);
        script.async = true;
        return script;
    };
    /**
     * [function jsonp]
     * @param  {[type]} url      [description]
     * @param  {[type]} onsucess [description]
     * @param  {[type]} onerror  [description]
     * @param  {[type]} charset  [description]
     * @return {[type]}          [description]
     */
    util.jsonp = function(url, onsuccess, onerror, charset) {
        var callbackName = util.getName('tt_player');
        window[callbackName] = function() {
            if (onsuccess && util.isFunction(onsuccess)) {
                onsuccess(arguments[0])
            };
        }
        var script = util.createScript(url + '&callback=' + callbackName, charset);
        script.onload = script.onreadystatechange = function() {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = script.onreadystatechange = null;
                // 移除该script的 DOM 对象
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                // 删除函数或变量
                window[callbackName] = null;
            }
        }
        script.onerror = function() {
            if (onerror && util.isFunction(onerror)) {
                onerror()
            };
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    /**
     * [function crc32加密]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    util.crc32 = function(url) {
        var a = document.createElement('a');
        a.href = url;
        var T = (function() {
            var c = 0,
                table = new Array(256);
            for (var n = 0; n != 256; ++n) {
                c = n;
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
                table[n] = c;
            }
            return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
        })();
        var crc32_str = function(str) {
            var C = -1;
            for (var i = 0, L = str.length, c, d; i < L;) {
                c = str.charCodeAt(i++);
                if (c < 0x80) {
                    C = (C >>> 8) ^ T[(C ^ c) & 0xFF];
                } else if (c < 0x800) {
                    C = (C >>> 8) ^ T[(C ^ (192 | ((c >> 6) & 31))) & 0xFF];
                    C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
                } else if (c >= 0xD800 && c < 0xE000) {
                    c = (c & 1023) + 64;
                    d = str.charCodeAt(i++) & 1023;
                    C = (C >>> 8) ^ T[(C ^ (240 | ((c >> 8) & 7))) & 0xFF];
                    C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 2) & 63))) & 0xFF];
                    C = (C >>> 8) ^ T[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xFF];
                    C = (C >>> 8) ^ T[(C ^ (128 | (d & 63))) & 0xFF];
                } else {
                    C = (C >>> 8) ^ T[(C ^ (224 | ((c >> 12) & 15))) & 0xFF];
                    C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 6) & 63))) & 0xFF];
                    C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
                }
            }
            return C ^ -1;
        }
        var r = a.pathname + '?r=' + Math.random().toString(10).substring(2);
        if (r[0] != '/') {
            r = '/' + r;
        }
        var s = crc32_str(r) >>> 0;
        return [a.protocol, a.hostname].join('//') + r + '&s=' + s
    };
    /**
     * [encoder 编码解码]
     * @type {Object}
     */
    var encoder = {};
    /**
     * [function 编码]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    encoder.base64encode = function(str) {
        var out, i, len, c1, c2, c3;
        var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    };
    /**
     * [function 解码]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    encoder.base64decode = function(str) {
        var c1, c2, c3, c4, i, len, out;
        var base64DecodeChars = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1];
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            do {
                c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 == -1);
            if (c1 == -1) break;
            do {
                c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 == -1);
            if (c2 == -1) break;
            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if (c3 == 61) return out;
                c3 = base64DecodeChars[c3];
            } while (i < len && c3 == -1);
            if (c3 == -1) break;
            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if (c4 == 61) return out;
                c4 = base64DecodeChars[c4];
            } while (i < len && c4 == -1);
            if (c4 == -1) break;
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    };
    /**
     * [function description]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    encoder.utf16to8 = function(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    };
    /**
     * [function description]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    encoder.utf8to16 = function(str) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += str.charAt(i - 1);
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    };
    /**
     * [function 播放器]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    var Player = function(options) {
        this.config = {
            preload: 'auto', //是否加载
            controls: true, //是否显示控制条
            controlBar: {},
            poster: '', //视频快照
            autoplay: false, //自动播放，默认 关
            loop: false, //是否循环播放，默认 关
            width: 640, //默认宽度
            height: 320, //默认高度
            pluginSwitcher: true, //多分辨率支持
            id: '', //视频容器
            remoteURL: '//i.snssdk.com/video/urls/v/1/toutiao/mp4/', //服务端解码地址
            videoID: '', //视频ID
            type: 'video_2,video_1,video_3' //视频分辨率类型，目前支持video_1、video_2、video_3
        };
        this.util.extend(this.config, options);
    };
    /**
     * [util 工具函数]
     * @type {[type]}
     */
    Player.prototype.util = util;
    /**
     * [encoder 编码解码]
     * @type {[type]}
     */
    Player.prototype.encoder = encoder;
    /**
     * [function 创建视频]
     * @param  {[type]} arguments [description]
     * @return {[type]}           [description]
     */
    Player.prototype.createVideo = function(mp4) {
        var video = document.createElement('video');
        var source = document.createElement('source');
        source.setAttribute('type', 'video/mp4');
        source.setAttribute('src', mp4);
        video.appendChild(source);
        return this.video = video
    };

    Player.prototype.createOriginalVideo = function(config) {
        var video = document.createElement('video');
        var src = this.videoList[this.videoList.length-1].src;
        // if(location.protocol === 'https:') {
        //     src = src.replace(/^http:/, 'https:');
        // }
        video.src = src;
        video.poster = config.poster;
        video.controls = 'controls';
        video.width = config.width;
        video.height = config.height;
        video.preload = config.preload;
        video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        video.setAttribute('playsinline', 'playsinline');
        video.id = config.id;
        video.className = config.class;
        video.autoplay = config.autoplay;
        return this.video = video;
    };
    /**
     * [function 视频插入文档]
     * @param  {[type]}   video    [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    Player.prototype.insertVideo = function(video, callback) {
        var me = this;
        var $id = me.config.insertElement;

        if ($id) {
            $id.innerHTML = '';
            $id.appendChild(video);
            if (callback && me.util.isFunction(callback)) {
                callback.call(me, video);
            }
        }
    };
    Player.prototype.reporter = function(msg, type) {
        var url = '//toutiao.com/__utm.gif';
        var s = [];
        s.push('account=toutiao_pc');
        s.push('pathname=video_monitor');
        s.push('event=' + type);
        s.push('reffer=' + location.href);
        msg && s.push(msg);
        s.push('r=' + Math.random());
        new Image().src = url + '?' + s.join('&');
    };
    /**
     * [function 动态获取视频地址，有效时长：1个小时]
     * @return {[type]} [description]
     */
    Player.prototype.getVideos = function(callback) {
        var me = this,
            util = me.util,
            list = [],
            item,
            url;
        if (me.config.videoID) {
            url = util.crc32(me.config.remoteURL + me.config.videoID); + function() {
                url += '&logo_type=motor';
                util.jsonp(url, function(res) {
                    var status = res.data.status;
                    // 正常播放的情况：code=0&status=10
                    if (res.code == 0 && status == 10) {
                        var obj = res.data.video_list;
                        for (var k in obj) {
                            item = obj[k];
                            list.push({
                                src: me.encoder.base64decode(item.main_url),
                                type: 'video/' + item.vtype,
                                label: item.definition.replace('360p','极速').replace('480p','高清').replace('720p','超清'),
                                res: item.vheight,
                                vwidth: item.vwidth,
                                vheight: item.vheight
                            });
                        }
                        me.videoList = list;
                        if (callback && callback instanceof Function) {
                            callback.call(me);
                        }
                        // 如果超时可以定时获取
                        // setTimeout(arguments.callee,60*60*1000);
                    } else {
                        var statusObj = {
                                '20': '转码失败',
                                '30': '转码进行中',
                                '40': '视频id不存在',
                                '0': 'unknown',
                                '1': '上传中',
                                '2': '上传失败',
                                '3': '等待上传',
                                '101': '视频被屏蔽',
                                '102': '视频被删除',
                                '103': '视频永久删除'
                            },
                            msg = statusObj[status + ''] || res.message || '视频转码处理中';
                        me.reporter(msg + '=' + location.href, 'video_error');
                        var $id = me.config.insertElement;
                        if ($id) {
                            $id.innerHTML = '<p class="video-fail">' + msg + '</p>';
                        }
                    }
                });
            }();
        }
    };
    /**
     * [function 设置/获取默认视频清晰度]
     * @param  {[type]} value   [description]
     * @return {[type]}       [description]
     */
    Player.prototype.definition=function(value){
        if(!sessionStorage){
            return 'low'
        }
        if(value){
            sessionStorage.setItem('definition',value);
        }else{
            var d=sessionStorage.getItem('definition'),list=this.videoList,k;
            for(var i=0,len=list.length;i<len;i++){
                if(list[i].label==d){
                    return k=list[i].res
                }
            }
            if(!k){
                return 'high'
            }
        }
    };
    /**
     * [function 视频播放]
     * @return {[type]} [description]
     */
    Player.prototype.play = function() {
        var me = this,
            config = me.config,
            definition=me.definition(),
            video;
        video = me.createOriginalVideo(me.config);
        me.insertVideo(video);
        config.callback && config.callback(me.videoList);

    };
    /**
     * [function 加载视频]
     * @return {[type]} [description]
     */
    Player.prototype.start = function() {
        var me = this;
        me.getVideos(me.play);
    };
    return Player
}));
