Module.define(function (require) {
    "use strict";

    const HandleResultState = State.extend({
        ctor: function (commander, slotManager) {
            this.commander = commander;
            this.slotManager = slotManager;
        },

        onEnter: function () {
            cc.log("[HandleResultState]::[onEnter]");
        },

        onExit: function () {
            cc.log("[HandleResultState]::[onExit]");
        },

        update: function () {
            let states = [];

            if (this.slotManager.hasWinSlots()) {
                states.push(new HighlightWinItemsState(this.commander, this.slotManager.listWinResults, this.slotManager.listWinItemsTop));
            }

            if (this.slotManager.hasSuperWin()) {
                states.push(new ShowBigWinState(this.commander, SlotRule.BIG_WIN_TYPE.SUPER_WIN, this.slotManager.winCoinAll));
            } else if (this.slotManager.hasMegaWin()) {
                states.push(new ShowBigWinState(this.commander, SlotRule.BIG_WIN_TYPE.MEGA_WIN, this.slotManager.winCoinAll));
            } else if (this.slotManager.hasBigWin()) {
                states.push(new ShowBigWinState(this.commander, SlotRule.BIG_WIN_TYPE.BIG_WIN, this.slotManager.winCoinAll));
            }

            if (this.slotManager.hasFreeGame()) {
                states.push(new StartFreeGameState(this.commander, this.slotManager, this.slotManager.numFreeSpin, this.slotManager.multiplier));
                states.push(new IdleFreeGameState(this.commander, this.slotManager));
            }

            // Wait before...
            if (states.length <= 0) {
                states.push(new State.WaitForSeconds(0.25));
            }
            
            // come to idle
            return new State.Sequence(states);
        },
    });

    window.HandleResultState = HandleResultState;
    return HandleResultState;
});