"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var ReportBugs = ReportBugs || {};
ReportBugs.ReportBugReasonSelector = cc.Layer.extend({
    ctor: function ctor() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { ccsPath: ReportBugs.Config.REASON_SELECTOR_PATH };

        this._super();

        this.initNodes(props);
        this.initState(props);

        this.selectReason(0);
        this.updateUI();

        return true;
    },

    initNodes: function initNodes(props) {
        var _this = this;

        var size = cc.winSize;

        // Prevent touch through layer
        var overlay = ccui.Layout.create();
        overlay.setPosition(cc.p(0, 0));
        overlay.setAnchorPoint(cc.p(0, 0));
        overlay.setContentSize(this.getContentSize());
        overlay.setTouchEnabled(true);
        overlay.setBackGroundColor(cc.color(0, 0, 0));
        overlay.setBackGroundColorOpacity(156);
        overlay.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        this.addChild(overlay, 0);

        // Main UI
        this.mainLayer = ccs._load(props.ccsPath);
        //this.mainLayer.setScaleY(this.getContentSize().height / this.mainLayer.getContentSize().height);
        this.addChild(this.mainLayer);

        this.mainLayer.x = size.width * 0.5;
        this.mainLayer.y = size.height * 0.5;
        this.mainLayer.setAnchorPoint(cc.p(0.5, 0.5));

        this.mainPanel = this.mainLayer.getChildByName("pnlMain");

        this.showPosition = this.mainPanel.getPosition();
        this.hidePosition = cc.p(this.showPosition.x, cc.winSize.height + this.showPosition.y);

        this.txtTitle = this.mainPanel.getChildByName("txtTitle");

        this.btnOkay = this.mainPanel.getChildByName("btnOkay");
        this.btnOkay.addTouchEventListener(this.onButtonTouched, this);
        this.btnOkay.setTouchEnabled(true);

        this.btnCancel = this.mainPanel.getChildByName("btnCancel");
        this.btnCancel.addTouchEventListener(this.onButtonTouched, this);
        this.btnCancel.setTouchEnabled(true);

        this.pnlReasons = [this.mainPanel.getChildByName("pnlReason0"), this.mainPanel.getChildByName("pnlReason1"), this.mainPanel.getChildByName("pnlReason2")];
        this.pnlReasons.forEach(function (pnl, index) {
            pnl.addTouchEventListener(_this.onTouchReason.bind(_this, index));
            pnl.setTouchEnabled(true);

            var checkbox = pnl.getChildByName("checkbox");
            checkbox.setTouchEnabled(false);
        });
    },

    initState: function initState(props) {},

    selectReason: function selectReason(index) {
        if (index > -1 && index < this.pnlReasons.length) {
            this.pnlReasons.forEach(function (pnl) {
                var checkbox = pnl.getChildByName("checkbox");
                checkbox.setSelected(false);
            });

            var checkbox = this.pnlReasons[index].getChildByName("checkbox");
            checkbox.setSelected(true);

            this.reasonId = index;
        }
    },

    updateUI: function updateUI() {
        this.pnlReasons.forEach(function (pnl, index) {
            var txt = pnl.getChildByName("txtMessage");
            var content = ReportBugs.Localize.getText("LANG_MESSAGE_REASON_" + index);

            Localize.handleTextNodeFont(txt);
            NodeUtils.fixTextLayout(txt);
            txt.setString(content);
        });

        if (this.txtTitle) {
            var txt = this.txtTitle;
            var content = ReportBugs.Localize.getText("LANG_TITLE_POPUP_REASON_SELECTOR");

            txt.setString(content.toUpperCase());
            NodeUtils.fixTextLayout(txt);
            Localize.handleTextNodeFont(txt, { isBold: true });
        }

        if (this.btnOkay) {
            var _txt = this.btnOkay.getChildByName("txt");
            var _content = ReportBugs.Localize.getText("LANG_LABEL_OKAY");

            _txt.setString(_content.toUpperCase());
            NodeUtils.fixTextLayout(_txt);
            Localize.handleTextNodeFont(_txt, { isBold: true });
        }

        if (this.btnCancel) {
            var _txt2 = this.btnCancel.getChildByName("txt");
            var _content2 = ReportBugs.Localize.getText("LANG_LABEL_CANCEL");

            _txt2.setString(_content2.toUpperCase());
            NodeUtils.fixTextLayout(_txt2);
            Localize.handleTextNodeFont(_txt2, { isBold: true });
        }
    },

    show: function show(callback) {
        var _this2 = this;

        if (this.isBusy) {
            return;
        } else {
            this.isBusy = true;
        }

        if (!this.parent) {
            var root = cc.director.getRunningScene();
            root.addChild(this, 999999999);
        }

        this.updateUI();
        this.setVisible(true);

        this.mainLayer.setVisible(true);
        this.mainPanel.setVisible(true);

        this.mainPanel.setPosition(this.hidePosition);
        var action = cc.sequence(cc.moveTo(0.6, this.showPosition.x, this.showPosition.y).easing(cc.easeBackOut(2.0)), cc.callFunc(function () {
            _this2.isBusy = false;

            if (typeof callback === "function") {
                callback(_this2);
            }
        }));
        this.mainPanel.runAction(action);
    },

    hide: function hide(closeCallback) {
        var _this3 = this;

        if (this.isBusy) {
            return;
        } else {
            this.isBusy = true;
        }

        this.mainPanel.setPosition(this.showPosition);

        var action = cc.sequence(cc.moveTo(0.6, this.hidePosition.x, this.hidePosition.y).easing(cc.easeBackIn(2.0)), cc.callFunc(function () {
            var callback = null;
            var command = _this3.command;

            if (command === "btnOkay") {
                callback = _this3.okayCallback;
            } else if (command === "btnCancel") {
                callback = _this3.cancelCallback;
            }

            if (typeof callback === "function") {
                callback();
            }

            if (typeof closeCallback === "function") {
                closeCallback(_this3);
            }

            _this3.removeFromParent();
            _this3.isBusy = false;
        }));
        this.mainPanel.runAction(action);
    },

    // Button handler

    playClickSound: function playClickSound() {
        var clickSoundPlayer = this.clickSoundPlayer;
        var clickSoundPlayerType = typeof clickSoundPlayer === "undefined" ? "undefined" : _typeof(clickSoundPlayer);
        if (clickSoundPlayerType === "function") {
            clickSoundPlayer();
        } else if (clickSoundPlayer === "string") {
            soundHelper.playEffect(clickSoundPlayer);
        }
    },

    onButtonTouched: function onButtonTouched(btn, type) {
        if (GameUtils.makeEffectButton(btn, type, 1.0)) {
            this.playClickSound();

            this.command = btn.name;
            this.hide();
        }
    },

    onTouchReason: function onTouchReason(index, btn, type) {
        if (GameUtils.makeEffectButton(btn, type, 1.0, 0.975)) {
            this.playClickSound();

            this.selectReason(index);
        }
    }
});