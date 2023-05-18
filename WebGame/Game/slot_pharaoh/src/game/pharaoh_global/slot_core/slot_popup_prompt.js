Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotPopupPrompt]";

    const TEXT_EN = {
        "LANG_LABEL_REJECT": "Close",
        "LANG_LABEL_ACCEPT": "Accept",
        "LANG_LABEL_CLOSE": "Close",
    };

    const TEXT_KM = {
        "LANG_LABEL_REJECT": "បដិសេធ",
        "LANG_LABEL_ACCEPT": "យល់ព្រម",
        "LANG_LABEL_CLOSE": "បិទ",
    };

    const TEXT_MY = {
        "LANG_LABEL_REJECT": "ပိတ်မည်",
        "LANG_LABEL_ACCEPT": "လက်ခံမည်",
        "LANG_LABEL_CLOSE": "ပိတ်မည်",
    };

    const TEXT_PH = {
        "LANG_LABEL_REJECT": "Isara",
        "LANG_LABEL_ACCEPT": "Tanggapin",
        "LANG_LABEL_CLOSE": "Isara",
    };

    const TEXT_VI = {
        "LANG_LABEL_REJECT": "Từ chối",
        "LANG_LABEL_ACCEPT": "Đồng ý",
        "LANG_LABEL_CLOSE": "Đóng",
    };

    const TEXT_ZH = {
        "LANG_LABEL_REJECT": "拒绝",
        "LANG_LABEL_ACCEPT": "同意",
        "LANG_LABEL_CLOSE": "关闭",
    };

    const MAP_LANGUAGES = {
        0: TEXT_VI,
        1: TEXT_KM,
        2: TEXT_ZH,
        5: TEXT_EN,
        6: TEXT_MY,
        7: TEXT_PH
    };

    function getText(key) {

        let type = Localize.LANG.EN;
        if (portalHelper && portalHelper.getLanguageType)
            type = portalHelper.getLanguageType();

        let data = MAP_LANGUAGES[type] || TEXT_EN;

        return data[key] || "";
    };

    const SlotPopupPrompt = cc.Layer.extend({

        ctor: function () {

            this._super();

            this.acceptCallback = null;
            this.rejectCallback = null;
            this.closedCallback = null;

            this.setVisible(false);

            let overlay = ccui.Layout.create();
            overlay.setPosition(cc.p(0, 0));
            overlay.setAnchorPoint(cc.p(0, 0));
            overlay.setContentSize(this.getContentSize());

            overlay.setTouchEnabled(true);

            overlay.setBackGroundColor(cc.color(0, 0, 0));
            overlay.setBackGroundColorOpacity(156);
            overlay.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            overlay.setOpacity(0);

            this.addChild(overlay, 0);
            this.overlay = overlay;

            this.mainNode = ccs._load(SlotResource.ASSETS.JSON_PROMPT);
            this.mainNode.setAnchorPoint(cc.p(0.5, 0.5));
            this.addChild(this.mainNode);

            let size = cc.winSize;
            this.showPosition = cc.p(size.width * 0.5, size.height * 0.5);
            this.hidePosition = cc.p(size.width * 0.5, size.height * 1.5);

            this.textMessage = this.mainNode.getChildByName("text_message");
            SlotUtils.localizeText(this.textMessage);

            this.buttonClose = this.mainNode.getChildByName("button_close");
            this.buttonMiddle = this.mainNode.getChildByName("button_middle");
            this.buttonAccept = this.mainNode.getChildByName("button_right");
            this.buttonReject = this.mainNode.getChildByName("button_left");

            this.buttonClose.addTouchEventListener(this.onButtonCloseTouched, this);
            this.buttonMiddle.addTouchEventListener(this.onButtonAcceptTouched, this);
            this.buttonAccept.addTouchEventListener(this.onButtonAcceptTouched, this);
            this.buttonReject.addTouchEventListener(this.onButtonRejectTouched, this);

            this.buttonAccept.setVisible(false);
            this.buttonReject.setVisible(false);

            this.textButtonMiddle = this.buttonMiddle.getChildByName("text");

            this.textButtonAccept = this.buttonAccept.getChildByName("text");
            this.textButtonReject = this.buttonReject.getChildByName("text");

            SlotUtils.localizeText(this.textButtonMiddle);
            SlotUtils.localizeText(this.textButtonAccept);
            SlotUtils.localizeText(this.textButtonReject);

            SlotUtils.fixTextLayout(this.textButtonMiddle);
            SlotUtils.fixTextLayout(this.textButtonAccept);
            SlotUtils.fixTextLayout(this.textButtonReject);

            this.textButtonReject.setString(getText("LANG_LABEL_REJECT"));
            this.textButtonMiddle.setString(getText("LANG_LABEL_CLOSE"));
            this.textButtonAccept.setString(getText("LANG_LABEL_ACCEPT"));

            return true;
        },

        show: function () {

            if (this.isBusy)
                return;

            this.isBusy = true;

            this.setVisible(true);

            this.overlay.setOpacity(0);
            this.overlay.runAction(cc.sequence(
                cc.show(),
                cc.fadeIn(0.2)
            ));

            this.mainNode.setVisible(false);
            this.mainNode.setPosition(this.hidePosition);

            this.mainNode.runAction(cc.sequence(
                cc.show(),
                cc.moveTo(0.4, this.showPosition.x, this.showPosition.y).easing(cc.easeBackOut()),
                cc.callFunc(() => {
                    this.isBusy = false;
                })
            ));
        },

        hide: function (callback = null) {

            if (this.isBusy)
                return;

            if(!this.isVisible())
                return;

            this.isBusy = true;

            this.mainNode.setVisible(true);
            this.mainNode.setPosition(this.showPosition);

            this.mainNode.runAction(cc.sequence(
                cc.moveTo(0.4, this.hidePosition.x, this.hidePosition.y).easing(cc.easeBackIn()),
                cc.callFunc(() => {

                    let willCallback = this.isVisible();

                    let finalCallback = willCallback ? (callback || this.rejectCallback) : null;
                    let closeCallback = this.closedCallback;

                    this.setVisible(false);
                    this.isBusy = false;

                    this.acceptCallback = null;
                    this.rejectCallback = null;
                    this.closedCallback = null;

                    this.textButtonReject.setString(getText("LANG_LABEL_REJECT"));
                    this.textButtonMiddle.setString(getText("LANG_LABEL_CLOSE"));
                    this.textButtonAccept.setString(getText("LANG_LABEL_ACCEPT"));

                    finalCallback && finalCallback(this);
                    closeCallback && closeCallback(this);
                })
            ));

            this.overlay.setOpacity(255);
            this.overlay.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.hide()
            ));
        },

        showMessage: function (message = "", acceptCallback = null, options = null) {

            if (this.textMessage != null) {
                this.textMessage.setString(message);
            }

            this.buttonMiddle.setVisible(true);
            this.buttonAccept.setVisible(false);
            this.buttonReject.setVisible(false);

            this.acceptCallback = acceptCallback;
            this.rejectCallback = acceptCallback;

            if (options) {

                let textAccept = options.textButtonAccept;
                if (textAccept) {
                    this.textButtonMiddle.setString(textAccept);

                    SlotUtils.rollWidget({
                        widget: this.textButtonMiddle,
                        size: cc.size(this.buttonMiddle.width * 0.9, this.buttonMiddle.height)
                    });
                }
            }

            this.show();
        },

        showConfirm: function (message = "", acceptCallback = null, rejectCallback = null, options = null) {
           
            if (this.textMessage != null) {
                this.textMessage.setString(message);
            }

            this.buttonMiddle.setVisible(false);
            this.buttonAccept.setVisible(true);
            this.buttonReject.setVisible(true);

            this.acceptCallback = acceptCallback;
            this.rejectCallback = rejectCallback;

            if (options) {

                let textAccept = options.textButtonAccept;
                let textReject = options.textButtonReject;

                if (textAccept) {

                    this.textButtonAccept.setString(textAccept);

                    SlotUtils.rollWidget({
                        widget: this.textButtonAccept,
                        size: cc.size(this.buttonAccept.width * 0.9, this.buttonAccept.height)
                    });
                }

                if (textReject) {

                    this.textButtonReject.setString(textReject);

                    SlotUtils.rollWidget({
                        widget: this.textButtonReject,
                        size: cc.size(this.buttonReject.width * 0.9, this.buttonReject.height)
                    });
                }
            }

            this.show();
        },

        setClosedCallback: function (callback = null) {
            this.closedCallback = callback;
        },

        onButtonAcceptTouched: function (button, type) {

            if (!this.isBusy && SlotUtils.applyPressedEffect(button, type, 1.0, 0.9) == SlotUtils.TOUCH_EVENT.TAP) {
                this.hide(this.acceptCallback);
            }
        },

        onButtonRejectTouched: function (button, type) {

            if (!this.isBusy && SlotUtils.applyPressedEffect(button, type, 1.0, 0.9) == SlotUtils.TOUCH_EVENT.TAP) {
                this.hide(this.rejectCallback);
            }
        },

        onButtonCloseTouched: function (button, type) {

            if (!this.isBusy && SlotUtils.applyPressedEffect(button, type, 1.0, 0.9) == SlotUtils.TOUCH_EVENT.TAP) {
                this.hide(this.rejectCallback);
            }
        },
    });

    window.SlotPopupPrompt = SlotPopupPrompt;
    return SlotPopupPrompt;
});