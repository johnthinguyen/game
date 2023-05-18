Module.define(function (require) {
    "use strict";

    const Background = cc.Class.extend({

        ORANGE_COLOR: "#ffad33",
        WHITE_COLOR: "#FFFFFF",

        BACKGROUND_MODE: {
            IDLE: 0,
            WIN: 1,
            FREE_GAME: 2,
            WIN_FREE_GAME: 3,
            START_FREE_GAME: 4
        },

        ctor: function (options) {
            this.mainLayer = options.node;

            this.initComponent(this.mainLayer);
            this.mode = -1;
        },

        initComponent: function (mainLayer) {
            this.backgroundAnim = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_BG_MG_JSON, Resource.ASSETS.SPINE_BG_MG_ATLAS);
            this.backgroundAnim.setPosition(cc.visibleRect.center);
            this.backgroundAnim.setVisible(false);
            this.backgroundAnim.setLocalZOrder(ViewStyle.LAYER_ORDER.MAINGROUND);
            mainLayer.addChild(this.backgroundAnim);
        },

        show: function(){
            this.backgroundAnim.runAction(cc.sequence(
                cc.show(),
                cc.callFunc(() =>{
                    this.backgroundAnim.setOpacity(255);
                    this.backgroundAnim.clearTrack(0);
                    this.backgroundAnim.setToSetupPose();
                    this.backgroundAnim.setVisible(true);
                    this.backgroundAnim.setAnimation(0, "BG_MG_Idle", true);
                })
            ));

        },
        hide: function(){
            this.backgroundAnim.runAction(cc.sequence(
                cc.callFunc(() =>{
                    this.backgroundAnim.setVisible(false);
                    this.backgroundAnim.clearTrack(0);
                    this.backgroundAnim.setToSetupPose();
                }),
                cc.fadeOut(0.2),
                cc.hide()
            ));
        },

        updateScaleResolution: function () {
            this.mainLayer.setContentSize(cc.visibleRect);
            this.mainLayer.setPosition(cc.visibleRect.center);
            this.backgroundAnim.setScale(ImageUtils.getWidthScale(),ImageUtils.getHeightScale());
            ccui.helper.doLayout(this.mainLayer);
        }
    });

    window.Background = Background;
    return Background;
});