"use strict";

Dictionary.prototype = Object.create(Object.prototype);
Dictionary.prototype.constructor = Dictionary;

Object.defineProperties(Dictionary.prototype, {
    /**
     * @member {Object}
     * @memberof Dictionary#
     */
    map: {
        value: null,
        writable: true
    },
    /**
     * @member {number}
     * @memberof Dictionary#
     */
    length: {
        get: function get() {
            return this.size();
        }
    }
});

/**
 *
 * @constructor
 */
function Dictionary() {
    Object.call(this);
    this.map = {};
    this.init();
}

Dictionary.prototype.init = function () {};

Dictionary.prototype.put = function (key, value) {
    this.map[key] = value;
};

Dictionary.prototype.get = function (key) {
    this.getValue(key);
};

Dictionary.prototype.remove = function (key) {
    this.map[key] = undefined;
    delete this.map[key];
};

Dictionary.prototype.containsKey = function (key) {
    return this.map.hasOwnProperty(key);
};

Dictionary.prototype.containsValue = function (value) {
    for (var key in this.map) {
        if (this.map[key] === value) {
            return true;
        }
    }
    return false;
};

Dictionary.prototype.getKey = function (value) {
    var identifier = undefined;
    for (var key in this.map) {
        if (this.map[key] === value) {
            identifier = key;
            return identifier;
        }
    }
    return identifier;
};

Dictionary.prototype.getKeys = function () {
    var keys = [];
    for (var key in this.map) {
        keys.push(key);
    }
    return keys;
};

Dictionary.prototype.getValue = function (key) {
    return this.map[key];
};

Dictionary.prototype.getValues = function (key) {
    var values = [];
    for (var _key in this.map) {
        values.push(this.map[_key]);
    }
    return values;
};

Dictionary.prototype.size = function () {
    var length = 0;
    for (var key in this.map) {
        length++;
    }
    return length;
};

Dictionary.prototype.isEmpty = function () {
    return this.size() <= 0;
};

Dictionary.prototype.reset = function () {
    for (var key in this.map) {
        this.map[key] = undefined;
    }
};

Dictionary.prototype.resetAllExcept = function (keyId) {
    for (var key in this.map) {
        if (key !== keyId) {
            this.map[key] = undefined;
        }
    }
};

Dictionary.prototype.clear = function () {
    for (var key in this.map) {
        this.remove(key);
    }
};

Dictionary.prototype.clearAllExcept = function (keyId) {
    for (var key in this.map) {
        if (key !== keyId) {
            this.remove(key);
        }
    }
};

Dictionary.prototype.getMap = function () {
    return this.map;
};