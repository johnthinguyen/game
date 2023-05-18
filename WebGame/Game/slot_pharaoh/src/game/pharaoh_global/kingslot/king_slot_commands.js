Module.define(function (require) {
    "use strict";

    /** @enum {number} */
    const KingSlotCommands = {
        PING_MAIN_ID: 1,
        PING_ASSISTANT_ID: 1,

        PONG_MAIN_ID: 1,
        PONG_ASSISTANT_ID: 0,

        MAIN_ID: 1001,

        LOGIN_REQUEST: 1,
        LOGIN_DEV_REQUEST: -1,

        LOGIN_RESPONSE: 2,
        LOGIN_OTHER_SERVER: 30,
        LOGIN_OTHER_SESSION: 23,
        LOGIN_SERVER_KICKED: 29,

        UPDATE_COIN: 24,
        UPDATE_EXP: 26,
        UPDATE_NEXT_EXP: 27,
        UPDATE_LEVEL: 25,

        GET_USER_INFO_REQUEST: 28,
        GET_USER_INFO_RESPONSE: 28,

        USER_CHAT_REQUEST: 51,
        USER_CHAT_RESPONSE: 51,

        WIN_JACKPOT: 52,
        JACKPOT_INFO: 53,

        GAME_ERROR_MESSAGE: 0,
        BROADCAST_MESSAGE: 22,
    };

    window.KingSlotCommands = KingSlotCommands;
    return KingSlotCommands;
});