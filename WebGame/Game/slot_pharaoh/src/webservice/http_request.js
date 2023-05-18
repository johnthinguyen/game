"use strict";

var HttpRequest = cc.Class.extend({
    LOGTAG: "[HttpRequest]",

    isComplete: false,
    tag: "",

    ctor: function ctor(url, query, method, headers, onComplete, onError, onAbort, onProgress, tag) {
        cc.log(this.LOGTAG, "url=%s", url, "query=%s", query, "method=%s", method, "headers=%j", headers);

        this.onErrorCallback = onError;
        this.onAbortCallback = onAbort;
        this.onProgressCallback = onProgress;
        this.onCompleteCallback = onComplete;

        this.tag = tag;
        this.url = url;

        this.query = query || '';
        this.method = method || HttpRequest.METHOD.GET;
        this.headers = headers || [];

        this.xhr = cc.loader.getXMLHttpRequest();
        this.xhr.open(this.method, this.url + this.query, true);
        this.xhr.responseType = 'text';

        for (var i = 0; i < this.headers.length; i++) {
            this.xhr.setRequestHeader(this.headers[i].key, this.headers[i].value);
        }

        this.xhr.onload = this.onLoad.bind(this);
        this.xhr.onloadend = this.onLoadEnd.bind(this);
        this.xhr.onloadstart = this.onLoadStart.bind(this);

        this.xhr.onerror = this.onError.bind(this);
        this.xhr.onabort = this.onAbort.bind(this);
        this.xhr.ontimeout = this.onTimeout.bind(this);
        this.xhr.onprogress = this.onProgress.bind(this);

        this.xhr.onreadystatechange = this.onReadyStateChange.bind(this);
    },

    load: function load() {
        if (this.xhr && this.xhr.status === HttpRequest.STATUS.OPEN) {
            this.xhr.send(this.query + '&datetime=' + new Date().getTime());
            return this;
        } else {
            var urlLoader = new HttpRequest(this.url, this.query, this.method, this.headers, this.onCompleteCallback, this.onErrorCallback, this.onAbortCallback, this.onProgressCallback);
            urlLoader.load();
            return urlLoader;
        }
    },

    dispose: function dispose() {
        var abort = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (!this.xhr) return;

        if (abort) this.xhr.abort();

        this.xhr.onload = null;
        this.xhr.onloadend = null;
        this.xhr.onloadstart = null;
        this.xhr.onerror = null;
        this.xhr.onabort = null;
        this.xhr.ontimeout = null;
        this.xhr.onprogress = null;
        this.xhr.onreadystatechange = null;
        this.xhr = null;
    },

    onLoad: function onLoad() {
        // cc.log(this.LOGTAG, "onLoad: %j", arguments);
    },

    onLoadEnd: function onLoadEnd() {
        // cc.log(this.LOGTAG, "onLoadEnd: %j", arguments);
    },

    onLoadStart: function onLoadStart() {
        // cc.log(this.LOGTAG, "onLoadStart: %j", arguments);
    },

    onError: function onError() {
        cc.log(this.LOGTAG, "onError: %j", arguments);
        this.onErrorCallback && this.onErrorCallback(this.xhr.toString().replace('object ', '') + ' Request failed -> status: ' + this.xhr.status + ', text: "' + this.xhr.statusText + '"', this);
        this.dispose();
    },

    onAbort: function onAbort() {
        cc.log(this.LOGTAG, "onAbort: %j", arguments);
        this.onAbortCallback && this.onAbortCallback(this.xhr.toString().replace('object ', '') + ' Request was aborted by the user', this);
        this.dispose(true);
    },

    onTimeout: function onTimeout() {
        cc.log(this.LOGTAG, "onTimeout: %j", arguments);
        this.onErrorCallback && this.onErrorCallback(this.xhr.toString().replace('object ', '') + ' Request failed timed out', this);
        this.dispose();
    },

    onProgress: function onProgress(event) {
        if (event && event.lengthComputable) {
            this.onProgressCallback && this.onProgressCallback(event.loaded / event.total, this);
        } else {
            this.onProgressCallback && this.onProgressCallback(0, this);
        }
    },

    onReadyStateChange: function onReadyStateChange() {
        cc.log(this.LOGTAG, "onReadyStateChange:", "readyState:", this.xhr.readyState, "status:", this.xhr.status, "statusText:", this.xhr.statusText);
        if (this.xhr.readyState === 4) {
            if (!this.isComplete) {
                this.isComplete = true;
                var status = this.xhr.status || HttpRequest.STATUS.OK;
                if (status === HttpRequest.STATUS.OK || status === HttpRequest.STATUS.EMPTY || HttpRequest.STATUS.UNSENT && this.xhr.responseText.length > 0) {
                    if (this.tag === "") {
                        var data = null;
                        try {
                            data = JSON.parse(this.xhr.responseText);
                        } catch (e) {
                            this.onErrorCallback && this.onErrorCallback("Failed to parse response json", this);
                            return;
                        }
                        if (data) this.onCompleteCallback && this.onCompleteCallback(data, this);
                    } else {
                        this.onCompleteCallback(this.xhr.response, this.tag, this);
                    }
                } else {
                    cc.error(this.LOGTAG, this.xhr.status + " - " + this.xhr.statusText + ":" + this.xhr.responseURL);
                    this.onErrorCallback && this.onErrorCallback(this.xhr.statusMessage, this);
                }
            }
        }
    }
});

HttpRequest.load = function (url, query, method, headers, onComplete, onError, onAbort, onProgress) {
    var tag = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : "";

    return new HttpRequest(url, query, method, headers, onComplete, onError, onAbort, onProgress, tag).load();
};

HttpRequest.METHOD = {
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
};

HttpRequest.STATUS = {
    UNSENT: 0,
    OPEN: 0,
    OK: 200,
    EMPTY: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    NOT_MODIFIED: 304
};

HttpRequest.XHR_RESPONSE_TYPE = {
    DEFAULT: 'text',
    BUFFER: 'arraybuffer',
    BLOB: 'blob',
    DOCUMENT: 'document',
    JSON: 'json',
    TEXT: 'text'
};