"use strict";

var KingSocketType = {
    NONE: -1,
    TCP: 0,
    UDP: 1,
    WS: 2
};

var KingPlatform = {
    WEB: 1,
    WEB_APP: 4,
    ANDROID: 2,
    IOS: 3
};

var KingProtocol = {

    LOGTAG: "[KingProtocol]",

    DEFAULT_IMAGE_BASE_URL: "//mimg.live777.com/images",

    DEFAULT_GAME_ZONE: "MGame",
    DEFAULT_GAME_LANG: "en",

    DEFAULT_FLAG_MOBILE: true,

    HEADER_CONTENT_SIZE_BYTE: 4,
    HEADER_CID_BYTE: 1,
    HEADER_RID_BYTE: 1,

    SYSTEM: {
        CID: 0,
        REQUEST: {
            LOGIN: 1,
            LOGOUT: 2,
            JOIN_LOBBY: 50,
            GET_LOBBY_ROOM_LIST: 15,
            JOIN_ROOM: 4,
            CREATE_ROOM: 6,
            LEAVE_ROOM: 14,
            PLAYER_TO_SPECTATOR: 18,
            SPECTATOR_TO_PLAYER: 17,
            SEND_PRIVATE_MESSAGE: 21,
            SEND_PUBLIC_MESSAGE: 20
        },
        RESPONSE: {
            LOGIN: 1,
            LOGOUT: 2,
            RECEIVED_LOBBY_ROOM_LIST: 15,
            ROOM_ADDED: 6,
            ROOM_REMOVED: 44,
            JOIN_ROOM_SUCCESS: 4,
            USER_ENTER_ROOM: 41,
            USER_LEAVE_ROOM: 45,
            PLAYER_TO_SPECTATOR: 18,
            SPECTATOR_TO_PLAYER: 17,
            ROOM_OWNER_CHANGE: 47,
            RECEIVED_PRIVATE_MESSAGE: 21,
            RECEIVED_PUBLIC_MESSAGE: 20,
            USER_LOST_EXIT_LOGOUT: 43,
            LOBBY_UPDATE: 48,
            USER_VARIABLES_UPDATE: 12,
            ROOM_VARIABLES_UPDATE: 11,
            UPDATE_ROOM_DATA: 53
        },
        ERROR: {
            NONE: -1,
            HANDSHAKE_API_OBSOLETE: 0,
            LOGIN_BAD_ZONENAME: 1,
            LOGIN_BAD_USERNAME: 2,
            LOGIN_BAD_PASSWORD: 3,
            LOGIN_BANNED_USER: 4,
            LOGIN_ZONE_FULL: 5,
            LOGIN_ALREADY_LOGGED: 6,
            LOGIN_SERVER_FULL: 7,
            LOGIN_INACTIVE_ZONE: 8,
            LOGIN_NAME_CONTAINS_BAD_WORDS: 9,
            LOGIN_GUEST_NOT_ALLOWED: 10,
            LOGIN_BANNED_IP: 11,
            ROOM_DUPLICATE_NAME: 12,
            CREATE_ROOM_BAD_GROUP: 13,
            ROOM_NAME_BAD_SIZE: 14,
            ROOM_NAME_CONTAINS_BADWORDS: 15,
            CREATE_ROOM_ZONE_FULL: 16,
            CREATE_ROOM_EXCEED_USER_LIMIT: 17,
            CREATE_ROOM_WRONG_PARAMETER: 18,
            JOIN_ALREADY_JOINED: 19,
            JOIN_ROOM_FULL: 20,
            JOIN_BAD_PASSWORD: 21,
            JOIN_BAD_ROOM: 22,
            JOIN_ROOM_LOCKED: 23,
            SUBSCRIBE_GROUP_ALREADY_SUBSCRIBED: 24,
            SUBSCRIBE_GROUP_NOT_FOUND: 25,
            UNSUBSCRIBE_GROUP_NOT_SUBSCRIBED: 26,
            UNSUBSCRIBE_GROUP_NOT_FOUND: 27,
            GENERIC_ERROR: 28,
            ROOM_NAME_CHANGE_PERMISSION_ERR: 29,
            ROOM_PASS_CHANGE_PERMISSION_ERR: 30,
            ROOM_CAPACITY_CHANGE_PERMISSION_ERR: 31,
            SWITCH_NO_PLAYER_SLOTS_AVAILABLE: 32,
            SWITCH_NO_SPECTATOR_SLOTS_AVAILABLE: 33,
            SWITCH_NOT_A_GAME_ROOM: 34,
            SWITCH_NOT_JOINED_IN_ROOM: 35,
            BUDDY_LIST_LOAD_FAILURE: 36,
            BUDDY_LIST_FULL: 37,
            BUDDY_BLOCK_FAILURE: 38,
            BUDDY_TOO_MANY_VARIABLES: 39,
            JOIN_GAME_ACCESS_DENIED: 40,
            JOIN_GAME_NOT_FOUND: 41,
            INVITATION_NOT_VALID: 42
        }
    },

    EXTENSION: {
        CID: 1,
        REQUEST: {
            EXTENSION: 13
        },
        RESPONSE: {
            EXTENSION: 13
        },
        ERROR_CODE: {},
        COMMAND: {

            // common

            SEND_ERROR: "err",
            BROADCAST_MESSAGE: "bcms",
            USER_LOGIN_OTHER_SESSION: "los",

            JACKPOT_INFO: "jpin",
            JACKPOT_INFO_GAME: "jpgin",
            JACKPOT_CONFIG: "hbcf",
            JACKPOT_DATA: "hin",
            JACKPOT_WIN: "nhi",
            JACKPOT_WIN_RATE: "hwr", // req: lấy thông tin win rate jackpot
            JACKPOT_TOP_WIN_INFO: "tth", // req: lấy thông tin bảng xếp hạng win jackpot

            GAME_DATA: "gd",
            RECONNECT_DATA: "recodt",

            USER_LEVEL_TIME_LINE: "ult",
            USER_LEVEL_UP_OLD: "stn", // deprecated
            USER_LEVEL_UP: "lvui",

            SEND_CHAT: "ch",
            RECEIVED_CHAT: "sc",

            SEND_EMOTICON: "ple",
            RECEIVED_EMOTICON: "ple",

            NOTICED_CHAT: "ntc",

            PING: "ping",
            MAINTAIN: "mt",
            SERVER_ADMIN: "sa",
            CHANGE_LANG: "clang",

            // actions

            GAME_ACTION_REQUEST: "g",
            GAME_ACTION_RESPONSE: "pm",

            // card games

            QUICK_PLAY: "qp", // req: chơi ngay, server tự chọn room
            LIST_GROUP_INFO: "lgi", // req/res: lấy danh sách kênh
            GET_ALL_USER_LOBBY: "gauil", // req/res: lấy danh sách user trong lobby

            SIT_ROOM: "sdow", // req: ngồi vào ghế cụ thể trong bàn chơi đã joined
            JOIN_ROOM: "jr", // req: vào bàn chơi
            JOIN_ROOM_WITH_BET: "jrwb", // req: vào bàn chơi với bet coin cụ thể
            JOIN_ROOM_TARGET_SEVER: "jots", // res: thông tin server của bàn cần join (dùng với command 'jrwb', khi bàn cần join không nằm ở server hiện tại)

            CREATE_ROOM: "cr", // req: tạo bàn chơi
            UPDATE_ROOM_DATA: "urd", // res: danh sách user trả về qua biến ARR_NICK[arn] trong Room Variable
            UPDATE_ROOM_CONFIG: "ubt", // res: cập nhật room config, gửi cho cả lobby và trong phòng
            UPDATE_MAX_PLAYER: "ump", // res: cập nhật số người chơi min/max của các phòng

            GET_ROOM_GROUP: "lbb", // req/res: danh sách bàn nhóm theo bet coin ở lobby (join bàn theo bet coin)

            INVITE: "iv", // req/res: gửi lời mời chơi. người được mời sẽ nhận được response.
            CONFIRM_INVITATION: "cfi", // req/res: xác nhận lời mời chơi

            UPDATE_MATCH_ID: "umi", // res: thay đổi match id
            CHANGED_DEALER_USER: "du", // res: đổi user chia bài

            START_GAME_DATA: "sg", // res: thông báo cho user biết thời gian countdown start ván
            START_GAME_NOTIFY: "start", // res: khi bắt đầu ván server sẽ trả về message này để người chia bài handle hiện nút bắt đầu. (DEPRECATED)
            START_GAME_REQUEST: "rsg", // req: bấm nút bắt đầu -> gửi lên message này từ người chia bài để báo tín hiệu bắt đầu chơi.
            START_GAME_CONFIRM: "resg", // req: khi bắt đầu ván server sẽ trả về message này, người chơi tự động confirm để server bắt đầu chạy.
            // res: người chơi nhận được thông báo này khi có yêu cầu start ván
            // -> gửi request confirm (resg). nếu ko gửi thì bị kick thành người xem.

            END_MATCH: "gecr", // req: thông báo cuối ván. sẽ thoát khi hết ván.
            MATCH_RESULT_INFO: "em", // res: thông tin kết thúc ván đánh

            WIN_COMBO: "tltt", // res: kết quả tặng xu sau khi thắng liên tiếp (combo)

            TOUR_RANK_DATA: "ttt", // req/res: thông tin tournament rank
            TOUR_ROUND_INFO: "tut", // res: thông tin vòng đấu tournament
            TOUR_ROUND_END_INFO: "eti", // res: thông tin kết quả khi kết thúc round
            TOUR_SERVER_INFO: "st", // req/res: lấy thông tin server tournament

            TOUR_TIME_SPEND_PING: "ttsp", // res: thông tin thời gian user đã dùng để suy nghĩ trong các lượt
            TOUR_TIME_SPEND_RESULT: "ttsr" // res: thông tin trừ tiền time spend cuối ván
        }
    },

    VARIABLE_TYPE: {
        NULL: 0,
        BOOL: 1,
        INT: 2,
        LONG: 3,
        DOUBLE: 4,
        STRING: 5,
        OBJECT: 6,
        DATE: 8
    },

    buildRawMessage: function buildRawMessage(controllerId, requestId, json) {
        cc.log(KingProtocol.LOGTAG, "buildRawMessage", "controllerId:", controllerId, "requestId:", requestId, "json:", json);

        var jsonBuffer = StringUtils.stringToBuffer(json);

        var contentSize = jsonBuffer.byteLength + KingProtocol.HEADER_CID_BYTE + KingProtocol.HEADER_RID_BYTE;
        var buffer = new ArrayBuffer(contentSize + KingProtocol.HEADER_CONTENT_SIZE_BYTE);
        var view = new DataView(buffer);

        // write header
        view.setInt32(0, contentSize);
        view.setInt8(KingProtocol.HEADER_CONTENT_SIZE_BYTE, controllerId);
        view.setInt8(KingProtocol.HEADER_CONTENT_SIZE_BYTE + KingProtocol.HEADER_RID_BYTE, requestId);

        // write body
        var bufferView = new Uint8Array(buffer);
        var jsonView = new Uint8Array(jsonBuffer);
        bufferView.set(jsonView, KingProtocol.HEADER_CONTENT_SIZE_BYTE + KingProtocol.HEADER_CID_BYTE + KingProtocol.HEADER_RID_BYTE);

        return buffer;
    },

    parseRawMessage: function parseRawMessage(data, size) {
        // cc.log(KingProtocol.LOGTAG, "parseRawMessage", "size:", size, "data:", StringUtils.buffToHex(data));

        var buffer = data instanceof ArrayBuffer ? data : data.buffer;
        var view = new DataView(buffer);

        // parse header
        // 4 bytes -> int32 -> content_size
        // 1 bytes -> int8 -> controller_id
        // 1 bytes -> int8 -> request_id
        // rest bytes: -> string -> json payload
        var contentSize = view.getInt32(0);
        var controllerId = view.getInt8(4);
        var requestId = view.getInt8(5);

        // parse body
        // content_size = json length + 2 (controller_id, request_id)
        var jsonBuffer = buffer.slice(6, 6 + contentSize - 2);
        var json = StringUtils.bufferToString(jsonBuffer);

        return {
            contentSize: contentSize,
            controllerId: controllerId,
            requestId: requestId,
            json: json
        };
    },

    buildWebSocketMessage: function buildWebSocketMessage(controllerId, requestId, json) {
        cc.log(KingProtocol.LOGTAG, "buildWebSocketMessage", "controllerId:", controllerId, "requestId:", requestId, "json:", json);

        var utf8Json = unescape(encodeURIComponent(json));
        var jsonBuffer = new ArrayBuffer(utf8Json.length);
        {
            var _bufferView = new DataView(jsonBuffer);
            for (var i = 0; i < utf8Json.length; i++) {
                _bufferView.setUint8(i, utf8Json.charCodeAt(i));
            }
        }

        var buffer = new ArrayBuffer(jsonBuffer.byteLength + 2);
        var view = new DataView(buffer);

        // write header
        // 1 bytes -> int8 -> controller_id
        // 1 bytes -> int8 -> request_id
        view.setInt8(0, controllerId);
        view.setInt8(1, requestId);

        // write body
        var bufferView = new Uint8Array(buffer);
        var jsonView = new Uint8Array(jsonBuffer);
        bufferView.set(jsonView, 2);

        return buffer;
    },

    parseWebSocketMessage: function parseWebSocketMessage(data) {
        //cc.log(KingProtocol.LOGTAG, "parseWebSocketMessage", "data:", StringUtils.buffToHex(data));

        var buffer = data instanceof ArrayBuffer ? data : data.buffer;
        var view = new DataView(buffer);

        // parse header
        // 1 bytes -> int8 -> controller_id
        // 1 bytes -> int8 -> request_id
        // rest bytes: -> string -> json payload
        var controllerId = view.getInt8(0);
        var requestId = view.getInt8(1);

        // parse body
        // content_size = json length + 2 (controller_id, request_id)
        var utf8Json = String.fromCharCode.apply(null, new Uint8Array(buffer, 2));
        var json = decodeURIComponent(escape(utf8Json));

        //cc.log(KingProtocol.LOGTAG, "parseWebSocketMessage", "json: ", json);

        return {
            controllerId: controllerId,
            requestId: requestId,
            json: json
        };
    },

    parseMessage: function parseMessage(payload) {
        var jsonKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var keys = jsonKeys || KingJsonKeys;
        if (!payload) return payload;
        if (KingProtocol.isVariableList(payload)) {
            return KingProtocol.parseVariableList(payload, jsonKeys);
        } else if (payload instanceof Array) {
            return payload.map(function (item) {
                return KingProtocol.parseMessage(item, jsonKeys);
            });
        } else if (payload instanceof Object) {
            var result = {};
            Object.keys(payload).forEach(function (key) {
                if (keys.hasOwnProperty(key)) result[keys[key]] = KingProtocol.parseMessage(payload[key], jsonKeys);else result[key] = KingProtocol.parseMessage(payload[key], jsonKeys);
            });
            return result;
        }
        return payload;
    },

    isVariable: function isVariable(payload) {
        return payload && cc.isArray(payload) && payload.length === 3 && cc.isString(payload[0]) && cc.isNumber(payload[1]);
    },

    isVariableList: function isVariableList(payload) {
        return payload && cc.isArray(payload) && payload.length > 0 && this.isVariable(payload[0]);
    },

    parseVariable: function parseVariable(payload) {
        var jsonKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var keys = jsonKeys || KingJsonKeys;
        return {
            key: keys.hasOwnProperty(payload[0]) ? keys[payload[0]] : payload[0],
            value: function (type, value) {
                if (value !== null && value !== undefined) {
                    switch (type) {
                        case KingProtocol.VARIABLE_TYPE.NULL:
                            return null;
                        case KingProtocol.VARIABLE_TYPE.BOOL:
                            return typeof value === "string" ? value === "true" : value;
                        case KingProtocol.VARIABLE_TYPE.INT:
                        case KingProtocol.VARIABLE_TYPE.LONG:
                            return parseInt(value);
                        case KingProtocol.VARIABLE_TYPE.DOUBLE:
                            return parseFloat(value);
                        case KingProtocol.VARIABLE_TYPE.STRING:
                            return value;
                        case KingProtocol.VARIABLE_TYPE.OBJECT:
                            {
                                if (typeof value === "string") {
                                    try {
                                        return JSON.parse(value);
                                    } catch (err) {}
                                }
                                return null;
                            }
                        case KingProtocol.VARIABLE_TYPE.DATE:
                            return new Date(value);
                    }
                }
                return null;
            }(payload[1], payload[2])
        };
    },

    parseVariableList: function parseVariableList(payload) {
        var jsonKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var keepFailed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var result = {};
        payload.forEach(function (item) {
            var parsed = KingProtocol.isVariable(item) ? KingProtocol.parseVariable(item, jsonKeys) : keepFailed ? item : null;
            result[parsed.key] = parsed.value;
        });
        return result;
    },

    getSystemRequestName: function getSystemRequestName(requestId) {
        return Object.keys(KingProtocol.SYSTEM.REQUEST).find(function (key) {
            return KingProtocol.SYSTEM.REQUEST[key] === requestId;
        });
    },

    getSystemResponseName: function getSystemResponseName(requestId) {
        return Object.keys(KingProtocol.SYSTEM.RESPONSE).find(function (key) {
            return KingProtocol.SYSTEM.RESPONSE[key] === requestId;
        });
    },

    getSystemErrorName: function getSystemErrorName(errorCode) {
        return Object.keys(KingProtocol.SYSTEM.ERROR).find(function (key) {
            return KingProtocol.SYSTEM.ERROR[key] === errorCode;
        });
    },

    getExtensionCommandName: function getExtensionCommandName(command) {
        return Object.keys(KingProtocol.EXTENSION.COMMAND).find(function (key) {
            return KingProtocol.EXTENSION.COMMAND[key] === command;
        });
    },

    getDefaultAvatarUrl: function getDefaultAvatarUrl() {
        return KingProtocol.DEFAULT_IMAGE_BASE_URL + "/avatar/defaultavatar.png";
    },

    /*getAvatarUrl: function getAvatarUrl(url) {
        // if (jsb.urlRegExp.test(url)) return url;
        if (url === '') return KingProtocol.getDefaultAvatarUrl();
        return KingProtocol.DEFAULT_IMAGE_BASE_URL + "/avatar/" + url;
    }*/

    getAvatarUrl: function getAvatarUrl(url) {
        // if (jsb.urlRegExp.test(url))
        //     return url;
        if (url === '') return KingProtocol.getDefaultAvatarUrl();
        // return KingProtocol.DEFAULT_IMAGE_BASE_URL + "/avatar/" + url;
        return url;
    }
};