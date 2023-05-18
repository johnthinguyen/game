Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotNotifyAuto]";

    const BACKGROUND = SlotResource.SPRITES.BACKGROUND_NOTIFY_AUTO;

    const SlotNotifyAuto = cc.Node.extend({

        ctor: function () {
            this._super();

            this.initComponents();
        },

        initComponents: function () {

            this.layout = new ccui.ImageView();
            this.layout.loadTexture(BACKGROUND, ccui.Widget.PLIST_TEXTURE);
            this.layout.setContentSize(cc.size(494, 110));
            this.layout.setScale9Enabled(true);
            this.layout.setCapInsets(cc.rect( 57, 17, 1, 1));

            this.addChild(this.layout);
            this.layout.setName("background");

            this.text = new cc.Sprite();
            this.layout.addChild(this.text);
            this.text.setName("text");

            this.layout.setNormalizedPosition(cc.p(0.5, 0.5));
            this.text.setNormalizedPosition(cc.p(0.5, 0.5));

            this.setCascadeOpacityEnabled(true);
            this.layout.setCascadeOpacityEnabled(true);
            this.text.setCascadeOpacityEnabled(true);
        },

        showTextStartAuto: function () {
            SlotUtils.localizeSpriteText(this.text, SlotResource.SPRITES.TEXT_AUTO_STATE_ON);
            this.show();
        },

        showTextEndAuto: function () {
            SlotUtils.localizeSpriteText(this.text, SlotResource.SPRITES.TEXT_AUTO_STATE_OFF);
            this.show();
        },

        show: function () {

            let scale = Math.min((this.layout.width * 0.9) / this.text.width);
            this.text.setScale(scale);

            this.setOpacity(0);
            this.runAction(cc.sequence(
                cc.show(),
                cc.fadeIn(0.2)
            ));
        },

        hide: function () {
            this.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.hide()
            ));
        }
    });

    window.SlotNotifyAuto = SlotNotifyAuto;
    return SlotNotifyAuto;
});