export function formatCount(count) {
    if (typeof count !== 'number') {
        console.warn('you must input an number');
        return false;
    }

    if (count < 1e4) {
        return count;
    } else if (count >= 1e4 && count < 1e5) {
        return (count / 10000).toFixed(1) + '万';
    } else if (count >= 1e5 && count < 1e8) {
        return Math.floor(count / 10000) + '万';
    } else if (count >= 1e8 && count < 1e9) {
        return (count / 10000).toFixed(1) + '亿';
    } else {
        return Math.floor(count / 10000) + '亿';
    }
};

export function formatDuration(t) {
    if (typeof t !== 'number') {
        console.warn('you must input an number');
        return false;
    }
    let m = Math.floor(t / 60);
    let s = t % 60;
    if(m < 10) m = '0' + m;
    if(s < 10) s = '0' + s;
    return m + ':' + s;
}
