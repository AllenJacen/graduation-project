import collectorEvent from 'Assets/js/tea';
import { cookie, request, cloneDeep, autoSessionStorage } from './simplify';

var collectEvent = window.collectEvent || collectorEvent;

var init = function ({ appId, serviceName, userWebId, zt }) {
    // 可选择开启debug模式。debug模式上报地址为测试服务器（只支持http。测试https需关闭debug模式，上报到线上地址）。
    collectEvent.setDebug(process.env.NODE_ENV == 'development' ? true : false);
    // 设置外网可上报
    collectEvent.setIntranetMode(false);
    // 设置一些必备的字段。sdk会延时等到这些字段都赋值完毕后，才发送收集的事件。
    // 其中（user_unique_id、app_id）为必须设置的字段，否则服务器会返回失败码。
    // 背景：因为一些字段是异步获取的，所以可能在发送事件之后才赋值。

    collectEvent.setRequiredKeys({
        user: ['user_unique_id', 'user_id'],
        header: ['app_id'],
    });

    // 设置appId。必须配置。
    collectEvent.setAppId(appId);

    // 设置header自定义字段
    collectEvent.setHeaderHeaders({
        user_agent: navigator.userAgent,
        service_name: serviceName,
        zt: zt || 'default'
    })

    // 设用户相关信息
    collectEvent.setUser({
        user_unique_id: userWebId,
        user_id: userWebId,
        user_type: 13
    });
};

var webid = cookie('tt_webid');
var zt = request('zt') || autoSessionStorage.getItem('tea_zt');
if(zt) {
    autoSessionStorage.setItem('tea_zt', zt);
}

init({
    appId: 1230,
    serviceName: 'm_station',
    userWebId: webid,
    zt: zt
});

var debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

var stayParams = {};
var stayTimer = null;
// 切换页面时先报stay，再上报进入页面的enter
var sendTeaEnterEvent = debounce(function(params) {
    if(!params.page_id) return;
    // pre_page_id必须, pre_sub_tab不必须
    params['pre_page_id'] = params['pre_page_id'] || '';
    if(autoSessionStorage.getItem('pre_page_id') && !params['pre_page_id']) {
        params['pre_page_id'] = autoSessionStorage.getItem('pre_page_id');
    }
    if(autoSessionStorage.getItem('pre_sub_tab') && !params['pre_sub_tab']) {
        params['pre_sub_tab'] = autoSessionStorage.getItem('pre_sub_tab');
    }
    // 记录当前页信息，其他事件使用
    autoSessionStorage.setItem('page_id', params.page_id || '');
    autoSessionStorage.setItem('sub_tab', params.sub_tab || '');

    if(process.env.NODE_ENV == 'development') {
        console.log('***web_page_enter***', params);
    }
    collectEvent('web_page_enter', params);
    // 记录当前页信息
    stayTimer = new Date();
    stayParams = cloneDeep(params);
}, 500, true);

// 同一个html内部切换用
var sendTeaStayEvent = debounce(function(params) {
    if(params) {
        stayParams = params;
    } else {
        stayParams.stay_time = stayTimer ? ( new Date().getTime() - stayTimer.getTime() ) : -1;
    }
    if(!stayParams.page_id) return;
    // 记录当前页信息，下页pre使用
    autoSessionStorage.setItem('pre_page_id', stayParams.page_id || '');
    autoSessionStorage.setItem('pre_sub_tab', stayParams.sub_tab || '');
    
    if(process.env.NODE_ENV == 'development') {
        console.log('***web_page_stay_time***', stayParams);
    }
    collectEvent('web_page_stay_time', stayParams);
}, 500, true);

var sendTeaCommEvent = function(event, params) {
    if(event === 'go_detail') {
        autoSessionStorage.setItem('detail_group_id', params.group_id || '');
        autoSessionStorage.setItem('detail_item_id', params.item_id || '');
        autoSessionStorage.setItem('detail_enter_from', params.enter_from || '');
    }
    if(process.env.NODE_ENV == 'development') {
        console.log('***'+event+'***', params);
    }
    collectEvent(event, params);
}

/* 
** 页面unload时，统计请求会被cancel
** 故离开页面保存stay params, 下一页面上报page stay 
*/
var hiddenProperty = 'hidden' in document ? 'hidden' :    
    'webkitHidden' in document ? 'webkitHidden' :    
    'mozHidden' in document ? 'mozHidden' :    
    null;
var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
var onVisibilityChange = function() {
    if(document[hiddenProperty]) {
        stayParams.stay_time = stayTimer ? ( new Date().getTime() - stayTimer.getTime() ) : -1;
        autoSessionStorage.setItem('pre_page_stay_params', JSON.stringify(stayParams));
    }
}
document.addEventListener(visibilityChangeEvent, onVisibilityChange);


module.exports = {
    sendTeaEnterEvent,
    sendTeaStayEvent,
    sendTeaCommEvent
};