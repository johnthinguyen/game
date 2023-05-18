Module.define(function (require) {
    "use strict";

    const ExitFreeGameState = State.extend({
        ctor: function (commander, delayTime = 0.8) {
            this.commander = commander;
            this.done = false;
            this.startedExit = false;
            this.delayTime = delayTime;
            this.waiting = delayTime;
        },

        onEnter: function () {
            cc.log("[ExitFreeGameState]::[onEnter]");
            this.commandSession = this.commander.createSession();

            this.commandSession.on("state.exitFreeGame.done", () => {
                this.done = true;
            })

            AudioHandler.stopBackground(this.delayTime * 0.5);
        },

        onExit: function () {
            cc.log("[ExitFreeGameState]::[onExit]");
            this.commander.removeSession(this.commandSession);
        },

        update: function (dt) {
            if (!this.startedExit) {
                if (this.waiting >= 0) {
                    this.waiting -= dt;
                } else {
                    this.startedExit = true;
                    this.waiting = this.delayTime;
                    this.commander.emit("state.exitFreeGame");
                }
            }

            if (this.done) {
                if (this.waiting >= 0) {
                    this.waiting -= dt;
                } else {
                    AudioHandler.playBackground();
                    return State.EXIT;
                }
            }

            return State.CONTINUE;
        },
    });

    window.ExitFreeGameState = ExitFreeGameState;
    return ExitFreeGameState;
});