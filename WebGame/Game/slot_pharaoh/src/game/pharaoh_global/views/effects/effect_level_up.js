/*global define */

Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::EffectLevelUp]";

    const Layer = cc.Layer.extend({
        overlay: null,
        ctor: function () {
            this._super();

            this.overlay = ccui.Layout.create();
            this.overlay.setName("bg");
            this.overlay.setPosition(cc.p(0, 0));
            this.overlay.setContentSize(this.getContentSize());
            this.overlay.setAnchorPoint(cc.p(0, 0));
            this.overlay.setBackGroundColor(cc.color(0x00, 0x00, 0x00));
            this.overlay.setBackGroundColorOpacity(0x99);
            this.overlay.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            this.overlay.setTouchEnabled(true);
            this.overlay.addClickEventListener(this.hide.bind(this));
            this.addChild(this.overlay, -1);

            this.bg = new cc.Sprite(Resource.ASSETS.LEVEL_UP_BG);
            this.bg.setAnchorPoint(cc.p(0.5, 0.5));
            this.bg.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
            this.addChild(this.bg);

            this.txtLevel = new cc.LabelBMFont("0", Resource.ASSETS.FNT_MEGA);
            this.txtLevel.setNormalizedPosition(cc.p(0.5, 0.5));
            this.txtLevel.setPosition(cc.p(this.bg.width * 0.5, this.bg.height * 0.5 + 120));
            this.txtLevel.setScale(1.6);
            this.bg.addChild(this.txtLevel);

            this.bgIcon = new cc.Sprite(Resource.ASSETS.LEVEL_UP_BG_IconItem);
            this.bgIcon.setAnchorPoint(cc.p(0.5, 0.5));
            this.bgIcon.setPosition(cc.p(this.bg.width * 0.5, this.bg.height * 0.28));
            this.bg.addChild(this.bgIcon);

            this.bgText = new cc.Sprite(Resource.ASSETS.LEVEL_UP_BG_BgItem);
            this.bgText.setAnchorPoint(cc.p(0.5, 0.5));
            this.bgText.setScale(2.5);
            this.bgText.setPosition(cc.p(this.bg.width * 0.5, this.bg.height * 0.08));
            this.bg.addChild(this.bgText);

            this.txtCoin = new cc.LabelBMFont("0", Resource.ASSETS.FNT_MEGA);
            this.txtCoin.setAnchorPoint(cc.p(0.5, 0.5));
            this.txtCoin.setScale(0.5);
            this.txtCoin.setPosition(cc.p(this.bgText.width * 0.5, this.bgText.height * 0.6));
            this.bgText.addChild(this.txtCoin);

            let size = this.getContentSize();
            let coinAnimation = Animation.get("FLY_COIN");
            let coinAnimate = cc.repeatForever(cc.animate(coinAnimation));

            let goldParticleEffect = new CoinFlyEffect(coinAnimate, 300, 5, 0.2);
            goldParticleEffect.setScale(0.8);
            goldParticleEffect.setSpawnMotivations({
                position: cc.p(size.width * 0.5, 0),
                startSpeed: 600,
                endSpeed: 1000,
                gravity: -600,
                startAngle: Math.PI * 0.35,
                endAngle: Math.PI * 0.65,
            });
            this.addChild(goldParticleEffect, -1);
            return true;
        },

        show: function (coin, level, callback) {
            //cc.log('coin %j', coin);
            //cc.log('level %j', level);
            this.visible = true;
            this.overlay.setOpacity(0);
            this.callback = callback;
            this.txtLevel.setString(level);
            this.txtCoin.setString(StringUtils.CoinCompact(coin));
            this.overlay.runAction(cc.sequence(
                cc.show(), 
                cc.fadeIn(0.2),
                cc.delayTime(5),
                cc.callFunc(this.hide.bind(this))
                ));
        },

        hide: function () {
            this.overlay.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.hide(),
                cc.callFunc(() => {
                    this.visible = false;
                    this.callback && this.callback();
                    this.removeFromParent();
                })));
        }
    });

    const EffectLevelUp = {
        show: function (coin, level, callback) {
            let parent = cc.director.getRunningScene();
            let layer = parent.getChildByName('levelupEffect');
            if (!layer) {
                layer = new Layer();
                layer.setName('levelupEffect');
                parent.addChild(layer, 999999);
            }
            layer.show(coin, level, callback);
        },
    };

    window.EffectLevelUp = EffectLevelUp;
    return EffectLevelUp;
});