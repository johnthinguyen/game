"use strict";

var KingPingWidget = cc.Node.extend({

    ctor: function ctor() {
        this._super();

        if (jsb.fileUtils.isFileExist("portal/ping_back.png")) {
            this.back = new cc.Sprite("portal/ping_back.png");
            this.addChild(this.back);
        }

        this.sprites = [];
        this.spriteColors = [cc.hexToColor("#eb3b5a"), cc.hexToColor("#eb3b5a"), cc.hexToColor("#fed330"), cc.hexToColor("#26de81")];
        for (var i = 0; i < this.spriteColors.length; i++) {
            var sprite = null;
            var spriteName = cc.formatStr("portal/ping_%d.png", i);
            if (jsb.fileUtils.isFileExist(spriteName)) {
                sprite = new cc.Sprite(spriteName);
                sprite.setAnchorPoint(cc.ANCHOR_CENTER());
                this.addChild(sprite);
            }
            this.sprites.push(sprite);
        }

        var textX = this.back ? this.back.width * 0.5 : 0;
        var textY = this.back ? this.back.height * 0.5 : 0;

        this.text = new ccui.Text("", "Arial", 18);
        this.text.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.text.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.text.setTextColor(cc.color.WHITE);
        this.text.setAnchorPoint(cc.ANCHOR_CENTER());
        this.text.setPosition(0, -textY - this.text.height * 0.5 - 10);
        this.addChild(this.text);

        this.textStatus = new ccui.Text("", "Arial", 20);
        this.textStatus.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.textStatus.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this.textStatus.setTextColor(cc.hexToColor("#26de81"));
        this.textStatus.setAnchorPoint(cc.ANCHOR_MIDDLE_LEFT());
        this.textStatus.setPosition(textX + 10, 0);
        this.textStatus.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(0.3), cc.fadeIn(0.3))));
        this.addChild(this.textStatus);
    },

    setValue: function setValue(value) {
        this.text.setString(cc.formatStr("%dms", Math.max(value, 0)));
    },

    setLevel: function setLevel(level) {
        level = level >= this.sprites.length ? this.sprites.length - 1 : level;
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i]) {
                this.sprites[i].setVisible(i <= level);
                this.sprites[i].setColor(this.spriteColors[level]);
            }
        }
    },

    setStatus: function setStatus(text) {
        var active = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        this.textStatus.setString(text);
        this.textStatus.setVisible(active);
    },

    getSize: function getSize() {
        if (this.back) return cc.size(this.back.width * this.getScaleX(), this.back.height * this.getScaleY());
        return cc.size(40, 0);
    }
});