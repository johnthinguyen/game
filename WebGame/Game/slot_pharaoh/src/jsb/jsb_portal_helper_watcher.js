"use strict";

var portalHelper = PortalHelper.getInstance();

/**
 * Clear scripts of running game
 */
portalHelper.cleanActiveGame = function () {
    if (portalHelper.gameLoadedScripts && cc.isArray(portalHelper.gameLoadedScripts)) {
        portalHelper.gameLoadedScripts.forEach(function (jsFile) {
            if (portalHelper.cleanScript !== undefined) portalHelper.cleanScript(jsFile);else portalManager.cleanScript(jsFile);
        });
    }
};

/**
 * Reload scripts of last running game
 */
portalHelper.reloadActiveGame = function () {
    if (portalHelper.gameName !== undefined) {
        portalHelper.cleanActiveGame();
        var entryPath = cc.formatStr("%s/entry.js", portalHelper.getGamePath());
        var succeed = portalHelper.loadScript !== undefined ? portalHelper.loadScript(entryPath) : portalManager.runScript(entryPath);
        if (!succeed) {
            cc.log(this.LOGTAG, "Failed to reload game: %s", portalHelper.gameName);
        }
    }
};

// Windows only
// Hot reload is only available on windows
if (cc.sys.os === cc.sys.OS_WINDOWS) {

    portalHelper.startBaseWatchers = function () {

        if (!portalHelper.sourcesListener) {

            portalHelper.sourcesListener = cc.EventListener.create({
                event: cc.EventListener.CUSTOM,
                eventName: portalHelper.EVENT_PORTAL_CHANGED_SOURCES,
                callback: function callback() {
                    portalHelper.showToastReload();
                }
            });

            cc.eventManager.addListener(portalHelper.sourcesListener, 1);
        }

        if (!portalHelper.resourcesListener) {

            portalHelper.resourcesListener = cc.EventListener.create({
                event: cc.EventListener.CUSTOM,
                eventName: portalHelper.EVENT_PORTAL_CHANGED_RESOURCES,
                callback: function callback() {
                    portalHelper.showToastReload();
                }
            });

            cc.eventManager.addListener(portalHelper.resourcesListener, 1);
        }
    };

    portalHelper.startGameWatcher = function (key, path) {

        portalHelper.clearGameWatchers();
        if (portalHelper.addWatcher !== undefined) portalHelper.addWatcher(key, path);else portalWatcher.addWatcher(key, path);

        portalHelper.contentListeners = portalHelper.contentListeners || {};
        portalHelper.contentListeners[key] = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: cc.formatStr("%s_%s", portalHelper.EVENT_PORTAL_CHANGED_CONTENT, key),
            callback: function callback() {
                portalHelper.showToastReload();
            }
        });

        cc.eventManager.addListener(portalHelper.contentListeners[key], 1);
    };

    portalHelper.clearGameWatchers = function () {
        portalHelper.contentListeners = portalHelper.contentListeners || {};
        for (var key in portalHelper.contentListeners) {
            cc.eventManager.removeCustomListeners(key);
            delete portalHelper.contentListeners[key];
        }
    };

    portalHelper.showToastReload = function () {
        var runningScene = cc.director.getRunningScene();
        if (runningScene) {

            var toast = runningScene.getChildByName("toast");
            if (toast) {
                toast.stopAllActions();
                toast.removeFromParent();
            }

            var root = ccs.load("reloader.json");
            toast = root.node;

            NodeUtils.fixTextLayout(toast);
            runningScene.addChild(toast, 1000);

            toast.setName("toast");
            toast.setPosition(cc.visibleRect.center.x, cc.visibleRect.height);
            toast.runAction(root.action);
            root.action.play("anim_show", false);

            var button = toast.getChildByName("popup").getChildByName("button");
            if (button) {
                button.baseScale = button.getScale();
                button.addTouchEventListener(function (sender, type) {
                    if (GameUtils.makeEffectButton(sender, type, button.baseScale)) {
                        toast.removeFromParent();
                        portalHelper.reloadActiveGame();
                    }
                });
            }

            // binding F5 key for fast reloading
            if (cc.sys.os === cc.sys.OS_WINDOWS && cc.sys.capabilities.keyboard) {

                var keyboardListener = cc.EventListener.create({
                    event: cc.EventListener.KEYBOARD,
                    onKeyReleased: function onKeyReleased(keyCode, event) {
                        event.stopPropagation();
                        if (keyCode === cc.KEY.f5) {
                            toast.removeFromParent();
                            portalHelper.reloadActiveGame();
                        }
                    }
                });

                cc.eventManager.addListener(keyboardListener, toast);
            }
        }
    };
}