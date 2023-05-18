Module.define(function (require) {
    "use strict";

    const HEADER = {
        SET: {

            COIN: "header.set.coin",
            MATCH_ID: "header.set.matchId",
            USER_ID: "header.set.userId",
            USERNAME: "header.set.userName",
            SOUND: "header.set.sound",
            VIP: "header.set.vip",
            LEVEL: "header.set.level",
            LEVEL_PROGRESS: "header.set.levelProgress",

            ON_TAP_BUY: "header.set.onTapBuy",
            ON_TAP_HOME: "header.set.onTapHome",
            ON_TAP_SOUND: "header.set.onTapSound",

            TWEEN_COIN: "header.set.tweenCoin",
        },
        GET: {
            NODE: "header.get.node",
            SOUND: "header.get.sound",
            COIN: "header.get.coin",
        }
    };

    const FOOTER = {
        SET: {

            BET_RANGE: "footer.set.betRange",
            BET_INDEX: "footer.set.betIndex",
            WIN_COIN: "footer.set.winCoin",
            AUTO_SPIN_COUNT: "footer.set.textSpinCount",

            ON_TAP_GUIDE: "footer.set.onTapGuide",

            ON_TAP_SPIN: "footer.set.onTapSpin",
            ON_HOLD_SPIN: "footer.set.onHoldSpin",

            ON_TAP_INCREASE_BET: "footer.set.onTapIncreaseBet",
            ON_TAP_DECREASE_BET: "footer.set.onTapDecreaseBet",
            ON_TAP_MAX_BET: "footer.set.onTapMaxBet",

            ON_TAP_SPIN_COUNT_ITEM: "footer.set.onTapSpinCountItem",

            TWEEN_WIN_COIN: "footer.set.tweenWinCoin",

            ENABLE_TEXT_MESSAGE: "footer.set.enableTextMessage",
            TEXT_MESSAGE: "footer.set.textMessage",

            ENABLE_GROUP_BUTTON: "footer.set.enableGroupButton",
            ENABLE_BUTTON_MAX_BET: "footer.set.enableButtonMaxBet",
            ENABLE_BUTTON_SPIN: "footer.set.enableButtonSpin",
            ENABLE_BUTTON_INCREASE_DECREASE: "footer.set.enableButtonChangeBet",

            BUTTON_SPIN_STATE: {
                DEFAULT: "footer.func.buttonSpinState.default",
                AUTO_NUMBER: "footer.func.buttonSpinState.autoNumber",
                AUTO_INFINITY: "footer.func.buttonSpinState.autoInfinity"
            }
        },
        GET: {

            NODE: "footer.get.node",

            BET_INDEX: "footer.get.betIndex",
            BET_COIN: "footer.get.betCoin",
            WIN_COIN: "footer.get.winCoin",

            PANEL_AUTO_SHOWING: "footer.get.panelAutoShowing"
        },
        FUNC: {
            SHOW_PANEL_AUTO: "footer.func.showPanelAuto",
            HIDE_PANEL_AUTO: "footer.func.hidePanelAuto"
        }
    };

    const POPUP = {
        GET: {
            WAITING: "slot.popup.get.waiting",
            POPUPS: "slot.popup.get.popups",
        },
        FUNC: {

            SHOW_MESSAGE: "slot.popup.func.showMessage",
            SHOW_CONFIRM: "slot.popup.func.showConfirm",
            SHOW_WAITING: "slot.popup.func.showWaiting",

            HIDE_POPUPS: "slot.popup.func.hidePopups",
            HIDE_WAITING: "slot.popup.func.hideWaiting",
        }
    };

    const NOTIFY_AUTO = {
        FUNC: {
            SHOW_TEXT_START_AUTO: "notifyAuto.func.showTextStartAuto",
            SHOW_TEXT_END_AUTO: "notifyAuto.func.showTextEndAuto",
            HIDE: "notifyAuto.func.hide",
        }
    };

    const SlotCore = {

        POPUP: POPUP,

        HEADER: HEADER,
        FOOTER: FOOTER,
        
        NOTIFY_AUTO: NOTIFY_AUTO,

        ctor: function () {

            this.commander = null;

            this.header = null;
            this.footer = null;

            this.popupController = null;

            this.sessionHeader = null;
            this.sessionFooter = null;

            this.sessionNotifyAuto = null;
            this.sessionPopupController = null;
        },

        setCommander: function (commander) {
            this.commander = commander;
        },

        createHeader: function (owner = null) {

            this.header = new SlotHeader();

            if(owner)
                owner.addChild(this.header);

            this.startListenHeaderEvents();

            return this.header;
        },

        destroyHeader: function () {

            if (cc.sys.isObjectValid(this.header))
                this.header.removeFromParent();

            if (this.sessionHeader)
                this.sessionHeader.dispose();

            this.header = null;
            this.sessionHeader = null;
        },

        createFooter: function (owner = null) {

            this.footer = new SlotFooter();

            if(owner)
                owner.addChild(this.footer);

            this.startListenFooterEvents();

            return this.footer;
        },

        destroyFooter: function () {

            if (cc.sys.isObjectValid(this.footer))
                this.footer.removeFromParent();

            if (this.sessionFooter)
                this.sessionFooter.dispose();

            this.footer = null;
            this.sessionFooter = null;
        },

        createPopupController: function () {

            if (this.popupController != null)
                return this.popupController;

            this.popupController = new SlotPopupController();
            this.startListenPopupEvents();

            return this.popupController;
        },

        destroyPopupController: function () {

            if (this.sessionPopupController)
                this.sessionPopupController.dispose();

            this.popupController = null;
            this.sessionPopupController = null;
        },

        createNotifyAuto: function (owner = null) {

            if (this.notifyAuto != null)
                return this.notifyAuto;

            this.notifyAuto = new SlotNotifyAuto();

            if (owner)
                owner.addChild(this.notifyAuto);

            this.notifyAuto.setPosition(cc.visibleRect.center);
            this.notifyAuto.setVisible(false);

            this.startListenNotifyAutoEvents();

            return this.notifyAuto;
        },

        destroyNotifyAuto: function () {

            if (this.sessionNotifyAuto)
                this.sessionNotifyAuto.dispose();

            if (cc.sys.isObjectValid(this.notifyAuto))
                this.notifyAuto.removeFromParent();

            this.notifyAuto = null;
            this.sessionNotifyAuto = null;
        },

        destroy: function () {

            this.destroyHeader();
            this.destroyFooter();

            this.destroyPopupController();
            this.destroyNotifyAuto();
        },

        startListenHeaderEvents: function () {

            let header = this.header;

            if (!header || !this.commander)
                return;

            if (this.sessionHeader) {
                if (this.sessionHeader.commander === this.commander)
                    return;

                this.sessionHeader.dispose();
                this.sessionHeader = null;
            }

            this.sessionHeader = this.commander.createSession();

            this.sessionHeader.on(HEADER.SET.VIP, header.setVip.bind(header));
            this.sessionHeader.on(HEADER.SET.COIN, header.setCoin.bind(header));
            this.sessionHeader.on(HEADER.SET.SOUND, header.setSound.bind(header));
            
            this.sessionHeader.on(HEADER.SET.USER_ID, header.setUserId.bind(header));
            this.sessionHeader.on(HEADER.SET.USERNAME, header.setUserName.bind(header));
            
            this.sessionHeader.on(HEADER.SET.LEVEL, header.setLevel.bind(header));
            this.sessionHeader.on(HEADER.SET.LEVEL_PROGRESS, header.setLevelProgress.bind(header));
            this.sessionHeader.on(HEADER.SET.MATCH_ID, header.setMatchId.bind(header));

            this.sessionHeader.on(HEADER.SET.TWEEN_COIN, header.tweenCoin.bind(header));

            this.sessionHeader.on(HEADER.SET.ON_TAP_BUY, header.setOnTapBuy.bind(header));
            this.sessionHeader.on(HEADER.SET.ON_TAP_HOME, header.setOnTapHome.bind(header));
            this.sessionHeader.on(HEADER.SET.ON_TAP_SOUND, header.setOnTapSound.bind(header));

            this.sessionHeader.on(HEADER.GET.NODE, (callback) => { callback && callback(header.getNode()); });
            this.sessionHeader.on(HEADER.GET.COIN, (callback) => { callback && callback(header.getCoin()); });
            this.sessionHeader.on(HEADER.GET.SOUND, (callback) => { callback && callback(header.getSound()); });
        },

        startListenFooterEvents: function () {

            let footer = this.footer;

            if (!footer || !this.commander)
                return;

            if (this.sessionFooter) {

                if (this.sessionFooter.commander === this.commander)
                    return;

                this.sessionFooter.dispose();
                this.sessionFooter = null;
            }

            this.sessionFooter = this.commander.createSession();

            this.sessionFooter.on(FOOTER.SET.BET_RANGE, footer.setBetRange.bind(footer));
            this.sessionFooter.on(FOOTER.SET.BET_INDEX, footer.setBetIndex.bind(footer));

            this.sessionFooter.on(FOOTER.SET.WIN_COIN, footer.setWinCoin.bind(footer));
            this.sessionFooter.on(FOOTER.SET.AUTO_SPIN_COUNT, footer.setSpinCount.bind(footer));

            this.sessionFooter.on(FOOTER.SET.ON_TAP_SPIN, footer.setOnTapSpin.bind(footer));
            this.sessionFooter.on(FOOTER.SET.ON_HOLD_SPIN, footer.setOnHoldSpin.bind(footer));
            this.sessionFooter.on(FOOTER.SET.ON_TAP_SPIN_COUNT_ITEM, footer.setOnTapSpinCountItem.bind(footer));

            this.sessionFooter.on(FOOTER.SET.ON_TAP_GUIDE, footer.setOnTapGuide.bind(footer));

            this.sessionFooter.on(FOOTER.SET.ON_TAP_MAX_BET, footer.setOnTapMaxBet.bind(footer));
            this.sessionFooter.on(FOOTER.SET.ON_TAP_INCREASE_BET, footer.setOnTapIncreaseBet.bind(footer));
            this.sessionFooter.on(FOOTER.SET.ON_TAP_DECREASE_BET, footer.setOnTapDecreaseBet.bind(footer));
            
            this.sessionFooter.on(FOOTER.SET.ENABLE_TEXT_MESSAGE, footer.setEnableTextMessage.bind(footer));
            this.sessionFooter.on(FOOTER.SET.TEXT_MESSAGE, footer.setTextMessage.bind(footer));
           
            this.sessionFooter.on(FOOTER.SET.TWEEN_WIN_COIN, footer.tweenWinCoin.bind(footer));

            this.sessionFooter.on(FOOTER.SET.ENABLE_GROUP_BUTTON, footer.enableGroupButton.bind(footer));
            this.sessionFooter.on(FOOTER.SET.ENABLE_BUTTON_SPIN, footer.enableButtonSpin.bind(footer));
            this.sessionFooter.on(FOOTER.SET.ENABLE_BUTTON_MAX_BET, footer.enableButtonMaxBet.bind(footer));
            this.sessionFooter.on(FOOTER.SET.ENABLE_BUTTON_INCREASE_DECREASE, footer.enableButtonChangeBet.bind(footer));

            this.sessionFooter.on(FOOTER.SET.BUTTON_SPIN_STATE.DEFAULT, footer.setButtonSpinStateDefault.bind(footer));
            this.sessionFooter.on(FOOTER.SET.BUTTON_SPIN_STATE.AUTO_NUMBER, footer.setButtonSpinStateAutoNumber.bind(footer));
            this.sessionFooter.on(FOOTER.SET.BUTTON_SPIN_STATE.AUTO_INFINITY, footer.setButtonSpinStateAutoInfinity.bind(footer));

            this.sessionFooter.on(FOOTER.GET.NODE, (callback) => { callback && callback(footer.getNode()); });
            this.sessionFooter.on(FOOTER.GET.WIN_COIN, (callback) => { callback && callback(footer.getWinCoin()); });
            this.sessionFooter.on(FOOTER.GET.BET_COIN, (callback) => { callback && callback(footer.getBetCoin()); });
            this.sessionFooter.on(FOOTER.GET.BET_INDEX, (callback) => { callback && callback(footer.getBetIndex()); });
            this.sessionFooter.on(FOOTER.GET.PANEL_AUTO_SHOWING, (callback) => { callback && callback(footer.isPanelAutoShown()); });

            this.sessionFooter.on(FOOTER.FUNC.SHOW_PANEL_AUTO, footer.showPanelAuto.bind(footer));
            this.sessionFooter.on(FOOTER.FUNC.HIDE_PANEL_AUTO, footer.hidePanelAuto.bind(footer));
        },

        startListenPopupEvents: function () {

            let controller = this.popupController;

            if (!controller || !this.commander)
                return;

            if (this.sessionPopupController) {

                if (this.sessionPopupController.commander === this.commander)
                    return;

                this.sessionPopupController.dispose();
                this.sessionPopupController = null;
            }

            this.sessionPopupController = this.commander.createSession();

            this.sessionPopupController.on(POPUP.GET.POPUPS, (callback) => { callback && callback(controller.getPopups()); });
            this.sessionPopupController.on(POPUP.GET.WAITING, (callback) => { callback && callback(controller.getWaiting()); });

            this.sessionPopupController.on(POPUP.FUNC.SHOW_MESSAGE, controller.showMessage.bind(controller));
            this.sessionPopupController.on(POPUP.FUNC.SHOW_CONFIRM, controller.showConfirm.bind(controller));
            this.sessionPopupController.on(POPUP.FUNC.SHOW_WAITING, controller.showWaiting.bind(controller));

            this.sessionPopupController.on(POPUP.FUNC.HIDE_POPUPS, controller.hidePopups.bind(controller));
            this.sessionPopupController.on(POPUP.FUNC.HIDE_WAITING, controller.hideWaiting.bind(controller));
        },

        startListenNotifyAutoEvents: function () {

            let notify = this.notifyAuto;

            if (!notify || !this.commander)
                return;

            if (this.sessionNotifyAuto) {
                if (this.sessionNotifyAuto.commander === this.commander)
                    return;

                this.sessionNotifyAuto.dispose();
                this.sessionNotifyAuto = null;
            }

            this.sessionNotifyAuto = this.commander.createSession();

            this.sessionNotifyAuto.on(NOTIFY_AUTO.FUNC.SHOW_TEXT_START_AUTO, notify.showTextStartAuto.bind(notify));
            this.sessionNotifyAuto.on(NOTIFY_AUTO.FUNC.SHOW_TEXT_END_AUTO, notify.showTextEndAuto.bind(notify));
            this.sessionNotifyAuto.on(NOTIFY_AUTO.FUNC.HIDE, notify.hide.bind(notify));
        },

        getValue: function (eventName) {

            if (!this.commander)
                return undefined;

            let value = undefined;
            this.commander.emit(eventName, (data) => {
                value = data;
            });

            return value;
        },

        getAssets: function () {
            return SlotResource.getResources();
        },

        getSpritesheets: function () {
            return SlotResource.getSpritesheets();
        },

        clearCache: function () {
            SlotResource.clearCache();
        }
    };

    window.SlotCore = SlotCore;
    return SlotCore;
});