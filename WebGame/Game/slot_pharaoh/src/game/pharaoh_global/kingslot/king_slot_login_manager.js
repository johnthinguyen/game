Module.define(function (require) {
    "use strict";

    /** @enum {number} */
    const KingLoginResult = {
        SUCCESS: 1,
        TIMEOUT: 2,
        INVALID: 3,
        JOIN_OTHER_SERVER: 4,
        RECONNECT: 5,
        RESULT_PLAYING_OTHER_GAME: 8
    };

    /** @enum {number} */
    const KingErrorCode = {
        LOGIN_SUCCESS: 1001,
        LOGIN_TIMEOUT: 1002,
        LOGIN_INVALID: 1003,
        LOGIN_JOIN_OTHER_SERVER: 1004,
        LOGIN_RECONNECT: 1005,
        LOGIN_OTHER_SESSION: 1006,
        LOGIN_KICKED_BY_SERVER: 1007,
        LOGIN_OTHER_GAME: 1008,

        JOIN_ROOM_UNKNOWN: 2000,
        JOIN_ROOM_SIT_DOWN: 2001, // Vào bàn và ngồi vào ghế
        JOIN_ROOM_JOINED_OTHER_TABLE: 2002, // Tài khoản đang trong bàn khác
        JOIN_ROOM_BANNED_ACCOUNT: 2003, // Tài khoản bị ban
        JOIN_ROOM_VIEWER: 2004, // Vào bàn xem
        JOIN_ROOM_NOT_ENOUGH_COIN: 2005, // User không đủ xu chơi
        JOIN_ROOM_TABLE_NOT_EXISTS: 2006, // Bàn không tồn tại
        JOIN_ROOM_NOT_JOINED_TABLE: 2007, // User đang không có trong bàn
        JOIN_ROOM_TABLE_IS_FULL: 2008, // Bàn đã đầy
        JOIN_ROOM_SEAT_NOT_EMPTY: 2009, // Vị trí muốn ngồi không còn trống

        CREATE_ROOM_SUCCESS: 3001,
        CREATE_ROOM_ARGS_NOT_VALID: 3002,
        CREATE_ROOM_NOT_ENOUGH_COIN: 3003,

        TOUR_NOT_ENOUGH_COIN: 7001,
        TOUR_KICKED_BY_SERVER: 7002,
    };

    const KingSlotLoginManager = cc.class("KingSlotLoginManager", BaseController, {
        MAX_RETRY_DEFAULT: 0,
        MAX_RETRY_FOREVER: -1,

        DELAY_RETRY_DEFAULT: 2.0,
        FETCH_API_TIMEOUT: 10000,

        RETRY_AFTER_KICKED_DEFAULT: false,

        DEFAULT_SOCKET_TYPE: KingSocketType.WS,

        ctor: function (mainController) {
            this._super();
            this.initEmitter();

            this.state = KingLoginState.NONE;

            this.isConnectionAlive = false;

            this.loginOptions = {};

            this.retryAuto = false;
            this.retryAfterKicked = this.RETRY_AFTER_KICKED_DEFAULT;

            this.retry = 0;
            this.retryTimeOut = null;

            this.retryMax = this.MAX_RETRY_DEFAULT;
            this.retryDelay = this.DELAY_RETRY_DEFAULT;

            this.mainController = mainController;
            this.mainController.setLoginManager(this);
        },

        clear: function () {

            this.clearRetryLogin();
            
            this.userManager = null;

            this.retryTimeOut = null;
            this.loginOptions = {};
        },

        isReady: function () {
            return this.state === KingLoginState.LOGIN_SUCCESS;
        },

        isKicked: function () {
            return this.state === KingLoginState.LOGIN_KICKED;
        },

        getState: function () {
            return this.state;
        },

        setAutoRetry: function (value) {
            this.retryAuto = value;
        },

        setMaxRetry: function (value) {
            this.retryMax = value;
        },

        setRetryDelay: function (value) {
            this.retryDelay = value;
        },

        setRetryAfterKicked: function (value) {
            this.retryAfterKicked = value;
        },

        setUserManager: function (userManager) {
            this.userManager = userManager;
        },

        getUserManager: function () {
            return this.userManager;
        },

        connect: function () {
            this.log(this.tag, "connect", "options: %j", this.loginOptions);

            // event khi internet connection thay đổi
            if (!this.connectionListener) {
                this.connectionListener = cc.eventManager.addCustomListener(portalHelper.EVENT_NETWORK_CHANGED, (event) => {
                    let connected = window.navigator.onLine;
                    this.onConnectionChanged(connected);
                });
            }

            this.state = KingLoginState.CONNECT_WAITING;

            this.mainController.setSocketType(this.loginOptions.socketType);
            this.mainController.setServerHost(this.loginOptions.host);
            this.mainController.setServerPort(this.loginOptions.port);
            this.mainController.connect();
        },

        // login support 2 ways:
        // - login with flash var (online server):
        // params:
        // {
        //      host?:           string
        //      port?:           number
        //      socketType?:     KingSocketType
        //      gameId:          number
        //      gameLang?:       string
        //      flashVar?:       string
        //      platformId?:     KingSocketType
        //      betCoin?:        number
        //      solo?:           boolean
        // };
        // - login with username/password (beta server):
        // params:
        // {
        //      isBeta:          boolean (true)
        //      isPrivate?:      boolean (default: false)
        //      socketType:      KingSocketType
        //      gameId:          number
        //      gameLang?:       string
        //      userId:          string
        //      userPass:        string
        //      betCoin?:        number
        //      solo?:           boolean
        // };
        login: function (options) {
            this.isStopRetry = false;
            this.log(this.tag, "login: %j", options);

            if (this.state !== KingLoginState.NONE && this.state !== KingLoginState.CONNECT_SUCCESS &&
                this.state !== KingLoginState.LOGIN_FAILED && this.state !== KingLoginState.LOGIN_KICKED && this.state !== KingLoginState.LOGIN_EXITED) {
                this.log(this.tag, "Last session is still alive", "state:", this.state);
                return;
            }

            // if no options, use last one (relogin)
            this.loginOptions = options || this.loginOptions;
            _.defaultsDeep(this.loginOptions, {
                flashVar: "",
                host: "",
                port: 0,
                socketType: this.DEFAULT_SOCKET_TYPE,
                //platformId: (cc.sys.os === cc.sys.OS_IOS) ? KingPlatform.IOS : KingPlatform.ANDROID,
                isBeta: false,
                isPrivate: false,
                gameId: 0,
            });

            this.log(this.tag, "login: options -> %j", this.loginOptions);
            this.log(this.tag, "login: connected ->", this.mainController.isConnected());

            // connect first

            if (this.mainController.isConnected()) {
                this.sendLogin(this.loginOptions);
                return;
            }

            // login beta server

            if (this.loginOptions.isBeta) {
                if (this.loginOptions.host) {
                    this.connect();
                    return;
                }

                cc.assert(this.loginOptions.gameId !== 0, "Invalid login param: gameId must be specified in beta mode");

                let getConfigCallback = (error, config) => {
                    if (error) {
                        this.log(this.tag, "onGetServerConfigFailed");
                        this.state = KingLoginState.CONNECT_WAITING;
                        this.onConnectionError();
                    }
                    else {
                        this.log(this.tag, "onGetServerConfigSuccess: %j", config);
                        this.loginOptions.host = config.host;
                        this.loginOptions.port = config.port;
                        this.connect();
                    }
                };

                if (this.loginOptions.isPrivate) {
                    KingBeta.getServerConfigVPN(this.loginOptions.gameId, this.loginOptions.socketType, getConfigCallback);
                }
                else {
                    KingBeta.getServerConfig(this.loginOptions.gameId, this.loginOptions.socketType, getConfigCallback);
                }

                return;
            }

            // login online server

            let willConnect = true;
            if (this.loginOptions.flashVar === '') {

                cc.assert(this.loginOptions.gameId !== 0, "Invalid login param: gameId must be specified if host, port or flashVar is missing");

                let isConnected = window.navigator.onLine;

                if (!isConnected) {
                    this.log(this.tag, "Internet connection is dead");
                    this.state = KingLoginState.CONNECT_WAITING;
                    this.onConnectionError();
                    return;
                }

                if (this.loginOptions.socketType === KingSocketType.TCP || this.loginOptions.socketType === KingSocketType.WS) {

                    const onGetFlashVarFailed = () => {
                        this.log(this.tag, "onGetFlashVarFailed");
                        this.state = KingLoginState.CONNECT_WAITING;
                        this.onConnectionError();
                    };

                    const onGetFlashVarSuccess = (host, port, flashVar) => {
                        this.log(this.tag, "onGetFlashVarSuccess", "host:", host, "port:", port, "flashVar:", flashVar);

                        this.loginOptions.host = this.loginOptions.host || host;
                        this.loginOptions.port = this.loginOptions.port || port;
                        this.loginOptions.flashVar = flashVar;

                        this.state = KingLoginState.NONE;
                        this.login();
                    };

                    this.state = KingLoginState.CONNECT_WAITING;
                    this.loginFlashVar(this.loginOptions.gameId, this.loginOptions.socketType, onGetFlashVarSuccess, onGetFlashVarFailed);
                }
                else {
                    this.log(this.tag, "Socket type does not support flash var -> ", this.loginOptions.socketType);
                }

                willConnect = false;
            }

            if (willConnect) {
                this.connect();
            }
        },

        // login support 2 ways:
        // - login with flash var (online server):
        // params:
        // {
        //      host:           string
        //      port:           number
        //      socketType:     KingSocketType
        //      gameId:         number
        //      gameLang?:      string
        //      platformId?:    KingPlatform
        // });
        // - login with username/password (beta server):
        // params:
        // {
        //      isBeta:         boolean
        //      isPrivate?:     boolean (default: false)
        //      socketType:     KingSocketType
        //      gameId:         number
        //      gameLang?:      string
        //      userId:         string
        //      userPass:       string
        // });
        loginCustom: function (options) {
            this.isStopRetry = false;
            this.log(this.tag, "loginCustom: %j", options);

            if (this.state !== KingLoginState.NONE && this.state !== KingLoginState.CONNECT_SUCCESS &&
                this.state !== KingLoginState.LOGIN_FAILED && this.state !== KingLoginState.LOGIN_KICKED && this.state !== KingLoginState.LOGIN_EXITED) {
                this.log(this.tag, "Last session is still alive", "state:", this.state);
                return;
            }

            // if no options, use last one (relogin)
            this.loginOptions = options || this.loginOptions;
            _.defaultsDeep(this.loginOptions, {
                host: "",
                port: 0,
                socketType: this.DEFAULT_SOCKET_TYPE,
                platformId: (cc.sys.os === cc.sys.OS_IOS) ? KingPlatform.IOS : KingPlatform.ANDROID,
                isBeta: false,
                isPrivate: false,
            });

            this.log(this.tag, "login: options -> %j", this.loginOptions);
            this.log(this.tag, "login: connected ->", this.mainController.isConnected());

            if (!this.mainController.isConnected()) {
                this.connect();
                return;
            }

            this.sendLogin(this.loginOptions);
        },

        loginFlashVar: function (gameId, socketType, onSuccess = null, onFailed = null) {
            this.isStopRetry = false;
            this.log(this.tag, "loginFlashVar", "gameId:", gameId, "socketType:", socketType);

            if (socketType === KingSocketType.TCP) {
                const onGetRawFlashVarFailed = () => {
                    this.log(this.tag, "onGetRawFlashVarFailed");
                    onFailed && onFailed();
                };

                const onGetRawFlashVarSuccess = (result) => {
                    this.log(this.tag, "onGetRawFlashVarSuccess: %j", result);

                    let failed = true;
                    if (result.Data && result.Data.raw) {
                        let config = result.Data.raw;
                        if (config) {
                            failed = false;
                            onSuccess && onSuccess(config.IP, parseInt(config.Port), config.FlashVar);
                        }
                    }

                    if (failed)
                        onGetRawFlashVarFailed();
                };

                WebService.getRawByGameId(gameId, onGetRawFlashVarSuccess, onGetRawFlashVarFailed);
            }
            else if (socketType === KingSocketType.WS) {
                const onGetWebFlashVarFailed = () => {
                    this.log(this.tag, "onGetWebFlashVarFailed");
                    onFailed && onFailed();
                };

                const onGetWebFlashVarSuccess = (result) => {
                    this.log(this.tag, "onGetWebFlashVarSuccess: %j", result);

                    let failed = true;
                    if (result.Data && result.Data.ws) {
                        let config = result.Data.ws;
                        if (config) {
                            failed = false;
                            onSuccess && onSuccess(config.IP, parseInt(config.Port), config.FlashVar);
                        }
                    }

                    if (failed)
                        onGetWebFlashVarFailed();
                };

                WebService.getFlashVarGameViaGameId(gameId, onGetWebFlashVarSuccess, onGetWebFlashVarFailed);
            }
        },

        logout: function () {
            this.log(this.tag, "logout");

            if (this.state === KingLoginState.LOGIN_SUCCESS) {
                this.mainController.sendRequestLogout();
            }

            if (this.connectionListener) {
                cc.eventManager.removeListener(this.connectionListener);
                this.connectionListener = undefined;
            }

            this.retry = 0;
            this.state = KingLoginState.LOGIN_EXITED;

            this.closeConnection();
        },

        retryLogin: function () {
            if (this.isStopRetry) {
                return;
            }

            let retryStates = [KingLoginState.LOGIN_FAILED];
            if (this.retryAfterKicked)
                retryStates.push(KingLoginState.LOGIN_KICKED);

            if (retryStates.indexOf(this.state) < 0)
                return;

            if (this.retryAuto && (this.retryMax === this.MAX_RETRY_FOREVER || this.retry < this.retryMax) && this.loginOptions) {
                if (this.retry <= 0) {
                    // dispatch login failed on first retry
                    this.dispatchEvent(KingLoginEvents.ON_LOGIN_FAILED, null);
                }

                this.retry++;

                this.login(this.loginOptions);
                this.dispatchEvent(KingLoginEvents.ON_LOGIN_RETRY, this.retry);

                this.log(this.tag, "RETRY LOGIN -> %d/%d", this.retry, this.retryMax);
            }
            else {
                this.state = KingLoginState.LOGIN_FAILED;
                this.isStopRetry = true;
                this.clearRetryLogin();

                this.closeConnection();
                this.dispatchEvent(KingLoginEvents.ON_LOGIN_FAILED, null);
            }
        },

        waitRetryLogin: function (delay) {
            if (this.retry <= 0) {
                // first retry, execute immediately
                this.retryLogin();
            }
            else {
                this.startRetryLogin(delay);
            }
        },

        startRetryLogin: function (delay) {
            if (this.retryTimeOut != null) {
                clearTimeout(this.retryTimeOut);
                this.retryTimeOut = null;
            }

            this.retryTimeOut = setTimeout(this.retryLogin.bind(this), delay * 1000);
        },

        clearRetryLogin: function () {
            if (this.retryTimeOut != null) {
                clearTimeout(this.retryTimeOut);
                this.retryTimeOut = null;
            }

            this.retry = 0;
        },

        sendLogin: function (options) {
            this.log(this.tag, "sendLogin", "options: %j", options);
            if (this.state === KingLoginState.CONNECT_SUCCESS) {
                if (this.state !== KingLoginState.LOGIN_WAITING) {
                    this.state = KingLoginState.LOGIN_WAITING;

                    let gameLang = options.gameLang || portalHelper.getLanguageStr();
                    if (options.isBeta) {
                        let mainId = KingSlotCommands.MAIN_ID;
                        let assistantId = KingSlotCommands.LOGIN_DEV_REQUEST;

                        let payload = {
                            username: options.userName,
                            password: options.userPass,
                            gameLang: gameLang
                        };
                        this.mainController.sendMessage(mainId, assistantId, KingSlotSchema.LoginDevRequest, payload);
                    }
                    else {
                        let mainId = KingSlotCommands.MAIN_ID;
                        let assistantId = KingSlotCommands.LOGIN_REQUEST;

                        let payload = {
                            token: options.flashVar,
                            gameLang: gameLang
                        };
                        this.mainController.sendMessage(mainId, assistantId, KingSlotSchema.LoginRequest, payload);
                    }
                }
            }
        },

        closeConnection: function () {
            this.mainController.closeConnection();
        },

        // socket messages

        onSocketMessage: function (message) {
            //this.log("onSocketMessage", "header: %j", message.getHeader());
            //this.log("onSocketMessage", "contentSize:", message.sizeContent());
            //this.log("onSocketMessage", "contentBytes:", message.getContent().toHexString());

            let mainId = message.getMainId();
            if (mainId !== KingSlotCommands.MAIN_ID) {
                return;
            }

            let payload = message.getContent();
            let assistantId = message.getAssistantId();
            switch (assistantId) {
                case KingSlotCommands.LOGIN_RESPONSE:
                    this.handleLoginResponse(payload);
                    break;

                case KingSlotCommands.LOGIN_OTHER_SERVER:
                    this.handleLoginOtherServer(payload);
                    break;

                case KingSlotCommands.LOGIN_OTHER_SESSION:
                    this.handleLoginOtherSession(payload);
                    break;

                case KingSlotCommands.LOGIN_SERVER_KICKED:
                    this.handleLoginServerKicked(payload);
                    break;

                default:
                    break;
            }
        },

        getMappedAvatar: function (avatar) {
            let baseUrl = "http://mimg.live777.com/";

            if (!avatar || avatar.length <= 0) {
                return baseUrl + "noimage.gif";
            }

            if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
                return avatar;
            }

            return baseUrl + avatar;
        },

        handleLoginResponse: function (payload) {
            let data = Schema.decode(KingSlotSchema.LoginResponse, payload);
            this.log("handleLoginResponse: %j", data);

            let success = data.result === KingLoginResult.SUCCESS || data.result === KingLoginResult.RECONNECT;
            if (success && data.userInfo) {
                data.userInfo.avatar = this.getMappedAvatar(data.userInfo.avatar);
                this.handleLoginSuccess(data.userInfo);
            } else {
                this.state = KingLoginState.LOGIN_FAILED;
                let message = "";
                let errorCode = 0;
                switch (data.result) {
                    case KingLoginResult.RESULT_PLAYING_OTHER_GAME:
                        message = Localize.text("LOGIN_JOIN_OTHER_GAME");
                        errorCode = KingErrorCode.LOGIN_OTHER_GAME;
                        break;
                }

                if (errorCode !== 0) {
                    this.dispatchEvent(KingLoginEvents.ON_LOGIN_FAILED, { errorCode: errorCode, message: message });
                } else {
                    this.waitRetryLogin(1000);
                }
            }
        },

        handleLoginOtherServer: function (payload) {
            let data = Schema.decode(KingSlotSchema.LoginOtherServer, payload);
            this.log("handleLoginOtherServer: %j", data);

            this.state = KingLoginState.LOGIN_EXITED;
            this.dispatchEvent(KingLoginEvents.ON_LOGIN_OTHER_SERVER, data);
            // if (this.state === KingLoginState.LOGIN_WAITING) {
            //     let ip = this.isRawSocket() ? data.ipSocketRaw : data.ipSocketWeb;
            //     if (ip) {
            //         if (ip.indexOf(":") > -1) {
            //             let parts = ip.split(":");
            //             this.loginOptions.host = parts[0];
            //             this.loginOptions.port = parseInt(parts[1]);
            //         } else {
            //             this.loginOptions.host = ip;
            //             this.loginOptions.port = undefined;
            //         }
            //         this.closeConnection();
            //         this.sendLogin();
            //     }
            // } else {
            // }
        },

        handleLoginOtherSession: function (payload) {
            this.state = KingLoginState.LOGIN_KICKED;
            this.dispatchEvent(KingLoginEvents.ON_LOGIN_KICK, {});
        },

        handleLoginServerKicked: function (payload) {
            this.state = KingLoginState.LOGIN_KICKED;
            this.dispatchEvent(KingLoginEvents.ON_LOGIN_KICK_AFK, {});
        },

        handleConnectError: function () {
            let ignoreStates = [KingLoginState.NONE, KingLoginState.LOGIN_EXITED];
            if (ignoreStates.indexOf(this.state) > -1)
                return;

            if (!this.retryAfterKicked && this.state === KingLoginState.LOGIN_KICKED)
                return;

            this.state = KingLoginState.LOGIN_FAILED;
            this.waitRetryLogin(this.retryDelay);
        },

        handleLoginSuccess: function (payload) {
            this.log(this.tag, "handleLoginSuccess: %j", payload);

            this.userManager.parse(payload);
            this.userManager.nickName = this.userManager.name;
            this.userManager.fullName = this.userManager.name;
            this.userManager.vipLevel = payload.vip;

            this.retry = 0;
            this.state = KingLoginState.LOGIN_SUCCESS;

            this.dispatchEvent(KingLoginEvents.ON_LOGIN_SUCCESS, payload);
        },

        handleLogout: function (payload) {
            this.log(this.tag, "handleLogout: %j", payload);

            this.retry = 0;
            this.state = KingLoginState.LOGIN_EXITED;

            this.closeConnection();

            this.dispatchEvent(KingLoginEvents.ON_LOGOUT, payload);
        },

        // connection

        onSocketConnected: function (payload) {
            this.log("onSocketConnected", "connected:", payload.connect, "status:", payload.status);

            this.clearRetryLogin();
            if (this.state === KingLoginState.CONNECT_WAITING) {
                this.state = KingLoginState.CONNECT_SUCCESS;
                if (this.loginOptions) {
                    this.sendLogin(this.loginOptions);
                }
            }
        },

        onSocketDisconnected: function (payload) {
            this.log("onSocketDisconnected", "connected:", payload.connect, "status:", payload.status);

            cc.log('this.mainController.isDestroy %j', this.mainController.isDestroy);
            if (this.mainController && this.mainController.isDestroy) {

            } else {
                this.handleConnectError();
            }
        },

        onConnectionError: function (payload) {
            this.log(this.tag, "onConnectionError", "payload: %j", payload);

            this.handleConnectError();
        },

        onConnectionChanged: function (connected) {
            this.log(this.tag, "onConnectionChanged", "connected:", connected);

            this.isConnectionAlive = connected;
            if (this.isConnectionAlive) {
                this.clearRetryLogin();
                this.login(this.loginOptions);
            } else {
                this.state = KingLoginState.LOGIN_FAILED;
                this.closeConnection();
            }
        },
    });

    window.KingSlotLoginManager = KingSlotLoginManager;
    return KingSlotLoginManager;
});