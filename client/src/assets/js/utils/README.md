### use

##### by hp

``` javascript
import {
      on,
      off,
      timeago,
      getGlobalValue,
      setGlobalValue,
      secToDate,
      stringify,
      ua
} from utils.js
```

### docs

1. on(element, event, callback);
2. off(element, event, callback);
3. timeago
 * 时间格式转换
4. getGlobalValue,
   setGlobalValue,
   * arguments (key, value) || ({key: value, key2: value2})
5. secToDate
  * 秒转换为时长
6. stringify(obj)
   * 组装为url.search
7. ua
   *判断user agent
