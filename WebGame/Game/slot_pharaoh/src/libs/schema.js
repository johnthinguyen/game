"use strict";

/**
 * @typedef DataReader
 * @property {(length: number | Schema) => boolean} canRead
 */

/** 
 * @typedef DataWriter
 * @property {(length: number | Schema) => boolean} canWrite
 */

/** 
 * @typedef Schema
 * @property {(value?: any) => number} getSize
 * @property {() => number} getMinSize
 * @property {(reader: DataReader) => any} read
 * @property {(writer: DataWriter, value: any) => void} write
 */

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var Schema = function () {
    ///////////////////////////////////////////////////////////////////////////
    // @region: System configure before loading runtime
    ///////////////////////////////////////////////////////////////////////////

    if (typeof ArrayBuffer === "undefined") {
        throw new Error("Current runtime is not support binary operations. Required module and family: ArrayBuffer");
    }

    ///////////////////////////////////////////////////////////////////////////
    // @region: Binary Stream
    ///////////////////////////////////////////////////////////////////////////

    function isLittleEndian() {
        var uInt32 = new Uint32Array([0x11223344]);
        var uInt8 = new Uint8Array(uInt32.buffer);
        return uInt8[0] === 0x44;
    }

    function isBigEndian() {
        var uInt32 = new Uint32Array([0x11223344]);
        var uInt8 = new Uint8Array(uInt32.buffer);
        return uInt8[0] === 0x11;
    }

    var BIG_ENDIAN = isBigEndian();
    var LITTLE_ENDIAN = isLittleEndian();

    function DataReader(buffer) {
        var byteOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var littleEndian = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        this.dataView = new DataView(buffer, byteOffset);
        this.offset = byteOffset;
        this.littleEndian = littleEndian;
    }

    function DataWriter(buffer) {
        var byteOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var littleEndian = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        this.dataView = new DataView(buffer);
        this.offset = byteOffset;
        this.littleEndian = littleEndian;
    }

    DataReader.prototype = {
        canRead: function canRead(byteLength) {
            if (isSchema(byteLength)) {
                return this.offset + byteLength.getMinSize() <= this.dataView.byteLength;
            }

            return this.offset + byteLength <= this.dataView.byteLength;
        },

        getBuffer: function getBuffer() {
            return this.dataView.buffer;
        },

        getByteLength: function getByteLength() {
            return this.dataView.byteLength;
        },

        readBool: function readBool() {
            var result = this.dataView.getUint8(this.offset, this.littleEndian);
            this.offset += 1;
            return result > 0;
        },

        readInt8: function readInt8() {
            var result = this.dataView.getInt8(this.offset, this.littleEndian);
            this.offset += 1;
            return result;
        },

        readInt16: function readInt16() {
            var result = this.dataView.getInt16(this.offset, this.littleEndian);
            this.offset += 2;
            return result;
        },

        readInt32: function readInt32() {
            var result = this.dataView.getInt32(this.offset, this.littleEndian);
            this.offset += 4;
            return result;
        },

        readInt64: function readInt64() {
            var x = this.readInt32();
            var y = this.readInt32();

            if (this.littleEndian) {
                var sign = x < 0 ? -1 : 1;
                return x + sign * y * 0x80000000;
            } else {
                var _sign = y < 0 ? -1 : 1;
                return _sign * x * 0x80000000 + y;
            }
        },

        readUInt8: function readUInt8() {
            var result = this.dataView.getUint8(this.offset, this.littleEndian);
            this.offset += 1;
            return result;
        },

        readUInt16: function readUInt16() {
            var result = this.dataView.getUint16(this.offset, this.littleEndian);
            this.offset += 2;
            return result;
        },

        readUInt32: function readUInt32() {
            var result = this.dataView.getUint32(this.offset, this.littleEndian);
            this.offset += 4;
            return result;
        },

        readUInt64: function readUInt64() {
            var x = this.readUInt32();
            var y = this.readUInt32();

            if (this.littleEndian) {
                return x + y * 0x80000000;
            } else {
                return x * 0x80000000 + y;
            }
        },

        readFloat: function readFloat() {
            var result = this.dataView.getFloat32(this.offset, this.littleEndian);
            this.offset += 4;
            return result;
        },

        readDouble: function readDouble() {
            var result = this.dataView.getFloat64(this.offset, this.littleEndian);
            this.offset += 8;
            return result;
        },

        readString: function readString(byteCount) {
            var codePoints = new Uint8Array(this.dataView.buffer, this.offset, byteCount);
            this.offset = this.offset + byteCount;
            return decodeUtf8(codePoints);
        },

        readArray: function readArray(count, schema) {
            var result = Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = schema.read(this);
            }

            return result;
        },

        readInt8Array: function readInt8Array(count) {
            var result = new Int8Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readInt8();
            }

            return result;
        },

        readInt16Array: function readInt16Array(count) {
            var result = new Int16Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readInt16();
            }

            return result;
        },

        readInt32Array: function readInt32Array(count) {
            var result = new Int32Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readInt32();
            }

            return result;
        },

        readInt64Array: function readInt64Array(count) {
            var result = new Float64Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readInt64();
            }

            return result;
        },

        readUInt8Array: function readUInt8Array(count) {
            var result = new UInt8Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readUInt8();
            }

            return result;
        },

        readUInt16Array: function readUInt16Array(count) {
            var result = new UInt16Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readUInt16();
            }

            return result;
        },

        readUInt32Array: function readUInt32Array(count) {
            var result = new UInt32Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readUInt32();
            }

            return result;
        },

        readUInt64Array: function readUInt64Array(count) {
            var result = new Float64Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.readUInt64();
            }

            return result;
        }
    };

    DataWriter.prototype = {
        canWrite: function canWrite(byteLength, value) {
            if (isSchema(byteLength)) {
                return this.offset + byteLength.getSize(value) <= this.dataView.byteLength;
            }

            return this.offset + byteLength <= this.dataView.byteLength;
        },

        getBuffer: function getBuffer() {
            return this.dataView.buffer;
        },

        getByteLength: function getByteLength() {
            return this.dataView.byteLength;
        },

        writeBool: function writeBool(value) {
            this.dataView.setUint8(this.offset, value ? 1 : 0);
            this.offset += 1;
        },

        writeInt8: function writeInt8(value) {
            this.dataView.setInt8(this.offset, value);
            this.offset += 1;
        },

        writeInt16: function writeInt16(value) {
            this.dataView.setInt16(this.offset, value, this.littleEndian);
            this.offset += 2;
        },

        writeInt32: function writeInt32(value) {
            this.dataView.setInt32(this.offset, value, this.littleEndian);
            this.offset += 4;
        },

        writeInt64: function writeInt64(value) {
            var lo = value % 0x80000000;
            var hi = (value < 0 ? -value : value) / 0x80000000 | 0;

            if (this.littleEndian) {
                this.writeInt32(lo);
                this.writeInt32(hi);
            } else {
                this.writeInt32(hi);
                this.writeInt32(lo);
            }
        },

        writeUInt8: function writeUInt8(value) {
            this.dataView.setUint8(this.offset, value);
            this.offset += 1;
        },

        writeUInt16: function writeUInt16(value) {
            this.dataView.setUint16(this.offset, value, this.littleEndian);
            this.offset += 2;
        },

        writeUInt32: function writeUInt32(value) {
            this.dataView.setUint32(this.offset, value, this.littleEndian);
            this.offset += 4;
        },

        writeUInt64: function writeUInt64(value) {
            var vl = value < 0 ? -value : value;
            var lo = vl % 0x80000000;
            var hi = vl / 0x80000000 | 0;

            if (this.littleEndian) {
                this.writeUInt32(lo);
                this.writeUInt32(hi);
            } else {
                this.writeUInt32(hi);
                this.writeUInt32(lo);
            }
        },

        writeFloat: function writeFloat(value) {
            this.dataView.setFloat32(this.offset, value, this.littleEndian);
            this.offset += 4;
        },

        writeDouble: function writeDouble(value) {
            this.dataView.setFloat64(this.offset, value, this.littleEndian);
            this.offset += 8;
        }
    };

    // Convert to BigInt before write to binary
    if (typeof BigInt === "function") {
        DataReader.prototype.readBigInt64 = function () {
            var result = this.dataView.getBigInt64(this.offset, this.littleEndian);
            this.offset += 8;
            return result;
        };

        DataReader.prototype.readBigUInt64 = function () {
            var result = this.dataView.getBigUint64(this.offset, this.littleEndian);
            this.offset += 8;
            return result;
        };

        DataWriter.prototype.writeBigInt64 = function (value) {
            this.dataView.setBigInt64(this.offset, value, this.littleEndian);
            this.offset += 8;
        };

        DataWriter.prototype.writeBigUInt64 = function (value) {
            this.dataView.setBigUint64(this.offset, value, this.littleEndian);
            this.offset += 8;
        };
    }

    ///////////////////////////////////////////////////////////////////////////
    // @region: UTF8
    ///////////////////////////////////////////////////////////////////////////

    function getLengthUtf8(str) {
        var length = 0;
        for (var i = 0; i < str.length;) {
            var high = str.charCodeAt(i++);
            if (high >= 0xD800 && high <= 0xDBFF) {
                if (i + 1 < str.length) {
                    var low = str.charCodeAt(i++);
                    if (low >= 0xDC00 && low <= 0xDFFF) {
                        length += 4;
                    } else {
                        length += 3;
                    }
                } else {
                    length += 3;
                }
            } else {
                if (high < 0x80) length += 1;else if (high < 0x800) length += 2;else if (high < 0x10000) length += 3;
            }
        }

        return length;
    }

    function encodeUtf8(str, buffer, byteOffset) {
        if (!str) {
            return "";
        }
        // Step 1. Preflight
        var length = 0;
        for (var i = 0; i < str.length;) {
            var high = str.charCodeAt(i++);
            if (high >= 0xD800 && high <= 0xDBFF) {
                if (i + 1 < str.length) {
                    var low = str.charCodeAt(i++);
                    if (low >= 0xDC00 && low <= 0xDFFF) {
                        length += 4;
                    } else {
                        length += 3;
                    }
                } else {
                    length += 3;
                }
            } else {
                if (high < 0x80) length += 1;else if (high < 0x800) length += 2;else if (high < 0x10000) length += 3;
            }
        }

        // Step 2. Rewrite :)
        var codePoints = buffer ? new Uint8Array(buffer, byteOffset, length) : new Uint8Array(length);
        for (var _i = 0, j = 0; _i < str.length;) {
            var _high = str.charCodeAt(_i++);
            if (_high >= 0xD800 && _high <= 0xDBFF) {
                // Handle surrogate pairs.
                if (_i + 1 < str.length) {
                    var _low = str.charCodeAt(_i++);
                    if (_low >= 0xDC00 && _low <= 0xDFFF) {
                        var cp = (_high - 0xD800 << 10) + (_low + 0x2400);
                        codePoints[j++] = 0xF0 | cp >> 0x12;
                        codePoints[j++] = 0x80 | cp >> 0x0C & 0x3F;
                        codePoints[j++] = 0x80 | cp >> 0x06 & 0x3F;
                        codePoints[j++] = 0x80 | cp & 0x3F;
                    } else {
                        codePoints[j++] = 0xEF;
                        codePoints[j++] = 0xBF;
                        codePoints[j++] = 0xBD;
                        continue;
                    }
                } else {
                    codePoints[j++] = 0xEF;
                    codePoints[j++] = 0xBF;
                    codePoints[j++] = 0xBD;
                    continue;
                }
            } else {
                if (_high < 0x80) {
                    codePoints[j++] = _high;
                } else if (_high < 0x800) {
                    codePoints[j++] = 0xC0 | _high >> 6;
                    codePoints[j++] = 0x80 | _high & 0x3F;
                    length += 2;
                } else if (_high < 0x10000) {
                    codePoints[j++] = 0xE0 | _high >> 0xC;
                    codePoints[j++] = 0x80 | _high >> 0x6 & 0x3F;
                    codePoints[j++] = 0x80 | _high >> 0x0 & 0x3F;
                    length += 3;
                }
            }
        }

        return codePoints;
    }

    var UTF8_CODE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0xa, 0x3, 0x3, 0x3, 0x3, 0x3, 0x3, 0x3, 0x3, 0x3, 0x3, 0x3, 0x3, 0x4, 0x3, 0x3, 0xb, 0x6, 0x6, 0x6, 0x5, 0x8, 0x8, 0x8, 0x8, 0x8, 0x8, 0x8, 0x8, 0x8, 0x8, 0x8, 0x0, 0x1, 0x2, 0x3, 0x5, 0x8, 0x7, 0x1, 0x1, 0x1, 0x4, 0x6, 0x1, 0x1, 0x1, 0x1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    /**
     * Get JS String (utf16) from utf8 codepoints
     * @param {Uint8Array} buffer 
     */
    function decodeUtf8(buffer) {
        var codepoint = 0;
        var state = 0;
        var str = "";

        for (var i = 0; i < buffer.length; ++i) {
            var byte = buffer[i];
            var type = UTF8_CODE[byte];
            codepoint = state !== 0 ? byte & 0x3f | codepoint << 6 : 0xff >> type & byte;
            state = UTF8_CODE[256 + state * 16 + type];

            switch (state) {
                case 0:
                    break;

                case 1:
                    str += String.fromCharCode(0xFFFD);
                    while (i + 1 < buffer.length && (buffer[i + 1] & 0xC0) === 0x80) {
                        ++i;
                    }state = codepoint = 0;
                    continue;

                default:
                    continue;
            }

            if (codepoint <= 0xFFFF) {
                str += String.fromCharCode(codepoint);
            } else {
                str += String.fromCharCode(0xD7C0 + (codepoint >> 10), 0xDC00 + (codepoint & 0x3FF));
            }

            codepoint = 0;
        }

        return str;
    }

    ///////////////////////////////////////////////////////////////////////////
    // @region: Main
    ///////////////////////////////////////////////////////////////////////////

    var schemaSymbol = typeof Symbol === "function" ? Symbol("schemaSymbol") : "_S:" + Date.now();
    var isDynamicSymbol = typeof Symbol === "function" ? Symbol("isDynamicSymbol") : "_SD:" + Date.now();

    // Make sure Symbol work like charm
    if (schemaSymbol === isDynamicSymbol) {
        throw TypeError("schemaSymbol & isDynamicSymbol must be difference and unique");
    }

    /**
     * Define a schema with manual read/write
     * @param {Schema} definition 
     * @param {boolean} isDynamicSize
     * @return {Schema}
     */
    function manual(definition) {
        var isDynamicSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        var schema = {
            read: definition.read || function () {},
            write: definition.write || function () {},
            getSize: definition.getSize || function () {
                return 0;
            },
            getMinSize: definition.getMinSize || function () {
                return 0;
            },
            getField: definition.getField
        };

        schema[schemaSymbol] = true;
        schema[isDynamicSymbol] = isDynamicSize;

        return schema;
    };

    /**
     * Check if schema is dynamic size
     * @param {Schema} definition
     * @return {boolean} 
     */
    function isDynamicSize(definition) {
        if (isSchema(definition)) {
            return definition[isDynamicSymbol];
        } else if ((typeof definition === "undefined" ? "undefined" : _typeof(definition)) === "object") {
            for (var field in definition) {
                if (!isDynamicSize(definition[field])) {
                    return true;
                }
            }

            return false;
        }

        throw new TypeError("invalid definition");
    }

    /**
     * Check if input is a schema
     * @param {any} input
     * @return {boolean}
     */
    function isSchema(input) {
        return Boolean(input && input[schemaSymbol]);
    }

    /**
     * Define schema
     * @param {any | Schema} definition
     * @return {Schema}
     */
    function Schema(definition) {
        if (isSchema(definition)) {
            return definition;
        }
        if ((typeof definition === "undefined" ? "undefined" : _typeof(definition)) !== "object") {
            throw new TypeError("definition must be object");
        }

        var fields = [];
        var fieldSchemas = {};
        var fixedBufferSize = 0;
        var dynamicSizeFields = [];

        for (var fieldName in definition) {
            fields.push(fieldName);

            var fieldDefinition = definition[fieldName];

            var fieldSchema = Schema(fieldDefinition);
            fieldSchemas[fieldName] = fieldSchema;

            if (isDynamicSize(fieldSchema)) {
                dynamicSizeFields.push(fieldName);
            } else {
                fixedBufferSize += fieldSchema.getSize();
            }
        }

        if (fields.length <= 0) {
            return Schema.Empty;
        }

        var hasDynamicSize = dynamicSizeFields.length > 0;

        var getSize = void 0;
        if (!hasDynamicSize) {
            getSize = function getSize() {
                return fixedBufferSize;
            };
        } else {
            getSize = function getSize(value) {
                var dynamicBufferSize = 0;
                for (var i = 0, n = dynamicSizeFields.length; i < n; i++) {
                    var field = dynamicSizeFields[i];
                    dynamicBufferSize += fieldSchemas[field].getSize(value[field]);
                }

                return fixedBufferSize + dynamicBufferSize;
            };
        }

        return manual({
            getSize: getSize,

            getMinSize: function getMinSize() {
                return fixedBufferSize;
            },

            getField: function getField(fieldName) {
                return fieldSchemas[fieldName];
            },

            read: function read(reader) {
                var result = {};
                for (var i = 0, n = fields.length; i < n; i++) {
                    var field = fields[i];
                    result[field] = fieldSchemas[field].read(reader);
                }

                return result;
            },

            write: function write(writer, value) {
                for (var i = 0, n = fields.length; i < n; i++) {
                    var field = fields[i];
                    fieldSchemas[field].write(writer, value[field]);
                }
            }
        }, hasDynamicSize);
    }

    /**
     * Decode a buffer to value
     * @param {Schema} schema 
     * @param {ArrayBuffer} buffer 
     * @param {number} byteOffset 
     * @param {boolean} littleEndian
     * @return {any}
     */
    function decode(schema, buffer) {
        var byteOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var littleEndian = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        if (!isSchema(schema)) {
            throw TypeError("schema is not valid!");
        }

        var minSize = schema.getMinSize();
        var bufferSize = (buffer.byteLength || buffer.length || 0) - byteOffset;
        if (bufferSize < minSize) {
            throw Error("buffer is too small");
        }

        var isNodeBuffer = typeof Buffer !== "undefined" && Buffer.isBuffer(buffer);
        var arrayBuffer = isNodeBuffer ? buffer.buffer : buffer;

        var reader = new DataReader(arrayBuffer, byteOffset, littleEndian);
        return schema.read(reader);
    }

    /**
     * Encode a value to binary buffer
     * @param {Schema} schema 
     * @param {any} value 
     * @param {number} byteOffset 
     * @param {boolean} littleEndian
     * @param {ArrayBuffer=} buffer 
     */
    function encode(schema, value) {
        var byteOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var littleEndian = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        var buffer = arguments[4];

        if (!isSchema(schema)) {
            throw TypeError("schema is not valid!");
        }

        if (!buffer) {
            var bufferSize = schema.getSize(value);
            buffer = new ArrayBuffer(bufferSize);
        }

        var writer = new DataWriter(buffer, byteOffset, littleEndian);
        schema.write(writer, value);

        return buffer;
    }

    ///////////////////////////////////////////////////////
    // @region: Primitives
    ///////////////////////////////////////////////////////

    Schema.Empty = manual({
        getSize: function getSize() {
            return 0;
        },

        getMinSize: function getMinSize() {
            return 0;
        },

        read: function read(reader) {
            return {};
        },

        write: function write(writer, value) {}
    }, false);

    Schema.Bool = manual({
        getSize: function getSize() {
            return 1;
        },

        getMinSize: function getMinSize() {
            return 1;
        },

        read: function read(reader) {
            return reader.readBool();
        },

        write: function write(writer, value) {
            writer.writeBool(value);
        }
    }, false);

    Schema.Int8 = manual({
        getSize: function getSize() {
            return 1;
        },

        getMinSize: function getMinSize() {
            return 1;
        },

        read: function read(reader) {
            return reader.readInt8();
        },

        write: function write(writer, value) {
            writer.writeInt8(value);
        }
    }, false);

    Schema.Int16 = manual({
        getSize: function getSize() {
            return 2;
        },

        getMinSize: function getMinSize() {
            return 2;
        },

        read: function read(reader) {
            return reader.readInt16();
        },

        write: function write(writer, value) {
            writer.writeInt16(value);
        }
    }, false);

    Schema.Int32 = manual({
        getSize: function getSize() {
            return 4;
        },

        getMinSize: function getMinSize() {
            return 4;
        },

        read: function read(reader) {
            return reader.readInt32();
        },

        write: function write(writer, value) {
            writer.writeInt32(value);
        }
    }, false);

    Schema.Int64 = manual({
        getSize: function getSize() {
            return 8;
        },

        getMinSize: function getMinSize() {
            return 8;
        },

        read: function read(reader) {
            return reader.readInt64();
        },

        write: function write(writer, value) {
            writer.writeInt64(value);
        }
    }, false);

    Schema.UInt8 = manual({
        getSize: function getSize() {
            return 1;
        },

        getMinSize: function getMinSize() {
            return 1;
        },

        read: function read(reader) {
            return reader.readUInt8();
        },

        write: function write(writer, value) {
            writer.writeUInt8(value);
        }
    }, false);

    Schema.UInt16 = manual({
        getSize: function getSize() {
            return 2;
        },

        getMinSize: function getMinSize() {
            return 2;
        },

        read: function read(reader) {
            return reader.readUInt16();
        },

        write: function write(writer, value) {
            writer.writeUInt16(value);
        }
    }, false);

    Schema.UInt32 = manual({
        getSize: function getSize() {
            return 4;
        },

        getMinSize: function getMinSize() {
            return 4;
        },

        read: function read(reader) {
            return reader.readUInt32();
        },

        write: function write(writer, value) {
            writer.writeUInt32(value);
        }
    }, false);

    Schema.UInt64 = manual({
        getSize: function getSize() {
            return 8;
        },

        getMinSize: function getMinSize() {
            return 8;
        },

        read: function read(reader) {
            return reader.readUInt64();
        },

        write: function write(writer, value) {
            writer.writeUInt64(value);
        }
    }, false);

    Schema.Float = manual({
        getSize: function getSize() {
            return 4;
        },

        getMinSize: function getMinSize() {
            return 4;
        },

        read: function read(reader) {
            return reader.readFloat();
        },

        write: function write(writer, value) {
            writer.writeFloat(value);
        }
    }, false);

    Schema.Double = manual({
        getSize: function getSize() {
            return 8;
        },

        getMinSize: function getMinSize() {
            return 8;
        },

        read: function read(reader) {
            return reader.readDouble();
        },

        write: function write(writer, value) {
            writer.writeDouble(value);
        }
    }, false);

    if (typeof BigInt === "function") {
        Schema.BigInt64 = manual({
            getSize: function getSize() {
                return 8;
            },

            getMinSize: function getMinSize() {
                return 8;
            },

            read: function read(reader) {
                return reader.readBigInt64();
            },

            write: function write(writer, value) {
                writer.writeBigInt64(value);
            }
        }, false);

        Schema.BigUInt64 = manual({
            getSize: function getSize() {
                return 8;
            },

            getMinSize: function getMinSize() {
                return 8;
            },

            read: function read(reader) {
                return reader.readBigUInt64();
            },

            write: function write(writer, value) {
                writer.writeBigUInt64(value);
            }
        }, false);
    } else {
        Object.defineProperties(Schema, {
            BigInt64: {
                get: function get() {
                    throw Error("This runtime is not support BigInt");
                }
            },

            BigUInt64: {
                get: function get() {
                    throw Error("This runtime is not support BigInt");
                }
            }
        });
    }

    ///////////////////////////////////////////////////////
    // @region: Generics & Containers
    ///////////////////////////////////////////////////////

    /**
     * Define an array schema
     * @param {number | Schema} sizeType 
     * @param {Schema} itemType
     * @return {Schema}
     */
    Schema.Array = function (sizeType, itemType) {
        if (isSchema(sizeType)) {
            var schemaSizeType = sizeType;
            var schemaItemType = Schema(itemType);

            var fixedSize = schemaSizeType.getSize();

            var getSize = void 0;
            if (!isDynamicSize(schemaItemType)) {
                var fixedItemSize = schemaItemType.getSize();
                getSize = function getSize(value) {
                    return fixedSize + value.length * fixedItemSize;
                };
            } else {
                getSize = function getSize(value) {
                    var dynamicSize = 0;
                    for (var i = 0, n = value.length; i < n; i++) {
                        dynamicSize += schemaItemType.getSize(value[i]);
                    }
                    return fixedSize + dynamicSize;
                };
            }

            return manual({
                getSize: getSize,

                getMinSize: function getMinSize() {
                    return fixedSize;
                },

                read: function read(reader) {
                    var length = schemaSizeType.read(reader);
                    var result = Array(length);
                    for (var i = 0; i < length; i++) {
                        result[i] = schemaItemType.read(reader);
                    }

                    return result;
                },

                write: function write(writer, value) {
                    schemaSizeType.write(writer, value.length);

                    for (var i = 0, n = value.length; i < n; i++) {
                        schemaItemType.write(writer, value[i]);
                    }
                }
            }, true);
        } else if (typeof sizeType === "number") {
            var itemCount = sizeType;
            var _schemaItemType = Schema(itemType);

            var _getSize = void 0;
            var getMinSize = void 0;
            if (!isDynamicSize(_schemaItemType)) {
                var _fixedSize = itemCount * _schemaItemType.getSize();
                _getSize = function _getSize() {
                    return _fixedSize;
                };
                getMinSize = function getMinSize() {
                    return _fixedSize;
                };
            } else {
                _getSize = function _getSize(value) {
                    var dynamicSize = 0;
                    for (var i = 0; i < itemCount; i++) {
                        dynamicSize += _schemaItemType.getSize(value[i]);
                    }
                    return dynamicSize;
                };
                getMinSize = function getMinSize() {
                    return 0;
                };
            }

            return manual({
                getSize: _getSize,
                getMinSize: getMinSize,

                read: function read(reader) {
                    var result = Array(itemCount);
                    for (var i = 0; i < itemCount; i++) {
                        result[i] = _schemaItemType.read(reader);
                    }

                    return result;
                },

                write: function write(writer, value) {
                    for (var i = 0, n = Math.min(value.length, itemCount); i < n; i++) {
                        if (i < value.length) {
                            _schemaItemType.write(writer, value[i]);
                        }
                    }
                }
            }, isDynamicSize(_schemaItemType));
        } else {
            throw TypeError("invalid sizeType: should be schema or number");
        }
    };

    Schema.TypedArray = function (sizeType, itemType) {
        var schemaItemType = Schema(itemType);
        var Constructor = void 0;
        switch (schemaItemType) {
            case Schema.Int8:
                Constructor = Int8Array;
                break;

            case Schema.UInt8:
                Constructor = Uint8Array;
                break;

            case Schema.Int16:
                Constructor = Int16Array;
                break;

            case Schema.UInt16:
                Constructor = Uint16Array;
                break;

            case Schema.Int32:
                Constructor = Int32Array;
                break;

            case Schema.UInt32:
                Constructor = Uint32Array;
                break;

            case Schema.Int64:
                Constructor = Float64Array;
                break;

            case Schema.UInt64:
                Constructor = Float64Array;
                break;

            case Schema.Float:
                Constructor = Float32Array;
                break;

            case Schema.Double:
                Constructor = Float64Array;
                break;

            default:
                throw TypeError("Schema.TypedArray: unsupport item type");
        }

        if (isSchema(sizeType)) {
            var schemaSizeType = sizeType;

            var fixedSize = schemaSizeType.getSize();
            var fixedItemSize = schemaItemType.getSize();

            return manual({
                getSize: function getSize(value) {
                    return fixedSize + value.length * fixedItemSize;
                },

                getMinSize: function getMinSize() {
                    return fixedSize;
                },

                read: function read(reader) {
                    var length = schemaSizeType.read(reader);
                    var result = new Constructor(length);

                    for (var i = 0; i < length; i++) {
                        result[i] = schemaItemType.read(reader);
                    }

                    return result;
                },

                write: function write(writer, value) {
                    schemaSizeType.write(writer, value.length);
                    for (var i = 0, n = value.length; i < n; i++) {
                        schemaItemType.write(writer, value[i]);
                    }
                }
            }, true);
        } else if (typeof sizeType === "number") {
            var itemCount = sizeType;
            var _fixedSize2 = itemCount * schemaItemType.getSize();

            return manual({
                getSize: function getSize() {
                    return _fixedSize2;
                },

                getMinSize: function getMinSize() {
                    return _fixedSize2;
                },

                read: function read(reader) {
                    var result = new Constructor(itemCount);

                    for (var i = 0; i < itemCount; i++) {
                        result[i] = schemaItemType.read(reader);
                    }

                    return result;
                },

                write: function write(writer, value) {
                    var newOffset = writer.offset + _fixedSize2;

                    for (var i = 0, n = Math.min(value.length, itemCount); i < n; i++) {
                        schemaItemType.write(writer, value[i]);
                    }

                    writer.offset = newOffset;
                }
            }, false);
        } else {
            throw TypeError("invalid sizeType: should be schema or number");
        }
    };

    Schema.Int8Array = function () {
        function Int8Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.Int8);
        }

        var Default = Int8Array(Schema.UInt32);
        Int8Array.read = Default.read;
        Int8Array.write = Default.write;
        Int8Array.getSize = Default.getSize;
        Int8Array.getMinSize = Default.getMinSize;
        Int8Array[schemaSymbol] = Default[schemaSymbol];
        Int8Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return Int8Array;
    }();

    Schema.Int16Array = function () {
        function Int16Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.Int16);
        }

        var Default = Int16Array(Schema.UInt32);
        Int16Array.read = Default.read;
        Int16Array.write = Default.write;
        Int16Array.getSize = Default.getSize;
        Int16Array.getMinSize = Default.getMinSize;
        Int16Array[schemaSymbol] = Default[schemaSymbol];
        Int16Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return Int16Array;
    }();

    Schema.Int32Array = function () {
        function Int32Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.Int32);
        }

        var Default = Int32Array(Schema.UInt32);
        Int32Array.read = Default.read;
        Int32Array.write = Default.write;
        Int32Array.getSize = Default.getSize;
        Int32Array.getMinSize = Default.getMinSize;
        Int32Array[schemaSymbol] = Default[schemaSymbol];
        Int32Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return Int32Array;
    }();

    Schema.Int64Array = function () {
        function Int64Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.Int64);
        }

        var Default = Int64Array(Schema.UInt32);
        Int64Array.read = Default.read;
        Int64Array.write = Default.write;
        Int64Array.getSize = Default.getSize;
        Int64Array.getMinSize = Default.getMinSize;
        Int64Array[schemaSymbol] = Default[schemaSymbol];
        Int64Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return Int64Array;
    }();

    Schema.UInt8Array = function () {
        function UInt8Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.UInt8);
        }

        var Default = UInt8Array(Schema.UInt32);
        UInt8Array.read = Default.read;
        UInt8Array.write = Default.write;
        UInt8Array.getSize = Default.getSize;
        UInt8Array.getMinSize = Default.getMinSize;
        UInt8Array[schemaSymbol] = Default[schemaSymbol];
        UInt8Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return UInt8Array;
    }();

    Schema.UInt16Array = function () {
        function UInt16Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.UInt16);
        }

        var Default = UInt16Array(Schema.UInt32);
        UInt16Array.read = Default.read;
        UInt16Array.write = Default.write;
        UInt16Array.getSize = Default.getSize;
        UInt16Array.getMinSize = Default.getMinSize;
        UInt16Array[schemaSymbol] = Default[schemaSymbol];
        UInt16Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return UInt16Array;
    }();

    Schema.UInt32Array = function () {
        function UInt32Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.UInt32);
        }

        var Default = UInt32Array(Schema.UInt32);
        UInt32Array.read = Default.read;
        UInt32Array.write = Default.write;
        UInt32Array.getSize = Default.getSize;
        UInt32Array.getMinSize = Default.getMinSize;
        UInt32Array[schemaSymbol] = Default[schemaSymbol];
        UInt32Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return UInt32Array;
    }();

    Schema.UInt64Array = function () {
        function UInt64Array(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.UInt64);
        }

        var Default = UInt64Array(Schema.UInt32);
        UInt64Array.read = Default.read;
        UInt64Array.write = Default.write;
        UInt64Array.getSize = Default.getSize;
        UInt64Array.getMinSize = Default.getMinSize;
        UInt64Array[schemaSymbol] = Default[schemaSymbol];
        UInt64Array[isDynamicSymbol] = Default[isDynamicSymbol];
        return UInt64Array;
    }();

    Schema.FloatArray = function () {
        function FloatArray(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.Float);
        }

        var Default = FloatArray(Schema.UInt32);
        FloatArray.read = Default.read;
        FloatArray.write = Default.write;
        FloatArray.getSize = Default.getSize;
        FloatArray.getMinSize = Default.getMinSize;
        FloatArray[schemaSymbol] = Default[schemaSymbol];
        FloatArray[isDynamicSymbol] = Default[isDynamicSymbol];
        return FloatArray;
    }();

    Schema.DoubleArray = function () {
        function DoubleArray(sizeOrNumberSchema) {
            return Schema.TypedArray(sizeOrNumberSchema, Schema.Double);
        }

        var Default = DoubleArray(Schema.UInt32);
        DoubleArray.read = Default.read;
        DoubleArray.write = Default.write;
        DoubleArray.getSize = Default.getSize;
        DoubleArray.getMinSize = Default.getMinSize;
        DoubleArray[schemaSymbol] = Default[schemaSymbol];
        DoubleArray[isDynamicSymbol] = Default[isDynamicSymbol];
        return DoubleArray;
    }();

    Schema.String = function () {
        function String(charCount) {
            if (isSchema(charCount)) {
                var schemaSizeType = charCount;
                var fixedSize = schemaSizeType.getSize();

                return manual({
                    getSize: function getSize(value) {
                        return fixedSize + getLengthUtf8(value);
                    },

                    getMinSize: function getMinSize() {
                        return fixedSize;
                    },

                    read: function read(reader) {
                        var charCount = schemaSizeType.read(reader);
                        return reader.readString(charCount);
                    },

                    write: function write(writer, value) {
                        var codePoints = encodeUtf8(value, writer.getBuffer(), writer.offset + schemaSizeType.getSize());
                        schemaSizeType.write(writer, codePoints.length);
                        writer.offset += codePoints.length;
                    }
                }, true);
            } else if (typeof charCount === "number") {
                return manual({
                    getSize: function getSize() {
                        return charCount;
                    },

                    getMinSize: function getMinSize() {
                        return charCount;
                    },

                    read: function read(reader) {
                        return reader.readString(charCount);
                    },

                    write: function write(writer, value) {
                        encodeUtf8(value, writer.getBuffer(), writer.offset);
                        writer.offset += charCount;
                    }
                }, false);
            } else {
                throw new TypeError("invalid charCount: must be schema or number, given " + charCount);
            }
        };

        var Default = String(Schema.UInt16);
        String.read = Default.read;
        String.write = Default.write;
        String.getSize = Default.getSize;
        String.getMinSize = Default.getMinSize;
        String[schemaSymbol] = Default[schemaSymbol];
        String[isDynamicSymbol] = Default[isDynamicSymbol];

        return String;
    }();

    Schema.Option = function (definition) {
        var valueSchema = Schema(definition);

        return manual({
            getSize: function getSize(value) {
                return 1 + (value ? valueSchema.getSize(value) : 0);
            },

            getMinSize: function getMinSize(value) {
                return 1;
            },

            read: function read(reader) {
                var hasValue = reader.readBool();
                if (hasValue) {
                    var value = valueSchema.read(reader);
                    return value;
                } else {
                    return null;
                }
            },

            write: function write(writer, value) {
                var hasValue = Boolean(value);
                writer.writeBool(hasValue);

                if (hasValue) {
                    valueSchema.write(writer, value);
                }
            }
        }, true);
    };

    /**
     * Switch statement for schema
     * @param {any | Schema} definition
     * @return {Schema} 
     */
    Schema.Switch = function (definition) {
        if (isSchema(definition) || typeof definition === "function") {
            return definition;
        }

        if ((typeof definition === "undefined" ? "undefined" : _typeof(definition)) !== "object") {
            throw new TypeError("definition must be object");
        }

        var fields = [];
        var fieldSchemas = {};
        var fixedBufferSize = 0;
        var dynamicSizeFields = [];

        for (var fieldName in definition) {
            fields.push(fieldName);

            var fieldDefinition = definition[fieldName];

            var fieldSchema = Schema.Switch(fieldDefinition);
            fieldSchemas[fieldName] = fieldSchema;

            var hasDynamicSizeField = typeof fieldSchema === "function" || isDynamicSize(fieldSchema);
            if (hasDynamicSizeField) {
                dynamicSizeFields.push(fieldName);
            } else {
                fixedBufferSize += fieldSchema.getSize();
            }
        }

        if (fields.length <= 0) {
            return Schema.Empty;
        }

        var hasDynamicSize = dynamicSizeFields.length > 0;
        var getSize = !hasDynamicSize ? function (value) {
            return fixedBufferSize;
        } : function (value) {
            var dynamicBufferSize = 0;
            for (var i = 0, n = dynamicSizeFields.length; i < n; i++) {
                var field = dynamicSizeFields[i];
                var schema = fieldSchemas[field];
                if (!isSchema(schema) && typeof schema === "function") {
                    schema = schema(value);
                }

                if (isSchema(schema)) {
                    dynamicBufferSize += schema.getSize(value[field]);
                }
            }

            return fixedBufferSize + dynamicBufferSize;
        };

        return manual({
            getSize: getSize,

            getMinSize: function getMinSize(value) {
                return fixedBufferSize;
            },

            getField: function getField(fieldName) {
                return fieldSchemas[fieldName];
            },

            read: function read(reader) {
                var result = {};
                for (var i = 0, n = fields.length; i < n; i++) {
                    var field = fields[i];
                    var schema = fieldSchemas[field];
                    if (!isSchema(schema) && typeof schema === "function") {
                        schema = schema(result, reader, null);
                    }

                    if (isSchema(schema)) {
                        result[field] = schema.read(reader);
                    }
                }

                return result;
            },

            write: function write(writer, value) {
                var result = {};
                for (var i = 0, n = fields.length; i < n; i++) {
                    var field = fields[i];
                    var schema = fieldSchemas[field];
                    if (!isSchema(schema) && typeof schema === "function") {
                        schema = schema(result, null, writer);
                    }

                    if (isSchema(schema)) {
                        schema.write(writer, value[field]);
                    }
                }
                return result;
            }
        }, hasDynamicSize);
    };

    Schema.Versioned = function (versionSchema, schemaMap) {
        var minDataSize = 0;
        for (var key in schemaMap) {
            var dataSchema = schemaMap[key];
            if (dataSchema.getMinSize() > minDataSize) {
                minDataSize = dataSchema.getMinSize();
            }
        }
        var minSize = versionSchema.getMinSize() + minDataSize;

        return manual({
            getSize: function getSize(value) {
                var dataSchema = schemaMap[value.version];
                var dataSize = dataSchema ? dataSchema.getSize(value.data) : 0;

                return versionSchema.getSize(value.version) + dataSize;
            },

            getMinSize: function getMinSize() {
                return minSize;
            },

            read: function read(reader) {
                var version = versionSchema.read(reader);
                var dataSchema = schemaMap[version];
                if (dataSchema) {
                    var data = dataSchema.read(reader);
                    return {
                        version: version,
                        data: data
                    };
                } else {
                    return {
                        version: version
                    };
                }
            },

            write: function write(writer, value) {
                var version = value.version;
                versionSchema.read(writer, version);

                var dataSchema = schemaMap[version];
                if (dataSchema) {
                    dataSchema.write(writer, value.data);
                }
            }
        });
    };

    // Export
    Schema.manual = manual;
    Schema.encode = encode;
    Schema.decode = decode;
    Schema.isSchema = isSchema;
    Schema.isDynamicSize = isDynamicSize;

    return Schema;
}();