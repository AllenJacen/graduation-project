!function(e){"object"==typeof module&&module.hasOwnProperty("exports")&&"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):window[window.MarioJSSDKObject]=e()}(function(){function e(e,t,r,n){if("object"!=typeof r)throw"objValue 必须是个对象。";(n=void 0===n||n)?(e[t]||(e[t]={}),c(e[t],r)):e[t]=r}function t(e,t){if(!d(e)){if(void 0===t&&(t={}),"object"!=typeof t)throw"params的类型不正确！";e=[[e,t]]}var n,o=[];for(n=0;n<e.length;n++){var i=e[n][1]||{};c(i,j),o.push({event:e[n][0],params:i})}if(M)r(S.user,S.header,o);else for(n=0;n<o.length;n++)D.push(o[n])}function r(e,t,r){d(r)||(r=[r]);for(var n=0;n<r.length;n++)r[n].params=p.stringify(r[n].params);var o;t.headers&&(o=p.stringify(t.headers));var a={};c(a,t),a.headers=o;var s={user:e,header:a,events:r};1===S.verbose&&(s.verbose=1),S.caller&&(s.caller=S.caller),i(s)}function n(){var e=0;for(var t in O)if(O.hasOwnProperty(t)){var r=O[t];if(r.length>0)for(var n=0;n<r.length;n++){var o=r[n],i="eventCommonParams"===t?j:S[t];i&&(void 0!==i[o]&&""!==i[o]||e++)}}return 0===e}function o(){var e=l,t=w;return x?(e=g,t=b):(v||(e=m,t=y),h&&(e=e.replace(/^https:\/\//,"http://"),t=t.replace(/^https:\/\//,"http://"))),[e,t]}function i(e){a(o()[0],e)}function a(e,t,r){try{var n=new(XMLHttpRequest||window.ActiveXObject("Microsoft.XMLHTTP"));n.onreadystatechange=function(){4!==this.readyState||this.status>=200&&this.status<300?4===this.readyState&&"function"==typeof r&&r():(x&&console.log(this.status),s(t,r))},n.open("post",e),n.setRequestHeader("Content-Type","application/json"),n.send(p.stringify(t))}catch(e){if(s(t,r),x)throw e}}function s(e,t){var r=o()[1],n=u(e),i=new Image(1,1);i.onerror=function(){},i.onload=function(){"function"==typeof t&&t()},i.src=r+"?"+n}function f(){var e,t={},r={},n=navigator.userAgent.toLowerCase();return navigator.appVersion.match(/MSIE 6./i)?(t.type="IE",t.version=6,t):((e=n.match(/msie ([\d.]+)/))?r.ie=e[1]:(e=n.match(/firefox\/([\d.]+)/))?r.firefox=e[1]:(e=n.match(/chrome\/([\d.]+)/))?r.chrome=e[1]:(e=n.match(/opera.([\d.]+)/))?r.opera=e[1]:(e=n.match(/version\/([\d.]+).*safari/))&&(r.safari=e[1]),r.ie?(t.type="IE",t.version=r.ie):r.firefox?(t.type="Firefox",t.version=r.firefox):r.chrome?(t.type="Chrome",t.version=r.chrome):r.opera?(t.type="Opera",t.version=r.opera):r.safari&&(t.type="Safari",t.version=r.safari),t)}function u(e){var t="";for(var r in e)e.hasOwnProperty(r)&&(t+="&"+r+"="+p.stringify(e[r]));return t="&"===t[0]?t.slice(1):t}function c(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}function d(e){return"[object Array]"===Object.prototype.toString.call(e)}var p=window.JSON||function(){return{parse:function(e){return new Function("return ("+e+")")()},stringify:function(){function e(e){return/["\\\x00-\x1f]/.test(e)&&(e=e.replace(/["\\\x00-\x1f]/g,function(e){var t=o[e];return t||(t=e.charCodeAt(),"\\u00"+Math.floor(t/16).toString(16)+(t%16).toString(16))})),'"'+e+'"'}function t(e){var t,r,n,o=["["],i=e.length;for(r=0;r<i;r++)switch(typeof(n=e[r])){case"undefined":case"function":case"unknown":break;default:t&&o.push(","),o.push(p.stringify(n)),t=1}return o.push("]"),o.join("")}function r(e){return e<10?"0"+e:e}function n(e){return'"'+e.getFullYear()+"-"+r(e.getMonth()+1)+"-"+r(e.getTodayDate())+"T"+r(e.getHours())+":"+r(e.getMinutes())+":"+r(e.getSeconds())+'"'}var o={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};return function(r){switch(typeof r){case"undefined":return"undefined";case"number":return isFinite(r)?String(r):"null";case"string":return e(r);case"boolean":return String(r);default:if(null===r)return"null";if(r instanceof Array)return t(r);if(r instanceof Date)return n(r);var o,i,a=["{"],s=p.stringify;for(var f in r)if(Object.prototype.hasOwnProperty.call(r,f))switch(typeof(i=r[f])){case"undefined":case"unknown":case"function":break;default:o&&a.push(","),o=1,a.push(s(f)+":"+s(i))}return a.push("}"),a.join("")}}}()}}(),h=!1,v=!0,l="https://mcs.byted.org/v1/json",w="https://mcs.byted.org/v1/gif",m="https://mcs.snssdk.com/v1/json",y="https://mcs.snssdk.com/v1/gif",g="http://10.8.131.217:9908/v1/json",b="http://10.8.131.217:9908/v1/gif",S={user:{},header:{},events:[],verbose:0,caller:""},j={},O={user:["user_unique_id"],header:["app_id"],eventCommonParams:[],customHeaders:[]},M=!1,x=!1,D=[];if(t.send=t,t.setUser=function(t,r){e(S,"user",t,r)},t.setHeader=function(t,r){e(S,"header",t,r)},t.setAppId=function(e){S.header.app_id=e},t.setDebug=function(e){x=e=void 0!==e&&e,S.verbose=e?1:0},t.setCaller=function(e){S.caller=e},t.setRequiredKeys=function(e){c(O,e)},t.setEventCommonParams=function(e){c(j,e)},t.setHeaderHeaders=function(t,r){e(S.header,"headers",t,r)},t.setCustomHeader=function(t,r){S.header.headers=S.header.headers||{},e(S.header.headers,"custom",t,r)},t.disableHttps=function(e){h=!1!==e},t.setIntranetMode=function(e){v=e},window.MarioJSSDKObject=window.MarioJSSDKObject||"collectEvent",window[window.MarioJSSDKObject]){!function(){f();c(S.header,{})}(),O=window[window.MarioJSSDKObject].r||O,S.header.app_id=window[window.MarioJSSDKObject].id;var H=window[window.MarioJSSDKObject].ready;"function"==typeof H&&H(t);var C=window[window.MarioJSSDKObject].q;if(C)for(var J=0;J<C.length;J++)D.push({event:C[J][0],params:C[J][1]})}return function(){var e=null,t=function(){if(e&&clearTimeout(e),n()&&D.length>0){M=!0;for(var o=0;o<D.length;o++)c(D[o].params,j);r(S.user,S.header,D),D=[]}else e=setTimeout(t,100)};t()}(),t});