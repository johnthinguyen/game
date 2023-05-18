Module.define(function (require) {
    "use strict";

    const BOUNCE_ACTION_KEY = "BUTTON_BOUNCE_ACTION_" + Math.random() + Date.now();
    const DESIGN_WIDTH = 1280;
    const DESIGN_HEIGHT = 720;

    const ButtonUtils = {
        playClickSound: function () {
            AudioHandler.playClickSound();
        },

        applyStyle: function (button, style = {}) {
            let textNode = button.getChildByName("txt");
            if (textNode) {
                let textStyle = Object.create(style);
                textStyle.opacity = style.textOpacity;
                textStyle.color = style.textColor;

                TextUtils.applyStyle(textNode, textStyle);
            }

            if (style.color) {
                button.setColor(style.color);
            }

            if (style.opacity) {
                button.setOpacity(style.opacity);
            }
        },

        touchBounceEffect: function (button, touchType, scaleUp = 1.0, scaleDown = 0.8) {
            switch (touchType) {
                case ccui.Widget.TOUCH_BEGAN:
                    if (cc.sys.isObjectValid(button[BOUNCE_ACTION_KEY])) {
                        button.stopAction(button[BOUNCE_ACTION_KEY]);
                        button[BOUNCE_ACTION_KEY] = null;
                    }

                    button[BOUNCE_ACTION_KEY] = cc.scaleTo(0.1, scaleDown);
                    button.runAction(button[BOUNCE_ACTION_KEY]);
                    break;

                case ccui.Widget.TOUCH_ENDED:
                case ccui.Widget.TOUCH_CANCELED:
                    if (cc.sys.isObjectValid(button[BOUNCE_ACTION_KEY])) {
                        button.stopAction(button[BOUNCE_ACTION_KEY]);
                        button[BOUNCE_ACTION_KEY] = null;
                    }

                    button[BOUNCE_ACTION_KEY] = cc.scaleTo(0.1, scaleUp);
                    button.runAction(button[BOUNCE_ACTION_KEY]);
                    break;
            }

            return touchType === ccui.Widget.TOUCH_ENDED;
        },

        handleLayout: function (button) {
            let text = button.getChildByName("txt");
            if (text) {
                TextUtils.handleLayout(text);
            }
        },

        handleLocalization: function (button, translateKey) {
            let text = button.getChildByName("txt");
            if (text) {
                TextUtils.handleLocalization(text, translateKey);
            }
        },

        enableTouch: function (button) {
            button.setColor(cc.color(255, 255, 255, 255));
        },

        disableTouch: function (button) {
            button.setColor(cc.color(156, 156, 156, 255));
        },
    };

    window.ButtonUtils = ButtonUtils;
    return ButtonUtils;
});