"use strict";

var KingRoomEvents = {

    ON_QUICKPLAY: "onQuickPlay", // event khi join room bằng mode chơi ngay

    ON_ROOM_CREATED: "onRoomCreated", // event khi có bàn chơi mới được tạo
    ON_ROOM_REMOVED: "omRoomRemoved", // event khi có bàn chơi bị hủy

    ON_JOINED_GAME_ROOM: "onJoinedGameRoom", // event khi vào bàn chơi thành công
    ON_LEAVED_GAME_ROOM: "onLeavedGameRoom", // event khi thoát bàn hoặc bị kick khỏi bàn chơi

    ON_UPDATE_ROOM_LIST: "onUpdateRoomList", // event khi danh sách bàn chơi trả về
    ON_UPDATE_ROOM_GROUP_LIST: "onUpdateRoomGroupList", // event khi danh sách nhóm bàn chơi theo bet coin trả về

    ON_UPDATE_ROOM_INFO: "onUpdateRoomInfo", // event khi thông tin bàn chơi được update
    ON_UPDATE_USER_INFO: "onUpdateUserInfo", // event khi thông tin một user trong bàn chơi được update

    ON_USER_ENTER_ROOM: "onUserEnterRoom", // event khi một user vừa vào bàn chơi (chỉ nhận khi mình đang ở trong bàn)
    ON_USER_LEAVE_ROOM: "onUserLeaveRoom", // event khi một user rời khỏi bàn chơi (chỉ nhận khi mình đang ở trong bàn)

    ON_INVITE_RECEIVED: "onInviteReceived", // event khi một ai đó mời mình vào bàn chơi
    ON_INVITE_CONFIRMED: "onInviteConfirmed", // event khi mình đã confirmed lời mời chơi

    ON_CHANGED_TO_VIEWER: "onChangedToViewer", // event khi user đã chuyển sang role viewer
    ON_CHANGED_TO_PLAYER: "onChangedToPlayer", // event khi user đã chuyển sang role player

    ON_RECEIVED_CHAT: "onReceivedChat",
    ON_RECEIVED_EMOTICON: "onReceivedEmoticon"
};

var KingRoomSeat = {
    SEAT_VIEWER: -1, // gửi kèm request join room, role là người xem
    SEAT_NONE: 0
};

var KingRoomUserListMode = {
    REMOTE_OVERRIDE: 0, // list user được ghi đè khi nhận data mới nhất từ server (onRoomVariablesUpdate)
    JOIN_LEAVE_BASE: 1 // list user được thay đổi dựa vào các event onUserEnterRoom, onUserLeaveRoom
};

var KingRoomManager = cc.class("KingRoomManager", BaseController, {

    REQUIRE_LEAVE_BEFORE_JOIN_ROOM: false,

    ctor: function ctor(controller) {
        var useGlobalDependency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        this._super();
        this.initEmitter();

        this.listRooms = {};
        this.listRoomGroups = [];

        this.joinedRoom = 0;
        this.joinedSeat = 0;

        this.userListMode = KingRoomUserListMode.REMOTE_OVERRIDE;

        this.controller = controller || KingGame;

        this.controller.addListener(this.controller.LISTENER_TYPE.MAIN, this.LOGTAG, this);
        this.controller.addListener(this.controller.LISTENER_TYPE.GAME, this.LOGTAG, this);
        this.controller.addClearIgnoreKeys(this.LOGTAG);

        if (useGlobalDependency) {

            if (KingUser !== undefined) this.setUserManager(KingUser);
            if (KingLobby !== undefined) {}
            this.setLobbyManager(KingLobby);

            if (KingLogin !== undefined) {
                this.setLoginManager(KingLogin);
                KingLogin.setRoomManager(this);
            }
        }
    },

    clear: function clear() {

        this.listRooms = null;
        this.listRoomGroups = null;

        this.controller = null;
        this.userManager = null;
        this.loginManager = null;
        this.lobbyManager = null;
    },

    /**
     * Reset data của module
     */
    reset: function reset() {

        this.listRooms = this.listRooms || {};
        for (var key in this.listRooms) {
            delete this.listRooms[key];
        }this.listRoomGroups = [];

        this.joinedRoom = 0;
        this.joinedSeat = 0;
    },

    /**
     * Reset room đã joined
     */
    resetRoom: function resetRoom() {
        this.joinedRoom = 0;
        this.joinedSeat = 0;
    },

    /**
     * Dependency injection
     * @param manager
     */
    setUserManager: function setUserManager(manager) {
        this.userManager = manager;
    },

    /**
     * Dependency injection
     * @param manager
     */
    setLoginManager: function setLoginManager(manager) {
        this.loginManager = manager;
        this.loginManager.setHandler(this);
    },

    /**
     * Dependency injection
     * @param manager
     */
    setLobbyManager: function setLobbyManager(manager) {
        this.lobbyManager = manager;
    },

    /**
     * Lấy danh sách bàn chơi hiện có
     * @returns {*[]}
     */
    getAllRooms: function getAllRooms() {
        var _this = this;

        return Object.keys(this.listRooms).map(function (key) {
            return _this.listRooms[key];
        });
    },

    /**
     * Lấy danh sách nhóm bàn chơi hiện có
     * @returns {*[]}
     */
    getAllRoomGroups: function getAllRoomGroups() {
        return this.listRoomGroups;
    },

    /**
     * Lấy thông tin bàn chơi theo id
     * @param roomId
     * @returns {null}
     */
    getRoomById: function getRoomById(roomId) {
        return this.listRooms.hasOwnProperty(roomId) ? this.listRooms[roomId] : null;
    },

    /**
     * Kiểm tra xem bản thân đã join bàn chơi nào chưa
     * @returns {boolean}
     */
    isJoinedRoom: function isJoinedRoom() {
        return this.getRoomById(this.joinedRoom) !== null;
    },

    /**
     * Kiểm tra xem mình có phải spectator ko (nếu đã join bàn)
     * @returns {boolean}
     */
    isViewer: function isViewer() {
        return this.joinedSeat === KingRoomSeat.SEAT_VIEWER;
    },

    /**
     * Kiểm tra xem mình có phải player ko (nếu đã join bàn)
     * @returns {boolean}
     */
    isPlayer: function isPlayer() {
        return this.joinedSeat > KingRoomSeat.SEAT_NONE;
    },

    /**
     * Lấy thông tin bản thân (nếu đã join bàn)
     * @returns {T}
     */
    getMe: function getMe() {
        var _this2 = this;

        var users = this.getActiveRoomUsers();
        return users.find(function (item) {
            return _this2.userManager.match(item.id);
        });
    },

    /**
     * Lấy thông tin player theo id (user id)
     * @param playerId
     */
    getPlayerById: function getPlayerById(playerId) {
        var players = this.getActiveRoomPlayers();
        return players.find(function (item) {
            return item.match(playerId);
        });
    },

    /**
     * Lấy thông tin player theo số hiệu trong ván (player no.)
     * @param playerNo
     */
    getPlayerByNo: function getPlayerByNo(playerNo) {
        var players = this.getActiveRoomPlayers();
        return players.find(function (item) {
            return item.matchPlayerNo(playerNo);
        });
    },

    /**
     * Lấy thông tin player theo vị trí ngồi
     * @param playerSeat
     */
    getPlayerBySeat: function getPlayerBySeat(playerSeat) {
        var players = this.getActiveRoomPlayers();
        return players.find(function (item) {
            return item.matchSeat(playerSeat);
        });
    },

    /**
     * Lấy thông tin player trong room cụ thể
     * @param {*} roomId
     * @param {*} playerId
     */
    getPlayerInRoom: function getPlayerInRoom(roomId, playerId) {
        if (roomId && playerId) {
            var room = this.getRoomById(roomId);
            return room ? room.getUserById(playerId) : null;
        }
        return null;
    },

    /**
     * Lấy thông tin bàn chơi mà mình đã joined
     * @returns {*}
     */
    getActiveRoom: function getActiveRoom() {
        return this.joinedRoom ? this.getRoomById(this.joinedRoom) : null;
    },

    /**
     * Lấy vị trí ngồi (nếu mình đang chơi -> isPlayer = true)
     * @returns {*}
     */
    getActiveSeat: function getActiveSeat() {
        return this.joinedSeat <= 0 ? KingRoomSeat.SEAT_NONE : this.joinedSeat;
    },

    /**
     * Lấy danh sách người chơi (bao gồm player, spectators) của bàn mà mình đã joined
     * @returns {*}
     */
    getActiveRoomUsers: function getActiveRoomUsers() {
        var room = this.getActiveRoom();
        return room ? room.getUsers() : [];
    },

    /**
     * Lấy danh sách user đang chơi của bàn mà mình đã joined (bao gồm cả mình, nếu có)
     * @returns {*}
     */
    getActiveRoomPlayers: function getActiveRoomPlayers() {
        var room = this.getActiveRoom();
        return room ? room.getAllPlayers() : [];
    },

    /**
     * Lấy danh sách user đang xem của bàn mà mình đã joined (bao gồm cả mình, nếu có)
     * @returns {*}
     */
    getActiveRoomViewers: function getActiveRoomViewers() {
        var room = this.getActiveRoom();
        return room ? room.getAllViewers() : [];
    },

    /**
     * Lấy danh sách chỗ ngồi của bàn mà mình đã joined
     * @returns {*}
     */
    getActiveRoomSeats: function getActiveRoomSeats() {
        var room = this.getActiveRoom();
        return room ? room.getSeats() : {};
    },

    /**
     * Lấy thông tin bàn chơi mà mình đã joined
     * @returns {*}
     */
    getActiveRoomVars: function getActiveRoomVars() {
        var room = this.getActiveRoom();
        return room ? room.vars || {} : {};
    },

    /**
     * Cập nhật bàn chơi
     * @param room
     */
    setRoom: function setRoom(room) {
        this.listRooms[room.id] = room;
    },

    /**
     * Đặt mode update danh sách user trong room
     * @param mode
     */
    setUserListMode: function setUserListMode(mode) {
        this.userListMode = mode;
    },

    /**
     * Bỏ bàn chơi ra khỏi danh sách
     * @param roomId
     */
    removeRoom: function removeRoom(roomId) {
        if (this.listRooms[roomId]) delete this.listRooms[roomId];
    },

    /**
     * Cập nhận danh sách bàn chơi
     * @param data
     */
    updateRooms: function updateRooms(data) {
        var _this3 = this;

        if (data.roomList && cc.isArray(data.roomList)) {
            this.listRooms = {};
            data.roomList.forEach(function (item) {
                var room = KingRoomInfo.parse(item);
                _this3.listRooms[room.id] = room;
            });
        }
    },

    /**
     * Cập nhận danh sách nhóm bàn chơi
     * @param data
     */
    updateRoomGroups: function updateRoomGroups(data) {
        var _this4 = this;

        this.listRoomGroups = [];

        if (data.lobbyBet) {
            data.lobbyBet.split(',').filter(function (item) {
                return item !== '';
            }).forEach(function (item) {
                var params = item.split(':').filter(function (param) {
                    return param !== '';
                });
                if (params.length >= 2) {
                    _this4.listRoomGroups.push({
                        betCoin: parseInt(params[0]),
                        userCount: parseInt(params[1]),
                        solo: false
                    });
                }
            });
        }

        if (data.lobbyBetSolo) {
            data.lobbyBetSolo.split(',').filter(function (item) {
                return item !== '';
            }).forEach(function (item) {
                var params = item.split(':').filter(function (param) {
                    return param !== '';
                });
                if (params.length >= 2) {
                    _this4.listRoomGroups.push({
                        betCoin: parseInt(params[0]),
                        userCount: parseInt(params[1]),
                        solo: true
                    });
                }
            });
        }
    },

    /**
     * Cập nhật thêm thông tin player trong ván chơi
     * @param data
     */
    updatePlayers: function updatePlayers(data) {
        var _this5 = this;

        if (data && cc.isArray(data)) {
            data.forEach(function (item) {
                _this5.getActiveRoomPlayers().forEach(function (player) {
                    if (player.match(item.userId)) {
                        player.playerNo = item.playerNo;
                    }
                });
            });
        }
    },

    /**
     * Cập nhật chỗ ngồi hiện tại của mình
     */
    updateActiveSeat: function updateActiveSeat(seat) {
        var me = this.getMe();
        this.joinedSeat = me ? me.position : KingRoomSeat.SEAT_NONE;
    },

    /**
     * Cập nhật chỗ ngồi của user
     */
    updatePlayerSeat: function updatePlayerSeat(userId, userSeat) {
        var user = this.getActiveRoomUsers().find(function (user) {
            return user.match(userId);
        });
        if (user) {
            user.position = userSeat;
            if (user.match(this.getMe().id)) this.joinedSeat = userSeat;
        }
    },

    /**
     * Tự động vào một bàn ngẫu nhiên do server chọn
     */
    quickPlay: function quickPlay() {
        this.controller.sendGameQuickPlayRequest();
    },

    /**
     * Tạo bàn chơi mới (nếu tạo thành cộng thì tự động vào bàn, role player)
     * @param betCoin
     * @param timeOut
     * @param rules
     * @param maxPlayer
     * @param solo
     */
    createRoom: function createRoom(betCoin, timeOut) {
        var rules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var maxPlayer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
        var solo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

        this.controller.sendGameCreateRoomRequest(betCoin, rules, timeOut, maxPlayer, solo);
    },

    /**
     * Join một bàn chơi với role cụ thể
     * @param roomId
     * @param roomSeat
     * @returns {boolean}
     */
    joinRoom: function joinRoom(roomId) {
        var roomSeat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : KingRoomSeat.SEAT_VIEWER;

        if (this.REQUIRE_LEAVE_BEFORE_JOIN_ROOM && this.isJoinedRoom()) {
            this.log(this.tag, "You already joined room:", this.joinedRoom);
            return false;
        }

        this.controller.sendGameJoinRoomRequest(roomId, roomSeat);
        return true;
    },

    /**
     * Join một bàn chơi với bet coin cụ thể
     * @param betCoin
     * @param solo
     * @returns {boolean}
     */
    joinRoomWithBet: function joinRoomWithBet(betCoin, solo) {

        if (this.REQUIRE_LEAVE_BEFORE_JOIN_ROOM && this.isJoinedRoom()) {
            this.log(this.tag, "You already joined room:", this.joinedRoom);
            return false;
        }

        this.controller.sendGameJoinRoomWithBetRequest(betCoin, solo || false);
        return true;
    },

    /**
     * Vào bàn chơi để xem, không chơi
     * @param roomId
     * @returns {boolean}
     */
    joinRoomAsViewer: function joinRoomAsViewer(roomId) {

        if (this.REQUIRE_LEAVE_BEFORE_JOIN_ROOM && this.isJoinedRoom()) {
            this.log(this.tag, "You already joined room:", this.joinedRoom);
            return false;
        }

        this.controller.sendGameJoinRoomRequest(roomId, KingRoomSeat.SEAT_VIEWER);
        return true;
    },

    /**
     * Mời một user khác vào bàn chơi mới
     * @param userId
     * @param betCoin
     * @param timeOut
     */
    inviteToNewRoom: function inviteToNewRoom(userId, betCoin, timeOut) {
        this.controller.sendGameInviteRequest(betCoin, null, timeOut, 5, false, 0, userId, this.userManager.image, this.userManager.level);
    },

    /**
     * Mời một user khác vào bàn chơi mới (solo yasuo, mid lane, 1 trụ | 1 mạng | 100 creeps)
     * @param userId
     * @param betCoin
     * @param timeOut
     * @param rules
     * @param maxPlayer
     * @param solo
     * @param position
     */
    inviteToExistRoom: function inviteToExistRoom(userId, betCoin, timeOut, rules, maxPlayer, solo, position) {
        this.controller.sendGameInviteRequest(betCoin, rules, timeOut, maxPlayer, solo, position, userId, this.userManager.image, this.userManager.level);
    },

    /**
     * Rời bàn chơi
     */
    leaveRoom: function leaveRoom() {
        var wait = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var activeRoom = this.getActiveRoom();
        var activeRoomGroup = activeRoom ? activeRoom.group : null;

        if (!wait) this.resetRoom();

        this.lobbyManager.returnLobby(activeRoomGroup);
    },

    /**
     * Chuyển role từ người xem sang người chơi
     * @param position
     */
    switchToPlayer: function switchToPlayer(position) {
        if (this.isViewer()) {
            this.controller.sendRequestSpectatorToPlayer(position);
        } else {
            this.log(this.tag, "You're already player");
        }
    },

    /**
     * Chuyển role từ người chơi sang người xem
     */
    switchToViewer: function switchToViewer() {
        if (this.isPlayer()) {
            this.controller.sendRequestPlayerToSpectator(this.userManager.id);
        } else {
            this.log(this.tag, "You're already viewer");
        }
    },

    /**
     * Gửi lời yêu thương tới các bạn cùng bạn
     * @param message
     * @param userId
     */
    sendChatText: function sendChatText(message, userId) {
        this.controller.sendGameChatRequest(message, userId);
    },

    /**
     * Gửi lời biểu cảm yêu thương tới các bạn cùng bạn
     * @param emoticon
     * @param userId
     */
    sendChatEmoticon: function sendChatEmoticon(emoticon, userId) {
        this.controller.sendGameChatEmoticonRequest(emoticon, userId);
    },

    // SYSTEM EVENTS

    onLoginFailed: function onLoginFailed(payload) {
        this.log(this.tag, "onLoginFailed: %j", payload);
        this.resetRoom();
    },

    onLoginKick: function onLoginKick(payload) {
        this.log(this.tag, "onLoginKick: %j", payload);
        this.resetRoom();
    },

    onLogout: function onLogout(payload) {
        this.log(this.tag, "onLogout: %j", payload);
        this.reset();
    },

    onReceivedLobbyRoomList: function onReceivedLobbyRoomList(payload) {
        this.log(this.tag, "onReceivedLobbyRoomList: %j", payload);
        this.updateRooms(payload);
        this.dispatchEvent(KingRoomEvents.ON_UPDATE_ROOM_LIST, this.getAllRooms());
    },

    onReceivedLobbyRoomGroupList: function onReceivedLobbyRoomGroupList(payload) {
        this.log(this.tag, "onReceivedLobbyRoomGroupList: %j", payload);
        this.updateRoomGroups(payload);
        this.dispatchEvent(KingRoomEvents.ON_UPDATE_ROOM_GROUP_LIST, this.getAllRoomGroups());
    },

    onJoinRoomSuccess: function onJoinRoomSuccess(payload) {
        if (payload.room) {
            var room = KingRoomInfo.parse(payload.room);
            if (room.isPlayRoom) {

                if (payload.userList) room.setUsers(payload.userList);

                this.joinedRoom = room.id;
                this.joinedSeat = KingRoomSeat.SEAT_NONE;

                this.setRoom(room);
                this.updateActiveSeat();

                this.log(this.tag, "onJoinRoomSuccess: %j", this.getActiveRoom());
                this.dispatchEvent(KingRoomEvents.ON_JOINED_GAME_ROOM, this.getActiveRoom());
            }
        }
    },

    onUserEnterRoom: function onUserEnterRoom(payload) {
        if (payload.room && payload.user && this.joinedRoom === payload.room) {
            this.log(this.tag, "onUserEnterRoom: %j", payload);
            var user = KingUserInfo.parseRoomUser(payload.user);
            if (this.getActiveRoom()) this.getActiveRoom().addUser(user);
            this.updateActiveSeat();
            this.dispatchEvent(KingRoomEvents.ON_USER_ENTER_ROOM, user);
        }
    },

    onUserLeaveRoom: function onUserLeaveRoom(payload) {
        this.log(this.tag, "onUserLeaveRoom: %j", payload);
        if (payload.room && payload.user && this.joinedRoom === payload.room) {
            var user = KingUserInfo.parseRoomUser(payload.user);
            if (this.getActiveRoom()) this.getActiveRoom().removeUser(user.id);
            if (this.userManager.match(user.id)) {
                this.resetRoom();
                this.dispatchEvent(KingRoomEvents.ON_LEAVED_GAME_ROOM, this.getActiveRoom());
            } else {
                this.dispatchEvent(KingRoomEvents.ON_USER_LEAVE_ROOM, user);
            }
        }
    },

    onPlayerToSpectator: function onPlayerToSpectator(payload) {
        this.log(this.tag, "onPlayerToSpectator: %j", payload);
        var data = {
            userId: payload.user,
            roomId: payload.room,
            roomOwner: payload.roomOwner,
            position: payload.player
        };
        this.updatePlayerSeat(data.userId, data.position);
        this.dispatchEvent(KingRoomEvents.ON_CHANGED_TO_VIEWER, data);
    },

    onSpectatorToPlayer: function onSpectatorToPlayer(payload) {
        this.log(this.tag, "onPlayerToSpectator: %j", payload);
        var data = {
            userId: payload.user,
            roomId: payload.room,
            roomOwner: payload.roomOwner,
            position: payload.player
        };
        this.updatePlayerSeat(data.userId, data.position);
        this.dispatchEvent(KingRoomEvents.ON_CHANGED_TO_PLAYER, data);
    },

    onRoomAdded: function onRoomAdded(payload) {
        this.log(this.tag, "onRoomAdded: %j", payload);
        if (payload && payload.room) {
            var room = KingRoomInfo.parse(payload.room);
            this.setRoom(room);
            this.dispatchEvent(KingRoomEvents.ON_ROOM_CREATED, room);
        }
    },

    onRoomRemoved: function onRoomRemoved(payload) {
        this.log(this.tag, "onRoomRemoved: %j", payload);
        if (payload && payload.room) {
            this.removeRoom(payload.room);
            this.dispatchEvent(KingRoomEvents.ON_ROOM_REMOVED, payload.room);
        }
    },

    onRoomOwnerChanged: function onRoomOwnerChanged(payload) {
        this.log(this.tag, "onRoomOwnerChanged: %j", payload);
        var targetRoom = this.getRoomById(payload.room);
        if (targetRoom) {
            targetRoom.changeOwner(payload.user);
        }
    },

    onRoomVariablesUpdate: function onRoomVariablesUpdate(payload) {
        this.log(this.tag, "onRoomVariablesUpdate: %j", payload);
        if (payload.room && payload.values) {
            var targetRoom = this.getRoomById(payload.room);
            if (targetRoom) targetRoom.parseVars(payload.values, this.userListMode === KingRoomUserListMode.REMOTE_OVERRIDE);
            if (this.joinedRoom === payload.room) {
                this.updateActiveSeat();
            }
            this.dispatchEvent(KingRoomEvents.ON_UPDATE_ROOM_INFO, targetRoom);
        }
    },

    onUserLostExitLogout: function onUserLostExitLogout(payload) {
        var _this6 = this;

        this.log(this.tag, "onUserLostExitLogout: %j", payload);
        if (payload.user && payload.listJoinedRoom) {
            var room = payload.listJoinedRoom.find(function (roomId) {
                return roomId === _this6.joinedRoom;
            });
            if (room) {
                var user = KingUserInfo.parseRoomUser(payload.user);
                if (this.getActiveRoom()) this.getActiveRoom().removeUser(user.id);
                if (this.userManager.match(user.id)) {
                    this.resetRoom();
                    this.dispatchEvent(KingRoomEvents.ON_LEAVED_GAME_ROOM, this.getActiveRoom());
                } else {
                    this.dispatchEvent(KingRoomEvents.ON_USER_LEAVE_ROOM, user);
                }
            }
        }
    },

    onUserVariablesUpdate: function onUserVariablesUpdate(payload) {
        this.log(this.tag, "onUserVariablesUpdate: %j", payload);
        if (payload && payload.values && payload.user) {
            for (var roomId in this.listRooms) {
                var room = this.listRooms[roomId];
                if (room) {
                    var user = room.getUserById(payload.user);
                    if (user) {
                        user.parse(payload.values);
                        this.dispatchEvent(KingRoomEvents.ON_UPDATE_USER_INFO, user);
                        break;
                    }
                }
            }
        }
    },

    // GAME EVENTS

    onGameAction: function onGameAction(payload) {
        this.log(this.tag, "onGameAction: %j", payload);
        if (payload.command === 0 && payload.updatePlayerInfo) {
            this.updatePlayers(payload.updatePlayerInfo);
        }
    },

    onGameQuickPlay: function onGameQuickPlay(payload) {
        this.log(this.tag, "onGameQuickPlay: %j", payload);
        this.dispatchEvent(KingRoomEvents.ON_QUICKPLAY, payload);
    },

    onGameReconnectData: function onGameReconnectData(payload) {
        this.log(this.tag, "onGameReconnectData: %j", payload);
        if (payload.updatePlayerInfo) {
            this.updatePlayers(payload.updatePlayerInfo);
        }
    },

    onGameUpdateRoomData: function onGameUpdateRoomData(payload) {
        this.log(this.tag, "onGameUpdateRoomData: %j", payload);
    },

    onGameUpdateRoomConfig: function onGameUpdateRoomConfig(payload) {
        this.log(this.tag, "onGameUpdateRoomConfig: %j", payload);
        // TODO: Update room info
    },

    onGameInviteReceived: function onGameInviteReceived(payload) {
        this.log(this.tag, "onGameInviteReceived: %j", payload);
        this.dispatchEvent(KingRoomEvents.ON_INVITE_RECEIVED, payload);
    },

    onGameInviteConfirmed: function onGameInviteConfirmed(payload) {
        this.log(this.tag, "onGameInviteConfirmed: %j", payload);
        this.dispatchEvent(KingRoomEvents.ON_INVITE_CONFIRMED, payload);
    },

    onGameReceivedChat: function onGameReceivedChat(payload) {
        this.log(this.tag, "onGameReceivedChat: %j", payload);
        this.dispatchEvent(KingRoomEvents.ON_RECEIVED_CHAT, payload);
    },

    onGameReceivedEmoticon: function onGameReceivedEmoticon(payload) {
        this.log(this.tag, "onGameReceivedEmoticon: %j", payload);
        this.dispatchEvent(KingRoomEvents.ON_RECEIVED_EMOTICON, payload);
    },

    onProcessedPayload: function onProcessedPayload(payload) {
        return KingProtocol.parseMessage(payload);
    }
});

KingRoomManager.instance = null;
KingRoomManager.getInstance = function () {
    if (!KingRoomManager.instance) KingRoomManager.instance = new KingRoomManager();
    return KingRoomManager.instance;
};

KingRoomManager.destroyInstance = function () {
    if (KingRoomManager.instance) delete KingRoomManager.instance;
    KingRoomManager.instance = null;
};

// Global

var KingRoom = KingRoomManager.getInstance();