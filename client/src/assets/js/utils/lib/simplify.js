/*
 * simplify.js 提供方便的js函数，与业务无关
 */

var cookie = function (name, value, options) {
    if (typeof value !== 'undefined') {
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires === 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [
            name,
            '=',
            encodeURIComponent(value),
            expires,
            path,
            domain,
            secure,
        ].join('');
    } else {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

var support = {
    vendor: function () {
        var _alternates = ['O', 'ms', 'Moz', 'Khtml', 'Webkit', 'webkit', ''];
        var _el = document.createElement('div');
        for (var len = _alternates.length; len--;) {
            var alter = _alternates[len];
            var attr  = alter ? alter + 'Transform' : 'transform';
            if (attr in _el.style) { return alter; }
        }
        return null;
    },
    prefix: function (prop, forStyle) {
        if (support.vendor() === null) { return; }
        var _prefix_style = support.vendor() ? ('-' + support.vendor().toLowerCase() + '-') : '';
        var _prefix_attr  = support.vendor() || '';

        if (forStyle) {
            // return like this '-webkit-transform'
            var underlined = prop.replace(/([A-Z])/g, function (match, pos) {
                return '-' + match.toLowerCase();
            });
            return _prefix_style + underlined;
        } else {
            // return camecased like 'webkitTransform'
            var upperCasedProp = support.vendor() !== '' ? prop.charAt(0).toUpperCase() + prop.substr(1) : prop;
            var disUnderlined = upperCasedProp.replace(/(-[a-z])/g, function (match, pos) {
                return match.charAt(1).toUpperCase();
            });
            return _prefix_attr + disUnderlined;
        }
    },
    canRun2d: function () {
        return support.vendor() !== null;
    },
    canRun3d: function () {
        var _el = document.createElement('div');
        if (!support.canRun2d() || !window.getComputedStyle) { return false; }
        var _t = support.prefix('transform');
        document.body.appendChild(_el);
        _el.style[_t] = 'translate3d(1px,1px,1px)';
        var matrix = window.getComputedStyle(_el)[_t] || '';
        document.body.removeChild(_el);
        return !!/^matrix3d\((.*)\)$/.exec(matrix);
    },
    canRunCanvas: function () {
        var canvas;
        try {
            canvas = document.createElement('canvas');
            canvas.getContext('2d');
            return true;
        } catch (e) {
            return false;
        }
    },
    canRunWebgl: function () {
        var canvas, ctx, exts;
        try {
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            exts = ctx.getSupportedExtensions();
            return true;
        } catch (e) {
            return false;
        }
    },
    canUsePageVisibility: function () {
        return support.vendor() !== null && document[support.prefix('hidden')] !== undefined;
    },
};

var pageVisible = function () {
    if (support.canUsePageVisibility()) { return !document[support.prefix('hidden')] ? 'visible' : 'hidden'; } else { return 'unknown'; }
};

function localStorageEnabled () {
    var mod = 'test';
    try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
    } catch (e) {
        return false;
    }
}

var autoLocalStorage = (function () {
    function setItem (key, value) {
        if (!localStorageEnabled()) { return null; }
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // silent
        }
    }

    function getItem (key) {
        if (!localStorageEnabled()) { return null; }
        return localStorage.getItem(key);
    }

    function delItem(key) {
        if (!localStorageEnabled()) { return null; }
        return localStorage.removeItem(key);
    }

    return {
        setItem,
        getItem,
        delItem
    };
}());

function sessionStorageEnabled() {
    var mod = 'test';
    try {
        sessionStorage.setItem(mod, mod);
        sessionStorage.removeItem(mod);
        return true;
    } catch(e) {
        return false;
    }
}

var autoSessionStorage = (function () {
    function setItem (key, value) {
        if (!sessionStorageEnabled()) { return null; }
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            // silent
        }
    }

    function getItem (key) {
        if (!sessionStorageEnabled()) { return null; }
        return sessionStorage.getItem(key);
    }

    function delItem(key) {
        if (!sessionStorageEnabled()) { return null; }
        return sessionStorage.removeItem(key);
    }

    return {
        setItem,
        getItem,
        delItem
    };
}());

function getCookieForLocal (name) {
    for (var key in localStorage) {
        var split = key.split('___');
        if (split.length === 3 && split[0] === name) {
            var startTime = parseInt(split[1]);
            var expires = parseInt(split[2]);

            if (Date.now() - startTime < expires) {
                return localStorage[key];
            }
        }
    }
    return null;
}

function setCookieForLocal (name, value, expires) {
    for (var n in localStorage) {
        var split = n.split('__');
        if (split[0] === name) {
            localStorage.removeItem(n);
        }
    }
    localStorage[name + '___' + Date.now() + '___' + expires] = value;
}

function appendQuery (url, query) {
    if (!query) {
        return url;
    }
    var search;
    var a = document.createElement('a');
    a.href = url;
    if (a.search) {
        search = a.search + '&' + query;
    } else {
        search = '?' + query;
    }
    return a.protocol + '//' + a.host + a.pathname + search + a.hash;
}

// $.request; $.hash
/**
 * [request description]
 * @param  参数可以为空，此时返回请求参数Map本身
 *         参数可以为请求key，以便返回querystring中key对应的value
 * @return 根据参数不同，要返回不同的结果，object或者字符串
 */
function request (paras) {
    var url = location.search;
    var paraString = url.substring(1).split('&');
    var paraObj = {};
    for (var i = 0, len = paraString.length; i < len; i++) {
        var j = paraString[i];
        if (j) {
            paraObj[j.substring(0, j.indexOf('=')).toLowerCase()] = j.substring(j.indexOf('=') + 1, j.length);
        }
    }

    if (!paras) { return paraObj; }
    var returnValue = paraObj[paras.toLowerCase()];
    return returnValue ? returnValue.trim() : '';
}

function hash () {
    var s = location.hash.substr(1),
        hashQuery = {};

    if (s) {
        var arr = s.split('&');
        for (var i = 0; i < arr.length; i++) {
            var t = arr[i].split('=');
            hashQuery[t[0]] = t[1];
        }
    }

    if (typeof arguments[0] === 'string') {
        return hashQuery[arguments[0]];
    }

    if (typeof arguments[0] === 'object') {
        for (var k in arguments[0]) {
            hashQuery[k] = arguments[0][k];
        }

        var s2 = Object.keys(hashQuery).map(function (h) {
            return 'h=' + hashQuery[h];
        }).join('&');

        location.href = '#' + s2.substring(0, s2.length - 1);
    }
}

function getBrowserName () {
    var browserName = 'Other';
    var ua = window.navigator.userAgent;
    var browserRegExp = {
        Wechat: /micromessenger/,
        QQBrowser: /qqbrowser/,
        UC: /ubrowser|ucbrowser|ucweb/,
        Shoujibaidu: /baiduboxapp|baiduhd|bidubrowser|baidubrowser/,
        SamsungBrowser: /samsungbrowser/,
        MiuiBrowser: /miuibrowser/,
        Sogou: /sogoumobilebrowser|sogousearch/,
        Explorer2345: /2345explorer|2345chrome|mb2345browser/,
        Liebao: /lbbrowser/,
        Weibo: /__weibo__/,
        OPPO: /oppobrowser/,
        toutiao: /newsarticle/,
        MobileQQ: /mobile.*qq/,
        Firefox: /firefox/,
        Maxthon: /maxthon/,
        Se360: /360se/,
        Ee360: /360ee/,
        Safari: /(iphone|ipad).*version.*mobile.*safari/,
        Chrome: /chrome|crios/,
        AndroidBrowser: /android.*safari|android.*release.*browser/,
    };
    for (var i in browserRegExp) {
        if (browserRegExp[i].exec(ua.toLowerCase())) {
            browserName = i;
            break;
        }
    }

    return browserName;
}

function toQuery (obj) {
    return Object.keys(obj).map(function (k) {
        return [k, obj[k]].join('=');
    }).join('&');

}

function cloneDeep (object) {
    return JSON.parse(JSON.stringify(object));
}

function getImgUri(imgUrl) {
    let imgUrlArr = [];
    let imgUri = '';
    imgUrlArr = imgUrl.split('/');
    imgUri = imgUrlArr[imgUrlArr.length - 1];
    if (imgUri.indexOf('.') !== -1) {
        return imgUri.slice(0, imgUri.indexOf('.'));
    }
    return imgUri;
}

/**
 * 随机生成cdn地址拼接图片url
 * @params size {string} 图片尺寸，有多种情况，origin表示原图，large/WxH：尺寸可控大图，list/WxH：尺寸可控列表图，注意，不是所有WxH值都有效，具体详询图片服务
 */
function getImgCdnUrl(size, uri, extension = '') {
    let min = 0;
    let max = 7;
    let randomCdnNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return `//p${randomCdnNum}.pstatp.com/${size}/${uri}${extension}`;
}

module.exports = {
    cookie: cookie,
    support: support,
    pageVisible: pageVisible,
    localStorageEnabled: localStorageEnabled,
    sessionStorageEnabled: sessionStorageEnabled,
    autoSessionStorage: autoSessionStorage,
    autoLocalStorage: autoLocalStorage,
    getCookieForLocal: getCookieForLocal,
    setCookieForLocal: setCookieForLocal,
    appendQuery: appendQuery,
    request: request,
    hash: hash,
    getBrowserName: getBrowserName,
    toQuery: toQuery,
    cloneDeep,
    getImgUri,
    getImgCdnUrl
};
