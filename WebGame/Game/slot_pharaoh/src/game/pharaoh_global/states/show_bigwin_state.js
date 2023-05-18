Module.define(function (require) {
    "use strict";

    const ShowBigWinState = State.extend({
        ctor: function (commander, type, winCoin) {
            this.commander = commander;
            this.type = type;
            this.winCoin = winCoin;
        },

        onEnter: function () {
            cc.log("[ShowBigWinState]::[onEnter]");
            this.commandSession = this.commander.createSession();
            this.commandSession.on("slot.bigwin.hide", () => {
                this.done = true;
            });
            
            this.commander.emit("slot.bigwin.show", this.type, this.winCoin);
        },

        onExit: function () {
            cc.log("[ShowBigWinState]::[onExit]");
            this.commander.removeSession(this.commandSession);
        },

        update: function () {
            return this.done ? State.EXIT : State.CONTINUE;
        }
    });

    window.ShowBigWinState = ShowBigWinState;
    return ShowBigWinState;
});