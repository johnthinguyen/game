"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var cc = cc || {};

cc.VEC2 = function () {
    return cc.p(0, 0);
};
cc.VEC2_ONE = function () {
    return cc.p(1, 1);
};

cc.ANCHOR_TOP_LEFT = function () {
    return cc.p(0, 1);
};
cc.ANCHOR_TOP_CENTER = function () {
    return cc.p(0.5, 1);
};
cc.ANCHOR_TOP_RIGHT = function () {
    return cc.p(1, 1);
};

cc.ANCHOR_CENTER = function () {
    return cc.p(0.5, 0.5);
};
cc.ANCHOR_MIDDLE_LEFT = function () {
    return cc.p(0, 0.5);
};
cc.ANCHOR_MIDDLE_RIGHT = function () {
    return cc.p(1, 0.5);
};

cc.ANCHOR_BOTTOM_LEFT = function () {
    return cc.p(0, 0);
};
cc.ANCHOR_BOTTOM_CENTER = function () {
    return cc.p(0.5, 0);
};
cc.ANCHOR_BOTTOM_RIGHT = function () {
    return cc.p(1, 0);
};

cc.SPRITE_FILE = function (name) {
    return new cc.Sprite(name);
};
cc.SPRITE_FRAME = function (name) {
    return new cc.Sprite("#" + name);
};

cc.formatStr = function () {

    var args = arguments;
    var l = args.length;
    if (l < 1) return "";

    var str = args[0];
    if (str === undefined) return;

    var needToFormat = true;
    if ((typeof str === "undefined" ? "undefined" : _typeof(str)) === "object") {
        needToFormat = false;
    }

    for (var i = 1; i < l; ++i) {
        var arg = args[i];
        if (needToFormat) {
            while (true) {
                var result = null;
                if (typeof arg === "number") {
                    result = str.match(/(%d)|(%s)/);
                    if (result) {
                        str = str.replace(/(%d)|(%s)/, arg);
                        break;
                    }
                }
                if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === "object") {
                    result = str.match(/(%j)|(%s)/);
                    if (result) {
                        str = str.replace(/(%j)|(%s)/, JSON.stringify(arg));
                        break;
                    }
                }
                result = str.match(/%s/);
                if (result) str = str.replace(/%s/, arg);else str += "    " + arg;
                break;
            }
        } else str += "    " + arg;
    }
    return str;
};

cc.class = function (name, base, object, statics) {

    cc.assert(arguments.length > 1, "Invalid number of arguments!");

    if (arguments.length === 3) {
        if (cc.isObject(name) && !cc.isString(name)) {
            // cc.class(base, object, statics)
            statics = object;
            object = base;
            base = name;
            name = "Class";
        }
    } else if (arguments.length === 2) {
        if (cc.isString(name)) {
            // cc.class(name, object)
            object = base;
            base = undefined;
        } else if (cc.isObject(name) && cc.isObject(base) && !cc.isString(base)) {
            // cc.class(object, base)
            object = base;
            base = name;
            name = "Class";
        }
    } else if (arguments.length === 1) {
        if (cc.isObject(name) && !cc.isString(name)) {
            // cc.class(object)
            object = name;
            name = "Class";
        }
    }

    if (base === undefined) base = cc.Class;

    cc.assert(cc.isString(name), "[name] param must be a string!");
    cc.assert(cc.isObject(object) || cc.isFunction(object), "[object] param must be an object!");
    cc.assert(cc.isObject(base) || cc.isFunction(base), "[base] param must be an object!");

    var result = base.extend(object);
    result.prototype._name = name;
    result.prototype._LOGTAG = "[" + name + "]";
    result.prototype._logLevel = 1;
    result.prototype.log = function () {
        if (this._logLevel > 0) {
            var args = Array.from(arguments);
            args.unshift(this._LOGTAG);
            cc.log.apply(null, args);
        }
    };

    result.prototype.setLogLevel = function (value) {
        this._logLevel = value;
    };

    // copy static props
    (statics || []).forEach(function (name) {
        if (base.hasOwnProperty(name)) {
            result[name] = base[name];
        }
    });

    // fallback for old style classes
    result.prototype.LOGTAG = result.prototype._LOGTAG;

    return result;
};

cc.logTimes = {};

cc.logTime = function (key) {
    cc.logTimes[key] = cc.sys.now();
};

cc.logTimeEnd = function (key, tag) {
    if (cc.logTimes[key]) {
        cc.log(tag || "", key + " -> time: " + (cc.sys.now() - (cc.logTimes[key] || cc.sys.now())) + "ms");
        delete cc.logTimes[key];
    }
};

var ccui = ccui || {};
ccui.WebView = ccui.WebView || {};
if (ccui.WebView.prototype) {
    ccui.WebView.prototype.loadURL = function (url) {
        if (url.indexOf("http://") >= 0 || url.indexOf("https://") >= 0) {
            this._loadURL(url);
        } else {
            this.loadFile(url);
        }
    };
}

// NOTE: this is took from cocos version 3.17
// original bind in Spidermonkey v33 will trigger
// object life cycle track issue in our memory model and cause crash
Function.prototype.bind = function (oThis) {

    if (!cc.isFunction(this)) {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function fNOP() {},
        fBound = function fBound() {
        if (_typeof2(this) === 'object' && this != null) {
            return fToBind.apply(oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        } else {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        }
    };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
};