/*global define */

Module.define(function (require) {
    "use strict";
    const LOGTAG = "[SlotPharaoh::EffectStartFreeGame]";
    const EffectStartFreeGame = cc.Class.extend({
        ctor: function (slotManager, commander, options) {
            this.slotManager = slotManager;
            this.commander = commander;
            this.parent = options.node;

            let overlay = ccui.Layout.create();
            overlay.setPosition(cc.p(0, 0));
            overlay.setAnchorPoint(cc.p(0, 0));
            overlay.setContentSize(cc.visibleRect);
            overlay.setVisible(false);
            overlay.setOpacity(0);
            this.overlay = overlay;
            this.parent.addChild(this.overlay);

            this.freegameBackgroundAnim = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_BG_FG_JSON, Resource.ASSETS.SPINE_BG_FG_ATLAS);
            this.freegameBackgroundAnim.setPosition(cc.visibleRect.center);
            this.freegameBackgroundAnim.setVisible(false);
            this.freegameBackgroundAnim.setLocalZOrder(ViewStyle.LAYER_ORDER.BACKGROUND);
            this.parent.addChild(this.freegameBackgroundAnim);

            this.anim = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_FREE_GAME_START_JSON, Resource.ASSETS.SPINE_FREE_GAME_START_ATLAS);
            //this.anim.setPosition(cc.visibleRect.center);
            let fillscale = ImageUtils.getFillScale();
            let heightScale = ImageUtils.getHeightScale();
            this.anim.setNormalizedPosition(cc.p(0.5, 0.48 * heightScale));
            this.anim.setContentSize(cc.size(cc.visibleRect.width, cc.visibleRect.height));// this.parent.getContentSize());
            this.anim.setVisible(false);
            this.parent.addChild(this.anim);

            this.anim.setScale(fillscale);

            let board = this.parent.getChildByName("board");

            this.board = board;

            this.freegameBoard = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_FG_BOARD_JSON, Resource.ASSETS.SPINE_FG_BOARD_ATLAS);
            this.freegameBoard.setPosition(cc.visibleRect.center);
            //this.freegameBoard.setAnchorPoint(cc.p(0.5, 0.5));
            this.freegameBoard.setPosition(board.getContentSize().width * 0.5, board.getContentSize().height * 0.49);
            this.freegameBoard.setVisible(false);
            this.freegameBoard.setLocalZOrder(ViewStyle.LAYER_ORDER.MAINGROUND);
            board.addChild(this.freegameBoard);

            // this.anim.setScale(ImageUtils.getFitScale());
            // if (cc.visibleRect.width > DESIGN_WIDTH * ImageUtils.getFitScale()) {
            //     this.anim.x += (cc.visibleRect.width - DESIGN_WIDTH * ImageUtils.getFitScale()) / 2;
            // }
            //
            // if (cc.visibleRect.width > DESIGN_HEIGHT * ImageUtils.getFitScale()) {
            //     this.anim.y += (cc.visibleRect.height - DESIGN_HEIGHT * ImageUtils.getFitScale()) / 2;
            // }

            // let fgStartFree = this.parent.getChildByName("fg_start_free");
            // fgStartFree.setAnchorPoint(cc.p(0.5, 0.5));
            // this.fgStartFree = fgStartFree;
            // ImageUtils.localizeSpriteText(this.fgStartFree, Resource.SPRITES.FG_START_FREE);
            // this.fgStartFree.setLocalZOrder(ViewStyle.LAYER_ORDER.EFFECT);
            // this.fgStartFree.setVisible(true);

            // let tutorialStartFree = this.parent.getChildByName("tutorial_start_free");
            // tutorialStartFree.setAnchorPoint(cc.p(0.5, 0.5));
            // tutorialStartFree.setNormalizedPosition(cc.p(0.5, 0.33 * heightScale));
            // this.tutorialStartFree = tutorialStartFree;
            // ImageUtils.localizeSpriteText(this.tutorialStartFree, Resource.SPRITES.TUTORIAL_START_FREE);
            // this.tutorialStartFree.setLocalZOrder(ViewStyle.LAYER_ORDER.EFFECT);
            // this.tutorialStartFree.setVisible(true);

            // let freeSpinCount = new cc.LabelBMFont(0, Resource.ASSETS.FNT_FG_START);
            // freeSpinCount.setAnchorPoint(cc.p(0.5, 0.5));
            // freeSpinCount.setPosition(this.parent.getContentSize().width * 0.62, this.parent.getContentSize().height * 0.58 * heightScale);
            // this.parent.addChild(freeSpinCount);
            // this.freeSpinCount = freeSpinCount;
            // this.freeSpinCount.setVisible(true);
        },

        clearSpineAnim: function () {
            if (!cc.sys.isObjectValid(this.anim)) {
                return;
            }

            this.anim.clearTrack(0);
            this.anim.setToSetupPose();
        },

        show: function (numFreeSpin, callback = null) {
            this.overlay.setOpacity(0);
            this.overlay.runAction(cc.sequence(
                cc.show(),
                cc.fadeIn(0.2),
                cc.callFunc(() => {
                    this.commander.emit("main.enabledMainScene", false);
                    this.commander.emit("main.setSceneFreeGame");

                    this.board.loadTexture("empire_img/board_freegame_bg.png", ccui.Widget.PLIST_TEXTURE)

                    this.freegameBoard.runAction(cc.sequence(
                        cc.show(),
                        cc.callFunc(() => {
                            this.freegameBoard.setOpacity(255);
                            this.freegameBoard.clearTrack(0);
                            this.freegameBoard.setToSetupPose();
                            this.freegameBoard.setVisible(true);
                            this.freegameBoard.setAnimation(0, "FG_Frame_Light", true);
                        })
                    ));

                    this.freegameBackgroundAnim.runAction(cc.sequence(
                        cc.show(),
                        cc.callFunc(() => {
                            this.freegameBackgroundAnim.setOpacity(255);
                            this.freegameBackgroundAnim.clearTrack(0);
                            this.freegameBackgroundAnim.setToSetupPose();
                            this.freegameBackgroundAnim.setVisible(true);
                            this.freegameBackgroundAnim.setAnimation(0, "BG_MG_Idle", true);
                        })
                    ));

                })
            ));

            this.clearSpineAnim();

            this.anim.setOpacity(0);
            this.anim.runAction(cc.sequence(
                cc.show(),
                cc.spawn(
                    cc.callFunc(() => {
                        this.anim.setAnimation(0, "FG_Declare_Start", false);
                        this.anim.addAnimation(0, "FG_Declare_Loop", false);
                        this.anim.addAnimation(0, "FG_Declare_Loop", false);
                        this.anim.addAnimation(0, "FG_Declare_Loop", false);
                        this.anim.addAnimation(0, "FG_Declare_End", false);
                        this.anim.setVisible(true);
                    }),
                    cc.fadeIn(0.25)
                ),


                cc.callFunc(() => {
                    this.freeSpinCount.setString(numFreeSpin);
                    this.freeSpinCount.setOpacity(0);
                    this.freeSpinCount.setScale(0.2);
                    this.freeSpinCount.setVisible(true);
                    this.freeSpinCount.runAction(cc.sequence(
                        cc.delayTime(0.25),
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.25),
                            cc.scaleTo(0.25, 1).easing(cc.easeBackOut(2))
                        ),
                        cc.delayTime(3.2),
                        cc.fadeOut(0.2),
                        cc.hide()
                    ));

                    this.fgStartFree.setNormalizedPosition(cc.p(0.39, 0.58));
                    this.fgStartFree.setOpacity(0);
                    this.fgStartFree.setVisible(true);
                    this.fgStartFree.setScale(0.2);
                    this.fgStartFree.runAction(cc.sequence(
                        cc.delayTime(0.25),
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.25),
                            cc.scaleTo(0.25, 1).easing(cc.easeBackOut(2))
                        ),
                        cc.delayTime(3.2),
                        cc.fadeOut(0.2),
                        cc.hide()
                    ))

                    this.tutorialStartFree.setOpacity(0);
                    this.tutorialStartFree.setVisible(true);
                    this.tutorialStartFree.setScale(0.2);
                    this.tutorialStartFree.runAction(cc.sequence(
                        cc.delayTime(0.25),
                        cc.show(),
                        cc.spawn(
                            cc.fadeIn(0.25),
                            cc.scaleTo(0.25, 1).easing(cc.easeBackOut(2))
                        ),
                        cc.delayTime(3.2),
                        cc.fadeOut(0.2),
                        cc.hide()
                    ))
                }),
                cc.delayTime(4),
                cc.callFunc(() => {
                    this.commander.emit("main.disableCover");
                    this.anim.setVisible(false);
                    this.anim.clearTrack(0);
                    this.anim.setToSetupPose();
                    callback && callback();
                }),
                cc.hide()
            ))

        },

        backgroundHighlight: function (isHighlight) {
            if (isHighlight) {
                this.freegameBackgroundAnim.setAnimation(0, "BG_FG_Combo", true);
            } else {
                this.freegameBackgroundAnim.setAnimation(0, "BG_MG_Idle", true);
            }
        },

        hide: function () {
            this.overlay.runAction(cc.sequence(
                cc.callFunc(() => {
                    this.commander.emit("main.enabledMainScene", true);

                    this.freegameBoard.setVisible(false);
                    this.freegameBoard.clearTrack(0);
                    this.freegameBoard.setToSetupPose();
                    this.freegameBoard.runAction(cc.sequence(
                        cc.fadeOut(0.2),
                        cc.hide()
                    ));

                    this.board.loadTexture("empire_img/board_bg.png", ccui.Widget.PLIST_TEXTURE)

                    this.freegameBackgroundAnim.setVisible(false);
                    this.freegameBackgroundAnim.clearTrack(0);
                    this.freegameBackgroundAnim.setToSetupPose();
                    this.freegameBackgroundAnim.runAction(cc.sequence(
                        cc.fadeOut(0.2),
                        cc.hide()
                    ))

                }),
                cc.fadeOut(0.2),
                cc.hide()
            ));
        }

    });

    window.EffectStartFreeGame = EffectStartFreeGame;
    return EffectStartFreeGame;
});