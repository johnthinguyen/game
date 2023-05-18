/*global define */

Module.define(function (require) {
    "use strict";
    const LOGTAG = "[SlotPharaoh::EffectBigWin]";

    const EffectBigWin = cc.Class.extend({
        ctor: function (slotManager, commander, options) {
            this.slotManager = slotManager;
            this.commander = commander;
            this.parent = options.node;

            this.anim = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_BIG_WIN_JSON, Resource.ASSETS.SPINE_BIG_WIN_ATLAS);
            this.anim.setPosition(cc.visibleRect.center);
            this.anim.setScale(ImageUtils.getFitScale());
            this.parent.addChild(this.anim, ViewStyle.LAYER_ORDER.EFFECT);
            this.anim.setVisible(false);

            this.overlay = ccui.Layout.create();
            this.overlay.setAnchorPoint(cc.p(0.5, 0.5));
            this.overlay.setNormalizedPosition(cc.p(0.5, 0.5));
            this.overlay.setContentSize(cc.size(this.parent.getContentSize().width * 0.5, this.parent.getContentSize().height * 0.5));
            this.anim.addChild(this.overlay);
            this.overlay.setVisible(false);

            this.txtWinCoin = new ccui.TextBMFont("0", Resource.ASSETS.FNT_FG_ROUND);
            this.txtWinCoin.setNormalizedPosition(cc.p(0.5, -0.03));
            this.overlay.addChild(this.txtWinCoin);

            this.isShow = false;
        },

        clearSpineAnim: function () {
            if (!cc.sys.isObjectValid(this.anim)) {
                return;
            }

            this.anim.clearTrack(0);
            this.anim.setToSetupPose();
        },

        show: function (type, winCoin) {
            this.type = type;
            this.isShow = true;
            AudioHandler.playEffectBigWin();
            let time = 0;

            this.clearSpineAnim();
            this.anim.stopAllActions();

            let delaytime_change = [];

            switch (type) {
                case SlotRule.BIG_WIN_TYPE.BIG_WIN:
                    time = SlotRule.BIG_WIN_TIME;
                    this.anim.setAnimation(0, "BigWin_Start", false);
                    this.anim.addAnimation(0, "BigWin_End", false);
                    break;
                case SlotRule.BIG_WIN_TYPE.MEGA_WIN:
                    time = SlotRule.MEGA_WIN_TIME;
                    delaytime_change.push(SlotRule.BIG_WIN_TIME);
                    this.anim.setAnimation(0, "BigWin_Start", false);
                    this.anim.addAnimation(0, "MegaWin_Start", false);
                    this.anim.addAnimation(0, "MegaWin_End", false);
                    break;
                case SlotRule.BIG_WIN_TYPE.SUPER_WIN:
                    time = SlotRule.SUPER_WIN_TIME;
                    delaytime_change.push(SlotRule.BIG_WIN_TIME);
                    delaytime_change.push(SlotRule.MEGA_WIN_TIME);
                    this.anim.setAnimation(0, "BigWin_Start", false);
                    this.anim.addAnimation(0, "MegaWin_Start", false);
                    this.anim.addAnimation(0, "SuperWin_Start", false);
                    this.anim.addAnimation(0, "SuperWin_End", false);
                    break;
            }

            //effect sound change win
            for (let i = 0; i < delaytime_change.length; i++) {
                this.parent.scheduleOnce(() => {
                    AudioHandler.playEffectBigWinChange();
                }, delaytime_change[i]);
            }

            this.parent.scheduleOnce(() => {
                AudioHandler.playEffectBigWinEnd();
            }, time);

            this.playActionShow(type);

            TextUtils.tweenCoin(this.txtWinCoin, 0, winCoin, time, this.hide.bind(this), true, ",");

            this.anim.setScale(1);
            this.anim.setVisible(true);

        },

        hide: function () {
            if (!this.isShow) {
                return;
            }

            this.isShow = false;
            this.isHiding = true;
            this.anim.stopAllActions();

            this.parent.scheduleOnce(() => {
                this.playActionHide();
            }, 2)
        },

        playActionShow: function (type) {
            this.overlay.stopAllActions();
            this.overlay.setNormalizedPosition(cc.p(0.5, 0.5));
            this.txtWinCoin.stopAllActions();
            this.txtWinCoin.setOpacity(255);

            this.overlay.setScale(0);
            this.overlay.setOpacity(255);
            this.overlay.setVisible(true);

            this.anim.setOpacity(255);
            this.anim.setVisible(true);


            this.overlay.runAction(cc.sequence(
                cc.show()
            ));

            switch (type) {
                case SlotRule.BIG_WIN_TYPE.BIG_WIN:
                    this.overlay.runAction(cc.sequence(
                        // start big win
                        cc.delayTime(0.33),
                        cc.spawn(
                            cc.scaleTo(0.033, 0.3667),
                            cc.moveTo(0.033,cc.p(0, -53))
                        ),
                        cc.spawn(
                            cc.scaleTo(0.066, 1.1),
                            cc.moveTo(0.066,cc.p(0, 0))
                        ),
                        cc.scaleTo(0.066, 0.76),
                        cc.scaleTo(2.5, 0.8504),

                        // end big win
                        cc.scaleTo(0, 0.7504),
                        cc.scaleTo(0.166, 1.1),
                        cc.scaleTo(0.1, 1.3696),
                        cc.scaleTo(0.066, 0.9304),
                        cc.scaleTo(0.066, 1.1504),
                        cc.scaleTo(0.066, 0.8),
                        cc.delayTime(1.2),
                        cc.scaleTo(0.166, 0)
                    ))
                    break;
                case SlotRule.BIG_WIN_TYPE.MEGA_WIN:
                    this.overlay.runAction(cc.sequence(
                        // start big win
                        cc.delayTime(0.33),
                        cc.spawn(
                            cc.scaleTo(0.033, 0.3667),
                            cc.moveTo(0.033,cc.p(0, -53))
                        ),
                        cc.spawn(
                            cc.scaleTo(0.066, 1.1),
                            cc.moveTo(0.066,cc.p(0, 0))
                        ),
                        cc.scaleTo(0.066, 0.76),
                        cc.scaleTo(2.5, 0.8504),

                        // start mega win
                        cc.scaleTo(0, 0.88),
                        cc.scaleTo(0.066, 0.8),
                        cc.scaleTo(0.033, 1.144),
                        cc.scaleTo(0.066, 1.04),
                        cc.scaleTo(0.066, 0.856),
                        cc.scaleTo(0.066, 0.76),
                        cc.delayTime(0.2),
                        cc.scaleTo(2.5, 0.8504),

                        // end mega win
                        cc.scaleTo(0, 0.7504),
                        cc.scaleTo(0.066, 1),
                        cc.scaleTo(0.2, 1.3696),
                        cc.scaleTo(0.066, 0.8),
                        cc.scaleTo(0.066, 1.1504),
                        cc.scaleTo(0.066, 0.8),
                        cc.delayTime(1.2),
                        cc.scaleTo(0.166, 0)
                    ))
                    break;
                case SlotRule.BIG_WIN_TYPE.SUPER_WIN:
                    this.overlay.runAction(cc.sequence(
                        // start big win
                        cc.delayTime(0.33),
                        cc.spawn(
                            cc.scaleTo(0.033, 0.3667),
                            cc.moveTo(0.033,cc.p(0, -53))
                        ),
                        cc.spawn(
                            cc.scaleTo(0.066, 1.1),
                            cc.moveTo(0.066,cc.p(0, 0))
                        ),
                        cc.scaleTo(0.066, 0.76),
                        cc.scaleTo(2.5, 0.8504),

                        // start mega win
                        cc.scaleTo(0, 0.88),
                        cc.scaleTo(0.066, 0.8),
                        cc.scaleTo(0.033, 1.144),
                        cc.scaleTo(0.066, 1.04),
                        cc.scaleTo(0.066, 0.856),
                        cc.scaleTo(0.066, 0.76),
                        cc.delayTime(0.2),
                        cc.scaleTo(2.5, 0.8504),

                        // start super win
                        cc.scaleTo(0, 0.88),
                        cc.scaleTo(0.066, 0.8),
                        cc.scaleTo(0.033, 1.144),
                        cc.scaleTo(0.066, 1.04),
                        cc.scaleTo(0.066, 0.856),
                        cc.scaleTo(0.066, 0.76),
                        cc.delayTime(0.2),
                        cc.scaleTo(2.5, 0.8504),

                        // end super win
                        cc.scaleTo(0, 0.7504),
                        cc.scaleTo(0.066, 1.0),
                        cc.scaleTo(0.2, 1.3696),
                        cc.scaleTo(0.066, 0.8),
                        cc.scaleTo(0.066, 1.1504),
                        cc.scaleTo(0.066, 0.8),
                        cc.delayTime(1.2),
                        cc.scaleTo(0.166, 0)

                    ))
                    break;
            }
        },

        playActionHide: function () {
            if (!cc.sys.isObjectValid(this.anim))
                return;

            this.overlay.stopAllActions();
            this.anim.runAction(cc.sequence(
                cc.fadeOut(0.4),
                cc.callFunc(() => {
                    this.isHiding = false;
                    AudioHandler.stopEffectBigWin();
                    this.anim.setVisible(false);
                    this.commander.emit("slot.bigwin.hide");
                    this.commander.emit("main.disableCover");
                }),
                // cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.overlay.runAction(cc.sequence(
                            cc.fadeOut(0.4),
                            cc.hide()
                    ))
                })
            ));
        },

    });

    window.EffectBigWin = EffectBigWin;
    return EffectBigWin;
});