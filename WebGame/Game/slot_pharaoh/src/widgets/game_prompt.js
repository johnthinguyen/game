"use strict";

var GAMEPROMPT_LAYER_ZORDER = 100000000;
var GAMEPROMPT_LAYER_TAG = 100000000;

var GamePrompt = PopupAbstract.extend({
    _cancel: function _cancel() {},
    _sure: function _sure() {},
    promptButtonSure1: null,
    promptButtonSure2: null,
    promptButtonSure3: null,
    promptButtonCancel: null,
    promptButtonCancel2: null,
    promptText: null,

    ctor: function ctor(path) {
        //////////////////////////////
        // 1. super init first
        this._super();
        cc.log("GamePrompt::ctor");
        //var jsonPath = cc.path.join("res/PopupPrompt.json");
        this.initWithCSB(path);
        //this.initUI();
        this.setBackground(false);

        var _altxtTitle = this._mainPanel.getChildByName("altxtTitle");
        if (_altxtTitle) {
            GameUtils.makeBMString(_altxtTitle, "txtTitleThongbao");
            // _altxtTitle.setString(Localize.lang.txtTitleThongbao);
        }
        var txtTitle = this._mainPanel.getChildByName("txtTitle");
        if (txtTitle) {
            if (_altxtTitle) {
                _altxtTitle.setVisible(false);
            }
            txtTitle.setString(Localize.lang.txtTitleThongbao);
            GameUtils.TextHandler(txtTitle);
        }
        // var mFont = {type:"font", name:"GamePrompt", srcs:[cc.path.join("res/Fonts/OpenSans-Bold.ttf")]};
        // this.fontName = this.getFontName(mFont);
        var content = this._mainPanel.getChildByName("content");
        this.promptText = content.getChildByName("Text_prompt");
        this.promptText.setString("");
        GameUtils.TextHandler(this.promptText);
        this.promptButtonSure1 = this._mainPanel.getChildByName("Button_sure");
        {
            var txt = this.promptButtonSure1.getChildByName("Text");
            var mText = Localize.lang.ListButtonPromt.txtConfirmAgree;
            // txt.setFontName(this.fontName);
            //txt.enableOutline(cc.color(0,46,174),2);
            txt.setString(mText.toUpperCase());
            GameUtils.TextHandler(txt);
        }
        this.promptButtonSure1.addTouchEventListener(this.menuEventCallBack, this);

        this.promptButtonSure2 = this._mainPanel.getChildByName("Button_sure2");
        {
            var txt = this.promptButtonSure2.getChildByName("Text");
            var mText = Localize.lang.ListButtonPromt.txtConfirmAgree;
            // txt.setFontName(this.fontName);
            //txt.enableOutline(cc.color(53,118,0),2);
            txt.setString(mText.toUpperCase());
            GameUtils.TextHandler(txt);
        }
        this.promptButtonSure2.addTouchEventListener(this.menuEventCallBack, this);
        this.promptButtonSure2.setVisible(false);

        this.promptButtonSure3 = this._mainPanel.getChildByName("Button_sure3");
        {
            var txt = this.promptButtonSure3.getChildByName("Text");
            var mText = Localize.lang.ListButtonPromt.txtConfirmTryAgain;
            // txt.setFontName(this.fontName);
            //txt.enableOutline(cc.color(53,118,0),2);
            txt.setString(mText.toUpperCase());
            GameUtils.TextHandler(txt);
        }
        this.promptButtonSure3.addTouchEventListener(this.menuEventCallBack, this);
        this.promptButtonSure3.setVisible(false);

        this.promptButtonCancel = this._mainPanel.getChildByName("Button_cancel");
        {
            var txt = this.promptButtonCancel.getChildByName("Text");
            var mText = Localize.lang.ListButtonPromt.txtConfirmCancel;
            // txt.setFontName(this.fontName);
            //txt.enableOutline(cc.color(118,0,2),2);
            txt.setString(mText.toUpperCase());
            GameUtils.TextHandler(txt);
        }
        this.promptButtonCancel.addTouchEventListener(this.menuEventCallBack, this);
        this.promptButtonCancel.setVisible(false);

        this.promptButtonCancel2 = this._mainPanel.getChildByName("Button_cancel2");
        {
            var txt = this.promptButtonCancel2.getChildByName("Text");
            var mText = Localize.lang.ListButtonPromt.txtConfirmClose;
            // txt.setFontName(this.fontName);
            //txt.enableOutline(cc.color(118,0,2),2);
            txt.setString(mText.toUpperCase());
            GameUtils.TextHandler(txt);
        }
        this.promptButtonCancel2.addTouchEventListener(this.menuEventCallBack, this);
        this.promptButtonCancel2.setVisible(false);

        return true;
    },
    checkPopupExisted: function checkPopupExisted(tag) {
        var root = cc.director.getRunningScene();
        var popup = root.getChildByTag(tag);
        return popup;
    },
    getFontName: function getFontName(resource) {
        if (cc.sys.isNative) {
            return resource.srcs[0];
        } else {
            return resource.name;
        }
    },
    showPrompt: function showPrompt(prompt) {
        var root = cc.director.getRunningScene();
        if (root != null) {
            // var event =cc.eventListener.create({
            //     event: cc.EventListener.CUSTOM,
            //     eventName: EVENT_SHOW_PROMPT
            // });
            //     //cc.EventCustom(EVENT_SHOW_PROMPT);
            // this.eventManager.dispatchEvent(event);
            cc.assert(null != root, "root is null");
            if (this.getParent() == null) {
                root.addChild(this, GAMEPROMPT_LAYER_ZORDER, GAMEPROMPT_LAYER_TAG);
                this.show();
            }
            this.setPrompt(prompt);
        }
    },
    closePrompt: function closePrompt() {
        //HNAudioEngine::getInstance()->playEffect(GAME_SOUND_CLOSE);
        this.listPopups = [];
        this.closeWithEffect();
    },
    closePromptNow: function closePromptNow() {

        // HNAudioEngine::getInstance()->playEffect(GAME_SOUND_CLOSE);
        this.listPopups = [];
        this.closeWithEffect();
    },
    onBackKey: function onBackKey() {
        if (this.promptButtonCancel.isVisible()) {
            if (null != this._cancel) {
                this._cancel();
            }
            this.closePrompt();
        }
    },
    setCallBack: function setCallBack(sure) {
        this._sure = sure;
    },
    setCancelCallBack: function setCancelCallBack(cancel) {
        this._cancel = cancel;
    },
    setPrompt: function setPrompt(prompt) {
        if (null != this.promptText) {
            this.promptText.setString(prompt);
        }
    },
    setPromptCanSelect: function setPromptCanSelect() {
        this.promptButtonSure1.setVisible(false);
        this.promptButtonSure2.setVisible(true);
        this.promptButtonSure3.setVisible(false);
        this.promptButtonCancel.setVisible(true);
        this.promptButtonCancel2.setVisible(false);
    },
    setPromptCanSelect2: function setPromptCanSelect2() {
        this.promptButtonSure1.setVisible(false);
        this.promptButtonSure2.setVisible(false);
        this.promptButtonSure3.setVisible(true);
        this.promptButtonCancel.setVisible(false);
        this.promptButtonCancel2.setVisible(true);
    },
    setText2: function setText2(text_ok, text_not_ok) {
        if (this.promptButtonSure3) {
            var txt = this.promptButtonSure3.getChildByName("Text");
            txt.setString(text_ok);
        }
        if (this.promptButtonCancel2) {
            var txt = this.promptButtonCancel2.getChildByName("Text");
            txt.setString(text_not_ok);
        }
    },
    menuEventCallBack: function menuEventCallBack(btn, type) {
        var name = btn.getName();
        if (GameUtils.makeEffectButton(btn, type, 1.0)) {
            if (this.soundClick) this.soundClick();
            if (name === "Button_sure" || name === "Button_sure2" || name === "Button_sure3") {
                if (null != this._sure) {
                    this._sure();
                }
            }
            if (name === "Button_cancel" || name === "Button_cancel2") {
                if (null != this._cancel) {
                    this._cancel();
                }
            }
            this.closePrompt();
        }
    }

});