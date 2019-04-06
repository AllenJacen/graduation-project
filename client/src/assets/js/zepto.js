var $ = require('npm-zepto');

;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
      vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
      document = window.document, testEl = document.createElement('div'),
      supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
      transform,
      transitionProperty, transitionDuration, transitionTiming, transitionDelay,
      animationName, animationDuration, animationTiming, animationDelay,
      cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
      cssReset[transitionDuration = prefix + 'transition-duration'] =
          cssReset[transitionDelay    = prefix + 'transition-delay'] =
              cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
                  cssReset[animationName      = prefix + 'animation-name'] =
                      cssReset[animationDuration  = prefix + 'animation-duration'] =
                          cssReset[animationDelay     = prefix + 'animation-delay'] =
                              cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
            ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, (duration * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})($);

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var cache = [], timeout

  $.fn.remove = function(){
    return this.each(function(){
      if(this.parentNode){
        if(this.tagName === 'IMG'){
          cache.push(this)
          this.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
          if (timeout) clearTimeout(timeout)
          timeout = setTimeout(function(){ cache = [] }, 60000)
        }
        this.parentNode.removeChild(this)
      }
    })
  }
})($)


//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var document = window.document, docElem = document.documentElement,
      origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

  function anim(el, speed, opacity, scale, callback) {
    if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
    var props = { opacity: opacity }
    if (scale) {
      props.scale = scale
      el.css($.fx.cssPrefix + 'transform-origin', '0 0')
    }
    return el.animate(props, speed, null, callback)
  }

  function hide(el, speed, scale, callback) {
    return anim(el, speed, 0, scale, function(){
      origHide.call($(this))
      callback && callback.call(this)
    })
  }

  $.fn.show = function(speed, callback) {
    origShow.call(this)
    if (speed === undefined) speed = 0
    else this.css('opacity', 0)
    return anim(this, speed, 1, '1,1', callback)
  }

  $.fn.hide = function(speed, callback) {
    if (speed === undefined) return origHide.call(this)
    else return hide(this, speed, '0,0', callback)
  }

  $.fn.toggle = function(speed, callback) {
    if (speed === undefined || typeof speed == 'boolean')
      return origToggle.call(this, speed)
    else return this.each(function(){
      var el = $(this)
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
    })
  }

  $.fn.fadeTo = function(speed, opacity, callback) {
    return anim(this, speed, opacity, null, callback)
  }

  $.fn.fadeIn = function(speed, callback) {
    var target = this.css('opacity')
    if (target > 0) this.css('opacity', 0)
    else target = 1
    return origShow.call(this).fadeTo(speed, target, callback)
  }

  $.fn.fadeOut = function(speed, callback) {
    return hide(this, speed, null, callback)
  }

  $.fn.fadeToggle = function(speed, callback) {
    return this.each(function(){
      var el = $(this)
      el[
          (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
          ](speed, callback)
    })
  }

})($)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
  // Option flags:
  //   - once: Callbacks fired at most one time.
  //   - memory: Remember the most recent context and arguments
  //   - stopOnFalse: Cease iterating over callback list
  //   - unique: Permit adding at most one instance of the same callback
  $.Callbacks = function(options) {
    options = $.extend({}, options)

    var memory, // Last fire value (for non-forgettable lists)
        fired,  // Flag to know if list was already fired
        firing, // Flag to know if list is currently firing
        firingStart, // First callback to fire (used internally by add and fireWith)
        firingLength, // End of the loop when firing
        firingIndex, // Index of currently firing callback (modified by remove if needed)
        list = [], // Actual callback list
        stack = !options.once && [], // Stack of fire calls for repeatable lists
        fire = function(data) {
          memory = options.memory && data
          fired = true
          firingIndex = firingStart || 0
          firingStart = 0
          firingLength = list.length
          firing = true
          for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
            if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
              memory = false
              break
            }
          }
          firing = false
          if (list) {
            if (stack) stack.length && fire(stack.shift())
            else if (memory) list.length = 0
            else Callbacks.disable()
          }
        },

        Callbacks = {
          add: function() {
            if (list) {
              var start = list.length,
                  add = function(args) {
                    $.each(args, function(_, arg){
                      if (typeof arg === "function") {
                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                      }
                      else if (arg && arg.length && typeof arg !== 'string') add(arg)
                    })
                  }
              add(arguments)
              if (firing) firingLength = list.length
              else if (memory) {
                firingStart = start
                fire(memory)
              }
            }
            return this
          },
          remove: function() {
            if (list) {
              $.each(arguments, function(_, arg){
                var index
                while ((index = $.inArray(arg, list, index)) > -1) {
                  list.splice(index, 1)
                  // Handle firing indexes
                  if (firing) {
                    if (index <= firingLength) --firingLength
                    if (index <= firingIndex) --firingIndex
                  }
                }
              })
            }
            return this
          },
          has: function(fn) {
            return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
          },
          empty: function() {
            firingLength = list.length = 0
            return this
          },
          disable: function() {
            list = stack = memory = undefined
            return this
          },
          disabled: function() {
            return !list
          },
          lock: function() {
            stack = undefined;
            if (!memory) Callbacks.disable()
            return this
          },
          locked: function() {
            return !stack
          },
          fireWith: function(context, args) {
            if (list && (!fired || stack)) {
              args = args || []
              args = [context, args.slice ? args.slice() : args]
              if (firing) stack.push(args)
              else fire(args)
            }
            return this
          },
          fire: function() {
            return Callbacks.fireWith(this, arguments)
          },
          fired: function() {
            return !!fired
          }
        }

    return Callbacks
  }
})($);

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var zepto = $.zepto, oldQsa = zepto.qsa, oldMatches = zepto.matches

  function visible(elem){
    elem = $(elem)
    return !!(elem.width() || elem.height()) && elem.css("display") !== "none"
  }

  // Implements a subset from:
  // http://api.jquery.com/category/selectors/jquery-selector-extensions/
  //
  // Each filter function receives the current index, all nodes in the
  // considered set, and a value if there were parentheses. The value
  // of `this` is the node currently being considered. The function returns the
  // resulting node(s), null, or undefined.
  //
  // Complex selectors are not supported:
  //   li:has(label:contains("foo")) + li:has(label:contains("bar"))
  //   ul.inner:first > li
  var filters = $.expr[':'] = {
    visible:  function(){ if (visible(this)) return this },
    hidden:   function(){ if (!visible(this)) return this },
    selected: function(){ if (this.selected) return this },
    checked:  function(){ if (this.checked) return this },
    parent:   function(){ return this.parentNode },
    first:    function(idx){ if (idx === 0) return this },
    last:     function(idx, nodes){ if (idx === nodes.length - 1) return this },
    eq:       function(idx, _, value){ if (idx === value) return this },
    contains: function(idx, _, text){ if ($(this).text().indexOf(text) > -1) return this },
    has:      function(idx, _, sel){ if (zepto.qsa(this, sel).length) return this }
  }

  var filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
      childRe  = /^\s*>/,
      classTag = 'Zepto' + (+new Date())

  function process(sel, fn) {
    // quote the hash in `a[href^=#]` expression
    sel = sel.replace(/=#\]/g, '="#"]')
    var filter, arg, match = filterRe.exec(sel)
    if (match && match[2] in filters) {
      filter = filters[match[2]], arg = match[3]
      sel = match[1]
      if (arg) {
        var num = Number(arg)
        if (isNaN(num)) arg = arg.replace(/^["']|["']$/g, '')
        else arg = num
      }
    }
    return fn(sel, filter, arg)
  }

  zepto.qsa = function(node, selector) {
    return process(selector, function(sel, filter, arg){
      try {
        var taggedParent
        if (!sel && filter) sel = '*'
        else if (childRe.test(sel))
        // support "> *" child queries by tagging the parent node with a
        // unique class and prepending that classname onto the selector
          taggedParent = $(node).addClass(classTag), sel = '.'+classTag+' '+sel

        var nodes = oldQsa(node, sel)
      } catch(e) {
        console.error('error performing selector: %o', selector)
        throw e
      } finally {
        if (taggedParent) taggedParent.removeClass(classTag)
      }
      return !filter ? nodes :
          zepto.uniq($.map(nodes, function(n, i){ return filter.call(n, i, nodes, arg) }))
    })
  }

  zepto.matches = function(node, selector){
    return process(selector, function(sel, filter, arg){
      return (!sel || oldMatches(node, sel)) &&
          (!filter || filter.call(node, null, arg) === node)
    })
  }
})($)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
//
//     Some code (c) 2005, 2013 jQuery Foundation, Inc. and other contributors

;(function($){
  var slice = Array.prototype.slice

  function Deferred(func) {
    var tuples = [
          // action, add listener, listener list, final state
          [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
          [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
          [ "notify", "progress", $.Callbacks({memory:1}) ]
        ],
        state = "pending",
        promise = {
          state: function() {
            return state
          },
          always: function() {
            deferred.done(arguments).fail(arguments)
            return this
          },
          then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
            var fns = arguments
            return Deferred(function(defer){
              $.each(tuples, function(i, tuple){
                var fn = $.isFunction(fns[i]) && fns[i]
                deferred[tuple[1]](function(){
                  var returned = fn && fn.apply(this, arguments)
                  if (returned && $.isFunction(returned.promise)) {
                    returned.promise()
                        .done(defer.resolve)
                        .fail(defer.reject)
                        .progress(defer.notify)
                  } else {
                    var context = this === promise ? defer.promise() : this,
                        values = fn ? [returned] : arguments
                    defer[tuple[0] + "With"](context, values)
                  }
                })
              })
              fns = null
            }).promise()
          },

          promise: function(obj) {
            return obj != null ? $.extend( obj, promise ) : promise
          }
        },
        deferred = {}

    $.each(tuples, function(i, tuple){
      var list = tuple[2],
          stateString = tuple[3]

      promise[tuple[1]] = list.add

      if (stateString) {
        list.add(function(){
          state = stateString
        }, tuples[i^1][2].disable, tuples[2][2].lock)
      }

      deferred[tuple[0]] = function(){
        deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
        return this
      }
      deferred[tuple[0] + "With"] = list.fireWith
    })

    promise.promise(deferred)
    if (func) func.call(deferred, deferred)
    return deferred
  }

  $.when = function(sub) {
    var resolveValues = slice.call(arguments),
        len = resolveValues.length,
        i = 0,
        remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
        deferred = remain === 1 ? sub : Deferred(),
        progressValues, progressContexts, resolveContexts,
        errorCount = 0,
        updateFn = function(i, ctx, val){
          return function(value){
            ctx[i] = this
            val[i] = arguments.length > 1 ? slice.call(arguments) : value
            if (val === progressValues) {
              deferred.notifyWith(ctx, val)
            } else if (!(--remain)) {
              deferred.resolveWith(ctx, val)
            }
          }
        },
        updateRejectFn = function() {
          return function() {
            errorCount++;
            if(!(--remain)) {
              if(errorCount == len) {
                deferred.reject();
              }else {
                deferred.resolve();
              }
            }
          }
        }

    if (len > 1) {
      progressValues = new Array(len)
      progressContexts = new Array(len)
      resolveContexts = new Array(len)
      for ( ; i < len; ++i ) {
        if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
          resolveValues[i].promise()
              .done(updateFn(i, resolveContexts, resolveValues))
              // .fail(deferred.reject)
              .fail(updateRejectFn())
              .progress(updateFn(i, progressContexts, progressValues))
        } else {
          --remain
        }
      }
    }
    if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
    return deferred.promise()
  }

  $.Deferred = Deferred
})($);

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function($){
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
      exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
        store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
            $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
        $.isPlainObject(name) ?
            this.each(function(i, node){
              $.each(name, function(key, value){ setData(node, key, value) })
            }) :
          // get value from first element
            (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
        this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
        delete store[names ? camelize(this) : key]
      })
    })
  }

    // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
      var elements = this.find('*')
      if (methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})($);

(function($) {
  // Used by colorslider.js
  ['width', 'height'].forEach(function(dimension) {
    var offset, Dimension = dimension.replace(/./, function(m) { return m[0].toUpperCase() });
    $.fn['outer' + Dimension] = function(margin) {
      var elem = this;
      if (elem) {
        var size = elem[dimension]();
        var sides = {'width': ['left', 'right'], 'height': ['top', 'bottom']};
        sides[dimension].forEach(function(side) {
          if (margin) size += parseInt(elem.css('margin-' + side), 10);
        });
        return size;
      } else {
        return null;
      }
    };
  });
})($);

/**
 * add csrf support for neihan_wap by shellzhang
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function($) {
  var old = $.ajax;

  $.ajax = function(options) {
    options.data = options.data || {};
    options.data['csrfmiddlewaretoken'] = $.cookie('csrftoken');
    return old(options);
  }
})($);

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
      touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
      longTapDelay = 750,
      gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
    Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      if (touch.el) touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
        event.pointerType == event.MSPOINTER_TYPE_TOUCH)
        && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
    e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
        .bind('MSGestureEnd', function(e){
          var swipeDirectionFromVelocity =
              e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
          if (swipeDirectionFromVelocity) {
            if (touch.el) touch.el.trigger('swipe')
            if (touch.el) touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
          }
        })
        .on('touchstart MSPointerDown pointerdown', function(e){
          if((_isPointerType = isPointerEventType(e, 'down')) &&
              !isPrimaryTouch(e)) return
          firstTouch = _isPointerType ? e : e.touches[0]
          if (e.touches && e.touches.length === 1 && touch.x2) {
            // Clear out touch movement data if we have it sticking around
            // This can occur if touchcancel doesn't fire due to preventDefault, etc.
            touch.x2 = undefined
            touch.y2 = undefined
          }
          now = Date.now()
          delta = now - (touch.last || now)
          touch.el = $('tagName' in firstTouch.target ?
              firstTouch.target : firstTouch.target.parentNode)
          touchTimeout && clearTimeout(touchTimeout)
          touch.x1 = firstTouch.pageX
          touch.y1 = firstTouch.pageY
          if (delta > 0 && delta <= 250) touch.isDoubleTap = true
          touch.last = now
          longTapTimeout = setTimeout(longTap, longTapDelay)
          // adds the current touch contact for IE gesture recognition
          if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
        })
        .on('touchmove MSPointerMove pointermove', function(e){
          if((_isPointerType = isPointerEventType(e, 'move')) &&
              !isPrimaryTouch(e)) return
          firstTouch = _isPointerType ? e : e.touches[0]
          cancelLongTap()
          touch.x2 = firstTouch.pageX
          touch.y2 = firstTouch.pageY

          deltaX += Math.abs(touch.x1 - touch.x2)
          deltaY += Math.abs(touch.y1 - touch.y2)
        })
        .on('touchend MSPointerUp pointerup', function(e){
          if((_isPointerType = isPointerEventType(e, 'up')) &&
              !isPrimaryTouch(e)) return
          cancelLongTap()

          // swipe
          if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
              (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

            swipeTimeout = setTimeout(function() {
              if (touch.el) touch.el.trigger('swipe')
              if (touch.el) touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
              touch = {}
            }, 0)

          // normal tap
          else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
            if (deltaX < 30 && deltaY < 30) {
              // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
              // ('tap' fires before 'scroll')
              tapTimeout = setTimeout(function() {

                // trigger universal 'tap' with the option to cancelTouch()
                // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
                var event = $.Event('tap')
                event.cancelTouch = cancelAll
                if (touch.el) touch.el.trigger(event)

                // trigger double tap immediately
                if (touch.isDoubleTap) {
                  if (touch.el) touch.el.trigger('doubleTap')
                  touch = {}
                }

                // trigger single tap after 250ms of inactivity
                else {
                  touchTimeout = setTimeout(function(){
                    touchTimeout = null
                    if (touch.el) touch.el.trigger('singleTap')
                    touch = {}
                  }, 250)
                }
              }, 0)
            } else {
              touch = {}
            }
          deltaX = deltaY = 0

        })
        // when the browser window loses focus,
        // for example when a modal dialog is shown,
        // cancel all ongoing events
        .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})($);

;(function ($) {
  if(!$.getScript) {
    var defer = $.Deferred();
    $.getScript = function(src, func) {
      var script = document.createElement('script');
      script.async = "async";
      script.src = src;
      script.onload = function() {
        defer.resolve();
      };
      script.onerror = function() {
        defer.reject();
      };
      setTimeout(function() {
        document.getElementsByTagName("head")[0].appendChild( script );
      });
      return defer;
    }
  }
})($);

//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  $.fn.end = function(){
    return this.prevObject || $()
  }

  $.fn.andSelf = function(){
    return this.add(this.prevObject || $())
  }

  'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property){
    var fn = $.fn[property]
    $.fn[property] = function(){
      var ret = fn.apply(this, arguments)
      ret.prevObject = this
      return ret
    }
  })
})($)

//     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  function detect(ua, platform){
    var os = this.os = {}, browser = this.browser = {},
        webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
        android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
        osx = !!ua.match(/\(Macintosh\; Intel /),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
        iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        win = /Win\d{2}|Windows/.test(platform),
        wp = ua.match(/Windows Phone ([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        kindle = ua.match(/Kindle\/([\d.]+)/),
        silk = ua.match(/Silk\/([\d._]+)/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
        bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
        rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
        playbook = ua.match(/PlayBook/),
        chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
        firefox = ua.match(/Firefox\/([\d.]+)/),
        firefoxos = ua.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
        ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
        webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
        safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
    if (wp) os.wp = true, os.version = wp[1]
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]
    if (firefoxos) os.firefoxos = true, os.version = firefoxos[1]
    if (ie) browser.ie = true, browser.version = ie[1]
    if (safari && (osx || os.ios || win)) {
      browser.safari = true
      if (!os.ios) browser.version = safari[1]
    }
    if (webview) browser.webview = true
    os.version = parseFloat(os.version);

    browser.ucbrowser = ua.match(/ucbrowser/ig) ? true : false;
    browser.toutiao = document.referrer == 'http://nativeapp.toutiao.com'
        || /(News|NewsSocial|Explore|NewsArticle)( |\/)(\d.\d.\d)/i.test(ua);
    browser.toutiaoSDK = /(ArticleStreamSdk)( |\/)(\d+)/i.test(ua);
    browser.qqbrowser = ua.match(/qqbrowser/ig) ? true : false;


    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
    (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
    (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
    (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($, navigator.userAgent, navigator.platform)
  // make available to unit tests
  $.__detect = detect

})($);

/**
 * Enable special events on Zepto
 * @license Copyright 2013 Enideo. Released under dual MIT and GPL licenses.
 */

/// Place this code before defining the Special Events, but after Zepto

$.event.special = $.event.special || {};

var bindBeforeSpecialEvents = $.fn.bind;

$.fn.bind = function(eventName, data, callback){

  var el = this,
      $this = $(el),
      specialEvent;

  if( callback == null ){
    callback = data;
    data = null;
  }

  if( $.zepto ){

    $.each( eventName.split(/\s/), function(i, eventName){

      eventName = eventName.split(/\./)[0];

      if( (eventName in $.event.special) ){

        specialEvent = $.event.special[eventName];

        /// init enable special events on Zepto
        if( !specialEvent._init ) {
          specialEvent._init = true;

          /// intercept and replace the special event handler to add functionality
          specialEvent.originalHandler = specialEvent.handler;
          specialEvent.handler = function(){

            /// make event argument writeable, like on jQuery
            var args = Array.prototype.slice.call(arguments);
            args[0] = $.extend({},args[0]);

            /// define the event handle, $.event.dispatch is only for newer versions of jQuery
            $.event.handle = function(){

              /// make context of trigger the event element
              var args = Array.prototype.slice.call(arguments),
                  event = args[0],
                  $target = $(event.target);

              $target.trigger.apply( $target, arguments );

            }

            specialEvent.originalHandler.apply(this,args);

          }
        }

        /// setup special events on Zepto
        specialEvent.setup.apply( el, [data] );

      }


    });
  }

  return bindBeforeSpecialEvents.apply(this,[eventName,callback]);

};

/*** Timeago is a jQuery plugin that makes it easy to support automatically***/
(function($) {
  Date.prototype.format = function(fmt) {
    var o = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
      }
    }
    return fmt
  };
  var $t = {
    settings: {
      refreshMillis: 60000,
      relative : false,
      strings: {
        suffixAgo: "前",
        seconds: "刚刚",
        minute: "1分钟",
        minutes: "%d分钟",
        hour: "1小时",
        hours: "%d小时",
        days: "%d天",
        months: "%d月",
        years: "%d年",
        numbers: []
      },
      yearsAgoFormat:"yyyy-MM-dd",
      daysAgoFormat:"MM-dd hh:mm"
    },
    inWords: function(date){
      var relative = $t.settings.relative;
      if (!relative && yearsAgo(date)){
        return date.format(this.settings.yearsAgoFormat);
      }
      if (!relative && daysAgo(date)){
        return date.format(this.settings.daysAgoFormat);
      }
      var distanceMillis = distance(date);
      var $l = this.settings.strings;
      var suffix = $l.suffixAgo;
      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var months = days / 30;
      var years = days / 365;

      //console.log("秒:%d,分:%d,时:%d,天:%d,月:%d,年:%d",seconds, minutes, hours, days, months, years);
      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value)
      }
      function originDate(distanceMillis) {
        var d = new Date( + new Date() - distanceMillis);
        var M = d.getMonth() + 1,
            D = d.getDate(),
            H = d.getHours(),
            I = d.getMinutes();
        return (M < 10 ? "0" + M: M) + "-" + (D < 10 ? "0" + D: D) + " " + (H < 10 ? "0" + H: H) + ":" + (I < 10 ? "0" + I: I)
      };

      var words = '';

      if(seconds < 60){
        words = substitute($l.seconds, Math.floor(seconds))
      }else if(minutes < 60){
        words = substitute($l.minutes, Math.floor(minutes))
      }else if(hours < 24){
        words = substitute($l.hours, Math.floor(hours))
      }else if(days < 30){
        words = substitute($l.days, Math.floor(days))
      }else if(days < 365){
        words = substitute($l.months, Math.floor(months))
      }else{
        words = substitute($l.years, Math.floor(years))
      };

      if (words == "刚刚"){
        return words
      }
      return words+suffix
    },
    parse: function(iso8601){
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/, "");
      s = s.replace(/-/, "/").replace(/-/, "/");
      s = s.replace(/T/, " ").replace(/Z/, " UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
      return new Date(s)
    },
    datetime: function(elem) {
      var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601)
    },
    isTime: function(elem) {
      return $(elem).get(0).tagName.toLowerCase() === "time"
    }
  };
  function init(options){
    var $s = $.extend($t.settings, options);
    var refresh_el = $.proxy(refresh, this);
    refresh_el();
    if($s.refreshMillis > 0){
      setInterval(refresh_el, $s.refreshMillis)
    }
  };
  $.fn.timeago = function(options) {
    this.each(function() {
      init.call(this, options)
    });
    return this
  };
  function refresh(){
    var data = prepareData(this),
        date = data.datetime;
    if (!isNaN(date)) {
      $(this).text($t.inWords(date))
    }
    return this
  }
  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", {
        datetime: $t.datetime(element)
      });
    }
    return element.data("timeago")
  }
  function distance(date){
    return (new Date().getTime() - date.getTime())
  }
  function daysAgo(date) {
    var now = new Date();
    return (now.getMonth() > date.getMonth()) || (now.getDate() > date.getDate())
  }
  function yearsAgo(date) {
    return new Date().getFullYear() > date.getFullYear()
  }
})($);

/** jqModal - Minimalist Modaling with jQuery  (http://dev.iceburg.net/jquery/jqModal/) **/
(function($){$.fn.jqm=function(o){var p={overlay:50,overlayClass:"jqmOverlay",closeClass:"jqmClose",trigger:".jqModal",transparent:false,ajax:false,ajaxText:"",target:false,modal:false,toTop:false,onShow:false,onHide:false,onLoad:false};return this.each(function(){if(this._jqm){return H[this._jqm].option=$.extend({},H[this._jqm].option,o)}s++;this._jqm=s;H[s]={option:$.extend(p,$.jqm.params,o),opened:false,win:$(this).addClass("jqmID"+s),index:s};if(p.trigger){$(this).jqmAddTrigger(p.trigger)}})};$.fn.jqmAddClose=function(e){return hs(this,e,"jqmHide")};$.fn.jqmAddTrigger=function(e){return hs(this,e,"jqmShow")};$.fn.jqmShow=function(t){return this.each(function(){t=t||window.event;$.jqm.open(this._jqm,t)})};$.fn.jqmHide=function(t){return this.each(function(){t=t||window.event;$.jqm.close(this._jqm,t)})};$.jqm={hash:{},open:function(s,t){var h=H[s],c=h.option,cc="."+c.closeClass,z=(parseInt(h.win.css("z-index"))),z=(z>0)?z:3000,o=$('<div onTouchmove="return false;" onTouchend=""></div>');if(c.transparent){o.css({background:"none"})}if(h.opened){return false}h.t=t;h.opened=true;if($(".jqmOverlay").length){h.overlay=o=$(".jqmOverlay").show()}else{h.overlay=o.addClass("jqmOverlay").appendTo("body")}if(c.modal){if(!A[0]){L("bind")}A.push(s)}else{if(c.overlay>0){h.win.jqmAddClose(o)}else{o=false}}if(c.ajax){var r=c.target||h.win,u=c.ajax,r=(typeof r=="string")?$(r,h.win):$(r),u=(u.substr(0,1)=="@")?$(t).attr(u.substring(1)):u;r.html(c.ajaxText).load(u,function(){if(c.onLoad){c.onLoad.call(this,h)}if(cc){h.win.jqmAddClose($(cc,h.win))}e(h)})}else{if(cc){h.win.jqmAddClose($(cc,h.win))}}if(c.toTop&&h.overlay){h.win.before('<span id="jqmP'+h.win[0]._jqm+'"></span>').insertAfter(h.overlay)}(c.onShow)?c.onShow(h):h.win.show();e(h);return false},close:function(s){var h=H[s];if(!h.opened){return false}h.opened=false;if(A[0]){A.pop();if(!A[0]){L("unbind")}}if(h.option.toTop&&h.overlay){$("#jqmP"+h.win[0]._jqm).after(h.win).remove()}if(h.option.onHide){h.option.onHide(h)}else{h.win.css({"-webkit-transform":"scale(.7)","-moz-transform":"scale(.7)","opacity":0});setTimeout(function(){h.win.hide().css({"-webkit-transform":"scale(1)","-moz-transform":"scale(1)","opacity":1});h.overlay&&h.overlay.hide()},305)}return false},params:{}};var s=0,H=$.jqm.hash,A=[],ie6=(navigator.userAgent.match(/msie 6/i)),i=$('<iframe src="javascript:false;document.write(\'\');" class="jqm"></iframe>').css("opacity",0),e=function(h){if(ie6){if(h.overlay){h.overlay.html('<p style="width:100%;height:100%"/>').prepend(i)}else{if(!$("iframe.jqm",h.win)[0]){h.win.prepend(i)}}}f(h)},f=function(h){try{$(":input:visible",h.win)[0].focus()}catch(_){}},L=function(t){$()[t]("keypress",m)[t]("keydown",m)[t]("mousedown",m)},m=function(e){var h=H[A[A.length-1]],r=(!$(e.target).parents(".jqmID"+h.index)[0]);if(r){f(h)}return !r},hs=function(w,t,c){return w.each(function(){var s=this._jqm;$(t).each(function(){if(!this[c]){this[c]=[];$(this).click(function(){for(var i in {jqmShow:1,jqmHide:1}){for(var s in this[i]){if(H[this[i][s]]){H[this[i][s]].win[i](this)}}}return false})}this[c].push(s)})})}})($);


//jquery cookie plugin

$.cookie=function(name,value,options){if(typeof value!="undefined"){options=options||{};if(value===null){value="";options.expires=-1}var expires="";if(options.expires&&(typeof options.expires=="number"||options.expires.toUTCString)){var date;if(typeof options.expires=="number"){date=new Date();date.setTime(date.getTime()+(options.expires))}else{date=options.expires}expires="; expires="+date.toUTCString()}var path=options.path?"; path="+options.path:"";var domain=options.domain?"; domain="+options.domain:"";var secure=options.secure?"; secure":"";document.cookie=[name,"=",encodeURIComponent(value),expires,path,domain,secure].join("")}else{var cookieValue=null;if(document.cookie&&document.cookie!=""){var cookies=document.cookie.split(";");for(var i=0;i<cookies.length;i++){var cookie=$.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+"=")){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break}}}return cookieValue}};


//$.request; $.hash
/**
 * [request description]
 * @param  参数可以为空，此时返回请求参数Map本身
 *         参数可以为请求key，以便返回querystring中key对应的value
 * @return 根据参数不同，要返回不同的结果，object或者字符串
 */
$.request = function(paras) {
  if(!$.__tt_requestParams) {
    var url = location.search;
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {};
    for (var i = 0, len=paraString.length; i < len; i++) {
      var j = paraString[i];
      if(j) {
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
      }
    }
    $.__tt_requestParams = paraObj;
  }
  if(!paras) return $.__tt_requestParams;
  var returnValue = $.__tt_requestParams[paras.toLowerCase()];
  return returnValue ? $.trim(returnValue) : "";
};
$.hash = function() {
  var s = location.hash.substr(1),
      hashQuery = {};
  if (s) {
    var arr = s.split("&");
    for (var i = 0; i < arr.length; i++) {
      var t = arr[i].split("=");
      hashQuery[t[0]] = t[1]
    }
  }
  if (typeof arguments[0] == "string") {
    return hashQuery[arguments[0]]
  }
  if (typeof arguments[0] == "object") {
    for (var k in arguments[0]) {
      hashQuery[k] = arguments[0][k]
    }
    var s2 = "";
    for (var k in hashQuery) {
      s2 += k + "=" + hashQuery[k] + "&"
    }
    location.href = "#" + s2.substring(0, s2.length - 1)
  }
};
$.timestamp = function() {
  return +new Date()
};

$.sem = function(){
  var getParam = function (search, name) {
    var regex, results;
    regex = new RegExp("[\\?&]" + encodeURIComponent(name) + "=([^&#]*)");
    results = regex.exec(search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  var endsWith = function (string, suffix) {
    string = string || '';
    suffix = suffix || '';
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
  };

  var getSEMType = function() {
    var n,
        tt_sem_type = 'tt_sem_type',
        href = document.referrer;

    if($.request('debug')) {
      href = 'http://m.baidu.com/baidu.php?url=K60000jqVmuyEakZyAMwimW3ikMzy_aA7Q3PRiwXlb88su9bJtWAElng3Hcy2l_xfG713Dl726d5O4zCPC5uwy9hoNZGSq-By_jOSOawBQJqfg0uJB6VO8QwKzgadRzitLFYZ_0.DR_aA9R1PGI7CG6zYm2VYaM6uktEKA_nYQAHGlX5BC0.U1Yk0ZDqdVa4SoojzxMiqQgpztitEVpk_JR0IjLyYQMl8_5FSIQYVIoQkQzSdoAzGfKGUHYznWc0u1dLmvq8IM7bnfKdpHY0TA-b5HD0mv-b5H00UgfqnH0kPsKopHYs0ZFY5HTYnsK-pyfqnH0sPjDYg1bkg1DkPWKxPjDzg1RLn0KBpHYznjuxnW0snj7xnW0sPWn0UynqPWT4rHT3rHn0TgKGujYs0Z7Wpyfqn0KzuLw9u1Ys0AqvUjYkP1D1QHKxrjcLQHD0mycqn7ts0ANzu1Ys0ZKs5HDvP1mkrHbYn1f0UMus5H08nj0snj0snj00Ugws5H00uAwETjYs0ZFJ5H00uANv5gIGTvR0uMfqn6KspjYs0Aq15HD0mMTqPfK8IjY10ZPl5HD1nWKxnW0snfKYIgnqrj6Ynjc3rjn3n1cdnjn1PHT4PsKzug7Y5HDYPjnsP1mdnWRYnWc0Tv-b5HIhmHf4Pj-hP104PWuWnAm0mLPV5R77wWbsf1nswWNAfHD4wRc0mynqnfKBUjYs0APzm1YzrHcvP0&qid=7fa4949f70966c0f&sourceid=160&placeid=1&rank=1&shh=m.baidu.com&word=%E4%B8%AD%E5%9B%BD%E5%A5%BD%E5%A3%B0%E9%9F%B3%E7%AC%AC%E5%9B%9B%E5%AD%A3%E7%9B%B4%E6%92%AD';
    }
    if (href) {
      n = document.createElement("a");
      n.href = href;
      if(endsWith(n.hostname, 'sm.cn')) {
        return 'sm';
      }else { //default is baidu
        return 'baidu';
      }
    }
    if($.request(tt_sem_type)) {
      return $.request(tt_sem_type);
    }
    return null;
  };

  var getWd = function (document, wd) {
    var n,
        tt_sem_word = 'tt_sem_word',
        href = document.referrer,
        source = getSEMType();

    if($.request('debug')) {
      href = 'http://m.baidu.com/baidu.php?url=K60000jqVmuyEakZyAMwimW3ikMzy_aA7Q3PRiwXlb88su9bJtWAElng3Hcy2l_xfG713Dl726d5O4zCPC5uwy9hoNZGSq-By_jOSOawBQJqfg0uJB6VO8QwKzgadRzitLFYZ_0.DR_aA9R1PGI7CG6zYm2VYaM6uktEKA_nYQAHGlX5BC0.U1Yk0ZDqdVa4SoojzxMiqQgpztitEVpk_JR0IjLyYQMl8_5FSIQYVIoQkQzSdoAzGfKGUHYznWc0u1dLmvq8IM7bnfKdpHY0TA-b5HD0mv-b5H00UgfqnH0kPsKopHYs0ZFY5HTYnsK-pyfqnH0sPjDYg1bkg1DkPWKxPjDzg1RLn0KBpHYznjuxnW0snj7xnW0sPWn0UynqPWT4rHT3rHn0TgKGujYs0Z7Wpyfqn0KzuLw9u1Ys0AqvUjYkP1D1QHKxrjcLQHD0mycqn7ts0ANzu1Ys0ZKs5HDvP1mkrHbYn1f0UMus5H08nj0snj0snj00Ugws5H00uAwETjYs0ZFJ5H00uANv5gIGTvR0uMfqn6KspjYs0Aq15HD0mMTqPfK8IjY10ZPl5HD1nWKxnW0snfKYIgnqrj6Ynjc3rjn3n1cdnjn1PHT4PsKzug7Y5HDYPjnsP1mdnWRYnWc0Tv-b5HIhmHf4Pj-hP104PWuWnAm0mLPV5R77wWbsf1nswWNAfHD4wRc0mynqnfKBUjYs0APzm1YzrHcvP0&qid=7fa4949f70966c0f&sourceid=160&placeid=1&rank=1&shh=m.baidu.com&word=%E4%B8%AD%E5%9B%BD%E5%A5%BD%E5%A3%B0%E9%9F%B3%E7%AC%AC%E5%9B%9B%E5%AD%A3%E7%9B%B4%E6%92%AD';
    }
    if (href) {
      n = document.createElement("a");
      n.href = href;
      if(source == 'sm') {
        return getParam(n.search, 'q');
      }else { //default is baidu
        return getParam(n.search, wd) || getParam(n.search, "wd");
      }
    }
    if($.request(tt_sem_word)) {
      return $.request(tt_sem_word);
    }
    return null;
  };

  return {
    getWd: function() {
      return getWd(document, 'word');
    },
    getSource: function() {
      return getSEMType();
    }
  }
}();


/**
 * @description
 * 浏览器能力检测工具
 * api:
 *  $.support.vendor - <String>
 *  $.support.prefix - <Function>
 *  $.support.canRun2d - <Boolean> // 可以做2d的transform
 *  $.support.canRun3d - <Boolean>  // 可以做3d的transform
 *  $.support.canRunCanvas - <Boolean> // 可以用canvas2d
 *  $.support.canRunWebgl - <Boolean>  // 可以用webgl
 *  $.support.canUsePageVisibility - <Boolean> // 可以用page visibility api
 * @author zhouliang
 * @name
 * @module
 * @param {}
 * @returns {}
 }
 */
(function( $ ) {
  'use strict';

  var _el = document.createElement( 'div' );
  var _alternates = ['O', 'ms', 'Moz', 'Khtml', 'Webkit', 'webkit', ''];

  var vendor = function() {

    for ( var len = _alternates.length; len--; ) {

      var alter = _alternates[len];
      var attr  = alter ? alter + 'Transform' : 'transform';
      if ( attr in _el.style ) return alter;
    }
    return null;
  }();

  function canRun2d() {
    return vendor !== null ;
  }

  function canRun3d() {
    if ( !canRun2d() || !window.getComputedStyle ) return false;
    var _t = prefix( 'transform' );
    document.body.appendChild( _el );
    _el.style[ _t ] = 'translate3d(1px,1px,1px)';
    var matrix = window.getComputedStyle( _el )[ _t ] || '';
    document.body.removeChild( _el );
    return !!/^matrix3d\((.*)\)$/.exec( matrix );
  }

  function canRunCanvas() {

    var canvas;

    try {
      canvas = document.createElement( 'canvas' );
      canvas.getContext( '2d' );
      return true;
    }

    catch( e ) {

      return false;
    }
  }

  function canRunWebgl() {

    var canvas, ctx, exts;

    try {
      canvas = document.createElement( 'canvas' );
      ctx = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
      exts = ctx.getSupportedExtensions();
      return true;
    }

    catch( e ) {

      return false;
    }
  }

  function canUsePageVisibility() {

    return vendor !== null && document[ prefix( 'hidden' ) ] !== undefined;
  }

  function prefix( prop, forStyle ) {

    if ( vendor === null ) return;

    var _prefix_style = vendor ? ( '-' + vendor.toLowerCase() + '-' ) : '';
    var _prefix_attr  = vendor || '';

    if ( forStyle ) {
      // return like this '-webkit-transform'
      var underlined = prop.replace(/([A-Z])/g, function(match, pos) {
        return '-' + match.toLowerCase();
      });
      return _prefix_style + underlined;
    }
    else {
      // return camecased like 'webkitTransform'
      var upperCasedProp = vendor !== '' ? prop.charAt(0).toUpperCase() + prop.substr(1) : prop;
      var disUnderlined = upperCasedProp.replace(/(-[a-z])/g, function(match, pos) {
        return match.charAt(1).toUpperCase();
      });
      return _prefix_attr + disUnderlined;
    }
  }

  $.support = $.support || {};
  $.support.vendor = vendor;
  $.support.prefix = prefix;
  $.support.canRun2d = canRun2d;
  $.support.canRun3d = canRun3d;
  $.support.canRunCanvas = canRunCanvas;
  $.support.canRunWebgl = canRunWebgl;
  $.support.canUsePageVisibility = canUsePageVisibility;

})($);

/**
 * @description
 * $.pageVisible() === 'visible' 可见
 * $.pageVisible() === 'hidden'  不可见
 * $.pageVisible() === 'unknown' api不支持，无法检测
 * @author zhouliang03
 * @name
 * @module
 * @param None
 * @returns <Enumerable> 'visible' | 'hidden' | 'unknown'
 */

(function($) {

  $.pageVisible = function() {
    if ( $.support.canUsePageVisibility() ) return !document[ $.support.prefix( 'hidden' ) ] ? 'visible': 'hidden';
    else return 'unknown';
  };

})($);

module.exports = $;