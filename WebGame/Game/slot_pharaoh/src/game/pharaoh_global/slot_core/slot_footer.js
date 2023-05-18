Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotFooter]";

    const JSON = SlotResource.ASSETS.JSON_FOOTER;
    const NUMBERS_AUTO = [10, 30, 50, 100, -9999];
    const DESIGN_HEIGHT = 720.0;

    const SlotFooter = cc.Node.extend({

        ctor: function () {

            this._super();

            this.betRange = [];
            this.betIndex = 0;

            this.winCoin = 0;
            this.numberAuto = NUMBERS_AUTO;

            this.onTapSpin = null;
            this.onHoldSpin = null;

            this.onTapSpinCountItem = null;

            this.onTapHome = null;
            this.onTapGuide = null;
            this.onTapSound = null;
            this.onTapMaxBet = null;

            this.initComponents(JSON);
            this.setButtonSpinStateDefault();
        },

        initComponents: function (json) {

            if (!json)
                return;

            let root = ccs._load(json);

            this.footer = root.getChildByName("footer");
            this.footer.removeFromParent(false);
            this.addChild(this.footer);

            this.footer.setContentSize(cc.size(cc.visibleRect.width, this.footer.height));
            this.footer.setPosition(cc.p(0, 0));

            this.groupMessage = this.footer.getChildByName("group_message");

            this.backgroundMessageLeft = this.footer.getChildByName("bg_message_left");
            this.backgroundMessageRight = this.footer.getChildByName("bg_message_right");

            this.textMessage = this.groupMessage.getChildByName("text_message");
            SlotUtils.fixTextLayout(this.textMessage);
            SlotUtils.localizeText(this.textMessage);

            let background = this.footer.getChildByName("background");

            this.panelBet = background.getChildByName("panel_bet");
            this.panelWin = background.getChildByName("panel_win");

            let scale = Math.min(1, DESIGN_HEIGHT / cc.visibleRect.height);
            scale = Math.max(scale, 0.9);
            let height = this.panelBet.getContentSize().height * scale;

            this.panelBet.setContentSize(cc.size(this.panelBet.getContentSize().width, height));
            this.panelWin.setContentSize(cc.size(this.panelWin.getContentSize().width, height));

            this.textBet = this.panelBet.getChildByName("text_bet");

            this.textBetValue = this.panelBet.getChildByName("text_bet_value");
            this.textBetValue.setString("0");

            this.textWin = this.panelWin.getChildByName("text_win");

            this.textWinValue = this.panelWin.getChildByName("text_win_value");
            this.textWinValue.setString("0");

            this.buttonInc = this.panelBet.getChildByName("button_increase");
            this.buttonInc.baseScale = this.buttonInc.getScale();
            this.buttonInc.addTouchEventListener(this.onButtonIncreaseBetTouched.bind(this));

            this.buttonDec = this.panelBet.getChildByName("button_decrease");
            this.buttonDec.baseScale = this.buttonDec.getScale();
            this.buttonDec.addTouchEventListener(this.onButtonDecreaseBetTouched.bind(this));

            this.buttonSpin = background.getChildByName("button_spin");
            this.buttonSpin.baseScale = this.buttonSpin.getScale();
            this.buttonSpin.addTouchEventListener(this.onButtonSpinTouched.bind(this));

            this.textSpin = this.buttonSpin.getChildByName("text_spin");
            this.textSpinDesc = this.buttonSpin.getChildByName("text_desc");

            this.textSpinCount = this.buttonSpin.getChildByName("text_spin_count");
            this.textSpinCount.setString("0");

            this.buttonGuide = background.getChildByName("button_info");
            this.buttonGuide.baseScale = this.buttonGuide.getScale();
            this.buttonGuide.addTouchEventListener(this.onButtonGuideTouched.bind(this));

            this.buttonMaxBet = background.getChildByName("button_max_bet");
            this.buttonMaxBet.baseScale = this.buttonMaxBet.getScale();
            this.buttonMaxBet.addTouchEventListener(this.onButtonMaxBetTouched.bind(this));

            this.textMaxBet = this.buttonMaxBet.getChildByName("text_max_bet");

            this.initAutoSpin(background);

            SlotUtils.localizeSpriteText(this.textBet, SlotResource.SPRITES.TEXT_BET);
            SlotUtils.localizeSpriteText(this.textWin, SlotResource.SPRITES.TEXT_WIN);
            SlotUtils.localizeSpriteText(this.textSpin, SlotResource.SPRITES.TEXT_SPIN);
            SlotUtils.localizeSpriteText(this.textMaxBet, SlotResource.SPRITES.TEXT_MAX_BET);

            SlotUtils.rollWidget({
                widget: this.textBet,
                size: cc.size(cc.visibleRect.width * 0.05, this.textBet.getContentSize().height)
            });

            SlotUtils.rollWidget({
                widget: this.textMaxBet,
                size: cc.size(this.buttonMaxBet.getContentSize().width * 0.9, this.textMaxBet.getContentSize().height)
            });
        },

        initAutoSpin: function (node) {

            if (!node)
                return;

            this.panelAutoSpinBusy = false;

            this.panelAutoSpin = node.getChildByName("panel_auto");
            this.panelAutoSpin.setVisible(false);

            for (let i = 0; i < NUMBERS_AUTO.length; i++) {
                
                let item = this.panelAutoSpin.getChildByName(cc.formatStr("auto_play_%d", i));
                if (!item)
                    break;

                item.number = this.numberAuto[i];
                item.baseScale = item.getScale();
                item.addTouchEventListener(this.onSpinCountItemTouched.bind(this));
            }
        },

        setBetRange: function (value) {
            cc.log("setBetRange vl", value);
            this.betRange = value || [];
        },

        setBetIndex: function (value) {

            this.betIndex = Math.max(0, value);
            this.betIndex = Math.min(this.betIndex, this.betRange.length - 1);

            let betCoin = this.betRange[this.betIndex] || 0;
            cc.log("betRange", this.betRange,"betIndex", this.betIndex,"betCoin", betCoin);
            if (!this.textBetValue)
                return;

            this.textBetValue.setString(SlotUtils.formatCoin(betCoin));
        },

        setWinCoin: function (value) {

            if (!this.textWinValue)
                return;

            let target = Math.max(0, value);
            this.winCoin = target;

            this.textWinValue.setString(SlotUtils.formatCoin(target));
        },

        setSpinCount: function (value) {

            if (!this.textSpinCount)
                return;

            let target = Math.max(0, value);
            this.textSpinCount.setString(SlotUtils.formatCoin(target));
        },

        setOnTapSpin: function (callback) {
            this.onTapSpin = callback;
        },

        setOnHoldSpin: function (callback) {
            this.onHoldSpin = callback;
        },

        setOnTapIncreaseBet: function (callback) {
            this.onTapIncreaseBet = callback;
        },

        setOnTapDecreaseBet: function (callback) {
            this.onTapDecreaseBet = callback;
        },

        setOnTapGuide: function (callback) {
            this.onTapGuide = callback;
        },

        setOnTapMaxBet: function (callback) {
            this.onTapMaxBet = callback;
        },
        
        setOnTapSpinCountItem: function (callback) {
            this.onTapSpinCountItem = callback;
        },

        tweenWinCoin: function (startValue, endValue, time = 1.0, callback = null) {

            if (!this.textWinValue || typeof startValue != "number" || typeof endValue != "number") {
                callback && callback();
                return;
            }

            let begin = Math.max(0, startValue);
            let target = Math.max(0, endValue);

            this.winCoin = target;

            SlotUtils.tweenCoin(this.textWinValue, begin, target, time, callback);
        },
 
        setEnableTextMessage: function(enable = true){
            this.groupMessage.setVisible(enable);
            this.backgroundMessageLeft.setVisible(enable);
            this.backgroundMessageRight.setVisible(enable);
        },

        setTextMessage: function (message) {

            if (!this.textMessage)
                return;

            this.textMessage.setString(message || "");

            SlotUtils.rollWidget({
                widget: this.textMessage,
                size: cc.size(this.groupMessage.width * 0.9, this.textMessage.height * 1.2)
            });
        },

        getNode: function () {
            return this.footer || null;
        },

        getWinCoin: function () {
            return this.winCoin || 0;
        },

        getBetCoin: function () {
            return this.betRange[this.betIndex] || 0;
        },

        getBetIndex: function () {
            return this.betIndex || 0;
        },

        showPanelAuto: function (callback = null) {

            if (this.panelAutoSpinBusy)
                return;

            let finish = callback;

            this.panelAutoSpinBusy = true;

            this.panelAutoSpin.stopAllActions();
            this.panelAutoSpin.setOpacity(0);
            this.panelAutoSpin.setVisible(false);

            if (!this.panelAutoSpin.overlay) {

                let layout = ccui.Layout.create();
                layout.setContentSize(cc.size(cc.winSize.width * 10, cc.winSize.height * 10));
                layout.setAnchorPoint(cc.p(0.5, 0.5));
                layout.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
                
                layout.setTouchEnabled(true);
                layout.setSwallowTouches(false);
                layout.addTouchEventListener((button, type) => {
                    if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {

                        if (this.isPanelAutoShown())
                            this.hidePanelAuto();
                    }
                });

                this.panelAutoSpin.overlay = layout;
                this.footer.addChild(layout);
            }

            this.panelAutoSpin.overlay && this.panelAutoSpin.overlay.setVisible(true);

            this.panelAutoSpin.runAction(cc.sequence(
                cc.show(),
                cc.fadeIn(0.2),
                cc.callFunc(() => {
                    this.panelAutoSpinBusy = false;
                    finish && finish(this);
                })
            ));
        },

        hidePanelAuto: function (callback = null) {

            if (this.panelAutoSpinBusy)
                return;

            let finish = callback;

            this.panelAutoSpinBusy = true;

            this.panelAutoSpin.stopAllActions();
            this.panelAutoSpin.setOpacity(255);
            this.panelAutoSpin.setVisible(true);
            
            this.panelAutoSpin.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.hide(),
                cc.callFunc(() => {
                    this.panelAutoSpin.overlay && this.panelAutoSpin.overlay.setVisible(false);
                    this.panelAutoSpinBusy = false;
                    finish && finish(this);
                })
            ));
        },

        isPanelAutoShown: function () {
            return this.panelAutoSpin && this.panelAutoSpin.isVisible();
        },

        enableGroupButton: function (isEnable) {
            this.enableButtonSpin(isEnable);
            this.enableButtonMaxBet(isEnable);
            this.enableButtonChangeBet(isEnable);
        },

        enableButtonSpin: function (isEnable = true) {
            this.buttonSpin.setTouchEnabled(isEnable);
            SlotUtils.applyGreyscaleNode(this.buttonSpin, !isEnable);
        },

        enableButtonMaxBet: function (isEnable = true) {
            this.buttonMaxBet.setTouchEnabled(isEnable);
            SlotUtils.applyGreyscaleNode(this.buttonMaxBet, !isEnable);
        },

        enableButtonChangeBet: function (isEnable = true) {

            this.buttonInc.setTouchEnabled(isEnable);
            this.buttonDec.setTouchEnabled(isEnable);

            SlotUtils.applyGreyscaleNode(this.buttonInc, !isEnable);
            SlotUtils.applyGreyscaleNode(this.buttonDec, !isEnable);
        },

        setButtonSpinStateDefault: function () {

            this.textSpinDesc.setVisible(true);
            this.textSpinCount.setVisible(false);

            SlotUtils.localizeSpriteText(this.textSpinDesc, SlotResource.SPRITES.TEXT_HOLD_FOR_AUTO);
            SlotUtils.localizeSpriteText(this.textSpin, SlotResource.SPRITES.TEXT_SPIN);
        },

        setButtonSpinStateAutoNumber: function () {

            this.textSpinDesc.setVisible(false);
            this.textSpinCount.setVisible(true);

            SlotUtils.localizeSpriteText(this.textSpin, SlotResource.SPRITES.TEXT_AUTO);
        },

        setButtonSpinStateAutoInfinity: function () {

            this.textSpinDesc.setVisible(true);
            this.textSpinCount.setVisible(false);

            SlotUtils.localizeSpriteText(this.textSpinDesc, SlotResource.SPRITES.TEXT_TAP_TO_STOP);
            SlotUtils.localizeSpriteText(this.textSpin, SlotResource.SPRITES.TEXT_AUTO);
        },
 
        scheduleHold: function () {
            let samePosition = cc.pLength(cc.pSub(this.buttonSpin.endPostition, this.buttonSpin.startPosition)) <= SlotUtils.TOUCH_DISTANCE_LIMITED;
            if (samePosition)
                this.onHoldSpin && this.onHoldSpin(this.buttonSpin);
        },

        onButtonSpinTouched: function (button, type) {

            let touchType = SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95);

            if (type === ccui.Widget.TOUCH_BEGAN) {

                button.startPosition = button.getTouchBeganPosition();
                button.endPostition = button.startPosition;

                this.unscheduleAllCallbacks();
                this.scheduleOnce(this.scheduleHold.bind(this), SlotUtils.HOLD_TIME / 1000);

                return;

            } else if (type === ccui.Widget.TOUCH_MOVED) {
                button.endPostition = button.getTouchMovePosition();
                return;
            } else if (type === ccui.Widget.TOUCH_CANCELED) {
                this.unscheduleAllCallbacks();
                return;
            } else if (type === ccui.Widget.TOUCH_ENDED) {
                button.endPostition = button.getTouchEndPosition();
                this.unscheduleAllCallbacks();
            }

            if (touchType == SlotUtils.TOUCH_EVENT.TAP) {
                this.unscheduleAllCallbacks();
                this.onTapSpin && this.onTapSpin(button);
            }
        },

        onButtonGuideTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {
                this.onTapGuide && this.onTapGuide(button);
            }
        },

        onButtonMaxBetTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {
                
                this.betIndex = Math.max(0, this.betRange.length - 1);
                this.setBetIndex(this.betIndex);

                this.onTapMaxBet && this.onTapMaxBet(button, this.getBetCoin());
            }
        },

        onButtonIncreaseBetTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {

                this.betIndex++;
                if (this.betIndex >= this.betRange.length)
                    this.betIndex = 0;

                this.setBetIndex(this.betIndex);

                this.onTapIncreaseBet && this.onTapIncreaseBet(button, this.getBetCoin());
            }
        },

        onButtonDecreaseBetTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {

                this.betIndex--;
                if (this.betIndex < 0)
                    this.betIndex = Math.max(0, this.betRange.length - 1);

                this.setBetIndex(this.betIndex);

                this.onTapDecreaseBet && this.onTapDecreaseBet(button, this.getBetCoin());
            }
        },

        onSpinCountItemTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {

                if (this.isPanelAutoShown())
                    this.hidePanelAuto();

                this.onTapSpinCountItem && this.onTapSpinCountItem(button, button.number);
            }
        }
    });

    window.SlotFooter = SlotFooter;
    return SlotFooter;
});