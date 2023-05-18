"use strict";

var portalHelper = PortalHelper.getInstance();

// overrides return main lobby funcs for dispatching exit events
var isInitialized = portalHelper.isInitialized || false;
if (!isInitialized) {

    portalHelper.clearHandlers = function () {

        KingGame.clearAllListeners();
        KingRoom.clearAllListeners();

        KingLogin.clearAllListeners();
        KingLobby.clearAllListeners();

        KingGame.close();
    };

    portalHelper._returnLobbyScene = portalHelper.returnLobbyScene;
    portalHelper.returnLobbyScene = function (location) {

        if (portalHelper.notifyGame) portalHelper.notifyGame(portalHelper.EVENT_GAME_EXIT);

        portalHelper.clearHandlers();
        portalHelper.clearJsonKeys();

        portalHelper._returnLobbyScene(location);
    };

    portalHelper._returnLobbySceneDisconnect = portalHelper.returnLobbySceneDisconnect;
    portalHelper.returnLobbySceneDisconnect = function (location) {

        if (portalHelper.notifyGame) portalHelper.notifyGame(portalHelper.EVENT_GAME_EXIT);

        portalHelper.clearHandlers();
        portalHelper.clearJsonKeys();

        portalHelper._returnLobbySceneDisconnect(location);
    };

    portalHelper.isInitialized = true;
}

// NOTE: This only backward compatible for old versions
// first loading is blocked cause portal helper request log to old dead server (PortalHelper::getInstance()->update())
// so we assign a live server to avoid timeout blocking
cc.sys.localStorage.setItem(portalHelper.DATA_KEY_PORTAL_SERVER, "http://dev.nagafun.vip");