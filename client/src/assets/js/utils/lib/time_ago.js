Date.prototype.format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

function yearsAgo (date) {
    return new Date().getFullYear() > date.getFullYear();
}

function daysAgo (date) {
    var now = new Date();
    return (now.getMonth() > date.getMonth()) || (now.getDate() > date.getDate());
}

function distance (date) {
    return (new Date().getTime() - date.getTime());
}

function DateDiff (sDate1, sDate2) {
    var aDate, oDate1, oDate2, iDays;
    aDate = sDate1.split('-');
    oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    aDate = sDate2.split('-');
    oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
    if ((oDate1 - oDate2) < 0) {
        return -iDays;
    }
    return iDays;
}

function getUTCOffset () {
    var BEIJINGTimeZoneOffset = -480;// minites *60*1000 get milseconds;
    var d = new Date();
    return BEIJINGTimeZoneOffset - d.getTimezoneOffset();
}

var timeZoneOffset = getUTCOffset() * 60 * 1000;

var $t = {
    settings: {
        refreshMillis: 60000,
        relative: true,
        strings: {
            suffixAgo: '前',
            seconds: '刚刚',
            minute: '1分钟',
            minutes: '%d分钟',
            hour: '1小时',
            hours: '%d小时',
            days: '%d天',
            months: '%d月',
            years: '%d年',
            tomorrow: '明 %d',
            afterTomorrow: '后 %d',
            numbers: []
        }
    },
    inWords: function (date) {
        var relative = $t.settings.relative;
        if (relative && yearsAgo(date)) {
            return date.format('yyyy-MM-dd');
        }
        if (relative && daysAgo(date)) {
            return date.format('MM-dd hh:mm');
        }
        var distanceMillis = distance(date);
        if (distanceMillis < 0) {
            var now = new Date(),
                diff = DateDiff(date.format('yyyy-MM-dd'), now.format('yyyy-MM-dd')),
                hm = date.format('hh:mm'),
                arr = ['今', '明', '后'],
                prefix = date.format('MM-dd') + ' ';
            if (diff == 0 || diff == 1 || diff == 2) {
                prefix = arr[diff];
            }
            return prefix + hm;
        }

        var $l = $t.settings.strings;
        var suffix = $l.suffixAgo;
        var seconds = Math.abs(distanceMillis) / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var months = days / 30;
        var years = days / 365;
        var words = '';

        function substitute (str, number) {
            var value = ($l.numbers && $l.numbers[number]) || number;
            return str.replace(/%d/i, value);
        }

        if (seconds < 60) {
            words = substitute($l.seconds, Math.floor(seconds));
        } else if (minutes < 60) {
            words = substitute($l.minutes, Math.floor(minutes));
        } else if (hours < 24) {
            words = substitute($l.hours, Math.floor(hours));
        } else if (days < 30) {
            words = substitute($l.days, Math.floor(days));
        } else if (days < 365) {
            words = substitute($l.months, Math.floor(months));
        } else {
            words = substitute($l.years, Math.floor(years));
        }

        if (words == '刚刚') {
            return words;
        }
        return words + suffix;
    },
    parse: function (iso8601) {

        var s = iso8601;
     /*   s = s.replace(/\.\d+/, '');
        s = s.replace(/-/, '/').replace(/-/, '/');
        s = s.replace(/T/, ' ').replace(/Z/, ' UTC');
        s = s.replace(/([+-]\d\d):?(\d\d)/, ' $1$2');*/
        var bj_time = new Date(s),
            local_time = bj_time.getTime() + timeZoneOffset;
        return new Date(local_time);
    }
};

function getISO8601 (time) {
    var iso8601 = $t.parse(time);
    return iso8601;
}

function refresh (time) {
    time = getISO8601(time);
    if (!isNaN(time)) {
        // eslint-disable-next-line
        return $t.inWords(time);
    }
}

export default function (time) {
    if (!time) {
        return '';
    }
    return refresh(time);
}