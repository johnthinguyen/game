"use strict";

var KingLobbyEvents = {

    ON_JOINED_LOBBY: "onJoinedLobby", // được gọi khi vào lobby thành công, thường thì sẽ tự động join lobby khi đăng nhập thành công.
    ON_LEAVED_LOBBY: "onLeavedLobby", // được gọi khi rời lobby. lobby là một room đặc biệt, khi vào bàn chơi thì server hiểu là rời lobby, event này được gọi.

    ON_USER_ENTER_LOBBY: "onUserEnterLobby", // được gọi khi một user vừa vào lobby (chỉ nhận khi mình đang ở trong lobby)
    ON_USER_LEAVE_LOBBY: "onUserLeaveLobby", // được gọi khi một user rời khỏi lobby (chỉ nhận khi mình đang ở trong lobby)

    ON_UPDATE_USER_INFO: "onUpdateUserInfo", // event khi thông tin một user trong lobby được update

    ON_LIST_USER_FETCHED: "onListUserFetched", // được gọi khi đã lấy thành công danh sách user ở lobby (có thể gọi dù ko ở trong lobby)
    ON_LIST_USER_CHANGED: "onListUserChanged" // được gọi khi danh sách user trong lobby có sự thay đổi (users joined/leaved)
};

var KingLobbyManager = cc.class("KingLobbyManager", BaseController, {

    ctor: function ctor(controller) {
        var useGlobalDependency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        this._super();
        this.initEmitter();

        this.lobbyRoom = null;
        this.lobbyGroup = null;

        this.minPlayer = 0;
        this.maxPlayer = 0;

        this.listUsers = [];
        this.listGroups = [];

        this.controller = controller || KingGame;
        this.controller.addListener(this.controller.LISTENER_TYPE.MAIN, this.LOGTAG, this);
        this.controller.addClearIgnoreKeys(this.LOGTAG);

        if (useGlobalDependency) {

            if (KingUser !== undefined) this.setUserManager(KingUser);
            if (KingLogin !== undefined) {
                this.setLoginManager(KingLogin);
                KingLogin.setLobbyManager(this);
            }
        }
    },

    clear: function clear() {

        this.controller = null;
        this.userManager = null;
        this.loginManager = null;

        this.lobbyRoom = null;
        this.lobbyGroup = null;

        this.listUsers = null;
        this.listGroups = null;
    },

    reset: function reset() {

        this.lobbyRoom = null;
        this.lobbyGroup = null;

        this.minPlayer = 0;
        this.maxPlayer = 0;

        this.listUsers = this.listUsers || [];
        this.listUsers.splice(0, this.listUsers.length);

        this.listGroups = this.listGroups || [];
        this.listGroups.splice(0, this.listGroups.length);
    },

    setUserManager: function setUserManager(manager) {
        this.userManager = manager;
    },

    setLoginManager: function setLoginManager(manager) {
        this.loginManager = manager;
    },

    /**
     * Lấy id của lobby hiện tại
     */
    getRoomId: function getRoomId() {
        return this.lobbyRoom ? this.lobbyRoom.vars.roomId : 0;
    },

    /**
     * Lấy danh sách các rooms group (các kênh)
     * @returns {Array|*}
     */
    getListGroup: function getListGroup() {
        return this.listGroups;
    },

    /**
     * Cập nhật danh sách các rooms group
     * @param data
     */
    setListGroup: function setListGroup(data) {
        if (cc.isArray(data)) {
            this.listGroups = data.map(function (item) {
                return {
                    id: parseInt(item[0] || 0),
                    name: item[1] || '',
                    quantity: parseInt(item[2] || 0),
                    maxConnection: parseInt(item[4] || 0),
                    minCoinToJoin: parseInt(item[5] || 0),
                    rangeOfBet: parseInt(item[6] || 0),
                    roomType: parseInt(item[7] || 0),
                    rawSocketHost: item[3] || '',
                    webSocketHost: item[8] || '',
                    webSocketSecureHost: item[9] || ''
                };
            });
        }
    },

    /**
     * Lấy danh sách tất cả user đang ở lobby (user chưa vào bàn chơi nào)
     * @returns {Array|*}
     */
    getListUser: function getListUser() {
        return this.lobbyRoom ? this.lobbyRoom.getUsers() : this.listUsers;
    },

    /**
     * Lấy thông tin user theo id
     * @param userId
     * @returns {null}
     */
    getUserById: function getUserById(userId) {
        return this.lobbyRoom ? this.lobbyRoom.getUserById(userId) : null;
    },

    /**
     * Yêu cầu cập nhật danh sách user đang ở lobby (lấy data ở callback 'onListUserFetched')
     */
    requestListUser: function requestListUser() {
        this.controller.sendGameGetAllUserLobbyRequest();
    },

    /**
     * Vào lobby của một group cụ thể
     * @param group
     */
    joinLobby: function joinLobby() {
        var group = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (!this.isActive()) {
            group = group || (this.listGroups.length > 0 ? this.listGroups[0].name : null);
            if (group) {
                this.controller.sendRequestJoinLobby(group);
            } else {
                this.log(this.tag, "Failed to join lobby. Invalid group.");
            }
        }
    },

    /**
     * Trở về lobby khi đang ở trong bàn chơi
     */
    returnLobby: function returnLobby() {
        var group = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.joinLobby(group || this.lobbyGroup);
    },

    /**
     * Lấy danh sách room (chỉ gọi sau khi đã vào lobby)
     */
    getLobbyRooms: function getLobbyRooms() {
        if (!this.isActive()) {
            this.log(this.tag, "Not joined lobby yet");
            return;
        }
        this.controller.sendRequestGetLobbyRoomList();
    },

    /**
     * Lấy danh sách nhóm room (chỉ gọi sau khi đã vào lobby)
     */
    getLobbyRoomGroups: function getLobbyRoomGroups() {
        if (!this.isActive()) {
            this.log(this.tag, "Not joined lobby yet");
            return;
        }
        this.controller.sendRequestGetLobbyRoomGroupList();
    },

    /**
     * Kiểm tra xem user có đang ở lobby hay không ?
     * @returns {boolean}
     */
    isActive: function isActive() {
        return this.lobbyRoom !== null;
    },

    // SYSTEM EVENTS

    onLoginFailed: function onLoginFailed(payload) {
        this.log(this.tag, "onLoginFailed: %j", payload);
        this.reset();
    },

    onLoginKick: function onLoginKick(payload) {
        this.log(this.tag, "onLoginKick: %j", payload);
        this.reset();
    },

    onLogout: function onLogout(payload) {
        this.log(this.tag, "onLogout: %j", payload);
        this.reset();
    },

    onJoinRoomSuccess: function onJoinRoomSuccess(payload) {
        if (payload.room) {
            var room = KingRoomInfo.parse(payload.room);
            if (!room.isPlayRoom) {

                if (payload.userList) room.setUsers(payload.userList);

                this.log(this.tag, "onJoinRoomSuccess: %j", room);

                this.lobbyRoom = room;
                this.lobbyGroup = room.group;

                this.listUsers = this.getListUser();
                this.dispatchEvent(KingLobbyEvents.ON_JOINED_LOBBY, this.lobbyRoom);
            }
        }
    },

    onUserEnterRoom: function onUserEnterRoom(payload) {
        if (payload.room && payload.user && this.lobbyRoom && this.lobbyRoom.id === payload.room) {
            var user = KingUserInfo.parseRoomUser(payload.user);
            this.lobbyRoom.addUser(user);
            this.dispatchEvent(KingLobbyEvents.ON_USER_ENTER_LOBBY, user);
            this.dispatchEvent(KingLobbyEvents.ON_LIST_USER_CHANGED, this.getListUser());
        }
    },

    onUserLeaveRoom: function onUserLeaveRoom(payload) {
        if (payload.room && payload.user && this.lobbyRoom && this.lobbyRoom.id === payload.room) {
            this.log(this.tag, "onUserLeaveRoom: %j", payload);
            var user = KingUserInfo.parseRoomUser(payload.user);
            this.lobbyRoom.removeUser(user.id);
            if (this.userManager.match(user.id)) {
                this.lobbyRoom = null;
                this.dispatchEvent(KingRoomEvents.ON_LEAVED_LOBBY, this.lobbyRoom);
            } else {
                this.dispatchEvent(KingLobbyEvents.ON_USER_LEAVE_LOBBY, user);
            }
            this.dispatchEvent(KingLobbyEvents.ON_LIST_USER_CHANGED, this.getListUser());
        }
    },

    onUserVariablesUpdate: function onUserVariablesUpdate(payload) {
        if (payload && payload.values && this.userManager.match(payload.user)) {
            this.log(this.tag, "onUserVariablesUpdate: %j", payload);
            this.userManager.parse(payload.values);
            this.dispatchEvent(KingLobbyEvents.ON_UPDATE_USER_INFO, this.userManager);
        }
    },

    onRoomVariablesUpdate: function onRoomVariablesUpdate(payload) {
        if (payload.room && payload.values && this.lobbyRoom && this.lobbyRoom.id === payload.room) {
            this.log(this.tag, "onRoomVariablesUpdate: %j", payload);
            this.lobbyRoom.parseVars(payload.values);
            this.dispatchEvent(KingLobbyEvents.ON_LIST_USER_CHANGED, this.getListUser());
        }
    },

    // GAME EVENTS

    onGameListGroupInfo: function onGameListGroupInfo(payload) {
        this.log(this.tag, "onGameListGroupInfo: %j", payload);
        if (payload && payload.listGroupData) {
            this.setListGroup(payload.listGroupData);
        }
    },

    onGameListUserLobby: function onGameListUserLobby(payload) {
        var _this = this;

        this.log(this.tag, "onGameListUserLobby: %j", payload);
        if (payload && payload.userInfoList && cc.isArray(payload.userInfoList)) {
            this.listUsers.splice(0, this.listUsers.length);
            payload.userInfoList.forEach(function (item) {
                var user = KingUserInfo.parseLobbyUser(item);
                _this.listUsers.push(user);
            });
            this.dispatchEvent(KingLobbyEvents.ON_LIST_USER_FETCHED, this.listUsers);
        }
    },

    onGameUpdateRoomData: function onGameUpdateRoomData(payload) {
        this.log(this.tag, "onGameUpdateRoomData: %j", payload);
    },

    onGameUpdateRoomConfig: function onGameUpdateRoomConfig(payload) {
        this.log(this.tag, "onGameUpdateRoomConfig: %j", payload);
    },

    onGameUpdateMaxPlayer: function onGameUpdateMaxPlayer(payload) {
        this.log(this.tag, "onGameUpdateMaxPlayer: %j", payload);
        if (payload) {
            this.minPlayer = payload.minPlayer || 0;
            this.maxPlayer = payload.maxPlayer || 0;
        }
    },

    onProcessedPayload: function onProcessedPayload(payload) {
        return KingProtocol.parseMessage(payload);
    }
});

KingLobbyManager.instance = null;
KingLobbyManager.getInstance = function () {
    if (!KingLobbyManager.instance) KingLobbyManager.instance = new KingLobbyManager();
    return KingLobbyManager.instance;
};

KingLobbyManager.destroyInstance = function () {
    if (KingLobbyManager.instance) delete KingLobbyManager.instance;
    KingLobbyManager.instance = null;
};

// Global

var KingLobby = KingLobbyManager.getInstance();