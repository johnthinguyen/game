// DÙNG TOÀN BỘ NỘI DUNG FILE NÀY
Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotGhost::LoadingLayer]";

    const LoadingLayer = cc.Layer.extend({
        ctor: function (commander, slotManager) {
            this._super();

            this.commander = commander;
            this.slotManager = slotManager;

            return true;
        },

        onExit: function () {
            this._super();
        },

        onEnterTransitionDidFinish: function () {
            this._super();

            this.startLoading();
        },

        startLoading: function () {
            this.loadingState = Resource.preload();
            
            this.scheduleUpdate();

            if (portalHelper.notifyGame)
                portalHelper.notifyGame(portalHelper.EVENT_GAME_LOAD_BEGAN, { sender: this });
        },

        update: function (dt) {
            let percent = this.loadingState.progress;

            this.commander.emit("game.loading.updatePercent", percent);

            if (percent >= 100) {
                this.unscheduleUpdate();
                this.scheduleOnce(this.finalize, 0.1);

                if (portalHelper.notifyGame)
                    portalHelper.notifyGame(portalHelper.EVENT_GAME_LOAD_ENDED, { sender: this });
            }
        },

        finalize: function() {
            this.commander.emit("game.download.done");
            this.commander.emit("game.init.unlock");
        },
    });

    window.LoadingLayer = LoadingLayer;
    return LoadingLayer;
});