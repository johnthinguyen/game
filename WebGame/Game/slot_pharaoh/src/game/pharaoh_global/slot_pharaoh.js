//
// Startup the game, no modules should dependent on this module
//

Module.define(function (require) {
    "use strict";

    const SlotPharaoh = cc.Class.extend({

        ctor: function (config) {

            this.config = config;
            this.commander = new Commander();
            this.slotManager = new SlotManager(this.config.GAME_ID, this.commander, this.config);

            SlotCore.setCommander(this.commander);
            SlotCore.createPopupController();
        },

        init: function () {
            if (!this.initialized) {
                this.initialized = true;

                const LANG = {
                    EN:     LANG_EN,
                    VI:     LANG_VI,
                    CAM:    LANG_KM,
                    CHINA:  LANG_ZH,
                    MAY:    LANG_EN,
                    MY:     LANG_MY,
                    THAI:   LANG_TH,
                    PH:     LANG_PH
                    //add other language here
                };

                // LANG_VIETNAM     = 0,
                // LANG_CAMBODIA    = 1,
                // LANG_CHINA       = 2,
                // LANG_MALAYSIA    = 3,
                // LANG_THAILAND    = 4,
                // LANG_ENGLISH     = 5,
                switch (portalHelper.getLanguageType()) {
                    case 0:
                        Localize.setLanguage(LANG.VI);
                        break;

                    case 1:
                        Localize.setLanguage(LANG.CAM);
                        break;

                    case 2:
                        Localize.setLanguage(LANG.CHINA);
                        break;

                    case 3:
                        Localize.setLanguage(LANG.MAY);
                        break;

                    case 4:
                        Localize.setLanguage(LANG.THAI);
                        break;

                    case 5:
                        Localize.setLanguage(LANG.EN);
                        break;
                    case 6:
                        Localize.setLanguage(LANG.MY);
                        break;

                    case 7:
                        Localize.setLanguage(LANG.PH);
                        break;

                    default:
                        Localize.setLanguage(LANG.EN);
                        break;
                }

                let font = "Arial";
                let replaceSystemFont = false;

                if (font) {
                    Localize.setFont(font, replaceSystemFont);
                }
            }
        },
        // Khoi dong game va init cac listener
        start: function () {
            this.init();
            AudioHandler.init(this.config.isL7);
            // Commander
            this.commander.on("game.initFailed", () => {
                if (!this.loginHandler.isReady()) {
                    this.loginHandler.logout();
                    this.loginHandler.login();
                } else {
                    this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, Localize.text("LANG_PROMPT_TIMEOUT"),//Localize.text("LANG_PROMPT_RETURN_LOBBY_LOST_CONNECTION"),
                    this.commander.createTrigger("game.returnToLobby"),
                    () => {
                        if (!this.loginHandler.isReady()) {
                            this.loginHandler.logout();
                            this.loginHandler.login();
                        }
                    });
                }
            });

            this.commander.on("game.returnToLobby", () => {
                this.commander.emit("game.quit");
                this.shutdown();
            });

            this.commander.on("game.returnToLobbyDisconnect", () => {
                this.commander.emit("game.quit");
                if (WebHelper && WebHelper.onRequestBackToLobby)
                    WebHelper.onRequestBackToLobby();
            });

            this.commander.on("game.returnToLobbyForPurchasing", () => {
                this.commander.emit("game.quit");
                if(WebHelper && WebHelper.openPageDeposit)
                    WebHelper.openPageDeposit();
            });

            // Slot manager should be intialize before login handler
            this.slotManager.startListenEvents();

            // Login handler
            let gameId = this.config.GAME_ID;
            let gameLang = portalHelper.getLanguageStr();
            let loginAccount = this.config.loginAccount;
            let loginOptions = this.config.loginOptions;
            this.loginHandler = new LoginHandler(this.slotManager, this.commander, gameId, gameLang, loginAccount, loginOptions);
            this.loginHandler.startListenEvents();

            // All plugins loaded, start the runtime
            this.stateMachine = new StateMachine();
            this.stateMachine.start(new State.Sequence([
                new InitializeState(this.commander, this.slotManager),
                new HandleFirstSpinState(this.commander, this.slotManager)
            ]));
        },

        shutdown: function (portalPlace, purchasing = false, isDisconnect = false) {

            if (this.stateMachine) {
                this.stateMachine.clearStates();
                this.stateMachine.stop();
                this.stateMachine = null;
            }

            if (this.viewControllers) {
                this.viewControllers.forEach(controller => {
                    if (controller) {
                        controller.stopListenEvents();
                    }
                });
                this.viewControllers = null;
            }

            if (this.loginHandler) {
                this.loginHandler.stopListenEvents();
                this.loginHandler.logout();
            }

            if (this.slotManager) {
                this.slotManager.stopListenEvents();
                this.slotManager.destroy();
                this.slotManager = null;
            }

            WebHelper.onRequestBackToLobby();
        },
    });

    window.SlotPharaoh = SlotPharaoh;
    return SlotPharaoh;
});
