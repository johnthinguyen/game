"use strict";

/**
 * @class PortalManager
 */

var PortalManager = {

    /**
     * @returns {*}
     */
    getInstance: function getInstance() {
        return this;
    },

    /**
     * @returns {boolean}
     */
    isGameMapError: function isGameMapError() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isGameMapLoaded: function isGameMapLoaded() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isGameMapUpdated: function isGameMapUpdated() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isGameListLoaded: function isGameListLoaded() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isCommonError: function isCommonError() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isCommonLoaded: function isCommonLoaded() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isCommonUpdated: function isCommonUpdated() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isRunning: function isRunning() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isLogging: function isLogging() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isDevelop: function isDevelop() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isTemplate: function isTemplate() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isEncrypted: function isEncrypted() {
        return false;
    },

    isInitialized: function isInitialized() {
        return false;
    },

    /**
     * @returns {boolean}
     */
    isGameAvailable: function isGameAvailable(number) {
        return false;
    },

    /**
     * @returns {string}
     */
    getVersion: function getVersion() {
        return string;
    },

    /**
     * @param {number} eventCode
     * @returns {string}
     */
    getEventString: function getEventString(eventCode) {
        return string;
    },

    /**
     * @param {number} gameId
     * @returns {string}
     */
    getGamePath: function getGamePath(gameId) {
        return string;
    },

    /**
     * @param {number} gameId
     * @returns {string}
     */
    getGameVersion: function getGameVersion(gameId) {
        return string;
    },

    /**
     * @returns {string}
     */
    getRootPath: function getRootPath() {
        return string;
    },

    /**
     * @returns {string}
     */
    getRootPortalPath: function getRootPortalPath() {
        return string;
    },

    /**
     * @param {string} file
     * @returns {string}
     */
    getManifestPath: function getManifestPath(file) {
        return string;
    },

    /**
     * @param {string} url
     * @returns {string}
     */
    getHostFromUrl: function getHostFromUrl(url) {
        return string;
    },

    /**
     * @param {string} url
     * @param {string} host
     * @returns {string}
     */
    replaceHostUrl: function replaceHostUrl(url, host) {
        return string;
    },

    /**
     * @returns {string}
     */
    getManifestHost: function getManifestHost() {
        return string;
    },

    /**
     * @returns {string}
     */
    getMainManifestUrl: function getMainManifestUrl() {
        return string;
    },

    /**
     * @returns {string}
     */
    getCommonManifestUrl: function getCommonManifestUrl() {
        return string;
    },

    /**
     * @returns {string}
     */
    getAssetsManifestUrl: function getAssetsManifestUrl() {
        return string;
    },

    /**
     * @returns {string}
     */
    getBuildVersion: function getBuildVersion() {
        return string;
    },

    /**
     * @returns {string}
     */
    getContentVersion: function getContentVersion() {
        return string;
    },

    /**
     * @returns {string}
     */
    getServerDevelop: function getServerDevelop() {
        return string;
    },

    /**
     * @returns {string}
     */
    getServerSandbox: function getServerSandbox() {
        return string;
    },

    /**
     * @returns {*}
     */
    initModules: function initModules() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    initEngines: function initEngines() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    startEngine: function startEngine() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    cleanEngine: function cleanEngine() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    clearCallbacks: function clearCallbacks() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    clearSearchPaths: function clearSearchPaths() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    loadGameMap: function loadGameMap() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    loadGameList: function loadGameList() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    updateGameMap: function updateGameMap() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    verifyGameMap: function verifyGameMap() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    updateCommon: function updateCommon() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    updateGame: function updateGame(number) {
        return undefined;
    },

    /**
     * @returns {*}
     */
    loadCommon: function loadCommon() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    cleanCommon: function cleanCommon() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    loadCommonSearchPath: function loadCommonSearchPath() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    loadAssetsSearchPath: function loadAssetsSearchPath() {
        return undefined;
    },

    /**
     * @param {number} gameId
     * @returns {*}
     */
    startGame: function startGame(gameId) {
        return undefined;
    },

    /**
     * @returns {*}
     */
    startGameCasualJS: function startGameCasualJS() {
        return undefined;
    },

    /**
     * @returns {*}
     */
    startTemplate: function startTemplate() {
        return undefined;
    },

    /**
     * @param {string} file
     * @returns {*}
     */
    startBootstrap: function startBootstrap(file) {
        return undefined;
    },

    /**
     * @param {string} file
     * @returns {boolean}
     */
    runScript: function runScript(file) {
        return false;
    },

    /**
     * @param {string} file
     * @returns {*}
     */
    cleanScript: function cleanScript(file) {
        return undefined;
    }
};