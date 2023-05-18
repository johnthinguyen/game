Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotHeader]";

    const JSON = SlotResource.ASSETS.JSON_HEADER;
    const ICON_VIP = SlotResource.SPRITES.ICON_VIP;

    const ICON_SOUND_ON = SlotResource.SPRITES.ICON_SOUND_ON;
    const ICON_SOUND_OFF = SlotResource.SPRITES.ICON_SOUND_OFF;

    const FORMAT_MATCH_ID = "#%d";

    const SlotHeader = cc.Node.extend({

        ctor: function () {

            this._super();

            this.soundEnabled = true;
            this.coin = 0;

            this.onTapBuy = null;
            this.onTapHome = null;
            this.onTapSound = null;

            this.initComponents(JSON);
        },

        initComponents: function (json) {

            if (!json)
                return;

            let root = ccs._load(json);

            this.header = root.getChildByName("header");
            this.header.removeFromParent(false);

            this.addChild(this.header);

            this.header.setContentSize(cc.size(cc.visibleRect.width, this.header.height));
            this.header.setPosition(cc.p(0, 0));

            this.avatar = this.header.getChildByName("avatar");
            this.iconVip = this.avatar.getChildByName("icon_vip");

            this.panelLevel = this.header.getChildByName("panel_level");

            this.textLevel = this.panelLevel.getChildByName("text_level");

            this.textLevelValue = this.panelLevel.getChildByName("text_level_value");
            this.textLevelValue.setString("0");

            this.levelProgress = this.panelLevel.getChildByName("level_bg");

            this.levelProgressBar = this.panelLevel.getChildByName("level_progress");
            this.levelProgressBar.setPercent(0);

            this.levelProgressText = this.panelLevel.getChildByName("text_progress");

            this.textMatchId = this.header.getChildByName("text_match_id");
            this.textMatchId.setString(cc.formatStr(FORMAT_MATCH_ID, 0));

            let panelMid = this.header.getChildByName("panel_mid");

            this.textCoin = panelMid.getChildByName("text_coin");
            this.textCoin.setString("0");

            this.textUserId = panelMid.getChildByName("text_userid");
            SlotUtils.fixTextLayout(this.textUserId);
            this.textUserId.setString(0);

            this.textUserName = panelMid.getChildByName("text_username");
            this.textUserName.setString("");

            SlotUtils.fixTextLayout(this.textUserName);
            SlotUtils.localizeText(this.textUserName);

            this.buttonBuy = this.header.getChildByName("button_buy");
            this.buttonBuy.baseScale = this.buttonBuy.getScale();
            this.buttonBuy.addTouchEventListener(this.onButtonBuyTouched.bind(this));

            this.textBuy = this.buttonBuy.getChildByName("text");

            this.buttonHome = this.header.getChildByName("button_home");
            this.buttonHome.baseScale = this.buttonHome.getScale();
            this.buttonHome.addTouchEventListener(this.onButtonHomeTouched.bind(this));

            this.buttonSound = this.header.getChildByName("button_sound");
            this.buttonSound.baseScale = this.buttonSound.getScale();
            this.buttonSound.addTouchEventListener(this.onButtonSoundTouched.bind(this));

            SlotUtils.localizeSpriteText(this.textBuy, SlotResource.SPRITES.TEXT_BUY);
            SlotUtils.localizeSpriteText(this.textLevel, SlotResource.SPRITES.TEXT_LEVEL);
        },

        setVip: function (value) {

            if (!this.iconVip)
                return;

            let level = Math.min(Math.max(value + 1, 1), 6);
            
            this.iconVip.setVisible(true);
            this.iconVip.setSpriteFrame(cc.formatStr(ICON_VIP, level));
        },

        setCoin: function (value) {

            value = Math.max(0, value);
            this.coin = value;

            if (!this.textCoin)
                return;

            this.textCoin.setString(SlotUtils.formatCoin(value));
        },

        setUserId: function (value) {

            if (!this.textUserId)
                return;

            this.textUserId.setString(value);
        },

        setUserName: function (value) {

            if (!this.textUserName)
                return;

            this.textUserName.setString(value);

            SlotUtils.rollWidget({
                widget: this.textUserName,
                size: cc.size(cc.visibleRect.width * 0.135, this.textUserName.height),
            });
        },

        setLevel: function (value) {

            if (!this.textLevelValue)
                return;

            this.textLevelValue.setString(value);

            let totalWidth = this.textLevel.width + this.textLevelValue.width - 5;
            let startX = (this.levelProgress.width - totalWidth) * 0.5 - 3;

            this.textLevel.setPositionX(startX);
            this.textLevelValue.setPositionX(startX + this.textLevel.width - 5);
        },

        setLevelProgress: function (value, max = 100) {

            if (!this.levelProgressBar || !this.levelProgressText)
                return;

            if (value > max || max <= 0) {

                this.levelProgressBar.setPercent(0);
                this.levelProgressText.setString("");

                this.levelProgressText.setVisible(false);

                return;
            }

            let number = Math.min(Math.max(value, 0), max);
            let percent = number / max;

            this.levelProgressBar.setPercent(percent * 100);

            this.levelProgressText.setString(number + '/' + max);
            this.levelProgressText.setVisible(true);
        },

        setMatchId: function (value) {

            if (!this.textMatchId)
                return;

            this.textMatchId.setString(cc.formatStr(FORMAT_MATCH_ID, value));
        },

        setSound: function (value) {

            if (value === null || value === undefined)
                return;

            let last = this.soundEnabled;
            this.soundEnabled = value;

            if (this.buttonSound) {
                this.buttonSound.loadTexture(value ? ICON_SOUND_ON : ICON_SOUND_OFF, ccui.Widget.PLIST_TEXTURE);
            }

            if (last !== value) {
                if (this.callbackButtonSoundToggle)
                    this.callbackButtonSoundToggle(this, value);
            }
        },

        setOnTapBuy: function (callback) {
            this.onTapBuy = callback;
        },

        setOnTapHome: function (callback) {
            this.onTapHome = callback;
        },

        setOnTapSound: function (callback) {
            this.onTapSound = callback;
        },

        getNode: function () {
            return this.header || null;
        },

        getSound: function () {
            return this.soundEnabled || false;
        },

        getCoin: function () {
            return this.coin || 0;
        },

        tweenCoin: function (startValue, endValue, time = 1.0, callback = null) {

            let targetValue = Math.max(0, endValue);
            this.coin = targetValue;

            if (!this.textCoin || typeof startValue != "number" || typeof targetValue != "number") {
                callback && callback();
                return;
            }

            SlotUtils.tweenCoin(this.textCoin, startValue, targetValue, time, callback);
        },

        onButtonBuyTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {
                this.onTapBuy && this.onTapBuy(button);
            }
        },

        onButtonHomeTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {
                this.onTapHome && this.onTapHome(button);
            }
        },

        onButtonSoundTouched: function (button, type) {

            if (SlotUtils.applyPressedEffect(button, type, button.baseScale || 1.0, 0.95) == SlotUtils.TOUCH_EVENT.TAP) {
               
                let value = !this.getSound();
                this.setSound(value);

                this.onTapSound && this.onTapSound(button, value);
            }
        }
    });

    window.SlotHeader = SlotHeader;
    return SlotHeader;
});