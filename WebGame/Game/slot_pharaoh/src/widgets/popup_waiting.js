"use strict";

var TIME_DISMISS = 15;
var Z_WAITING = 10000000;
var GAMEPROMPT_LAYER_TAG = 100000000;

var PopupWaiting = PopupAbstract.extend({
    isShow: false,
    isCanClose: false,
    size: null,
    _txtMsg: null,
    _txtMsgTimeOut: null,
    _loading: null,
    VQNT_FONT_OpenSans_Bold: { type: "font", name: "OpenSansBold", srcs: ["hoYeah/Fonts/OpenSans-Bold.ttf"] },
    _callbackOutOfTime: function _callbackOutOfTime() {},
    _callbackClose: function _callbackClose() {},
    ctor: function ctor() {
        var dpu = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.075;

        this._super();
        var colorBg = cc.color(0, 0, 0, 150);
        this.initWithColor(colorBg); //implement initWithColor to PopupAbstract
        this.size = cc.director.getVisibleSize();
        this.setAnchorPoint(cc.p(0, 0));
        this.ignoreAnchorPointForPosition(false);
        this.setContentSize(this.size);
        this.removeTouch();

        var _mainNode = cc.Node.create();
        _mainNode.setPosition(cc.p(this.size.width / 2, this.size.height / 2));
        this.addChild(_mainNode, 1);

        var pnl = ccui.Widget.create();
        pnl.setContentSize(this.size);
        pnl.setName("BACKGROUNDNODE");
        pnl.setAnchorPoint(cc.p(0, 0));
        pnl.setPosition(cc.p(0, 0));
        pnl.setTouchEnabled(true);
        pnl.addClickEventListener(this.onClickBackgroundForClose.bind(this)); //implement later
        this.addChild(pnl, 0);

        // var wildcard = "res/loading/{0}.png";
        var wildcard = cc.path.join(cc.loader.resPath, "res/loading/{0}.png");
        this._loading = new cc.Sprite();
        this._loading.setPosition(cc.p(0, 20));
        _mainNode.addChild(this._loading);

        var loadingAni = cc.Animation.create();
        loadingAni.setDelayPerUnit(dpu);
        for (var i = 1; i<=15; i++) {
            var path = StringUtils.formatString(wildcard, i);
            loadingAni.addSpriteFrameWithFile(StringUtils.formatString(wildcard, i));
        }

        var action = cc.repeatForever(cc.Animate.create(loadingAni));
        action.retain();
        this._loading.runAction(action);

        this._txtMsg = ccui.Text.create(Localize.lang.ListWaitingText.txtLoading, this.getFontName(this.VQNT_FONT_OpenSans_Bold), 30); //Label::create(LanguageManager::getInstance()->getString("key_waiting_default"), FONT_DEFAULT, 30);
        //this._txtMsg.setAlignment(ccui.TEXT_ALIGNMENT_CENTER,ccui.TEXT_ALIGNMENT_CENTER);
        this._txtMsg.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        this._txtMsg.verticalAlign = cc.TEXT_ALIGNMENT_CENTER;
        this._txtMsg.setPosition(cc.p(0, -100));
        this._txtMsg.setTextAreaSize(cc.size(450, 250));
        _mainNode.addChild(this._txtMsg, 1);
        GameUtils.TextHandler(this._txtMsg);

        this._txtMsgTimeOut = ccui.Text.create(Localize.lang.ListWaitingText.txtTimedOut, this.getFontName(this.VQNT_FONT_OpenSans_Bold), 30); //Label::create(LanguageManager::getInstance()->getString("key_network_failure"), FONT_DEFAULT, 30);
        //this._txtMsgTimeOut.setAlignment(ccui.TEXT_ALIGNMENT_CENTER,ccui.TEXT_ALIGNMENT_CENTER);
        this._txtMsgTimeOut.textAlign = cc.TEXT_ALIGNMENT_CENTER;
        this._txtMsgTimeOut.verticalAlign = cc.TEXT_ALIGNMENT_CENTER;
        this._txtMsgTimeOut.setPosition(cc.p(0, 0));
        this._txtMsgTimeOut.setTextAreaSize(cc.size(450, 250));
        _mainNode.addChild(this._txtMsgTimeOut);
        GameUtils.TextHandler(this._txtMsgTimeOut);
        this._txtMsgTimeOut.setVisible(false);

        this.isCanClose = false;

        return true;
    },
    getFontName: function getFontName(resource) {
        if (cc.sys.isNative) {
            return resource.srcs[0];
        } else {
            return resource.name;
        }
    },
    setText: function setText(txt) {
        this._txtMsg.setString(txt);
    },
    setTextTimeOut: function setTextTimeOut(txt) {
        this._txtMsgTimeOut.setString(txt);
    },
    showFull: function showFull(msg, timeOut) {
        this.showFull2(timeOut);
        this.setText(msg);
    },
    showFront: function showFront() {
        if (this.isShow) return;
        this.setContentSize(this.size);
        this.removeTouch();
        cc.director.getRunningScene().addChild(this, Z_WAITING, GAMEPROMPT_LAYER_TAG);
        this.isShow = true;

        var delay = cc.DelayTime.create(10);
        var cal = cc.callFunc(this.onDismiss.bind(this), this);
        this.stopAllActions();
        this.runAction(cc.sequence(delay, cal));

        this.isCanClose = false;
        this._loading.setVisible(false);
        this._txtMsgTimeOut.setVisible(false);
        this._txtMsg.setVisible(false);
    },
    showFull2: function showFull2() {
        var timeOut = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

        if (this.isShow) return;
        this.setContentSize(this.size);
        this.removeTouch();

        cc.director.getRunningScene().addChild(this, Z_WAITING, GAMEPROMPT_LAYER_TAG);

        this.isShow = true;
        if (timeOut < 0) {
            timeOut = TIME_DISMISS;
        }
        var delay = cc.DelayTime.create(timeOut);
        var cal = cc.callFunc(this.showFullTimeOut, this);
        this.stopAllActions();
        this.runAction(cc.sequence(delay, cal));

        this.isCanClose = false;
        this._loading.setVisible(true);
        this._txtMsgTimeOut.setVisible(false);
        this._txtMsg.setVisible(true);
    },
    showWithoutTimeout: function showWithoutTimeout(node, text) {
        if (this.isShow) return;
        this.setContentSize(node.getContentSize());

        node.addChild(this, Z_WAITING);
        this.isShow = true;

        this.isCanClose = false;
        this._loading.setVisible(true);
        this._loading.setPositionY(0);
        this._txtMsgTimeOut.setVisible(false);
        this._txtMsg.setVisible(true);

        this.setText(text);
        this.stopAllActions();
    },
    show: function show(node) {
        this.show2(node, node.getContentSize());
    },
    show2: function show2(node, _nodeSize) {
        if (this.isShow) return;
        this.setContentSize(_nodeSize);

        node.addChild(this, Z_WAITING);
        this.isShow = true;

        var delay = cc.DelayTime.create(TIME_DISMISS);
        var cal = cc.callFunc(this.onDismiss, this);

        this.stopAllActions();
        this.runAction(cc.sequence(delay, cal));

        this.isCanClose = false;
        this._loading.setVisible(true);
        this._loading.setPositionY(0);
        this._txtMsgTimeOut.setVisible(false);
        this._txtMsg.setVisible(false);
    },
    removeTouch: function removeTouch() {
        var item = cc.MenuItemSprite.create(cc.LayerColor.create(cc.color(0, 0, 0, 0)), cc.LayerColor.create());
        item.setContentSize(this.getContentSize().width * 2, this.getContentSize().height * 2);
        item.setPosition(cc.p(this.size.widget / 2, this.size.height / 2));
        var menu = new cc.Menu(item, null);
        menu.setPosition(cc.p(0, 0));
        menu.setContentSize(this.getContentSize());
        this.addChild(menu, -1);
    },
    changeContext: function changeContext(txt) {
        var delay = cc.DelayTime.create(TIME_DISMISS);
        var cal = cc.callFunc(this.showFullTimeOut, this);
        this.stopAllActions();
        this.runAction(cc.sequence(delay, cal));

        this.isCanClose = false;
        this._loading.setVisible(true);
        this._txtMsgTimeOut.setVisible(false);
        this._txtMsg.setVisible(true);

        this._txtMsg.setString(txt);
        this._txtMsgTimeOut.setString(Localize.lang.ListWaitingText.txtTimedOut);
    },
    dismiss: function dismiss() {
        //this.pauseAllRunningActions();
        if (this != null && this.isShow && this.getParent() != null) {
            this.isShow = false;
            this.removeFromParent();
        }
        //this.listPopups.eraseObject(this, true);
    },
    showFullTimeOut: function showFullTimeOut() {
        var bgpnl = this.getChildByName("BACKGROUNDNODE");
        bgpnl.setLocalZOrder(999);
        this.isCanClose = true;
        this._loading.setVisible(false);
        this._txtMsgTimeOut.setVisible(true);
        this._txtMsg.setVisible(false);
        if (this._callbackOutOfTime) {
            this._callbackOutOfTime();
        }
    },
    onClickBackgroundForClose: function onClickBackgroundForClose() {
        if (this.isCanClose) //_btnClose->isVisible())
            {
                this.onDismiss();
            }
    },
    onDismiss: function onDismiss() {
        //this.pauseAllRunningActions();
        //listPopups->eraseObject(this, true);
        if (this._callbackClose) {
            this._callbackClose();
        }
        if (this.isShow && this != null && this.getParent() != null) {
            this.removeFromParent();
        }
    },
    onBackKey: function onBackKey() {
        if (this.isCanClose) //_btnClose->isVisible())
            {
                this.onDismiss();
            }
    },
    showFullKick: function showFullKick(msg) {
        if (this.isShow) return;
        this.setContentSize(size);
        this.removeTouch();

        cc.getRunningScene().addChild(this, Z_WAITING, GAMEPROMPT_LAYER_TAG);

        this.isShow = true;

        this.isCanClose = true;
        this._loading.setVisible(true);
        this._txtMsgTimeOut.setVisible(false);
        this._txtMsg.setVisible(true);
        this.setText(msg);
    },
    menuEventCallBack: function menuEventCallBack(pSender, type) {
        var selectedBtn = pSender;
        //var name = selectedBtn.getName();

        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                selectedBtn.setColor(cc.color(170, 170, 170));
                break;
            case ccui.Widget.TOUCH_ENDED:
                {
                    this.setTag(0);
                }
                break;
            case ccui.Widget.TOUCH_CANCELED:
                selectedBtn.setColor(cc.color(255, 255, 255));
                break;
            default:
                break;
        }
    }

});

// Singleton
PopupWaiting.instance = null;
PopupWaiting.getInstance = function () {
    if (!PopupWaiting.instance) {
        PopupWaiting.instance = new PopupWaiting();
        PopupWaiting.instance.retain();
    }
    return PopupWaiting.instance;
};
