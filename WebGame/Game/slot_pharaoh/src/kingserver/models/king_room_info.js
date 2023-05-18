"use strict";

var KingRoomInfo = cc.Class.extend({
    LOGTAG: "[KingRoomInfo]",

    ctor: function ctor(payload) {

        this.id = 0;
        this.name = "";
        this.group = "";
        this.isPlayRoom = false;
        this.isHavePassword = false;
        this.playerCount = 0;
        this.maxPlayers = 0;
        this.spectatorCount = 0;
        this.maxSpectators = 0;
        this.ownerId = 0;
        this.ownerMoney = 0;
        this.vars = {};
        this.users = [];

        payload && this.parse(payload);
    },

    parse: function parse(payload) {
        if (payload) {

            this.id = parseInt(payload[0] || 0);
            this.name = payload[1] || '';
            this.group = payload[2] || '';
            this.isPlayRoom = payload[3] || false;
            this.isHavePassword = payload[5] || false;
            this.playerCount = parseInt(payload[6] || 0);
            this.maxPlayers = parseInt(payload[7] || 0);
            this.spectatorCount = parseInt(payload[9] || 0);
            this.maxSpectators = parseInt(payload[10] || 0);
            this.ownerId = parseInt(payload[11] || 0);

            this.vars = payload[8] || {};
            if (this.vars.arrNick) {
                this.setUsers(this.vars.arrNick);
                delete this.vars.arrNick;
            }
        }
    },

    parseUsers: function parseUsers(payload) {
        if (payload) {
            var data = payload;
            if (cc.isString(data)) {
                try {
                    data = JSON.parse(data);
                } catch (ex) {}
            }
            if (cc.isArray(data)) {
                return data.map(function (item) {
                    var user = KingUserInfo.parseRoomUser(KingProtocol.parseMessage(item));
                    return user;
                });
            }
        }
        return [];
    },

    parseVars: function parseVars(payload) {
        var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (payload) {
            for (var key in payload) {
                this.vars[key] = payload[key];
            }if (this.vars.arrNick) {
                this.setUsers(this.vars.arrNick, override);
                delete this.vars.arrNick;
            }
            if (this.vars.ownerId) {
                this.ownerId = this.vars.ownerId;
                delete this.vars.ownerId;
            }
            if (this.vars.ownerCoin) {
                this.ownerMoney = this.vars.ownerCoin;
                delete this.vars.ownerCoin;
            }
        }
    },

    /**
     * Lấy thông tin chủ bàn chơi
     * @returns {*}
     */
    getOwner: function getOwner() {
        return this.getUserById(this.ownerId);
    },

    /**
     * Cập nhật thông tin chủ bàn chơi
     * @returns {*}
     */
    changeOwner: function changeOwner(ownerId) {
        this.ownerId = ownerId;
    },

    /**
     * Lấy danh sách các ghế ngồi trong bàn
     * @returns {*}
     */
    getSeats: function getSeats() {
        var _this = this;

        this.seats = this.seats || {};
        for (var i = 0; i < this.maxPlayers; i++) {
            this.seats[i + 1] = KingRoomSeat.SEAT_NONE;
        }this.getUsers().forEach(function (user) {
            if (_this.seats.hasOwnProperty(user.position)) _this.seats[user.position] = user.id;
        });
        return this.seats;
    },

    /**
     * Thêm user vào bàn chơi
     * @param user
     */
    addUser: function addUser(user) {
        if (user) {
            var oldUser = this.getUserById(user.id);
            if (oldUser) oldUser.copy(user);else this.users.push(user);
        }
    },

    /**
     * Xóa user khỏi bàn chơi
     * @param userId
     */
    removeUser: function removeUser(userId) {
        var found = this.users.findIndex(function (user) {
            return user.match(userId);
        });
        if (found !== -1) this.users.splice(found, 1);
    },

    /**
     * Xóa tất ca user khỏi bàn chơi
     */
    clearUser: function clearUser() {
        this.users.splice(0, this.users.length);
    },

    /**
     * Lấy danh sách user có trong bàn chơi (kể cả spectator)
     * @returns {*}
     */
    getUsers: function getUsers() {
        return this.users;
    },

    /**
     * Cập nhật danh sách user có trong bàn chơi
     * @param users
     */
    setUsers: function setUsers(payload) {
        var _this2 = this;

        var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        var users = this.parseUsers(payload);
        if (override === true || users.length > 0) {
            if (override === true) {
                // room variables update from server
                // currently responsed with wrong coin,
                // so we try copy last coin
                users.forEach(function (user) {
                    var found = _this2.users.findIndex(function (item) {
                        return item.match(user.id);
                    });
                    if (found >= 0) user.coin = _this2.users[found].coin;
                });
            }
            _.remove(this.users, function (user) {
                return user.position > KingRoomSeat.SEAT_NONE;
            });
            users.forEach(function (user) {
                var found = _this2.users.findIndex(function (item) {
                    return item.match(user.id);
                });
                if (found >= 0) {
                    _this2.users[found] = user;
                } else {
                    _this2.users.push(user);
                }
            });
        }
    },

    /**
     * Lấy user trong bàn chơi theo id
     * @param userId
     * @returns {*}
     */
    getUserById: function getUserById(userId) {
        return this.users.find(function (user) {
            return user.match(userId);
        });
    },

    /**
     * Lấy user trong bàn chơi theo vị trí ngồi
     * @param seatId
     * @returns {*}
     */
    getUserBySeat: function getUserBySeat(seatId) {
        var _this3 = this;

        if (this.seats.hasOwnProperty(seatId)) {
            return this.users.find(function (user) {
                return user.match(_this3.seats[seatId]);
            });
        }
        return null;
    },

    /**
     * Lấy danh sách user đang chơi trong bàn chơi
     * @returns {*}
     */
    getAllPlayers: function getAllPlayers() {
        return this.getUsers().filter(function (item) {
            return item.position > KingRoomSeat.SEAT_NONE;
        });
    },

    /**
     * Lấy danh sách các user đang xem trong bàn chơi
     * @returns {*}
     */
    getAllViewers: function getAllViewers() {
        return this.getUsers().filter(function (item) {
            return item.matchSeat(KingRoomSeat.SEAT_VIEWER);
        });
    }
});

KingRoomInfo.parse = function (payload) {
    return new KingRoomInfo(payload);
};