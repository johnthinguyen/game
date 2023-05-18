'use strict';

/**
 * @class PortalHelper
 */

var PortalHelper = {

    /**
     * @returns {object}
     */
    getInstance: function getInstance() {
        return this;
    },

    /**
     * @returns {number}
     */
    getAppId: function getAppId() {
        return '';
    },

    /**
     * @returns {number}
     */
    getChannelId: function getChannelId() {
        return '';
    },

    /**
     * @returns {number}
     */
    getPlatformId: function getPlatformId() {
        return '';
    },

    /**
     * @returns {number}
     */
    getUserId: function getUserId() {
        return WebHelper.userID;
    },

    /**
     * @returns {string}
     */
    getUserName: function getUserName() {
        return WebHelper.userName;
    },

    /**
     * @returns {string}
     */
    getUserAvatar: function getUserAvatar() {
        return '';
    },

    /**
     * @returns {string}
     */
    getUserDisplayName: function getUserDisplayName() {
        return '';
    },

    /**
     * @returns {string}
     */
    getUserPass: function getUserPass() {
        return WebHelper.userPass;
    },

    /**
     * @returns {string}
     */
    getUserToken: function getUserToken() {
        return '';
    },

    /**
     * @returns {number}
     */
    getUserCoin: function getUserCoin() {
        return '';
    },

    /**
     * @returns {number}
     */
    getUserLevel: function getUserLevel() {
        return '';
    },

    /**
     * @returns {string}
     */
    getDeviceId: function getDeviceId() {
        return '';
    },

    /**
     * @returns {string}
     */
    getBundleId: function getBundleId() {
        return '';
    },

    /**
     * @returns {string}
     */
    getAndroidId: function getAndroidId() {
        return '';
    },

    /**
     * @returns {string}
     */
    getWifiMacAddr: function getWifiMacAddr() {
        return '';
    },

    /**
     * @returns {string}
     */
    getLocalIpAddr: function getLocalIpAddr() {
        return '';
    },

    /**
     * @returns {string}
     */
    getDeviceModel: function getDeviceModel() {
        return '';
    },

    /**
     * @returns {string}
     */
    getDeviceOSVersion: function getDeviceOSVersion() {
        return '';
    },

    /**
     * @returns {number}
     */
    getVersionCode: function getVersionCode() {
        return '';
    },

    /**
     * @returns {string}
     */
    getVersionName: function getVersionName() {
        return '';
    },

    /**
     * @returns {string}
     */
    getVersionGame: function getVersionGame() {
        return '';
    },

    /**
     * @returns {string}
     */
    getLanguageStr: function getLanguageStr() {
        var name = "lang=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return 'en';
    },

    getLanguageType: function getLanguageType() {
        var LANG = {
            VI: 0,
            CAM: 1,
            CHINA: 2,
            MALAY: 3,
            THAI: 4,
            EN: 5,
            MY: 6,
            PH: 7
        };
        var keyLang = this.getLanguageStr();
        switch (keyLang) {
            case "my":
                return LANG.MY;
            case "km":
                return LANG.CAM;
            case "en":
                return LANG.EN;
            case "vi":
                return LANG.VI;
            case "th":
                return LANG.THAI;
            case "zh":
                return LANG.CHINA;
            case "ph":
                return LANG.PH;
            default:
                return LANG.EN;
        }
    },

    /**
     * @returns {string}
     */
    getWSAPI: function getWSAPI() {
        return '';
    },

    /**
     * @returns {string}
     */
    getWSAdsAPI: function getWSAdsAPI() {
        return '';
    },

    /**
     * @returns {string}
     */
    getWSAdsKey: function getWSAdsKey() {
        return '';
    },

    /**
     * @returns {string}
     */
    getWSHostName: function getWSHostName() {
        return '';
    },

    /**
     * @returns {string}
     */
    getWSHostPort: function getWSHostPort() {
        return '';
    },

    /**
     * @returns {string}
     */
    getEncryptDataKey: function getEncryptDataKey() {
        return '';
    },

    /**
     * @returns {string}
     */
    getEncryptNameKey: function getEncryptNameKey() {
        return '';
    },

    /**
     * @param {string} path
     * @returns {string}
     */
    getEncryptFileName: function getEncryptFileName(path) {
        return path;
    },

    /**
     * @param {string} path
     * @returns {string}
     */
    getEncryptJsonFileName: function getEncryptJsonFileName(path) {
        return path;
    },

    /**
     * @param {string} path
     * @returns {string}
     */
    getEncryptJsonFileContent: function getEncryptJsonFileContent(path) {
        return path;
    },

    /**
     * @param {number} location
     */
    returnLobbyScene: function returnLobbyScene(location) {
        return undefined;
    },

    /**
     * @param {number} location
     */
    returnLobbySceneDisconnect: function returnLobbySceneDisconnect(location) {
        return undefined;
    },

    /**
     * @returns {string}
     */
    getUserAdId: function getUserAdId() {
        return '';
    },

    /**
     * @returns {string}
     */
    getPushToken: function getPushToken() {
        return '';
    },

    /**
     * @returns {string}
     */
    getSimCountry: function getSimCountry() {
        return '';
    },

    /**
     * @returns {boolean}
     */
    isEmulator: function isEmulator() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isAllowCountry: function isAllowCountry() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isPhoneInVietnam: function isPhoneInVietnam() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isInternetConnected: function isInternetConnected() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isHavePhonePermission: function isHavePhonePermission() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isHaveWriteExternalStorage: function isHaveWriteExternalStorage() {
        return false;
    },

    /**
     * @returns {*}
     */
    requestPhonePermission: function requestPhonePermission() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    requestWriteExternalStorage: function requestWriteExternalStorage() {
        return undefined;
    },

    /**
     *
     * @param {string} number
     * @param {string}  message
     */
    sendSMS: function sendSMS(number, message) {
        return undefined;
    },

    /**
     * @param {string} text
     */
    copyTextToClipboard: function copyTextToClipboard(text) {
        return undefined;
    },

    /**
     * @param {string} link
     */
    shareFacebookLink: function shareFacebookLink(link) {
        return undefined;
    },

    /**
     * @param {string} message
     */
    showFacebookMessage: function showFacebookMessage(message) {
        return undefined;
    },

    /**
     * @param {string} message
     */
    showToast: function showToast(message) {
        return undefined;
    },

    /**
     * @returns {*}
     */
    showRate: function showRate() {
        return undefined;
    },

    /**
     * @returns {boolean}
     */
    isFBTracking: function isFBTracking() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isGGTracking: function isGGTracking() {
        return false;
    },

    /**
     * @param {boolean} value
     * @returns {*}
     */
    setTrackingFB: function setTrackingFB(value) {
        return undefined;
    },

    /**
     * @param {boolean} value
     * @returns {*}
     */
    setTrackingGG: function setTrackingGG(value) {
        return undefined;
    },

    /**
     * @returns {boolean}
     */
    isPackageInstalled: function isPackageInstalled() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isFacebookInstalled: function isFacebookInstalled() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isFacebookMessengerInstalled: function isFacebookMessengerInstalled() {
        return false;
    },

    /**
     * @param {string} eventName
     * @param {string} paramName
     * @param {string} paramStringVal
     * @param {number} paramFloatVal
     * @param {number} valueToSum
     * @param {boolean} isGG
     * @param {boolean} isFB
     */
    trackingEventOneParam: function trackingEventOneParam(eventName, paramName, paramStringVal, paramFloatVal, valueToSum, isG, isFB) {
        return undefined;
    },

    /**
     * @param {string} eventName
     * @param {string} paramStrName
     * @param {string} paramFlName
     * @param {string} valStr
     * @param {number} valFl
     * @param {number} valToSum
     * @param {boolean} isGG
     * @param {boolean} isFB
     */
    trackingEventTwoParam: function trackingEventTwoParam(eventName, paramStrName, paramFlName, valStr, valFl, valToSum, isGG, isFB) {
        return undefined;
    },

    /**
     * @param {string} eventName
     * @param {number} valAmount
     * @param {string} valCurrency
     * @param {number} valueToSum
     */
    trackingEventDepositPurchase: function trackingEventDepositPurchase(eventName, valAmount, valCurrency, valueToSum) {
        return undefined;
    },

    /**
     * @param {string} eventName
     * @param {string} productName
     * @param {number} price
     * @param {string} productId
     * @param {number} quantity
     * @param {string} currency
     */
    trackingEventIAP: function trackingEventIAP(eventName, productName, price, productId, quantity, currency) {
        return undefined;
    },

    /**
     * @param {number} level
     * @param {number} score
     */
    gmmSetHighScore: function gmmSetHighScore(level, score) {
        return undefined;
    },

    /**
     * @returns {*}
     */
    gmmShowHighBoard: function gmmShowHighBoard() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    gmmShowAchievement: function gmmShowAchievement() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    gmmShowBuyStopAds: function gmmShowBuyStopAds() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    gmmInitAds: function gmmInitAds() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    gmmLoadInterAds: function gmmLoadInterAds() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    gmmShowInterAds: function gmmShowInterAds() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    gmmExitApp: function gmmExitApp() {
        return undefined;
    },

    /**
     * @param {boolean} value
     * @returns {*}
     */
    setUserId: function setUserId(value) {
        return undefined;
    },

    /**
     * @param {boolean} value
     * @returns {*}
     */
    setUserName: function setUserName(value) {
        return undefined;
    },

    /**
     * @param {boolean} value
     * @returns {*}
     */
    setUserPass: function setUserPass(value) {
        return undefined;
    },

    /**
     * @param {boolean} value
     * @returns {*}
     */
    setUserToken: function setUserToken(value) {
        return undefined;
    },

    /**
     * @returns {number}
     */
    getUserPassHash: function getUserPassHash() {
        return '';
    }
};
