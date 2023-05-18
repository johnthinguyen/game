"use strict";

var portalHelper = PortalHelper.getInstance();

portalHelper.clearJsonKeys = function () {
    cc.log(this.LOGTAG, "clearJsonKeys");
    if (KingJsonKeys !== undefined && BaseJsonKeys !== undefined) {
        KingJsonKeys = _.clone(BaseJsonKeys);
    }
};

portalHelper.initPortalSearchPaths = function () {
    var _this = this;

    cc.log(this.LOGTAG, "initPortalSearchPaths", "gamePath:", portalHelper.getGamePath());

    var paths = jsb.fileUtils.getSearchPaths();
    paths.push(portalHelper.getGamePath());
    jsb.fileUtils.setSearchPaths(_.uniq(paths));

    cc.log(this.LOGTAG, "searchPaths:");
    jsb.fileUtils.getSearchPaths().forEach(function (item) {
        cc.log(_this.LOGTAG, "--- " + item);
    });
};

portalHelper.initConfig = function (file, callback) {
    var _this2 = this;

    if (typeof file === "function") {
        callback = file;
        file = null;
    }
    var fileName = file || "scripts.json";
    var isEncrypted = portalHelper.isEncrypted !== undefined ? portalHelper.isEncrypted() : portalManager.isEncrypted();
    if (isEncrypted) {
        fileName = portalHelper.getEncryptJsonFileName(fileName);
        var jsonData = portalHelper.getEncryptJsonFileContent !== undefined ? portalHelper.getEncryptJsonFileContent(fileName) : portalHelper.getEncryptJsonContent(fileName);
        try {
            var json = JSON.parse(jsonData);
            if (json && json.jsList) {
                callback && callback(json.jsList);
            } else {
                cc.log(this.LOGTAG, "Error parsing script config. Must contains 'jsList'.");
            }
        } catch (error) {
            cc.log(this.LOGTAG, "Error loading script config: %j", error);
        }
    } else {
        fileName = jsb.fileUtils.fullPathForFilename(fileName);
        cc.loader.loadJson(fileName, function (error, json) {
            if (error) {
                cc.log(_this2.LOGTAG, "Error loading script config");
            } else {
                if (json.jsList) {
                    callback && callback(json.jsList);
                } else {
                    cc.log(_this2.LOGTAG, "Error parsing script config. Must contains 'jsList'.");
                }
            }
        });
    }
};

portalHelper.gameName = null;
portalHelper.initGame = function (gameName) {
    var _this3 = this;

    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    portalHelper.gameName = gameName;

    portalHelper.gameScripts = [];
    portalHelper.gameLoadedScripts = [];

    portalHelper.clearJsonKeys();
    portalHelper.clearGameSession();

    portalHelper.initPortalSearchPaths();
    portalHelper.initConfig(function (jsList) {

        portalHelper.gameScripts = jsList;

        var errorFiles = [];
        jsList.forEach(function (jsFile) {
            var succeed = portalHelper.loadScript !== undefined ? portalHelper.loadScript(jsFile) : portalManager.runScript(jsFile);
            if (!succeed) {
                var encryptJsFile = portalHelper.getEncryptFileName(jsFile);
                cc.log(_this3.LOGTAG, "Try to load js scripts (encrypted): %s", encryptJsFile);
                succeed = portalHelper.loadScript !== undefined ? portalHelper.loadScript(encryptJsFile) : portalManager.runScript(encryptJsFile);
                if (!succeed) {
                    errorFiles.push(jsFile);
                    cc.log(_this3.LOGTAG, "Load js scripts: '%s' failed", jsFile);
                } else {
                    portalHelper.gameLoadedScripts.push(jsFile);
                }
            } else {
                portalHelper.gameLoadedScripts.push(jsFile);
            }
        });

        cc.log(_this3.LOGTAG, "Loaded js scripts: " + (jsList.length - errorFiles.length) + " successful, " + errorFiles.length + " failed.");
        callback && callback(errorFiles);

        if (portalHelper.notifyGame) portalHelper.notifyGame(portalHelper.EVENT_GAME_START);
    });

    if (cc.sys.os === cc.sys.OS_WINDOWS) {
        portalHelper.startBaseWatchers();
        portalHelper.startGameWatcher(gameName, portalHelper.getGamePath());
    }
};

// This is used for internal js games, which is shipped with app package
portalHelper.initInternalGame = function () {
    var _this4 = this;

    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    cc.log(this.LOGTAG, "initInternalGame");

    portalHelper.gameScripts = [];
    portalHelper.gameLoadedScripts = [];

    portalHelper.initPortalSearchPaths();
    portalHelper.initConfig("GMMScripts.json", function (jsList) {

        portalHelper.gameScripts = jsList;

        var errorFiles = [];
        jsList.forEach(function (jsFile) {
            var succeed = portalHelper.loadScript !== undefined ? portalHelper.loadScript(jsFile) : portalManager.runScript(jsFile);
            if (!succeed) {
                var encryptJsFile = portalHelper.getEncryptFileName(jsFile);
                cc.log(_this4.LOGTAG, "Try to load js scripts (encrypted): %s", encryptJsFile);
                succeed = portalHelper.loadScript !== undefined ? portalHelper.loadScript(encryptJsFile) : portalManager.runScript(encryptJsFile);
                if (!succeed) {
                    errorFiles.push(jsFile);
                    cc.log(_this4.LOGTAG, "Load js scripts: '%s' failed", jsFile);
                } else {
                    portalHelper.gameLoadedScripts.push(jsFile);
                }
            } else {
                portalHelper.gameLoadedScripts.push(jsFile);
            }
        });

        cc.log(_this4.LOGTAG, "Loaded js scripts: " + (jsList.length - errorFiles.length) + " successful, " + errorFiles.length + " failed.");
        callback && callback(errorFiles);
    });
};

portalHelper.getGamePath = function () {
    var rootPath = portalHelper.getPortalRootPath !== undefined ? portalHelper.getPortalRootPath() : portalManager.getRootPortalPath();
    return cc.path.join(rootPath, portalManager.isTemplate() ? "" : portalHelper.gameName);
};

portalHelper.runGameScene = function (gameScene) {
    if (gameScene) {
        if (gameScene instanceof cc.Layer || gameScene instanceof cc.Scene) {
            if (gameScene instanceof cc.Layer) {
                var scene = new cc.Scene();
                scene.addChild(gameScene);
                gameScene = scene;
            }
            cc.director.runScene(gameScene);
        } else {
            cc.log(this.LOGTAG, "Game layer must be Layer or Scene");
        }
    } else {
        cc.log(this.LOGTAG, "Game layer is null");
    }
};

portalHelper.runDebugScene = function (sceneCreator) {
    if (sceneCreator) {
        cc.director.runScene(new cc.TransitionFade(0.2, new DebugScene(sceneCreator)));
    }
};

portalHelper.createScene = function (layer) {
    var scene = new cc.Scene();
    scene.addChild(layer);
    return scene;
};