"use strict";

var ToggleButton = cc.Node.extend({
    _isAnimating: false,
    _bg: null,
    _value: false,
    _spHandleOn: null,
    colorOn: null,
    colorOff: null,

    ctor: function ctor(background, spIndicator) {
        var colorOn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : cc.color(36, 255, 124, 255);

        var _this = this;

        var colorOff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : cc.color(153, 160, 167, 255);
        var value = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

        this._super();
        this.setAnchorPoint(0.5, 0.5);
        this._isAnimating = false;
        if (jsb.fileUtils.isFileExist(background)) {
            this._bg = cc.Sprite.create(background);
        } else {
            this._bg = new cc.Sprite();
            this._bg.setSpriteFrame(background);
        }
        this._bg.setAnchorPoint(0, 0);
        this.addChild(this._bg, 1);
        this.setContentSize(this._bg.getContentSize());

        if (jsb.fileUtils.isFileExist(spIndicator)) {
            this._spHandleOn = cc.Sprite.create(spIndicator);
        } else {
            this._spHandleOn = new cc.Sprite();
            this._spHandleOn.setSpriteFrame(spIndicator);
        }
        this._spHandleOn.setPosition(this.getContentSize().width * 0.2, this.getContentSize().height * 0.5);
        this._bg.addChild(this._spHandleOn, 1);
        this.colorOn = colorOn;
        this.colorOff = colorOff;

        var listener1 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
            swallowTouches: true,

            //onTouchBegan event callback function
            onTouchBegan: function onTouchBegan(touch, event) {
                var target = event.getCurrentTarget();
                var location = target.convertToNodeSpace(touch.getLocation());
                var targetSize = target.getContentSize();
                var targetRectangle = cc.rect(0, 0, targetSize.width, targetSize.height);
                return cc.rectContainsPoint(targetRectangle, location);
            },

            //Trigger when moving touch
            onTouchMoved: function onTouchMoved(touch, event) {
                //Move the position of current button sprite
            },

            //Process the touch end event
            onTouchEnded: function onTouchEnded(touch, event) {
                var target = event.getCurrentTarget();
                var location = target.convertToNodeSpace(touch.getLocation());
                var targetSize = target.getContentSize();
                var targetRectangle = cc.rect(0, 0, targetSize.width, targetSize.height);

                if (cc.rectContainsPoint(targetRectangle, location)) {
                    target.setValueWithEffect(!_this._value);
                }
            }
        });
        cc.eventManager.addListener(listener1, this);

        this.setValue(value);
        return true;
    },

    setValueWithEffect: function setValueWithEffect(value) {
        var animTime = 0.25;
        if (this._isAnimating) {
            return;
        }

        if (this._value !== value) {
            this._value = value;
            this._isAnimating = true;

            if (this.onValueChanged) {
                this.onValueChanged(value);
            }

            if (this._spHandleOn) {
                var pos = cc.p(this.getContentSize().width * (value ? 0.8 : 0.2), this.getContentSize().height * 0.5);
                this._spHandleOn.runAction(cc.sequence(cc.moveTo(animTime, pos), cc.callFunc(this.setValueEffectCallback, this)));
            }
        }
    },

    setValue: function setValue(value) {
        if (this._isAnimating) {
            return;
        }

        if (this._value !== value) {
            this._value = value;

            if (this._bg) {
                //change color
                this._bg.setColor(this._value ? this.colorOn : this.colorOff);
            }

            if (this._spHandleOn) {
                this._spHandleOn.setColor(value ? cc.color(255, 255, 255) : cc.color(125, 125, 125));
                this._spHandleOn.setPosition(this.getContentSize().width * (value ? 0.8 : 0.2), this.getContentSize().height * 0.5);
            }
        }
    },
    setValueEffectCallback: function setValueEffectCallback() {
        this._isAnimating = false;

        if (this._bg) {
            //change color
            this._bg.setColor(this._value ? this.colorOn : this.colorOff);
        }
    }
});