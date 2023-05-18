"use strict";

SHA1.prototype = Object.create(Object.prototype);
SHA1.prototype.constructor = SHA1;

Object.defineProperties(SHA1.prototype, {});

/**
 *
 * @constructor
 */
function SHA1() {
    Object.call(this);
}

/** hex output format. 0 - lowercase; 1 - uppercase
 * @member {Number}
 * @memberof SHA1#
 */
SHA1.hexcase = 0;

/** base-64 pad character. "=" for strict RFC compliance
 * @member {string}
 * @memberof SHA1#
 */
SHA1.b64pad = '';

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
SHA1.hex_sha1 = function (s) {
    return SHA1.rstr2hex(SHA1.rstr_sha1(SHA1.str2rstr_utf8(s)));
};

SHA1.b64_sha1 = function (s) {
    return SHA1.rstr2b64(SHA1.rstr_sha1(SHA1.str2rstr_utf8(s)));
};

SHA1.any_sha1 = function (s, e) {
    return SHA1.rstr2any(SHA1.rstr_sha1(SHA1.str2rstr_utf8(s)), e);
};

SHA1.hex_hmac_sha1 = function (k, d) {
    return SHA1.rstr2hex(SHA1.rstr_hmac_sha1(SHA1.str2rstr_utf8(k), SHA1.str2rstr_utf8(d)));
};

SHA1.b64_hmac_sha1 = function (k, d) {
    return SHA1.rstr2b64(SHA1.rstr_hmac_sha1(SHA1.str2rstr_utf8(k), SHA1.str2rstr_utf8(d)));
};

SHA1.any_hmac_sha1 = function (k, d, e) {
    return SHA1.rstr2any(SHA1.rstr_hmac_sha1(SHA1.str2rstr_utf8(k), SHA1.str2rstr_utf8(d)), e);
};

/*
 * Perform a simple self-test to see if the VM is working
 */
SHA1.sha1_vm_test = function () {
    return SHA1.hex_sha1("abc").toLowerCase() === "a9993e364706816aba3e25717850c26c9cd0d89d";
};

/*
 * Calculate the SHA1 of a raw string
 */
SHA1.rstr_sha1 = function (s) {
    cc.error('rstr_sha1 with value ' + s);
    var result = SHA1.binl2rstr(SHA1.binl_sha1(SHA1.rstr2binl(s), s.length * 8));
    cc.error('rstr_sha1 with result ' + result);
    return result;
};

/*
 * Calculate the HMAC-SHA1, of a key and some data (raw strings)
 */
SHA1.rstr_hmac_sha1 = function (key, data) {

    var bkey = SHA1.rstr2binl(key);
    if (bkey.length > 16) bkey = SHA1.binl_sha1(bkey, key.length * 8);

    var ipad = [],
        opad = [];
    for (var i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = SHA1.binl_sha1(ipad.concat(SHA1.rstr2binl(data)), 512 + data.length * 8);
    return SHA1.binl2rstr(SHA1.binl_sha1(opad.concat(hash), 512 + 160));
};

/*
 * Convert a raw string to a hex string
 */
SHA1.rstr2hex = function (input) {
    try {
        this.hexcase;
    } catch (e) {
        this.hexcase = 0;
    }
    var hex_tab = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x;
    for (var i = 0; i < input.length; i++) {
        x = input.charCodeAt(i);
        output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
};

/*
 * Convert a raw string to a base-64 string
 */
SHA1.rstr2b64 = function (input) {
    try {
        this.b64pad;
    } catch (e) {
        this.b64pad = '';
    }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for (var i = 0; i < len; i += 3) {
        var triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > input.length * 8) output += this.b64pad;else output += tab.charAt(triplet >>> 6 * (3 - j) & 0x3F);
        }
    }
    return output;
};

/*
 * Convert a raw string to an arbitrary string encoding
 */
SHA1.rstr2any = function (input, encoding) {
    var divisor = encoding.length;
    var i, j, q, x, quotient;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    var dividend = [];
    for (i = 0; i < Math.ceil(input.length / 2); i++) {
        dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
    }

    /*
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. All remainders are stored for later
     * use.
     */
    var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    var remainders = [];
    for (j = 0; j < full_length; j++) {
        quotient = [];
        x = 0;
        for (i = 0; i < dividend.length; i++) {
            x = (x << 16) + dividend[i];
            q = Math.floor(x / divisor);
            x -= q * divisor;
            if (quotient.length > 0 || q > 0) quotient[quotient.length] = q;
        }
        remainders[j] = x;
        dividend = quotient;
    }

    /* Convert the remainders to the output string */
    var output = "";
    for (i = remainders.length - 1; i >= 0; i--) {
        output += encoding.charAt(remainders[i]);
    }for (i = output.length; i < full_length; i++) {
        output = encoding[0] + output;
    }return output;
};

SHA1.rstr2any = function (input, encoding) {
    var divisor = encoding.length;
    var remainders = [];
    var i, q, x, quotient;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    var dividend = [];
    for (i = 0; i < Math.ceil(input.length / 2); i++) {
        dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
    }

    /*
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. We stop when the dividend is zero.
     * All remainders are stored for later use.
     */
    while (dividend.length > 0) {
        quotient = [];
        x = 0;

        for (i = 0; i < dividend.length; i++) {
            x = (x << 16) + dividend[i];
            q = Math.floor(x / divisor);
            x -= q * divisor;

            if (quotient.length > 0 || q > 0) quotient[quotient.length] = q;
        }

        remainders[remainders.length] = x;
        dividend = quotient;
    }

    /* Convert the remainders to the output string */
    var output = '';
    for (i = remainders.length - 1; i >= 0; i--) {
        output += encoding.charAt(remainders[i]);
    } /* Append leading zero equivalents */
    var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    for (i = output.length; i < full_length; i++) {
        output = encoding[0] + output;
    }return output;
};

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
SHA1.str2rstr_utf8 = function (input) {
    var output = "";
    var i = -1;
    var x, y;

    while (++i < input.length) {
        /* Decode utf-16 surrogate pairs */
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
            x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
            i++;
        }

        /* Encode output as utf-8 */
        if (x <= 0x7F) output += String.fromCharCode(x);else if (x <= 0x7FF) output += String.fromCharCode(0xC0 | x >>> 6 & 0x1F, 0x80 | x & 0x3F);else if (x <= 0xFFFF) output += String.fromCharCode(0xE0 | x >>> 12 & 0x0F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);else if (x <= 0x1FFFFF) output += String.fromCharCode(0xF0 | x >>> 18 & 0x07, 0x80 | x >>> 12 & 0x3F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
    }
    return output;
};

/*
 * Encode a string as utf-16
 */
SHA1.str2rstr_utf16le = function (input) {
    var output = '';
    for (var i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) & 0xFF, input.charCodeAt(i) >>> 8 & 0xFF);
    }return output;
};

SHA1.str2rstr_utf16be = function (input) {
    var output = '';
    for (var i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) >>> 8 & 0xFF, input.charCodeAt(i) & 0xFF);
    }return output;
};

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
SHA1.rstr2binl = function (input) {
    var output = [];
    for (var i = 0; i < input.length >> 2; i++) {
        output[i] = 0;
    }for (var i = 0; i < input.length * 8; i += 8) {
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << 24 - i % 32;
    }return output;
};

/*
 * Convert an array of little-endian words to a string
 */
SHA1.binl2rstr = function (input) {
    var output = "";
    for (var i = 0; i < input.length * 32; i += 8) {
        output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 0xFF);
    }return output;
};

/*
 * Calculate the SHA1 of an array of little-endian words, and a bit length.
 */
SHA1.binl_sha1 = function (x, len) {
    cc.error('binl_sha1 with x: ' + x + ', len: ' + len);
    /* append padding */
    x[len >> 5] |= 0x80 << 24 - len % 32;
    x[(len + 64 >> 9 << 4) + 15] = len;

    var w = [];
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;

    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;

        for (var j = 0; j < 80; j++) {
            if (j < 16) w[j] = x[i + j];else w[j] = SHA1.bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);

            var t = SHA1.safe_add(SHA1.safe_add(SHA1.bit_rol(a, 5), SHA1.sha1_ft(j, b, c, d)), SHA1.safe_add(SHA1.safe_add(e, w[j]), SHA1.sha1_kt(j)));

            e = d;
            d = c;
            c = SHA1.bit_rol(b, 30);
            b = a;
            a = t;
        }

        a = SHA1.safe_add(a, olda);
        b = SHA1.safe_add(b, oldb);
        c = SHA1.safe_add(c, oldc);
        d = SHA1.safe_add(d, oldd);
        e = SHA1.safe_add(e, olde);
    }

    cc.error('binl_sha1 with result: ' + a + ', ' + b + ', ' + c + ', ' + d + ', ' + d + ', ' + e);
    return [a, b, c, d, e];
};

/*
 * These functions implement the four basic operations the algorithm uses.
 */
SHA1.sha1_ft = function (t, b, c, d) {
    if (t < 20) return b & c | ~b & d;

    if (t < 40) return b ^ c ^ d;

    if (t < 60) return b & c | b & d | c & d;

    return b ^ c ^ d;
};

SHA1.sha1_kt = function (t) {
    return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
};

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
SHA1.safe_add = function (x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 0xFFFF;
};

/*
 * Bitwise rotate a 32-bit number to the left.
 */
SHA1.bit_rol = function (num, cnt) {
    return num << cnt | num >>> 32 - cnt;
};

SHA1.encode = function (s) {
    return SHA1.hex_sha1(s);
};