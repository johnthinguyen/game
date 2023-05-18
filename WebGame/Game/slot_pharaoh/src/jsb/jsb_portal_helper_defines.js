"use strict";

var portalHelper = PortalHelper.getInstance();

portalHelper.LOGTAG = "[PortalHelper]";

portalHelper.DATA_KEY_PORTAL_SERVER = "portal_server_dev";
portalHelper.DATA_KEY_PORTAL_USER_ID = "portal_user_id";
portalHelper.DATA_KEY_PORTAL_USER_NAME = "portal_user_name";
portalHelper.DATA_KEY_PORTAL_USER_PASS = "portal_user_pass";
portalHelper.DATA_KEY_PORTAL_USER_TOKEN = "portal_user_token";

portalHelper.EVENT_NETWORK_CHANGED = "event_network_changed";
portalHelper.EVENT_IAP_BUY_SUCCESS = "event_iap_buy_success";

portalHelper.EVENT_PORTAL_CHANGED_CONTENT = "event_portal_changed_content";
portalHelper.EVENT_PORTAL_CHANGED_SOURCES = "event_portal_changed_sources";
portalHelper.EVENT_PORTAL_CHANGED_RESOURCES = "event_portal_changed_resources";

portalHelper.EVENT_PORTAL_ENTER_LOCATION = "event_portal_enter_location";
portalHelper.EVENT_PORTAL_LEAVE_LOCATION = "event_portal_leave_location";

portalHelper.EVENT_GAME_START = "event_game_start";
portalHelper.EVENT_GAME_LOGIN = "event_game_login";
portalHelper.EVENT_GAME_EXIT = "event_game_exit";

portalHelper.EVENT_GAME_LOAD_BEGAN = "event_game_load_began";
portalHelper.EVENT_GAME_LOAD_ENDED = "event_game_load_ended";

portalHelper.EVENT_GAME_ENTER_LOBBY = "event_game_enter_lobby";
portalHelper.EVENT_GAME_LEAVE_LOBBY = "event_game_leave_lobby";

portalHelper.EVENT_GAME_ENTER_ROOM = "event_game_enter_room";
portalHelper.EVENT_GAME_LEAVE_ROOM = "event_game_leave_room";

portalHelper.EVENT_GAME_DATA_CHANGED = "event_game_data_changed";
portalHelper.EVENT_GAME_MATCH_CHANGED = "event_game_match_changed";

portalHelper.EVENT_START_PLAY = "EVT_START_PLAY_%d"; // Event for tracking start play with game XXX
portalHelper.EVENT_FINISH_PLAY = "EVT_FINISH_PLAY_%d"; // Event for tracking finish play with game XXX
portalHelper.EVENT_LOADING_DURATION = "EVT_LOADING_DURATION_%d"; // Event for tracking loading time with game XXX

portalHelper.MAIN_EVENTS = [portalHelper.EVENT_NETWORK_CHANGED, portalHelper.EVENT_IAP_BUY_SUCCESS, portalHelper.EVENT_PORTAL_CHANGED_CONTENT, portalHelper.EVENT_PORTAL_CHANGED_SOURCES, portalHelper.EVENT_PORTAL_CHANGED_RESOURCES, portalHelper.EVENT_PORTAL_ENTER_LOCATION, portalHelper.EVENT_PORTAL_LEAVE_LOCATION];

portalHelper.GAME_EVENTS = [portalHelper.EVENT_GAME_START, portalHelper.EVENT_GAME_LOGIN, portalHelper.EVENT_GAME_EXIT, portalHelper.EVENT_GAME_LOAD_BEGAN, portalHelper.EVENT_GAME_LOAD_ENDED, portalHelper.EVENT_GAME_ENTER_LOBBY, portalHelper.EVENT_GAME_LEAVE_LOBBY, portalHelper.EVENT_GAME_ENTER_ROOM, portalHelper.EVENT_GAME_LEAVE_ROOM, portalHelper.EVENT_GAME_DATA_CHANGED, portalHelper.EVENT_GAME_MACTCH_CHANGED];

portalHelper.GAME_LOBBY_LOCATION = {
    LIST_DESK: 0,
    LIST_CARD: 1,
    LIST_PORTAL: 2,
    LIST_PORTAL_IAP: 3,
    LIST_CARD_IAP: 4
};

portalHelper.ENABLE_AUDIO_FISHING = "portal_enable_audio";