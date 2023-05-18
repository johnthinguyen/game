"use strict";

var KingLogger = cc.Class.extend({
    LOGTAG: "[KingLogger]",
    MAX_LOG: 100,

    ctor: function ctor() {
        this.logs = [];
        this.path = cc.path.join(jsb.fileUtils.getWritablePath(), "logs.log");
    },

    log: function log() {

        this.logs = this.logs || [];
        this.logs.push(cc.formatStr.apply(null, arguments));
        if (this.logs.length > this.MAX_LOG) this.logs.splice(0, this.logs.length - this.MAX_LOG);

        jsb.fileUtils.writeStringToFile(this.logs.join('\n'), this.path);
    },

    load: function load() {
        var _this = this;

        if (jsb.fileUtils.isFileExist(this.path)) {
            this.clear();
            var content = jsb.fileUtils.getStringFromFile(this.path);
            var lines = content.split('\n');
            lines.forEach(function (line) {
                _this.logs.push(line);
            });
        }
    },

    clear: function clear() {
        this.logs.splice(0, this.logs.length);
    },

    copyToClipboard: function copyToClipboard() {
        if (portalHelper && portalHelper.copyTextToClipboard) portalHelper.copyTextToClipboard(this.logs.join('\n'));
    }
});

KingLogger.instance = null;
KingLogger.getInstance = function () {
    if (!KingLogger.instance) KingLogger.instance = new KingLogger();
    return KingLogger.instance;
};

KingLogger.destroyInstance = function () {
    if (KingLogger.instance) delete KingLogger.instance;
    KingLogger.instance = null;
};

var KingLog = KingLogger.getInstance();