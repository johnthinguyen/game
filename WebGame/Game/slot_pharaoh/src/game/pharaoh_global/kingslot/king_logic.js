Module.define(function (require) {
    "use strict";

    const KingLogic = cc.class("KingLogic", {

        TAG_DEFAULT: "[MAIN]",

        ctor: function () {

            this.tag = this.TAG_DEFAULT;
            this.defaultType = 0;

            this.eventEmitters = {};
            this.clearIgnoreKeys = [];
        },

        setTag: function (value) {
            this.tag = value;
        },

        initEmitter: function (keys = [], defaultType = 0) {

            this.defaultType = defaultType;

            keys = (keys instanceof Array) ? keys : Object.keys(keys).map(key => keys[key]);
            keys = (keys.length <= 0) ? [defaultType] : keys;
            keys.forEach((key) => {
                this.eventEmitters[key] = new ListenerManager();
            });
        },

        getEmitter: function (type) {
            return (this.eventEmitters.hasOwnProperty(type)) ? this.eventEmitters[type] : null;
        },

        addListener: function (type, key, handler) {

            if (!key || key === '')
                return;

            if (arguments.length === 2) {
                handler = key;
                key = type;
                type = this.defaultType;
            }

            let emitter = this.getEmitter(type);
            emitter && emitter.register(key, handler);
        },

        removeListener: function (type, key) {

            if (arguments.length === 1) {
                key = type;
                type = this.defaultType;
            }

            let emitter = this.getEmitter(type);
            emitter && emitter.remove(key);
        },

        clearListeners: function (type) {

            if (arguments.length === 0)
                type = this.defaultType;

            let emitter = this.getEmitter(type);
            emitter && emitter.clear();
        },

        clearAllListeners: function () {
            for (let type in this.eventEmitters) {
                this.eventEmitters[type].clearExcept(this.clearIgnoreKeys);
            }
        },

        dispatchEvent: function (type, event, payload) {

            if (arguments.length === 2) {
                payload = event;
                event = type;
                type = this.defaultType;
            }

            let emitter = this.getEmitter(type);
            emitter && emitter.dispatch(event, payload);
        },

        setHandler: function (handler) {

            let name = (handler.__instanceId) ? handler.__instanceId.toString() : ((handler.LOGTAG) ? handler.LOGTAG : ((handler._LOGTAG) ? handler._LOGTAG : ""));
            if (name === "") {
                handler.__instanceId = Date.now();
                name = handler.__instanceId.toString();
            }

            if (name !== "")
                this.addListener(name, handler);
        },

        removeHandler: function (handler) {
            let name = (handler.__instanceId) ? handler.__instanceId.toString() : ((handler.LOGTAG) ? handler.LOGTAG : ((handler._LOGTAG) ? handler._LOGTAG : ""));
            if (name !== "")
                this.removeListener(name);
        },

        addClearIgnoreKeys: function (keys) {
            let arr = (typeof keys === 'string') ? [keys] : keys;
            this.clearIgnoreKeys = _.uniq(this.clearIgnoreKeys.concat(arr));
        }
    });

    window.KingLogic = KingLogic;
    return KingLogic;
});