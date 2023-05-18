Module.define(function (require) {
    "use strict";

    const PopupJackpot = cc.Layer.extend({
        ctor: function () {
            this._super();

            this.mainNode = ccs._load(Resource.ASSETS.CCS_PopupJackpot);
            this.cover = this.mainNode.getChildByName('cover');
            this.cover.setTouchEnabled(true);
            this.cover.addTouchEventListener((pSender, type) => {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    this.hide();
                }
            });
            this._spine = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINES_jackpot_json, Resource.ASSETS.SPINES_jackpot_atlas);
            this._spine.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));

            this.value = new ccui.TextBMFont("0", Resource.ASSETS.FNT_JACKPOT);
            this.value.setAnchorPoint(cc.p(0.5, 0));
            this.value.setPosition(cc.p(this._spine.width / 2, -155));
            this.value.ignoreContentAdaptWithSize(true);
            this._spine.addChild(this.value);
            this.mainNode.addChild(this._spine);
            this.addChild(this.mainNode);
        },

        show: function (coinWin, callback = null) {
            this.callback = callback;
            if (coinWin) {
                AudioHandler.playJackpot();
                this.value.setString("+" + StringUtils.Coin(coinWin));
                this.setVisible(true);
                this._spine.clearTrack(0);
                this._spine.setToSetupPose();
                this._spine.setAnimation(0, "animation", true);
                this._spine.setScale(0.5);
                this._spine.runAction(cc.scaleTo(0.22, 1));
            }
        },

        hide: function () {
            AudioHandler.stopJackpot();
            this.setVisible(false);
            this._spine.clearTracks();
            this.callback && this.callback();
        }
    });

    window.PopupJackpot = PopupJackpot;
    return PopupJackpot;
});