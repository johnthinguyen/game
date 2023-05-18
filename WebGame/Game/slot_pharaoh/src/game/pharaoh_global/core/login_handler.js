Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::LoginHandler]";

    const LoginHandler = cc.Class.extend({
        ctor: function (slotManager, commander, gameId, gameLang, loginAccount, loginOptions) {
            this.commander = commander;
            this.commandSession = null;

            this.gameId = gameId;
            this.gameLang = gameLang;
            this.loginAccount = loginAccount;
            this.loginOptions = loginOptions;

            this.isFirstLogin = true;
            this.isFirstAttempt = true;
            this.isReconnecting = false;
            this.isDisconnected = false;
            this.slotManager = slotManager;
        },

        startListenEvents: function () {
            this.slotManager.loginManager.setHandler(this);

            this.commandSession = this.commander.createSession();
            this.commandSession.on("game.init", () => {
                this.commander.emit("game.init.lock");
                this.login();
            });
        },

        stopListenEvents: function () {
            this.slotManager.loginManager.removeHandler(this);
        },

        login: function () {
            let gameID = this.gameId;
            let gameLang = this.gameLang;
            if (this.loginAccount) {
                let account = this.loginAccount;
                let options = this.loginOptions;

                this.slotManager.loginManager.login({
                    isBeta: !this.loginAccount.isOnline,
                    gameId: gameID,
                    gameLang: gameLang,
                    host: account.host,
                    port: account.port,
                    userId: account.userId,
                    userName: account.userName,
                    userPass: account.userPass,
                    userEmail: account.userEmail,
                    socketType: options.socketType,
                    isPrivate: options.isPrivate,
                    flashVar: account.flashVars
                });

                if (portalHelper.notifyGame) {
                    portalHelper.notifyGame(portalHelper.EVENT_GAME_LOGIN, {sennder: this, loginParams: account});
                }
            } else {
                this.slotManager.loginManager.login({
                    isBeta: false,
                    gameId: gameID,
                    gameLang: gameLang,
                    socketType: this.loginOptions.socketType
                });

                if (portalHelper.notifyGame) {
                    portalHelper.notifyGame(portalHelper.EVENT_GAME_LOGIN, {sennder: this, loginParams: undefined});
                }
            }
        },

        logout: function () {
            // this.slotManager.loginManager.logout();

            this.isFirstLogin = true;
            this.isFirstAttempt = true;
            this.isReconnecting = false;
            this.isDisconnected = true;
        },

        isReady: function () {
            return this.slotManager.loginManager.isReady();
        },

        handleReconnect: function () {
            this.commander.emit(SlotCore.POPUP.FUNC.HIDE_POPUPS);
            this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
        },

        onLoginSuccess: function (payload) {
            cc.log(LOGTAG, "onLoginSuccess");
            if (this.isFirstLogin) {
                this.isFirstLogin = false;
                this.commander.emit("game.init.unlock");
            }

            if (this.isDisconnected) {
                this.isDisconnected = false;
                this.isReconnecting = false;
                setTimeout(() => {
                    this.handleReconnect();
                }, 1000);
            }

            this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
            this.commander.emit("login.success");
        },

        onLoginFailed: function () {
            cc.log(LOGTAG, "onLoginFailed");
            this.commander.emit("login.loginFailed");
            this.isDisconnected = true;
            if (!this.isReconnecting) {
                this.isReconnecting = true;
                this.commander.emit(SlotCore.POPUP.FUNC.SHOW_WAITING,
                    Localize.text("LANG_PROMPT_CONNECTING")
                );
                return;
            }

            this.isReconnecting = false;
            this.commander.emit("login.loginFailed", true);
            this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_CONFIRM, Localize.text("LANG_PROMPT_RETURN_LOBBY_LOST_CONNECTION"),
                this.commander.createTrigger("game.returnToLobby"),
                () => {
                    if (!this.slotManager.loginManager.isReady()) {
                        this.login();
                    }
                }
            );
        },

        onLoginKick: function () {
            cc.log(LOGTAG, "onLoginKick");
            this.commander.emit("login.loginKicked");
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, Localize.text("LANG_PROMPT_DUPLICATE_LOGIN"), this.commander.createTrigger("game.returnToLobby"));
        },

        onLoginKickAFK: function () {
            cc.log(LOGTAG, "onLoginKickAFK");
            this.commander.emit("login.loginKicked");
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, Localize.text("LANG_PROMPT_AFK"), this.commander.createTrigger("game.returnToLobby"));
        }
    });

    window.LoginHandler = LoginHandler;
    return LoginHandler;
});
