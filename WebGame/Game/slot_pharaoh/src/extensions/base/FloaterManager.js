"use strict";

var FloaterManager = cc.class("FloaterManager", {

    isBusy: false,
    isOpen: false,

    isActive: false,
    isLoading: false,

    activeLocation: {},

    ACTION_TAG: 2543,
    UPDATE_INTERVAL: 1000,

    SHOW_EFFECT_TIME: 0.3,
    HIDE_EFFECT_TIME: 0.3,

    ctor: function ctor() {

        this.node = null;
        this.startOptions = null;

        this.model = null;
        this.config = null;

        this.onLoad = null;
        this.onUnload = null;

        this.onStarted = null;
        this.onStopped = null;

        this.onShown = null;
        this.onHidden = null;

        this.updateInterval = null;

        this.searchPaths = [];
        this.loadCallbacks = [];

        this.configScripts = [];
        this.loadedScripts = [];

        this.eventTagIncome = "";
        this.eventTagOutcome = "";

        this.eventMaps = {};
        this.eventMaps[FloaterManager.Events.ON_GAME_EXIT] = "%s.on_game_exit";

        this.eventMaps[FloaterManager.Events.ON_GAME_LOBBY_ENTER] = "%s.on_game_lobby_enter";
        this.eventMaps[FloaterManager.Events.ON_GAME_LOBBY_LEAVE] = "%s.on_game_lobby_leave";

        this.eventMaps[FloaterManager.Events.ON_GAME_ROOM_ENTER] = "%s.on_game_room_enter";
        this.eventMaps[FloaterManager.Events.ON_GAME_ROOM_LEAVE] = "%s.on_game_room_leave";

        this.eventMaps[FloaterManager.Events.ON_GAME_DATA_CHANGED] = "%s.on_game_data_changed";
        this.eventMaps[FloaterManager.Events.ON_GAME_MATCH_CHANGED] = "%s.on_game_match_changed";
    },

    /**
     * Set constructor of layer/node, used as template for creating node when start.
     * @param model
     */
    setModel: function setModel(model) {
        cc.assert(model !== null && model !== undefined, "Model must not be null!");
        this.model = model;
    },

    /**
     * Set module config
     * @param config
     */
    setConfig: function setConfig(config) {
        cc.assert(config !== null && config !== undefined, "Config must not be null!");

        this.config = _.defaults(config, {
            name: "",
            file: "",
            allows: {
                main: [],
                games: []
            },
            ownerName: "",
            ownerZOrder: 999,
            eventTag: "",
            preload: false
        });

        this.eventTagIncome = cc.formatStr("%s.%s", this.config.eventTag, FloaterConfig.EVENT_INCOME_PREFIX);
        this.eventTagOutcome = cc.formatStr("%s.%s", this.config.eventTag, FloaterConfig.EVENT_OUTCOME_PREFIX);

        portalHelper.registerTag(this.eventTagIncome);
    },

    /**
     * Set options passed to model's constructor
     * @param options
     */
    setOptions: function setOptions(options) {
        this.startOptions = options;
    },

    setOnLoad: function setOnLoad(callback) {
        this.onLoad = callback;
    },

    setOnUnload: function setOnUnload(callback) {
        this.onUnload = callback;
    },

    setOnStarted: function setOnStarted(callback) {
        this.onStarted = callback;
    },

    setOnStopped: function setOnStopped(callback) {
        this.onStopped = callback;
    },

    setOnShown: function setOnShown(callback) {
        this.onShown = callback;
    },

    setOnHidden: function setOnHidden(callback) {
        this.onHidden = callback;
    },

    getEventName: function getEventName(event) {
        if (this.eventMaps[event] !== undefined) {
            return cc.formatStr(this.eventMaps[event], this.eventTagOutcome);
        }
        return "";
    },

    getActiveGame: function getActiveGame() {
        return portalHelper.gameName || "";
    },

    isLoaded: function isLoaded() {
        return this.node && cc.sys.isObjectValid(this.node);
    },

    isPreload: function isPreload() {
        return this.config && this.config.preload;
    },

    isAttached: function isAttached() {
        return this.node && this.node.parent !== undefined;
    },

    isGameAllowed: function isGameAllowed(name) {
        var allows = this.config.allows ? this.config.allows.games || [] : [];
        return allows.indexOf(name) >= 0;
    },

    isLocationAllowed: function isLocationAllowed(name) {
        var allows = this.config.allows ? this.config.allows.main || [] : [];
        return allows.indexOf(name) >= 0;
    },

    isLocationActive: function isLocationActive(name) {
        return this.activeLocation[name] || false;
    },

    isActiveGameAllowed: function isActiveGameAllowed() {
        if (portalHelper.gameName === undefined) return;
        return this.isGameAllowed(portalHelper.gameName);
    },

    toggleLocationActive: function toggleLocationActive(name, active) {
        this.activeLocation[name] = active;
    },

    reset: function reset() {

        this.isBusy = false;
        this.isOpen = false;

        this.isActive = false;
        this.isLoading = false;
        this.isRunningGame = false;

        this.activeLocation = {};

        this.searchPaths = [];
        this.loadCallbacks = [];

        this.configScripts = [];
        this.loadedScripts = [];
    },

    start: function start() {
        var _this = this;

        var startOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.log("start", "startOptions: %j", startOptions);

        if (this.isActive) {
            this.log("Already started!");
            return;
        }

        this.isActive = true;
        this.startOptions = startOptions || this.startOptions;

        this.configScripts = [];
        this.loadedScripts = [];
        this.failedScripts = [];

        this.loadPaths();
        this.loadConfig(this.config.file, function (jsList) {

            _this.configScripts = jsList;
            _this.loadScripts(jsList, function (successFiles, errorFiles) {

                _this.failedScripts = errorFiles;
                _this.loadedScripts = successFiles;

                _this.startUpdate();
                _this.startListeners();

                if (_this.isPreload()) _this.loadNode();

                _this.onStarted && _this.onStarted(_this);
            });
        });
    },

    stop: function stop() {
        this.log("stop");

        if (!this.isActive) {
            this.log("Already stopped!");
            return;
        }

        this.isActive = false;

        this.clearNode();
        this.clearUpdate();
        this.clearListeners();

        this.loadPaths();
        this.clearResources();
        this.clearScripts();
        this.clearPaths();

        this.reset();

        this.onStopped && this.onStopped(this);
    },

    loadPaths: function loadPaths() {
        this.log("loadPaths");

        if (!this.config || !this.config.name || this.config.name === '') return;

        var rootPath = cc.path.join(FloaterConfig.MODULE_ROOT, this.config.name);
        if (portalManager.isEncrypted()) rootPath = portalHelper.getEncryptFileName(rootPath);

        if (portalManager.isTemplate()) rootPath = cc.path.join(FloaterConfig.COMMON_ROOT_LOCAL, rootPath);else rootPath = portalManager.getManifestPath(cc.path.join(FloaterConfig.COMMON_ROOT, rootPath));

        if (jsb.fileUtils.isDirectoryExist(rootPath)) {
            this.pushPaths(rootPath);
        } else {
            this.log("load", "Root not found:", rootPath);
        }
    },

    loadConfig: function loadConfig(file, callback) {
        var _this2 = this;

        this.log("loadConfig", "file:", file);

        if (typeof file === "function") {
            callback = file;
            file = null;
        }

        var loadCallback = function loadCallback(error, json) {
            if (error) {
                _this2.log("loadConfig", "Error loading script config: %j", error);
            } else {
                if (json && json.jsList) {
                    callback && callback(json.jsList);
                } else {
                    _this2.log("loadConfig", "Error parsing script config. Must contains 'jsList'.");
                }
            }
        };

        var fileName = file || FloaterConfig.DEFAULT_CONFIG_FILE;
        var isEncrypted = portalHelper.isEncrypted !== undefined ? portalHelper.isEncrypted() : portalManager.isEncrypted();
        if (isEncrypted) {
            fileName = portalHelper.getEncryptJsonFileName(fileName);
            var jsonData = portalHelper.getEncryptJsonFileContent !== undefined ? portalHelper.getEncryptJsonFileContent(fileName) : portalHelper.getEncryptJsonContent(fileName);
            try {
                var json = JSON.parse(jsonData);
                loadCallback(null, json);
            } catch (error) {
                loadCallback(error);
            }
        } else {
            fileName = jsb.fileUtils.fullPathForFilename(fileName);
            cc.loader.loadJson(fileName, loadCallback);
        }
    },

    loadScripts: function loadScripts(scripts) {
        var _this3 = this;

        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this.log("loadScripts", "scripts: %d files", scripts.length);

        var errorFiles = [];
        var successFiles = [];

        scripts.forEach(function (jsFile) {
            var succeed = portalHelper.loadScript !== undefined ? portalHelper.loadScript(jsFile) : portalManager.runScript(jsFile);
            if (!succeed) {
                var encryptJsFile = portalHelper.getEncryptFileName(jsFile);
                _this3.log("loadScripts", "Try to load js scripts (encrypted): %s", encryptJsFile);
                succeed = portalHelper.loadScript !== undefined ? portalHelper.loadScript(encryptJsFile) : portalManager.runScript(encryptJsFile);
                if (!succeed) {
                    errorFiles.push(jsFile);
                    _this3.log("loadScripts", "Load js scripts: '%s' failed", jsFile);
                } else {
                    successFiles.push(jsFile);
                }
            } else {
                successFiles.push(jsFile);
            }
        });

        this.log("loadScripts", "Loaded js scripts: " + successFiles.length + " successful, " + errorFiles.length + " failed.");
        callback && callback(successFiles, errorFiles);
    },

    clearScripts: function clearScripts() {
        this.log("clearScripts");

        this.loadedScripts.forEach(function (jsFile) {
            if (portalHelper.cleanScript !== undefined) portalHelper.cleanScript(jsFile);else portalManager.cleanScript(jsFile);
        });

        this.configScripts = [];
        this.loadedScripts = [];
    },

    pushPaths: function pushPaths(paths) {
        var _this4 = this;

        var searchPaths = jsb.fileUtils.getSearchPaths();

        var arr = typeof paths === 'string' ? [paths] : paths;
        arr.forEach(function (path) {
            if (_this4.searchPaths.indexOf(path) < 0) _this4.searchPaths.push(path);
            if (searchPaths.indexOf(path) < 0) searchPaths.unshift(path);
        });

        this.log("pushPaths", "paths: %j", arr);

        // debug only
        this.log("pushPaths", "searchPaths:");
        jsb.fileUtils.setSearchPaths(_.uniq(searchPaths));
        jsb.fileUtils.getSearchPaths().forEach(function (item) {
            _this4.log("--- " + item);
        });
    },

    clearPaths: function clearPaths() {
        var _this5 = this;

        this.log("clearPaths");

        var searchPaths = jsb.fileUtils.getSearchPaths();
        this.searchPaths.forEach(function (path) {
            searchPaths = searchPaths.filter(function (item) {
                return item.indexOf(path) < 0;
            });
        });

        // debug only
        this.log("clearPaths", "searchPaths:");
        jsb.fileUtils.setSearchPaths(searchPaths);
        jsb.fileUtils.getSearchPaths().forEach(function (item) {
            _this5.log("--- " + item);
        });
    },

    startUpdate: function startUpdate() {
        this.clearUpdate();
        if (!this.updateInterval) {
            this.updateInterval = setInterval(this.update.bind(this), this.UPDATE_INTERVAL);
        }
    },

    clearUpdate: function clearUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            delete this.updateInterval;
        }
    },

    createListener: function createListener(eventName, eventCallback, validator, identifier) {
        var _this6 = this;

        var validate = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

        this.log("createListener", "eventName:", eventName);

        this.listeners = this.listeners || {};
        if (this.listeners[eventName] !== undefined) {
            this.log("Listener for event [%s] already added!", eventName);
            return;
        }

        var callback = null;
        if (validate) {
            callback = function callback(data) {
                var eventData = data.getUserData();
                var targetName = identifier && cc.isFunction(identifier) ? identifier(eventData) : "";
                var isAllowed = validator && cc.isFunction(validator) ? validator(targetName) : false;
                if (isAllowed) {
                    eventCallback && eventCallback(eventData);
                } else {
                    _this6.log("Module [%s] is not allowed to run this floater!", targetName);
                }
            };
        } else {
            callback = function callback(data) {
                var eventData = data.getUserData();
                var targetName = identifier && cc.isFunction(identifier) ? identifier(eventData) : "";
                var isAllowed = validator && cc.isFunction(validator) ? validator(targetName) : false;
                if (!isAllowed) _this6.log("WARNING: Module [%s] is not allowed to run this floater!", targetName);
                eventCallback && eventCallback(eventData);
            };
        }

        this.listeners[eventName] = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: cc.formatStr("%s.%s", this.eventTagIncome, eventName),
            callback: callback
        });

        cc.eventManager.addListener(this.listeners[eventName], 999);
    },

    createMainListener: function createMainListener(eventName, eventCallback) {
        var validate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        this.createListener(eventName, eventCallback, this.isLocationAllowed.bind(this), function (data) {
            return data && data.location ? data.location : FloaterConfig.MAIN_LOCATION_UNKNOWN;
        }, validate);
    },

    createGameListener: function createGameListener(eventName, eventCallback) {
        var validate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        this.createListener(eventName, eventCallback, this.isActiveGameAllowed.bind(this), this.getActiveGame.bind(this), validate);
    },

    startListeners: function startListeners() {
        this.log("startListeners");

        this.createMainListener(portalHelper.EVENT_PORTAL_ENTER_LOCATION, this.onEventPortalEnterLocation.bind(this), false);
        this.createMainListener(portalHelper.EVENT_PORTAL_LEAVE_LOCATION, this.onEventPortalLeaveLocation.bind(this));

        this.createGameListener(portalHelper.EVENT_GAME_START, this.onEventGameStart.bind(this));
        this.createGameListener(portalHelper.EVENT_GAME_LOGIN, this.onEventGameLogin.bind(this));
        this.createGameListener(portalHelper.EVENT_GAME_EXIT, this.onEventGameExit.bind(this));

        this.createGameListener(portalHelper.EVENT_GAME_LOAD_BEGAN, this.onEventGameLoadBegan.bind(this));
        this.createGameListener(portalHelper.EVENT_GAME_LOAD_ENDED, this.onEventGameLoadEnded.bind(this));

        this.createGameListener(portalHelper.EVENT_GAME_ENTER_LOBBY, this.onEventGameEnterLobby.bind(this), false);
        this.createGameListener(portalHelper.EVENT_GAME_LEAVE_LOBBY, this.onEventGameLeaveLobby.bind(this));

        this.createGameListener(portalHelper.EVENT_GAME_ENTER_ROOM, this.onEventGameEnterRoom.bind(this), false);
        this.createGameListener(portalHelper.EVENT_GAME_LEAVE_ROOM, this.onEventGameLeaveRoom.bind(this));

        this.createGameListener(portalHelper.EVENT_GAME_DATA_CHANGED, this.onEventGameDataChanged.bind(this));
        this.createGameListener(portalHelper.EVENT_GAME_MATCH_CHANGED, this.onEventGameMatchChanged.bind(this));
    },

    clearListeners: function clearListeners() {
        this.log("clearListeners");

        this.listeners = this.listeners || {};
        for (var eventName in this.listeners) {
            cc.eventManager.removeListener(this.listeners[eventName]);
            delete this.listeners[eventName];
        }
    },

    loadNode: function loadNode() {
        var _this7 = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this.log("loadNode", "options: %j", options);

        if (this.isLoaded()) {
            this.log("loadNode", "Node is already loaded!");
            callback && callback();
            return;
        }

        if (callback) this.loadCallbacks.push(callback);

        if (this.isLoading) {
            // another loading is runing, queue callback
            return;
        }

        this.startOptions = options || this.startOptions;

        // search paths might be cleared when a game start,
        // so we need to add it again everytime load node.
        this.loadPaths();
        this.loadResources(function () {

            _this7.isLoading = false;

            var dispatch = function dispatch(error) {
                _this7.loadCallbacks.forEach(function (func) {
                    return func(error);
                });
                _this7.loadCallbacks.splice(0, _this7.loadCallbacks.length);
            };

            if (!_this7.model) {
                _this7.log("loadNode", "Node model is invalid!");
                dispatch(new Error("Node model is invalid!"));
            }

            _this7.node = new _this7.model(_this7.startOptions);
            _this7.node.setVisible(false);
            _this7.node.retain();

            dispatch();
        });

        this.isLoading = true;
    },

    attachNode: function attachNode(owner) {
        this.log("attachNode");

        if (!this.isLoaded()) {
            this.log("attachNode", "Node is not loaded!");
            return false;
        }

        if (!owner || !cc.sys.isObjectValid(owner)) owner = cc.director.getRunningScene();

        if (!owner || !cc.sys.isObjectValid(owner)) {
            this.log("attachNode", "Owner is not valid!");
            return false;
        }

        if (this.node.parent === owner) {
            this.log("attachNode", "Already added to this owner!");
            return true;
        }

        var parent = owner;
        if (parent instanceof cc.Scene) {
            var children = parent.getChildren();
            if (children.length > 0) {
                if (this.config.ownerName && this.config.ownerName !== '') {
                    for (var i = 0; i < children.length; i++) {
                        if (children[i].name === this.config.ownerName) {
                            parent = children[i];
                            break;
                        }
                    }
                } else {
                    parent = children[children.length - 1];
                }
            }
        }

        if (parent) {
            this.log("attachNode", "parent:", parent.name || parent.LOGTAG || "");
            NodeUtils.switchParent(this.node, parent, this.config.ownerZOrder || FloaterConfig.ACTION_TAG);
        }

        return this.isAttached();
    },

    clearNode: function clearNode() {
        this.log("clearNode");

        if (this.node && cc.sys.isObjectValid(this.node)) {
            this.node.removeFromParent();
            this.node.release();
        }

        this.node = null;
    },

    loadResources: function loadResources() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.onLoad && this.onLoad(this, callback);
    },

    clearResources: function clearResources() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.onUnload && this.onUnload(callback);
    },

    show: function show(owner) {
        var _this8 = this;

        var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        this.log("show", "isOpen:", this.isOpen, "isBusy:", this.isBusy);

        if (typeof delay === 'boolean') {
            force = delay;
            delay = 0;
        }

        if (this.isBusy) return;

        if (!force && this.isOpen) return;

        this.isBusy = true;

        if (!this.isLoaded()) {
            this.loadNode(null, function (error) {
                _this8.isBusy = false;
                if (!error) _this8.show(owner, delay);
            });
        }

        if (!this.attachNode(owner)) return;

        // reload paths for dynamic loading resources used in module
        // search paths may be cleared by others
        this.loadPaths();

        var action = cc.sequence(cc.delayTime(delay), cc.show(), cc.fadeIn(this.SHOW_EFFECT_TIME), cc.callFunc(this.onShow.bind(this)));
        action.setTag(this.ACTION_TAG);

        this.node.setOpacity(0);
        this.node.setVisible(false);

        this.node.stopActionByTag(this.ACTION_TAG);
        this.node.runAction(action);
    },

    hide: function hide() {
        var instant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        this.log("hide", "isOpen:", this.isOpen, "isBusy:", this.isBusy);

        if (typeof delay === 'boolean') {
            force = delay;
            delay = 0;
        }

        if (this.isBusy) return;

        if (!force && !this.isOpen) return;

        if (!this.isLoaded() || !this.isAttached()) return;

        if (instant === true) {
            this.node.setVisible(false);
            this.onHide();
        } else {

            var action = cc.sequence(cc.delayTime(delay), cc.fadeOut(this.HIDE_EFFECT_TIME), cc.hide(), cc.callFunc(this.onHide.bind(this)));
            action.setTag(this.ACTION_TAG);

            this.isBusy = true;

            this.node.setOpacity(255);
            this.node.setVisible(true);

            this.node.stopActionByTag(this.ACTION_TAG);
            this.node.runAction(action);
        }
    },

    update: function update() {

        if (this.isLocationAllowed(FloaterConfig.MAIN_LOCATION_LOBBY)) this.checkLocationLobby();

        if (this.isLocationAllowed(FloaterConfig.MAIN_LOCATION_FISHING)) this.checkLocationFishing();
    },

    checkLocation: function checkLocation(locationName, nodeName, getOwnerFunc) {

        var runningScene = cc.director.getRunningScene();
        if (!runningScene) return;

        var targetNode = NodeUtils.findChildByName(runningScene, nodeName);
        if (targetNode) {
            // this.log("INSIDE LOCATION [%s]", locationName);
            if (!this.isLocationActive(locationName)) {
                this.toggleLocationActive(locationName, true);
                this.log("Enter location ->", locationName);
                if (portalHelper.notifyMain) {
                    var ownerNode = getOwnerFunc(targetNode) || runningScene;
                    portalHelper.notifyMain(portalHelper.EVENT_PORTAL_ENTER_LOCATION, { sender: ownerNode, location: locationName });
                }
            }
        } else {
            // this.log("OUTSIDE LOCATION [%s]", locationName);
            if (this.isLocationActive(locationName)) {
                this.toggleLocationActive(locationName, false);
                this.log("Leaving location ->", locationName);
                if (portalHelper.notifyMain) portalHelper.notifyMain(portalHelper.EVENT_PORTAL_LEAVE_LOCATION, { sender: runningScene, location: locationName });
            }
        }
    },

    checkLocationLobby: function checkLocationLobby() {
        this.checkLocation(FloaterConfig.MAIN_LOCATION_LOBBY, "pnlMid", function (targetNode) {
            var mainNode = targetNode.getParent();
            return mainNode ? mainNode.getParent() : null;
        });
    },

    checkLocationFishing: function checkLocationFishing() {
        this.checkLocation(FloaterConfig.MAIN_LOCATION_FISHING, "Panel_Table", function (targetNode) {
            var panelRoot = targetNode.getParent();
            return panelRoot ? panelRoot.getParent() : null;
        });
    },

    notifyMain: function notifyMain(event, data) {
        var location = data.location || "";
        if (this.isLocationAllowed(location)) {
            cc.eventManager.dispatchCustomEvent(this.getEventName(event), data);
        } else {
            this.log("Portal life cycle events is not support for location [%s]", location);
        }
    },

    notifyGame: function notifyGame(event, data) {
        if (this.isActiveGameAllowed()) {
            cc.eventManager.dispatchCustomEvent(this.getEventName(event), data);
        } else {
            this.log("Game life cycle events is not support for game [%s]", this.getActiveGame());
        }
    },

    onShow: function onShow() {

        this.isBusy = false;
        this.isOpen = true;

        this.onShown && this.onShown(this);
    },

    onHide: function onHide() {

        this.isBusy = false;
        this.isOpen = false;

        this.onHidden && this.onHidden(this);
    },

    // portal events

    onEventPortalEnterLocation: function onEventPortalEnterLocation(data) {
        this.log("onEventPortalEnterLocation");
        this.notifyMain(FloaterManager.Events.ON_PORTAL_LOCATION_ENTER, data);
    },

    onEventPortalLeaveLocation: function onEventPortalLeaveLocation(data) {
        this.log("onEventPortalLeaveLocation");
        this.notifyMain(FloaterManager.Events.ON_PORTAL_LOCATION_LEAVE, data);
    },

    // game events

    onEventGameLogin: function onEventGameLogin(data) {
        this.log("onEventGameLogin");
    },

    onEventGameStart: function onEventGameStart(data) {
        this.log("onEventGameStart");
    },

    onEventGameLoadBegan: function onEventGameLoadBegan(data) {
        this.log("onEventGameLoadBegan");
    },

    onEventGameLoadEnded: function onEventGameLoadEnded(data) {
        this.log("onEventGameLoadEnded");
    },

    onEventGameEnterLobby: function onEventGameEnterLobby(data) {
        this.log("onEventGameEnterLobby");
        this.notifyGame(FloaterManager.Events.ON_GAME_LOBBY_ENTER, _.assign(data, { activeGame: this.getActiveGame() }));
    },

    onEventGameLeaveLobby: function onEventGameLeaveLobby(data) {
        this.log("onEventGameLeaveLobby");
        this.notifyGame(FloaterManager.Events.ON_GAME_LOBBY_LEAVE, _.assign(data, { activeGame: this.getActiveGame() }));
    },

    onEventGameEnterRoom: function onEventGameEnterRoom(data) {
        this.log("onEventGameEnterRoom");
        this.notifyGame(FloaterManager.Events.ON_GAME_ROOM_ENTER, _.assign(data, { activeGame: this.getActiveGame() }));
    },

    onEventGameLeaveRoom: function onEventGameLeaveRoom(data) {
        this.log("onEventGameLeaveRoom");
        this.notifyGame(FloaterManager.Events.ON_GAME_ROOM_LEAVE, _.assign(data, { activeGame: this.getActiveGame() }));
    },

    onEventGameDataChanged: function onEventGameDataChanged(data) {
        this.log("onEventGameDataChanged");
        this.notifyGame(FloaterManager.Events.ON_GAME_DATA_CHANGED, _.assign(data, { activeGame: this.getActiveGame() }));
    },

    onEventGameMatchChanged: function onEventGameMatchChanged(data) {
        this.log("onEventGameMatchChanged");
        this.notifyGame(FloaterManager.Events.ON_GAME_MATCH_CHANGED, _.assign(data, { activeGame: this.getActiveGame() }));
    },

    onEventGameExit: function onEventGameExit(data) {
        this.log("onEventGameExit");
        this.notifyGame(FloaterManager.Events.ON_GAME_EXIT, _.assign(data, { activeGame: this.getActiveGame() }));
    }
});

FloaterManager.Events = {

    ON_PORTAL_LOCATION_ENTER: 0,
    ON_PORTAL_LOCATION_LEAVE: 1,

    ON_GAME_LOBBY_ENTER: 2,
    ON_GAME_LOBBY_LEAVE: 3,

    ON_GAME_ROOM_ENTER: 4,
    ON_GAME_ROOM_LEAVE: 5,

    ON_GAME_DATA_CHANGED: 6,
    ON_GAME_MATCH_CHANGED: 7,

    ON_GAME_EXIT: 8
};