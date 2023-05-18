"use strict";

var KingUserInfo = cc.Class.extend({
    LOGTAG: "[KingUserInfo]",

    ctor: function ctor() {
        this.id = 0;
        this.name = "";
        this.nickName = "";
        this.fullName = "";
        this.pass = "";
        this.token = "";
        this.email = "";
        this.image = "";
        this.gender = 0;
        this.coin = 0;
        this.bonusCoin = 0;
        this.level = 0;
        this.currExp = 0;
        this.nextExp = 0;
        this.position = 0;
        this.kind = 0;
        this.category = 0;
        this.awardedCoinTime = 0;
        this.awardedThresholdTime = 0;
        this.betCondition = 0;
        this.timePlay = 0;
        this.pubId = 0;
        this.playerNo = 0;
        this.vipLevel = 0;
        this.vipPoint = 0;
    },

    match: function match(id) {
        return this.id == id;
    },

    matchSeat: function matchSeat(seatId) {
        return this.position == seatId;
    },

    matchPlayerNo: function matchPlayerNo(playerNo) {
        return this.playerNo == playerNo;
    },

    parse: function parse(payload) {
        if (payload) {
            this.name = payload.userName || this.name || "";
            if (payload.player) {
                this.parsePlayerData(payload.player);
            } else {
                this.parseUserData(payload);
            }
        }
    },

    parsePlayerData: function parsePlayerData(payload) {
        if (payload) {
            this.id = parseInt(payload.userId) || this.id || 0;
            this.email = payload.email || this.email || "";
            this.pass = payload.password || this.pass || "";
            if (payload.userData) {
                this.parseUserData(payload.userData);
            }
        }
    },

    parseUserData: function parseUserData(payload) {
        if (payload) {
            this.id = payload.userId || this.id || 0;
            this.token = payload.token || this.token || "";
            this.image = payload.emotionPath || this.image || "";
            this.nickName = payload.nickName || this.nickName || "";
            this.fullName = payload.fullName || this.fullName || "";
            this.gender = payload.gender || this.gender || 0;
            this.coin = payload.coin || this.coin || 0;
            this.level = payload.level || this.level || 0;
            this.currExp = payload.expScore || this.currExp || 0;
            this.nextExp = payload.nextExp || this.nextExp || 0;
            this.kind = payload.userKind || this.kind || 0;
            this.category = payload.categoryUser || this.category || 0;
            this.awardedCoinTime = payload.awardedCoinTime || this.awardedCoinTime || 0;
            this.awardedThresholdTime = payload.awardedThresholdTime || this.awardedThresholdTime || 0;
            this.betCondition = payload.betCondition || this.betCondition || 0;
            this.timePlay = payload.timePlay || this.timePlay || 0;
            this.pubId = payload.pubId || this.pubId || 0;
            this.vipLevel = payload.vipLevel || this.vipLevel || 0;
            this.vipPoint = payload.vipPoint || this.vipPoint || 0;
            this.bonusCoin = payload.betCoin || this.bonusCoin || 0;
        }
    },

    parseLobbyUser: function parseLobbyUser(payload) {
        if (payload && cc.isArray(payload)) {
            this.id = payload[0] || this.id || 0;
            this.nickName = payload[1] || this.nickName || "";
            this.image = payload[2] || this.image || "";
            this.coin = payload[3] || this.coin || 0;
            this.level = payload[4] || this.level || 0;
            this.gender = payload[5] || this.gender || 0;
            this.kind = payload[6] || this.userKind || 0;
        }
    },

    parseRoomUser: function parseRoomUser(payload) {
        if (payload) {
            if (cc.isArray(payload)) {
                this.id = payload[0] || this.id || 0;
                this.name = payload[1] || this.name || "";
                this.position = payload[3] || this.position || 0;
                if (payload.length > 4) {
                    this.parseUserData(payload[4]);
                }
            } else {
                this.id = payload.userId || this.id || 0;
                this.coin = payload.coin || this.coin || 0;
                this.level = payload.level || this.level || 0;
                this.nextExp = payload.nextExp || this.nextExp || 0;
                this.expScore = payload.expScore || this.currExp || 0;
                this.gender = payload.gender || this.gender || 0;
                this.position = payload.position || this.position || 0;
                this.category = payload.categoryUser || this.category || 0;
                this.vipLevel = payload.vipLevel || this.vipLevel || 0;
                this.vipPoint = payload.vipPoint || this.vipPoint || 0;
                this.nickName = payload.nickName || this.nickName || '';
                this.image = payload.avatar || this.image || '';
                this.bonusCoin = payload.betCoin || this.bonusCoin || 0;
            }
        }
    },

    copy: function copy(source) {
        this.id = source.id || this.id;
        this.name = source.name || this.name;
        this.nickName = source.nickName || this.nickName;
        this.fullName = source.fullName || this.fullName;
        this.pass = source.pass || this.pass;
        this.token = source.token || this.token;
        this.email = source.email || this.email;
        this.image = source.image || this.image;
        this.gender = source.gender || this.gender;
        this.coin = source.coin || this.coin;
        this.level = source.level || this.level;
        this.currExp = source.currExp || this.currExp;
        this.nextExp = source.nextExp || this.nextExp;
        this.position = source.position || this.position;
        this.kind = source.kind || this.kind;
        this.category = source.category || this.category;
        this.awardedCoinTime = source.awardedCoinTime || this.awardedCoinTime;
        this.awardedThresholdTime = source.awardedThresholdTime || this.awardedThresholdTime;
        this.betCondition = source.betCondition || this.betCondition;
        this.timePlay = source.timePlay || this.timePlay;
        this.pubId = source.pubId || this.pubId;
        this.vipLevel = source.vipLevel || this.vipLevel;
        this.vipPoint = source.vipPoint || this.vipPoint;
        this.bonusCoin = source.bonusCoin || this.bonusCoin;
    }
});

KingUserInfo.parse = function (payload) {
    var user = new KingUserInfo();
    user.parse(payload);
    return user;
};

KingUserInfo.parseLobbyUser = function (payload) {
    var user = new KingUserInfo();
    user.parseLobbyUser(payload);
    return user;
};

KingUserInfo.parseRoomUser = function (payload) {
    var user = new KingUserInfo();
    user.parseRoomUser(payload);
    return user;
};

KingUserInfo.instance = null;
KingUserInfo.getInstance = function () {
    if (!KingUserInfo.instance) KingUserInfo.instance = new KingUserInfo();
    return KingUserInfo.instance;
};

KingUserInfo.destroyInstance = function () {
    if (KingUserInfo.instance) delete KingUserInfo.instance;
    KingUserInfo.instance = null;
};

// Global

var KingUser = KingUserInfo.getInstance();

// These fields are only available for current user data, access by KingUser,
// while KingUserInfo is used for other user's data

cc.defineGetterSetter(KingUser, "avatar", function () {
    if (portalHelper.getUserAvatar() !== "") return portalHelper.getUserAvatar();
    return this.image;
});

cc.defineGetterSetter(KingUser, "displayName", function () {
    return portalHelper.getDisplayName !== undefined ? portalHelper.getDisplayName() : portalHelper.getUserDisplayName();
});