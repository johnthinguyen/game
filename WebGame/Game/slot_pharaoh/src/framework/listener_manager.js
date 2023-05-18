"use strict";

var ListenerManager = cc.Class.extend({
    LOGTAG: "[ListenerManager]",
    PAYLOAD_PROCESS_FUNC: "onProcessedPayload",

    ctor: function ctor() {
        this.listeners = {};
    },

    register: function register(key, handler) {
        if (!key || key === '') return;
        if (this.listeners) this.listeners[key] = handler;
    },

    remove: function remove(key) {
        if (this.listeners.hasOwnProperty(key)) delete this.listeners[key];
    },

    clear: function clear() {
        for (var key in this.listeners) {
            delete this.listeners[key];
        }
    },

    clearExcept: function clearExcept(excludes) {
        var ignores = excludes || [];
        for (var key in this.listeners) {
            if (ignores.indexOf(key) < 0) delete this.listeners[key];
        }
    },

    dispatch: function dispatch(event, payload) {
        for (var key in this.listeners) {
            if (this.listeners[key] && this.listeners[key][event] !== undefined && this.listeners[key][event] instanceof Function) {
                var processFunc = this.listeners[key][this.PAYLOAD_PROCESS_FUNC];
                processFunc = processFunc !== undefined && processFunc instanceof Function ? processFunc : null;
                this.listeners[key][event](processFunc ? processFunc(payload) : payload);
            }
        }
    },

    debug: function debug() {
        return Object.keys(this.listeners);
    }
});