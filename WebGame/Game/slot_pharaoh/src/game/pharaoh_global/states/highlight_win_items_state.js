Module.define(function (require) {
    "use strict";

    const HighlightWinItemsState = State.extend({
        ctor: function (commander, lineWinResults, lineWinTopResults, delayTime = 0.5) {
            this.commander = commander;
            this.lineWinResults = lineWinResults;
            this.lineWinTopResults = lineWinTopResults;

            this.delayTime = delayTime;

            this.done = false;
            this.waiting = delayTime;
        },

        onEnter: function () {
            cc.log("[HighlightWinItemsState]::[onEnter]");
            this.commandSession = this.commander.createSession();
            this.commandSession.on("slot.highlightWinItems.done", (lineWinResults,lineWinTopResults) => {
                if (lineWinResults.length > 0) {
                    this.lineWinResults = lineWinResults;
                } else {
                    this.lineWinResults = [];
                }

                if(lineWinTopResults.length > 0){
                    this.lineWinTopResults = lineWinTopResults;
                }else{
                    this.lineWinTopResults = [];
                }
                
                this.waiting = this.delayTime;
                this.done = true;
            });

            if(this.lineWinResults.length > 0 || this.lineWinTopResults.length > 0) {
                this.commander.emit("slot.highlightWinItems", this.lineWinResults, this.lineWinTopResults,true);
            }
        },

        onExit: function () {
            cc.log("[HighlightWinItemsState]::[onExit]");
            this.commander.removeSession(this.commandSession);    
        },

        update: function (dt) {
            if (this.done) {
                if (this.waiting >= 0) {
                    this.waiting -= dt;
                } else {
                    if (this.lineWinResults.length > 0) {
                        this.done = false;
                        this.commander.emit("slot.highlightWinItems", this.lineWinResults, this.lineWinTopResults,true);
                    } else {
                        return State.EXIT;
                    }
                }
            }
        },
    });

    window.HighlightWinItemsState = HighlightWinItemsState;
    return HighlightWinItemsState;
});