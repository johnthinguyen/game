"use strict";

var _rootPath = portalManager.isTemplate() ? "src/" : "common/";
if (portalManager.isEncrypted()) _rootPath = "";

var _resPath = _rootPath + "reportbugs/private_resources/";
var ReportBugs = ReportBugs || {};
ReportBugs.Config = {
    IMAGE_WIDTH: 1000,

    FONT_SIZE: 24,
    FONT_NAME: _resPath + "OpenSans_Bold.ttf",

    REASON_SELECTOR_PATH: _resPath + "popup_reason_selector.json",

    BUTTON_ICON: _resPath + "icon_camera.png",
    BUTTON_IMAGE: _resPath + "button_blue.png",
    BUTTON_WIDTH: 71,
    BUTTON_HEIGHT: 71,

    FADE_IN_DURATION: 0.5,
    FADE_OUT_DURATION: 0.5,
    MESSAGE_DURATION: 3.0,
    CAPTURE_EFFECT_DURATION: 0.5,

    TASK_USE_COROUTINE: true,
    FLIP_CHUNK_SIZE: 40 * 1024,
    RESIZE_CHUNK_SIZE: 40 * 1024,
    ENCODE_CHUNK_SIZE: 90 * 1024, // SHOULD BE DIVIDE BY 3
    COMPRESS_CHUNK_SIZE: 40 * 1024,

    DEFAULT_ENABLE: false,
    DEFAULT_COOLDOWN: 60
};