"use strict";

var KingBeta = {

    isRemote: false,
    proxyServer: "",

    LOCAL_SERVER: "192.168.1.135",
    LOCAL_VPN_SERVER: "vnx30.hoanglinhonline.com",

    REVERSE_PROXY_SERVER: "http://cms.nagafun.vip",
    REVERSE_PROXY_SERVER_QUERY: "/ngrok",

    PORT_PREFIX: {
        0: "61",
        1: "61",
        2: "62"
    },

    setRemote: function setRemote(value) {
        KingBeta.isRemote = value;
    },

    getRemote: function getRemote() {
        return KingBeta.isRemote;
    },

    getServerProxy: function getServerProxy() {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        var onCompleted = function onCompleted(data, request) {
            if (data && data.url && data.url !== '') {
                callback && callback(null, data.url);
            } else {
                callback && callback(new Error("Proxy server is not available!"));
            }
        };

        var onFailed = function onFailed(error) {
            callback && callback(error);
        };

        HttpRequest.load(KingBeta.REVERSE_PROXY_SERVER, KingBeta.REVERSE_PROXY_SERVER_QUERY, HttpRequest.METHOD.GET, [], onCompleted, onFailed, onFailed);
    },

    getServerConfig: function getServerConfig(gameId) {
        var socketType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : KingSocketType.WS;
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var config = {
            host: KingBeta.LOCAL_SERVER,
            port: parseInt(KingBeta.PORT_PREFIX[socketType] + (gameId < 100 ? '0' : '') + gameId)
        };

        if (KingBeta.isRemote) {
            KingBeta.getServerProxy(function (error, url) {
                if (error) {
                    callback && callback(error);
                } else {
                    KingBeta.proxyServer = url || '';
                    callback && callback(null, {
                        host: KingBeta.proxyServer + "/" + gameId,
                        port: null
                    });
                }
            });
        } else {
            callback && callback(null, config);
        }
    },

    getServerConfigVPN: function getServerConfigVPN(gameId) {
        var socketType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : KingSocketType.WS;
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var config = {
            host: KingBeta.LOCAL_VPN_SERVER,
            port: parseInt(KingBeta.PORT_PREFIX[socketType] + (gameId < 100 ? '0' : '') + gameId)
        };

        callback && callback(null, config);
    },

    getServerConfigWithUri: function getServerConfigWithUri(uri) {
        var socketType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : KingSocketType.WS;
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var config = {
            host: "",
            port: null
        };

        if (KingBeta.isRemote) {
            KingBeta.getServerProxy(function (error, url) {
                if (error) {
                    callback && callback(error);
                } else {
                    KingBeta.proxyServer = url || '';
                    callback && callback(null, {
                        host: KingBeta.proxyServer + uri,
                        port: null
                    });
                }
            });
        } else {
            callback && callback(null, config);
        }
    }
};