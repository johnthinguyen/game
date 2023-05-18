/*global define */

Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::EffectExtraSpin]";

    const EffectExtraSpin = cc.Class.extend({
        ctor: function (slotManager, commander, options) {
            this.slotManager = slotManager;
            this.commander = commander;

            let parent = options.node || cc.director.getRunningScene();
            this.mainLayer = ccs._load(Resource.ASSETS.CCS_ExtraSpin);
            this.mainLayer.setContentSize(cc.visibleRect);
            ccui.helper.doLayout(this.mainLayer);
            parent.addChild(this.mainLayer, ViewStyle.LAYER_ORDER.EFFECT);

            let board = parent.getChildByName("board");
            this.panelFreeGameInfo = board.getChildByName("panel_free_game_info");

            this.initComponent(this.mainLayer);
        },

        initComponent: function (mainLayer) {

            this.extraSpinAnim = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_EXTRA_SPIN_JSON, Resource.ASSETS.SPINE_EXTRA_SPIN_ATLAS);
            this.extraSpinAnim.setPosition(cc.visibleRect.center);
            this.extraSpinAnim.setVisible(false);
            this.extraSpinAnim.setLocalZOrder(ViewStyle.LAYER_ORDER.BACKGROUND);
            mainLayer.addChild(this.extraSpinAnim);

            this.panelText = mainLayer.getChildByName("panel_text");

            let textWinExtra = this.panelText.getChildByName("txt_won");
            textWinExtra.setAnchorPoint(cc.p(0.5, 0.5));
            textWinExtra.setNormalizedPosition(cc.p(0.5, 0.63));
            this.textWinExtra = textWinExtra;
            ImageUtils.localizeSpriteText(this.textWinExtra, Resource.SPRITES.TEXT_WIN_EXTRA);
            this.textWinExtra.setLocalZOrder(ViewStyle.LAYER_ORDER.EFFECT);
            this.textWinExtra.setVisible(false);

            let textFreeSpinExtra = this.panelText.getChildByName("txt_free_game");
            textFreeSpinExtra.setAnchorPoint(cc.p(0.5, 0.5));
            textFreeSpinExtra.setNormalizedPosition(cc.p(0.5, 0.37));
            this.textFreeSpinExtra = textFreeSpinExtra;
            ImageUtils.localizeSpriteText(this.textFreeSpinExtra, Resource.SPRITES.FG_START_FREE);
            this.textFreeSpinExtra.setLocalZOrder(ViewStyle.LAYER_ORDER.EFFECT);
            this.textFreeSpinExtra.setVisible(false);

            let freeSpinExtra = this.panelText.getChildByName("num_extra_spin");
            freeSpinExtra.setAnchorPoint(cc.p(0.5, 0.5));
            freeSpinExtra.setNormalizedPosition(cc.p(0.5, 0.5));
            this.freeSpinExtra = freeSpinExtra;
            this.freeSpinExtra.setVisible(false);
            this.freeSpinExtra.firstPos = freeSpinExtra.getPosition();

            mainLayer.setVisible(false);
        },

        show: function (numFreeSpin, callback = null) {
            this.callback = callback;
            this.mainLayer.setOpacity(0);

            this.freeSpinExtra.setString(numFreeSpin);

            this.textWinExtra.stopAllActions();
            this.textFreeSpinExtra.stopAllActions();
            this.freeSpinExtra.stopAllActions();
            this.freeSpinExtra.setPosition(this.freeSpinExtra.firstPos)
            this.freeSpinExtra.setFntFile(Resource.ASSETS.FNT_FG_START);

            this.mainLayer.runAction(cc.sequence(
                cc.show(),
                cc.delayTime(0.25),
                cc.fadeIn(0.25),
                cc.callFunc(() =>{
                    this.extraSpinAnim.setOpacity(255);
                    this.extraSpinAnim.clearTrack(0);
                    this.extraSpinAnim.setToSetupPose();
                    this.extraSpinAnim.setTimeScale(0.9);
                    this.extraSpinAnim.setVisible(true);
                    this.extraSpinAnim.setAnimation(0, "Add_Spin", false);
                    this.extraSpinAnim.runAction(
                        cc.show()
                    )

                }),
                cc.delayTime(0.15),
                cc.callFunc(() =>{

                    this.textWinExtra.setOpacity(255);
                    this.textWinExtra.setVisible(true);
                    this.textWinExtra.setScale(4);
                    this.textWinExtra.runAction(cc.sequence(
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.25),
                            cc.scaleTo(0.25, 1)
                        )
                    ));

                    this.textFreeSpinExtra.setOpacity(255);
                    this.textFreeSpinExtra.setVisible(true);
                    this.textFreeSpinExtra.setScale(4);
                    this.textFreeSpinExtra.runAction(cc.sequence(
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.25),
                            cc.scaleTo(0.25, 1)
                        )
                    ));

                    this.freeSpinExtra.setOpacity(255);
                    this.freeSpinExtra.setVisible(true);
                    this.freeSpinExtra.setScale(4);
                    this.freeSpinExtra.runAction(cc.sequence(
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.25),
                            cc.scaleTo(0.25, 1)
                        ),
                        cc.delayTime(1.3),
                        cc.scaleTo(0.5,1.2),
                        cc.scaleTo(0.5,1)
                    ));
                }),
                cc.callFunc(() =>{
                    this.showEffectAddSpin();
                })
            ));

            this.mainLayer.scheduleOnce(this.hide.bind(this), 3.6);
        },

        hide: function () {
            if (!cc.sys.isObjectValid(this.mainLayer))
                return;

            this.mainLayer.stopAllActions();
            this.mainLayer.runAction(cc.sequence(
                // cc.fadeOut(0.5),
                cc.callFunc(() =>{
                    this.textWinExtra.runAction(
                        cc.sequence(
                            cc.spawn(
                                cc.fadeOut(0.25),
                                cc.scaleTo(0.1, 0.1)
                            ),
                            cc.hide()
                        )
                    )
                    this.textFreeSpinExtra.runAction(
                        cc.sequence(
                            cc.spawn(
                                cc.fadeOut(0.25),
                                cc.scaleTo(0.1, 0.1)
                            ),
                            cc.hide()
                        )
                    );

                    this.freeSpinExtra.runAction(
                        cc.sequence(
                            // cc.spawn(
                            //     cc.fadeOut(0.25),
                            //     cc.scaleTo(0.1, 0.1)
                            // ),
                            cc.hide()
                        )
                    );

                    this.extraSpinAnim.runAction(
                        cc.fadeOut(0.5)
                    );
                }),
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.extraSpinAnim.setVisible(false);
                    this.extraSpinAnim.clearTrack(0);
                    this.extraSpinAnim.setToSetupPose();
                    this.extraSpinAnim.runAction(
                        cc.hide()
                    );

                    this.commander.emit("main.disableCover");
                    this.callback && this.callback();
                }),
                cc.hide()
            ));
        },

        showEffectAddSpin: function (){
            let highlightTime = 2.5;

            let panelFreeGameComboPos = this.panelFreeGameInfo.getPosition();
            panelFreeGameComboPos.parent = this.panelFreeGameInfo.getParent();

            panelFreeGameComboPos = panelFreeGameComboPos.parent.convertToWorldSpace(panelFreeGameComboPos);
            let panelFreeGameComboNewPos = this.mainLayer.convertToNodeSpace(panelFreeGameComboPos);
            // TextUtils.switchParent(this.panelFreeGameInfo, this.mainLayer, panelFreeGameComboNewPos);

            let destination = panelFreeGameComboNewPos;
            cc.log("destination pos %j", destination)
            let fireBall = new cc.ParticleSystem(Resource.ASSETS.PARTICLE_FIRE_BALL);
            fireBall.stopSystem();
            fireBall.setScale(2);
            fireBall.setPosition(this.freeSpinExtra.getPosition());
            let bezier = [fireBall.getPosition(), cc.p(fireBall.x + 100, destination.y), cc.p(destination.x - 35, destination.y - 70)];
            let preZOrder = this.freeSpinExtra.getLocalZOrder();
            this.freeSpinExtra.setLocalZOrder(120);
            this.mainLayer.addChild(fireBall);
            fireBall.runAction(cc.sequence(
                cc.delayTime(highlightTime),
                cc.callFunc(() =>{
                    fireBall.resetSystem();
                }),
                cc.spawn(
                    cc.bezierTo(0.6, bezier).easing(cc.easeSineIn()),
                    cc.scaleTo(0.5, 1.5),
                    cc.callFunc(() =>{
                        this.freeSpinExtra.runAction(cc.sequence(
                            cc.fadeOut(0.1)
                            // cc.delayTime(0.6),
                            // cc.callFunc(() =>{
                            //     this.freeSpinExtra.setString(this.slotManager.numFreeSpin);
                            //     this.freeSpinExtra.setPosition(destination);
                            //     this.freeSpinExtra.setFntFile(Resource.ASSETS.FNT_EFG_SPIN);
                            // }),
                            // cc.spawn(
                            //     cc.fadeIn(0.2),
                            //     cc.scaleTo(0.25, 2.5)
                            // ),
                            // cc.spawn(
                            //     cc.scaleTo(0.15, 1),
                            //     cc.fadeOut(0.2)
                            // )
                        ))
                    })
                ),
                cc.callFunc(() =>{
                    // TextUtils.switchParent(this.panelFreeGameInfo, panelFreeGameComboPos.parent, panelFreeGameComboPos);
                    this.commander.emit("slot.showEffectFreeSpinAdded");

                    this.freeSpinExtra.setLocalZOrder(preZOrder);
                    fireBall.stopSystem();
                })
            ))
        }

    });

    window.EffectExtraSpin = EffectExtraSpin;
    return EffectExtraSpin;
});