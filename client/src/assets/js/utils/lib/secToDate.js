export default function (second){
    if (!second) {
        return 0;
    }
    var time = '';
    if (second >= 60) {
        time += parseInt(second / 60) + ':';
        second %= 60;
    }
    if (second > 0) {
        time += second ;
    }
    return time;
}