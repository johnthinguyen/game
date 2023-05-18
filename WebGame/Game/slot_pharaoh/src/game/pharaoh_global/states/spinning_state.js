Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::SpinningState]";

    const SpinningState = State.extend({
        ctor: function (commander, slotManager, isSpinningBonus = false) {
            this.commander = commander;
            this.slotManager = slotManager;
            this.isSpinningBonus = isSpinningBonus;
        },

        onEnter: function () {
            cc.log("[SpinningState]::[onEnter]");
            this.commander.emit("slot.spinStarted", this.isSpinningBonus);
            this.spinStopped = false;
            this.commandSession = this.commander.createSession();
            this.commandSession.on("slot.spinResponsed", () => {
                this.commander.emit("slot.spinStop");
            });

            this.commandSession.on("slot.spinStopped", () => {
                this.spinStopped = true;
            });

            this.commander.emit("state.enterSpinning");
        },

        onExit: function () {
            cc.log("[SpinningState]::[onExit]");
            this.commander.emit("state.exitSpinning");
            this.commander.removeSession(this.commandSession);
        },

        update: function () {
            if (this.spinStopped)
            {
                return State.EXIT;
            }

            return State.CONTINUE;
        }
    });

    window.SpinningState = SpinningState;
    return SpinningState;
});