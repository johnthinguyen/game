Module.define(function (require) {
    "use strict";

    const IdleFreeGameState = State.extend({
        ctor: function (commander, slotManager) {
            this.commander = commander;
            this.slotManager = slotManager;
        },

        onEnter: function () {
            cc.log("[IdleFreeGameState]::[onEnter]");
            this.commandSession = this.commander.createSession();
            this.commandSession.on("slot.spinRequested", () => {
                this.spinStarted = true;
            });
            this.commander.emit("state.enterIdleFreeGame");
        },

        onExit: function () {
            cc.log("[IdleFreeGameState]::[onExit]");
            this.commander.emit("state.exitIdleFreeGame");
            this.commander.removeSession(this.commandSession);    
        },

        update: function (dt) {
            // Start spin pipeline
            if (this.spinStarted) {
                return new State.Sequence([
                    new SpinningState(this.commander, this.slotManager, true),
                    new HandleFreeGameResultState(this.commander, this.slotManager),
                    new IdleFreeGameState(this.commander, this.slotManager)
                ]);
            }

            if (!this.waitStartSpin) {
                if (this.slotManager.numFreeSpin > 0) {
                    if (!this.slotManager.isSpinError) {
                        this.commander.emit("slot.requestFreeSpin");
                    }
                    this.waitStartSpin = true;
                } else {
                    return new ExitFreeGameState(this.commander);
                }
            }

            return State.CONTINUE;
        },
    });

    window.IdleFreeGameState = IdleFreeGameState;
    return IdleFreeGameState;
});