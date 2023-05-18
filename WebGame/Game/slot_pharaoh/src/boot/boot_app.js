"use strict";

cc.log("[BOOTSTRAP] App started!");

// Backward compatible for old version (with no PortalEventManager)
if (PortalEventManager === undefined) {

    PortalEventManager = function PortalEventManager() {};

    PortalEventManager.getInstance = function () {
        return new PortalEventManager();
    };
}

PortalEventManager.EVENT_NETWORK_CHANGED = "event_network_changed";
PortalEventManager.EVENT_IAP_BUY_SUCCESS = "event_iap_buy_success";

PortalEventManager.EVENT_PACKAGE_UPDATE_FAILED = "portal_package_update_failed";
PortalEventManager.EVENT_PACKAGE_UPDATE_STARTED = "portal_package_update_started";
PortalEventManager.EVENT_PACKAGE_UPDATE_PROGRESS = "portal_package_update_progress";
PortalEventManager.EVENT_PACKAGE_UPDATE_SUCCEEDED = "portal_package_update_succeeded";

PortalEventManager.EVENT_START_GAME = "portal_start_game";
PortalEventManager.EVENT_START_GAME_CASUAL_JS = "portal_start_casual_js";
PortalEventManager.EVENT_START_TEMPLATE = "portal_start_template";
PortalEventManager.EVENT_START_BOOTSTRAP = "portal_start_bootstrap";

PortalEventManager.PORTAL_EVENT_INIT_LOBBY = "portal_init_lobby";
PortalEventManager.PORTAL_EVENT_SWITCH_LOBBY = "portal_switch_lobby";

PortalEventManager.EVENT_PARAM_PACKAGE = "package";
PortalEventManager.EVENT_PARAM_PROGRESS = "progress";

PortalEventManager.EVENT_PARAM_FILE = "file";
PortalEventManager.EVENT_PARAM_SCRIPT = "script";
PortalEventManager.EVENT_PARAM_SCRIPTS = "scripts";

PortalEventManager.EVENT_PARAM_ERROR_CODE = "errorCode";
PortalEventManager.EVENT_PARAM_ERROR_MSGS = "errorMessage";
PortalEventManager.EVENT_PARAM_PARSE_CODE = "parseCode";
PortalEventManager.EVENT_PARAM_PARSE_MSGS = "parseMessage";
PortalEventManager.EVENT_PARAM_GAME_ID = "gameId";
PortalEventManager.EVENT_PARAM_GAME_NAME = "gameName";
PortalEventManager.EVENT_PARAM_GAME_TITLE = "gameTitle";
PortalEventManager.EVENT_PARAM_GAME_STATUS = "gameStatus";
PortalEventManager.EVENT_PARAM_GAME_PROGRESS = "gameProgress";
PortalEventManager.EVENT_PARAM_GAME_1ST_DOWN = "gameFirstDownload";

PortalEventManager.EVENT_PARAM_TYPE_NUMBER = 0;
PortalEventManager.EVENT_PARAM_TYPE_BOOLEAN = 1;
PortalEventManager.EVENT_PARAM_TYPE_STRING = 2;

PortalEventManager.EVENT_EXT = "portal_ext";
PortalEventManager.EVENT_ERROR = "portal_error";

PortalEventManager.getEventName = function (name) {
    return "jsb_" + name;
};

PortalEventManager.getEventData = function (payload) {

    var result = {};

    payload.split('|').filter(function (item) {
        return item !== '';
    }).forEach(function (param) {
        var vars = param.split(':').filter(function (item) {
            return item !== '';
        });
        if (vars.length >= 3) {
            var type = parseInt(vars[1]);
            var value = vars[2];
            switch (type) {
                case PortalEventManager.EVENT_PARAM_TYPE_NUMBER:
                    value = vars[2] !== '' ? Number(vars[2]) : undefined;
                    break;
                case PortalEventManager.EVENT_PARAM_TYPE_BOOLEAN:
                    value = vars[2] !== '' ? Number(vars[2]) > 0 : undefined;
                    break;
            }
            result[vars[0]] = value;
        }
    });

    return result;
};

PortalEventManager.getInstance().onEvent = function (event) {
    var eventData = PortalEventManager.getEventData(event.eventData);
    cc.eventManager.dispatchCustomEvent(PortalEventManager.getEventName(event.eventName), eventData);
};

// check last active game when enter lobby

cc.eventManager.addCustomListener(PortalEventManager.getEventName(PortalEventManager.PORTAL_EVENT_INIT_LOBBY), function (event) {
    cc.log("[BOOTSTRAP] %s", PortalEventManager.PORTAL_EVENT_INIT_LOBBY);
    var lastActiveGameId = cc.sys.localStorage.getItem("portal_last_active_game");
    if (lastActiveGameId && lastActiveGameId !== '') {
        cc.log("[BOOTSTRAP] RESUME LAST INTERRUPTED GAME: %s", lastActiveGameId);
        PortalManager.getInstance().startGame(parseInt(lastActiveGameId));
    }
});