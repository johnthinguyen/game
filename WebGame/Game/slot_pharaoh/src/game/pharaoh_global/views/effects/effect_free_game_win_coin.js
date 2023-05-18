/*global define */

Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::EffectFreeGameWinCoin]";
    const EffectFreeGameWinCoin = cc.Class.extend({
        ctor: function (slotManager, commander, options) {
            this.slotManager = slotManager;
            this.commander = commander;
            this.parent = options.node;

            let fitscale = ImageUtils.getFitScale();
            let heightScale = Math.min(1, ImageUtils.getHeightScale());

            this.anim = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_FREE_GAME_WIN_COIN_JSON, Resource.ASSETS.SPINE_FREE_GAME_WIN_COIN_ATLAS);
            this.anim.setVisible(false);
            this.anim.setPosition(cc.visibleRect.center);
            this.anim.setScale(ImageUtils.getWidthScale(),ImageUtils.getHeightScale());
            this.anim.setNormalizedPosition(cc.p(0.5, 0.5 * heightScale));
            this.anim.setContentSize(this.parent.getContentSize());

            this.anim.setScale(0.65 * fitscale);
            this.parent.addChild(this.anim, ViewStyle.LAYER_ORDER.EFFECT);

            this.character = new cc.Sprite();
            this.character.setScale(2);
            this.character.setAnchorPoint(cc.p(0.5, 0.5));
            this.anim.addChild(this.character);

            this.frameWinCoin = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_FREE_GAME_FRAME_WIN_COIN_JSON, Resource.ASSETS.SPINE_FREE_GAME_FRAME_WIN_COIN_ATLAS);
            this.anim.addChild(this.frameWinCoin);

            this.overlay = ccui.Layout.create();
            this.overlay.setAnchorPoint(cc.p(0.5, 0.5));
            // this.overlay.setPosition(cc.visibleRect.center);
            this.overlay.setNormalizedPosition(cc.p(0.5, 0.5));
            this.overlay.setContentSize(this.parent.getContentSize());
            this.parent.addChild(this.overlay, ViewStyle.LAYER_ORDER.EFFECT);
            this.overlay.setVisible(false);

            this.txtWinCoin = new ccui.TextBMFont("0", Resource.ASSETS.FNT_FG_ROUND);
            // this.txtWinCoin.setNormalizedPosition(cc.p(0.5, 0.5));
            this.txtWinCoin.setAnchorPoint(cc.p(0.5, 0.5));
            this.txtWinCoin.setNormalizedPosition(cc.p(0.5, 0.25 * heightScale));
            this.txtWinCoin.setVisible(true);
            this.overlay.addChild(this.txtWinCoin);

            this.txtTotalFreeSpin = new cc.LabelBMFont(0, Resource.ASSETS.FNT_EFG_SPIN);
            // this.txtTotalFreeSpin.setNormalizedPosition(cc.p(0.5, 0.5));
            this.txtTotalFreeSpin.setAnchorPoint(cc.p(0.5, 0.5));
            this.txtTotalFreeSpin.setNormalizedPosition(cc.p(0.55, 0.12 * heightScale));
            this.txtTotalFreeSpin.setVisible(true);
            this.overlay.addChild(this.txtTotalFreeSpin);

            // let congratEndFree = this.parent.getChildByName("congrat_end_free");
            // congratEndFree.setAnchorPoint(cc.p(0.5, 0.5));
            // congratEndFree.setNormalizedPosition(cc.p(0.5, 0.42 * heightScale));
            // this.congratEndFree = congratEndFree;
            // ImageUtils.localizeSpriteText(this.congratEndFree, Resource.SPRITES.CONGRAT_END_FREE);
            // this.congratEndFree.setLocalZOrder(ViewStyle.LAYER_ORDER.EFFECT);
            // this.congratEndFree.setVisible(true);

            // let numSpinEndFree = this.parent.getChildByName("freespin_end_free");
            // numSpinEndFree.setAnchorPoint(cc.p(0.5, 0.5));
            // this.numSpinEndFree = numSpinEndFree;
            // ImageUtils.localizeSpriteText(this.numSpinEndFree, Resource.SPRITES.FREESPIN_END_FREE);
            // this.numSpinEndFree.setLocalZOrder(ViewStyle.LAYER_ORDER.EFFECT);
            // this.numSpinEndFree.setVisible(true);

            this.isShow = false;
        },

        clearSpineAnim: function () {
            if (!cc.sys.isObjectValid(this.anim)) {
                return;
            }

            this.anim.clearTrack(0);
            this.anim.setToSetupPose();
        },

        show: function (winCoin, totalFreeSpin, callback = null) {
            this.callback = callback;
            this.clearSpineAnim();

            this.anim.runAction(cc.sequence(
                cc.show(),
                cc.callFunc(() => {
                    this.anim.setOpacity(255),
                    this.anim.setAnimation(0, "FG_Compiment_Start", false);
                    this.anim.addAnimation(0, "FG_Compiment_End", false);
                    this.anim.setVisible(true);

                    this.frameWinCoin.clearTrack(0);
                    this.frameWinCoin.setToSetupPose();
                    this.frameWinCoin.setNormalizedPosition(cc.p(0, 0));
                    this.frameWinCoin.setAnimation(0, "FG_Compiment_Start", false);
                    this.frameWinCoin.addAnimation(0, "FG_Compiment_End", false);

                    this.character.stopAllActions();
                    this.character.setNormalizedPosition(cc.p(0, 0.3));
                    this.character.runAction(cc.sequence(
                        cc.animate(Animation.get("FG_CHARACTER_SHOW")),
                        cc.repeat(cc.animate(Animation.get("FG_CHARACTER_SHOW_LOOP")), 3),
                        cc.animate(Animation.get("FG_CHARACTER_SHOW_HIDE"))
                    ));
                })
            ))

            this.overlay.setVisible(true);

            this.overlay.runAction(cc.sequence(
                cc.show(),
                cc.callFunc(() => {
                    this.txtWinCoin.stopAllActions();
                    this.txtWinCoin.setString(0);
                    this.txtWinCoin.setOpacity(0);
                    this.txtWinCoin.setScale(0.2);
                    this.txtWinCoin.runAction(cc.sequence(
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.3),
                            cc.scaleTo(0.3, 1)
                        ),
                        cc.spawn(
                            cc.callFunc(() =>{
                                TextUtils.tweenCoin(this.txtWinCoin, 0, winCoin, SlotRule.SHOW_WIN_END_FREE_GAME_TIME - 0.9, null, true, ",");
                            }),
                            cc.scaleTo(SlotRule.SHOW_WIN_END_FREE_GAME_TIME - 0.4, 1.05)
                        ),
                        cc.scaleTo(0.15, 1),
                        cc.scaleTo(0.1, 1.1)
                    ));

                    this.txtTotalFreeSpin.stopAllActions();
                    this.txtTotalFreeSpin.setString(totalFreeSpin);
                    this.txtTotalFreeSpin.setOpacity(0);
                    this.txtTotalFreeSpin.setScale(4);
                    this.txtTotalFreeSpin.runAction(cc.sequence(
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.25),
                            cc.scaleTo(0.25, 1)
                        ),
                        cc.callFunc(() => {
                            this.isShow = true;
                        })
                    ));

                    // this.congratEndFree.setOpacity(255);
                    // this.congratEndFree.setVisible(true);
                    // this.congratEndFree.setScale(4);
                    // this.congratEndFree.runAction(cc.sequence(
                    //     cc.show(),
                    //     cc.spawn(
                    //         cc.fadeIn(0.25),
                    //         cc.scaleTo(0.25, 1)
                    //     )
                    // ));

                    // this.numSpinEndFree.setNormalizedPosition(cc.p(0.45, 0.12));
                    // this.numSpinEndFree.setOpacity(255);
                    // this.numSpinEndFree.setVisible(true);
                    // this.numSpinEndFree.setScale(4);
                    // this.numSpinEndFree.runAction(cc.sequence(
                    //     cc.show(),
                    //     cc.spawn(
                    //         cc.fadeIn(0.25),
                    //         cc.scaleTo(0.25, 1)
                    //     )
                    // ));
                })
            ));

            this.parent.scheduleOnce(this.onTimeOutHide.bind(this), SlotRule.SHOW_WIN_END_FREE_GAME_TIME + 1.7);
        },

        onTimeOutHide: function () {
            this.isShow = false;
            this.playActionHide();
        },

        playActionHide: function () {
            if (!cc.sys.isObjectValid(this.overlay) || !cc.sys.isObjectValid(this.anim))
                return;

            this.isHiding = true;
            // this.anim.setAnimation(0, "bien_mat", false);

            this.overlay.stopAllActions();
            this.overlay.runAction(cc.sequence(
                cc.callFunc(() => {
                    this.txtWinCoin.stopAllActions();
                    this.txtWinCoin.runAction(cc.sequence(
                        cc.scaleTo(0.25, 0.1),
                        cc.hide()
                    ));

                    this.txtTotalFreeSpin.stopAllActions();
                    this.txtTotalFreeSpin.runAction(cc.sequence(
                        cc.scaleTo(0.25, 0.1),
                        cc.hide()
                    ));


                    // this.congratEndFree.runAction(cc.sequence(
                    //     cc.fadeOut(0.2),
                    //     cc.hide()
                    // ));

                    // this.numSpinEndFree.runAction(cc.sequence(
                    //     cc.fadeOut(0.2),
                    //     cc.hide()
                    // ));

                    this.anim.runAction(cc.sequence(
                        cc.fadeOut(0.2),
                        cc.callFunc(() => {
                            this.anim.setVisible(false);
                            this.anim.clearTrack(0);
                            this.anim.setToSetupPose();
                        }),
                        cc.hide()
                    ))

                    this.commander.emit("main.disableCover");
                    this.callback && this.callback();
                    this.isHiding = false;
                }),
                cc.hide()
            ));
        },

        hide: function () {
            if (!this.isShow || this.isHiding) {
                return;
            }
            this.isShow = false;

            this.parent.unschedule(this.onTimeOutHide);
            this.playActionHide();
        },
    });

    window.EffectFreeGameWinCoin = EffectFreeGameWinCoin;
    return EffectFreeGameWinCoin;
});