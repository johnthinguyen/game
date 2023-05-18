Module.define(function (require) {
    "use strict";

    const HighlightExtraSpinState = State.extend({
        ctor: function (commander, slotManager, delayTime = 0.5) {
            this.commander = commander;
            this.slotManager = slotManager;

            this.done = false;
            this.highlightScatterDone = false;
            this.scatterReelIndex = [];
            this.delayTime = delayTime;
            this.waiting = delayTime;
        },

        onEnter: function () {
            cc.log("[HighlightExtraSpinState]::[onEnter]");
            this.scatterReelIndex = this.slotManager.scatterReelIndex;
            this.commandSession = this.commander.createSession();
            this.commandSession.on("slot.showExtraSpin.done", () => {
                this.done = true;
            })

            // this.commandSession.on("slot.highlightExtraSpinItem.done", () => {
            //     this.highlightExtraSpinItemDone = true;
            //     this.commander.emit("slot.showExtraSpin");
            // })

            this.commandSession.on("slot.highlightScatter.done", () => {
                this.commander.emit("slot.showExtraSpin");
                this.highlightScatterDone = true;
            })

            if (this.scatterReelIndex.length > 0) {
                this.commander.emit("slot.highlightScatter", this.scatterReelIndex);
            }

            // this.commander.emit("slot.highlightExtraSpinItem");
        },

        onExit: function () {
            cc.log("[HighlightExtraSpinState]::[onExit]");
            this.commander.removeSession(this.commandSession);
        },

        update: function (dt) {
            if (this.highlightScatterDone) {
                if (this.done) {
                    if (this.waiting >= 0) {
                        this.waiting -= dt;
                    } else {
                        return State.EXIT;
                    }
                }
            }

            return State.CONTINUE;
        },
    });

    window.HighlightExtraSpinState = HighlightExtraSpinState;
    return HighlightExtraSpinState;
});