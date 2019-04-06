/**
 * 应对之前全局变量keyword等在多处使用
 */
var _obj = {
};

export function getGlobalValue (key) {
    if (!key) {
        return;
    }
    return _obj[key];
}

export function setGlobalValue () {
    if (!arguments) {
        return;
    }
    if (Object.prototype.toString.call(arguments[0]) == '[object Object]') {
        for (var i in arguments[0]) {
            _obj[i] = arguments[0][i];
        }
        return;
    }
    _obj[arguments[0]] = arguments[1];
}