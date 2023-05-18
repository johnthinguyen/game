"use strict";

var KingLoginState = {
    NONE: 0,
    CONNECT_WAITING: 1,
    CONNECT_SUCCESS: 2,
    LOGIN_WAITING: 3,
    LOGIN_SUCCESS: 4,
    LOGIN_FAILED: 5,
    LOGIN_KICKED: 6,
    LOGIN_EXITED: 7
};

var KingLoginEvents = {
    ON_LOGIN_SUCCESS: "onLoginSuccess", // được gọi khi login thành công
    ON_LOGIN_FAILED: "onLoginFailed", // được gọi khi login không thành công, hoặc bị mất kết nối,...
    ON_LOGIN_RETRY: "onLoginRetry", // được gọi mỗi lần bắt đầu một lượt retry login mới.
    ON_LOGIN_KICK: "onLoginKick", // được gọi khi account được đăng nhập ở device khác, hoặc bị kick bởi server
    ON_LOGOUT: "onLogout" // được gọi khi user chủ động logout thành công
};

var KingLoginManager = cc.class("KingLoginManager", BaseController, {

    MAX_RETRY_DEFAULT: 10,
    MAX_RETRY_FOREVER: -1,

    DELAY_RETRY_DEFAULT: 2.0,
    FETCH_API_TIMEOUT: 10000,

    PING_ENABLED: false,
    RETRY_AFTER_KICKED_DEFAULT: false,

    PING_RANDOM_MIN: 20,
    PING_RANDOM_MAX: 150,

    PING_INTERVAL: 5000,
    PING_LEVELS: [500, 300, 200, 100],

    DEFAULT_SOCKET_TYPE: KingSocketType.WS,

    ctor: function ctor(controller) {
        var useGlobalDependency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        this._super();
        this.initEmitter();

        this.state = KingLoginState.NONE;

        this.pingValue = 0;
        this.pingSentTime = 0;
        this.pingChangeNextTime = 0;

        this.isPingAlive = true;
        this.isConnectionAlive = false;

        this.loginOptions = null;

        this.retryAuto = true;
        this.retryAfterKicked = this.RETRY_AFTER_KICKED_DEFAULT;

        this.retry = 0;
        this.retryTimeOut = null;

        this.retryMax = this.MAX_RETRY_DEFAULT;
        this.retryDelay = this.DELAY_RETRY_DEFAULT;

        this.controller = controller || KingGame;
        this.controller.addListener(this.controller.LISTENER_TYPE.MAIN, this.LOGTAG, this);
        this.controller.addClearIgnoreKeys(this.LOGTAG);

        if (useGlobalDependency) {
            if (KingUser !== undefined) this.setUserManager(KingUser);
        }

        this.startPingPong();
    },

    clear: function clear() {

        this.controller = null;
        this.userManager = null;
        this.roomManager = null;
        this.lobbyManager = null;

        this.loginOptions = null;
        this.retryTimeOut = null;
    },

    isReady: function isReady() {
        return this.state === KingLoginState.LOGIN_SUCCESS;
    },

    isKicked: function isKicked() {
        return this.state === KingLoginState.LOGIN_KICKED;
    },

    getState: function getState() {
        return this.state;
    },

    setAutoRetry: function setAutoRetry(value) {
        this.retryAuto = value;
    },

    setMaxRetry: function setMaxRetry(value) {
        this.retryMax = value;
    },

    setRetryDelay: function setRetryDelay(value) {
        this.retryDelay = value;
    },

    setRetryAfterKicked: function setRetryAfterKicked(value) {
        this.retryAfterKicked = value;
    },

    setUserManager: function setUserManager(manager) {
        this.userManager = manager;
    },

    setRoomManager: function setRoomManager(manager) {
        this.roomManager = manager;
    },

    setLobbyManager: function setLobbyManager(manager) {
        this.lobbyManager = manager;
    },

    connect: function connect() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (options) this.loginOptions = options;

        this.log(this.tag, "connect", "options: %j", this.loginOptions);

        this.state = KingLoginState.CONNECT_WAITING;
        this.controller.connect(this.loginOptions.host, this.loginOptions.port, this.loginOptions.socketType);
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
    //      platformId?:     KingPlatform
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
    login: function login(options) {
        var _this = this;

        this.log(this.tag, "login: %j", options);

        if (this.state !== KingLoginState.NONE && this.state !== KingLoginState.CONNECT_SUCCESS && this.state !== KingLoginState.LOGIN_FAILED && this.state !== KingLoginState.LOGIN_KICKED && this.state !== KingLoginState.LOGIN_EXITED) {
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
            platformId: cc.sys.os === cc.sys.OS_IOS ? KingPlatform.IOS : KingPlatform.ANDROID,
            isBeta: false,
            isPrivate: false,
            gameId: 0
        });

        this.log(this.tag, "login: options -> %j", this.loginOptions);
        this.log(this.tag, "login: connected ->", this.controller.isConnected());

        // connect first

        if (this.controller.isConnected()) {
            this.sendLogin(this.loginOptions);
            return;
        }

        // login beta server

        if (this.loginOptions.isBeta) {

            cc.assert(this.loginOptions.gameId !== 0, "Invalid login param: gameId must be specified in beta mode");

            var getConfigCallback = function getConfigCallback(error, config) {
                if (error) {
                    _this.log(_this.tag, "onGetServerConfigFailed");
                    _this.state = KingLoginState.CONNECT_WAITING;
                    _this.onConnectionError();
                } else {
                    _this.log(_this.tag, "onGetServerConfigSuccess: %j", config);
                    _this.loginOptions.host = config.host;
                    _this.loginOptions.port = config.port;
                    _this.connect();
                }
            };

            if (this.loginOptions.isPrivate) {
                KingBeta.getServerConfigVPN(this.loginOptions.gameId, this.loginOptions.socketType, getConfigCallback);
            } else {
                KingBeta.getServerConfig(this.loginOptions.gameId, this.loginOptions.socketType, getConfigCallback);
            }

            return;
        }

        // login online server

        var willConnect = true;
        if (this.loginOptions.flashVar === '') {

            cc.assert(this.loginOptions.gameId !== 0, "Invalid login param: gameId must be specified if host, port or flashVar is missing");

            if (portalHelper.isInternetConnected !== undefined) {
                this.log(this.tag, "Internet connected ->", portalHelper.isInternetConnected());
                if (!portalHelper.isInternetConnected()) {
                    this.log(this.tag, "Internet connection is dead");
                    this.state = KingLoginState.CONNECT_WAITING;
                    this.onConnectionError();
                    return;
                }
            }

            if (this.loginOptions.socketType === KingSocketType.TCP || this.loginOptions.socketType === KingSocketType.WS) {

                var onGetFlashVarFailed = function onGetFlashVarFailed() {
                    _this.log(_this.tag, "onGetFlashVarFailed");
                    _this.state = KingLoginState.CONNECT_WAITING;
                    _this.onConnectionError();
                };

                var onGetFlashVarSuccess = function onGetFlashVarSuccess(host, port, flashVar) {
                    _this.log(_this.tag, "onGetFlashVarSuccess", "host:", host, "port:", port, "flashVar:", flashVar);

                    _this.loginOptions.host = host;
                    _this.loginOptions.port = port;
                    _this.loginOptions.flashVar = flashVar;

                    _this.state = KingLoginState.NONE;
                    _this.login();
                };

                this.state = KingLoginState.CONNECT_WAITING;
                this.loginFlashVar(this.loginOptions.gameId, this.loginOptions.socketType, onGetFlashVarSuccess, onGetFlashVarFailed);
            } else {
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
    loginCustom: function loginCustom(options) {
        this.log(this.tag, "loginCustom: %j", options);

        if (this.state !== KingLoginState.NONE && this.state !== KingLoginState.CONNECT_SUCCESS && this.state !== KingLoginState.LOGIN_FAILED && this.state !== KingLoginState.LOGIN_KICKED && this.state !== KingLoginState.LOGIN_EXITED) {
            this.log(this.tag, "Last session is still alive", "state:", this.state);
            return;
        }

        // if no options, use last one (relogin)
        this.loginOptions = options || this.loginOptions;
        _.defaultsDeep(this.loginOptions, {
            host: "",
            port: 0,
            socketType: this.DEFAULT_SOCKET_TYPE,
            platformId: cc.sys.os === cc.sys.OS_IOS ? KingPlatform.IOS : KingPlatform.ANDROID,
            isBeta: false,
            isPrivate: false
        });

        this.log(this.tag, "login: options -> %j", this.loginOptions);
        this.log(this.tag, "login: connected ->", this.controller.isConnected());

        if (!this.controller.isConnected()) {
            this.connect();
            return;
        }

        this.sendLogin(this.loginOptions);
    },

    loginFlashVar: function loginFlashVar(gameId, socketType) {
        var _this2 = this;

        var onSuccess = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var onFailed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        this.log(this.tag, "loginFlashVar", "gameId:", gameId, "socketType:", socketType);

        if (socketType === KingSocketType.TCP) {

            var onGetRawFlashVarFailed = function onGetRawFlashVarFailed() {
                _this2.log(_this2.tag, "onGetRawFlashVarFailed");
                onFailed && onFailed();
            };

            var onGetRawFlashVarSuccess = function onGetRawFlashVarSuccess(result) {
                _this2.log(_this2.tag, "onGetRawFlashVarSuccess: %j", result);

                var failed = true;
                if (result.Data && result.Data.raw) {
                    var config = result.Data.raw;
                    if (config) {
                        failed = false;
                        onSuccess && onSuccess(config.IP, parseInt(config.Port), config.FlashVar);
                    }
                }

                if (failed) onGetRawFlashVarFailed();
            };

            WebService.getRawByGameId(gameId, onGetRawFlashVarSuccess, onGetRawFlashVarFailed);
        } else if (socketType === KingSocketType.WS) {

            var onGetWebFlashVarFailed = function onGetWebFlashVarFailed() {
                _this2.log(_this2.tag, "onGetWebFlashVarFailed");
                onFailed && onFailed();
            };

            var onGetWebFlashVarSuccess = function onGetWebFlashVarSuccess(result) {
                _this2.log(_this2.tag, "onGetWebFlashVarSuccess: %j", result);

                var failed = true;
                if (result.Data && result.Data.ws) {
                    var config = result.Data.ws;
                    if (config) {
                        failed = false;
                        onSuccess && onSuccess(config.IP, parseInt(config.Port), config.FlashVar);
                    }
                }

                if (failed) onGetWebFlashVarFailed();
            };

            WebService.getFlashVarGameViaGameId(gameId, onGetWebFlashVarSuccess, onGetWebFlashVarFailed);
        }
    },

    logout: function logout() {
        this.log(this.tag, "logout");

        if (this.state === KingLoginState.LOGIN_SUCCESS) {
            this.controller.sendRequestLogout();
        }

        this.roomManager.reset();
        this.lobbyManager.reset();

        this.retry = 0;
        this.state = KingLoginState.LOGIN_EXITED;

        this.stopPingPong();
    },

    retryLogin: function retryLogin() {

        var retryStates = [KingLoginState.LOGIN_FAILED];
        if (this.retryAfterKicked) retryStates.push(KingLoginState.LOGIN_KICKED);

        if (retryStates.indexOf(this.state) < 0) return;

        if (this.retryAuto && (this.retryMax === this.MAX_RETRY_FOREVER || this.retry < this.retryMax) && this.loginOptions) {

            if (this.retry <= 0) {
                // dispatch login failed on first retry
                this.dispatchEvent(KingLoginEvents.ON_LOGIN_FAILED, null);
            }

            this.retry++;

            this.login(this.loginOptions);
            this.dispatchEvent(KingLoginEvents.ON_LOGIN_RETRY, this.retry);

            this.log(this.tag, "RETRY LOGIN -> %d/%d", this.retry, this.retryMax);
        } else {

            this.state = KingLoginState.LOGIN_FAILED;

            this.clearRetryLogin();
            this.stopPingPong();

            this.close();
            this.dispatchEvent(KingLoginEvents.ON_LOGIN_FAILED, null);
        }
    },

    waitRetryLogin: function waitRetryLogin(delay) {
        if (this.retry <= 0) {
            // first retry, execute immediately
            this.retryLogin();
        } else {
            this.startRetryLogin(delay);
        }
    },

    startRetryLogin: function startRetryLogin(delay) {

        if (this.retryTimeOut) {
            clearTimeout(this.retryTimeOut);
            delete this.retryTimeOut;
        }

        this.retryTimeOut = setTimeout(this.retryLogin.bind(this), delay * 1000);
    },

    clearRetryLogin: function clearRetryLogin() {

        if (this.retryTimeOut) {
            clearTimeout(this.retryTimeOut);
            delete this.retryTimeOut;
        }

        this.retry = 0;
    },

    startPingPong: function startPingPong() {
        var _this3 = this;

        if (this.PING_ENABLED === false) return;

        this.isPingAlive = true;

        if (!this.updatePing) {
            this.updatePing = setInterval(function () {
                if (_this3.isPingAlive) {
                    _this3.sendPing();
                } else {
                    _this3.log(_this3.tag, "PINGPONG - Connection maybe dead");
                }
            }, this.PING_INTERVAL);
        }
    },

    stopPingPong: function stopPingPong() {

        if (this.PING_ENABLED === false) return;

        this.isPingAlive = false;

        if (this.updatePing) {
            clearInterval(this.updatePing);
            delete this.updatePing;
        }
    },

    sendLogin: function sendLogin(options) {
        this.log(this.tag, "sendLogin", "options: %j", options);
        if (this.state === KingLoginState.CONNECT_SUCCESS) {
            if (this.state !== KingLoginState.LOGIN_WAITING) {
                this.state = KingLoginState.LOGIN_WAITING;
                if (options.isBeta) {
                    this.controller.sendRequestLoginWithPassword(options);
                } else {
                    this.controller.sendRequestLoginWithFlashVar(options);
                }
            }
        }
    },

    getPing: function getPing() {

        if (this.PING_ENABLED === false) {
            if (Date.now() > this.pingChangeNextTime) {
                this.pingValue = MathUtils.randomMinMax(this.PING_RANDOM_MIN, this.PING_RANDOM_MAX);
                this.pingChangeNextTime = Date.now() + MathUtils.randomMinMax(this.PING_INTERVAL, this.PING_INTERVAL * 2);
            }
        }

        return this.pingValue;
    },

    getPingLevel: function getPingLevel() {
        var i = 0;
        while (i < this.PING_LEVELS.length && this.getPing() < this.PING_LEVELS[i]) {
            i++;
        }return i >= this.PING_LEVELS.length ? this.PING_LEVELS.length - 1 : i;
    },

    sendPing: function sendPing() {
        this.isPingAlive = false;
        this.pingSentTime = Date.now();
        if (this.state === KingLoginState.LOGIN_SUCCESS) this.controller.sendGamePingRequest();
    },

    receivePong: function receivePong() {
        this.isPingAlive = true;
        this.pingValue = Date.now() - this.pingSentTime;
    },

    close: function close() {
        this.controller.close();
    },

    onConnected: function onConnected(payload) {
        this.log(this.tag, "onConnected");
        this.clearRetryLogin();
        if (this.state === KingLoginState.CONNECT_WAITING) {
            this.state = KingLoginState.CONNECT_SUCCESS;
            if (this.loginOptions) {
                this.sendLogin(this.loginOptions);
            }
        }
    },

    onDisconnected: function onDisconnected() {
        this.log(this.tag, "onDisconnected");

        var ignoreStates = [KingLoginState.NONE, KingLoginState.LOGIN_EXITED];
        if (this.retryAfterKicked === false) ignoreStates.push(KingLoginState.LOGIN_KICKED);

        if (ignoreStates.indexOf(this.state) >= 0) return;

        this.state = KingLoginState.LOGIN_FAILED;

        this.waitRetryLogin(this.retryDelay);
        this.stopPingPong();
    },

    onConnectionError: function onConnectionError(payload) {
        this.log(this.tag, "onConnectionError", "payload: %j", payload);

        var ignoreStates = [KingLoginState.NONE, KingLoginState.LOGIN_EXITED];
        if (this.retryAfterKicked === false) ignoreStates.push(KingLoginState.LOGIN_KICKED);

        if (ignoreStates.indexOf(this.state) >= 0) return;

        this.state = KingLoginState.LOGIN_FAILED;

        this.waitRetryLogin(this.retryDelay);
        this.stopPingPong();
    },

    onConnectionChanged: function onConnectionChanged(connected) {
        this.log(this.tag, "onConnectionChanged", "connected:", connected);

        this.isConnectionAlive = connected;
        if (this.isConnectionAlive) {
            this.clearRetryLogin();
            this.login(this.loginOptions);
        } else {
            this.state = KingLoginState.LOGIN_FAILED;
            this.stopPingPong();
            this.close();
        }
    },

    onGamePing: function onGamePing(payload) {
        this.receivePong();
    },

    onGameUserLoginOtherSession: function onGameUserLoginOtherSession(payload) {
        this.state = KingLoginState.LOGIN_KICKED;
        this.dispatchEvent(KingLoginEvents.ON_LOGIN_KICK, payload);
    },

    onLoginSuccess: function onLoginSuccess(payload) {
        this.log(this.tag, "onLoginSuccess: %j", payload);

        this.roomManager.reset();
        this.lobbyManager.reset();

        this.userManager.parse(payload);

        this.retry = 0;
        this.state = KingLoginState.LOGIN_SUCCESS;

        this.startPingPong();
        this.dispatchEvent(KingLoginEvents.ON_LOGIN_SUCCESS, payload);
    },

    onLogout: function onLogout(payload) {
        this.log(this.tag, "onLogout: %j", payload);

        this.roomManager.reset();
        this.lobbyManager.reset();

        this.retry = 0;
        this.state = KingLoginState.LOGIN_EXITED;

        this.close();
        this.stopPingPong();

        this.dispatchEvent(KingLoginEvents.ON_LOGOUT, payload);
    },

    onProcessedPayload: function onProcessedPayload(payload) {
        return KingProtocol.parseMessage(payload);
    }
});

KingLoginManager.instance = null;
KingLoginManager.getInstance = function () {
    if (!KingLoginManager.instance) KingLoginManager.instance = new KingLoginManager();
    return KingLoginManager.instance;
};

KingLoginManager.destroyInstance = function () {
    if (KingLoginManager.instance) delete KingLoginManager.instance;
    KingLoginManager.instance = null;
};

// Global

var KingLogin = KingLoginManager.getInstance();
