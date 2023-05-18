"use strict";

var DebugLayer = cc.Layer.extend({
    LOGTAG: "[DebugLayer]",
    isBusy: false,

    ctor: function ctor(sceneCreator) {
        this._super();

        this.sceneCreator = sceneCreator;

        this.text = new ccui.Text("1. Set breakpoints in your source code.\n2. Tap to enter game scene.", "Arial", 30);
        this.text.setTextColor(cc.color.WHITE);
        this.text.setPosition(cc.visibleRect.center);
        this.addChild(this.text);

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            }.bind(this),
            onTouchEnded: function (touch, event) {
                this.hide();
            }.bind(this)
        });

        cc.eventManager.addListener(touchListener, this);
    },

    hide: function hide() {

        if (this.isBusy) return;

        this.isBusy = true;

        if (this.sceneCreator && this.sceneCreator instanceof Function) {
            var scene = this.sceneCreator();
            if (scene) {
                cc.director.runScene(scene);
                this.targetScenePrototype = null;
            } else {
                cc.log(this.LOGTAG, "Failed creating scene.");
                portalHelper.returnLobbyScene();
            }
        } else {
            cc.log(this.LOGTAG, "Invalid scene creator. Cannot start scene.");
            portalHelper.returnLobbyScene();
        }
    },

    onExit: function onExit() {
        this._super();
    }
});

var DebugScene = cc.Scene.extend({
    ctor: function ctor(sceneCreator) {
        this._super();
        this.addChild(new DebugLayer(sceneCreator));
    }
});