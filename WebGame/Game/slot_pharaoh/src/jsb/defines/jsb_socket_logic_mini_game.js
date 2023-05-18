"use strict";

/**
 * @class SocketLogicMiniGame
 */

var SocketLogicMiniGame = {

  isDebug: false,
  isConnected: false,

  /**
   * @param {string} ip
   * @param {number} port
   */
  openWithIp: function openWithIp(ip, port) {
    return undefined;
  },

  /**
   * @param {string} host
   * @param {number} port
   */
  openWithHost: function openWithHost(host, port) {
    return undefined;
  },

  /**
   * @returns {*}
   */
  close: function close() {
    return undefined;
  },

  /**
   * @param {Uint8Array} buffer
   * @param {number} size
   */
  sendRaw: function sendRaw(buffer, size) {
    return undefined;
  },

  /**
   * @param {number} controllerId
   * @param {number} requestId
   * @param {string} json
   */
  sendJson: function sendJson(controllerId, requestId, json) {
    return undefined;
  },

  /**
   * @param {number} controllerId
   * @param {number} requestId
   * @param {Uint8Array} data
   * @param {number} dataSize
   */
  sendData: function sendData(controllerId, requestId, data, dataSize) {
    return undefined;
  },

  /**
   * @param {number} controllerId
   * @param {number} requestId
   */
  heartBeat: function heartBeat(controllerId, requestId) {
    return undefined;
  },

  /**
   * @returns {*}
   */
  resetData: function resetData() {
    return undefined;
  },

  /**
   * @param {boolean} value
   */
  setDebug: function setDebug(value) {
    return undefined;
  },

  /**
   * @param {number} connect
   * @param {number} status
   */
  onConnected: function onConnected(connect, status) {
    return undefined;
  },

  /**
   * @param {number} connect
   * @param {number} status
   */
  onConnectionError: function onConnectionError(connect, status) {
    return undefined;
  },

  /**
   * @returns {*}
   */
  onDisconnected: function onDisconnected() {
    return undefined;
  },

  /**
   * @param {Uint8Array} data
   * @param {number} size
   */
  onSocketData: function onSocketData(data, size) {
    return undefined;
  },

  /**
   * @param {Uint8Array} data
   * @param {number} size
   */
  onSocketMessageRaw: function onSocketMessageRaw(data, size) {
    return undefined;
  },

  /**
   * @param {number} controllerId
   * @param {number} requestId
   * @param {string} json
   */
  onSocketMessageJson: function onSocketMessageJson(controllerId, requestId, json) {
    return undefined;
  }
};