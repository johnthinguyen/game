Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotPopupWaiting]";

    const SlotPopupWaiting = cc.Layer.extend({

        ctor: function () {

            this._super();

            this.isBusy = false;

            this.overlay = new ccui.Layout();
            this.addChild(this.overlay);

            this.overlay.setContentSize(cc.winSize);
            this.overlay.setPosition(cc.p(0, 0));
            this.overlay.setAnchorPoint(cc.p(0, 0));

            this.overlay.setBackGroundColor(cc.color(0, 0, 0));
            this.overlay.setBackGroundColorOpacity(156);
            this.overlay.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);

            this.overlay.setTouchEnabled(true);

            this.spriteBuffering = new cc.Sprite();
            this.spriteBuffering.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
            this.spriteBuffering.runAction(cc.repeatForever(cc.animate(SlotResource.getAnimationLoading())));
            this.addChild(this.spriteBuffering);

            this.textMessage = new ccui.Text("", "Arial", 32);
            this.textMessage.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.3));
            this.addChild(this.textMessage);

            SlotUtils.fixTextLayout(this.textMessage);
            SlotUtils.localizeText(this.textMessage);
        },

        show: function (message, timeout = -1, timedOutCallback = null) {

            if (this.isBusy) {
                return;
            }

            this.setVisible(true);
            this.textMessage.setString(message || "");

            if (timeout > 0) {
                this.timedOutCallback = timedOutCallback || this.timedOutCallback;
                this.scheduleOnce(this.raiseTimedOutEvent.bind(this), timeout);
            }
        },

        hide: function () {

            if (this.isBusy) {
                return;
            }

            this.setVisible(false);
            this.unschedule(this.raiseTimedOutEvent);
        },

        raiseTimedOutEvent: function () {
            this.timedOutCallback && this.timedOutCallback();
            this.hide();
        }
    });

    window.SlotPopupWaiting = SlotPopupWaiting;
    return SlotPopupWaiting;
});