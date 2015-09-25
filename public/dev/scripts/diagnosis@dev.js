
;(function(__context){
    var module = {
        id : "7022635b9ee0dac32976a1a5d854c9f8" , 
        filename : "avalon.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    /*==================================================
 Copyright (c) 2013-2015 司徒正美 and other contributors
 http://www.cnblogs.com/rubylouvre/
 https://github.com/RubyLouvre
 http://weibo.com/jslouvre/

 Released under the MIT license
 avalon.js 1.41 built in 2015.4.1
 support IE6+ and other browsers
 ==================================================*/
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get avalon.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var avalon = require("avalon")(window);
        module.exports = global.document ? factory(global, true) : function(w) {
            if (!w.document) {
                throw new Error("Avalon requires a window with a document")
            }
            return factory(w)
        }
    } else {
        factory(global)
    }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(window, noGlobal){

/*********************************************************************
 *                    全局变量及方法                                  *
 **********************************************************************/
var expose = new Date() - 0
//http://stackoverflow.com/questions/7290086/javascript-use-strict-and-nicks-find-global-function
var DOC = window.document
var head = DOC.getElementsByTagName("head")[0] //HEAD元素
var ifGroup = head.insertBefore(document.createElement("avalon"), head.firstChild) //避免IE6 base标签BUG
ifGroup.innerHTML = "X<style id='avalonStyle'>.avalonHide{ display: none!important }</style>"
ifGroup.setAttribute("ms-skip", "1")
ifGroup.className = "avalonHide"
var rnative = /\[native code\]/ //判定是否原生函数
function log() {
    if (window.console && avalon.config.debug) {
        // http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
        Function.apply.call(console.log, console, arguments)
    }
}


var subscribers = "$" + expose
var otherRequire = window.require
var otherDefine = window.define
var innerRequire
var stopRepeatAssign = false
var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
var rcomplexType = /^(?:object|array)$/
var rsvg = /^\[object SVG\w*Element\]$/
var rwindow = /^\[object (?:Window|DOMWindow|global)\]$/
var oproto = Object.prototype
var ohasOwn = oproto.hasOwnProperty
var serialize = oproto.toString
var ap = Array.prototype
var aslice = ap.slice
var Registry = {} //将函数曝光到此对象上，方便访问器收集依赖
var W3C = window.dispatchEvent
var root = DOC.documentElement
var hyperspace = DOC.createDocumentFragment()
var cinerator = DOC.createElement("div")
var class2type = {}
"Boolean Number String Function Array Date RegExp Object Error".replace(rword, function(name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
})


function noop() {
}


function oneObject(array, val) {
    if (typeof array === "string") {
        array = array.match(rword) || []
    }
    var result = {},
            value = val !== void 0 ? val : 1
    for (var i = 0, n = array.length; i < n; i++) {
        result[array[i]] = value
    }
    return result
}

//生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var generateID = function(prefix) {
    prefix = prefix || "avalon"
    return (prefix + Math.random() + Math.random()).replace(/0\./g, "")
}
function IE() {
    if (window.VBArray) {
        var mode = document.documentMode
        return mode ? mode : window.XMLHttpRequest ? 7 : 6
    } else {
        return 0
    }
}
var IEVersion = IE()

avalon = function(el) { //创建jQuery式的无new 实例化结构
    return new avalon.init(el)
}

/*视浏览器情况采用最快的异步回调*/
avalon.nextTick = new function() {// jshint ignore:line
    var tickImmediate = window.setImmediate
    var tickObserver = window.MutationObserver
    var tickPost = W3C && window.postMessage
    if (tickImmediate) {
        return tickImmediate.bind(window)
    }

    var queue = []
    function callback() {
        var n = queue.length
        for (var i = 0; i < n; i++) {
            queue[i]()
        }
        queue = queue.slice(n)
    }

    if (tickObserver) {
        var node = document.createTextNode("avalon")
        new tickObserver(callback).observe(node, {characterData: true})// jshint ignore:line
        return function(fn) {
            queue.push(fn)
            node.data = Math.random()
        }
    }

    if (tickPost) {
        window.addEventListener("message", function(e) {
            var source = e.source
            if ((source === window || source === null) && e.data === "process-tick") {
                e.stopPropagation()
                callback()
            }
        })

        return function(fn) {
            queue.push(fn)
            window.postMessage('process-tick', '*')
        }
    }

    return function(fn) {
        setTimeout(fn, 0)
    }
}// jshint ignore:line
/*********************************************************************
 *                 avalon的静态方法定义区                              *
 **********************************************************************/
avalon.init = function(el) {
    this[0] = this.element = el
}
avalon.fn = avalon.prototype = avalon.init.prototype

avalon.type = function(obj) { //取得目标的类型
    if (obj == null) {
        return String(obj)
    }
    // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
    return typeof obj === "object" || typeof obj === "function" ?
            class2type[serialize.call(obj)] || "object" :
            typeof obj
}

var isFunction = typeof alert === "object" ? function(fn) {
    try {
        return /^\s*\bfunction\b/.test(fn + "")
    } catch (e) {
        return false
    }
} : function(fn) {
    return serialize.call(fn) === "[object Function]"
}
avalon.isFunction = isFunction

avalon.isWindow = function(obj) {
    if (!obj)
        return false
    // 利用IE678 window == document为true,document == window竟然为false的神奇特性
    // 标准浏览器及IE9，IE10等使用 正则检测
    return obj == obj.document && obj.document != obj //jshint ignore:line
}

function isWindow(obj) {
    return rwindow.test(serialize.call(obj))
}
if (isWindow(window)) {
    avalon.isWindow = isWindow
}
var enu
for (enu in avalon({})) {
    break
}
var enumerateBUG = enu !== "0" //IE6下为true, 其他为false
/*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/
avalon.isPlainObject = function(obj, key) {
    if (!obj || avalon.type(obj) !== "object" || obj.nodeType || avalon.isWindow(obj)) {
        return false;
    }
    try { //IE内置对象没有constructor
        if (obj.constructor && !ohasOwn.call(obj, "constructor") && !ohasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
    } catch (e) { //IE8 9会在这里抛错
        return false;
    }
    if (enumerateBUG) {
        for (key in obj) {
            return ohasOwn.call(obj, key)
        }
    }
    for (key in obj) {
    }
    return key === void 0 || ohasOwn.call(obj, key)
}
if (rnative.test(Object.getPrototypeOf)) {
    avalon.isPlainObject = function(obj) {
        // 简单的 typeof obj === "object"检测，会致使用isPlainObject(window)在opera下通不过
        return serialize.call(obj) === "[object Object]" && Object.getPrototypeOf(obj) === oproto
    }
}
//与jQuery.extend方法，可用于浅拷贝，深拷贝
avalon.mix = avalon.fn.mix = function() {
    var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false

    // 如果第一个参数为布尔,判定是否深拷贝
    if (typeof target === "boolean") {
        deep = target
        target = arguments[1] || {}
        i++
    }

    //确保接受方为一个复杂的数据类型
    if (typeof target !== "object" && !isFunction(target)) {
        target = {}
    }

    //如果只有一个参数，那么新成员添加于mix所在的对象上
    if (i === length) {
        target = this
        i--
    }

    for (; i < length; i++) {
        //只处理非空参数
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name]
                try {
                    copy = options[name] //当options为VBS对象时报错
                } catch (e) {
                    continue
                }

                // 防止环引用
                if (target === copy) {
                    continue
                }
                if (deep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                    if (copyIsArray) {
                        copyIsArray = false
                        clone = src && Array.isArray(src) ? src : []

                    } else {
                        clone = src && avalon.isPlainObject(src) ? src : {}
                    }

                    target[name] = avalon.mix(deep, clone, copy)
                } else if (copy !== void 0) {
                    target[name] = copy
                }
            }
        }
    }
    return target
}

function _number(a, len) { //用于模拟slice, splice的效果
    a = Math.floor(a) || 0
    return a < 0 ? Math.max(len + a, 0) : Math.min(a, len);
}
avalon.mix({
    rword: rword,
    subscribers: subscribers,
    version: 1.41,
    ui: {},
    log: log,
    slice: W3C ? function(nodes, start, end) {
        return aslice.call(nodes, start, end)
    } : function(nodes, start, end) {
        var ret = []
        var len = nodes.length
        if (end === void 0)
            end = len
        if (typeof end === "number" && isFinite(end)) {
            start = _number(start, len)
            end = _number(end, len)
            for (var i = start; i < end; ++i) {
                ret[i - start] = nodes[i]
            }
        }
        return ret
    },
    noop: noop,
    /*如果不用Error对象封装一下，str在控制台下可能会乱码*/
    error: function(str, e) {
        throw  (e || Error)(str)
    },
    /*将一个以空格或逗号隔开的字符串或数组,转换成一个键值都为1的对象*/
    oneObject: oneObject,
    /* avalon.range(10)
     => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     avalon.range(1, 11)
     => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
     avalon.range(0, 30, 5)
     => [0, 5, 10, 15, 20, 25]
     avalon.range(0, -10, -1)
     => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
     avalon.range(0)
     => []*/
    range: function(start, end, step) { // 用于生成整数数组
        step || (step = 1)
        if (end == null) {
            end = start || 0
            start = 0
        }
        var index = -1,
                length = Math.max(0, Math.ceil((end - start) / step)),
                result = new Array(length)
        while (++index < length) {
            result[index] = start
            start += step
        }
        return result
    },
    eventHooks: {},
    /*绑定事件*/
    bind: function(el, type, fn, phase) {
        if(type=='keyup')
          dlog('avalon: 进入事件绑定'+type+', in '+(el.className||el))
        var hooks = avalon.eventHooks
        var hook = hooks[type]
        if (typeof hook === "object") {
            type = hook.type
            if (hook.deel) {
                 fn = hook.deel(el, type, fn, phase)
            }
        }
        var callback = W3C ? fn : function(e) {
          if(type=='keyup')dlog('avalon: 进入被加工的非w3c事件处理函数')
            fn.call(el, fixEvent(e));
        }
        if (W3C) {
            if(type=='keyup')dlog('avalon: addEventListener')
            el.addEventListener(type, callback, !!phase)
        } else {
          if(type=='keyup')dlog('avalon: attachEvent')
            el.attachEvent("on" + type, callback)
        }
        return callback
    },
    /*卸载事件*/
    unbind: function(el, type, fn, phase) {
        var hooks = avalon.eventHooks
        var hook = hooks[type]
        var callback = fn || noop
        if (typeof hook === "object") {
            type = hook.type
            if (hook.deel) {
                fn = hook.deel(el, type, fn, false)
            }
        }
        if (W3C) {
            el.removeEventListener(type, callback, !!phase)
        } else {
            el.detachEvent("on" + type, callback)
        }
    },
    /*读写删除元素节点的样式*/
    css: function(node, name, value) {
        if (node instanceof avalon) {
            node = node[0]
        }
        var prop = /[_-]/.test(name) ? camelize(name) : name, fn
        name = avalon.cssName(prop) || prop
        if (value === void 0 || typeof value === "boolean") { //获取样式
            fn = cssHooks[prop + ":get"] || cssHooks["@:get"]
            if (name === "background") {
                name = "backgroundColor"
            }
            var val = fn(node, name)
            return value === true ? parseFloat(val) || 0 : val
        } else if (value === "") { //请除样式
            node.style[name] = ""
        } else { //设置样式
            if (value == null || value !== value) {
                return
            }
            if (isFinite(value) && !avalon.cssNumber[prop]) {
                value += "px"
            }
            fn = cssHooks[prop + ":set"] || cssHooks["@:set"]
            fn(node, name, value)
        }
    },
    /*遍历数组与对象,回调的第一个参数为索引或键名,第二个或元素或键值*/
    each: function(obj, fn) {
        if (obj) { //排除null, undefined
            var i = 0
            if (isArrayLike(obj)) {
                for (var n = obj.length; i < n; i++) {
                    if (fn(i, obj[i]) === false)
                        break
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
                        break
                    }
                }
            }
        }
    },
    //收集元素的data-{{prefix}}-*属性，并转换为对象
    getWidgetData: function(elem, prefix) {
        var raw = avalon(elem).data()
        var result = {}
        for (var i in raw) {
            if (i.indexOf(prefix) === 0) {
                result[i.replace(prefix, "").replace(/\w/, function(a) {
                    return a.toLowerCase()
                })] = raw[i]
            }
        }
        return result
    },
    Array: {
        /*只有当前数组不存在此元素时只添加它*/
        ensure: function(target, item) {
            if (target.indexOf(item) === -1) {
                return target.push(item)
            }
        },
        /*移除数组中指定位置的元素，返回布尔表示成功与否*/
        removeAt: function(target, index) {
            return !!target.splice(index, 1).length
        },
        /*移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否*/
        remove: function(target, item) {
            var index = target.indexOf(item)
            if (~index)
                return avalon.Array.removeAt(target, index)
            return false
        }
    }
})

var bindingHandlers = avalon.bindingHandlers = {}
var bindingExecutors = avalon.bindingExecutors = {}

/*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
function isArrayLike(obj) {
    if (!obj)
        return false
    var n = obj.length
    if (n === (n >>> 0)) { //检测length属性是否为非负整数
        var type = serialize.call(obj).slice(8, -1)
        if (/(?:regexp|string|function|window|global)$/i.test(type))
            return false
        if (type === "Array")
            return true
        try {
            if ({}.propertyIsEnumerable.call(obj, "length") === false) { //如果是原生对象
                return  /^\s?function/.test(obj.item || obj.callee)
            }
            return true
        } catch (e) { //IE的NodeList直接抛错
            return !obj.window //IE6-8 window
        }
    }
    return false
}


// https://github.com/rsms/js-lru
var Cache = new function() {// jshint ignore:line
    function LRU(maxLength) {
        this.size = 0
        this.limit = maxLength
        this.head = this.tail = void 0
        this._keymap = {}
    }

    var p = LRU.prototype

    p.put = function(key, value) {
        var entry = {
            key: key,
            value: value
        }
        this._keymap[key] = entry
        if (this.tail) {
            this.tail.newer = entry
            entry.older = this.tail
        } else {
            this.head = entry
        }
        this.tail = entry
        if (this.size === this.limit) {
            this.shift()
        } else {
            this.size++
        }
        return value
    }

    p.shift = function() {
        var entry = this.head
        if (entry) {
            this.head = this.head.newer
            this.head.older =
                    entry.newer =
                    entry.older =
                    this._keymap[entry.key] = void 0
        }
    }
    p.get = function(key) {
        var entry = this._keymap[key]
        if (entry === void 0)
            return
        if (entry === this.tail) {
            return  entry.value
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (entry.newer) {
            if (entry === this.head) {
                this.head = entry.newer
            }
            entry.newer.older = entry.older // C <-- E.
        }
        if (entry.older) {
            entry.older.newer = entry.newer // C. --> E
        }
        entry.newer = void 0 // D --x
        entry.older = this.tail // D. --> E
        if (this.tail) {
            this.tail.newer = entry // E. <-- D
        }
        this.tail = entry
        return entry.value
    }
    return LRU
}// jshint ignore:line

/*********************************************************************
 *                         javascript 底层补丁                       *
 **********************************************************************/
if (!"司徒正美".trim) {
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
    String.prototype.trim = function () {
        return this.replace(rtrim, "")
    }
}
var hasDontEnumBug = !({
    'toString': null
}).propertyIsEnumerable('toString'),
        hasProtoEnumBug = (function () {
        }).propertyIsEnumerable('prototype'),
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;
if (!Object.keys) {
    Object.keys = function (object) { //ecma262v5 15.2.3.14
        var theKeys = [];
        var skipProto = hasProtoEnumBug && typeof object === "function"
        if (typeof object === "string" || (object && object.callee)) {
            for (var i = 0; i < object.length; ++i) {
                theKeys.push(String(i))
            }
        } else {
            for (var name in object) {
                if (!(skipProto && name === "prototype") && ohasOwn.call(object, name)) {
                    theKeys.push(String(name))
                }
            }
        }

        if (hasDontEnumBug) {
            var ctor = object.constructor,
                    skipConstructor = ctor && ctor.prototype === object;
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j]
                if (!(skipConstructor && dontEnum === "constructor") && ohasOwn.call(object, dontEnum)) {
                    theKeys.push(dontEnum)
                }
            }
        }
        return theKeys
    }
}
if (!Array.isArray) {
    Array.isArray = function (a) {
        return serialize.call(a) === "[object Array]"
    }
}

if (!noop.bind) {
    Function.prototype.bind = function (scope) {
        if (arguments.length < 2 && scope === void 0)
            return this
        var fn = this,
                argv = arguments
        return function () {
            var args = [],
                    i
            for (i = 1; i < argv.length; i++)
                args.push(argv[i])
            for (i = 0; i < arguments.length; i++)
                args.push(arguments[i])
            return fn.apply(scope, args)
        }
    }
}

function iterator(vars, body, ret) {
    var fun = 'for(var ' + vars + 'i=0,n = this.length; i < n; i++){' + body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))') + '}' + ret
    /* jshint ignore:start */
    return Function("fn,scope", fun)
    /* jshint ignore:end */
}
if (!rnative.test([].map)) {
    avalon.mix(ap, {
        //定位操作，返回数组中第一个等于给定参数的元素的索引值。
        indexOf: function (item, index) {
            var n = this.length,
                    i = ~~index
            if (i < 0)
                i += n
            for (; i < n; i++)
                if (this[i] === item)
                    return i
            return -1
        },
        //定位操作，同上，不过是从后遍历。
        lastIndexOf: function (item, index) {
            var n = this.length,
                    i = index == null ? n - 1 : index
            if (i < 0)
                i = Math.max(0, n + i)
            for (; i >= 0; i--)
                if (this[i] === item)
                    return i
            return -1
        },
        //迭代操作，将数组的元素挨个儿传入一个函数中执行。Prototype.js的对应名字为each。
        forEach: iterator("", '_', ""),
        //迭代类 在数组中的每个项上运行一个函数，如果此函数的值为真，则此元素作为新数组的元素收集起来，并返回新数组
        filter: iterator('r=[],j=0,', 'if(_)r[j++]=this[i]', 'return r'),
        //收集操作，将数组的元素挨个儿传入一个函数中执行，然后把它们的返回值组成一个新数组返回。Prototype.js的对应名字为collect。
        map: iterator('r=[],', 'r[i]=_', 'return r'),
        //只要数组中有一个元素满足条件（放进给定函数返回true），那么它就返回true。Prototype.js的对应名字为any。
        some: iterator("", 'if(_)return true', 'return false'),
        //只有数组中的元素都满足条件（放进给定函数返回true），它才返回true。Prototype.js的对应名字为all。
        every: iterator("", 'if(!_)return false', 'return true')
    })
}
/*********************************************************************
 *                           DOM 底层补丁                             *
 **********************************************************************/

function fixContains(root, el) {
    try { //IE6-8,游离于DOM树外的文本节点，访问parentNode有时会抛错
        while ((el = el.parentNode))
            if (el === root)
                return true;
        return false
    } catch (e) {
        return false
    }
}
avalon.contains = fixContains
//safari5+是把contains方法放在Element.prototype上而不是Node.prototype
if (!root.contains) {
    Node.prototype.contains = function (arg) {
        return !!(this.compareDocumentPosition(arg) & 16)
    }
}
//IE6-11的文档对象没有contains
if (!DOC.contains) {
    DOC.contains = function (b) {
        return fixContains(DOC, b)
    }
}

function outerHTML() {
    return new XMLSerializer().serializeToString(this)
}


if (window.SVGElement) {
    var svgns = "http://www.w3.org/2000/svg"
    var svg = DOC.createElementNS(svgns, "svg")
    svg.innerHTML = '<circle cx="50" cy="50" r="40" fill="red" />'
    if (!rsvg.test(svg.firstChild)) { // #409
        function enumerateNode(node, targetNode) {// jshint ignore:line
            if (node && node.childNodes) {
                var nodes = node.childNodes
                for (var i = 0, el; el = nodes[i++]; ) {
                    if (el.tagName) {
                        var svg = DOC.createElementNS(svgns,
                                el.tagName.toLowerCase())
                        ap.forEach.call(el.attributes, function (attr) {
                            svg.setAttribute(attr.name, attr.value) //复制属性
                        })// jshint ignore:line
                        // 递归处理子节点
                        enumerateNode(el, svg)
                        targetNode.appendChild(svg)
                    }
                }
            }
        }
        Object.defineProperties(SVGElement.prototype, {
            "outerHTML": {//IE9-11,firefox不支持SVG元素的innerHTML,outerHTML属性
                enumerable: true,
                configurable: true,
                get: outerHTML,
                set: function (html) {
                    var tagName = this.tagName.toLowerCase(),
                            par = this.parentNode,
                            frag = avalon.parseHTML(html)
                    // 操作的svg，直接插入
                    if (tagName === "svg") {
                        par.insertBefore(frag, this)
                        // svg节点的子节点类似
                    } else {
                        var newFrag = DOC.createDocumentFragment()
                        enumerateNode(frag, newFrag)
                        par.insertBefore(newFrag, this)
                    }
                    par.removeChild(this)
                }
            },
            "innerHTML": {
                enumerable: true,
                configurable: true,
                get: function () {
                    var s = this.outerHTML
                    var ropen = new RegExp("<" + this.nodeName + '\\b(?:(["\'])[^"]*?(\\1)|[^>])*>', "i")
                    var rclose = new RegExp("<\/" + this.nodeName + ">$", "i")
                    return s.replace(ropen, "").replace(rclose, "")
                },
                set: function (html) {
                    if (avalon.clearHTML) {
                        avalon.clearHTML(this)
                        var frag = avalon.parseHTML(html)
                        enumerateNode(frag, this)
                    }
                }
            }
        })
    }
}
if (!root.outerHTML && window.HTMLElement) { //firefox 到11时才有outerHTML
    HTMLElement.prototype.__defineGetter__("outerHTML", outerHTML);
}

//============================= event binding =======================
var rmouseEvent = /^(?:mouse|contextmenu|drag)|click/
function fixEvent(event) {
    var ret = {}
    for (var i in event) {
        ret[i] = event[i]
    }
    var target = ret.target = event.srcElement
    if (event.type.indexOf("key") === 0) {
        ret.which = event.charCode != null ? event.charCode : event.keyCode
    } else if (rmouseEvent.test(event.type)) {
        var doc = target.ownerDocument || DOC
        var box = doc.compatMode === "BackCompat" ? doc.body : doc.documentElement
        ret.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0)
        ret.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0)
        ret.wheelDeltaY = ret.wheelDelta
        ret.wheelDeltaX = 0
    }
    ret.timeStamp = new Date() - 0
    ret.originalEvent = event
    ret.preventDefault = function () { //阻止默认行为
        event.returnValue = false
    }
    ret.stopPropagation = function () { //阻止事件在DOM树中的传播
        event.cancelBubble = true
    }
    return ret
}

var eventHooks = avalon.eventHooks
//针对firefox, chrome修正mouseenter, mouseleave
if (!("onmouseenter" in root)) {
    avalon.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function (origType, fixType) {
        eventHooks[origType] = {
            type: fixType,
            deel: function (elem, _, fn) {
                return function (e) {
                    var t = e.relatedTarget
                    if (!t || (t !== elem && !(elem.compareDocumentPosition(t) & 16))) {
                        delete e.type
                        e.type = origType
                        return fn.call(elem, e)
                    }
                }
            }
        }
    })
}
//针对IE9+, w3c修正animationend
avalon.each({
    AnimationEvent: "animationend",
    WebKitAnimationEvent: "webkitAnimationEnd"
}, function (construct, fixType) {
    if (window[construct] && !eventHooks.animationend) {
        eventHooks.animationend = {
            type: fixType
        }
    }
})
//针对IE6-8修正input
if (!("oninput" in DOC.createElement("input"))) {
    eventHooks.input = {
        type: "propertychange",
        deel: function (elem, _, fn) {
            return function (e) {
                if (e.propertyName === "value") {
                    e.type = "input"
                    return fn.call(elem, e)
                }
            }
        }
    }
}
if (DOC.onmousewheel === void 0) {
    /* IE6-11 chrome mousewheel wheelDetla 下 -120 上 120
     firefox DOMMouseScroll detail 下3 上-3
     firefox wheel detlaY 下3 上-3
     IE9-11 wheel deltaY 下40 上-40
     chrome wheel deltaY 下100 上-100 */
    var fixWheelType = DOC.onwheel !== void 0 ? "wheel" : "DOMMouseScroll"
    var fixWheelDelta = fixWheelType === "wheel" ? "deltaY" : "detail"
    eventHooks.mousewheel = {
        type: fixWheelType,
        deel: function (elem, _, fn) {
            return function (e) {
                e.wheelDeltaY = e.wheelDelta = e[fixWheelDelta] > 0 ? -120 : 120
                e.wheelDeltaX = 0
                if (Object.defineProperty) {
                    Object.defineProperty(e, "type", {
                        value: "mousewheel"
                    })
                }
                fn.call(elem, e)
            }
        }
    }
}


/*********************************************************************
 *                           配置系统                                 *
 **********************************************************************/

function kernel(settings) {
    for (var p in settings) {
        if (!ohasOwn.call(settings, p))
            continue
        var val = settings[p]
        if (typeof kernel.plugins[p] === "function") {
            kernel.plugins[p](val)
        } else if (typeof kernel[p] === "object") {
            avalon.mix(kernel[p], val)
        } else {
            kernel[p] = val
        }
    }
    return this
}
var openTag, closeTag, rexpr, rexprg, rbind, rregexp = /[-.*+?^${}()|[\]\/\\]/g

function escapeRegExp(target) {
    //http://stevenlevithan.com/regex/xregexp/
    //将字符串安全格式化为正则表达式的源码
    return (target + "").replace(rregexp, "\\$&")
}

var plugins = {
    loader: function (builtin) {
        var flag = innerRequire && builtin
        window.require = flag ? innerRequire : otherRequire
        window.define = flag ? innerRequire.define : otherDefine
    },
    interpolate: function (array) {
        openTag = array[0]
        closeTag = array[1]
        if (openTag === closeTag) {
            throw new SyntaxError("openTag!==closeTag")
        } else if (array + "" === "<!--,-->") {
            kernel.commentInterpolate = true
        } else {
            var test = openTag + "test" + closeTag
            cinerator.innerHTML = test
            if (cinerator.innerHTML !== test && cinerator.innerHTML.indexOf("&lt;") > -1) {
                throw new SyntaxError("此定界符不合法")
            }
            cinerator.innerHTML = ""
        }
        var o = escapeRegExp(openTag),
                c = escapeRegExp(closeTag)
        rexpr = new RegExp(o + "(.*?)" + c)
        rexprg = new RegExp(o + "(.*?)" + c, "g")
        rbind = new RegExp(o + ".*?" + c + "|\\sms-")
    }
}

kernel.debug = true
kernel.plugins = plugins
kernel.plugins['interpolate'](["{{", "}}"])
kernel.paths = {}
kernel.shim = {}
kernel.maxRepeatSize = 100
avalon.config = kernel
var ravalon = /(\w+)\[(avalonctrl)="(\S+)"\]/
var findNodes = DOC.querySelectorAll ? function(str) {
    return DOC.querySelectorAll(str)
} : function(str) {
    var match = str.match(ravalon)
    var all = DOC.getElementsByTagName(match[1])
    var nodes = []
    for (var i = 0, el; el = all[i++]; ) {
        if (el.getAttribute(match[2]) === match[3]) {
            nodes.push(el)
        }
    }
    return nodes
}
/*********************************************************************
 *                            事件总线                               *
 **********************************************************************/
var EventBus = {
    $watch: function (type, callback) {
        if (typeof callback === "function") {
            var callbacks = this.$events[type]
            if (callbacks) {
                callbacks.push(callback)
            } else {
                this.$events[type] = [callback]
            }
        } else { //重新开始监听此VM的第一重简单属性的变动
            this.$events = this.$watch.backup
        }
        return this
    },
    $unwatch: function (type, callback) {
        var n = arguments.length
        if (n === 0) { //让此VM的所有$watch回调无效化
            this.$watch.backup = this.$events
            this.$events = {}
        } else if (n === 1) {
            this.$events[type] = []
        } else {
            var callbacks = this.$events[type] || []
            var i = callbacks.length
            while (~--i < 0) {
                if (callbacks[i] === callback) {
                    return callbacks.splice(i, 1)
                }
            }
        }
        return this
    },
    $fire: function (type) {
        var special, i, v, callback
        if (/^(\w+)!(\S+)$/.test(type)) {
            special = RegExp.$1
            type = RegExp.$2
        }
        var events = this.$events
        if (!events)
            return
        var args = aslice.call(arguments, 1)
        var detail = [type].concat(args)
        if (special === "all") {
            for (i in avalon.vmodels) {
                v = avalon.vmodels[i]
                if (v !== this) {
                    v.$fire.apply(v, detail)
                }
            }
        } else if (special === "up" || special === "down") {
            var elements = events.expr ? findNodes(events.expr) : []
            if (elements.length === 0)
                return
            for (i in avalon.vmodels) {
                v = avalon.vmodels[i]
                if (v !== this) {
                    if (v.$events.expr) {
                        var eventNodes = findNodes(v.$events.expr)
                        if (eventNodes.length === 0) {
                            continue
                        }
                        //循环两个vmodel中的节点，查找匹配（向上匹配或者向下匹配）的节点并设置标识
                        /* jshint ignore:start */
                        Array.prototype.forEach.call(eventNodes, function (node) {
                            Array.prototype.forEach.call(elements, function (element) {
                                var ok = special === "down" ? element.contains(node) : //向下捕获
                                        node.contains(element) //向上冒泡
                                if (ok) {
                                    node._avalon = v //符合条件的加一个标识
                                }
                            });
                        })
                        /* jshint ignore:end */
                    }
                }
            }
            var nodes = DOC.getElementsByTagName("*") //实现节点排序
            var alls = []
            Array.prototype.forEach.call(nodes, function (el) {
                if (el._avalon) {
                    alls.push(el._avalon)
                    el._avalon = ""
                    el.removeAttribute("_avalon")
                }
            })
            if (special === "up") {
                alls.reverse()
            }
            for (i = 0; callback = alls[i++]; ) {
                if (callback.$fire.apply(callback, detail) === false) {
                    break
                }
            }
        } else {
            var callbacks = events[type] || []
            var all = events.$all || []
            for (i = 0; callback = callbacks[i++]; ) {
                if (isFunction(callback))
                    callback.apply(this, args)
            }
            for (i = 0; callback = all[i++]; ) {
                if (isFunction(callback))
                    callback.apply(this, arguments)
            }
        }
    }
}

/*********************************************************************
 *                           modelFactory                             *
 **********************************************************************/
//avalon最核心的方法的两个方法之一（另一个是avalon.scan），返回一个ViewModel(VM)
var VMODELS = avalon.vmodels = {} //所有vmodel都储存在这里
avalon.define = function (id, factory) {
    var $id = id.$id || id
    if (!$id) {
        log("warning: vm必须指定$id")
    }
    if (VMODELS[$id]) {
        log("warning: " + $id + " 已经存在于avalon.vmodels中")
    }
    if (typeof id === "object") {
        var model = modelFactory(id)
    } else {
        var scope = {
            $watch: noop
        }
        factory(scope) //得到所有定义
        model = modelFactory(scope) //偷天换日，将scope换为model
        stopRepeatAssign = true
        factory(model)
        stopRepeatAssign = false
    }
    model.$id = $id
    return VMODELS[$id] = model
}

//一些不需要被监听的属性
var $$skipArray = String("$id,$watch,$unwatch,$fire,$events,$model,$skipArray").match(rword)

function isObservable(name, value, $skipArray) {
    if (isFunction(value) || value && value.nodeType) {
        return false
    }
    if ($skipArray.indexOf(name) !== -1) {
        return false
    }
    if ($$skipArray.indexOf(name) !== -1) {
        return false
    }
    var $special = $skipArray.$special
    if (name && name.charAt(0) === "$" && !$special[name]) {
        return false
    }
    return true
}
//ms-with,ms-each, ms-repeat绑定生成的代理对象储存池
var midway = {}
function getNewValue(accessor, name, value, $vmodel) {
    switch (accessor.type) {
        case 0://计算属性
            var getter = accessor.get
            var setter = accessor.set
            if (isFunction(setter)) {
                var $events = $vmodel.$events
                var lock = $events[name]
                $events[name] = [] //清空回调，防止内部冒泡而触发多次$fire
                setter.call($vmodel, value)
                $events[name] = lock
            }
            return  getter.call($vmodel) //同步$model
        case 1://监控属性
            return value
        case 2://对象属性（包括数组与哈希）
            if (value !== $vmodel.$model[name]) {
                var svmodel = accessor.svmodel = objectFactory($vmodel, name, value, accessor.valueType)
                value = svmodel.$model //同步$model
                var fn = midway[svmodel.$id]
                fn && fn() //同步视图
            }
            return value
    }
}

var defineProperty = Object.defineProperty
var canHideOwn = true
//如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
//标准浏览器使用__defineGetter__, __defineSetter__实现
try {
    defineProperty({}, "_", {
        value: "x"
    })
    var defineProperties = Object.defineProperties
} catch (e) {
    canHideOwn = false
}
function modelFactory(source, $special, $model) {
    if (Array.isArray(source)) {
        var arr = source.concat()
        source.length = 0
        var collection = Collection(source)// jshint ignore:line
        collection.pushArray(arr)
        return collection
    }
    //0 null undefined || Node || VModel(fix IE6-8 createWithProxy $val: val引发的BUG)
    if (!source || source.nodeType > 0 || (source.$id && source.$events)) {
        return source
    }
    if (!Array.isArray(source.$skipArray)) {
        source.$skipArray = []
    }
    source.$skipArray.$special = $special || {} //强制要监听的属性
    var $vmodel = {} //要返回的对象, 它在IE6-8下可能被偷龙转凤
    $model = $model || {} //vmodels.$model属性
    var $events = {} //vmodel.$events属性
    var watchedProperties = {} //监控属性
    var initCallbacks = [] //初始化才执行的函数
    for (var i in source) {
        (function (name, val) {
            $model[name] = val
            if (!isObservable(name, val, source.$skipArray)) {
                return //过滤所有非监控属性
            }
            //总共产生三种accessor
            $events[name] = []
            var valueType = avalon.type(val)
            var accessor = function (newValue) {
                var name = accessor._name
                var $vmodel = this
                var $model = $vmodel.$model
                var oldValue = $model[name]
                var $events = $vmodel.$events

                if (arguments.length) {
                    if (stopRepeatAssign) {
                        return
                    }
                    //计算属性与对象属性需要重新计算newValue
                    if (accessor.type !== 1) {
                        newValue = getNewValue(accessor, name, newValue, $vmodel)
                        if (!accessor.type)
                            return
                    }
                    if (!isEqual(oldValue, newValue)) {
                        $model[name] = newValue
                        notifySubscribers($events[name]) //同步视图
                        safeFire($vmodel, name, newValue, oldValue) //触发$watch回调
                    }
                } else {
                    if (accessor.type === 0) { //type 0 计算属性 1 监控属性 2 对象属性
                        //计算属性不需要收集视图刷新函数,都是由其他监控属性代劳
                        newValue = accessor.get.call($vmodel)
                        if (oldValue !== newValue) {
                            $model[name] = newValue
                            //这里不用同步视图
                            safeFire($vmodel, name, newValue, oldValue) //触发$watch回调
                        }
                        return newValue
                    } else {
                        collectSubscribers($events[name]) //收集视图函数
                        return accessor.svmodel || oldValue
                    }
                }
            }
            //总共产生三种accessor
            if (valueType === "object" && isFunction(val.get) && Object.keys(val).length <= 2) {
                //第1种为计算属性， 因变量，通过其他监控属性触发其改变
                accessor.set = val.set
                accessor.get = val.get
                accessor.type = 0
                initCallbacks.push(function () {
                    var data = {
                        evaluator: function () {
                            data.type = Math.random(),
                                    data.element = null
                            $model[name] = accessor.get.call($vmodel)
                        },
                        element: head,
                        type: Math.random(),
                        handler: noop,
                        args: []
                    }
                    Registry[expose] = data
                    accessor.call($vmodel)
                    delete Registry[expose]
                })
            } else if (rcomplexType.test(valueType)) {
                //第2种为对象属性，产生子VM与监控数组
                accessor.type = 2
                accessor.valueType = valueType
                initCallbacks.push(function () {
                    var svmodel = modelFactory(val, 0, $model[name])
                    accessor.svmodel = svmodel
                    svmodel.$events[subscribers] = $events[name]
                })
            } else {
                accessor.type = 1
                //第3种为监控属性，对应简单的数据类型，自变量
            }
            accessor._name = name
            watchedProperties[name] = accessor
        })(i, source[i])// jshint ignore:line
    }

    $$skipArray.forEach(function (name) {
        delete source[name]
        delete $model[name] //这些特殊属性不应该在$model中出现
    })

    $vmodel = defineProperties($vmodel, descriptorFactory(watchedProperties), source) //生成一个空的ViewModel
    for (var name in source) {
        if (!watchedProperties[name]) {
            $vmodel[name] = source[name]
        }
    }
    //添加$id, $model, $events, $watch, $unwatch, $fire
    $vmodel.$id = generateID()
    $vmodel.$model = $model
    $vmodel.$events = $events
    for (i in EventBus) {
        var fn = EventBus[i]
        if (!W3C) { //在IE6-8下，VB对象的方法里的this并不指向自身，需要用bind处理一下
            fn = fn.bind($vmodel)
        }
        $vmodel[i] = fn
    }

    if (canHideOwn) {
        Object.defineProperty($vmodel, "hasOwnProperty", {
            value: function (name) {
                return name in this.$model
            },
            writable: false,
            enumerable: false,
            configurable: true
        })

    } else {
        /* jshint ignore:start */
        $vmodel.hasOwnProperty = function (name) {
            return name in $vmodel.$model
        }
        /* jshint ignore:end */
    }
    initCallbacks.forEach(function (cb) { //收集依赖
        cb()
    })
    return $vmodel
}

//比较两个值是否相等
var isEqual = Object.is || function (v1, v2) {
    if (v1 === 0 && v2 === 0) {
        return 1 / v1 === 1 / v2
    } else if (v1 !== v1) {
        return v2 !== v2
    } else {
        return v1 === v2
    }
}

function safeFire(a, b, c, d) {
    if (a.$events) {
        EventBus.$fire.call(a, b, c, d)
    }
}

var descriptorFactory = W3C ? function (obj) {
    var descriptors = {}
    for (var i in obj) {
        descriptors[i] = {
            get: obj[i],
            set: obj[i],
            enumerable: true,
            configurable: true
        }
    }
    return descriptors
} : function (a) {
    return a
}



//应用于第2种accessor
function objectFactory(parent, name, value, valueType) {
    //a为原来的VM， b为新数组或新对象
    var son = parent[name]
    if (valueType === "array") {
        if (!Array.isArray(value) || son === value) {
            return son //fix https://github.com/RubyLouvre/avalon/issues/261
        }
        son._.$unwatch()
        son.clear()
        son._.$watch()
        son.pushArray(value.concat())
        return son
    } else {
        var iterators = parent.$events[name]
        var pool = son.$events.$withProxyPool
        if (pool) {
            recycleProxies(pool, "with")
            son.$events.$withProxyPool = null
        }
        var ret = modelFactory(value)
        ret.$events[subscribers] = iterators
        midway[ret.$id] = function (data) {
            while (data = iterators.shift()) {
                (function (el) {
                    avalon.nextTick(function () {
                        var type = el.type
                        if (type && bindingHandlers[type]) { //#753
                            el.rollback && el.rollback() //还原 ms-with ms-on
                            bindingHandlers[type](el, el.vmodels)
                        }
                    })
                })(data) // jshint ignore:line
            }
            delete midway[ret.$id]
        }
        return ret
    }
}
//===================修复浏览器对Object.defineProperties的支持=================
if (!canHideOwn) {
    if ("__defineGetter__" in avalon) {
        defineProperty = function (obj, prop, desc) {
            if ('value' in desc) {
                obj[prop] = desc.value
            }
            if ("get" in desc) {
                obj.__defineGetter__(prop, desc.get)
            }
            if ('set' in desc) {
                obj.__defineSetter__(prop, desc.set)
            }
            return obj
        }
        defineProperties = function (obj, descs) {
            for (var prop in descs) {
                if (descs.hasOwnProperty(prop)) {
                    defineProperty(obj, prop, descs[prop])
                }
            }
            return obj
        }
    }
    if (IEVersion) {
        window.execScript([ // jshint ignore:line
            "Function parseVB(code)",
            "\tExecuteGlobal(code)",
            "End Function",
            "Dim VBClassBodies",
            "Set VBClassBodies=CreateObject(\"Scripting.Dictionary\")",
            "Function findOrDefineVBClass(name,body)",
            "\tDim found",
            "\tfound=\"\"",
            "\tFor Each key in VBClassBodies",
            "\t\tIf body=VBClassBodies.Item(key) Then",
            "\t\t\tfound=key",
            "\t\t\tExit For",
            "\t\tEnd If",
            "\tnext",
            "\tIf found=\"\" Then",
            "\t\tparseVB(\"Class \" + name + body)",
            "\t\tVBClassBodies.Add name, body",
            "\t\tfound=name",
            "\tEnd If",
            "\tfindOrDefineVBClass=found",
            "End Function"
        ].join("\n"), "VBScript")
        function VBMediator(instance, accessors, name, value) {// jshint ignore:line
            var accessor = accessors[name]
            if (arguments.length === 4) {
                accessor.call(instance, value)
            } else {
                return accessor.call(instance)
            }
        }
        defineProperties = function (name, accessors, properties) {
            var className = "VBClass" + setTimeout("1"),// jshint ignore:line
                    buffer = []
            buffer.push(
                    "\r\n\tPrivate [__data__], [__proxy__]",
                    "\tPublic Default Function [__const__](d, p)",
                    "\t\tSet [__data__] = d: set [__proxy__] = p",
                    "\t\tSet [__const__] = Me", //链式调用
                    "\tEnd Function")
            //添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
            for (name in properties) {
                if (!accessors.hasOwnProperty(name)) {
                    buffer.push("\tPublic [" + name + "]")
                }
            }
            $$skipArray.forEach(function (name) {
                if (!accessors.hasOwnProperty(name)) {
                    buffer.push("\tPublic [" + name + "]")
                }
            })
            buffer.push("\tPublic [" + 'hasOwnProperty' + "]")
            //添加访问器属性
            for (name in accessors) {
                buffer.push(
                        //由于不知对方会传入什么,因此set, let都用上
                        "\tPublic Property Let [" + name + "](val" + expose + ")", //setter
                        "\t\tCall [__proxy__](Me,[__data__], \"" + name + "\", val" + expose + ")",
                        "\tEnd Property",
                        "\tPublic Property Set [" + name + "](val" + expose + ")", //setter
                        "\t\tCall [__proxy__](Me,[__data__], \"" + name + "\", val" + expose + ")",
                        "\tEnd Property",
                        "\tPublic Property Get [" + name + "]", //getter
                        "\tOn Error Resume Next", //必须优先使用set语句,否则它会误将数组当字符串返回
                        "\t\tSet[" + name + "] = [__proxy__](Me,[__data__],\"" + name + "\")",
                        "\tIf Err.Number <> 0 Then",
                        "\t\t[" + name + "] = [__proxy__](Me,[__data__],\"" + name + "\")",
                        "\tEnd If",
                        "\tOn Error Goto 0",
                        "\tEnd Property")

            }

            buffer.push("End Class")
            var code = buffer.join("\r\n"),
                    realClassName = window['findOrDefineVBClass'](className, code) //如果该VB类已定义，返回类名。否则用className创建一个新类。
            if (realClassName === className) {
                window.parseVB([
                    "Function " + className + "Factory(a, b)", //创建实例并传入两个关键的参数
                    "\tDim o",
                    "\tSet o = (New " + className + ")(a, b)",
                    "\tSet " + className + "Factory = o",
                    "End Function"
                ].join("\r\n"))
            }
            var ret = window[realClassName + "Factory"](accessors, VBMediator) //得到其产品
            return ret //得到其产品
        }
    }
}

/*********************************************************************
 *          监控数组（与ms-each, ms-repeat配合使用）                     *
 **********************************************************************/

function Collection(model) {
    var array = []
    array.$id = generateID()
    array.$model = model //数据模型
    array.$events = {}
    array.$events[subscribers] = []
    array._ = modelFactory({
        length: model.length
    })
    array._.$watch("length", function (a, b) {
        array.$fire("length", a, b)
    })
    for (var i in EventBus) {
        array[i] = EventBus[i]
    }
    avalon.mix(array, CollectionPrototype)
    return array
}

function mutateArray(method, pos, n, index, method2, pos2, n2) {
    var oldLen = this.length, loop = 2
    while (--loop) {
        switch (method) {
            case "add":
                /* jshint ignore:start */
                var array = this.$model.slice(pos, pos + n).map(function (el) {
                    if (rcomplexType.test(avalon.type(el))) {
                        return el.$id ? el : modelFactory(el, 0, el)
                    } else {
                        return el
                    }
                })
                /* jshint ignore:end */
                _splice.apply(this, [pos, 0].concat(array))
                this._fire("add", pos, n)
                break
            case "del":
                var ret = this._splice(pos, n)
                this._fire("del", pos, n)
                break
        }
        if (method2) {
            method = method2
            pos = pos2
            n = n2
            loop = 2
            method2 = 0
        }
    }
    this._fire("index", index)
    if (this.length !== oldLen) {
        this._.length = this.length
    }
    return ret
}

var _splice = ap.splice
var CollectionPrototype = {
    _splice: _splice,
    _fire: function (method, a, b) {
        notifySubscribers(this.$events[subscribers], method, a, b)
    },
    size: function () { //取得数组长度，这个函数可以同步视图，length不能
        return this._.length
    },
    pushArray: function (array) {
        var m = array.length, n = this.length
        if (m) {
            ap.push.apply(this.$model, array)
            mutateArray.call(this, "add", n, m, n)
        }
        return  m + n
    },
    push: function () {
        //http://jsperf.com/closure-with-arguments
        var array = []
        var i, n = arguments.length
        for (i = 0; i < n; i++) {
            array[i] = arguments[i]
        }
        return this.pushArray(arguments)
    },
    unshift: function () {
        var m = arguments.length, n = this.length
        if (m) {
            ap.unshift.apply(this.$model, arguments)
            mutateArray.call(this, "add", 0, m, 0)
        }
        return  m + n //IE67的unshift不会返回长度
    },
    shift: function () {
        if (this.length) {
            var el = this.$model.shift()
            mutateArray.call(this, "del", 0, 1, 0)
            return el //返回被移除的元素
        }
    },
    pop: function () {
        var m = this.length
        if (m) {
            var el = this.$model.pop()
            mutateArray.call(this, "del", m - 1, 1, Math.max(0, m - 2))
            return el //返回被移除的元素
        }
    },
    splice: function (start) {
        var m = arguments.length, args = [], change
        var removed = _splice.apply(this.$model, arguments)
        if (removed.length) { //如果用户删掉了元素
            args.push("del", start, removed.length, 0)
            change = true
        }
        if (m > 2) {  //如果用户添加了元素
            if (change) {
                args.splice(3, 1, 0, "add", start, m - 2)
            } else {
                args.push("add", start, m - 2, 0)
            }
            change = true
        }
        if (change) { //返回被移除的元素
            return mutateArray.apply(this, args)
        } else {
            return []
        }
    },
    contains: function (el) { //判定是否包含
        return this.indexOf(el) !== -1
    },
    remove: function (el) { //移除第一个等于给定值的元素
        return this.removeAt(this.indexOf(el))
    },
    removeAt: function (index) { //移除指定索引上的元素
        if (index >= 0) {
            this.$model.splice(index, 1)
            return mutateArray.call(this, "del", index, 1, 0)
        }
        return  []
    },
    clear: function () {
        this.$model.length = this.length = this._.length = 0 //清空数组
        this._fire("clear", 0)
        return this
    },
    removeAll: function (all) { //移除N个元素
        if (Array.isArray(all)) {
            all.forEach(function (el) {
                this.remove(el)
            }, this)
        } else if (typeof all === "function") {
            for (var i = this.length - 1; i >= 0; i--) {
                var el = this[i]
                if (all(el, i)) {
                    this.removeAt(i)
                }
            }
        } else {
            this.clear()
        }
    },
    ensure: function (el) {
        if (!this.contains(el)) { //只有不存在才push
            this.push(el)
        }
        return this
    },
    set: function (index, val) {
        if (index >= 0) {
            var valueType = avalon.type(val)
            if (val && val.$model) {
                val = val.$model
            }
            var target = this[index]
            if (valueType === "object") {
                for (var i in val) {
                    if (target.hasOwnProperty(i)) {
                        target[i] = val[i]
                    }
                }
            } else if (valueType === "array") {
                target.clear().push.apply(target, val)
            } else if (target !== val) {
                this[index] = val
                this.$model[index] = val
                this._fire("set", index, val)
            }
        }
        return this
    }
}

function sortByIndex(array, indexes) {
    var map = {};
    for (var i = 0, n = indexes.length; i < n; i++) {
        map[i] = array[i] // preserve
        var j = indexes[i]
        if (j in map) {
            array[i] = map[j]
            delete map[j]
        } else {
            array[i] = array[j]
        }
    }
}

"sort,reverse".replace(rword, function (method) {
    CollectionPrototype[method] = function () {
        var newArray = this.$model//这是要排序的新数组
        var oldArray = newArray.concat() //保持原来状态的旧数组
        var mask = Math.random()
        var indexes = []
        var hasSort
        ap[method].apply(newArray, arguments) //排序
        for (var i = 0, n = oldArray.length; i < n; i++) {
            var neo = newArray[i]
            var old = oldArray[i]
            if (isEqual(neo, old)) {
                indexes.push(i)
            } else {
                var index = oldArray.indexOf(neo)
                indexes.push(index)//得到新数组的每个元素在旧数组对应的位置
                oldArray[index] = mask    //屏蔽已经找过的元素
                hasSort = true
            }
        }
        if (hasSort) {
            sortByIndex(this, indexes)
            this._fire("move", indexes)
            this._fire("index", 0)
        }
        return this
    }
})

/*********************************************************************
 *                           依赖调度系统                             *
 **********************************************************************/
var ronduplex = /^(duplex|on)$/

function registerSubscriber(data) {
    Registry[expose] = data //暴光此函数,方便collectSubscribers收集
    avalon.openComputedCollect = true
    var fn = data.evaluator
    if (fn) { //如果是求值函数
        try {
            var c = ronduplex.test(data.type) ? data : fn.apply(0, data.args)
            data.handler(c, data.element, data)
        } catch (e) {
           //log("warning:exception throwed in [registerSubscriber] " + e)
            delete data.evaluator
            var node = data.element
            if (node.nodeType === 3) {
                var parent = node.parentNode
                if (kernel.commentInterpolate) {
                    parent.replaceChild(DOC.createComment(data.value), node)
                } else {
                    node.data = openTag + data.value + closeTag
                }
            }
        }
    }
    avalon.openComputedCollect = false
    delete Registry[expose]
}

function collectSubscribers(list) { //收集依赖于这个访问器的订阅者
    var data = Registry[expose]
    if (list && data && avalon.Array.ensure(list, data) && data.element) { //只有数组不存在此元素才push进去
        addSubscribers(data, list)
    }
}


function addSubscribers(data, list) {
    data.$uuid = data.$uuid || generateID()
    list.$uuid = list.$uuid || generateID()
    var obj = {
        data: data,
        list: list,
        $$uuid:  data.$uuid + list.$uuid
    }
    if (!$$subscribers[obj.$$uuid]) {
        $$subscribers[obj.$$uuid] = 1
        $$subscribers.push(obj)
    }
}

function disposeData(data) {
    data.element = null
    data.rollback && data.rollback()
    for (var key in data) {
        data[key] = null
    }
}

function isRemove(el) {
    try {//IE下，如果文本节点脱离DOM树，访问parentNode会报错
        if (!el.parentNode) {
            return true
        }
    } catch (e) {
        return true
    }
    return el.msRetain ? 0 : (el.nodeType === 1 ? typeof el.sourceIndex === "number" ?
            el.sourceIndex === 0 : !root.contains(el) : !avalon.contains(root, el))
}
var $$subscribers = avalon.$$subscribers = []
var beginTime = new Date()
var oldInfo = {}
function removeSubscribers() {
    var i = $$subscribers.length
    var n = i
    var k = 0
    var obj
    var types = []
    var newInfo = {}
    var needTest = {}
    while (obj = $$subscribers[--i]) {
        var data = obj.data
        var type = data.type
        if (newInfo[type]) {
            newInfo[type]++
        } else {
            newInfo[type] = 1
            types.push(type)
        }
    }
    var diff = false
    types.forEach(function(type) {
        if (oldInfo[type] !== newInfo[type]) {
            needTest[type] = 1
            diff = true
        }
    })
    i = n
    //avalon.log("需要检测的个数 " + i)
    if (diff) {
        //avalon.log("有需要移除的元素")
        while (obj = $$subscribers[--i]) {
            data = obj.data
            if (data.element === void 0)
                continue
            if (needTest[data.type] && isRemove(data.element)) { //如果它没有在DOM树
                k++
                $$subscribers.splice(i, 1)
                delete $$subscribers[obj.$$uuid]
                avalon.Array.remove(obj.list, data)
                //log("debug: remove " + data.type)
                disposeData(data)
                obj.data = obj.list = null
            }
        }
    }
    oldInfo = newInfo
   // avalon.log("已经移除的个数 " + k)
    beginTime = new Date()
}

function notifySubscribers(list) { //通知依赖于这个访问器的订阅者更新自身
    if (list && list.length) {
        if (new Date() - beginTime > 444 && typeof list[0] === "object") {
            removeSubscribers()
        }
        var args = aslice.call(arguments, 1)
        for (var i = list.length, fn; fn = list[--i]; ) {
            var el = fn.element
            if (el && el.parentNode) {
                if (fn.$repeat) {
                    fn.handler.apply(fn, args) //处理监控数组的方法
                } else if (fn.type !== "on") { //事件绑定只能由用户触发,不能由程序触发
                    var fun = fn.evaluator || noop
                    fn.handler(fun.apply(0, fn.args || []), el, fn)
                }
            }
        }
    }
}

/************************************************************************
 *            HTML处理(parseHTML, innerHTML, clearHTML)                  *
 ************************************************************************/
// We have to close these tags to support XHTML
var tagHooks = {
    area: [1, "<map>", "</map>"],
    param: [1, "<object>", "</object>"],
    col: [2, "<table><colgroup>", "</colgroup></table>"],
    legend: [1, "<fieldset>", "</fieldset>"],
    option: [1, "<select multiple='multiple'>", "</select>"],
    thead: [1, "<table>", "</table>"],
    tr: [2, "<table>", "</table>"],
    td: [3, "<table><tr>", "</tr></table>"],
    g: [1, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">', '</svg>'],
    //IE6-8在用innerHTML生成节点时，不能直接创建no-scope元素与HTML5的新标签
    _default: W3C ? [0, "", ""] : [1, "X<div>", "</div>"] //div可以不用闭合
}
tagHooks.th = tagHooks.td
tagHooks.optgroup = tagHooks.option
tagHooks.tbody = tagHooks.tfoot = tagHooks.colgroup = tagHooks.caption = tagHooks.thead
String("circle,defs,ellipse,image,line,path,polygon,polyline,rect,symbol,text,use").replace(rword, function (tag) {
    tagHooks[tag] = tagHooks.g //处理SVG
})
var rtagName = /<([\w:]+)/  //取得其tagName
var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig
var rcreate = W3C ? /[^\d\D]/ : /(<(?:script|link|style|meta|noscript))/ig
var scriptTypes = oneObject(["", "text/javascript", "text/ecmascript", "application/ecmascript", "application/javascript"])
var rnest = /<(?:tb|td|tf|th|tr|col|opt|leg|cap|area)/ //需要处理套嵌关系的标签
var script = DOC.createElement("script")
avalon.parseHTML = function (html) {
    if (typeof html !== "string") {
        return DOC.createDocumentFragment()
    }
    html = html.replace(rxhtml, "<$1></$2>").trim()
    var tag = (rtagName.exec(html) || ["", ""])[1].toLowerCase(),
            //取得其标签名
            wrap = tagHooks[tag] || tagHooks._default,
            fragment = hyperspace.cloneNode(false),
            wrapper = cinerator,
            firstChild, neo
    if (!W3C) { //fix IE
        html = html.replace(rcreate, "<br class=msNoScope>$1") //在link style script等标签之前添加一个补丁
    }
    wrapper.innerHTML = wrap[1] + html + wrap[2]
    var els = wrapper.getElementsByTagName("script")
    if (els.length) { //使用innerHTML生成的script节点不会发出请求与执行text属性
        for (var i = 0, el; el = els[i++]; ) {
            if (scriptTypes[el.type]) {
                //以偷龙转凤方式恢复执行脚本功能
                neo = script.cloneNode(false) //FF不能省略参数
                ap.forEach.call(el.attributes, function (attr) {
                    if (attr && attr.specified) {
                        neo[attr.name] = attr.value //复制其属性
                        neo.setAttribute(attr.name, attr.value)
                    }
                })  // jshint ignore:line
                neo.text = el.text
                el.parentNode.replaceChild(neo, el) //替换节点
            }
        }
    }
    if (!W3C) { //fix IE
        var target = wrap[1] === "X<div>" ? wrapper.lastChild.firstChild : wrapper.lastChild
        if (target && target.tagName === "TABLE" && tag !== "tbody") {
            //IE6-7处理 <thead> --> <thead>,<tbody>
            //<tfoot> --> <tfoot>,<tbody>
            //<table> --> <table><tbody></table>
            for (els = target.childNodes, i = 0; el = els[i++]; ) {
                if (el.tagName === "TBODY" && !el.innerHTML) {
                    target.removeChild(el)
                    break
                }
            }
        }
        els = wrapper.getElementsByTagName("br")
        var n = els.length
        while (el = els[--n]) {
            if (el.className === "msNoScope") {
                el.parentNode.removeChild(el)
            }
        }
        for (els = wrapper.all, i = 0; el = els[i++]; ) { //fix VML
            if (isVML(el)) {
                fixVML(el)
            }
        }
    }
    //移除我们为了符合套嵌关系而添加的标签
    for (i = wrap[0]; i--; wrapper = wrapper.lastChild) {
    }
    while (firstChild = wrapper.firstChild) { // 将wrapper上的节点转移到文档碎片上！
        fragment.appendChild(firstChild)
    }
    return fragment
}

function isVML(src) {
    var nodeName = src.nodeName
    return nodeName.toLowerCase() === nodeName && src.scopeName && src.outerText === ""
}

function fixVML(node) {
    if (node.currentStyle.behavior !== "url(#default#VML)") {
        node.style.behavior = "url(#default#VML)"
        node.style.display = "inline-block"
        node.style.zoom = 1 //hasLayout
    }
}
avalon.innerHTML = function (node, html) {
    if (!W3C && (!rcreate.test(html) && !rnest.test(html))) {
        try {
            node.innerHTML = html
            return
        } catch (e) {
        }
    }
    var a = this.parseHTML(html)
    this.clearHTML(node).appendChild(a)
}
avalon.clearHTML = function (node) {
    node.textContent = ""
    while (node.firstChild) {
        node.removeChild(node.firstChild)
    }
    return node
}

/*********************************************************************
 *                           扫描系统                                 *
 **********************************************************************/

avalon.scan = function(elem, vmodel, group) {
    elem = elem || root
    var vmodels = vmodel ? [].concat(vmodel) : []
    scanTag(elem, vmodels)
}

//http://www.w3.org/TR/html5/syntax.html#void-elements
var stopScan = oneObject("area,base,basefont,br,col,command,embed,hr,img,input,link,meta,param,source,track,wbr,noscript,script,style,textarea".toUpperCase())

function checkScan(elem, callback, innerHTML) {
    var id = setTimeout(function() {
        var currHTML = elem.innerHTML
        clearTimeout(id)
        if (currHTML === innerHTML) {
            callback()
        } else {
            checkScan(elem, callback, currHTML)
        }
    })
}


function createSignalTower(elem, vmodel) {
    var id = elem.getAttribute("avalonctrl") || vmodel.$id
    elem.setAttribute("avalonctrl", id)
    vmodel.$events.expr = elem.tagName + '[avalonctrl="' + id + '"]'
}

var getBindingCallback = function(elem, name, vmodels) {
    var callback = elem.getAttribute(name)
    if (callback) {
        for (var i = 0, vm; vm = vmodels[i++]; ) {
            if (vm.hasOwnProperty(callback) && typeof vm[callback] === "function") {
                return vm[callback]
            }
        }
    }
}

function executeBindings(bindings, vmodels) {
    for (var i = 0, data; data = bindings[i++]; ) {
        data.vmodels = vmodels
        bindingHandlers[data.type](data, vmodels)
        if (data.evaluator && data.element && data.element.nodeType === 1) { //移除数据绑定，防止被二次解析
            //chrome使用removeAttributeNode移除不存在的特性节点时会报错 https://github.com/RubyLouvre/avalon/issues/99
            data.element.removeAttribute(data.name)
        }
    }
    bindings.length = 0
}

//https://github.com/RubyLouvre/avalon/issues/636
var mergeTextNodes = IEVersion && window.MutationObserver ? function (elem) {
    var node = elem.firstChild, text
    while (node) {
        var aaa = node.nextSibling
        if (node.nodeType === 3) {
            if (text) {
                text.nodeValue += node.nodeValue
                elem.removeChild(node)
            } else {
                text = node
            }
        } else {
            text = null
        }
        node = aaa
    }
} : 0

var rmsAttr = /ms-(\w+)-?(.*)/
var priorityMap = {
    "if": 10,
    "repeat": 90,
    "data": 100,
    "widget": 110,
    "each": 1400,
    "with": 1500,
    "duplex": 2000,
    "on": 3000
}

var events = oneObject("animationend,blur,change,input,click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,scan,scroll,submit")
var obsoleteAttrs = oneObject("value,title,alt,checked,selected,disabled,readonly,enabled")
function bindingSorter(a, b) {
    return a.priority - b.priority
}

function scanAttr(elem, vmodels) {
    //防止setAttribute, removeAttribute时 attributes自动被同步,导致for循环出错
    var attributes = getAttributes ? getAttributes(elem) : avalon.slice(elem.attributes)
    var bindings = [],
            msData = {},
            match
    for (var i = 0, attr; attr = attributes[i++]; ) {
        if (attr.specified) {
            if (match = attr.name.match(rmsAttr)) {
                //如果是以指定前缀命名的
                var type = match[1]
                var param = match[2] || ""
                var value = attr.value
                var name = attr.name
                msData[name] = value
                if (events[type]) {
                    param = type
                    type = "on"
                } else if (obsoleteAttrs[type]) {
                    log("warning!请改用ms-attr-" + type + "代替ms-" + type + "！")
                    if (type === "enabled") {//吃掉ms-enabled绑定,用ms-disabled代替
                        log("warning!ms-enabled或ms-attr-enabled已经被废弃")
                        type = "disabled"
                        value = "!(" + value + ")"
                    }
                    param = type
                    type = "attr"
                    elem.removeAttribute(name)
                    name = "ms-attr-" + param
                    elem.setAttribute(name, value)
                    match = [name]
                    msData[name] = value
                }
                if (typeof bindingHandlers[type] === "function") {
                    var binding = {
                        type: type,
                        param: param,
                        element: elem,
                        name: match[0],
                        value: value,
                        priority: type in priorityMap ? priorityMap[type] : type.charCodeAt(0) * 10 + (Number(param) || 0)
                    }
                    if (type === "html" || type === "text") {
                        var token = getToken(value)
                        avalon.mix(binding, token)
                        binding.filters = binding.filters.replace(rhasHtml, function () {
                            binding.type = "html"
                            binding.group = 1
                            return ""
                        })// jshint ignore:line
                    }
                    if (name === "ms-if-loop") {
                        binding.priority += 100
                    }
                    if (vmodels.length) {
                        bindings.push(binding)
                        if (type === "widget") {
                            elem.msData = elem.msData || msData
                        }
                    }
                }
            }
        }
    }
    bindings.sort(bindingSorter)
    var control = elem.type
    if (control && msData["ms-duplex"]) {
        if (msData["ms-attr-checked"] && /radio|checkbox/.test(control)) {
            log("warning!" + control + "控件不能同时定义ms-attr-checked与ms-duplex")
        }
        if (msData["ms-attr-value"] && /text|password/.test(control)) {
            log("warning!" + control + "控件不能同时定义ms-attr-value与ms-duplex")
        }
    }
    var scanNode = true
    for (i = 0; binding = bindings[i]; i++) {
        type = binding.type
        if (rnoscanAttrBinding.test(type)) {
            return executeBindings(bindings.slice(0, i + 1), vmodels)
        } else if (scanNode) {
            scanNode = !rnoscanNodeBinding.test(type)
        }
    }
    executeBindings(bindings, vmodels)
    if (scanNode && !stopScan[elem.tagName] && rbind.test(elem.innerHTML.replace(rlt, "<").replace(rgt, ">"))) {
        mergeTextNodes && mergeTextNodes(elem)
        scanNodeList(elem, vmodels) //扫描子孙元素
    }
}

var rnoscanAttrBinding = /^if|widget|repeat$/
var rnoscanNodeBinding = /^each|with|html|include$/
//IE67下，在循环绑定中，一个节点如果是通过cloneNode得到，自定义属性的specified为false，无法进入里面的分支，
//但如果我们去掉scanAttr中的attr.specified检测，一个元素会有80+个特性节点（因为它不区分固有属性与自定义属性），很容易卡死页面
if (!"1" [0]) {
    var cacheAttrs = new Cache(512)
    var rattrs = /\s+(ms-[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g,
            rquote = /^['"]/,
            rtag = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/i,
            ramp = /&amp;/g
    //IE6-8解析HTML5新标签，会将它分解两个元素节点与一个文本节点
    //<body><section>ddd</section></body>
    //        window.onload = function() {
    //            var body = document.body
    //            for (var i = 0, el; el = body.children[i++]; ) {
    //                avalon.log(el.outerHTML)
    //            }
    //        }
    //依次输出<SECTION>, </SECTION>
    var getAttributes = function (elem) {
        var html = elem.outerHTML
        //处理IE6-8解析HTML5新标签的情况，及<br>等半闭合标签outerHTML为空的情况
        if (html.slice(0, 2) === "</" || !html.trim()) {
            return []
        }
        var str = html.match(rtag)[0]
        var attributes = [],
                match,
                k, v
        var ret = cacheAttrs.get(str)
        if (ret) {
            return ret
        }
        while (k = rattrs.exec(str)) {
            v = k[2]
            if (v) {
                v = (rquote.test(v) ? v.slice(1, -1) : v).replace(ramp, "&")
            }
            var name = k[1].toLowerCase()
            match = name.match(rmsAttr)
            var binding = {
                name: name,
                specified: true,
                value: v || ""
            }
            attributes.push(binding)
        }
        return cacheAttrs.put(str, attributes)
    }
}

function scanNodeList(parent, vmodels) {
    var node = parent.firstChild
    while (node) {
        var nextNode = node.nextSibling
        scanNode(node, node.nodeType, vmodels)
        node = nextNode
    }
}

function scanNodeArray(nodes, vmodels) {
    for (var i = 0, node; node = nodes[i++]; ) {
        scanNode(node, node.nodeType, vmodels)
    }
}
function scanNode(node, nodeType, vmodels) {
    if (nodeType === 1) {
        scanTag(node, vmodels) //扫描元素节点
    } else if (nodeType === 3 && rexpr.test(node.data)){
        scanText(node, vmodels) //扫描文本节点
    } else if (kernel.commentInterpolate && nodeType === 8 && !rexpr.test(node.nodeValue)) {
        scanText(node, vmodels) //扫描注释节点
    }
}
function scanTag(elem, vmodels, node) {
    //扫描顺序  ms-skip(0) --> ms-important(1) --> ms-controller(2) --> ms-if(10) --> ms-repeat(100)
    //--> ms-if-loop(110) --> ms-attr(970) ...--> ms-each(1400)-->ms-with(1500)--〉ms-duplex(2000)垫后
    var a = elem.getAttribute("ms-skip")
    //#360 在旧式IE中 Object标签在引入Flash等资源时,可能出现没有getAttributeNode,innerHTML的情形
    if (!elem.getAttributeNode) {
        return log("warning " + elem.tagName + " no getAttributeNode method")
    }
    var b = elem.getAttributeNode("ms-important")
    var c = elem.getAttributeNode("ms-controller")
    if (typeof a === "string") {
        return
    } else if (node = b || c) {
        var newVmodel = avalon.vmodels[node.value]
        if (!newVmodel) {
            return
        }
        //ms-important不包含父VM，ms-controller相反
        vmodels = node === b ? [newVmodel] : [newVmodel].concat(vmodels)
        var name = node.name
        elem.removeAttribute(name) //removeAttributeNode不会刷新[ms-controller]样式规则
        avalon(elem).removeClass(name)
        createSignalTower(elem, newVmodel)
    }
    scanAttr(elem, vmodels) //扫描特性节点
}
var rhasHtml = /\|\s*html\s*/,
        r11a = /\|\|/g,
        rlt = /&lt;/g,
        rgt = /&gt;/g
        rstringLiteral  = /(['"])(\\\1|.)+?\1/g
function getToken(value) {
    if (value.indexOf("|") > 0) {
        var scapegoat = value.replace( rstringLiteral, function(_){
            return Array(_.length+1).join("1")// jshint ignore:line
        })
        var index = scapegoat.replace(r11a, "\u1122\u3344").indexOf("|") //干掉所有短路或
        if (index > -1) {
            return {
                filters: value.slice(index),
                value: value.slice(0, index),
                expr: true
            }
        }
    }
    return {
        value: value,
        filters: "",
        expr: true
    }
}

function scanExpr(str) {
    var tokens = [],
            value, start = 0,
            stop
    do {
        stop = str.indexOf(openTag, start)
        if (stop === -1) {
            break
        }
        value = str.slice(start, stop)
        if (value) { // {{ 左边的文本
            tokens.push({
                value: value,
                filters: "",
                expr: false
            })
        }
        start = stop + openTag.length
        stop = str.indexOf(closeTag, start)
        if (stop === -1) {
            break
        }
        value = str.slice(start, stop)
        if (value) { //处理{{ }}插值表达式
            tokens.push(getToken(value))
        }
        start = stop + closeTag.length
    } while (1)
    value = str.slice(start)
    if (value) { //}} 右边的文本
        tokens.push({
            value: value,
            expr: false,
            filters: ""
        })
    }
    return tokens
}

function scanText(textNode, vmodels) {
    var bindings = []
    if (textNode.nodeType === 8) {
        var token = getToken(textNode.nodeValue)
        var tokens = [token]
    } else {
        tokens = scanExpr(textNode.data)
    }
    if (tokens.length) {
        for (var i = 0; token = tokens[i++]; ) {
            var node = DOC.createTextNode(token.value) //将文本转换为文本节点，并替换原来的文本节点
            if (token.expr) {
                token.type = "text"
                token.element = node
                token.filters = token.filters.replace(rhasHtml, function() {
                    token.type = "html"
                    token.group = 1
                    return ""
                })// jshint ignore:line
                bindings.push(token) //收集带有插值表达式的文本
            }
            hyperspace.appendChild(node)
        }
        textNode.parentNode.replaceChild(hyperspace, textNode)
        if (bindings.length)
            executeBindings(bindings, vmodels)
    }
}

/*********************************************************************
 *                  avalon的原型方法定义区                            *
 **********************************************************************/

function hyphen(target) {
    //转换为连字符线风格
    return target.replace(/([a-z\d])([A-Z]+)/g, "$1-$2").toLowerCase()
}

function camelize(target) {
    //转换为驼峰风格
    if (target.indexOf("-") < 0 && target.indexOf("_") < 0) {
        return target //提前判断，提高getStyle等的效率
    }
    return target.replace(/[-_][^-_]/g, function(match) {
        return match.charAt(1).toUpperCase()
    })
}

var fakeClassListMethods = {
    _toString: function() {
        var node = this.node
        var cls = node.className
        var str = typeof cls === "string" ? cls : cls.baseVal
        return str.split(/\s+/).join(" ")
    },
    _contains: function(cls) {
        return (" " + this + " ").indexOf(" " + cls + " ") > -1
    },
    _add: function(cls) {
        if (!this.contains(cls)) {
            this._set(this + " " + cls)
        }
    },
    _remove: function(cls) {
        this._set((" " + this + " ").replace(" " + cls + " ", " "))
    },
    __set: function(cls) {
        cls = cls.trim()
        var node = this.node
        if (rsvg.test(node)) {
            //SVG元素的className是一个对象 SVGAnimatedString { baseVal="", animVal=""}，只能通过set/getAttribute操作
            node.setAttribute("class", cls)
        } else {
            node.className = cls
        }
    } //toggle存在版本差异，因此不使用它
}

function fakeClassList(node) {
    if (!("classList" in node)) {
        node.classList = {
            node: node
        }
        for (var k in fakeClassListMethods) {
            node.classList[k.slice(1)] = fakeClassListMethods[k]
        }
    }
    return node.classList
}


"add,remove".replace(rword, function(method) {
    avalon.fn[method + "Class"] = function(cls) {
        var el = this[0]
        //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
        if (cls && typeof cls === "string" && el && el.nodeType === 1) {
            cls.replace(/\S+/g, function(c) {
                fakeClassList(el)[method](c)
            })
        }
        return this
    }
})
avalon.fn.mix({
    hasClass: function(cls) {
        var el = this[0] || {}
        return el.nodeType === 1 && fakeClassList(el).contains(cls)
    },
    toggleClass: function(value, stateVal) {
        var className, i = 0
        var classNames = value.split(/\s+/)
        var isBool = typeof stateVal === "boolean"
        while ((className = classNames[i++])) {
            var state = isBool ? stateVal : !this.hasClass(className)
            this[state ? "addClass" : "removeClass"](className)
        }
        return this
    },
    attr: function(name, value) {
        if (arguments.length === 2) {
            this[0].setAttribute(name, value)
            return this
        } else {
            return this[0].getAttribute(name)
        }
    },
    data: function(name, value) {
        name = "data-" + hyphen(name || "")
        switch (arguments.length) {
            case 2:
                this.attr(name, value)
                return this
            case 1:
                var val = this.attr(name)
                return parseData(val)
            case 0:
                var ret = {}
                ap.forEach.call(this[0].attributes, function(attr) {
                    if (attr) {
                        name = attr.name
                        if (!name.indexOf("data-")) {
                            name = camelize(name.slice(5))
                            ret[name] = parseData(attr.value)
                        }
                    }
                })
                return ret
        }
    },
    removeData: function(name) {
        name = "data-" + hyphen(name)
        this[0].removeAttribute(name)
        return this
    },
    css: function(name, value) {
        if (avalon.isPlainObject(name)) {
            for (var i in name) {
                avalon.css(this, i, name[i])
            }
        } else {
            var ret = avalon.css(this, name, value)
        }
        return ret !== void 0 ? ret : this
    },
    position: function() {
        var offsetParent, offset,
                elem = this[0],
                parentOffset = {
                    top: 0,
                    left: 0
                }
        if (!elem) {
            return
        }
        if (this.css("position") === "fixed") {
            offset = elem.getBoundingClientRect()
        } else {
            offsetParent = this.offsetParent() //得到真正的offsetParent
            offset = this.offset() // 得到正确的offsetParent
            if (offsetParent[0].tagName !== "HTML") {
                parentOffset = offsetParent.offset()
            }
            parentOffset.top += avalon.css(offsetParent[0], "borderTopWidth", true)
            parentOffset.left += avalon.css(offsetParent[0], "borderLeftWidth", true)
        }
        return {
            top: offset.top - parentOffset.top - avalon.css(elem, "marginTop", true),
            left: offset.left - parentOffset.left - avalon.css(elem, "marginLeft", true)
        }
    },
    offsetParent: function() {
        var offsetParent = this[0].offsetParent
        while (offsetParent && avalon.css(offsetParent, "position") === "static") {
            offsetParent = offsetParent.offsetParent;
        }
        return avalon(offsetParent || root)
    },
    bind: function(type, fn, phase) {
        if (this[0]) { //此方法不会链
            return avalon.bind(this[0], type, fn, phase)
        }
    },
    unbind: function(type, fn, phase) {
        if (this[0]) {
            avalon.unbind(this[0], type, fn, phase)
        }
        return this
    },
    val: function(value) {
        var node = this[0]
        if (node && node.nodeType === 1) {
            var get = arguments.length === 0
            var access = get ? ":get" : ":set"
            var fn = valHooks[getValType(node) + access]
            if (fn) {
                var val = fn(node, value)
            } else if (get) {
                return (node.value || "").replace(/\r/g, "")
            } else {
                node.value = value
            }
        }
        return get ? val : this
    }
})

function parseData(data) {
    try {
        if (typeof data === "object")
            return data
        data = data === "true" ? true :
                data === "false" ? false :
                data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? avalon.parseJSON(data) : data
    } catch (e) {
    }
    return data
}
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
        rvalidchars = /^[\],:{}\s]*$/,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g
avalon.parseJSON = window.JSON ? JSON.parse : function(data) {
    if (typeof data === "string") {
        data = data.trim();
        if (data) {
            if (rvalidchars.test(data.replace(rvalidescape, "@")
                    .replace(rvalidtokens, "]")
                    .replace(rvalidbraces, ""))) {
                return (new Function("return " + data))()// jshint ignore:line
            }
        }
        avalon.error("Invalid JSON: " + data)
    }
    return data
}

//生成avalon.fn.scrollLeft, avalon.fn.scrollTop方法
avalon.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
}, function(method, prop) {
    avalon.fn[method] = function(val) {
        var node = this[0] || {}, win = getWindow(node),
                top = method === "scrollTop"
        if (!arguments.length) {
            return win ? (prop in win) ? win[prop] : root[method] : node[method]
        } else {
            if (win) {
                win.scrollTo(!top ? val : avalon(win).scrollLeft(), top ? val : avalon(win).scrollTop())
            } else {
                node[method] = val
            }
        }
    }
})

function getWindow(node) {
    return node.window && node.document ? node : node.nodeType === 9 ? node.defaultView || node.parentWindow : false;
}
//=============================css相关=======================
var cssHooks = avalon.cssHooks = {}
var prefixes = ["", "-webkit-", "-o-", "-moz-", "-ms-"]
var cssMap = {
    "float": W3C ? "cssFloat" : "styleFloat"
}
avalon.cssNumber = oneObject("columnCount,order,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom")

avalon.cssName = function(name, host, camelCase) {
    if (cssMap[name]) {
        return cssMap[name]
    }
    host = host || root.style
    for (var i = 0, n = prefixes.length; i < n; i++) {
        camelCase = camelize(prefixes[i] + name)
        if (camelCase in host) {
            return (cssMap[name] = camelCase)
        }
    }
    return null
}
cssHooks["@:set"] = function(node, name, value) {
    try { //node.style.width = NaN;node.style.width = "xxxxxxx";node.style.width = undefine 在旧式IE下会抛异常
        node.style[name] = value
    } catch (e) {
    }
}
if (window.getComputedStyle) {
    cssHooks["@:get"] = function(node, name) {
        if (!node || !node.style) {
            throw new Error("getComputedStyle要求传入一个节点 " + node)
        }
        var ret, styles = getComputedStyle(node, null)
        if (styles) {
            ret = name === "filter" ? styles.getPropertyValue(name) : styles[name]
            if (ret === "") {
                ret = node.style[name] //其他浏览器需要我们手动取内联样式
            }
        }
        return ret
    }
    cssHooks["opacity:get"] = function(node) {
        var ret = cssHooks["@:get"](node, "opacity")
        return ret === "" ? "1" : ret
    }
} else {
    var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i
    var rposition = /^(top|right|bottom|left)$/
    var ralpha = /alpha\([^)]*\)/i
    var ie8 = !!window.XDomainRequest
    var salpha = "DXImageTransform.Microsoft.Alpha"
    var border = {
        thin: ie8 ? '1px' : '2px',
        medium: ie8 ? '3px' : '4px',
        thick: ie8 ? '5px' : '6px'
    }
    cssHooks["@:get"] = function(node, name) {
        //取得精确值，不过它有可能是带em,pc,mm,pt,%等单位
        var currentStyle = node.currentStyle
        var ret = currentStyle[name]
        if ((rnumnonpx.test(ret) && !rposition.test(ret))) {
            //①，保存原有的style.left, runtimeStyle.left,
            var style = node.style,
                    left = style.left,
                    rsLeft = node.runtimeStyle.left
            //②由于③处的style.left = xxx会影响到currentStyle.left，
            //因此把它currentStyle.left放到runtimeStyle.left，
            //runtimeStyle.left拥有最高优先级，不会style.left影响
            node.runtimeStyle.left = currentStyle.left
            //③将精确值赋给到style.left，然后通过IE的另一个私有属性 style.pixelLeft
            //得到单位为px的结果；fontSize的分支见http://bugs.jquery.com/ticket/760
            style.left = name === 'fontSize' ? '1em' : (ret || 0)
            ret = style.pixelLeft + "px"
            //④还原 style.left，runtimeStyle.left
            style.left = left
            node.runtimeStyle.left = rsLeft
        }
        if (ret === "medium") {
            name = name.replace("Width", "Style")
            //border width 默认值为medium，即使其为0"
            if (currentStyle[name] === "none") {
                ret = "0px"
            }
        }
        return ret === "" ? "auto" : border[ret] || ret
    }
    cssHooks["opacity:set"] = function(node, name, value) {
        var style = node.style
        var opacity = isFinite(value) && value <= 1 ? "alpha(opacity=" + value * 100 + ")" : ""
        var filter = style.filter || "";
        style.zoom = 1
        //不能使用以下方式设置透明度
        //node.filters.alpha.opacity = value * 100
        style.filter = (ralpha.test(filter) ?
                filter.replace(ralpha, opacity) :
                filter + " " + opacity).trim()
        if (!style.filter) {
            style.removeAttribute("filter")
        }
    }
    cssHooks["opacity:get"] = function(node) {
        //这是最快的获取IE透明值的方式，不需要动用正则了！
        var alpha = node.filters.alpha || node.filters[salpha],
                op = alpha && alpha.enabled ? alpha.opacity : 100
        return (op / 100) + "" //确保返回的是字符串
    }
}

"top,left".replace(rword, function(name) {
    cssHooks[name + ":get"] = function(node) {
        var computed = cssHooks["@:get"](node, name)
        return /px$/.test(computed) ? computed :
                avalon(node).position()[name] + "px"
    }
})

var cssShow = {
    position: "absolute",
    visibility: "hidden",
    display: "block"
}

var rdisplayswap = /^(none|table(?!-c[ea]).+)/

function showHidden(node, array) {
    //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
    if (node.offsetWidth <= 0) { //opera.offsetWidth可能小于0
        if (rdisplayswap.test(cssHooks["@:get"](node, "display"))) {
            var obj = {
                node: node
            }
            for (var name in cssShow) {
                obj[name] = node.style[name]
                node.style[name] = cssShow[name]
            }
            array.push(obj)
        }
        var parent = node.parentNode
        if (parent && parent.nodeType === 1) {
            showHidden(parent, array)
        }
    }
}
"Width,Height".replace(rword, function(name) { //fix 481
    var method = name.toLowerCase(),
            clientProp = "client" + name,
            scrollProp = "scroll" + name,
            offsetProp = "offset" + name
    cssHooks[method + ":get"] = function(node, which, override) {
        var boxSizing = -4
        if (typeof override === "number") {
            boxSizing = override
        }
        which = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"]
        var ret = node[offsetProp] // border-box 0
        if (boxSizing === 2) { // margin-box 2
            return ret + avalon.css(node, "margin" + which[0], true) + avalon.css(node, "margin" + which[1], true)
        }
        if (boxSizing < 0) { // padding-box  -2
            ret = ret - avalon.css(node, "border" + which[0] + "Width", true) - avalon.css(node, "border" + which[1] + "Width", true)
        }
        if (boxSizing === -4) { // content-box -4
            ret = ret - avalon.css(node, "padding" + which[0], true) - avalon.css(node, "padding" + which[1], true)
        }
        return ret
    }
    cssHooks[method + "&get"] = function(node) {
        var hidden = [];
        showHidden(node, hidden);
        var val = cssHooks[method + ":get"](node)
        for (var i = 0, obj; obj = hidden[i++]; ) {
            node = obj.node
            for (var n in obj) {
                if (typeof obj[n] === "string") {
                    node.style[n] = obj[n]
                }
            }
        }
        return val;
    }
    avalon.fn[method] = function(value) { //会忽视其display
        var node = this[0]
        if (arguments.length === 0) {
            if (node.setTimeout) { //取得窗口尺寸,IE9后可以用node.innerWidth /innerHeight代替
                return node["inner" + name] || node.document.documentElement[clientProp]
            }
            if (node.nodeType === 9) { //取得页面尺寸
                var doc = node.documentElement
                //FF chrome    html.scrollHeight< body.scrollHeight
                //IE 标准模式 : html.scrollHeight> body.scrollHeight
                //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
                return Math.max(node.body[scrollProp], doc[scrollProp], node.body[offsetProp], doc[offsetProp], doc[clientProp])
            }
            return cssHooks[method + "&get"](node)
        } else {
            return this.css(method, value)
        }
    }
    avalon.fn["inner" + name] = function() {
        return cssHooks[method + ":get"](this[0], void 0, -2)
    }
    avalon.fn["outer" + name] = function(includeMargin) {
        return cssHooks[method + ":get"](this[0], void 0, includeMargin === true ? 2 : 0)
    }
})
avalon.fn.offset = function() { //取得距离页面左右角的坐标
    var node = this[0],
            box = {
                left: 0,
                top: 0
            }
    if (!node || !node.tagName || !node.ownerDocument) {
        return box
    }
    var doc = node.ownerDocument,
            body = doc.body,
            root = doc.documentElement,
            win = doc.defaultView || doc.parentWindow
    if (!avalon.contains(root, node)) {
        return box
    }
    //http://hkom.blog1.fc2.com/?mode=m&no=750 body的偏移量是不包含margin的
    //我们可以通过getBoundingClientRect来获得元素相对于client的rect.
    //http://msdn.microsoft.com/en-us/library/ms536433.aspx
    if (node.getBoundingClientRect) {
        box = node.getBoundingClientRect() // BlackBerry 5, iOS 3 (original iPhone)
    }
    //chrome/IE6: body.scrollTop, firefox/other: root.scrollTop
    var clientTop = root.clientTop || body.clientTop,
            clientLeft = root.clientLeft || body.clientLeft,
            scrollTop = Math.max(win.pageYOffset || 0, root.scrollTop, body.scrollTop),
            scrollLeft = Math.max(win.pageXOffset || 0, root.scrollLeft, body.scrollLeft)
    // 把滚动距离加到left,top中去。
    // IE一些版本中会自动为HTML元素加上2px的border，我们需要去掉它
    // http://msdn.microsoft.com/en-us/library/ms533564(VS.85).aspx
    return {
        top: box.top + scrollTop - clientTop,
        left: box.left + scrollLeft - clientLeft
    }
}

//==================================val相关============================

function getValType(el) {
    var ret = el.tagName.toLowerCase()
    return ret === "input" && /checkbox|radio/.test(el.type) ? "checked" : ret
}
var roption = /^<option(?:\s+\w+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s+value[\s=]/i
var valHooks = {
    "option:get": IEVersion ? function(node) {
        //在IE11及W3C，如果没有指定value，那么node.value默认为node.text（存在trim作），但IE9-10则是取innerHTML(没trim操作)
        //specified并不可靠，因此通过分析outerHTML判定用户有没有显示定义value
        return roption.test(node.outerHTML) ? node.value : node.text.trim()
    } : function(node) {
        return node.value
    },
    "select:get": function(node, value) {
        var option, options = node.options,
                index = node.selectedIndex,
                getter = valHooks["option:get"],
                one = node.type === "select-one" || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0
        for (; i < max; i++) {
            option = options[i]
            //旧式IE在reset后不会改变selected，需要改用i === index判定
            //我们过滤所有disabled的option元素，但在safari5下，如果设置select为disable，那么其所有孩子都disable
            //因此当一个元素为disable，需要检测其是否显式设置了disable及其父节点的disable情况
            if ((option.selected || i === index) && !option.disabled) {
                value = getter(option)
                if (one) {
                    return value
                }
                //收集所有selected值组成数组返回
                values.push(value)
            }
        }
        return values
    },
    "select:set": function(node, values, optionSet) {
        values = [].concat(values) //强制转换为数组
        var getter = valHooks["option:get"]
        for (var i = 0, el; el = node.options[i++]; ) {
            if ((el.selected = values.indexOf(getter(el)) > -1)) {
                optionSet = true
            }
        }
        if (!optionSet) {
            node.selectedIndex = -1
        }
    }
}

/*********************************************************************
 *                          编译系统                                  *
 **********************************************************************/
var meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
}
var quote = window.JSON && JSON.stringify || function(str) {
    return '"' + str.replace(/[\\\"\x00-\x1f]/g, function(a) {
        var c = meta[a];
        return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"'
}

var keywords = [
    "break,case,catch,continue,debugger,default,delete,do,else,false",
    "finally,for,function,if,in,instanceof,new,null,return,switch,this",
    "throw,true,try,typeof,var,void,while,with", /* 关键字*/
    "abstract,boolean,byte,char,class,const,double,enum,export,extends",
    "final,float,goto,implements,import,int,interface,long,native",
    "package,private,protected,public,short,static,super,synchronized",
    "throws,transient,volatile", /*保留字*/
    "arguments,let,yield,undefined" /* ECMA 5 - use strict*/].join(",")
var rrexpstr = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g
var rsplit = /[^\w$]+/g
var rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g')
var rnumber = /\b\d[^,]*/g
var rcomma = /^,+|,+$/g
var cacheVars = new Cache(512)
var getVariables = function (code) {
    var key = "," + code.trim()
    var ret = cacheVars.get(key)
    if (ret) {
        return ret
    }
    var match = code
            .replace(rrexpstr, "")
            .replace(rsplit, ",")
            .replace(rkeywords, "")
            .replace(rnumber, "")
            .replace(rcomma, "")
            .split(/^$|,+/)
    return cacheVars.put(key, uniqSet(match))
}
/*添加赋值语句*/

function addAssign(vars, scope, name, data) {
    var ret = [],
            prefix = " = " + name + "."
    for (var i = vars.length, prop; prop = vars[--i]; ) {
        if (scope.hasOwnProperty(prop)) {
            ret.push(prop + prefix + prop)
            data.vars.push(prop)
            if (data.type === "duplex") {
                vars.get = name + "." + prop
            }
            vars.splice(i, 1)
        }
    }
    return ret
}

function uniqSet(array) {
    var ret = [],
            unique = {}
    for (var i = 0; i < array.length; i++) {
        var el = array[i]
        var id = el && typeof el.$id === "string" ? el.$id : el
        if (!unique[id]) {
            unique[id] = ret.push(el)
        }
    }
    return ret
}
//缓存求值函数，以便多次利用
var cacheExprs = new Cache(128)
//取得求值函数及其传参
var rduplex = /\w\[.*\]|\w\.\w/
var rproxy = /(\$proxy\$[a-z]+)\d+$/
var rthimRightParentheses = /\)\s*$/
var rthimOtherParentheses = /\)\s*\|/g
var rquoteFilterName = /\|\s*([$\w]+)/g
var rpatchBracket = /"\s*\["/g
var rthimLeftParentheses = /"\s*\(/g
function parseFilter(val, filters) {
    filters = filters
            .replace(rthimRightParentheses, "")//处理最后的小括号
            .replace(rthimOtherParentheses, function () {//处理其他小括号
                return "],|"
            })
            .replace(rquoteFilterName, function (a, b) { //处理|及它后面的过滤器的名字
                return "[" + quote(b)
            })
            .replace(rpatchBracket, function () {
                return '"],["'
            })
            .replace(rthimLeftParentheses, function () {
                return '",'
            }) + "]"
    return  "return avalon.filters.$filter(" + val + ", " + filters + ")"
}

function parseExpr(code, scopes, data) {
    var dataType = data.type
    var filters = data.filters || ""
    var exprId = scopes.map(function (el) {
        return String(el.$id).replace(rproxy, "$1")
    }) + code + dataType + filters
    var vars = getVariables(code).concat(),
            assigns = [],
            names = [],
            args = [],
            prefix = ""
    //args 是一个对象数组， names 是将要生成的求值函数的参数
    scopes = uniqSet(scopes)
    data.vars = []
    for (var i = 0, sn = scopes.length; i < sn; i++) {
        if (vars.length) {
            var name = "vm" + expose + "_" + i
            names.push(name)
            args.push(scopes[i])
            assigns.push.apply(assigns, addAssign(vars, scopes[i], name, data))
        }
    }
    if (!assigns.length && dataType === "duplex") {
        return
    }
    if (dataType !== "duplex" && (code.indexOf("||") > -1 || code.indexOf("&&") > -1)) {
        //https://github.com/RubyLouvre/avalon/issues/583
        data.vars.forEach(function (v) {
            var reg = new RegExp("\\b" + v + "(?:\\.\\w+|\\[\\w+\\])+", "ig")
            code = code.replace(reg, function (_) {
                var c = _.charAt(v.length)
                var r = IEVersion ? code.slice(arguments[1] + _.length) : RegExp.rightContext
                var method = /^\s*\(/.test(r)
                if (c === "." || c === "[" || method) {//比如v为aa,我们只匹配aa.bb,aa[cc],不匹配aaa.xxx
                    var name = "var" + String(Math.random()).replace(/^0\./, "")
                    if (method) {//array.size()
                        var array = _.split(".")
                        if (array.length > 2) {
                            var last = array.pop()
                            assigns.push(name + " = " + array.join("."))
                            return name + "." + last
                        } else {
                            return _
                        }
                    }
                    assigns.push(name + " = " + _)
                    return name
                } else {
                    return _
                }
            })
        })
    }
    //---------------args----------------
    data.args = args
    //---------------cache----------------
    var fn = cacheExprs.get(exprId) //直接从缓存，免得重复生成
    if (fn) {
        data.evaluator = fn
        return
    }
    prefix = assigns.join(", ")
    if (prefix) {
        prefix = "var " + prefix
    }
    if (/\S/.test(filters)) { //文本绑定，双工绑定才有过滤器
        if (!/text|html/.test(data.type)) {
            throw Error("ms-" + data.type + "不支持过滤器")
        }
        code = "\nvar ret" + expose + " = " + code + ";\r\n"
        code += parseFilter("ret" + expose, filters)
    } else if (dataType === "duplex") { //双工绑定
        var _body = "'use strict';\nreturn function(vvv){\n\t" +
                prefix +
                ";\n\tif(!arguments.length){\n\t\treturn " +
                code +
                "\n\t}\n\t" + (!rduplex.test(code) ? vars.get : code) +
                "= vvv;\n} "
        try {
            fn = Function.apply(noop, names.concat(_body))
            data.evaluator = cacheExprs.put(exprId, fn)
        } catch (e) {
            log("debug: parse error," + e.message)
        }
        return
    } else if (dataType === "on") { //事件绑定
        if (code.indexOf("(") === -1) {
            code += ".call(this, $event)"
        } else {
            code = code.replace("(", ".call(this,")
        }
        names.push("$event")
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
        var lastIndex = code.lastIndexOf("\nreturn")
        var header = code.slice(0, lastIndex)
        var footer = code.slice(lastIndex)
        code = header + "\n" + footer
    } else { //其他绑定
        code = "\nreturn " + code + ";" //IE全家 Function("return ")出错，需要Function("return ;")
    }
    try {
        fn = Function.apply(noop, names.concat("'use strict';\n" + prefix + code))
        data.evaluator = cacheExprs.put(exprId, fn)
    } catch (e) {
        log("debug: parse error," + e.message)
    } finally {
        vars = assigns = names = null //释放内存
    }
}


//parseExpr的智能引用代理

function parseExprProxy(code, scopes, data, tokens, noregister) {
    if (Array.isArray(tokens)) {
        code = tokens.map(function (el) {
            return el.expr ? "(" + el.value + ")" : quote(el.value)
        }).join(" + ")
    }
    parseExpr(code, scopes, data)
    if (data.evaluator && !noregister) {
        data.handler = bindingExecutors[data.handlerName || data.type]
        //方便调试
        //这里非常重要,我们通过判定视图刷新函数的element是否在DOM树决定
        //将它移出订阅者列表
        registerSubscriber(data)
    }
}
avalon.parseExprProxy = parseExprProxy
var bools = ["autofocus,autoplay,async,allowTransparency,checked,controls",
    "declare,disabled,defer,defaultChecked,defaultSelected",
    "contentEditable,isMap,loop,multiple,noHref,noResize,noShade",
    "open,readOnly,selected"].join(",")
var boolMap = {}
bools.replace(rword, function (name) {
    boolMap[name.toLowerCase()] = name
})

var propMap = {//属性名映射
    "accept-charset": "acceptCharset",
    "char": "ch",
    "charoff": "chOff",
    "class": "className",
    "for": "htmlFor",
    "http-equiv": "httpEquiv"
}

var anomaly = ["accessKey,bgColor,cellPadding,cellSpacing,codeBase,codeType,colSpan",
    "dateTime,defaultValue,frameBorder,longDesc,maxLength,marginWidth,marginHeight",
    "rowSpan,tabIndex,useMap,vSpace,valueType,vAlign"].join(",")
anomaly.replace(rword, function (name) {
    propMap[name.toLowerCase()] = name
})

var rnoscripts = /<noscript.*?>(?:[\s\S]+?)<\/noscript>/img
var rnoscriptText = /<noscript.*?>([\s\S]+?)<\/noscript>/im

var getXHR = function () {
    return new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP")// jshint ignore:line
}

var cacheTmpls = avalon.templateCache = {}

bindingHandlers.attr = function (data, vmodels) {
    var text = data.value.trim(),
            simple = true
    if (text.indexOf(openTag) > -1 && text.indexOf(closeTag) > 2) {
        simple = false
        if (rexpr.test(text) && RegExp.rightContext === "" && RegExp.leftContext === "") {
            simple = true
            text = RegExp.$1
        }
    }
    if (data.type === "include") {
        var elem = data.element
        data.includeRendered = getBindingCallback(elem, "data-include-rendered", vmodels)
        data.includeLoaded = getBindingCallback(elem, "data-include-loaded", vmodels)
        var outer = data.includeReplace = !!avalon(elem).data("includeReplace")
        if (avalon(elem).data("includeCache")) {
            data.templateCache = {}
        }
        data.startInclude = DOC.createComment("ms-include")
        data.endInclude = DOC.createComment("ms-include-end")
        if (outer) {
            data.element = data.startInclude
            elem.parentNode.insertBefore(data.startInclude, elem)
            elem.parentNode.insertBefore(data.endInclude, elem.nextSibling)
        } else {
            elem.insertBefore(data.startInclude, elem.firstChild)
            elem.appendChild(data.endInclude)
        }
    }
    data.handlerName = "attr" //handleName用于处理多种绑定共用同一种bindingExecutor的情况
    parseExprProxy(text, vmodels, data, (simple ? 0 : scanExpr(data.value)))
}

bindingExecutors.attr = function (val, elem, data) {
    var method = data.type,
            attrName = data.param
    if (method === "css") {
        avalon(elem).css(attrName, val)
    } else if (method === "attr") {
        // ms-attr-class="xxx" vm.xxx="aaa bbb ccc"将元素的className设置为aaa bbb ccc
        // ms-attr-class="xxx" vm.xxx=false  清空元素的所有类名
        // ms-attr-name="yyy"  vm.yyy="ooo" 为元素设置name属性
        if (boolMap[attrName]) {
            var bool = boolMap[attrName]
            if (typeof elem[bool] === "boolean") {
                // IE6-11不支持动态设置fieldset的disabled属性，IE11下样式是生效了，但无法阻止用户对其底下的input元素进行设值……
                return elem[bool] = !!val
            }
        }
        var toRemove = (val === false) || (val === null) || (val === void 0)

        if (!W3C && propMap[attrName]) { //旧式IE下需要进行名字映射
            attrName = propMap[attrName]
        }
        if (toRemove) {
            return elem.removeAttribute(attrName)
        }
        //SVG只能使用setAttribute(xxx, yyy), VML只能使用elem.xxx = yyy ,HTML的固有属性必须elem.xxx = yyy
        var isInnate = rsvg.test(elem) ? false : (DOC.namespaces && isVML(elem)) ? true : attrName in elem.cloneNode(false)
        if (isInnate) {
            elem[attrName] = val
        } else {
            elem.setAttribute(attrName, val)
        }
    } else if (method === "include" && val) {
        var vmodels = data.vmodels
        var rendered = data.includeRendered
        var loaded = data.includeLoaded
        var replace = data.includeReplace
        var target = replace ? elem.parentNode : elem
        var scanTemplate = function (text) {
            if (loaded) {
                text = loaded.apply(target, [text].concat(vmodels))
            }
            if (rendered) {
                checkScan(target, function () {
                    rendered.call(target)
                }, NaN)
            }
            var lastID = data.includeLastID
            if (data.templateCache && lastID && lastID !== val) {
                var lastTemplate = data.templateCache[lastID]
                if (!lastTemplate) {
                    lastTemplate = data.templateCache[lastID] = DOC.createElement("div")
                    ifGroup.appendChild(lastTemplate)
                }
            }
            data.includeLastID = val
            while (true) {
                var node = data.startInclude.nextSibling
                if (node && node !== data.endInclude) {
                    target.removeChild(node)
                    if (lastTemplate)
                        lastTemplate.appendChild(node)
                } else {
                    break
                }
            }
            var dom = getTemplateNodes(data, val, text)
            var nodes = avalon.slice(dom.childNodes)
            target.insertBefore(dom, data.endInclude)
            scanNodeArray(nodes, vmodels)
        }

        if (data.param === "src") {
            if (cacheTmpls[val]) {
                avalon.nextTick(function () {
                    scanTemplate(cacheTmpls[val])
                })
            } else {
                var xhr = getXHR()
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        var s = xhr.status
                        if (s >= 200 && s < 300 || s === 304 || s === 1223) {
                            scanTemplate(cacheTmpls[val] = xhr.responseText)
                        }
                    }
                }
                xhr.open("GET", val, true)
                if ("withCredentials" in xhr) {
                    xhr.withCredentials = true
                }
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                xhr.send(null)
            }
        } else {
            //IE系列与够新的标准浏览器支持通过ID取得元素（firefox14+）
            //http://tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
            var el = val && val.nodeType === 1 ? val : DOC.getElementById(val)
            if (el) {
                if (el.tagName === "NOSCRIPT" && !(el.innerHTML || el.fixIE78)) { //IE7-8 innerText,innerHTML都无法取得其内容，IE6能取得其innerHTML
                    xhr = getXHR() //IE9-11与chrome的innerHTML会得到转义的内容，它们的innerText可以
                    xhr.open("GET", location, false) //谢谢Nodejs 乱炖群 深圳-纯属虚构
                    xhr.send(null)
                    //http://bbs.csdn.net/topics/390349046?page=1#post-393492653
                    var noscripts = DOC.getElementsByTagName("noscript")
                    var array = (xhr.responseText || "").match(rnoscripts) || []
                    var n = array.length
                    for (var i = 0; i < n; i++) {
                        var tag = noscripts[i]
                        if (tag) { //IE6-8中noscript标签的innerHTML,innerText是只读的
                            tag.style.display = "none" //http://haslayout.net/css/noscript-Ghost-Bug
                            tag.fixIE78 = (array[i].match(rnoscriptText) || ["", "&nbsp;"])[1]
                        }
                    }
                }
                avalon.nextTick(function () {
                    scanTemplate(el.fixIE78 || el.value || el.innerText || el.innerHTML)
                })
            }
        }
    } else {
        if (!root.hasAttribute && typeof val === "string" && (method === "src" || method === "href")) {
            val = val.replace(/&amp;/g, "&") //处理IE67自动转义的问题
        }
        elem[method] = val
        if (window.chrome && elem.tagName === "EMBED") {
            var parent = elem.parentNode //#525  chrome1-37下embed标签动态设置src不能发生请求
            var comment = document.createComment("ms-src")
            parent.replaceChild(comment, elem)
            parent.replaceChild(elem, comment)
        }
    }
}

function getTemplateNodes(data, id, text) {
    var div = data.templateCache && data.templateCache[id]
    if (div) {
        var dom = DOC.createDocumentFragment(), firstChild
        while (firstChild = div.firstChild) {
            dom.appendChild(firstChild)
        }
        return dom
    }
    return  avalon.parseHTML(text)
}

//这几个指令都可以使用插值表达式，如ms-src="aaa/{{b}}/{{c}}.html"
"title,alt,src,value,css,include,href".replace(rword, function (name) {
    bindingHandlers[name] = bindingHandlers.attr
})
//根据VM的属性值或表达式的值切换类名，ms-class="xxx yyy zzz:flag"
//http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
bindingHandlers["class"] = function(data, vmodels) {
    var oldStyle = data.param,
            text = data.value,
            rightExpr
    data.handlerName = "class"
    if (!oldStyle || isFinite(oldStyle)) {
        data.param = "" //去掉数字
        var noExpr = text.replace(rexprg, function(a) {
            return a.replace(/./g, "0")
            //return Math.pow(10, a.length - 1) //将插值表达式插入10的N-1次方来占位
        })
        var colonIndex = noExpr.indexOf(":") //取得第一个冒号的位置
        if (colonIndex === -1) { // 比如 ms-class="aaa bbb ccc" 的情况
            var className = text
        } else { // 比如 ms-class-1="ui-state-active:checked" 的情况
            className = text.slice(0, colonIndex)
            rightExpr = text.slice(colonIndex + 1)
            parseExpr(rightExpr, vmodels, data) //决定是添加还是删除
            if (!data.evaluator) {
                log("debug: ms-class '" + (rightExpr || "").trim() + "' 不存在于VM中")
                return false
            } else {
                data._evaluator = data.evaluator
                data._args = data.args
            }
        }
        var hasExpr = rexpr.test(className) //比如ms-class="width{{w}}"的情况
        if (!hasExpr) {
            data.immobileClass = className
        }
        parseExprProxy("", vmodels, data, (hasExpr ? scanExpr(className) : 0))
    } else {
        data.immobileClass = data.oldStyle = data.param
        parseExprProxy(text, vmodels, data)
    }
}

bindingExecutors ["class"] = function(val, elem, data) {
    var $elem = avalon(elem),
            method = data.type
    if (method === "class" && data.oldStyle) { //如果是旧风格
        $elem.toggleClass(data.oldStyle, !!val)
    } else {
        //如果存在冒号就有求值函数
        data.toggleClass = data._evaluator ? !!data._evaluator.apply(elem, data._args) : true
        data.newClass = data.immobileClass || val
        if (data.oldClass && data.newClass !== data.oldClass) {
            $elem.removeClass(data.oldClass)
        }
        data.oldClass = data.newClass
        switch (method) {
            case "class":
                $elem.toggleClass(data.newClass, data.toggleClass)
                break
            case "hover":
            case "active":
                if (!data.hasBindEvent) { //确保只绑定一次
                    var activate = "mouseenter" //在移出移入时切换类名
                    var abandon = "mouseleave"
                    if (method === "active") { //在聚焦失焦中切换类名
                        elem.tabIndex = elem.tabIndex || -1
                        activate = "mousedown"
                        abandon = "mouseup"
                        var fn0 = $elem.bind("mouseleave", function() {
                            data.toggleClass && $elem.removeClass(data.newClass)
                        })
                    }
                    var fn1 = $elem.bind(activate, function() {
                        data.toggleClass && $elem.addClass(data.newClass)
                    })
                    var fn2 = $elem.bind(abandon, function() {
                        data.toggleClass && $elem.removeClass(data.newClass)
                    })
                    data.rollback = function() {
                        $elem.unbind("mouseleave", fn0)
                        $elem.unbind(activate, fn1)
                        $elem.unbind(abandon, fn2)
                    }
                    data.hasBindEvent = true
                }
                break;
        }
    }
}

"hover,active".replace(rword, function(method) {
    bindingHandlers[method] = bindingHandlers["class"]
})
//ms-controller绑定已经在scanTag 方法中实现
//ms-css绑定已由ms-attr绑定实现


// bindingHandlers.data 定义在if.js
bindingExecutors.data = function(val, elem, data) {
    var key = "data-" + data.param
    if (val && typeof val === "object") {
        elem[key] = val
    } else {
        elem.setAttribute(key, String(val))
    }
}

//双工绑定
var duplexBinding = bindingHandlers.duplex = function (data, vmodels) {
    var elem = data.element,
            hasCast
    parseExprProxy(data.value, vmodels, data, 0, 1)

    data.changed = getBindingCallback(elem, "data-duplex-changed", vmodels) || noop
    if (data.evaluator && data.args) {
        var params = []
        var casting = oneObject("string,number,boolean,checked")
        if (elem.type === "radio" && data.param === "") {
            data.param = "checked"
        }
        if (elem.msData) {
            elem.msData["ms-duplex"] = data.value
        }
        data.param.replace(/\w+/g, function (name) {
            if (/^(checkbox|radio)$/.test(elem.type) && /^(radio|checked)$/.test(name)) {
                if (name === "radio")
                    log("ms-duplex-radio已经更名为ms-duplex-checked")
                name = "checked"
                data.isChecked = true
            }
            if (name === "bool") {
                name = "boolean"
                log("ms-duplex-bool已经更名为ms-duplex-boolean")
            } else if (name === "text") {
                name = "string"
                log("ms-duplex-text已经更名为ms-duplex-string")
            }
            if (casting[name]) {
                hasCast = true
            }
            avalon.Array.ensure(params, name)
        })
        if (!hasCast) {
            params.push("string")
        }
        data.param = params.join("-")
        data.bound = function (type, callback) {
            if (elem.addEventListener) {
                elem.addEventListener(type, callback, false)
            } else {
                elem.attachEvent("on" + type, callback)
            }
            var old = data.rollback
            data.rollback = function () {
                elem.avalonSetter = null
                avalon.unbind(elem, type, callback)
                old && old()
            }
        }
        for (var i in avalon.vmodels) {
            var v = avalon.vmodels[i]
            v.$fire("avalon-ms-duplex-init", data)
        }
        var cpipe = data.pipe || (data.pipe = pipe)
        cpipe(null, data, "init")
        var tagName = elem.tagName
        duplexBinding[tagName] && duplexBinding[tagName](elem, data.evaluator.apply(null, data.args), data)
    }
}
//不存在 bindingExecutors.duplex
function fixNull(val) {
    return val == null ? "" : val
}
avalon.duplexHooks = {
    checked: {
        get: function (val, data) {
            return !data.element.oldValue
        }
    },
    string: {
        get: function (val) { //同步到VM
            return val
        },
        set: fixNull
    },
    "boolean": {
        get: function (val) {
            return val === "true"
        },
        set: fixNull
    },
    number: {
        get: function (val, data) {
            var number = parseFloat(val)
            if (-val === -number) {
                return number
            }
            var arr = /strong|medium|weak/.exec(data.element.getAttribute("data-duplex-number")) || ["medium"]
            switch (arr[0]) {
                case "strong":
                    return 0
                case "medium":
                    return val === "" ? "" : 0
                case "weak":
                    return val
            }
        },
        set: fixNull
    }
}

function pipe(val, data, action, e) {
    data.param.replace(/\w+/g, function (name) {
        var hook = avalon.duplexHooks[name]
        if (hook && typeof hook[action] === "function") {
            val = hook[action](val, data)
        }
    })
    return val
}

var TimerID, ribbon = []

avalon.tick = function (fn) {
    if (ribbon.push(fn) === 1) {
        TimerID = setInterval(ticker, 60)
    }
}

function ticker() {
    for (var n = ribbon.length - 1; n >= 0; n--) {
        var el = ribbon[n]
        if (el() === false) {
            ribbon.splice(n, 1)
        }
    }
    if (!ribbon.length) {
        clearInterval(TimerID)
    }
}

var watchValueInTimer = noop
var rmsinput = /text|password|hidden/
new function () {// jshint ignore:line
    try {//#272 IE9-IE11, firefox
        var setters = {}
        var aproto = HTMLInputElement.prototype
        var bproto = HTMLTextAreaElement.prototype
        function newSetter(value) {// jshint ignore:line
            if (avalon.contains(root, this)) {
                setters[this.tagName].call(this, value)
                if (!rmsinput.test(this.type))
                    return
                if (!this.msFocus && this.avalonSetter) {
                    this.avalonSetter()
                }
            }
        }
        var inputProto = HTMLInputElement.prototype
        Object.getOwnPropertyNames(inputProto) //故意引发IE6-8等浏览器报错
        setters["INPUT"] = Object.getOwnPropertyDescriptor(aproto, "value").set
        Object.defineProperty(aproto, "value", {
            set: newSetter
        })
        setters["TEXTAREA"] = Object.getOwnPropertyDescriptor(bproto, "value").set
        Object.defineProperty(bproto, "value", {
            set: newSetter
        })
    } catch (e) {
        watchValueInTimer = avalon.tick
    }
}// jshint ignore:line

if (IEVersion) {
    avalon.bind(DOC, "selectionchange", function (e) {
        var el = DOC.activeElement
        if (el && typeof el.avalonSetter === "function") {
            el.avalonSetter()
        }
    })
}

//处理radio, checkbox, text, textarea, password
duplexBinding.INPUT = function (element, evaluator, data) {
    var $type = element.type,
            bound = data.bound,
            $elem = avalon(element),
            composing = false

    function callback(value) {
        data.changed.call(this, value, data)
    }

    function compositionStart() {
        composing = true
    }

    function compositionEnd() {
        composing = false
    }
    //当value变化时改变model的值
    var updateVModel = function () {
        if (composing)  //处理中文输入法在minlengh下引发的BUG
            return
        var val = element.oldValue = element.value //防止递归调用形成死循环
        var lastValue = data.pipe(val, data, "get")
        if ($elem.data("duplex-observe") !== false) {
            evaluator(lastValue)
            callback.call(element, lastValue)
            if ($elem.data("duplex-focus")) {
                avalon.nextTick(function () {
                    element.focus()
                })
            }
        }
    }
    //当model变化时,它就会改变value的值
    data.handler = function () {
        var val = data.pipe(evaluator(), data, "set") + ""//fix #673
        if (val !== element.oldValue) {
            element.value = val
        }
    }
    if (data.isChecked || $type === "radio") {
        var IE6 = IEVersion === 6
        updateVModel = function () {
            if ($elem.data("duplex-observe") !== false) {
                var lastValue = data.pipe(element.value, data, "get")
                evaluator(lastValue)
                callback.call(element, lastValue)
            }
        }
        data.handler = function () {
            var val = evaluator()
            var checked = data.isChecked ? !!val : val + "" === element.value
            element.oldValue = checked
            if (IE6) {
                setTimeout(function () {
                    //IE8 checkbox, radio是使用defaultChecked控制选中状态，
                    //并且要先设置defaultChecked后设置checked
                    //并且必须设置延迟
                    element.defaultChecked = checked
                    element.checked = checked
                }, 31)
            } else {
                element.checked = checked
            }
        }
        bound("click", updateVModel)
    } else if ($type === "checkbox") {
        updateVModel = function () {
            if ($elem.data("duplex-observe") !== false) {
                var method = element.checked ? "ensure" : "remove"
                var array = evaluator()
                if (!Array.isArray(array)) {
                    log("ms-duplex应用于checkbox上要对应一个数组")
                    array = [array]
                }
                avalon.Array[method](array, data.pipe(element.value, data, "get"))
                callback.call(element, array)
            }
        }

        data.handler = function () {
            var array = [].concat(evaluator()) //强制转换为数组
            element.checked = array.indexOf(data.pipe(element.value, data, "get")) > -1
        }
        bound(W3C ? "change" : "click", updateVModel)
    } else {
        var events = element.getAttribute("data-duplex-event") || "input"
        if (element.attributes["data-event"]) {
            log("data-event指令已经废弃，请改用data-duplex-event")
        }
        function delay(e) {// jshint ignore:line
            setTimeout(function () {
                updateVModel(e)
            })
        }
        events.replace(rword, function (name) {
            switch (name) {
                case "input":
                    if (!IEVersion) { // W3C
                        bound("input", updateVModel)
                        //非IE浏览器才用这个
                        bound("compositionstart", compositionStart)
                        bound("compositionend", compositionEnd)
                        bound("DOMAutoComplete", updateVModel)
                    } else { //onpropertychange事件无法区分是程序触发还是用户触发
                        // IE下通过selectionchange事件监听IE9+点击input右边的X的清空行为，及粘贴，剪切，删除行为
                        if (IEVersion > 8) {
                            bound("input", updateVModel)//IE9使用propertychange无法监听中文输入改动
                        } else {
                            bound("propertychange", function (e) {//IE6-8下第一次修改时不会触发,需要使用keydown或selectionchange修正
                                if (e.propertyName === "value") {
                                    updateVModel()
                                }
                            })
                        }
                        bound("dragend", delay)
                        //http://www.cnblogs.com/rubylouvre/archive/2013/02/17/2914604.html
                        //http://www.matts411.com/post/internet-explorer-9-oninput/
                    }
                    break
                default:
                    bound(name, updateVModel)
                    break
            }
        })
        bound("focus", function () {
            element.msFocus = true
        })
        bound("blur", function () {
            element.msFocus = false
        })

        if (rmsinput.test($type)) {
            watchValueInTimer(function () {
                if (root.contains(element)) {
                    if (!element.msFocus && element.oldValue !== element.value) {
                        updateVModel()
                    }
                } else if (!element.msRetain) {
                    return false
                }
            })
        }

        element.avalonSetter = updateVModel//#765
    }

    element.oldValue = element.value
    registerSubscriber(data)
    callback.call(element, element.value)
}
duplexBinding.TEXTAREA = duplexBinding.INPUT


duplexBinding.SELECT = function(element, evaluator, data) {
    var $elem = avalon(element)
    function updateVModel() {
        if ($elem.data("duplex-observe") !== false) {
            var val = $elem.val() //字符串或字符串数组
            if (Array.isArray(val)) {
                val = val.map(function(v) {
                    return data.pipe(v, data, "get")
                })
            } else {
                val = data.pipe(val, data, "get")
            }
            if (val + "" !== element.oldValue) {
                evaluator(val)
            }
            data.changed.call(element, val, data)
        }
    }
    data.handler = function() {
        var val = evaluator()
        val = val && val.$model || val
        if (Array.isArray(val)) {
            if (!element.multiple) {
                log("ms-duplex在<select multiple=true>上要求对应一个数组")
            }
        } else {
            if (element.multiple) {
                log("ms-duplex在<select multiple=false>不能对应一个数组")
            }
        }
        //必须变成字符串后才能比较
        val = Array.isArray(val) ? val.map(String) : val + ""
        if (val + "" !== element.oldValue) {
            $elem.val(val)
            element.oldValue = val + ""
        }
    }
    data.bound("change", updateVModel)
    checkScan(element, function() {
        registerSubscriber(data)
        data.changed.call(element, evaluator(), data)
    }, NaN)
}


// bindingHandlers.html 定义在if.js
bindingExecutors.html = function(val, elem, data) {
    val = val == null ? "" : val
    var isHtmlFilter = "group" in data
    var parent = isHtmlFilter ? elem.parentNode : elem
    if (!parent)
        return
    if (val.nodeType === 11) { //将val转换为文档碎片
        var fragment = val
    } else if (val.nodeType === 1 || val.item) {
        var nodes = val.nodeType === 1 ? val.childNodes : val.item ? val : []
        fragment = hyperspace.cloneNode(true)
        while (nodes[0]) {
            fragment.appendChild(nodes[0])
        }
    } else {
        fragment = avalon.parseHTML(val)
    }
    //插入占位符, 如果是过滤器,需要有节制地移除指定的数量,如果是html指令,直接清空
    var comment = DOC.createComment("ms-html")
    if (isHtmlFilter) {
        parent.insertBefore(comment, elem)
        var n = data.group, i = 1
        while (i < n) {
            var node = elem.nextSibling
            if (node) {
                parent.removeChild(node)
                i++
            }
        }
        parent.removeChild(elem)
        data.element = comment //防止被CG
    } else {
        avalon.clearHTML(parent).appendChild(comment)
    }
    if (isHtmlFilter) {
        data.group = fragment.childNodes.length || 1
    }
    nodes = avalon.slice(fragment.childNodes)
    if (nodes[0]) {
        if (comment.parentNode)
            comment.parentNode.replaceChild(fragment, comment)
        if (isHtmlFilter) {
            data.element = nodes[0]
        }
    }
    scanNodeArray(nodes, data.vmodels)
}

bindingHandlers["if"] =
        bindingHandlers.data =
        bindingHandlers.text =
        bindingHandlers.html =
        function(data, vmodels) {
            parseExprProxy(data.value, vmodels, data)
        }

bindingExecutors["if"] = function(val, elem, data) {
    if (val) { //插回DOM树
        if (elem.nodeType === 8) {
            elem.parentNode.replaceChild(data.template, elem)
            elem = data.element = data.template //这时可能为null
        }
        if (elem.getAttribute(data.name)) {
            elem.removeAttribute(data.name)
            scanAttr(elem, data.vmodels)
        }
        data.rollback = null
    } else { //移出DOM树，并用注释节点占据原位置
        if (elem.nodeType === 1) {
            var node = data.element = DOC.createComment("ms-if")
            elem.parentNode.replaceChild(node, elem)
            data.template = elem //元素节点
            ifGroup.appendChild(elem)
            data.rollback = function() {
                if (elem.parentNode === ifGroup) {
                    ifGroup.removeChild(elem)
                }
            }
        }
    }
}


//ms-important绑定已经在scanTag 方法中实现
//ms-include绑定已由ms-attr绑定实现

var rdash = /\(([^)]*)\)/
bindingHandlers.on = function(data, vmodels) {
    var value = data.value
    data.type = "on"
    var eventType = data.param.replace(/-\d+$/, "") // ms-on-mousemove-10
    if (typeof bindingHandlers.on[eventType + "Hook"] === "function") {
        bindingHandlers.on[eventType + "Hook"](data)
    }
    if (value.indexOf("(") > 0 && value.indexOf(")") > -1) {
        var matched = (value.match(rdash) || ["", ""])[1].trim()
        if (matched === "" || matched === "$event") { // aaa() aaa($event)当成aaa处理
            value = value.replace(rdash, "")
        }
    }
    parseExprProxy(value, vmodels, data)
}

bindingExecutors.on = function(callback, elem, data) {
    callback = function(e) {
        var fn = data.evaluator || noop
        return fn.apply(this, data.args.concat(e))
    }
    var eventType = data.param.replace(/-\d+$/, "") // ms-on-mousemove-10
    if (eventType === "scan") {
        callback.call(elem, {
            type: eventType
        })
    } else if (typeof data.specialBind === "function") {
        data.specialBind(elem, callback)
    } else {
        var removeFn = avalon.bind(elem, eventType, callback)
    }
    data.rollback = function() {
        if (typeof data.specialUnbind === "function") {
            data.specialUnbind()
        } else {
            avalon.unbind(elem, eventType, removeFn)
        }
    }
}


bindingHandlers.repeat = function(data, vmodels) {
    var type = data.type
    parseExprProxy(data.value, vmodels, data, 0, 1)
    data.proxies = []
    var freturn = false
    try {
        var $repeat = data.$repeat = data.evaluator.apply(0, data.args || [])
        var xtype = avalon.type($repeat)
        if (xtype !== "object" && xtype !== "array") {
            freturn = true
            avalon.log("warning:" + data.value + "只能是对象或数组")
        }
    } catch (e) {
        freturn = true
    }

    var arr = data.value.split(".") || []
    if (arr.length > 1) {
        arr.pop()
        var n = arr[0]
        for (var i = 0, v; v = vmodels[i++]; ) {
            if (v && v.hasOwnProperty(n)) {
                var events = v[n].$events || {}
                events[subscribers] = events[subscribers] || []
                events[subscribers].push(data)
                break
            }
        }
    }
    var elem = data.element
    elem.removeAttribute(data.name)

    data.sortedCallback = getBindingCallback(elem, "data-with-sorted", vmodels)
    data.renderedCallback = getBindingCallback(elem, "data-" + type + "-rendered", vmodels)
    var signature = generateID(type)
    var comment = data.element = DOC.createComment(signature + ":end")
    data.clone = DOC.createComment(signature)
    hyperspace.appendChild(comment)

    if (type === "each" || type === "with") {
        data.template = elem.innerHTML.trim()
        avalon.clearHTML(elem).appendChild(comment)
    } else {
        data.template = elem.outerHTML.trim()
        elem.parentNode.replaceChild(comment, elem)
    }
    data.template = avalon.parseHTML(data.template)
    data.rollback = function() {
        var elem = data.element
        if (!elem)
            return
        bindingExecutors.repeat.call(data, "clear")
        var parentNode = elem.parentNode
        var content = data.template
        var target = content.firstChild
        parentNode.replaceChild(content, elem)
        var start = data.$stamp
        start && start.parentNode && start.parentNode.removeChild(start)
        target = data.element = data.type === "repeat" ? target : parentNode
    }
    if (freturn) {
        return
    }
    data.handler = bindingExecutors.repeat
    data.$outer = {}
    var check0 = "$key"
    var check1 = "$val"
    if (Array.isArray($repeat)) {
        check0 = "$first"
        check1 = "$last"
    }
    for (i = 0; v = vmodels[i++]; ) {
        if (v.hasOwnProperty(check0) && v.hasOwnProperty(check1)) {
            data.$outer = v
            break
        }
    }
    var $events = $repeat.$events
    var $list = ($events || {})[subscribers]
    if ($list && avalon.Array.ensure($list, data)) {
        addSubscribers(data, $list)
    }
    if (xtype === "object") {
        data.$with = true
        var pool = !$events ? {} : $events.$withProxyPool || ($events.$withProxyPool = {})
        data.handler("append", $repeat, pool)
    } else if ($repeat.length) {
        data.handler("add", 0, $repeat.length)
    }
}

bindingExecutors.repeat = function(method, pos, el) {
    if (method) {
        var data = this
        var end = data.element
        var parent = end.parentNode
        var proxies = data.proxies
        var transation = hyperspace.cloneNode(false)
        switch (method) {
            case "add": //在pos位置后添加el数组（pos为数字，el为数组）
                var n = pos + el
                var array = data.$repeat
                var last = array.length - 1
                var fragments = [], fragment
                var start = locateNode(data, pos)
                for (var i = pos; i < n; i++) {
                    var proxy = eachProxyAgent(i, data)
                    proxies.splice(i, 0, proxy)
                    shimController(data, transation, proxy, fragments)
                }
                parent.insertBefore(transation, start)
                for (i = 0; fragment = fragments[i++]; ) {
                    scanNodeArray(fragment.nodes, fragment.vmodels)
                    fragment.nodes = fragment.vmodels = null
                }
                break
            case "del": //将pos后的el个元素删掉(pos, el都是数字)
                start = proxies[pos].$stamp
                end = locateNode(data, pos + el)
                sweepNodes(start, end)
                var removed = proxies.splice(pos, el)
                recycleProxies(removed, "each")
                break
            case "clear":
                var check = data.$stamp || proxies[0]
                if (check) {
                    start = check.$stamp || check
                    sweepNodes(start, end)
                }
                recycleProxies(proxies, "each")
                break
            case "move":
                start = proxies[0].$stamp
                var signature = start.nodeValue
                var rooms = []
                var room = [], node
                sweepNodes(start, end, function() {
                    room.unshift(this)
                    if (this.nodeValue === signature) {
                        rooms.unshift(room)
                        room = []
                    }
                })
                sortByIndex(proxies, pos)
                sortByIndex(rooms, pos)
                while (room = rooms.shift()) {
                    while (node = room.shift()) {
                        transation.appendChild(node)
                    }
                }
                parent.insertBefore(transation, end)
                break
            case "index": //将proxies中的第pos个起的所有元素重新索引
                last = proxies.length - 1
                for (; el = proxies[pos]; pos++) {
                    el.$index = pos
                    el.$first = pos === 0
                    el.$last = pos === last
                }
                return
            case "set": //将proxies中的第pos个元素的VM设置为el（pos为数字，el任意）
                proxy = proxies[pos]
                if (proxy) {
                    notifySubscribers(proxy.$events.$index)
                }
                return
            case "append": //将pos的键值对从el中取出（pos为一个普通对象，el为预先生成好的代理VM对象池）
                var pool = el
                var keys = []
                fragments = []
                for (var key in pos) { //得到所有键名
                    if (pos.hasOwnProperty(key) && key !== "hasOwnProperty") {
                        keys.push(key)
                    }
                }
                if (data.sortedCallback) { //如果有回调，则让它们排序
                    var keys2 = data.sortedCallback.call(parent, keys)
                    if (keys2 && Array.isArray(keys2) && keys2.length) {
                        keys = keys2
                    }
                }
                for (i = 0; key = keys[i++]; ) {
                    if (key !== "hasOwnProperty") {
                        if (!pool[key]) {
                            pool[key] = withProxyAgent(key, data)
                        }
                        shimController(data, transation, pool[key], fragments)
                    }
                }
                var comment = data.$stamp = data.clone
                parent.insertBefore(comment, end)
                parent.insertBefore(transation, end)
                for (i = 0; fragment = fragments[i++]; ) {
                    scanNodeArray(fragment.nodes, fragment.vmodels)
                    fragment.nodes = fragment.vmodels = null
                }
                break
        }
        if (method === "clear")
            method = "del"
        var callback = data.renderedCallback || noop,
                args = arguments
        checkScan(parent, function() {
            callback.apply(parent, args)
            if (parent.oldValue && parent.tagName === "SELECT") { //fix #503
                avalon(parent).val(parent.oldValue.split(","))
            }
        }, NaN)
    }
}

"with,each".replace(rword, function(name) {
    bindingHandlers[name] = bindingHandlers.repeat
})

function shimController(data, transation, proxy, fragments) {
    var content = data.template.cloneNode(true)
    var nodes = avalon.slice(content.childNodes)
    if (proxy.$stamp) {
        content.insertBefore(proxy.$stamp, content.firstChild)
    }
    transation.appendChild(content)
    var nv = [proxy].concat(data.vmodels)
    var fragment = {
        nodes: nodes,
        vmodels: nv
    }
    fragments.push(fragment)
}

function locateNode(data, pos) {
    var proxy = data.proxies[pos]
    return proxy ? proxy.$stamp : data.element
}

function sweepNodes(start, end, callback) {
    while (true) {
        var node = end.previousSibling
        if (!node)
            break
        node.parentNode.removeChild(node)
        callback && callback.call(node)
        if (node === start) {
            break
        }
    }
}

// 为ms-each,ms-with, ms-repeat会创建一个代理VM，
// 通过它们保持一个下上文，让用户能调用$index,$first,$last,$remove,$key,$val,$outer等属性与方法
// 所有代理VM的产生,消费,收集,存放通过xxxProxyFactory,xxxProxyAgent, recycleProxies,xxxProxyPool实现
var eachProxyPool = []
var withProxyPool = []
function eachProxyFactory(name) {
    var source = {
        $host: [],
        $outer: {},
        $stamp: 1,
        $index: 0,
        $first: false,
        $last: false,
        $remove: avalon.noop
    }
    source[name] = {
        get: function() {
            return this.$host[this.$index]
        },
        set: function(val) {
            this.$host.set(this.$index, val)
        }
    }
    var second = {
        $last: 1,
        $first: 1,
        $index: 1
    }
    var proxy = modelFactory(source, second)
    var e = proxy.$events
    e[name] = e.$first = e.$last = e.$index
    proxy.$id = generateID("$proxy$each")
    return proxy
}

function eachProxyAgent(index, data) {
    var param = data.param || "el", proxy
    for (var i = 0, n = eachProxyPool.length; i < n; i++) {
        var candidate = eachProxyPool[i]
        if (candidate && candidate.hasOwnProperty(param)) {
            proxy = candidate
            eachProxyPool.splice(i, 1)
        }
    }
    if (!proxy) {
        proxy = eachProxyFactory(param)
    }
    var host = data.$repeat
    var last = host.length - 1
    proxy.$index = index
    proxy.$first = index === 0
    proxy.$last = index === last
    proxy.$host = host
    proxy.$outer = data.$outer
    proxy.$stamp = data.clone.cloneNode(false)
    proxy.$remove = function() {
        return host.removeAt(proxy.$index)
    }
    return proxy
}

function withProxyFactory() {
    var proxy = modelFactory({
        $key: "",
        $outer: {},
        $host: {},
        $val: {
            get: function() {
                return this.$host[this.$key]
            },
            set: function(val) {
                this.$host[this.$key] = val
            }
        }
    }, {
        $val: 1
    })
    proxy.$id = generateID("$proxy$with")
    return proxy
}

function withProxyAgent(key, data) {
    var proxy = withProxyPool.pop()
    if (!proxy) {
        proxy = withProxyFactory()
    }
    var host = data.$repeat
    proxy.$key = key
    proxy.$host = host
    proxy.$outer = data.$outer
    if (host.$events) {
        proxy.$events.$val = host.$events[key]
    } else {
        proxy.$events = {}
    }
    return proxy
}

function recycleProxies(proxies, type) {
    var proxyPool = type === "each" ? eachProxyPool : withProxyPool
    avalon.each(proxies, function(key, proxy) {
        if (proxy.$events) {
            for (var i in proxy.$events) {
                if (Array.isArray(proxy.$events[i])) {
                    proxy.$events[i].forEach(function(data) {
                        if (typeof data === "object")
                            disposeData(data)
                    })// jshint ignore:line
                    proxy.$events[i].length = 0
                }
            }
            proxy.$host = proxy.$outer = {}
            if (proxyPool.unshift(proxy) > kernel.maxRepeatSize) {
                proxyPool.pop()
            }
        }
    })
    if (type === "each")
        proxies.length = 0
}




/*********************************************************************
 *                         各种指令                                  *
 **********************************************************************/
//ms-skip绑定已经在scanTag 方法中实现
// bindingHandlers.text 定义在if.js
bindingExecutors.text = function(val, elem) {
    val = val == null ? "" : val //不在页面上显示undefined null
    if (elem.nodeType === 3) { //绑定在文本节点上
        try { //IE对游离于DOM树外的节点赋值会报错
            elem.data = val
        } catch (e) {
        }
    } else { //绑定在特性节点上
        if ("textContent" in elem) {
            elem.textContent = val
        } else {
            elem.innerText = val
        }
    }
}


function parseDisplay(nodeName, val) {
    //用于取得此类标签的默认display值
    var key = "_" + nodeName
    if (!parseDisplay[key]) {
        var node = DOC.createElement(nodeName)
        root.appendChild(node)
        if (W3C) {
            val = getComputedStyle(node, null).display
        } else {
            val = node.currentStyle.display
        }
        root.removeChild(node)
        parseDisplay[key] = val
    }
    return parseDisplay[key]
}

avalon.parseDisplay = parseDisplay

bindingHandlers.visible = function(data, vmodels) {
    var elem = avalon(data.element)
    var display = elem.css("display")
    if (display === "none") {
        var style = elem[0].style
        var has = /visibility/i.test(style.cssText)
        var visible = elem.css("visibility")
        style.display = ""
        style.visibility = "hidden"
        display = elem.css("display")
        if (display === "none") {
            display = parseDisplay(elem[0].nodeName)
        }
        style.visibility = has ? visible : ""
    }
    data.display = display
    parseExprProxy(data.value, vmodels, data)
}

bindingExecutors.visible = function(val, elem, data) {
    elem.style.display = val ? data.display : "none"
}

bindingHandlers.widget = function(data, vmodels) {
    var args = data.value.match(rword)
    var elem = data.element
    var widget = args[0]
    var id = args[1]
    if (!id || id === "$") {//没有定义或为$时，取组件名+随机数
        id = generateID(widget)
    }
    var optName = args[2] || widget//没有定义，取组件名
    var constructor = avalon.ui[widget]
    if (typeof constructor === "function") { //ms-widget="tabs,tabsAAA,optname"
        vmodels = elem.vmodels || vmodels
        for (var i = 0, v; v = vmodels[i++]; ) {
            if (v.hasOwnProperty(optName) && typeof v[optName] === "object") {
                var vmOptions = v[optName]
                vmOptions = vmOptions.$model || vmOptions
                break
            }
        }
        if (vmOptions) {
            var wid = vmOptions[widget + "Id"]
            if (typeof wid === "string") {
                id = wid
            }
        }
        //抽取data-tooltip-text、data-tooltip-attr属性，组成一个配置对象
        var widgetData = avalon.getWidgetData(elem, widget)
        data.value = [widget, id, optName].join(",")
        data[widget + "Id"] = id
        data.evaluator = noop
        elem.msData["ms-widget-id"] = id
        var options = data[widget + "Options"] = avalon.mix({}, constructor.defaults, vmOptions || {}, widgetData)
        elem.removeAttribute("ms-widget")
        var vmodel = constructor(elem, data, vmodels) || {} //防止组件不返回VM
        if (vmodel.$id) {
            avalon.vmodels[id] = vmodel
            createSignalTower(elem, vmodel)
            if (vmodel.hasOwnProperty("$init")) {
                vmodel.$init(function() {
                    avalon.scan(elem, [vmodel].concat(vmodels))
                    if (typeof options.onInit === "function") {
                        options.onInit.call(elem, vmodel, options, vmodels)
                    }
                })
            }
            data.rollback = function() {
                try {
                    vmodel.widgetElement = null
                    vmodel.$remove()
                } catch (e) {
                }
                elem.msData = {}
                delete avalon.vmodels[vmodel.$id]
            }
            addSubscribers(data, widgetList)
            if (window.chrome) {
                elem.addEventListener("DOMNodeRemovedFromDocument", function() {
                    setTimeout(removeSubscribers)
                })
            }
        } else {
            avalon.scan(elem, vmodels)
        }
    } else if (vmodels.length) { //如果该组件还没有加载，那么保存当前的vmodels
        elem.vmodels = vmodels
    }
}
var widgetList = []
//不存在 bindingExecutors.widget
/*********************************************************************
 *                             自带过滤器                            *
 **********************************************************************/
var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim
var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g
var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/ig
var rsanitize = {
    a: /\b(href)\=("javascript[^"]*"|'javascript[^']*')/ig,
    img: /\b(src)\=("javascript[^"]*"|'javascript[^']*')/ig,
    form: /\b(action)\=("javascript[^"]*"|'javascript[^']*')/ig
}
var rsurrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
var rnoalphanumeric = /([^\#-~| |!])/g;

function numberFormat(number, decimals, point, thousands) {
    //form http://phpjs.org/functions/number_format/
    //number	必需，要格式化的数字
    //decimals	可选，规定多少个小数位。
    //point	可选，规定用作小数点的字符串（默认为 . ）。
    //thousands	可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
    number = (number + '')
            .replace(/[^0-9+\-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 3 : Math.abs(decimals),
            sep = thousands || ",",
            dec = point || ".",
            s = '',
            toFixedFix = function(n, prec) {
                var k = Math.pow(10, prec)
                return '' + (Math.round(n * k) / k)
                        .toFixed(prec)
            }
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
            .split('.')
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '')
            .length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1)
                .join('0')
    }
    return s.join(dec)
}


var filters = avalon.filters = {
    uppercase: function(str) {
        return str.toUpperCase()
    },
    lowercase: function(str) {
        return str.toLowerCase()
    },
    truncate: function(str, length, truncation) {
        //length，新字符串长度，truncation，新字符串的结尾的字段,返回新字符串
        length = length || 30
        truncation = truncation === void(0) ? "..." : truncation
        return str.length > length ? str.slice(0, length - truncation.length) + truncation : String(str)
    },
    $filter: function(val) {
        for (var i = 1, n = arguments.length; i < n; i++) {
            var array = arguments[i]
            var fn = avalon.filters[array.shift()]
            if (typeof fn === "function") {
                var arr = [val].concat(array)
                val = fn.apply(null, arr)
            }
        }
        return val
    },
    camelize: camelize,
    //https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    //    <a href="javasc&NewLine;ript&colon;alert('XSS')">chrome</a>
    //    <a href="data:text/html;base64, PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpPg==">chrome</a>
    //    <a href="jav	ascript:alert('XSS');">IE67chrome</a>
    //    <a href="jav&#x09;ascript:alert('XSS');">IE67chrome</a>
    //    <a href="jav&#x0A;ascript:alert('XSS');">IE67chrome</a>
    sanitize: function(str) {
        return str.replace(rscripts, "").replace(ropen, function(a, b) {
            var match = a.toLowerCase().match(/<(\w+)\s/)
            if (match) { //处理a标签的href属性，img标签的src属性，form标签的action属性
                var reg = rsanitize[match[1]]
                if (reg) {
                    a = a.replace(reg, function(s, name, value) {
                        var quote = value.charAt(0)
                        return name + "=" + quote + "javascript:void(0)" + quote// jshint ignore:line
                    })
                }
            }
            return a.replace(ron, " ").replace(/\s+/g, " ") //移除onXXX事件
        })
    },
    escape: function(str) {
        //将字符串经过 str 转义得到适合在页面中显示的内容, 例如替换 < 为 &lt
        return String(str).
                replace(/&/g, '&amp;').
                replace(rsurrogate, function(value) {
                    var hi = value.charCodeAt(0)
                    var low = value.charCodeAt(1)
                    return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';'
                }).
                replace(rnoalphanumeric, function(value) {
                    return '&#' + value.charCodeAt(0) + ';'
                }).
                replace(/</g, '&lt;').
                replace(/>/g, '&gt;')
    },
    currency: function(amount, symbol, fractionSize) {
        return (symbol || "\uFFE5") + numberFormat(amount, isFinite(fractionSize) ? fractionSize : 2)
    },
    number: numberFormat
}
/*
 'yyyy': 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
 'yy': 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
 'y': 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
 'MMMM': Month in year (January-December)
 'MMM': Month in year (Jan-Dec)
 'MM': Month in year, padded (01-12)
 'M': Month in year (1-12)
 'dd': Day in month, padded (01-31)
 'd': Day in month (1-31)
 'EEEE': Day in Week,(Sunday-Saturday)
 'EEE': Day in Week, (Sun-Sat)
 'HH': Hour in day, padded (00-23)
 'H': Hour in day (0-23)
 'hh': Hour in am/pm, padded (01-12)
 'h': Hour in am/pm, (1-12)
 'mm': Minute in hour, padded (00-59)
 'm': Minute in hour (0-59)
 'ss': Second in minute, padded (00-59)
 's': Second in minute (0-59)
 'a': am/pm marker
 'Z': 4 digit (+sign) representation of the timezone offset (-1200-+1200)
 format string can also be one of the following predefined localizable formats:

 'medium': equivalent to 'MMM d, y h:mm:ss a' for en_US locale (e.g. Sep 3, 2010 12:05:08 pm)
 'short': equivalent to 'M/d/yy h:mm a' for en_US locale (e.g. 9/3/10 12:05 pm)
 'fullDate': equivalent to 'EEEE, MMMM d,y' for en_US locale (e.g. Friday, September 3, 2010)
 'longDate': equivalent to 'MMMM d, y' for en_US locale (e.g. September 3, 2010
 'mediumDate': equivalent to 'MMM d, y' for en_US locale (e.g. Sep 3, 2010)
 'shortDate': equivalent to 'M/d/yy' for en_US locale (e.g. 9/3/10)
 'mediumTime': equivalent to 'h:mm:ss a' for en_US locale (e.g. 12:05:08 pm)
 'shortTime': equivalent to 'h:mm a' for en_US locale (e.g. 12:05 pm)
 */
new function() {// jshint ignore:line
    function toInt(str) {
        return parseInt(str, 10) || 0
    }

    function padNumber(num, digits, trim) {
        var neg = ""
        if (num < 0) {
            neg = '-'
            num = -num
        }
        num = "" + num
        while (num.length < digits)
            num = "0" + num
        if (trim)
            num = num.substr(num.length - digits)
        return neg + num
    }

    function dateGetter(name, size, offset, trim) {
        return function(date) {
            var value = date["get" + name]()
            if (offset > 0 || value > -offset)
                value += offset
            if (value === 0 && offset === -12) {
                value = 12
            }
            return padNumber(value, size, trim)
        }
    }

    function dateStrGetter(name, shortForm) {
        return function(date, formats) {
            var value = date["get" + name]()
            var get = (shortForm ? ("SHORT" + name) : name).toUpperCase()
            return formats[get][value]
        }
    }

    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset()
        var paddedZone = (zone >= 0) ? "+" : ""
        paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2)
        return paddedZone
    }
    //取得上午下午

    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1]
    }
    var DATE_FORMATS = {
        yyyy: dateGetter("FullYear", 4),
        yy: dateGetter("FullYear", 2, 0, true),
        y: dateGetter("FullYear", 1),
        MMMM: dateStrGetter("Month"),
        MMM: dateStrGetter("Month", true),
        MM: dateGetter("Month", 2, 1),
        M: dateGetter("Month", 1, 1),
        dd: dateGetter("Date", 2),
        d: dateGetter("Date", 1),
        HH: dateGetter("Hours", 2),
        H: dateGetter("Hours", 1),
        hh: dateGetter("Hours", 2, -12),
        h: dateGetter("Hours", 1, -12),
        mm: dateGetter("Minutes", 2),
        m: dateGetter("Minutes", 1),
        ss: dateGetter("Seconds", 2),
        s: dateGetter("Seconds", 1),
        sss: dateGetter("Milliseconds", 3),
        EEEE: dateStrGetter("Day"),
        EEE: dateStrGetter("Day", true),
        a: ampmGetter,
        Z: timeZoneGetter
    }
    var rdateFormat = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/
    var raspnetjson = /^\/Date\((\d+)\)\/$/
    filters.date = function(date, format) {
        var locate = filters.date.locate,
                text = "",
                parts = [],
                fn, match
        format = format || "mediumDate"
        format = locate[format] || format
        if (typeof date === "string") {
            if (/^\d+$/.test(date)) {
                date = toInt(date)
            } else if (raspnetjson.test(date)) {
                date = +RegExp.$1
            } else {
                var trimDate = date.trim()
                var dateArray = [0, 0, 0, 0, 0, 0, 0]
                var oDate = new Date(0)
                //取得年月日
                trimDate = trimDate.replace(/^(\d+)\D(\d+)\D(\d+)/, function(_, a, b, c) {
                    var array = c.length === 4 ? [c, a, b] : [a, b, c]
                    dateArray[0] = toInt(array[0])     //年
                    dateArray[1] = toInt(array[1]) - 1 //月
                    dateArray[2] = toInt(array[2])     //日
                    return ""
                })
                var dateSetter = oDate.setFullYear
                var timeSetter = oDate.setHours
                trimDate = trimDate.replace(/[T\s](\d+):(\d+):?(\d+)?\.?(\d)?/, function(_, a, b, c, d) {
                    dateArray[3] = toInt(a) //小时
                    dateArray[4] = toInt(b) //分钟
                    dateArray[5] = toInt(c) //秒
                    if (d) {                //毫秒
                        dateArray[6] = Math.round(parseFloat("0." + d) * 1000)
                    }
                    return ""
                })
                var tzHour = 0
                var tzMin = 0
                trimDate = trimDate.replace(/Z|([+-])(\d\d):?(\d\d)/, function(z, symbol, c, d) {
                    dateSetter = oDate.setUTCFullYear
                    timeSetter = oDate.setUTCHours
                    if (symbol) {
                        tzHour = toInt(symbol + c)
                        tzMin = toInt(symbol + d)
                    }
                    return ""
                })

                dateArray[3] -= tzHour
                dateArray[4] -= tzMin
                dateSetter.apply(oDate, dateArray.slice(0, 3))
                timeSetter.apply(oDate, dateArray.slice(3))
                date = oDate
            }
        }
        if (typeof date === "number") {
            date = new Date(date)
        }
        if (avalon.type(date) !== "date") {
            return
        }
        while (format) {
            match = rdateFormat.exec(format)
            if (match) {
                parts = parts.concat(match.slice(1))
                format = parts.pop()
            } else {
                parts.push(format)
                format = null
            }
        }
        parts.forEach(function(value) {
            fn = DATE_FORMATS[value]
            text += fn ? fn(date, locate) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'")
        })
        return text
    }
    var locate = {
        AMPMS: {
            0: "上午",
            1: "下午"
        },
        DAY: {
            0: "星期日",
            1: "星期一",
            2: "星期二",
            3: "星期三",
            4: "星期四",
            5: "星期五",
            6: "星期六"
        },
        MONTH: {
            0: "1月",
            1: "2月",
            2: "3月",
            3: "4月",
            4: "5月",
            5: "6月",
            6: "7月",
            7: "8月",
            8: "9月",
            9: "10月",
            10: "11月",
            11: "12月"
        },
        SHORTDAY: {
            "0": "周日",
            "1": "周一",
            "2": "周二",
            "3": "周三",
            "4": "周四",
            "5": "周五",
            "6": "周六"
        },
        fullDate: "y年M月d日EEEE",
        longDate: "y年M月d日",
        medium: "yyyy-M-d H:mm:ss",
        mediumDate: "yyyy-M-d",
        mediumTime: "H:mm:ss",
        "short": "yy-M-d ah:mm",
        shortDate: "yy-M-d",
        shortTime: "ah:mm"
    }
    locate.SHORTMONTH = locate.MONTH
    filters.date.locate = locate
}// jshint ignore:line
/*********************************************************************
 *                      AMD加载器                                   *
 **********************************************************************/
//https://www.devbridge.com/articles/understanding-amd-requirejs/
//http://maxogden.com/nested-dependencies.html
var modules = avalon.modules = {
    "domReady!": {
        exports: avalon,
        state: 3
    },
    "avalon": {
        exports: avalon,
        state: 4
    }
}
//Object(modules[id]).state拥有如下值
// undefined  没有定义
// 1(send)    已经发出请求
// 2(loading) 已经被执行但还没有执行完成，在这个阶段define方法会被执行
// 3(loaded)  执行完毕，通过onload/onreadystatechange回调判定，在这个阶段checkDeps方法会执行
// 4(execute)  其依赖也执行完毕, 值放到exports对象上，在这个阶段fireFactory方法会执行
modules.exports = modules.avalon

new function () {// jshint ignore:line
    var loadings = [] //正在加载中的模块列表
    var factorys = [] //放置define方法的factory函数
    var rjsext = /\.js$/i
    function makeRequest(name, config) {
//1. 去掉资源前缀
        var res = "js"
        name = name.replace(/^(\w+)\!/, function (a, b) {
            res = b
            return ""
        })
        if (res === "ready") {
            log("debug: ready!已经被废弃，请使用domReady!")
            res = "domReady"
        }
//2. 去掉querystring, hash
        var query = ""
        name = name.replace(rquery, function (a) {
            query = a
            return ""
        })
        //3. 去掉扩展名
        var suffix = "." + res
        var ext = /js|css/.test(suffix) ? suffix : ""
        name = name.replace(/\.[a-z0-9]+$/g, function (a) {
            if (a === suffix) {
                ext = a
                return ""
            } else {
                return a
            }
        })
        var req = avalon.mix({
            query: query,
            ext: ext,
            res: res,
            name: name,
            toUrl: toUrl
        }, config)
        req.toUrl(name)
        return req
    }

    function fireRequest(req) {
        var name = req.name
        var res = req.res
        //1. 如果该模块已经发出请求，直接返回
        var module = modules[name]
        var urlNoQuery = name && req.urlNoQuery
        if (module && module.state >= 1) {
            return name
        }
        module = modules[urlNoQuery]
        if (module && module.state >= 3) {
            innerRequire(module.deps || [], module.factory, urlNoQuery)
            return urlNoQuery
        }
        if (name && !module) {
            module = modules[urlNoQuery] = {
                id: urlNoQuery,
                state: 1 //send
            }
            var wrap = function (obj) {
                resources[res] = obj
                obj.load(name, req, function (a) {
                    if (arguments.length && a !== void 0) {
                        module.exports = a
                    }
                    module.state = 4
                    checkDeps()
                })
            }

            if (!resources[res]) {
                innerRequire([res], wrap)
            } else {
                wrap(resources[res])
            }
        }
        return name ? urlNoQuery : res + "!"
    }

//核心API之一 require
    var requireQueue = []
    var isUserFirstRequire = false
    innerRequire = avalon.require = function (array, factory, parentUrl, defineConfig) {
        if (!isUserFirstRequire) {
            requireQueue.push(avalon.slice(arguments))
            if (arguments.length <= 2) {
                isUserFirstRequire = true
                var queue = requireQueue.splice(0, requireQueue.length), args
                while (args = queue.shift()) {
                    innerRequire.apply(null, args)
                }
            }
            return
        }

        if (!Array.isArray(array)) {
            avalon.error("require方法的第一个参数应为数组 " + array)
        }
        var deps = [] // 放置所有依赖项的完整路径
        var uniq = {}
        var id = parentUrl || "callback" + setTimeout("1")// jshint ignore:line
        defineConfig = defineConfig || {}
        defineConfig.baseUrl = kernel.baseUrl
        var isBuilt = !!defineConfig.built
        if (parentUrl) {
            defineConfig.parentUrl = parentUrl.substr(0, parentUrl.lastIndexOf("/"))
            defineConfig.mapUrl = parentUrl.replace(rjsext, "")
        }
        if (isBuilt) {
            var req = makeRequest(defineConfig.defineName, defineConfig)
            id = req.urlNoQuery
        } else {
            array.forEach(function (name) {
                var req = makeRequest(name, defineConfig)
                var url = fireRequest(req) //加载资源，并返回该资源的完整地址
                if (url) {
                    if (!uniq[url]) {
                        deps.push(url)
                        uniq[url] = "司徒正美" //去重
                    }
                }
            })
        }

        var module = modules[id]
        if (!module || module.state !== 4) {
            modules[id] = {
                id: id,
                deps: isBuilt ? array.concat() : deps,
                factory: factory || noop,
                state: 3
            }
        }
        if (!module) {
            //如果此模块是定义在另一个JS文件中, 那必须等该文件加载完毕, 才能放到检测列队中
            loadings.push(id)
        }
        checkDeps()
    }

//核心API之二 require
    innerRequire.define = function (name, deps, factory) { //模块名,依赖列表,模块本身
        if (typeof name !== "string") {
            factory = deps
            deps = name
            name = "anonymous"
        }
        if (!Array.isArray(deps)) {
            factory = deps
            deps = []
        }
        var config = {
            built: !isUserFirstRequire, //用r.js打包后,所有define会放到requirejs之前
            defineName: name
        }
        var args = [deps, factory, config]
        factory.require = function (url) {
            args.splice(2, 0, url)
            if (modules[url]) {
                modules[url].state = 3 //loaded
                var isCycle = false
                try {
                    isCycle = checkCycle(modules[url].deps, url)
                } catch (e) {
                }
                if (isCycle) {
                    avalon.error(url + "模块与之前的模块存在循环依赖，请不要直接用script标签引入" + url + "模块")
                }
            }
            delete factory.require //释放内存
            innerRequire.apply(null, args) //0,1,2 --> 1,2,0
        }
//根据标准,所有遵循W3C标准的浏览器,script标签会按标签的出现顺序执行。
//老的浏览器中，加载也是按顺序的：一个文件下载完成后，才开始下载下一个文件。
//较新的浏览器中（IE8+ 、FireFox3.5+ 、Chrome4+ 、Safari4+），为了减小请求时间以优化体验，
//下载可以是并行的，但是执行顺序还是按照标签出现的顺序。
//但如果script标签是动态插入的, 就未必按照先请求先执行的原则了,目测只有firefox遵守
//唯一比较一致的是,IE10+及其他标准浏览器,一旦开始解析脚本, 就会一直堵在那里,直接脚本解析完毕
//亦即，先进入loading阶段的script标签(模块)必然会先进入loaded阶段
        var url = config.built ? "unknown" : getCurrentScript()
        if (url) {
            var module = modules[url]
            if (module) {
                module.state = 2
            }
            factory.require(url)
        } else {//合并前后的safari，合并后的IE6-9走此分支
            factorys.push(factory)
        }
    }
//核心API之三 require.config(settings)
    innerRequire.config = kernel
    //核心API之四 define.amd 标识其符合AMD规范
    innerRequire.define.amd = modules

    //==========================对用户配置项进行再加工==========================
    var allpaths = kernel["orig.paths"] = {}
    var allmaps = kernel["orig.map"] = {}
    var allpackages = kernel["packages"] = []
    var allargs = kernel["orig.args"] = {}
    avalon.mix(plugins, {
        paths: function (hash) {
            avalon.mix(allpaths, hash)
            kernel.paths = makeIndexArray(allpaths)
        },
        map: function (hash) {
            avalon.mix(allmaps, hash)
            var list = makeIndexArray(allmaps, 1, 1)
            avalon.each(list, function (_, item) {
                item.val = makeIndexArray(item.val)
            })
            kernel.map = list
        },
        packages: function (array) {
            array = array.concat(allpackages)
            var uniq = {}
            var ret = []
            for (var i = 0, pkg; pkg = array[i++]; ) {
                pkg = typeof pkg === "string" ? {name: pkg} : pkg
                var name = pkg.name
                if (!uniq[name]) {
                    var url = pkg.location ? pkg.location : joinPath(name, pkg.main || "main")
                    url = url.replace(rjsext, "")
                    ret.push(pkg)
                    uniq[name] = pkg.location = url
                    pkg.reg = makeMatcher(name)
                }
            }
            kernel.packages = ret.sort()
        },
        urlArgs: function (hash) {
            if (typeof hash === "string") {
                hash = {"*": hash}
            }
            avalon.mix(allargs, hash)
            kernel.urlArgs = makeIndexArray(allargs, 1)
        },
        baseUrl: function (url) {
            if (!isAbsUrl(url)) {
                var baseElement = head.getElementsByTagName("base")[0]
                if (baseElement) {
                    head.removeChild(baseElement)
                }
                var node = DOC.createElement("a")
                node.href = url
                url = getFullUrl(node, "href")
                if (baseElement) {
                    head.insertBefore(baseElement, head.firstChild)
                }
            }
            if (url.length > 3)
                kernel.baseUrl = url
        },
        shim: function (obj) {
            for (var i in obj) {
                var value = obj[i]
                if (Array.isArray(value)) {
                    value = obj[i] = {
                        deps: value
                    }
                }
                if (!value.exportsFn && (value.exports || value.init)) {
                    value.exportsFn = makeExports(value)
                }
            }
            kernel.shim = obj
        }

    })


    //==============================内部方法=================================
    function checkCycle(deps, nick) {
        //检测是否存在循环依赖
        for (var i = 0, id; id = deps[i++]; ) {
            if (modules[id].state !== 4 &&
                    (id === nick || checkCycle(modules[id].deps, nick))) {
                return true
            }
        }
    }

    function checkFail(node, onError, fuckIE) {
        var id = trimQuery(node.src) //检测是否死链
        node.onload = node.onreadystatechange = node.onerror = null
        if (onError || (fuckIE && modules[id] && !modules[id].state)) {
            setTimeout(function () {
                head.removeChild(node)
                node = null // 处理旧式IE下的循环引用问题
            })
            log("debug: 加载 " + id + " 失败" + onError + " " + (!modules[id].state))
        } else {
            return true
        }
    }

    function checkDeps() {
        //检测此JS模块的依赖是否都已安装完毕,是则安装自身
        loop: for (var i = loadings.length, id; id = loadings[--i]; ) {
            var obj = modules[id],
                    deps = obj.deps
            if (!deps)
                continue
            for (var j = 0, key; key = deps[j]; j++) {
                if (Object(modules[key]).state !== 4) {
                    continue loop
                }
            }
            //如果deps是空对象或者其依赖的模块的状态都是2
            if (obj.state !== 4) {
                loadings.splice(i, 1) //必须先移除再安装，防止在IE下DOM树建完后手动刷新页面，会多次执行它
                fireFactory(obj.id, obj.deps, obj.factory)
                checkDeps() //如果成功,则再执行一次,以防有些模块就差本模块没有安装好
            }
        }
    }

    var rreadyState = DOC.documentMode >= 8 ? /loaded/ : /complete|loaded/
    function loadJS(url, id, callback) {
        //通过script节点加载目标模块
        var node = DOC.createElement("script")
        node.className = subscribers //让getCurrentScript只处理类名为subscribers的script节点
        var timeID
        var supportLoad = "onload" in node
        var onEvent = supportLoad ? "onload" : "onreadystatechange"
        function onload() {
            if (!"1"[0] && !timeID) {
                return timeID = setTimeout(onload, 150)
            }
            if (supportLoad || rreadyState.test(node.readyState)) {
                clearTimeout(timeID)
                var factory = factorys.pop()
                factory && factory.require(id)
                if (callback) {
                    callback()
                }
                if (checkFail(node, false, !supportLoad)) {
                    log("debug: 已成功加载 " + url)
                    id && loadings.push(id)
                    checkDeps()
                }
            }
        }
        node[onEvent] = onload
        node.onerror = function () {
            checkFail(node, true)
        }

        head.insertBefore(node, head.firstChild) //chrome下第二个参数不能为null
        node.src = url //插入到head的第一个节点前，防止IE6下head标签没闭合前使用appendChild抛错
        log("debug: 正准备加载 " + url) //更重要的是IE6下可以收窄getCurrentScript的寻找范围
    }

    var resources = innerRequire.plugins = {
        //三大常用资源插件 js!, css!, text!, ready!
        ready: {
            load: noop
        },
        js: {
            load: function (name, req, onLoad) {
                var url = req.url
                var id = req.urlNoQuery
                var shim = kernel.shim[name.replace(rjsext, "")]
                if (shim) { //shim机制
                    innerRequire(shim.deps || [], function () {
                        var args = avalon.slice(arguments)
                        loadJS(url, id, function () {
                            onLoad(shim.exportsFn ? shim.exportsFn.apply(0, args) : void 0)
                        })
                    })
                } else {
                    loadJS(url, id)
                }
            }
        },
        css: {
            load: function (name, req, onLoad) {
                var url = req.url
                var node = DOC.createElement("link")
                node.rel = "stylesheet"
                node.href = url
                head.insertBefore(node, head.firstChild)
                log("debug: 已成功加载 " + url)
                onLoad()
            }
        },
        text: {
            load: function (name, req, onLoad) {
                var url = req.url
                var xhr = getXHR()
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        var status = xhr.status;
                        if (status > 399 && status < 600) {
                            avalon.error(url + " 对应资源不存在或没有开启 CORS")
                        } else {
                            log("debug: 已成功加载 " + url)
                            onLoad(xhr.responseText)
                        }
                    }
                }
                xhr.open("GET", url, true)
                if ("withCredentials" in xhr) {//这是处理跨域
                    xhr.withCredentials = true
                }
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")//告诉后端这是AJAX请求
                xhr.send()
                log("debug: 正准备加载 " + url)
            }
        }
    }
    innerRequire.checkDeps = checkDeps

    var rquery = /(\?[^#]*)$/
    function trimQuery(url) {
        return (url || "").replace(rquery, "")
    }

    function isAbsUrl(path) {
        //http://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
        return  /^(?:[a-z]+:)?\/\//i.test(String(path))
    }

    function getFullUrl(node, src) {
        return"1"[0] ? node[src] : node.getAttribute(src, 4)
    }

    function getCurrentScript() {
        // inspireb by https://github.com/samyk/jiagra/blob/master/jiagra.js
        var stack
        try {
            a.b.c() //强制报错,以便捕获e.stack
        } catch (e) { //safari5的sourceURL，firefox的fileName，它们的效果与e.stack不一样
            stack = e.stack
            if (!stack && window.opera) {
                //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
                stack = (String(e).match(/of linked script \S+/g) || []).join(" ")
            }
        }
        if (stack) {
            /**e.stack最后一行在所有支持的浏览器大致如下:
             *chrome23:
             * at http://113.93.50.63/data.js:4:1
             *firefox17:
             *@http://113.93.50.63/query.js:4
             *opera12:http://www.oldapps.com/opera.php?system=Windows_XP
             *@http://113.93.50.63/data.js:4
             *IE10:
             *  at Global code (http://113.93.50.63/data.js:4:1)
             *  //firefox4+ 可以用document.currentScript
             */
            stack = stack.split(/[@ ]/g).pop() //取得最后一行,最后一个空格或@之后的部分
            stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, "") //去掉换行符
            return trimQuery(stack.replace(/(:\d+)?:\d+$/i, "")) //去掉行号与或许存在的出错字符起始位置
        }
        var nodes = head.getElementsByTagName("script") //只在head标签中寻找
        for (var i = nodes.length, node; node = nodes[--i]; ) {
            if (node.className === subscribers && node.readyState === "interactive") {
                var url = getFullUrl(node, "src")
                return node.className = trimQuery(url)
            }
        }
    }

    var rcallback = /^callback\d+$/
    function fireFactory(id, deps, factory) {
        var module = Object(modules[id])
        module.state = 4
        for (var i = 0, array = [], d; d = deps[i++]; ) {
            if (d === "exports") {
                var obj = module.exports || (module.exports = {})
                array.push(obj)
            } else {
                array.push(modules[d].exports)
            }
        }
        try {
            var ret = factory.apply(window, array)
        } catch (e) {
            log("执行["+id+"]模块的factory抛错： "+ e)
        }
        if (ret !== void 0) {
            module.exports = ret
        }
        if(rcallback.test(id)){
            delete modules[id]
        }
        delete module.factory
        return ret
    }
    function toUrl(id) {
        if (id.indexOf(this.res + "!") === 0) {
            id = id.slice(this.res.length + 1) //处理define("css!style",[], function(){})的情况
        }
        var url = id
        //1. 是否命中paths配置项
        var usePath = 0
        var baseUrl = this.baseUrl
        var rootUrl = this.parentUrl || baseUrl
        eachIndexArray(id, kernel.paths, function (value, key) {
            url = url.replace(key, value)
            usePath = 1
        })
        //2. 是否命中packages配置项
        if (!usePath) {
            eachIndexArray(id, kernel.packages, function (value, key, item) {
                url = url.replace(item.name, item.location)
            })
        }
        //3. 是否命中map配置项
        if (this.mapUrl) {
            eachIndexArray(this.mapUrl, kernel.map, function (array) {
                eachIndexArray(url, array, function (mdValue, mdKey) {
                    url = url.replace(mdKey, mdValue)
                    rootUrl = baseUrl
                })
            })
        }
        var ext = this.ext
        if (ext && usePath && url.slice(-ext.length) === ext) {
            url = url.slice(0, -ext.length)
        }
        //4. 转换为绝对路径
        if (!isAbsUrl(url)) {
            rootUrl = this.built || /^\w/.test(url) ? baseUrl : rootUrl
            url = joinPath(rootUrl, url)
        }
        //5. 还原扩展名，query
        var urlNoQuery = url + ext
        url = urlNoQuery + this.query
        //6. 处理urlArgs
        eachIndexArray(id, kernel.urlArgs, function (value) {
            url += (url.indexOf("?") === -1 ? "?" : "&") + value;
        })
        this.url = url
        return  this.urlNoQuery = urlNoQuery
    }

    function makeIndexArray(hash, useStar, part) {
        //创建一个经过特殊算法排好序的数组
        var index = hash2array(hash, useStar, part)
        index.sort(descSorterByName)
        return index
    }

    function makeMatcher(prefix) {
        return new RegExp('^' + prefix + '(/|$)')
    }

    function makeExports(value) {
        return function () {
            var ret
            if (value.init) {
                ret = value.init.apply(window, arguments)
            }
            return ret || (value.exports && getGlobal(value.exports))
        }
    }


    function hash2array(hash, useStar, part) {
        var array = [];
        for (var key in hash) {
            if (ohasOwn.call(hash, key)) {
                var item = {
                    name: key,
                    val: hash[key]
                }
                array.push(item)
                item.reg = key === "*" && useStar ? /^/ : makeMatcher(key)
                if (part && key !== "*") {
                    item.reg = new RegExp('\/' + key.replace(/^\//, "") + '(/|$)')
                }
            }
        }
        return array
    }

    function eachIndexArray(moduleID, array, matcher) {
        array = array || []
        for (var i = 0, el; el = array[i++]; ) {
            if (el.reg.test(moduleID)) {
                matcher(el.val, el.name, el)
                return false
            }
        }
    }
    // 根据元素的name项进行数组字符数逆序的排序函数
    function descSorterByName(a, b) {
        var aaa = a.name
        var bbb = b.name
        if (bbb === "*") {
            return -1
        }
        if (aaa === "*") {
            return 1
        }
        return bbb.length - aaa.length
    }

    var rdeuce = /\/\w+\/\.\./
    function joinPath(a, b) {
        if (a.charAt(a.length - 1) !== "/") {
            a += "/"
        }
        if (b.slice(0, 2) === "./") { //相对于兄弟路径
            return a + b.slice(2)
        }
        if (b.slice(0, 2) === "..") { //相对于父路径
            a += b
            while (rdeuce.test(a)) {
                a = a.replace(rdeuce, "")
            }
            return a
        }
        if (b.slice(0, 1) === "/") {
            return a + b.slice(1)
        }
        return a + b
    }

    function getGlobal(value) {
        if (!value) {
            return value
        }
        var g = window
        value.split(".").forEach(function (part) {
            g = g[part]
        })
        return g
    }

    var mainNode = DOC.scripts[DOC.scripts.length - 1]
    var dataMain = mainNode.getAttribute("data-main")
    if (dataMain) {
        plugins.baseUrl(dataMain)
        var href = kernel.baseUrl
        kernel.baseUrl = href.slice(0, href.lastIndexOf("/") + 1)
        loadJS(href.replace(rjsext, "") + ".js")
    } else {
        var loaderUrl = trimQuery(getFullUrl(mainNode, "src"))
        kernel.baseUrl = loaderUrl.slice(0, loaderUrl.lastIndexOf("/") + 1)
    }
}// jshint ignore:line

/*********************************************************************
 *                           DOMReady                               *
 **********************************************************************/

var readyList = [], isReady
var fireReady = function(fn) {
    isReady = true
    if (innerRequire) {
        modules["domReady!"].state = 4
        innerRequire.checkDeps()
    }
    while(fn = readyList.shift()){
        fn(avalon)
    }
}

function doScrollCheck() {
    try { //IE下通过doScrollCheck检测DOM树是否建完
        root.doScroll("left")
        fireReady()
    } catch (e) {
        setTimeout(doScrollCheck)
    }
}

if (DOC.readyState === "complete") {
    setTimeout(fireReady) //如果在domReady之外加载
} else if (W3C) {
    DOC.addEventListener("DOMContentLoaded", fireReady)
} else {
    DOC.attachEvent("onreadystatechange", function() {
        if (DOC.readyState === "complete") {
            fireReady()
        }
    })
    try {
        var isTop = window.frameElement === null
    } catch (e) {
    }
    if (root.doScroll && isTop && window.external) {//fix IE iframe BUG
        doScrollCheck()
    }
}
avalon.bind(window, "load", fireReady)

avalon.ready = function(fn) {
    if (!isReady) {
        readyList.push(fn)
    } else {
        fn(avalon)
    }
}

avalon.config({
    loader: true
})

avalon.ready(function() {
    avalon.scan(DOC.body)
})

// Register as a named AMD module, since avalon can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase avalon is used because AMD module names are
// derived from file names, and Avalon is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of avalon, it will work.

// Note that for maximum portability, libraries that are not avalon should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. avalon is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
    if (typeof define === "function" && define.amd) {
        define("avalon", [], function() {
            return avalon
        })
    }
// Map over avalon in case of overwrite
    var _avalon = window.avalon
    avalon.noConflict = function(deep) {
        if (deep && window.avalon === avalon) {
            window.avalon = _avalon
        }
        return avalon
    }
// Expose avalon identifiers, even in AMD
// and CommonJS for browser emulators
    if (noGlobal === void 0) {
        window.avalon = avalon
    }
    return avalon

}));


    })( module.exports , module , __context );
    __context.____MODULES[ "7022635b9ee0dac32976a1a5d854c9f8" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "f9bdfeae993c58aeb4557e4b3b897a7a" , 
        filename : "avalon.live.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var DOC = document
var root = DOC.documentElement
var IEEventMap = {
    "change": "click",
    "focus": "focusin",
    "blur": "focusout"
}
function getVal(elem) {
    var type = elem.type
    if (type === "select-multiple") {
        if (elem.selectedIndex > -1) {
            var ret = []
            for (var i = 0, el; el = elem.options[i++]; ) {
                ret.push(el.selected)
            }
            return ret.join("-")
        } else {
            return ""
        }

    } else if (elem.nodeName.toLowerCase() === "select") {
        return  elem.selectedIndex;
    }

    return  elem.value
}

function testChange(e) {
    var callbacks = liveMap["fixChangechange"]
    var target = e.target
    for (var i = callbacks.length, obj; obj = callbacks[--i]; ) {
        var elem = obj.elem
        if (root.contains(elem)) {
            if (elem === target) {
                var curVal = getVal(elem)
                if (obj.__change__ !== curVal) {
                    e.type = "change"
                    obj.fn.call(elem, e)
                    obj.__change__ = curVal
                }
            }
        } else {
            dequeue(callbacks, obj, i)
        }
    }
}
function dequeue(callbacks, obj, i) {
    var parent = obj.elem.parentNode
    if (!parent || parent.nodeType == 11) {
        callbacks.splice(i, 1)
    }
}
var liveMap = avalon.bindingHandlers.live = function(data, vmodels) {
    var type = data.param
    var elem = data.element
    var live = "noFix"
    data.type = 'on'
    if (!DOC.createEvent) {
        if (/focus|blur/.test(type)) {
            live = "fixFocus"//旧式IE下使用focusin与focusout来模拟focus、blur，使用click来模拟复选框，单选框的change事件
        } else if (type == "change") {
            var elemType = elem.type
            if (elemType == "radio" || elemType === "checkbox") {
                live = "fixFocus"
                if (!("_just_changed" in elem)) {//确保只绑定一次
                    elem._just_changed = false
                    elem.attachEvent("onpropertychange", function(e) {
                        if (e.propertyName == "checked") {
                            elem._just_changed = true
                        }
                    })
                }
            } else {
                live = "fixChange"
            }
        } else if (/submit|reset|select/.test(type)) {
            live = false//对于一些模拟成本太大的事件直接使用普通的事件绑定
        }
    }

    if (live) {
        if (!liveMap[live + type]) {
            liveMap[live + type] = []
            if (live === "noFix") {
                avalon.bind(DOC, type, function(e) {//W3C
                    var callbacks = liveMap[live + type]
                    var target = e.target
                    for (var i = callbacks.length, obj; obj = callbacks[--i]; ) {
                        if (root.contains(obj.elem)) {
                            if (obj.elem === target || obj.elem.contains(target)) {
                                obj.fn.call(obj.elem, e)
                            }
                        } else {
                            dequeue(callbacks, obj, i)
                        }
                    }
                }, true)
            }

            if (live === "fixFocus") {//旧式浏览器的focus，blur，单选框与复选枉的change
                avalon.bind(DOC, IEEventMap[type], function(e) {
                    var callbacks = liveMap[live + type]
                    var target = e.target
                    for (var i = callbacks.length, obj; obj = callbacks[--i]; ) {
                        var elem = obj.elem
                        if (root.contains(elem)) {
                            if (elem === target || elem.contains(target)) {
                                if (type === "change") {
                                    if (elem._just_changed === true) {
                                        e.type = "change"
                                        obj.fn.call(elem, e)
                                        elem._just_changed = false
                                    }
                                } else {
                                    e.type = type
                                    obj.fn.call(elem, e)
                                }
                            }
                        } else {
                            dequeue(callbacks, obj, i)
                        }
                    }
                })

            }
            if (live === "fixChange") {
                avalon.bind(DOC, "beforeactivate", testChange)
                avalon.bind(DOC, "beforedeactivate", testChange)
            }
        }
        data.specialBind = function(elem, fn) {
            var obj = {
                elem: elem,
                fn: fn
            }
            if (/focus|blur/.test(type)) {
                elem.tabIndex = elem.tabIndex || -1
            }
            if (live === "fixChange") {
                obj.__change__ = getVal(elem)
            }
            var callbacks = liveMap[live + type]
            callbacks.unshift(obj)
            data.specialUnbind = function() {
                avalon.Array.remove(callbacks, obj)
                delete data.specialBind
                delete data.specialUnbind
            }
        }
    }

    avalon.bindingHandlers.on(data, vmodels)
}

    })( module.exports , module , __context );
    __context.____MODULES[ "f9bdfeae993c58aeb4557e4b3b897a7a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "2ab11dddd1a66c979fc4d8cb729fc348" , 
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['7022635b9ee0dac32976a1a5d854c9f8'];
__context.____MODULES['f9bdfeae993c58aeb4557e4b3b897a7a'];

avalon.config({
    loader: false
});

avalon.$ui = function( id ) {
    return avalon.vmodels[id];
};

window.avalon = window.$$ = avalon;

avalon.assign = assign;

function assign( obj , value ) {

    /*
        如果是数组，先mock个对象作为数组的宿主
     */
    if( avalon.type(obj) === 'array'){
        value = avalon.mix(true,{},{_:value});
        obj = {_:obj};
    }else{
        value = avalon.mix( true , {} , value );
    }

    for( var i in obj ) {
        if( typeof value[i] == 'undefined' || !obj.hasOwnProperty(i) || i === 'hasOwnProperty' ) continue;
        switch( avalon.type(obj[i]) ) {
            case 'object':
                assign( obj[i] , value[i] );
                break;
            case 'array':
                avalon.each( value[i] , function(idx,v){

                    var type = typeof obj[i][idx];

                    if( type === 'object' && obj[i][idx] !== null){
                        assign(obj[i][idx],v);
                    }else{
                        if(idx >= obj[i].size()){
                            obj[i].push(v);
                        }else{
                            obj[i].set(idx,v);
                        }

                    }


                });

                while(obj[i].length > value[i].length){
                    obj[i].pop();
                }
                break;
            default:
                obj[i] = value[i];
                break;
        }
    }
}

function testVM( expr , vm ) {
    var t = vm,
        pre;
    for( var i = 0; i < expr.length; i++ ) {
        var k = expr[i];
        if( typeof t[k] !== 'undefined' ) {
            pre = t;
            t = t[k];
        } else {
            return;
        }
    }

    return pre;
}

/*
    返回参数
    [
        expr以.分割的最后一位
        expr最后一位的model，结合第一个元素就可以$watch
        匹配expr的vmodel
    ]
*/
avalon.getModel = function( expr , vmodels ){
    var e = expr.split('.');
    for( var i = 0; i < vmodels.length; i++ ) {
        var vm = vmodels[i];
        var m = testVM( e , vm);

        if( typeof m !== 'undefined' ) return [ e[e.length-1] , m , vm ];
    }
    return null;
}

module.exports = avalon;


    })( module.exports , module , __context );
    __context.____MODULES[ "2ab11dddd1a66c979fc4d8cb729fc348" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "ebe019d268672b2e5098adbedeb01097" , 
        filename : "avalon.button.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    var baseClasses = [
            'oni-button',
            'oni-widget',
            'oni-state-default'
        ], typeClasses = 'oni-button-icons-only oni-button-icon-only oni-button-text-icons oni-button-text-icon-primary oni-button-text-icon-secondary oni-button-text-only';
    var widget = avalon.ui.button = function (element, data, vmodels) {
            var options = data.buttonOptions, btnModel, $element = avalon(element);
            function stop(event) {
                if (options.disabled) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }
            btnModel = {
                $init: function () {
                    var data = options.data, elementType = '', label = options.label, buttonWidth = 0, elementTagName = element.tagName.toLowerCase();
                    if (options.groups && data.length > 1) {
                        var buttons = '';
                        data.forEach(function (button, index) {
                            var buttonStr = '<span ms-widget=\'button\'';
                            if (button.type !== void 0) {
                                buttonStr += ' data-button-type=\'' + button.type + '\'';
                            }
                            if (button.iconPosition !== void 0) {
                                buttonStr += ' data-button-icon-position=\'' + button.iconPosition + '\'';
                            }
                            if (button.icon !== void 0) {
                                buttonStr += ' data-button-icon=\'' + button.icon + '\'';
                            }
                            if (button.color !== void 0) {
                                buttonStr += ' data-button-color=\'' + button.color + '\'';
                            }
                            if (button.size !== void 0) {
                                buttonStr += ' data-button-size=\'' + button.size + '\'';
                            }
                            if (button.disabled !== void 0) {
                                buttonStr += ' data-button-disabled=\'' + button.disabled + '\'';
                            }
                            if (button.label !== void 0) {
                                buttonStr += ' data-button-label=\'' + button.label + '\'';
                            }
                            buttonStr += '>' + (button.text || '') + '</span>';
                            buttons += buttonStr;
                        });
                        element.innerHTML = buttons;
                        element.setAttribute('ms-widget', 'buttonset');
                        if (options.direction == 'vertical') {
                            element.setAttribute('data-buttonset-direction', 'vertical');
                        }
                        if (!options.corner) {
                            element.setAttribute('data-buttonset-corner', options.corner);
                        }
                        if (options.width) {
                            element.setAttribute('data-buttonset-width', parseInt(options.width));
                        }
                        avalon.scan(element, vmodels);
                        return;
                    }
                    if (typeof options.disabled !== 'boolean') {
                        options.disabled = !!element.disabled;
                    } else {
                        element.disabled = options.disabled;
                    }
                    if (elementTagName === 'input') {
                        elementType = 'input';
                    }
                    if (buttonWidth = parseInt(options.width)) {
                        element.style.width = buttonWidth + 'px';
                    }
                    $element.bind('mousedown', function (event) {
                        stop(event);
                        $element.addClass('oni-state-active');
                    });
                    $element.bind('mouseup', function (event) {
                        stop(event);
                        $element.removeClass('oni-state-active');
                    });
                    $element.bind('blur', function () {
                        $element.removeClass('oni-state-active');
                        $element.removeClass('oni-state-focus');
                    });
                    $element.bind('focus', function () {
                        $element.addClass('oni-state-focus');
                    });
                    if (!options.label) {
                        label = elementType === 'input' ? element.value : element.innerHTML;
                    }
                    options.elementType = elementType;
                    options.label = label;
                    createButton(element, options);
                    avalon.scan(element, vmodels);
                }
            };
            btnModel.$init();
        };
    avalon.ui.buttonset = function (element, data, vmodels) {
        var options = data.buttonsetOptions, buttonsetCorner = options.corner, direction = options.direction, $element = avalon(element);
        buttonsetCorner = buttonsetCorner !== void 0 ? buttonsetCorner : true;
        var btnGroup = {
                $init: function () {
                    var elementClass = [];
                    elementClass.push('oni-buttonset'), firstButtonClass = 'oni-corner-left', lastButtonClass = 'oni-corner-right', children = element.childNodes, buttons = [];
                    // 收集button组元素
                    buttonWidth = options.width, firstElement = true;
                    for (var i = 0, el; el = children[i++];) {
                        if (el.nodeType === 1) {
                            el.setAttribute('data-button-corner', 'false');
                            buttons.push(el);
                            if (firstElement) {
                                avalon(el).addClass('oni-button-first');
                                firstElement = false;
                            }
                        }
                    }
                    var n = buttons.length;
                    if (n && buttonsetCorner) {
                        if (direction === 'vertical') {
                            firstButtonClass = 'oni-corner-top';
                            lastButtonClass = 'oni-corner-bottom';
                        }
                        avalon(buttons[0]).addClass(firstButtonClass);
                        avalon(buttons[n - 1]).addClass(lastButtonClass);
                    }
                    if (direction === 'vertical') {
                        elementClass.push('oni-buttonset-vertical');
                    }
                    $element.addClass(elementClass.join(' '));
                    data.buttons = buttons;
                    avalon.scan(element, vmodels);
                    if (buttonWidth = parseInt(buttonWidth)) {
                        (function (buttonWidth) {
                            var btns = [].concat(buttons);
                            setTimeout(function () {
                                for (var i = 0; button = btns[i++];) {
                                    var $button = avalon(button), buttonName = button.tagName.toLowerCase();
                                    if (buttonName === 'input' || buttonName === 'button') {
                                        button.style.width = buttonWidth + 'px';
                                    } else {
                                        button.style.width = buttonWidth - parseInt($button.css('border-left-width')) - parseInt($button.css('border-right-width')) - parseInt($button.css('padding-left')) * 2 + 'px';
                                    }
                                }
                            }, 10);
                        }(buttonWidth));
                        return;
                    }
                    (function (buttons) {
                        var interval = 0, maxButtonWidth = 0;
                        buttons = buttons.concat();
                        interval = setInterval(function () {
                            var buttonWidth = 0, innerWidth = 0, $button;
                            for (var i = 0, button; button = buttons[i++];) {
                                buttonWidth = Math.max(buttonWidth, avalon(button).outerWidth());
                            }
                            if (buttonWidth === maxButtonWidth) {
                                maxButtonWidth += 1;
                                for (var i = 0, button; button = buttons[i++];) {
                                    var buttonName = button.tagName.toLowerCase(), $button = avalon(button);
                                    if (buttonName === 'input' || buttonName === 'button') {
                                        button.style.width = maxButtonWidth + 'px';
                                    } else {
                                        button.style.width = maxButtonWidth - parseInt($button.css('border-left-width')) - parseInt($button.css('border-right-width')) - parseInt($button.css('padding-left')) * 2 + 'px';
                                    }
                                }
                                clearInterval(interval);
                                return;
                            }
                            maxButtonWidth = buttonWidth;
                        }, 100);
                    }(buttons));
                }
            };
        btnGroup.$init();
    };
    function createButton(element, options) {
        var buttonText, buttonClasses = baseClasses.concat(), iconText = false, icons = options.icon || '', corner = options.corner;
        options.label = options.label || '';
        if (corner) {
            buttonClasses.push('oni-corner-all');
            if (corner = parseInt(corner)) {
                element.style.borderRadius = corner + 'px';
            }
        }
        if (options.size) {
            buttonClasses.push('oni-button-' + options.size);
        }
        if (options.color) {
            buttonClasses.push('oni-button-' + options.color);
        }
        if (options.disabled) {
            buttonClasses.push('oni-state-disabled');
        }
        avalon(element).addClass(buttonClasses.join(' '));
        if (options.elementType === 'input' && options.label) {
            avalon(element).val(options.label);
            return;
        }
        switch (options.type) {
        case 'text':
            buttonText = '<span class=\'oni-button-text\'>' + options.label + '</span>';
            break;
        case 'labeledIcon':
            iconText = true;
        case 'icon':
            switch (options.iconPosition) {
            case 'left':
                buttonText = '<i class=\'oni-icon oni-icon-left\'>' + icons.replace(/\\/g, '') + '</i>' + '<span class=\'oni-button-text oni-button-text-right' + (!iconText ? ' oni-button-text-hidden' : '') + '\'>' + options.label + '</span>';
                break;
            case 'right':
                buttonText = '<span class=\'oni-button-text oni-button-text-left' + (!iconText ? ' oni-button-text-hidden' : '') + '\'>' + options.label + '</span>' + '<i class=\'oni-icon oni-icon-right\'>' + icons.replace(/\\/g, '') + '</i>';
                break;
            case 'left-right':
                var iconArr = icons && icons.split('-') || [
                        '',
                        ''
                    ], iconLeft = iconArr[0], iconRight = iconArr[1];
                buttonText = '<i class=\'oni-icon oni-icon-left\'>' + iconLeft.replace(/\\/g, '') + '&nbsp;</i>' + '<span class=\'oni-button-text oni-button-text-middle' + (!iconText ? ' oni-button-text-hidden' : '') + '\'>' + options.label + '</span>' + '<i class=\'oni-icon oni-icon-right\'>&nbsp;' + iconRight.replace(/\\/g, '') + '</i>';
                break;
            }
            break;
        }
        element.innerHTML = buttonText;
    }
    widget.version = 1;
    widget.defaults = {
        groups: false,
        //@config 是否是button组
        direction: '',
        //@config button组的方向，有水平button组和垂直button组，默认是水平，可以设置为"vertical"
        /**
         * @config <p>data属性配置button组的内容，每一个数组元素都是一个包含单个按钮基本信息的对象。</p>
         * <p>注意，请只在button组由至少两个按钮组成时，才配置button组件为button组，也就是设置groups为true时，且配置相应的data</p>
         * <p>当然还有一种直接列出button组内容的方式，不过这种情况需要指定组件名为buttonset，请看<a href="./avalon.button.ex4.html">demo 4</a>a></p>
         * <pre>
            data: [{
                type: "labeledIcon",
                iconPosition: "right",
                icon: "\&\#xf04c;",
                size: "large",
                color: "success",
                text: "暂停"
            }, {
                type: "labeledIcon",
                iconPosition: "right",
                icon: "\&\#xf04b;",
                size: "large",
                color: "success",
                text: "播放"
            }, {
                type: "labeledIcon",
                iconPosition: "right",
                icon: "\&\#xf074;",
                size: "large",
                color: "success",
                text: "拖曳"
            }]                                
         </pre>
         */
        data: [],
        type: 'text',
        //@config 配置button的展示形式，仅文字展示，还是仅图标展示，或者文字加图标的展示方式，三种方式分别对应："text"、"icon"、"labeledIcon"
        iconPosition: 'left',
        //@config 当type为icon或者labeledIcon时，定义icon在哪边，默认在text的左边，也可以配置为右边("right"),或者两边都有("left-right")
        icon: '',
        //@config  当type为icon或者labeledIcon时，定义展示icon的内容，本组件的icon是使用web font实现，当iconPosition为"left"或者"right"时，将icon的码赋给icon，当iconPosition为"left-right",将left icon与right icon的码以"-"分隔，比如data-button-icon="\&\#xf001;-\&\#xf06b;"
        size: '',
        //@config button有四个尺寸"small", "default", "big", "large"
        color: '',
        //@config 定义button的颜色，默认提供了"primary", "warning", "danger", "success", "info", "inverse", "default" 7中颜色，与bootstrap保持一致
        corner: true,
        //@config 设置是否显示圆角，可以布尔值或者Number类型，布尔只是简单的说明显示或者不显示，Number则在表示显示与否的同时，也是在指定圆角的大小，圆角默认是2px。
        style: '',
        // 用于定义button的展现形式，比如"flat" "glow" "rounded" "3D" "pill" 本组件，仅提供flat的实现
        disabled: false,
        //@config 配置button的禁用状态
        label: '',
        //@config 设置button的显示文字，label的优先级高于元素的innerHTML
        width: ''    //@config 设置button的宽度，注意button的盒模型设为了border-box
    };
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "ebe019d268672b2e5098adbedeb01097" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "9b7332764027ca382c8471ce030f97d6" , 
        filename : "avalon.tab.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<div class=\"oni-tab-slider\"\n    ms-visible=\"toggle\">\n    <a href=\"#\" class=\"oni-tab-slider-button oni-tab-slider-button-left\" \n       ms-visible=\"prevEnable\" \n       ms-click=\"slider($event,'prev')\"><</a>\n    <div class=\"oni-tab-slider-ct oni-tab-slider-enable\" \n         ms-css-margin-left=\"-sliderIndex*100+'%'\">\n        <ul class=\"oni-tab-nav oni-helper-clearfix oni-widget-header oni-helper-reset\" \n        ms-attr-id=\"'tabs' + tabs.$id\">\n            <li class=\"oni-state-default\" \n                data-repeat-rendered=\"computeSlider\" \n                ms-repeat-tab=\"tabs\" \n                ms-class=\"oni-tab-item\"  \n                ms-class-1=\"oni-state-active:!!_canActive(tab, $index)\" \n                ms-class-2=\"oni-state-disabled:tab.disabled\" \n                ms-class-3=\"oni-tab-last:$last\" \n                ms-class-4=\"oni-tab-removable:!!_canRemove(tab)\" \n                ms-hover=\"oni-state-hover:!tab.disabled\" \n                ms-{{MS_OPTION_EVENT}}=\"activate($event, $index)\" \n                > \n                <a ms-href=\"tab.href?tab.href:'#'\" ms-attr-target=\"tab.target||target||'_self'\">{{_tabTitle(tab.title, tab, _cutCounter(), cutEnd) | sanitize | html}}</a>\n                {{MS_OPTION_REMOVABLE}}\n            </li>\n        </ul>\n    </div>\n    <a href=\"#\" class=\"oni-tab-slider-button\" \n       ms-visible=\"nextEnable\"\n       ms-click=\"slider($event,'next')\">></a>\n</div>",
panelTpl = "<div class=\"oni-tab-panel-container\" ms-each-panel=\"tabpanels\"\n\t ms-visible=\"toggle\"\n\t ms-if=\"tabpanels.size()\">\n     <div class=\"oni-tab-panel oni-widget-content\" \n          ms-visible=\"_shallPanelAlwaysShow($index)\" \n          ms-if-loop=\"_isAjax(panel)\">{{panel.content | sanitize | html }}</div>\n     <div class=\"oni-tab-panel oni-widget-content\"\n          ms-visible=\"_shallPanelAlwaysShow($index)\" \n          ms-include-src=\"panel.content\" \n          ms-if-loop=\"!_isAjax(panel)\" data-include-rendered=\"onAjaxCallback\">\n     </div>\n</div>",
closeTpl = "<span  class=\"oni-tab-close oni-icon oni-icon-close\"\n       ms-visible=\"!tab.disabled\"\n       ms-click=\"remove($event, $index)\" \n       ms-hover=\"oni-tab-close-hover\" \n       ms-if=\"!!_canRemove(tab)\">&times;\n</span>";

module.exports = (
function () {
    // 对模板进行转换
    function _getTemplate(tpl, vm) {
        return tpl.replace(/\{\{MS_[A-Z_0-9]+\}\}/g, function (mat) {
            var mat = (mat.split('{{MS_OPTION_')[1] || '').replace(/\}\}/g, '').toLowerCase().replace(/_[^_]/g, function (mat) {
                    return mat.replace(/_/g, '').toUpperCase();
                });
            // 防止事件绑定覆盖，可能匹配不对，但是不会影响实际效果
            if (mat == 'event' && vm[mat]) {
                var m, eventId;
                if (m = tpl.match(new RegExp(' ms-' + vm[mat] + '[^\'\\"]', 'g'))) {
                    eventId = m.length;
                    m = m.join(',');
                    while (m.match(new RegExp(eventId, 'g'))) {
                        eventId++;
                    }
                    return vm[mat] + '-' + eventId;
                }
            } else if (mat == 'removable') {
                return closeTpl;
            }
            return vm[mat] || '';
        });
    }
    function _getData(par, type, target) {
        var res = [];
        for (var i = 0, el; el = par && par.children[i++];) {
            if (el.tagName.toLowerCase() != type)
                continue;
            var opt = avalon(el).data(), obj = type == 'div' ? {
                    content: opt.content || el.innerHTML,
                    contentType: opt.contentType || 'content'
                } : {
                    title: el.innerHTML,
                    removable: opt.removable,
                    linkOnly: opt.linkOnly,
                    target: opt.target || target || '_self',
                    disabled: opt.disabled == void 0 ? false : opt.disabled
                };
            var href = opt.href || el.getAttribute('href');
            if (href)
                obj.href = href;
            res.push(obj);
        }
        return res;
    }
    var widget = avalon.ui.tab = function (element, data, vmodels) {
            var options = data.tabOptions, tabpanels = [], tabs = [], tabsParent;
            // 遍历tabs属性，设置disabled属性，防止在IE里面出错
            avalon.each(options.tabs, function (i, item) {
                item.disabled = !!item.disabled;
            });
            // 扫描获取tabs
            if (options.tabs == void 0) {
                tabsParent = options.tabContainerGetter(element);
                avalon.scan(tabsParent, vmodels);
                tabs = _getData(tabsParent, 'li', options.target);
                // 销毁dom
                if (options.distroyDom)
                    element.removeChild(tabsParent);
            }
            // 扫描获取panels
            if (options.tabpanels == void 0) {
                panelsParent = options.panelContainerGetter(element);
                tabpanels = _getData(panelsParent, 'div');
                if (options.distroyDom) {
                    try {
                        element.removeChild(panelsParent);
                    } catch (e) {
                    }
                }
            }
            var vmodel = avalon.define(data['tabId'], function (vm) {
                    vm.$skipArray = [
                        /*"disable", "enable", "add", "activate", "remove", "getTemplate", */
                        'widgetElement',
                        'callInit'    /*, "onActivate", "onAjaxCallback"*/,
                        'rootElement'
                    ];
                    vm.tabs = [];
                    vm.tabpanels = [];
                    avalon.mix(vm, options);
                    vm.widgetElement = element;
                    vm.rootElement = element;
                    var inited, switchTimer;
                    vm.$init = function (continueScan) {
                        var force = continueScan && !avalon.isFunction(continueScan);
                        if (inited || !force && !vm.callInit)
                            return;
                        inited = true;
                        if (!options.tabs)
                            vm.tabs = tabs;
                        if (!vm.tabpanels.length)
                            vm.tabpanels = tabpanels;
                        vm.active = vm.active >= vm.tabs.length && vm.tabs.length - 1 || vm.active < 0 && 0 || parseInt(vm.active) >> 0;
                        avalon(element).addClass('oni-tab oni-widget oni-widget-content' + (vm.event == 'click' ? ' oni-tab-click' : '') + (vm.dir == 'v' ? ' oni-tab-vertical' : '') + (vm.dir != 'v' && vm.uiSize == 'small' ? ' oni-tab-small' : ''));
                        // tab列表
                        var tabFrag = _getTemplate(vm._getTemplate(0, vm), vm), panelFrag = _getTemplate(vm._getTemplate('panel', vm), vm);
                        element.innerHTML = vmodel.bottom ? panelFrag + tabFrag : tabFrag + panelFrag;
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                        if (vm.autoSwitch) {
                            vm._autoSwitch();
                        }
                    };
                    vm._clearTimeout = function () {
                        clearTimeout(switchTimer);
                    };
                    // 选中tab
                    vm.activate = function (event, index, fix) {
                        // 猥琐的解决在ie里面报找不到成员的bug
                        // !fix && event.preventDefault()
                        if (vm.tabs[index].disabled === true) {
                            if (vm.event === 'click')
                                event.preventDefault();
                            return;
                        }
                        if (vm.tabs[index].linkOnly) {
                            return;
                        }
                        var el = this;
                        // event是click，点击激活状态tab
                        if (vm.event === 'click' && vm.active === index) {
                            // 去除激活状态
                            if (vm.collapsible) {
                                vm.active = NaN;
                                event.preventDefault()    // 调用点击激活状态tab回调
;
                            } else {
                                if (!options.onClickActive.call(el, event, vmodel))
                                    event.preventDefault();
                            }
                            return;
                        }
                        if (vm.event === 'click')
                            event.preventDefault();
                        if (vm.active !== index) {
                            // avalon.nextTick(function() {
                            vm.active = index;
                            options.onActivate.call(el, event, vmodel)    // })
;
                        }
                    };
                    // 延迟切换效果
                    if (vm.event == 'mouseenter' && vm.activeDelay) {
                        var timer, tmp = vm.activate;
                        vm.activate = function ($event, $index) {
                            clearTimeout(timer);
                            var el = this, arg = arguments;
                            timer = setTimeout(function () {
                                tmp.apply(el, [
                                    $event,
                                    $index,
                                    'fix event bug in ie'
                                ]);
                            }, vm.activeDelay);
                            if (!el.getAttribute('leave-binded') && 0) {
                                el.setAttribute('leave-binded', 1);
                                avalon.bind(el, 'mouseleave', function () {
                                    clearTimeout(timer);
                                });
                            }
                        };
                    }
                    // 自动切换效果
                    vm._autoSwitch = function () {
                        clearTimeout(switchTimer);
                        if (vm.tabs.length < 2)
                            return;
                        switchTimer = setTimeout(function () {
                            var i = vm.active + 1    // 防止死循环
, loop = 0;
                            while (i != vm.active && loop < vm.tabs.length - 1) {
                                if (i >= vm.tabs.length) {
                                    i = 0;
                                }
                                if (!vm.tabs[i].disabled) {
                                    vm.active = i;
                                    vm._autoSwitch();
                                    break;
                                }
                                i++;
                                loop++;
                            }
                        }, vm.autoSwitch);
                    };
                    //清空构成UI的所有节点，一下代码继承自pilotui
                    vm.$remove = function () {
                        element.innerHTML = element.textContent = '';
                    };
                    // 修改使用了avalon的几个方法
                    //@interface disable(index) 禁用索引指向的tab，index为数字或者元素为数字的数组
                    vm.disable = function (index, disable) {
                        disable = disable == void 0 ? true : disable;
                        if (!(index instanceof Array)) {
                            index = [index];
                        }
                        var total = vm.tabs.length;
                        avalon.each(index, function (i, idx) {
                            if (idx >= 0 && total > idx) {
                                vm.tabs[idx].disabled = disable;
                            }
                        });
                    };
                    //@interface enable(index) 启用索引指向的tab，index为数字或者元素为数字的数组
                    vm.enable = function (index) {
                        vm.disable(index, false);
                    };
                    //@interface add(config) 新增tab, config = {title: "tab title", removable: bool, disabled: bool, content: "panel content", contentType: "ajax" or "content"}
                    vm.add = function (config) {
                        var title = config.title || 'Tab Tile';
                        var content = config.content || '<div></div>';
                        var exsited = false;
                        vm.tabpanels.forEach(function (panel) {
                            if (panel.contentType == 'include' && panel.content == config.content) {
                                exsited = true;
                            }
                        });
                        if (exsited === true) {
                            return;
                        }
                        vm.tabpanels.push({
                            content: content,
                            contentType: config.contentType
                        });
                        vm.tabs.push({
                            title: title,
                            removable: config.removable,
                            disabled: false
                        });
                        if (config.actived) {
                            avalon.nextTick(function () {
                                vmodel.active = vmodel.tabs.length - 1;
                            });
                        }
                    };
                    //@interface remove(e, index) 删除索引指向的tab，绑定情形下ms-click="remove($event, index)"，js调用则是vm.remove(index)
                    vm.remove = function (e, index) {
                        if (arguments.length == 2) {
                            e.preventDefault();
                            e.stopPropagation();
                        } else {
                            index = e;
                        }
                        if (vmodel.tabs[index].disabled === true || vmodel.tabs[index].removable === false || vmodel.tabs[index].removable == void 0 && !vm.removable) {
                            return;
                        }
                        vmodel.tabs.removeAt(index);
                        vmodel.tabpanels.removeAt(index);
                        index = index > 1 ? index - 1 : 0;
                        avalon.nextTick(function () {
                            vmodel.active = index;
                        });
                        vm.bottom = options.bottom;
                    };
                    vm._canRemove = function (tab) {
                        return (tab.removable == true || tab.removable !== false && vm.removable) && !tab.disabled && vm.dir != 'v';
                    };
                    vm._canActive = function (tab, $index) {
                        return vm.active == $index && !tab.disabled;
                    };
                    vm._isAjax = function (panel) {
                        return vm.contentType == 'content' && !panel.contentType || panel.contentType == 'content';
                    };
                    vm._cutCounter = function () {
                        return (vmodel.dir == 'h' || vmodel.forceCut) && vmodel.titleCutCount;
                    };
                    vm._shallPanelAlwaysShow = function ($index) {
                        return vmodel.shallPanelAlwaysShow || $index === vmodel.active;
                    };
                    vm.sliderIndex = 0;
                    vm.sliderLength = 0;
                    vm.nextEnable = 0;
                    vm.prevEnable = 0;
                    vm.slider = function ($event, dir) {
                        $event.preventDefault();
                        var step;
                        if (dir === 'prev') {
                            step = vm.sliderIndex - 1;
                            step = step > 0 ? step : 0;
                        } else {
                            step = vm.sliderIndex + 1;
                            step = step <= vm.sliderLength - 1 ? step : vm.sliderLength - 1;
                        }
                        vm.sliderIndex = step;
                        vm.buttonEnable();
                    };
                    vm.computeSlider = function () {
                        if (vm.dir === 'v')
                            return;
                        var tabs = document.getElementById('tabs' + vm.tabs.$id);
                        if (tabs) {
                            var w = tabs.scrollWidth, pw = tabs.parentNode.parentNode.clientWidth;
                            if (w > pw) {
                                vm.sliderLength = w / pw;
                            } else {
                                vm.sliderLength = 0;
                            }
                            vm.buttonEnable();
                        }
                    };
                    vm.buttonEnable = function () {
                        if (vm.sliderIndex >= vm.sliderLength - 1) {
                            vm.nextEnable = 0;
                        } else {
                            vm.nextEnable = 1;
                        }
                        if (vm.sliderIndex <= 0) {
                            vm.prevEnable = 0;
                        } else {
                            vm.prevEnable = 1;
                        }
                    };
                    return vm;
                });
            if (vmodel.autoSwitch) {
                /*
            vmodel.tabs.$watch("length", function(value, oldValue) {
                if(value < 2) {
                    vmodel._clearTimeout()
                } else {
                    vmodel._autoSwitch()
                }
            })
            */
                avalon.bind(element, 'mouseenter', function () {
                    vmodel._clearTimeout();
                });
                avalon.bind(element, 'mouseleave', function () {
                    vmodel._clearTimeout();
                    vmodel._autoSwitch();
                });
                vmodel.$watch('autoSwitch', function (value, oldValue) {
                    vmodel._clearTimeout();
                    if (value) {
                        vmodel._autoSwitch();
                    }
                });
            }
            // return vmodel使符合框架体系，可以自动调用
            return vmodel;
        };
    widget.defaults = {
        target: '_blank',
        //@config tab item链接打开的方式，可以使_blank,_self,_parent
        toggle: true,
        //@config 组件是否显示，可以通过设置为false来隐藏组件
        autoSwitch: false,
        //@config 是否自动切换，默认否，如果需要设置自动切换，请传递整数，例如200，即200ms
        active: 0,
        //@config 默认选中的tab，默认第一个tab，可以通过动态设置该参数的值来切换tab，并可通过vmodel.tabs.length来判断active是否越界
        shallPanelAlwaysShow: false,
        //@config shallPanelAlwaysShow() panel不通过display:none,block来切换，而是一直显示，通过其他方式切换到视野，默认为false
        event: 'mouseenter',
        //@config  tab选中事件，默认mouseenter
        removable: false,
        //@config  是否支持删除，默认否，另外可能存在某些tab可以删除，某些不可以删除的情况，如果某些tab不能删除则需要在li元素或者tabs数组里给对应的元素指定removable : false，例如 li data-removable="false" or {title: "xxx", removable: false}
        activeDelay: 0,
        //@config  比较适用于mouseenter事件情形，延迟切换tab，例如200，即200ms
        collapsible: false,
        //@config  当切换面板的事件为click时，如果对处于激活状态的按钮再点击，将会它失去激活并且对应的面板会收起来,再次点击它时，它还原，并且对应面板重新出现
        contentType: 'content',
        //@config  panel是静态元素，还是需要通过异步载入，还可取值为ajax，但是需要给对应的panel指定一个正确的ajax地址
        bottom: false,
        //@config  tab显示在底部
        dir: 'h',
        //@config  tab排列方向，横向或纵向v - vertical，默认横向h - horizontal
        callInit: true,
        //@config  是否调用即初始化
        titleCutCount: 8,
        //@config  tab title截取长度，默认是8
        distroyDom: true,
        //@config  扫描dom获取数据，是否销毁dom
        cutEnd: '...',
        //@config  tab title截取字符后，连接的字符，默认为省略号
        forceCut: false,
        //@config  强制截断，因为竖直方向默认是不截取的，因此添加一个强制截断，使得在纵向排列的时候title也可以被截断
        //tabs:undefined,              //@config  <pre>[/n{/ntitle:"xx",/n linkOnly: false,/n disabled:boolen,/n target: "_self",/n removable:boolen/n}/n]</pre>，单个tabs元素的removable针对该元素的优先级会高于组件的removable设置，linkOnly表示这只是一个链接，不响应active事件，也不阻止默认事件，target对应的是链接打开方式_self默认，可以使_blank,_parent，tab里的target配置优先级高于vm的target配置，应用于某个tab上，可以在元素上 data-target="xxx" 这样配置
        //tabpanels:undefined,         //@config  <pre>[/n{/ncontent:content or url,/n contentType: "content" or "ajax"/n}/n]</pre> 单个panel的contentType配置优先级高于组件的contentType
        //@config onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
        onInit: avalon.noop,
        tabContainerGetter: function (element) {
            return element.getElementsByTagName('ul')[0] || element.getElementsByTagName('ol')[0];
        },
        //@config tabContainerGetter(element) tab容器，如果指定，则到该容器内扫描tabs，参数为绑定组件的元素，默认返回element内第一个ul或者ol元素
        panelContainerGetter: function (element) {
            return element.getElementsByTagName('div')[0] || element;
        },
        //@config panelContainerGetter(element)  panel容器，如果指定，则到该容器内扫描panel，参数为绑定组件的元素，默认返回第element内第一个div元素
        onActivate: avalon.noop,
        //@config onActivate(event, vmode) 选中tab后的回调，this指向对应的li元素，参数是事件对象，vm对象 fn(event, vmode)，默认为avalon.noop
        onClickActive: avalon.noop,
        //@config onClickActive(event, vmode)  点击选中的tab，适用于event是"click"的情况，this指向对应的li元素，参数是事件对象，vm对象 fn(event, vmode)，默认为avalon.noop
        onAjaxCallback: avalon.noop,
        //@config onAjaxCallback  panel内容是ajax，ajax响应后的回调函数，this指向对应的panel元素，无参数，默认为空函数
        // 获取模板，防止用户自定义的getTemplate方法没有返回有效的模板
        _getTemplate: function (tplName, vm) {
            var tpl, defineTpl;
            if (tplName == 'panel') {
                tpl = panelTpl;
            } else if (tplName == 'close') {
                tpl = closeTpl;
            } else {
                tpl = template;
            }
            defineTpl = vm.getTemplate(tpl, vm, tplName);
            return defineTpl || defineTpl === '' ? defineTpl : tpl;
        },
        getTemplate: function (template, vm, tplName) {
            return template;
        },
        //@config getTemplate(template, vm, tplName)  修改模板的接口，参数分别是模板字符串，vm对象，模板名字，返回如果是空字符串则对应的tplName(close,panel,tab)返回为空，return false,null,undedined等于返回组件自带的模板，其他情况为返回值，默认返回组件自带的模板
        _tabTitle: function (title, tab, count, end) {
            var cut;
            if (tab.titleCutCount != void 0) {
                cut = tab.titleCutCount;
            } else if (count != void 0) {
                cut = count;
            }
            if (!cut)
                return title;
            var visibleTitle = title.split(/<[^>]+>/g), len = 0, res = 0, indexToIgnore;
            avalon.each(visibleTitle, function (i, item) {
                if (indexToIgnore >= 0) {
                    res = '';
                } else {
                    var s = item.trim();
                    if (len + s.length > cut) {
                        indexToIgnore = i;
                        res = s.substr(0, cut - len) + end;
                    } else {
                        len += s.length;
                        res = 0;
                    }
                }
                if (res === 0)
                    return;
                title = title.replace(item, res);
            });
            return title;
        },
        // 实现截取title逻辑
        // 保留实现配置
        // switchEffect: function() {},     // 切换效果
        // useSkin: false,                  // 载入神马皮肤
        '$author': 'skipper@123'
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "9b7332764027ca382c8471ce030f97d6" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "fdc46f922d9abc8918e08dbf90d9d03e" , 
        filename : "avalon.getModel.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    function getChildVM(expr, vm, strLen) {
        var t = vm, pre, _t;
        for (var i = 0, len = expr.length; i < len; i++) {
            var k = expr[i];
            _t = t.$model || t;
            if (typeof _t[k] !== 'undefined') {
                pre = t;
                t = t[k];
            } else {
                return;
            }
        }
        if (strLen > 1) {
            return pre[k];
        } else {
            return pre;
        }
    }
    // 在一堆VM中，提取某一个VM的符合条件的子VM
    // 比如 vm.aaa.bbb = {} ; 
    // avalon.getModel("aaa.bbb", vmodels) ==> ["bbb", bbbVM, bbbVM所在的祖先VM（它位于vmodels中）]
    avalon.getModel = function (expr, vmodels) {
        if (!expr) {
            return null;
        }
        var str = expr.split('.'), strLen = str.length, last = str[strLen - 1];
        if (str.length != 1) {
            str.pop();
        }
        for (var i = 0, len = vmodels.length; i < len; i++) {
            var ancestor = vmodels[i];
            var child = getChildVM(str, ancestor, strLen);
            if (typeof child !== 'undefined' && (child.hasOwnProperty(last) || Object.prototype.hasOwnProperty.call(child, last))) {
                return [
                    last,
                    child,
                    ancestor
                ];
            }
        }
        return null;
    };
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "fdc46f922d9abc8918e08dbf90d9d03e" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "36e422bfb7dcb2fd648a019317e8a224" , 
        filename : "avalon.draggable.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    var defaults = {
            ghosting: false,
            //是否影子拖动，动态生成一个元素，拖动此元素，当拖动结束时，让原元素到达此元素的位置上,
            delay: 0,
            axis: 'xy',
            started: true,
            start: avalon.noop,
            beforeStart: avalon.noop,
            drag: avalon.noop,
            beforeStop: avalon.noop,
            stop: avalon.noop,
            scrollPlugin: true,
            scrollSensitivity: 20,
            scrollSpeed: 20
        };
    var styleEl = document.getElementById('avalonStyle');
    //拖动时禁止文字被选中，禁止图片被拖动
    var cssText = '.ui-helper-global-drag *{ -webkit-touch-callout: none;' + '-khtml-user-select: none;' + '-moz-user-select: none;' + '-ms-user-select: none;' + 'user-select: none;}' + '.ui-helper-global-drag img{-webkit-user-drag:none; ' + 'pointer-events:none;}';
    try {
        styleEl.innerHTML += cssText;
    } catch (e) {
        styleEl.styleSheet.cssText += cssText;
    }
    var body;
    var ua = navigator.userAgent;
    var isAndroid = /Android/i.test(ua);
    var isBlackBerry = /BlackBerry/i.test(ua);
    var isWindowPhone = /IEMobile/i.test(ua);
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var isMobile = isAndroid || isBlackBerry || isWindowPhone || isIOS;
    if (!isMobile) {
        var dragstart = 'mousedown';
        var drag = 'mousemove';
        var dragstop = 'mouseup';
    } else {
        dragstart = 'touchstart';
        drag = 'touchmove';
        dragstop = 'touchend';
    }
    var draggable = avalon.bindingHandlers.draggable = function (data, vmodels) {
            var args = data.value.match(avalon.rword) || [];
            var ID = args[0] || '$';
            var opts = args[1] || 'draggable';
            var model, vmOptions;
            if (ID != '$') {
                model = avalon.vmodels[ID];
                //如果指定了此VM的ID
                if (!model) {
                    return;
                }
            }
            data.element.removeAttribute('ms-draggable');
            if (!model) {
                //如果使用$或绑定值为空，那么就默认取最近一个VM，没有拉倒
                model = vmodels.length ? vmodels[0] : null;
            }
            var fnObj = model || {};
            if (model && typeof model[opts] === 'object') {
                //如果指定了配置对象，并且有VM
                vmOptions = model[opts];
                if (vmOptions.$model) {
                    vmOptions = vmOptions.$model;
                }
                fnObj = vmOptions;
            }
            var element = data.element;
            var $element = avalon(element);
            var options = avalon.mix({}, defaults, vmOptions || {}, data[opts] || {}, avalon.getWidgetData(element, 'draggable'));
            //修正drag,stop为函数
            'drag,stop,start,beforeStart,beforeStop'.replace(avalon.rword, function (name) {
                var method = options[name];
                if (typeof method === 'string') {
                    if (typeof fnObj[method] === 'function') {
                        options[name] = fnObj[method];
                    }
                }
            });
            if (options.axis !== '' && !/^(x|y|xy)$/.test(options.axis)) {
                options.axis = 'xy';
            }
            body = document.body;
            //因为到这里时，肯定已经domReady
            $element.bind(dragstart, function (e) {
                var data = avalon.mix({}, options, {
                        element: element,
                        $element: $element,
                        pageX: getPosition(e, 'X'),
                        //相对于页面的坐标, 会改动
                        pageY: getPosition(e, 'Y'),
                        //相对于页面的坐标，会改动
                        marginLeft: parseFloat($element.css('marginLeft')) || 0,
                        marginTop: parseFloat($element.css('marginTop')) || 0
                    });
                data.startPageX = data.pageX;
                //一次拖放只赋值一次
                data.startPageY = data.pageY;
                //一次拖放只赋值一次
                options.axis.replace(/./g, function (a) {
                    data['drag' + a.toUpperCase()] = true;
                });
                if (!data.dragX && !data.dragY) {
                    data.started = false;
                }
                //在处理手柄拖动前做些事情
                if (typeof options.beforeStart === 'function') {
                    options.beforeStart.call(data.element, e, data);
                }
                if (data.handle && fnObj) {
                    // 实现手柄拖动
                    var handle = fnObj[data.handle];
                    handle = typeof handle === 'function' ? handle : data.handle;
                    if (typeof handle === 'function') {
                        var checked = handle.call(element, e, data);
                        //要求返回一节点
                        if (checked && checked.nodeType === 1) {
                            if (!element.contains(checked)) {
                                return;    // 不能返回 false，这会阻止文本被选择
                            }
                        } else {
                            return;
                        }
                    }
                }
                fixUserSelect();
                var position = $element.css('position');
                //如果原元素没有被定位
                if (!/^(?:r|a|f)/.test(position)) {
                    element.style.position = 'relative';
                    element.style.top = '0px';
                    element.style.left = '0px';
                }
                if (options.delay && isFinite(options.delay)) {
                    data.started = false;
                    setTimeout(function () {
                        data.started = true;
                    }, options.delay);
                }
                var startOffset = $element.offset();
                if (options.ghosting) {
                    var clone = element.cloneNode(true);
                    avalon(clone).css('opacity', 0.7).width(element.offsetWidth).height(element.offsetHeight);
                    data.clone = clone;
                    if (position !== 'fixed') {
                        clone.style.position = 'absolute';
                        clone.style.top = startOffset.top - data.marginTop + 'px';
                        clone.style.left = startOffset.left - data.marginLeft + 'px';
                    }
                    body.appendChild(clone);
                }
                var target = avalon(data.clone || data.element);
                //拖动前相对于offsetParent的坐标
                data.startLeft = parseFloat(target.css('left'));
                data.startTop = parseFloat(target.css('top'));
                //拖动后相对于offsetParent的坐标
                //如果是影子拖动，代理元素是绝对定位时，它与原元素的top, left是不一致的，因此当结束拖放时，不能直接将改变量赋给原元素
                data.endLeft = parseFloat($element.css('left')) - data.startLeft;
                data.endTop = parseFloat($element.css('top')) - data.startTop;
                data.clickX = data.pageX - startOffset.left;
                //鼠标点击的位置与目标元素左上角的距离
                data.clickY = data.pageY - startOffset.top;
                //鼠标点击的位置与目标元素左上角的距离
                setContainment(options, data);
                //修正containment
                draggable.dragData = data;
                //决定有东西在拖动
                'start,drag,beforeStop,stop'.replace(avalon.rword, function (name) {
                    //console.log(options[name])
                    draggable[name] = [options[name]];
                });
                draggable.plugin.call('start', e, data);
            });
        };
    var xy2prop = {
            'X': 'Left',
            'Y': 'Top'
        };
    //插件系统
    draggable.dragData = {};
    draggable.start = [];
    draggable.drag = [];
    draggable.stop = [];
    draggable.beforeStop = [];
    draggable.plugin = {
        add: function (name, set) {
            for (var i in set) {
                var fn = set[i];
                if (typeof fn === 'function' && Array.isArray(draggable[i])) {
                    fn.isPlugin = true;
                    fn.pluginName = name + 'Plugin';
                    draggable[i].push(fn);
                }
            }
        },
        call: function (name, e, data) {
            var array = draggable[name];
            if (Array.isArray(array)) {
                array.forEach(function (fn) {
                    //用户回调总会执行，插件要看情况
                    if (typeof fn.pluginName === 'undefined' ? true : data[fn.pluginName]) {
                        fn.call(data.element, e, data);
                    }
                });
            }
            if (name === 'stop') {
                for (var i in draggable) {
                    array = draggable[i];
                    if (Array.isArray(array)) {
                        array.forEach(function (fn) {
                            if (!fn.isPlugin) {
                                // 用户回调都是一次性的，插件的方法永远放在列队中
                                avalon.Array.remove(array, fn);
                            }
                        });
                    }
                }
            }
        }
    };
    //统一处理拖动的事件
    var lockTime = new Date() - 0, minTime = document.querySelector ? 12 : 30;
    avalon(document).bind(drag, function (e) {
        var time = new Date() - lockTime;
        if (time > minTime) {
            //减少调用次数，防止卡死IE6-8
            lockTime = time;
            var data = draggable.dragData;
            if (data.started === true) {
                //fix touchmove bug;  
                //IE 在 img 上拖动时默认不能拖动（不触发 mousemove，mouseup 事件，mouseup 后接着触发 mousemove ...）
                //防止 html5 draggable 元素的拖放默认行为 (选中文字拖放)
                e.preventDefault();
                //使用document.selection.empty()来清除选择，会导致捕获失败 
                var element = data.clone || data.element;
                setPosition(e, element, data, 'X');
                setPosition(e, element, data, 'Y');
                draggable.plugin.call('drag', e, data);
            }
        }
    });
    //统一处理拖动结束的事件
    avalon(document).bind(dragstop, function (e) {
        var data = draggable.dragData;
        if (data.started === true) {
            restoreUserSelect();
            var element = data.element;
            draggable.plugin.call('beforeStop', e, data);
            if (data.dragX) {
                setPosition(e, element, data, 'X', true);
            }
            if (data.dragY) {
                setPosition(e, element, data, 'Y', true);
            }
            if (data.clone) {
                body.removeChild(data.clone);
            }
            draggable.plugin.call('stop', e, data);
            draggable.dragData = {};
        }
    });
    function getPosition(e, pos) {
        var page = 'page' + pos;
        return isMobile ? e.changedTouches[0][page] : e[page];
    }
    function setPosition(e, element, data, pos, end) {
        var page = getPosition(e, pos);
        if (data.containment) {
            var min = pos === 'X' ? data.containment[0] : data.containment[1];
            var max = pos === 'X' ? data.containment[2] : data.containment[3];
            var check = page - (pos === 'X' ? data.clickX : data.clickY);
            if (check < min) {
                page += Math.abs(min - check);
            } else if (check > max) {
                page -= Math.abs(max - check);
            }
        }
        data['page' + pos] = page;
        //重设pageX, pageY
        var Prop = xy2prop[pos];
        var prop = Prop.toLowerCase();
        var number = data['start' + Prop] + page - data['startPage' + pos] + (end ? data['end' + Prop] : 0);
        data[prop] = number;
        if (data['drag' + pos]) {
            //保存top, left
            element.style[prop] = number + 'px';
        }
    }
    var rootElement = document.documentElement;
    var fixUserSelect = function () {
        avalon(rootElement).addClass('ui-helper-global-drag');
    };
    var restoreUserSelect = function () {
        avalon(rootElement).removeClass('ui-helper-global-drag');
    };
    if (window.VBArray && !('msUserSelect' in rootElement.style)) {
        var _ieSelectBack;
        //fix IE6789
        function returnFalse() {
            var e = window.event || {};
            e.returnValue = false;
        }
        fixUserSelect = function () {
            _ieSelectBack = body.onselectstart;
            body.onselectstart = returnFalse;
        };
        restoreUserSelect = function () {
            body.onselectstart = _ieSelectBack;
        };
    }
    function setContainment(o, data) {
        if (!o.containment) {
            if (Array.isArray(data.containment)) {
                return;
            }
            data.containment = null;
            return;
        }
        var elemWidth = data.$element.width();
        var elemHeight = data.$element.height();
        if (o.containment === 'window') {
            var $window = avalon(window);
            //左， 上， 右， 下
            data.containment = [
                $window.scrollLeft(),
                $window.scrollTop(),
                $window.scrollLeft() + $window.width() - data.marginLeft - elemWidth,
                $window.scrollTop() + $window.height() - data.marginTop - elemHeight
            ];
            return;
        }
        if (o.containment === 'document') {
            data.containment = [
                0,
                0,
                avalon(document).width() - data.marginLeft,
                avalon(document).height() - data.marginTop
            ];
            return;
        }
        if (Array.isArray(o.containment)) {
            var a = o.containment;
            data.containment = [
                a[0],
                a[1],
                a[2] - elemWidth,
                a[3] - elemHeight
            ];
            return;
        }
        if (o.containment === 'parent' || o.containment.charAt(0) === '#') {
            var elem;
            if (o.containment === 'parent') {
                elem = data.element.parentNode;
            } else {
                elem = document.getElementById(o.containment.slice(1));
            }
            if (elem) {
                var $offset = avalon(elem).offset();
                data.containment = [
                    $offset.left + data.marginLeft,
                    //如果元素设置了marginLeft，设置左边界时需要考虑它 
                    $offset.top + data.marginTop,
                    $offset.left + elem.offsetWidth - data.marginLeft - elemWidth,
                    $offset.top + elem.offsetHeight - data.marginTop - elemHeight
                ];
            }
        }
    }
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "36e422bfb7dcb2fd648a019317e8a224" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "3468f5e6cdb6eaf730ab82df91191936" , 
        filename : "avalon.dialog.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'],
sourceHTML = "<div class=\"oni-dialog-layout\"></div>\nMS_OPTION_WIDGET\n<div ms-widget=\"dialog,MS_OPTION_ID,MS_OPTION_OPTS\" ms-css-position=\"position\">MS_OPTION_DIALOG_CONTENT</div>\nMS_OPTION_INNERWRAPPER\n<div class=\"oni-dialog-inner\"></div>\nMS_OPTION_HEADER\n<div class=\"oni-dialog-header\">\n    <div class=\"oni-dialog-close\" ms-click=\"_close\" ms-if=\"showClose\">\n        <i class=\"oni-icon oni-icon-times\">&#xf003;</i>\n    </div>\n    <div class=\"oni-dialog-title\">{{ title|html }}</div>\n</div>\nMS_OPTION_CONTENT\n<div class=\"oni-dialog-content\"></div>\nMS_OPTION_FOOTER\n<div class=\"oni-dialog-footer oni-helper-clearfix\">\n    <div class=\"oni-dialog-btns\">\n        <button ms-widget=\"button\" data-button-color=\"success\" ms-hover=\"oni-state-hover\" ms-click=\"_confirm\">{{confirmName}}</button>\n        <button ms-widget=\"button\" ms-if=\"type =='confirm'\" ms-click=\"_cancel\">{{cancelName}}</button>\n    </div>\n</div>\nMS_OPTION_LAYOUT_SIMULATE\n<div></div>";
__context.____MODULES['ebe019d268672b2e5098adbedeb01097'];
__context.____MODULES['36e422bfb7dcb2fd648a019317e8a224'];

module.exports = (
function () {
    var template = sourceHTML, widgetArr = template.split('MS_OPTION_WIDGET'), _maskLayer = widgetArr[0],
        // 遮罩层html(string)
        maskLayer = avalon.parseHTML(_maskLayer).firstChild,
        // 遮罩层节点(dom node)
        maskLayerExist = false,
        // 页面不存在遮罩层就添加maskLayer节点，存在则忽略
        _maskLayerSimulate = template.split('MS_OPTION_LAYOUT_SIMULATE')[1], maskLayerSimulate = avalon.parseHTML(_maskLayerSimulate).firstChild, dialogShows = [],
        //存在层上层时由此数组判断层的个数
        dialogNum = 0,
        //保存页面dialog的数量，当dialogNum为0时，清除maskLayer
        //IE6 userAgent Mozilla/4.0(compatible;MISE 6.0;Windows NT 6.1;...)
        isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('msie 6') !== -1, iFrame = null, body = document.compatMode && document.compatMode.toLowerCase() == 'css1compat' ? document.documentElement : document.body;
    var widget = avalon.ui.dialog = function (element, data, vmodels) {
            dialogNum++;
            var options = data.dialogOptions;
            options.type = options.type.toLowerCase();
            options.template = options.getTemplate(template, options);
            var _footerArr = options.template.split('MS_OPTION_FOOTER'), _contentArr = _footerArr[0].split('MS_OPTION_CONTENT'), _headerArr = _contentArr[0].split('MS_OPTION_HEADER'), _innerWraperArr = _headerArr[0].split('MS_OPTION_INNERWRAPPER'), _content = _contentArr[1],
                //content wrapper html
                _lastHeader = _headerArr[1],
                //header html
                _lastFooter = _footerArr[1].split('MS_OPTION_LAYOUT_SIMULATE')[0],
                //footer html
                _innerWrapper = _innerWraperArr[1],
                //inner wrapper html
                _lastContent = '',
                //dialog content html
                lastContent = '',
                //dialog content node
                $element = avalon(element), onConfirm = options.onConfirm, onConfirmVM = null, onCancel = options.onCancel, onCancelVM = null, onOpen = options.onOpen, onOpenVM = null, onClose = options.onClose, onCloseVM = null, toggleClose = true, position = isIE6 ? 'absolute' : 'fixed';
            if (typeof onConfirm === 'string') {
                onConfirmVM = avalon.getModel(onConfirm, vmodels);
                options.onConfirm = onConfirmVM && onConfirmVM[1][onConfirmVM[0]] || avalon.noop;
            }
            if (typeof onCancel === 'string') {
                onCancelVM = avalon.getModel(onCancel, vmodels);
                options.onCancel = onCancelVM && onCancelVM[1][onCancelVM[0]] || avalon.noop;
            }
            if (typeof onClose === 'string') {
                avalon.log('ms-widget=\'dialog\' data-dialog-on-close \u6B64\u7528\u6CD5\u5DF2\u7ECF\u88AB\u5E9F\u5F03');
                onCloseVM = avalon.getModel(onClose, vmodels);
                options.onClose = onCloseVM && onCloseVM[1][onCloseVM[0]] || avalon.noop;
            }
            if (typeof onOpen === 'string') {
                onOpenVM = avalon.getModel(onOpen, vmodels);
                options.onOpen = onOpenVM && onOpenVM[1][onOpenVM[0]] || avalon.noop;
            }
            _lastFooter = options.getFooter(_lastFooter, options);
            var vmodel = avalon.define(data.dialogId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        'container',
                        'modal',
                        'zIndexIncrementGlobal',
                        'initChange',
                        'content'
                    ];
                    vm.widgetElement = element;
                    vm.position = position;
                    // 如果显示模式为alert或者配置了showClose为false，不显示关闭按钮
                    vm.showClose = vm.type === 'alert' ? false : vm.showClose;
                    vm.initChange = true;
                    // 点击确定按钮，根据回调返回值是否为false决定是否关闭弹窗
                    vm._confirm = function (e) {
                        if (typeof vmodel.onConfirm !== 'function') {
                            throw new Error('onConfirm\u5FC5\u987B\u662F\u4E00\u4E2A\u56DE\u8C03\u65B9\u6CD5');
                        }
                        // 在用户回调返回false时，不关闭弹窗
                        if (vmodel.onConfirm.call(e.target, e, vmodel) !== false) {
                            vmodel._close(e);
                        }
                    };
                    // 显示dialogmask
                    vm._open = function (updateZIndex) {
                        var len = 0,
                            //当前显示的dialog的个数
                            selectLength = document.getElementsByTagName('select').length, maxZIndex = vmodel.zIndex;
                        avalon.Array.ensure(dialogShows, vmodel);
                        len = dialogShows.length;
                        if (len) {
                            if (vmodel.modal) {
                                avalon(maskLayer).css('display', 'block');
                            }
                            avalon(maskLayerSimulate).css('display', 'block');
                        }
                        // 通过zIndex的提升来调整遮罩层，保证层上层存在时遮罩层始终在顶层dialog下面(顶层dialog zIndex-1)但是在其他dialog上面
                        maskLayer.style.zIndex = 2 * len + maxZIndex - 1;
                        maskLayerSimulate.style.zIndex = 2 * len + maxZIndex - 1;
                        element.style.zIndex = 2 * len + maxZIndex;
                        if (updateZIndex) {
                            return;
                        }
                        document.documentElement.style.overflow = 'hidden';
                        resetCenter(vmodel, element);
                        // IE6下遮罩层无法覆盖select解决办法
                        if (isIE6 && selectLength && iFrame === null && vmodel.modal) {
                            iFrame = createIframe();
                        } else if (isIE6 && selectLength && vmodel.modal) {
                            iFrame.style.display = 'block';
                            iFrame.style.width = maskLayer.style.width;
                            iFrame.style.height = maskLayer.style.height;
                            iFrame.style.zIndex = maskLayer.style.zIndex - 1;
                        }
                        vmodel.onOpen.call(element, vmodel);
                    };
                    // 隐藏dialog
                    vm._close = function (e) {
                        avalon.Array.remove(dialogShows, vm);
                        var len = dialogShows.length, maxZIndex = vmodel.zIndex, topShowDialog = len && dialogShows[len - 1];
                        if (e) {
                            toggleClose = false;
                        }
                        vmodel.toggle = false;
                        /* 处理层上层的情况，因为maskLayer公用，所以需要其以将要显示的dialog的toggle状态为准 */
                        if (topShowDialog && topShowDialog.modal) {
                            avalon(maskLayer).css('display', 'block');
                            avalon(maskLayerSimulate).css('display', 'block');
                            topShowDialog.widgetElement.style.display = 'block';
                            resetCenter(topShowDialog, topShowDialog.widgetElement);
                        } else {
                            avalon(maskLayer).css('display', 'none');
                            avalon(maskLayerSimulate).css('display', 'none');
                            if (iFrame !== null) {
                                iFrame.style.display = 'none';
                            }
                            document.documentElement.style.overflow = '';
                            vmodel.onClose.call(element, vmodel);
                            return;
                        }
                        // 重置maskLayer的z-index,当最上层的dialog关闭，通过降低遮罩层的z-index来显示紧邻其下的dialog
                        var layoutZIndex = 2 * len + maxZIndex - 1;
                        maskLayer.style.zIndex = layoutZIndex;
                        maskLayerSimulate.style.zIndex = layoutZIndex;
                        if (iFrame) {
                            iFrame.style.zIndex = layoutZIndex - 1;
                        }
                        vmodel.onClose.call(element, vmodel);
                    };
                    // 点击"取消"按钮，根据回调返回值是否为false决定是否关闭dialog
                    vm._cancel = function (e) {
                        if (typeof vmodel.onCancel != 'function') {
                            throw new Error('onCancel\u5FC5\u987B\u662F\u4E00\u4E2A\u56DE\u8C03\u65B9\u6CD5');
                        }
                        // 在用户回调返回false时，不关闭弹窗
                        if (vmodel.onCancel.call(e.target, e, vmodel) !== false) {
                            vmodel._close(e);
                        }
                    };
                    /**
         * @config {Function} 动态修改dialog的content
         * @param m {Object} 重新渲染dialog的配置对象，包括title、content、content中涉及的插值表达式，需要注意的是，title和content不是真正渲染的内容，所以不需要avalon进行扫描监控，定义的时候必须在其前面加上"$",否则组件不会渲染成想要的效果
         */
                    /**
             * @config {Function} 可以动态改变dialog的显示内容
             * @param content {String} 要替换的content，可以是已经渲染ok的view也可以是未解析渲染的模板
             * @param noScan {Boolean} 当content是模板时noScan设为false或者不设置，组件会自动解析渲染模板，如果是已经渲染ok的，将noScan设为true，组件将不再进行解析操作
             * @param contentVmodels {Array} 如果content为未解析的模板，noScan为false，contentVmodels是用来解析模板content的vmodels
             */
                    vm.setContent = function (content, noScan, contentVmodels) {
                        var scanVmodels = contentVmodels ? contentVmodels : [vmodel].concat(vmodels);
                        _lastContent = content;
                        lastContent.innerHTML = _lastContent;
                        if (!noScan) {
                            avalon.scan(lastContent, scanVmodels);
                        }
                        return vmodel;
                    };
                    // 动态修改dialog的title
                    vm.setTitle = function (title) {
                        vmodel.title = title;
                        return vmodel;
                    };
                    // 重新渲染dialog
                    vm.setModel = function (m) {
                        // 这里是为了充分利用vm._ReanderView方法，才提前设置一下element.innerHTML
                        if (!!m.$content) {
                            vmodel.setContent(m.$content, m.noScan, [vmodel].concat(findModel(m)).concat(vmodels));
                        }
                        if (!!m.$title) {
                            vmodel.title = m.$title;
                        }
                        return vmodel;
                    };
                    // 将零散的模板(dialog header、dialog content、 dialog footer、 dialog wrapper)组合成完整的dialog
                    vm._renderView = function () {
                        var innerWrapper = null;
                        // 保存innerWraper元素节点
                        // 用户只能通过data-dialog-width配置width，不可以通过ms-css-width来配置，配置了也无效
                        element.setAttribute('ms-css-width', 'width');
                        lastContent = avalon.parseHTML(_content).firstChild;
                        _lastContent = element.innerHTML || vmodel.content;
                        element.innerHTML = '';
                        lastContent.innerHTML = _lastContent;
                        innerWrapper = avalon.parseHTML(_innerWrapper).firstChild;
                        innerWrapper.innerHTML = _lastHeader;
                        innerWrapper.appendChild(lastContent);
                        innerWrapper.appendChild(avalon.parseHTML(_lastFooter));
                        element.appendChild(innerWrapper);
                        if (!maskLayerExist) {
                            document.body.appendChild(maskLayer);
                            document.body.appendChild(maskLayerSimulate);
                            maskLayerExist = true;
                        }
                    };
                    vm.$init = function (continueScan) {
                        var container = vmodel.container, clientHeight = body.clientHeight, docBody = document.body,
                            // container必须是dom tree中某个元素节点对象或者元素的id，默认将dialog添加到body元素
                            elementParent = (avalon.type(container) === 'object' && container.nodeType === 1 && docBody.contains(container) ? container : document.getElementById(container)) || docBody, defaults = avalon.ui.dialog.defaults;
                        if (!defaults.zIndex) {
                            defaults.zIndex = getMaxZIndex()    //保存body直接子元素中最大的z-index值， 保证dialog在最上层显示
;
                        }
                        if (avalon(docBody).height() < clientHeight) {
                            avalon(docBody).css('min-height', clientHeight);
                        }
                        if (vmodel.draggable) {
                            $element.attr('ms-draggable', '');
                            vmodel.draggable = {
                                handle: function (e) {
                                    var el = e.target;
                                    do {
                                        if (el.className === 'oni-dialog-header') {
                                            return el;
                                        }
                                        if (el.className === 'oni-dialog') {
                                            return;
                                        }
                                    } while (el = el.parentNode);
                                }
                            };
                        }
                        vmodel.zIndex = vmodel.zIndex + vmodel.zIndexIncrementGlobal;
                        vmodel.title = vmodel.title || '&nbsp;';
                        $element.addClass('oni-dialog');
                        element.setAttribute('ms-visible', 'toggle');
                        element.setAttribute('ms-css-position', 'position');
                        vm._renderView();
                        if (docBody.contains(maskLayerSimulate) && docBody == elementParent) {
                            maskLayerSimulate.appendChild(element);
                        } else {
                            elementParent.appendChild(element);
                        }
                        // 当窗口尺寸发生变化时重新调整dialog的位置，始终使其水平垂直居中
                        element.resizeCallback = avalon(window).bind('resize', throttle(resetCenter, 50, 100, [
                            vmodel,
                            element
                        ]));
                        element.scrollCallback = avalon(window).bind('scroll', throttle(resetCenter, 50, 100, [
                            vmodel,
                            element,
                            true
                        ]));
                        avalon.scan(element, [vmodel].concat(vmodels));
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                    // 自动清理方法
                    vm.$remove = function () {
                        dialogNum--;
                        element.innerHTML = '';
                        avalon.unbind(window, 'resize', element.resizeCallback);
                        avalon.unbind(window, 'scroll', element.scrollCallback);
                        if (!dialogNum) {
                            maskLayer.parentNode.removeChild(maskLayer);
                            maskLayer.parentNode.removeChild(maskLayerSimulate);
                            maskLayerExist = false;
                        }
                    };
                    // 打开dialog之后处理zIndex使dialog正常显示
                    vm.$watch('toggle', function (val) {
                        if (val) {
                            vmodel._open();
                        } else {
                            if (toggleClose === false) {
                                toggleClose = true;
                            } else {
                                vmodel._close();
                            }
                        }
                    });
                    // 可以手动设置最大zIndex
                    vm.$watch('zIndex', function (val) {
                        if (vmodel.initChange) {
                            vmodel.initChange = false;
                        } else {
                            vmodel._open(true);
                        }
                    });
                });
            return vmodel;
        };
    widget.version = 1;
    widget.defaults = {
        width: 480,
        //@config 设置dialog的width
        title: '&nbsp;',
        //@config 设置弹窗的标题
        draggable: false,
        //@config 设置dialog是否可拖动
        type: 'confirm',
        //@config 配置弹窗的类型，可以配置为alert来模拟浏览器
        content: '',
        //@config 配置dialog的content，默认取dialog的innerHTML作为dialog的content，如果innerHTML为空，再去取content配置项.需要注意的是：content只在初始化配置的起作用，之后需要通过setContent来动态的修改
        /**
         * @config {Function} 定义点击"确定"按钮后的回调操作
         * @param event {Number} 事件对象
         * @param vmodel {Object} 组件对应的Vmodel
         * @returns {Boolean} 如果return false，dialog不会关闭，用于异步操作
         */
        onConfirm: avalon.noop,
        /**
         * @config {Function} 定义显示dialog时的回调
         * @param vmodel {Object} 组件对应的Vmodel
         */
        onOpen: avalon.noop,
        /**
         * @config {Function} 定义点击"取消"按钮后的回调操作
         * @param event {Object} 事件对象
         * @param vmodel {Object} 组件对应的Vmodel
         * @returns {Boolean} 如果return false，dialog不会关闭，用于异步操作
         */
        onCancel: avalon.noop,
        /**
         * @config {Function} 定义点击"关闭"按钮后的回调操作
         * @param event {Object} 事件对象
         * @param vmodel {Object} 组件对应的Vmodel
         */
        onClose: avalon.noop,
        //点击右上角的“关闭”按钮的回调
        //@config 动态修改dialog的title,也可通过dialogVM.title直接修改
        setTitle: avalon.noop,
        setContent: avalon.noop,
        /**
         * @config {Function} 重新渲染模板
         * @param m {Object} 重新渲染dialog的配置对象，包括title、content、content中涉及的插值表达式，需要注意的是，title和content不是真正渲染的内容，所以不需要avalon进行扫描监控，定义的时候必须在其前面加上"$",否则组件不会渲染成想要的效果
         */
        setModel: avalon.noop,
        //@config配置dialog是否显示"取消"按钮，但是如果type为alert，不论showClose为true or false都不会显示"取消"按钮
        showClose: true,
        toggle: false,
        //@config 通过此属性的决定dialog的显示或者隐藏状态
        widgetElement: '',
        //@config 保存对绑定元素的引用
        container: 'body',
        //@config dialog元素的上下文父元素，container必须是dialog要appendTo的父元素的id或者元素dom对象
        confirmName: '\u786E\u5B9A',
        //@config 配置dialog的"确定"按钮的显示文字
        cancelName: '\u53D6\u6D88',
        //@config 配置dialog的"取消"按钮的显示文字
        getTemplate: function (str, options) {
            return str;
        },
        /**
         * @config {Function} 通过此方法配置dialog的footer
         * @param tmp {String} dialog默认模板的footer
         * @returns {String} 用户自定义的dialog的footer 
         */
        getFooter: function (tmp) {
            return tmp;
        },
        modal: true,
        //@config 是否显示遮罩
        zIndex: 0,
        //@config 通过设置vmodel的zIndex来改变dialog的z-index,默认是body直接子元素中的最大z-index值，如果都没有设置就默认的为10
        zIndexIncrementGlobal: 0    //@config 相对于zIndex的增量, 用于全局配置，如果只是作用于单个dialog那么zIndex的配置已足够，设置全局需要通过avalon.ui.dialog.defaults.zIndexIncrementGlobal = Number来设置
    };
    avalon(window).bind('keydown', function (e) {
        var keyCode = e.which, dialogShowLen = dialogShows.length;
        if (keyCode === 27 && dialogShowLen) {
            dialogShows[dialogShowLen - 1].toggle = false;
        }
    });
    // 获取重新渲染dialog的vmodel对象
    function findModel(m) {
        var model = m;
        if (model) {
            // 如果m为字符串参数，说明是要在已存在的vmodels中查找对应id的vmodel
            if (avalon.type(model) === 'string') {
                model = avalon.vmodels[model];
            }
        } else {
            // 如果没有传递参数m，则返回空vmodel
            model = avalon.define('dialogVM' + setTimeout('1'), function (vm) {
            });
        }
        if (!model) {
            throw new Error('\u60A8\u67E5\u627E\u7684' + model + '\u4E0D\u5B58\u5728');
        }
        // 如果传入的是avalon的vmodel格式的参数对象，直接返回，如果是普通的对象，将其转换为avalon的监控对象
        if (avalon.isPlainObject(model) && !model.$id && !model.$accessors) {
            model = avalon.define('dialogVM' + setTimeout('1'), function (vm) {
                avalon.mix(vm, m);
            });
        }
        return [].concat(model);
    }
    // resize、scroll等频繁触发页面回流的操作要进行函数节流
    function throttle(fn, delay, mustRunDelay, args) {
        var timer = null;
        var t_start;
        return function () {
            var context = this, t_curr = +new Date();
            clearTimeout(timer);
            if (!t_start) {
                t_start = t_curr;
            }
            if (t_curr - t_start >= mustRunDelay) {
                fn.apply(context, args);
                t_start = t_curr;
            } else {
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            }
        };
    }
    // 使dialog始终出现在视窗中间
    function resetCenter(vmodel, target, scroll) {
        var clientWidth, clientHeight, targetOffsetWidth, targetOffsetHeight, $maskLayer = avalon(maskLayer), $maskLayerSimulate = avalon(maskLayerSimulate), $target = avalon(target), scrollTop, scrollLeft, documentElement, top = 0, left = 0;
        if (!vmodel.toggle)
            return;
        documentElement = document.compatMode && document.compatMode.toLowerCase() == 'css1compat' ? document.documentElement : document.body;
        // clientWidth和clientHeight在现有浏览器都是兼容的(IE5),但在混杂模式下，得通过documentView属性提供宽度和高度
        clientWidth = document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;
        clientHeight = document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
        scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
        scrollLeft = documentElement.scrollLeft;
        targetOffsetWidth = target.offsetWidth;
        targetOffsetHeight = target.offsetHeight;
        if (targetOffsetHeight < clientHeight) {
            top = (clientHeight - targetOffsetHeight) / 2;
        } else {
            top = 0;
        }
        if (targetOffsetWidth < clientWidth) {
            left = (clientWidth - targetOffsetWidth) / 2 + scrollLeft;
        } else {
            left = 0;
        }
        if (targetOffsetHeight < clientHeight && targetOffsetWidth < clientWidth) {
            if (!isIE6) {
                vmodel.position = 'fixed';
            }
        } else {
            if (!isIE6) {
                vmodel.position = 'absolute';
            }
        }
        if (scroll && vmodel.position == 'fixed')
            return;
        if (vmodel.position === 'absolute') {
            if (dialogShows.length > 1) {
                for (var i = 0; i < dialogShows.length - 1; i++) {
                    dialogShows[i].widgetElement.style.display = 'none';
                }
            }
            $maskLayer.css({
                height: clientHeight,
                width: clientWidth,
                top: scrollTop,
                position: 'absolute'
            });
            $maskLayerSimulate.css({
                height: clientHeight,
                width: clientWidth,
                top: scrollTop,
                overflow: 'auto',
                position: 'absolute'
            });
        } else {
            if (dialogShows.length > 1) {
                for (var i = 0; i < dialogShows.length - 1; i++) {
                    dialogShows[i].widgetElement.style.display = 'block';
                }
            }
            $maskLayer.css({
                height: 'auto',
                width: 'auto',
                top: 0,
                position: 'fixed'
            });
            $maskLayerSimulate.css({
                height: 'auto',
                width: 'auto',
                top: 0,
                position: 'static'
            });
        }
        $target.css({
            left: left,
            top: top
        });
    }
    // 获取body子元素最大的z-index
    function getMaxZIndex() {
        var children = document.body.children, maxIndex = 10,
            //当body子元素都未设置zIndex时，默认取10
            zIndex;
        for (var i = 0, el; el = children[i++];) {
            if (el.nodeType === 1) {
                if (el === maskLayer)
                    continue;
                zIndex = ~~avalon(el).css('z-index');
                if (zIndex) {
                    maxIndex = Math.max(maxIndex, zIndex);
                }
            }
        }
        return maxIndex + 1;
    }
    // IE6下创建iframe遮住不能被遮罩层遮住的select
    function createIframe() {
        var iframe = document.createElement('<iframe src="javascript:\'\'" style="position:absolute;top:0;left:0;bottom:0;margin:0;padding:0;right:0;zoom:1;width:' + maskLayer.style.width + ';height:' + maskLayer.style.height + ';z-index:' + (maskLayer.style.zIndex - 1) + ';"></iframe>');
        document.body.appendChild(iframe);
        return iframe;
    }
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "3468f5e6cdb6eaf730ab82df91191936" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "0e5a49bcf20149a32e40db47681bc9ad" , 
        filename : "avalon.position.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    var cachedScrollbarWidth, abs = Math.abs, round = Math.round, rhorizontal = /left|center|right/, rvertical = /top|center|bottom/, roffset = /[\+\-]\d+(\.[\d]+)?%?/, rposition = /^\w+/, rpercent = /%$/, cachedScrollbarWidth, oldPosition = avalon.fn.position, oldOffset = avalon.fn.offset;
    avalon.fn.offset = function (options) {
        if (avalon.type(options) === 'object') {
            return setOffset.call(this, options);
        }
        return oldOffset.call(this);
    };
    var myAt = [
            'my',
            'at'
        ];
    function setPosition(options) {
        // make a copy, we don't want to modify arguments
        options = avalon.mix({}, options);
        var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions, target = avalon(options.of),
            //这是作为基准的对象
            within = getWithinInfo(options.within),
            //如果没有指定，默认为window
            scrollInfo = getScrollInfo(within), collision = (options.collision || 'flip').split(' '), offsets = {};
        //at 是将元素放置容器的九个点（四个角+每条边的中心+矩形中心）
        //my 基于上面九个点再定位
        dimensions = getDimensions(target);
        if (target[0].preventDefault) {
            // force left top to allow flipping
            options.at = 'left top';
        }
        targetWidth = dimensions.width;
        targetHeight = dimensions.height;
        targetOffset = dimensions.offset;
        // clone to reuse original targetOffset later
        basePosition = avalon.mix({}, targetOffset);
        // force my and at to have valid horizontal and vertical positions
        // if a value is missing or invalid, it will be converted to center
        myAt.forEach(function (el) {
            var pos = (options[el] || '').split(' '), horizontalOffset, verticalOffset;
            if (pos.length === 1) {
                pos = rhorizontal.test(pos[0]) ? pos.concat(['center']) : rvertical.test(pos[0]) ? ['center'].concat(pos) : [
                    'center',
                    'center'
                ];
            }
            pos[0] = rhorizontal.test(pos[0]) ? pos[0] : 'center';
            pos[1] = rvertical.test(pos[1]) ? pos[1] : 'center';
            // calculate offsets
            horizontalOffset = roffset.exec(pos[0]);
            verticalOffset = roffset.exec(pos[1]);
            offsets[el] = [
                horizontalOffset ? horizontalOffset[0] : 0,
                verticalOffset ? verticalOffset[0] : 0
            ];
            // reduce to just the positions without the offsets
            options[el] = [
                rposition.exec(pos[0])[0],
                rposition.exec(pos[1])[0]
            ];
        });
        // normalize collision option
        if (collision.length === 1) {
            collision[1] = collision[0];
        }
        if (options.at[0] === 'right') {
            basePosition.left += targetWidth;
        } else if (options.at[0] === 'center') {
            basePosition.left += targetWidth / 2;
        }
        if (options.at[1] === 'bottom') {
            basePosition.top += targetHeight;
        } else if (options.at[1] === 'center') {
            basePosition.top += targetHeight / 2;
        }
        atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
        basePosition.left += atOffset[0];
        basePosition.top += atOffset[1];
        // return this.each(function() {
        var collisionPosition, elem = this[0], elemWidth = elem.offsetWidth, elemHeight = elem.offsetHeight, marginLeft = parseCss(this, 'marginLeft'), marginTop = parseCss(this, 'marginTop'), collisionWidth = elemWidth + marginLeft + parseCss(this, 'marginRight') + scrollInfo.width, collisionHeight = elemHeight + marginTop + parseCss(this, 'marginBottom') + scrollInfo.height, position = avalon.mix({}, basePosition), myOffset = getOffsets(offsets.my, elemWidth, elemHeight);
        if (options.my[0] === 'right') {
            position.left -= elemWidth;
        } else if (options.my[0] === 'center') {
            position.left -= elemWidth / 2;
        }
        if (options.my[1] === 'bottom') {
            position.top -= elemHeight;
        } else if (options.my[1] === 'center') {
            position.top -= elemHeight / 2;
        }
        position.left += myOffset[0];
        position.top += myOffset[1];
        // if the browser doesn't support fractions, then round for consistent results
        position.left = round(position.left);
        position.top = round(position.top);
        collisionPosition = {
            marginLeft: marginLeft,
            marginTop: marginTop
        };
        [
            'left',
            'top'
        ].forEach(function (dir) {
            flip[dir](position, {
                targetWidth: targetWidth,
                targetHeight: targetHeight,
                elemWidth: elemWidth,
                elemHeight: elemHeight,
                collisionPosition: collisionPosition,
                collisionWidth: collisionWidth,
                collisionHeight: collisionHeight,
                offset: [
                    atOffset[0] + myOffset[0],
                    atOffset[1] + myOffset[1]
                ],
                my: options.my,
                at: options.at,
                within: within,
                elem: elem
            });
        });
        return this.offset(position);
    }
    var flip = {
            left: function (position, data) {
                var within = data.within, withinOffset = within.offset.left + within.scrollLeft, outerWidth = within.width, offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left, collisionPosLeft = position.left - data.collisionPosition.marginLeft, overLeft = collisionPosLeft - offsetLeft, overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft, myOffset = data.my[0] === 'left' ? -data.elemWidth : data.my[0] === 'right' ? data.elemWidth : 0, atOffset = data.at[0] === 'left' ? data.targetWidth : data.at[0] === 'right' ? -data.targetWidth : 0, offset = -2 * data.offset[0], newOverRight, newOverLeft;
                if (overLeft < 0) {
                    newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                    if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                        position.left += myOffset + atOffset + offset;
                    }
                } else if (overRight > 0) {
                    newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                    if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                        position.left += myOffset + atOffset + offset;
                    }
                }
            },
            top: function (position, data) {
                var within = data.within, withinOffset = within.offset.top + within.scrollTop, outerHeight = within.height, offsetTop = within.isWindow ? within.scrollTop : within.offset.top, collisionPosTop = position.top - data.collisionPosition.marginTop, overTop = collisionPosTop - offsetTop, overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop, top = data.my[1] === 'top', myOffset = top ? -data.elemHeight : data.my[1] === 'bottom' ? data.elemHeight : 0, atOffset = data.at[1] === 'top' ? data.targetHeight : data.at[1] === 'bottom' ? -data.targetHeight : 0, offset = -2 * data.offset[1], newOverTop, newOverBottom;
                if (overTop < 0) {
                    newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                    if (position.top + myOffset + atOffset + offset > overTop && (newOverBottom < 0 || newOverBottom < abs(overTop))) {
                        position.top += myOffset + atOffset + offset;
                    }
                } else if (overBottom > 0) {
                    newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                    if (position.top + myOffset + atOffset + offset > overBottom && (newOverTop > 0 || abs(newOverTop) < overBottom)) {
                        position.top += myOffset + atOffset + offset;
                    }
                }
            }
        };
    avalon.fn.position = function (options) {
        if (avalon.type(options) === 'object') {
            return setPosition.call(this, options);
        }
        return oldPosition.call(this);
    };
    //===========================学习express的做法，将私有函数放在底部================================
    function getDimensions(elem) {
        var raw = elem[0];
        if (raw.nodeType === 9) {
            return {
                width: elem.width(),
                height: elem.height(),
                offset: {
                    top: 0,
                    left: 0
                }
            };
        }
        if (avalon.isWindow(raw)) {
            return {
                width: elem.width(),
                height: elem.height(),
                offset: {
                    top: elem.scrollTop(),
                    left: elem.scrollLeft()
                }
            };
        }
        if (raw.preventDefault) {
            return {
                width: 0,
                height: 0,
                offset: {
                    top: raw.pageY,
                    left: raw.pageX
                }
            };
        }
        return {
            width: raw.offsetWidth,
            height: raw.offsetHeight,
            offset: elem.offset()
        };
    }
    function getOffsets(offsets, width, height) {
        return [
            parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1),
            parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)
        ];
    }
    function parseCss(element, property) {
        return parseInt(element.css(property), 10) || 0;
    }
    function setOffset(options) {
        var elem = this[0];
        var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = this.css('position');
        // Set position first, in-case top/left are set even on static elem
        if (position === 'static') {
            elem.style.position = 'relative';
        }
        curOffset = this.offset();
        curCSSTop = this.css('top');
        curCSSLeft = this.css('left');
        calculatePosition = (position === 'absolute' || position === 'fixed') && (curCSSTop + curCSSLeft).indexOf('auto') > -1;
        // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
        if (calculatePosition) {
            curPosition = this.position();
            curTop = curPosition.top;
            curLeft = curPosition.left;
        } else {
            curTop = parseFloat(curCSSTop) || 0;
            curLeft = parseFloat(curCSSLeft) || 0;
        }
        if (options.top != null) {
            elem.style.top = options.top - curOffset.top + curTop + 'px';
        }
        if (options.left != null) {
            elem.style.left = options.left - curOffset.left + curLeft + 'px';
        }
        return this;
    }
    function scrollbarWidth() {
        //求出当前页面滚动条的宽，IE6-7好像固定是17px
        if (cachedScrollbarWidth !== void 0) {
            return cachedScrollbarWidth;
        }
        var w1, w2, div = avalon.parseHTML('<div style=\'display:block;position:absolute;width:50px;height:50px;overflow:hidden;\'><div style=\'height:100px;width:auto;\'></div></div>').firstChild, innerDiv = div.children[0];
        document.body.appendChild(div);
        w1 = innerDiv.offsetWidth;
        div.style.overflow = 'scroll';
        w2 = innerDiv.offsetWidth;
        if (w1 === w2) {
            w2 = div.clientWidth;
        }
        document.body.removeChild(div);
        return cachedScrollbarWidth = w1 - w2;
    }
    function getScrollInfo(within) {
        //within为getWithinInfo返回的对象
        var overflowX = within.isWindow ? '' : within.element.css('overflow-x'), overflowY = within.isWindow ? '' : within.element.css('overflow-y'), hasOverflowX = overflowX === 'scroll' || overflowX === 'auto' && within.width < within.element[0].scrollWidth, hasOverflowY = overflowY === 'scroll' || overflowY === 'auto' && within.height < within.element[0].scrollHeight;
        return {
            width: hasOverflowY ? scrollbarWidth() : 0,
            height: hasOverflowX ? scrollbarWidth() : 0
        };
    }
    function getWithinInfo(element) {
        //求得当前对象一切涉及尺寸的数值
        var withinElement = avalon(element || window), isWindow = avalon.isWindow(withinElement[0]);
        return {
            element: withinElement,
            isWindow: isWindow,
            offset: withinElement.offset() || {
                left: 0,
                top: 0
            },
            scrollLeft: withinElement.scrollLeft(),
            scrollTop: withinElement.scrollTop(),
            width: isWindow ? withinElement.width() : withinElement[0].offsetWidth,
            height: isWindow ? withinElement.height() : withinElement[0].offsetHeight
        };
    }
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "0e5a49bcf20149a32e40db47681bc9ad" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "41970ead5870f4b28b987ecfe62f5717" , 
        filename : "avalon.tooltip.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<div class=\"oni-widget oni-tooltip oni-helper-reset oni-widget-content oni-corner-all oni-tooltip oni-tooltip-hidden\" \n\t ms-class=\"oni-tooltip-{{arrClass}}\" \n\t ms-css-height=\"height\" \n\t ms-css-width=\"width\">\n\t<div class=\"oni-tooltip-content\">\n\t\t{{(content+\"\") | html}}\n\t</div>\n\t<b ms-if=\"arrow\" class=\"oni-tooltip-arrow-out\"></b>\n\t<b ms-if=\"arrow\" class=\"oni-tooltip-arrow-in\"></b>\n</div>";
__context.____MODULES['0e5a49bcf20149a32e40db47681bc9ad'];

module.exports = (
function () {
    var undefine;
    function hideElement(ele) {
        ele.style.display = 'none';
    }
    function showElement(ele) {
        ele.style.display = 'block';
    }
    var widget = avalon.ui.tooltip = function (element, data, vmodels) {
            var options = data.tooltipOptions, selfContent = '', hideTimer, animateTimer, tooltipElem, customAt = options.positionAt, customMy = options.positionMy, lessH = 2, lessW = 1, arrH = 10, arrW = 10, p = options.position, constantInited, ofElement, _event_ele, setContent;
            // showBy指定的content
            //方便用户对原始模板进行修改,提高定制性
            options.template = options.getTemplate(template, options);
            function _init(p) {
                var cName = 'left', p = p == undefine ? options.position : p;
                if (!(customMy && customAt)) {
                    switch (p) {
                    case 'tc':
                        //正上方
                        customMy = 'center bottom-' + arrH;
                        customAt = 'center top';
                        cName = 'bottom';
                        break;
                    case 'tl':
                        //上方靠左
                        customMy = 'left bottom-' + arrH;
                        customAt = 'left top';
                        cName = 'bottom';
                        break;
                    case 'tr':
                        //上方靠右
                        customMy = 'right bottom-' + arrH;
                        customAt = 'right top';
                        cName = 'bottom';
                        break;
                    case 'lt':
                        //左方靠上
                        customMy = 'right-' + arrW + ' top';
                        customAt = 'left top';
                        cName = 'right';
                        break;
                    case 'lc':
                        //正左方
                        customMy = 'right-' + arrW + ' center';
                        customAt = 'left center';
                        cName = 'right';
                        break;
                    case 'lb':
                        //左方靠下
                        customMy = 'right-' + arrW + ' bottom';
                        customAt = 'left bottom';
                        cName = 'right';
                        break;
                    case 'rt':
                        //右方靠上
                        customMy = 'left+' + arrW + ' top';
                        customAt = 'right top';
                        cName = 'left';
                        break;
                    case 'rc':
                        //正右方
                        customMy = 'left+' + arrW + ' center';
                        customAt = 'right center';
                        cName = 'left';
                        break;
                    case 'rb':
                        //右方靠下
                        customMy = 'left+' + arrW + ' bottom';
                        customAt = 'right bottom';
                        cName = 'left';
                        break;
                    case 'bl':
                        //下方靠左
                        customMy = 'left top+' + arrH;
                        customAt = 'left bottom';
                        cName = 'top';
                        break;
                    case 'bc':
                        //正下方
                        customMy = 'center top+' + arrH;
                        customAt = 'center bottom';
                        cName = 'top';
                        break;
                    case 'br':
                        //下方靠右
                        customMy = 'right top+' + arrH;
                        customAt = 'right bottom';
                        cName = 'top';
                        break;
                    case 'cc':
                        //居中
                        customMy = customAt = 'center center';
                        cName = 'bottom';
                        break;
                    default:
                        customMy = 'left top+' + arrH;
                        customAt = 'left bottom';
                        cName = 'bottom';
                        break;
                    }
                } else {
                    var ats = customAt.replace(/[0-9\+\-]+/g, '').split(/\s+/), mys = customMy.replace(/[0-9\+\-]+/g, '').split(/\s+/);
                    // top or bottom
                    if (ats[0] == mys[0]) {
                        if (ats[1] == 'top') {
                            cName = 'bottom';
                        } else {
                            cName = 'top';
                        }
                    } else if (ats[1] == mys[1]) {
                        if (ats[0] == 'left') {
                            cName = 'right';
                        } else {
                            cName = 'left';
                        }
                    } else {
                        cName = mys[1] || 'bottom';
                    }
                }
                return cName;
            }
            var vmodel = avalon.define(data.tooltipId, function (vm) {
                    avalon.mix(vm, options);
                    if (vm.content == undefine)
                        vm.content = element.getAttribute('title');
                    vm.widgetElement = element;
                    vm.arrClass = 'left';
                    var tooltipElems = {};
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        'delegate',
                        'rootElement'
                    ];
                    vm.rootElement = '';
                    vm.toggle = '';
                    var inited;
                    vm.$init = function (continueScan) {
                        if (inited)
                            return;
                        inited = true;
                        vmodel.arrClass = _init(vmodel.position);
                        // 埋个钩子
                        vmodel.widgetElement.setAttribute('oni-tooltip-id', vmodel.$id);
                        if (vmodel.event == 'mouseenter' && vmodel.delegate) {
                            vmodel.event = 'mouseover';
                        }
                        tooltipElem = tooltipELementMaker(vmodel.container);
                        vm.rootElement = tooltipElem;
                        avalon.scan(tooltipElem, [vmodel].concat(vmodels));
                        vmodel.event && element.setAttribute('ms-' + vmodel.event + '-101', '_showHandlder($event)');
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                    vm.$remove = function () {
                        if (tooltipElem && tooltipElem.parentNode)
                            tooltipElem.parentNode.removeChild(tooltipElem);
                    };
                    //@interface show(elem) 用这个方法来刷新tooltip的位置
                    vm.show = function (elem) {
                        if (vmodel.disabled || !tooltipElem)
                            return;
                        if (elem == undefine)
                            elem = ofElement;
                        if (elem) {
                            ofElement = elem;
                            var tipElem = avalon(tooltipElem), atEle = avalon(elem), tipElemAt = customAt, tipElemMy = customMy, bs = tooltipElem.getElementsByTagName('b'), arrOut, arrIn, container = vmodel.container;
                            for (var i = 0, len = bs.length; i < len; i++) {
                                var tb = avalon(bs[i]);
                                if (tb.hasClass('oni-tooltip-arrow-out')) {
                                    arrOut = tb;
                                } else if (tb.hasClass('oni-tooltip-arrow-in')) {
                                    arrIn = tb;
                                }
                            }
                            // 哎，无语的加个延时
                            avalon.nextTick(function () {
                                showElement(tooltipElem);
                                // 定位toolp元素
                                tipElem.position({
                                    of: elem,
                                    at: tipElemAt,
                                    my: tipElemMy,
                                    collision: vmodel.collision,
                                    within: (avalon.isFunction(container) ? container() : container) || document.body
                                });
                                avalon(tooltipElem).removeClass('oni-tooltip-hidden');
                                var tipPos = tipElem.offset(), elemPos = atEle.offset();
                                // position组件自动调整的时候调整箭头上下朝向
                                if (elem.nodeName) {
                                    if (tipPos.top > atEle.offset().top + elem.offsetHeight && vmodel.arrClass == 'bottom') {
                                        vmodel.arrClass = 'top';
                                        tipElem.removeClass('oni-tooltip-bottom').addClass('oni-tooltip-top');
                                    } else if (tipPos.top + tooltipElem.offsetHeight < atEle.offset().top && vmodel.arrClass == 'top') {
                                        vmodel.arrClass = 'bottom';
                                        tipElem.removeClass('oni-tooltip-top').addClass('oni-tooltip-bottom');
                                    }
                                    // 根据元素和tooltip元素的宽高调整箭头位置
                                    if (arrOut && arrIn) {
                                        var dir = vmodel.arrClass == 'bottom' || vmodel.arrClass == 'left', avalonElem = avalon(elem), moveToLeft = tipPos.left + tooltipElem.offsetWidth / 2 > avalonElem.offset().left + elem.offsetWidth, moveToRight = tipPos.left + tooltipElem.offsetWidth / 2 < avalonElem.offset().left;
                                        // tip元素中线偏出elem
                                        if ((vmodel.arrClass == 'top' || vmodel.arrClass == 'bottom') && (moveToRight || moveToLeft)) {
                                            arrOut.position({
                                                of: tooltipElem,
                                                at: (moveToRight ? 'right' : 'left') + ' ' + (dir ? 'bottom' : 'top'),
                                                my: (moveToRight ? 'right-10' : 'left+10') + ' ' + (dir ? 'top' : 'bottom'),
                                                within: tooltipElem
                                            });
                                            arrIn.position({
                                                of: tooltipElem,
                                                at: (moveToRight ? 'right' : 'left') + ' ' + (dir ? 'bottom' : 'top'),
                                                my: (moveToRight ? 'right-11' : 'left+11') + ' ' + (dir ? 'top-' : 'bottom+') + lessH / 2,
                                                within: tooltipElem
                                            })    // 竖直方向，高度不够  
;
                                        } else if ((vmodel.arrClass == 'bottom' || vmodel.arrClass == 'top') && tooltipElem.offsetWidth < elem.offsetWidth) {
                                            arrOut.position({
                                                of: tooltipElem,
                                                at: 'center ' + (dir ? 'bottom' : 'top'),
                                                my: 'center ' + (dir ? 'top' : 'bottom'),
                                                within: tooltipElem
                                            });
                                            arrIn.position({
                                                of: tooltipElem,
                                                at: 'center ' + (dir ? 'bottom' : 'top'),
                                                my: 'center ' + (dir ? 'top-' : 'bottom+') + lessH,
                                                within: tooltipElem
                                            })    // 水平方向，宽度不够
;
                                        } else if ((vmodel.arrClass == 'left' || vmodel.arrClass == 'right') && tooltipElem.offsetHeight < elem.offsetHeight) {
                                            arrOut.position({
                                                of: tooltipElem,
                                                at: (dir ? 'left' : 'right') + ' center',
                                                my: (dir ? 'right' : 'left') + ' center',
                                                within: tooltipElem
                                            });
                                            arrIn.position({
                                                of: tooltipElem,
                                                at: (dir ? 'left' : 'right') + ' center',
                                                my: (dir ? 'right+' : 'left-') + lessW + ' center',
                                                within: tooltipElem
                                            });
                                        } else {
                                            // vvvvvvvvvvvvvvvvvvvvvvvvvvvvv
                                            var elemH = elem.offsetHeight, elemW = elem.offsetWidth, oleft;
                                            switch (vmodel.arrClass) {
                                            case 'left':
                                            case 'right':
                                                if (vmodel.arrClass == 'left') {
                                                    arrOut[0].style.left = '-6px';
                                                    arrIn[0].style.left = '-5px';
                                                } else {
                                                    arrOut[0].style.right = '-5px';
                                                    arrIn[0].style.right = '-4px';
                                                }
                                                oleft = Math.floor(elemH / 2) - tipPos.top + elemPos.top;
                                                arrOut[0].style.top = oleft + 'px';
                                                arrIn[0].style.top = oleft + 1 + 'px';
                                                break;
                                            case 'top':
                                            case 'bottom':
                                            default:
                                                if (vmodel.arrClass == 'top') {
                                                    arrOut[0].style.top = '-6px';
                                                    arrIn[0].style.top = '-5px';
                                                } else {
                                                    arrOut[0].style.top = arrIn[0].style.top = 'auto';
                                                    arrOut[0].style.bottom = '-6px';
                                                    arrIn[0].style.bottom = '-5px';
                                                }
                                                oleft = Math.floor(elemW / 2) - tipPos.left + elemPos.left;
                                                arrOut[0].style.left = oleft + 'px';
                                                arrIn[0].style.left = oleft + 1 + 'px';
                                            }
                                        }
                                    }
                                }
                                // IE里面透明箭头显示有问题，屏蔽掉
                                if (vmodel.animated && !!-[1]) {
                                    clearInterval(animateTimer);
                                    var now = avalon(tooltipElem).css('opacity') * 100 >> 0;
                                    if (now != 100) {
                                        var dis = vmodel._animateArrMaker(now, 100);
                                        dis.splice(0, 1);
                                        animateTimer = setInterval(function () {
                                            if (dis.length <= 0) {
                                                return clearInterval(animateTimer);
                                            }
                                            avalon(tooltipElem).css('opacity', dis[0] / 100);
                                            dis.splice(0, 1);
                                        }, 16);
                                    }
                                }
                            });
                        }
                    };
                    //@interface hide($event) 隐藏tooltip，参数是$event，可缺省
                    vm.hide = function (e) {
                        e && e.preventDefault && e.preventDefault();
                        if (vmodel.toggle) {
                            vmodel.toggle = false;
                        } else {
                            vmodel._hide();
                        }
                    };
                    // 隐藏效果动画
                    vm._hide = function (e) {
                        if (!tooltipElem)
                            return;
                        if (vmodel.animated && !!-[1]) {
                            clearInterval(animateTimer);
                            var now = avalon(tooltipElem).css('opacity') * 100 >> 0;
                            if (now) {
                                var dis = vmodel._animateArrMaker(now, 0);
                                animateTimer = setInterval(function () {
                                    if (dis.length <= 0) {
                                        hideElement(tooltipElem);
                                        avalon(tooltipElem).addClass('oni-tooltip-hidden');
                                        return clearInterval(animateTimer);
                                    }
                                    avalon(tooltipElem).css('opacity', dis[0] / 100);
                                    dis.splice(0, 1);
                                }, 50);
                            }
                        } else {
                            hideElement(tooltipElem);
                        }
                    };
                    // 为了实现通过toggle属性控制显示隐藏
                    vm._hideHandlder = function () {
                        if (vmodel.toggle) {
                            vmodel.toggle = false;
                        } else {
                            vmodel._hide();
                        }
                    };
                    // 响应widget元素的事件
                    vm._showHandlder = function (event, force) {
                        vmodel._show(event, undefine, this);
                    };
                    vm._show = function (e, content, ele) {
                        var tar = ele || _event_ele || vmodel.widgetElement, src = e && (e.srcElement || e.target) || ofElement || vmodel.widgetElement, content = content || setContent;
                        // delegate情形下，从src->this找到符合要求的元素
                        if (content === undefine) {
                            if (vmodel.delegate) {
                                content = vmodel.contentGetter.call(vmodel, src);
                                while (!content && src && src != tar) {
                                    src = src.parentNode;
                                    content = vmodel.contentGetter.call(vmodel, src);
                                }
                                tar = src;
                            } else {
                                content = vmodel.contentGetter.call(vmodel, tar);
                            }
                        } else {
                            tar = src;
                        }
                        if (content == undefine) {
                            return;
                        }
                        ofElement = tar;
                        clearTimeout(hideTimer);
                        clearTimeout(animateTimer);
                        var inited = tar.getAttribute('oni-tooltip-inited');
                        // 禁用默认的title
                        var oldTitle = tar.title;
                        if (vmodel.content != content)
                            vmodel.content = content;
                        if (tar.title)
                            tar.title = '';
                        if (!tooltipElem) {
                            tooltipElem = tooltipELementMaker(vmodel.container);
                            avalon.scan(tooltipElem, [vmodel].concat(vmodels));
                        }
                        // 减少抖动
                        if (!vmodel.track) {
                            _init(vmodel.arrClass);
                        }
                        vmodel.show(vmodel.track ? e || tar : tar);
                        var inited = tar.getAttribute('oni-tooltip-inited');
                        if (!inited) {
                            tar.setAttribute('oni-tooltip-inited', 1);
                            // 自动隐藏
                            vmodel.autohide && avalon(tar).bind(vmodel.event != 'focus' ? 'mouseout' : 'blur', function (e) {
                                if (oldTitle)
                                    tar.title = oldTitle;
                                clearTimeout(hideTimer);
                                if (vmodel.autohide)
                                    hideTimer = setTimeout(vmodel._hideHandlder, vmodel.hiddenDelay);
                            });
                            // 鼠标跟随
                            if (vmodel.track && (vmodel.event == 'mouseover' || vmodel.event == 'mouseenter')) {
                                avalon(tar).bind('mousemove', function (e) {
                                    // 阻止冒泡，防止代理情况下的重复执行过多次
                                    e.stopPropagation();
                                    ofElement = e;
                                    vmodel.show(e);
                                    // 减少抖动
                                    avalon(tooltipElem).removeClass('oni-tooltip-hidden');
                                });
                            }
                        }
                    };
                    /*
             * @interface showBy($event, content) 参数满足 {target: elem}这样，或者是一个elem元素亦可，tooltip会按照elem定位，并作为参数传递给contentGetter，如果指定content，则忽略contentGetter的返回，直接显示content内容
             * @param $event 定位参照物，可以是一个事件，也可以是一个元素，如果未提供有效的元素或者事件，则采用上一次定位的元素或者事件来定位
             * @param content 用来填充tooltip的内容
             */
                    vm.showBy = function (obj, content) {
                        var tar = obj && obj.tagName ? obj : obj && obj.target || obj && obj.srcElement || ofElement || element;
                        // 如果已显示则更新内容
                        if (vmodel.toggle)
                            vmodel.content = content || vmodel.contentGetter.call(vmodel, tar);
                        _event_ele = ofElement = tar;
                        setContent = content;
                        if (!vmodel.toggle) {
                            vmodel.toggle = true;
                        } else {
                            vmodel.show(tar)    // 更新位置
;
                        }
                        setContent = undefine;
                    };
                    vm._isShown = function () {
                        var elem = avalon(tooltipElem);
                        return elem.css('display') != 'none' && !elem.hasClass('oni-tooltip-hidden');
                    };
                    /**
             *  @interface 将toolTip元素注入到指定的元素内，请在调用appendTo之后再调用showBy
             *  @param 目标元素
             */
                    vm.appendTo = function (ele) {
                        if (ele) {
                            ele.appendChild(tooltipElem);
                            // 更新位置
                            vmodel.toggle && vmodel.show();
                        }
                    };
                });
            function tooltipELementMaker(container) {
                var f = avalon.parseHTML(vmodel.template);
                var tooltipElem = f.childNodes[0];
                container = (avalon.isFunction(container) ? container() : container) || document.body;
                container.appendChild(f);
                return tooltipElem;
            }
            vmodel.$watch('position', function (newValue) {
                _init(vmodel.position);
                vmodel._isShown() && vmodel.show();
            });
            vmodel.$watch('positionAt', function (newValue) {
                customAt = newValue;
                _init(vmodel.position);
                vmodel._isShown() && vmodel.show();
            });
            vmodel.$watch('positionMy', function (newValue) {
                customMy = newValue;
                _init(vmodel.position);
                vmodel._isShown() && vmodel.show();
            });
            vmodel.$watch('toggle', function (n) {
                if (n) {
                    vmodel._show(ofElement, setContent || vmodel.content);
                } else {
                    vmodel._hide();
                }
            });
            return vmodel;
        };
    widget.defaults = {
        toggle: false,
        //@config 组件是否显示，可以通过设置为false来隐藏组件，设置为true来显示【在原来的位置展示原来的内容，如果需要改变位置、内容，请使用showBy】
        collision: 'none',
        //@config 溢出检测，当被定位元素在某些方向上溢出窗口，则移动它到另一个位置。与 my 和 at 选项相似，该选项会接受一个单一的值或一对 horizontal/vertical 值。例如：flip、fit、fit flip、fit none。/nflip：翻转元素到目标的相对一边，再次运行 collision 检测一遍查看元素是否适合。无论哪一边允许更多的元素可见，则使用那一边。/nfit：把元素从窗口的边缘移开。/nflipfit：首先应用 flip 逻辑，把元素放置在允许更多元素可见的那一边。然后应用 fit 逻辑，确保尽可能多的元素可见。/nnone: 不检测
        event: 'mouseenter',
        //@config 显示tooltip的事件，默认hover的时候显示tooltip，为false的时候就不绑定事件，如果后面设置了自动隐藏，则mouseenter对应的是mouseleave,focus对应的是blur，进行自动隐藏事件侦听，使用代理的时候，目测不支持focus,blur，event可以配置为空，则不会添加事件侦听
        content: void 0,
        //@config tooltip显示内容，默认去获取element的title属性
        container: void 0,
        //@config {Element} 把tooltip元素append到container指定的这个元素内，可以是一个函数，用以返回一个元素
        width: 'auto',
        //@config tip宽度，默认是auto
        height: 'auto',
        //@config tip高度，默认是auto    
        arrow: true,
        //@config 是否显示尖角图标，默认为true
        autohide: true,
        //@config 元素hoverout之后，是否自动隐藏tooltip，默认true
        delegate: false,
        //@config 元素是否只作为一个代理元素，这样适合对元素内多个子元素进行tooltip绑定
        disabled: false,
        //@config 禁用
        track: false,
        //@config tooltip是否跟随鼠标，默认否
        animated: true,
        //@config 是否开启显示隐藏切换动画效果
        position: 'rt',
        //@config tooltip相对于element的位置，like: rt,rb,rc...
        positionMy: false,
        //@config tooltip元素的定位点，like: left top+11
        positionAt: false,
        //@config element元素的定位点，like: left top+11,positionAt && positionMy时候忽略position设置
        hiddenDelay: 16,
        //@config tooltip自动隐藏时间，单位ms
        //@config onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
        onInit: avalon.noop,
        contentGetter: function (elem) {
            if (elem.tagName.toLowerCase() != 'a')
                return;
            return elem.title;
        },
        //@config contentGetter() 获取内容接口，讲srcElement作为参数传递过来，默认是返回a标签的title，如果该函数返回为空，那么则不会显示tooltip
        //@config _animateArrMaker(from, to) 不支持css3动画效果步长生成器函数，返回一个数组，类似[0,xx,xx,xx,50]
        _animateArrMaker: function (from, to) {
            var arr = [], unit = 10, from = Math.floor(from / unit) * unit, to = Math.floor(to / unit) * unit, dis = to - from, d = dis > 0 ? unit : -unit;
            while (from != to) {
                from += d;
                from = from > 100 ? 100 : from;
                dis = parseInt(dis - d);
                if (Math.abs(dis) <= 1)
                    from = to;
                arr.push(from);
            }
            if (!arr.length)
                arr = [to];
            return arr;
        },
        getTemplate: function (tmpl, opts) {
            return tmpl;
        },
        //@config getTemplate(tpl, opts) 定制修改模板接口
        $author: 'skipper@123'
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "41970ead5870f4b28b987ecfe62f5717" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "c3d66d673e82f1489bf416e19cae0c47" , 
        filename : "avalon.scrollbar.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<div ms-repeat-pos=\"_position\" class=\"oni-scrollbar oni-helper-reset oni-helper-clearfix oni-widget\"\n     ms-visible=\"!disabled\"\n\t ms-class-100=\"oni-scrollbar-{{pos}}\" \n\t ms-class-101=\"oni-scrollbar-{{size}} oni-scrollbar-{{pos}}-{{size}}\" \n\t ms-class-102=\"oni-state-disabled:disabled\" \n\t ms-mouseenter=\"_show($event, 'always', $index)\" \n\t ms-visible=\"toggle\">\n\t<div ms-if=\"showBarHeader\" class=\"oni-scrollbar-arrow oni-scrollbar-arrow-up\" \n\t ms-click=\"_arrClick($event, 'up', pos, $index)\" \n\t ms-mousedown=\"_arrDown($event,'up', pos, $index)\" \n\t ms-class-100=\"oni-state-disabled:disabled\" \n\t ms-mouseup=\"_arrDown($event,'up', pos, $index,'release')\" \n\t ms-hover=\"oni-state-hover oni-scrollbar-arrow-hover\"><b class=\"oni-scrollbar-trangle  oni-scrollbar-trangle-up\"></b></div>\n\t<div class=\"oni-scrollbar-draggerpar\" ms-click=\"_barClick($event, pos, $index)\">\n\t\t<div class=\"oni-scrollbar-dragger\"\n\t\tms-attr-data-draggable-axis=\"pos == 'left' || pos == 'right' ? 'y' : 'x'\" \n\t\tms-click=\"_stopPropagation($event)\" \n\t\tms-class-100=\"oni-state-disabled:disabled\" \n\t\tms-mouseover=\"_show($event,'always',$index)\" \n\t\tms-mousedown=\"_draggerDown($event, true)\" \n\t\tms-mouseup=\"_draggerDown($event, false)\" \n\t\tms-mouseout=\"_draggerDown($event, false)\" \n\t\tms-hover=\"oni-state-hover\"\n\t\t>{{draggerHTML | html}}</div>\n\t</div>\n\t<div ms-if=\"showBarHeader\" class=\"oni-scrollbar-arrow oni-scrollbar-arrow-down\"\n\t ms-click=\"_arrClick($event, 'down', pos, $index)\"\n\t ms-mousedown=\"_arrDown($event,'down', pos, $index)\" \n\t ms-mouseup=\"_arrDown($event,'down', pos, $index,'release')\" \n\t ms-class-100=\"oni-state-disabled:disabled\" \n\t ms-hover=\"oni-state-hover\"><b class=\"oni-scrollbar-trangle oni-scrollbar-trangle-down\"></b></div>\n</div>";
__context.____MODULES['36e422bfb7dcb2fd648a019317e8a224'];

module.exports = (
function () {
    // get by className, not strict
    function getByClassName(cname, par) {
        var par = par || document.body;
        if (par.getElementsByClassName) {
            return par.getElementsByClassName(cname);
        } else {
            var child = par.getElementsByTagName('*'), arr = [];
            avalon.each(child, function (i, item) {
                var ele = avalon(item);
                if (ele.hasClass(cname))
                    arr.push(item);
            });
            return arr;
        }
    }
    function strToNumber(s) {
        return Math.round(parseFloat(s)) || 0;
    }
    // 响应wheel,binded
    var wheelBinded, wheelArr = [], keyArr = [];
    var widget = avalon.ui.scrollbar = function (element, data, vmodels) {
            var options = data.scrollbarOptions;
            //方便用户对原始模板进行修改,提高定制性
            options.template = options.getTemplate(template, options);
            var vmodel = avalon.define(data.scrollbarId, function (vm) {
                    avalon.mix(vm, options);
                    vm.widgetElement = element;
                    vm.draggerHeight = vm.draggerWidth = '';
                    vm.inFocuse = false;
                    vm._position = [];
                    vm.rootElement = element;
                    vm.viewElement = element;
                    vm.$skipArray = ['rootElement'];
                    vm.dragging = false;
                    var inited, bars = [], scroller;
                    vm.$init = function (continueScan) {
                        if (inited)
                            return;
                        inited = true;
                        vmodel.widgetElement.style.position = 'relative';
                        //document body情形需要做一下修正
                        vmodel.viewElement = vmodel.widgetElement == document.body ? document.getElementsByTagName('html')[0] : vmodel.widgetElement;
                        vmodel.viewElement.style.overflow = vmodel.viewElement.style.overflowX = vmodel.viewElement.style.overflowY = 'hidden';
                        if (vmodel.widgetElement == document.body)
                            vmodel.widgetElement.style.overflow = vmodel.widgetElement.style.overflowX = vmodel.widgetElement.style.overflowY = 'hidden';
                        vmodel._position = vmodel.position.split(',');
                        var frag = avalon.parseHTML(options.template);
                        vmodel.widgetElement.appendChild(frag);
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                        var children = vmodel.widgetElement.childNodes;
                        avalon.each(children, function (i, item) {
                            var ele = avalon(item);
                            if (ele.hasClass('oni-scrollbar') || ele.hasClass('ui-scrollbar')) {
                                bars.push(ele);
                            } else if (ele.hasClass('oni-scrollbar-scroller') || ele.hasClass('ui-scrollbar-scroller')) {
                                scroller = ele;
                            }
                        });
                        // 竖直方向支持滚轮事件
                        if (vmodel.position.match(/left|right/g)) {
                            var vs = [], hs = [];
                            avalon.each(vmodel._position, function (i, item) {
                                if (item.match(/left|right/g)) {
                                    vs.push([
                                        i,
                                        item
                                    ]);
                                } else {
                                    hs.push([
                                        i,
                                        item
                                    ]);
                                }
                            });
                            function wheelLike(diretion, arr, e, func) {
                                avalon.each(arr, function (i, item) {
                                    if (!bars[i].data('oni-scrollbar-needed'))
                                        return;
                                    vmodel._computer(func || function (obj) {
                                        return vmodel._clickComputer(obj, diretion);
                                    }, item[0], item[1], function (breakOut) {
                                        if (!breakOut)
                                            e.preventDefault();
                                    }, 'breakOutCallbackCannotIgnore');
                                });
                            }
                            function myOnWheel(e) {
                                if (vmodel.disabled)
                                    return;
                                if (vmodel.inFocuse) {
                                    wheelLike(e.wheelDelta > 0 ? 'up' : 'down', vs, e);
                                }
                            }
                            function myKeyDown(e) {
                                if (vmodel.disabled)
                                    return;
                                var k = e.keyCode;
                                if (k > 32 && k < 41 & vmodel.inFocuse) {
                                    // 方向按键
                                    if (k in {
                                            37: 1,
                                            39: 1,
                                            38: 1,
                                            40: 1
                                        }) {
                                        wheelLike(k in {
                                            37: 1,
                                            38: 1
                                        } ? 'up' : 'down', k in {
                                            38: 1,
                                            40: 1
                                        } ? vs : hs, e)    // end or home
                                                           // pageup or pagedown
;
                                    } else {
                                        var diretion = k in {
                                                33: 1,
                                                36: 1
                                            } ? 'up' : 'down';
                                        wheelLike(diretion, vs, e, function (obj) {
                                            var _top = scroller[0].scrollTop;
                                            // home, pageup
                                            if (k in {
                                                    33: 1,
                                                    36: 1
                                                }) {
                                                if (_top)
                                                    e.preventDefault()    // end, pagedown
;
                                            } else {
                                                if (_top < obj.scrollerH - obj.viewH)
                                                    e.preventDefault();
                                            }
                                            // home or end
                                            // end plus 100, easy to trigger breakout
                                            if (k in {
                                                    36: 1,
                                                    35: 1
                                                }) {
                                                return {
                                                    x: 0,
                                                    y: k == 36 ? 0 : obj.draggerparHeight - obj.draggerHeight + 100
                                                }    // pageup or pagedown
                                                     // a frame
;
                                            } else {
                                                // frame 计算方式更新为百分比
                                                var frame = (obj.draggerparHeight - obj.draggerHeight) * obj.viewH / (obj.scrollerH - obj.viewH);
                                                return vmodel._clickComputer(obj, diretion, strToNumber(frame) || 1);
                                            }
                                        });
                                    }
                                }
                            }
                            // document.body直接如此处理
                            if (vmodel.widgetElement == document.body) {
                                vmodel.inFocuse = true;
                                wheelArr.push(myOnWheel);
                                keyArr.push(myKeyDown);
                            } else {
                                avalon.bind(element, 'mouseenter', function (e) {
                                    vmodel.inFocuse = true;
                                    wheelArr.push(myOnWheel);
                                    keyArr.push(myKeyDown);
                                });
                                avalon.bind(element, 'mouseleave', function (e) {
                                    vmodel.inFocuse = false;
                                    for (var i = 0, len = wheelArr.length; i < len; i++) {
                                        if (wheelArr[i] === myOnWheel) {
                                            wheelArr.splice(i, 1);
                                            keyArr.splice(i, 1);
                                            break;
                                        }
                                    }
                                });
                            }
                            // 所有组件实例公用一个事件绑定
                            if (!wheelBinded) {
                                wheelBinded = true;
                                avalon.bind(document, 'mousewheel', function (e) {
                                    var cb = wheelArr[wheelArr.length - 1];
                                    cb && cb(e);
                                });
                                // keyborad,,,simida
                                // left 37
                                // right 39
                                // top 38
                                // down 40
                                // pageup 33
                                // pagedown 34
                                // home 36
                                // end 35
                                avalon.bind(document, 'keydown', function (e) {
                                    var cb = keyArr[keyArr.length - 1];
                                    cb && cb(e);
                                });
                            }
                        }
                        avalon.bind(element, 'mouseenter', function () {
                            avalon.each(bars, function (i, item) {
                                vmodel._show('e', false, item);
                            });
                        });
                        avalon.bind(element, 'mouseleave', function () {
                            vmodel._hide();
                        });
                        vmodel.update('init');
                    };
                    // data-draggable-before-start="beforeStartFn" 
                    // data-draggable-start="startFn" 
                    // data-draggable-drag="dragFn" 
                    // data-draggable-before-stop="beforeStopFn" 
                    // data-draggable-stop="stopFn" 
                    // data-draggable-containment="parent" 
                    vm.$draggableOpts = {
                        beforeStart: function () {
                            vmodel.dragging = true;
                        },
                        drag: function (e, data) {
                            var dr = avalon(data.element);
                            vmodel._computer(function (obj) {
                                var a = {
                                        x: strToNumber(dr.css('left')) >> 0,
                                        y: strToNumber(dr.css('top')) >> 0
                                    };
                                // easy to break out
                                if (a.x == obj.draggerparWidth - obj.draggerWidth)
                                    a.x += 100;
                                if (a.y == obj.draggerparHeight - obj.draggerHeight)
                                    a.y += 100;
                                return a;
                            }, dr.attr('oni-scrollbar-index'), dr.attr('oni-scrollbar-pos'));
                        },
                        handle: function (e, data) {
                            return !vmodel.disabled && this;
                        },
                        containment: 'parent'
                    };
                    vm.$draggableOpts.stop = function (e, data) {
                        vmodel.$draggableOpts.drag(e, data);
                        vmodel.dragging = false;
                        avalon(data.element).removeClass('oni-state-active');
                    };
                    vm.$remove = function () {
                        avalon.each(bars, function (i, bar) {
                            bar[0] && bar[0].parentNode && bar[0].parentNode.removeChild(bar[0]);
                        });
                    };
                    vm._onScroll = function () {
                        if (vmodel.show != 'scrolling')
                            return;
                        avalon.each(bars, function (i, item) {
                            vmodel._show('e', false, item);
                        });
                    };
                    vm._show = function (e, always, index) {
                        if (vmodel.show != 'scrolling')
                            return;
                        e.stopPropagation && e.stopPropagation();
                        var item = index.css ? index : bars[index];
                        if (item) {
                            clearTimeout(item.data('oni-scrollbar-hidetimer'));
                            item.css('visibility', 'visible');
                            item.css('opacity', 1);
                            if (!always) {
                                item.data('oni-scrollbar-hidetimer', setTimeout(function () {
                                    item.css('opacity', 0);
                                }, 1000));
                            }
                        }
                    };
                    vm._hide = function (e, index) {
                        if (vmodel.show != 'scrolling')
                            return;
                        if (index && bars[index]) {
                            bars[index].css('opacity', 0);
                        } else {
                            avalon.each(bars, function (i, item) {
                                item.css('opacity', 0);
                            });
                        }
                    };
                    //@interface getBars()返回所有的滚动条元素，avalon元素对象
                    vm.getBars = function () {
                        return bars;
                    };
                    //@interface getScroller()返回scroller avalon对象
                    vm.getScroller = function () {
                        return scroller;
                    };
                    //@interface update()更新滚动条状态，windowresize，内容高度变化等情况下调用，不能带参数
                    vm.update = function (ifInit, x, y) {
                        if (vmodel.disabled)
                            return;
                        var ele = avalon(vmodel.viewElement),
                            // 滚动内容宽高
                            viewW, viewH,
                            // 计算滚动条可以占据的宽或者高
                            // barH = strToNumber(ele.css("height")),
                            barH = vmodel.widgetElement === document.body ? vmodel.viewElement.clientHeight : strToNumber(ele.css('height')), barW = strToNumber(ele.css('width')),
                            // 滚动视野区宽高，存在滚动视野区宽高和滚动宽高不一致的情况
                            h = vmodel.viewHeightGetter(ele), w = vmodel.viewWidthGetter(ele), p = vmodel.position, barDictionary, barMinus = {}, y = y == void 0 ? vmodel.scrollTop : y, x = x == void 0 ? vmodel.scrollLeft : x;
                        //document body情形需要做一下修正
                        if (vmodel.viewElement != vmodel.widgetElement) {
                            p.match(/right|left/g) && avalon(vmodel.widgetElement).css('height', barH);
                        }
                        // 水平方向内间距
                        var hPadding = scroller.width() - scroller.innerWidth(),
                            // 竖直方向内间距
                            vPadding = scroller.height() - scroller.innerHeight();
                        scroller.css('height', h + vPadding);
                        scroller.css('width', w + hPadding);
                        viewW = scroller[0].scrollWidth;
                        viewH = scroller[0].scrollHeight;
                        barDictionary = {
                            'top': p.match(/top/g) && viewW > w,
                            'right': p.match(/right/g) && viewH > h,
                            'bottom': p.match(/bottom/g) && viewW > w,
                            'left': p.match(/left/g) && viewH > h
                        };
                        if (bars.length > 1) {
                            var ps = [
                                    'top',
                                    'right',
                                    'bottom',
                                    'left'
                                ];
                            for (var i = 0; i < 4; i++) {
                                barMinus[ps[i]] = [
                                    (barDictionary[i ? ps[i - 1] : ps[3]] && 1) >> 0,
                                    (barDictionary[i < 3 ? ps[i + 1] : ps[0]] && 1) >> 0
                                ];
                                if (i > 1)
                                    barMinus[ps[i]] = barMinus[ps[i]].reverse();
                            }
                        }
                        // 根据实际视窗计算，计算更新scroller的宽高
                        // 更新视窗
                        h = scroller.innerHeight();
                        w = scroller.innerWidth();
                        avalon.each(vmodel._position, function (i, item) {
                            var bar = bars[i], isVertical = item.match(/left|right/), dragger;
                            if (bar) {
                                dragger = avalon(getByClassName('oni-scrollbar-dragger', bar.element)[0]);
                            }
                            // 拖动逻辑前移，确保一定是初始化了的
                            if (ifInit && dragger) {
                                dragger.attr('ms-draggable', '$,$draggableOpts');
                                dragger.attr('oni-scrollbar-pos', item);
                                dragger.attr('oni-scrollbar-index', i);
                                avalon.scan(dragger[0], vmodel);
                            }
                            // hidden bar
                            if (!barDictionary[item]) {
                                if (bar) {
                                    bar.css('opacity', 0);
                                    bar.css('visibility', 'hidden');
                                    bar.data('oni-scrollbar-needed', false);
                                }
                                return;
                            } else {
                                if (bar) {
                                    bar.data('oni-scrollbar-needed', true);
                                    bar.css('visibility', 'visible');
                                    if (vmodel.show == 'scrolling' || vmodel.show == 'never') {
                                        bar.css('opacity', 0);
                                    } else {
                                        bar.css('opacity', 1);
                                    }
                                }
                            }
                            if (bar) {
                                var sh = strToNumber(bar.css('height')), sw = strToNumber(bar.css('width')), bh = sh, bw = sw, draggerpar = avalon(getByClassName('oni-scrollbar-draggerpar', bar[0])[0]), headerLength = vmodel.showBarHeader ? 2 : 0;
                                // 更新滚动条没有两端的箭头的时候依旧要重新计算相邻两个bar的间隔
                                var draggerParCss = [];
                                if (bars.length > 1) {
                                    var barCss = [], minus = barMinus[item];
                                    if (isVertical) {
                                        barCss = [
                                            [
                                                'top',
                                                minus[0] * bw
                                            ],
                                            [
                                                'height',
                                                barH - bw * (minus[0] + minus[1])
                                            ]
                                        ];
                                        draggerParCss = [
                                            [
                                                'top',
                                                headerLength / 2 * bw
                                            ],
                                            [
                                                'height',
                                                barH - bw * (minus[0] + minus[1] + headerLength)
                                            ]
                                        ];
                                    } else {
                                        barCss = [
                                            [
                                                'left',
                                                minus[0] * bh
                                            ],
                                            [
                                                'width',
                                                barW - bh * (minus[0] + minus[1])
                                            ]
                                        ];
                                        draggerParCss = [
                                            [
                                                'left',
                                                headerLength / 2 * bh
                                            ],
                                            [
                                                'width',
                                                barW - bh * (headerLength + minus[0] + minus[1])
                                            ]
                                        ];
                                    }
                                    avalon.each(barCss, function (index, css) {
                                        bar.css.apply(bar, css);
                                    });
                                    bh = bar.height();
                                    bw = bar.width();
                                } else {
                                    if (isVertical) {
                                        draggerParCss = [
                                            [
                                                'top',
                                                bw
                                            ],
                                            [
                                                'height',
                                                barH - bw * 2
                                            ]
                                        ];
                                    } else {
                                        draggerParCss = [
                                            [
                                                'left',
                                                bh
                                            ],
                                            [
                                                'width',
                                                barW - bh * 2
                                            ]
                                        ];
                                    }
                                }
                                var ex;
                                if (isVertical) {
                                    ex = vmodel.show == 'always' ? bw : 0;
                                    scroller.css('width', w + hPadding - ex);
                                } else {
                                    ex = vmodel.show == 'always' ? bh : 0;
                                    scroller.css('height', h + vPadding - ex);
                                }
                                avalon.each(draggerParCss, function (index, css) {
                                    draggerpar.css.apply(draggerpar, css);
                                });
                                sh = bh - headerLength * bw;
                                sw = bw - headerLength * bh;
                                // 更新滚动头
                                var draggerCss;
                                if (isVertical) {
                                    var draggerTop = y, draggerHeight = strToNumber(h * sh / viewH);
                                    // 限定一个dragger的最小高度
                                    draggerHeight = vmodel.limitRateV * bw > draggerHeight && vmodel.limitRateV * bw || draggerHeight;
                                    draggerTop = draggerTop < 0 ? 0 : draggerTop;
                                    draggerTop = draggerTop > viewH - h ? viewH - h : draggerTop;
                                    //draggerTop = sh * draggerTop / viewH
                                    draggerTop = strToNumber((sh - draggerHeight) * draggerTop / (viewH - h));
                                    draggerTop = Math.min(sh - draggerHeight, draggerTop);
                                    draggerCss = [
                                        [
                                            'width',
                                            '100%'
                                        ],
                                        [
                                            'height',
                                            draggerHeight
                                        ],
                                        [
                                            'top',
                                            draggerTop
                                        ]
                                    ];
                                    y = y > 0 ? y > viewH - h + ex ? viewH - h + ex : y : 0;
                                } else {
                                    var draggerLeft = x, draggerWidth = strToNumber(w * sw / viewW);
                                    // limit width to limitRateH * bh
                                    draggerWidth = vmodel.limitRateH * bh > draggerWidth && vmodel.limitRateH * bh || draggerWidth;
                                    draggerLeft = draggerLeft < 0 ? 0 : draggerLeft;
                                    draggerLeft = draggerLeft > viewW - w ? viewW - w : draggerLeft;
                                    // draggerLeft = sw * draggerLeft / viewW
                                    draggerLeft = strToNumber((sw - draggerWidth) * draggerLeft / (viewW - w));
                                    draggerLeft = Math.min(sw - draggerWidth, draggerLeft);
                                    draggerCss = [
                                        [
                                            'height',
                                            '100%'
                                        ],
                                        [
                                            'width',
                                            draggerWidth
                                        ],
                                        [
                                            'left',
                                            draggerLeft
                                        ]
                                    ];
                                    x = x > 0 ? x > viewW - w + ex ? viewW - w + ex : x : 0;
                                }
                                avalon.each(draggerCss, function (index, css) {
                                    dragger.css.apply(dragger, css);
                                });
                                if (ifInit) {
                                    if (isVertical) {
                                        vmodel._scrollTo(void 0, y);
                                    } else {
                                        vmodel._scrollTo(x, void 0);
                                    }
                                }
                                if (vmodel.showBarHeader) {
                                    if (y == 0 && isVertical || !isVertical && x == 0) {
                                        avalon(getByClassName('oni-scrollbar-arrow-up', bar[0])[0]).addClass('oni-state-disabled');
                                    } else {
                                        avalon(getByClassName('oni-scrollbar-arrow-up', bar[0])[0]).removeClass('oni-state-disabled');
                                    }
                                    if (y >= draggerpar.innerHeight() - dragger.innerHeight() && isVertical || !isVertical && x >= draggerpar.innerWidth() - dragger.innerWidth()) {
                                        !vmodel.breakOutCallback && avalon(getByClassName('oni-scrollbar-arrow-down', bar[0])[0]).addClass('oni-state-disabled');
                                    } else {
                                        avalon(getByClassName('oni-scrollbar-arrow-down', bar[0])[0]).removeClass('oni-state-disabled');
                                    }
                                }
                            }
                        });
                    };
                    // 点击箭头
                    vm._arrClick = function (e, diretion, position, barIndex) {
                        if (vmodel.disabled)
                            return;
                        vmodel._computer(function (obj) {
                            return vmodel._clickComputer(obj, diretion);
                        }, barIndex, position);
                    };
                    vm._clickComputer = function (obj, diretion, step) {
                        var step = step || obj.step || 40, l = strToNumber(obj.dragger.css('left')) >> 0, r = strToNumber(obj.dragger.css('top')) >> 0, x = diretion == 'down' ? l + step : l - step, y = diretion == 'down' ? r + step : r - step;
                        return {
                            x: x,
                            y: y
                        };
                    };
                    // 长按
                    vm._arrDown = function ($event, diretion, position, barIndex, ismouseup) {
                        if (vmodel.disabled)
                            return;
                        var se = this, ele = avalon(se);
                        clearInterval(ele.data('mousedownTimer'));
                        clearTimeout(ele.data('setTimer'));
                        var bar = bars[barIndex];
                        if (ismouseup || ele.hasClass('oni-state-disabled')) {
                            return ele.removeClass('oni-state-active');
                        }
                        // 延时开启循环
                        ele.data('setTimer', setTimeout(function () {
                            ele.addClass('oni-state-active');
                            ele.data('mousedownTimer', setInterval(function () {
                                return vmodel._computer(function (obj) {
                                    return vmodel._clickComputer(obj, diretion);
                                }, barIndex, position, function (breakOut) {
                                    if (!breakOut)
                                        return;
                                    clearInterval(ele.data('mousedownTimer'));
                                    clearTimeout(ele.data('setTimer'));
                                });
                            }, 120));
                        }, 10));
                    };
                    // 点击滚动条
                    vm._barClick = function (e, position, barIndex) {
                        if (vmodel.disabled)
                            return;
                        var ele = avalon(this);
                        if (ele.hasClass('oni-scrollbar-dragger'))
                            return;
                        vmodel._computer(function (obj) {
                            return {
                                x: Math.ceil(e.pageX - obj.offset.left - obj.draggerWidth / 2),
                                y: Math.ceil(e.pageY - obj.offset.top - obj.draggerHeight / 2)
                            };
                        }, barIndex, position);
                    };
                    // 计算滚动条位置
                    vm._computer = function (axisComputer, barIndex, position, callback, breakOutCallbackCannotIgnore) {
                        if (vmodel.disabled)
                            return;
                        var bar = bars[barIndex];
                        if (bar && bar.data('oni-scrollbar-needed')) {
                            var obj = {}, isVertical = position.match(/left|right/g);
                            obj.dragger = avalon(getByClassName('oni-scrollbar-dragger', bar[0])[0]);
                            obj.draggerWidth = strToNumber(obj.dragger.css('width'));
                            obj.draggerHeight = strToNumber(obj.dragger.css('height'));
                            obj.draggerpar = avalon(obj.dragger[0].parentNode);
                            obj.draggerparWidth = strToNumber(obj.draggerpar.css('width'));
                            obj.draggerparHeight = strToNumber(obj.draggerpar.css('height'));
                            obj.offset = obj.draggerpar.offset();
                            obj.up = avalon(getByClassName('oni-scrollbar-arrow-up', bar[0])[0]);
                            obj.down = avalon(getByClassName('oni-scrollbar-arrow-down', bar[0])[0]);
                            obj.viewer = avalon(vmodel.viewElement);
                            // obj.viewH = vmodel.viewHeightGetter(obj.viewer)
                            // obj.viewW = vmodel.viewWidthGetter(obj.viewer)
                            // 更新的时候要用viewer先计算
                            // 计算的时候直接用scroller作为视窗计算宽高
                            // obj.viewH = vmodel.viewHeightGetter(scroller)
                            // obj.viewW = vmodel.viewWidthGetter(scroller)
                            obj.viewH = scroller.innerHeight();
                            obj.viewW = scroller.innerWidth();
                            obj.scrollerH = scroller[0].scrollHeight;
                            obj.scrollerW = scroller[0].scrollWidth;
                            obj.step = isVertical ? 40 * (obj.draggerparHeight - obj.draggerHeight) / (obj.scrollerH - obj.viewH) : 40 * (obj.draggerparWidth - obj.draggerWidth) / (obj.scrollerW - obj.viewW);
                            obj.step = strToNumber(obj.step) || 1;
                            var xy = axisComputer(obj), breakOut;
                            xy.x = strToNumber(xy.x);
                            xy.y = strToNumber(xy.y);
                            if (isVertical) {
                                if (xy.y < 0) {
                                    xy.y = 0;
                                    obj.up.addClass('oni-state-disabled');
                                    breakOut = [
                                        'v',
                                        'up'
                                    ];
                                } else {
                                    obj.up.removeClass('oni-state-disabled');
                                }
                                if (xy.y > obj.draggerparHeight - obj.draggerHeight) {
                                    xy.y = obj.draggerparHeight - obj.draggerHeight;
                                    breakOut = [
                                        'v',
                                        'down'
                                    ];
                                    obj.down.addClass('oni-state-disabled');
                                } else {
                                    obj.down.removeClass('oni-state-disabled');
                                }
                                var c = strToNumber((obj.scrollerH - obj.viewH) * xy.y / (obj.draggerparHeight - obj.draggerHeight)) - vmodel.scrollTop;
                                obj.dragger.css('top', xy.y);
                                vmodel._scrollTo(void 0, strToNumber((obj.scrollerH - obj.viewH) * xy.y / (obj.draggerparHeight - obj.draggerHeight)));
                            } else {
                                if (xy.x < 0) {
                                    xy.x = 0;
                                    breakOut = [
                                        'h',
                                        'up'
                                    ];
                                    obj.up.addClass('oni-state-disabled');
                                } else {
                                    obj.up.removeClass('oni-state-disabled');
                                }
                                if (xy.x > obj.draggerparWidth - obj.draggerWidth) {
                                    xy.x = obj.draggerparWidth - obj.draggerWidth;
                                    breakOut = [
                                        'h',
                                        'down'
                                    ];
                                    // 有溢出检测回调，不disable
                                    !vmodel.breakOutCallback && obj.down.addClass('oni-state-disabled');
                                } else {
                                    obj.down.removeClass('oni-state-disabled');
                                }
                                obj.dragger.css('left', xy.x);
                                vmodel._scrollTo(strToNumber((obj.scrollerW - obj.viewW) * xy.x / (obj.draggerparWidth - obj.draggerWidth)), void 0);
                            }
                        }
                        // 回调，溢出检测
                        (!vmodel.breakOutCallback || breakOutCallbackCannotIgnore) && callback && callback(breakOut);
                        vmodel.breakOutCallback && vmodel.breakOutCallback(breakOut, vmodel, obj);
                    };
                    vm._scrollTo = function (x, y) {
                        if (y != void 0) {
                            scroller[0].scrollTop = y;
                            vmodel.scrollTop = scroller[0].scrollTop;
                        }
                        if (x != void 0) {
                            scroller[0].scrollLeft = x;
                            vmodel.scrollLeft = scroller[0].scrollLeft;
                        }
                    };
                    //@interface scrollTo(x,y) 滚动至 x,y
                    vm.scrollTo = function (x, y) {
                        vmodel.update(!'ifInit', x, y);
                        vm._scrollTo(x, y);
                    };
                    vm._initWheel = function (e, type) {
                        if (type == 'enter') {
                            vmodel.inFocuse = true;
                        } else {
                            vmodel.inFocuse = false;
                        }
                    };
                    vm._draggerDown = function (e, isdown) {
                        if (vmodel.disabled)
                            return;
                        var ele = avalon(this);
                        if (isdown) {
                            ele.addClass('oni-state-active');
                        } else {
                            ele.removeClass('oni-state-active');
                        }
                    };
                    vm._stopPropagation = function (e) {
                        e.stopPropagation();
                    };
                });
            vmodel.$watch('scrollLeft', function (newValue, oldValue) {
                vmodel._onScroll();
                vmodel.onScroll && vmodel.onScroll(newValue, oldValue, 'h', vmodel);
            });
            vmodel.$watch('scrollTop', function (newValue, oldValue) {
                vmodel._onScroll();
                vmodel.onScroll && vmodel.onScroll(newValue, oldValue, 'v', vmodel);
            });
            return vmodel;
        };
    widget.defaults = {
        disabled: false,
        //@config 组件是否被禁用，默认为否
        toggle: true,
        //@config 组件是否显示，可以通过设置为false来隐藏组件
        position: 'right',
        //@config scrollbar出现的位置,right右侧，bottom下侧，可能同时出现多个方向滚动条
        limitRateV: 1.5,
        //@config 竖直方向，拖动头最小高度和拖动头宽度比率
        limitRateH: 1.5,
        //@config 水平方向，拖动头最小宽度和高度的比率
        scrollTop: 0,
        //@config 竖直方向滚动初始值，负数会被当成0，设置一个极大值等价于将拖动头置于bottom
        scrollLeft: 0,
        //@config 水平方向滚动初始值，负数会被当成0处理，极大值等价于拖动头置于right
        show: 'always',
        //@config never一直不可见，scrolling滚动和hover时候可见，always一直可见
        showBarHeader: true,
        //@config 是否显示滚动条两端的上下箭头
        draggerHTML: '',
        //@config 滚动条拖动头里，注入的html碎片
        breakOutCallback: false,
        //@config breakOutCallback(["h", "up"], vmodel) 滚动到极限位置的回调，用来实现无线下拉等效果 breakOutCallback(["h", "up"], vmodel) 第一个参数是一个数组，分别是滚动条方向【h水平，v竖直】和超出极限的方向【up是向上或者向左，down是向右或者向下】，第三个参数是一个对象，包含滚动条的元素，宽高等信息
        //@config onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
        onInit: avalon.noop,
        viewHeightGetter: function (viewElement) {
            return viewElement.innerHeight();
        },
        //@config viewHeightGetter(viewElement) 配置计算视窗高度计函数，默认返回innerHeight
        viewWidthGetter: function (viewElement) {
            return viewElement.innerWidth();
        },
        //@config viewWidthGetter(viewElement) 配置计算视窗宽度计函数，默认返回innerWidth
        getTemplate: function (tmpl, opts) {
            return tmpl;
        },
        //@config getTemplate(tpl, opts) 定制修改模板接口
        onScroll: function (newValue, oldValue, diretion, vmodel) {
        },
        //@config onScroll(newValue, oldValue, diretion, vmodel) 滚动回调,scrollLeft or scrollTop变化的时候触发，参数为newValue, oldValue, diretion, vmodel diretion = h 水平方向，= v 竖直方向
        size: 'normal',
        //@config srollbar size,normal为10px，small为8px，large为14px
        $author: 'skipper@123'
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "c3d66d673e82f1489bf416e19cae0c47" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "25008a5bba9e941c7201b29c84441a68" , 
        filename : "avalon.loading.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<div class=\"oni-helper-reset oni-helper-clearfix oni-widget\">\n     <div class=\"oni-helper-reset oni-helper-clearfix oni-widget oni-loading-modal\" \n          ms-class-100=\"oni-helper-max-index:toggle\" \n          ms-if=\"modal\" \n          ms-attr-id=\"'modal'+$loadingID\" \n          style=\"z-index:999;\" \n          ms-css-opacity=\"modalOpacity\" \n          ms-css-background-color=\"modalBackground\" \n          ms-visible=\"toggle\">\n          <iframe allowTransparency=\"true\" frameborder=\"none\" src=\"javascript:''\"></iframe>\n          </div>\n     <div class=\"oni-helper-reset oni-helper-clearfix oni-widget oni-widget-content oni-loading\" \n          ms-class-100=\"oni-helper-max-index:toggle\" \n          ms-visible=\"toggle\" \n          ms-css-width=\"width\" \n          ms-css-height=\"height\" \n          ms-css-margin-left=\"-width/2+'px'\" \n          ms-css-margin-top=\"-height/2+'px'\" \n          ms-attr-id=\"'oni-loading-'+$loadingID\"><div \n          ms-css-width=\"width\" \n          ms-css-height=\"height\">{{MS_WIDGET_HTML}}</div></div>\n</div>",
ballTemplate = "{{MS_WIDGET_BALL}}\n<v:oval ms-repeat-item=\"data\" style=\"position:absolute;\" \n  ms-attr-strokecolor=\"color\" \n  ms-attr-fillcolor=\"color\" \n  ms-css-left=\"item.x + 'px'\" \n  ms-css-top=\"item.y + 'px'\" \n  ms-css-width=\"item.r * 2 + 'px'\" \n  ms-css-height=\"item.r * 2 + 'px'\">\n</v:oval>\n{{MS_WIDGET_DIVIDER}}\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%\" height=\"100%\">\n  <circle  \n          ms-attr-r=\"data[$index].r\" \n          ms-attr-cx=\"data[$index].x+data[$index].r\" \n          ms-attr-cy=\"data[$index].y+data[$index].r\" \n          ms-repeat=\"data\" \n          ms-attr-fill=\"color\">\n      <animate attributeName=\"opacity\" from=\"1\" to=\".1\" repeatCount=\"indefinite\" \n               ms-if=\"type=='ball'\" \n               ms-attr-dur=\"svgDur\" \n               ms-attr-begin=\"data[$index].begin\"/>\n      <animate attributeName=\"r\" repeatCount=\"indefinite\" keySplines=\"0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8\" calcMode=\"spline\" \n               ms-attr-values=\"'0;'+data[$index].r+';0;0'\"\n               ms-attr-dur=\"svgDur\" \n               ms-if=\"type=='spinning-bubbles'\" \n               ms-attr-begin=\"data[$index].begin\"/>\n      <animate attributeName=\"r\" repeatCount=\"indefinite\" keytimes=\"0;0.2;0.7;1\" keySplines=\"0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8\" calcMode=\"spline\" \n        ms-if=\"type=='bubbles'\"\n        ms-attr-begin=\"data[$index].begin\"  \n        ms-attr-dur=\"svgDur\" \n        ms-attr-values=\"'0;'+data[$index].r+';0;0'\" />\n  </circle>\n</svg>\n{{MS_WIDGET_TYPE}}\n{{MS_WIDGET_SPIN}}\n<v:oval stroked=\"true\" filled=\"F\" \n        ms-attr-strokecolor=\"color\" \n        ms-css-height=\"width+'px'\" \n        ms-css-width=\"width+'px'\" \n        ms-css-opacity=\"opacity\" \n        ms-attr-strokeweight=\"width / 2 - widthInner / 2+'px'\" \n        ms-repeat=\"data\" \n  style=\"position:absolute;z-index:2;left:0;top:0;\"></v:oval>\n<v:arc stroked=\"true\" filled=\"F\" \n    ms-attr-strokecolor=\"color\" \n    ms-attr-strokeweight=\"width / 2 - widthInner / 2+'px'\" \n    style=\"position:absolute;z-index:3;text-indent:-1000px;overflow:hidden;left:0;top:0;\" \n    ms-attr-startangle=\"startangle\" \n    ms-attr-endangle=\"endangle\" \n    ms-css-height=\"width+'px'\" \n    ms-css-width=\"width+'px'\" \n    ms-repeat=\"data\">\n  </v:arc>\n{{MS_WIDGET_DIVIDER}}\n<svg width=\"100%\" height=\"100%\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path \n    ms-attr-d=\"arc\" \n    ms-attr-stroke=\"color\" \n    ms-attr-stroke-width=\"radius\" \n    ms-attr-transform=\"'rotate(0 ' + spinPoint +')'\"\n    stroke-linejoin=\"round\" fill=\"none\">\n      <animateTransform attributeName=\"transform\" repeatCount=\"indefinite\" attributeType=\"XML\" type=\"rotate\" begin=\"0s\" \n        ms-attr-from=\"0 + ' ' + spinPoint\" \n        ms-attr-to=\"360 + ' ' + spinPoint\" \n        ms-attr-dur=\"svgDur\" />\n    </path>\n  <path stroke-linejoin=\"round\" \n    ms-attr-d=\"circle\" \n    ms-attr-stroke-width=\"radius\" \n    ms-attr-stroke=\"color\" \n    ms-css-opacity=\"opacity\" \n    fill=\"none\"></path>\n  </svg>\n{{MS_WIDGET_TYPE}}\n{{MS_WIDGET_SPINNING_SPIN}}\n<v:arc stroked=\"true\" filled=\"F\" \n    ms-attr-strokecolor=\"color\" \n    ms-attr-strokeweight=\"radius+'px'\" \n    style=\"position:absolute;z-index:3;text-indent:-1000px;overflow:hidden;left:0;top:0;\" \n    ms-attr-startangle=\"item.startangle\" \n    ms-attr-endangle=\"item.endangle\" \n    ms-css-opacity=\"opacities[$index]\" \n    ms-css-height=\"width+'px'\" \n    ms-css-width=\"width+'px'\" \n    ms-repeat-item=\"data\">\n  </v:arc>\n{{MS_WIDGET_DIVIDER}}\n<svg width=\"100%\" height=\"100%\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path \n    ms-attr-d=\"arc\" \n    ms-attr-stroke=\"color\" \n    ms-attr-stroke-width=\"radius\" \n    ms-attr-transform=\"item.rotate\" \n    ms-repeat-item=\"data\" \n    ms-css-opacity=\"opacities[$index]\" \n    stroke-linejoin=\"round\" fill=\"none\">\n      <animate ms-if=\"0\" attributeName=\"opacity\" from=\"1\" to=\".2\" repeatCount=\"indefinite\" \n               ms-attr-dur=\"svgDur\" \n               ms-attr-begin=\"item.begin\"/>\n    </path>\n  </svg>\n{{MS_WIDGET_TYPE}}\n{{MS_WIDGET_SPOKES}}\n<v:rect style=\"position:absolute;\"  \n        ms-attr-fillcolor=\"color\" \n        ms-attr-strokecolor=\"color\"  \n        ms-css-left=\"item.spokesLeft+'px'\" \n        ms-css-top=\"item.spokesTop+'px'\"\n        ms-css-width=\"spokesWidth+'px'\" \n        ms-css-height=\"spokesHeight+'px'\" \n        ms-css-rotation=\"item.spokesRotation\" \n        ms-repeat-item=\"data\">\n        <v:fill \n                ms-attr-color=\"color\"></v:fill>\n  </v:rect>\n{{MS_WIDGET_DIVIDER}}\n<svg width=\"100%\" height=\"100%\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path opacity=\".1\" ms-attr-d=\"svgPath\" \n      ms-attr-transform=\"data[$index].rotate\" \n        ms-repeat=\"data\" \n    ms-attr-fill=\"color\">\n    <animate attributeName=\"opacity\" from=\"1\" to=\".1\" repeatCount=\"indefinite\" \n             ms-attr-dur=\"svgDur\" \n             ms-attr-begin=\"data[$index].begin\"/></path>\n  </svg>\n{{MS_WIDGET_TYPE}}\n{{MS_WIDGET_IMG}}\n<img width=\"100%\" height=\"100%\" ms-attr-src=\"src\">";

module.exports = (
function () {
    var widgetCount = 0, isIE = navigator.userAgent.match(/msie/gi) || 'ActiveXObject' in window, _key = 99999 - Math.random() * 10000 >> 0, templateCache = {}, parts = ballTemplate.split('{{MS_WIDGET_TYPE}}'), _config = {};
    // 通过addtype注册新的效果
    // config里面是每个type特有的配置或者方法，mix到vm里
    // drawser方法在注入html之前执行，主要用于生成绘图需要的数据
    // effect方法用于setinterval动画效果
    function addType(type, config, drawer, effect) {
        config['drawer'] = drawer;
        config['effect'] = effect;
        _config[type] = config;
    }
    function g(id) {
        return document.getElementById(id);
    }
    avalon.each(parts, function (i, item) {
        var type, item = item.trim().replace(/^\{\{MS_WIDGET_[^\}]+\}\}/g, function (mat) {
                type = mat.replace(/\{\{MS_WIDGET_|\}\}/g, '').replace(/_/g, '-').toLowerCase();
                return '';
            });
        if (type) {
            type = type;
            item = item.split('{{MS_WIDGET_DIVIDER}}');
            templateCache[type] = {
                'svg': item[1] || item[0],
                'vml': item[0]
            };
        }
    });
    // svg绘制圆弧
    function circleValueList(r, bw, ct) {
        var arr = [], count = ct || 36, r = r - bw, arc, x, y, res;
        for (var i = 0; i <= count; i++) {
            arc = Math.PI / 2 - Math.PI * 2 / count * i;
            x = Math.cos(arc) * r + r * 1 + bw * 1;
            y = (1 - Math.sin(arc).toFixed(4)) * r + bw * 1;
            res = (i ? ' L' : 'M') + x + ' ' + y + (i == 100 ? 'Z' : '');
            arr.push(res);
        }
        return arr;
    }
    // 注册ball，小球排列成一个圆
    addType('ball', {
        'width': 32,
        'widthInner': 28,
        count: 10,
        //@config type=ball，loading效果组成的小图形个数
        interval: 120,
        //@config type=ball，毫秒数，动画效果帧间隔
        circleMargin: 1,
        //@config type=ticks，小球之间的间距，单位是一倍小球半径
        'svgDur': '1s'
    }, function (vmodel) {
        var type = vmodel.type, count = vmodel.count, width = vmodel.width, radiusOut = width / 2, interval = vmodel.interval, radiusInner = (width - vmodel.widthInner) / 2;
        if (type === 'ball')
            vmodel.svgDur = interval * count / 1000 + 's';
        return function (loop) {
            var angel = Math.PI * (0.5 - 2 * loop / count);
            vmodel.data.push({
                'x': (radiusOut - radiusInner) * (Math.cos(angel) + 1),
                'y': (radiusInner - radiusOut) * (Math.sin(angel) - 1),
                'r': radiusInner,
                'begin': [
                    interval * loop / 1000,
                    's'
                ].join('')
            });
            vmodel.opacities.push((loop / count).toFixed(2));
        };
    }, function (vmodel, ele, tagList, callback) {
        // only for ie
        if (!isIE && vmodel.type !== 'ticks' && vmodel.type != 'spinning-spin')
            return;
        var tagList = Array.isArray(tagList) ? tagList : [
                'circle',
                'oval'
            ], tag = vmodel.svgSupport ? tagList[0] : tagList[1], ele = ele.getElementsByTagName(tag), len = ele.length, index = len, eles = [], flag;
        avalon.each(ele, function (i, item) {
            eles.push(avalon(item));
            // fix ie 7-8 render bug...
            if (i === len - 1 && !vmodel.svgSupport) {
                item.style.display = 'none';
                item.style.display = 'block';
            }
        });
        if (vmodel.type === 'ticks') {
            index = 0;
            return function () {
                for (var i = 0; i < len; i++) {
                    var op = i > index ? vmodel.opacities[1] : vmodel.opacities[0];
                    if (eles[i]) {
                        eles[i].css('visibility', op >= 1 ? 'visible' : 'hidden');
                    }
                }
                index++;
                if (index >= len) {
                    index = -1;
                }
            };
        }
        // share for type=ball and type=spokes
        return function () {
            // 顺时针
            index--;
            if (index < 0) {
                index = len - 1;
            }
            for (var i = 0; i < len; i++) {
                if (callback) {
                    callback(eles[i], i, index);
                } else {
                    var op = vmodel.opacities[(i + index) % len] * 100 / 100;
                    eles[i] && eles[i].css('opacity', op);
                }
            }
        };
    });
    // 注册ticks，小球排列成一行
    addType('ticks', avalon.mix({}, _config['ball'], {
        count: 3,
        //@config type=ticks，小球个数
        height: 20,
        //@config type=ticks，高度
        interval: 360    //@config type=ticks，毫秒数，动画效果帧间隔
    }), function (vmodel) {
        var count = vmodel.count, rate = 2 + vmodel.circleMargin, radiusInner = (vmodel.width - vmodel.widthInner) / 2, marginLeft = (vmodel.width - radiusInner * (3 * count - 1)) / 2;
        return function (loop) {
            vmodel.data.push({
                'x': marginLeft + loop * rate * radiusInner,
                'y': vmodel.height / 2 - radiusInner,
                'r': radiusInner,
                'begin': [
                    vmodel.interval * loop / 1000,
                    's'
                ].join('')
            });
            vmodel.opacities.push(loop ? 0 : 1);
        };
    }, _config['ball'].effect);
    templateCache['ticks'] = templateCache['ball'];
    // 注册spin，圆环转圈
    addType('spin', {
        width: 32,
        widthInner: 26,
        angel: 90,
        //@config type=spin，转动的弧形的角度，单位是1度
        arc: '',
        circle: '',
        radius: '',
        opacity: 0.2,
        //@config type=spin，背景圆弧的透明度
        startangle: 0,
        //@config type=spin，圆弧开始的角度，单位1度
        endangle: 0,
        interval: 36,
        //@config type=spin，毫秒数，动画效果帧间隔
        $circleData: '',
        $partsData: '',
        spinPoint: '23 23',
        svgDur: '1s',
        data: [1]
    }, function (vmodel) {
        vmodel.radius = vmodel.width / 2 - vmodel.widthInner / 2;
        if (vmodel.svgSupport) {
            vmodel.svgDur = vmodel.interval * 36 / 1000 + 's';
            vmodel.spinPoint = [
                vmodel.width / 2,
                vmodel.width / 2
            ].join(' ');
            var circle = vmodel.$circleData = circleValueList(vmodel.width / 2, vmodel.width / 2 - vmodel.widthInner / 2), parts = vmodel.$partsData = circle.slice(0, Math.floor(vmodel.angel / 360 * (circle.length - 1)));
            vmodel.arc = parts.join('');
            vmodel.circle = circle.join('');
        } else {
            vmodel.startangle = 0;
            vmodel.endangle = vmodel.angel;
        }
    }, function (vmodel, ele) {
        // only for ie
        if (!isIE)
            return;
        var angel = stepper = vmodel.angel;
        if (vmodel.svgSupport) {
            var len = vmodel.$circleData.length, ele = avalon(ele.getElementsByTagName('path')[0]);
            angel = stepper = Math.floor(vmodel.angel / 360 * len);
            return function () {
                // 生成圆弧的点阵是36个点，因此步长用1就足够了
                stepper += 1;
                if (stepper >= len)
                    stepper = 0;
                // 改用rotate属性
                ele.attr('transform', 'rotate(' + stepper * 10 + ' ' + vmodel.spinPoint + ')');
            };
        }
        return function () {
            stepper += 10;
            var startangle = stepper - angel;
            if (stepper > 360) {
                stepper = stepper - 360;
                startangle = startangle - 360;
            }
            vmodel.startangle = startangle;
            vmodel.endangle = stepper;
        };
    });
    // 注册小长方形圆形排列效果
    addType('spokes', {
        count: 8,
        //@config type=spokes，长方形个数
        width: 32,
        //@config type=spokes，效果宽度,
        spokesWidth: 4,
        //@config type=spokes，小长方形宽度
        spokesHeight: 8,
        //@config type=spokes，小长方形高度
        interval: 125,
        //@config type=spokes，效果动画间隔毫秒数
        svgPath: 'M14 0 H18 V8 H14 z',
        svgDur: '1s'
    }, function (vmodel) {
        var count = vmodel.count, w = vmodel.width, sw = vmodel.spokesWidth, sh = vmodel.spokesHeight, index = 0, interval = vmodel.interval;
        if (vmodel.svgSupport) {
            vmodel.svgPath = [
                'M',
                (w - sw) / 2,
                ' 0 H',
                (w + sw) / 2,
                ' V',
                sh,
                ' H',
                (w - sw) / 2,
                ' z'
            ].join('');
            vmodel.svgDur = interval * count / 1000 + 's';
            var step = 360 / count;
            return function (loop) {
                vmodel.data.push({
                    'begin': [
                        interval * loop / 1000,
                        's'
                    ].join(''),
                    'rotate': [
                        'rotate(',
                        loop * step,
                        ' ',
                        [
                            w / 2,
                            w / 2
                        ].join(' ') + ')'
                    ].join('')
                });
                vmodel.opacities.push((loop / count).toFixed(2));
            };
        }
        var step = Math.PI * 2 / count, angel, halfSw = sw / 2;
        return function (loop) {
            angel = Math.PI / 2 - step * loop;
            var vsin = Math.sin(angel), vcos = Math.cos(angel), op = (loop / count).toFixed(2);
            vmodel.data.push({
                'spokesRotation': 360 * loop / count,
                'spokesOpacity': op * 50,
                'spokesLeft': (w / 2 - sw) * (1 + vcos),
                'spokesTop': (w / 2 - sw) * (1 - vsin)
            });
            vmodel.opacities.push(op);
        };
    }, function (vmodel, ele) {
        return _config['ball'].effect(vmodel, ele, [
            'path',
            'rect'
        ]);
    });
    // 注册小球排列成一个圆，半径变化
    addType('spinning-bubbles', avalon.mix({}, _config['ball'], {
        width: 64,
        //@config type=spinning-bubbles 宽度，小球的个数继承自type=ball
        widthInner: 54,
        //@config type=spinning-bubbles 内宽
        $zooms: []
    }), function (vmodel) {
        var drawer = _config['ball'].drawer(vmodel), count = vmodel.count;
        if (count >= 7) {
            vmodel.$zooms = [
                0.2,
                0.4,
                0.8,
                1,
                0.8,
                0.4,
                0.2
            ];
        } else if (count >= 5) {
            vmodel.$zooms = [
                0.2,
                0.8,
                1,
                0.8,
                0.2
            ];
        } else {
            vmodel.$zooms = [
                1,
                0.1,
                0.1,
                0.1
            ];
        }
        while (vmodel.$zooms.length < vmodel.count) {
            vmodel.$zooms.push(0.1);
        }
        return function (loop) {
            drawer(loop);
        };
    }, function (vmodel, ele) {
        var r = (vmodel.width - vmodel.widthInner) / 2, count = vmodel.count;
        if (vmodel.svgSupport)
            return _config['ball'].effect(vmodel, ele, [
                'circle',
                'oval'
            ], function (ele, loop, step) {
                ele.attr('r', r * vmodel.$zooms[(loop + step) % count]);
            });
        return _config['ball'].effect(vmodel, ele, [
            'circle',
            'oval'
        ], function (ele, loop, step) {
            ele.css('zoom', vmodel.$zooms[(loop + step) % vmodel.count]);
        });
    });
    // 注册bubbles, 高级浏览器
    addType('bubbles', avalon.mix({}, _config['spinning-bubbles'], {
        height: 30,
        //@config type=bubbles 高度，宽度继承type=spinning-bubbles
        widthInner: 50,
        //@config type=bubbles 内宽
        count: 3,
        //@config type=bubbles 球的个数
        interval: 360,
        //@config type=bubbles 动画ms数
        'circleMargin': 0.5    //@config type=bubbles bubbles效果下个小球的间距
    }), function (vmodel) {
        _config['spinning-bubbles'].drawer(vmodel);
        return _config['ticks'].drawer(vmodel);
    }, _config['spinning-bubbles'].effect);
    // 注册spinning-spin
    addType('spinning-spin', avalon.mix({}, _config['spin'], {
        opacities: [],
        data: [],
        radius: 1,
        interval: _config['ball'].interval,
        //@config type=spinning-spin 帧间隔，继承ball
        count: 8,
        //@config type=spinning-spin 小圆弧个数，一般请保证 360 / 8 % padding = 0
        width: 46,
        //@config type=spinning-spin 圆外直径
        widthInner: 38,
        //@config type=spinning-spin 圆内直径
        padding: 5    //@config type=spinning-spin 小圆弧间间隔的角度数
    }), function (vmodel) {
        var ct = 360 / vmodel.padding * 3, r = vmodel.width / 2, dt = circleValueList(r, r - vmodel.widthInner / 2, ct), count = vmodel.count, interval = vmodel.interval, step = 360 / count;
        vmodel.radius = vmodel.width / 2 - vmodel.widthInner / 2;
        function writeOp(loop) {
            var cp = (loop / count).toFixed(2);
            cp = cp > 0.6 ? cp : 0.2;
            vmodel.opacities.push(cp);
        }
        if (vmodel.svgSupport) {
            vmodel.svgDur = interval * count / 1000 + 's';
            vmodel.arc = dt.slice(0, Math.floor((1 / count - vmodel.padding / 360) * dt.length)).join('');
            return function (loop) {
                vmodel.data.push({
                    rotate: 'rotate(' + step * loop + ' ' + r + ' ' + r + ')',
                    begin: [
                        interval * loop / 1000,
                        's'
                    ].join('')
                });
                writeOp(loop);
            };
        }
        return function (loop) {
            vmodel.data.push({
                startangle: loop / count * 360,
                endangle: (loop + 1) / count * 360 - 10
            });
            writeOp(loop);
        };
    }, function (vmodel, ele) {
        return _config['ball'].effect(vmodel, ele, [
            'path',
            'arc'
        ]);
    });
    // 注册自定义图片
    addType('img', {
        src: 'https://source.qunarzz.com/piao/images/loading_camel.gif',
        //@config type=img，loading效果的gif图片
        width: 52,
        //@config type=img，loading效果宽度
        height: 39,
        //@config type=img，loading效果高度
        miao: 0
    }, void 0, void 0);
    var svgSupport = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
    var widget = avalon.ui.loading = function (element, data, vmodels) {
            var options = data.loadingOptions;
            //方便用户对原始模板进行修改,提高定制性
            options.template = options.getTemplate(template, options);
            if (!_config[options.type]) {
                options.type = 'ball';
            }
            // 读入各种效果的配置
            avalon.each(_config[options.type], function (i, item) {
                if (options[i] === void 0)
                    options[i] = item;
            });
            var vmodel = avalon.define(data.loadingId, function (vm) {
                    vm.height = '';
                    vm.width = '';
                    vm.data = [];
                    vm.opacities = [];
                    avalon.mix(vm, options);
                    vm.widgetElement = element;
                    vm.rootElement = '';
                    vm.svgSupport = svgSupport;
                    vm.$loadingID = widgetCount + '' + _key;
                    vm.$timer = '';
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        'opacities',
                        'data',
                        'rootElement'
                    ];
                    var inited;
                    vm.$init = function (continueScan) {
                        if (inited)
                            return;
                        inited = true;
                        var id, container = options.container || vmodel.widgetElement, elementParent = (avalon.type(container) === 'object' && container.nodeType === 1 && document.body.contains(container) ? container : document.getElementById(container)) || document.body, type = vmodel.type,
                            // radiusOut = vmodel.width / 2,
                            html = (templateCache[type] || templateCache['ball'])[vmodel.svgSupport ? 'svg' : 'vml'], index = 0;
                        vmodel.width = vmodel.width == false ? vmodel.height : vmodel.width;
                        vmodel.height = vmodel.height == false ? vmodel.width : vmodel.height;
                        // 计算绘图数据
                        if (vmodel.drawer) {
                            var loop = 0, drawer = vmodel.drawer(vmodel);
                            while (loop < vmodel.count && drawer) {
                                drawer(loop);
                                loop++;
                            }
                        }
                        var frag = avalon.parseHTML(vmodel.template.replace('{{MS_WIDGET_HTML}}', html).replace('{{MS_WIDGET_ID}}', vmodel.$loadingID));
                        newDiv = frag.childNodes[0];
                        elementParent.appendChild(newDiv);
                        vm.rootElement = newDiv;
                        avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                        avalon.scan(elementParent, [vmodel].concat(vmodels));
                        if (typeof options.onInit === 'function') {
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                        vmodel._effect();
                    };
                    vm._effect = function () {
                        if (vmodel.toggle) {
                            var ele = document.getElementById('oni-loading-' + vmodel.$loadingID);
                            if (ele) {
                                var effect = vmodel.effect && vmodel.effect(vmodel, ele);
                                if (effect) {
                                    clearInterval(vmodel.$timer);
                                    vmodel.$timer = setInterval(effect, vmodel.interval);
                                }
                            }
                        }
                    };
                    vm.$remove = function () {
                        clearInterval(vmodel.$timer);
                        element.innerHTML = element.textContent = '';
                    };
                    //@interface showLoading() 显示loading效果
                    vm.showLoading = function () {
                        if (vmodel.toggle)
                            return;
                        vmodel.toggle = true;
                        vmodel._effect();
                    };
                    //@interface hideLoading() 隐藏loading
                    vm.hideLoading = function () {
                        vmodel.toggle = false;
                    };
                    //@interface destroyLoading() 销毁loading
                    vm.destroyLoading = function () {
                        vmodel.toggle = false;
                        vmodel.$remove();
                    };
                    /**
             * @interface 将loading效果插入到指定的容器里
             * @param 目标容器元素，默认是绑定widget的元素
             */
                    vm.appendTo = function (container) {
                        var cnt = container || vm.widgetElement, modal = g('modal' + vm.$id), loading = g('loading' + vm.$id);
                        if (modal)
                            cnt.appendChild(modal);
                        if (loading)
                            cnt.appendChild(loading);
                    };
                });
            vmodel.$watch('toggle', function (n) {
                if (!n) {
                    clearInterval(vmodel.$timer);
                } else {
                    vmodel._effect();
                }
            });
            widgetCount++;
            return vmodel;
        };
    widget.defaults = {
        //@config onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
        onInit: avalon.noop,
        color: '#619FE8',
        //@config 效果的颜色
        type: 'ball',
        //@config 类型，默认是ball，球，可取spin,ticks
        toggle: true,
        //@config 是否显示
        modal: true,
        //@config 是否显示遮罩
        modalOpacity: 0.1,
        //@config 遮罩透明度
        modalBackground: '#fff',
        //@config 遮罩背景色
        container: void 0,
        //@config loading效果显示的容器，默认是绑定widget的元素
        getTemplate: function (tmpl, opts, tplName) {
            return tmpl;
        },
        //@config getTemplate(tpl, opts, tplName) 定制修改模板接口
        $author: 'skipper@123'
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "25008a5bba9e941c7201b29c84441a68" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "959601740f2cc260eae9532b9c521844" , 
        filename : "avalon.notice.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'],
sourceHTML = "<div class=\"oni-notice\" ms-class=\"{{typeClass}}\" ms-css-height=\"height\" ms-visible=\"toggle\">\n    <div class=\"oni-notice-inner\">\n        <div class=\"oni-notice-header\" ms-if=\"!!header\">{{title|html}}</div>\n        <div class=\"oni-notice-content\">\n            <span class=\"js_notice_content\">{{content|html}}</span>\n            <span class=\"oni-notice-close js_notice_close\" \n                ms-if=\"hasCloseBtn\"\n                ms-click=\"_close\">关闭</span>\n        </div>\n    </div>\n</div>\n<div ms-if=\"_isAffix\" ms-css-width=\"noticeAffixWidth\" ms-css-height=\"noticeAffixHeight\" ms-css-display=\"affixPlaceholderDisplay\"></div>\n";

module.exports = (
function () {
    var template = sourceHTML, containerMap = [], affixBoxs = [],
        // 存储吸顶的notice元素，且只保存弹出的notice
        affixHeights = [],
        //存储吸顶元素对应的height、width、offsetTop
        isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('msie 6') !== -1, maxZIndex = 0;
    var widget = avalon.ui.notice = function (element, data, vmodels) {
            var options = data.noticeOptions, temp = template;
            if (options.animate) {
                temp = template.replace('ms-visible="toggle"', '');
                options.height = 0;
            } else {
                options.height = 'auto';
            }
            options.template = options.getTemplate(temp, options);
            // container选项可以是dom对象，或者元素ID("#id")
            var noticeDefineContainer = options.container;
            // 根据配置值将container转换为完全的dom对象，如果用户未配置container，则container容器默认是应用绑定的元素
            options.container = noticeDefineContainer ? noticeDefineContainer.nodeType === 1 ? noticeDefineContainer : document.getElementById(noticeDefineContainer.substr(1)) : element;
            var templateView = null,
                // 保存模板解析后的dom对象的引用
                elementInnerHTML = element.innerHTML.trim(),
                //如果notice的container是默认配置也就是绑定元素本身，元素的innerHTML就是notice的content
                onShow = options.onShow, onShowVM = null, onHide = options.onHide, onHideVM = null;
            if (typeof onShow === 'string') {
                onShowVM = avalon.getModel(onShow, vmodels);
                options.onShow = onShowVM && onShowVM[1][onShowVM[0]] || avalon.noop;
            }
            if (typeof onHide === 'string') {
                onHideVM = avalon.getModel(onHide, vmodels);
                options.onHide = onHideVM && onHideVM[1][onHideVM[0]] || avalon.noop;
            }
            element.innerHTML = '';
            if (options.header !== 'notice title' && options.title === 'notice title') {
                options.title = options.header;
            }
            var vmodel = avalon.define(data.noticeId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$closeTimer = 0;
                    // 定时器引用
                    vm.$skipArray = [
                        'template',
                        'widgetElement',
                        '_isAffix',
                        'container',
                        'elementHeight',
                        'rootElement'
                    ];
                    vm.elementHeight = 0;
                    vm.content = vm.content || elementInnerHTML;
                    vm._isAffix = vm.isPlace && vm.isAffix;
                    vm.rootElement = {};
                    vm.widgetElement = element;
                    // type的改变影响notice显示类的改变
                    vm.typeClass = vm[vm.type + 'Class'];
                    vm.noticeAffixWidth = 0;
                    vm.noticeAffixHeight = 0;
                    vm.affixPlaceholderDisplay = 'none';
                    // 如果配置notice不占位则设置器容器为body
                    !vm.isPlace ? vm.container = document.body : vm.container;
                    vm._show = function (display) {
                        // toggle为true时调用此方法显示notice
                        _timerClose();
                        _affix();
                        if (vmodel.animate) {
                            step(display, vmodel);
                        }
                        vmodel.onShow.call(element, data, vmodels);    // 用户回调
                    };
                    vm.$watch('elementHeightOk', function () {
                        vmodel.height = 'auto';
                    });
                    vm._close = function () {
                        //close按钮click时的监听处理函数
                        vmodel.toggle = false;
                    };
                    vm._hide = function (display) {
                        //toggle为false时隐藏notice
                        var hideAffixIndex = affixBoxs.indexOf(templateView), $templateView = avalon(templateView);
                        if (vmodel.animate) {
                            vmodel.elementHeight = $templateView.innerHeight();
                            $templateView.css('height', vmodel.elementHeight);
                            step(display, vmodel);
                        }
                        //隐藏吸顶元素后将其从吸顶队列中删除，并修改吸顶队列中所有元素的position为static，以便affixPosition能重新调整吸顶元素位置
                        if (hideAffixIndex !== -1) {
                            templateView.style.position = 'static';
                            //隐藏时改变position，方便再显示时调整元素位置(吸顶还是原位)
                            affixBoxs.splice(hideAffixIndex, 1);
                            affixHeights.splice(hideAffixIndex, 1);
                            for (var i = 0, len = affixBoxs.length; i < len; i++) {
                                affixBoxs[i].style.position = 'static';
                            }
                            if (len) {
                                //如果依然存在吸顶元素，重新调整吸顶元素的位置
                                affixPosition();
                            }
                        }
                        vmodel.onHide.call(element, data, vmodels);    //用户回调
                    };
                    vm.setContent = function (content) {
                        vmodel.content = content;
                    };
                    vm.$init = function () {
                        var container = null;
                        var sourceFragment = avalon.parseHTML(options.template);
                        var AffixPlaceholder = sourceFragment.lastChild;
                        if (!maxZIndex) {
                            maxZIndex = getMaxZIndex();
                        }
                        templateView = sourceFragment.firstChild;
                        container = positionNoticeElement();
                        //获取存储notice的容器
                        container.appendChild(templateView);
                        if (!vmodel.isPlace) {
                            //不占位notice元素，使之保持和配置container同样的offsetLeft和width
                            var $container = avalon(options.container);
                            // IE7及以下元素为空其width为0，所以需要取到其父节点的width
                            var $containerParent = avalon($container[0].parentNode);
                            templateView.style.width = ($container.width() || $containerParent.width()) + 'px';
                            templateView.style.position = 'relative';
                            templateView.style.left = $container.offset().left + 'px';
                        }
                        if (vmodel._isAffix) {
                            container.appendChild(AffixPlaceholder);
                            avalon.scan(AffixPlaceholder, [vmodel]);
                        }
                        vm.rootElement = templateView;
                        avalon.scan(templateView, [vmodel].concat(vmodels));
                        if (typeof options.onInit === 'function') {
                            //vmodels是不包括vmodel的
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                        if (vmodel.animate) {
                            animateElementHeight();
                        }
                    };
                    vm.$remove = function () {
                        //删除组件绑定元素后的自清理方法
                        var templateViewPar = templateView.parentNode;
                        for (var i = 0, len = containerMap.length; i < len; i++) {
                            var containerInfo = containerMap[i];
                            if (containerInfo[2] === options.container) {
                                break;
                            }
                        }
                        if (vmodel._isAffix) {
                            var templateViewNextSiblind = templateView.nextSibling;
                            templateViewPar.removeChild(templateViewNextSiblind);
                        }
                        templateView.innerHTML = templateView.textContent = '';
                        templateViewPar.removeChild(templateView);
                        if (!templateViewPar.children.length) {
                            templateViewPar.parentNode.removeChild(templateViewPar);
                            containerInfo[0] = void 0;
                        }
                    };
                });
            vmodel.$watch('toggle', function (v) {
                //改变toggle影响notice的显示、隐藏
                if (v) {
                    vmodel._show(v);
                } else {
                    vmodel._hide(v);
                }
            });
            vmodel.$watch('type', function (v) {
                //改变type影响notice的显示类型
                vmodel.typeClass = vmodel[v + 'Class'];
            });
            vmodel.$watch('header', function (v) {
                vmodel.title = v;
            });
            vmodel.$watch('successClass', function (v) {
                vmodel.typeClass = v;
            });
            vmodel.$watch('errorClass', function (v) {
                vmodel.typeClass = v;
            });
            vmodel.$watch('infoClass', function (v) {
                vmodel.typeClass = v;
            });
            vmodel.$watch('zIndex', function (v) {
                maxZIndex = v;
                affixPosition();
            });
            vmodel.$watch('content', function () {
                if (vmodel.animate) {
                    animateElementHeight();
                }
            });
            // 如果配置了timer，则在notice显示timer时间后自动隐藏
            function _timerClose() {
                if (!vmodel.timer) {
                    return;
                }
                window.clearTimeout(vmodel.$closeTimer);
                vmodel.$closeTimer = window.setTimeout(function () {
                    vmodel.toggle = false;
                }, vmodel.timer);
            }
            // notice要求占位且吸顶则保存吸顶元素到affixBoxs中，将元素的width、height、offsetTop保存到affixHeights对应位置,并根据页面目前位置调整吸顶元素的位置
            function _affix() {
                if (!vmodel._isAffix) {
                    return;
                }
                var $templateView = avalon(templateView);
                var offset = $templateView.offset();
                var templateViewWidth = templateView.offsetWidth;
                var templateViewHieght = templateView.offsetHeight;
                vmodel.noticeAffixWidth = templateViewWidth;
                vmodel.noticeAffixHeight = templateViewHieght;
                templateView.vmodel = vmodel;
                affixBoxs.push(templateView);
                affixHeights.push([
                    templateViewHieght,
                    templateViewWidth,
                    offset.top,
                    offset.left
                ]);
                affixPosition();
            }
            // 当content改变时，重新计算元素高度，保证动画执行正确
            function animateElementHeight() {
                setTimeout(function () {
                    var temp = document.createElement('div'), cloneTemplateView = templateView.cloneNode(true), $cloneTemplateView, width = avalon(templateView).innerWidth(), templateViewPar = templateView.parentNode;
                    if (!width) {
                        while (templateViewPar) {
                            if (templateViewPar.nodeType === 1) {
                                width = avalon(templateViewPar).innerWidth();
                            }
                            if (width) {
                                break;
                            }
                            templateViewPar = templateViewPar.parentNode;
                        }
                    }
                    temp.style.position = 'absolute';
                    temp.style.height = 0;
                    document.body.appendChild(temp);
                    temp.appendChild(cloneTemplateView);
                    $cloneTemplateView = avalon(cloneTemplateView);
                    $cloneTemplateView.css({
                        visibility: 'hidden',
                        width: width,
                        height: 'auto'
                    });
                    vmodel.elementHeight = $cloneTemplateView.height();
                    document.body.removeChild(temp);
                }, 10);
            }
            // 根据占位与否以及配置的container获得最终插入notice的container
            function positionNoticeElement() {
                var containerArr = [];
                var container = vmodel.container;
                var containerExist = false;
                // container是否被处理过的标志
                for (var i = 0, len = containerMap.length; i < len; i++) {
                    var containerInfo = containerMap[i];
                    if (containerInfo[2] === container) {
                        containerExist = true;
                        // container已经被配置过，则直接获取container下的div
                        container = vmodel.isPlace ? containerInfo[0] : containerInfo[1];
                        if (!container) {
                            //因为存在占位和不占位两种情况，所以有可能得到的container还没有经过处理
                            var div = document.createElement('div');
                            var containerFirstChild = vmodel.container.childNodes[0];
                            if (!containerFirstChild) {
                                // 如果container还没有子元素直接append
                                vmodel.container.appendChild(div);
                            } else {
                                //保证notice的容器始终在container的起始位置
                                vmodel.container.insertBefore(div, containerFirstChild);
                            }
                            if (vmodel.isPlace) {
                                containerInfo[0] = container = div;
                                avalon(div).addClass('oni-notice-flow');
                            } else {
                                avalon(div).addClass('oni-notice-detach');
                                containerInfo[1] = container = div;
                            }
                        }
                        break;
                    }
                }
                if (!containerExist) {
                    var div = document.createElement('div');
                    if (vmodel.isPlace) {
                        var containerFirstChild = container.childNodes[0];
                        if (!containerFirstChild) {
                            // 如果container还没有子元素直接append
                            container.appendChild(div);
                        } else {
                            //保证notice的容器始终在container的起始位置
                            container.insertBefore(div, containerFirstChild);
                        }
                    } else {
                        // 不占位的notice直接append到body后面
                        container.appendChild(div);
                    }
                    avalon(div).addClass(vmodel.isPlace ? 'oni-notice-flow' : 'oni-notice-detach');
                    containerArr[2] = container;
                    // 保存用户配置的container对象
                    if (vmodel.isPlace) {
                        containerArr[0] = container = div;    // 占位元素container下的oni-notice-flow
                    } else {
                        containerArr[1] = container = div;    // body下的oni-notice-detach元素
                    }
                    containerMap.push(containerArr);
                }
                return container;
            }
            return vmodel;
        };
    avalon.bind(window, 'scroll', function () {
        affixPosition();
    });
    function affixPosition() {
        // 定位吸顶元素
        var scrollTop = avalon(document).scrollTop();
        for (var i = 0, len = affixBoxs.length; i < len; i++) {
            var notice = affixBoxs[i], style = notice.style, $notice = avalon(notice), vmodel = notice.vmodel;
            // 如果滚动距离大于吸顶元素的offsetTop，将元素吸顶，否则保存元素在页面的位置不变
            if (scrollTop >= affixHeights[i][2]) {
                // IE6下fixed失效，使用absolute进行吸顶操作
                if (style.position !== 'fixed' || isIE6 && style.position !== 'absolute') {
                    //滚动过程中如果元素已经吸顶，就不再重新计算位置并定位
                    var top = 0;
                    var left = 0;
                    for (var j = 1; j <= i; j++) {
                        top += affixHeights[j - 1][0];
                    }
                    top = isIE6 ? scrollTop + top : top;
                    left = affixHeights[i][3];
                    $notice.css({
                        width: affixHeights[i][1] + 'px',
                        top: top + 'px',
                        left: left + 'px',
                        position: isIE6 ? 'absolute' : 'fixed',
                        'z-index': maxZIndex
                    });
                    vmodel.affixPlaceholderDisplay = 'block';
                }
            } else {
                $notice.css('position', 'static');
                vmodel.affixPlaceholderDisplay = 'none';
            }
        }
    }
    function getMaxZIndex() {
        var children = document.body.children, maxIndex = 10,
            //当body子元素都未设置zIndex时，默认取10
            zIndex;
        for (var i = 0, el; el = children[i++];) {
            if (el.nodeType === 1) {
                zIndex = ~~avalon(el).css('z-index');
                if (zIndex) {
                    maxIndex = Math.max(maxIndex, zIndex);
                }
            }
        }
        return maxIndex + 1;
    }
    function camelize(target) {
        //转换为驼峰风格
        if (target.indexOf('-') < 0 && target.indexOf('_') < 0) {
            return target    //提前判断，提高getStyle等的效率
;
        }
        return target.replace(/[-_][^-_]/g, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }
    function supportCss3(name) {
        var prefix = [
                '',
                '-webkit-',
                '-o-',
                '-moz-',
                '-ms-'
            ], i, htmlStyle = document.documentElement.style;
        for (i in prefix) {
            camelCase = camelize(prefix[i] + name);
            if (camelCase in htmlStyle) {
                return true;
            }
        }
        return false;
    }
    function step(display, vmodel) {
        var elementHeight = vmodel.elementHeight, height, interval;
        if (supportCss3('transition')) {
            height = display ? elementHeight : 0;
            if (!display) {
                setTimeout(function () {
                    vmodel.height = height;
                }, 10);
            } else {
                vmodel.height = height;
            }
            if (height) {
                setTimeout(function () {
                    vmodel.$fire('elementHeightOk');
                }, 600);
            }
        } else {
            height = display ? 0 : elementHeight;
            function animate() {
                height = display ? height + 1 : height - 1;
                if (height < 0) {
                    vmodel.height = 0;
                    return;
                } else if (height > elementHeight) {
                    vmodel.height = elementHeight;
                    setTimeout(function () {
                        vmodel.$fire('elementHeightOk');
                    }, 600);
                    return;
                }
                vmodel.height = height;
                setTimeout(animate, 0);
            }
            animate();
        }
    }
    widget.version = 1;
    widget.defaults = {
        content: '',
        //@interface 要显示的内容,可以是DOM对象|String|DOM String
        container: '',
        //@interface 显示notice的容器，可以配置为自己想要包裹notice的元素对象或者元素id，id的话必须是"#ID"的格式,默认为绑定组件的元素
        type: 'info',
        //@config notice类型,可以选择为"success"、"error"或者默认的"info
        header: 'notice title',
        //@config notice的标题
        title: 'notice title',
        //@config  notice的标题
        timer: 0,
        //@config notice显示之后自动隐藏的定时器，0表示不自动隐藏
        hasCloseBtn: true,
        //@config 是否显示关闭按钮，设为false不显示
        toggle: false,
        //@config 显示或隐藏notice， true显示，false隐藏
        isPlace: true,
        //@config 是否占位，false不占位，true占位，占位时notice显示在自定义的container中，不占位时append到body元素下
        isAffix: false,
        //@config 是否吸顶，非占位元素不吸顶，占位元素当滚动距离大于元素距页面顶部距离时吸顶，否则保持原位置
        /**
         * @interface  notice显示之后回调
         * @param data {Object} 与此数组相关的数据对象
         *  @param vmodels {Array} 位于此组件上方的vmodels组成的数组
         */
        onShow: avalon.noop,
        /**
         * @interface  notice关闭之后回调
         * @param data {Object} 与此数组相关的数据对象
         *  @param vmodels {Array} 位于此组件上方的vmodels组成的数组
         */
        onHide: avalon.noop,
        successClass: 'oni-notice-info',
        //@config type为success时的提示类名
        errorClass: 'oni-notice-danger',
        //@config type为error时的提示类名
        infoClass: '',
        //@config type为info时的提示类名
        widgetElement: '',
        //@interface accordion容器
        zIndex: 'auto',
        //@config 提示组件的zindex css值
        animate: true,
        //@config notice的显示隐藏是否添加动画
        /*
         * @config {Function} 用于重写模板的函数 
         * @param {String} tmpl
         * @param {Object} opts
         * @returns {String}
         */
        getTemplate: function (str, options) {
            return str;
        }
    };
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "959601740f2cc260eae9532b9c521844" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e156f2a7ac606ad1a2a95045e64b106a" , 
        filename : "avalon.menu.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<li class=\"oni-state-default oni-menu-item\" \n    data-repeat-rendered=\"_rescan\" \n    ms-repeat-menu=\"data\"   \n    ms-class-11=\"oni-state-active:!!_canActive(menu, $index)\" \n    ms-class-12=\"oni-state-disabled:menu.disabled\" \n    ms-class-13=\"oni-menu-last:$last\" \n    ms-class-14=\"oni-menu-removable:!!_canRemove(menu)\" \n    ms-class-15=\"oni-menu-item-{{_depth}}\" \n    ms-class-16=\"oni-menu-with-sub oni-menu-with-sub-{{_depth}}:_hasSubMenu(menu)\" \n    ms-hover=\"oni-state-hover\" \n    ms-click-101=\"_ifEventIsMouseEnter($event, $index)\" \n    ms-data-sub=\"_hasSubMenu(menu)\" \n    ms-data-depth=\"_depth\" \n    ms-data-index=\"$index\" \n    ms-{{MS_OPTION_EVENT}}-100=\"activate($event, $index)\" \n    > \n    {{_menuTitle(menu.title, menu, _cutCounter(), cutEnd) | html}}\n    <span ms-if=\"_hasSubMenu(menu)\" class=\"oni-menu-icon\">&gt;</span>\n\t<ul ms-if=\"_hasSubMenu(menu)\" class=\"oni-menu oni-menu-sub oni-helper-clearfix oni-helper-reset\" \n\t\t ms-data-widget-index=\"$index\" \n\t\t ms-class-101=\"oni-menu-depth-{{_depth+1}}\" \n\t\t ms-class-102=\"oni-helper-hidden:!_canActive(menu, $index)\" \n\t\t ms-data-widget=\"'menu'\">\n\t</ul>\n</li>";

module.exports = (
function () {
    var counter = 0;
    function getCnt() {
        return counter++;
    }
    // _depth迭代层数
    function buildData(nodes, obj, _depth) {
        var data = [], node, i = 0, _depth = _depth || 0;
        while (node = nodes[0]) {
            var subMenu = node.getElementsByTagName && (node.getElementsByTagName('ul')[0] || node.getElementsByTagName('ol')[0]), item = {};
            if (subMenu) {
                item.data = buildData(subMenu.children, obj, _depth + 1);
                node.removeChild(subMenu);
            } else {
                item.data = '';
            }
            var html = node.innerHTML, d = avalon(node).data();
            if (html && html.trim() || subMenu) {
                item.title = html || '';
                item.disabled = d && d.disabled;
                item.active = d && d.active || i === obj.active;
                if (item.active)
                    obj.active = i;
                data.push(item);
                i++;
            }
            node.parentNode.removeChild(node);
        }
        return data;
    }
    // 格式化数据
    function formateData(data) {
        avalon.each(data, function (i, item) {
            if (!item || item.$id)
                return;
            var tpl = avalon.mix({
                    disabled: false,
                    title: '',
                    data: '',
                    active: false
                }, item);
            avalon.mix(item, tpl);
            if (Array.isArray(item.data))
                formateData(item.data);
        });
    }
    var widgetInit;
    function bindClick(e) {
        for (var i in widgetInit) {
            widgetInit[i] && widgetInit[i](e);
        }
    }
    function hasSubMenu(node) {
        return node.getElementsByTagName('ol')[0] || node.getElementsByTagName('ul')[0];
    }
    var widget = avalon.ui.menu = function (element, data, vmodels) {
            var options = data.menuOptions;
            options.event = options.event === 'mouseover' ? 'mouseenter' : options.event;
            //方便用户对原始模板进行修改,提高定制性
            options.template = options.getTemplate(template, options).replace(/\{\{MS_OPTION_EVENT\}\}/, options.event).replace(/\{\{\MS_OPTION_CNT}\}/g, counter);
            if (options.data == void 0) {
                options.data = buildData(element.children, options);
            } else {
                formateData(options.data);
            }
            var uid = +new Date();
            var vmodel = avalon.define(data.menuId, function (vm) {
                    avalon.mix(vm, options);
                    vm.widgetElement = element;
                    vm.rootElement = element;
                    vm._oldActive = options.active;
                    vm._subMenus = {};
                    // 维护一个子menu列表，用对象，更好读写
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        '_subMenus',
                        '_oldActive',
                        'rootElement'
                    ];
                    var inited, outVmodel = vmodels && vmodels[1], clickKey = 'fromMenu' + uid;
                    vm.$init = function (continueScan) {
                        if (inited)
                            return;
                        inited = true;
                        // 子menu的层次+1
                        if (outVmodel && outVmodel._depth != void 0) {
                            vmodel._depth = outVmodel._depth + 1;
                        }
                        element.innerHTML = vmodel.template;
                        if (vmodel._depth === 1) {
                            element.setAttribute('ms-hover-100', 'oni-helper-max-index');
                            avalon(element).addClass('oni-menu oni-helper-clearfix oni-helper-reset' + (vmodel.dir === 'v' ? ' oni-menu-vertical' : ''));
                        }
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                        // mouseleave重置menu
                        vmodel.event === 'mouseenter' && avalon(element).bind('mouseleave', function (e) {
                            vmodel._restMenu(vmodel);
                        });
                        // 点击选中事件的时候，重置menu
                        if (vmodel.event === 'click') {
                            // 绑定一次
                            if (!widgetInit) {
                                widgetInit = {};
                                avalon(document).bind('click', bindClick);
                            }
                            widgetInit[clickKey] = function (e) {
                                vmodel._restMenu(vmodel);
                            };
                        }
                        // 各menu之间点击互不影响
                        vmodel._depth === 1 && avalon(element).bind('click', function (e) {
                            e && e.stopPropagation();
                        });
                    };
                    vm.$remove = function () {
                        delete widgetInit[clickKey];
                        element.innerHTML = element.textContent = '';
                    };
                    vm._canActive = function (menu, index) {
                        return vmodel.active === index && !menu.disabled;
                    };
                    //@interface activate(index)展开菜单索引为index的项目，index置为false,undefined则不会展开任一项目
                    vm.activate = function (e, index) {
                        var _index = index === void 0 ? e : index;
                        if (!vmodel.data[_index] || vmodel.data[_index].disabled === true || vmodel.disabled)
                            return;
                        vmodel._oldActive = vmodel.active;
                        // 切换menu，重置子menu状态
                        if (_index !== vmodel._oldActive) {
                            vmodel.resetSubMenus();
                        }
                        vmodel.active = _index;
                        // 事件触发
                        if (e && index !== void 0 && vmodel.event === 'click') {
                            var activeData = vmodel.getActiveList(), last = activeData[activeData.length - 1], node = hasSubMenu(this);
                            // state 1
                            // 有node
                            if (node) {
                                // state 2
                                // 有子menu的节点第一次被点击展开，阻止默认事件，之后不再阻止
                                if (last && last[1] === eval(this.getAttribute('data-index'))) {
                                    // state 3
                                    // 第一次点击
                                    if (vmodel._oldActive !== vmodel.active) {
                                        e && e.preventDefault();
                                        e && e.stopPropagation();
                                        return;
                                    }
                                }
                            }
                            // state 1 
                            // 非第一次点击，认为是选中这个拥有子menu的item
                            // state 2
                            // 没有子menu的节点被点击，冒泡到上层
                            // state 1
                            // 没有node
                            vmodel._onSelect.call(this, e, activeData);
                        }
                    };
                    // 冒泡到第一级menu进行处理
                    vm._onSelect = function (e, activeData) {
                        if (vmodel._depth === 1) {
                            var tar = e.srcElement || e.target;
                            while (tar && tar.tagName.toLowerCase() !== 'li') {
                                tar = tar.parentNode;
                            }
                            var ele = avalon(tar), d = ele.data(), _hasSubMenu = !!hasSubMenu(tar);
                            realSelect = activeData.slice(0, d.depth);
                            options.onSelect.call(tar, vmodel, realSelect, _hasSubMenu);
                            vmodel._restMenu(vmodel);
                        }
                    };
                    // event 为mouseenter的时候，点击进入这个分支
                    vm._ifEventIsMouseEnter = function (e, index) {
                        if (vmodel.event === 'click' || vmodel._depth !== 1)
                            return;
                        vmodel._onSelect(e, vmodel.getActiveList());
                    };
                    // event 为mouseenter的时候进入这个方法
                    vm._clickActive = function (e, index) {
                        if (vmodel.active !== index)
                            return;
                        // 阻止冒泡
                        // e && e.stopPropagation()
                        var ele = avalon(this), d = ele.data();
                        vmodel._onClickActive.call(this, e, vmodel.active, vmodel.data, d && d.sub);
                    };
                    // get node by data，根据数据反获取节点
                    vm._getNodeByData = function (activeData) {
                        if (activeData.length > 0) {
                            var sub = vmodel._subMenus[activeData[0]];
                            if (sub) {
                                return sub._getNodeByData(activeData.slice(1));
                            } else {
                                var children = vmodel.widgetElement.children, i = 0, counter = 0;
                                while (children[++i]) {
                                    var node = children[i - 1];
                                    if (node.tagName.toLowerCase() === 'li') {
                                        if (counter == vmodel.active)
                                            return node;
                                        counter++;
                                    }
                                }
                            }
                        }
                        return false;
                    };
                    //@interface getActiveList() 获取所有选中的menu list
                    vm.getActiveList = function (arr) {
                        var data = arr || [];
                        if (vmodel.active !== false && vmodel.data[vmodel.active]) {
                            data.push([
                                vmodel.data[vmodel.active].$model,
                                vmodel.active
                            ]);
                            var sub = vmodel._subMenus[vmodel.active];
                            sub && sub.getActiveList(data);
                        }
                        return data;
                    };
                    //@interface setActiveList(activeListArray) 设置级联menu的选项，可以一个数组，也可以使一个数字，或者"2,3,4"这样的字符串
                    vm.setActiveList = function (arr) {
                        if (!arr)
                            return;
                        if (!Array.isArray(arr))
                            var arr = [arr].join('').split(',');
                        if (!arr.length)
                            return;
                        vmodel.activate(eval(arr[0]));
                        if (vmodel.active === false) {
                            vmodel.resetSubMenus();
                            return;
                        }
                        if (!arr.length)
                            return;
                        var sub = vmodel._subMenus[vmodel.active];
                        sub && sub.setActiveList(arr.slice(1))    // if(vmodel._depth === 1) {
                                                           //     vmodel._onSelect({
                                                           //         srcElement: vmodel._getNodeByData(arr)
                                                           //     }, vmodel.getActiveList())
                                                           // }
;
                    };
                    // 是否有子menu
                    vm._hasSubMenu = function (menu) {
                        return !!(menu && menu.data && Array.isArray(menu.data) && menu.data.length);
                    };
                    // 处理级联子menu
                    vm._rescan = function () {
                        vmodel._subMenus = {};
                        var nodes = vmodel.widgetElement.children, counter = 0;
                        for (var i = 0, len = nodes.length; i < len; i++) {
                            var node = nodes[i];
                            if (node.nodeType === 1 && node.tagName.toLowerCase() === 'li') {
                                var menu = node.getElementsByTagName('ul')[0] || node.getElementsByTagName('ol')[0];
                                if (menu) {
                                    var ele = avalon(menu), d = ele.data();
                                    if (d.widget === 'menu') {
                                        var opt = avalon.mix({}, options), name = data.menuId + 'r' + getCnt();
                                        menu.setAttribute('ms-widget', 'menu, $' + uid + i);
                                        var subData = vmodel.data[d.widgetIndex], obj = {};
                                        if (subData) {
                                            obj = avalon.mix(opt, { data: subData.$model.data });
                                        }
                                        obj.index = d.widgetIndex;
                                        var subVmodel = avalon.define(name, function (svm) {
                                                svm.menu = obj;
                                                svm.$skipArray = ['menu'];
                                            });
                                        avalon.scan(menu, [
                                            subVmodel,
                                            vmodel
                                        ].concat(vmodels));
                                        vmodel._subMenus[counter] = avalon.vmodels['$' + uid + i];
                                    }
                                }
                                counter++;
                            }
                        }
                    };
                    // 重置所有子menu
                    vm.resetSubMenus = function () {
                        avalon.each(vmodel._subMenus, function (i, item) {
                            vmodel._restMenu(item);
                            // 迭代
                            item.resetSubMenus();
                        });
                    };
                    vm._restMenu = function (model) {
                        model.menuResetter(model);
                        model._oldActive = model.active;
                    };
                    vm._cutCounter = avalon.noop;
                    vm._canRemove = avalon.noop;
                });
            return vmodel;
        };
    widget.defaults = {
        active: false,
        //@config 将第几个项目设置为选中，级联情形下，会将设置应用给每一级menu，默认是false，一个都不选中，建议不要通过修改这个值来修改menu的选中状态，而是通过setActiveList接口来做
        //data: undefined, //@config menu的数据项，如果没有配置这个项目，则默认扫描元素中的li，以及li中的ul或者ol来创建级联菜单，数据结构形式 <pre>[/n{/ntitle: "html",/n data: [...],/n active: false,/n disabled: false/n}/n]</pre>，子元素如果包含有效的data属性表示拥有子菜单
        event: 'mouseenter',
        //@config  选中事件，默认mouseenter
        disabled: false,
        _depth: 1,
        index: 0,
        dir: 'h',
        //@config 方向，取值v,h，默认h是水平方向， v是竖直方向
        //@config onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
        onInit: avalon.noop,
        menuResetter: function (vmodel) {
            vmodel.active = false;
        },
        //@config menuResetter(vmodel) 选中某个menu项之后调用的这个restter，默认是把menu重置为不选中
        getTemplate: function (tmpl, opts, tplName) {
            return tmpl;
        },
        //@config getTemplate(tpl, opts, tplName) 定制修改模板接口
        _menuTitle: function (title, tab, count, end) {
            return title;
        },
        onSelect: avalon.noop,
        //@config onSelect(vmodel, realSelect, _hasSubMenu) this指向选中的menu li元素，realSelect是选中menu项目的数组 <pre>[/n[data, active],/n[data2,active2]/n]</pre>，对应每一级的数据，及每一级的active值，_hasSubMenu表示this元素有无包含子menu
        cutEnd: '',
        $author: 'skipper@123'
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "e156f2a7ac606ad1a2a95045e64b106a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "f7394bc2afc8a77d01974bff583ff7be" , 
        filename : "avalon.datepicker.lang.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    module.exports = (
function () {
    var HolidayStyle = {
            '\u5143\u65E6\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_yuandan',
                'holidayText': '\u5143\u65E6'
            },
            '\u9664\u5915': {
                'afterTime': 0,
                'beforeTime': 0,
                'dayIndex': 0,
                'holidayClass': 'c_chuxi',
                'holidayText': '\u9664\u5915'
            },
            '\u6625\u8282': {
                'afterTime': 0,
                'beforeTime': 0,
                'dayIndex': 0,
                'holidayClass': 'c_chunjie',
                'holidayText': '\u6625\u8282'
            },
            '\u5143\u5BB5\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_yuanxiao',
                'holidayText': '\u5143\u5BB5'
            },
            '\u6E05\u660E\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_qingming',
                'holidayText': '\u6E05\u660E'
            },
            '\u52B3\u52A8\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_wuyi',
                'holidayText': '\u52B3\u52A8'
            },
            '\u7AEF\u5348\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_duanwu',
                'holidayText': '\u7AEF\u5348'
            },
            '\u4E2D\u79CB\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_zhongqiu',
                'holidayText': '\u4E2D\u79CB'
            },
            '\u56FD\u5E86\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_guoqing',
                'holidayText': '\u56FD\u5E86'
            },
            '\u5723\u8BDE\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_shengdan',
                'holidayText': '\u5723\u8BDE'
            }
        };
    var HolidayData = {
            '2014-01-01': { 'holidayName': '\u5143\u65E6\u8282' },
            '2014-01-30': { 'holidayName': '\u9664\u5915' },
            '2014-01-31': { 'holidayName': '\u6625\u8282' },
            '2014-02-01': { 'holidayName': '\u6B63\u6708\u521D\u4E8C' },
            '2014-02-02': { 'holidayName': '\u6B63\u6708\u521D\u4E09' },
            '2014-02-14': { 'holidayName': '\u5143\u5BB5\u8282' },
            '2014-04-05': { 'holidayName': '\u6E05\u660E\u8282' },
            '2014-05-01': { 'holidayName': '\u52B3\u52A8\u8282' },
            '2014-06-01': { 'holidayName': '\u513F\u7AE5\u8282' },
            '2014-06-02': { 'holidayName': '\u7AEF\u5348\u8282' },
            '2014-09-08': { 'holidayName': '\u4E2D\u79CB\u8282' },
            '2014-09-10': { 'holidayName': '\u6559\u5E08\u8282' },
            '2014-10-01': { 'holidayName': '\u56FD\u5E86\u8282' },
            '2014-12-25': { 'holidayName': '\u5723\u8BDE\u8282' },
            '2015-01-01': { 'holidayName': '\u5143\u65E6\u8282' },
            '2015-02-18': { 'holidayName': '\u9664\u5915' },
            '2015-02-19': { 'holidayName': '\u6625\u8282' },
            '2015-02-20': { 'holidayName': '\u6B63\u6708\u521D\u4E8C' },
            '2015-02-21': { 'holidayName': '\u6B63\u6708\u521D\u4E09' },
            '2015-03-05': { 'holidayName': '\u5143\u5BB5\u8282' },
            '2015-04-05': { 'holidayName': '\u6E05\u660E\u8282' },
            '2015-05-01': { 'holidayName': '\u52B3\u52A8\u8282' },
            '2015-06-01': { 'holidayName': '\u513F\u7AE5\u8282' },
            '2015-06-20': { 'holidayName': '\u7AEF\u5348\u8282' },
            '2015-09-27': { 'holidayName': '\u4E2D\u79CB\u8282' },
            '2015-10-01': { 'holidayName': '\u56FD\u5E86\u8282' },
            '2015-12-25': { 'holidayName': '\u5723\u8BDE\u8282' }
        };
    for (var x in HolidayData) {
        if (HolidayData.hasOwnProperty(x)) {
            var data = HolidayData[x], name = data.holidayName;
            if (name && HolidayStyle[name]) {
                var style = HolidayStyle[name];
                for (var y in style) {
                    if (style.hasOwnProperty(y) && !(y in data)) {
                        data[y] = style[y];
                    }
                }
            }
        }
    }
    return HolidayData;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "f7394bc2afc8a77d01974bff583ff7be" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "90b2de0bf947d1814b382738513983f5" , 
        filename : "avalon.dropdown.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<div class=\"oni-dropdown\"\n     ms-class=\"oni-state-disabled:!enable\"\n     ms-class-1=\"{{titleClass}}\"\n     ms-css-width=\"{{width}}\"\n     ms-class-2=\"oni-state-focus: focusClass\"\n     ms-hover=\"oni-state-hover\"\n     ms-mouseenter=\"_titleenter\"\n     ms-mouseleave=\"_titleleave\"\n     ms-keydown=\"_keydown\"\n     tabindex=\"0\">\n    <div class=\"oni-dropdown-source\">\n        <div class=\"oni-dropdown-input\"\n             ms-attr-title=\"title\"\n             ms-css-width=\"titleWidth\"\n             id=\"title-MS_OPTION_ID\">{{label|sanitize|html}}</div>\n        <div class=\"oni-dropdown-icon-wrap\">\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-up\"\n               ms-visible=\"toggle\">&#xf028;</i>\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-down\"\n               ms-visible=\"!toggle\">&#xf032;</i>\n        </div>\n    </div>\n</div>\nMS_OPTION_TEMPLATE\n<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-menu:!multiple\"\n     ms-class-1=\"{{listClass}}\"\n     ms-css-width=\"{{listWidth}}\"\n     ms-mouseenter=\"_listenter\"\n     ms-mouseleave=\"_listleave\"\n     ms-visible=\"toggle||multiple\">\n    <div class=\"oni-dropdown-menu-inner\"\n         ms-css-width=\"menuWidth\"\n         ms-css-height=\"menuHeight\"\n         ms-widget=\"scrollbar,scrollbar-MS_OPTION_ID\" id=\"menu-MS_OPTION_ID\">\n        <div class=\"oni-scrollbar-scroller\"\n             id=\"list-MS_OPTION_ID\">\n            <div ms-repeat=\"data\" class=\"oni-dropdown-item\"\n                 ms-click-12=\"_select($index, $event)\"\n                 ms-attr-title=\"el.title||el.label\"\n                 ms-visible=\"el.toggle\"\n                 ms-hover=\"oni-state-hover: el.enable\"\n                 ms-class-1=\"oni-state-disabled:!el.enable\"\n                 ms-class-2=\"oni-state-active:isActive(el, multipleChange)\"\n                 ms-class-4=\"oni-dropdown-group:el.group\"\n                 ms-class-5=\"oni-dropdown-divider:el.group && !$first\"\n                 data-repeat-rendered=\"repeatRendered\"\n                 >{{el.label|sanitize|html}}</div>\n        </div>\n    </div>\n</div>\n";
__context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'];
__context.____MODULES['c3d66d673e82f1489bf416e19cae0c47'];

module.exports = (
function () {
    var styleReg = /^(\d+).*$/;
    var ie6 = !-[1] && !window.XMLHttpRequest;
    var widget = avalon.ui.dropdown = function (element, data, vmodels) {
            var $element = avalon(element), elemParent = element.parentNode, options = data.dropdownOptions, hasBuiltinTemplate = true,
                //标志是否通过model值构建下拉列表
                dataSource, dataModel, templates, titleTemplate, listTemplate, blurHandler, scrollHandler, resizeHandler, keepState = false;
            //将元素的属性值copy到options中
            'multiple,size'.replace(avalon.rword, function (name) {
                if (hasAttribute(element, name)) {
                    options[name] = element[name];
                }
            });
            //将元素的属性值copy到options中
            options.enable = !element.disabled;
            //读取template
            templates = options.template = options.getTemplate(template, options).replace(/MS_OPTION_ID/g, data.dropdownId).split('MS_OPTION_TEMPLATE');
            titleTemplate = templates[0];
            listTemplate = templates[1];
            dataSource = options.data.$model || options.data;
            //由于element本身存在ms-if或者内部包含ms-repeat等绑定，在抽取数据之前，先对element进行扫描
            element.removeAttribute('ms-duplex');
            avalon.scan(element, vmodels);
            //数据抽取
            dataModel = getDataFromHTML(element);
            hasBuiltinTemplate = !!dataModel.length;
            if (dataModel.length === 0) {
                dataModel = getDataFromOption(dataSource);
            }
            options.data = dataModel;
            avalon(element).css('display', 'none');
            //转换option
            _buildOptions(options);
            for (var i = 0, n = dataModel.length; i < n; i++) {
                if (dataModel[i].value == options.value) {
                    options.activeIndex = i;
                    options.currentOption = dataModel[i];
                    break;
                }
            }
            var titleNode, listNode;
            var vmodel = avalon.define(data.dropdownId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'duplexName',
                        'menuNode',
                        'dropdownNode',
                        'scrollWidget',
                        'rootElement'
                    ];
                    if (vm.multiple && vm.$hasDuplex && vm.$skipArray.indexOf('value') === -1) {
                        vm.$skipArray.push('value');
                    }
                    vm.render = function (data) {
                        if (data === void 0) {
                            return;
                        }
                        vmodel.data = getDataFromOption(data.$model || data);
                        if (vmodel.toggle) {
                            vmodel._styleFix(true);
                        }
                    };
                    vm.widgetElement = element;
                    vm.rootElement = {};
                    vm.menuWidth = 'auto';
                    //下拉列表框宽度
                    vm.menuHeight = vm.height;
                    //下拉列表框高度
                    vm.dataSource = dataSource;
                    //源节点的数据源，通过dataSource传递的值将完全模拟select
                    vm.focusClass = false;
                    vm.$init = function (continueScan) {
                        //根据multiple的类型初始化组件
                        if (vmodel.multiple) {
                            //创建菜单
                            listNode = createListNode();
                            var list = listNode.firstChild;
                            elemParent.insertBefore(listNode, element);
                            list.appendChild(element);
                        } else {
                            //如果是单选
                            var title;
                            titleNode = avalon.parseHTML(titleTemplate);
                            title = titleNode.firstChild;
                            elemParent.insertBefore(titleNode, element);
                            title.appendChild(element);
                            titleNode = title;
                            //设置title宽度
                            vmodel.titleWidth = computeTitleWidth();
                            //设置label值
                            setLabelTitle(vmodel.value);
                            //注册blur事件
                            blurHandler = avalon.bind(document.body, 'click', function (e) {
                                //判断是否点击发生在dropdown节点内部
                                //如果不在节点内部即发生了blur事件
                                if (titleNode.contains(e.target)) {
                                    vmodel._toggle();
                                    return;
                                } else if (listNode && listNode.contains(e.target)) {
                                    return;
                                }
                                if (!vmodel.__cursorInList__ && !vmodel.multiple && vmodel.toggle) {
                                    vmodel.toggle = false;
                                }
                            });
                            if (vmodel.position) {
                                //监听window的滚动及resize事件，重新定位下拉框的位置
                                scrollHandler = avalon.bind(window, 'scroll', _positionListNode);
                                resizeHandler = avalon.bind(window, 'resize', _positionListNode);
                            }
                        }
                        //如果原来的select没有子节点，那么为它添加option与optgroup
                        if (!hasBuiltinTemplate) {
                            element.appendChild(getFragmentFromData(dataModel));
                            avalon.each([
                                'multiple',
                                'size'
                            ], function (i, attr) {
                                avalon(element).attr(attr, vmodel[attr]);
                            });
                        }
                        if (!vmodel.multiple) {
                            var duplexName = (element.msData['ms-duplex'] || '').trim(), duplexModel;
                            if (duplexName && (duplexModel = avalon.getModel(duplexName, vmodels))) {
                                duplexModel[1].$watch(duplexModel[0], function (newValue) {
                                    vmodel.value = newValue;
                                });
                            }
                            vmodel.$watch('value', function (n, o) {
                                var onChange = avalon.type(vmodel.onChange) === 'function' && vmodel.onChange || false;
                                if (keepState) {
                                    keepState = false;
                                    return;
                                }
                                function valueStateKeep(stateKeep) {
                                    if (stateKeep) {
                                        keepState = true;
                                        vmodel.value = o;
                                    } else {
                                        if (duplexModel) {
                                            duplexModel[1][duplexModel[0]] = n;
                                            element.value = n;
                                        }
                                        vmodel.currentOption = setLabelTitle(n);
                                    }
                                }
                                if (onChange && onChange.call(element, n, o, vmodel, valueStateKeep) !== false || !onChange) {
                                    if (duplexModel) {
                                        duplexModel[1][duplexModel[0]] = n;
                                        element.value = n;
                                    }
                                    vmodel.currentOption = setLabelTitle(n);
                                }
                            });
                        } else {
                            vmodel.value.$watch('length', function () {
                                vmodel.multipleChange = !vmodel.multipleChange;
                                optionsSync();
                            });
                        }
                        //同步disabled或者enabled
                        var disabledAttr = element.msData['ms-disabled'], disabledModel, enabledAttr = element.msData['ms-enabled'], enabledModel;
                        if (disabledAttr && (disabledModel = avalon.getModel(disabledAttr, vmodels))) {
                            disabledModel[1].$watch(disabledModel[0], function (n) {
                                vmodel.enable = !n;
                            });
                            vmodel.enable = !disabledModel[1][disabledModel[0]];
                        }
                        if (enabledAttr && (enabledModel = avalon.getModel(enabledAttr, vmodels))) {
                            enabledModel[1].$watch(enabledModel[0], function (n) {
                                vmodel.enable = n;
                            });
                            vmodel.enable = enabledModel[1][enabledModel[0]];
                        }
                        vmodel.enable = !element.disabled;
                        //同步readOnly
                        var readOnlyAttr = vmodel.readonlyAttr, readOnlyModel;
                        if (readOnlyAttr && (readOnlyModel = avalon.getModel(readOnlyAttr, vmodels))) {
                            readOnlyModel[1].$watch(readOnlyModel[0], function (n) {
                                vmodel.readOnly = n;
                            });
                            vmodel.readOnly = readOnlyModel[1][readOnlyModel[0]];
                        }
                        //获取$source信息
                        if (vmodel.$source) {
                            if (avalon.type(vmodel.$source) === 'string') {
                                var sourceModel = avalon.getModel(vmodel.$source, vmodels);
                                sourceModel && (vmodel.$source = sourceModel[1][sourceModel[0]]);
                            } else if (!vmodel.$source.$id) {
                                vmodel.$source = null;
                            } else if (vmodel.$source.length > 0) {
                                vmodel._refresh(vmodel.$source.length);
                            }
                            //对data的改变做监听，由于无法检测到对每一项的改变，检测数据项长度的改变
                            vmodel.$source && vmodel.$source.$watch && vmodel.$source.$watch('length', function (n) {
                                vmodel._refresh(n);
                            });
                        }
                        avalon.scan(element.parentNode, [vmodel].concat(vmodels));
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('\u8BF7\u5C3D\u5FEB\u5347\u5230avalon1.3.7+');
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                        vmodel.multiple && optionsSync();
                    };
                    vm.repeatRendered = function () {
                        if (vmodel.multiple) {
                            avalon.vmodels['scrollbar-' + vmodel.$id].update();
                        }
                    };
                    /**
             * @interface 当组件移出DOM树时,系统自动调用的销毁函数
             */
                    vm.$remove = function () {
                        if (blurHandler) {
                            avalon.unbind(window, 'click', blurHandler);
                        }
                        if (scrollHandler) {
                            avalon.unbind(window, 'scroll', scrollHandler);
                        }
                        if (resizeHandler) {
                            avalon.unbind(window, 'resize', resizeHandler);
                        }
                        vmodel.toggle = false;
                        listNode && vmodel.container && vmodel.container.contains(listNode) && vmodel.container.removeChild(listNode);
                        avalon.log('dropdown $remove');
                    };
                    vm._select = function (index, event) {
                        var option = vmodel.data[index].$model;
                        if (option && option.enable && !option.group) {
                            var oldValue = vmodel.value;
                            //根据multiple区分对待, 多选时可以为空值
                            if (vmodel.multiple) {
                                index = vmodel.value.indexOf(option.value);
                                if (index > -1) {
                                    vmodel.value.splice(index, 1);
                                } else {
                                    vmodel.value.push(option.value);
                                }
                            } else {
                                vmodel.value = option.value;
                            }
                            // vmodel.currentOption = option;
                            vmodel.toggle = false;
                            if (avalon.type(vmodel.onSelect) === 'function') {
                                vmodel.onSelect.call(element, event, vmodel.value, oldValue, vmodel);
                            }
                            vmodel.activeIndex = index;
                        }
                    };
                    /**
             *
             * @param len 新数据长度
             * @private
             */
                    vm._refresh = function (len) {
                        vmodel.data.clear();
                        vmodel.label = '';
                        vmodel.__cursorInList__ = false;
                        if (len > 0) {
                            //当data改变时，解锁滚动条
                            vmodel._disabledScrollbar(false);
                            vmodel.data.pushArray(getDataFromOption(vmodel.$source.$model || vmodel.$source));
                            var option;
                            //当data改变时，尝试使用之前的value对label和title进行赋值，如果失败，使用data第一项
                            if (!(option = setLabelTitle(vmodel.value))) {
                                vmodel.currentOption = vmodel.data[0].$model;
                                vmodel.activeIndex = 0;
                                setLabelTitle(vmodel.value = vmodel.data[0].value);
                            } else {
                                vmodel.activeIndex = vmodel.data.$model.indexOf(option);
                            }
                            if (vmodel.menuNode) {
                                vmodel._styleFix(true);
                            }
                        }
                    };
                    vm._titleenter = function () {
                        if (vmodel.hoverAutoShow) {
                            vmodel._toggle()    // vmodel.toggle = true
;
                        }
                    };
                    vm._titleleave = function () {
                        if (vmodel.hoverAutoShow) {
                            vmodel.toggle = false;
                        }
                    };
                    vm._keydown = function (event) {
                        if (vmodel.keyboardEvent === false) {
                            return;
                        }
                        //如果是单选下拉框，可以通过键盘移动
                        if (!vmodel.multiple) {
                            var index = vmodel.activeIndex || 0, oldValue = vmodel.value;
                            //区分上下箭头和回车
                            switch (event.keyCode) {
                            case 9:
                            // tab
                            case 27:
                                // escape
                                event.preventDefault();
                                break;
                            case 13:
                                vmodel._select(index, event);
                                break;
                            case 38:
                            case 63233:
                                //safari 向上
                                event.preventDefault();
                                index = getEnableOption(vmodel.data, index);
                                if (index === null) {
                                    return;
                                }
                                vmodel.value = vmodel.data[index].value;
                                vmodel.activeIndex = index;
                                vmodel.scrollTo(index);
                                if (avalon.type(vmodel.onSelect) === 'function') {
                                    vmodel.onSelect.call(element, event, vmodel.value, oldValue, vmodel);
                                }
                                break;
                            case 40:
                            case 63235:
                                //safari 向下
                                event.preventDefault();
                                index = getEnableOption(vmodel.data, index, true);
                                if (index === null) {
                                    return;
                                }
                                vmodel.value = vmodel.data[index].value;
                                vmodel.activeIndex = index;
                                vmodel.scrollTo(index);
                                if (avalon.type(vmodel.onSelect) === 'function') {
                                    vmodel.onSelect.call(element, event, vmodel.value, oldValue, vmodel);
                                }
                                break;
                            }
                        }
                    };
                    //下拉列表的显示依赖toggle值，该函数用来处理下拉列表的初始化，定位
                    vm._toggle = function (b) {
                        if (vmodel.data.length === 0 && !vmodel.realTimeData || !vmodel.enable || vmodel.readOnly) {
                            vmodel.toggle = false;
                            return;
                        }
                        //为了防止显示时调整高度造成的抖动，将节点初始化放在改变toggle值之前
                        if (!listNode) {
                            //只有单选下拉框才存在显示隐藏的情况
                            var list;
                            listNode = createListNode();
                            list = listNode.firstChild;
                            vmodel.container.appendChild(listNode);
                            listNode = list;
                            vm.rootElement = list;
                            avalon.scan(list, [vmodel].concat(vmodels));
                            vmodel.menuNode = document.getElementById('menu-' + vmodel.$id);
                            //下拉列表框内层容器 （包裹滚动条部分的容器）
                            vmodel.dropdownNode = document.getElementById('list-' + vmodel.$id)    //下拉列表框内容（有滚动条的部分）
;
                        }
                        //如果参数b不为布尔值，对toggle值进行取反
                        if (typeof b !== 'boolean') {
                            vmodel.toggle = !vmodel.toggle;
                            return;
                        }
                        if (!b) {
                            avalon.type(vmodel.onHide) === 'function' && vmodel.onHide.call(element, listNode, vmodel);
                        } else {
                            var firstItemIndex, selectedItemIndex, value = vmodel.value;
                            if (avalon.type(value) !== 'array') {
                                value = [value];
                            }
                            //计算activeIndex的值
                            if (vmodel.activeIndex == null) {
                                avalon.each(vmodel.data, function (i, item) {
                                    if (firstItemIndex === void 0 && item.enable) {
                                        firstItemIndex = i;
                                    }
                                    if (item.value === value[0]) {
                                        selectedItemIndex = i;
                                        return false;
                                    }
                                    return true;
                                });
                                if (!selectedItemIndex) {
                                    selectedItemIndex = firstItemIndex;
                                }
                                vmodel.activeIndex = selectedItemIndex || 0;
                            }
                            vmodel.scrollWidget = avalon.vmodels['scrollbar-' + vmodel.$id];
                            vmodel._styleFix();
                            vmodel._position();
                            if (avalon.type(vmodel.onShow) === 'function') {
                                vmodel.onShow.call(element, listNode, vmodel);
                            }
                        }
                    };
                    vm.$watch('toggle', function (b) {
                        vmodel.focusClass = b;
                        vmodel._toggle(b);
                    });
                    vm.toggle = false;
                    vm._position = function () {
                        var $titleNode = avalon(titleNode);
                        //计算浮层当前位置，对其进行定位，默认定位正下方
                        //获取title元素的尺寸及位置
                        var offset = $titleNode.offset(), outerHeight = $titleNode.outerHeight(true), $listNode = avalon(listNode), $sourceNode = avalon(titleNode.firstChild), listHeight = $listNode.height(), $window = avalon(window), css = {}, offsetParent = listNode.offsetParent, $offsetParent = avalon(offsetParent);
                        while ($sourceNode.element && $sourceNode.element.nodeType != 1) {
                            $sourceNode = avalon($sourceNode.element.nextSibling);
                        }
                        //计算浮层的位置
                        if (options.position && offset.top + outerHeight + listHeight > $window.scrollTop() + $window.height() && offset.top - listHeight > $window.scrollTop()) {
                            css.top = offset.top - listHeight;
                        } else {
                            css.top = offset.top + outerHeight - $sourceNode.css('borderBottomWidth').replace(styleReg, '$1');
                        }
                        if (offsetParent && (offsetParent.tagName !== 'BODY' && offsetParent.tagName !== 'HTML')) {
                            //修正由于边框带来的重叠样式
                            css.top = css.top - $offsetParent.offset().top + listNode.offsetParent.scrollTop;
                            css.left = offset.left - $offsetParent.offset().left + listNode.offsetParent.scrollLeft;
                        } else {
                            //修正由于边框带来的重叠样式
                            css.left = offset.left;
                        }
                        //显示浮层
                        $listNode.css(css);
                    };
                    //是否当前鼠标在list区域
                    vm.__cursorInList__ = false;
                    //单选下拉框在失去焦点时会收起
                    vm._listenter = function () {
                        vmodel.__cursorInList__ = true;
                        if (vmodel.hoverAutoShow) {
                            vmodel.toggle = true;
                        }
                    };
                    vm._listleave = function () {
                        vmodel.__cursorInList__ = false;
                        if (vmodel.hoverAutoShow) {
                            vmodel.toggle = false;
                        }
                    };
                    vm._blur = function () {
                        if (!vmodel.__cursorInList__ && !vmodel.multiple && vmodel.toggle) {
                            vmodel.toggle = false;
                        }
                    };
                    /**
             * @interface
             * @param newValue 设置控件的值，需要注意的是dropdown设置了multiple属性之后，值是数组，未设置multiple属性的时候，可以接受字符串，数字，布尔值；未设置该值时，效果是返回当前控件的值
             * @returns vmodel.value 控件当前的值
             */
                    vm.val = function (newValue) {
                        if (typeof newValue !== 'undefined') {
                            if (avalon.type(newValue) !== 'array') {
                                newValue = [newValue];
                            }
                            vmodel.value = newValue;
                        }
                        return vmodel.value;
                    };
                    vm.isActive = function (el) {
                        var value = el.value, enable = el.enable, group = el.group;
                        if (vmodel.multiple) {
                            return vmodel.value.indexOf(value) > -1 && enable && !group;
                        } else {
                            return vmodel.value === value && enable && !group;
                        }
                    };
                    //当下拉列表中的项目发生改变时，调用该函数修正显示，顺序是修正下拉框高宽 --> 滚动条更新显示 --> 定位下拉框
                    vm._styleFix = function (resetHeight) {
                        var MAX_HEIGHT = options.height || 200, $menu = avalon(vmodel.menuNode), height = '';
                        if (resetHeight) {
                            vmodel.menuHeight = '';
                            avalon(vmodel.dropdownNode).css({ 'height': '' });
                        }
                        height = vmodel.dropdownNode.scrollHeight;
                        vmodel.menuWidth = !ie6 ? vmodel.listWidth - $menu.css('borderLeftWidth').replace(styleReg, '$1') - $menu.css('borderRightWidth').replace(styleReg, '$1') : vmodel.listWidth;
                        if (height > MAX_HEIGHT) {
                            vmodel._disabledScrollbar(false);
                            height = MAX_HEIGHT;
                            avalon(vmodel.dropdownNode).css({ 'width': vmodel.menuWidth - vmodel.scrollWidget.getBars()[0].width() });
                        } else {
                            vmodel._disabledScrollbar(true);
                            avalon(vmodel.dropdownNode).css({ 'width': vmodel.menuWidth });
                        }
                        vmodel.menuHeight = height;
                        vmodel.updateScrollbar();
                        vmodel.scrollTo(vmodel.activeIndex);
                    };
                    //利用scrollbar的样式改变修正父节点的样式
                    vm.updateScrollbar = function () {
                        vmodel.scrollWidget.update();
                    };
                    //通过当前的activeIndex，更新scrollbar的滚动位置
                    vm.scrollTo = function (activeIndex) {
                        if (!vmodel.dropdownNode)
                            return;
                        //计算是否需要滚动
                        var nodes = siblings(vmodel.dropdownNode.firstChild), $activeNode = avalon(nodes[activeIndex]), menuHeight = vmodel.menuHeight, nodeTop = nodes.length ? $activeNode.position().top - avalon(nodes[0]).position().top : 0, nodeHeight = nodes.length ? $activeNode.height() : 0, scrollTop = vmodel.dropdownNode.scrollTop;
                        if (nodeTop > scrollTop + menuHeight - nodeHeight || nodeTop + nodeHeight < scrollTop) {
                            vmodel.scrollWidget.scrollTo(0, nodeTop + nodeHeight - menuHeight);
                        }
                    };
                    //禁用滚动条，当下拉列表的高度小于最大高度时，只显示当前高度，需要对滚动条做禁用
                    vm._disabledScrollbar = function (b) {
                        vmodel.scrollWidget && (vmodel.scrollWidget.disabled = !!b);
                    };
                });
            vmodel.$watch('enable', function (n) {
                if (!n) {
                    vmodel.toggle = false;
                }
            });
            vmodel.$watch('readOnly', function (n) {
                if (!!n) {
                    vmodel.toggle = false;
                }
            });
            //在multiple模式下同步select的值
            //http://stackoverflow.com/questions/16582901/javascript-jquery-set-values-selection-in-a-multiple-select
            function optionsSync() {
                avalon.each(element.getElementsByTagName('option'), function (i, option) {
                    if (vmodel.value.$model.indexOf(option.value) > -1 || vmodel.value.$model.indexOf(parseData(option.value)) > -1) {
                        try {
                            option.selected = true;
                        } catch (e) {
                            avalon(option).attr('selected', 'selected');
                        }
                    } else {
                        try {
                            option.selected = false;
                        } catch (e) {
                            option.removeAttribute('selected');
                        }
                    }
                });
            }
            function _buildOptions(opt) {
                //为options添加value与duplexName
                //如果原来的select元素绑定了ms-duplex，那么取得其值作value
                //如果没有，则先从上层VM的配置对象中取，再没有则从内置模板里抽取
                var duplexName = (element.msData['ms-duplex'] || '').trim();
                var duplexModel;
                if (duplexName && (duplexModel = avalon.getModel(duplexName, vmodels))) {
                    opt.value = duplexModel[1][duplexModel[0]];
                    opt.$hasDuplex = true;
                } else if (!hasBuiltinTemplate) {
                    if (!Array.isArray(opt.value)) {
                        opt.value = [opt.value || ''];
                    }
                } else {
                    var values = [];
                    Array.prototype.forEach.call(element.options, function (option) {
                        if (option.selected) {
                            values.push(parseData(option.value));
                        }
                    });
                    opt.value = values;
                }
                if (!opt.multiple) {
                    if (Array.isArray(opt.value)) {
                        opt.value = opt.value[0] !== void 0 ? opt.value[0] : '';
                    }
                    //尝试在当前的data中查找value对应的选项，如果没有，将value设置为data中的option第一项的value
                    var option = opt.data.filter(function (item) {
                            return item.value === opt.value && !item.group;
                        }), options = opt.data.filter(function (item) {
                            return !item.group;
                        });
                    if (option.length === 0 && options.length > 0) {
                        opt.value = options[0].value;
                        //如果存在duplex，同步该值
                        if (duplexModel) {
                            duplexModel[1][duplexModel[0]] = opt.value;
                        }
                    }
                }
                //处理data-duplex-changed参数
                var changedCallbackName = $element.attr('data-duplex-changed'), changedCallbackModel;
                //回调函数
                if (changedCallbackName && (changedCallbackModel = avalon.getModel(changedCallbackName, vmodels))) {
                    opt.changedCallback = changedCallbackModel[1][changedCallbackModel[0]];
                }
                opt.duplexName = duplexName;
                //处理container
                var docBody = document.body, container = opt.container;
                // container必须是dom tree中某个元素节点对象或者元素的id，默认将dialog添加到body元素
                opt.container = (avalon.type(container) === 'object' && container.nodeType === 1 && docBody.contains(container) ? container : document.getElementById(container)) || docBody;
            }
            /**
         * 生成下拉框节点
         * @returns {*}
         */
            function createListNode() {
                return avalon.parseHTML(listTemplate);
            }
            //设置label以及title
            function setLabelTitle(value) {
                var option = vmodel.data.$model.filter(function (item) {
                        return item.value === value;
                    });
                option = option.length > 0 ? option[0] : null;
                if (!option) {
                    avalon.log('[log] avalon.dropdown \u8BBE\u7F6Elabel\u51FA\u9519');
                } else {
                    vmodel.label = option.label;
                    vmodel.title = option.title || option.label || '';
                }
                return option;
            }
            //计算title的宽度
            function computeTitleWidth() {
                var title = document.getElementById('title-' + vmodel.$id), $title = avalon(title);
                return vmodel.width - $title.css('paddingLeft').replace(styleReg, '$1') - $title.css('paddingRight').replace(styleReg, '$1');
            }
            //定位listNode
            function _positionListNode() {
                if (!vmodel.multiple && listNode) {
                    vmodel._position();
                }
            }
            return vmodel;
        };
    widget.version = '1.0';
    widget.defaults = {
        realTimeData: false,
        container: null,
        //@config 放置列表的容器
        width: 200,
        //@config 自定义宽度
        listWidth: 200,
        //@config 自定义下拉列表的宽度
        titleWidth: 0,
        //@config title部分宽度
        height: 200,
        //@config 下拉列表的高度
        enable: true,
        //@config 组件是否可用
        readOnly: false,
        //@config 组件是否只读
        hoverAutoShow: false,
        //@config 是否开启鼠标移入打开下拉列表鼠标移出关闭下拉列表功能
        readonlyAttr: null,
        //@config readonly依赖的属性
        currentOption: null,
        //@config 组件当前的选项
        data: [],
        //@config 下拉列表显示的数据模型
        $source: null,
        //@config 下拉列表的数据源
        textFiled: 'text',
        //@config 模型数据项中对应显示text的字段,可以传function，根据数据源对text值进行格式化
        valueField: 'value',
        //@config 模型数据项中对应value的字段
        value: [],
        //@config 设置组件的初始值
        label: '',
        //@config 设置组件的提示文案，可以是一个字符串，也可以是一个对象
        multiple: false,
        //@config 是否为多选模式
        listClass: '',
        //@config 列表添加自定义className来控制样式
        title: '',
        titleClass: '',
        //@config title添加自定义className来控制样式
        activeIndex: null,
        size: 1,
        menuNode: null,
        dropdownNode: null,
        scrollWidget: null,
        position: true,
        //@config 是否自动定位下拉列表
        onSelect: null,
        //@config 点击选项时的回调
        onShow: null,
        //@config 下拉框展示的回调函数
        onHide: null,
        //@config 下拉框隐藏的回调函数
        onChange: null,
        //@config value改变时的回调函数
        $hasDuplex: false,
        multipleChange: false,
        keyboardEvent: true,
        //@config 是否支持键盘事件
        /**
         * @config 模板函数,方便用户自定义模板
         * @param str {String} 默认模板
         * @param opts {Object} VM
         * @returns {String} 新模板
         */
        getTemplate: function (str, options) {
            return str;
        },
        onInit: avalon.noop
    };
    //用于将字符串中的值转换成具体值
    function parseData(data) {
        try {
            data = data === 'true' ? true : data === 'false' ? false : data === 'null' ? null : +data + '' === data ? +data : data;
        } catch (e) {
        }
        return data;
    }
    //根据dataSource构建数据结构
    //从VM的配置对象提取数据源, dataSource为配置项的data数组，但它不能直接使用，需要转换一下
    //它的每一个对象代表option或optGroup，
    //如果是option则包含label, enable, value
    //如果是optGroup则包含label, enable, options(options则包含上面的option)
    //每个对象中的enable如果不是布尔，则默认为true; group与parent则框架自动添加
    function getDataFromOption(data, arr, parent) {
        var ret = arr || [];
        parent = parent || null;
        for (var i = 0, el; el = data[i++];) {
            if (Array.isArray(el.options)) {
                ret.push({
                    label: el.label,
                    value: el.value,
                    enable: ensureBool(el.enable, true),
                    group: true,
                    parent: parent,
                    toggle: true
                });
                getDataFromOption(el.options, ret, el);
            } else {
                if (typeof el === 'string') {
                    el = {
                        label: el,
                        value: el,
                        title: el
                    };
                }
                ret.push({
                    label: el.label,
                    value: el.value,
                    title: el.title,
                    enable: ensureBool(parent && parent.enable, true) && ensureBool(el.enable, true),
                    group: false,
                    parent: parent,
                    data: el,
                    //只有在dataModel的模式下有效
                    toggle: true
                });
            }
        }
        return ret;
    }
    function getFragmentFromData(data) {
        var ret = document.createDocumentFragment(), parent, node;
        for (var i = 0, el; el = data[i++];) {
            if (el.group) {
                node = document.createElement('optgroup');
                node.label = el.label;
                node.disabled = !el.enable;
                ret.appendChild(node);
                parent = node;
            } else {
                node = document.createElement('option');
                node.text = el.label;
                node.value = el.value;
                node.disabled = !el.enable;
                if (el.parent && parent) {
                    parent.appendChild(node);
                } else {
                    ret.appendChild(node);
                }
            }
        }
        return ret;
    }
    function ensureBool(value, defaultValue) {
        return typeof value === 'boolean' ? value : defaultValue;
    }
    //从页面的模板提取数据源, option元素的value会进一步被处理
    //label： option或optgroup元素显示的文本
    //value: 其value值，没有取innerHTML
    //enable: 是否可用
    //group: 对应的元素是否为optgroup
    //parent: 是否位于分组内，是则为对应的对象
    function getDataFromHTML(select, arr, parent) {
        var ret = arr || [];
        var elems = select.children;
        parent = parent || null;
        for (var i = 0, el; el = elems[i++];) {
            if (el.nodeType === 1) {
                //过滤注释节点
                if (el.tagName === 'OPTGROUP') {
                    parent = {
                        label: el.label,
                        value: '',
                        enable: !el.disabled,
                        group: true,
                        //group不能添加ui-state-active
                        parent: false,
                        toggle: true
                    };
                    ret.push(parent);
                    getDataFromHTML(el, ret, parent);
                } else if (el.tagName === 'OPTION') {
                    ret.push({
                        label: el.label.trim() || el.text.trim() || el.value.trim(),
                        //IE9-10有BUG，没有进行trim操作
                        title: el.title.trim(),
                        value: parseData(el.value.trim() || el.text.trim()),
                        enable: ensureBool(parent && parent.enable, true) && !el.disabled,
                        group: false,
                        parent: parent,
                        toggle: true
                    });
                }
            }
        }
        return ret;
    }
    /**
     * 在用户使用键盘上下箭头选择选项时，需要跳过被禁用的项，即向上或者向下找到非禁用项
     * @param data 用来选择的数据项
     * @param index 当前index
     * @param direction {Boolean} 方向，true为下，false为上，默认为上
     * @return ret 使用的项在数组中的下标
     */
    function getEnableOption(data, index, direction) {
        var size = data.size(), left = [], right = [], dataItem = {}, i, ret;
        //将data用index分成两段
        //当向上选择时，选择从左段的队尾到右段的队头
        //当向下选择时，选择从右端的对头到左段的队尾
        for (i = 0; i < index; i++) {
            dataItem = data[i];
            if (dataItem.enable && !dataItem.group && dataItem.toggle) {
                left.push(i);
            }
        }
        for (i = index + 1; i < size; i++) {
            dataItem = data[i];
            if (dataItem.enable && !dataItem.group && dataItem.toggle) {
                right.push(i);
            }
        }
        if (left.length === 0 && right.length === 0) {
            ret = null;
        } else if (direction) {
            ret = right.length > 0 ? right.shift() : left.shift();
        } else {
            ret = left.length > 0 ? left.pop() : right.pop();
        }
        return ret;
    }
    var hasAttribute = document.documentElement.hasAttribute ? function (el, attr) {
            return el.hasAttribute(attr);
        } : function (el, attr) {
            //IE67
            var outer = el.outerHTML, part = outer.slice(0, outer.search(/\/?['"]?>(?![^<]*<['"])/));
            return new RegExp('\\s' + attr + '\\b', 'i').test(part);
        };
    return avalon;
    /**
     * 获取元素节点的所有兄弟节点
     * @param n
     * @returns {Array}
     */
    function siblings(n) {
        var r = [];
        for (; n; n = n.nextSibling) {
            if (n.nodeType === 1) {
                r.push(n);
            }
        }
        return r;
    }
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "90b2de0bf947d1814b382738513983f5" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "784f114d9a1149d4a292ba1d604ab9b2" , 
        filename : "avalon.slider.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['36e422bfb7dcb2fd648a019317e8a224'],
sourceHTML = "<div class=\"oni-slider oni-widget oni-corner-all\"\n     ms-class-1 = \"oni-slider-horizontal: orientation==='horizontal'\"\n     ms-class-2 = \"oni-slider-vertical: orientation !== 'horizontal'\"\n     ms-class-oni-state-disabled=\"disabled\"> \n    <div class=\"oni-slider-range oni-widget-header oni-corner-all\" \n         ms-class-1 = \"oni-slider-range-min:range==='min'\"\n         ms-class-2 = \"oni-slider-range-max:range==='max'\"\n         ms-css-MS_OPTION_WIDTHORHEIGHT = \"{{range === 'max' ? 100-percent : percent}}%\"\n         ms-css-MS_OPTION_LEFTORBOTTOM = \"{{ $twohandlebars ? percent0 : 'auto'}}%\"\n         ms-if = \"range\"\n         style=\"width: 100%;\">\n    </div>\n    <b  class=\"oni-slider-handle  oni-corner-all hander___flag\"\n        ms-css-MS_OPTION_LEFTORBOTTOM = \"{{percent}}%\"\n        ms-data-axis = \"$axis\"\n        ms-draggable\n        data-draggable-start=\"dragstart\" \n        data-draggable-stop=\"dragend\" \n        data-draggable-drag=\"drag\" \n        data-draggable-containment=\"parent\" \n        ms-hover=\"oni-state-hover\"\n        ms-if = \"!$twohandlebars\"\n        ></b>\n    <b  class=\"oni-slider-handle  oni-corner-all\"\n        ms-css-MS_OPTION_LEFTORBOTTOM = \"{{percent0}}%\"\n        ms-data-axis = \"$axis\"\n        ms-draggable\n        data-draggable-start=\"dragstart\" \n        data-draggable-stop=\"dragend\" \n        data-draggable-drag=\"drag\" \n        data-draggable-containment=\"parent\" \n        ms-hover=\"oni-state-hover\"\n        ms-if = \"$twohandlebars\"\n        ></b>\n    <b  class=\"oni-slider-handle  oni-corner-all\"\n        ms-css-MS_OPTION_LEFTORBOTTOM = \"{{percent1}}%\"\n        ms-data-axis = \"$axis\"\n        ms-draggable\n        data-draggable-start=\"dragstart\" \n        data-draggable-stop=\"dragend\" \n        data-draggable-drag=\"drag\" \n        data-draggable-containment=\"parent\" \n        ms-hover=\"oni-state-hover\"\n     \n        ms-if = \"$twohandlebars\"\n        ></b>\n</div>";
__context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'];

module.exports = (
function () {
    /**
     * @global Handlers ： 保存页面上所有滑动手柄
     * @global Index :点中手柄在Handlers中的索引，或滑动手柄在handlers中的索引 
     * @gloabal focusElement: 页面上点中的手柄元素的引用，当按下方向键时，滑动作用域此元素
     **/
    var Handlers = [], Index = 0, FocusElement, template = sourceHTML;
    var widget = avalon.ui['slider'] = function (element, data, vmodels) {
            var $element = avalon(element);
            var options = data.sliderOptions;
            var isHorizontal = options.orientation === 'horizontal';
            //将整个slider划分为N等分, 比如100, 227
            var valueMin = options.min;
            var valueMax = options.max;
            var oRange = options.range;
            //true min max， 默认为false
            var values = options.values;
            var twohandlebars = oRange === true;
            var value = Number(options.value);
            //第几等份
            if (isNaN(value)) {
                var valVM = avalon.getModel(options.value, vmodels);
                if (valVM) {
                    value = valVM[1][valVM[0]];
                }
            }
            options.template = options.getTemplate(template, options);
            // 固定最小的一边
            if (oRange === 'min' && values) {
                value = values[0];
            } else if (oRange === 'max' && values) {
                // 固定最大的一边
                value = values[1];
            }
            // 如果没有配置value和values,且range是min或者max，重置value
            if (!value && oRange === 'min' && !values) {
                value = valueMin || value;
            } else if (!value && oRange === 'max' && !values) {
                value = valueMax || value;
            }
            if (options.step !== 1 && !/\D/.test(options.step)) {
                value = correctValue(value);
            }
            // 如果滑动块有双手柄，重置values
            if (twohandlebars) {
                if (Array.isArray(values)) {
                    values = values.length === 1 ? [
                        values[0],
                        values[0]
                    ] : values.concat();
                } else {
                    values = [
                        valueMin,
                        valueMax
                    ];
                }
            }
            // 修正模板
            var sliderHTML = options.template.replace(/MS_OPTION_WIDTHORHEIGHT/g, isHorizontal ? 'width' : 'height').replace(/MS_OPTION_LEFTORBOTTOM/g, isHorizontal ? 'left' : 'bottom');
            // handlers保存滑动块上的手柄，域Handlers进行区分
            var slider = avalon.parseHTML(sliderHTML).firstChild, handlers = [];
            element.parentNode.insertBefore(slider, element.nextSibling);
            $element.addClass('oni-helper-hidden-accessible');
            function value2Percent(val) {
                // 将value值转换为百分比
                if (val < valueMin) {
                    val = valueMin;
                }
                if (val > valueMax) {
                    val = valueMax;
                }
                return parseFloat(((val - valueMin) / (valueMax - valueMin) * 100).toFixed(5));
            }
            function percent2Value(percent) {
                //0~1
                var val = (valueMax - valueMin) * percent + valueMin;
                val = correctValue(val);
                return parseFloat(val.toFixed(3));
            }
            function correctValue(val) {
                var step = options.step > 0 ? options.step : 1;
                var valModStep = (val - valueMin) % step;
                var n = (val - valueMin) / step;
                val = valueMin + (valModStep * 2 >= step ? step * Math.ceil(n) : step * Math.floor(n));
                return val;
            }
            var vmodel = avalon.define(data.sliderId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'template',
                        'rootElement',
                        'widgetElement',
                        'step',
                        '_dragEnd'
                    ];
                    vm.rootElement = slider;
                    vm.widgetElement = element;
                    vm.step = options.step > 0 ? options.step : 1;
                    vm.disabled = element.disabled;
                    vm.percent = twohandlebars ? value2Percent(values[1] - values[0] + valueMin) : value2Percent(value);
                    vm.percent0 = twohandlebars ? value2Percent(values[0]) : 0;
                    vm.percent1 = twohandlebars ? value2Percent(values[1]) : 0;
                    vm.value = twohandlebars ? values.join() : value;
                    vm.values = values;
                    vm.$axis = isHorizontal ? 'x' : 'y';
                    vm.$valueMin = valueMin;
                    vm.$valueMax = valueMax;
                    vm.$twohandlebars = twohandlebars;
                    vm.$percent2Value = percent2Value;
                    vm.$pixelTotal = 0;
                    vm._dragEnd = false;
                    vm.dragstart = function (event, data) {
                        vmodel.$pixelTotal = isHorizontal ? slider.offsetWidth : slider.offsetHeight;
                        Handlers = handlers;
                        // 很关键，保证点击的手柄始终在Handlers中，之后就可以通过键盘方向键进行操作
                        data.started = !vmodel.disabled;
                        data.dragX = data.dragY = false;
                        Index = handlers.indexOf(data.element);
                        data.$element.addClass('oni-state-active');
                        options.onDragStart.call(null, event, data);
                    };
                    vm.dragend = function (event, data, keyVal) {
                        data.$element.removeClass('oni-state-active');
                        // dragCaculate(event, data, keyVal)
                        options.onDragEnd.call(null, event, data);
                        vmodel._dragEnd = false;
                    };
                    vm.drag = function (event, data, keyVal) {
                        dragCaculate(event, data, keyVal);
                        options.onDrag.call(null, vmodel, data);
                        vmodel._dragEnd = true;
                    };
                    vm.$init = function () {
                        var a = slider.getElementsByTagName('b');
                        for (var i = 0, el; el = a[i++];) {
                            el.sliderModel = vmodel;
                            if (!twohandlebars && avalon(el).hasClass('hander___flag')) {
                                handlers.push(el);
                                avalon(el).removeClass('hander___flag');
                                break;
                            } else if (twohandlebars && !avalon(el).hasClass('hander___flag')) {
                                handlers.push(el);
                            }
                        }
                        avalon(element).css({
                            display: 'none',
                            height: 0,
                            width: 0,
                            padding: 0
                        });
                        avalon(slider).css('width', vmodel.width);
                        avalon.scan(slider, [vmodel].concat(vmodels));
                        if (typeof options.onInit === 'function') {
                            //vmodels是不包括vmodel的
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    vm.$remove = function () {
                        slider.innerHTML = slider.textContent = '';
                        slider.parentNode.removeChild(slider);
                    };
                });
            vmodel.$watch('value', function (val) {
                val = correctValue(Number(val) || 0);
                if (!val || val < Number(vmodel.min)) {
                    val = 0;
                } else if (val > Number(vmodel.max)) {
                    val = vmodel.max;
                }
                vmodel.value = val;
                vmodel.percent = value2Percent(val);
                if (!vmodel._dragEnd) {
                    options.onDragEnd.call(null, data);
                }
            });
            function dragCaculate(event, data, keyVal) {
                if (isFinite(keyVal)) {
                    var val = keyVal;
                } else {
                    var prop = isHorizontal ? 'left' : 'top';
                    var pixelMouse = data[prop] + parseFloat(data.$element.css('border-top-width'));
                    //如果是垂直时,往上拖,值就越大
                    var percent = pixelMouse / vmodel.$pixelTotal;
                    //求出当前handler在slider的位置
                    if (!isHorizontal) {
                        // 垂直滑块，往上拖动时pixelMouse变小，下面才是真正的percent，所以需要调整percent
                        percent = Math.abs(1 - percent);
                    }
                    if (percent > 0.999) {
                        percent = 1;
                    }
                    if (percent < 0.001) {
                        percent = 0;
                    }
                    val = percent2Value(percent);
                }
                if (twohandlebars) {
                    //水平时，小的0在左边，大的1在右边，垂直时，小的0在下边，大的1在上边
                    if (Index === 0) {
                        var check = vmodel.values[1];
                        if (val > check) {
                            val = check;
                        }
                    } else {
                        check = vmodel.values[0];
                        if (val < check) {
                            val = check;
                        }
                    }
                    vmodel.values[Index] = val;
                    vmodel['percent' + Index] = value2Percent(val);
                    vmodel.value = vmodel.values.join();
                    vmodel.percent = value2Percent(vmodel.values[1] - vmodel.values[0] + valueMin);
                } else {
                    vmodel.value = val;
                    vmodel.percent = value2Percent(val);
                }
            }
            return vmodel;
        };
    widget.defaults = {
        max: 100,
        //@config 组件的最大值
        min: 0,
        //@config 组件的最小值
        width: -1,
        orientation: 'horizontal',
        //@config 组件是水平拖动还是垂直拖动，垂直是“vertical”
        /**
         * @config 滑块是否显示滑动范围，配置值可以是true、min、max
            <p>true: 显示滑动范围</p>
            <p>min: 滑块值最小的一端固定</p>
            <p>max: 滑块值最大的一端固定</p>
         */
        range: false,
        step: 1,
        //@config 滑块滑动的步值
        value: 0,
        //@config 滑块的当前值，当range为true时，value是滑块范围表示的两个值，以“,”分隔
        values: null,
        //@config 当range为true时，values数组需要有两个值，表示滑块范围
        disabled: false,
        //@config 是否禁用滑块, 设为true时滑块禁用
        /**
         * @config {Function} 滑动开始的回调
         * @param event {Object} 事件对象
         * @param data {Object} 滑动的数据信息
         */
        onDragStart: avalon.noop,
        /**
         * @config {Function} 滑动时的回调
         * @param vmodel {Object} 组件对应的Vmodel
         * @param data {Object} 滑动的数据信息
         */
        onDrag: avalon.noop,
        /**
         * @config {Function} 滑动结束时的回调
         * @param data {Object} 滑动的数据信息
         */
        onDragEnd: avalon.noop,
        getTemplate: function (str, options) {
            return str;
        }
    };
    avalon(document).bind('click', function (e) {
        // 当点击slider之外的区域取消选中状态
        e.stopPropagation();
        var el = e.target;
        var Index = Handlers.indexOf(el);
        if (Index !== -1) {
            if (FocusElement) {
                FocusElement.removeClass('oni-state-focus');
            }
            FocusElement = avalon(el).addClass('oni-state-focus');
        } else if (FocusElement) {
            FocusElement.removeClass('oni-state-focus');
            FocusElement = null;
        }
    });
    avalon(document).bind('keydown', function (e) {
        // 当选中某个手柄之后通过键盘上的方向键控制手柄的slider
        // e.preventDefault();
        if (FocusElement) {
            var vmodel = FocusElement[0].sliderModel;
            var percent = Handlers.length == 1 ? vmodel.percent : vmodel['percent' + Index];
            var val = vmodel.$percent2Value(percent / 100), keyVal;
            switch (e.which) {
            case 34:
            // pageDown
            case 39:
            // right
            case 38:
                // down
                keyVal = Math.min(val + 1, vmodel.$valueMax);
                break;
            case 33:
            // pageUp
            case 37:
            // left
            case 40:
                // up
                keyVal = Math.max(val - 1, vmodel.$valueMin);
                break;
            case 36:
                // home
                keyVal = vmodel.$valueMin;
                break;
            case 35:
                // end
                keyVal = vmodel.$valueMax;
                break;
            }
            if (isFinite(keyVal)) {
                vmodel.drag(e, {}, keyVal);
            }
        }
    });
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "784f114d9a1149d4a292ba1d604ab9b2" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "46f100b533906080570a5a161534f03d" , 
        filename : "avalon.datepicker.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'],
holidayDate = __context.____MODULES['f7394bc2afc8a77d01974bff583ff7be'],
sourceHTML = "<div class=\"oni-datepicker\"\n     ms-visible=\"toggle\"\n     ms-class=\"oni-datepicker-multiple:numberOfMonths!==1\">\n    <div class=\"oni-datepicker-wrapper\" ms-css-position=\"_position\">\n        <div class=\"oni-datepicker-content\" >\n            <div class=\"oni-datepicker-label\" ms-if=\"numberOfMonths===1\">{{calendarLabel}}</div>\n            <i  class=\"oni-datepicker-prev oni-icon\" \n                ms-if=\"numberOfMonths!==1\" \n                ms-click=\"_prev(prevMonth, $event)\"\n                ms-class=\"oni-datepicker-prev-disabled:!prevMonth\" \n                style=\"left:15px;\">&#xf047;</i>\n            <i  class=\"oni-datepicker-next oni-icon\" \n                ms-if=\"numberOfMonths!==1\" \n                ms-click=\"_next(nextMonth, $event)\"\n                ms-class=\"oni-datepicker-next-disabled:!nextMonth\" \n                style=\"right:15px;\">&#xf03e;</i>\n            <div class=\"oni-datepicker-content-content\" \n                 ms-repeat-calendar=\"data\" \n                 ms-visible=\"_datepickerToggle\">\n                <div class=\"oni-datepicker-header\" ms-if=\"numberOfMonths===1\">\n                    <i class=\"oni-datepicker-prev oni-icon\" \n                       ms-click=\"_prev(prevMonth, $event)\"\n                       ms-class=\"oni-datepicker-prev-disabled:!prevMonth\">&#xf047;</i>\n                    <i class=\"oni-datepicker-next oni-icon\"    \n                       ms-click=\"_next(nextMonth, $event)\"\n                       ms-class=\"oni-datepicker-next-disabled:!nextMonth\">&#xf03e;</i>\n                    <div class=\"oni-datepicker-title\" ms-if=\"changeMonthAndYear && regional.showMonthAfterYear\">\n                        <select ms-each=\"years\" data-each-rendered=\"_afterYearRendered\">\n                            <option ms-attr-value=\"el\">{{el}}</option>\n                        </select>&nbsp;{{regional.yearText}}&nbsp;\n                        <select ms-each=\"months\" data-each-rendered=\"_afterMonthRendered\">\n                            <option ms-attr-value=\"{{el}}\">{{el}}</option>\n                        </select>&nbsp;{{regional.monthText}}\n                    </div>\n                    <div class=\"oni-datepicker-title\" ms-if=\"changeMonthAndYear && !regional.showMonthAfterYear\">\n                        <select ms-each=\"months\" data-each-rendered=\"_afterMonthRendered\">\n                            <option ms-attr-value=\"{{el}}\">{{el}}</option>\n                        </select>&nbsp;{{regional.monthText}}\n                        <select ms-each=\"years\" data-each-rendered=\"_afterYearRendered\">\n                            <option ms-attr-value=\"el\">{{el}}</option>\n                        </select>&nbsp;{{regional.yearText}}&nbsp;\n                    </div>\n                    <div class=\"oni-datepicker-title\"\n                         ms-click=\"_selectMonths\"\n                         ms-if=\"!changeMonthAndYear\">\n                        <span ms-hover=\"oni-state-hover:mobileMonthAndYear\" ms-html=\"_getTitle(calendar.year, calendar.month)\"></span>\n                    </div> \n                </div>\n                <div class=\"oni-datepicker-header\" ms-if=\"numberOfMonths!==1\">\n                    <div class=\"oni-datepicker-title\">\n                        <span ms-hover=\"oni-state-hover:mobileMonthAndYear\" ms-html=\"_getTitle(calendar.year, calendar.month)\"></span>\n                    </div> \n                </div>\n                <table class=\"oni-datepicker-calendar-week\">\n                    <thead>\n                        <tr>\n                            <th ms-repeat=\"weekNames\"\n                                ms-class=\"{{_setWeekClass(el)}}\">{{el}}\n                            </th>\n                        </tr>\n                    </thead>\n                </table>\n                <table class=\"oni-datepicker-calendar-days\">\n                    <tbody>\n                        <tr ms-repeat-days=\"calendar.rows\">\n                            <td class=\"oni-datepicker-default\"\n                                ms-repeat-item=\"days\"\n                                ms-class=\"{{_setDayClass($index, $outer.$index, $outer.$outer.$index, item)}}\"\n                                ms-hover=\"{{_setHoverClass($index, $outer.$index, $outer.$outer.$index, item)}}\"\n                                ms-click=\"_selectDate($index, $outer.$index, $outer.$outer.$index, $event)\"\n                                ms-html=\"_dateCellRender($outer.$index, $index, $outer.$outer.$index, item)\"\n                                ></td>\n                        </tr>\n                    </tbody>\n                </table>\n                <div class=\"oni-datepicker-timer\" ms-if=\"timer\">\n                    <label>\n                        <span>{{regional.timerText}}</span>\n                        <b>{{hour|timer}}</b>&nbsp;:\n                        <b>{{minute|timer}}</b>\n                    </label>\n                    <p>\n                        <span>{{regional.hourText}}</span>\n                        <input ms-widget=\"slider, $, sliderHourOpts\" data-slider-max=\"23\" data-slider-min=\"0\" data-slider-value=\"hour\" data-slider-width=\"140\">\n                    </p>\n                    <p>\n                        <span>{{regional.minuteText}}</span>\n                        <input ms-widget=\"slider, $, sliderMinuteOpts\" data-slider-max=\"59\" data-slider-min=\"0\" data-slider-width=\"140\" data-slider-value=\"minute\">\n                    </p>\n                </div>\n                <div class=\"oni-datepicker-timer oni-helper-clearfix\" ms-if=\"timer\">\n                    <button type=\"button\" class=\"oni-btn oni-btn-small\" style=\"float: left\" ms-click=\"_getNow\">{{regional.nowText}}</button>\n                    <button type=\"button\" class=\"oni-btn oni-btn-primary oni-btn-small\" style=\"float:right\" ms-click=\"_selectTime\">{{regional.confirmText}}</button>\n                </div>\n                <div class=\"oni-datepicker-watermark\" ms-if=\"watermark\">\n                    {{calendar.month+1}}\n                </div>\n            </div>\n            <div class=\"oni-datepicker-content-content oni-datepicker-month-year\" ms-if=\"mobileMonthAndYear\" ms-visible=\"_monthToggle\">\n                <table>\n                    <thead>\n                        <tr class=\"oni-datepicker-title\">\n                            <th class=\"prev\" style=\"visibility: visible;text-align:left\">\n                                <i class=\"oni-datepicker-prev oni-icon\" \n                                   ms-click=\"_prevYear(mobileYear)\"\n                                   ms-class=\"oni-datepicker-prev-disabled:mobileYear===years[0]\">&#xf047;</i>\n                            </th>\n                            <th style=\"text-align:center\" \n                                ms-click=\"_selectYears\" \n                                ms-hover=\"oni-state-hover:mobileMonthAndYear\">{{mobileYear}}</th>\n                            <th class=\"next\" style=\"visibility: visible;text-align:right\">\n                                <i class=\"oni-datepicker-next oni-icon\" \n                                   ms-click=\"_nextYear(mobileYear)\"\n                                   ms-class=\"oni-datepicker-prev-disabled:mobileYear===years[years.length-1]\">&#xf03e;</i>\n                            </th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr>\n                            <td colspan=\"3\" style=\"padding:0px\">\n                                <span ms-repeat-m=\"months\" \n                                      ms-class=\"oni-datepicker-selected: (m-1)===elementMonth && mobileYear===elementYear\"\n                                      ms-click=\"_selectDates(m-1)\"\n                                      ms-hover=\"oni-datepicker-day-hover\">{{regional.monthNamesShort[m - 1]}}</span>\n                            </td>\n                        </tr>\n                    </tbody>\n                    <tfoot>\n                        <tr>\n                            <th colspan=\"3\" class=\"today\" style=\"display: none;\">Today</th>\n                        </tr>\n                        <tr>\n                            <th colspan=\"3\" class=\"clear\" style=\"display: none;\">Clear</th>\n                        </tr>\n                    </tfoot>\n                </table>\n            </div>\n\n            <div class=\"oni-datepicker-content-content oni-datepicker-month-year\" ms-if=\"mobileMonthAndYear\" ms-visible=\"_yearToggle\">\n                <table>\n                    <thead>\n                        <tr class=\"oni-datepicker-title\">\n                            <th class=\"prev\" style=\"visibility: visible;text-align:left\">\n                                <i class=\"oni-datepicker-prev oni-icon\" \n                                   ms-click=\"_prevYears\" \n                                   ms-class=\"oni-datepicker-prev-disabled:_years[0]<=years[0]\">&#xf047;</i>\n                            </th>\n                            <th style=\"text-align:center\" \n                                ms-hover=\"oni-state-hover:mobileMonthAndYear\">{{_years[0]}}-{{_years[9]}}\n                            </th>\n                            <th class=\"next\" style=\"visibility: visible;text-align:right\">\n                                <i class=\"oni-datepicker-next oni-icon\" \n                                    ms-click=\"_nextYears\"\n                                    ms-class=\"oni-datepicker-next-disabled:_years[_years.length-1]>=years[years.length-1]\">&#xf03e;</i>\n                            </th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr>\n                            <td colspan=\"3\" style=\"padding:0px\">\n                                <span class=\"oni-datepicker-prev-year\"\n                                      ms-class=\"{{_setMobileYearClass(_years[0]-1, elementYear, month, elementMonth)}}\"\n                                      ms-click=\"_selectMonths($event, _years[0]-1)\"\n                                      ms-hover=\"oni-datepicker-day-hover\"\n                                >{{_years[0]-1}}</span>\n                                <span ms-repeat-y=\"_years\" \n                                      ms-class=\"_setMobileYearClass(y, elementYear, month, elementMonth)\"\n                                      ms-click=\"_selectMonths($event, y)\"\n                                      ms-hover=\"oni-datepicker-day-hover\"\n                                >{{y}}</span>\n                                <span class=\"oni-datepicker-next-year\"\n                                      ms-class=\"{{_setMobileYearClass(_years[9]+1, elementYear, month, elementMonth)}}\"\n                                      ms-click=\"_selectMonths($event, _years[9]+1)\"\n                                      ms-hover=\"oni-datepicker-day-hover\"\n                                >{{_years[9]+1}}</span>\n                            </td>\n                        </tr>\n                    </tbody>\n                    <tfoot>\n                        <tr>\n                            <th colspan=\"3\" class=\"today\" style=\"display: none;\">Today</th></tr>\n\n                            <tr><th colspan=\"3\" class=\"clear\" style=\"display: none;\">Clear</th>\n                        </tr>\n                    </tfoot>\n                </table>\n            </div>\n        </div>\n    </div>\n</div>\n";
__context.____MODULES['90b2de0bf947d1814b382738513983f5'];
__context.____MODULES['784f114d9a1149d4a292ba1d604ab9b2'];

module.exports = (
function () {
    var calendarTemplate = sourceHTML, HOLIDAYS, ONE_DAY = 24 * 60 * 60 * 1000, firstYear = 1901, lastYear = 2050;
    var widget = avalon.ui.datepicker = function (element, data, vmodels) {
            var options = data.datepickerOptions, msDuplexName = element.msData['ms-duplex'], duplexVM = msDuplexName && avalon.getModel(msDuplexName, vmodels), parseDate = options.parseDate, formatDate = options.formatDate, minDate = options.minDate, maxDate = options.maxDate, monthYearChangedBoth = false, datepickerData = [], _initValue = '', years = [], minDateVM, maxDateVM, calendar, month, day, year;
            calendarTemplate = options.template = options.getTemplate(calendarTemplate, options);
            avalon.scan(element, vmodels);
            options.disabled = element.disabled || options.disabled;
            formatDate = formatDate.bind(options);
            //兼容IE6、7使得formatDate方法中的this指向options
            parseDate = parseDate.bind(options);
            minDate = minDate !== null && validateDate(minDate);
            maxDate = maxDate !== null && validateDate(maxDate);
            if (options.minDate && !minDate) {
                // minDate是某个VM的属性名
                minDateVM = avalon.getModel(options.minDate, vmodels);
                minDateVM && (minDate = validateDate(minDateVM[1][minDateVM[0]]));
            }
            minDate = options.minDate = minDate && cleanDate(minDate);
            if (options.maxDate && !maxDate) {
                // maxDate 是某个VM的属性名，需要进一步解析
                maxDateVM = avalon.getModel(options.maxDate, vmodels);
                maxDateVM && (maxDate = validateDate(maxDateVM[1][maxDateVM[0]]));
            }
            maxDate = options.maxDate = maxDate && cleanDate(maxDate);
            minDate ? firstYear = minDate.getFullYear() : 0;
            maxDate ? lastYear = maxDate.getFullYear() : 0;
            if (avalon.type(options.years) === 'array') {
                years = options.years;
            } else {
                for (var i = firstYear; i <= lastYear; i++) {
                    years.push(i);
                }
            }
            if (options.mobileMonthAndYear) {
                options.mobileYear = 0;
            }
            options.changeMonthAndYear && (options.mobileMonthAndYear = false);
            initValue();
            var vmodel = avalon.define(data.datepickerId, function (vm) {
                    //初始化增加语言包设置
                    avalon.mix(vm, options, { regional: widget.defaultRegional });
                    vm.$skipArray = [
                        'container',
                        'showDatepickerAlways',
                        'timer',
                        'sliderMinuteOpts',
                        'sliderHourOpts',
                        'template',
                        'widgetElement',
                        'rootElement',
                        'dayNames',
                        'allowBlank',
                        'months',
                        'years',
                        'numberOfMonths',
                        'showOtherMonths',
                        'watermark',
                        'weekNames',
                        'stepMonths',
                        'changeMonthAndYear',
                        'startDay',
                        'mobileMonthAndYear',
                        'formatErrorTip'    //格式错误提示文案
                    ];
                    vm.dateError = vm.dateError || '';
                    vm.weekNames = [];
                    vm.tip = vm.tip || '';
                    vm.widgetElement = element;
                    vm.rootElement = {};
                    vm.data = [];
                    vm.prevMonth = -1;
                    //控制prev class是否禁用
                    vm.nextMonth = -1;
                    //控制next class是否禁用
                    vm.month = month;
                    vm._month = month + 1;
                    vm.year = year;
                    vm.day = day;
                    vm.years = years;
                    vm.months = [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12
                    ];
                    vm._position = 'absolute';
                    vm._datepickerToggle = true;
                    vm._monthToggle = false;
                    vm._yearToggle = false;
                    vm._years = [
                        2010,
                        2011,
                        2012,
                        2013,
                        2014,
                        2015,
                        2016,
                        2017,
                        2018,
                        2019
                    ];
                    vm.elementYear = year;
                    vm.elementMonth = month;
                    vm._setWeekClass = function (dayName) {
                        var dayNames = vmodel.regional.day;
                        if (dayNames.indexOf(dayName) % 7 == 0 || dayNames.indexOf(dayName) % 7 == 6) {
                            return 'oni-datepicker-week-end';
                        } else {
                            return '';
                        }
                    };
                    vm._setDayClass = function (index, outerIndex, rowIndex, day) {
                        var className = '', dayItem = {};
                        if (day === '') {
                            return '';
                        }
                        dayItem = datepickerData[rowIndex]['rows'][outerIndex][index];
                        if (dayItem.weekend) {
                            className += ' oni-datepicker-week-end';
                        }
                        if (!dayItem.month) {
                            className += ' oni-datepicker-day-none';
                        }
                        if (dayItem.selected) {
                            className += ' oni-datepicker-selected';
                        }
                        if (dayItem.dateDisabled) {
                            className += ' oni-state-disabled';
                        }
                        return className.trim();
                    };
                    vm._setHoverClass = function (index, outerIndex, rowIndex, day) {
                        var className = '', dayItem = {};
                        if (day === '') {
                            return '';
                        }
                        dayItem = datepickerData[rowIndex]['rows'][outerIndex][index];
                        className = 'oni-datepicker-day-hover';
                        return className;
                    };
                    vm._setMobileYearClass = function (yearItem, elementYear, monthItem, elementMonth) {
                        var className = '';
                        if (yearItem === elementYear && monthItem === elementMonth) {
                            className += ' oni-datepicker-selected';
                        }
                        if (vmodel.mobileYearDisabled(yearItem)) {
                            className += ' oni-state-disabled';
                        }
                        return className;
                    };
                    vm.sliderMinuteOpts = {
                        onInit: function (sliderMinute, options, vmodels) {
                            sliderMinute.$watch('value', function (val) {
                                vmodel.minute = val;
                            });
                            vmodel.$watch('minute', function (val) {
                                sliderMinute.value = val;
                            });
                        }
                    };
                    vm.sliderHourOpts = {
                        onInit: function (sliderHour, options, vmodels) {
                            sliderHour.$watch('value', function (val) {
                                vmodel.hour = val;
                            });
                            vmodel.$watch('hour', function (val) {
                                sliderHour.value = val;
                            });
                        }
                    };
                    vm.$yearVmId = vm.$id + 'year';
                    vm.$monthVmId = vm.$id + 'month';
                    vm.$yearOpts = {
                        width: 60,
                        listWidth: 60,
                        height: 160,
                        position: false,
                        listClass: 'oni-datepicker-dropdown',
                        onSelect: function (e) {
                            e.stopPropagation();
                        }
                    };
                    vm.$monthOpts = {
                        width: 45,
                        height: 160,
                        listWidth: 45,
                        position: false,
                        listClass: 'oni-datepicker-dropdown',
                        onSelect: function (e) {
                            e.stopPropagation();
                        }
                    };
                    vm._selectDates = function (month) {
                        if (vmodel.mobileMonthAndYear) {
                            vmodel._monthToggle = false;
                            vmodel._yearToggle = false;
                            vmodel._datepickerToggle = true;
                            monthYearChangedBoth = true;
                            vmodel.year = vmodel.mobileYear;
                            vmodel.month = month;
                        }
                    };
                    vm._selectMonths = function (event, year) {
                        if (vmodel.mobileMonthAndYear) {
                            if (year) {
                                if (!vmodel.mobileYearDisabled(year)) {
                                    vmodel.mobileYear = year;
                                } else {
                                    return;
                                }
                            } else {
                                vmodel.mobileYear = vmodel.year;
                            }
                            vmodel._monthToggle = true;
                            vmodel._yearToggle = false;
                            vmodel._datepickerToggle = false;
                        }
                    };
                    vm._selectYears = function () {
                        if (vmodel.mobileMonthAndYear) {
                            vmodel._monthToggle = false;
                            vmodel._yearToggle = true;
                            vmodel._datepickerToggle = false;
                        }
                    };
                    vm.getInitTime = function (timeDate) {
                        var date = formatDate(timeDate), time = timeDate.toTimeString(), now = time.substr(0, time.lastIndexOf(':'));
                        vmodel.hour = timeDate.getHours();
                        vmodel.minute = timeDate.getMinutes();
                        return date + ' ' + now;
                    };
                    vm._dateCellRender = function (outerIndex, index, rowIndex, date) {
                        if (vmodel.dateCellRender) {
                            var dayItem = datepickerData[rowIndex]['rows'][outerIndex][index];
                            if (date === '') {
                                return date;
                            }
                            return vmodel.dateCellRender(date, vmodel, dayItem);
                        }
                        return date;
                    };
                    vm._selectTime = function (event) {
                        var timeFilter = avalon.filters.timer, hour = timeFilter(vmodel.hour), minute = timeFilter(vmodel.minute), time = hour + ':' + minute, _date = formatDate(parseDate(element.value));
                        event.stopPropagation();
                        element.value = _date + ' ' + time;
                        if (!vmodel.showDatepickerAlways) {
                            vmodel.toggle = false;
                        }
                        if (options.onSelectTime && avalon.type(options.onSelectTime) === 'function') {
                            options.onSelectTime.call(vmodel, vmodel);
                        }
                    };
                    vm._selectYearMonth = function (event) {
                        event.stopPropagation();
                    };
                    // 点击prev按钮切换到当前月的上个月，如当前月存在minDate则prev按钮点击无效
                    vm._prev = function (prevFlag, event) {
                        if (!prevFlag) {
                            return false;
                        }
                        toggleMonth('prev');
                        event.stopPropagation();
                    };
                    // 点击next按钮切换到当前月的下一个月，如果当前月存在maxDate则next按钮点击无效
                    vm._next = function (nextFlag, event) {
                        if (!nextFlag) {
                            return false;
                        }
                        toggleMonth('next');
                        event.stopPropagation();
                    };
                    vm._prevYear = function (year) {
                        if (year === vmodel.years[0]) {
                            return;
                        }
                        vmodel.mobileYear = vmodel.mobileYear - 1;
                    };
                    vm._nextYear = function (year) {
                        if (year === vmodel.years[vmodel.years.length - 1]) {
                            return;
                        }
                        vmodel.mobileYear = vmodel.mobileYear + 1;
                    };
                    vm._prevYears = function () {
                        if (vmodel._years[0] <= vmodel.years[0]) {
                            return;
                        }
                        updateMobileYears(vmodel._years[0] - 1);
                    };
                    vm._nextYears = function () {
                        var _years = vmodel._years, years = vmodel.years;
                        if (_years[_years.length - 1] >= years[years.length - 1]) {
                            return;
                        }
                        updateMobileYears(_years[9] + 1);
                    };
                    vm.mobileYearDisabled = function (year) {
                        var years = vmodel.years;
                        if (year < years[0] || year > years[years.length - 1]) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    vm.getRawValue = function () {
                        return element.value;
                    };
                    vm.getDate = function () {
                        var value = vmodel.getRawValue();
                        return parseDate(value);
                    };
                    // 年份选择器渲染ok之后为其绑定dropdown组件并扫描渲染出dropdown
                    vm._afterYearRendered = function () {
                        this.setAttribute('ms-widget', [
                            'dropdown',
                            vm.$yearVmId,
                            '$yearOpts'
                        ].join(','));
                        this.setAttribute('ms-duplex', 'year');
                        avalon.scan(this, vmodel);
                    };
                    // 月份选择器渲染ok之为其绑定dropdown组件并扫描渲染出dropdown
                    vm._afterMonthRendered = function () {
                        this.setAttribute('ms-widget', [
                            'dropdown',
                            vm.$monthVmId,
                            '$monthOpts'
                        ].join(','));
                        this.setAttribute('ms-duplex', '_month');
                        avalon.scan(this, vmodel);
                    };
                    // 选择日期
                    vm._selectDate = function (index, outerIndex, rowIndex, event) {
                        var timerFilter = avalon.filters.timer, _oldMonth = vmodel.month, _oldYear = vmodel.year, dayItem = datepickerData[rowIndex]['rows'][outerIndex][index], year = dayItem.year, month = dayItem.month, day = +dayItem.day, dateDisabled = dayItem.dateDisabled;
                        event.stopPropagation();
                        event.preventDefault();
                        if (month !== false && !dateDisabled && !vmodel.showDatepickerAlways) {
                            var _date = new Date(year, month, day), date = formatDate(_date), calendarWrapper = options.type === 'range' ? element['data-calenderwrapper'] : null;
                            vmodel.tip = getDateTip(cleanDate(_date)).text;
                            vmodel.dateError = '#cccccc';
                            if (!calendarWrapper && !vmodel.timer) {
                                element.value = date;
                                vmodel.toggle = false;
                            } else {
                                // range datepicker时需要切换选中日期项的类名
                                if (vmodel.timer) {
                                    date = date + ' ' + timerFilter(vmodel.hour) + ':' + timerFilter(vmodel.minute);
                                }
                                element.value = date;
                            }
                            if (month === _oldMonth && year === _oldYear && vmodel.day == day) {
                                vmodel.$fire('day', day);
                            } else {
                                vmodel.day = day;
                            }
                            if (month !== _oldMonth && year !== _oldYear) {
                                monthYearChangedBoth = true;
                                vmodel.year = year;
                                vmodel.month = month;
                            } else if (month !== _oldMonth) {
                                vmodel.month = month;
                            } else if (year !== _oldYear) {
                                vmodel.year = year;
                            }
                        }
                        if (!vmodel.showDatepickerAlways && !duplexVM) {
                            if (typeof vmodel.onSelect === 'string') {
                                avalon.log('onSelect \u56DE\u8C03\u5FC5\u987B\u662F\u4E2Afunction\uFF01');
                                return;
                            }
                            vmodel.onSelect.call(null, date, vmodel, avalon(element).data());
                        }
                    };
                    //设置语言包
                    vm.setRegional = function (regional) {
                        vmodel.regional = regional;
                    };
                    vm.$init = function (continueScan) {
                        var elementPar = element.parentNode;
                        calendar = avalon.parseHTML(calendarTemplate).firstChild;
                        elementPar.insertBefore(calendar, element);
                        elementPar.insertBefore(element, calendar);
                        avalon(element).attr('ms-css-width', 'width');
                        vmodel.weekNames = calendarHeader();
                        if (element.tagName === 'INPUT' && vmodel.type !== 'range') {
                            var div = document.createElement('div');
                            div.className = 'oni-datepicker-input-wrapper';
                            div.setAttribute('ms-class', 'oni-datepicker-active:toggle');
                            div.setAttribute('ms-css-border-color', 'dateError');
                            div.setAttribute('ms-hover', 'oni-state-hover');
                            elementPar.insertBefore(div, element);
                            div.appendChild(element);
                            if (vmodel.showTip) {
                                var tip = avalon.parseHTML('<div class=\'oni-datepicker-tip\'>{{tip}}<i class=\'oni-icon oni-icon-calendar-o\'>&#xf088;</i></div>');
                                div.appendChild(tip);
                            } else {
                                element.style.paddingRight = '0px';
                            }
                            div.appendChild(calendar);
                        }
                        if (vmodel.timer) {
                            vmodel.width = 100;
                            var time = validateTime(_initValue);
                            if (_initValue && time) {
                                _initValue = vmodel.getInitTime(time);
                            }
                        }
                        element.value = _initValue;
                        element.disabled = vmodel.disabled;
                        if (vmodel.showDatepickerAlways) {
                            element.style.display = 'none';
                            vmodel.toggle = true;
                            vmodel._position = 'relative';
                            div.style.borderWidth = 0;
                        } else {
                            bindEvents(calendar, div);
                        }
                        if (options.type === 'range') {
                            div = element['data-calenderwrapper'];
                            vmodel._position = 'static';
                        } else {
                            avalon.scan(div, [vmodel]);
                        }
                        vm.rootElement = div;
                        avalon.scan(calendar, [vmodel].concat(vmodels));
                        setTimeout(function () {
                            calendarDays(vmodel.month, vmodel.year);
                        }, 10);
                        if (typeof options.onInit === 'function') {
                            //vmodels是不包括vmodel的
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    vm._getTitle = function (year, month) {
                        return vmodel.regional.titleFormat.call(vmodel.regional, year, month);
                    };
                    vm.$remove = function () {
                        var elementPar = element.parentNode, eleParPar = elementPar.parentNode, calendarPar = calendar.parentNode;
                        calendar.innerHTML = calendar.textContent = '';
                        calendarPar.removeChild(calendar);
                        eleParPar.removeChild(elementPar);
                    };
                });
            getDateTip = getDateTip.bind(vmodel);
            vmodel.$watch('toggle', function (val) {
                var dateFormat = element.value, date = parseDate(dateFormat), elementYear = date && date.getFullYear(), elementMonth = date && date.getMonth();
                if (val) {
                    vmodel.elementMonth = elementMonth || -1;
                    vmodel.elementYear = elementYear || -1;
                } else {
                    if (vmodel.year != elementYear && vmodel.month != elementMonth) {
                        if (!date) {
                            monthYearChangedBoth = true;
                            var today = new Date(), yearToday = today.getFullYear(), monthToday = today.getMonth();
                            if (vmodel.year == yearToday && vmodel.month == monthToday) {
                                setCalendarDays(vmodel.month, vmodel.year, vmodel.day);
                            } else if (vmodel.year == yearToday) {
                                vmodel.month = monthToday;
                            } else if (vmodel.month == monthToday) {
                                vmodel.year = yearToday;
                            } else {
                                monthYearChangedBoth = true;
                                vmodel.year = yearToday;
                                vmodel.month = monthToday;
                            }
                        } else {
                            monthYearChangedBoth = true;
                            vmodel.year = elementYear;
                            vmodel.month = elementMonth;
                        }
                    } else if (vmodel.year != elementYear) {
                        vmodel.year = elementYear;
                    } else if (vmodel.month != elementMonth) {
                        vmodel.month = elementMonth;
                    }
                    // 防止Month, Year下拉框的浮层不被关闭。
                    avalon.vmodels[vmodel.$yearVmId] && (avalon.vmodels[vmodel.$yearVmId].toggle = false);
                    avalon.vmodels[vmodel.$monthVmId] && (avalon.vmodels[vmodel.$monthVmId].toggle = false);
                    vmodel.onClose(new Date(vmodel.year, vmodel.month, vmodel.day), vmodel);
                }
            });
            vmodel.$watch('year', function (year) {
                if (vmodel.mobileMonthAndYear) {
                    updateMobileYears(year);
                }
                if (!monthYearChangedBoth) {
                    setCalendarDays(vmodel.month, year, vmodel.day);
                } else {
                    monthYearChangedBoth = false;
                }
                vmodel.onChangeMonthYear(year, vmodel.month + 1, vmodel);
            });
            if (vmodel.changeMonthAndYear) {
                vmodel.$watch('_month', function (month) {
                    vmodel.month = month - 1;
                });
            }
            vmodel.$watch('month', function (month) {
                vmodel._month = month + 1;
                setCalendarDays(month, vmodel.year, vmodel.day);
                vmodel.onChangeMonthYear(vmodel.year, month, vmodel);
            });
            vmodel.$watch('day', function (newDay, oldDay) {
                var data = datepickerData, month = vmodel.month, year = vmodel.year, exitLoop = false, dateYear, dateMonth, dateDay;
                for (var i = 0, len = data.length; i < len; i++) {
                    var dataItem = data[i];
                    if (dataItem.year == year && dataItem.month == month) {
                        var dataRows = dataItem.rows;
                        for (var j = 0, jLen = dataRows.length; j < jLen; j++) {
                            var dataRow = dataRows[j];
                            for (var k = 0, kLen = dataRow.length; k < kLen; k++) {
                                var dayItem = dataRow[k], date = dayItem.day;
                                if (date == newDay && dayItem.month == month && dayItem.year == year) {
                                    dayItem.selected = true;
                                    vmodel.data[i]['rows'][j].set(k, '').set(k, dayItem._day);
                                } else if (dayItem.selected) {
                                    dayItem.selected = false;
                                    vmodel.data[i]['rows'][j].set(k, '').set(k, dayItem._day);
                                }
                            }
                        }
                    } else {
                        for (var j = 0, jLen = dataRows.length; j < jLen; j++) {
                            var dataRow = dataRows[j];
                            for (var k = 0, kLen = dataRow.length; k < kLen; k++) {
                                var dateItem = dataRow[k];
                                if (dayItem.selected) {
                                    dayItem.selected = false;
                                    vmodel.data[i]['rows'][j].set(k, '').set(k, dayItem._day);
                                    exitLoop = true;
                                    break;
                                }
                            }
                            if (exitLoop) {
                                break;
                            }
                        }
                    }
                    if (exitLoop) {
                        break;
                    }
                }
            });
            // 这里的处理使得设置外部disabled或者组件VM的disabled同步
            vmodel.$watch('disabled', function (val) {
                element.disabled = val;
            });
            vmodel.$watch('minDate', function (val) {
                var minDate = validateDate(val);
                if (minDate) {
                    vmodel.minDate = cleanDate(minDate);
                } else {
                    vmodel.minDate = '';
                }
                setCalendarDays(vmodel.month, vmodel.year, vmodel.day);
            });
            vmodel.$watch('maxDate', function (val) {
                var maxDate = validateDate(val);
                if (maxDate) {
                    vmodel.maxDate = cleanDate(maxDate);
                } else {
                    vmodel.maxDate = '';
                }
                setCalendarDays(vmodel.month, vmodel.year, vmodel.day);
            });
            duplexVM && duplexVM[1].$watch(duplexVM[0], function (val) {
                var currentYear, currentMonth, date;
                if (date = parseDate(val)) {
                    currentYear = date.getFullYear();
                    currentMonth = date.getMonth();
                    vmodel.day = date.getDate();
                    if (currentMonth !== vmodel.month && currentYear !== vmodel.year) {
                        monthYearChangedBoth = true;
                        vmodel.year = currentYear;
                        vmodel.month = currentMonth;
                    } else if (currentYear !== vmodel.year) {
                        vmodel.year = currentYear;
                    } else if (currentMonth !== vmodel.month) {
                        vmodel.month = currentMonth;
                    }
                    vmodel.dateError = '#cccccc';
                    vmodel.tip = getDateTip(cleanDate(date)).text;
                    if (typeof vmodel.onSelect === 'string') {
                        avalon.log('onSelect \u56DE\u8C03\u5FC5\u987B\u662F\u4E2Afunction\uFF01');
                        return;
                    }
                    vmodel.onSelect.call(null, date, vmodel, avalon(element).data());
                } else {
                    if (!vmodel.allowBlank) {
                        vmodel.tip = vmodel.formatErrorTip;
                        vmodel.dateError = '#ff8888';
                    } else {
                        vmodel.tip = '';
                    }
                }
            });
            minDateVM && minDateVM[1].$watch(minDateVM[0], function (val) {
                vmodel.minDate = val;
            });
            maxDateVM && maxDateVM[1].$watch(maxDateVM[0], function (val) {
                vmodel.maxDate = val;
            });
            function initValue() {
                var value = element.value, _date = parseDate(value), today = cleanDate(new Date()), _initDate = _date, dateDisabled = false;
                if (value && !_date) {
                    options.tip = options.formatErrorTip;
                    options.dateError = '#ff8888';
                    _initDate = today;
                }
                if (options.allowBlank) {
                    if (!value) {
                        options.tip = '';
                        _initDate = today;
                    } else if (_date) {
                        dateDisabled = isDateDisabled(_date, options);
                    }
                } else {
                    if (!value) {
                        value = formatDate(today);
                        options.tip = getDateTip(today).text;
                        _initDate = today;
                        dateDisabled = isDateDisabled(today, options);
                    } else if (_date) {
                        dateDisabled = isDateDisabled(_date, options);
                    }
                }
                if (dateDisabled) {
                    _initDate = options.minDate || options.maxDate;
                    value = formatDate(_initDate);
                }
                year = _initDate.getFullYear();
                month = _initDate.getMonth();
                day = _initDate.getDate();
                _initValue = value;
            }
            function updateMobileYears(year) {
                //todo--- 看能不能把数组的赋值，变成set的方式
                var years = vmodel._years, _year3 = (year + '').substr(0, 3), newYears = [];
                if (!~years.indexOf(year)) {
                    for (var i = 0; i <= 9; i++) {
                        newYears.push(Number(_year3 + i));
                    }
                    vmodel._years = newYears;
                }
            }
            // 根据minDate和maxDate的设置判断给定的日期是否不可选
            function isDateDisabled(date, vmodel) {
                var time = date.getTime(), minDate = vmodel.minDate, maxDate = vmodel.maxDate;
                if (minDate && time < minDate.getTime()) {
                    return true;
                } else if (maxDate && time > maxDate.getTime()) {
                    return true;
                }
                return false;
            }
            //todo-- 看看事件绑定这块可否优化
            // 初始化时绑定各种回调
            function bindEvents(calendar, tipContainer) {
                // focus Input元素时显示日历组件
                avalon.bind(element, 'focus', function (e) {
                    vmodel.toggle = true;
                });
                // 切换日期年月或者点击input输入域时不隐藏组件，选择日期或者点击文档的其他地方则隐藏日历组件
                avalon.bind(document, 'click', function (e) {
                    var target = e.target;
                    if (options.type === 'range') {
                        return;
                    }
                    if (!calendar.contains(target) && !tipContainer.contains(target) && vmodel.toggle && !vmodel.timer) {
                        vmodel.toggle = false;
                        return;
                    } else if (!vmodel.toggle && !vmodel.disabled && tipContainer.contains(target)) {
                        vmodel.toggle = true;
                        return;
                    }
                });
                // 处理用户的输入
                avalon.bind(element, 'keydown', function (e) {
                    var keyCode = e.keyCode, operate, eChar;
                    eChar = e.key;
                    if (eChar) {
                        switch (eChar) {
                        case '-':
                            operate = '-';
                            break;
                        case '/':
                            operate = '/';
                            break;
                        }
                    } else {
                        switch (keyCode) {
                        case 189:
                            operate = '-';
                            break;
                        case 191:
                            operate = '/';
                            break;
                        }
                    }
                    if (!vmodel.toggle) {
                        vmodel.toggle = true;
                    }
                    // 37:向左箭头； 39:向右箭头；8:backspace；46:Delete
                    if ((keyCode < 48 || keyCode > 57 && keyCode < 96 || keyCode > 105) && keyCode !== 13 && keyCode !== 8 && options.separator !== operate && keyCode !== 27 && keyCode !== 9 && keyCode !== 37 && keyCode !== 39 && keyCode !== 46) {
                        e.preventDefault();
                        return false;
                    }
                });
                avalon.bind(element, 'keyup', function (e) {
                    var value = element.value, year = vmodel.year, month = vmodel.month, keyCode = e.keyCode, dateMonth, dateYear, date;
                    if (keyCode === 37 || keyCode === 39) {
                        return false;
                    }
                    // 当按下Enter、Tab、Esc时关闭日历
                    if (keyCode === 13 || keyCode == 27 || keyCode == 9) {
                        vmodel.toggle = false;
                        return false;
                    }
                    if (date = parseDate(value)) {
                        dateMonth = date.getMonth();
                        dateYear = date.getFullYear();
                        vmodel.dateError = '#cccccc';
                        vmodel.tip = getDateTip(cleanDate(date)).text;
                        vmodel.day = date.getDate();
                        if (month != dateMonth && year != dateYear) {
                            monthYearChangedBoth = true;
                            vmodel.year = dateYear;
                            vmodel.month = dateMonth;
                        } else if (month != dateMonth) {
                            vmodel.month = dateMonth;
                        } else {
                            vmodel.year = dateYear;
                        }
                    } else {
                        if (vmodel.allowBlank && value == '') {
                            vmodel.tip = '';
                            vmodel.dateError = '#cccccc';
                            return;
                        }
                        vmodel.tip = vmodel.formatErrorTip;
                        vmodel.dateError = '#ff8888';
                    }
                });
            }
            // 通过prev、next按钮切换月份
            function toggleMonth(operate) {
                var month = vmodel.month, year = vmodel.year, stepMonths = vmodel.stepMonths, numberOfMonths = vmodel.numberOfMonths, firstDayOfNextMonth, firstDayMonth = 0, firstDayYear = 0;
                if (operate === 'next') {
                    month = month + stepMonths + numberOfMonths - 1;
                } else {
                    month = month - stepMonths - numberOfMonths + 1;
                }
                firstDayOfNextMonth = new Date(year, month, 1);
                firstDayMonth = firstDayOfNextMonth.getMonth();
                firstDayYear = firstDayOfNextMonth.getFullYear();
                if (firstDayYear != vmodel.year) {
                    monthYearChangedBoth = true;
                    vmodel.year = firstDayYear;
                    vmodel.month = firstDayMonth;
                } else {
                    vmodel.month = firstDayMonth;
                }
            }
            // 日历头部的显示名
            function calendarHeader() {
                var weekNames = [], startDay = options.startDay;
                for (var j = 0, w = vmodel.regional.dayNames; j < 7; j++) {
                    var n = (j + startDay) % 7;
                    weekNames.push(w[n]);
                }
                return weekNames;
            }
            function calendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, days, _days, day) {
                var selected = false, tip = getDateTip(cellDate), _day = tip && tip.cellText || day, weekDay = cellDate.getDay(), weekend = weekDay % 7 == 0 || weekDay % 7 == 6, dateDisabled = isDateDisabled(cellDate, vmodel);
                if (valueDate && valueDate.getDate() === +day && dateMonth === valueDate.getMonth() && dateYear === valueDate.getFullYear()) {
                    selected = true;
                }
                days.push({
                    day: day + '',
                    _day: _day + '',
                    month: dateMonth,
                    year: dateYear,
                    weekend: weekend,
                    selected: selected,
                    dateDisabled: dateDisabled
                });
                _days.push(_day + '');
            }
            // 根据month、year得到要显示的日期数据
            function calendarDays(month, year) {
                var startDay = vmodel.startDay, firstDayOfMonth = new Date(year, month, 1), cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7), showOtherMonths = vmodel.showOtherMonths, valueDate = parseDate(element.value), minDate = vmodel.minDate, maxDate = vmodel.maxDate, prev = minDate ? (year - minDate.getFullYear()) * 12 + month - minDate.getMonth() > 0 : true, next = maxDate ? (maxDate.getFullYear() - year) * 12 + maxDate.getMonth() - month > 0 : true, rows = [], _rows = [], data = [], _data = [], days = [], _days = [], dateYear, dateMonth, day;
                vmodel.prevMonth = prev;
                vmodel.nextMonth = next;
                for (var i = 0, len = vmodel.numberOfMonths; i < len; i++) {
                    for (var m = 0; m < 6; m++) {
                        days = [];
                        _days = [];
                        for (var n = 0; n < 7; n++) {
                            dateMonth = cellDate.getMonth();
                            dateYear = cellDate.getFullYear();
                            day = cellDate.getDate();
                            if (dateYear === year && dateMonth === month) {
                                calendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, days, _days, day);
                            } else {
                                if (showOtherMonths && m === 0 && (dateYear < year || dateMonth < month)) {
                                    calendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, days, _days, day);
                                } else {
                                    _days.push('');
                                    days.push({
                                        day: '',
                                        month: false,
                                        weekend: false,
                                        selected: false,
                                        dateDisabled: true
                                    });
                                }
                            }
                            cellDate = new Date(cellDate.setDate(day + 1));
                        }
                        rows.push(days);
                        _rows.push(_days);
                    }
                    data.push({
                        year: year,
                        month: month,
                        rows: rows
                    });
                    _data.push({
                        year: year,
                        month: month,
                        rows: _rows
                    });
                    month += 1;
                    firstDayOfMonth = new Date(year, month, 1);
                    year = firstDayOfMonth.getFullYear();
                    month = firstDayOfMonth.getMonth();
                    cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7);
                    rows = [];
                    _rows = [];
                }
                datepickerData = data;
                vmodel.data = _data;
            }
            function setCalendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, dateDay, day, i, m, n) {
                var selected = false, month = valueDate && valueDate.getMonth(), year = valueDate && valueDate.getFullYear(), tip = getDateTip(cellDate), _day = tip && tip.cellText || dateDay, weekDay = cellDate.getDay(), weekend = weekDay % 7 == 0 || weekDay % 7 == 6, dateDisabled = isDateDisabled(cellDate, vmodel), dayItem = datepickerData[i]['rows'][m][n], rowItem = vmodel.data[i]['rows'][m];
                _day = _day + '';
                if (dateDay === +day && dateMonth === month && dateYear === year) {
                    selected = true;
                }
                if (dayItem._day == _day && (dayItem.selected != selected || dayItem.dateDisabled != dateDisabled)) {
                    avalon.mix(dayItem, {
                        month: dateMonth,
                        year: dateYear,
                        selected: selected,
                        dateDisabled: dateDisabled
                    });
                    rowItem.set(n, '').set(n, _day);
                } else if (dayItem._day == _day) {
                    avalon.mix(dayItem, {
                        month: dateMonth,
                        year: dateYear
                    });
                } else {
                    avalon.mix(dayItem, {
                        day: dateDay + '',
                        _day: _day,
                        month: dateMonth,
                        year: dateYear,
                        weekend: weekend,
                        selected: selected,
                        dateDisabled: dateDisabled
                    });
                    rowItem.set(n, _day);
                }
            }
            function setCalendarDays(month, year, day) {
                var startDay = vmodel.startDay, firstDayOfMonth = new Date(year, month, 1), cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7), showOtherMonths = vmodel.showOtherMonths, valueDate = parseDate(element.value), minDate = vmodel.minDate, maxDate = vmodel.maxDate, prev = minDate ? (year - minDate.getFullYear()) * 12 + month - minDate.getMonth() > 0 : true, next = maxDate ? (maxDate.getFullYear() - year) * 12 + maxDate.getMonth() - month > 0 : true, dateYear, dateMonth, dateDay;
                vmodel.prevMonth = prev;
                vmodel.nextMonth = next;
                for (var i = 0, len = vmodel.numberOfMonths; i < len; i++) {
                    vmodel.data[i].year = year;
                    vmodel.data[i].month = month;
                    datepickerData[i].year = year;
                    datepickerData[i].month = month;
                    for (var m = 0; m < 6; m++) {
                        for (var n = 0; n < 7; n++) {
                            dateMonth = cellDate.getMonth();
                            dateYear = cellDate.getFullYear();
                            dateDay = cellDate.getDate();
                            if (dateYear === year && dateMonth === month) {
                                setCalendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, dateDay, day, i, m, n);
                            } else {
                                if (showOtherMonths && m === 0 && (dateYear < year || dateMonth < month)) {
                                    setCalendarDate(cellDate, vmodel, valueDate, dateMonth, dateYear, dateDay, day, i, m, n);
                                } else {
                                    vmodel.data[i]['rows'][m].set(n, '');
                                    avalon.mix(datepickerData[i]['rows'][m][n], {
                                        day: '',
                                        _day: '',
                                        month: false,
                                        weekend: false,
                                        selected: false,
                                        dateDisabled: true
                                    });
                                }
                            }
                            cellDate = new Date(cellDate.setDate(dateDay + 1));
                        }
                    }
                    month += 1;
                    firstDayOfMonth = new Date(year, month, 1);
                    year = firstDayOfMonth.getFullYear();
                    month = firstDayOfMonth.getMonth();
                    cellDate = new Date(year, month, 1 - (firstDayOfMonth.getDay() - startDay + 7) % 7);
                }
            }
            // 检验date
            function validateDate(date) {
                if (typeof date == 'string') {
                    return parseDate(date);
                } else {
                    return date;
                }
            }
            // 检验time
            function validateTime(date) {
                if (typeof date == 'string') {
                    var theDate = parseDate(date), timeReg = /\s[0-2]?[0-9]:[0-5]?[0-9]/, _time = date.match(timeReg);
                    if (theDate && _time && _time.length) {
                        var time = _time[0].split(':'), hour = +time[0], minute = +time[1];
                        theDate = new Date(theDate.getFullYear(), theDate.getMonth(), theDate.getDate(), hour, minute);
                    }
                    return theDate;
                } else {
                    return date;
                }
            }
            return vmodel;
        };
    widget.regional = [];
    widget.regional['zh-CN'] = {
        holidayDate: initHoliday(holidayDate),
        dayNames: [
            '\u65E5',
            '\u4E00',
            '\u4E8C',
            '\u4E09',
            '\u56DB',
            '\u4E94',
            '\u516D'
        ],
        //该变量被注册到了vm中，同时在方法中使用
        weekDayNames: [
            '\u5468\u65E5',
            '\u5468\u4E00',
            '\u5468\u4E8C',
            '\u5468\u4E09',
            '\u5468\u56DB',
            '\u5468\u4E94',
            '\u5468\u516D'
        ],
        monthNames: [
            '\u4E00\u6708',
            '\u4E8C\u6708',
            '\u4E09\u6708',
            '\u56DB\u6708',
            '\u4E94\u6708',
            '\u516D\u6708',
            '\u4E03\u6708',
            '\u516B\u6708',
            '\u4E5D\u6708',
            '\u5341\u6708',
            '\u5341\u4E00\u6708',
            '\u5341\u4E8C\u6708'
        ],
        monthNamesShort: [
            '\u4E00\u6708',
            '\u4E8C\u6708',
            '\u4E09\u6708',
            '\u56DB\u6708',
            '\u4E94\u6708',
            '\u516D\u6708',
            '\u4E03\u6708',
            '\u516B\u6708',
            '\u4E5D\u6708',
            '\u5341\u6708',
            '\u5341\u4E00\u6708',
            '\u5341\u4E8C\u6708'
        ],
        closeText: 'Done',
        prevText: '\u524D',
        prevDayText: '\u6628\u5929',
        nextText: '\u540E',
        nextDayText: '\u660E\u5929',
        dayAfterTomorrow: '\u540E\u5929',
        currentDayText: '\u4ECA\u5929',
        currentDayFullText: '\u4ECA\u5929',
        showMonthAfterYear: true,
        titleFormat: function (year, month) {
            return year + '\u5E74' + ' ' + this.monthNames[month];
        },
        dayText: '\u5929',
        weekText: '\u5468',
        yearText: '\u5E74',
        monthText: '\u6708',
        timerText: '\u65F6\u95F4',
        hourText: '\u65F6',
        minuteText: '\u5206',
        nowText: '\u73B0\u5728',
        confirmText: '\u786E\u5B9A'
    };
    //设置默认语言包
    widget.defaultRegional = widget.regional['zh-CN'];
    widget.version = 1;
    widget.defaults = {
        startDay: 1,
        //@config 设置每一周的第一天是哪天，0代表Sunday，1代表Monday，依次类推, 默认从周一开始
        minute: 0,
        //@config 设置time的默认minute
        hour: 0,
        //@config 设置time的hour
        width: 90,
        //@config 设置日历框宽度
        showTip: true,
        //@config 是否显示节日提示
        disabled: false,
        //@config 是否禁用日历组件
        changeMonthAndYear: false,
        //@config 是否可以通过下拉框选择月份或者年份
        mobileMonthAndYear: false,
        //@config PC端可以通过设置changeMonthAndYear为true使用dropdown的形式选择年份或者月份，但是移动端只能通过设置mobileMonthAndYear为true来选择月份、年份
        showOtherMonths: false,
        //@config 是否显示非当前月的日期
        numberOfMonths: 1,
        //@config 一次显示的日历月份数, 默认一次显示一个
        allowBlank: false,
        //@config 是否允许日历框为空
        minDate: null,
        //@config 最小的可选日期，可以配置为Date对象，也可以是yyyy-mm-dd格式的字符串，或者当分隔符是“/”时，可以是yyyy/mm/dd格式的字符串
        maxDate: null,
        //@config 最大的可选日期，可以配置为Date对象，也可以是yyyy-mm-dd格式的字符串，或者当分隔符是“/”时，可以是yyyy/mm/dd格式的字符串
        stepMonths: 1,
        //@config 当点击next、prev链接时应该跳过几个月份, 默认一个月份
        toggle: false,
        //@config 设置日历的显示或者隐藏，false隐藏，true显示
        separator: '-',
        //@config 日期格式的分隔符,默认“-”，可以配置为"/"，而且默认日期格式必须是yyyy-mm-dd
        calendarLabel: '\u9009\u62E9\u65E5\u671F',
        //@config 日历组件的说明label
        /**
         * @config {Function} 当month或者year更新时调用的回调
         * @param year {Number} 当前日期的year
         * @param month {Number} 当前日期的month(0-11)
         * @param vmodel {Number} 日历组件对应vmodel
         */
        onChangeMonthYear: avalon.noop,
        /**
         * @config {Function} 格式化输出日期单元格内容
         * @param date {Date} 当前的日期
         * @param vmodel {Vmodel} 日历组件对应vmodel
         * @param dateItem {Object} 对应的包含日期相关信息的对象
         */
        dateCellRender: false,
        // 是否可以自定义日历单元格内容
        watermark: true,
        //@config 是否显示水印文字
        zIndex: -1,
        //@config设置日历的z-index
        showDatepickerAlways: false,
        //@config是否总是显示datepicker
        timer: false,
        //@config 是否在组件中可选择时间
        /**
         * @config {Function} 选中日期后的回调
         * @param date {String} 当前选中的日期
         * @param vmodel {Object} 当前日期组件对应的Vmodel
         * @param data {Object} 绑定组件的元素的data属性组成的集合
         */
        onSelect: avalon.noop,
        /**
         * @config {Function} 日历关闭的回调
         * @param date {Object} 当前日期
         * @param vmodel {Object} 当前日期组件对应的Vmodel
         */
        onClose: avalon.noop,
        /**
         * @config {Function} 在设置了timer为true时，选择日期、时间后的回调
         * @param vmodel {Object} 当前日期组件对应的Vmodel
         */
        onSelectTime: avalon.noop,
        /**
         * @config {Function} 将符合日期格式要求的字符串解析为date对象并返回，不符合格式的字符串返回null,用户可以根据自己需要自行配置解析过程
         * @param str {String} 要解析的日期字符串
         * @returns {Date} Date格式的日期
         */
        parseDate: parseDate,
        /**
         * @config {Function} 将日期对象转换为符合要求的日期字符串
         * @param date {Date} 要格式化的日期对象
         * @returns {String} 格式化后的日期
         */
        formatDate: function (date) {
            if (avalon.type(date) !== 'date') {
                avalon.log('the type of ' + date + 'must be Date');
                return '';
            }
            var separator = this.separator, year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
            return year + separator + this.formatNum(month + 1, 2) + separator + this.formatNum(day, 2);
        },
        // 格式化month和day，使得其始终为两位数，比如2为02,1为01
        formatNum: function (n, length) {
            n = String(n);
            for (var i = 0, len = length - n.length; i < len; i++)
                n = '0' + n;
            return n;
        },
        widgetElement: '',
        // accordion容器
        formatErrorTip: '\u683C\u5F0F\u9519\u8BEF',
        getTemplate: function (str, options) {
            return str;
        }
    };
    avalon.filters.timer = function (str) {
        var num = +str;
        if (num >= 0 && num <= 9) {
            str = '0' + str;
        }
        return str;
    };
    function cleanDate(date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    // 获取节日信息并设置相应显示，提供中文语言包对于节日的支持
    function initHoliday(data) {
        var _table = {}, _data = [];
        for (var k in data) {
            var v = data[k], _date = parseDate(k);
            if (_date) {
                v.date = _date;
                _data.push(v);
            }
        }
        _data.sort(function (a, b) {
            return (a.dayIndex || 0) - (b.dayIndex || 0);
        });
        for (var k = 0, len = _data.length; k < len; k++) {
            var v = _data[k], _date = v.date, beforeTime = v.beforeTime || 0, afterTime = v.afterTime || 0;
            _date.setDate(_date.getDate() - beforeTime - 1);
            for (var i = -v.beforeTime; i < afterTime + 1; i++) {
                _date.setDate(_date.getDate() + 1);
                _table[_date.getTime()] = {
                    text: v['holidayName'] + (i < 0 ? '\u524D' + -i + '\u5929' : i > 0 ? '\u540E' + i + '\u5929' : ''),
                    cellClass: i === 0 && v['holidayClass'] || '',
                    cellText: i === 0 && v['holidayText'] || ''
                };
            }
        }
        return _table;
    }
    function parseDate(str) {
        if (!str) {
            return null;
        }
        if (avalon.type(str) === 'date')
            return str;
        var separator = this.separator || '-';
        var reg = '^(\\d{4})' + separator + '(\\d{1,2})' + separator + '(\\d{1,2})[\\s\\w\\W]*$';
        reg = new RegExp(reg);
        var x = str.match(reg);
        return x ? new Date(x[1], x[2] * 1 - 1, x[3]) : null;
    }
    // 解析传入日期，如果是节日或者节日前三天和后三天只能，会相应的显示节日前几天信息，如果是今天就显示今天，其他情况显示日期对应的是周几
    function getDateTip(curDate) {
        if (!curDate)
            return;
        //如果没有传递语言设置，使用默认的语言包
        var regional;
        if (this.$id && this.regional) {
            regional = this.regional;
        } else {
            regional = widget.defaultRegional;
        }
        var holidays = regional.holidayDate || {};
        var now = cleanDate(new Date()).getTime(), curTime = curDate.getTime(), dayNames = regional.dayNames;
        if (now == curTime) {
            return {
                text: regional.currentDayFullText,
                cellClass: 'c_today',
                cellText: regional.currentDayText
            };
        } else if (now == curTime - ONE_DAY) {
            return {
                text: regional.nextDayText,
                cellClass: ''
            };
        } else if (now == curTime - ONE_DAY * 2) {
            return {
                text: regional.dayAfterTomorrow,
                cellClass: ''
            };
        }
        var tip = holidays && holidays[curDate.getTime()];
        if (!tip) {
            return { text: regional.weekDayNames[curDate.getDay()] };
        } else {
            return tip;
        }
    }
    ;
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "46f100b533906080570a5a161534f03d" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e4c8067366549941367e78f7d5333d37" , 
        filename : "avalon.coupledatepicker.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'],
sourceHTML = "<div class=\"oni-coupledatepicker-item\">\n    <input\n    ms-widget=\"datepicker, $, $fromConfig\"\n    ms-duplex=\"MS_OPTION_FROMDUPLEX\"/>   \n</div>\n<span class=\"label\">-</span>\n<div class=\"oni-coupledatepicker-item\">\n    <input \n    ms-widget=\"datepicker, $, $toConfig\"\n    ms-duplex=\"MS_OPTION_TODUPLEX\"/>\n</div>\nMS_OPTION_TEMPLATE\n<input\n    ms-widget=\"datepicker, $, $fromConfig\"\n    ms-duplex=\"MS_OPTION_FROMDUPLEX\"/>   \n<input \n    ms-widget=\"datepicker, $, $toConfig\"\n    ms-duplex=\"MS_OPTION_TODUPLEX\"/>";
__context.____MODULES['46f100b533906080570a5a161534f03d'];

module.exports = (
function () {
    var widget = avalon.ui.coupledatepicker = function (element, data, vmodels) {
            var options = data.coupledatepickerOptions, parseDate = typeof options.parseDate === 'function' && options.parseDate.bind(options) || widget.defaults.parseDate.bind(options), formatDate = typeof options.formatDate === 'function' && options.formatDate.bind(options) || widget.defaults.formatDate.bind(options), duplex = options.duplex && options.duplex.split(','), container = options.container, rules = options.rules, _toMinDate = '', _toMaxDate = '', rangeRules = '', duplexFrom, duplexTo, inputFromVM, inputToVM;
            // 获取rules配置对象
            if (rules && avalon.type(rules) === 'string') {
                var ruleVM = avalon.getModel(rules, vmodels);
                rules = ruleVM[1][ruleVM[0]];
            }
            if (rules && avalon.type(rules) === 'object') {
                // 让rules对象的toMinDate、toMaxDate、fromMinDate、fromMaxDate是可监控的属性
                rules = avalon.mix({}, rules.$model || rules);
                rules.toMinDate = rules.toMinDate || '';
                rules.toMaxDate = rules.toMaxDate || '';
                rules.fromMinDate = rules.fromMinDate || '';
                rules.fromMaxDate = rules.fromMaxDate || '';
            } else {
                rules = '';
            }
            options.rules = rules;
            _toMinDate = rules.toMinDate;
            _toMaxDate = rules.toMaxDate;
            rangeRules = options.rules && options.rules.rules || '';
            rangeRules = rangeRules.length > 0 ? rangeRules.split(',') : [];
            if (typeof container === 'string') {
                container = container.split(',');
                container[0] = document.getElementById(container[0]);
                container[1] = document.getElementById(container[1]);
            }
            if (!container.length) {
                container = element.getElementsByTagName('div');
            }
            options.container = container = container.length ? avalon.slice(container, 0) : container;
            options.template = initValues(options.getTemplate(sourceHTML, options));
            var vmodel = avalon.define(data.coupledatepickerId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'container',
                        'calendarWrapper',
                        'template',
                        'changeMonthAndYear',
                        'startDay',
                        'fromLabel',
                        'toLabel',
                        'duplex'
                    ];
                    vm.widgetElement = element;
                    vm.fromSelectCal = function (date) {
                        if (vmodel.rules && vmodel.rules.rules) {
                            applyRules(date);
                        }
                    };
                    vm.getDates = function () {
                        var inputFromValue = duplexFrom ? duplexFrom[1][duplexFrom[0]] : vmodel.inputFromValue, inputFromDate = parseDate(inputFromValue), inputToValue = duplexTo ? duplexTo[1][duplexTo[0]] : vmodel.inputToValue, inputToDate = parseDate(inputToValue);
                        return inputFromDate && inputToDate && [
                            inputFromDate,
                            inputToDate
                        ] || null;
                    };
                    vm.$fromConfig = {
                        changeMonthAndYear: options.changeMonthAndYear,
                        startDay: options.startDay,
                        parseDate: parseDate,
                        formatDate: formatDate,
                        minDate: 'rules.fromMinDate',
                        maxDate: 'rules.fromMaxDate',
                        onSelect: vm.fromSelectCal,
                        calendarLabel: options.fromLabel,
                        onInit: function (fromVM) {
                            inputFromVM = fromVM;
                            options.disabled && (inputFromVM.disabled = true);
                        }
                    };
                    vm.$toConfig = {
                        changeMonthAndYear: options.changeMonthAndYear,
                        startDay: options.startDay,
                        parseDate: parseDate,
                        formatDate: formatDate,
                        minDate: 'rules.toMinDate',
                        maxDate: 'rules.toMaxDate',
                        calendarLabel: options.toLabel,
                        onInit: function (toVM) {
                            inputToVM = toVM;
                            options.disabled && (inputToVM.disabled = true);
                        }
                    };
                    vm.$init = function (continueScan) {
                        var template = options.template.split('MS_OPTION_TEMPLATE'), containerTemp = template[0], inputOnlyTemp = template[1], calendar = null, inputOnly = null, fromInput = null, toInput = null, fromContainer = null, toContainer = null, calendarTemplate = '', inputFromValue = '', scanVM = [vmodel];
                        avalon(element).addClass('oni-coupledatepicker');
                        if (duplexFrom) {
                            inputFromValue = duplexFrom[1][duplexFrom[0]];
                            scanVM.push(duplexFrom[1]);
                        }
                        if (duplexTo) {
                            scanVM.push(duplexTo[1]);
                        }
                        applyRules(inputFromValue && parseDate(inputFromValue));
                        if (container.length) {
                            calendarTemplate = inputOnlyTemp;
                            inputOnly = avalon.parseHTML(inputOnlyTemp);
                            fromInput = inputOnly.firstChild;
                            toInput = inputOnly.lastChild;
                            fromContainer = container[0];
                            toContainer = container[1];
                            fromContainer.appendChild(fromInput);
                            toContainer.appendChild(toInput);
                            avalon(fromContainer).addClass('oni-coupledatepicker-item');
                            avalon(toContainer).addClass('oni-coupledatepicker-item');
                        } else {
                            calendarTemplate = containerTemp;
                            calendar = avalon.parseHTML(calendarTemplate);
                            element.appendChild(calendar);
                        }
                        avalon.scan(element, scanVM.concat(vmodels));
                        if (typeof options.onInit === 'function') {
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    vm.$remove = function () {
                        element.innerHTML = element.textContent = '';
                    };
                });
            vmodel.$watch('disabled', function (val) {
                inputFromVM.disabled = val;
                inputToVM.disabled = val;
            });
            var _c = {
                    '+M': function (time, n) {
                        var _d = time.getDate();
                        time.setMonth(time.getMonth() + n);
                        if (time.getDate() !== _d) {
                            time.setDate(0);
                        }
                    },
                    '-M': function (time, n) {
                        var _d = time.getDate();
                        time.setMonth(time.getMonth() - n);
                        if (time.getDate() !== _d) {
                            time.setDate(0);
                        }
                    },
                    '+D': function (time, n) {
                        time.setDate(time.getDate() + n);
                    },
                    '-D': function (time, n) {
                        time.setDate(time.getDate() - n);
                    },
                    '+Y': function (time, n) {
                        time.setFullYear(time.getFullYear() + n);
                    },
                    '-Y': function (time, n) {
                        time.setFullYear(time.getFullYear() - n);
                    }
                };
            function initValues(template) {
                if (duplex) {
                    var duplexLen = duplex.length, duplexVM1 = avalon.getModel(duplex[0].trim(), vmodels), duplexVM2 = duplexLen === 1 ? null : avalon.getModel(duplex[1].trim(), vmodels), duplexVal1 = duplexVM1[1][duplexVM1[0]], duplexVal2 = duplexVM2 ? duplexVM2[1][duplexVM2[0]] : '';
                    duplexFrom = duplexVM1;
                    duplexTo = duplexVM2;
                    setValues(duplexLen, duplexVal1, duplexVal2);
                    if (duplexFrom) {
                        template = template.replace(/MS_OPTION_FROMDUPLEX/g, duplex[0].trim());
                    }
                    if (duplexTo) {
                        template = template.replace(/MS_OPTION_TODUPLEX/g, duplex[1].trim());
                    }
                }
                if (!duplexFrom) {
                    options.inputFromValue = '';
                    template = template.replace(/MS_OPTION_FROMDUPLEX/g, 'inputFromValue');
                }
                if (!duplexTo) {
                    options.inputToValue = '';
                    template = template.replace(/MS_OPTION_TODUPLEX/g, 'inputToValue');
                }
                return template;
            }
            function setValues(len, from, to) {
                if (len) {
                    if (len == 2) {
                        if (duplexFrom) {
                            duplexFrom[1][duplexFrom[0]] = from && parseDate(from) && from || '';
                        } else {
                            vmodel.inputFromValue = from && parseDate(from) && from || '';
                        }
                        if (duplexTo) {
                            duplexTo[1][duplexTo[0]] = to && parseDate(to) && to || '';
                        } else {
                            vmodel.inputToValue = to && parseDate(to) && to || '';
                        }
                    } else if (len == 1) {
                        if (duplexFrom) {
                            duplexFrom[1][duplexFrom[0]] = from && parseDate(from) && from || '';
                        } else {
                            vmodel.inputFromValue = from && parseDate(from) && from || '';
                        }
                    }
                }
            }
            function applyRules(date) {
                var minDate = _toMinDate && parseDate(_toMinDate), maxDate = _toMaxDate && parseDate(_toMaxDate), inputToValue = duplexTo ? duplexTo[1][duplexTo[0]] : vmodel.inputToValue, rules = vmodel.rules, minDateRule, maxDateRule, inputToDate, df = {};
                if (!date)
                    return;
                for (var i = 0, type = [
                            'defaultDate',
                            'minDate',
                            'maxDate'
                        ]; i < type.length; i++) {
                    if (rangeRules[i]) {
                        df[type[i]] = calcDate(rangeRules[i], date);
                    }
                }
                minDateRule = df['minDate'];
                maxDateRule = df['maxDate'];
                minDate = (minDateRule ? minDateRule.getTime() : -1) > (minDate ? minDate.getTime() : -1) ? minDateRule : minDate;
                maxDate = (maxDateRule ? maxDateRule.getTime() : Number.MAX_VALUE) > (maxDate ? maxDate.getTime() : Number.MAX_VALUE) ? maxDate : maxDateRule;
                if (!inputToValue && df['defaultDate']) {
                    inputToValue = formatDate(df['defaultDate']);
                }
                if (minDate) {
                    var toMinDateFormat = formatDate(minDate);
                    if (!inputToValue) {
                        inputToValue = toMinDateFormat;
                    }
                }
                inputToDate = inputToValue && parseDate(inputToValue);
                if (inputToDate && isDateDisabled(inputToDate, minDate, maxDate)) {
                    inputToValue = toMinDateFormat;
                }
                if (duplexTo) {
                    duplexTo[1][duplexTo[0]] = inputToValue;
                } else {
                    vmodel.inputToValue = inputToValue;
                }
                if (minDate) {
                    rules.toMinDate = cleanDate(minDate);
                }
                if (maxDate) {
                    rules.toMaxDate = cleanDate(maxDate);
                }
            }
            // 根据minDate和maxDate的设置判断给定的日期是否不可选
            function isDateDisabled(date, minDate, maxDate) {
                var time = date.getTime();
                if (minDate && time < minDate.getTime()) {
                    return true;
                } else if (maxDate && time > maxDate.getTime()) {
                    return true;
                }
                return false;
            }
            function calcDate(desc, date) {
                var time, _date, re = /([+-])?(\d+)([MDY])?/g, arr, key;
                desc = (desc || '').toString();
                arr = re.exec(desc);
                key = arr && (arr[1] || '+') + (arr[3] || 'D');
                time = date ? date : new Date();
                _date = new Date(typeof time === 'string' ? parseDate(time) : time);
                if (key && _c[key]) {
                    _c[key](_date, arr[2] * 1);
                }
                return _date;
            }
            return vmodel;
        };
    // 将日期时间转为00:00:00
    function cleanDate(date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    widget.version = 1;
    widget.defaults = {
        container: [],
        //必选，渲染的容器，每个元素类型为 {Element|JQuery|String}
        fromLabel: '\u9009\u62E9\u8D77\u59CB\u65E5\u671F',
        //@config 设置起始日期日历框的说明文字
        toLabel: '\u9009\u62E9\u7ED3\u675F\u65E5\u671F',
        //@config 设置结束日期日历框的说明文字
        changeMonthAndYear: false,
        widgetElement: '',
        // accordion容器
        disabled: false,
        //@config 设置是否禁用组件
        startDay: 1,
        //@config 设置每一周的第一天是哪天，0代表Sunday，1代表Monday，依次类推, 默认从周一开始
        separator: '-',
        //@config 日期格式的分隔符，可以是"/"或者你希望的符号，但如果是除了"-"和"/"之外的字符则需要和parseDate和formatDate配合使用，以便组件能正常运作
        /**
         * @config 设置双日历框的工作规则
            <pre class="brush:javascript;gutter:false;toolbar:false">
            {
                rules: 'null, 0D, 8D',
                fromMinDate: '2014-05-02',
                fromMaxDate: '2014-06-28',
                toMinDate: '2014-06-01',
                toMaxDate: '2014-07-12'
            }
            </pre> 
         * 可以是绑定组件时定义的配置对象中的一个rules对象，也可以是一个字符串，指向一个上述对象。
         * 其中对象中的rules属性定义结束初始日期异常时默认显示的日期、初始日期和结束日子之间最小相隔天数、最大相隔天数，格式是[+-]\d[DMY]，分别代表几天、几个月或者几年，也可以附加+或者-号，+号表示正数几天，-号表示负数几天
         * fromMinDate代表起始日期可以设置的最小日期
         * fromMaxDate代表起始日期可以设置的最大日期
         * toMinDate代表结束日期可以设置的最小日期
         * toMaxDate代表结束日期可以设置的最大日期
         */
        rules: '',
        /**
         * @config {Function} 将符合日期格式要求的字符串解析为date对象并返回，不符合格式的字符串返回null,用户可以根据自己需要自行配置解析过程
         * @param str {String} 需要解析的日期字符串
         * @returns {Date} 解析后的日期对象 
         */
        parseDate: function (str) {
            if (avalon.type(str) === 'date')
                return str;
            var separator = this.separator;
            var reg = '^(\\d{4})' + separator + '(\\d{1,2})' + separator + '(\\d{1,2})$';
            reg = new RegExp(reg);
            var x = str.match(reg);
            return x ? new Date(x[1], x[2] * 1 - 1, x[3]) : null;
        },
        /**
         * @config {Function} 将日期对象转换为符合要求的日期字符串
         * @param date {Date} 需要格式化的日期对象
         * @returns {String} 格式化后的日期字符串 
         */
        formatDate: function (date) {
            if (avalon.type(date) !== 'date') {
                avalon.log('the type of ' + date + 'must be Date');
                return '';
            }
            var separator = this.separator, year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
            return year + separator + this.formatNum(month + 1, 2) + separator + this.formatNum(day, 2);
        },
        formatNum: function (n, length) {
            n = String(n);
            for (var i = 0, len = length - n.length; i < len; i++)
                n = '0' + n;
            return n;
        },
        getTemplate: function (str, options) {
            return str;
        }
    };
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "e4c8067366549941367e78f7d5333d37" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "37f8e4f4e81b95d2222fbfa0b57763c6" , 
        filename : "avalon.daterangepicker.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'],
sourceHTML = "<div class=\"oni-daterangepicker\"\n     ms-css-width=\"dateRangeWidth\">\n    <div class=\"oni-datepicker-range-input\" \n        ms-click=\"_toggleDatepicker(toggle, $event)\"\n        ms-class=\"oni-state-active:toggle\"\n        ms-hover=\"oni-state-hover\"\n        >\n        <div class=\"oni-datepicker-input js-input\"\n             ms-class=\"oni-datepicker-input-disabled: disabled\">{{label|html}}</div>\n        <div class=\"oni-datepicker-icon-wrap\">\n            <i class=\"oni-datepicker-icon oni-icon oni-icon-angle-up\" ms-visible=\"toggle\">&#xf028;</i>\n            <i class=\"oni-datepicker-icon oni-icon oni-icon-angle-down\" ms-visible=\"!toggle\">&#xf032;</i>\n        </div>\n    </div>\n    <div class=\"oni-daterangepicker-content\">\n        <div class=\"oni-datepicker-groups\" \n            ms-visible=\"toggle\"\n            ms-click=\"_updateMsg\">\n            <div class=\"oni-daterangepicker-quick-operation\" ms-if=\"shortcut\">\n                <span ms-click=\"quickOperation('today')\">今天</span>\n                <span ms-click=\"quickOperation('lastDay')\">昨天</span>\n                <span ms-click=\"quickOperation('lastSeventDays')\">过去七天</span>\n                <span ms-click=\"quickOperation('currentMonth')\">本月</span>\n                <span ms-click=\"quickOperation('lastMonth')\">上个月</span>\n            </div>\n            <div class=\"oni-datepicker-group-first oni-datepicker-group\">\n                <input style=\"display:none\" \n                       ms-data-container=\"container\"\n                       ms-data-input=\"inputElement\"\n                       ms-data-calenderwrapper=\"calendarWrapper\"/>\n            </div>\n            <div class=\"oni-datepicker-group-second oni-datepicker-group\">\n                <input style=\"display:none\" \n                       ms-data-container=\"container\"\n                       ms-data-input=\"inputElement\"\n                       ms-data-calenderwrapper=\"calendarWrapper\"/>\n            </div>\n            <div class=\"oni-calendarbox-footer oni-calendarbox-footer-small oni-helper-clearfix\">\n                <div class=\"oni-calendarbox-msg js-msg\">{{msg|html}}</div>\n                <div class=\"oni-calendarbox-btns\">\n                    <button type=\"button\" ms-widget=\"button\" data-button-color=\"success\" data-button-size=\"small\" class=\"oni-btn\"\n                            ms-hover=\"oni-state-hover\"\n                            ms-click=\"_selectDate\">确定</button>\n                    <button type=\"button\" ms-widget=\"button\" class=\"oni-btn\" data-button-size=\"small\"\n                    ms-click=\"_cancelSelectDate\">取消</button>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
__context.____MODULES['ebe019d268672b2e5098adbedeb01097'];
__context.____MODULES['46f100b533906080570a5a161534f03d'];

module.exports = (
function () {
    var calendarTemplate = sourceHTML;
    var widget = avalon.ui.daterangepicker = function (element, data, vmodels) {
            var options = data.daterangepickerOptions, datesDisplayFormat = options.opts && options.opts.datesDisplayFormat, parseDate = typeof options.parseDate === 'function' && options.parseDate.bind(options) || widget.defaults.parseDate.bind(options), formatDate = typeof options.formatDate === 'function' && options.formatDate.bind(options) || widget.defaults.formatDate.bind(options), duplex = options.duplex && options.duplex.split(','),
                //options.duplex保存起始日期和结束日期初始化值的引用，逗号分隔
                _confirmClick = false,
                //判断是否点击了确定按钮，没点击为false，点击为true
                rules = options.rules,
                //日期选择框起始日期和结束日期之间关系的规则
                fromSelected = null, inputFromVM = null, inputToVM = null, _toMinDate = '',
                //保存rules指向的对象的toMinDate属性值，以便于rules属性计算所得的minDate做比较
                _toMaxDate = '',
                //保存rules指向的对象的toMaxDate属性值，以便于rules属性计算所得的maxDate做比较
                inputFrom,
                //绑定datepicker组件的初始日期输入域元素的引用
                inputTo,
                //绑定datepicker组件的结束日期输入域元素的引用
                duplexFrom, duplexTo, _oldValue,
                //保存最近一次选择的起始日期和结束日期组成的日期对象数组，因为当选择了日期但没有点确定按钮时，日期选择范围不改变，相应的对应的日历默认输入域也应该恢复到最近一次的选择
                rangeRules;
            // 获取用户定义的模拟输入框显示内容形式的方法
            if (datesDisplayFormat && typeof datesDisplayFormat === 'function') {
                options.datesDisplayFormat = datesDisplayFormat;
            }
            datesDisplayFormat = options.datesDisplayFormat;
            // 获取rules配置对象
            if (rules && avalon.type(rules) === 'string') {
                var ruleVM = avalon.getModel(rules, vmodels);
                rules = ruleVM[1][ruleVM[0]];
            }
            if (rules && avalon.type(rules) === 'object') {
                // 让rules对象的toMinDate、toMaxDate、fromMinDate、fromMaxDate是可监控的属性
                rules = avalon.mix({}, rules.$model || rules);
                rules.toMinDate = rules.toMinDate || '';
                rules.toMaxDate = rules.toMaxDate || '';
                rules.fromMinDate = rules.fromMinDate || '';
                rules.fromMaxDate = rules.fromMaxDate || '';
            } else {
                rules = '';
            }
            options.rules = rules;
            _toMinDate = rules.toMinDate;
            _toMaxDate = rules.toMaxDate;
            rangeRules = options.rules && options.rules.rules || '';
            rangeRules = rangeRules.length > 0 ? rangeRules.split(',') : [];
            options.template = options.getTemplate(calendarTemplate, options);
            initValues();
            var vmodel = avalon.define(data.daterangepickerId, function (vm) {
                    avalon.mix(vm, options);
                    vm.msg = '';
                    vm.$skipArray = [
                        'widgetElement',
                        'container',
                        'inputElement',
                        'calendarWrapper',
                        'fromLabel',
                        'toLabel',
                        'duplex'
                    ];
                    vm.widgetElement = element;
                    vm.toggle = false;
                    vm.container = null;
                    vm.inputElement = null;
                    vm.calendarWrapper = null;
                    // 切换组件的显示隐藏
                    vm._toggleDatepicker = function (val) {
                        if (!vmodel.disabled) {
                            vmodel.toggle = !val;
                        }
                    };
                    // 更新日期范围选择框下方的说明文字
                    vm._updateMsg = function (event) {
                        event.stopPropagation();
                    };
                    // 点击确定按钮确定日期选择范围
                    vm._selectDate = function () {
                        var inputFromValue = inputFrom.value, inputToValue = inputTo.value, inputFromDate = parseDate(inputFromValue), inputToDate = parseDate(inputToValue), label = datesDisplayFormat(options.defaultLabel, inputFromValue, inputToValue), p = document.createElement('p'), $p = avalon(p), labelWidth = 0, msg = '';
                        if (!inputToDate || !inputFromDate) {
                            msg = !inputFromDate && !inputToDate ? '\u8BF7\u9009\u62E9\u8D77\u59CB\u65E5\u671F\u548C\u7ED3\u675F\u65E5\u671F' : !inputFromDate ? '\u8BF7\u9009\u62E9\u8D77\u59CB\u65E5\u671F' : '\u8BF7\u9009\u62E9\u7ED3\u675F\u65E5\u671F';
                            msg = '<span style=\'color:#f55\'>' + msg + '</span>';
                            vmodel.msg = msg;
                            return false;
                        }
                        vmodel.label = label;
                        _confirmClick = true;
                        _oldValue = [
                            inputFromDate,
                            inputToDate
                        ];
                        vmodel.toggle = false;
                        $p.css({
                            position: 'absolute',
                            visibility: 'hidden',
                            height: 0,
                            'font-size': '12px'
                        });
                        p.innerHTML = label;
                        document.body.appendChild(p);
                        labelWidth = $p.width() + 30;
                        document.body.removeChild(p);
                        if (labelWidth > vmodel.dateRangeWidth) {
                            vmodel.dateRangeWidth = labelWidth;
                        }
                        options.onSelect.call(vmodel, inputFromDate, inputToDate, _oldValue, vmodel, avalon(element).data());
                    };
                    // 点击取消按钮隐藏日历框
                    vm._cancelSelectDate = function () {
                        fromSelected = false;
                        vmodel.toggle ? vmodel.toggle = false : 0;
                    };
                    vm.getDates = function () {
                        var inputFromValue = duplexFrom ? duplexFrom[1][duplexFrom[0]] : vmodel.inputFromValue, inputFromDate = parseDate(inputFromValue), inputToValue = duplexTo ? duplexTo[1][duplexTo[0]] : vmodel.inputToValue, inputToDate = parseDate(inputToValue);
                        return inputFromDate && inputToDate && [
                            inputFromDate,
                            inputToDate
                        ] || null;
                    };
                    // 设置日期范围框的起始日期和结束日期
                    vm.setDates = function (from, to, defaultLabel) {
                        var inputValues = to === void 0 ? [from] : [
                                from,
                                to
                            ], len = inputValues.length, inputFromDate = avalon.type(from) === 'date' ? from : parseDate(from), inputToDate = avalon.type(to) === 'date' ? to : parseDate(to);
                        if (len) {
                            vmodel.defaultLabel = defaultLabel || vmodel.defaultLabel;
                            setValues(len, from, to);
                        } else {
                            vmodel.label = '';
                        }
                        initMsgAndOldValue();
                        options.onSelect.call(vmodel, inputFromDate, inputToDate, _oldValue, vmodel, avalon(element).data());
                        _oldValue = [
                            inputFromDate,
                            inputToDate
                        ];
                    };
                    vm._fixDate = function (dateFrom, dateTo, minDate, maxDate) {
                        var from = new Date(dateFrom.getTime()), to = new Date(dateTo.getTime());
                        if (minDate) {
                            from = new Date(Math.max(minDate.getTime(), from));
                        }
                        if (maxDate) {
                            to = new Date(Math.min(maxDate.getTime(), to));
                        }
                        return [
                            from,
                            to
                        ];
                    };
                    vm.quickOperation = function (instruction) {
                        var now = new Date(), fromDate = now, toDate = now, defaultLabel = '\u4ECA\u5929', minDate = vmodel.rules.fromMinDate, maxDate = vmodel.rules.toMaxDate, dateArr = [];
                        minDate = minDate && parseDate(minDate) || null;
                        maxDate = minDate && parseDate(maxDate) || null;
                        switch (instruction) {
                        case 'lastDay':
                            fromDate = toDate = new Date(now.setDate(now.getDate() - 1));
                            defaultLabel = '\u6628\u5929';
                            break;
                        case 'lastSeventDays':
                            fromDate = new Date();
                            fromDate = new Date(fromDate.setDate(fromDate.getDate() - 8));
                            toDate = new Date();
                            toDate = new Date(toDate.setDate(toDate.getDate() - 1));
                            defaultLabel = '\u8FC7\u53BB\u4E03\u5929';
                            dateArr = vmodel._fixDate(fromDate, toDate, minDate, maxDate);
                            fromDate = dateArr[0];
                            toDate = dateArr[1];
                            break;
                        case 'currentMonth':
                            defaultLabel = '\u672C\u6708';
                            fromDate = new Date();
                            fromDate = new Date(fromDate.setDate(1));
                            dateArr = vmodel._fixDate(fromDate, toDate, minDate, maxDate);
                            fromDate = dateArr[0];
                            toDate = dateArr[1];
                            break;
                        case 'lastMonth':
                            defaultLabel = '\u4E0A\u4E2A\u6708';
                            toDate = new Date();
                            toDate = new Date(toDate.setDate(-1));
                            fromDate = new Date(new Date(toDate.getTime()).setDate(1));
                            dateArr = vmodel._fixDate(fromDate, toDate, minDate, maxDate);
                            fromDate = dateArr[0];
                            toDate = dateArr[1];
                            break;
                        }
                        vmodel.setDates(fromDate, toDate, defaultLabel);
                        vmodel.toggle = false;
                    };
                    // 设置日期输入框的label
                    vm.setLabel = function (str) {
                        vmodel.label = str;
                    };
                    // 设置日历的禁用与否
                    vm.setDisabled = function (val) {
                        vmodel.disabled = val;
                    };
                    // 选择了初始日期之后根据rules的设置及时更新结束日期的选择范围
                    vm.fromSelectCal = function (date) {
                        if (vmodel.rules && vmodel.rules.rules) {
                            applyRules(date);
                        }
                        fromSelected = date;
                    };
                    vm.$fromConfig = {
                        type: 'range',
                        allowBlank: true,
                        parseDate: parseDate,
                        formatDate: formatDate,
                        onSelect: vm.fromSelectCal,
                        minDate: 'rules.fromMinDate',
                        maxDate: 'rules.fromMaxDate',
                        startDay: options.startDay,
                        calendarLabel: options.fromLabel,
                        onInit: function (fromVM) {
                            inputFromVM = fromVM;
                        }
                    };
                    vm.$toConfig = {
                        type: 'range',
                        allowBlank: true,
                        parseDate: parseDate,
                        formatDate: formatDate,
                        minDate: 'rules.toMinDate',
                        maxDate: 'rules.toMaxDate',
                        startDay: options.startDay,
                        calendarLabel: options.toLabel,
                        onInit: function (toVM) {
                            inputToVM = toVM;
                        }
                    };
                    vm.$init = function () {
                        var inputFromValue = '', daterangepicker, calendarWrapper, container, inputs;
                        daterangepicker = avalon.parseHTML(options.template).firstChild;
                        inputs = daterangepicker.getElementsByTagName('input');
                        container = daterangepicker.children[0];
                        calendarWrapper = daterangepicker.children[1];
                        inputFrom = inputs[0];
                        inputTo = inputs[1];
                        vmodel.container = container;
                        vmodel.inputElement = container;
                        vmodel.calendarWrapper = calendarWrapper;
                        element.appendChild(daterangepicker);
                        avalon.bind(document, 'click', function (event) {
                            var target = event.target;
                            if (!element.contains(target)) {
                                vmodel.toggle = false;
                            }
                        });
                        element.init = true;
                        if (duplexFrom) {
                            inputFromValue = duplexFrom[1][duplexFrom[0]];
                        }
                        applyRules(inputFromValue && parseDate(inputFromValue));
                        avalon.scan(element, [vmodel].concat(vmodels));
                        // 扫描完daterangepicker组件之后才扫描datepicker
                        avalon.nextTick(function () {
                            var duplexFromName = duplexFrom ? duplexFrom[0].trim() : 'inputFromValue', duplexToName = duplexTo ? duplexTo[0].trim() : 'inputToValue', fromVM = duplexFrom ? [
                                    vmodel,
                                    duplexFrom[1]
                                ] : [vmodel], toVM = duplexTo ? [
                                    vmodel,
                                    duplexTo[1]
                                ] : [vmodel];
                            inputFrom.setAttribute('ms-widget', 'datepicker, $, $fromConfig');
                            inputTo.setAttribute('ms-widget', 'datepicker, $, $toConfig');
                            inputFrom.setAttribute('ms-duplex', duplexFromName);
                            inputTo.setAttribute('ms-duplex', duplexToName);
                            avalon.scan(inputFrom, fromVM.concat(vmodels));
                            avalon.scan(inputTo, toVM.concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                //vmodels是不包括vmodel的
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        });
                    };
                    vm.$remove = function () {
                        element.innerHTML = element.textContent = '';
                    };
                });
            if (!duplexFrom) {
                vmodel.$watch('inputFromValue', function (val) {
                    updateMsg();
                });
            }
            if (!duplexTo) {
                vmodel.$watch('inputToValue', function (val) {
                    updateMsg();
                });
            }
            var _c = {
                    '+M': function (time, n) {
                        //+M表示相隔n个月
                        var _d = time.getDate();
                        time.setMonth(time.getMonth() + n);
                        if (time.getDate() !== _d) {
                            time.setDate(0);
                        }
                    },
                    '-M': function (time, n) {
                        //-M表示相隔n个月不过是追溯到以前的日前
                        var _d = time.getDate();
                        time.setMonth(time.getMonth() - n);
                        if (time.getDate() !== _d) {
                            time.setDate(0);
                        }
                    },
                    '+D': function (time, n) {
                        time.setDate(time.getDate() + n);
                    },
                    '-D': function (time, n) {
                        time.setDate(time.getDate() - n);
                    },
                    '+Y': function (time, n) {
                        time.setFullYear(time.getFullYear() + n);
                    },
                    '-Y': function (time, n) {
                        time.setFullYear(time.getFullYear() - n);
                    }
                };
            // 初始化日期范围值
            function initValues() {
                if (duplex) {
                    var duplexLen = duplex.length, duplexVM1 = avalon.getModel(duplex[0].trim(), vmodels), duplexVM2 = duplexLen === 1 ? null : avalon.getModel(duplex[1].trim(), vmodels), duplexVal1 = duplexVM1 && duplexVM1[1][duplexVM1[0]] || '', duplexVal2 = duplexVM2 ? duplexVM2[1][duplexVM2[0]] : '';
                    duplexFrom = duplexVM1;
                    duplexTo = duplexVM2;
                    setValues(duplexLen, duplexVal1, duplexVal2, true);
                    if (duplexFrom) {
                        duplexFrom[1].$watch(duplexFrom[0], function (val) {
                            updateMsg();
                        });
                    }
                    if (duplexTo) {
                        duplexTo[1].$watch(duplexTo[0], function (val) {
                            updateMsg();
                        });
                    }
                }
                if (!duplexFrom) {
                    options.inputFromValue = '';
                }
                if (!duplexTo) {
                    options.inputToValue = '';
                }
            }
            // 根据参数个数进行日期的初始日期设置
            function setValues(len, from, to, init) {
                var fromValue = '', toValue = '', dateranpickerVM = vmodel ? vmodel : options;
                if (len) {
                    if (len == 2) {
                        if (avalon.type(from) === 'date') {
                            fromValue = formatDate(from);
                        } else {
                            fromValue = from && parseDate(from) && from || '';
                        }
                        if (avalon.type(to) === 'date') {
                            toValue = formatDate(to);
                        } else {
                            if (init) {
                                toValue = to ? to : '';
                            } else {
                                toValue = to && parseDate(to) && to || '';
                            }
                        }
                        if (duplexFrom) {
                            duplexFrom[1][duplexFrom[0]] = fromValue;
                        } else {
                            dateranpickerVM.inputFromValue = fromValue;
                        }
                        if (duplexTo) {
                            duplexTo[1][duplexTo[0]] = toValue;
                        } else {
                            dateranpickerVM.inputToValue = toValue;
                        }
                        dateranpickerVM.label = datesDisplayFormat(dateranpickerVM.defaultLabel, fromValue, toValue);
                    } else if (len == 1) {
                        if (avalon.type(from) === 'date') {
                            fromValue = formatDate(from);
                        } else {
                            fromValue = from && parseDate(from) && from || '';
                        }
                        if (duplexFrom) {
                            duplexFrom[1][duplexFrom[0]] = fromValue;
                        } else {
                            dateranpickerVM.inputFromValue = fromValue;
                        }
                    }
                    toValue = toValue || (duplexTo ? duplexTo[1][duplexTo[0]] : dateranpickerVM.inputToValue);
                    if (!fromValue && !toValue) {
                        // 只要inputTo.value为null都提示不限日期
                        dateranpickerVM.label = '\u4E0D\u9650\u65E5\u671F';
                    }
                }
            }
            // 根据rules的设置确定结束日期可选的范围及默认值
            function applyRules(date) {
                var minDate = _toMinDate && parseDate(_toMinDate), maxDate = _toMaxDate && parseDate(_toMaxDate), inputFromValue = duplexFrom ? duplexFrom[1][duplexFrom[0]] : vmodel.inputFromValue, inputToValue = duplexTo ? duplexTo[1][duplexTo[0]] : vmodel.inputToValue, rules = vmodel.rules, df = {}, minDateRule, maxDateRule, initFromDate, inputToInitValue, initToDate, toMinDateFormat, inputToDate;
                if (!date) {
                    if (element.init) {
                        initMsgAndOldValue();
                        element.init = false;
                    } else {
                        rules.toMinDate = minDate || '';
                        rules.toMaxDate = maxDate || '';
                    }
                    return;
                }
                for (var i = 0, type = [
                            'defaultDate',
                            'minDate',
                            'maxDate'
                        ]; i < type.length; i++) {
                    if (rangeRules[i]) {
                        df[type[i]] = calcDate(rangeRules[i], date);
                    }
                }
                minDateRule = df['minDate'];
                maxDateRule = df['maxDate'];
                minDate = (minDateRule ? minDateRule.getTime() : -1) > (minDate ? minDate.getTime() : -1) ? minDateRule : minDate;
                maxDate = (maxDateRule ? maxDateRule.getTime() : Number.MAX_VALUE) > (maxDate ? maxDate.getTime() : Number.MAX_VALUE) ? maxDate : maxDateRule;
                if (element.init) {
                    initFromDate = parseDate(inputFromValue);
                    inputToInitValue = duplexTo && duplexTo[1][duplexTo[0]] || '';
                    initToDate = parseDate(inputToInitValue);
                    if (initFromDate && inputToInitValue && !initToDate) {
                        inputToValue = formatDate(df['defaultDate']);
                    }
                }
                if (minDate) {
                    toMinDateFormat = formatDate(minDate);
                    if (!inputToValue && !element.init) {
                        inputToValue = toMinDateFormat;
                    }
                }
                inputToDate = inputToValue && parseDate(inputToValue);
                if (inputToDate && isDateDisabled(inputToDate, minDate, maxDate)) {
                    inputToValue = toMinDateFormat;
                }
                if (duplexTo) {
                    duplexTo[1][duplexTo[0]] = inputToValue;
                } else {
                    vmodel.inputToValue = inputToValue;
                }
                if (minDate) {
                    rules.toMinDate = cleanDate(minDate);
                }
                if (maxDate) {
                    rules.toMaxDate = cleanDate(maxDate);
                }
                if (element.init) {
                    initMsgAndOldValue();
                    vmodel.label = datesDisplayFormat(options.defaultLabel, inputFromValue, inputToValue);
                    element.init = false;
                }
            }
            // 根据minDate和maxDate的设置判断给定的日期是否不可选
            function isDateDisabled(date, minDate, maxDate) {
                var time = date.getTime();
                if (minDate && time < minDate.getTime()) {
                    return true;
                } else if (maxDate && time > maxDate.getTime()) {
                    return true;
                }
                return false;
            }
            // 解析rules.rules属性，得到正确的日期值
            function calcDate(desc, date) {
                var time, re = /([+-])?(\d+)([MDY])?/g, arr, key, _date;
                desc = (desc || '').toString();
                arr = re.exec(desc);
                key = arr && (arr[1] || '+') + (arr[3] || 'D');
                time = date ? date : new Date();
                _date = new Date(typeof time === 'string' ? parseDate(time) : time);
                if (key && _c[key]) {
                    _c[key](_date, arr[2] * 1);
                }
                return _date;
            }
            function initMsgAndOldValue() {
                var inputFromValue = duplexFrom ? duplexFrom[1][duplexFrom[0]] : vmodel.inputFromValue, inputToValue = duplexTo ? duplexTo[1][duplexTo[0]] : vmodel.inputToValue;
                _oldValue = [
                    parseDate(inputFromValue),
                    parseDate(inputToValue)
                ];
                if (vmodel.label) {
                    updateMsg();
                }
            }
            // 根据选择的日期更新日历框下方的显示内容
            function updateMsg() {
                var inputFromValue = duplexFrom ? duplexFrom[1][duplexFrom[0]] : vmodel.inputFromValue, inputToValue = duplexTo ? duplexTo[1][duplexTo[0]] : vmodel.inputToValue, inputToDate = parseDate(inputToValue), msgFormat = options.opts && options.opts.msgFormat, inputFromDate = null, msg = '', day = 0;
                if (inputToValue && !inputToDate) {
                    if (duplexTo) {
                        duplexTo[1][duplexTo[0]] = '';
                    } else {
                        vmodel.inputToValue = '';
                    }
                }
                if (inputToValue && (inputFromValue || fromSelected)) {
                    inputFromDate = parseDate(inputFromValue) || fromSelected;
                    day = Math.floor((inputToDate.getTime() - inputFromDate.getTime()) / 1000 / 60 / 60 / 24 + 1);
                    if (msgFormat && typeof msgFormat === 'function') {
                        if (inputFromVM && inputToVM) {
                            msg = msgFormat(inputFromVM, inputToVM);
                        }
                    } else {
                        msg = '\u5DF2\u9009\u65F6\u95F4\u6BB5\uFF1A' + inputFromValue + ' \u81F3 ' + inputToValue + ' \u5171\u8BA1' + day + '\u5929';
                    }
                } else {
                    msg = '';
                }
                vmodel.msg = msg;
                fromSelected ? fromSelected = null : 0;
            }
            vmodel.$watch('toggle', function (val) {
                var fromOldValue = formatDate(_oldValue && _oldValue[0] || ''), toOldValue = formatDate(_oldValue && _oldValue[1] || '');
                if (!val && !_confirmClick) {
                    if (duplexTo && duplexTo[1][duplexTo[0]] != toOldValue) {
                        duplexTo[1][duplexTo[0]] = toOldValue;
                    } else if (!duplexTo && vmodel.inputToValue != toOldValue) {
                        vmodel.inputToValue = toOldValue;
                    }
                    if (duplexFrom && duplexFrom[1][duplexFrom[0]] != fromOldValue) {
                        duplexFrom[1][duplexFrom[0]] = fromOldValue;
                    } else if (!duplexFrom && vmodel.inputFromValue != fromOldValue) {
                        vmodel.inputFromValue = fromOldValue;
                    }
                } else if (_confirmClick) {
                    _confirmClick = false;
                }
                inputFromVM.toggle = val;
                inputToVM.toggle = val;
                if (val) {
                    avalon.type(vmodel.onOpen) === 'function' && vmodel.onOpen(vmodel);
                } else {
                    avalon.type(vmodel.onClose) === 'function' && vmodel.onClose(vmodel);
                }
            });
            return vmodel;
        };
    // 将日期时间转为00:00:00
    function cleanDate(date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    widget.version = 1;
    widget.defaults = {
        fromLabel: '\u9009\u62E9\u8D77\u59CB\u65E5\u671F',
        //@config 设置起始日期日历框的说明文字
        toLabel: '\u9009\u62E9\u7ED3\u675F\u65E5\u671F',
        //@config 设置结束日期日历框的说明文字
        /**
         * @config 设置双日历框的工作规则
            <pre class="brush:javascript;gutter:false;toolbar:false">
            {
                rules: 'null, 0D, 8D',
                fromMinDate: '2014-05-02',
                fromMaxDate: '2014-06-28',
                toMinDate: '2014-06-01',
                toMaxDate: '2014-07-12'
            }
            </pre> 
         * 可以是绑定组件时定义的配置对象中的一个rules对象，也可以是一个字符串，指向一个上述对象。
         * 其中对象中的rules属性定义结束初始日期异常时默认显示的日期、初始日期和结束日子之间最小相隔天数、最大相隔天数，格式是[+-]\d[DMY]，分别代表几天、几个月或者几年，也可以附加+或者-号，+号表示正数几天，-号表示负数几天
         * fromMinDate代表起始日期可以设置的最小日期
         * fromMaxDate代表起始日期可以设置的最大日期
         * toMinDate代表结束日期可以设置的最小日期
         * toMaxDate代表结束日期可以设置的最大日期
         */
        rules: '',
        label: '',
        //@config 模拟输入域的初始说明文字
        defaultLabel: '\u65E5\u671F\u8303\u56F4',
        //@config 选中日期之后，模拟输入域开始的说明文字
        disabled: false,
        //@config 设置是否禁用组件
        widgetElement: '',
        // accordion容器
        separator: '-',
        //@config 日期格式的分隔符，可以是"/"或者你希望的符号，但如果是除了"-"和"/"之外的字符则需要和parseDate和formatDate配合使用，以便组件能正常运作
        startDay: 1,
        //@config 设置每一周的第一天是哪天，0代表Sunday，1代表Monday，依次类推, 默认从周一开始
        dateRangeWidth: 260,
        //@config 配置日期范围框的宽度
        shortcut: false,
        //@config 是否在组件中显示日期选择快捷按钮
        /**
         * @config {Function} 打开daterangepicker的回调
         * @param vmodel {Object} 组件对应的Vmodel
         */
        onOpen: avalon.noop,
        /**
         * @config {Function} 关闭daterangepicker的回调
         * @param vmodel {Object} 组件对应的Vmodel
         */
        onClose: avalon.noop,
        /**
         * @config {Function} 点击日期范围框下方的确定按钮之后的回调
         * @param inputFromDate {String} 选择的起始日期
         * @param inputToDate {String} 选择的结束日期
         * @param oldValue {Array} 最近一次选中的起始和结束日期组成的数组
         * @param vmodel {Object} 组件对应的Vmodel
         * @param data {Object} 绑定组件元素上的data属性集合
         */
        onSelect: avalon.noop,
        /**
         * @config {Function} 将符合日期格式要求的字符串解析为date对象并返回，不符合格式的字符串返回null,用户可以根据自己需要自行配置解析过程
         * @param str {String} 需要解析的日期字符串
         * @returns {Date} 解析后的日期对象 
         */
        parseDate: function (str) {
            if (avalon.type(str) === 'date')
                return str;
            var separator = this.separator;
            var reg = '^(\\d{4})' + separator + '(\\d{1,2})' + separator + '(\\d{1,2})$';
            reg = new RegExp(reg);
            var x = str.match(reg);
            return x ? new Date(x[1], x[2] * 1 - 1, x[3]) : null;
        },
        /**
         * @config {Function} 将日期对象转换为符合要求的日期字符串
         * @param date {Date} 需要格式化的日期对象
         * @returns {String} 格式化后的日期字符串 
         */
        formatDate: function (date) {
            if (avalon.type(date) !== 'date') {
                avalon.log('the type of ' + date + 'must be Date');
                return '';
            }
            var separator = this.separator, year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
            return year + separator + this.formatNum(month + 1, 2) + separator + this.formatNum(day, 2);
        },
        formatNum: function (n, length) {
            n = String(n);
            for (var i = 0, len = length - n.length; i < len; i++)
                n = '0' + n;
            return n;
        },
        /**
         * @config {Function} 配置日期范围框的显示格式
         * @param label {String} 日期范围提示文字
         * @param fromDate {String} 起始日期
         * @param toDate {String} 结束日期 
         * @returns {String} 日期范围框要显示的内容
         */
        datesDisplayFormat: function (label, fromDate, toDate) {
            if (!fromDate && !toDate) {
                return '\u4E0D\u9650\u65E5\u671F';
            }
            return label + '\uFF1A' + fromDate + ' \u81F3 ' + toDate;
        },
        getTemplate: function (str, options) {
            return str;
        }
    };
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "37f8e4f4e81b95d2222fbfa0b57763c6" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8bdc330ebced058596c0473bf9d928fc" , 
        filename : "avalon.switchdropdown.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
tmpl = "<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-disabled:!enable\"\n     ms-class-1=\"oni-state-focus: focusClass\"\n     ms-css-width=\"{{width}}\"\n     ms-hover=\"oni-state-hover\"\n     ms-keydown=\"_keydown\"\n     tabindex=\"0\">\n    <div class=\"oni-dropdown-source\">\n        <div class=\"oni-dropdown-input\"\n             ms-title=\"title\"\n             ms-css-width=\"titleWidth\"\n             id=\"title-MS_OPTION_ID\">\n            {{currentOption.data.titleValue|sanitize|html}}\n        </div>\n        <div class=\"oni-dropdown-icon-wrap\">\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-up\"\n               ms-if=\"toggle\">&#xf028;</i>\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-down\"\n               ms-if=\"!toggle\">&#xf032;</i>\n        </div>\n    </div>\n</div>\nMS_OPTION_TEMPLATE\n<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-menu:!multiple\"\n     ms-class-1=\"{{listClass}}\"\n     ms-css-width=\"{{listWidth}}\"\n     ms-mouseenter=\"_listenter\"\n     ms-mouseleave=\"_listleave\"\n     ms-visible=\"toggle||multiple\">\n    <div class=\"oni-dropdown-menu-inner\"\n         ms-css-width=\"menuWidth\"\n         ms-css-height=\"menuHeight\"\n         ms-widget=\"scrollbar,scrollbar-MS_OPTION_ID\" id=\"menu-MS_OPTION_ID\">\n        <div class=\"oni-scrollbar-scroller\"\n             id=\"list-MS_OPTION_ID\">\n            <div ms-repeat=\"data\"  class=\"oni-dropdown-item\"\n                 ms-click-12=\"_select($index, $event)\"\n                 ms-title=\"el.title||el.label\"\n                 ms-hover=\"oni-state-hover: el.enable\"\n                 ms-class-1=\"oni-state-disabled:!el.enable\"\n                 ms-class-2=\"oni-state-active:isActive(el) \"\n                 ms-class-4=\"oni-dropdown-group:el.group\"\n                 ms-class-5=\"oni-dropdown-divider:el.group && !$first\"\n                 data-repeat-rendered=\"updateScrollbar\"\n                    >{{el.label|sanitize|html}}</div>\n        </div>\n    </div>\n</div>\n";
__context.____MODULES['90b2de0bf947d1814b382738513983f5'];
__context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'];

module.exports = (
function () {
    /**
     * 默认的switch item
     * @type {Array}
     * value: option的值
     * label: option的label
     * class: option webfont的样式
     * title: option的title
     * font: option webfont的字符
     */
    var defaultData = [
            {
                value: 1,
                label: ' \u542F\u7528',
                iconClass: 'g-icon-start',
                title: '\u542F\u7528',
                font: '&#xf084;',
                titleValue: ' \u5DF2\u542F\u7528'
            },
            {
                value: 2,
                label: ' \u6682\u505C',
                iconClass: 'g-icon-pause',
                title: '\u6682\u505C',
                font: '&#xf086;',
                titleValue: ' \u5DF2\u6682\u505C'
            }
        ];
    //使用switchdropdown做代理，包装option，内部使用dropdown组件实现
    var widget = avalon.ui.switchdropdown = function (element, data, vmodels) {
            var options = data.switchdropdownOptions;
            //mix defaultData, getDataFromHTML, options.data
            options.data = setItemLabel(avalon.mix(true, [], defaultData, getDataFromHTML(element), options.data));
            //检测options.value是否可以匹配到options.data中的选项
            //如果不能匹配，首先找到selected的选项
            //如果没有selected的选项，则把value设置为data中的第一项
            for (var preSet = options.value, value = options.data[0].value, i = 0, len = options.data.length, item; i < len; i++) {
                item = options.data[i];
                if (item.value === preSet) {
                    value = preSet;
                    break;
                }
                if (item.selected) {
                    value = item.value;
                }
            }
            options.value = value;
            var vmodel = avalon.define('switchdropdown' + setTimeout('1'), function (vm) {
                    vm.$opts = options;
                    vm.$init = function (continueScan) {
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('\u8BF7\u5C3D\u5FEB\u5347\u5230avalon1.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                });
            avalon(element).attr('ms-widget', [
                'dropdown',
                data.switchdropdownId,
                '$opts'
            ].join());
            //由于对数据做预先处理，使用option模式传递数据，将element的内容清空
            element.innerHTML = '';
            return vmodel;
        };
    function getDataFromHTML(select, arr, parent) {
        var ret = arr || [];
        var elems = select.children;
        parent = parent || null;
        for (var i = 0, el; el = elems[i++];) {
            if (el.nodeType === 1) {
                //过滤注释节点
                if (el.tagName === 'OPTION') {
                    var option = {
                            label: ' ' + el.text.trim(),
                            //IE9-10有BUG，没有进行trim操作
                            title: el.title.trim(),
                            value: parseData(avalon(el).val()),
                            enable: !el.disabled,
                            group: false,
                            selected: el.selected,
                            parent: parent
                        };
                    //设置了用于在标题处显示的文案：titleValue
                    if (avalon(el).attr('data-title-value')) {
                        option.titleValue = ' ' + avalon(el).attr('data-title-value').trim();
                    }
                    ret.push(option);
                    if (ret.length === 2)
                        break;
                }
            }
        }
        return ret;
    }
    //设置option的label
    function setItemLabel(items) {
        avalon.each(items, function (i, item) {
            item.text = item.label;
            item.label = [
                '<i class="oni-icon ',
                item.iconClass,
                '">',
                item.font,
                '</i>',
                item.label
            ].join('');
            item.titleValue = [
                '<i class="oni-icon ',
                item.iconClass,
                '">',
                item.font,
                '</i>',
                item.titleValue
            ].join('');
        });
        return items;
    }
    //用于将字符串中的值转换成具体值
    function parseData(data) {
        try {
            data = data === 'true' ? true : data === 'false' ? false : data === 'null' ? null : +data + '' === data ? +data : data;
        } catch (e) {
        }
        return data;
    }
    widget.version = '1.0';
    widget.defaults = {
        width: 100,
        //@config 自定义宽度
        listWidth: 100,
        //@config 自定义下拉列表的宽度
        height: 60,
        //@config 下拉列表的高度
        enable: true,
        //@config 组件是否可用
        readOnly: false,
        //@config 组件是否只读
        data: [],
        //@config 下拉列表显示的数据模型
        value: '',
        //@config 设置组件的初始值
        /**
         * @config 模板函数,方便用户自定义模板
         * @param str {String} 默认模板
         * @param opts {Object} VM
         * @returns {String} 新模板
         */
        getTemplate: function () {
            return tmpl;
        },
        onInit: avalon.noop
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "8bdc330ebced058596c0473bf9d928fc" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b83c701f7016a27e16d46e493e24eea4" , 
        filename : "avalon.miniswitch.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
tmpl = "<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-disabled:!enable\"\n     ms-class-1=\"oni-state-focus: focusClass\"\n     ms-css-width=\"{{width}}\"\n     ms-hover=\"oni-state-hover\"\n     ms-keydown=\"_keydown\"\n     tabindex=\"0\">\n    <div class=\"oni-dropdown-source\">\n        <div class=\"oni-dropdown-input\"\n             ms-title=\"title\" ms-css-width=\"titleWidth\" id=\"title-MS_OPTION_ID\">\n            <i class=\"oni-icon\"\n               ms-class=\"{{currentOption.data.iconClass}}\">{{currentOption.data.font|html}}</i>\n        </div>\n        <div class=\"oni-dropdown-icon-wrap\">\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-up\"\n               ms-if=\"toggle\">&#xf028;</i>\n            <i class=\"oni-dropdown-icon oni-icon oni-icon-angle-down\"\n               ms-if=\"!toggle\">&#xf032;</i>\n        </div>\n    </div>\n</div>\nMS_OPTION_TEMPLATE\n<div class=\"oni-dropdown\"\n     ms-class=\"oni-dropdown-menu:!multiple\"\n     ms-css-width=\"{{listWidth}}\"\n     ms-mouseenter=\"_listenter\"\n     ms-mouseleave=\"_listleave\"\n     ms-visible=\"toggle||multiple\">\n    <div class=\"oni-dropdown-menu-inner\"\n         ms-css-width=\"menuWidth\"\n         ms-css-height=\"menuHeight\"\n         ms-widget=\"scrollbar,scrollbar-MS_OPTION_ID\" id=\"menu-MS_OPTION_ID\">\n        <div class=\"oni-scrollbar-scroller\"\n             id=\"list-MS_OPTION_ID\">\n            <div ms-repeat=\"data\"  class=\"oni-dropdown-item\"\n                 data-repeat-rendered=\"updateScrollbar\"\n                 ms-click-12=\"_select($index, $event)\"\n                 ms-title=\"el.title||el.label\"\n                 ms-hover=\"oni-state-hover: el.enable\"\n                 ms-class-1=\"oni-state-disabled:!el.enable\"\n                 ms-class-2=\"oni-state-active:isActive(el) \"\n                 ms-class-4=\"oni-dropdown-group:el.group\"\n                 ms-class-5=\"oni-dropdown-divider:el.group && !$first\"\n                 data-repeat-rendered=\"updateScrollbar\"\n                    >{{el.label|sanitize|html}}</div>\n        </div>\n    </div>\n</div>\n";
__context.____MODULES['8bdc330ebced058596c0473bf9d928fc'];
__context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'];

module.exports = (
function () {
    //使用switchdropdown做代理，包装option，内部使用dropdown组件实现
    var widget = avalon.ui.miniswitch = function (element, data, vmodels) {
            var options = data.miniswitchOptions;
            var vmodel = avalon.define('miniswitch' + setTimeout('1'), function (vm) {
                    vm.$opts = options;
                    vm.$init = function (continueScan) {
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('\u8BF7\u5C3D\u5FEB\u5347\u5230avalon1.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                });
            avalon(element).attr('ms-widget', [
                'switchdropdown',
                data.miniswitchId,
                '$opts'
            ].join());
            return vmodel;
        };
    widget.version = '1.0';
    widget.defaults = {
        width: 40,
        //@config 自定义宽度
        listWidth: 100,
        //@config 自定义下拉列表的宽度
        height: 60,
        //@config 下拉列表的高度
        enable: true,
        //@config 组件是否可用
        readOnly: false,
        //@config 组件是否只读
        data: [],
        //@config 下拉列表显示的数据模型
        value: '',
        //@config 设置组件的初始值
        /**
         * @config 模板函数,方便用户自定义模板
         * @param str {String} 默认模板
         * @param opts {Object} VM
         * @returns {String} 新模板
         */
        getTemplate: function () {
            return tmpl;
        },
        onInit: avalon.noop
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "b83c701f7016a27e16d46e493e24eea4" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "66245368f546adb2e2657940f7ab549a" , 
        filename : "avalon.checkboxlist.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'],
template = "<li class=\"oni-checkboxlist-item oni-checkboxlist-all\" \n    ms-css-float=\"vertical? 'none': 'left'\" \n    ms-if=\"!!alltext\"\n    ms-class=\"fl:!vertical\">\n    <label ms-if=\"data.size()\">\n        <input type=\"checkbox\" \n               ms-click=\"_clickAll($event)\" \n               ms-duplex-checked=\"all\" \n               value = \"all\"\n               class=\"checkbox\"/> {{alltext}}\n    </label>\n</li>\n<li ms-repeat-cpitem=\"data\" class=\"oni-checkboxlist-item\" \n    ms-css-float=\"vertical? 'none': 'left'\"\n    ms-class=\"fl:!vertical\">\n    <label>\n        <input type=\"checkbox\" \n               ms-click=\"_clickOne($event, $index)\"\n               ms-duplex=\"MS_OPTIONS_DUPLEX\"\n               ms-value=\"{{cpitem.value||cpitem.text}}\" \n               class=\"checkbox\" /> \n        {{cpitem.text|html}}\n    </label>\n</li>\n";

module.exports = (
function () {
    var widget = avalon.ui.checkboxlist = function (element, data, vmodels) {
            var options = data.checkboxlistOptions, fetchVM = typeof options.fetch === 'string' ? avalon.getModel(options.fetch, vmodels) : options.fetch, fetchFunc = fetchVM && avalon.type(fetchVM) === 'array' && fetchVM[1][fetchVM[0]] || options.fetch || null, onSelectVM = typeof options.onSelect === 'string' ? avalon.getModel(options.onSelect, vmodels) : false, onSelect = onSelectVM && onSelectVM[1][onSelectVM[0]] || avalon.noop, onfetch = avalon.type(fetchFunc) === 'function' ? fetchFunc : null;
            var vmodel = avalon.define(data.checkboxlistId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        'keys'
                    ];
                    vm.widgetElement = element;
                    vm.keys = [];
                    // 点击全选按钮之后的回调
                    vm._clickAll = function (event) {
                        setTimeout(function () {
                            var checkStatus = event.target.checked;
                            if (checkStatus) {
                                duplexVM[1][duplexVM[0]] = vmodel.keys.map(function (el) {
                                    return el + '';
                                });
                            } else {
                                duplexVM[1][duplexVM[0]].clear();
                            }
                            // 执行onselect回调
                            onSelect.apply(0, [
                                vm.data.$model,
                                checkStatus,
                                event.target
                            ]);
                        }, 20);
                    };
                    // 选中某一项之后的回调操作
                    vm._clickOne = function (event, index) {
                        onSelect.apply(0, [
                            vm.data.$model,
                            event.target.checked,
                            event.target
                        ]);
                    };
                    vm.$init = function (continueScan) {
                        var temp = template.replace('MS_OPTIONS_DUPLEX', options.duplex);
                        vmodel.template = vmodel.getTemplate(temp, options);
                        element.className += ' oni-checkboxlist oni-checkboxlist-list oni-helper-clearfix';
                        element.innerHTML = vmodel.template;
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                    vm.$remove = function () {
                        element.innerHTML = '';
                    };
                });
            var duplexVM = avalon.getModel(options.duplex, [vmodel].concat(vmodels)), duplexArr = duplexVM && duplexVM[1][duplexVM[0]];
            vmodel.data.$watch('length', function (len) {
                if (len) {
                    setKeys(vmodel, duplexArr);
                }
            });
            if (!duplexArr) {
                throw new Error('\u672A\u914D\u7F6Eduplex');
            }
            element.value = duplexArr.$model.join(',');
            // 为了兼容 jvalidator，将ul的value同步为duplex的值
            duplexArr.$watch('length', function (newValue) {
                // 当选中checkbox或者全校选中时判断vmodel.all，从而判断是否选中"全选"按钮
                if (newValue == 0) {
                    element.value = '';
                } else {
                    element.value = duplexVM[1][duplexVM[0]].join(',');
                }
                vmodel.all = newValue == vmodel.data.length;
            });
            if (vmodel.data.length) {
                setKeys(vmodel, duplexArr);
                return vmodel;
            }
            if (options.fetch) {
                /*
                通过回调返回数据，数据结构必须是
                [
                    { text : A , value : B , extra : C , ... }
                ]
                以 text 作为每一个选项的文字，value 为选项的值，如果没有则直接使用 text
            */
                // 取到数据之后进行视图的渲染
                onfetch.apply(0, [function (data) {
                        vmodel.data = data;
                        var data = [];
                        avalon.each(vmodel.data, function (index, item) {
                            data.push(item.value || item.text);
                        });
                        vmodel.keys = data;
                    }]);
            } else {
                var fragment = document.createElement('div');
                while (element.firstChild) {
                    fragment.appendChild(element.firstChild);
                }
                switch (options.type) {
                // 配置了type为week的话，使用组件默认的提供的data
                case 'week':
                    var data = [
                            {
                                text: '\u5468\u4E00',
                                value: 'MONDAY'
                            },
                            {
                                text: '\u5468\u4E8C',
                                value: 'TUESDAY'
                            },
                            {
                                text: '\u5468\u4E09',
                                value: 'WEDNESDAY'
                            },
                            {
                                text: '\u5468\u56DB',
                                value: 'THURSDAY'
                            },
                            {
                                text: '\u5468\u4E94',
                                value: 'FRIDAY'
                            },
                            {
                                text: '\u5468\u516D',
                                value: 'SATURDAY'
                            },
                            {
                                text: '\u5468\u65E5',
                                value: 'SUNDAY'
                            }
                        ];
                    break;
                default:
                    // 既未配置fetch自取data，也没配置type使用默认的data，就需要通过页面提供的html抽取出data
                    var inputs = fragment.getElementsByTagName('input');
                    var data = [];
                    for (var i = 0; i < inputs.length; i++) {
                        var input = inputs[i], li = input.parentNode, txt = '';
                        // 获取离input最近的父级li元素
                        while (li) {
                            if (li.tagName == 'LI') {
                                break;
                            } else {
                                li = li.parentNode;
                            }
                        }
                        txt = li.textContent || li.innerText;
                        // trim掉li元素中文本两边的空格
                        txt.replace(/^\s+/, '').replace(/\s+$/, '');
                        // 将提取出来的数据保存在data中
                        data.push({
                            text: txt,
                            value: input.value || txt
                        });
                    }
                    break;
                }
                vmodel.data = data;
            }
            avalon.ui.checkboxlist.defaults.data = [];
            return vmodel;
        };
    function setKeys(vmodel, duplexVM) {
        var data = [], allChecked = true;
        duplexVM = duplexVM && duplexVM.$model;
        avalon.each(vmodel.data, function (index, item) {
            data.push(item.value || item.text);
        });
        vmodel.keys = data;
        avalon.each(data, function (index, item) {
            if (duplexVM.indexOf(item) === -1) {
                allChecked = false;
            }
        });
        vmodel.all = allChecked;
    }
    widget.version = 1;
    widget.defaults = {
        data: [],
        //@config 所有选项值的集合，通过此数据来渲染初始视图。可以在组件初始化之前配置data，也可以在异步取得数据之后在配置。当同时配置了data、fetch且在绑定元素内部显示设置了要渲染的checkbox列表，则优先级顺序是：data>fetch>sub elements
        all: false,
        //@config 默认不选中所有选项
        alltext: '\u5168\u90E8',
        //@config 显示"全部"按钮，方便进行全选或者全不选操作,不需要全选操作的话可以设置alltext为""
        type: '',
        //@config 内置type为week时的data，用户只需配置type为week即可显示周一到周日的选项 
        /**
         * @config 通过配置fetch来获得要显示的数据，数据格式必须如下所示：
             <pre class="brush:javascript;gutter:false;toolbar:false">
             [
                { text : '文字1' , value : 'w1' } ,
                { text : '文字2' , value : 'w2' } ,
                { text : '文字3' , value : 'w3' } ,
                { text : '文字4' , value : 'w4' }
             ]
             </pre>
         */
        fetch: '',
        template: '',
        /**
         * @config {Function} 组件面板展开后的回调函数
         * @param data {Array} checkboxlist的选项集合
         * @param checkStatus {Boolean} 选中或者未选中的状态
         * @param target {ElementObj} 触发事件的dom对象的引用 
         */
        onSelect: avalon.noop,
        getTemplate: function (tmpl, options) {
            return tmpl;
        },
        vertical: true    //@config 如果希望选框水平排列则设置vertical为false，默认垂直排列
    };
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "66245368f546adb2e2657940f7ab549a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "0f04480659a156ed6ffa2b199faf3d7b" , 
        filename : "avalon.suggest.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['fdc46f922d9abc8918e08dbf90d9d03e'],
sourceHTML = "<ul class='oni-suggest' ms-each-item='list' ms-visible='toggle'>\n    <li class='oni-suggest-item' \n        ms-click='clickcallback($index,$event)' \n        ms-class='oni-suggest-item-selected:list[selectedIndex] == item' tabindex='-1' \n        ms-hover='oni-suggest-item-hover'>{{_renderItem(item)|html}}</li>\n</ul>\n";

module.exports = (
function () {
    var widget = avalon.ui.suggest = function (element, data, vmodels) {
            var $element = avalon(element), options = data.suggestOptions, template = options.getTemplate(sourceHTML), suggestHtml = avalon.parseHTML(template).firstChild, dataValue = data.value.split(','), suggestOptions = !dataValue[2] ? 0 : avalon.getModel(dataValue[2], vmodels) || 0, styleReg = /^(\d+).*$/;
            suggestOptions = !!options.notpuresuggest ? suggestOptions[1][suggestOptions[0]] : 0;
            if (suggestOptions) {
                avalon.mix(options, suggestOptions);
            }
            /**
         * 如果options.notpuresuggest为true说明是与textbox组件结合的，
         * 否则与textbox组件无关，options.inputElement就是进行自动补全的输入域节点对应的id
         */
            options.inputElement = !!options.notpuresuggest ? options.inputElement : document.getElementById(options.inputElement);
            /**
         * 如果options.textboxContainer为空，说明此suggest组件是独立的，
         * 与textbox组件无关，下面将通过输入框的位置、大小来
         * 设置suggest提示框的position和width
        */
            options.textboxContainer = options.textboxContainer == '' ? options.inputElement : options.textboxContainer;
            /*
         * suggest 下拉框
         */
            var limit = options.limit,
                // 最多显示条数配置：最多显示多少条suggest，超出显示滚动条
                suggest,
                // ui-suggest
                suggestCtr = options.suggestCtr || {
                    _minIndex: 0,
                    // 显示口第一条suggest index
                    _maxIndex: limit - 1,
                    // 显示口最后一条suggest index
                    _items: '',
                    // ui-item
                    moveUp: function (index) {
                        if (index < this._minIndex) {
                            // 如果已经跑到显示口第一条了
                            if (this._minIndex == 0) {
                                // 如果已经滚动到了最上面，滚到底部
                                this._minIndex = vmodel.list.length - limit;
                                this._maxIndex = vmodel.list.length - 1;
                                //先更新高度，再滚动
                                this._update();
                                this.scroll.set(this._getHeight(0, this._minIndex - 1));
                            } else {
                                this._minIndex--;
                                this._maxIndex--;
                                this._update();
                                this.scroll.pre();
                            }
                        } else {
                            if (this.scroll.isScolled) {
                                this.scroll.recover();
                            }
                        }
                    },
                    moveDown: function (index) {
                        if (index > this._maxIndex) {
                            // 如果已经跑到显示口最后一条了
                            if (this._maxIndex == vmodel.list.length - 1) {
                                // 如果已经滚动到了最下面，滚到顶部
                                this._minIndex = 0;
                                this._maxIndex = limit - 1;
                                this._update();
                                this.scroll.set(0);
                            } else {
                                // 向下滚动
                                this._minIndex++;
                                this._maxIndex++;
                                this._update();
                                this.scroll.next();
                            }
                        } else {
                            if (this.scroll.isScolled) {
                                this.scroll.recover();
                            }
                        }
                    },
                    reset: function () {
                        this._minIndex = 0;
                        this._maxIndex = limit - 1;
                        suggest.scrollTop = 0;
                        this._items = suggest.getElementsByTagName('li');
                        this._update();
                    },
                    scroll: {
                        isScolled: false,
                        // 记录用户是否滚动过
                        set: function (val) {
                            suggest.scrollTop = val;
                            this.isScolled = false;
                        },
                        pre: function () {
                            if (this.isScolled) {
                                this.recover();
                            } else {
                                suggest.scrollTop -= suggestCtr._items[suggestCtr._minIndex].offsetHeight;
                            }
                        },
                        next: function () {
                            if (this.isScolled) {
                                this.recover();
                            } else {
                                suggest.scrollTop += suggestCtr._items[suggestCtr._minIndex - 1].offsetHeight;
                            }
                        },
                        recover: function () {
                            this.set(suggestCtr._getHeight(0, suggestCtr._minIndex - 1));
                        }
                    },
                    _update: function () {
                        if (vmodel.list.length > limit) {
                            // 如果suggest条数大于配置数，显示滚动条
                            suggest.style.overflowY = 'scroll';
                            suggest.style.height = this._getHeight(this._minIndex, this._maxIndex) + 'px';
                        } else {
                            // 否则，取消滚动条
                            suggest.style.overflowY = 'auto';
                            suggest.style.height = 'auto';
                        }
                    },
                    _getHeight: function (fromIndex, toIndex) {
                        var _height = 0,
                            //suggest列表高度
                            _items = this._items;
                        for (var i = fromIndex; i <= toIndex; i++) {
                            _height += _items[i].offsetHeight;
                        }
                        return _height;
                    }
                };
            var vmodel = avalon.define(data.suggestId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'puresuggest',
                        'limit',
                        'suggestCtr'
                    ];
                    vm.widgetElement = element;
                    vm.list = [];
                    vm.searchText = '';
                    vm.toggle = false;
                    vm.loading = false;
                    vm.selectedIndex = 0;
                    vm.suggestCtr = suggestCtr;
                    vm._renderItem = function (item) {
                        if (!item)
                            return;
                        return vmodel.renderItem(item, vmodel);
                    };
                    // 监控toggle值变化，当toggle为true时更新提示框尺寸
                    vm.$watch('toggle', function (v) {
                        var inputElement = options.inputElement, textboxContainer = options.textboxContainer, $inputElement = avalon(inputElement), $textboxContainer = avalon(textboxContainer);
                        if (v) {
                            if (textboxContainer === inputElement) {
                                var offset = $element.offset(), suggestHtmlWidth = $inputElement.width() + 'px';
                                element.style.cssText = 'position: absolute; left:' + offset.left + 'px;top:' + offset.top + 'px;';
                                suggestHtml.style.cssText = 'margin:0;left:0;top:0;width:' + suggestHtmlWidth;
                                return;
                            }
                            suggestHtml.style.width = $textboxContainer.outerWidth() - 2 - avalon(suggestHtml).css('paddingLeft').replace(styleReg, '$1') - avalon(suggestHtml).css('paddingRight').replace(styleReg, '$1') + 'px';
                        }
                    });
                    // 监控searchText值的变化，及时更新提示列表?
                    vm.$watch('searchText', function (v) {
                      log('控件：watch searchText')
                        vmodel.updateSource(v, vmodel, limit);
                    });
                    // 处理提示项的鼠标点击，也就是更新input值，同时隐藏提示框?
                    vm.clickcallback = function (idx, event) {
                        var selectObj = vmodel.list[idx], selectValue = selectObj.value;
                        vmodel.onChangeCallback(selectValue, vmodel.inputElement, event, selectObj);
                        if (typeof vmodel.onSelectItem === 'function') {
                            vmodel.onSelectItem.call(null, selectValue, vmodel.inputElement, event, selectObj);
                        }
                        vmodel.toggle = false;
                    };
                    // 当点击input框之外的区域时，隐藏提示框?
                    vm.hidepromptinfo = function (event) {
                        if (!vmodel.toggle)
                            return false;
                        /* 此判断是关键，当点击区域是在提示框上说明是在选择提示信息，隐藏提示框的操作放在提示项的click回调上处理，反之则隐藏提示框 */
                        if (findParent(event.target, options.textboxContainer))
                            return;
                        vmodel.toggle = false;
                    };
                    vm.$init = function () {
                        avalon.bind(options.inputElement, 'keydown', function (event) {
                            vmodel.keyDownOperation(vmodel, event, limit);
                        });
                        avalon.bind(document, 'click', vm.hidepromptinfo);
                        avalon.nextTick(function () {
                            element.appendChild(suggestHtml);
                            avalon.scan(element, [vmodel].concat(vmodels));
                            // suggest 下拉框初始化
                            suggestCtr.suggest = suggest = element.getElementsByTagName('ul')[0];
                            // 绑定 scroll 事件
                            avalon.bind(suggest, 'scroll', function () {
                                suggestCtr.scroll.isScolled = true;
                            });
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        });
                    };
                    // 自动销毁
                    vm.$remove = function () {
                        element.innerHTML = '';
                    };
                });
            // 如果input元素配置了suggest-focus项，则执行此条件块?
            if (options.focus) {
                // 特殊的suggest，即当searchText与input值相等时更新提示列表list，不相等时，更新searchText
                avalon.bind(options.inputElement, 'focus', function (event) {
                    var v = this.value;
                    if (vmodel.searchText == v) {
                        vmodel.updateSource(v, vmodel, limit);
                    } else {
                        vmodel.searchText = v;
                    }
                });
            }
            if (options.onChange) {
                var arr = avalon.getModel(options.onChange, vmodels);
                var _onchange = vmodel.onChangeCallback;
                vmodel.onChangeCallback = function () {
                    _onchange.apply(null, arguments);
                    arr[1][arr[0]].apply(arr[1], arguments);
                };
            }
            return vmodel;
        };
    // 判断点击目标元素是否在查找元素内部，在则返回true，否则返回false
    function findParent(element, findElement) {
        if (!element)
            return false;
        if (element == findElement)
            return true;
        return findParent(element.parentNode, findElement);
    }
    function keyDownOperation(vmodel, event, limit) {
      log('控件：keydown处理 （avalon.suggest.js:245）')
        switch (event.which) {
        case 9:
            if (!vmodel.toggle)
                return;
            vmodel.toggle = false;
            break;
        case 27:
            if (!vmodel.toggle)
                return;
            vmodel.toggle = false;
            break;
        case 13:
            event.preventDefault();
            if (!vmodel.toggle)
                return;
            vmodel.toggle = false;
            vmodel.onChangeCallback(vmodel.list[vmodel.selectedIndex].value, vmodel.inputElement, event);
            break;
        case 38:
            // arrow up
            if (!vmodel.toggle)
                return;
            --vmodel.selectedIndex;
            // 下拉框
            if (limit) {
                vmodel.suggestCtr.moveUp(vmodel.selectedIndex);
            }
            if (vmodel.selectedIndex === -1) {
                vmodel.selectedIndex = vmodel.list.length - 1;
            }
            vmodel.onChangeCallback(vmodel.list[vmodel.selectedIndex].value, vmodel.inputElement, event);
            // prevent default behavior to move cursor at the the begenning
            event.preventDefault();
            break;
        case 40:
            // arrow down
            if (!vmodel.toggle)
                return;
            ++vmodel.selectedIndex;
            // 下拉框
            if (limit) {
                vmodel.suggestCtr.moveDown(vmodel.selectedIndex);
            }
            if (vmodel.selectedIndex === vmodel.list.length) {
                vmodel.selectedIndex = 0;
            }
            vmodel.onChangeCallback(vmodel.list[vmodel.selectedIndex].value, vmodel.inputElement, event);
            // prevent default behavior to move cursor at the the end
            event.preventDefault();
            break;
        default:
            var keyupFn = avalon.bind(vmodel.inputElement, 'keyup', function () {
              log('控件：绑定keyup （avalon.suggest.js:297）')
                    vmodel.searchText = this.value || String.fromCharCode(event.which);
                    avalon.unbind(vmodel.inputElement, 'keyup', keyupFn);
                });
            break;
        }
    }
    function updateSource(value, vmodel, limit) {
      log('控件：进入updateSource')
        if (vmodel.loading == true)
            return;
        var s = avalon.ui['suggest'].strategies[vmodel.strategy];
        if (!s)
            return;
        vmodel.loading = true;
        // 根据提示类型提供的方法过滤的数据来渲染提示视图?
        s(value, function (array) {
            vmodel.selectedIndex = 0;
            vmodel.list.removeAll();
            avalon.each(array, function (idx, val) {
                if (typeof val == 'string') {
                    vmodel.list.push({
                        text: val,
                        value: val
                    });
                } else {
                    vmodel.list.push(val);
                }
            });
            vmodel.loading = false;
            if (array.length == 0) {
                vmodel.toggle = false;
            } else {
                vmodel.toggle = true;
            }
            //重置suggest列表
            if (limit) {
                vmodel.suggestCtr.reset();
            }
        });
    }
    ;
    widget.defaults = {
        inputElement: '',
        strategy: '__getVal',
        textboxContainer: '',
        focus: false,
        changed: false,
        onSelectItem: '',
        emphasize: true,
        getTemplate: function (tmp) {
            return tmp;
        },
        keyDownOperation: keyDownOperation,
        // 当通过键盘上下箭头或者使用鼠标点击来切换提示项时触发
        onChangeCallback: function (val, input) {
            input.value = val;
        },
        updateSource: updateSource,
        renderItem: function (item, vmodel) {
            if (!vmodel.emphasize) {
                return item.text;
            }
            item = item.text;
            var query = escapeRegExp(vmodel.searchText);
            return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                // ie6 下奇怪的字符
                if (match.charCodeAt(0) < 32) {
                    match = '' + match.slice(1);
                }
                return '<b style=\'color:#f55\'>' + match + '</b>';
            });
        }
    };
    function escapeRegExp(str) {
        return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    }
    // 根据提示类型的不同提供提示信息，也就是信息的过滤方式完全由用户自己决定?
    avalon.ui['suggest'].strategies = {
        __getVal: function (value, done) {
            done(value ? [
                value + '1',
                value + '2',
                value + '3',
                value + '4',
                value + '5',
                value + '6',
                value + '7',
                value + '8',
                value + '9'
            ] : []);
        }
    };
    return avalon;
}
)();


    })( module.exports , module , __context );
    __context.____MODULES[ "0f04480659a156ed6ffa2b199faf3d7b" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "575e62dfb8dd04738fbdf1cf64b5f342" , 
        filename : "avalon.textbox.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['0f04480659a156ed6ffa2b199faf3d7b'],
sourceHTML = "<div class=\"oni-textbox\" \n     ms-class=\"MS_OPTION_DISABLEDCLASS:elementDisabled\"\n     ms-hover=\"oni-textbox-hover\" \n     ms-class-1=\"oni-textbox-focus: focusClass\" \n     ms-class-2=\"{{stateClass}}\"\n     ms-visible=\"textboxToggle\">\n    <div class=\"oni-textbox-input-wrap\">\n        <span class=\"oni-textbox-placeholder\"\n              ms-if=\"!placeholderOrigin\"  \n              ms-visible=\"toggle\"\n              ms-click = \"hidePlaceholder\"\n              ms-css-width=\"placeWidth\"\n        >{{placehold}}</span>\n    </div>\n    MS_OPTION_ICON\n</div>\nMS_OPTION_SUGGEST\n<div class=\"oni-textbox-suggest\" \n     ms-widget = \"suggest,$,$suggestopts\" data-suggest-notpuresuggest=true>\n</div>";

module.exports = (
function () {
    var htmlStructArray = sourceHTML.split('MS_OPTION_SUGGEST'), suggestHTML = htmlStructArray[1], placeholderOrigin = 'placeholder' in document.createElement('input');
    var widget = avalon.ui.textbox = function (element, data, vmodels) {
            var elemParent = element.parentNode, $element = avalon(element), options = data.textboxOptions, vmSub = '', sourceList = '', inputWraper = '', placeholder = '', placehold = options.placeholder;
            // 解析html并获取需要的Dom对象引用
            sourceHTML = sourceHTML.replace(/MS_OPTION_DISABLEDCLASS/gm, options.disabledClass);
            sourceHTML = options.getTemplate(sourceHTML);
            sourceList = avalon.parseHTML(sourceHTML).firstChild;
            inputWraper = sourceList.getElementsByTagName('div')[0];
            placeholder = sourceList.getElementsByTagName('span')[0];
            if (options.suggest) {
                var suggestConfig = {
                        inputElement: element,
                        strategy: options.suggest,
                        textboxContainer: sourceList,
                        focus: options.suggestFocus || false,
                        onChange: options.suggestOnChange || '',
                        type: 'textbox',
                        limit: options.limit || 8
                    };
                $suggestopts = avalon.mix(suggestConfig, options.suggestion);
                options.$suggestopts = $suggestopts;
            }
            placehold = avalon(element).attr('placeholder') || placehold || '';
            var vmodel = avalon.define(data.textboxId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'disabledClass',
                        'autoTrim',
                        'suggest'
                    ];
                    vm.widgetElement = element;
                    vm.elementDisabled = '';
                    vm.toggle = true;
                    vm.placehold = placehold;
                    vm.focusClass = false;
                    vm.placeholderOrigin = placeholderOrigin;
                    vm.placeWidth = 0;
                    // input获得焦点时且输入域值为空时隐藏占位符
                    vm.hidePlaceholder = function () {
                        vm.toggle = false;
                        element.focus();
                    };
                    vm.blur = function () {
                        // 切换input外层包装的div元素class(ui-textbox-disabled)的显示或隐藏
                        vmodel.focusClass = false;
                        vmodel.elementDisabled = element.disabled;
                        // 切换占位符的显示、隐藏
                        if (options.autoTrim) {
                            element.value = element.value.trim();
                        }
                        if (!vmodel.placeholderOrigin) {
                            if (element.value != '' || !vmodel.placehold.length) {
                                vmodel.toggle = false;
                            } else {
                                vmodel.toggle = true;
                            }
                        }
                    };
                    vm.$remove = function () {
                        var sourceListParent = sourceList.parentNode;
                        sourceListParent.removeChild(sourceList);
                        sourceList.innerHTML = sourceList.textContent = '';
                    };
                    vm.$init = function (continueScan) {
                        avalon.bind(element, 'blur', vm.blur);
                        if (options.autoFocus) {
                            avalon.bind(element, 'mouseover', function () {
                                element.focus();
                            });
                        }
                        /**
                 * 如果存在suggest配置，说明需要自动补全功能，
                 * 此处将suggest需要的配置信息保存方便后续传给suggest widget，
                 * suggest的配置信息通过html结构的
                 * ms-widget="suggest,suggestId,$suggestopts"中的
                 * $suggestopts自动获取
                 **/
                        $element.addClass('oni-textbox-input');
                        // 包装原始输入域
                        var tempDiv = document.createElement('div');
                        elemParent.insertBefore(tempDiv, element);
                        element.msRetain = true;
                        inputWraper.appendChild(element);
                        if (~options.width) {
                            $element.width(options.width);
                        }
                        if (~options.height) {
                            $element.height(options.height);
                        }
                        if (~options.tabIndex) {
                            element.tabIndex = options.tabIndex;
                        }
                        elemParent.replaceChild(sourceList, tempDiv);
                        element.msRetain = false;
                        // 如果存在自动补全配置项的话，添加自动补全widget
                        if (options.suggest) {
                            var suggest = avalon.parseHTML(suggestHTML).firstChild;
                            sourceList.appendChild(suggest);
                        }
                        avalon.bind(element, 'focus', function () {
                            vmodel.focusClass = true;
                            if (!vmodel.placeholderOrigin) {
                                vmodel.toggle = false;
                            }
                        });
                        avalon.scan(sourceList, [vmodel].concat(vmodels));
                        if (!vmodel.placeholderOrigin) {
                            if (!vmodel.placehold.length || element.value != '') {
                                vmodel.toggle = false;
                            }
                            vmodel.placeWidth = avalon(inputWraper).innerWidth();
                        } else if (vmodel.placehold.length) {
                            $element.attr('placeholder', vmodel.placehold);
                        }
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                        // 如果输入域有值，则隐藏占位符，否则显示，默认显示
                        vm.elementDisabled = element.disabled;
                    };
                });
            var msDuplexValue, msData;
            for (var i in element.msData) {
                if (i.indexOf('ms-duplex') === 0) {
                    msDuplexValue = element.msData[i];
                    break;
                }
            }
            if (msDuplexValue) {
                vmSub = avalon.getModel(msDuplexValue, vmodels);
                if (vmSub) {
                    // 根据对元素双向绑定的数据的监听来判断是显示还是隐藏占位符，并且判定元素的禁用与否
                    vmSub[1].$watch(vmSub[0], function () {
                        vmodel.elementDisabled = element.disabled;
                        if (!vmodel.placeholderOrigin) {
                            if (element.value != '' || !vmodel.placehold.length) {
                                vmodel.toggle = false;
                            } else {
                                vmodel.toggle = true;
                            }
                        }
                    });
                }
            }
            msData = element.msData['ms-disabled'] || element.msData['ms-attr-disabled'] || element.msData['ms-enabled'] || element.msData['ms-attr-enabled'];
            if (msData) {
                vmSub = avalon.getModel(msData, vmodels);
                if (vmSub) {
                    vmSub[1].$watch(vmSub[0], function () {
                        vmodel.elementDisabled = element.disabled;
                        if (!vmodel.placeholderOrigin) {
                            if (element.value != '' || !vmodel.placehold.length) {
                                vmodel.toggle = false;
                            } else {
                                vmodel.toggle = true;
                            }
                        }
                    });
                }
            }
            return vmodel;
        };
    widget.defaults = {
        /**
         * @config 配置输入框有自动提示补全功能，提示类型由用户自定义，默认配置为false，也就是不开启自动补全功能
         */
        suggest: false,
        suggestion: {},
        autoTrim: true,
        //@config 是否自动过滤用户输入的内容头部和尾部的空格
        widgetElement: '',
        //@interface 绑定组件元素的dom对象的引用
        tabIndex: -1,
        //@config 配置textbox在进行tab切换时的tabIndex，切换顺序从值小的开始，必须配置为大于0的值
        width: -1,
        //@config 配置textbox的显示宽
        autoFocus: false,
        //@config 如果想要鼠标悬停在textbox上时就focus textbox，设置此属性为true即可
        disabledClass: 'oni-textbox-disabled',
        //@config 配置输入域disabled时组件包装元素设置的类，多个类以空格分隔
        /**
         * @config 模板函数,方便用户自定义模板
         * @param str {String} 默认模板
         * @param opts {Object} vmodel
         * @returns {String} 新模板
         */
        getTemplate: function (tmp) {
            return tmp.replace(/MS_OPTION_ICON/, '');
        },
        stateClass: '',
        //@config 为textbox添加样式，默认可以添加oni-textbox-error
        suggestOnChange: '',
        //@config 配置提示补全时切换提示项之后的callback
        suggestFocus: false    //@config 特殊的suggest，当focus时即显示特定的提示列表
    };
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "575e62dfb8dd04738fbdf1cf64b5f342" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1e2a4749ea3e8bbc22c90f5c6fb561f7" , 
        filename : "avalon.mask.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    avalon.duplexHooks.mask = {
        init: function (_, data) {
            var elem = data.element;
            var maskText = elem.getAttribute('data-duplex-mask');
            if (maskText) {
                var mask = data.msMask = new Mask(elem, maskText);
                data.bound('keydown', function (e) {
                    elem.userTrigger = false;
                    var k = e.which || e.keyCode;
                    if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {
                        //Ignore
                        return;
                    }
                    var caret = getCaret(elem);
                    if (k === 39) {
                        //向右
                        var i = mask.caretData.indexOf(null, caret.end);
                        if (i === -1) {
                            i = mask.caretData.indexOf(null);
                        }
                        setTimeout(function () {
                            setCaret(elem, i, i + 1);
                        });
                    } else if (k == 37) {
                        //向左
                        var _ = mask.caretData.slice(0, caret.start);
                        var i = _.lastIndexOf(null);
                        if (i === -1) {
                            i = mask.caretData.indexOf(null);
                        }
                        setTimeout(function () {
                            setCaret(elem, i, i + 1);
                        });
                    } else {
                        elem.userTrigger = true;
                    }
                });
                data.bound('click', function (e) {
                    setTimeout(function () {
                        //搞掉keyup中的  elem.userTrigger = true
                        elem.userTrigger = false;
                    });
                    if (elem.userTrigger === true) {
                        //防止触发了keyup的操作又触发这里的
                        return;
                    }
                    var caret = getCaret(elem);
                    var i = mask.caretData.indexOf(null, caret.end);
                    if (i === -1) {
                        i = mask.caretData.indexOf(null);
                    }
                    setTimeout(function () {
                        setCaret(elem, i, i + 1);
                    });
                });
                function showMask(e) {
                    elem.value = mask.valueMask;
                    elem.userTrigger = true;
                    var index = mask.vmodelData.indexOf(null);
                    //定位于第一个要填空的位置上
                    if (index !== -1) {
                        setCaret(elem, index, index + 1);
                    }
                }
                function hideMask() {
                    var invalid = mask.vmodelData.some(function (el) {
                            return el === null;
                        });
                    if (mask.hideIfInvalid && invalid || mask.hideIfPristine && elem.value === mask.valueMask) {
                        elem.value = elem.oldValue = ''    //注意IE6-8下，this不指向element
;
                    }
                }
                if (mask.showAlways) {
                    showMask();
                } else {
                    if (mask.showIfFocus) {
                        data.bound('focus', showMask);
                        data.bound('blur', hideMask);
                    }
                    if (mask.showIfHover) {
                        data.bound('mouseover', showMask);
                        data.bound('mouseout', hideMask);
                    }
                }
            } else {
                throw '\u8BF7\u6307\u5B9Adata-duplex-mask';
            }
        },
        get: function (val, data) {
            //用户点击时会先触发这里
            var elem = data.element;
            var mask = data.msMask;
            if (elem.userTrigger) {
                mask.getter(val);
                elem.oldValue = val;
                elem.userTrigger = false;
                var index = mask.vmodelData.indexOf(null);
                if (index === -1) {
                    var caret = getCaret(elem);
                    var index = mask.caretData.indexOf(null, caret.end);
                    if (index === -1) {
                        index = mask.caretData.indexOf(null);
                    }
                    setCaret(elem, index, index + 1);
                } else {
                    setTimeout(function () {
                        setCaret(elem, index, index + 1);
                    });
                }
            }
            elem.oldValue = val;
            return mask.vmodelData.join('');
        },
        set: function (val, data) {
            //将vm中数据放到这里进行处理，让用户看到经过格式化的数据
            // 第一次总是得到符合格式的数据
            var elem = data.element;
            var mask = data.msMask;
            if (val !== '') {
                if (!mask.match(val)) {
                    elem.oldValue = mask.fix(val);
                }
                return data.msMask.viewData.join('');
            } else {
                return '';
            }
        }
    };
    function Mask(element, dataMask) {
        var options = avalon.getWidgetData(element, 'duplexMask');
        var t = {};
        try {
            t = new Function('return ' + options.translations)();
        } catch (e) {
        }
        avalon.mix(this, Mask.defaults, options);
        this.translations = avalon.mix({}, Mask.defaults.translations, t);
        this.element = element;
        //@config {Element} 组件实例要作用的input元素
        this.dataMask = dataMask;
        //@config {String} 用户在input/textarea元素上通过data-duplex-mask定义的属性值
        //第一次将dataMask放进去，得到element.value为空时，用于提示的valueMask
        getDatas.call(this);
        this.valueMask = this.viewData.join('')    // valueMask中的元字符被全部替换为对应的占位符后的形态，用户实际上在element.value看到的形态
;
    }
    Mask.defaults = {
        placehoder: '_',
        //@config {Boolean} "_", 将元字符串换为"_"显示到element.value上，如99/99/9999会替换为__/__/____，可以通过data-duplex-mask-placehoder设置
        hideIfInvalid: false,
        //@config {Boolean} false, 如果它不匹配就会在失去焦点时清空value(匹配是指所有占位符都被正确的字符填上)，可以通过data-duplex-mask-hide-if-invalid设置
        hideIfPristine: true,
        //@config {Boolean} true如果它没有改动过就会在失去焦点时清空value，可以通过data-duplex-mask-hide-if-pristine设置
        showIfHover: false,
        //@config {Boolean} false 当鼠标掠过其元素上方就显示它出来，可以通过data-duplex-mask-show-if-hover设置
        showIfFocus: true,
        //@config {Boolean} true 当用户让其元素得到焦点就显示它出来，可以通过data-duplex-mask-show-if-focus设置
        showAlways: false,
        //@config {Boolean} false 总是显示它，可以通过data-duplex-mask-show-always设置
        translations: {
            //@config {Object} 此对象上每个键名都是元字符，都对应一个对象，上面有pattern(正则)，placehoder(占位符，如果你不想用"_")
            '9': { pattern: /\d/ },
            'A': { pattern: /[a-zA-Z]/ },
            '*': { pattern: /[a-zA-Z0-9]/ }
        }
    };
    function getDatas() {
        var array = this.dataMask.split('');
        //用户定义的data-duplex-mask的值
        var n = array.length;
        var translations = this.translations;
        this.viewData = array.concat();
        //占位符
        this.caretData = array.concat();
        //光标
        this.vmodelData = new Array(n);
        // (9999/99/99) 这个是data-duplex-mask的值，其中“9”为“元字符”，“(”与 “/” 为“提示字符”
        // (____/__/__) 这是用占位符处理后的mask值
        for (var i = 0; i < n; i++) {
            var m = array[i];
            if (translations[m]) {
                var translation = translations[m];
                this.viewData[i] = translation.placehoder || this.placehoder;
                this.caretData[i] = null;
                this.vmodelData[i] = null;
            }
        }
    }
    Mask.prototype = {
        match: function (value) {
            if (value.length === this.valueMask.length) {
                var array = value.split('');
                var translations = this.translations;
                for (var i = 0, n = array.length; i < n; i++) {
                    var m = array[i];
                    if (translations[m]) {
                        var translation = translations[m];
                        var pattern = translation.pattern;
                        var placehoder = translation.placehoder || this.placehoder;
                        if (m === placehoder) {
                            continue;
                        }
                        if (!pattern.test(m)) {
                            return false;
                        }
                    } else {
                        if (m !== this.valueMask.charAt(i)) {
                            return false;
                        }
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        fix: function (value) {
            //如果不符合格式，则补上提示符与占位符
            var array = this.dataMask.split('');
            var valueArray = value.split('');
            var translations = this.translations;
            for (var i = 0, n = array.length; i < n; i++) {
                var m = array[i];
                if (translations[m]) {
                    var translation = translations[m];
                    var pattern = translation.pattern;
                    if (pattern.test(valueArray[0])) {
                        array[i] = valueArray.shift();
                    } else {
                        array[i] = translation.placehoder || this.placehoder;
                    }
                }
            }
            this.viewData = array;
            return array.join('');
        },
        getter: function (value) {
            var maskArray = this.dataMask.split('');
            //用户定义的data-duplex-mask的值
            var valueArray = value.split('');
            var translations = this.translations;
            var viewData = [];
            var vmodelData = [];
            // (9999/99/99) 这个是data-duplex-mask的值，其中“9”为“元字符”，“(”与 “/” 为“提示字符”
            // (____/__/__) 这是用占位符处理后的mask值
            while (maskArray.length) {
                var m = maskArray.shift();
                var el = valueArray.shift();
                //123456
                if (translations[m]) {
                    //如果碰到元字符
                    var translation = translations[m];
                    var pattern = translation.pattern;
                    if (el && el.match(pattern)) {
                        //如果匹配
                        vmodelData.push(el);
                        viewData.push(el);
                    } else {
                        vmodelData.push(null);
                        viewData.push(translation.placehoder || this.placehoder);
                    }
                } else {
                    //如果是提示字符 
                    viewData.push(el);
                    vmodelData.push(void 0);
                }
            }
            this.viewData = viewData;
            this.vmodelData = vmodelData;
        }
    };
    function getCaret(el) {
        var start = 0, end = 0;
        if (typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
            start = el.selectionStart;
            end = el.selectionEnd;
        } else {
            var range = document.selection.createRange();
            if (range && range.parentElement() === el) {
                var len = el.value.length;
                var normalizedValue = el.value.replace(/\r?\n/g, '\n');
                var textInputRange = el.createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());
                var endRange = el.createTextRange();
                endRange.collapse(false);
                if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                    start = end = len;
                } else {
                    start = -textInputRange.moveStart('character', -len);
                    start += normalizedValue.slice(0, start).split('\n').length - 1;
                    if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                        end = len;
                    } else {
                        end = -textInputRange.moveEnd('character', -len);
                        end += normalizedValue.slice(0, end).split('\n').length - 1;
                    }
                }
            }
        }
        return {
            start: start,
            end: end
        };
    }
    //setCaret(ctrl, a, b) 高亮部分停留在第a个字符上，但不包含b
    function setCaret(ctrl, start, end) {
        if (!ctrl.value || ctrl.readOnly)
            return;
        if (!end) {
            end = start;
        }
        if (ctrl.setSelectionRange) {
            ctrl.selectionStart = start;
            ctrl.selectionEnd = end;
            ctrl.focus();
        } else {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveStart('character', start);
            range.moveEnd('character', end - start);
            range.select();
        }
    }
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "1e2a4749ea3e8bbc22c90f5c6fb561f7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bac21fbec45c613f4349c3fa5aa345f1" , 
        filename : "avalon.json.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    if (Object.prototype.toString.call(window.JSON) === '[object JSON]') {
        return window.JSON;
    } else {
        var JSON = window.JSON = { fake: true };
        function f(n) {
            //补零
            return n < 10 ? '0' + n : n;
        }
        function toJSON(obj, type) {
            //序列化字符串,数字,布尔与日期
            return type === 'date' ? '(new Date(' + obj.valueOf() + '))' : type === 'string' ? quote(obj) : obj + '';
        }
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
                // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            }, rep;
        function quote(string) {
            //为字符串两边加双引号
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }
        //开始序列化各种数据类型
        function str(key, holder) {
            var i,
                // The loop counter.
                k,
                // The member key.
                v,
                // The member value.
                length, mind = gap, partial, value = holder[key];
            if (value) {
                var type = avalon.type(value);
                if (/date|string|number|boolean/i.test(type)) {
                    return toJSON(value, type);
                }
            }
            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }
            switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'NaN';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Array.isArray(value)) {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', { '': value });
        };
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ? walk({ '': j }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
        return window.JSON;
    }
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "bac21fbec45c613f4349c3fa5aa345f1" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4b917c7e9e3f6326ddfc695a7813cf22" , 
        filename : "avalon.live.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    var DOC = document;
    var root = DOC.documentElement;
    var IEEventMap = {
            'change': 'click',
            'focus': 'focusin',
            'blur': 'focusout'
        };
    function getVal(elem) {
        var type = elem.type;
        if (type === 'select-multiple') {
            if (elem.selectedIndex > -1) {
                var ret = [];
                for (var i = 0, el; el = elem.options[i++];) {
                    ret.push(el.selected);
                }
                return ret.join('-');
            } else {
                return '';
            }
        } else if (elem.nodeName.toLowerCase() === 'select') {
            return elem.selectedIndex;
        }
        return elem.value;
    }
    function testChange(e) {
        var callbacks = liveMap['fixChangechange'];
        var target = e.target;
        for (var i = callbacks.length, obj; obj = callbacks[--i];) {
            var elem = obj.elem;
            if (root.contains(elem)) {
                if (elem === target) {
                    var curVal = getVal(elem);
                    if (obj.__change__ !== curVal) {
                        e.type = 'change';
                        obj.fn.call(elem, e);
                        obj.__change__ = curVal;
                    }
                }
            } else {
                dequeue(callbacks, obj, i);
            }
        }
    }
    function dequeue(callbacks, obj, i) {
        var parent = obj.elem.parentNode;
        if (!parent || parent.nodeType == 11) {
            callbacks.splice(i, 1);
        }
    }
    var liveMap = avalon.bindingHandlers.live = function (data, vmodels) {
            var type = data.param;
            var elem = data.element;
            data.type = 'on';
            var live = 'noFix';
            if (!DOC.createEvent) {
                if (/focus|blur/.test(type)) {
                    live = 'fixFocus'    //旧式IE下使用focusin与focusout来模拟focus、blur，使用click来模拟复选框，单选框的change事件
;
                } else if (type == 'change') {
                    var elemType = elem.type;
                    if (elemType == 'radio' || elemType === 'checkbox') {
                        live = 'fixFocus';
                        if (!('_just_changed' in elem)) {
                            //确保只绑定一次
                            elem._just_changed = false;
                            elem.attachEvent('onpropertychange', function (e) {
                                if (e.propertyName == 'checked') {
                                    elem._just_changed = true;
                                }
                            });
                        }
                    } else {
                        live = 'fixChange';
                    }
                } else if (/submit|reset|select/.test(type)) {
                    live = false    //对于一些模拟成本太大的事件直接使用普通的事件绑定
;
                }
            }
            if (live) {
                if (!liveMap[live + type]) {
                    liveMap[live + type] = [];
                    if (live === 'noFix') {
                        avalon.bind(DOC, type, function (e) {
                            //W3C
                            var callbacks = liveMap[live + type];
                            var target = e.target;
                            for (var i = callbacks.length, obj; obj = callbacks[--i];) {
                                if (root.contains(obj.elem)) {
                                    if (obj.elem === target || obj.elem.contains(target)) {
                                        obj.fn.call(obj.elem, e);
                                    }
                                } else {
                                    dequeue(callbacks, obj, i);
                                }
                            }
                        }, true);
                    }
                    if (live === 'fixFocus') {
                        //旧式浏览器的focus，blur，单选框与复选枉的change
                        avalon.bind(DOC, IEEventMap[type], function (e) {
                            var callbacks = liveMap[live + type];
                            var target = e.target;
                            for (var i = callbacks.length, obj; obj = callbacks[--i];) {
                                var elem = obj.elem;
                                if (root.contains(elem)) {
                                    if (elem === target || elem.contains(target)) {
                                        if (type === 'change') {
                                            if (elem._just_changed === true) {
                                                e.type = 'change';
                                                obj.fn.call(elem, e);
                                                elem._just_changed = false;
                                            }
                                        } else {
                                            e.type = type;
                                            obj.fn.call(elem, e);
                                        }
                                    }
                                } else {
                                    dequeue(callbacks, obj, i);
                                }
                            }
                        });
                    }
                    if (live === 'fixChange') {
                        avalon.bind(DOC, 'beforeactivate', testChange);
                        avalon.bind(DOC, 'beforedeactivate', testChange);
                    }
                }
                data.specialBind = function (elem, fn) {
                    var obj = {
                            elem: elem,
                            fn: fn
                        };
                    if (/focus|blur/.test(type)) {
                        elem.tabIndex = elem.tabIndex || -1;
                    }
                    if (live === 'fixChange') {
                        obj.__change__ = getVal(elem);
                    }
                    var callbacks = liveMap[live + type];
                    callbacks.unshift(obj);
                    data.specialUnbind = function () {
                        avalon.Array.remove(callbacks, obj);
                        delete data.specialBind;
                        delete data.specialUnbind;
                    };
                };
            }
            avalon.bindingHandlers.on(data, vmodels);
        };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "4b917c7e9e3f6326ddfc695a7813cf22" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "2f17dbeb5563c45e749f1774d593001c" , 
        filename : "mmPromise.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    //chrome36的原生Promise还多了一个defer()静态方法，允许不通过传参就能生成Promise实例，
    //另还多了一个chain(onSuccess, onFail)原型方法，意义不明
    //目前，firefox24, opera19也支持原生Promise(chrome32就支持了，但需要打开开关，自36起直接可用)
    //本模块提供的Promise完整实现ECMA262v6 的Promise规范
    //2015.3.12 支持async属性
    function ok(val) {
        return val;
    }
    function ng(e) {
        throw e;
    }
    function done(onSuccess) {
        //添加成功回调
        return this.then(onSuccess, ng);
    }
    function fail(onFail) {
        //添加出错回调
        return this.then(ok, onFail);
    }
    function defer() {
        var ret = {};
        ret.promise = new this(function (resolve, reject) {
            ret.resolve = resolve;
            ret.reject = reject;
        });
        return ret;
    }
    var msPromise = function (executor) {
        this._callbacks = [];
        var me = this;
        if (typeof this !== 'object')
            throw new TypeError('Promises must be constructed via new');
        if (typeof executor !== 'function')
            throw new TypeError('not a function');
        executor(function (value) {
            _resolve(me, value);
        }, function (reason) {
            _reject(me, reason);
        });
    };
    function fireCallbacks(promise, fn) {
        if (typeof promise.async === 'boolean') {
            var isAsync = promise.async;
        } else {
            isAsync = promise.async = true;
        }
        if (isAsync) {
            window.setTimeout(fn, 0);
        } else {
            fn();
        }
    }
    //返回一个已经处于`resolved`状态的Promise对象
    msPromise.resolve = function (value) {
        return new msPromise(function (resolve) {
            resolve(value);
        });
    };
    //返回一个已经处于`rejected`状态的Promise对象
    msPromise.reject = function (reason) {
        return new msPromise(function (resolve, reject) {
            reject(reason);
        });
    };
    msPromise.prototype = {
        //一个Promise对象一共有3个状态：
        //- `pending`：还处在等待状态，并没有明确最终结果
        //- `resolved`：任务已经完成，处在成功状态
        //- `rejected`：任务已经完成，处在失败状态
        constructor: msPromise,
        _state: 'pending',
        _fired: false,
        //判定是否已经被触发
        _fire: function (onSuccess, onFail) {
            if (this._state === 'rejected') {
                if (typeof onFail === 'function') {
                    onFail(this._value);
                } else {
                    throw this._value;
                }
            } else {
                if (typeof onSuccess === 'function') {
                    onSuccess(this._value);
                }
            }
        },
        _then: function (onSuccess, onFail) {
            if (this._fired) {
                //在已有Promise上添加回调
                var me = this;
                fireCallbacks(me, function () {
                    me._fire(onSuccess, onFail);
                });
            } else {
                this._callbacks.push({
                    onSuccess: onSuccess,
                    onFail: onFail
                });
            }
        },
        then: function (onSuccess, onFail) {
            onSuccess = typeof onSuccess === 'function' ? onSuccess : ok;
            onFail = typeof onFail === 'function' ? onFail : ng;
            var me = this;
            //在新的Promise上添加回调
            var nextPromise = new msPromise(function (resolve, reject) {
                    me._then(function (value) {
                        try {
                            value = onSuccess(value);
                        } catch (e) {
                            // https://promisesaplus.com/#point-55
                            reject(e);
                            return;
                        }
                        resolve(value);
                    }, function (value) {
                        try {
                            value = onFail(value);
                        } catch (e) {
                            reject(e);
                            return;
                        }
                        resolve(value);
                    });
                });
            for (var i in me) {
                if (!personal[i]) {
                    nextPromise[i] = me[i];
                }
            }
            return nextPromise;
        },
        'done': done,
        'catch': fail,
        'fail': fail
    };
    var personal = {
            _state: 1,
            _fired: 1,
            _value: 1,
            _callbacks: 1
        };
    function _resolve(promise, value) {
        //触发成功回调
        if (promise._state !== 'pending')
            return;
        if (value && typeof value.then === 'function') {
            //thenable对象使用then，Promise实例使用_then
            var method = value instanceof msPromise ? '_then' : 'then';
            value[method](function (val) {
                _transmit(promise, val, true);
            }, function (reason) {
                _transmit(promise, reason, false);
            });
        } else {
            _transmit(promise, value, true);
        }
    }
    function _reject(promise, value) {
        //触发失败回调
        if (promise._state !== 'pending')
            return;
        _transmit(promise, value, false);
    }
    //改变Promise的_fired值，并保持用户传参，触发所有回调
    function _transmit(promise, value, isResolved) {
        promise._fired = true;
        promise._value = value;
        promise._state = isResolved ? 'fulfilled' : 'rejected';
        fireCallbacks(promise, function () {
            promise._callbacks.forEach(function (data) {
                promise._fire(data.onSuccess, data.onFail);
            });
        });
    }
    function _some(any, iterable) {
        iterable = Array.isArray(iterable) ? iterable : [];
        var n = 0, result = [], end;
        return new msPromise(function (resolve, reject) {
            // 空数组直接resolve
            if (!iterable.length)
                resolve();
            function loop(a, index) {
                a.then(function (ret) {
                    if (!end) {
                        result[index] = ret;
                        //保证回调的顺序
                        n++;
                        if (any || n >= iterable.length) {
                            resolve(any ? ret : result);
                            end = true;
                        }
                    }
                }, function (e) {
                    end = true;
                    reject(e);
                });
            }
            for (var i = 0, l = iterable.length; i < l; i++) {
                loop(iterable[i], i);
            }
        });
    }
    msPromise.all = function (iterable) {
        return _some(false, iterable);
    };
    msPromise.race = function (iterable) {
        return _some(true, iterable);
    };
    msPromise.defer = defer;
    avalon.Promise = msPromise;
    var nativePromise = window.Promise;
    if (/native code/.test(nativePromise)) {
        nativePromise.prototype.done = done;
        nativePromise.prototype.fail = fail;
        if (!nativePromise.defer) {
            //chrome实现的私有方法
            nativePromise.defer = defer;
        }
    }
    return window.Promise = nativePromise || msPromise;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "2f17dbeb5563c45e749f1774d593001c" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "da7aa09c8fdf60d28b0f82b2211bac52" , 
        filename : "avalon.store.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];
__context.____MODULES['bac21fbec45c613f4349c3fa5aa345f1'];

module.exports = (
function () {
    var store = {
            //一些接口(空实现)
            disabled: false,
            /*
         *  @interface 添加或设置某一数据
         *  @param name {String} 
         *  @param value {String} 
         */
            set: function (key, value) {
            },
            /*
         *  @interface 获取某一数据
         *  @param name {String} 
         *  @return {String}
         */
            get: function (key) {
            },
            /*
         *  @interface 移除某一数据
         *  @param key {String} 
         */
            remove: function (key) {
            },
            /*
         *  @interface 清空一数据
         */
            clear: function () {
            },
            /*
         *  @interface 遍历所有数据
         *  @param callback {Function} 里面会依次传入key与value
         */
            forEach: function (callback) {
            },
            /*
         *  @interface 得到所有数据，以对象形式返回
         *  @returns {Object}
         */
            getAll: function () {
                var ret = {};
                store.forEach(function (key, val) {
                    ret[key] = val;
                });
                return ret;
            },
            serialize: function (value) {
                return JSON.stringify(value);
            },
            parse: function (value) {
                if (typeof value !== 'string') {
                    return void 0;
                }
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value || undefined;
                }
            }
        };
    //http://wojodesign.com/full-browser-support-for-localstorage-without-cookies/
    //http://mathiasbynens.be/notes/localstorage-pattern
    var name = 'test' + (new Date() - 0), localStorageName = 'localStorage', storage;
    var supportLocalStorage = false;
    try {
        localStorage.setItem(name, 'mass');
        localStorage.removeItem(name);
        supportLocalStorage = true;
    } catch (e) {
    }
    if (supportLocalStorage) {
        storage = localStorage;
        avalon.mix(store, {
            //重写
            set: function (key, val) {
                if (val === void 0) {
                    return store.remove(key);
                }
                storage.setItem(key, store.serialize(val));
                return val;
            },
            get: function (key) {
                return store.parse(storage.getItem(key));
            },
            remove: function (key) {
                storage.removeItem(key);
            },
            clear: function () {
                storage.clear();
            },
            forEach: function (callback) {
                for (var i = 0; i < storage.length; i++) {
                    var key = storage.key(i);
                    callback(key, store.get(key));
                }
            }
        });
    } else if (document.documentElement.addBehavior) {
        var storageOwner, storageContainer;
        //由于＃userData的存储仅适用于特定的路径，
        //我们需要以某种方式关联我们的数据到一个特定的路径。我们选择/favicon.ico作为一个非常安全的目标，
        //因为所有的浏览器都发出这个URL请求，而且这个请求即使是404也不会有危险。
        //我们可以通过一个ActiveXObject(htmlfle)对象的文档来干这事。
        //(参见:http://msdn.microsoft.com/en-us/library/aa752574(v = VS.85). aspx)
        //因为iframe的访问规则允许直接访问和操纵文档中的元素，即使是404。
        //这文档可以用来代替当前文档（这被限制在当前路径）执行＃userData的存储。
        try {
            var scriptTag = 'script';
            storageContainer = new ActiveXObject('htmlfile');
            storageContainer.open();
            storageContainer.write('<' + scriptTag + '>document.w=window</' + scriptTag + '><iframe src="/favicon.ico"></iframe>');
            storageContainer.close();
            storageOwner = storageContainer.w.frames[0].document;
            storage = storageOwner.createElement('div');
        } catch (e) {
            storage = document.createElement('div');
            storageOwner = document.body;
        }
        function withIEStorage(storeFunction) {
            return function () {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(storage);
                //  http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
                //  http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
                storageOwner.appendChild(storage);
                storage.addBehavior('#default#userData');
                storage.load(localStorageName);
                var result = storeFunction.apply(store, args);
                try {
                    storageOwner.removeChild(storage);
                } catch (e) {
                }
                return result;
            };
        }
        // In IE7, keys may not contain special chars. See all of https://github.com/marcuswestin/store.js/issues/40
        var forbiddenCharsRegex = new RegExp('[!"#$%&\'()*+,/\\\\:;<=>?@[\\]^`{|}~]', 'g');
        function ieKeyFix(key) {
            return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
        }
        avalon.mix(store, {
            //重写
            set: withIEStorage(function (storage, key, val) {
                key = ieKeyFix(key);
                if (val === void 0) {
                    return store.remove(key);
                }
                storage.setAttribute(key, store.serialize(val));
                storage.save(localStorageName);
                return val;
            }),
            get: withIEStorage(function (storage, key) {
                key = ieKeyFix(key);
                return store.parse(storage.getAttribute(key));
            }),
            remove: withIEStorage(function (storage, key) {
                key = ieKeyFix(key);
                storage.removeAttribute(key);
                storage.save(localStorageName);
            }),
            clear: function () {
                store.forEach(function (name) {
                    store.remove(name);
                });
            },
            forEach: withIEStorage(function (storage, callback) {
                var attributes = storage.XMLDocument.documentElement.attributes;
                for (var i = 0, attr; attr = attributes[i]; ++i) {
                    callback(attr.name, store.parse(storage.getAttribute(attr.name)));
                }
            })
        });
    }
    try {
        store.set(localStorageName, localStorageName);
        if (store.get(localStorageName) != localStorageName) {
            store.disabled = true;
        }
        store.remove(localStorageName);
    } catch (e) {
        store.disabled = true;
    }
    avalon.store = store;
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "da7aa09c8fdf60d28b0f82b2211bac52" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1c711ab12176f81203ac6d5514608691" , 
        filename : "avalon.hotkeys.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];

module.exports = (
function () {
    //组合键绑定
    var specialKeys = {
            8: 'backspace',
            9: 'tab',
            10: 'return',
            13: 'return',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            19: 'pause',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'insert',
            46: 'del',
            96: '0',
            97: '1',
            98: '2',
            99: '3',
            100: '4',
            101: '5',
            102: '6',
            103: '7',
            104: '8',
            105: '9',
            106: '*',
            107: '+',
            109: '-',
            110: '.',
            111: '/',
            112: 'f1',
            113: 'f2',
            114: 'f3',
            115: 'f4',
            116: 'f5',
            117: 'f6',
            118: 'f7',
            119: 'f8',
            120: 'f9',
            121: 'f10',
            122: 'f11',
            123: 'f12',
            144: 'numlock',
            145: 'scroll',
            186: ';',
            191: '/',
            220: '\\',
            222: '\'',
            224: 'meta'
        };
    var shiftNums = {
            '`': '~',
            '1': '!',
            '2': '@',
            '3': '#',
            '4': '$',
            '5': '%',
            '6': '^',
            '7': '&',
            '8': '*',
            '9': '(',
            '0': ')',
            '-': '_',
            '=': '+',
            ';': ': ',
            '\'': '"',
            ',': '<',
            '.': '>',
            '/': '?',
            '\\': '|'
        };
    function sortKey(key) {
        return key.replace('++', '+add').split('+').sort().join('+');
    }
    var callbacks = [];
    function check(event, hotkeys) {
        var special = specialKeys[event.keyCode],
            //将keyCode转换为各种值
            character = String.fromCharCode(event.which).toLowerCase(), modif = '', possible = {};
        // 处理各种组合情况 (alt|ctrl|shift+X)
        if (event.altKey && special !== 'alt') {
            modif += 'alt+';
        }
        if (event.ctrlKey && special !== 'ctrl') {
            modif += 'ctrl+';
        }
        if (event.metaKey && !event.ctrlKey && special !== 'meta') {
            modif += 'meta+';
        }
        if (event.shiftKey && special !== 'shift') {
            modif += 'shift+';
        }
        if (character) {
            possible[sortKey(modif + character)] = true;
            possible[sortKey(modif + shiftNums[character])] = true;
            if (modif === 'shift+') {
                possible[shiftNums[character]] = true;
            }
        }
        if (possible[hotkeys]) {
            return true;
        }
    }
    avalon.bindingHandlers.hotkeys = function (data, vmodels) {
        data.specialBind = function (elem, fn) {
            var obj = {
                    elem: elem,
                    fn: fn,
                    hotkeys: sortKey(data.param)
                };
            callbacks.push(obj);
            data.specialUnbind = function () {
                avalon.Array.remove(callbacks, obj);
                delete data.specialBind;
                delete data.specialUnbind;
            };
        };
        data.type = 'on';
        avalon.bindingHandlers.on(data, vmodels);
    };
    //avalon.bindingExecutors.hotkeys = avalon.bindingExecutors.on
    var root = document.documentElement;
    var hotkeysCallback = function (e) {
        var safelist = callbacks.concat();
        for (var i = 0, obj; obj = safelist[i++];) {
            if (root.contains(obj.elem)) {
                if (check.call(obj.elem, e, obj.hotkeys)) {
                    return obj.fn.call(obj.elem, e);
                }
            } else {
                avalon.Array.remove(callbacks, obj);
            }
        }
    };
    avalon.bind(document, 'keydown', hotkeysCallback);
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "1c711ab12176f81203ac6d5514608691" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "043690ff485a9c9691b2cd85de953bbb" , 
        filename : "avalon.pager.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<div class=\"oni-pager\" onselectstart=\"return false;\" unselectable=\"on\" ms-visible=\"!!totalPages\">\n    <span class=\"oni-pager-prev\"\n          ms-class=\"oni-state-disabled:firstPage==1\"\n          ms-if=\"isShowPrev()\"\n          ms-attr-title=\"getTitle('prev')\" \n          ms-click=\"jumpPage($event,'prev')\" \n          ms-text=\"prevText\"\n          ></span>\n    <span class=\"oni-pager-item\"\n          ms-visible=\"firstPage!==1\" \n          ms-attr-title=\"getTitle('first', currentPage)\" \n          ms-click=\"jumpPage($event,'first')\" \n          ms-class-oni-state-active=\"currentPage == 1\"\n          ms-hover=\"oni-state-hover\">1</span>\n    <span class='oni-pager-omit'\n          ms-if=\"showFirstOmit\" \n          ms-text=\"ellipseText\"\n          ></span>\n    <span  class=\"oni-pager-item\" \n           ms-repeat=\"pages\" \n           ms-attr-title=\"getTitle(el, currentPage)\"\n           ms-hover=\"oni-state-hover\"\n           ms-click=\"jumpPage($event,el)\"\n           ms-class-oni-state-active=\"el == currentPage\" \n           ms-text=\"el\"\n           ></span>\n    <span class=\"oni-pager-omit\"\n          ms-if=\"showLastOmit\" \n          ms-text=\"ellipseText\"\n          ></span>\n    <span class=\"oni-pager-item \"\n          ms-visible=\"lastPage!==totalPages\" \n          ms-attr-title=\"getTitle('last', currentPage, totalPages)\" \n          ms-hover=\"oni-state-hover\" \n          ms-click=\"jumpPage($event,'last')\"  \n          ms-text=\"totalPages\"\n          ></span>\n    <span class=\"oni-pager-next\"\n          ms-if=\"isShowNext()\" \n          ms-attr-title=\"getTitle('next')\"\n          ms-click=\"jumpPage($event,'next')\" \n          ms-class=\"oni-state-disabled:lastPage==totalPages\"\n          ms-text=\"nextText\"\n          ></span>\n    <div class=\"oni-pager-jump\" ms-if=\"showJumper\">\n        <span class=\"oni-pager-text\" ms-html=\"_getTotalPages(totalPages)\"></span>\n        <div class=\"oni-pager-textbox-wrapper\">\n            <input class=\"oni-pager-textbox\" ms-duplex=\"_currentPage\" data-duplex-event=\"change\" ms-keyup=\"changeCurrentPage\">\n        </div>\n        <span class=\"oni-pager-text\">{{regional.pageText}}</span>\n        <button class=\"oni-pager-button\" ms-click=\"changeCurrentPage\" >{{regional.confirmText}}</button>\n    </div>\n</div>\n";

module.exports = (
function () {
    var widget = avalon.ui.pager = function (element, data, vmodels) {
            var options = data.pagerOptions;
            var pageOptions = options.options;
            if (Array.isArray(pageOptions)) {
                options.options = pageOptions.map(function (el) {
                    var obj = {};
                    switch (typeof el) {
                    case 'number':
                    case 'string':
                        obj.value = el;
                        obj.text = el;
                        return obj;
                    case 'object':
                        return el;
                    }
                });
            } else {
                options.options = [];
            }
            if (vmodels.cb) {
                template = template.replace(/ms-title/g, 'ms-attr-title');
            }
            //方便用户对原始模板进行修改,提高制定性
            options.template = options.getTemplate(template, options);
            options._currentPage = options.currentPage;
            var vmodel = avalon.define(data.pagerId, function (vm) {
                    avalon.mix(vm, options, { regional: widget.defaultRegional });
                    vm.widgetElement = element;
                    vm.rootElement = {};
                    vm.$skipArray = [
                        'showPages',
                        'rootElement',
                        'widgetElement',
                        'template',
                        'ellipseText',
                        'alwaysShowPrev',
                        'alwaysShowNext'
                    ];
                    //这些属性不被监控
                    vm.$init = function (continueScan) {
                        var pageHTML = options.template;
                        element.style.display = 'none';
                        setTimeout(function () {
                            element.innerHTML = pageHTML;
                            vm.rootElement = element.getElementsByTagName('*')[0];
                            element.style.display = 'block';
                            if (continueScan) {
                                continueScan();
                            } else {
                                avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                                avalon.scan(element, [vmodel].concat(vmodels));
                                if (typeof options.onInit === 'function') {
                                    options.onInit.call(element, vmodel, options, vmodels);
                                }
                            }
                        }, 100);
                    };
                    vm.$remove = function () {
                        element.innerHTML = element.textContent = '';
                    };
                    vm.jumpPage = function (event, page) {
                        event.preventDefault();
                        var enabled = this.className.indexOf('state-disabled') === -1;
                        if (enabled && page !== vm.currentPage) {
                            switch (page) {
                            case 'first':
                                vm.currentPage = 1;
                                break;
                            case 'last':
                                vm.currentPage = vm.totalPages;
                                break;
                            case 'next':
                                vm.currentPage++;
                                if (vm.currentPage > vm.totalPages) {
                                    vm.currentPage = vm.totalPages;
                                }
                                break;
                            case 'prev':
                                vm.currentPage--;
                                if (vm.currentPage < 1) {
                                    vm.currentPage = 1;
                                }
                                break;
                            default:
                                vm.currentPage = page;
                                break;
                            }
                            vm.onJump.call(element, event, vm);
                            efficientChangePages(vm.pages, getPages(vm));
                        }
                    };
                    vm.$watch('totalItems', function () {
                        efficientChangePages(vm.pages, getPages(vm));
                    });
                    vm.$watch('perPages', function (a) {
                        vm.currentPage = 1;
                        efficientChangePages(vm.pages, getPages(vm));
                    });
                    vm.$watch('currentPage', function (a) {
                        vmodel._currentPage = a;
                        efficientChangePages(vm.pages, getPages(vm));
                    });
                    vm.isShowPrev = function () {
                        var a = vm.alwaysShowPrev;
                        var b = vm.firstPage;
                        return a || b !== 1;
                    };
                    vm.isShowNext = function () {
                        var a = vm.alwaysShowNext;
                        var b = vm.lastPage;
                        var c = vm.totalPages;
                        return a || b !== c;
                    };
                    vm.changeCurrentPage = function (e, value) {
                        if (e.type === 'keyup') {
                            value = this.value;
                            if (e.keyCode !== 13)
                                return;
                        } else {
                            value = vmodel._currentPage;
                        }
                        value = parseInt(value, 10) || 1;
                        if (value > vmodel.totalPages || value < 1)
                            return;
                        //currentPage需要转换为Number类型 fix lb1064@qq.com
                        vmodel.currentPage = value;
                        vmodel.pages = getPages(vmodel);
                        vmodel.onJump.call(element, e, vm);
                    };
                    vm.pages = [];
                    vm.getPages = getPages;
                    //设置语言包
                    vm.setRegional = function (regional) {
                        vmodel.regional = regional;
                    };
                    vm._getTotalPages = function (totalPages) {
                        //return {{regional.totalText}}{{totalPages}}{{regional.pagesText}}，{{regional.toText}}{{regional.numberText}}
                        var regional = vmodel.regional, html = [
                                regional.totalText,
                                totalPages
                            ];
                        if (totalPages > 1) {
                            html.push(regional.pagesText);
                        } else {
                            html.push(regional.pageText);
                        }
                        html = html.concat([
                            ' ',
                            regional.jumpToText,
                            regional.numberText
                        ]);
                        return html.join('');
                    };
                    /**
             * @config {Function} 获取页码上的title的函数
             * @param {String|Number} a 当前页码的类型，如first, prev, next, last, 1, 2, 3
             * @param {Number} currentPage 当前页码
             * @param {Number} totalPages 最大页码
             * @returns {String}
             */
                    vm.getTitle = function (a, currentPage, totalPages) {
                        var regional = vmodel.regional;
                        switch (a) {
                        case 'first':
                            if (currentPage == 1) {
                                return regional.currentText;
                            }
                            return regional.jumpToText + ' ' + regional.firstText;
                        case 'prev':
                            return regional.jumpToText + ' ' + regional.prevText;
                        case 'next':
                            return regional.jumpToText + ' ' + regional.nextText;
                        case 'last':
                            if (currentPage == totalPages) {
                                return regional.currentText;
                            }
                            return regional.jumpToText + ' ' + regional.lastText;
                        default:
                            if (a === currentPage) {
                                return regional.currentText;
                            }
                            return regional.jumpToText + regional.numberText + ' ' + a + regional.pageText;
                        }
                    };
                });
            vmodel.pages = getPages(vmodel);
            return vmodel;
        };
    //vmodel.pages = getPages(vmodel) 会波及一些其他没有改动的元素节点,现在只做个别元素的添加删除操作
    function efficientChangePages(aaa, bbb) {
        var obj = {};
        for (var i = 0, an = aaa.length; i < an; i++) {
            var el = aaa[i];
            obj[el] = {
                action: 'del',
                el: el
            };
        }
        for (var i = 0, bn = bbb.length; i < bn; i++) {
            var el = bbb[i];
            if (obj[el]) {
                obj[el] = {
                    action: 'retain',
                    el: el
                };
            } else {
                obj[el] = {
                    action: 'add',
                    el: el
                };
            }
        }
        var scripts = [];
        for (var i in obj) {
            scripts.push({
                action: obj[i].action,
                el: obj[i].el
            });
        }
        scripts.sort(function (a, b) {
            return a.el - b.el;
        });
        scripts.forEach(function (el, index) {
            el.index = index;
        });
        //添加添加
        var reverse = [];
        for (var i = 0, el; el = scripts[i++];) {
            switch (el.action) {
            case 'add':
                aaa.splice(el.index, 0, el.el);
                break;
            case 'del':
                reverse.unshift(el);
                break;
            }
        }
        //再删除
        for (var i = 0, el; el = reverse[i++];) {
            aaa.splice(el.index, 1);
        }
    }
    //默认语言包为中文简体
    widget.regional = [];
    widget.regional['zh-CN'] = {
        prevText: '\u4E0A\u4E00\u9875',
        nextText: '\u4E0B\u4E00\u9875',
        confirmText: '\u786E\u5B9A',
        totalText: '\u5171',
        pagesText: '\u9875',
        pageText: '\u9875',
        toText: '\u5230',
        jumpToText: '\u8DF3\u8F6C\u5230',
        currentText: '\u5F53\u524D\u9875',
        firstText: '\u7B2C\u4E00\u9875',
        lastText: '\u6700\u540E\u4E00\u9875',
        numberText: '\u7B2C'
    };
    //设置默认语言包
    widget.defaultRegional = widget.regional['zh-CN'];
    widget.defaults = {
        perPages: 10,
        //@config {Number} 每页包含多少条目
        showPages: 10,
        //@config {Number} 中间部分一共要显示多少页(如果两边出现省略号,即它们之间的页数) 
        currentPage: 1,
        //@config {Number} 当前选中的页面 (按照人们日常习惯,是从1开始)，它会被高亮 
        _currentPage: 1,
        //@config {Number}  跳转台中的输入框显示的数字，它默认与currentPage一致
        totalItems: 200,
        //@config {Number} 总条目数
        totalPages: 0,
        //@config {Number} 总页数,通过Math.ceil(vm.totalItems / vm.perPages)求得
        pages: [],
        //@config {Array} 要显示的页面组成的数字数组，如[1,2,3,4,5,6,7]
        nextText: '>',
        //@config {String} “下一页”分页按钮上显示的文字 
        prevText: '<',
        //@config {String} “上一页”分页按钮上显示的文字 
        ellipseText: '\u2026',
        //@config {String} 省略的页数用什么文字表示 
        firstPage: 0,
        //@config {Number} 当前可显示的最小页码，不能小于1
        lastPage: 0,
        //@config {Number} 当前可显示的最大页码，不能大于totalPages
        alwaysShowNext: false,
        //@config {Boolean} 总是显示向后按钮
        alwaysShowPrev: false,
        //@config {Boolean} 总是显示向前按钮
        showFirstOmit: false,
        showLastOmit: false,
        showJumper: false,
        //是否显示输入跳转台
        /*
         * @config {Function} 用于重写模板的函数 
         * @param {String} tmpl
         * @param {Object} opts
         * @returns {String}
         */
        getTemplate: function (tmpl, opts) {
            return tmpl;
        },
        options: [],
        // @config {Array}数字数组或字符串数组或对象数组,但都转换为对象数组,每个对象都应包含text,value两个属性, 用于决定每页有多少页(看avalon.pager.ex3.html) 
        /**
         * @config {Function} 页面跳转时触发的函数,如果当前链接处于不可以点状态(oni-state-disabled),是不会触发的
         * @param {Event} e
         * @param {Object} vm  组件对应的VM
         */
        onJump: function (e, vm) {
        }
    };
    function getPages(vm) {
        var c = vm.currentPage, max = Math.ceil(vm.totalItems / vm.perPages), pages = [], s = vm.showPages, left = c, right = c;
        //一共有p页，要显示s个页面
        vm.totalPages = max;
        if (max <= s) {
            for (var i = 1; i <= max; i++) {
                pages.push(i);
            }
        } else {
            pages.push(c);
            while (true) {
                if (pages.length >= s) {
                    break;
                }
                if (left > 1) {
                    //在日常生活是以1开始的
                    pages.unshift(--left);
                }
                if (pages.length >= s) {
                    break;
                }
                if (right < max) {
                    pages.push(++right);
                }
            }
        }
        vm.firstPage = pages[0] || 1;
        vm.lastPage = pages[pages.length - 1] || 1;
        vm.showFirstOmit = vm.firstPage > 2;
        vm.showLastOmit = vm.lastPage < max - 1;
        return pages    //[0,1,2,3,4,5,6]
;
    }
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "043690ff485a9c9691b2cd85de953bbb" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "a11d645b0cc066e8d73a0778c2585af8" , 
        filename : "avalon.simplegrid.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
tmpl = "<div class=\"oni-simplegrid\">\n    <div class=\"oni-simplegrid-scroll-wrapper\" \n         ms-css-height=\"tbodyHeight+theadHeight\" \n         ms-widget=\"scrollbar,$simplegrid{{MS_OPTION_ID}},$spgScrollbarOpts\" \n         ms-css-padding-bottom=\"paddingBottom\"\n         data-scrollbar-position=\"right,bottom\">\n        <div class=\"oni-simplegrid-wrapper\"  \n             ms-css-nowidth=\"gridWidth\" \n             >\n            <table class=\"oni-simplegrid-thead\" \n                   ms-css-margin-left=\"cssLeft\" >\n                <tr>\n                    MS_OPTION_THEAD_BEGIN\n                    <td data-repeat-rendered=\"_theadRenderedCallback\"\n                        ms-repeat=\"columns\"\n                        ms-css-width=\"el.width\" \n                        ms-css-text-align=\"el.align\" \n                        ms-class=\"{{el.className}}\" \n                        ms-title=\"el.title\" \n                        ms-visible=\"el.toggle\" \n                        ms-data-vm=\"el\"\n                        ms-on-mousemove-10=\"startResize($event,el)\"\n                        ms-on-mousedown-10=\"resizeColumn($event,el)\"\n                        ms-on-mouseleave-10=\"stopResize\"\n                        >{{el.text | html}}\n                        <span  ms-click=\"sortColumn(el, $index)\"\n                               ms-if=\"el.sortable\" \n                               ms-class=\"oni-helper-{{ getArrow(el, $index)}}\">\n                            <span class=\"oni-helper-sort-top\"></span>\n                            <span class=\"oni-helper-sort-bottom\"></span>\n                        </span>\n                    </td>\n                    MS_OPTION_THEAD_END\n                </tr>\n            </table>\n            <table class=\"oni-simplegrid-tbody\" \n                   ms-css-margin-left=\"cssLeft\" >\n                <tr data-repeat-rendered=\"_tbodyRenderedCallback\"\n                    ms-repeat-row=\"_data\"\n                    ms-class=\"{{rowClass}}:$index % 2 && _data.size()>=2\"\n                    ms-hover=\"oni-state-hover\"\n                    ms-class-1=\"oni-state-selected: row.checked\"\n                    >\n                    MS_OPTION_TBODY_BEGIN\n                    <td class=\"oni-simplegrid-td\"\n                        data-with-sorted=\"getColumnsOrder\"\n                        ms-repeat=\"row\" \n                        ms-visible=\"getCellProperty($key,'toggle')\" \n                        ms-css-width=\"getCellProperty($key,'width')\"\n                        ms-css-text-align=\"getCellProperty($key,'align')\"\n                        >\n                        {{ renderCell($val, $key, row) | html }}\n                    </td>\n                    MS_OPTION_TBODY_END\n                </tr>\n            </table>\n            <div ms-if=\"!_data.size()\" \n                 ms-css-height=\"noResultHeight\"\n                 ms-css-line-height=\"{{noResultHeight}}px\"\n                 class=\"oni-simplegrid-empty\">\n                {{noResultContent|html}}\n            </div>\n        </div>\n        <div class=\"oni-scrollbar-scroller\">\n            <div class=\"oni-simplegrid-scroll-marker\" ms-css-height=\"getScrollerHeight()\" \n                 ms-css-nowidth=\"gridWidth\">\n            </div>\n\n        </div>\n    </div>\n    <div class=\"oni-simplegrid-pager-wrapper\"  ms-if=\"pageable\" id=\"pager-MS_OPTION_ID\" >\n\n    </div>\n    <div ms-widget=\"loading\"></div>\n</div>\n";
__context.____MODULES['043690ff485a9c9691b2cd85de953bbb'];
__context.____MODULES['90b2de0bf947d1814b382738513983f5'];
__context.____MODULES['25008a5bba9e941c7201b29c84441a68'];
__context.____MODULES['c3d66d673e82f1489bf416e19cae0c47'];

module.exports = (
function () {
    //切割出表头与表身的模板
    var gridTemplate = tmpl, theadTemplate, tbodyTemplate;
    gridTemplate = gridTemplate.replace(/MS_OPTION_THEAD_BEGIN([\s\S]+)MS_OPTION_THEAD_END/, function (a, b) {
        theadTemplate = b;
        return 'MS_OPTION_THEAD_HOLDER';
    });
    gridTemplate = gridTemplate.replace(/MS_OPTION_TBODY_BEGIN([\s\S]+)MS_OPTION_TBODY_END/, function (a, b) {
        tbodyTemplate = b;
        return 'MS_OPTION_TBODY_HOLDER';
    });
    var body = document.body || document.documentElement;
    var remptyfn = /^function\s+\w*\s*\([^)]*\)\s*{\s*}$/m;
    var widget = avalon.ui.simplegrid = function (element, data, vmodels) {
            var options = data.simplegridOptions, optId = +new Date(), scrollbarTimer;
            //格式化各列的具体规格
            options.columns = options.getColumns(options.columns, options);
            //允许指定表头与表身的每一行的模板
            makeTemplate(options, 'theadTemplate', theadTemplate);
            makeTemplate(options, 'tbodyTemplate', tbodyTemplate);
            var template = gridTemplate.replace(/MS_OPTION_THEAD_HOLDER/, options.theadTemplate).replace(/MS_OPTION_TBODY_HOLDER/, options.tbodyTemplate);
            //方便用户对原始模板进行修改,提高制定性
            options.template = options.getTemplate(template, options).replace(/\{\{MS_OPTION_ID\}\}/g, optId);
            //决定每页的行数(分页与滚动模式下都要用到它)
            //<------开始配置分页的参数
            if (typeof options.pager !== 'object') {
                options.pager = {};
            } else {
                options.pageable = true;
            }
            var pager = options.pager;
            //抽取要显示的数据(因为可能存在分页,不用全部显示,那么我们只将要显示的
            pager.perPages = options.pageable ? pager.perPages || options.data.length : options.data.length;
            pager.nextText = pager.nextText || '\u4E0B\u4E00\u9875';
            pager.prevText = pager.prevText || '\u4E0A\u4E00\u9875';
            if (Array.isArray(pager.options)) {
                pager.getTemplate = typeof pager.getTemplate === 'function' ? pager.getTemplate : function (tmpl) {
                    return tmpl + '<div class="oni-simplegrid-pager-options">\u6BCF\u9875\u663E\u793A<select ms-widget="dropdown" data-dropdown-list-width="50" data-dropdown-width="50" ms-duplex="perPages"><option ms-repeat="options" ms-value="el.value">{{el.text}}</option></select>\u6761,\u5171{{totalItems}}\u6761\u7ED3\u679C</div>';
                };
            }
            makeBool(pager, 'showJumper', true);
            //如果还不满意可以通过getPager方法重写
            options.pager = options.getPager(pager, options);
            //-----结束配置分页的参数--------->
            // 每页真实要显示的行数
            options.showRows = options.showRows || pager.perPages;
            //如果没有指定各列的出现顺序,那么将按用户定义时的顺序输出
            if (!Array.isArray(options.columnsOrder)) {
                var orders = [];
                for (var i = 0, el; el = options.columns[i++];) {
                    orders.push(el.field);
                }
                options.columnsOrder = orders;
            } else if (options.syncTheadColumnsOrder) {
                //如果用户指定columnsOrder,那么要对columns进行重排
                orders = options.columnsOrder.concat();
                var newColumns = [], oldColumns = options.columns, elem;
                while (el = orders.shift()) {
                    label:
                        for (var k = 0, kn = oldColumns.length; k < kn; k++) {
                            elem = oldColumns[k];
                            if (elem.field == el) {
                                newColumns.push(elem);
                                oldColumns.splice(k, 1);
                                break label;
                            }
                        }
                }
                options.columns = newColumns;
            }
            var _vmodels;
            var loadingOpts = {
                    toggle: false,
                    onInit: function (vm, options, vmodels) {
                        vmodel.loadingVModel = vm;
                    }
                };
            options.loading = avalon.type(options.loading) === 'object' ? avalon.mix(options.loading, loadingOpts) : loadingOpts;
            var vmodel = avalon.define(data.simplegridId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        '_init',
                        'widgetElement',
                        'data',
                        'addColumnCallbacks',
                        'scrollPanel',
                        'topTable',
                        'bottomTable',
                        'startIndex',
                        'pager',
                        'endIndex',
                        'template',
                        'loading',
                        'loadingVModel',
                        'rootElement'
                    ];
                    vm.loadingVModel = null;
                    vm.widgetElement = element;
                    vm.rootElement = '';
                    vm.gridWidth = '100%';
                    vm.startIndex = 0;
                    vm.endIndex = options.showRows;
                    vm.cssLeft = '0';
                    vm.barRight = 0;
                    vm.scrollerHeight = void 0;
                    vm.paddingBottom = '0';
                    vm.barUpdated = false;
                    vm._data = [];
                    vm._init = true;
                    vm.$init = function () {
                        avalon.ready(function () {
                            element.innerHTML = options.template.replace(/MS_OPTION_ID/g, vmodel.$id);
                            _vmodels = [vmodel].concat(vmodels);
                            vm.rootElement = element.getElementsByTagName('*')[0];
                            avalon.scan(element, _vmodels);
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        });
                    };
                    vm._theadRenderedCallback = function () {
                        var fns = getHiddenParent(vm.widgetElement);
                        fns[0]();
                        //位于表头的data-repeat-rendered回调,用于得到table的宽度
                        var tr = this;
                        //这是TR元素
                        var tbody = this.parentNode;
                        //tbody
                        var table = tbody.parentNode;
                        //table
                        var cells = tr.children;
                        //在旧式IE下可能包含注释节点
                        var cellIndex = 0;
                        for (var i = 0, cell; cell = cells[i++];) {
                            if (cell.nodeType === 1 && cell['data-vm']) {
                                var c = vm.columns[cellIndex++];
                                if (String(c.width).indexOf('%') === -1) {
                                    c.width = cell.offsetWidth;
                                }
                            }
                        }
                        vm.topTable = table;
                        //重置真正的代表表头的table
                        vm.theadHeight = avalon(table).innerHeight();
                        vm.scrollPanel = table.parentNode.parentNode;
                        //重置包含两个table的会出现滚动条的容器对象
                        vm.gridWidth = Math.min(table.offsetWidth, vm.scrollPanel.offsetWidth) + 1;
                        fns[1]();
                        vm.theadRenderedCallback.call(tbody, vmodel, options, vmodels);
                    };
                    vm._tbodyRenderedCallback = function (a) {
                        //取得tbody每一行的高
                        var tbody = this;
                        function delay() {
                            var cell = tbody.getElementsByTagName('td')[0] || tbody.getElementsByTagName('th')[0];
                            var fns = getHiddenParent(vm.widgetElement);
                            fns[0]();
                            var table = vm.bottomTable = tbody.parentNode;
                            var noResultHeight = !vmodel._data.size() ? vmodel.noResultHeight : 0;
                            //求出可见区的总高度
                            vm.tbodyHeight = avalon(table).innerHeight() + noResultHeight;
                            //取得总行数,以免行数为0时, vm.tbodyHeight / rowCount 得出Infinite
                            var rowCount = tbody.rows.length;
                            //求出每一行的高
                            vm._rowHeight = rowCount ? vm.tbodyHeight / rowCount : 35;
                            //根据是否分页, 求得每页的行数
                            var perPages = vm.pageable ? vm.pager.perPages : vm.data.length;
                            vm.tbodyScrollHeight = vm._rowHeight * perPages;
                            var borderHeight = cell ? Math.max(avalon.css(cell, 'borderTopWidth', true), avalon.css(cell, 'borderBottomWidth', true)) : 0;
                            vm._rowHeightNoBorders = vm._rowHeight - borderHeight * 2;
                            fns[1]();
                            vm.tbodyRenderedCallback.call(tbody, vmodel, options, vmodels);
                            // update scrollbar, if tbody rendered
                            setTimeout(function () {
                                vmodel.updateScrollbar(!vmodel.barUpdated);
                                vmodel.barUpdated = true;
                            });
                        }
                        //如果使用border-collapse: collapse,可能有一条边的高度被吞掉
                        setTimeout(delay, 100);
                    };
                    //::loading相关::
                    vm.showLoading = function () {
                        vmodel.loadingVModel.toggle = true;
                    };
                    vm.hideLoading = function () {
                        vmodel.loadingVModel.toggle = false;
                    };
                    vm.startResize = function (e, el) {
                        //当移动到表头的右侧,改变光标的形状,表示它可以拖动改变列宽
                        if (options._drag || !el.resizable)
                            return;
                        var cell = avalon(this);
                        var dir = getDirection(e, cell, options);
                        options._cursor = cell.css('cursor');
                        //保存原来的光标样式
                        if (dir === '') {
                            options.canResize = false;
                            cell.css('cursor', 'default');
                        } else {
                            options.canResize = cell;
                            cell.css('cursor', dir + '-resize')    //改变光标
;
                        }
                    };
                    vm.stopResize = function () {
                        if (options.canResize) {
                            options.canResize.css('cursor', options._cursor);
                            //还原光标样式
                            // update scrollbar, after resize end
                            vmodel.updateScrollbar('forceUpdate');
                            delete options.canResize;
                        }
                    };
                    //通过拖动改变列宽
                    vm.resizeColumn = function (e, el) {
                        var cell = options.canResize;
                        if (cell) {
                            //只有鼠标进入可拖动区域才能拖动
                            if (typeof el.width !== 'number') {
                                el.width = cell[0].offsetWidth;
                            }
                            var cellWidth = el.width;
                            var startX = e.pageX;
                            options._drag = true;
                            fixUserSelect();
                            var gridWidth = vm.gridWidth;
                            var moveFn = avalon.bind(document, 'mousemove', function (e) {
                                    if (options._drag) {
                                        e.preventDefault();
                                        var change = e.pageX - startX;
                                        vm.gridWidth = gridWidth + change;
                                        el.width = cellWidth + change;
                                        // update scrollbar while table size changed right now
                                        vmodel.updateScrollbar('forceUpdate');
                                    }
                                });
                            var upFn = avalon.bind(document, 'mouseup', function (e) {
                                    e.preventDefault();
                                    if (options._drag) {
                                        restoreUserSelect();
                                        delete options._drag;
                                        vm.gridWidth = gridWidth + e.pageX - startX;
                                        el.width = cellWidth + e.pageX - startX;
                                        avalon.unbind(document, 'mousemove', moveFn);
                                        avalon.unbind(document, 'mouseup', upFn);
                                    }
                                });
                        }
                    };
                    vm.sortIndex = NaN;
                    vm.getArrow = function (el, $index) {
                        var sortIndex = vm.sortIndex;
                        var asc = el.sortAsc;
                        return $index !== sortIndex ? 'ndb' : asc ? 'asc' : 'desc';
                    };
                    //如果当前列可以排序，那么点击标题旁边的icon,将会调用此方法
                    vm.sortColumn = function (el, $index) {
                        vm.sortIndex = $index;
                        var trend = el.sortAsc = !el.sortAsc;
                        var field = el.field;
                        var opts = vmodel.$model;
                        trend = trend ? 1 : -1;
                        if (typeof opts.remoteSort === 'function' && !remptyfn.test(opts.remoteSort)) {
                            vmodel.remoteSort(field, trend, vmodel);
                        } else if (typeof el.localSort === 'function' && !remptyfn.test(el.localSort)) {
                            // !isEmptyFn(el.localSort)
                            //如果要在本地排序,并且指定排数函数
                            vmodel._data.sort(function (a, b) {
                                return trend * el.localSort(a, b, field, opts) || 0;
                            });
                            if (typeof vmodel.onSort === 'function') {
                                setTimeout(function () {
                                    vmodel.onSort(vmodel);
                                }, 500);
                            }
                        } else {
                            //否则默认处理
                            vmodel._data.sort(function (a, b) {
                                return trend * (a[field] - b[field]) || 0;
                            });
                        }
                    };
                    //得到要渲染出来的列的名字的数组
                    vm.getColumnsOrder = function () {
                        return vm.columnsOrder;
                    };
                    //在指定列的位置添加一列
                    vm.addColumn = function (obj, i) {
                        var el = options.getColumns([obj], vm)[0];
                        var field = el.field;
                        if (vm.columnsOrder.indexOf(field) === -1) {
                            var index = parseInt(i, 10) || 0;
                            var defaultValue = el.defaultValue || '';
                            vm.columns.splice(index, 0, el);
                            vm.columnsOrder.splice(index, 0, field);
                            vm.addColumnCallbacks[field] = function (array) {
                                array.forEach(function (elem) {
                                    if (!elem.hasOwnProperty(field)) {
                                        elem[field] = defaultValue;
                                    }
                                });
                            };
                        }
                        vm.reRender(vm.data, vm);
                    };
                    //得到可视区某一个格子的显示情况,长度,align
                    vm.getCellProperty = function (name, prop) {
                        for (var i = 0, el; el = vm.columns[i++];) {
                            if (el.field === name) {
                                return el[prop];
                            }
                        }
                    };
                    //重新渲染表身
                    vm.throttleRenderTbody = function (n, o) {
                        vmodel.tbodyScrollTop = n;
                        cancelAnimationFrame(requestID);
                        requestID = requestAnimationFrame(function () {
                            reRenderTbody(n, o);
                        });
                    };
                    //::与滚动条相关::计算滚动条的高
                    vm.getScrollerHeight = function () {
                        var h = vmodel.tbodyScrollHeight + vmodel.tbodyScrollTop - vmodel.theadHeight, max = vmodel._rowHeight * vmodel.data.length;
                        // 设置一个上限，修复回滚bug
                        h = h > max ? max : h;
                        // until change is applied to element, change scrollerHeight
                        setTimeout(function (loop) {
                            var _h = vmodel.getScrollbar().getScroller().css('height');
                            if (h != _h && !loop) {
                                arguments.callee(1);
                                return;
                            }
                            vmodel.scrollerHeight = h;
                        }, 100);
                        return h;
                    };
                    //::与滚动条相关:: 滚动条的相关配置项
                    vm.$spgScrollbarOpts = {
                        onScroll: function (n, o, dir) {
                            // 竖直方向滚动
                            if (dir == 'v') {
                                clearTimeout(scrollbarTimer);
                                scrollbarTimer = setTimeout(function () {
                                    vmodel.throttleRenderTbody(n, o);
                                }, 16)    // 水平方向
;
                            } else {
                                vmodel.cssLeft = n == void 0 ? 'auto' : -n + 'px';
                            }
                        },
                        //::与滚动条相关::得到表身的高?
                        // 计算滚动视图区的高度，表格这边由于表头是不参与滚动的，所有视图区域高度是表格高度 - 表头高度
                        viewHeightGetter: function (ele) {
                            return ele.innerHeight() - vmodel.theadHeight;
                        },
                        show: vm.showScrollbar
                    };
                    vm.getScrollbar = function () {
                        return avalon.vmodels['$simplegrid' + optId];
                    };
                    // update scrollbar
                    //     var scrollbarInited
                    vm.updateScrollbar = function (force) {
                        if (!force)
                            return;
                        var scrollbar = vmodel.getScrollbar(), scroller = scrollbar.getScroller();
                        if (scrollbar) {
                            scrollbar.update();
                        }
                    };
                    vm.$watch('showRows', function (rows) {
                        vmodel.endIndex = rows;
                    });
                });
            vmodel._data = vmodel.getStore(vmodel.data, vmodel);
            //.data.slice(vm.startIndex, vm.endIndex)
            //<-----------开始渲染分页栏----------
            if (vmodel.pageable) {
                var flagPager = false;
                var intervalID = setInterval(function () {
                        var elem = document.getElementById('pager-' + vmodel.$id);
                        if (elem && !flagPager) {
                            elem.setAttribute('ms-widget', 'pager,pager-' + vmodel.$id);
                            avalon(elem).addClass('oni-simplegrid-pager-wrapper');
                            avalon.scan(elem, vmodel);
                            flagPager = true;
                        }
                        var pagerVM = avalon.vmodels['pager-' + vmodel.$id];
                        if (pagerVM) {
                            vmodel.pager = pagerVM;
                            clearInterval(intervalID);
                        }
                    }, 100);
            }
            //-----------结束渲染分页栏---------->
            //那一部分转换为监控数组就行,这样能大大提高性能)
            var requestID, prevScrollTop = 0, lastRenderedScrollTop = 0;
            function reRenderTbody(n, o) {
                // 不再读取scrollTop
                // var panel = vmodel.scrollPanel
                // var scrollTop = panel.scrollTop
                var scrollTop = n;
                var scrollDir = scrollTop > prevScrollTop ? 'down' : 'up';
                prevScrollTop = scrollTop;
                var distance = Math.abs(lastRenderedScrollTop - scrollTop);
                var rowHeight = vmodel._rowHeight;
                if (distance >= vmodel._rowHeightNoBorders) {
                    var linage = distance / rowHeight;
                    var integer = Math.floor(linage);
                    //取得整数部分
                    var decimal = linage - integer;
                    //取得小数部分
                    if (decimal > 0.55) {
                        //四舍五入
                        integer += 1    //要添加或删除的行数
;
                    }
                    var length = vmodel.data.length, count = 0, showRows = vmodel.showRows;
                    if (scrollDir === 'down') {
                        while (vmodel.endIndex + 1 < length) {
                            vmodel.endIndex += 1;
                            vmodel.startIndex += 1;
                            count += 1;
                            var el = vmodel.data[vmodel.endIndex];
                            // 优化，避免过度操作_data
                            if (integer - count <= showRows) {
                                vmodel._data.push(el);
                                vmodel._data.shift();
                            }
                            if (count === integer) {
                                break;
                            }
                        }
                    } else {
                        while (vmodel.startIndex >= 0) {
                            vmodel.endIndex -= 1;
                            vmodel.startIndex -= 1;
                            count += 1;
                            var el = vmodel.data[vmodel.startIndex];
                            // 优化，避免过度操作_data
                            if (integer - count <= showRows) {
                                vmodel._data.unshift(el);
                                vmodel._data.pop();
                            }
                            if (count === integer) {
                                break;
                            }
                        }
                    }
                    // 不在设置panel的scrollTop
                    lastRenderedScrollTop = vmodel.tbodyScrollTop = vmodel.startIndex * rowHeight    // lastRenderedScrollTop = panel.scrollTop = vmodel.tbodyScrollTop = vmodel.startIndex * rowHeight
;
                }
            }
            // 监听这个改变更靠谱
            vmodel.$watch('scrollerHeight', function (n) {
                if (n > 0) {
                    vmodel.getScrollbar().disabled = false;
                    vmodel.getScrollbar().toggle = true;
                    vmodel.updateScrollbar('forceUpdate');
                } else {
                    vmodel.getScrollbar().disabled = true;
                    vmodel.getScrollbar().toggle = false;
                }
            });
            return vmodel;
        };
    widget.defaults = {
        theadHeight: 35,
        noResultHeight: 100,
        tbodyScrollHeight: 'auto',
        rowClass: 'even',
        showScrollbar: 'always',
        //滚动条什么时候显示，默认一直，可设置为never，scrolling
        tbodyScrollTop: 0,
        tbodyHeight: 'auto',
        evenClass: 'even',
        _rowHeight: 35,
        //实际行高,包含border什么的
        _rowHeightNoBorders: 0,
        columnWidth: 160,
        edge: 15,
        _data: [],
        topTable: {},
        bottomTable: {},
        scrollPanel: {},
        addColumnCallbacks: {},
        pageable: false,
        syncTheadColumnsOrder: true,
        remoteSort: avalon.noop,
        //远程排数函数
        noResultContent: '\u6682\u65E0\u7ED3\u679C',
        theadRenderedCallback: function (vmodel, options, vmodels) {
        },
        tbodyRenderedCallback: function (vmodel, options, vmodels) {
            if (vmodel._init) {
                vmodel._init = false;
            } else {
                vmodel.widgetElement.scrollIntoView();
            }
        },
        renderCell: function (val, key, row) {
            return val;
        },
        getColumnTitle: function () {
            return '';
        },
        getTemplate: function (tmpl, options) {
            return tmpl;
        },
        reRender: function (data, vm) {
            avalon.each(vm.addColumnCallbacks, function (n, fn) {
                fn(data);
            });
            vm.data = data;
            vm._data = vm.getStore(data, vm);
            if (typeof vm.onSort === 'function') {
                setTimeout(function () {
                    vm.onSort(vm);
                }, 500);
            }
        },
        getStore: function (array, vm) {
            return array.slice(vm.startIndex, vm.endIndex);
        },
        getColumn: function (el, options) {
            return el;
        },
        getPager: function (pager, options) {
            return pager;
        },
        getColumns: function (array, options) {
            var ret = [];
            for (var i = 0, el; el = array[i++];) {
                //如果是字符串数组转换为对象数组,原来的值变成新对象的field属性
                if (typeof el === 'string') {
                    el = { field: el };
                }
                //field用于关联data中的字段
                el.text = el.text || el.field;
                //真正在表格里显示的内容
                el.title = options.getColumnTitle(el);
                //当前当元素格的title属性
                el.width = el.width || options.columnWidth;
                //指定宽度,可以是百分比
                el.className = el.className || '';
                //当前当元素格添加额外类名
                el.align = el.align || '';
                //赋给align属性,表示是对齐方向 left, right, center
                el.localSort = typeof el.localSort === 'function' ? el.localSort : false;
                //当前列的排序函数
                makeBool(el, 'sortable', true);
                //能否排序
                makeBool(el, 'resizable', false);
                //能否改变列宽
                makeBool(el, 'sortAsc', true);
                //排序方向
                makeBool(el, 'toggle', true);
                //是否显示当前列
                makeBool(el, 'disabledToggle');
                //禁止改变当前列的显示状态
                makeBool(el, 'disabledResize');
                //禁止改变当前列的宽度
                options.getColumn(el, options);
                ret.push(el);
            }
            return ret;
        }
    };
    var fixUserSelect = function () {
        avalon(body).addClass('oni-helper-noselect');
    };
    var restoreUserSelect = function () {
        avalon(body).removeClass('oni-helper-noselect');
    };
    if (window.VBArray && !('msUserSelect' in document.documentElement.style)) {
        var _ieSelectBack;
        //fix IE6789
        function returnFalse(event) {
            event.returnValue = false;
        }
        fixUserSelect = function () {
            _ieSelectBack = body.onselectstart;
            body.onselectstart = returnFalse;
        };
        restoreUserSelect = function () {
            body.onselectstart = _ieSelectBack;
        };
    }
    //优化scroll事件的回调次数
    var requestAnimationFrame = window.requestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    var cancelAnimationFrame = window.cancelAnimationFrame || function (id) {
            clearTimeout(id);
        };
    //得到移动的方向
    function getDirection(e, target, data) {
        var dir = '';
        var offset = target.offset();
        var width = target[0].offsetWidth;
        var edge = data.edge;
        if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
            dir = 'e';
        }
        return dir === 'e' ? dir : '';
    }
    function makeBool(elem, name, value) {
        value = !!value;
        elem[name] = typeof elem[name] === 'boolean' ? elem[name] : value;
    }
    function getHiddenParent(parent) {
        do {
            if (avalon(parent).css('display') === 'none') {
                var oldV, $parent = avalon(parent);
                return [
                    function show() {
                        $parent.css('display', 'block');
                        oldV = $parent.css('visibility');
                    },
                    function hide() {
                        $parent.css('display', 'none');
                        $parent.css('visibility', oldV);
                    }
                ];
            }
            if (parent.tagName === 'BODY') {
                break;
            }
        } while (parent = parent.parentNode);
        return [
            avalon.noop,
            avalon.noop
        ];
    }
    function makeTemplate(opts, name, value) {
        opts[name] = typeof opts[name] === 'function' ? opts[name](value, opts) : typeof opts[name] === 'string' ? opts[name] : value;
    }
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "a11d645b0cc066e8d73a0778c2585af8" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "b4d2b9bf030e54e2bf1c340a7282b0dc" , 
        filename : "avalon.validation.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];
__context.____MODULES['2f17dbeb5563c45e749f1774d593001c'];

module.exports = (
function () {
    if (!avalon.duplexHooks) {
        throw new Error('\u4F60\u7684\u7248\u672C\u5C11\u4E8Eavalon1.3.7\uFF0C\u4E0D\u652F\u6301ms-duplex2.0\uFF0C\u8BF7\u4F7F\u7528avalon.validation.old.js');
    }
    //==========================avalon.validation的专有逻辑========================
    function idCard(val) {
        if (/^\d{15}$/.test(val)) {
            return true;
        } else if (/^\d{17}[0-9xX]$/.test(val)) {
            var vs = '1,0,x,9,8,7,6,5,4,3,2'.split(','), ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(','), ss = val.toLowerCase().split(''), r = 0;
            for (var i = 0; i < 17; i++) {
                r += ps[i] * ss[i];
            }
            return vs[r % 11] == ss[17];
        }
    }
    // isCorrectDate("2015-2-21") true
    // isCorrectDate("2015-2-31") false
    function isCorrectDate(value) {
        if (typeof value === 'string' && value) {
            //是字符串但不能是空字符
            var arr = value.split('-');
            //可以被-切成3份，并且第1个是4个字符
            if (arr.length === 3 && arr[0].length === 4) {
                var year = ~~arr[0];
                //全部转换为非负整数
                var month = ~~arr[1] - 1;
                var date = ~~arr[2];
                var d = new Date(year, month, date);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === date;
            }
        }
        return false;
    }
    //  var remail = /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/
    var remail = /^([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+@([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+\.[A-Z]{2,3}$/i;
    var ripv4 = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i;
    var ripv6 = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i;
    //规则取自淘宝注册登录模块
    var phoneOne = {
            //中国移动
            cm: /^(?:0?1)((?:3[56789]|5[0124789]|8[278])\d|34[0-8]|47\d)\d{7}$/,
            //中国联通
            cu: /^(?:0?1)(?:3[012]|4[5]|5[356]|8[356]\d|349)\d{7}$/,
            //中国电信
            ce: /^(?:0?1)(?:33|53|8[079])\d{8}$/,
            //中国大陆
            cn: /^(?:0?1)[3458]\d{9}$/    //中国香港
                                      //   hk: /^(?:0?[1569])(?:\d{7}|\d{8}|\d{12})$/,
                                      //澳门
                                      // macao: /^6\d{7}$/,
                                      //台湾
                                      //  tw: /^(?:0?[679])(?:\d{7}|\d{8}|\d{10})$//*,
                                      //韩国
                                      //  kr:/^(?:0?[17])(?:\d{9}|\d{8})$/,
                                      //日本
                                      // jp:/^(?:0?[789])(?:\d{9}|\d{8})$/*/
        };
    /*
     * http://login.sdo.com/sdo/PRes/4in1_2/js/login.js
     * function isPhone(val){
     var gvPhoneRegExpress=new Array();
     gvPhoneRegExpress.push(/^14[57]\d{8}$/);
     gvPhoneRegExpress.push(/^15[012356789]\d{8}$/);
     gvPhoneRegExpress.push(/^13[0-9]\d{8}$/);
     gvPhoneRegExpress.push(/^18[012456789]\d{8}$/);
     var lvCellphoneIsOk=false;
     for (var i=0;i<gvPhoneRegExpress.length;i++){
     if(gvPhoneRegExpress[i].test(val)){
     lvCellphoneIsOk=true;
     break;
     }
     }
     return lvCellphoneIsOk;
     }
     其他手机号码正则
     /^(13\d\d|15[012356789]\d|18[012356789]\d|14[57]\d|17(0[059]|[78]\d))\d{7}$/
     /^(?:(?:13|18|15)[0-9]{9}|(?:147|170|176|177|178|199|196)[0-9]{8})$/; 
     
     */
    avalon.mix(avalon.duplexHooks, {
        trim: {
            get: function (value, data) {
                if (data.element.type !== 'password') {
                    value = String(value || '').trim();
                }
                return value;
            }
        },
        required: {
            message: '\u5FC5\u987B\u586B\u5199',
            get: function (value, data, next) {
                next(value !== '');
                return value;
            }
        },
        norequired: {
            message: '\u53EF\u4EE5\u4E0D\u5199',
            get: function (value, data, next) {
                next(true);
                return value;
            }
        },
        'int': {
            message: '\u5FC5\u987B\u662F\u6574\u6570',
            get: function (value, data, next) {
                next(/^\-?\d+$/.test(value));
                return value;
            }
        },
        phone: {
            message: '\u624B\u673A\u53F7\u7801\u4E0D\u5408\u6CD5',
            get: function (value, data, next) {
                var ok = false;
                for (var i in phoneOne) {
                    if (phoneOne[i].test(value)) {
                        ok = true;
                        break;
                    }
                }
                next(ok);
                return value;
            }
        },
        decimal: {
            message: '\u5FC5\u987B\u662F\u5C0F\u6570',
            get: function (value, data, next) {
                next(/^\-?\d*\.?\d+$/.test(value));
                return value;
            }
        },
        alpha: {
            message: '\u5FC5\u987B\u662F\u5B57\u6BCD',
            get: function (value, data, next) {
                next(/^[a-z]+$/i.test(value));
                return value;
            }
        },
        alpha_numeric: {
            message: '\u5FC5\u987B\u4E3A\u5B57\u6BCD\u6216\u6570\u5B57',
            get: function (value, data, next) {
                next(/^[a-z0-9]+$/i.test(value));
                return value;
            }
        },
        alpha_dash: {
            message: '\u5FC5\u987B\u4E3A\u5B57\u6BCD\u6216\u6570\u5B57\u53CA\u4E0B\u5212\u7EBF\u7B49\u7279\u6B8A\u5B57\u7B26',
            validate: function (value, data, next) {
                next(/^[a-z0-9_\-]+$/i.test(value));
                return value;
            }
        },
        chs: {
            message: '\u5FC5\u987B\u662F\u4E2D\u6587\u5B57\u7B26',
            get: function (value, data, next) {
                next(/^[\u4e00-\u9fa5]+$/.test(value));
                return value;
            }
        },
        chs_numeric: {
            message: '\u5FC5\u987B\u662F\u4E2D\u6587\u5B57\u7B26\u6216\u6570\u5B57\u53CA\u4E0B\u5212\u7EBF\u7B49\u7279\u6B8A\u5B57\u7B26',
            get: function (value, data, next) {
                next(/^[\\u4E00-\\u9FFF0-9_\-]+$/i.test(value));
                return value;
            }
        },
        qq: {
            message: '\u817E\u8BAFQQ\u53F7\u4ECE10000\u5F00\u59CB',
            get: function (value, data, next) {
                next(/^[1-9]\d{4,10}$/.test(value));
                return value;
            }
        },
        id: {
            message: '\u8EAB\u4EFD\u8BC1\u683C\u5F0F\u9519\u8BEF',
            get: function (value, data, next) {
                next(idCard(value));
                return value;
            }
        },
        ipv4: {
            message: 'ip\u5730\u5740\u4E0D\u6B63\u786E',
            get: function (value, data, next) {
                next(ripv4.test(value));
                return value;
            }
        },
        ipv6: {
            message: 'ip\u5730\u5740\u4E0D\u6B63\u786E',
            get: function (value, data, next) {
                next(ripv6.test(value));
                return value;
            }
        },
        email: {
            message: '\u90AE\u4EF6\u5730\u5740\u9519\u8BEF',
            get: function (value, data, next) {
                next(remail.test(value));
                return value;
            }
        },
        url: {
            message: 'URL\u683C\u5F0F\u9519\u8BEF',
            get: function (value, data, next) {
                next(/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(value));
                return value;
            }
        },
        repeat: {
            message: '\u5BC6\u7801\u8F93\u5165\u4E0D\u4E00\u81F4',
            get: function (value, data, next) {
                var id = data.element.getAttribute('data-duplex-repeat') || '';
                var other = avalon(document.getElementById(id)).val() || '';
                next(value === other);
                return value;
            }
        },
        date: {
            message: '\u5FC5\u987B\u7B26\u5408\u65E5\u671F\u683C\u5F0F YYYY-MM-DD',
            get: function (value, data, next) {
                next(isCorrectDate(value));
                return value;
            }
        },
        passport: {
            message: '\u62A4\u7167\u683C\u5F0F\u9519\u8BEF\u6216\u8FC7\u957F',
            get: function (value, data, next) {
                next(/^[a-zA-Z0-9]{4,20}$/i.test(value));
                return value;
            }
        },
        minlength: {
            message: '\u6700\u5C11\u8F93\u5165{{min}}\u4E2A\u5B57',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('minlength'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-minlength'), 10);
                }
                var num = data.data.min = a;
                next(value.length >= num);
                return value;
            }
        },
        maxlength: {
            message: '\u6700\u591A\u8F93\u5165{{max}}\u4E2A\u5B57',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('maxlength'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-maxlength'), 10);
                }
                var num = data.data.max = a;
                next(value.length <= num);
                return value;
            }
        },
        gt: {
            message: '\u5FC5\u987B\u5927\u4E8E{{max}}',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('max'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-gt'), 10);
                }
                var num = data.data.max = a;
                next(parseFloat(value) > num);
                return value;
            }
        },
        lt: {
            message: '\u5FC5\u987B\u5C0F\u4E8E{{min}}',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('min'), 10);
                if (!isFinite(a)) {
                    a = parseInt(elem.getAttribute('data-duplex-lt'), 10);
                }
                var num = data.data.min = a;
                next(parseFloat(value) < num);
                return value;
            }
        },
        //contain
        eq: {
            message: '\u5FC5\u987B\u7B49\u4E8E{{eq}}',
            get: function (value, data, next) {
                var elem = data.element;
                var a = parseInt(elem.getAttribute('data-duplex-eq'), 10);
                var num = data.data.eq = a;
                next(parseFloat(value) == num);
                return value;
            }
        },
        contains: {
            message: '\u5FC5\u987B\u5305\u542B{{array}}\u4E2D\u7684\u4E00\u4E2A',
            get: function (val, data, next) {
                var vmValue = [].concat(val).map(String);
                var domValue = (data.element.getAttribute('data-duplex-contains') || '').split(',');
                data.data.array = domValue;
                var has = false;
                for (var i = 0, n = vmValue.length; i < n; i++) {
                    var v = vmValue[i];
                    if (domValue.indexOf(v) >= 0) {
                        has = true;
                        break;
                    }
                }
                next(has);
                return val;
            }
        },
        contain: {
            message: '\u5FC5\u987B\u5305\u542B{{array}}',
            get: function (val, data, next) {
                var vmValue = [].concat(val).map(String);
                var domValue = (data.element.getAttribute('data-duplex-contain') || '').split(',');
                data.data.array = domValue.join('\u4E0E');
                if (!vmValue.length) {
                    var has = false;
                } else {
                    has = true;
                    for (var i = 0, n = domValue.length; i < n; i++) {
                        var v = domValue[i];
                        if (vmValue.indexOf(v) === -1) {
                            has = false;
                            break;
                        }
                    }
                }
                next(has);
                return val;
            }
        },
        pattern: {
            message: '\u5FC5\u987B\u5339\u914D/{{pattern}}/\u8FD9\u6837\u7684\u683C\u5F0F',
            get: function (value, data, next) {
                var elem = data.element;
                var h5pattern = elem.getAttribute('pattern');
                var mspattern = elem.getAttribute('data-duplex-pattern');
                var pattern = data.data.pattern = h5pattern || mspattern;
                var re = new RegExp('^(?:' + pattern + ')$');
                next(re.test(value));
                return value;
            }
        }
    });
    //<input type="number" max=x min=y step=z/> <input type="range" max=x min=y step=z/>
    //
    function fixEvent(event) {
        if (event.target) {
            return event;
        }
        var ret = {};
        for (var i in event) {
            ret[i] = event[i];
        }
        var target = ret.target = event.srcElement;
        if (event.type.indexOf('key') === 0) {
            ret.which = event.charCode != null ? event.charCode : event.keyCode;
        } else if (/mouse|click/.test(event.type)) {
            var doc = target.ownerDocument || document;
            var box = doc.compatMode === 'BackCompat' ? doc.body : doc.documentElement;
            ret.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0);
            ret.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0);
            ret.wheelDeltaY = ret.wheelDelta;
            ret.wheelDeltaX = 0;
        }
        ret.timeStamp = new Date() - 0;
        ret.originalEvent = event;
        ret.preventDefault = function () {
            //阻止默认行为
            event.returnValue = false;
        };
        ret.stopPropagation = function () {
            //阻止事件在DOM树中的传播
            event.cancelBubble = true;
        };
        return ret;
    }
    var widget = avalon.ui.validation = function (element, data, vmodels) {
            var options = data.validationOptions;
            var onSubmitCallback;
            var vmodel = avalon.define(data.validationId, function (vm) {
                    avalon.mix(vm, options);
                    vm.$skipArray = [
                        'widgetElement',
                        'data',
                        'validationHooks',
                        'validateInKeyup',
                        'validateAllInSubmit',
                        'resetInBlur'
                    ];
                    vm.widgetElement = element;
                    vm.data = [];
                    /**
             * @interface 为元素绑定submit事件，阻止默认行为
             */
                    vm.$init = function () {
                        element.setAttribute('novalidate', 'novalidate');
                        avalon.scan(element, [vmodel].concat(vmodels));
                        if (vm.validateAllInSubmit) {
                            onSubmitCallback = avalon.bind(element, 'submit', function (e) {
                                e.preventDefault();
                                vm.validateAll(vm.onValidateAll);
                            });
                        }
                        if (typeof options.onInit === 'function') {
                            //vmodels是不包括vmodel的
                            options.onInit.call(element, vmodel, options, vmodels);
                        }
                    };
                    /**
             * @interface 销毁组件，移除相关回调
             */
                    vm.$destory = function () {
                        vm.data = [];
                        onSubmitCallback && avalon.unbind(element, 'submit', onSubmitCallback);
                        element.textContent = element.innerHTML = '';
                    };
                    /**
             * @interface 验证当前元素下的所有非disabled元素
             * @param callback {Null|Function} 最后执行的回调，如果用户没传就使用vm.onValidateAll
             */
                    vm.validateAll = function (callback) {
                        var fn = typeof callback === 'function' ? callback : vm.onValidateAll;
                        var promise = vm.data.filter(function (data) {
                                var el = data.element;
                                return el && !el.disabled && vmodel.widgetElement.contains(el);
                            }).map(function (data) {
                                return vm.validate(data, true);
                            });
                        Promise.all(promise).then(function (array) {
                            var reasons = [];
                            for (var i = 0, el; el = array[i++];) {
                                reasons = reasons.concat(el);
                            }
                            if (vm.deduplicateInValidateAll) {
                                var uniq = {};
                                reasons = reasons.filter(function (data) {
                                    var el = data.element;
                                    var id = el.getAttribute('data-validation-id');
                                    if (!id) {
                                        id = setTimeout('1');
                                        el.setAttribute('data-validation-id', id);
                                    }
                                    if (uniq[id]) {
                                        return false;
                                    } else {
                                        uniq[id] = true;
                                        return true;
                                    }
                                });
                            }
                            fn.call(vm.widgetElement, reasons)    //这里只放置未通过验证的组件
;
                        });
                    };
                    /**
             * @interface 重置当前表单元素
             * @param callback {Null|Function} 最后执行的回调，如果用户没传就使用vm.onResetAll
             */
                    vm.resetAll = function (callback) {
                        vm.data.filter(function (el) {
                            return el.element;
                        }).forEach(function (data) {
                            try {
                                vm.onReset.call(data.element, { type: 'reset' }, data);
                            } catch (e) {
                            }
                        });
                        var fn = typeof callback == 'function' ? callback : vm.onResetAll;
                        fn.call(vm.widgetElement);
                    };
                    /**
             * @interface 验证单个元素对应的VM中的属性是否符合格式<br>此方法是框架自己调用
             * @param data {Object} 绑定对象
             * @param isValidateAll {Undefined|Boolean} 是否全部验证,是就禁止onSuccess, onError, onComplete触发
             * @param event {Undefined|Event} 方便用户判定这是由keyup,还是blur等事件触发的
             */
                    vm.validate = function (data, isValidateAll, event) {
                        var value = data.valueAccessor();
                        var inwardHooks = vmodel.validationHooks;
                        var globalHooks = avalon.duplexHooks;
                        var promises = [];
                        var elem = data.element;
                        data.validateParam.replace(/\w+/g, function (name) {
                            var hook = inwardHooks[name] || globalHooks[name];
                            if (!elem.disabled) {
                                var resolve, reject;
                                promises.push(new Promise(function (a, b) {
                                    resolve = a;
                                    reject = b;
                                }));
                                var next = function (a) {
                                    if (data.norequired && value === '') {
                                        a = true;
                                    }
                                    if (a) {
                                        resolve(true);
                                    } else {
                                        var reason = {
                                                element: elem,
                                                data: data.data,
                                                message: elem.getAttribute('data-duplex-' + name + '-message') || elem.getAttribute('data-duplex-message') || hook.message,
                                                validateRule: name,
                                                getMessage: getMessage
                                            };
                                        resolve(reason);
                                    }
                                };
                                data.data = {};
                                hook.get(value, data, next);
                            }
                        });
                        //如果promises不为空，说明经过验证拦截器
                        var lastPromise = Promise.all(promises).then(function (array) {
                                var reasons = [];
                                for (var i = 0, el; el = array[i++];) {
                                    if (typeof el === 'object') {
                                        reasons.push(el);
                                    }
                                }
                                if (!isValidateAll) {
                                    if (reasons.length) {
                                        vm.onError.call(elem, reasons, event);
                                    } else {
                                        vm.onSuccess.call(elem, reasons, event);
                                    }
                                    vm.onComplete.call(elem, reasons, event);
                                }
                                return reasons;
                            });
                        return lastPromise;
                    };
                    //收集下方表单元素的数据
                    vm.$watch('avalon-ms-duplex-init', function (data) {
                        var inwardHooks = vmodel.validationHooks;
                        data.valueAccessor = data.evaluator.apply(null, data.args);
                        switch (avalon.type(data.valueAccessor())) {
                        case 'array':
                            data.valueResetor = function () {
                                this.valueAccessor([]);
                            };
                            break;
                        case 'boolean':
                            data.valueResetor = function () {
                                this.valueAccessor(false);
                            };
                            break;
                        case 'number':
                            data.valueResetor = function () {
                                this.valueAccessor(0);
                            };
                            break;
                        default:
                            data.valueResetor = function () {
                                this.valueAccessor('');
                            };
                            break;
                        }
                        var globalHooks = avalon.duplexHooks;
                        if (typeof data.pipe !== 'function' && avalon.contains(element, data.element)) {
                            var params = [];
                            var validateParams = [];
                            data.param.replace(/\w+/g, function (name) {
                                var hook = inwardHooks[name] || globalHooks[name];
                                if (hook && typeof hook.get === 'function' && hook.message) {
                                    validateParams.push(name);
                                } else {
                                    params.push(name);
                                }
                                if (name === 'norequired') {
                                    data.norequired = true;
                                }
                            });
                            data.validate = vm.validate;
                            data.param = params.join('-');
                            data.validateParam = validateParams.join('-');
                            if (validateParams.length) {
                                if (vm.validateInKeyup) {
                                    data.bound('keyup', function (e) {
                                        var type = data.element && data.element.getAttribute('data-duplex-event');
                                        if (!type || /^(?:key|mouse|click|input)/.test(type)) {
                                            var ev = fixEvent(e);
                                            setTimeout(function () {
                                                vm.validate(data, 0, ev);
                                            });
                                        }
                                    });
                                }
                                if (vm.validateInBlur) {
                                    data.bound('blur', function (e) {
                                        vm.validate(data, 0, fixEvent(e));
                                    });
                                }
                                if (vm.resetInFocus) {
                                    data.bound('focus', function (e) {
                                        vm.onReset.call(data.element, fixEvent(e), data);
                                    });
                                }
                                var array = vm.data.filter(function (el) {
                                        return el.element;
                                    });
                                avalon.Array.ensure(array, data);
                                vm.data = array;
                            }
                            return false;
                        }
                    });
                });
            return vmodel;
        };
    var rformat = /\\?{{([^{}]+)\}}/gm;
    function getMessage() {
        var data = this.data || {};
        return this.message.replace(rformat, function (_, name) {
            return data[name] == null ? '' : data[name];
        });
    }
    widget.defaults = {
        validationHooks: {},
        //@config {Object} 空对象，用于放置验证规则
        onSuccess: avalon.noop,
        //@config {Function} 空函数，单个验证成功时触发，this指向被验证元素this指向被验证元素，传参为一个对象数组外加一个可能存在的事件对象
        onError: avalon.noop,
        //@config {Function} 空函数，单个验证失败时触发，this与传参情况同上
        onComplete: avalon.noop,
        //@config {Function} 空函数，单个验证无论成功与否都触发，this与传参情况同上
        onValidateAll: avalon.noop,
        //@config {Function} 空函数，整体验证后或调用了validateAll方法后触发；有了这东西你就不需要在form元素上ms-on-submit="submitForm"，直接将提交逻辑写在onValidateAll回调上
        onReset: avalon.noop,
        //@config {Function} 空函数，表单元素获取焦点时触发，this指向被验证元素，大家可以在这里清理className、value
        onResetAll: avalon.noop,
        //@config {Function} 空函数，当用户调用了resetAll后触发，
        validateInBlur: true,
        //@config {Boolean} true，在blur事件中进行验证,触发onSuccess, onError, onComplete回调
        validateInKeyup: true,
        //@config {Boolean} true，在keyup事件中进行验证,触发onSuccess, onError, onComplete回调
        validateAllInSubmit: true,
        //@config {Boolean} true，在submit事件中执行onValidateAll回调
        resetInFocus: true,
        //@config {Boolean} true，在focus事件中执行onReset回调,
        deduplicateInValidateAll: false    //@config {Boolean} false，在validateAll回调中对reason数组根据元素节点进行去重
    }    //http://bootstrapvalidator.com/
         //https://github.com/rinh/jvalidator/blob/master/src/index.js
         //http://baike.baidu.com/view/2582.htm?fr=aladdin&qq-pf-to=pcqq.group
;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "b4d2b9bf030e54e2bf1c340a7282b0dc" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "e094a664ed6d23474631337f87eadd6f" , 
        filename : "avalon.tree.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
template = "<ul class=\"oni-tree oni-helper-clearfix\" \n\tms-visible=\"toggle\" \n\tms-attr-id=\"$guid\" \n    ms-class=\"no-select:!view.txtSelectedEnable\"\n\tms-live-click=\"liveClick($event)\" \n\tms-live-contextmenu=\"excute('rightClick', $event, false, 'liveContextmenu')\">\n\t{{loadNodes()|html}}\n</ul>",
leafTemplate = "<span class=\"button switch center_docu\" \n      ms-class=\"bottom_docu:$last\" \n      ms-class-100=\"{{levelClass(leaf)}}\" \n      ms-class-2=\"noline_docu:!optionToBoolen(view.showLine, leaf)\"></span>\n{{MS_CHECK_HTML}}\n<a  {{MS_EDIT_BINDING}} \n   ms-class=\"curSelectedNode:hasClassSelect(leaf)\" \n   ms-class-100=\"{{levelClass(leaf)}}\" \n   ms-attr-target=\"leaf.target || '_blank'\" \n   ms-attr-href=\"leaf.url || '#'\" \n   ms-on-mousedown=\"excute('mousedown', $event, leaf)\" \n   ms-on-mouseup=\"excute('mouseup', $event, leaf)\" \n   ms-attr-title=\"exprAnd(leaf, view.showTitle, leaf.title || leaf.name)\"\n   ms-click=\"excute('click',$event,leaf,'selectFun')\">\n    <span class=\"button ico_docu\" \n          ms-css-background=\"computeIcon(leaf)\" \n          ms-class-100=\"{{levelClass(leaf)}}\" \n          ms-if=\"exprAnd(leaf, view.showIcon,leaf.icon)\"></span>\n    <span class=\"button ico_docu\" \n          ms-class-100=\"{{levelClass(leaf)}}\" \n          ms-if=\"exprAnd(leaf, view.showIcon,!leaf.icon)\"></span>\n  \t<span \n          ms-class-100=\"{{levelClass(leaf)}}\" >{{view.nameShower(leaf)|html}}</span>\n  \t{{MS_EDIT_HTML}}\n</a>",
parentTemplate = "<span class=\"button switch\" \n      ms-class-100=\"{{levelClass(leaf)}}\" \n      ms-class=\"{{computeLineClass(leaf, $first, $last)}}\"\n      ms-click=\"toggleOpenStatue($event,leaf)\" \n      ms-if=\"exprAnd(leaf, view.showSwitch)\"></span>\n{{MS_CHECK_HTML}}\n<a {{MS_EDIT_BINDING}} \n   ms-class-100=\"{{levelClass(leaf)}}\" \n   ms-class=\"curSelectedNode:hasClassSelect(leaf)\" \n   ms-click=\"excute('click',$event,leaf,'selectFun')\" \n   ms-attr-target=\"leaf.target || '_blank'\" \n   ms-attr-href=\"leaf.url || '#'\" \n   ms-on-mousedown=\"excute('mousedown', $event, leaf)\" \n   ms-on-mouseup=\"excute('mouseup', $event, leaf)\" \n   ms-attr-title=\"exprAnd(leaf, view.showTitle, leaf.title || leaf.name)\" \n\t ms-dblclick=\"excute('dblClick', $event, leaf,'toggleOpenStatue')\">\n    <span class=\"button\" \n          ms-attr-id=\"'treeIcon'+leaf.$id\" \n          ms-css-background=\"{{computeIcon(leaf)}}\" \n          ms-class-100=\"{{levelClass(leaf)}}\" \n          ms-if=\"shallIconShow(leaf, leaf.icon_close, leaf.icon_open)\" \n          ms-class=\"{{computeIconClass(leaf)}}\"></span>\n    <span class=\"button\" \n          ms-attr-id=\"'treeIcon'+leaf.$id\" \n          ms-class-100=\"{{levelClass(leaf)}}\" \n          ms-if=\"shallIconShowReverse(leaf, leaf.icon_close, leaf.icon_open)\" \n          ms-class=\"{{computeIconClass(leaf)}}\"></span>\n  \t<span \n          ms-class-100=\"{{levelClass(leaf)}}\" >{{view.nameShower(leaf)|html}}</span>\n    {{MS_EDIT_HTML}}\n</a>\n<ul class=\"line\" \n    ms-class-100=\"{{levelClass(leaf, 1)}}\" \n    ms-if=\"hasChildren(leaf)\" \n    ms-class-2=\"noline_docu:!optionToBoolen(view.showLine,leaf)\"\n    ms-visible=\"hasChildren(leaf, 'visible')\"\n    ms-attr-id=\"'c'+leaf.$id\">\n\t  {{loadNodes(\"levelGT0\")|html}}\n    </ul>",
nodesTemplate = "<li tabindex=\"0\" \n    ms-class-100=\"{{levelClass(leaf)}}\" \n    ms-attr-id=\"leaf.$id\" \n    ms-visible=\"!leaf.isHidden\"\n    ms-attr-level=\"leaf.level\"\n    ms-attr-timeStamp=\"timeStamp()\" \n    ms-repeat-leaf=\"children\">\n    {{loadLeafTemplate(leaf)|html}}\n</li>";
__context.____MODULES['4b917c7e9e3f6326ddfc695a7813cf22'];

module.exports = (
function () {
    var optionKeyToFixMix = {
            view: 1,
            callback: 1,
            data: 1
        }, eventList = [
            'click',
            'dblClick',
            'collapse',
            'expand',
            'select',
            'contextmenu',
            'mousedown',
            'mouseup'
        ], ExtentionMethods = [], undefine = void 0, tplDict = {}, disabelSelectArr = [], callbacks = [], cnt = 0;
    //  tool functions
    function g(id) {
        return document.getElementById(id);
    }
    function guid() {
        return 'tree' + cnt++;
    }
    function tplFormate(tpl, options) {
        return tpl.replace(/\{\{MS_[^\}]+\}\}/g, function (mt) {
            var k = mt.substr(mt.indexOf('_') + 1).replace('}}', '').toLowerCase(), v = tplDict[k] || '';
            if (avalon.isFunction(v))
                return v(tpl, options);
            return v;
        });
    }
    //  树状数据的标准化，mvvm的痛
    function dataFormator(arr, parentLeaf, dataFormated, func, vm) {
        var newArr = [];
        avalon.each(arr, function (index, item) {
            if (!dataFormated) {
                // 拷贝替换
                newArr[index] = itemFormator(avalon.mix({}, item), parentLeaf, vm);
            } else if (item) {
                item.$parentLeaf = parentLeaf;
                item.level = parentLeaf ? parentLeaf.level + 1 : 0;
                func && func(item);
            }
            if (item && item.children && item.children.length) {
                if (!dataFormated) {
                    newArr[index].children = dataFormator(item.children, newArr[index], dataFormated, undefine, vm);
                } else {
                    dataFormator(item.children, item, dataFormated, func, vm);
                }
            }
        });
        return dataFormated ? arr : newArr;
    }
    function formate(item, dict) {
        avalon.each(dict, function (key, value) {
            if (key === 'hasOwnProperty')
                return;
            item[key] = item[value] || '';
        });
    }
    /**
      * 格式化数据，补全字段
      */
    function itemFormator(item, parentLeaf, vm) {
        if (!item)
            return;
        item.level = parentLeaf ? parentLeaf.level + 1 : 0;
        item.isParent = itemIsParent(item);
        formate(item, vm.data.key);
        // 不要可监听
        item.$parentLeaf = parentLeaf || '';
        if (item.isParent) {
            item.open = !!item.open;
        } else {
            item.open = false;
        }
        // 诶，子节点也可能被编辑成父节点...         
        item.children = item.children || [];
        return item;
    }
    function itemIsParent(item) {
        return !!item.isParent || !!item.open || !!(item.children && item.children.length);
    }
    /**  将简单的数组结构数据转换成树状结构
      *  注如果是一个没有子节点的父节点必须加isParent = true，open属性只有父节点有必要有
      *  input array like [
      *      {id: 1, pId: 0, name: xxx, open: boolean, others},// parent node
      *      {id: 11, pId: 1, name: xxx, others}// 子节点
      *  ]
      */
    function simpleDataToTreeData(arr, vm) {
        if (!arr.length)
            return [];
        var dict = vm.data.simpleData, idKey = dict.idKey, pIdKey = dict.pIdKey;
        var prev, tree = [], stack = [], tar, now;
        for (var i = 0, len = arr.length; i < len; i++) {
            now = itemFormator(arr[i], undefine, vm);
            // 前一个节点是直属父节点
            if (prev && prev[idKey] === now[pIdKey]) {
                // 标记父节点
                prev.isParent = true;
                itemFormator(prev, undefine, vm);
                // 防止重复压入堆栈
                if (!tar || tar !== prev) {
                    stack.push(prev);
                    tar = prev;
                }
                tar.children.push(now)    // 当前节点是一个父节点或者没有出现过父节点或者出现的父节点非自己的父节点
;
            } else if (now.isParent || !tar || tar[idKey] !== now[pIdKey]) {
                // 出栈知道找到自己的父节点或者栈空
                while (tar && now[pIdKey] !== tar[idKey]) {
                    stack.pop();
                    tar = stack[stack.length - 1];
                }
                (tar && tar.children || tree).push(now);
                // 明确已知自己是一个父节点，压入栈中
                if (now.isParent) {
                    stack.push(now);
                    tar = now;
                }    // 非父节点以及未确认是否父节点
            } else {
                (tar && tar.children || tree).push(now);
            }
            now.level = stack.length;
            now[pIdKey] = now[pIdKey] || 0;
            prev = now;
        }
        return tree;
    }
    function arrayIndex(arr, filter) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (filter(arr[i]))
                return i;
        }
        return -1;
    }
    function upperFirstLetter(str) {
        return str.replace(/^[a-z]{1}/g, function (mat) {
            return mat.toUpperCase();
        });
    }
    var commonInit = true;
    var widget = avalon.ui.tree = function (element, data, vmodels) {
            if (commonInit) {
                avalon.bind(document.body, 'selectstart', disabelSelect);
                avalon.bind(document.body, 'drag', disabelSelect);
                commonInit = false;
            }
            var options = data.treeOptions, cache = {};
            // 缓存节点
            //方便用户对原始模板进行修改,提高定制性
            options.template = options.getTemplate(template, options);
            options.parentTemplate = options.getTemplate(parentTemplate, options, 'parent');
            options.leafTemplate = options.getTemplate(leafTemplate, options, 'leaf');
            options.nodesTemplate = options.getTemplate(nodesTemplate, options, 'nodes');
            var newOpt = { $guid: guid() }, dataBak;
            avalon.mix(newOpt, options);
            avalon.each(optionKeyToFixMix, function (key) {
                avalon.mix(true, newOpt[key], avalon.mix(true, {}, widget.defaults[key], newOpt[key]));
            });
            dataBak = options.children;
            if (newOpt.data.simpleData.enable) {
                newOpt.children = simpleDataToTreeData(newOpt.children, newOpt);
            } else {
                newOpt.children = dataFormator(newOpt.children, undefine, undefine, undefine, newOpt);
            }
            newOpt.template = tplFormate(newOpt.template, newOpt).replace(/\n/g, '').replace(/>[\s]+</g, '><');
            newOpt.parentTemplate = tplFormate(newOpt.parentTemplate, newOpt).replace(/\n/g, '').replace(/>[\s]+</g, '><');
            newOpt.leafTemplate = tplFormate(newOpt.leafTemplate, newOpt).replace(/\n/g, '').replace(/>[\s]+</g, '><');
            newOpt.nodesTemplate = tplFormate(newOpt.nodesTemplate, newOpt).replace(/\n/g, '').replace(/>[\s]+</g, '><');
            var vmodel = avalon.define(data.treeId, function (vm) {
                    // mix插件配置
                    avalon.each(ExtentionMethods, function (i, func) {
                        func && func(vm, vmodels);
                    });
                    avalon.mix(vm, newOpt);
                    vm.widgetElement = element;
                    vm.widgetElement.innerHTML = vm.template;
                    vm.rootElement = element.getElementsByTagName('*')[0];
                    vm.$skipArray = [
                        'widgetElement',
                        'template',
                        'callback',
                        'rootElement'
                    ];
                    vm._select = [];
                    var inited;
                    vm.$init = function (continueScan) {
                        if (inited)
                            return;
                        inited = true;
                        dataFormator(vm.children, undefine, '\u6784\u5EFA\u7236\u5B50\u8282\u70B9\u8854\u63A5\u5173\u7CFB', function (leaf) {
                            cache[leaf.$id] = leaf;
                        }, vm);
                        if (!vm.view.txtSelectedEnable && navigator.userAgent.match(/msie\s+[5-8]/gi)) {
                            disabelSelectArr.push(vm.widgetElement);
                        }
                        if (continueScan) {
                            continueScan();
                        } else {
                            avalon.log('avalon\u8BF7\u5C3D\u5FEB\u5347\u52301.3.7+');
                            avalon.scan(element, [vmodel].concat(vmodels));
                            if (typeof options.onInit === 'function') {
                                options.onInit.call(element, vmodel, options, vmodels);
                            }
                        }
                    };
                    vm.$remove = function () {
                        element.innerHTML = element.textContent = '';
                        cache = null;
                        vm._select = null;
                    };
                    vm.computeIconClass = function (leaf) {
                        return (leaf.iconSkin ? leaf.iconSkin + '_' : '') + 'ico_' + (leaf.isParent ? vm.hasClassOpen(leaf, 'ignoreNoline') ? 'open' : 'close' : 'docu');
                    };
                    vm.shallIconShow = function (leaf) {
                        if (!vm.exprAnd(leaf, vm.view.showIcon))
                            return false;
                        return vm.exprAnd.apply(null, arguments);
                    };
                    vm.shallIconShowReverse = function (leaf) {
                        if (!vm.exprAnd(leaf, vm.view.showIcon))
                            return false;
                        return !vm.exprAnd.apply(null, arguments);
                    };
                    vm.computeIcon = function (leaf) {
                        var ico = leaf.isParent ? vm.hasClassOpen(leaf) ? leaf.icon_open || '' : leaf.icon_close || '' : leaf.icon ? leaf.icon : '';
                        if (ico) {
                            return 'url("' + ico + '") 0 0 no-repeat';
                        }
                        return '';
                    };
                    vm.computeLineClass = function (leaf, first, last) {
                        var status = leaf.open ? 'open' : 'close', pos = first && !leaf.level ? 'roots' : last ? 'bottom' : 'center';
                        if (!vm.optionToBoolen(vm.view.showLine, leaf))
                            pos = 'noline';
                        return pos + '_' + status;
                    };
                    vm.levelClass = function (leaf, adding) {
                        var adding = adding || 0;
                        return 'level' + ((leaf.level || 0) + adding);
                    };
                    // 展开相关
                    // 展开
                    vm.hasClassOpen = function (leaf, noline) {
                        if (vm.optionToBoolen(vm.view.showLine, leaf)) {
                            return leaf.isParent && leaf.open && noline != 'noline';
                        } else {
                            return leaf.isParent && leaf.open && noline;
                        }
                    };
                    vm.toggleOpenStatue = function (event, leaf) {
                        var leaf = leaf || event.leaf;
                        if (!leaf)
                            return;
                        leaf.open ? vm.excute('collapse', event, leaf, 'collapse') : vm.excute('expand', event, leaf, 'expand');
                    };
                    /**
             * @interface 展开leaf节点
             * @param {Object} 指定节点，也可以是{leaf:leaf} or leaf
             * @param {boolen} 表示是否迭代所有子孙节点
             */
                    vm.expand = function (arg, all, openOrClose) {
                        var leaf = arg && arg.leaf || arg;
                        if (!leaf) {
                            leaf = vm;
                        } else {
                            if (!leaf.isParent)
                                return;
                            leaf.open = !openOrClose;
                        }
                        var children = leaf.children, leafDom = g(leaf.$id);
                        // 节点未渲染，或不可见，向上溯源处理
                        if (!openOrClose && (!leafDom || !leafDom.scrollHeight))
                            vm.cVisitor(leaf, function (node) {
                                if (node == vm)
                                    return;
                                node.open = true;
                            });
                        // 互斥
                        if (vm.view.singlePath && !openOrClose) {
                            vm.brotherVisitor(leaf, function (item, opt) {
                                if (item != leaf && item.open)
                                    vm.excute('collapse', arg.e, item, 'collapse');
                            });
                        }
                        if (all && children)
                            avalon.each(children, function (i, item) {
                                vm.expand(item, 'all', openOrClose);
                            });
                    };
                    /**
             * @interface 展开 / 折叠 全部节点，返回true表示展开，false表示折叠，此方法不会触发 beforeExpand / onExpand 和 beforeCollapse / onCollapse 事件回调函数
             * @param {arr} true 表示 展开 全部节点，false 表示 折叠 全部节点
             */
                    vm.expandAll = function (openOrClose) {
                        openOrClose ? vm.expand(undefine, 'all') : vm.collapse(undefine, 'all');
                        return openOrClose;
                    };
                    /**
             * @interface 折叠leaf节点的子节点
             * @param {Object} 指定节点，也可以是{leaf:leaf} or leaf
             * @param {boolen} 表示是否迭代所有子孙节点
             */
                    vm.collapse = function (leaf, all, event) {
                        vm.expand(leaf, all, 'close', event);
                    };
                    vm.hasChildren = function (leaf, visible) {
                        // 有有效子节点
                        var renderStatus = leaf.children && leaf.children.length && vm.hasClassOpen(leaf, 'ignoreNoline');
                        if (visible) {
                            return renderStatus;
                        } else {
                            return renderStatus || g('c' + leaf.$id);
                        }
                    };
                    vm.loadLeafTemplate = function (leaf) {
                        if (leaf.isParent)
                            return vm.parentTemplate;
                        return vm.leafTemplate;
                    };
                    vm.loadNodes = function (levelGT0) {
                        if (!levelGT0)
                            return vm.nodesTemplate;
                        return vm.nodesTemplate.replace(/leaf=\"children\"/g, 'leaf="leaf.children"');
                    };
                    /**
             * @interface 隐藏某个节点
             * @param {Object} 指定节点，也可以是{leaf:leaf} or leaf
             */
                    vm.hideNode = function (leaf) {
                        leaf = leaf && leaf.leaf || leaf;
                        vm.hideNodes([leaf]);
                    };
                    /**
             * @interface 隐藏节点集合
             * @param {Array} 节点集合
             */
                    vm.hideNodes = function (nodes, flag) {
                        flag = flag === undefine ? false : flag;
                        avalon.each(nodes, function (i, node) {
                            node.isHidden = flag;
                        });
                    };
                    /**
             * @interface 显示某个节点
             * @param {Object} 指定节点，也可以是{leaf:leaf} or leaf
             */
                    vm.showNode = function (node) {
                        node = node && node.leaf || node;
                        vm.showNodes([node]);
                    };
                    /**
             * @interface 显示节点集合
             * @param {Array} 节点集合
             */
                    vm.showNodes = function (nodes) {
                        vm.hideNodes(nodes, true);
                    };
                    /**
             * @interface 中序向下遍历树，返回一个数组
             * @param {Object} 起点，为空表示根
             * @param {Function} 递归操作，传递参数是当前节点，options，如果!!return != false，则将返回压入res
             * @param {Function} 终止遍历判断，传递参数是res,当前节点,起点，return true则终止遍历
             * @param {Array} 存储结果的数组，为空则会内部声明一个
             * @param {Object} 用于辅助func的参数
             */
                    vm.visitor = function (startLeaf, func, endFunc, res, options) {
                        var startLeaf = startLeaf || vm, res = res || [];
                        if (startLeaf != vm) {
                            var data = func(startLeaf, options);
                            data && res.push(data);
                            if (endFunc && endFunc(res, startLeaf, startLeaf))
                                return res;
                        }
                        if (startLeaf.children && startLeaf.children.length) {
                            for (var i = 0, children = startLeaf.children, len = children.length; i < len; i++) {
                                if (endFunc && endFunc(res, children[i], startLeaf))
                                    break;
                                vm.visitor(children[i], func, endFunc, res, options);
                            }
                        }
                        return res;
                    };
                    /**
             * @interface 向上溯源，返回一个数组
             * @param {Object} 起点
             * @param {Function} 递归操作，传递参数是当前节点，options，如果!!return != false，则将返回压入res
             * @param {Function} 终止遍历判断，传递参数是res,当前节点,起点，return true则终止遍历
             * @param {Array} 存储结果的数组，为空则会内部声明一个
             * @param {Object} 用于辅助func的参数
             */
                    vm.cVisitor = function (startLeaf, func, endFunc, res, options) {
                        var res = res || [];
                        if (startLeaf) {
                            var data = func(startLeaf, options);
                            data && res.push(data);
                            // 结束溯源
                            if (endFunc && endFunc(res, startLeaf, startLeaf))
                                return res;
                            // 继续向上
                            if (startLeaf.$parentLeaf)
                                vm.cVisitor(startLeaf.$parentLeaf, func, endFunc, res, options);
                        }
                        return res;
                    };
                    /**
             * @interface 同级访问，返回一个数组
             * @param {Object} 起点
             * @param {Function} 递归操作，传递参数是当前节点，options，如果!!return != false，则将返回压入res
             * @param {Function} 终止遍历判断，传递参数是res,当前节点,起点，return true则终止遍历
             * @param {Array} 存储结果的数组，为空则会内部声明一个
             * @param {Object} 用于辅助func的参数
             */
                    vm.brotherVisitor = function (startLeaf, func, endFunc, res, options) {
                        var res = res || [];
                        if (startLeaf) {
                            var data, brothers = vm.getBrothers(startLeaf);
                            for (var i = 0, len = brothers.length; i < len; i++) {
                                data = func && func(brothers[i], options);
                                data && res.push(data);
                                // endCheck
                                if (endFunc && endFunc(res, brothers[i], startLeaf))
                                    break;
                            }
                        }
                        return res;
                    };
                    vm.getBrothers = function (leaf) {
                        if (!leaf)
                            return [];
                        return leaf.$parentLeaf ? leaf.$parentLeaf.children : vm.children;
                    };
                    /**
             * @interface 根据$id快速获取节点 JSON 数据对象
             * @param {Object} $id，avalon生成数据的pid
             */
                    vm.getNodeByTId = function (id) {
                        return cache[id];
                    };
                    /**
             * @interface 获取某节点在同级节点中的序号
             * @param {Object} 指定的节点
             */
                    vm.getNodeIndex = function (leaf) {
                        var c = vm.getBrothers(leaf);
                        for (var i = 0, len = c.length; i < len; i++) {
                            if (c[i] === leaf)
                                return i;
                        }
                        return -1;
                    };
                    /**
             * @interface 获取全部节点数据，如果指定了leaf则返回leaf的所有子节点，不包括leaf
             * @param {Object} 指定节点
             */
                    vm.getNodes = function (leaf) {
                        return leaf ? leaf.children : vm.children;
                    };
                    /**
             * @interface 根据自定义规则搜索节点数据 JSON 对象集合 或 单个节点数据，不包含指定的起始节点
             * @param {Function} 自定义过滤器函数 function filter(node) {...}
             * @param isSingle = true 表示只查找单个节点 !!isSingle = false 表示查找节点集合
             * @param 可以指定在某个父节点下的子节点中搜索
             * @param 用户自定义的数据对象，用于 filter 中进行计算
             */
                    vm.getNodesByFilter = function (fitler, isSingle, startLeaf, options) {
                        return vm.visitor(startLeaf, function (node, opt) {
                            if (node === startLeaf)
                                return;
                            if (filter && filter(node, opt))
                                return node;
                        }, isSingle ? function (data, node) {
                            return data.length > 0;
                        } : false, [], options);
                    };
                    /**
             * @interface 根据节点数据的属性搜索，获取条件完全匹配的节点数据 JSON 对象，不包含指定的起始节点
             * @param {String} 需要精确匹配的属性名称
             * @param 需要精确匹配的属性值，可以是任何类型，只要保证与 key 指定的属性值保持一致即可
             * @param 可以指定在某个父节点下的子节点中搜索
             */
                    vm.getNodeByParam = function (key, value, startLeaf) {
                        return vm.getNodesByParam(key, value, startLeaf, function (data, node) {
                            return data.length > 0;
                        });
                    };
                    /**
             * @interface 根据节点数据的属性搜索，获取条件完全匹配的节点数据 JSON 对象集合，不包含指定的起始节点
             * @param {String} 需要精确匹配的属性名称
             * @param 需要精确匹配的属性值，可以是任何类型，只要保证与 key 指定的属性值保持一致即可
             * @param 可以指定在某个父节点下的子节点中搜索
             */
                    vm.getNodesByParam = function (key, value, startLeaf, endFunc) {
                        return vm.visitor(startLeaf, function (leaf) {
                            if (leaf === startLeaf)
                                return;
                            return leaf[key] === value ? leaf : false;
                        }, endFunc, []);
                    };
                    /**
             * @interface 根据节点数据的属性搜索，获取条件模糊匹配的节点数据 JSON 对象集合，不包含指定的起始节点
             * @param 需要模糊匹配的属性值，用于查找的时候执行正则匹配，不是正则表达式
             * @param 可以指定在某个父节点下的子节点中搜索
             */
                    vm.getNodesByParamFuzzy = function (key, value, startLeaf) {
                        return vm.visitor(startLeaf, function (leaf) {
                            if (leaf === startLeaf)
                                return;
                            return (leaf[key] + '').match(new RegExp(value, 'g')) ? leaf : false;
                        }, false, []);
                    };
                    /**
             * @interface 获取节点相邻的前一个节点
             * @param {Object} 指定的节点
             */
                    vm.getPreNode = function (leaf, next) {
                        var allMates = vm.getBrothers(leaf), index = vm.getNodeIndex(leaf);
                        return index > -1 ? allMates[next ? index + 1 : index - 1] : false;
                    };
                    /**
             * @interface 获取节点相邻的后一个节点
             * @param {Object} 指定节点
             */
                    vm.getNextNode = function (leaf) {
                        return vm.getPreNode(leaf, 'next');
                    };
                    /**
             * @interface 获取节点的父节点
             * @param {Object} 指定的节点
             */
                    vm.getParentNode = function (leaf) {
                        return leaf && leaf.$parentLeaf;
                    };
                    /**
             * @interface 添加多个节点，返回被添加的节点
             * @param {Object} 指定的父节点，如果增加根节点，请设置 parentNode 为 null 即可
             * @param {Array} 需要增加的节点数据 JSON 对象集合
             * @param 设定增加节点后是否自动展开父节点。isSilent = true 时，不展开父节点，其他值或缺省状态都自动展开。
             */
                    vm.addNodes = function (parentLeaf, nodes, isSilent) {
                        return vm.excute('nodeCreated', { isSilent: isSilent }, parentLeaf, function () {
                            // 数据构建
                            if (vm.data.simpleData.enable && nodes instanceof Array) {
                                nodes = vm.transformTozTreeNodes(nodes);
                            } else {
                                nodes = nodes instanceof Array ? nodes : [nodes];
                            }
                            nodes = dataFormator(nodes, parentLeaf, undefine, undefine, vm);
                            // 这里node依旧没有$id属性
                            // dataFormator(nodes, parentLeaf, "构建父子节点衔接关系", undefine, vm)
                            if (parentLeaf)
                                parentLeaf.isParent = true;
                            // open的监听可能没有捕捉到
                            if (!isSilent && parentLeaf)
                                parentLeaf.open = true;
                            var arr = vm.getNodes(parentLeaf), len = arr.length;
                            arr.pushArray(nodes);
                            var addNodes = arr.slice(len) || [];
                            // 构建，只有在nodes被push到数组之后才会拥有$id,$events等属性
                            dataFormator(addNodes, parentLeaf, '\u6784\u5EFA\u7236\u5B50\u8282\u70B9\u8854\u63A5\u5173\u7CFB', undefine, vm);
                            // 更具$id属性build cache
                            avalon.each(addNodes, function (i, leaf) {
                                cache[leaf.$id] = leaf;
                            });
                            return addNodes;
                        });
                    };
                    /**
             * @interface 将简单 Array 格式数据转换为 tree 使用的标准 JSON 嵌套数据格式
             * @param 需要被转换的简单 Array 格式数据 或 某个单独的数据对象
             */
                    vm.transformTozTreeNodes = function (data) {
                        if (!(data instanceof Array))
                            data = [data];
                        return simpleDataToTreeData(data, vm);
                    };
                    /**
             * @interface 将 tree 使用的标准 JSON 嵌套格式的数据转换为简单 Array 格式
             * @param  需要被转换的 tree 节点数据对象集合 或 某个单独节点的数据对象
             * @param {Function} 格式化过滤器函数
             */
                    vm.transformToArray = function (data, filter, res) {
                        var res = res || [], ignoreKey = arguments[3], dict = vm.data.simpleData;
                        if (!ignoreKey) {
                            // 忽略的辅助性key
                            ignoreKey = {};
                            avalon.each(avalon.ui.tree.leafIgnoreField, function (i, key) {
                                ignoreKey[key] = true;
                            });
                        }
                        if (data instanceof Array) {
                            avalon.each(data, function (i, node) {
                                vm.transformToArray(node, filter, res, ignoreKey);
                            });
                        } else if (data) {
                            var item = {}, model = data.$model;
                            for (var i in model) {
                                // ignore ^$
                                if (i.indexOf('$') === 0 || ignoreKey[i] || i === 'children' || model[i] == '')
                                    continue;
                                var key = dict[i + 'Key'] ? dict[i + 'Key'] : i;
                                item[key] = model[i];
                            }
                            res.push(filter ? filter(item) : item);
                            if (data.isParent) {
                                vm.transformToArray(data.children, filter, res, ignoreKey);
                            }
                        }
                        return res;
                    };
                    /**
             * @interface 重置树的状态
             * @param {Array} 指定用来重置的数据，为空表示用第一次初始化时候的数据来重置
             */
                    vm.reset = function (children) {
                        vm.children.clear();
                        vm.addNodes(undefine, children || dataBak);
                    };
                    /**
             * @interface 复制节点，返回clone后的节点
             * @param {Object} 参考节点
             * @param {Object} 需要被复制的节点数据
             * @param 复制到目标节点的相对位置 "inner"：成为子节点，"prev"：成为同级前一个节点，"next"：成为同级后一个节点
             * @param 设定复制节点后是否自动展开父节点，isSilent = true 时，不展开父节点，其他值或缺省状态都自动展开
             */
                    vm.copyNode = function (targetLeaf, leaf, moveType, isSilent) {
                        var newLeaf = avalon.mix({}, leaf.$model);
                        vm.moveNode(targetLeaf, newLeaf, moveType, isSilent);
                        return newLeaf;
                    };
                    /**
             * @interface 移动节点，目测这个是相当费性能的。。。，返回被移动的节点
             * @param {Object} 参考节点
             * @param {Object} 被移动的节点
             * @param 指定移动到目标节点的相对位置"inner"：成为子节点，"prev"：成为同级前一个节点，"next"：成为同级后一个节点
             * @param 设定移动节点后是否自动展开父节点，isSilent = true 时，不展开父节点，其他值或缺省状态都自动展开
             */
                    vm.moveNode = function (targetLeaf, leaf, moveType, isSilent) {
                        var parLeaf = leaf.$parentLeaf || vm, indexA = arrayIndex(parLeaf.children, function (item) {
                                return item == leaf || item == leaf.$model;
                            }), level = leaf.level;
                        if (indexA < 0)
                            return;
                        if (!targetLeaf)
                            targetLeaf = vm;
                        if (targetLeaf == vm)
                            moveType = 'inner';
                        // 移除
                        parLeaf.children.splice(indexA, 1);
                        if (moveType == 'inner') {
                            // 注入
                            if (!targetLeaf.isParent && targetLeaf != vm)
                                targetLeaf.isParent = true;
                            leaf.$parentLeaf = targetLeaf == vm ? false : targetLeaf;
                            leaf.level = leaf.$parentLeaf ? leaf.$parentLeaf.level + 1 : 0;
                            targetLeaf.children.push(leaf);
                        } else {
                            moveType = moveType === 'prev' ? 'prev' : 'next';
                            var parLeafB = targetLeaf.$parentLeaf, tarArray = parLeafB ? parLeafB.children : vm.children, indexB = arrayIndex(tarArray, function (item) {
                                    return item == targetLeaf || item == targetLeaf.$model;
                                });
                            // 挂载到新的父节点下
                            leaf.$parentLeaf = parLeafB;
                            leaf.level = targetLeaf.level;
                            tarArray.splice(indexB, 0, leaf);
                        }
                        if (leaf.$parentLeaf)
                            vm.expand(leaf.$parentLeaf);
                        // 层级变化了
                        if (level != leaf.level)
                            vm.visitor(leaf, function (node) {
                                if (node != leaf)
                                    node.level = node.$parentLeaf.level + 1;
                            });
                        // 展开父节点
                        if (!isSilent && node.$parentLeaf)
                            node.$parentLeaf.open = true;
                        return node;
                    };
                    // cache管理
                    vm.removeCacheById = function (id) {
                        delete cache[id];
                    };
                    //选中相关，可能是一个性能瓶颈，之后可以作为优化的点
                    vm.hasClassSelect = function (leaf) {
                        for (var i = 0, len = vm._select.length; i < len; i++) {
                            if (vm._select[i].$id === leaf.$id)
                                return i + 1;
                        }
                        return 0;
                    };
                    vm._getSelectIDs = function (leaf) {
                        var total = 0, dict = {};
                        if (leaf) {
                            vm.visitor(leaf, function (leaf) {
                                // 是否被选中
                                if (avalon(g(leaf.$id).getElementsByTagName('a')[0]).hasClass('curSelectedNode')) {
                                    dict[leaf.$id] = 1;
                                    total++;
                                }
                            }, false);
                        }
                        return {
                            total: total,
                            dict: dict
                        };
                    };
                    // 取消节点的选中状态
                    vm.selectFun = function (event, all) {
                        var leaf = event.leaf, event = event.e;
                        if (!leaf.url)
                            event.preventDefault && event.preventDefault();
                        if (all) {
                            var _s = vm._select, info = vm._getSelectIDs(leaf), total = count = info.total, dict = info.dict;
                            // 删除优化
                            if (total > 1)
                                _s.$unwatch();
                            for (var i = 0; i < _s.length; i++) {
                                var k = _s[i];
                                if (dict[k.$id]) {
                                    _s.splice(i, 1);
                                    i--;
                                    count--;
                                    if (count == 1 && total > 1)
                                        _s.$watch();
                                }
                            }
                            res = dict = null;
                        } else {
                            var id = leaf.$id, index = vm.hasClassSelect(leaf);
                            if (index) {
                                vm._select.splice(index - 1, 1);
                            } else {
                                if (vm.ctrlCMD(event, leaf)) {
                                    vm._select.push(leaf);
                                } else {
                                    vm._select = [leaf];
                                }
                            }
                        }
                    };
                    /**
             * @interface 将指定的节点置为选中状态，无任何返回值
             * @param {object} 指定的节点，不能为空
             * @param 是否保留原来选中的节点，否则清空原来选中的节点，当view.selectedMulti为false的时候，该参数无效，一律清空
             */
                    vm.selectNode = function (leaf, appendOrReplace) {
                        if (vm.view.selectedMulti === false)
                            appendOrReplace = false;
                        if (appendOrReplace)
                            vm._select.push(leaf);
                        else
                            vm._select = [leaf];
                    };
                    /**
             * @interface 获取以指定节点为起点，以数组形式返回所有被选中的节点
             * @param {object} 指定的节点，为空的时候表示由根开始查找
             */
                    vm.getSelectedNodes = function (startLeaf) {
                        if (!startLeaf)
                            return vm._select;
                        var info = vm._getSelectIDs(startLeaf), ids = info.dict, res = [], _s = vm._select;
                        for (var i = 0, len = _s.length; i < len; i++) {
                            var k = _s[i].$id;
                            if (ids[k])
                                res.push(_s[i]);
                        }
                        return res;
                    };
                    /**
             * @interface 取消选中子节点的选中状态，无任何返回值
             * @param {object} 指定的节点，为空的时候表示取消所有
             */
                    vm.cancelSelectedNode = function (leaf) {
                        vm._select.remove(leaf);
                    };
                    /**
             * @interface 取消节点上所有选中子节点的选中状态，无任何返回值
             * @param {object} 通过arg.leaf 指定的节点
             */
                    vm.cancelSelectedChildren = function (arg) {
                        if (!leaf) {
                            // clear all
                            vm._select.clear();
                        } else {
                            vm.selectFun(arg, 'all');
                        }
                    };
                    vm.ctrlCMD = function (event, leaf) {
                        return event.ctrlKey && vm.optionToBoolen(vm.view.selectedMulti, leaf, event);
                    };
                    vm.optionToBoolen = function () {
                        var arg = arguments[0];
                        if (!avalon.isFunction(arg))
                            return arg;
                        return arg.apply(vm, [].slice.call(arguments, 1));
                    };
                    //event
                    // 鼠标事件相关
                    vm.liveContextmenu = function (event) {
                        vm.$fire('e:contextmenu', {
                            e: event,
                            vmodel: vm,
                            vmodels: vmodels
                        });
                    };
                    vm.liveClick = function (event) {
                        vm.$fire('e:click', {
                            e: event,
                            vmodel: vm,
                            vmodels: vmodels
                        });
                    };
                    // tool function
                    // 事件分发中心
                    vm.excute = function (cmd, event, leaf, action) {
                        var evt = cmd, eventName = upperFirstLetter(cmd), beforeFunc = vm.callback['before' + eventName], onFunc = vm.callback['on' + eventName], res, arg = {
                                e: event,
                                leaf: leaf,
                                vm: vm,
                                vmodels: vmodels,
                                preventDefault: function () {
                                    this.cancel = true;
                                }
                            }, ele = event ? event.srcElement || event.target : null, callbackEnabled = !event || !event.cancelCallback;
                        // 执行前检测，返回
                        vmodel.$fire('e:before' + eventName, arg);
                        if (callbackEnabled) {
                            // callback里面可能只preventDefault
                            if (arg.cancel || beforeFunc && beforeFunc.call(ele, arg) === false || arg.cancel) {
                                arg.preventDefault();
                                return;
                            }
                        }
                        if (action) {
                            if (!(cmd === 'dblClick' && !vm.view.dblClickExpand)) {
                                if (!avalon.isFunction(action))
                                    action = vm[action];
                                if (avalon.isFunction(action))
                                    res = action.call(ele, arg);
                            }
                        }
                        if (res !== undefine)
                            arg.res = res;
                        // 被消除
                        if (arg.cancel)
                            return;
                        vmodel.$fire('e:' + cmd, arg);
                        if (callbackEnabled) {
                            onFunc && onFunc.call(ele, arg);
                        }
                        return res;
                    };
                    vm.exprAnd = function () {
                        var len = arguments.length, step = 1, res = step, leaf = arguments[0];
                        while (step < len) {
                            res = res && vm.optionToBoolen(arguments[step], leaf);
                            step++;
                        }
                        return res;
                    };
                    vm.timeStamp = function () {
                        return Date.now();
                    };
                    vm.toggleStatus = function () {
                        vm.toggle = !vm.toggle;
                        return vm.toggle;
                    };
                });
            // 展开父节点
            vmodel.$watch('e:nodeCreated', function (arg) {
                if (arg && arg.e && arg.e.isSilent)
                    return;
                var leaf = arg.leaf;
                if (leaf) {
                    leaf.isParent = true;
                    vmodel.expand(leaf);
                }
            });
            avalon.each(callbacks, function (i, func) {
                if (avalon.isFunction(func))
                    func(vmodel, vmodels);
            });
            return vmodel;
        };
    function disabelSelect(event) {
        var src = event.srcElement;
        for (var i = 0, len = disabelSelectArr.length; i < len; i++) {
            if (avalon.contains(disabelSelectArr[i], src) && src.type != 'text') {
                event.preventDefault();
                return;
            }
        }
    }
    widget.defaults = {
        toggle: true,
        view: {
            //@config {Object} 视觉效果相关的配置
            showLine: true,
            //@config 是否显示连接线
            dblClickExpand: true,
            //@config 是否双击变化展开状态
            selectedMulti: true,
            //@config true / false 分别表示 支持 / 不支持 同时选中多个节点
            txtSelectedEnable: false,
            //@config 节点文本是否可选中
            autoCancelSelected: false,
            singlePath: false,
            //@config 同一层级节点展开状态是否互斥
            showIcon: true,
            //@config zTree 是否显示节点的图标
            showTitle: true,
            //@config 分别表示 显示 / 隐藏 提示信息
            showSwitch: true,
            //@config 显示折叠展开ico
            nameShower: function (leaf) {
                return leaf.name;
            }    //@config 节点显示内容过滤器，默认是显示leaf.name
        },
        data: {
            //@config {Object} 数据相关的配置
            simpleData: {
                //@config {Object} 简单数据的配置
                idKey: 'id',
                //@config json数据里作为本身索引的字段映射
                pIdKey: 'pId',
                //@config json数据里作为父节点索引的字段映射
                enable: false    //@config 是否启用简单数据模式
            },
            key: {
                //@config {Object} json数据的字段映射
                children: 'children',
                //@config {Array} 子节点字段映射
                name: 'name',
                //@config 节点名字字段映射
                title: '',
                //@config 节点title字段映射，为空的时候，会去name字段映射
                url: 'url'    //@config 节点链接地址字段映射
            }
        },
        //@config {Object} 回调相关的配置
        callback: {},
        /**
         * @config 完成初始化之后的回调
         * @param vmodel {vmodel} vmodel
         * @param options {Object} options
         * @vmodels {Array} vmodels
         */
        onInit: avalon.noop,
        /**
         * @config 模板函数,方便用户自定义模板
         * @param str {String} 默认模板
         * @param opts {Object} vmodel
         * @returns {String} 新模板
         */
        getTemplate: function (tmpl, opts, tplName) {
            return tmpl;
        },
        $author: 'skipper@123'
    };
    avalon.each(eventList, function (i, item) {
        if (item == 'contextmenu')
            item = 'RightClick';
        widget.defaults.callback['on' + upperFirstLetter(item)] = avalon.noop;
        widget.defaults.callback['before' + upperFirstLetter(item)] = false;
    });
    /**
     * @interface avalon.ui.tree.AddExtention(fixNames, addingDefaults, addingMethodFunc, watchEvents)扩展tree
     */
    avalon.ui.tree.AddExtention = function (fixNames, addingDefaults, addingMethodFunc, watchEvents, tplHooks, callback) {
        if (fixNames)
            avalon.each(fixNames, function (i, item) {
                optionKeyToFixMix[item] = item;
            });
        if (addingDefaults)
            avalon.mix(true, widget.defaults, addingDefaults);
        if (addingMethodFunc)
            ExtentionMethods.push(addingMethodFunc);
        if (watchEvents)
            eventList = eventList.concat(watchEvents);
        if (tplHooks)
            avalon.mix(tplDict, tplHooks);
        if (callback)
            callbacks.push(callback);
    };
    avalon.ui.tree.leafIgnoreField = ['level']    // tree转化成数据的时候，忽略的字段，所有以$开头的，以及这个数组内的
;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "e094a664ed6d23474631337f87eadd6f" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8b03a9fae1e76b43eccda98d88191431" , 
        filename : "mmRequest.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];
__context.____MODULES['2f17dbeb5563c45e749f1774d593001c'];

module.exports = (
function () {
    var global = this || (0, eval)('this');
    var DOC = global.document;
    var encode = encodeURIComponent;
    var decode = decodeURIComponent;
    var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;
    var rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm;
    var rnoContent = /^(?:GET|HEAD)$/;
    var rprotocol = /^\/\//;
    var rhash = /#.*$/;
    var rquery = /\?/;
    var rjsonp = /(=)\?(?=&|$)|\?\?/;
    var r20 = /%20/g;
    var originAnchor = document.createElement('a');
    originAnchor.href = location.href;
    //告诉WEB服务器自己接受什么介质类型，*/* 表示任何类型，type/* 表示该类型下的所有子类型，type/sub-type。
    var accepts = {
            xml: 'application/xml, text/xml',
            html: 'text/html',
            text: 'text/plain',
            json: 'application/json, text/javascript',
            script: 'text/javascript, application/javascript',
            '*': ['*/'] + ['*']    //避免被压缩掉
        };
    function IE() {
        if (window.VBArray) {
            var mode = document.documentMode;
            return mode ? mode : window.XMLHttpRequest ? 7 : 6;
        } else {
            return 0;
        }
    }
    var useOnload = IE() === 0 || IE() > 8;
    function parseJS(code) {
        var indirect = eval;
        code = code.trim();
        if (code) {
            if (code.indexOf('use strict') === 1) {
                var script = document.createElement('script');
                script.text = code;
                head.appendChild(script).parentNode.removeChild(script);
            } else {
                indirect(code);
            }
        }
    }
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        };
    }
    var head = DOC.getElementsByTagName('head')[0];
    //HEAD元素
    var isLocal = false;
    try {
        //在IE下如果重置了document.domain，直接访问window.location会抛错，但用document.URL就ok了
        //http://www.cnblogs.com/WuQiang/archive/2012/09/21/2697474.html
        isLocal = rlocalProtocol.test(location.protocol);
    } catch (e) {
    }
    new function () {
        //http://www.cnblogs.com/rubylouvre/archive/2010/04/20/1716486.html
        var s = [
                'XMLHttpRequest',
                'ActiveXObject(\'MSXML2.XMLHTTP.6.0\')',
                'ActiveXObject(\'MSXML2.XMLHTTP.3.0\')',
                'ActiveXObject(\'MSXML2.XMLHTTP\')',
                'ActiveXObject(\'Microsoft.XMLHTTP\')'
            ];
        s[0] = IE() < 8 && IE() !== 0 && isLocal ? '!' : s[0];
        //IE下只能使用ActiveXObject
        for (var i = 0, axo; axo = s[i++];) {
            try {
                if (eval('new ' + axo)) {
                    avalon.xhr = new Function('return new ' + axo);
                    break;
                }
            } catch (e) {
            }
        }
    }();
    var supportCors = 'withCredentials' in avalon.xhr();
    function parseXML(data, xml, tmp) {
        try {
            var mode = document.documentMode;
            if (window.DOMParser && (!mode || mode > 8)) {
                // Standard
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, 'text/xml');
            } else {
                // IE
                xml = new ActiveXObject('Microsoft.XMLDOM');
                //"Microsoft.XMLDOM"
                xml.async = 'false';
                xml.loadXML(data);
            }
        } catch (e) {
            xml = void 0;
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
            avalon.error('Invalid XML: ' + data);
        }
        return xml;
    }
    //ajaxExtend是一个非常重要的内部方法，负责将用法参数进行规整化
    //1. data转换为字符串
    //2. type转换为大写
    //3. url正常化，加querystring, 加时间戮
    //4. 判定有没有跨域
    //5. 添加hasContent参数
    var defaults = {
            type: 'GET',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            async: true,
            jsonp: 'callback'
        };
    function ajaxExtend(opts) {
        opts = avalon.mix({}, defaults, opts);
        opts.type = opts.type.toUpperCase();
        var querystring = typeof opts.data === 'string' ? opts.data : avalon.param(opts.data);
        opts.querystring = querystring || '';
        opts.url = opts.url.replace(rhash, '').replace(rprotocol, location.protocol + '//');
        if (typeof opts.crossDomain !== 'boolean') {
            //判定是否跨域
            var urlAnchor = document.createElement('a');
            // Support: IE6-11+
            // IE throws exception if url is malformed, e.g. http://example.com:80x/
            try {
                urlAnchor.href = opts.url;
                // in IE7-, get the absolute path
                var absUrl = !'1'[0] ? urlAnchor.getAttribute('href', 4) : urlAnchor.href;
                urlAnchor.href = absUrl;
                opts.crossDomain = originAnchor.protocol + '//' + originAnchor.host !== urlAnchor.protocol + '//' + urlAnchor.host;
            } catch (e) {
                opts.crossDomain = true;
            }
        }
        opts.hasContent = !rnoContent.test(opts.type);
        //是否为post请求
        if (!opts.hasContent) {
            if (querystring) {
                //如果为GET请求,则参数依附于url上
                opts.url += (rquery.test(opts.url) ? '&' : '?') + querystring;
            }
            if (opts.cache === false) {
                //添加时间截
                opts.url += (rquery.test(opts.url) ? '&' : '?') + '_time=' + (new Date() - 0);
            }
        }
        return opts;
    }
    /**
     * 伪XMLHttpRequest类,用于屏蔽浏览器差异性
     * var ajax = new(self.XMLHttpRequest||ActiveXObject)("Microsoft.XMLHTTP")
     * ajax.onreadystatechange = function(){
     *   if (ajax.readyState==4 && ajax.status==200){
     *        alert(ajax.responseText)
     *   }
     * }
     * ajax.open("POST", url, true) 
     * ajax.send("key=val&key1=val2") 
     */
    var XHRMethods = {
            setRequestHeader: function (name, value) {
                this.requestHeaders[name] = value;
                return this;
            },
            getAllResponseHeaders: function () {
                return this.readyState === 4 ? this.responseHeadersString : null;
            },
            getResponseHeader: function (name, match) {
                if (this.readyState === 4) {
                    while (match = rheaders.exec(this.responseHeadersString)) {
                        this.responseHeaders[match[1]] = match[2];
                    }
                    match = this.responseHeaders[name];
                }
                return match === undefined ? null : match;
            },
            overrideMimeType: function (type) {
                this.mimeType = type;
                return this;
            },
            // 中止请求
            abort: function (statusText) {
                statusText = statusText || 'abort';
                if (this.transport) {
                    this.respond(0, statusText);
                }
                return this;
            },
            /**
         * 用于派发success,error,complete等回调
         * http://www.cnblogs.com/rubylouvre/archive/2011/05/18/2049989.html
         * @param {Number} status 状态码
         * @param {String} statusText 对应的扼要描述
         */
            dispatch: function (status, nativeStatusText) {
                var statusText = nativeStatusText;
                // 只能执行一次，防止重复执行
                if (!this.transport) {
                    //2:已执行回调
                    return;
                }
                this.readyState = 4;
                var isSuccess = status >= 200 && status < 300 || status === 304;
                if (isSuccess) {
                    if (status === 204) {
                        statusText = 'nocontent';
                    } else if (status === 304) {
                        statusText = 'notmodified';
                    } else {
                        //如果浏览器能直接返回转换好的数据就最好不过,否则需要手动转换
                        if (typeof this.response === 'undefined') {
                            var dataType = this.options.dataType || this.options.mimeType;
                            if (!dataType && this.responseText || this.responseXML) {
                                //如果没有指定dataType，则根据mimeType或Content-Type进行揣测
                                dataType = this.getResponseHeader('Content-Type') || '';
                                dataType = dataType.match(/json|xml|script|html/) || ['text'];
                                dataType = dataType[0];
                            }
                            var responseText = this.responseText || '', responseXML = this.responseXML || '';
                            try {
                                this.response = avalon.ajaxConverters[dataType].call(this, responseText, responseXML);
                            } catch (e) {
                                isSuccess = false;
                                this.error = e;
                                statusText = 'parsererror';
                            }
                        }
                    }
                }
                this.status = status;
                this.statusText = statusText + '';
                if (this.timeoutID) {
                    clearTimeout(this.timeoutID);
                    delete this.timeoutID;
                }
                this._transport = this.transport;
                // 到这要么成功，调用success, 要么失败，调用 error, 最终都会调用 complete
                if (isSuccess) {
                    this._resolve([
                        this.response,
                        statusText,
                        this
                    ]);
                } else {
                    this._reject([
                        this,
                        statusText,
                        this.error
                    ]);
                }
                delete this.transport;
            }
        };
    //ajax主函数
    avalon.ajax = function (opts, promise) {
        if (!opts || !opts.url) {
            avalon.error('\u53C2\u6570\u5FC5\u987B\u4E3AObject\u5E76\u4E14\u62E5\u6709url\u5C5E\u6027');
        }
        opts = ajaxExtend(opts);
        //处理用户参数，比如生成querystring, type大写化
        //创建一个伪XMLHttpRequest,能处理complete,success,error等多投事件
        var XHRProperties = {
                responseHeadersString: '',
                responseHeaders: {},
                requestHeaders: {},
                querystring: opts.querystring,
                readyState: 0,
                uniqueID: ('' + Math.random()).replace(/0\./, ''),
                status: 0
            };
        var _reject, _resolve;
        var promise = new avalon.Promise(function (resolve, reject) {
                _resolve = resolve;
                _reject = reject;
            });
        promise.options = opts;
        promise._reject = _reject;
        promise._resolve = _resolve;
        var doneList = [], failList = [];
        Array('done', 'fail', 'always').forEach(function (method) {
            promise[method] = function (fn) {
                if (typeof fn === 'function') {
                    if (method !== 'fail')
                        doneList.push(fn);
                    if (method !== 'done')
                        failList.push(fn);
                }
                return this;
            };
        });
        var isSync = opts.async === false;
        if (isSync) {
            avalon.log('warnning:\u4E0Ejquery1.8\u4E00\u6837,async:false\u8FD9\u914D\u7F6E\u5DF2\u7ECF\u88AB\u5E9F\u5F03');
            promise.async = false;
        }
        avalon.mix(promise, XHRProperties, XHRMethods);
        promise.then(function (value) {
            value = Array.isArray(value) ? value : value === void 0 ? [] : [value];
            for (var i = 0, fn; fn = doneList[i++];) {
                fn.apply(promise, value);
            }
            return value;
        }, function (value) {
            value = Array.isArray(value) ? value : value === void 0 ? [] : [value];
            for (var i = 0, fn; fn = failList[i++];) {
                fn.apply(promise, value);
            }
            return value;
        });
        promise.done(opts.success).fail(opts.error).always(opts.complete);
        var dataType = opts.dataType;
        //目标返回数据类型
        var transports = avalon.ajaxTransports;
        if ((opts.crossDomain && !supportCors || rjsonp.test(opts.url)) && dataType === 'json' && opts.type === 'GET') {
            dataType = opts.dataType = 'jsonp';
        }
        var name = opts.form ? 'upload' : dataType;
        var transport = transports[name] || transports.xhr;
        avalon.mix(promise, transport);
        //取得传送器的request, respond, preproccess
        if (promise.preproccess) {
            //这用于jsonp upload传送器
            dataType = promise.preproccess() || dataType;
        }
        //设置首部 1、Content-Type首部
        if (opts.contentType) {
            promise.setRequestHeader('Content-Type', opts.contentType);
        }
        //2.处理Accept首部
        promise.setRequestHeader('Accept', accepts[dataType] ? accepts[dataType] + ', */*; q=0.01' : accepts['*']);
        for (var i in opts.headers) {
            //3. 处理headers里面的首部
            promise.setRequestHeader(i, opts.headers[i]);
        }
        // 4.处理超时
        if (opts.async && opts.timeout > 0) {
            promise.timeoutID = setTimeout(function () {
                promise.abort('timeout');
                promise.dispatch(0, 'timeout');
            }, opts.timeout);
        }
        promise.request();
        return promise;
    };
    'get,post'.replace(avalon.rword, function (method) {
        avalon[method] = function (url, data, callback, type) {
            if (typeof data === 'function') {
                type = type || callback;
                callback = data;
                data = void 0;
            }
            return avalon.ajax({
                type: method,
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        };
    });
    function ok(val) {
        return val;
    }
    function ng(e) {
        throw e;
    }
    avalon.getScript = function (url, callback) {
        return avalon.get(url, null, callback, 'script');
    };
    avalon.getJSON = function (url, data, callback) {
        return avalon.get(url, data, callback, 'json');
    };
    avalon.upload = function (url, form, data, callback, dataType) {
        if (typeof data === 'function') {
            dataType = callback;
            callback = data;
            data = void 0;
        }
        return avalon.ajax({
            url: url,
            type: 'post',
            dataType: dataType,
            form: form,
            data: data,
            success: callback
        });
    };
    avalon.ajaxConverters = {
        //转换器，返回用户想要做的数据
        text: function (text) {
            // return text || "";
            return text;
        },
        xml: function (text, xml) {
            return xml !== void 0 ? xml : parseXML(text);
        },
        html: function (text) {
            return avalon.parseHTML(text)    //一个文档碎片,方便直接插入DOM树
;
        },
        json: function (text) {
            if (!avalon.parseJSON) {
                avalon.log('avalon.parseJSON\u4E0D\u5B58\u5728,\u8BF7\u5347\u7EA7\u5230\u6700\u65B0\u7248');
            }
            return avalon.parseJSON(text);
        },
        script: function (text) {
            parseJS(text);
            return text;
        },
        jsonp: function () {
            var json, callbackName;
            if (this.jsonpCallback.startsWith('avalon.')) {
                callbackName = this.jsonpCallback.replace(/avalon\./, '');
                json = avalon[callbackName];
                delete avalon[callbackName];
            } else {
                json = window[this.jsonpCallback];
            }
            return json;
        }
    };
    avalon.param = function (a) {
        var prefix, s = [], add = function (key, value) {
                value = value == null ? '' : value;
                s[s.length] = encode(key) + '=' + encode(value);
            };
        if (Array.isArray(a) || !avalon.isPlainObject(a)) {
            avalon.each(a, function (subKey, subVal) {
                add(subKey, subVal);
            });
        } else {
            for (prefix in a) {
                paramInner(prefix, a[prefix], add);
            }
        }
        // Return the resulting serialization
        return s.join('&').replace(r20, '+');
    };
    function paramInner(prefix, obj, add) {
        var name;
        if (Array.isArray(obj)) {
            // Serialize array item.
            avalon.each(obj, function (i, v) {
                paramInner(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, add);
            });
        } else if (avalon.isPlainObject(obj)) {
            // Serialize object item.
            for (name in obj) {
                paramInner(prefix + '[' + name + ']', obj[name], add);
            }
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }
    //将一个字符串转换为对象
    avalon.unparam = function (input) {
        var items, temp, expBrackets = /\[(.*?)\]/g, expVarname = /(.+?)\[/, result = {};
        if ((temp = avalon.type(input)) != 'string' || temp == 'string' && !temp.length)
            return {};
        if (input.indexOf('?') !== -1) {
            input = input.split('?').pop();
        }
        items = decode(input).split('&');
        if (!(temp = items.length) || temp == 1 && temp === '')
            return result;
        items.forEach(function (item) {
            if (!item.length)
                return;
            temp = item.split('=');
            var key = temp.shift(), value = temp.join('=').replace(/\+/g, ' '), size, link, subitems = [];
            if (!key.length)
                return;
            while (temp = expBrackets.exec(key))
                subitems.push(temp[1]);
            if (!(size = subitems.length)) {
                result[key] = value;
                return;
            }
            size--;
            temp = expVarname.exec(key);
            if (!temp || !(key = temp[1]) || !key.length)
                return;
            if (avalon.type(result[key]) !== 'object')
                result[key] = {};
            link = result[key];
            avalon.each(subitems, function (subindex, subitem) {
                if (!(temp = subitem).length) {
                    temp = 0;
                    avalon.each(link, function (num) {
                        if (!isNaN(num) && num >= 0 && num % 1 === 0 && num >= temp)
                            temp = Number(num) + 1;
                    });
                }
                if (subindex == size) {
                    link[temp] = value;
                } else if (avalon.type(link[temp]) !== 'object') {
                    link = link[temp] = {};
                } else {
                    link = link[temp];
                }
            });
        });
        return result;
    };
    var rinput = /select|input|button|textarea/i;
    var rcheckbox = /radio|checkbox/;
    var rline = /\r?\n/g;
    function trimLine(val) {
        return val.replace(rline, '\r\n');
    }
    //表单元素变字符串, form为一个元素节点
    avalon.serialize = function (form) {
        var json = {};
        // 不直接转换form.elements，防止以下情况：   <form > <input name="elements"/><input name="test"/></form>
        Array.prototype.filter.call(form.getElementsByTagName('*'), function (el) {
            if (rinput.test(el.nodeName) && el.name && !el.disabled) {
                return rcheckbox.test(el.type) ? el.checked : true    //只处理拥有name并且没有disabled的表单元素
;
            }
        }).forEach(function (el) {
            var val = avalon(el).val();
            val = Array.isArray(val) ? val.map(trimLine) : trimLine(val);
            var name = el.name;
            if (name in json) {
                if (Array.isArray(val)) {
                    json[name].push(val);
                } else {
                    json[name] = [
                        json[name],
                        val
                    ];
                }
            } else {
                json[name] = val;
            }
        });
        return avalon.param(json, false)    // 名值键值对序列化,数组元素名字前不加 []
;
    };
    var transports = avalon.ajaxTransports = {
            xhr: {
                //发送请求
                request: function () {
                    var self = this;
                    var opts = this.options;
                    var transport = this.transport = new avalon.xhr();
                    transport.open(opts.type, opts.url, opts.async, opts.username, opts.password);
                    if (this.mimeType && transport.overrideMimeType) {
                        transport.overrideMimeType(this.mimeType);
                    }
                    //IE6下，如果transport中没有withCredentials，直接设置会报错
                    if (opts.crossDomain && 'withCredentials' in transport) {
                        transport.withCredentials = true;
                    }
                    /*
                 * header 中设置 X-Requested-With 用来给后端做标示：
                 * 这是一个 ajax 请求。
                 *
                 * 在 Chrome、Firefox 3.5+ 和 Safari 4+ 下，
                 * 在进行跨域请求时设置自定义 header，会触发 preflighted requests，
                 * 会预先发送 method 为 OPTIONS 的请求。
                 *
                 * 于是，如果跨域，禁用此功能。
                 */
                    if (!opts.crossDomain) {
                        this.requestHeaders['X-Requested-With'] = 'XMLHttpRequest';
                    }
                    for (var i in this.requestHeaders) {
                        transport.setRequestHeader(i, this.requestHeaders[i] + '');
                    }
                    /*
                 * progress
                 */
                    if (opts.progressCallback) {
                        // 判断是否 ie6-9
                        var isOldIE = document.all && !window.atob;
                        if (!isOldIE) {
                            transport.upload.onprogress = opts.progressCallback;
                        }
                    }
                    var dataType = opts.dataType;
                    if ('responseType' in transport && /^(blob|arraybuffer|text)$/.test(dataType)) {
                        transport.responseType = dataType;
                        this.useResponseType = true;
                    }
                    //必须要支持 FormData 和 file.fileList 的浏览器 才能用 xhr 发送
                    //标准规定的 multipart/form-data 发送必须用 utf-8 格式， 记得 ie 会受到 document.charset 的影响
                    transport.send(opts.hasContent && (this.formdata || this.querystring) || null);
                    //在同步模式中,IE6,7可能会直接从缓存中读取数据而不会发出请求,因此我们需要手动发出请求
                    if (!opts.async || transport.readyState === 4) {
                        this.respond();
                    } else {
                        if (useOnload) {
                            //如果支持onerror, onload新API
                            transport.onload = transport.onerror = function (e) {
                                this.readyState = 4;
                                //IE9+
                                this.status = e.type === 'load' ? 200 : 500;
                                self.respond();
                            };
                        } else {
                            transport.onreadystatechange = function () {
                                self.respond();
                            };
                        }
                    }
                },
                //用于获取原始的responseXMLresponseText 修正status statusText
                //第二个参数为1时中止清求
                respond: function (event, forceAbort) {
                    var transport = this.transport;
                    if (!transport) {
                        return;
                    }
                    // by zilong：避免abort后还继续派发onerror等事件
                    if (forceAbort && this.timeoutID) {
                        clearTimeout(this.timeoutID);
                        delete this.timeoutID;
                    }
                    try {
                        var completed = transport.readyState === 4;
                        if (forceAbort || completed) {
                            transport.onreadystatechange = avalon.noop;
                            if (useOnload) {
                                //IE6下对XHR对象设置onerror属性可能报错
                                transport.onerror = transport.onload = null;
                            }
                            if (forceAbort) {
                                if (!completed && typeof transport.abort === 'function') {
                                    // 完成以后 abort 不要调用
                                    transport.abort();
                                }
                            } else {
                                var status = transport.status;
                                //设置responseText
                                var text = transport.responseText;
                                this.responseText = typeof text === 'string' ? text : void 0;
                                //设置responseXML
                                try {
                                    //当responseXML为[Exception: DOMException]时，
                                    //访问它会抛“An attempt was made to use an object that is not, or is no longer, usable”异常
                                    var xml = transport.responseXML;
                                    this.responseXML = xml.documentElement;
                                } catch (e) {
                                }
                                //设置response
                                if (this.useResponseType) {
                                    this.response = transport.response;
                                }
                                //设置responseHeadersString
                                this.responseHeadersString = transport.getAllResponseHeaders();
                                try {
                                    //火狐在跨城请求时访问statusText值会抛出异常
                                    var statusText = transport.statusText;
                                } catch (e) {
                                    this.error = e;
                                    statusText = 'firefoxAccessError';
                                }
                                //用于处理特殊情况,如果是一个本地请求,只要我们能获取数据就假当它是成功的
                                if (!status && isLocal && !this.options.crossDomain) {
                                    status = this.responseText ? 200 : 404    //IE有时会把204当作为1223
;
                                } else if (status === 1223) {
                                    status = 204;
                                }
                                this.dispatch(status, statusText);
                            }
                        }
                    } catch (err) {
                        // 如果网络问题时访问XHR的属性，在FF会抛异常
                        // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                        if (!forceAbort) {
                            this.dispatch(500, err);
                        }
                    }
                }
            },
            jsonp: {
                preproccess: function () {
                    var opts = this.options;
                    var name = this.jsonpCallback = opts.jsonpCallback || 'avalon.jsonp' + setTimeout('1');
                    if (rjsonp.test(opts.url)) {
                        opts.url = opts.url.replace(rjsonp, '$1' + name);
                    } else {
                        opts.url = opts.url + (rquery.test(opts.url) ? '&' : '?') + opts.jsonp + '=' + name;
                    }
                    //将后台返回的json保存在惰性函数中
                    if (name.startsWith('avalon.')) {
                        name = name.replace(/avalon\./, '');
                        avalon[name] = function (json) {
                            avalon[name] = json;
                        };
                    } else {
                        window[name] = function (json) {
                            window[name] = json;
                        };
                    }
                    return 'script';
                }
            },
            script: {
                request: function () {
                    var opts = this.options;
                    var node = this.transport = DOC.createElement('script');
                    if (opts.charset) {
                        node.charset = opts.charset;
                    }
                    var self = this;
                    node.onerror = node[useOnload ? 'onload' : 'onreadystatechange'] = function () {
                        self.respond();
                    };
                    node.src = opts.url;
                    head.insertBefore(node, head.firstChild);
                },
                respond: function (event, forceAbort) {
                    var node = this.transport;
                    if (!node) {
                        return;
                    }
                    // by zilong：避免abort后还继续派发onerror等事件
                    if (forceAbort && this.timeoutID) {
                        clearTimeout(this.timeoutID);
                        delete this.timeoutID;
                    }
                    var execute = /loaded|complete|undefined/i.test(node.readyState);
                    if (forceAbort || execute) {
                        node.onerror = node.onload = node.onreadystatechange = null;
                        var parent = node.parentNode;
                        if (parent) {
                            parent.removeChild(node);
                        }
                        if (!forceAbort) {
                            var args;
                            if (this.jsonpCallback) {
                                var jsonpCallback = this.jsonpCallback.startsWith('avalon.') ? avalon[this.jsonpCallback.replace(/avalon\./, '')] : window[this.jsonpCallback];
                                args = typeof jsonpCallback === 'function' ? [
                                    500,
                                    'error'
                                ] : [
                                    200,
                                    'success'
                                ];
                            } else {
                                args = [
                                    200,
                                    'success'
                                ];
                            }
                            this.dispatch.apply(this, args);
                        }
                    }
                }
            },
            upload: {
                preproccess: function () {
                    var opts = this.options, formdata;
                    if (typeof opts.form.append === 'function') {
                        //简单判断opts.form是否为FormData
                        formdata = opts.form;
                        opts.contentType = '';
                    } else {
                        formdata = new FormData(opts.form)    //将二进制什么一下子打包到formdata
;
                    }
                    avalon.each(opts.data, function (key, val) {
                        formdata.append(key, val)    //添加客外数据
;
                    });
                    this.formdata = formdata;
                }
            }
        };
    avalon.mix(transports.jsonp, transports.script);
    avalon.mix(transports.upload, transports.xhr);
    if (!window.FormData) {
        var str = 'Function BinaryToArray(binary)\r\n                 Dim oDic\r\n                 Set oDic = CreateObject("scripting.dictionary")\r\n                 length = LenB(binary) - 1\r\n                 For i = 1 To length\r\n                     oDic.add i, AscB(MidB(binary, i, 1))\r\n                 Next\r\n                 BinaryToArray = oDic.Items\r\n              End Function';
        execScript(str, 'VBScript');
        avalon.fixAjax = function () {
            avalon.ajaxConverters.arraybuffer = function () {
                var body = this.tranport && this.tranport.responseBody;
                if (body) {
                    return new VBArray(BinaryToArray(body)).toArray();
                }
            };
            function createIframe(ID) {
                var iframe = avalon.parseHTML('<iframe ' + ' id=\'' + ID + '\'' + ' name=\'' + ID + '\'' + ' style=\'position:absolute;left:-9999px;top:-9999px;\'/>').firstChild;
                return (DOC.body || DOC.documentElement).insertBefore(iframe, null);
            }
            function addDataToForm(form, data) {
                var ret = [], d, isArray, vs, i, e;
                for (d in data) {
                    isArray = Array.isArray(data[d]);
                    vs = isArray ? data[d] : [data[d]];
                    // 数组和原生一样对待，创建多个同名输入域
                    for (i = 0; i < vs.length; i++) {
                        e = DOC.createElement('input');
                        e.type = 'hidden';
                        e.name = d;
                        e.value = vs[i];
                        form.appendChild(e);
                        ret.push(e);
                    }
                }
                return ret;
            }
            //https://github.com/codenothing/Pure-Javascript-Upload/blob/master/src/upload.js
            avalon.ajaxTransports.upload = {
                request: function () {
                    var self = this;
                    var opts = this.options;
                    var ID = 'iframe-upload-' + this.uniqueID;
                    var form = opts.form;
                    var iframe = this.transport = createIframe(ID);
                    //form.enctype的值
                    //1:application/x-www-form-urlencoded   在发送前编码所有字符（默认）
                    //2:multipart/form-data 不对字符编码。在使用包含文件上传控件的表单时，必须使用该值。
                    //3:text/plain  空格转换为 "+" 加号，但不对特殊字符编码。
                    var backups = {
                            target: form.target || '',
                            action: form.action || '',
                            enctype: form.enctype,
                            method: form.method
                        };
                    var fields = opts.data ? addDataToForm(form, opts.data) : [];
                    //必须指定method与enctype，要不在FF报错
                    //表单包含文件域时，如果缺少 method=POST 以及 enctype=multipart/form-data，
                    // 设置target到隐藏iframe，避免整页刷新
                    form.target = ID;
                    form.action = opts.url;
                    form.method = 'POST';
                    form.enctype = 'multipart/form-data';
                    this.uploadcallback = avalon.bind(iframe, 'load', function (event) {
                        self.respond(event);
                    });
                    form.submit();
                    //还原form的属性
                    for (var i in backups) {
                        form[i] = backups[i];
                    }
                    //移除之前动态添加的节点
                    fields.forEach(function (input) {
                        form.removeChild(input);
                    });
                },
                respond: function (event) {
                    var node = this.transport, child;
                    // 防止重复调用,成功后 abort
                    if (!node) {
                        return;
                    }
                    if (event && event.type === 'load') {
                        var doc = node.contentWindow.document;
                        this.responseXML = doc;
                        if (doc.body) {
                            //如果存在body属性,说明不是返回XML
                            this.responseText = doc.body.innerHTML;
                            //当MIME为'application/javascript' 'text/javascript",浏览器会把内容放到一个PRE标签中
                            if ((child = doc.body.firstChild) && child.nodeName.toUpperCase() === 'PRE' && child.firstChild) {
                                this.responseText = child.firstChild.nodeValue;
                            }
                        }
                        this.dispatch(200, 'success');
                    }
                    this.uploadcallback = avalon.unbind(node, 'load', this.uploadcallback);
                    delete this.uploadcallback;
                    setTimeout(function () {
                        // Fix busy state in FF3
                        node.parentNode.removeChild(node);
                    });
                }
            };
            delete avalon.fixAjax;
        };
        avalon.fixAjax();
    }
    return avalon;
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "8b03a9fae1e76b43eccda98d88191431" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "5cbc9415364520a02a635d932abc1735" , 
        filename : "avalon.tree.async.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];
__context.____MODULES['e094a664ed6d23474631337f87eadd6f'];
__context.____MODULES['8b03a9fae1e76b43eccda98d88191431'];

module.exports = (
function () {
    var undefine = void 0;
    // 排除辅助字段
    avalon.ui.tree.leafIgnoreField.push('zAsync');
    avalon.ui.tree.AddExtention(['async'], {
        data: {
            // 擴展異步標記key
            key: {
                zAsync: 'zAsync'    // 是否異步加載過
            }
        },
        async: {
            enable: false,
            url: './avalon.tree.data.php',
            contentType: 'application/x-www-form-urlencoded',
            dataType: 'json',
            autoParam: [],
            dataFilter: undefine,
            otherParam: {},
            type: 'post'
        }
    }, function (vm, vmodels) {
        avalon.mix(vm, {
            /**
			 * @interface 强行异步加载父节点的子节点
			 * @param 指定需要异步加载的父节点 JSON 数据
			 * @param reloadType = "refresh" 表示清空后重新加载 reloadType != "refresh" 时，表示追加子节点处理
			 * @param 设定异步加载后是否自动展开父节点。isSilent = true 时，不展开父节点，其他值或缺省状态都自动展开
			 * @param 異步加載成功之後的回調
			 * @param 默认是async内的dataFilter
			 */
            reAsyncChildNodes: function (leaf, reloadType, isSilent, callback, filter) {
                if (!leaf)
                    return;
                vm.asyncChildNodes(leaf, function (res) {
                    // 是否清除
                    if (reloadType === 'refresh')
                        leaf.children.clear();
                    // 展开
                    if (!isSilent)
                        leaf.open = true;
                    callback && callback({
                        e: undefine,
                        leaf: leaf,
                        vm: vm,
                        vmodels: vmodels
                    });
                }, filter);
            },
            asyncChildNodes: function (leaf, callback, filter) {
                if (!leaf)
                    return;
                var async = vm.async, filter = filter || async.dataFilter, okFun = vm.callback.onAsyncSuccess, failFun = vm.callback.onAsyncError, data = avalon.mix({}, async.otherParam.$model || {});
                // 拼合otherParam
                // 拼合autoParam
                avalon.each(async.autoParam, function (i, item) {
                    var args = item.split('=');
                    data[args[1] || args[0]] = leaf[args[0]];
                });
                vm.excute('async', {}, leaf, function () {
                    var iconSpan = avalon(g('treeIcon' + leaf.$id));
                    iconSpan.addClass('ico_loading');
                    avalon.ajax(avalon.mix({ data: data }, async)).done(function (res) {
                        callback && callback(res);
                        // 是否过滤数据
                        vm.addNodes(leaf, filter ? filter(res) : res);
                        iconSpan.removeClass('ico_loading');
                        okFun && okFun({
                            leaf: leaf,
                            e: res,
                            vm: vmodel,
                            vmodels: vmodels
                        });
                    }).fail(function (res) {
                        iconSpan.removeClass('ico_loading');
                        failFun && failFun({
                            leaf: leaf,
                            e: res,
                            vm: vmodel,
                            vmodels: vmodels
                        });
                    });
                });
            }
        });
    }, undefine, undefine, function (vmodel, vmodels) {
        // 节点展开时去检测一下是否要异步加载
        vmodel.$watch('e:expand', function (arg) {
            if (!vmodel.async.enable)
                return;
            var leaf = arg.leaf;
            if (leaf && !leaf.zAsync) {
                vmodel.asyncChildNodes(leaf, function () {
                    leaf.zAsync = true;
                });
            }
        });
    });
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "5cbc9415364520a02a635d932abc1735" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "073dd7563b940ba635fcaa9f78d2f607" , 
        filename : "avalon.tree.check.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
tree = __context.____MODULES['e094a664ed6d23474631337f87eadd6f'],
check_html = "<span class=\"button chk\" \n      ms-attr-id=\"'chk'+leaf.$id\" \n      ms-if=\"exprAnd(leaf, check.enable, !leaf.nocheck)\" \n      ms-class=\"{{computeCHKClass(leaf)}}\"\n      ms-on-mouseenter=\"excute('chkFocus', $event, leaf, chkFocus)\" \n      ms-on-mouseleave=\"excute('chkBlur', $event, leaf, chkBlur)\" \n      ms-on-click=\"checkNode(leaf, void 0, true, 'callbackFlag')\"></span>";

module.exports = (
function () {
    function g(id) {
        return document.getElementById(id);
    }
    var undefine = void 0;
    // 排除辅助字段
    avalon.ui.tree.leafIgnoreField.push('chkFocus', 'chkTotal', 'checkedOld');
    avalon.ui.tree.AddExtention(['check'], {
        check: {
            enable: false,
            radioType: 'level',
            chkStyle: 'checkbox',
            nocheckInherit: false,
            chkDisabledInherit: false,
            autoCheckTrigger: false,
            chkboxType: {
                Y: 'ps',
                N: 'ps'
            }
        },
        data: {
            key: {
                checked: 'checked',
                nocheck: 'nocheck',
                chkDisabled: 'chkDisabled',
                halfCheck: 'halfCheck',
                chkFocus: 'chkFocus',
                chkTotal: '',
                checkedOld: 'checked'
            }
        },
        callback: {
            beforeCheck: avalon.noop,
            onCheck: avalon.noop,
            beforeCheckRelated: function (arg) {
                if (arg && arg.vm && arg.vm.check && !arg.vm.check.enable || arg.e && arg.e.expr === false) {
                    avalon.log('check is not enable');
                    return false;
                }
                avalon.log('check is enable');
                return true;
            },
            beforeCheckChange: avalon.noop,
            onCheckChange: avalon.noop
        }
    }, function (vm, vmodels) {
        avalon.mix(vm, {
            chkFocus: function (arg) {
                if (arg.leaf)
                    arg.leaf.chkFocus = true;
            },
            chkBlur: function (arg) {
                if (arg.leaf)
                    arg.leaf.chkFocus = false;
            },
            checkEnable: function () {
                return !!vm.check.enable;
            },
            computeCHKClass: function (leaf) {
                var type = vm.getCheckType();
                return type + '_' + !!leaf.checked + '_' + (leaf.halfCheck ? 'part' : leaf.chkDisabled ? 'disable' : 'full') + (leaf.chkFocus ? '_focus' : '');
            },
            getCheckType: function () {
                return vm.check.chkStyle === 'radio' ? 'radio' : 'checkbox';
            },
            /**
	             * @interface 勾选 或 取消勾选 单个节点
	             * @param {Object} 节点
	             * @param true 表示勾选节点  false 表示取消勾选 的节点数据
	             * @param true 表示按照 setting.check.chkboxType 属性进行父子节点的勾选联动操作 false 表示只修改此节点勾选状态，无任何勾选联动操作
	             * @param true 表示执行此方法时触发 beforeCheck & onCheck 事件回调函数  false 表示执行此方法时不触发事件回调函数
	             */
            checkNode: function (leaf, checked, checkTypeFlag, callbackFlag) {
                if (!vm.checkEnable() || leaf.nocheck || leaf.chkDisabled)
                    return;
                vm.excute('checkChange', {
                    cancelCallback: !callbackFlag,
                    checkTypeFlag: checkTypeFlag
                }, leaf, function (arg) {
                    var chk = checked === undefine ? !leaf.checked : !!checked, beforeCheck = vm.callback.beforeCheck, onCheck = vm.callback.onCheck;
                    if (callbackFlag && chk && beforeCheck && beforeCheck(arg) === false || arg.cancel)
                        return;
                    leaf.checked = chk;
                    callbackFlag && chk && onCheck && onCheck(arg);
                    return chk;
                });
            },
            /**
	             * @interface 勾选 或 取消勾选 全部节点
	             * @param true 表示勾选全部节点 false 表示全部节点取消勾选
	             * @param {Object} 可以指定一个起始的节点
	             */
            checkAllNodes: function (checked, leaf) {
                if (!vm.checkEnable() && vm.check.chkStyle !== 'checkbox')
                    return;
                vm.visitor(leaf, function (node) {
                    if (!node.nocheck && !node.chkDisabled) {
                        node.checked = !!checked;
                    }
                });
            },
            /**
	             * @interface 获取输入框被勾选 或 未勾选的节点集合
	             * @param true 表示勾选 false 表示未勾选
	             * @param {Object} 可以指定一个起始的节点
	             */
            getCheckedNodes: function (checked, leaf) {
                var checked = checked === undefine ? true : !!checked;
                return vm.visitor(leaf, function (node) {
                    if (node.chkDisabled || node.nocheck)
                        return;
                    if (node.checked == checked)
                        return node;
                }, checked && vm.check.chkStyle === 'radio' && vm.check.radioType === 'all' ? function (res) {
                    return res && res.length > 0;
                } : undefine, []);
            },
            /**
	             * @interface 获取输入框勾选状态被改变的节点集合
	             * @param {Object} 可以指定一个起始的节点
	             * @param 将当前状态更新到原始数据上
	             */
            getChangeCheckedNodes: function (leaf, updateChanges) {
                return vm.visitor(leaf, function (node) {
                    if (!!node.checkedOld != !!node.checked) {
                        if (updateChanges)
                            node.checkedOld = !!node.checked;
                        return node;
                    }
                }, undefine, []);
            },
            /**
	             * @interface 禁用 或 解禁 某个节点的 checkbox / radio [check.enable = true 时有效]
	             * @param {Object} 可以指定一个起始的节点
	             * @param true 表示禁用 checkbox / radio false 表示解禁 checkbox / radio
	             * @param true 表示全部父节点进行同样的操作 false 表示不影响父节点
	             * @param true 表示全部子节点进行同样的操作 false 表示不影响子节点
	             */
            setChkDisabled: function (leaf, disabled, inheritParent, inheritChildren) {
                if (vm.checkEnable()) {
                    disabled = !!disabled;
                    leaf.chkDisabled = disabled;
                    // 操作子节点
                    if (inheritChildren) {
                        vm.visitor(leaf, function (node) {
                            if (node.nocheck)
                                return;
                            node.chkDisabled = disabled;
                        }, function (res, node) {
                            // 终止这个节点，以及其子节点
                            return node.nocheck;
                        }, []);
                    }
                    // 影响父节点
                    if (inheritParent && leaf && leaf.$parentLeaf) {
                        // 向上溯源
                        vm.cVisitor(leaf, function (node) {
                            var par = node.$parentLeaf;
                            if (!par)
                                return;
                            var disabledCount = 0, canDisabledCount = 0;
                            // 计算有多少子节点的disable情况
                            vm.brotherVisitor(node, function (node) {
                                if (node.nocheck)
                                    return;
                                canDisabledCount++;
                                if (node.chkDisabled)
                                    disabledCount++;
                            });
                            par.chkDisabled = disabledCount >= canDisabledCount;
                        });
                    }
                }
            }
        });
    }, [], { check_html: check_html }, function (vmodel, vmodels) {
        // 继承check属性
        vmodel.$watch('e:nodeCreated', function (arg) {
            var newLeaf = arg.res, vm = arg.vm, par = newLeaf.$parentLeaf;
            if (!par)
                return;
            if (!(!vm.optionToBoolen(vm.check.enable, newLeaf) || newLeaf.nocheck)) {
                newLeaf.nocheck = vm.check.nocheckInherit && par.nocheck;
            }
            if (!(!vm.optionToBoolen(vm.check.enable, newLeaf) || newLeaf.chkDisabled)) {
                newLeaf.chkDisabled = vm.check.chkDisabledInherit && par.chkDisabled;
            }
        });
        var onlyOneRadio = vmodel.getCheckedNodes()[0];
        vmodel.$watch('e:checkChange', function (arg) {
            var leaf = arg.leaf, vm = arg.vm, chk = vm.check;
            if (!chk.enable)
                return;
            var chkStyle = chk.chkStyle, radioType = chk.radioType, chkboxType = chk.chkboxType, autoCheckTrigger = chk.autoCheckTrigger, callback = vmodel.callback, beforeCheck = callback.beforeCheck, onCheck = callback.onCheck, cancelCallback = arg.e && arg.e.cancelCallback;
            if (chkStyle === 'radio') {
                if (leaf.checked) {
                    if (radioType === 'all') {
                        if (onlyOneRadio)
                            onlyOneRadio.checked = false;
                        onlyOneRadio = leaf;
                    } else {
                        vm.brotherVisitor(leaf, function (node) {
                            if (node === leaf)
                                return;
                            node.checked = false;
                        }, function (res) {
                            return res.length > 0;
                        }, []);
                    }
                }    // only for checkbox
            } else {
                leaf.halfCheck = false;
                // 关联效果
                var bool = !!leaf.checked;
                chkboxType = bool ? chkboxType.Y : chkboxType.N;
                if (chkStyle === 'checkbox' && arg.e && arg.e.checkTypeFlag) {
                    // 向上关联
                    if (chkboxType.indexOf('p') > -1) {
                        vmodel.cVisitor(leaf, function (node) {
                            var par = node.$parentLeaf;
                            if (!par)
                                return;
                            var checkedCount = 0, canCheckedCount = 0;
                            // 计算节点check数目
                            vmodel.brotherVisitor(node, function (brother) {
                                if (brother.nocheck || brother.chkDisabled)
                                    return;
                                if (brother.checked)
                                    checkedCount++;
                                canCheckedCount++;
                            }, function (res, brother, par) {
                                return par && (par.nocheck || par.chkDisabled);
                            });
                            var e = {
                                    e: arg.e,
                                    srcLeaf: leaf,
                                    leaf: node,
                                    vm: vmodel,
                                    vmodels: vmodels,
                                    preventDefault: function () {
                                        this.cancel = true;
                                    }
                                };
                            if (!cancelCallback) {
                                if (bool && autoCheckTrigger && beforeCheck && beforeCheck(e) === false)
                                    return;
                            }
                            par.checked = checkedCount > 0;
                            par.halfCheck = checkedCount <= 0 || checkedCount >= canCheckedCount ? false : true;
                            !cancelCallback && bool && autoCheckTrigger && onCheck && onCheck(e);
                        });
                    }
                    // 向下关联
                    if (chkboxType.indexOf('s') > -1) {
                        vmodel.visitor(leaf, function (node) {
                            if (node.nocheck || node.chkDisabled)
                                return;
                            var e = {
                                    e: arg.e,
                                    srcLeaf: leaf,
                                    leaf: node,
                                    vm: vmodel,
                                    vmodels: vmodels,
                                    preventDefault: function () {
                                        this.cancel = true;
                                    }
                                };
                            if (!cancelCallback) {
                                if (bool && autoCheckTrigger && beforeCheck && beforeCheck(e) === false)
                                    return;
                            }
                            node.checked = bool;
                            // 勾选父节点，让子节点的半勾选失效
                            if (bool)
                                node.halfCheck = false;
                            !cancelCallback && bool && autoCheckTrigger && onCheck && onCheck(e);
                        }, undefine, []);
                    }
                }
            }
        });
    });
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "073dd7563b940ba635fcaa9f78d2f607" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "4162b4c0cfad5a0522ce8b0291d652b3" , 
        filename : "avalon.tree.edit.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    var avalon = __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'],
tree = __context.____MODULES['e094a664ed6d23474631337f87eadd6f'],
edit_html = "<span class=\"button ebutton add\"\n      ms-on-dblclick=\"editDblclick\" \n\t  ms-if=\"exprAnd(leaf, edit.enable, edit.showAddBtn, !data.keep.leaf || leaf.isParent)\" \n\t  ms-click=\"excute('nodeCreated', $event, leaf, 'addFun')\" \n\t  ms-attr-title=\"optionToBoolen(edit.addTitle,leaf)\"></span>\n<span class=\"button ebutton edit\" \n      ms-on-dblclick=\"editDblclick\" \n\t  ms-if=\"exprAnd(leaf, edit.enable, edit.showRenameBtn)\" \n\t  ms-click=\"excute('edit', $event, leaf, 'editName')\" \n\t  ms-attr-title=\"optionToBoolen(edit.renameTitle, leaf)\"></span>\n<span class=\"button ebutton remove\" \n      ms-on-dblclick=\"editDblclick\" \n\t  ms-if=\"exprAnd(leaf, edit.enable, edit.showRemoveBtn)\" \n\t  ms-click=\"excute('remove', $event, leaf, 'removeFun')\" \n\t  ms-attr-title=\"optionToBoolen(edit.removeTitle, leaf)\"></span>\n<span class=\"edit-input\"><input type=\"text\" class=\"rename\" \n      ms-attr-id=\"'input'+leaf.$id\"\n      ms-attr-value=\"leaf.name\" \n      ms-on-focus=\"excute('focus',$event,leaf,'editFocus')\"\n      ms-on-blur=\"excute('blur',$event,leaf,'saveChange')\"></span> ";

module.exports = (
function () {
    function g(id) {
        return document.getElementById(id);
    }
    function makeCallback(key) {
        return function (arg) {
            var func = arg.vm.callback[key], ele = arg.e ? arg.e.srcElement || arg.e.target : void 0;
            func && func.call(ele, arg);
        };
    }
    avalon.ui.tree.AddExtention(['edit'], // 注入默认配置
    {
        edit: {
            enable: true,
            showAddBtn: true,
            showRemoveBtn: true,
            showRenameBtn: true,
            editNameSelectAll: true,
            removeTitle: 'remove',
            renameTitle: 'rename',
            addTitle: 'add'
        },
        data: {
            keep: {
                leaf: false,
                parent: false
            }
        },
        callback: {
            beforeRemove: false,
            beforeRename: false,
            beforeNodeCreated: false,
            onRemove: avalon.noop,
            onRename: avalon.noop,
            onNodeCreated: avalon.noop,
            beforeEdit: makeCallback('beforeRename'),
            onBlur: makeCallback('onRename')
        }
    }, // 给vm新增方法
    function (vm, vmodels) {
        function changeIsParent(leaf) {
            if (!vm.data.keep.parent) {
                leaf.isParent = !!leaf.children.length;
            }
        }
        var focusLeaf;
        avalon.mix(vm, {
            editDblclick: function (event) {
                event.stopPropagation();
            },
            /**
	             * @interface 设置某节点进入编辑名称状态
	             * @param {Object} {leaf:leaf}指定节点
	             */
            editName: function (arg) {
                var event = arg.e, leaf = arg.leaf;
                event.preventDefault && event.preventDefault();
                focusLeaf = leaf;
                if (avalon(this.parentNode).hasClass('curSelectedNode'))
                    event.stopPropagation();
                // edit logic
                avalon(g(leaf.$id)).addClass('edit-focus');
                avalon(g('c' + leaf.$id)).addClass('par-edit-focus');
                var input = g('input' + leaf.$id);
                if (vm.view.editNameSelectAll) {
                    input.select();
                }
                input.focus();
            },
            /**
	             * @interface 取消节点的编辑名称状态，可以恢复原名称，也可以强行赋给新的名称
	             * @param {String} 重新给定的新名称
	             */
            cancelEditName: function (newName) {
                if (focusLeaf) {
                    if (newName !== void 0)
                        focusLeaf.name = newName;
                }
            },
            saveChange: function (arg) {
                var leaf = arg.leaf;
                if (this.value != leaf.name) {
                    vm.cancelEditName(this.value);
                } else {
                    arg.preventDefault();
                }
                focusLeaf = null;
                avalon(g(leaf.$id)).removeClass('edit-focus');
                avalon(g('c' + leaf.$id)).removeClass('par-edit-focus');
            },
            addFun: function (arg) {
                var event = arg.e, leaf = arg.leaf;
                event.preventDefault();
                event.stopPropagation();
                return vm.addNodes(leaf, avalon.mix({ name: '\u672A\u547D\u540D\u8282\u70B9' }, arg.newLeaf || {}));
            },
            removeFun: function (arg) {
                var event = arg.e, leaf = arg.leaf;
                event.preventDefault();
                event.stopPropagation();
                // remove cache
                vm.removeCacheById(leaf.$id);
                var par = leaf.$parentLeaf || vm;
                par.children.remove(leaf);
                leaf.$parentLeaf && changeIsParent(leaf.$parentLeaf);
            },
            /**
	             * @interface 删除节点
	             * @param {Object} 节点
	             * @param true 表示执行此方法时触发 beforeRemove & onRemove 事件回调函数  false 表示执行此方法时不触发事件回调函数
	             */
            removeNode: function (leaf, callbackFlag) {
                vm.excute('remove', { cancelCallback: !callbackFlag }, leaf, 'removeFun');
            },
            /**
	             * @interface 删除子节点 此方法不会触发任何事件回调函数
	             * @param {Object} 节点
	             */
            removeChildNodes: function (parentLeaf) {
                var arr = vm.getNodes(parentLeaf);
                arr && arr.clear && arr.clear();
            }
        })    // 侦听的事件，func操作内进行分发
;
    }, [
        'remove',
        'rename',
        'add'
    ], {
        // 添加html钩子
        edit_binding: ' ms-hover="oni-state-hover" ',
        edit_html: edit_html
    }, function (vmodel, vmodels) {
        vmodel.$watch('e:beforeNodeCreated', function (arg) {
            var leaf = arg.leaf;
            // 子节点锁定
            if (vmodel.data.keep.leaf && !leaf.isParent)
                arg.preventDefault();
        });
    });
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "4162b4c0cfad5a0522ce8b0291d652b3" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "bbd5449f24c337b861b8b314a1a97cdc" , 
        filename : "avalon.tree.menu.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['e094a664ed6d23474631337f87eadd6f'];

module.exports = (
function () {
    avalon.treeMenu = {
        view: {
            showLine: false,
            // 不展示树的连接线
            dblClickExpand: false,
            // 双击不改变节点的展开状态
            singlePath: true,
            // 节点间展开状态互斥
            showIcon: function (leaf) {
                if (leaf.level < 1)
                    return true;
            },
            showSwitch: function (leaf) {
                if (leaf.level > 0)
                    return true;
            }
        },
        callback: {
            // 改写click事件
            beforeClick: function (e) {
                var leaf = e.leaf, vmodel = e.vm;
                e.e && e.e.preventDefault();
                if (!leaf.isParent)
                    return;
                vmodel.expand(leaf, false);
            }
        },
        // 插入关闭展开按钮
        getTemplate: function (tpl, options, name) {
            if (name === 'nodes')
                return tpl.replace('<li', '<li ms-class="oni-leaf-selected:hasClassSelect(leaf)" ');
            if (!name)
                return tpl + '<a href="#" class="oni-menu-tree-swicth" ms-click="toggleMenuTree($event, widgetElement, $guid)" ms-class="oni-menu-tree-swicth-off:!toggle"></a>';
            return tpl;
        },
        toggleMenuTree: function (event, widgetElement, $guid) {
            event && event.preventDefault && event.preventDefault();
            var ele = avalon(widgetElement);
            if (ele.hasClass('oni-menu-tree-hidden')) {
                ele.removeClass('oni-menu-tree-hidden');
                ele.removeClass('oni-state-hover');
            } else {
                ele.addClass('oni-menu-tree-hidden');
            }
        },
        onInit: function (vmodel) {
            var ele = avalon(this);
            ele.bind('mouseenter', function (e) {
                if (ele.hasClass('oni-menu-tree-hidden'))
                    ele.addClass('oni-state-hover');
            });
            ele.bind('mouseleave', function (e) {
                ele.removeClass('oni-state-hover');
            });
        }
    };
}
)();

    })( module.exports , module , __context );
    __context.____MODULES[ "bbd5449f24c337b861b8b314a1a97cdc" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "14d3bfbc1ff4d64ad1ec1d2f677611c4" , 
        filename : "index.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['2ab11dddd1a66c979fc4d8cb729fc348'];
__context.____MODULES['ebe019d268672b2e5098adbedeb01097'];
__context.____MODULES['9b7332764027ca382c8471ce030f97d6'];
__context.____MODULES['3468f5e6cdb6eaf730ab82df91191936'];
__context.____MODULES['41970ead5870f4b28b987ecfe62f5717'];
__context.____MODULES['c3d66d673e82f1489bf416e19cae0c47'];
__context.____MODULES['25008a5bba9e941c7201b29c84441a68'];
__context.____MODULES['959601740f2cc260eae9532b9c521844'];
__context.____MODULES['e156f2a7ac606ad1a2a95045e64b106a'];
__context.____MODULES['46f100b533906080570a5a161534f03d'];
__context.____MODULES['e4c8067366549941367e78f7d5333d37'];
__context.____MODULES['37f8e4f4e81b95d2222fbfa0b57763c6'];
__context.____MODULES['90b2de0bf947d1814b382738513983f5'];
__context.____MODULES['b83c701f7016a27e16d46e493e24eea4'];
__context.____MODULES['8bdc330ebced058596c0473bf9d928fc'];
__context.____MODULES['66245368f546adb2e2657940f7ab549a'];
__context.____MODULES['575e62dfb8dd04738fbdf1cf64b5f342'];
__context.____MODULES['0f04480659a156ed6ffa2b199faf3d7b'];
__context.____MODULES['1e2a4749ea3e8bbc22c90f5c6fb561f7'];
__context.____MODULES['bac21fbec45c613f4349c3fa5aa345f1'];
__context.____MODULES['4b917c7e9e3f6326ddfc695a7813cf22'];
__context.____MODULES['2f17dbeb5563c45e749f1774d593001c'];
__context.____MODULES['da7aa09c8fdf60d28b0f82b2211bac52'];
__context.____MODULES['1c711ab12176f81203ac6d5514608691'];
__context.____MODULES['043690ff485a9c9691b2cd85de953bbb'];
__context.____MODULES['a11d645b0cc066e8d73a0778c2585af8'];
__context.____MODULES['b4d2b9bf030e54e2bf1c340a7282b0dc'];
__context.____MODULES['5cbc9415364520a02a635d932abc1735'];
__context.____MODULES['073dd7563b940ba635fcaa9f78d2f607'];
__context.____MODULES['4162b4c0cfad5a0522ce8b0291d652b3'];
__context.____MODULES['bbd5449f24c337b861b8b314a1a97cdc']

    })( module.exports , module , __context );
    __context.____MODULES[ "14d3bfbc1ff4d64ad1ec1d2f677611c4" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "8af3b18ad5deecbdc93367edc4d6bce7" , 
        filename : "dataServices.coffee" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    (function() {

  if (!(window.YEMR != null)) {
    window.YEMR = {};
  }

  YEMR.queryDiag = function(keyword, onResult) {
    if (!keyword) {
      return onResult([]);
    }
    return $.get('/querydiag', {
      keyword: keyword
    }, function(res) {
      if (res) {
        return onResult(res);
      }
    });
  };

}).call(this);


    })( module.exports , module , __context );
    __context.____MODULES[ "8af3b18ad5deecbdc93367edc4d6bce7" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "319c071ccddf4edf1c201083ec889e7a" , 
        filename : "view.string" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    if (typeof window.QTMPL === "undefined") window.QTMPL = {};
window.QTMPL["view"] = "<div class=\"yemr-diags-ctn\" ms-controller=\"diag\">\n\t<div class=\"yemr-diag-line\" ms-repeat-d=\"diags\" ms-data-index=\"$index\"\n\tms-draggable=\"diag\"\n\tdata-draggable-axis=\"y\"\n\tdata-draggable-ghosting=\"true\"\n\tdata-draggable-handle=\"handle\"\n\tdata-draggable-stop=\"stopFn\"\n\t>\n\t\t<i class=\"handle\"></i>\n\t\t<select class=\"yemr-diag-qualifier\" ms-change=\"prefixChange($event, d, $index)\">\n\t\t\t<option ms-repeat-q=\"qualifiers\" ms-attr-value=\"q\">{{q}}</option>\n\t\t</select>\n\t\t<input class=\"yemr-diag-input\" ms-widget=\"textbox,$,suggestOptions\"\n\t\t\tms-duplex=\"d\"\n\t\t\tms-css-width=\"inputWidth\"\n\t\t\tms-keydown=\"keyHandller($event, $index)\"\n\t\t\tms-blur=\"blurHandller($event, $index)\">\n\t\t<i class=\"yemr-diag-line-btn-query\" ms-click=\"showTreewin($index)\"></i><i class=\"yemr-diag-line-btn-add\" ms-if=\"d\" ms-click=\"addLine($index, d)\"></i><i class=\"yemr-diag-line-btn-del\" ms-if=\"!$first\" ms-click=\"removeLine($index)\"></i>\n\t</div>\n\t<div class=\"yemr-diag-sel-win\" ms-widget=\"dialog,treewin,treewinOpts\">\n\t\t<div class=\"left-side\">\n\t\t\t<div ms-widget=\"tree,tree2\"></div>\n\t\t</div>\n\t\t<div class=\"mid-bar\">\n\t\t\t<a href=\"javascript:\" class=\"btn to-right\">→</a>\n\t\t\t<a href=\"javascript:\" class=\"btn to-left\">←</a>\n\t\t</div>\n\t\t<div class=\"right-side\">\n\n\t\t</div>\n\t\t<div class=\"clear\">\n\n\t\t</div>\n\t</div>\n\t<div ms-widget=\"loading,wait,waitOpt\"></div>\n</div>\n";
if (typeof module !== "undefined") module.exports = window.QTMPL["view"];

    })( module.exports , module , __context );
    __context.____MODULES[ "319c071ccddf4edf1c201083ec889e7a" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "1bcf39e4a9af48eded71d2e11a311be8" , 
        filename : "component.coffee" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    (function() {
  var Diagnosis, treeBase, view,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  view =__context.____MODULES['319c071ccddf4edf1c201083ec889e7a'];

  treeBase = [
    {
      id: '',
      pid: '',
      name: "全部诊断",
      isParent: true,
      async: true
    }
  ];

  window.g = function(id) {
    return document.getElementById(id);
  };

  Diagnosis = (function() {

    function Diagnosis(_arg) {
      var diags, isOphthalmology, node,
        _this = this;
      node = _arg.node, isOphthalmology = _arg.isOphthalmology, diags = _arg.diags, this.queryDiag = _arg.queryDiag, this.validationDiag = _arg.validationDiag;
      this.qualifiers = ['左', '右', '双', '左侧', '右侧', '双侧'];
      if (isOphthalmology) {
        this.qualifiers = ['左眼', '右眼', '双眼'].concat(this.qualifiers);
      }
      this.qualifyReg = new RegExp('^(' + _.sortBy(this.qualifiers, function(w) {
        return -w.length;
      }).join('|') + ')');
      node = this.ctn = $(node);
      node.html(view);
      this.dom = this.ctn.find('.yemr-diags-ctn');
      this.popTip = node.find('.yemr-diag-tip-ctn');
      this.ctn = this.vm = avalon.define({
        $id: 'diag',
        $skip: ['prefixChange', 'keyHandller', 'blurHandller', 'addLine', 'removeLine', 'suggestOptions', 'treewinOpts', 'showTreewin'],
        diags: diags || [''],
        qualifiers: [''].concat(this.qualifiers),
        tips: [],
        inputWidth: 200,
        suggestOptions: {
          suggest: 'diagtip',
          autoTrim: false
        },
        draggable: {
          handle: function(e) {
            return $(e.target).closest('.handle')[0];
          },
          stopFn: function(e, data, index) {
            var lines, movingDiag, newIndex, nextLine, thisIndex, thisTop;
            thisIndex = data.$element.data('index');
            thisTop = data.$element.offset().top;
            newIndex = 0;
            lines = _this.dom.children('.yemr-diag-line');
            nextLine = _.find(lines, function(line, i) {
              newIndex = i;
              return $(line).offset().top > thisTop;
            });
            if (!nextLine) {
              newIndex++;
            }
            movingDiag = _this.vm.diags.splice(thisIndex, 1);
            if (newIndex > thisIndex) {
              newIndex--;
            }
            _this.vm.diags.splice(newIndex, 0, movingDiag);
            return _this.fixLine(newIndex);
          }
        },
        prefixChange: function(event, diag, index) {
          var newPrefix, parts;
          newPrefix = $(event.target).val();
          parts = _this.destructDiag(diag);
          return _this.getLine(index).val(parts.preSpace + newPrefix + parts.prime);
        },
        keyHandller: function(event, index) {
          if (_this.getLine(index).closest('.oni-textbox').find('.oni-suggest').css('display') === 'none') {
            switch (event.keyCode) {
              case 13:
                return _this.addLine(index);
              case 38:
                return _this.focusLine(index - 1);
              case 40:
                return _this.focusLine(index + 1);
            }
          }
        },
        blurHandller: function(event, index) {
          return _this.fixLine(index);
        },
        addLine: function(index, value) {
          if (value) {
            return _this.addLine(index);
          }
        },
        removeLine: function(index) {
          return _this.removeLine(index);
        },
        treewinOpts: {
          title: '请选择',
          draggable: true,
          onOpen: this.initTreeWin,
          width: 600
        },
        showTreewin: function(index) {
          return avalon.vmodels.treewin.toggle = true;
        },
        waitOpt: {
          type: 'spinning-bubbles',
          container: document.body,
          color: '#cdf',
          modalBackground: '#000',
          modalOpacity: 0.4,
          toggle: false
        },
        tree: {
          children: treeBase,
          async: {
            enable: true,
            autoParam: ["name"],
            url: '/getdiagtree'
          },
          edit: {
            enable: false
          }
        },
        $treeOpt: {
          children: [treeBase]
        }
      });
      avalon.scan(node[0]);
      this._initDiagTip();
      this.fixSize();
      this.dom.on('mouseover', '.yemr-diag-line', function() {
        return $(this).children('.handle').css('background-position', '0px 0px');
      });
      this.dom.on('mouseout', '.yemr-diag-line', function() {
        return $(this).children('.handle').css('background-position', '100px 0px');
      });
    }

    Diagnosis.prototype.getLine = function(index) {
      var inputs, _i, _ref, _results;
      inputs = this.dom.find('.yemr-diag-input');
      if (__indexOf.call((function() {
        _results = [];
        for (var _i = 0, _ref = inputs.length; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this), index) >= 0) {
        return inputs.eq(index);
      } else {
        return null;
      }
    };

    Diagnosis.prototype.getLineWrapper = function(index) {
      var lines, _i, _ref, _results;
      lines = this.dom.children('.yemr-diag-line');
      if (__indexOf.call((function() {
        _results = [];
        for (var _i = 0, _ref = lines.length; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this), index) >= 0) {
        return lines.eq(index);
      } else {
        return null;
      }
    };

    Diagnosis.prototype.fixLine = function(index) {
      var parts, thisLine, thisLineWrapper, value;
      value = this.getLine(index).val();
      parts = this.destructDiag(value);
      if (!parts.prime && this.vm.diags.length > 1) {
        return this.removeLine(index);
      }
      this.getLineWrapper(index).find('select.yemr-diag-qualifier').val(parts.prefix);
      if (index === 0) {
        parts.preSpace = '';
      }
      parts.prime = parts.prime.replace(/\s+/g, '　').replace(/IV/ig, 'Ⅳ').replace(/III/ig, 'Ⅲ').replace(/II/ig, 'Ⅱ').replace(/I/ig, 'Ⅰ');
      thisLine = this.getLine(index);
      thisLineWrapper = thisLine.closest('.oni-textbox');
      thisLineWrapper.add(thisLine).css('background', '#fff');
      value = parts.preSpace + parts.prefix + parts.prime;
      thisLine.val(value);
      return $.get('/validatediag', {
        diag: parts.prime
      }, function(r) {
        var formalValue;
        if (r.valid) {
          formalValue = parts.preSpace + parts.prefix + r.formalName;
          return thisLineWrapper.add(thisLine).css('background', '#e1f6df').val(formalValue);
        }
      });
    };

    Diagnosis.prototype.addLine = function(index) {
      var _ref;
      index++;
      this.vm.diags.splice(index, 0, '');
      return (_ref = this.getLine(index)) != null ? _ref.focus() : void 0;
    };

    Diagnosis.prototype.removeLine = function(index) {
      return this.vm.diags.splice(index, 1);
    };

    Diagnosis.prototype.focusLine = function(index) {
      var _ref;
      return (_ref = this.getLine(index)) != null ? _ref.focus() : void 0;
    };

    Diagnosis.prototype.fixSize = function() {
      return this.vm.inputWidth = this.dom.width() - 170;
    };

    Diagnosis.prototype._initDiagTip = function() {
      var _this = this;
      return avalon.ui.suggest.strategies.diagtip = function(value, done) {
        var parts;
        log('进入suggest触发');
        parts = _this.destructDiag(value);
        log('准备进入查找诊断');
        return typeof _this.queryDiag === "function" ? _this.queryDiag(parts.prime, function(results) {
          var r;
          log('得到查找结果，准备处理');
          if (parts.preSpace || parts.prefix) {
            results = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = results.length; _i < _len; _i++) {
                r = results[_i];
                _results.push(parts.preSpace + parts.prefix + r);
              }
              return _results;
            })();
          }
          log('查找结果处理完毕，准备输出到页面');
          done(results);
          return log('输出到页面完毕');
        }) : void 0;
      };
    };

    Diagnosis.prototype._initTreeWin = function() {};

    Diagnosis.prototype.destructDiag = function(value) {
      var _ref;
      value = value.replace('\u0008', '');
      return {
        preSpace: /^\s+/.test(value) ? '　' : '',
        prefix: ((_ref = value.replace(/^\s+/, '').match(this.qualifyReg)) != null ? _ref[0] : void 0) || '',
        prime: value.replace(/^\s+/, '').replace(/\s+$/, '').replace(this.qualifyReg, '')
      };
    };

    Diagnosis.prototype.loading = function(show) {
      return avalon.vmodels.wait.toggle = show;
    };

    Diagnosis.prototype.save = function(callback) {
      return this.loading(true);
    };

    return Diagnosis;

  })();

  if (!(window.YEMR != null)) {
    window.YEMR = {};
  }

  window.YEMR.Diagnosis = Diagnosis;

}).call(this);


    })( module.exports , module , __context );
    __context.____MODULES[ "1bcf39e4a9af48eded71d2e11a311be8" ] = module.exports;
})(this);


;(function(__context){
    var module = {
        id : "0aa827b71143a63788e80ee70f692900" , 
        filename : "diagnosis.js" ,
        exports : {}
    };
    if( !__context.____MODULES ) { __context.____MODULES = {}; }
    var r = (function( exports , module , global ){

    __context.____MODULES['14d3bfbc1ff4d64ad1ec1d2f677611c4'];
__context.____MODULES['8af3b18ad5deecbdc93367edc4d6bce7'];
__context.____MODULES['1bcf39e4a9af48eded71d2e11a311be8'];


    })( module.exports , module , __context );
    __context.____MODULES[ "0aa827b71143a63788e80ee70f692900" ] = module.exports;
})(this);
