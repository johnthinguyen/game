"use strict";

var ReportBugs = ReportBugs || {};
ReportBugs.TaskEncodeBase64 = cc.Class.extend({
    ctor: function ctor() {
        this.name = "encodeBase64";

        this.progress = 0;
        this.isStarted = false;
        this.isCompleted = false;

        this.resultWidth = 0;
        this.resultHeight = 0;
        this.resultBuffer = null;
    },

    start: function start(buffer, width, height) {
        this.progress = 0;
        this.isStarted = true;
        this.isCompleted = false;

        this.width = width;
        this.height = height;
        this.buffer = buffer;

        this.resultWidth = width;
        this.resultHeight = height;
        this.resultBuffer = null;

        this.isCoroutine = ReportBugs.Config.TASK_USE_COROUTINE;
        if (this.isCoroutine) {
            this.currentIndex = 0;
            this.coroutine = this.encodeWithCoroutine(this.buffer, ReportBugs.Config.ENCODE_CHUNK_SIZE);
        } else {
            this.currentIndex = 0;
            this.currentParts = [];
        }
    },

    execute: function execute() {
        if (this.isCompleted) {
            return true;
        }

        var CHUNK_SIZE = ReportBugs.Config.ENCODE_CHUNK_SIZE;

        if (this.isCoroutine) {
            this.resultBuffer = this.coroutine.next().value;
            if (this.resultBuffer) {
                this.progress = 1.0;
                this.isCompleted = true;
            } else {
                this.currentIndex += CHUNK_SIZE;
                this.progress = this.currentIndex / this.buffer.byteLength;
            }
        } else {
            this.currentParts.push(this.encode(this.buffer, this.currentIndex, this.currentIndex + CHUNK_SIZE));
            this.currentIndex = this.currentIndex + CHUNK_SIZE;

            if (this.currentIndex >= this.buffer.length) {
                this.progress = 1.0;
                this.isCompleted = true;

                this.resultBuffer = this.currentParts.join("");
            } else {
                this.progress = this.currentIndex / this.buffer.length;
            }
        }
    },

    encode: function encode(buffer) {
        var startIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var endIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : buffer.length;

        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var t = "";
        var n = void 0,
            r = void 0,
            i = void 0,
            s = void 0,
            o = void 0,
            u = void 0,
            a = void 0;

        var idx = 0;
        var str = buffer.substring(startIndex, endIndex);
        while (idx < str.length) {
            n = str.charCodeAt(idx++);
            r = str.charCodeAt(idx++);
            i = str.charCodeAt(idx++);

            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64;
            } else if (isNaN(i)) {
                a = 64;
            }
            t = t + keyStr.charAt(s) + keyStr.charAt(o) + keyStr.charAt(u) + keyStr.charAt(a);
        }

        return t;
    },

    encodeWithCoroutine: /*#__PURE__*/function encodeWithCoroutine(buffer, chunkSize) {
        var keyStr, t, n, r, i, s, o, u, a, f, chunkCount;
        return regeneratorRuntime.wrap(function encodeWithCoroutine$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                        t = "";
                        n = void 0, r = void 0, i = void 0, s = void 0, o = void 0, u = void 0, a = void 0;
                        f = 0;
                        chunkCount = 0;

                    case 5:
                        if (!(f < buffer.length)) {
                            _context.next = 21;
                            break;
                        }

                        n = buffer.charCodeAt(f++);
                        r = buffer.charCodeAt(f++);
                        i = buffer.charCodeAt(f++);
                        s = n >> 2;
                        o = (n & 3) << 4 | r >> 4;
                        u = (r & 15) << 2 | i >> 6;
                        a = i & 63;
                        if (isNaN(r)) {
                            u = a = 64;
                        } else if (isNaN(i)) {
                            a = 64;
                        }
                        t = t + keyStr.charAt(s) + keyStr.charAt(o) + keyStr.charAt(u) + keyStr.charAt(a);

                        if (!(chunkCount >= chunkSize)) {
                            _context.next = 19;
                            break;
                        }

                        chunkCount -= chunkSize;
                        _context.next = 19;
                        return null;

                    case 19:
                        _context.next = 5;
                        break;

                    case 21:
                        _context.next = 23;
                        return t;

                    case 23:
                    case "end":
                        return _context.stop();
                }
            }
        }, encodeWithCoroutine, this);
    }
});