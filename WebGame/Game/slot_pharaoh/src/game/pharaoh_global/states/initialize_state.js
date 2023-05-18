Module.define(function (require) {
    "use strict";

// DÙNG 100 % NỘI DUNG FILE NÀY.
    const InitializeState = State.extend({
        ctor: function (commander, slotManager) {
            this.commander = commander;
            this.slotManager = slotManager;
            this.isDownloadDone = false;
        },

        onEnter: function () {
            cc.log("[InitializeState]::[onEnter]");

            // Start listen event
            this.commandSession = this.commander.createSession();
            this.commandSession.on("game.init.lock", () => {
                this.waitForInit++;
            });
            this.commandSession.on("game.init.unlock", () => {
                this.initDone++;
            });

            this.commandSession.on("game.download.done", () => {
                if(this.isDownloadDone) 
                    return;

                this.isDownloadDone = true;
                this.commander.emit("game.init");
            });

            this.waitForInit = 0;
            this.initDone    = 0;

            // Stop lobby music
            AudioHandler.stopBackground();

            // Enter loading scene
            let scene = cc.director.getRunningScene();
            let loadingLayer = new LoadingLayer(this.commander, this.slotManager);
            scene.addChild(loadingLayer);
            
            this.commander.emit("game.init.lock"); 
        },

        onExit: function () {
            cc.log("[InitializeState]::[onExit]");

            // Initialize is now done
            this.commander.emit("game.initDone");

            // Enter main scene
            portalHelper.runGameScene(new MainScene(this.commander, this.slotManager));

            // No more listen
            this.commandSession.dispose();
            this.commandSession = null;
        },

        update: function (dt) {

            let done = (this.initDone >= this.waitForInit);
            return (done && !this.slotManager.isFirstSpinInfo) ? State.EXIT : State.CONTINUE;
        }
    });

    window.InitializeState = InitializeState;
    return InitializeState;
});