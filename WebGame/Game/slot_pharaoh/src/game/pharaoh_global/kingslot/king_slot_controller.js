Module.define(function (require) {
    "use strict";
    /** @enum {string} */
    const KingEvents = {
        ON_SEND_ERROR: "onGameSendError",
        ON_SEND_MESSAGE: "onGameSendMessage",

        ON_BROADCAST_MSG: "onGameBroadcastMessage",

        ON_USER_LOGIN_OTHER_SESSION: "onGameUserLoginOtherSession",
        ON_USER_UPDATE_COIN: "onUserUpdateCoin",
        ON_USER_UPDATE_EXP: "onUserUpdateExp",
        ON_USER_UPDATE_NEXT_EXP: "onUserUpdateNextExp",
        ON_USER_UPDATE_LEVEL: "onUserUpdateLevel",
        ON_GET_USER_INFO: "onGetUserInfo",

        ON_JACKPOT_INFO: "onGameJackpotInfo",
        ON_JACKPOT_CONFIG: "onGameJackpotConfig",
        ON_JACKPOT_DATA: "onGameJackpotData",

        ON_JACKPOT_WIN: "onGameJackpotWin",
        ON_JACKPOT_WIN_RATE: "onGameJackpotWinRate",
        ON_JACKPOT_TOP_WIN_INFO: "onGameJackpotTopWinInfo",

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

        ON_RECEIVED_LOBBY_ROOM_GROUP_LIST: "onReceivedLobbyRoomGroupList",

        ON_MATCH_DEAL_CARDS: "onMatchDealCards",
        ON_MATCH_TURN_CHANGED: "onMatchTurnChanged",
        ON_MATCH_PLAY_CARDS: "onMatchPlayCards",
        ON_MATCH_PLAY_LAST_CARDS: "onMatchPlayLastCards",
        ON_MATCH_BLOCK_TWO: "onMatchBlockTwo",
        ON_MATCH_BLOCK_TWO_UPDATE_COIN: "onMatchBlockTwoUpdateCoin",
        ON_MATCH_PLAY_PING: "onMatchPlayPing",
        ON_MATCH_SKIP_TURN: "onMatchSkipTurn",
        ON_MATCH_CARD_INFO: "onMatchCardInfo",
        ON_MATCH_CARD_UPDATE: "onMatchCardUpdate",
        ON_MATCH_WIN_STRAIGHT: "onMatchWinStraight",
        ON_MATCH_WIN_INFO: "onMatchWinInfo",
    };

    const KingSlotController = cc.class("KingSlotController", BaseController, {
        PING_ENABLED: false,

        PING_RANDOM_MIN: 20,
        PING_RANDOM_MAX: 150,

        PING_INTERVAL: 60000,
        PING_LEVELS: [500, 300, 200, 100],

        LISTENER_TYPE: {
            MAIN: 0,
            GAME: 1
        },

        ctor: function () {
            this._super();
            this.initEmitter(this.LISTENER_TYPE);

            this.platform = (cc.sys.os === cc.sys.OS_IOS) ? KingPlatform.IOS : KingPlatform.ANDROID;

            this.connected = false;
            this.connector = null;
            this.isDestroy = false;

            this.pingValue = 0;
            this.pingSentTime = 0;
            this.pingChangeNextTime = 0;

            this.isPingAlive = true;
            this.pingEnabled = this.PING_ENABLED;

            this.userManager = undefined;
            this.loginManager = undefined;
        },

        // connection

        isConnected: function () {
            return this.connected && this.connector && this.connector.isConnected();
        },

        setSocketType: function (value) {
            this.socketType = value;
        },

        setServerHost: function (value) {
            this.serverHost = value;
        },

        setServerPort: function (value) {
            this.serverPort = value;
        },

        connect: function () {
            this.log("connect", "host:", this.serverHost, "port:", this.serverPort, "socketType:", this.socketType);

            if (!this.connector) {
                this.connector = new KingConnector();
                this.connector.setHandler(this);
            }

            return this.connector.connect(this.serverHost, this.serverPort, "main", this.socketType);
        },

        close: function () {
            if (!this.connector)
                return;

            this.connector.close();
        },

        startPingPong: function () {

            if (this.pingEnabled === false)
                return;

            this.isPingAlive = true;

            if (!this.updatePing) {
                this.updatePing = setInterval(() => {
                    if (this.isPingAlive) {
                        this.sendPing();
                    }
                    else {
                        this.log(this.tag, "PINGPONG - Connection maybe dead");
                    }
                }, this.PING_INTERVAL);
            }
        },

        stopPingPong: function () {

            if (this.pingEnabled === false)
                return;

            this.isPingAlive = false;

            if (this.updatePing) {
                clearInterval(this.updatePing);
                delete this.updatePing;
            }
        },

        getPing: function () {

            if (this.pingEnabled === false) {
                if (Date.now() > this.pingChangeNextTime) {
                    this.pingValue = CoreUtils.randomMinMax(this.PING_RANDOM_MIN, this.PING_RANDOM_MAX);
                    this.pingChangeNextTime = Date.now() + CoreUtils.randomMinMax(this.PING_INTERVAL, this.PING_INTERVAL * 2);
                }
            }

            return this.pingValue;
        },

        getPingLevel: function () {
            let i = 0;
            while (i < this.PING_LEVELS.length && this.getPing() < this.PING_LEVELS[i])
                i++;
            return (i >= this.PING_LEVELS.length) ? (this.PING_LEVELS.length - 1) : i;
        },

        sendPing: function () {
            this.isPingAlive = false;
            this.pingSentTime = Date.now();
            this.sendGamePingRequest();
        },

        receivePong: function () {
            this.isPingAlive = true;
            this.pingValue = Date.now() - this.pingSentTime;
        },

        closeConnection: function () {
            this.stopPingPong();

            this.connected = false;

            if (this.connector) {
                this.connector.close();
                this.connector = undefined;
            }
        },

        // manage controllers

        setLoginManager: function (loginManager) {
            if (this.loginManager) {
                this.removeListener(this.LISTENER_TYPE.MAIN, this.loginManager.tag, this.loginManager);
            }

            this.loginManager = loginManager;
            this.addListener(this.LISTENER_TYPE.MAIN, this.loginManager.tag, this.loginManager);
        },

        setUserManager: function (userManager) {
            this.userManager = userManager;
        },

        getLoginManager: function () {
            return this.loginManager;
        },

        getUserManager: function () {
            return this.userManager;
        },

        // Commands

        sendGamePingRequest: function () {
            this.sendMessageEmpty(KingSlotCommands.PING_MAIN_ID, KingSlotCommands.PING_ASSISTANT_ID);
        },

        sendGetUserInfo: function (userId) {
            let payload = {
                userId: userId
            };

            this.setMessageSchema(
                KingSlotCommands.MAIN_ID,
                KingSlotCommands.GET_USER_INFO_REQUEST,
                KingSlotSchema.GetUserInfoRequest,
                payload
            );
        },

        sendChatText: function (message) {
            this.mainController.sendMessage(
                KingSlotCommands.MAIN_ID,
                KingSlotCommands.USER_CHAT_REQUEST,
                KingSlotSchema.UserChatRequest,
                {
                    message: message
                }
            );
        },

        // send message

        sendMessage: function (mainId, assistantId, schema, payload) {
            if (!this.isConnected()) {
                this.log("sendMessage", "Not connected to server");
                return false;
            }

            let header = { mainId: mainId, assistantId: assistantId };
            this.log("sendMessage: %j", header);

            let headerSize = KingSlotSchema.Header.getSize();
            let bufferSize = headerSize + schema.getSize(payload);
            let buffer = new ArrayBuffer(bufferSize);

            Schema.encode(KingSlotSchema.Header, header, 0, true, buffer);
            Schema.encode(schema, payload, headerSize, true, buffer);

            return this.connector.send(buffer);
        },

        sendMessageEmpty: function (mainId, assistantId) {
            if (!this.isConnected()) {
                this.log("sendMessageEmpty", "Not connected to server");
                return false;
            }

            let header = { mainId: mainId, assistantId: assistantId };
            this.log("sendMessageEmpty: %j", header);

            let buffer = Schema.encode(KingSlotSchema.Header, header);

            this.log("sendMessageEmpty", "payloadSize", buffer.byteLength);
            // this.log("sendMessageEmpty", "payloadBytes", buffer.toHexString());

            return this.connector.send(buffer);
        },

        // socket events

        onSocketConnected: function (payload) {
            let connected = payload.connect;
            let status = payload.status;

            this.log("onSocketConnected", "connected:", connected, "status:", status);

            this.connected = true;
            this.startPingPong();

            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingConnector.Events.ON_CONNECTED, payload);
        },

        onSocketDisconnected: function (payload) {
            let connected = payload.connect;
            let status = payload.status;

            this.log("onSocketDisconnected", "connected:", connected, "status:", status);

            this.connected = false;
            this.stopPingPong();

            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingConnector.Events.ON_DISCONNECTED, payload);
        },

        onSocketMessage: function (payload) {
            let header = Schema.decode(KingSlotSchema.Header, payload);
            let content = payload.slice(KingSlotSchema.Header.getSize());

            let mainId = header.mainId;
            let assistantId = header.assistantId;

            this.log("onSocketMessage", "mainId:", mainId);
            this.log("onSocketMessage", "assistantId:", assistantId);
            this.log("onSocketMessage", "contentSize:", payload.byteLength - KingSlotSchema.Header.getSize());
            //this.log("onSocketMessage", "contentBytes:", payload.slice(KingMainSchema.Header.getSize()).toHexString());

            let isPongMessage = mainId === KingSlotCommands.PONG_MAIN_ID && assistantId === KingSlotCommands.PONG_ASSISTANT_ID;
            if (isPongMessage) {
                this.receivePong();
            } else if (mainId === KingSlotCommands.MAIN_ID) {
                switch (assistantId) {
                    case KingSlotCommands.UPDATE_COIN:
                        this.handleUpdateCoin(content);
                        break;

                    case KingSlotCommands.UPDATE_EXP:
                        this.handleUpdateExp(content);
                        break;

                    case KingSlotCommands.UPDATE_NEXT_EXP:
                        this.handleUpdateNextExp(content);
                        break;

                    case KingSlotCommands.UPDATE_LEVEL:
                        this.handleUpdateLevel(content);
                        break;

                    case KingSlotCommands.GET_USER_INFO_RESPONSE:
                        this.handleGetUserInfoResponse(content);
                        break;

                    case KingSlotCommands.WIN_JACKPOT:
                        this.handleWinJackpot(content);
                        break;

                    case KingSlotCommands.JACKPOT_INFO:
                        this.handleJackpotInfo(content);
                        break;

                    case KingSlotCommands.USER_CHAT_RESPONSE:
                        this.handleUserChatResponse(content);
                        break;

                    case KingSlotCommands.BROADCAST_MESSAGE:
                        this.handleBroadcastMessage(content);
                        break;

                    case KingSlotCommands.GAME_ERROR_MESSAGE:
                        this.handleGameErrorMessage(content);
                        break;
                }
            }

            let message = {
                getHeader: () => header,
                getContent: () => content,

                getMainId: () => mainId,
                getAssistantId: () => assistantId,
            };
            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingConnector.Events.ON_MESSAGE, message);
        },

        // Handle messages

        handleUpdateCoin: function (payload) {
            let updateInfo = Schema.decode(KingSlotSchema.UpdateCoin, payload);
            //cc.log("handleUpdateCoin %j", updateInfo);
            if (updateInfo.userId === this.userManager.id) {
                //cc.log("handleUpdateCoin %j", updateInfo.userId === this.userManager.id);
                this.coin = updateInfo.coin;
                this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_USER_UPDATE_COIN, updateInfo);
            }
        },

        handleUpdateExp: function (payload) {
            let updateInfo = Schema.decode(KingSlotSchema.UpdateExp, payload);
            if (updateInfo.userId === this.userManager.id) {
                this.exp = updateInfo.exp;
            }
            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_USER_UPDATE_EXP, updateInfo);
        },

        handleUpdateNextExp: function (payload) {
            let updateInfo = Schema.decode(KingSlotSchema.UpdateNextExp, payload);
            if (updateInfo.userId === this.userManager.id) {
                this.nextExp = updateInfo.nextExp;
            }
            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_USER_UPDATE_NEXT_EXP, updateInfo);
        },

        handleUpdateLevel: function (payload) {
            let updateInfo = Schema.decode(KingSlotSchema.UpdateLevel, payload);
            //cc.log("handleUpdateLevel %j", updateInfo);
            this.userManager.level = updateInfo.level;
            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_USER_UPDATE_LEVEL, updateInfo);
        },

        handleGetUserInfoResponse: function (payload) {
            let userInfo = Schema.decode(KingSlotSchema.GetUserInfoResponse, payload);
            userInfo.avatar = userInfo.avatar;// KingProtocol.getMappedAvatar(userInfo.avatar);
            if (userInfo.userId === this.userManager.id) {
                this.userManager.level = userInfo.level;
            }

            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_GET_USER_INFO, userInfo);
        },

        handleWinJackpot: function (payload) {
            let data = Schema.decode(KingSlotSchema.WinJackpot, payload);
            this.log("handleWinJackpot: %j", data);
            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_JACKPOT_WIN, { coin: data.winCoin });
        },

        handleJackpotInfo: function (payload) {
            let data = Schema.decode(KingSlotSchema.JackpotInfo, payload);
            // this.log("handleJackpotInfo: %j", data);

            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_JACKPOT_DATA, {
                jackpotData: [{ coin: data.rewards, betCoin: data.configs }]
            });
        },

        handleUserChatResponse: function (payload) {
            let data = Schema.decode(KingSlotSchema.UserChatResponse, payload);
            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_RECEIVED_CHAT, data);
        },

        handleBroadcastMessage: function (payload) {
            let data = Schema.decode(KingSlotSchema.BroadcastMessage, payload);
            this.dispatchEvent(this.LISTENER_TYPE.MAIN, KingEvents.ON_BROADCAST_MSG, {
                broadcastData: [{
                    repeatTime: 1,//data.repeatTime,
                    message: data.message
                }]
            });
        },

        handleGameErrorMessage: function (payload) {
            let data = Schema.decode(KingSlotSchema.GameErrorMessage, payload);
            cc.log("================== handleGameErrorMessage %j", data);

            let errorCode = data.errorCode || 0;

            if (errorCode === 0) {
                this.dispatchEvent(this.LISTENER_TYPE.GAME, KingEvents.ON_SEND_MESSAGE, {
                    errorCode: errorCode,
                    message: data.message
                });
            } else {
                this.dispatchEvent(this.LISTENER_TYPE.GAME, KingEvents.ON_SEND_ERROR, {
                    errorCode: errorCode,
                    message: data.message
                });
            }
        },
    });

    window.KingSlotController = KingSlotController;
    return KingSlotController;
});