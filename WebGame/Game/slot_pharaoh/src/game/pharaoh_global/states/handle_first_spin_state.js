Module.define(function (require) {
    "use strict";

    const HandleFirstSpinState = State.extend({
        ctor: function (commander, slotManager) {
            this.commander = commander;
            this.slotManager = slotManager;
        },

        onEnter: function () {
            cc.log("[HandleFirstSpinStater]::[onEnter]");
        },

        update: function () {
            if (this.slotManager.hasFreeGame()) {
                return new State.Sequence([
                    new State.WaitForSeconds(1.5),
                    new StartFreeGameState(this.commander, this.slotManager, this.slotManager.numFreeSpin, this.slotManager.multiplier),
                    new IdleFreeGameState(this.commander, this.slotManager),
                    new IdleState(this.commander, this.slotManager, true)
                ]);
               
            }
            return new IdleState(this.commander, this.slotManager);
        },

        onExit: function () {
            cc.log("[HandleFirstSpinStater]::[onExit]");
        }
    });

    window.HandleFirstSpinState = HandleFirstSpinState;
    return HandleFirstSpinState;
});