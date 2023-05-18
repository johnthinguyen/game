Module.define(function (require) {
    "use strict";

    /** @enum {string} */
    const Events = {
        ON_MESSAGE: "onSocketMessage",
        ON_CONNECTED: "onSocketConnected",
        ON_DISCONNECTED: "onSocketDisconnected",
    };

    const KING_ENABLE_SOCKET_MSG_QUEUE = false;
    const KING_MAX_MESSAGE_PROCESS_PER_FRAME = 3;
    const KING_DELAY_EACH_PROCESS_MSG = 40; // milliseconds
    const KING_MAX_CACHE_MESSAGE = 30;

    const KingConnector = cc.class("KingConnector", KingLogic, {

        LOGTAG: "[KingConnector]",

        serverHost: "",
        serverPort: 0,

        isPingSent: false,
        isSocketAlive: true,

        isPingPongActivated: false,
        canPingPongActivated: false,

        lastPongTime: 0,
        heartBeatInterval: 0,

        ctor: function () {
            this._super();
            this.initEmitter();

            this.buffer = null;

            this.rawsocket = null;
            this.websocket = null;

            //this.queueMessage = new TLKQueue();
            this.timer = null;
            this.lastTimeProcessMsg = 0;
        },

        destroy: function () {
            if (this.timer) {
                clearInterval(this.timer);
                delete this.timer;
            }
            this.clearMsgQueue();
        },

        clearMsgQueue: function () {
            //this.queueMessage.clear();
        },

        // socket

        isRawSocket: function () {
            return this.socketType === KingSocketType.TCP;
        },

        isWebSocket: function () {
            return this.socketType === KingSocketType.WS;
        },

        isAlive: function () {
            return this.isSocketAlive;
        },

        isConnected: function () {
            if (this.isWebSocket()) {
                return cc.sys.isObjectValid(this.websocket) && this.websocket.readyState === WebSocket.OPEN;
            } else {
                return cc.sys.isObjectValid(this.rawsocket) && this.rawsocket.isConnected;
            }
        },

        initSocket: function (host, port, tag, socketType = KingSocketType.WS) {
            this.log("initSocket", "host:", host, "port:", port, "tag:", tag, "socketType:", socketType);
            this.rawsocket = null;
            this.websocket = null;

            this.socketType = socketType;

            switch (this.socketType) {
                case KingSocketType.TCP:
                    return this.initRawSocket(host, port, tag);
                case KingSocketType.WS:
                    return this.initWebSocket(host, port);
                case KingSocketType.UDP:
                default:
                    this.log("initSocket", "Unsupported socket type!")
            }

            return false;
        },

        initRawSocket: function (host, port, tag) {
            this.log("initRawSocket", "host:", host, "port:", port, "tag:", tag);

            this.initRawSocketBuffer();

            this.rawsocket = new SocketLogicMiniGame(tag);
            this.rawsocket.onConnected = this.onSocketConnected.bind(this);
            this.rawsocket.onConnectionError = this.onSocketConnectionError.bind(this);
            this.rawsocket.onDisconnected = this.onSocketDisconnected.bind(this);
            this.rawsocket.onSocketData = this.onRawSocketData.bind(this);

            // this.rawsocket.onSocketMessageRaw = this.onRawSocketMessage.bind(this);
            // this.rawsocket.onSocketMessageJson = this.onRawSocketMessageJson.bind(this);

            return this.rawsocket.openWithHost(host, port);
        },

        initRawSocketBuffer: function (socketBufferSize = 50 * 1024) {
            this.buffer = new ArrayBuffer(socketBufferSize);
            this.bufferView = new DataView(this.buffer);
            this.bufferSize = 0;
        },

        onMessage: function (msg) {
            this.onWebSocketMessage(msg.data);
        },

        initWebSocket: function (host, port) {
            this.log("initWebSocket", "host:", host, "port:", port);

            var prefixProtocol = 'ws://';
            if (window.location.protocol.indexOf('https') === 0)
                prefixProtocol = 'wss://';

            var url = prefixProtocol + host + (port !== null && port > 0 ? ":" + port : "");
            this.websocket = new WebSocket(url);
            this.websocket.binaryType = "arraybuffer";

            this.websocket.onopen = () => {
                this.onSocketConnected({
                    connect: true,
                    status: this.websocket.readyState
                });
            };

            this.websocket.onmessage = this.onMessage.bind(this);

            this.websocket.onerror = (event) => {

                let reason;
                if (event.code === 1000)
                    reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                else if (event.code === 1001)
                    reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
                else if (event.code === 1002)
                    reason = "An endpoint is terminating the connection due to a protocol error";
                else if (event.code === 1003)
                    reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                else if (event.code === 1004)
                    reason = "Reserved. The specific meaning might be defined in the future.";
                else if (event.code === 1005)
                    reason = "No status code was actually present.";
                else if (event.code === 1006)
                    reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                else if (event.code === 1007)
                    reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
                else if (event.code === 1008)
                    reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
                else if (event.code === 1009)
                    reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                else if (event.code === 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                    reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
                else if (event.code === 1011)
                    reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                else if (event.code === 1015)
                    reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                else
                    reason = "Unknown reason";

                cc.log(this.LOGTAG, "Web socket error: %s", reason);

                this.onSocketConnectionError({
                    connect: this.isConnected(),
                    status: (this.websocket) ? this.websocket.readyState : 0,
                    message: reason,
                });
            };

            this.websocket.onclose = () => {
                this.onSocketDisconnected();
            };

            return this.websocket && this.websocket.readyState === WebSocket.CONNECTING;
        },

        connect: function (host, port, tag, socketType = KingSocketType.WS) {
            this.log("connect", "host:", host, "port:", port, "tag:", tag, "socketType:", socketType);
            return this.initSocket(host, port, tag, socketType);
        },

        enqueueBuffer: function (data, size) {

            if (this.bufferSize + size > this.buffer.byteLength) {
                this.log("enqueueBuffer:", "Buffer overflow!");
                return;
            }

            for (let i = 0; i < size; i++) {
                this.bufferView.setUint8(this.bufferSize + i, data[i]);
            }

            this.bufferSize += size;
        },

        dequeueBuffer: function (size) {
            let result = new ArrayBuffer(size);
            let resultView = new DataView(result);
            for (let i = size; i < this.buffer.byteLength; i++) {
                if (i - size < size)
                    resultView.setInt8(i - size, this.bufferView.getInt8(i - size));
                this.bufferView.setInt8(i - size, this.bufferView.getInt8(i));
            }
            this.bufferSize = Math.max(this.bufferSize - size, 0);
            return result;
        },

        close: function () {

            if (!this.isConnected())
                return;

            if (KING_ENABLE_SOCKET_MSG_QUEUE) {
                this.destroy();
            }

            if (this.websocket) {
                this.websocket.close();
            }

            this.rawsocket = null;
            this.websocket = null;
        },

        // send packets

        send: function (message) {
            if (!message && !(message instanceof ArrayBuffer) && !(message instanceof Uint8Array)) {
                this.log("send", "Invalid sending packet!");
                return false;
            }

            if (!this.isConnected()) {
                this.log("send", "Socket is not connected!");
                return false;
            }

            if (this.isWebSocket()) {
                return this.websocket.send(message);
            } else if (this.isRawSocket()) {
                return this.rawsocket.send(message);
            }

            return false;
        },

        // events

        onSocketConnected: function (payload) {
            this.log("onSocketConnected", "connected:", payload.connect, "status:", payload.status);
            this.dispatchEvent(Events.ON_CONNECTED, payload);
            if (KING_ENABLE_SOCKET_MSG_QUEUE) {
                this.timer = setInterval(this.update.bind(this), 0.02);
            }
        },

        onSocketDisconnected: function () {
            this.log("onSocketDisconnected");
            this.dispatchEvent(Events.ON_DISCONNECTED, false);
            if (KING_ENABLE_SOCKET_MSG_QUEUE) {
                this.destroy();
            }
        },

        onSocketConnectionError: function (payload) {
            this.log("onSocketConnectionError", "connected:", payload.connect, "status:", payload.status);
            this.dispatchEvent(Events.ON_DISCONNECTED, payload);
            if (KING_ENABLE_SOCKET_MSG_QUEUE) {
                this.destroy();
            }
        },

        onRawSocketData: function (payload) {
            // Received data chunk by chunk from raw socket

            this.log("onRawSocketData", "size:", payload.size);
            this.log("onRawSocketData", "data:", payload.data.toHexString());

            this.enqueueBuffer(payload.data, payload.size);

            let message = new TLKSocketMessage();
            let headerSize = message.sizeHeader();
            if (this.bufferSize >= headerSize) {
                this.log("onRawSocketData", "NEW MESSAGE HEADER");
                do {
                    let success = message.setHeader(this.buffer);
                    let messageSize = message.size();
                    if (success && messageSize >= headerSize && messageSize <= this.bufferSize) {
                        this.log("onRawSocketData", "NEW MESSAGE DATA");
                        let messageBuffer = this.dequeueBuffer(messageSize);
                        message.setContent(messageBuffer, headerSize);
                        this.dispatchEvent(Events.ON_MESSAGE, message);
                    }
                } while (this.bufferSize >= headerSize);
            }
        },

        onWebSocketMessage: function (payload) {
            // this.log("onWebSocketMessage", "payload:", payload.toHexString());
            this.log("onWebSocketMessage", "payload.size:", payload.byteLength);

            if (KING_ENABLE_SOCKET_MSG_QUEUE) {
                this.enqueue(payload);
            }
            else {
                this.processPayload(payload);
            }
        },

        update: function (dt) {
            let now = Date.now();
            if (now - this.lastTimeProcessMsg > KING_DELAY_EACH_PROCESS_MSG) {
                this.lastTimeProcessMsg = now;
                this.processQueue();
            }
        },

        enqueue: function (data) {
            if (this.queueMessage.length > KING_MAX_CACHE_MESSAGE) {
                this.queueMessage.remove(KING_MAX_CACHE_MESSAGE * 0.5);
            }
            this.queueMessage.enqueue(data);
        },

        processQueue: function () {
            let count = Math.min(KING_MAX_MESSAGE_PROCESS_PER_FRAME, this.queueMessage.getLength());
            while (count > 0) {
                let msg = this.dequeue();
                if (msg) {
                    this.processPayload(msg);
                }
                count--;
            }
        },

        dequeue: function () {
            return this.queueMessage.dequeue();
        },

        processPayload: function (payload) {
            this.dispatchEvent(Events.ON_MESSAGE, payload);
        }
    });

    KingConnector.Events = Events;
    
    window.KingConnector = KingConnector;
    return KingConnector;
});