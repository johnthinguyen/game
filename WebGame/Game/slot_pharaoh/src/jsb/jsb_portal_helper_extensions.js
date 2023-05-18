"use strict";

var portalHelper = PortalHelper.getInstance();

portalHelper.notify = function (event, data) {
    this.eventTags = this.eventTags || [];
    if (this.eventTags.length === 0) {
        cc.eventManager.dispatchCustomEvent(event, data);
    } else {
        this.eventTags.forEach(function (tag) {
            cc.eventManager.dispatchCustomEvent(cc.formatStr("%s.%s", tag, event), data);
        });
    }
};

/**
 * Dispatch system's event to portal helper
 * @param event
 * @param data
 */
portalHelper.notifyMain = function (event, data) {

    if (this.MAIN_EVENTS.indexOf(event) < 0) {
        cc.log(this.LOGTAG, "Not supported event %s", event);
        return;
    }

    portalHelper.notify(event, data);
};

/**
 * Dispatch game's event to portal helper
 * @param event
 * @param data
 */
portalHelper.notifyGame = function (event, data) {

    if (this.GAME_EVENTS.indexOf(event) < 0) {
        cc.log(this.LOGTAG, "Not supported event %s", event);
        return;
    }

    portalHelper.notify(event, data);
};

/**
 * Register tags for main/game life cycle events
 * @param names
 */
portalHelper.registerTag = function (names) {
    this.eventTags = this.eventTags || [];
    this.eventTags = _.uniq(this.eventTags.concat(typeof names === 'string' ? [names] : names || []));
};

/**
 * Tracking event with one param: string or float value.
 * @param eventName
 * @param paramName
 * @param paramStringVal
 * @param paramFloatVal
 * @param valueToSum
 * @param isGG
 * @param isFB
 */
portalHelper.trackingDirectEventOneParam = function (eventName, paramName) {
    var paramStringVal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var paramFloatVal = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var valueToSum = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var isGG = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
    var isFB = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;

    if (cc.sys.os === cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod("com/game/live/AppActivity", "trackingEventOneParam", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;FFZZ)V", eventName, paramName, paramStringVal, paramFloatVal, valueToSum, isGG, isFB);
        cc.log(this.LOGTAG, "trackingEventOneParam DONE: " + eventName);
    } else {
        cc.log(this.LOGTAG, "trackingEventTwoParam NOT HANDLED FOR PLATFORM: " + eventName);
    }
};

/**
 * Tracking event with one param: string or float value.
 * @param eventName
 * @param paramStrName
 * @param paramFlName
 * @param valStr
 * @param valFl
 * @param valToSum
 * @param isGG
 * @param isFB
 */
portalHelper.trackingDirectEventTwoParam = function (eventName, paramStrName, paramFlName, valStr, valFl) {
    var valToSum = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var isGG = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    var isFB = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : true;

    if (cc.sys.os === cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod("com/game/live/AppActivity", "trackingEventTwoParam", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;FFZZ)V", eventName, paramStrName, paramFlName, valStr, valFl, valToSum, isGG, isFB);
        cc.log(this.LOGTAG, "trackingEventTwoParam DONE: " + eventName);
    } else {
        cc.log(this.LOGTAG, "trackingEventTwoParam NOT HANDLED FOR PLATFORM: " + eventName);
    }
};