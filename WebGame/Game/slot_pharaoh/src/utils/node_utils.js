"use strict";

var NodeUtils = NodeUtils || {};

NodeUtils.switchParent = function (node, newParent, newZOrder) {
    if (node && newParent) {
        if (node.getParent()) {
            node.retain();
            node.removeFromParent(false);
            if (newZOrder) newParent.addChild(node, newZOrder);else newParent.addChild(node);
            node.release();
        } else {
            if (newZOrder) newParent.addChild(node, newZOrder);else newParent.addChild(node);
        }
    }
};

NodeUtils.fixTextLayout = function (widget) {
    var recursive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var excludes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (widget instanceof ccui.Text) {
        if (excludes.findIndex(function (item) {
            return item === widget.name;
        }) >= 0) return;
        widget.ignoreContentAdaptWithSize(true);
    } else if (recursive === true) {
        var children = widget.getChildren();
        children.forEach(function (child) {
            NodeUtils.fixTextLayout(child, recursive, excludes);
        });
    }
};

NodeUtils.captureNode = function (node, size, anchor) {
    var scale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    var pixelFormat = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : cc.Texture2D.PIXEL_FORMAT_RGBA8888;

    if (!node || !cc.sys.isObjectValid(node)) return null;

    var savedPos = node.getPosition();
    node.setPosition(cc.p(size.width * anchor.x, size.height * anchor.height));

    var renderer = new cc.RenderTexture(size.width, size.height, pixelFormat, gl.DEPTH24_STENCIL8_OES);
    renderer.setPosition(cc.visibleRect.center);
    renderer.beginWithClear(255, 255, 255, 255);
    node.visit();
    renderer.end();

    node.setPosition(savedPos);

    if (scale === 1) return renderer;

    var sprite = renderer.getSprite();
    var resizeRenderer = new cc.RenderTexture(sprite.width * scale, sprite.height * scale, pixelFormat, gl.DEPTH24_STENCIL8_OES);

    sprite.setAnchorPoint(cc.p(0, 0));
    sprite.setFlippedY(true);
    sprite.setScale(scale);

    resizeRenderer.beginWithClear(255, 255, 255, 255);
    sprite.visit();
    resizeRenderer.end();

    return renderer;
};

NodeUtils.captureScreen = function () {
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var pixelFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : cc.Texture2D.PIXEL_FORMAT_RGBA8888;

    var renderer = new cc.RenderTexture(cc.visibleRect.width, cc.visibleRect.height, pixelFormat, gl.DEPTH24_STENCIL8_OES);
    renderer.setPosition(cc.visibleRect.center);
    renderer.beginWithClear(255, 255, 255, 255);
    cc.director.getRunningScene().visit();
    renderer.end();

    if (scale === 1) return renderer;

    var sprite = renderer.getSprite();
    var resizeRenderer = new cc.RenderTexture(sprite.width * scale, sprite.height * scale, pixelFormat, gl.DEPTH24_STENCIL8_OES);

    sprite.setAnchorPoint(cc.p(0, 0));
    sprite.setFlippedY(true);
    sprite.setScale(scale);

    resizeRenderer.beginWithClear(255, 255, 255, 255);
    sprite.visit();
    resizeRenderer.end();

    return renderer;
};

NodeUtils.captureScreenToFile = function (filename) {
    var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var pixelFormat = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : cc.Texture2D.PIXEL_FORMAT_RGBA8888;
    var imageFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : cc.IMAGE_FORMAT_PNG;

    var renderer = NodeUtils.captureScreen(scale, pixelFormat);
    if (renderer) {
        var success = renderer.saveToFile(filename, imageFormat);
        if (success) {
            return cc.path.join(jsb.fileUtils.getWritablePath(), filename);
        }
    }

    return "";
};

NodeUtils.captureNodeToSprite = function (node, size, anchor) {
    var scale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    var pixelFormat = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : cc.Texture2D.PIXEL_FORMAT_RGBA8888;

    var renderer = NodeUtils.captureNode(node, size, anchor, scale, pixelFormat);
    return renderer ? renderer.getSprite() : null;
};

NodeUtils.captureScreenToSprite = function () {
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var pixelFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : cc.Texture2D.PIXEL_FORMAT_RGBA8888;

    var renderer = NodeUtils.captureScreen(scale, pixelFormat);
    return renderer ? renderer.getSprite() : null;
};

NodeUtils.captureScreenToBase64 = function () {
    var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var pixelFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : cc.Texture2D.PIXEL_FORMAT_RGBA8888;
    var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var renderer = NodeUtils.captureScreen(scale, pixelFormat);
    if (renderer) {
        var fileName = "capture.png";
        var success = renderer.saveToFile(fileName, cc.IMAGE_FORMAT_PNG);
        if (success) {
            var path = cc.path.join(jsb.fileUtils.getWritablePath(), fileName);
            var interval = setInterval(function () {
                if (jsb.fileUtils.isFileExist(path)) {
                    clearInterval(interval);
                    var data = jsb.fileUtils.getDataFromFile(path);
                    callback && callback(NodeUtils.bufferToBase64(data));
                }
            }, 100);
        }
    }
};

NodeUtils.bufferToBase64 = function (buffer) {

    var encodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    var t = "";
    var n = void 0,
        r = void 0,
        i = void 0,
        s = void 0,
        o = void 0,
        u = void 0,
        a = void 0;
    var f = 0;

    while (f < buffer.length) {
        n = buffer[f++];
        r = buffer[f++];
        i = buffer[f++];
        s = n >> 2;
        o = (n & 3) << 4 | r >> 4;
        u = (r & 15) << 2 | i >> 6;
        a = i & 63;

        if (isNaN(r)) u = a = 64;else if (isNaN(i)) a = 64;

        t = t + encodeChars.charAt(s) + encodeChars.charAt(o) + encodeChars.charAt(u) + encodeChars.charAt(a);
    }

    return t;
};

NodeUtils.constructAvatar = function (mask, url) {
    var zorder = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
    var isFlip = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (!mask || !mask.getParent()) return;

    var parent = mask.getParent();
    var maskPosition = mask.getPosition();

    mask.retain();
    mask.setPosition(cc.p(0, 0));
    mask.removeFromParent();

    var avatarSprite = null;
    if (cc.spriteFrameCache.getSpriteFrame(url)) avatarSprite = new cc.Sprite("#" + url);
    if (!avatarSprite) avatarSprite = new cc.Sprite(url);

    var scaleWidth = mask.width / avatarSprite.width;
    var scaleHeight = mask.height / avatarSprite.height;

    avatarSprite.setScale(Math.max(scaleWidth, scaleHeight));
    avatarSprite.setScaleX(isFlip ? -avatarSprite.getScaleX() : avatarSprite.getScaleX());

    var clipper = new cc.ClippingNode();
    clipper.setStencil(mask);
    clipper.setAlphaThreshold(0.5);
    clipper.addChild(avatarSprite);
    clipper.setPosition(maskPosition);
    parent.addChild(clipper, zorder);

    var maskBox = mask.getBoundingBox();
    avatarSprite.setPosition(cc.p(cc.rectGetMidX(maskBox), cc.rectGetMidY(maskBox)));

    mask.release();

    return avatarSprite;
};

NodeUtils.scaleAvatar = function (size, sprite) {
    var fit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var padding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 3;

    if (!sprite || !cc.sys.isObjectValid(sprite)) return;

    var scaleX = (size.width - padding * 2) / sprite.getContentSize().width;
    var scaleY = (size.height - padding * 2) / sprite.getContentSize().height;

    if (fit) sprite.setScale(scaleX, scaleY);else sprite.setScale(Math.max(scaleX, scaleY));
};

NodeUtils.updateAvatar = function (size, sprite, texture) {
    var fit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var padding = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    if (!sprite || !cc.sys.isObjectValid(sprite)) return;

    if (!texture || !cc.sys.isObjectValid(texture) || !(texture instanceof cc.Texture2D)) return;

    var scaleX = (size.width - padding * 2) / texture.getContentSize().width;
    var scaleY = (size.height - padding * 2) / texture.getContentSize().height;

    sprite.initWithTexture(texture);
    sprite.setVisible(true);

    if (fit) sprite.setScale(scaleX, scaleY);else sprite.setScale(Math.max(scaleX, scaleY));
};

NodeUtils.applyPressedEffect = function (button, type, scale) {
    var deltaScale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.9;

    if (!button) return false;

    var scaleX = scale.x || scale;
    var scaleY = scale.y || scale;

    if (type === ccui.Widget.TOUCH_BEGAN) {
        button.setScale(scaleX, scaleY);
        button.runAction(cc.scaleTo(0.1, scaleX * deltaScale, scaleY * deltaScale));
        return false;
    } else if (type === ccui.Widget.TOUCH_MOVED) {
        return false;
    } else if (type === ccui.Widget.TOUCH_CANCELED) {
        button.setScale(scaleX * deltaScale, scaleY * deltaScale);
        button.runAction(new cc.EaseBackOut(cc.scaleTo(0.3, scaleX, scaleY)));
        return false;
    }

    button.setScale(scaleX * deltaScale, scaleY * deltaScale);
    button.runAction(new cc.EaseBackOut(cc.scaleTo(0.3, scaleX, scaleY)));

    return true;
};

NodeUtils.applyGreyscaleNode = function (node) {
    var enabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : cc.color(100, 100, 100, 100);

    if (!node) return;

    if (node instanceof cc.ProgressTimer || node instanceof ccui.Button || node instanceof ccui.Text) return;

    if (node.getVirtualRenderer !== undefined) {
        var renderer = node.getVirtualRenderer();
        if (renderer) {
            if (renderer instanceof cc.Scale9Sprite) {
                renderer.setState(enabled ? 1 : 0);
            } else {
                renderer.setColor(enabled === true ? cc.color.WHITE : color);
            }
        }
    } else {
        node.setColor(enabled === true ? cc.color.WHITE : color);
    }
};

NodeUtils.setWidgetEnabled = function (widget, enabled) {
    var greyscale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (!widget || !widget.setEnabled) return;

    widget.setEnabled(enabled);
    if (greyscale) NodeUtils.applyGreyscaleNode(widget, !enabled);
};

NodeUtils.setNodeCascade = function (node, colorEnabled, opacityEnabled) {
    var recursive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    if (!node || !cc.sys.isObjectValid(node) || !(node instanceof cc.Node)) return;

    if (node.setCascadeColorEnabled !== undefined) node.setCascadeColorEnabled(colorEnabled);

    if (node.setCascadeOpacityEnabled !== undefined) node.setCascadeOpacityEnabled(opacityEnabled);

    if (recursive && node.getChildren !== undefined) {
        node.getChildren().forEach(function (child) {
            NodeUtils.setNodeCascade(child, colorEnabled, opacityEnabled, recursive);
        });
    }
};

NodeUtils.setNodeCascadeColor = function (node, enabled) {
    var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (!node || !cc.sys.isObjectValid(node) || !(node instanceof cc.Node)) return;

    if (node.setCascadeColorEnabled !== undefined) node.setCascadeColorEnabled(enabled);

    if (recursive && node.getChildren !== undefined) {
        node.getChildren().forEach(function (child) {
            NodeUtils.setNodeCascadeColor(child, enabled, recursive);
        });
    }
};

NodeUtils.setNodeCascadeOpacity = function (node, enabled) {
    var recursive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (!node || !cc.sys.isObjectValid(node) || !(node instanceof cc.Node)) return;

    if (node.setCascadeOpacityEnabled !== undefined) node.setCascadeOpacityEnabled(enabled);

    if (recursive && node.getChildren !== undefined) {
        node.getChildren().forEach(function (child) {
            NodeUtils.setNodeCascadeOpacity(child, enabled, recursive);
        });
    }
};

NodeUtils.findChildByName = function (root, name) {

    if (!root) return null;

    if (root.getName() === name) return root;

    var children = root.getChildren();
    var length = children.length;
    for (var i = 0; i < length; i++) {
        var child = children[i];
        var res = NodeUtils.findChildByName(child, name);
        if (res !== null) return res;
    }

    return null;
};