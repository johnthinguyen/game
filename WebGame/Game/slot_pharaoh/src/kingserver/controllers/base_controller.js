"use strict";

var BaseController = cc.class("BaseController", {

    TAG_DEFAULT: "[MAIN]",

    ctor: function ctor() {

        this.tag = this.TAG_DEFAULT;
        this.defaultType = 0;

        this.eventEmitters = {};
        this.clearIgnoreKeys = [];
    },

    setTag: function setTag(value) {
        this.tag = value;
    },

    initEmitter: function initEmitter() {
        var _this = this;

        var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var defaultType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        this.defaultType = defaultType;

        keys = keys instanceof Array ? keys : Object.keys(keys).map(function (key) {
            return keys[key];
        });
        keys = keys.length <= 0 ? [defaultType] : keys;
        keys.forEach(function (key) {
            _this.eventEmitters[key] = new ListenerManager();
        });
    },

    getEmitter: function getEmitter(type) {
        return this.eventEmitters.hasOwnProperty(type) ? this.eventEmitters[type] : null;
    },

    addListener: function addListener(type, key, handler) {

        if (!key || key === '') return;

        if (arguments.length === 2) {
            handler = key;
            key = type;
            type = this.defaultType;
        }

        var emitter = this.getEmitter(type);
        emitter && emitter.register(key, handler);
    },

    removeListener: function removeListener(type, key) {

        if (arguments.length === 1) {
            key = type;
            type = this.defaultType;
        }

        var emitter = this.getEmitter(type);
        emitter && emitter.remove(key);
    },

    clearListeners: function clearListeners(type) {

        if (arguments.length === 0) type = this.defaultType;

        var emitter = this.getEmitter(type);
        emitter && emitter.clear();
    },

    clearAllListeners: function clearAllListeners() {
        for (var type in this.eventEmitters) {
            this.eventEmitters[type].clearExcept(this.clearIgnoreKeys);
        }
    },

    dispatchEvent: function dispatchEvent(type, event, payload) {

        if (arguments.length === 2) {
            payload = event;
            event = type;
            type = this.defaultType;
        }

        var emitter = this.getEmitter(type);
        emitter && emitter.dispatch(event, payload);
    },

    setHandler: function setHandler(handler) {

        var name = handler.__instanceId ? handler.__instanceId.toString() : handler.LOGTAG ? handler.LOGTAG : handler._LOGTAG ? handler._LOGTAG : "";
        if (name === "") {
            handler.__instanceId = Date.now();
            name = handler.__instanceId.toString();
        }

        if (name !== "") this.addListener(name, handler);
    },

    removeHandler: function removeHandler(handler) {
        var name = handler.__instanceId ? handler.__instanceId.toString() : handler.LOGTAG ? handler.LOGTAG : handler._LOGTAG ? handler._LOGTAG : "";
        if (name !== "") this.removeListener(name);
    },

    addClearIgnoreKeys: function addClearIgnoreKeys(keys) {
        var arr = typeof keys === 'string' ? [keys] : keys;
        this.clearIgnoreKeys = _.uniq(this.clearIgnoreKeys.concat(arr));
    }
});