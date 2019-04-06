
var isMotor = /automobile/i.test(navigator.userAgent);
var stayTimer = null;
var pageInfo = {};

var cloneDeep = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var sendMotorEnterEvent = function(params) {
    if(!isMotor || !params || !params.page_id) return;
    try {
        pageInfo = cloneDeep(params);
        stayTimer = new Date();
        console.log('page_enter', params);
        window.ToutiaoJSBridge.call('reportPageEnterEvent', params, function() {});    
    } catch(e) { console.log(e.message); }
}

var sendMotorStayEvent = function() {
    if(!isMotor) return;
    try {
        var params = cloneDeep(pageInfo);
        params.stay_time = new Date().getTime() - stayTimer.getTime();
        console.log('page_stay', params);
        window.ToutiaoJSBridge.call("stayPageEnterEvent", params, function() {});
    } catch(e) { console.log(e.message); }
}

var sendMotorCommEvent = function(event, params) {
    if(!isMotor) return;
    try {
        console.log(event, params);
        window.ToutiaoJSBridge.call("tracker", {
            event: event,
            data: params
        }, function(){});
    } catch(e) {}
}

var getMotorPageInfo = function() {
    var params = cloneDeep(pageInfo);
    params.url = window.location.href;
    if(/(iPhone|iPad|iPod)/i.test(navigator.userAgent)) {
        return JSON.stringify(params);
    } else if(navigator.userAgent.indexOf('Android') > 0) {
        try {
            window.ToutiaoJSBridge.call("onPageInfoResult", params, function() {});
        } catch(e) { console.log(e.message); }
    }
}

window.getPageInfo = getMotorPageInfo;

module.exports = {
    sendMotorEnterEvent,
    sendMotorStayEvent,
    sendMotorCommEvent
};