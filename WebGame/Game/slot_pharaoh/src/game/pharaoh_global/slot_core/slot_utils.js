Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotUtils]";

    const TOUCH_TIME = 300;
    const TOUCH_DISTANCE_LIMITED = 30;

    const HOLD_TIME = 500;

    const ROLL_WIDGET_DELAY = 2;
    const ROLL_WIDGET_SPEED = 100;
    const ROLL_WIDGET_PADDING = 10;

    const COLOR_WHITE = cc.color.WHITE;
    const COLOR_GREYSCALE = cc.color(100, 100, 100, 100);

    const TWEEN_COIN_NAME = "TWEEN_COIN_" + Date.now();

    const ActionTextTweenCoin = cc.Node.extend({

        ctor: function (duration, text, startCoin, endCoin, callback) {

            this._super();

            this.duration = Math.max(0.5, duration || 0.5);
            this.text = text;
            this.startCoin = startCoin;
            this.endCoin = endCoin;

            this.callback = callback;

            this.coin = 0;
            this.time = 0;
        },

        update: function (dt) {

            this.time += (dt || 0);
            if (this.time >= this.duration) {

                this.text.setString(SlotUtils.formatCoin(this.endCoin));

                if (typeof this.callback === 'function')
                    this.callback();

                this.removeFromParent();

                return;
            }

            this.coin = this.startCoin + (this.time / this.duration) * (this.endCoin - this.startCoin);
            this.text.setString(SlotUtils.formatCoin(Math.trunc(this.coin)));
        },

        onEnter: function () {
            this._super();

            this.scheduleUpdate();
        },

        onExit: function () {
            this._super();

            this.unscheduleUpdate();
        }
    });

    const SlotUtils = {

        TOUCH_EVENT: {
            TAP: 1,
            HOLD: 2,
        },

        fontNameCombine: "",

        stopTweenCoin: function (text) {
            let oldTweenCoin = text.getChildByName(TWEEN_COIN_NAME);
            if (oldTweenCoin) {
                oldTweenCoin.callback = null;
                oldTweenCoin.unscheduleUpdate();
                oldTweenCoin.removeFromParent();
            }
        },

        tweenCoin: function (text, startCoin, endCoin, time = 1.0, callback) {

            SlotUtils.stopTweenCoin(text);
            if (time <= 0.0) {
                text.setString(SlotUtils.formatCoin(endCoin));

                return;
            }

            let tweenCoin = new ActionTextTweenCoin(time, text, startCoin, endCoin, callback);
            tweenCoin.setName(TWEEN_COIN_NAME);
            text.addChild(tweenCoin);
        },

        formatCoin: function (str, seperate) {

            seperate = typeof seperate === 'string' ? seperate : ".";
            if (Math.floor(str)) {
                str = Math.floor(str);
            }

            if (typeof str === "number") {
                str = str.toString();
            }

            let strResult = "";
            let count = -1;
            let stringLength = (str && str.length > 0) ? str.length : 0;

            for (let i = 0; i < stringLength; i++) {
                count++;

                if (count === 3) {
                    count = 0;
                    if (parseInt(str.charAt(stringLength - (i + 1)), 10).toString() !== "NaN" && str.charAt(stringLength - (i + 1)) !== "-") {
                        strResult += seperate + str.charAt(stringLength - (i + 1));
                    } else {
                        strResult += str.charAt(stringLength - (i + 1));
                    }
                } else {
                    strResult += str.charAt(stringLength - (i + 1));
                }
            }

            let s1 = "";
            let strResultLength = strResult.length;

            for (let j = 0; j < strResultLength; j++) {
                s1 += strResult.charAt(strResultLength - (j + 1));
            }

            return s1;
        },

        rollWidget: function (options) {

            if (!options)
                return;

            options.widget = options.widget || null;
            options.size = options.size || null;

            let padding = options.padding || ROLL_WIDGET_PADDING;
            let delay = options.delay || ROLL_WIDGET_DELAY;
            let speed = options.speed || ROLL_WIDGET_SPEED;

            let widget = options.widget;
            if (!widget || !options.size || speed <= 0) {
                return;
            }

            let width = widget.width;
            if (width <= options.size.width && !widget.clipperRollWidget) {
                return;
            }

            if (!widget.clipperRollWidget) {

                widget.clipperRollWidget = new ccui.Layout();

                widget.oriPositionRoller = widget.getPosition().x;
                widget.getParent().addChild(widget.clipperRollWidget);
                widget.clipperRollWidget.setClippingEnabled(true);

                widget.clipperRollWidget.setAnchorPoint(widget.getAnchorPoint());
                widget.clipperRollWidget.setContentSize(widget.getContentSize());
                widget.clipperRollWidget.setPosition(widget.getPosition());

                widget.setAnchorPoint(cc.p(0.5, 0.5));
                SlotUtils.switchParent(widget, widget.clipperRollWidget);

                widget.setAnchorPoint(cc.p(0.5, 0.5));
                widget.setPositionY(widget.clipperRollWidget.height / 2);

            }

            if (cc.sys.isObjectValid(widget.rollWidgetAction))
                widget.stopAction(widget.rollWidgetAction);

            if (width <= options.size.width || speed <= 0) {
                
                widget.clipperRollWidget.width = width;
                ccui.helper.doLayout(widget.clipperRollWidget);
                widget.clipperRollWidget.setPositionX(widget.oriPositionRoller);

                widget.setNormalizedPosition(cc.p(0.5, 0.5));

                return;
            }

            widget.clipperRollWidget.setContentSize(options.size);
            ccui.helper.doLayout(widget.clipperRollWidget);

            widget.setPositionX(width / 2);
            widget.setPositionY(widget.clipperRollWidget.height / 2);

            let xStart = widget.width / 2 + (widget.clipperRollWidget.width - widget.width - padding);
            let yStart = widget.getPosition().y;

            let xEnd = widget.width / 2 + padding;

            let duration = options.size.width / speed;
            duration = Math.min(duration, 10);

            widget.rollWidgetAction = widget.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveTo(duration, xStart, yStart),
                        cc.delayTime(delay),
                        cc.moveTo(duration, xEnd, yStart),
                        cc.delayTime(delay)
                    )
                )
            );
        },

        switchParent: function (node, newParent, lockPosition, newZOrder) {

            if (!node  || !newParent)
                return;

            let pos = node.getPosition();
            if (lockPosition) {
                pos = lockPosition;
            }

            if (node.getParent()) {

                node.retain();
                node.removeFromParent(false);

                if (newZOrder)
                    newParent.addChild(node, newZOrder);
                else
                    newParent.addChild(node);

                node.release();

            } else {

                if (newZOrder)
                    newParent.addChild(node, newZOrder);
                else
                    newParent.addChild(node);
            }

            node.setPosition(pos);
        },

        applyPressedEffect: function (button, type, scale, deltaScale = 0.9, limitTime = TOUCH_TIME, limitDist = TOUCH_DISTANCE_LIMITED) {

            if (!button)
                return false;

            let scaleX = scale.x || scale;
            let scaleY = scale.y || scale;

            if (type === ccui.Widget.TOUCH_BEGAN) {
                
                button.setScale(scaleX, scaleY);
                button.runAction(cc.scaleTo(0.1, scaleX * deltaScale, scaleY * deltaScale));
                button.touchBeganTime = Date.now();
                button.touchPosition = button.getTouchBeganPosition();

                return false;

            } else if (type === ccui.Widget.TOUCH_MOVED) {
                return false;
            } else if (type === ccui.Widget.TOUCH_CANCELED) {

                button.setScale(scaleX * deltaScale, scaleY * deltaScale);
                button.runAction(new cc.EaseBackOut(cc.scaleTo(0.3, scaleX, scaleY)));

                return false;

            }

            button.setScale(scaleX * deltaScale, scaleY * deltaScale);
            button.runAction(new cc.EaseBackOut(cc.scaleTo(0.3, scaleX, scaleY)));

            let end = type === ccui.Widget.TOUCH_ENDED;
            let samePosition = cc.pLength(cc.pSub(button.getTouchEndPosition(), button.touchPosition)) <= limitDist;
            
            let now = Date.now();
            let isClick = (now - button.touchBeganTime) < limitTime;
            let isHold = (now - button.touchBeganTime) > HOLD_TIME;

            if (end && samePosition) {

                if (isClick)
                    return this.TOUCH_EVENT.TAP;

                if (isHold)
                    return this.TOUCH_EVENT.HOLD;
            }

            return false;
        },

        applyGreyscaleNode: function (node, enabled = true, color = COLOR_GREYSCALE) {

            if (!node)
                return;

            if (node instanceof cc.ProgressTimer || node instanceof ccui.Button || node instanceof ccui.Text)
                return;

            if (node.getVirtualRenderer !== undefined) {
                let renderer = node.getVirtualRenderer();
                if (renderer) {
                    if (renderer instanceof cc.Scale9Sprite) {
                        renderer.setState((enabled) ? 1 : 0);
                    } else {
                        renderer.setColor((enabled === true) ? COLOR_WHITE : color);
                    }
                }
            } else {
                node.setColor((enabled === true) ? COLOR_WHITE : color);
            }
        },

        fixTextLayout: function (widget, recursive = true, excludes = []) {

            if (widget == null)
                return;

            if (widget instanceof ccui.Text) {
                
                if (excludes.findIndex(item => item === widget.name) >= 0)
                    return;

                widget.ignoreContentAdaptWithSize(true);

                return;
            }

            if (recursive) {
                let children = widget.getChildren();
                children.forEach((child) => {
                    SlotUtils.fixTextLayout(child, recursive, excludes);
                });
            }
        },

        localizeText: function (text) {

            if (!text || !cc.sys.isObjectValid(text) || !(text instanceof ccui.Text))
                return;

            let isWin8 = Localize && Localize.localizeText;
            if (!isWin8) {

                Localize.handleTextNodeFont(text);

                if (cc.sys.platform == cc.sys.MOBILE_BROWSER || cc.sys.platform == cc.sys.DESKTOP_BROWSER) {
                    
                    if (text.originalY === undefined)
                        text.originalY = text.getPositionY();

                    text.setPositionY(text.originalY - 2);
                    ccui.helper.doLayout(text);
                }

                return;
            }

            if (this.fontNameCombine == "") {
                Localize.localizeText(text);
                this.fontNameCombine = text.getFontName();
            }

            if (text.coreLocalized || this.fontNameCombine == "" )
                return;

            text.coreLocalized = true;
            let size = text.getFontSize();

            let outlineSize = text.getOutlineSize();
            let outlineColor = text.getEffectColor();

            let shadowOffset = text.getShadowOffset();
            let shadowColor = text.getShadowColor();

            text.setFontName(this.fontNameCombine, true);
            text.setFontSize(size);

            if (cc.sys.platform == cc.sys.MOBILE_BROWSER || cc.sys.platform == cc.sys.DESKTOP_BROWSER) {
                    
                if (text.originalY === undefined)
                    text.originalY = text.getPositionY();

                text.setPositionY(text.originalY - 2);
            }

            ccui.helper.doLayout(text);

            if (outlineSize > 0)
                text.enableOutline(outlineColor, outlineSize);

            if (shadowOffset.width != 0 || shadowOffset.height != 0)
                text.enableShadow(shadowColor, shadowOffset);
        },

        localizeSpriteText: function (sprite, key) {

            if (!sprite)
                return;

            let lang = "en";
            switch (portalHelper.getLanguageType()) {
                case Localize.LANG.CAM:
                case Localize.LANG.MY:
                case Localize.LANG.PH:
                    lang = portalHelper.getLanguageStr();
                    break;
                default:
                    break;
            }

            let str = cc.formatStr(key, lang);
            if (str != '' && cc.spriteFrameCache.getSpriteFrame(str)) {
                sprite.setSpriteFrame(str);
            }
        }
    };

    SlotUtils.HOLD_TIME = HOLD_TIME;
    SlotUtils.TOUCH_DISTANCE_LIMITED = TOUCH_DISTANCE_LIMITED;
    
    window.SlotUtils = SlotUtils;
    return SlotUtils;
});