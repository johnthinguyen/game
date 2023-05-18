"use strict";

portalHelper.DATA_KEY_LAST_ACTIVE_GAME = "portal_last_active_game";
portalHelper.DATA_KEY_GAME_VARS = "portal_game_vars_%d.%s";

portalHelper.saveGameSession = function (gameId) {
    cc.sys.localStorage.setItem(portalHelper.DATA_KEY_LAST_ACTIVE_GAME, gameId);
};

portalHelper.clearGameSession = function (gameId) {
    cc.sys.localStorage.removeItem(portalHelper.DATA_KEY_LAST_ACTIVE_GAME);
};

portalHelper.getLastActiveGame = function () {
    return cc.sys.localStorage.getItem(portalHelper.DATA_KEY_LAST_ACTIVE_GAME);
};

portalHelper.setGameVars = function (gameId, key, value) {
    portalHelper.gameVars = portalHelper.gameVars || {};
    portalHelper.gameVars[gameId] = portalHelper.gameVars[gameId] || {};
    portalHelper.gameVars[gameId][key] = value;
};

portalHelper.getGameVars = function (gameId, key) {
    portalHelper.gameVars = portalHelper.gameVars || {};
    portalHelper.gameVars[gameId] = portalHelper.gameVars[gameId] || {};
    return portalHelper.gameVars[gameId][key];
};

portalHelper.delGameVars = function (gameId, key) {
    portalHelper.gameVars = portalHelper.gameVars || {};
    portalHelper.gameVars[gameId] = portalHelper.gameVars[gameId] || {};
    if (portalHelper.gameVars[gameId][key]) delete portalHelper.gameVars[gameId][key];
};

portalHelper.pullGameVars = function (gameId, key) {

    portalHelper.gameVars = portalHelper.gameVars || {};
    portalHelper.gameVars[gameId] = portalHelper.gameVars[gameId] || {};

    var value = portalHelper.gameVars[gameId][key];
    if (portalHelper.gameVars[gameId][key]) delete portalHelper.gameVars[gameId][key];

    return value;
};

portalHelper.clearGameVars = function (gameId) {
    portalHelper.gameVars = portalHelper.gameVars || {};
    if (portalHelper.gameVars[gameId]) delete portalHelper.gameVars[gameId];
};

portalHelper.setGameLocalVars = function (gameId, key, value) {
    cc.sys.localStorage.setItem(cc.formatStr(portalHelper.DATA_KEY_GAME_VARS, gameId, key), value);
};

portalHelper.delGameLocalVars = function (gameId, key) {
    cc.sys.localStorage.removeItem(cc.formatStr(portalHelper.DATA_KEY_GAME_VARS, gameId, key));
};

portalHelper.getGameLocalVars = function (gameId, key) {
    return cc.sys.localStorage.getItem(cc.formatStr(portalHelper.DATA_KEY_GAME_VARS, gameId, key));
};