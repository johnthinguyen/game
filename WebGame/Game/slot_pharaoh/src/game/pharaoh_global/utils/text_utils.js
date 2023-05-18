Module.define(function (require) {
    "use strict";

    const WINCOIN_COLOR_NORMAL = cc.color("#ffffff");
    const WINCOIN_COLOR_WON = cc.color("#0ed145");
    const WINCOIN_COLOR_LOST = cc.color("#FD6060");

    const TWEEN_COIN_NAME = "TWEEN_COIN_" + Date.now();

    const ActionTextTweenCoin = cc.Node.extend({
        ctor: function (duration, text, startCoin, endCoin, callBack, isFormartCoin = true, seperate = ".") {
            this._super();

            this.duration = Math.max(0.5, duration || 0.5);
            this.text = text;
            this.startCoin = startCoin;
            this.endCoin = endCoin;

            this.callBack = callBack;
            this.isFormartCoin = isFormartCoin;
            this.seperate = seperate;

            this.coin = 0;
            this.time = 0;
        },

        update: function (dt) {
            this.time += (dt || 0);
            if (this.time >= this.duration) {
                this.text.setString(this.formatCoin(this.endCoin, this.seperate));

                if(typeof this.callBack === 'function')
                    this.callBack();

                this.removeFromParent();
                return;
            }

            this.coin = this.startCoin + (this.time / this.duration) * (this.endCoin - this.startCoin);
            this.text.setString(this.formatCoin(Math.trunc(this.coin), this.seperate));
        },

        onEnter: function () {
            this._super();
            this.scheduleUpdate();
        },

        onExit: function () {
            this._super();
            this.unscheduleUpdate();
        },

        formatCoin: function (coin, seperate) {
            if (this.isFormartCoin) {
                return TextUtils.formatCoin(coin, seperate);
            }

            return coin;
        },
    });

    const ActionTextTweenCoinCompact = ActionTextTweenCoin.extend({
        formatCoin: function (coin) {
            return TextUtils.formatCoinCompact(coin);
        },
    });

    const TextUtils = {
        createText: function (content, style = {}) {
            let text = new ccui.Text();
            text.setString(content);

            TextUtils.applyStyle(text, style);
            return text;
        },

        applyStyle: function (text, style = {}) {
            if (style.font) {
                text.setFontName(style.font.name);
                text.setFontSize(style.font.size);
            }

            if (style.outline) {
                text.enableOutline(style.outline.color, style.outline.size);
            }

            if (style.shadow) {
                text.enableShadow(style.shadow.color, style.outline.size);
            }

            if (style.color) {
                text.setTextColor(style.color);
            }

            if (typeof style.opacity === "number") {
                text.setOpacity(style.opacity);
            }
        },

        stopTweenCoin: function (text) {
            let oldTweenCoin = text.getChildByName(TWEEN_COIN_NAME);
            if (oldTweenCoin) {
                oldTweenCoin.callBack = null;
                oldTweenCoin.unscheduleUpdate();
                oldTweenCoin.removeFromParent();
            }
        },

        tweenCoin: function (text, startCoin, endCoin, time = 1.0, callBack, isFormartCoin = true) {
            TextUtils.stopTweenCoin(text);
            if (time <= 0.0) {
                if (isFormartCoin) {
                    text.setString(TextUtils.formatCoin(endCoin));
                } else {
                    text.setString(endCoin);
                }
            } else {
                let tweenCoin = new ActionTextTweenCoin(time, text, startCoin, endCoin, callBack, isFormartCoin);
                tweenCoin.setName(TWEEN_COIN_NAME);
                text.addChild(tweenCoin);
            }

        },

        tweenCoinCompact: function (text, startCoin, endCoin, time = 1.0) {
            TextUtils.stopTweenCoin(text);

            if (time <= 0.0) {
                text.setString(TextUtils.formatCoinCompact(endCoin));
            } else {
                let tweenCoin = new ActionTextTweenCoinCompact(time, text, startCoin, endCoin);
                tweenCoin.setName(TWEEN_COIN_NAME);
                text.addChild(tweenCoin);
            }
        },

        setWinCoin: function (text, winCoin, normalColor = WINCOIN_COLOR_NORMAL, winColor = WINCOIN_COLOR_WON, loseColor = WINCOIN_COLOR_LOST) {
            text.setString((winCoin > 0 ? "+" : "") + TextUtils.formatCoin(winCoin));
            text.setTextColor(winCoin == 0 ? normalColor : (winCoin > 0 ? winColor : loseColor));
        },

        handleLayout: function (text) {
            NodeUtils.fixTextLayout(text);
        },

        handleTextNodeFont: function (text) {
            if(!text || text.isPositionFixed)
                return;
            text.isPositionFixed = true;
            text.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
            text.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

            Localize.handleTextNodeFont(text);
        },

        handleLocalization: function (text, translateKey) {
            TextUtils.handleTextNodeFont(text);

            if (typeof translateKey === "string") {
                text.setString(Localize.text(translateKey));
            }
        },

        formatCoin: function (str, seperate) {
            seperate = typeof seperate === 'string' ? seperate : ".";
            if (Math.floor(str)) {
                str = Math.floor(str);
            }

            if (typeof str === "number") {
                str = str.toString();
            }

            var strResult = "";
            var count = -1;
            var stringLength = (str && str.length > 0) ? str.length : 0;

            for (var i = 0; i < stringLength; i++) {
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

            var s1 = "";
            var strResultLength = strResult.length;

            for (var j = 0; j < strResultLength; j++) {
                s1 += strResult.charAt(strResultLength - (j + 1));
            }

            return s1;
        },

        formatSmallCoin: function (coin) {
            if (typeof coin !== "number") {
                throw new Error("coin is not valid!");
            }

            const BILLION = 1000 * 1000 * 1000;
            const MILLION = 1000 * 1000;
            const THOUSAND = 1000;
            if (coin >= BILLION) {
                return (coin / BILLION) + "B";
            } else if (coin >= MILLION) {
                return (coin / MILLION) + "M";
            } else if (coin >= THOUSAND) {
                return (coin / THOUSAND) + "K";
            } else {
                return coin.toString();
            }
        },

        formatCoinCompact: function (coin, seperate) {
            if (typeof coin !== "number") {
                throw new Error("coin is not valid!");
            }

            let suffix = "";
            if (coin >= 1000000000) {
                suffix = "B";
                coin /= 1000000000;
            } else if (coin >= 10000000) {
                suffix = "M";
                coin /= 1000000;
            } else {
                return TextUtils.formatCoin(coin, seperate);
            }

            if (Math.trunc(coin) === coin) {
                let str = coin.toString();
                return str + suffix;
            } else {
                let str = coin.toFixed(3).toString().replace('.', ',');
                return str + suffix;
            }
        },

        rollWidget: function (options) {
            options = _.defaults(options, {
                widget: null,
                size: null, //cc.size
                speed: 100, // px/second
                delay: 2,
                padding:10
            });
        
            let padding = options.padding || 0;
            let widget = options.widget;
            if(!widget || !options.size || options.speed <=0){
                return;
            }
            
            let width = widget.width;
            if(width <= options.size.width && !widget.clipperRollWidget){
                return;
            }
        
            if(!widget.clipperRollWidget) {
            
                widget.clipperRollWidget = new ccui.Layout();
        
                widget.oriPositionRoller = widget.getPosition().x;
                widget.getParent().addChild(widget.clipperRollWidget);
                widget.clipperRollWidget.setClippingEnabled(true);
        
                widget.clipperRollWidget.setAnchorPoint(widget.getAnchorPoint());
                widget.clipperRollWidget.setContentSize(widget.getContentSize());
                widget.clipperRollWidget.setPosition(widget.getPosition());
                
                widget.setAnchorPoint(cc.p(0.5, 0.5));
                NodeUtils.switchParent(widget, widget.clipperRollWidget);
                
                widget.setAnchorPoint(cc.p(0.5, 0.5));
                widget.setPositionY(widget.clipperRollWidget.height / 2);
        
            }
            if(cc.sys.isObjectValid(widget.rollWidgetAction))
                widget.stopAction(widget.rollWidgetAction);
        
            if (width <= options.size.width || options.speed <= 0) {
                widget.clipperRollWidget.width = width;
                ccui.helper.doLayout(widget.clipperRollWidget);
                widget.clipperRollWidget.setPositionX(widget.oriPositionRoller);
                widget.setPositionX(width / 2);
                return;
            }
        
            widget.clipperRollWidget.setContentSize(options.size);
            ccui.helper.doLayout(widget.clipperRollWidget);
        
            widget.setPositionX(width / 2);
            widget.setPositionY(widget.clipperRollWidget.height / 2);
        
            let startPosition = cc.p(widget.width / 2  + (widget.clipperRollWidget.width - widget.width - padding), widget.getPosition().y);
            let endPosition = cc.p(widget.width / 2 + padding, widget.getPosition().y);
        
            let duration = options.size.width / options.speed;
            duration = Math.min(duration, 10);
            widget.rollWidgetAction = widget.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveTo(duration, startPosition),
                        cc.delayTime(options.delay),
                        cc.moveTo(duration, endPosition),
                        cc.delayTime(options.delay)
                    )
                )
            );
        },

        switchParent: function (node, newParent, lockPosition, newZOrder) {
            if (node && newParent) {
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
            }
        },
    };

    window.TextUtils = TextUtils;
    return TextUtils;
});