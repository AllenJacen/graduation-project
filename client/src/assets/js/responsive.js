/**
 * responsive是一个H5页面终端适配方案，了解更多请访问wiki
 * https://wiki.bytedance.com/pages/viewpage.action?pageId=46958167
 * @param  {[Object]} win [window]
 * @param  {[Object]} res [responsive]
 */
import {
    simplify
} from 'Utils';
module.exports = (function (win, res) {
    var doc = win.document,
        docElem = doc.documentElement,
        metaElem = doc.querySelector('meta[name=\'viewport\']'),
        responsiveElem = doc.querySelector('meta[name=\'responsive\']'),
        wdpr = Math.floor(win.devicePixelRatio) || 1, // 解决浏览器各种奇葩dpr
        dprs = [1, 2, 3],
        dpr = 1,
        scale = 0,
        tid = 0;
    var isScalable = false;

    res.init = function (noScaling) {
        window.noScaling = noScaling;
        // 判断浏览器是否支持页面缩放
        res.isScalable = isScalable = (function () {
            if (noScaling) {
                return false;
            }
            var isIos = win.navigator.appVersion.match(/iphone/gi),
                isAndroid = win.navigator.appVersion.match(/android/gi),
                isChrome = !!win.chrome; // 判断是不是chrome浏览器，不包括webview
            var ua = win.navigator.userAgent,
                weixin = ua.match(/MicroMessenger\/([\d\.]+)/i);
            if (isIos) {
                var version = ua.match(/(iPhone\sOS)\s([\d_]+)/);
                return parseFloat(version[2]) < 7 ? false : true;
            } else if (isAndroid) {
                var kernelVersion = ua.match(/AppleWebKit\/([\d\.]+)/i),
                    UC = ua.match(/UCBrowser\/([\d\.]+)/i),
                    QQ = ua.match(/MQQBrowser\/([\d\.]+)/i),
                    chrome = ua.match(/Chrome\/([\d\.]+)/i),
                    MI = ua.match(/MiuiBrowser/i);
                if (kernelVersion && parseFloat(kernelVersion[1]) >= 537.36 && (MI || weixin && parseFloat(weixin[1]) >= 6.1)) {
                    return true;
                } else if (UC && parseFloat(UC[1]) >= 9.6) {
                    return true;
                } else if (chrome && parseFloat(chrome[1]) >= 30.0 && isChrome) {
                    return true;
                } else {
                    return false;
                }
                return false;
            } else {
                return false;
            }
        })();
        res.changeScale();
        var motorTheme = simplify.autoSessionStorage.getItem('motor_theme');
        if (!motorTheme && simplify.request('theme')) {
            simplify.autoSessionStorage.setItem('motor_theme', simplify.request('theme'));
        }
        if (simplify.autoSessionStorage.getItem('motor_theme') !== 'origin' && win.navigator.userAgent.match(/newsarticle/i)) {
            if (testCSSVariables()) {
                docElem.className = 'page-theme-tt-var';
                docElem.style.setProperty('--primay-color', '#F85959');
                docElem.style.setProperty('--secondary-color', '#F85959');
                docElem.style.setProperty('--thirdly-color', '#F85959');
                docElem.style.setProperty('--highlight-color', '#F85959');
            } else {
                docElem.className = 'page-theme-tt';
            }
        }

        if (win.navigator.userAgent.match(/automobile/i)) {
            if (testCSSVariables()) {
                docElem.className = 'page-theme-dcd-var';
                docElem.style.setProperty('--primay-color', '#FF9100');
                docElem.style.setProperty('--secondary-color', '#FFE100');
                docElem.style.setProperty('--thirdly-color', '#FFCB00');
                docElem.style.setProperty('--highlight-color', '#FF5F00');
            } else {
                docElem.className = 'page-theme-dcd';
            }
        }

        return this;
    };

    // 获取自定义dpr
    if (responsiveElem && isScalable) {
        content = responsiveElem.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = Math.floor(initialDpr[1]);
            }
        }
    }

    res.scaleLock = false;

    res.changeScale = function (d, scaleLock) {

        // scaleLock为true时禁止页面再次缩放,只更新baseFontSize
        if (!this.scaleLock) {

            if (!this.isScalable) {
                this.dpr = 1;
            } else {
                var d = Math.floor(d) || wdpr;
                this.dpr = dprs.indexOf(d) > -1 ? d : 3;
            }

            this.scale = 1 / this.dpr;

            if (metaElem) {
                metaElem.parentNode.removeChild(metaElem);
                metaElem = null;
            }
            createElement();
        }

        if (scaleLock) {
            this.scaleLock = scaleLock;
        }

        // 解决部分android机在initial-scale不为1时，出现横向滚动条的bug
        if (docElem.getBoundingClientRect().width > win.innerWidth) {
            var metaWidth = this.scale == 1 ? 'device-width' : win.innerWidth;
            metaElem.setAttribute('content', 'width=' + metaWidth + ',initial-scale=' + this.scale + ', maximum-scale=' + this.scale + ', minimum-scale=' + this.scale + ', user-scalable=no');
        }

        this.baseFontSize = docElem.getBoundingClientRect().width / 10;
        this.baseFontSize = Math.max(this.baseFontSize, 32);
        docElem.style.fontSize = this.baseFontSize + 'px';

        // 设置data-dpr便于css hack
        docElem.setAttribute('data-dpr', this.dpr);
    };

    doc.addEventListener('DOMContentLoaded', function (e) {
        doc.body.style.fontSize = 12 * dpr + 'px';
    }, false);

    win.addEventListener('orientationchange', function (e) {
        clearTimeout(tid);
        tid = setTimeout(res.changeScale.bind(res), 300);
    }, false);

    win.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            clearTimeout(tid);
            if (!window.noScaling) {
                tid = setTimeout(res.changeScale.bind(res), 300);
            }
        }
    }, false);

    // 辅助函数
    res.rem2px = function (v) {
        var val = parseFloat(v) * this.dpr * this.baseFontSize;
        if (typeof v === 'string' && v.match(/rem$/)) {
            val += 'px';
        }
        return val;
    };

    res.px2rem = function (v) {
        var val = parseFloat(v) * this.dpr / this.baseFontSize;
        if (typeof v === 'string' && v.match(/px$/)) {
            val += 'rem';
        }
        return val;
    };

    res.px2px = function (v) {
        var val = parseFloat(v) * this.dpr;
        if (typeof v === 'string' && v.match(/px$/)) {
            val += 'px';
        }
        return val;
    };
    function createElement () {
        if (!metaElem) {
            var width = res.scale == 1 ? 'width=device-width, ' : '';
            metaElem = doc.createElement('meta');
            metaElem.setAttribute('name', 'viewport');
            metaElem.setAttribute('content', width + 'initial-scale=' + res.scale + ', maximum-scale=' + res.scale + ', minimum-scale=' + res.scale + ', user-scalable=no');
            if (docElem.firstElementChild) {
                docElem.firstElementChild.appendChild(metaElem);
            } else {
                var wrap = doc.createElement('div');
                wrap.appendChild(metaElem);
                doc.write(wrap.innerHTML);
            }
        }
    }
    function testCSSVariables() {
        var color = 'rgb(255, 198, 0)';
        var el = document.createElement('span');

        el.style.setProperty('--color', color);
        el.style.setProperty('background', 'var(--color)');
        document.body.appendChild(el);

        var styles = getComputedStyle(el);
        var doesSupport = styles.backgroundColor === color;
        document.body.removeChild(el);
        return doesSupport;
    }
    return res;
})(window, window.responsive || (window.responsive = {dpr: 1}));
