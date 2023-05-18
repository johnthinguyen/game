'use strict';

var CryptoUtils = CryptoUtils || {};

CryptoUtils.MD5 = MD5;
CryptoUtils.RC4 = RC4;
CryptoUtils.SHA1 = SHA1;

CryptoUtils.Base32 = Base32;
CryptoUtils.Base64 = Base64;

CryptoUtils.hashFromString = function (value) {

    // this block of code equal to line Hash.hash(data)
    var byteArray = MD5.binl_md5(MD5.rstr2binl(value), value.length * 8);

    // this block of code equal to Hex.fromArray
    var result = '';
    for (var i = 0; i < 4; i++) {
        byteArray[i] = byteArray[i] >>> 0;

        var view = new DataView(new ArrayBuffer(4));
        view.setUint32(0, byteArray[i], true);

        result += view.getUint8(0).toString(16);
        result += view.getUint8(1).toString(16);
        result += view.getUint8(2).toString(16);
        result += view.getUint8(3).toString(16);
    }

    return result;
};

CryptoUtils.encryptPass = function (value) {
    return MD5.rstr2hex(MD5.rstr_md5(MD5.str2rstr_utf16le(value)));
};