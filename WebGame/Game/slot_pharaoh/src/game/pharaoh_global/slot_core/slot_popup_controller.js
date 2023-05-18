Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotPopupController]";

    const LAYER_POPUP = 9999;

    const NAME_POPUP_CONFIRM = "prompt.confirm";
    const NAME_POPUP_MESSAGE = "prompt.message";

    const SlotPopupController = cc.Class.extend({

        ctor: function () {
            this.popups = [];
            this.waiting = null;
        },

        getPopups: function () {
            return this.popups || [];
        },

        getWaiting: function () {
            return this.waiting || null;
        },

        showMessage: function (message = "", acceptCallback = null, options = null) {

            let parent = cc.director.getRunningScene();
            if (options && options.parent) {
                parent = options.parent;
            }

            let popup = parent.getChildByName(NAME_POPUP_MESSAGE);
            if (!popup || popup.isBusy) {

                popup = new SlotPopupPrompt();
                popup.setName(NAME_POPUP_MESSAGE);

                popup.setClosedCallback((sender) => {
                    for (let i = 0; i < this.popups.length; i++) {
                        if (this.popups[i] === sender) {

                            this.popups.splice(i, 1);

                            if (i === 0)
                                break;

                            if (cc.sys.isObjectValid(this.popups[i]))
                                this.popups[i].removeFromParent();

                            break;
                        }
                    }
                });

                parent.addChild(popup, LAYER_POPUP);
            }

            this.popups.push(popup);

            popup.showMessage(message, acceptCallback, options);
        },

        showConfirm: function (message = "", acceptCallback = null, rejectCallback = null, options = null) {

            let parent = cc.director.getRunningScene();
            if (options && options.parent) {
                parent = options.parent;
            }

            let popup = parent.getChildByName(NAME_POPUP_CONFIRM);
            if (!popup || popup.isBusy) {

                popup = new SlotPopupPrompt();
                popup.setName(NAME_POPUP_CONFIRM);

                popup.setClosedCallback((sender) => {
                    for (let i = 0; i < this.popups.length; i++) {
                        if (this.popups[i] === sender) {

                            this.popups.splice(i, 1);

                            if (i === 0)
                                break;

                            if (cc.sys.isObjectValid(this.popups[i]))
                                this.popups[i].removeFromParent();

                            break;
                        }
                    }
                });

                parent.addChild(popup, LAYER_POPUP);
            }

            this.popups.push(popup);

            popup.showConfirm(message, acceptCallback, rejectCallback, options);
        },

        showWaiting: function (message = "", timeoutCallback = undefined, timeOut = -1) {

            if (cc.sys.isObjectValid(this.waiting)) {
                this.waiting.removeFromParent();
                this.waiting = null;
            }

            let waiting = new SlotPopupWaiting();
            waiting.show(message, timeOut, timeoutCallback);

            let parent = cc.director.getRunningScene();
            parent.addChild(waiting, LAYER_POPUP);

            this.waiting = waiting;
        },

        hidePopups: function () {

            if (!cc.isArray(this.popups))
                return;

            this.popups.forEach(popup => {
                if (cc.sys.isObjectValid(popup)) {
                    popup.hide();
                }
            });
        },

        hideWaiting: function () {

            if (cc.sys.isObjectValid(this.waiting))
                this.waiting.removeFromParent();

            this.waiting = null;
        }
    });

    window.SlotPopupController = SlotPopupController;
    return SlotPopupController;
});