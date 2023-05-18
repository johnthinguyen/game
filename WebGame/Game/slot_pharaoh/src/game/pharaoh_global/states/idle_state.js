Module.define(function (require) {
    "use strict";

    const LOGTAG            = "[SlotPharaoh::IdleState]";
    const IdleState = State.extend({
        ctor: function (commander, slotManager) {
            this.commander = commander;
            this.slotManager = slotManager;

            this.lineWinResults = this.slotManager.listWinResults || [];
            this.lineWinIndex = 0;
            this.isAutoSpin = false;
            this.isAutoCalled = false;
        },

        onEnter: function () {
            cc.log("[IdleState]::[onEnter]");

            this.commandSession = this.commander.createSession();
            this.commandSession.on("slot.spinRequested", () => {
                this.spinStarted = true;
            });

            if (this.slotManager.isAutoSpin) {
                this.isAutoSpin = true;
            }

            this.commander.emit("state.enterIdle");
        },

        onExit: function () {
            cc.log("[IdleState]::[onExit]");

            this.commander.emit("state.exitIdle");
            this.commander.removeSession(this.commandSession);
        },

        update: function (dt) {
            // Start spin pipeline
            if (this.spinStarted) {
                return new State.Sequence([
                    new SpinningState(this.commander, this.slotManager),
                    new HandleResultState(this.commander, this.slotManager),
                    new IdleState(this.commander, this.slotManager)
                ]);
            }

            // Handle result immediately
            if (this.spinStopped) {
                return new State.Sequence([
                    new HandleResultState(this.commander, this.slotManager),
                    new IdleState(this.commander, this.slotManager)
                ]);
            }

            if (this.isAutoSpin && !this.isAutoCalled) {
                        this.isAutoCalled = true;
                        if (this.slotManager.isAutoSpin) {
                            this.commander.emit("state.enterIdle.callAuto");
                        }
                    }                
                
            return State.CONTINUE;
        }
    });

    window.IdleState = IdleState;
    return IdleState;
});