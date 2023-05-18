Module.define(function (require) {
    "use strict";

    const StartFreeGameState = State.extend({
        ctor: function (commander, slotManager, numFreeSpin, multiplier, delayTime = 2) {
            cc.log("[StartFreeGameState]::[ctor]");
            this.commander = commander;
            this.slotManager = slotManager;
            this.scatterReelIndex = [];
            this.multiplier = multiplier;
            this.numFreeSpin = numFreeSpin;

            this.highlightScatterDone = false;
            this.calledEffectStartFreeGame = false;
            this.done = false;

            this.waiting = delayTime;
        },

        onEnter: function () {
            cc.log("[StartFreeGameState]::[onEnter]");
            this.scatterReelIndex = this.slotManager.scatterReelIndex;
            this.commandSession = this.commander.createSession();
            this.commandSession.on("slot.highlightScatter.done", () => {
                this.highlightScatterDone = true;
            })

            this.commandSession.on("state.startFreeGame.done", () => {
                this.done = true;
            })

            if (this.scatterReelIndex.length > 0) {
                cc.log("highlightScatter: %j", this.scatterReelIndex);
                this.commander.emit("slot.highlightScatter", this.scatterReelIndex);
            } else {
                this.highlightScatterDone = true;
            }     
        },

        onExit: function () {
            cc.log("[StartFreeGameState]::[onExit]");
            this.commander.removeSession(this.commandSession);    
        },

        update: function (dt) {
            if (this.highlightScatterDone) {
                if (!this.calledEffectStartFreeGame) {
                    this.calledEffectStartFreeGame = true;
                    this.commander.emit("state.startFreeGame", this.multiplier ,this.numFreeSpin);
                }
            }

            if (this.done) {
                if (this.waiting > 0) {
                    this.waiting -= dt;
                } else {
                    return State.EXIT;
                }
            }

            return State.CONTINUE;
        },
    });

    window.StartFreeGameState = StartFreeGameState;
    return StartFreeGameState;
});