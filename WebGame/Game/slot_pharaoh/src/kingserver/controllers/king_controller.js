"use strict";

var KingController = cc.class("KingController", BaseController, {

    USE_MESSAGE_QUEUE: false, // dùng message queue
    MESSAGE_QUEUE_MAX_CONCURRENT: 3, // số message tối đa được xử lý mỗi lượt
    MESSAGE_QUEUE_MAX_CAPACITY: 100, // số message tối đa trong queue
    MESSAGE_QUEUE_DELAY: 20, // delay tới lượt xử lý message tiếp theo (ms)

    USE_SOCKET_DATA_BINARY: false, // nhận data chunk-by-chunk từ native socket
    USE_SOCKET_MESSAGE_BINARY: false, // nhận full message binary (bao gồm header) từ native socket

    RAW_SOCKET_BUFFER_SIZE: 50 * 1024,
    RAW_SOCKET_HEADER_INFO_BYTES: 4,
    RAW_SOCKET_HEADER_TOTAL_BYTES: 6,

    LISTENER_TYPE: {
        MAIN: 0,
        GAME: 1
    },

    SYSTEM_EVENTS: {

        ON_CONNECTED: "onConnected",
        ON_DISCONNECTED: "onDisconnected",
        ON_CONNECTION_ERROR: "onConnectionError",
        ON_CONNECTION_CHANGED: "onConnectionChanged",

        ON_LOGIN_SUCCESS: "onLoginSuccess",
        ON_LOGOUT: "onLogout",

        ON_RECEIVED_LOBBY_ROOM_LIST: "onReceivedLobbyRoomList",

        ON_ROOM_ADDED: "onRoomAdded",
        ON_ROOM_REMOVED: "onRoomRemoved",

        ON_JOIN_ROOM_SUCCESS: "onJoinRoomSuccess",

        ON_USER_ENTER_ROOM: "onUserEnterRoom",
        ON_USER_LEAVE_ROOM: "onUserLeaveRoom",

        ON_PLAYER_TO_SPECTATOR: "onPlayerToSpectator",
        ON_SPECTATOR_TO_PLAYER: "onSpectatorToPlayer",

        ON_ROOM_OWNER_CHANGED: "onRoomOwnerChanged",

        ON_RECEIVED_PRIVATE_MSG: "onReceivedPrivateMessage",
        ON_RECEIVED_PUBLIC_MSG: "onReceivedPublicMessage",

        ON_USER_LOST_EXIT_LOGOUT: "onUserLostExitLogout",

        ON_LOBBY_UPDATE: "onLobbyUpdate",

        ON_USER_VARIABLES_UPDATE: "onUserVariablesUpdate",
        ON_ROOM_VARIABLES_UPDATE: "onRoomVariablesUpdate"
    },

    GAME_EVENTS: {

        ON_SEND_ERROR: "onGameSendError",
        ON_BROADCAST_MSG: "onGameBroadcastMessage",

        ON_USER_LOGIN_OTHER_SESSION: "onGameUserLoginOtherSession",

        ON_JACKPOT_INFO: "onGameJackpotInfo",
        ON_JACKPOT_CONFIG: "onGameJackpotConfig",
        ON_JACKPOT_DATA: "onGameJackpotData",

        ON_JACKPOT_WIN: "onGameJackpotWin",
        ON_JACKPOT_WIN_RATE: "onGameJackpotWinRate",
        ON_JACKPO_TOP_WIN_INFO: "onGameJackpotTopWinInfo",

        ON_GAME_DATA: "onGameData",
        ON_RECONNECT_DATA: "onGameReconnectData",

        ON_USER_LEVEL_TIMELINE: "onGameUserLevelTimeline",
        ON_USER_LEVEL_UP: "onGameUserLevelUp",

        ON_RECEIVED_CHAT: "onGameReceivedChat",
        ON_RECEIVED_EMOTICON: "onGameReceivedEmoticon",
        ON_NOTICED_CHAT: "onGameNoticedChat",

        ON_GAME_PING: "onGamePing",
        ON_GAME_ACTION: "onGameAction",
        ON_GAME_MAINTAIN: "onGameMaintain",
        ON_GAME_QUICKPLAY: "onGameQuickPlay",

        ON_LIST_GROUP_INFO: "onGameListGroupInfo",
        ON_LIST_USER_LOBBY: "onGameListUserLobby",

        ON_UPDATE_ROOM_DATA: "onGameUpdateRoomData",
        ON_UPDATE_ROOM_CONFIG: "onGameUpdateRoomConfig",
        ON_UPDATE_MAX_PLAYER: "onGameUpdateMaxPlayer",

        ON_INVITE_RECEIVED: "onGameInviteReceived",
        ON_INVITE_CONFIRMED: "onGameInviteConfirmed",

        ON_UPDATE_MATCH_ID: "onGameUpdateMatchId",
        ON_CHANGED_DEALER_USER: "onGameChangedDealerUser",

        ON_GAME_START_DATA: "onGameStartData",
        ON_GAME_START_NOTIFY: "onGameStartNotify",
        ON_GAME_START_CONFIRM: "onGameStartConfirm",

        ON_GAME_TOUR_RANK_DATA: "onGameTourRankData",
        ON_GAME_TOUR_ROUND_INFO: "onGameTourRoundInfo",
        ON_GAME_TOUR_ROUND_END_INFO: "onGameTourRoundEndInfo",
        ON_GAME_TOUR_SERVER_INFO: "onGameTourServerInfo",
        ON_GAME_ROOM_SERVER_INFO: "onGameRoomServerInfo",

        ON_GAME_TOUR_TIME_SPEND_PING: "onGameTourTimeSpendPing",
        ON_GAME_TOUR_TIME_SPEND_RESULT: "onGameTourTimeSpendResult",

        ON_MATCH_RESULT_INFO: "onGameMatchResultInfo",
        ON_WIN_COMBO: "onGameWinCombo",

        ON_RECEIVED_LOBBY_ROOM_GROUP_LIST: "onReceivedLobbyRoomGroupList"
    },

    ctor: function ctor() {
        var _this = this;

        this._super();
        this.initEmitter(this.LISTENER_TYPE);

        this.platform = cc.sys.os === cc.sys.OS_IOS ? KingPlatform.IOS : KingPlatform.ANDROID;

        if (this.USE_SOCKET_DATA_BINARY === true) this.initBuffer();

        if (this.USE_MESSAGE_QUEUE) {

            this.queueMessage = [];
            this.queueInterval = null;

            this.lastTimeProcessQueue = 0;
        }

        // event khi internet connection thay đổi
        cc.eventManager.addCustomListener(portalHelper.EVENT_NETWORK_CHANGED, function (event) {
            var connected = portalHelper.isInternetConnected ? portalHelper.isInternetConnected() : event.getUserData() || true;
            _this.onConnectionChanged(connected);
        });
    },

    // buffering

    initBuffer: function initBuffer() {
        this.buffer = new ArrayBuffer(this.RAW_SOCKET_BUFFER_SIZE);
        this.bufferView = new DataView(this.buffer);
        this.bufferSize = 0;
    },

    enqueueBuffer: function enqueueBuffer(data, size) {
        for (var i = 0; i < size; i++) {
            this.bufferView.setUint8(this.bufferSize + i, data[i]);
        }
        this.bufferSize += size;
    },

    dequeueBuffer: function dequeueBuffer(size) {
        var result = new ArrayBuffer(size);
        var resultView = new DataView(result);
        for (var i = size; i < this.buffer.byteLength; i++) {
            if (i - size < size) resultView.setUint8(i - size, this.bufferView.getUint8(i - size));
            this.bufferView.setUint8(i - size, this.bufferView.getUint8(i));
        }
        this.bufferSize = Math.max(this.bufferSize - size, 0);
        return result;
    },

    // socket base

    initRawSocket: function initRawSocket(ip, port, tag) {
        this.log("initRawSocket", "ip:", ip, "port:", port, "tag:", tag);

        this.rawsocket = new SocketLogicMiniGame(tag);
        this.rawsocket.onConnected = this.onConnected.bind(this);
        this.rawsocket.onConnectionError = this.onConnectionError.bind(this);
        this.rawsocket.onDisconnected = this.onDisconnected.bind(this);
        this.rawsocket.onSocketMessageJson = this.onRawSocketMessageJson.bind(this);

        if (this.USE_SOCKET_DATA_BINARY) this.rawsocket.onSocketData = this.onRawSocketData.bind(this);

        if (this.USE_SOCKET_MESSAGE_BINARY) this.rawsocket.onSocketMessageRaw = this.onRawSocketMessage.bind(this);

        return this.rawsocket.openWithIp(ip, port || 0);
    },

    initWebSocket: function initWebSocket(ip, port) {
        var _this2 = this;

        this.log("initWebSocket", "ip:", ip, "port:", port);

        var url = "ws://" + ip + (port !== null && port > 0 ? ":" + port : "");
        this.websocket = new WebSocket(url);
        this.websocket.binaryType = "arraybuffer";

        this.websocket.onopen = function () {
            _this2.onConnected({
                connected: true,
                status: _this2.websocket.readyState
            });
        };

        this.websocket.onmessage = function (message) {
            var payload = KingProtocol.parseWebSocketMessage(message.data);
            _this2.onWebSocketMessage(payload);
        };

        this.websocket.onerror = function (event) {

            var reason = void 0;
            if (event.code === 1000) reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";else if (event.code === 1001) reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";else if (event.code === 1002) reason = "An endpoint is terminating the connection due to a protocol error";else if (event.code === 1003) reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";else if (event.code === 1004) reason = "Reserved. The specific meaning might be defined in the future.";else if (event.code === 1005) reason = "No status code was actually present.";else if (event.code === 1006) reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";else if (event.code === 1007) reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";else if (event.code === 1008) reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";else if (event.code === 1009) reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";else if (event.code === 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;else if (event.code === 1011) reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";else if (event.code === 1015) reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";else reason = "Unknown reason";

            _this2.log(_this2.tag, "Web socket error: %s", reason);

            _this2.onConnectionError({
                connected: _this2.isConnected(),
                status: _this2.websocket ? _this2.websocket.readyState : 0,
                message: reason
            });
        };

        this.websocket.onclose = function () {
            _this2.onDisconnected();
        };

        return this.websocket && this.websocket.readyState === WebSocket.CONNECTING;
    },

    initSocket: function initSocket(ip, port, tag) {
        var socketType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : KingSocketType.WS;

        this.log("initSocket", "ip:", ip, "port:", port, "socketType:", socketType);

        this.rawsocket = null;
        this.websocket = null;

        this.socketType = socketType;

        if (this.isWebSocket()) {
            return this.initWebSocket(ip, port);
        } else {
            return this.initRawSocket(ip, port, tag);
        }
    },

    closeRawSocket: function closeRawSocket() {

        if (!this.rawsocket) return;

        this.rawsocket.onConnected = null;
        this.rawsocket.onConnectionError = null;
        this.rawsocket.onDisconnected = null;

        this.rawsocket.onSocketData = null;
        this.rawsocket.onSocketMessageRaw = null;
        this.rawsocket.onSocketMessageJson = null;

        this.rawsocket.close();
        this.rawsocket = null;
    },

    closeWebSocket: function closeWebSocket() {

        if (!this.websocket) return;

        this.websocket.onopen = null;
        this.websocket.onclose = null;
        this.websocket.onerror = null;
        this.websocket.onmessage = null;

        this.websocket.close();
        this.websocket = null;
    },

    isRawSocket: function isRawSocket() {
        return this.socketType === KingSocketType.TCP;
    },

    isWebSocket: function isWebSocket() {
        return this.socketType === KingSocketType.WS;
    },

    isConnected: function isConnected() {
        if (this.isWebSocket()) {
            return this.websocket && this.websocket.readyState === WebSocket.OPEN;
        } else {
            return this.rawsocket && this.rawsocket.isConnected;
        }
    },

    connect: function connect(ip, port) {
        var socketType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : KingSocketType.WS;

        if (this.isConnected()) {
            if (this.isWebSocket()) {
                this.websocket.close();
            } else {
                this.rawsocket.close();
            }
        }

        return this.initSocket(ip, port, "minigame", socketType);
    },

    close: function close() {

        if (this.isWebSocket()) this.closeWebSocket();else this.closeRawSocket();

        this.socketType = KingSocketType.NONE;
    },

    // socket message queue

    initQueue: function initQueue() {

        this.queueMessage = [];
        this.queueInterval = setInterval(this.update.bind(this), 0.05);

        this.lastTimeProcessQueue = 0;
    },

    clearQueue: function clearQueue() {
        this.lastTimeProcessQueue = 0;
        this.queueMessage.length = 0;
    },

    destroyQueue: function destroyQueue() {

        if (this.queueInterval) {
            clearInterval(this.queueInterval);
            delete this.queueInterval;
        }

        this.clearQueue();
    },

    processQueue: function processQueue() {
        var count = Math.min(this.MESSAGE_QUEUE_MAX_CONCURRENT, this.queueMessage.length);
        while (count > 0) {
            var message = this.dequeue();
            if (message) {
                // this.processPayload(msg);
            }
            count--;
        }
    },

    enqueue: function enqueue(data) {

        if (this.queueMessage.length > this.MESSAGE_QUEUE_MAX_CAPACITY) this.queueMessage.splice(0, this.queueMessage.length - this.MESSAGE_QUEUE_MAX_CAPACITY);

        this.queueMessage.push(data);
    },

    dequeue: function dequeue() {

        var message = null;
        if (this.queueMessage.length > 0) {
            message = this.queueMessage[0];
            this.queueMessage.splice(0, 1);
        }

        return message;
    },

    update: function update(dt) {
        if (Date.now() - this.lastTimeProcessQueue > this.MESSAGE_QUEUE_DELAY) {
            this.lastTimeProcessQueue = Date.now();
            this.processQueue();
        }
    },

    // socket callbacks

    onConnected: function onConnected(payload) {
        this.log(this.tag, "onConnected", "connected:", payload.connect, "status:", payload.status);

        if (this.USE_MESSAGE_QUEUE) this.initQueue();

        this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_CONNECTED, payload);
    },

    onDisconnected: function onDisconnected() {
        this.log(this.tag, "onDisconnected");

        this.rawsocket = null;
        this.websocket = null;

        if (this.USE_MESSAGE_QUEUE) this.destroyQueue();

        this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_DISCONNECTED, null);
    },

    onConnectionError: function onConnectionError(payload) {
        this.log(this.tag, "onConnectionError", "connected:", payload.connect, "status:", payload.status);

        this.rawsocket = null;
        this.websocket = null;

        if (this.USE_MESSAGE_QUEUE) this.destroyQueue();

        this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_CONNECTION_ERROR, payload);
    },

    onConnectionChanged: function onConnectionChanged(connected) {
        this.log(this.tag, "onConnectionChanged:", connected);
        this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_CONNECTION_CHANGED, connected);
    },

    onRawSocketData: function onRawSocketData(payload) {

        // Received data chunk by chunk from raw socket

        if (!this.USE_SOCKET_DATA_BINARY) return;

        this.log(this.tag, "onRawSocketData", "size:", payload.size);
        this.log(this.tag, "onRawSocketData", "data:", payload.data.toHexString());

        this.enqueueBuffer(payload.data, payload.size);
        if (this.bufferSize >= this.RAW_SOCKET_HEADER_TOTAL_BYTES) {
            var packetSize = 0;
            do {
                var contentSize = this.bufferView.getInt32(0, false);
                if (contentSize > 0) {
                    packetSize = contentSize + this.RAW_SOCKET_HEADER_INFO_BYTES;
                    if (this.bufferSize >= packetSize) {
                        var packageBuffer = this.dequeueBuffer(packetSize);
                        var message = KingProtocol.parseRawMessage(packageBuffer, packetSize);
                        this.handleMessage(message);
                    } else {
                        this.log(this.tag, "NOT A COMPLETE PACKET", "bufferSize:", this.bufferSize, "packetSize:", packetSize);
                    }
                }
            } while (this.bufferSize >= packetSize);
        }
    },

    onRawSocketMessage: function onRawSocketMessage(payload) {

        // Packet header defined & parsed in native-side

        if (!this.USE_SOCKET_MESSAGE_BINARY) return;

        this.log(this.tag, "onRawSocketMessage", "size:", payload.size);
        this.log(this.tag, "onRawSocketMessage", "data:", payload.data.toHexString());

        if (payload.size > 0) {
            var message = KingProtocol.parseRawMessage(payload.data, payload.size);
            this.log(this.tag, "onRawSocketMessage", "message: %j", message);
            this.handleMessage(message);
        }
    },

    onRawSocketMessageJson: function onRawSocketMessageJson(payload) {

        if (!this.isRawSocket()) return;

        this.handleMessage(payload);
    },

    onWebSocketMessage: function onWebSocketMessage(payload) {

        if (!this.isWebSocket()) return;

        this.handleMessage(payload);
    },

    // request base

    sendRequestRaw: function sendRequestRaw(controllerId, requestId) {
        var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        // this.log(this.tag, "sendRequestRaw", "controllerId:", controllerId, "requestId:", requestId, "payload: %j", payload);
        if (!this.isConnected()) {
            this.log(this.tag, "Socket is not connected");
            return;
        }

        if (this.isWebSocket()) {
            this.sendRequestJson(controllerId, requestId, payload);
        } else {
            var rawMessage = KingProtocol.buildRawMessage(controllerId, requestId, payload ? JSON.stringify(payload) : "{}");
            this.rawsocket.sendRaw(new Uint8Array(rawMessage), rawMessage.byteLength);
        }
    },

    sendRequestJson: function sendRequestJson(controllerId, requestId) {
        var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        // this.log(this.tag, "sendRequestJson", "controllerId:", controllerId, "requestId:", requestId, "payload: %j", payload);
        if (!this.isConnected()) {
            this.log(this.tag, "Socket is not connected");
            return;
        }

        if (this.isWebSocket()) {
            var message = KingProtocol.buildWebSocketMessage(controllerId, requestId, payload ? JSON.stringify(payload) : "{}");
            this.websocket.send(message);
        } else {
            this.rawsocket.sendJson(controllerId, requestId, payload ? JSON.stringify(payload) : "{}");
        }
    },

    // SYSTEM REQUESTS

    // login with flash var
    // options:
    // {
    //      gameId:         number
    //      flashVar:       string
    //      isMobile?:      boolean (default: true)
    //      platformId?:    KingPlatform
    //      betCoin?:       number (auto join room after switching server)
    //      solo?:          boolean (auto join room after switching server)
    // }
    sendRequestLoginWithFlashVar: function sendRequestLoginWithFlashVar(options) {
        this.log(this.tag, "sendRequestLoginWithFlashVar", "options: %j", options);

        _.defaultsDeep(options, {
            gameId: 0,
            gameLang: portalHelper.getLanguageStr() || KingProtocol.DEFAULT_GAME_LANG,
            gameZone: KingProtocol.DEFAULT_GAME_ZONE,
            flashVar: "",
            userId: portalHelper.getUserId(),
            userName: portalHelper.getUserName(),
            userPass: portalHelper.getUserPass(),
            userEmail: "",
            isMobile: KingProtocol.DEFAULT_FLAG_MOBILE,
            platformId: this.platform
        });

        // verify params
        cc.assert(options.gameId !== 0, "Invalid login params: gameId must be specified");
        cc.assert(options.flashVar !== '', "Invalid login params: flashVar must not be empty");

        var loginData = {
            uid: options.userId,
            fvar: options.flashVar,
            icmb: options.isMobile,
            gid: options.gameId,
            lang: options.gameLang,
            pass: "",
            em: "",
            pid: options.platformId
        };

        if (options.betCoin !== undefined) {
            loginData.bc = options.betCoin;
            loginData.isolo = options.solo || false;
        }

        // password should be empty if using flashVar
        var payload = {
            un: options.userId,
            pw: "",
            zn: options.gameZone,
            ld: loginData
        };

        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.LOGIN, payload);
        return true;
    },

    // login with username/password
    // options:
    // {
    //      gameId:         number
    //      gameLang:       string (default: 'en')
    //      userId:         string
    //      userName:       string
    //      userPass:       string
    //      userEmail:      string
    //      isMobile?:      boolean (default: false)
    //      platformId?:    KingPlatform
    //      betCoin?:       number (auto join room after switching server)
    //      solo?:          boolean (auto join room after switching server)
    // }
    sendRequestLoginWithPassword: function sendRequestLoginWithPassword(options) {
        this.log(this.tag, "sendRequestLoginWithPassword", "options: %j", options);

        _.defaultsDeep(options, {
            gameId: 0,
            gameLang: portalHelper.getLanguageStr() || KingProtocol.DEFAULT_GAME_LANG,
            gameZone: KingProtocol.DEFAULT_GAME_ZONE,
            flashVar: "",
            userId: portalHelper.getUserId(),
            userName: portalHelper.getUserName(),
            userPass: portalHelper.getUserPass(),
            userEmail: "",
            isMobile: KingProtocol.DEFAULT_FLAG_MOBILE,
            platformId: this.platform
        });

        // verify params
        cc.assert(options.gameId !== 0, "Invalid login params: gameId must be specified");
        cc.assert(options.userId !== '', "Invalid login params: userId must not be empty");
        cc.assert(options.userPass !== '', "Invalid login params: userPass must not be empty");

        var loginData = {
            uid: options.userId,
            fvar: "",
            icmb: options.isMobile,
            gid: options.gameId,
            lang: options.gameLang,
            pass: options.userPass,
            em: options.userEmail,
            pid: options.platformId
        };

        if (options.betCoin !== undefined) {
            loginData.bc = options.betCoin;
            loginData.isolo = options.solo || false;
        }

        var payload = {
            un: options.userId,
            pw: options.userPass,
            zn: options.gameZone,
            ld: loginData
        };

        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.LOGIN, payload);
        return true;
    },

    sendRequestLogout: function sendRequestLogout() {
        this.log(this.tag, "sendRequestLogout");
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.LOGOUT);
    },

    sendRequestJoinLobby: function sendRequestJoinLobby(group) {
        this.log(this.tag, "sendRequestJoinLobby", "group:", group);
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.JOIN_LOBBY, {
            gr: group
        });
    },

    sendRequestJoinRoom: function sendRequestJoinRoom(roomId, password, asViewer) {
        this.log(this.tag, "sendRequestJoinRoom", "roomId:", roomId, "password:", password, "asViewer:", asViewer);
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.JOIN_ROOM, {
            i: roomId,
            p: password,
            sp: asViewer
        });
    },

    sendRequestGetLobbyRoomList: function sendRequestGetLobbyRoomList() {
        this.log(this.tag, "sendRequestGetLobbyRoomList");
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.GET_LOBBY_ROOM_LIST);
    },

    sendRequestGetLobbyRoomGroupList: function sendRequestGetLobbyRoomGroupList() {
        this.log(this.tag, "sendRequestGetLobbyRoomGroupList");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.GET_ROOM_GROUP, {});
    },

    sendRequestCreateRoom: function sendRequestCreateRoom(roomName, password, extensionName, extensionClass, maxUsers, maxSpectators, group, roomVariables) {
        this.log(this.tag, "sendRequestCreateRoom", "roomName:", roomName, "password:", password, "extensionName:", extensionName, "extensionClass:", extensionClass, "maxUsers:", maxUsers, "maxSpectators:", maxSpectators, "group:", group, "roomVariables:", roomVariables);
        var variables = roomVariables.map(function (item) {
            return {
                n: item.name,
                t: item.type,
                v: item.value
            };
        });
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.CREATE_ROOM, {
            n: roomName,
            p: password,
            extn: extensionName,
            extc: extensionClass,
            mu: maxUsers,
            ms: maxSpectators,
            g: group,
            rv: variables
        });
    },

    sendRequestLeaveRoom: function sendRequestLeaveRoom(roomId) {
        this.log(this.tag, "sendRequestLeaveRoom", "roomId:", roomId);
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.LEAVE_ROOM, {
            r: roomId
        });
    },

    sendRequestPlayerToSpectator: function sendRequestPlayerToSpectator() {
        this.log(this.tag, "sendRequestPlayerToSpectator");
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.PLAYER_TO_SPECTATOR);
    },

    sendRequestSpectatorToPlayer: function sendRequestSpectatorToPlayer(position) {
        this.log(this.tag, "sendRequestSpectatorToPlayer", "position:", position);
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.SPECTATOR_TO_PLAYER, {
            p: position
        });
    },

    sendRequestPrivateMessage: function sendRequestPrivateMessage(message, receiveUser) {
        this.log(this.tag, "sendRequestPrivateMessage", "message:", message, "receiveUser:", receiveUser);
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.SEND_PRIVATE_MESSAGE, {
            m: message,
            rc: receiveUser
        });
    },

    sendRequestPublicMessage: function sendRequestPublicMessage(message, roomId) {
        this.log(this.tag, "sendRequestPublicMessage", "message:", message, "roomId:", roomId);
        this.sendRequestJson(KingProtocol.SYSTEM.CID, KingProtocol.SYSTEM.REQUEST.SEND_PUBLIC_MESSAGE, {
            m: message,
            r: roomId
        });
    },

    // EXTENSION REQUESTS

    sendExtensionRequest: function sendExtensionRequest(extCommand, extContent) {
        this.log(this.tag, "sendExtensionRequest", "extCommand:", extCommand, "extContent: %j", extContent);
        this.sendRequestJson(KingProtocol.EXTENSION.CID, KingProtocol.EXTENSION.REQUEST.EXTENSION, {
            c: extCommand,
            p: extContent
        });
    },

    sendGameChatRequest: function sendGameChatRequest(message) {
        var userId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -2;

        this.log(this.tag, "sendGameChatRequest", "message:", message, "userId:", userId);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.SEND_CHAT, {
            uid: userId,
            mess: message
        });
    },

    sendGameChatEmoticonRequest: function sendGameChatEmoticonRequest(emoticon) {
        var userId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -2;

        this.log(this.tag, "sendGameChatPrivateEmoticonRequest", "emoticon:", emoticon, "userId:", userId);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.SEND_EMOTICON, {
            uid: userId,
            emn: emoticon
        });
    },

    sendGamePingRequest: function sendGamePingRequest() {
        this.log(this.tag, "sendGamePingRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.PING, {});
    },

    sendGameChangeLaguageRequest: function sendGameChangeLaguageRequest(language) {
        this.log(this.tag, "sendGameChangeLaguageRequest", "language:", language);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.CHANGE_LANG, {
            lang: language
        });
    },

    sendGameActionRequest: function sendGameActionRequest(payload) {
        this.log(this.tag, "sendGameActionRequest", "payload: %j", payload);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.GAME_ACTION_REQUEST, payload);
    },

    sendGameQuickPlayRequest: function sendGameQuickPlayRequest() {
        this.log(this.tag, "sendGameQuickPlayRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.QUICK_PLAY, {});
    },

    sendGameGetAllUserLobbyRequest: function sendGameGetAllUserLobbyRequest() {
        this.log(this.tag, "sendGameGetAllUserLobbyRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.GET_ALL_USER_LOBBY, {});
    },

    sendGameCreateRoomRequest: function sendGameCreateRoomRequest(betCoin, rules, timeOut, maxPlayer, solo) {
        this.log(this.tag, "sendGameCreateRoomRequest", "betCoin:", betCoin, "rules:", rules, "timeOut:", timeOut, "maxPlayer:", maxPlayer, "solo:", solo);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.CREATE_ROOM, {
            bc: betCoin,
            rules: rules,
            to: timeOut,
            cmp: maxPlayer,
            isolo: solo
        });
    },

    sendGameJoinRoomRequest: function sendGameJoinRoomRequest(roomId, roomSeat) {
        this.log(this.tag, "sendGameJoinRoomRequest", "roomId:", roomId, "roomSeat:", roomSeat);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.JOIN_ROOM, {
            rid: roomId,
            pos: roomSeat
        });
    },

    sendGameJoinRoomWithBetRequest: function sendGameJoinRoomWithBetRequest(betCoin, solo) {
        this.log(this.tag, "sendRequestJoinRoom", "betCoin:", betCoin, "solo:", solo);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.JOIN_ROOM_WITH_BET, {
            bc: betCoin,
            isolo: solo
        });
    },

    sendGameSitRoomRequest: function sendGameSitRoomRequest(position) {
        this.log(this.tag, "sendGameSitRoomRequest", "position:", position);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.SIT_ROOM, {
            pos: position
        });
    },

    sendGameInviteRequest: function sendGameInviteRequest(betCoin, rules, timeOut, maxPlayer, solo, position, userId, emotionName, levelNumber) {
        this.log(this.tag, "sendGameInviteRequest", "betCoin:", betCoin, "rules:", rules, "timeOut:", timeOut, "maxPlayer:", maxPlayer, "solo:", solo, "position:", position);
        this.log(this.tag, "sendGameInviteRequest", "userId:", userId, "emotionName:", emotionName, "levelNumber:", levelNumber);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.INVITE, {
            bc: betCoin,
            rules: rules,
            to: timeOut,
            cmp: maxPlayer,
            isolo: solo,
            pos: position,
            uid: userId,
            emn: emotionName,
            ln: levelNumber
        });
    },

    sendGameConfirmInviteRequest: function sendGameConfirmInviteRequest(userId, position, betCoin, timeOut, confirmStatus, rules, isSolo) {
        this.log(this.tag, "sendGameConfirmInviteRequest", "userId:", userId, "confirmStatus:", confirmStatus);
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.CONFIRM_INVITATION, {
            uid: userId,
            pos: position,
            bc: betCoin,
            to: timeOut,
            cft: confirmStatus,
            rules: rules,
            isolo: isSolo
        });
    },

    sendGameStartRequest: function sendGameStartRequest() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.log(this.tag, "sendGameStartRequest", "options: %j", options);

        var params = {};
        if (options) {
            params.bc = options.betCoin;
            params.isGopGa = options.isGopGa;
            params.isolo = options.solo;
            params.rules = options.rules;
            params.to = options.timeOut;
        }

        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.START_GAME_REQUEST, params);
    },

    sendGameStartConfirmRequest: function sendGameStartConfirmRequest() {
        this.log(this.tag, "sendGameStartConfirmRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.START_GAME_CONFIRM, {});
    },

    sendGameEndMatchRequest: function sendGameEndMatchRequest() {
        this.log(this.tag, "sendGameEndMatchRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.END_MATCH, {});
    },

    sendGameTourRankDataRequest: function sendGameTourRankDataRequest() {
        this.log(this.tag, "sendGameTourRankDataRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.TOUR_RANK_DATA, {});
    },

    sendGameTourServerInfoRequest: function sendGameTourServerInfoRequest() {
        this.log(this.tag, "sendGameTourServerInfoRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.TOUR_SERVER_INFO, {});
    },

    sendGetJackpotWinRateRequest: function sendGetJackpotWinRateRequest() {
        this.log(this.tag, "sendGetJackpotWinRateRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.JACKPOT_WIN_RATE, {});
    },

    sendGetTopWinJackpotInfoRequest: function sendGetTopWinJackpotInfoRequest() {
        this.log(this.tag, "sendGetTopWinJackpotInfoRequest");
        this.sendExtensionRequest(KingProtocol.EXTENSION.COMMAND.JACKPOT_TOP_WIN_INFO, {});
    },

    // response handlers

    handleMessage: function handleMessage(payload) {
        // this.log(this.tag, "handleMessage: %j", payload);

        var jsonObject = null;
        if (payload.json) {
            try {
                jsonObject = JSON.parse(payload.json);
            } catch (ex) {
                this.log(this.tag, "Error parsing json payload: %j", ex);
            }
        }

        if (jsonObject && jsonObject.ec !== undefined) {
            this.handleResponseError(payload.controllerId, payload.requestId, jsonObject);
            return;
        }

        switch (payload.controllerId) {
            case KingProtocol.SYSTEM.CID:
                this.handleSystemMessage(payload.requestId, jsonObject);
                break;
            case KingProtocol.EXTENSION.CID:
                if (jsonObject) this.handleExtensionMessage(payload.requestId, jsonObject);
                break;
            default:
                this.handleResponseError(payload.controllerId, payload.requestId, jsonObject);
                break;
        }
    },

    handleSystemMessage: function handleSystemMessage(requestId, payload) {
        this.log(this.tag, "handleSystemMessage", "requestId:", requestId, "->", KingProtocol.getSystemResponseName(requestId));
        this.log(this.tag, "handleSystemMessage", "payload: %j", payload);
        switch (requestId) {
            case KingProtocol.SYSTEM.RESPONSE.LOGIN:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_LOGIN_SUCCESS, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.LOGOUT:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_LOGOUT, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.RECEIVED_LOBBY_ROOM_LIST:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_RECEIVED_LOBBY_ROOM_LIST, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.ROOM_ADDED:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_ROOM_ADDED, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.ROOM_REMOVED:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_ROOM_REMOVED, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.JOIN_ROOM_SUCCESS:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_JOIN_ROOM_SUCCESS, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.USER_ENTER_ROOM:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_USER_ENTER_ROOM, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.USER_LEAVE_ROOM:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_USER_LEAVE_ROOM, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.PLAYER_TO_SPECTATOR:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_PLAYER_TO_SPECTATOR, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.SPECTATOR_TO_PLAYER:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_SPECTATOR_TO_PLAYER, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.ROOM_OWNER_CHANGE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_ROOM_OWNER_CHANGED, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.RECEIVED_PRIVATE_MESSAGE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_RECEIVED_PRIVATE_MSG, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.RECEIVED_PUBLIC_MESSAGE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_RECEIVED_PUBLIC_MSG, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.USER_LOST_EXIT_LOGOUT:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_USER_LOST_EXIT_LOGOUT, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.LOBBY_UPDATE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_LOBBY_UPDATE, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.USER_VARIABLES_UPDATE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_USER_VARIABLES_UPDATE, payload);
                break;
            case KingProtocol.SYSTEM.RESPONSE.ROOM_VARIABLES_UPDATE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.SYSTEM_EVENTS.ON_ROOM_VARIABLES_UPDATE, payload);
                break;
            default:
                this.log(this.tag, "Unhandled system response", "requestId:", requestId);
                break;
        }
    },

    handleExtensionMessage: function handleExtensionMessage(requestId, payload) {
        // this.log(this.tag, "handleExtensionMessage", "requestId:", requestId, "payload: %j", payload);
        switch (requestId) {
            case KingProtocol.EXTENSION.RESPONSE.EXTENSION:
                this.handleExtensionCommand(payload.c, payload.p, payload.r);
                break;
            default:
                this.log(this.tag, "Unhandled extension response", "requestId:", requestId);
                break;
        }
    },

    handleExtensionCommand: function handleExtensionCommand(command, content, roomId) {
        this.log(this.tag, "handleExtensionCommand", "command:", command, "->", KingProtocol.getExtensionCommandName(command));
        // this.log(this.tag, "handleExtensionCommand", "content: %j", content);
        switch (command) {
            case KingProtocol.EXTENSION.COMMAND.SEND_ERROR:
                this.dispatchEvent(this.LISTENER_TYPE.GAME, this.GAME_EVENTS.ON_SEND_ERROR, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.BROADCAST_MESSAGE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_BROADCAST_MSG, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.USER_LOGIN_OTHER_SESSION:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_USER_LOGIN_OTHER_SESSION, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.JACKPOT_INFO:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_JACKPOT_INFO, content);
                    break;
                }
            case KingProtocol.EXTENSION.COMMAND.JACKPOT_INFO_GAME:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_JACKPOT_INFO, content);
                    break;
                }
            case KingProtocol.EXTENSION.COMMAND.JACKPOT_CONFIG:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_JACKPOT_CONFIG, content);
                    break;
                }
            case KingProtocol.EXTENSION.COMMAND.JACKPOT_DATA:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_JACKPOT_DATA, content);
                    break;
                }
            case KingProtocol.EXTENSION.COMMAND.JACKPOT_WIN:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_JACKPOT_WIN, content);
                    break;
                }
            case KingProtocol.EXTENSION.COMMAND.JACKPOT_WIN_RATE:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_JACKPOT_WIN_RATE, content);
                    break;
                }
            case KingProtocol.EXTENSION.COMMAND.JACKPOT_TOP_WIN_INFO:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_JACKPO_TOP_WIN_INFO, content);
                    break;
                }
            case KingProtocol.EXTENSION.COMMAND.WIN_COMBO:
                {
                    this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_WIN_COMBO, content);
                    break;
                }

            case KingProtocol.EXTENSION.COMMAND.GAME_DATA:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_DATA, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.RECONNECT_DATA:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_RECONNECT_DATA, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.USER_LEVEL_TIME_LINE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_USER_LEVEL_TIMELINE, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.USER_LEVEL_UP:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_USER_LEVEL_UP, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.RECEIVED_CHAT:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_RECEIVED_CHAT, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.NOTICED_CHAT:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_NOTICED_CHAT, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.PING:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_PING, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.MAINTAIN:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_MAINTAIN, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.GAME_ACTION_RESPONSE:
                this.dispatchEvent(this.LISTENER_TYPE.GAME, this.GAME_EVENTS.ON_GAME_ACTION, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.QUICK_PLAY:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_QUICKPLAY, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.LIST_GROUP_INFO:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_LIST_GROUP_INFO, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.GET_ALL_USER_LOBBY:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_LIST_USER_LOBBY, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.UPDATE_ROOM_DATA:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_UPDATE_ROOM_DATA, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.UPDATE_ROOM_CONFIG:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_UPDATE_ROOM_CONFIG, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.UPDATE_MAX_PLAYER:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_UPDATE_MAX_PLAYER, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.INVITE:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_INVITE_RECEIVED, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.CONFIRM_INVITATION:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_INVITE_CONFIRMED, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.UPDATE_MATCH_ID:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_UPDATE_MATCH_ID, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.CHANGED_DEALER_USER:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_CHANGED_DEALER_USER, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.START_GAME_DATA:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_START_DATA, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.START_GAME_NOTIFY:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_START_NOTIFY, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.START_GAME_CONFIRM:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_START_CONFIRM, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.MATCH_RESULT_INFO:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_MATCH_RESULT_INFO, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.RECEIVED_EMOTICON:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_RECEIVED_EMOTICON, content);
                break;

            // new commands

            case KingProtocol.EXTENSION.COMMAND.GET_ROOM_GROUP:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_RECEIVED_LOBBY_ROOM_GROUP_LIST, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.JOIN_ROOM_TARGET_SEVER:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_ROOM_SERVER_INFO, content);
                break;

            case KingProtocol.EXTENSION.COMMAND.TOUR_RANK_DATA:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_TOUR_RANK_DATA, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.TOUR_ROUND_INFO:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_TOUR_ROUND_INFO, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.TOUR_ROUND_END_INFO:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_TOUR_ROUND_END_INFO, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.TOUR_SERVER_INFO:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_TOUR_SERVER_INFO, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.TOUR_TIME_SPEND_PING:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_TOUR_TIME_SPEND_PING, content);
                break;
            case KingProtocol.EXTENSION.COMMAND.TOUR_TIME_SPEND_RESULT:
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, this.GAME_EVENTS.ON_GAME_TOUR_TIME_SPEND_RESULT, content);
                break;

            default:
                this.log(this.tag, "Unhandled extension response", "command:", command, "content: %j", content, "roomId:", roomId);
                break;
        }
    },

    handleResponseError: function handleResponseError(controllerId, requestId, payload) {
        this.log(this.tag, "handleResponseError", "controllerId:", controllerId, "requestId:", requestId, "payload: %j", payload);
        this.log(this.tag, "handleResponseError", "errorCode:", payload.ec, "errorMessage:", payload.ep);
    },

    processChatContent: function processChatContent(content) {
        if (content.suc === 1 && content.cc && typeof content.cc === 'string') content.cc = UTF8.decode(content.cc);
        return content;
    }
});

KingController.instance = null;
KingController.getInstance = function () {
    if (!KingController.instance) KingController.instance = new KingController();
    return KingController.instance;
};

KingController.destroyInstance = function () {
    if (KingController.instance) delete KingController.instance;
    KingController.instance = null;
};

// Global

var KingGame = KingController.getInstance();