"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var ReportBugs = ReportBugs || {};
ReportBugs.ReportBugButton = ccui.Widget.extend({
    ctor: function ctor() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        this._super();

        props.buttonIcon = props.buttonIcon || ReportBugs.Config.BUTTON_ICON;
        props.buttonImage = props.buttonImage || ReportBugs.Config.BUTTON_IMAGE;
        props.buttonWidth = props.buttonWidth || ReportBugs.Config.BUTTON_WIDTH;
        props.buttonHeight = props.buttonHeight || ReportBugs.Config.BUTTON_HEIGHT;

        props.fontName = props.fontName || ReportBugs.Config.FONT_NAME;
        props.fontSize = props.fontSize || ReportBugs.Config.FONT_SIZE;
        props.textPosition = props.textPosition || ReportBugs.ReportBugButton.TEXT_AT_LEFT;
        props.reasonSelectorPath = props.reasonSelectorPath || ReportBugs.Config.REASON_SELECTOR_PATH;

        this.props = props;
        this.initNodes(props);
        this.initState(props);

        //this.disableButton();
        this.setVisible(false);
    },

    initNodes: function initNodes(props) {
        this.setContentSize(cc.size(props.buttonWidth, props.buttonHeight));
        this.setAnchorPoint(cc.p(0.5, 0.5));

        this.imgButton = this.createImageView(props.buttonImage);
        this.imgButton.setNormalizedPosition(cc.p(0.5, 0.5));
        this.imgButton.setAnchorPoint(cc.p(0.5, 0.5));
        this.imgButton.setScale(props.buttonWidth / this.imgButton.width, props.buttonHeight / this.imgButton.height);
        this.addChild(this.imgButton);

        this.imgIcon = this.createImageView(props.buttonIcon);
        this.imgIcon.setNormalizedPosition(cc.p(0.5, 0.5));
        this.addChild(this.imgIcon);

        this.txtMessage = new ccui.Text("", props.fontName, props.fontSize);
        this.addChild(this.txtMessage);
        switch (props.textPosition) {
            case ReportBugs.ReportBugButton.TEXT_AT_LEFT:
                this.txtMessage.setAnchorPoint(cc.p(1.0, 0.5));
                this.txtMessage.setPosition(cc.p(-10, props.buttonHeight * 0.5));
                break;

            case ReportBugs.ReportBugButton.TEXT_AT_RIGHT:
                this.txtMessage.setAnchorPoint(cc.p(0.0, 0.5));
                this.txtMessage.setPosition(cc.p(props.buttonWidth + 10, props.buttonHeight * 0.5));
                break;

            case ReportBugs.ReportBugButton.TEXT_AT_TOP:
                this.txtMessage.setAnchorPoint(cc.p(0.5, 0.0));
                this.txtMessage.setPosition(cc.p(props.buttonWidth * 0.5, props.buttonHeight + 10));
                break;

            case ReportBugs.ReportBugButton.TEXT_AT_BOTTOM:
                this.txtMessage.setAnchorPoint(cc.p(0.5, 1.0));
                this.txtMessage.setPosition(cc.p(props.buttonWidth * 0.5, -10));
                break;
        }
        Localize.handleTextNodeFont(this.txtMessage);
        NodeUtils.fixTextLayout(this.txtMessage);

        this.setTouchEnabled(true);
        this.addTouchEventListener(this.onTouched.bind(this));
    },

    initState: function initState(props) {
        this.gameId = props.gameId || 0;
        this.roomId = props.roomId || 0;
        this.matchId = props.matchId || 0;

        this.progress = null;
        this.progressResult = null;
        this.selectedReason = -1;

        this.isReady = true;
        this.isSending = false;
        this.isProgressing = false;
        this.isProgressCompleted = false;
    },

    onEnter: function onEnter() {
        this._super();

        this.loadConfig();
    },

    onExit: function onExit() {
        this._super();
    },

    // Utils

    createImageView: function createImageView(path) {
        var imageType = path.charAt(0) === "#" ? ccui.Widget.PLIST_TEXTURE : ccui.Widget.LOCAL_TEXTURE;
        var imagePath = path.charAt(0) === "#" ? path.substring(1) : path;
        return new ccui.ImageView(imagePath, imageType);
    },

    createSprite: function createSprite(path) {
        if (path.charAt(0) === "#") {
            var sprite = new cc.Sprite();
            sprite.setSpriteFrame(path.substring(1));
            return sprite;
        } else {
            return new cc.Sprite(path);
        }
    },

    // Common

    startCaptureProgress: function startCaptureProgress() {
        if (this.isProgressing || this.isSending) {
            return;
        }

        this.selectedReason = -1;

        var targetWidth = ReportBugs.Config.IMAGE_WIDTH;
        var targetHeight = Math.round(cc.winSize.height * (targetWidth / cc.winSize.width));

        var captureOptions = {
            width: targetWidth,
            height: targetHeight,

            flip: true,
            compress: true,
            encodeImage: true,
            encodeBase64: true
        };

        var progress = new ReportBugs.ScreenCaptureProgress();
        if (progress.startProgress(captureOptions)) {
            this.isProgressing = true;
            this.isProgressCompleted = false;

            this.progress = progress;
            this.progress.onProgressStarted = this.onProgressStarted.bind(this);
            this.progress.onProgressCompleted = this.onProgressCompleted.bind(this);
        }
    },

    stopCaptureProgress: function stopCaptureProgress() {
        if (this.progress) {
            this.progress.stopProgress();
            this.progress = null;

            this.isProgressing = false;
            this.isProgressCompleted = false;

            this.txtMessage.stopAllActions();
            this.txtMessage.setString("");
        }
    },

    // Popup reason selector

    updateMatchInfo: function updateMatchInfo(gameId, roomId, matchId) {
        this.gameId = gameId;
        this.roomId = roomId;
        this.matchId = matchId;
    },

    createCooldownNode: function createCooldownNode() {
        var overlay = this.createImageView(this.props.buttonImage);
        overlay.setScale(this.imgButton.scaleX, this.imgButton.scaleY);
        overlay.setColor(cc.color.BLACK);
        overlay.setOpacity(0xaa);

        var node = new cc.Node();
        node.setNormalizedPosition(cc.p(0.5, 0.5));
        this.addChild(node);

        var stencilNode = this.createSprite(this.props.buttonImage);
        stencilNode.setContentSize(this.getContentSize());

        var clippingNode = new cc.ClippingNode(stencilNode);
        //clippingNode.setNormalizedPosition(cc.p(0.5, 0.5));
        clippingNode.addChild(overlay);
        node.addChild(clippingNode);

        this.clippingNode = clippingNode;
        this.cooldownNode = stencilNode;
    },

    enableButton: function enableButton() {
        this.isReady = true;

        if (this.cooldownNode) {
            this.cooldownNode.stopAllActions();
            this.cooldownNode.setPosition(0, -this.height);
        }
    },

    disableButton: function disableButton() {
        if (!this.cooldownNode) {
            this.createCooldownNode();
        }

        this.isReady = false;
        this.cooldownNode.setPosition(0, 0);
    },

    startCooldown: function startCooldown(duration) {
        var _this = this;

        if (!this.cooldownNode) {
            this.createCooldownNode();
        }

        this.disableButton();
        this.cooldownNode.runAction(cc.sequence(cc.moveTo(duration, 0, -this.height), cc.callFunc(function () {
            _this.isReady = true;
        })));
    },

    stopCooldown: function stopCooldown() {
        this.enableButton();
    },

    showReasonSelector: function showReasonSelector() {
        var _this2 = this;

        var popup = new ReportBugs.ReportBugReasonSelector({ ccsPath: this.props.reasonSelectorPath });
        popup.show();

        popup.okayCallback = function () {
            _this2.selectedReason = popup.reasonId;
            _this2.sendReportIfShould();
        };

        popup.cancelCallback = function () {
            _this2.stopCaptureProgress();
            _this2.enableButton();
        };

        popup.clickSoundPlayer = this.props.clickSoundPlayer;
    },

    sendReportIfShould: function sendReportIfShould() {
        if (!this.isSending && this.selectedReason > -1 && this.isProgressCompleted && this.progressResult) {
            var gameId = this.gameId;
            var roomId = this.roomId;
            var matchId = this.matchId;
            var reasonId = this.selectedReason;
            var dataFile = this.progressResult;
            //jsb.fileUtils.writeStringToFile(dataFile, "D:/test.txt");

            this.txtMessage.setString(ReportBugs.Localize.getText("LANG_MESSAGE_SENDING"));
            this.txtMessage.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(ReportBugs.Config.FADE_OUT_DURATION), cc.fadeIn(ReportBugs.Config.FADE_IN_DURATION))));

            this.isSending = true;
            this.sendScreenCaptureGame(dataFile, gameId, matchId, roomId, reasonId, this.onSentScreenCaptureGame.bind(this), this.onErrorWhenSendScreenCaptureGame.bind(this));
        }
    },

    displayMessage: function displayMessage(message, duration) {
        this.txtMessage.stopAllActions();
        this.txtMessage.setString(message);

        this.txtMessage.runAction(cc.sequence(cc.fadeIn(ReportBugs.Config.FADE_IN_DURATION), cc.delayTime(duration || 0), cc.fadeOut(ReportBugs.Config.FADE_OUT_DURATION)));
    },

    playClickSound: function playClickSound() {
        var clickSoundPlayer = this.props.clickSoundPlayer;
        var clickSoundPlayerType = typeof clickSoundPlayer === "undefined" ? "undefined" : _typeof(clickSoundPlayer);
        if (clickSoundPlayerType === "function") {
            clickSoundPlayer();
        } else if (clickSoundPlayer === "string") {
            soundHelper.playEffect(clickSoundPlayer);
        }
    },

    // Api from server

    loadConfig: function loadConfig() {
        // WebService.getScreenCaptureGameInfo(this.onLoadConfig.bind(this));
    },

    sendScreenCaptureGame: function sendScreenCaptureGame(dataFile, gameId, matchId, roomId, reasonId, completeHandler, errorHandler) {
        // WebService.sendScreenCaptureGame(dataFile, gameId, matchId, roomId, reasonId, completeHandler, errorHandler);
    },

    // Events handler

    onTouched: function onTouched(btn, type) {
        if (!this.isReady || this.isProgressing || this.isSending) {
            return;
        }

        if (type === ccui.Widget.TOUCH_ENDED) {
            this.playClickSound();

            this.disableButton();
            this.startCaptureProgress();
        }
    },

    onProgressStarted: function onProgressStarted() {
        var _this3 = this;

        if (!this.isProgressing) {
            return;
        }

        this.txtMessage.stopAllActions();
        this.txtMessage.setString("0%");
        this.txtMessage.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(ReportBugs.Config.FADE_OUT_DURATION), cc.callFunc(function () {
            var percent = _this3.progress ? Math.round(_this3.progress.progress * 100) : 100;
            _this3.txtMessage.setString(percent + "%");
        }), cc.fadeIn(ReportBugs.Config.FADE_IN_DURATION))));

        var overlay = new cc.LayerColor();
        overlay.setColor(cc.color.WHITE);
        overlay.runAction(cc.sequence(cc.fadeOut(ReportBugs.Config.CAPTURE_EFFECT_DURATION), cc.delayTime(0.1), cc.removeSelf(), cc.callFunc(function () {
            _this3.showReasonSelector();
        })));
        cc.director.getRunningScene().addChild(overlay, 999999999);
    },

    onProgressCompleted: function onProgressCompleted(result) {
        if (!this.isProgressing) {
            return;
        }

        this.progress = null;
        this.progressResult = result;

        this.isSending = false;
        this.isProgressing = false;
        this.isProgressCompleted = true;

        this.displayMessage("100%");
        this.sendReportIfShould();
    },

    // API responsed handlers


    onLoadConfig: function onLoadConfig(response) {
        cc.log("[ReportBugButton]", "onLoadConfig: %j", response);

        var isEnable = ReportBugs.Config.DEFAULT_ENABLE;
        var nextTime = ReportBugs.Config.DEFAULT_COOLDOWN;

        var resultCode = response.Result;
        if (resultCode === 1) {
            var data = response.Data;
            if (data) {
                isEnable = data.IsEnable;
                nextTime = data.NextTime;
            }

            if (isEnable) {
                this.setVisible(true);
                this.enableButton();
            } else {
                if (nextTime > 0) {
                    this.startCooldown(nextTime);
                    this.setVisible(true);
                } else {
                    this.setVisible(false);
                }
            }
        } else {
            this.setVisible(false);
        }
    },

    onSentScreenCaptureGame: function onSentScreenCaptureGame(response) {
        cc.log("[ReportBugButton]", "onSentScreenCaptureGame: %j", response);

        this.isSending = false;

        var isEnable = ReportBugs.Config.DEFAULT_ENABLE;
        var nextTime = ReportBugs.Config.DEFAULT_COOLDOWN;

        var resultCode = response.Result;
        if (resultCode === 1) {
            var data = response.Data;
            if (data) {
                isEnable = data.IsEnable;
                nextTime = Math.max(nextTime, data.NextTime);
            }

            this.displayMessage(ReportBugs.Localize.getText("LANG_MESSAGE_SENT"), ReportBugs.Config.MESSAGE_DURATION);
        } else {
            this.displayMessage(ReportBugs.Localize.getText("LANG_MESSAGE_SEND_FAILED"), ReportBugs.Config.MESSAGE_DURATION);
        }

        if (isEnable) {
            this.enableButton();
        } else {
            if (nextTime > 0) {
                this.startCooldown(nextTime);
            } else {
                this.disableButton();
            }
        }
    },

    onErrorWhenSendScreenCaptureGame: function onErrorWhenSendScreenCaptureGame(error) {
        cc.log("[ReportBugButton]", "onErrorWhenSendScreenCaptureGame: %j", error);

        this.isSending = false;
        this.displayMessage(ReportBugs.Localize.getText("LANG_MESSAGE_SEND_FAILED"), ReportBugs.Config.MESSAGE_DURATION);
    }
});

ReportBugs.ReportBugButton.TEXT_AT_LEFT = "LEFT";
ReportBugs.ReportBugButton.TEXT_AT_RIGHT = "RIGHT";
ReportBugs.ReportBugButton.TEXT_AT_TOP = "TOP";
ReportBugs.ReportBugButton.TEXT_AT_BOTTOM = "BOTTOM";