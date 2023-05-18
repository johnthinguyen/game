"use strict";

var portalHelper = PortalHelper.getInstance();

// Windows only (template)
// Override data getting functions for login online in template mode
if (cc.sys.os === cc.sys.OS_WINDOWS && portalManager !== undefined && portalManager.isTemplate !== undefined && portalManager.isTemplate()) {

    PortalHelper.prototype.getUserId = function () {
        var value = cc.sys.localStorage.getItem(portalHelper.DATA_KEY_PORTAL_USER_ID);
        return value ? parseInt(value) : 0;
    };

    PortalHelper.prototype.getUserName = function () {
        return cc.sys.localStorage.getItem(portalHelper.DATA_KEY_PORTAL_USER_NAME) || "";
    };

    PortalHelper.prototype.getUserPass = function () {
        return cc.sys.localStorage.getItem(portalHelper.DATA_KEY_PORTAL_USER_PASS) || "";
    };

    PortalHelper.prototype.getUserToken = function () {
        return cc.sys.localStorage.getItem(portalHelper.DATA_KEY_PORTAL_USER_TOKEN) || "";
    };

    PortalHelper.prototype.getDeviceId = function () {
        return "c822c1b63853ed273b89687ac505f9fa";
    };
}

if (!portalManager.isEncrypted()) {

    PortalHelper.setUserId = function (value) {
        cc.sys.localStorage.setItem(portalHelper.DATA_KEY_PORTAL_USER_ID, value);
    };

    PortalHelper.setUserName = function (value) {
        cc.sys.localStorage.setItem(portalHelper.DATA_KEY_PORTAL_USER_NAME, value);
    };

    PortalHelper.setUserPass = function (value) {
        cc.sys.localStorage.setItem(portalHelper.DATA_KEY_PORTAL_USER_PASS, value);
    };

    PortalHelper.setUserToken = function (value) {
        cc.sys.localStorage.setItem(portalHelper.DATA_KEY_PORTAL_USER_TOKEN, value);
    };

    PortalHelper.getUserPassHash = function () {
        return CryptoUtils.encryptPass(portalHelper.getUserPass());
    };
}