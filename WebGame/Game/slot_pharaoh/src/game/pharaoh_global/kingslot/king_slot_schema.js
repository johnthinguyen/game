Module.define(function (require) {
    "use strict";
    
    /** @enum {Schema} */
    const KingSlotSchema = {
        Header: Schema({
            mainId: Schema.Int32,
            assistantId: Schema.Int32
        }),

        LoginDevRequest: Schema({
            username: Schema.String(Schema.UInt8),
            password: Schema.String,
            gameLang: Schema.String(Schema.UInt8)
        }),

        LoginRequest: Schema({
            token: Schema.String,
            gameLang: Schema.String(Schema.UInt8)
        }),

        LoginUserInfo: Schema({
            sessionId: Schema.UInt64,
            userId: Schema.UInt32,
            userName: Schema.String(Schema.UInt16),
            coin: Schema.UInt64,
            level: Schema.UInt32,
            exp: Schema.UInt32,
            vip: Schema.UInt32,
            avatar: Schema.String(Schema.UInt16),
        }),

        LoginResponse: Schema.Switch({
            result: Schema.UInt8,
            userInfo: function (value) {
                // SUCCESS: 1
                // RECONNECT: 5
                if (value.result === 1  || value.result === 5) {
                    return KingSlotSchema.LoginUserInfo;
                }
            }
        }),

        LoginOtherServer: Schema({
            ipAddressRaw: Schema.String,
            ipAddressWeb: Schema.String,
            ipAddressWebSecure: Schema.String,
        }),

        LoginOtherSession: Schema({
        }),

        LoginServerKicked: Schema({
        }),

        UpdateCoin: Schema({
            userId: Schema.UInt32,
            coin: Schema.UInt64
        }),

        UpdateExp: Schema({
            userId: Schema.UInt32,
            exp: Schema.UInt64
        }),

        UpdateNextExp: Schema({
            userId: Schema.Int32,
            nextExp: Schema.UInt32,
        }),

        UpdateLevel: Schema({
            level: Schema.UInt32,
        }),

        GetUserInfoRequest: Schema({
            userId: Schema.UInt32,
        }),

        GetUserInfoResponse: Schema({
            userId: Schema.Int32,
            name: Schema.String,
            vip: Schema.UInt32,
            avatar: Schema.String,
            coin: Schema.UInt64,
            level: Schema.UInt32,
            exp: Schema.UInt64,
            nextExp: Schema.UInt32,
        }),

        UserChatRequest: Schema({
            message: Schema.String
        }),

        UserChatResponse: Schema({
            userId: Schema.UInt32,
            name: Schema.String,
            message: Schema.String,
            time: Schema.Int64
        }),

        JackpotInfo: Schema({
            rewards: Schema.Array(Schema.Int8, Schema.Int32),
            configs: Schema.Array(Schema.Int8, Schema.Int32)
        }),

        WinJackpot: Schema({
            winCoin: Schema.UInt64
        }),

        GameErrorMessage: Schema({
            errorCode: Schema.Int8,
            message: Schema.String,
        }),

        BroadcastMessage: Schema({
            message: Schema.String,
            repeatTime: Schema.Int32,
        })
    };

    window.KingSlotSchema = KingSlotSchema;
    return KingSlotSchema;
});