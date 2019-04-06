export default function (object) {
    if (!object) {
        return;
    }
    return Object.keys(object).reduce(function (acc, item) {
        var prefix = !acc ? '' : acc + '&';
        return prefix + encodeURIComponent(item) + '=' + encodeURIComponent(object[item]);
    }, '');
}

