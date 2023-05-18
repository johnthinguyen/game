'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

// Support read//write bool, big int 64 for DataView

var DataView = DataView || {};

DataView.prototype.getBool = function (byteOffset) {
    return this.getInt8(byteOffset) !== 0;
};

DataView.prototype.setBool = function (byteOffset, value) {
    this.setInt8(byteOffset, value === true ? 1 : 0);
};

DataView.prototype.getBigInt64 = function (byteOffset, littleEndian) {

    // return (this.getInt32(byteOffset, littleEndian) << 4) + this.getInt32(byteOffset + 4, littleEndian);
    // // TODO: Handle for big indian

    if (littleEndian) return this.getUint32(byteOffset + 4, littleEndian) << 32 | this.getUint32(byteOffset, littleEndian);else return this.getUint32(byteOffset, littleEndian) << 32 | this.getUint32(byteOffset + 4, littleEndian);
};

DataView.prototype.setBigInt64 = function (byteOffset, value, littleEndian) {

    // this.setUint32(byteOffset, value >> 32, littleEndian); // write the high order bits
    // this.setUint32(byteOffset + 4, value & 0x00ff, littleEndian); // write the low order bits
    // // TODO: Handle for big indian

    this.setUint32(byteOffset + (littleEndian ? 0 : 4), value >> 32, littleEndian);
    this.setUint32(byteOffset + (littleEndian ? 4 : 0), ~~(value / 0xffffffff), littleEndian);
};

// Support bytes to string for ArrayBuffer

var ArrayBuffer = ArrayBuffer || {};

ArrayBuffer.prototype.toString = function (type) {
    if (type === 2) {
        return this.toByteString();
    } else if (type === 16) {
        return this.toHexString();
    }
    return this.toDecString();
};

ArrayBuffer.prototype.toHexString = function () {
    return new Uint8Array(this).toHexString();
};

ArrayBuffer.prototype.toDecString = function () {
    return new Uint8Array(this).toDecString();
};

ArrayBuffer.prototype.toByteString = function () {
    return new Uint8Array(this).toByteString();
};

// Support bytes to string for Uint8Array

var Uint8Array = Uint8Array || {};

// Uint8Array.prototype.set = function (bytes, offset) {
//     for (var i = offset; i < this.length; i++) {
//         this[i] = bytes[i - offset];
//     }
// };

Uint8Array.prototype.fill = function (value, start, end) {
    Array.prototype.fill.call(value, start, end);
};

Uint8Array.prototype.toString = function (type) {
    if (type === 2) {
        return this.toByteString();
    } else if (type === 16) {
        return this.toHexString();
    }
    return this.toDecString();
};

Uint8Array.prototype.toHexString = function () {
    return Array.prototype.map.call(this, function (x) {
        return ('00' + x.toString(16)).slice(-2);
    }).join(' ');
};

Uint8Array.prototype.toDecString = function () {
    return Array.prototype.map.call(this, function (x) {
        return x.toString();
    }).join(' ');
};

Uint8Array.prototype.toByteString = function () {
    return Array.prototype.map.call(this, function (x) {
        return ('00' + x.toString(2)).slice(-2);
    }).join(' ');
};

// Support cyclic object stringify

if (!JSON.circular) {

    JSON._stringify = JSON.stringify;
    JSON.stringify = function (value) {
        var replacer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var space = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var circularReplacer = function circularReplacer() {
            var cache = [];
            return function (key, value) {
                if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object" && value !== null) {
                    if (cache.indexOf(value) >= 0) return '[circular]';
                    cache.push(value);
                }
                return value;
            };
        };

        return JSON._stringify(value, circularReplacer());
    };

    JSON.circular = true;
}