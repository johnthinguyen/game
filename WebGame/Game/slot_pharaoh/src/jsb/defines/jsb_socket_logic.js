"use strict";

/**
 * @class SocketLogic
 */

var SocketLogic = {

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
   * @param {number} mainId
   * @param {number} assistantId
   * @param {number} checkCode
   * @param {Uint8Array} object
   * @param {number} objectSize
   */
  send: function send(mainId, assistantId, checkCode, object, objectSize) {
    return undefined;
  },

  /**
   * @param {number} mainId
   * @param {number} assistantId
   * @param {number} handleCode
   * @param {number} checkCode
   * @param {Uint8Array} object
   * @param {number} objectSize
   */
  sendEx: function sendEx(mainId, assistantId, handleCode, checkCode, object, objectSize) {
    return undefined;
  },

  /**
   * @param {number} packetId
   * @param {number} checkCode
   * @param {Uint8Array} object
   * @param {number} objectSize
   */
  sendMiniGame: function sendMiniGame(packetId, checkCode, object, objectSize) {
    return undefined;
  },

  /**
   * @param {Uint8Array} object
   * @param {number} objectSize
   */
  sendRawData: function sendRawData(object, objectSize) {
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
   * @param {boolean} payload.connected
   * @param {number} payload.status
   */
  onConnected: function onConnected(payload) {
    return undefined;
  },

  /**
   * @returns {*}
   */
  onDisconnected: function onDisconnected() {
    return undefined;
  },

  /**
   * @param {Uint8Array} payload.data
   * @param {number} payload.size
   */
  onSocketData: function onSocketData(payload) {
    return undefined;
  },

  /**
   * @param {object} payload.messageHead { messageSize, mainId, assistantId, handleCode, reserve }
   * @param {Uint8Array} payload.object
   * @param {number} payload.objectSize
   * @param {number} payload.socketStatus
   * @param {string} payload.key
   */
  onSocketMessage: function onSocketMessage(payload) {
    return undefined;
  }
};