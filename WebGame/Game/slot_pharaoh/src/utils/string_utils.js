'use strict';

var StringUtils = StringUtils || {};

StringUtils.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

StringUtils.isNullOrEmpty = function (str) {
    return str === undefined || str == null || str === '';
};

StringUtils.parseToBool = function (data) {
    if (!isNaN(data)) {
        if (this.isNumeric(data)) {
            if (parseInt(data) > 0) return true;else return false;
        }
        return false;
    } else {
        data = data.toString().toLowerCase();
        if (data === 'true') return true;else return false;
    }
};

StringUtils.getExtension = function (fullPath, moreInfo) {
    var queryStartIndex = fullPath.indexOf('?');
    var queryString = '';
    if (queryStartIndex !== -1) {
        queryString = fullPath.substring(queryStartIndex + 1);
        fullPath = fullPath.substring(0, queryStartIndex);
    }
    var extension = fullPath.substring(fullPath.lastIndexOf('.') + 1);
    if (arguments.length >= 2) {
        moreInfo.extension = extension;
        moreInfo.fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1, fullPath.lastIndexOf('.'));
        moreInfo.parentPath = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
        moreInfo.queryString = queryString;
    }
    return extension;
};

StringUtils.formatTime = function (nTime) {
    var timeTemp = parseInt(nTime / 60);
    var gio = parseInt(timeTemp / 60);
    var phut = timeTemp % 60;
    var giay = nTime % 60;

    var strGio = "" + gio;
    if (gio < 10) {
        strGio = "0" + gio;
    }
    var strPhut = "" + phut;
    if (phut < 10) {
        strPhut = "0" + phut;
    }
    var strGiay = "" + giay;
    if (giay < 10) {
        strGiay = "0" + giay;
    }

    return StringUtils.formatString("{0}:{1}:{2}", strGio, strPhut, strGiay);
};

StringUtils.formatDate = function (time) {
    time = time.split("-").join("/");
    return time;
};

/**
 *  Định dạng dữ liệu chuỗi theo format
 * @param format {string}
 * @param args {Array}
 * @returns {string}
 */
StringUtils.formatString = function (format /*, args*/) {
    if (arguments[1] !== undefined && arguments[1] !== null && Array.isArray(arguments[1])) {
        for (var i = 0; i < arguments[1].length; i++) {
            format = format.replace('{' + i + '}', arguments[1][i]);
        }
    } else {
        for (var i = 0; i < arguments.length; i++) {
            format = format.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i + 1]);
        }
    }

    return format;
};

StringUtils.formatCoin = function (coin) {
    if (coin > 1000000000) return coin / 1000000000 + " tỷ";
    if (coin > 1000000) return coin / 1000000 + " triệu";
    if (coin > 1000) return coin / 1000 + " nghìn";
    return coin.toString();
};

StringUtils.CoinToInt = function (str) {
    str = str.toString().replace(/[^0-9]/g, '');
    return parseInt(str);
};

StringUtils.Coin = function (str, seperate) {
    seperate = typeof seperate === 'string' ? seperate : ".";
    if (Math.floor(str)) str = Math.floor(str);
    if (typeof str === "number") str = str.toString();

    var strResult = "";
    var count = -1;
    var stringLength = str.length;

    for (var i = 0; i < stringLength; i++) {
        count++;

        if (count === 3) {
            count = 0;
            if (parseInt(str.charAt(stringLength - (i + 1)), 10).toString() !== "NaN" && str.charAt(stringLength - (i + 1)) !== "-") strResult += seperate + str.charAt(stringLength - (i + 1));else strResult += str.charAt(stringLength - (i + 1));
        } else strResult += str.charAt(stringLength - (i + 1));
    }

    var s1 = "";
    var strResultLength = strResult.length;

    for (var j = 0; j < strResultLength; j++) {
        s1 += strResult.charAt(strResultLength - (j + 1));
    }

    return s1;
};

StringUtils.CoinCompact = function (coin, seperate) {
    if (typeof coin === "string") {
        coin = Number(coin);
    }

    if (Math.floor(coin)) {
        coin = Math.floor(coin);
    }

    var suffix = "";
    if (coin >= 1000000000) {
        suffix = "B";
        coin /= 1000000000;
    } else if (coin >= 10000000) {
        suffix = "M";
        coin /= 1000000;
    } else {
        return StringUtils.Coin(coin, seperate);
    }

    if (Math.trunc(coin) == coin) {
        var str = coin.toString();
        return str + suffix;
    } else {
        var _str = coin.toFixed(3).toString().replace('.', ',');
        return _str + suffix;
    }
};

StringUtils.SmallCoinCompact = function (coin, seperate) {
    if (typeof coin === "string") {
        coin = Number(coin);
    }

    if (Math.floor(coin)) {
        coin = Math.floor(coin);
    }

    var suffix = "";
    if (coin >= 1000000000) {
        suffix = "B";
        coin /= 1000000000;
    } else if (coin >= 10000000) {
        suffix = "M";
        coin /= 1000000;
    } else if (coin >= 10000) {
        suffix = "K";
        coin /= 1000;
    } else {
        return StringUtils.Coin(coin, seperate);
    }

    if (Math.trunc(coin) == coin) {
        var str = coin.toString();
        return str + suffix;
    } else {
        var _str2 = coin.toFixed(3).toString().replace('.', ',');
        return _str2 + suffix;
    }
};

StringUtils.reduce = function (str, lng, endStr) {
    str = String(str.trim());
    endStr = String(endStr.trim());
    lng = lng - endStr.length;
    return str.substr(0, lng) + endStr;
};

/**
 * Xóa bỏ tất cả dấu phân cách (truyền vào như tham số, nên truyền Utilities.DefaultSeperateCoin) trong chuỗi truyền vào
 * Nên sử dụng hàm này thay cho các hàm StringUtils.removeDot và StringUtils.removeCommas
 */
StringUtils.removeSeperate = function (str, seperate) {
    seperate = seperate == null ? "." : seperate;
    var array = str.split(seperate);
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += array[i];
    }
    return result;
};

/**
 * Xóa bỏ tất cả dấu "." và "," trong chuỗi truyền vào
 */
StringUtils.removeDot = function (str) {
    var array = str.split(".");
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += array[i];
    }
    return StringUtils.removeCommas(result);
};

/**
 * Xóa bỏ tất cả dấu "," trong chuỗi truyền vào
 */
StringUtils.removeCommas = function (str) {
    var array = str.split(",");
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += array[i];
    }
    return result;
};

/**
 * Xóa bỏ tất cả số 0 ở đầu trong chuỗi truyền vào
 */
StringUtils.removeZeroFirst = function (str) {
    var len = str.length;
    if (len === 0) return "0";
    var pos = 0;
    for (var i = 0; i < len; i++) {
        if (str.charAt(i) !== '0') {
            pos = i;
            break;
        }
    }
    return str.substr(pos);
};

StringUtils.removeLinkInString = function (value) {
    var linkRegEx = new RegExp("(https?://)?(www\\.)?([a-zA-Z0-9_%]*)\\b\\.[a-z]{2,4}(\\.[a-z]{2})?((/[a-zA-Z0-9_%]*)+)?(\\.[a-z]*)?(:\\d{1,5})?", "g");
    return value.replace(linkRegEx, "xxx");
};

/**
 *    Removes whitespace from the front and the end of the specified
 *    string.
 *
 *    @param input The String whose beginning and ending whitespace will
 *    will be removed.
 *
 *    @returns A String with whitespace removed from the beginning and end
 *
 */
StringUtils.trim = function (input) {
    return input.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

/**
 *    Removes whitespace from the front of the specified string.
 *
 *    @param input The String whose beginning whitespace will will be removed.
 *
 *    @returns A String with whitespace removed from the beginning
 *
 */
StringUtils.ltrim = function (input) {
    var size = input.length;
    for (var i = 0; i < size; i++) {
        if (input.charCodeAt(i) > 32) {
            return input.substring(i);
        }
    }
    return "";
};

/**
 *    Removes whitespace from the end of the specified string.
 *
 *    @param input The String whose ending whitespace will will be removed.
 *
 *    @returns A String with whitespace removed from the end
 *
 */
StringUtils.rtrim = function (input) {
    var size = input.length;
    for (var i = size; i > 0; i--) {
        if (input.charCodeAt(i - 1) > 32) {
            return input.substring(0, i);
        }
    }

    return "";
};

/**
 * Cắt những chuỗi dài không có khoảng cách để xuống hàng theo đúng wordwarp
 * @param strArr {String}
 * @returns {String}
 */
StringUtils.breakString = function (strArr, maxChar) {
    var strArrTemp = strArr.split(' ');
    var len = strArrTemp.length;
    for (var i = 0; i < len; i++) {
        if (strArrTemp[i].length > maxChar) {
            var numSlice = parseInt(strArrTemp[i].length / maxChar);
            while (numSlice > 0) {
                strArrTemp[i] = strArrTemp[i].slice(0, maxChar * numSlice) + '\n' + strArrTemp[i].slice(maxChar * numSlice);
                numSlice--;
            }
        }
    }
    return strArrTemp.join(' ');
};

StringUtils.getFileName = function (path) {
    if (!path) return "";
    var items = path.split('/');
    if (items.length === 0) items = path.split('\\');
    return items[items.length - 1];
};

/**
 * Chuyển mảng bytes thành chuỗi
 * @param buffer {ArrayBuffer}
 * @returns {String}
 */
StringUtils.bufferToString = function (buffer) {
    return Array.prototype.reduce.call(new Uint8Array(buffer), function (result, value) {
        return result + String.fromCharCode(value);
    }, "");
};

/**
 * Chuyển chuỗi thành mảng bytes (array buffer)
 * @param str {String}
 * @returns {ArrayBuffer}
 */
StringUtils.stringToBuffer = function (str) {
    var buffer = new ArrayBuffer(str.length * 2);
    var bufferView = new DataView(buffer);
    for (var i = 0; i < str.length; i++) {
        bufferView.setUint16(i * 2, str.charCodeAt(i));
    }
    return buffer;
};

StringUtils.utf8ToUtf16 = function (str) {

    var array = StringUtils.stringToBuffer(str);
    var c = void 0,
        char2 = void 0,
        char3 = void 0;

    var out = "";
    var len = array.length;
    var i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode((c & 0x1F) << 6 | char2 & 0x3F);
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode((c & 0x0F) << 12 | (char2 & 0x3F) << 6 | (char3 & 0x3F) << 0);
                break;
        }
    }

    return out;
};

StringUtils.buffToDec = function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
        return x.toString();
    }).join(' ');
};

StringUtils.buffToByte = function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
        return ('00' + x.toString(2)).slice(-2);
    }).join(' ');
};

StringUtils.buffToHex = function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
        return ('00' + x.toString(16)).slice(-2);
    }).join(' ');
};