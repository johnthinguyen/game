'use strict';

/*
 * Convert from RC4.as flash version. Flash version is base on below info
 * Encrypts and decrypts an alleged RC4 hash.
 * @author Mika Palmu
 * @version 1.0
 *
 * Orginal Flash port by:
 * Gabor Penoff - http://www.fns.hu
 * Email: fns@fns.hu
 */

RC4.prototype = Object.create(Object.prototype);
RC4.prototype.constructor = RC4;

Object.defineProperties(RC4.prototype, {});

/**
 *
 * @constructor
 */
function RC4() {
    Object.call(this);
}

RC4.encrypt = function (src, key) {
    src = src + '';
    key = key + '';

    var mtxt = RC4.strToChars(src);
    var mkey = RC4.strToChars(key);

    var result = RC4.calculate(mtxt, mkey);

    return RC4.charsToHex(result);
};

RC4.decrypt = function (src, key) {
    src = src + '';
    key = key + '';

    var mtxt = RC4.hexToChars(src);
    var mkey = RC4.strToChars(key);

    var result = RC4.calculate(mtxt, mkey);

    return RC4.charsToStr(result);
};

RC4.calculate = function (plaintxt, psw) {
    if (plaintxt === null) return null;else {
        RC4.initialize(psw);

        var i = 0;
        var j = 0;
        var cipher = [];
        var k, temp, cipherby;

        for (var a = 0; a < plaintxt.length; a++) {
            i = (i + 1) % 255;
            j = (j + RC4.sbox[i]) % 255;
            temp = RC4.sbox[i];

            RC4.sbox[i] = RC4.sbox[j];
            RC4.sbox[j] = temp;

            var idx = (RC4.sbox[i] + RC4.sbox[j]) % 255;
            k = RC4.sbox[idx];

            cipherby = plaintxt[a] ^ k;
            cipher.push(cipherby);
        }

        return cipher;
    }
};

RC4.initialize = function (pwd) {
    if (pwd !== null) {
        var i = 0;
        var j = 0;
        var tempSwap = 0;
        var intLength = pwd.length;

        for (i = 0; i < 255; i++) {
            RC4.mykey[i] = pwd[i % intLength];
            RC4.sbox[i] = i;
        }

        for (i = 0; i < 255; i++) {
            j = (j + RC4.sbox[i] + RC4.mykey[i]) % 255;
            tempSwap = RC4.sbox[i];

            RC4.sbox[i] = RC4.sbox[j];
            RC4.sbox[j] = tempSwap;
        }
    }
};

RC4.charsToHex = function (chars) {
    chars = chars || '';

    var result = '';
    var hexes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

    for (var i = 0; i < chars.length; i++) {
        result += hexes[chars[i] >> 4] + hexes[chars[i] & 0xf];
    }

    return result;
};

RC4.hexToChars = function (hex) {
    var codes = [];

    for (var i = hex.substr(0, 2) === '0x' ? 2 : 0; i < hex.length; i += 2) {
        codes.push(parseInt(hex.substr(i, 2), 16));
    }

    return codes;
};

RC4.charsToStr = function (chars) {
    var result = '';

    for (var i = 0; i < chars.length; i++) {
        result += String.fromCharCode(chars[i]);
    }

    return result;
};

RC4.strToChars = function (str) {
    if (str && str.length > 0) {
        var codes = [];

        for (var i = 0; i < str.length; i++) {
            codes.push(str.charCodeAt(i));
        }

        return codes;
    } else return null;
};

RC4.mykey = [];
RC4.sbox = [];