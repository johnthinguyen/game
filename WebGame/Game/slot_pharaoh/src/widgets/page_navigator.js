"use strict";

var PageNavigator = ccui.Layout.extend({
    onPageChanged: function onPageChanged() {},
    VQNT_FONT_OpenSans_Bold: { type: "font", name: "OpenSansBold", srcs: ["res/hoYeah/Fonts/OpenSans-Bold.ttf"] },

    ctor: function ctor() {
        //////////////////////////////
        // 1. super init first
        this._super();
        this.init();
        return true;
    },
    initUI: function initUI() {
        //this.setAnchorPoint(cc.p(0.5,0.5));
        this.setLayoutType(Layout.Type.HORIZONTAL);
    },
    addPage: function addPage() {
        this.setPagesCount(this.getPagesCount() + 1);
    },
    showPage: function showPage(pageIndex) {
        if (pageIndex > -1 && pageIndex < this.getPagesCount()) {
            var children = this.getChildren();
            for (var i = 0; i < children.length; i++) {
                var btn = children[i];
                if (btn) {
                    btn.enabled = true;
                }
            }
            var btn = children[pageIndex];
            if (btn) {
                btn.enabled = false;
            }
        }
    },
    getPagesCount: function getPagesCount() {
        return this.getChildrenCount();
    },
    onBtnNumberClicked: function onBtnNumberClicked(btn, type) {
        if (GameUtils.makeEffectButton(btn, type, 1.0)) {
            var pageIndex = btn.getTag();
            this.showPage(pageIndex);
            if (this.onPageChanged != null) {
                this.onPageChanged(pageIndex);
            }
        }
    },
    getFontName: function getFontName(resource) {
        if (cc.sys.isNative) {
            return resource.srcs[0];
        } else {
            return resource.name;
        }
    },
    setPagesCount: function setPagesCount(count) {
        var dirty = false;
        var children = this.getChildren();
        var currentCount = this.getPagesCount();
        if (count > currentCount) {
            dirty = true;

            cc.log("NAV PATH: %s", cc.path.join(res.VQNT_IMG_btnPageNavigator));
            for (var i = currentCount; i < count; i++) {
                var btn = ccui.Button.create(cc.path.join(res.VQNT_IMG_btnPageNavigator), cc.path.join(res.VQNT_IMG_btnPageNavigatorPressed), cc.path.join(res.VQNT_IMG_btnPageNavigatorPressed));
                var title = i + 1;
                btn.setTitleText(title.toString());
                btn.setTitleFontSize(24);
                btn.setTitleFontName(this.getFontName(this.VQNT_FONT_OpenSans_Bold));
                btn.setTag(i);
                btn.addTouchEventListener(this.onBtnNumberClicked, this);
                this.addChild(btn);
            }

            if (currentCount <= 0) {
                this.showPage(0);
            }
        } else if (count < currentCount) {
            dirty = true;

            for (var i = currentCount - 1; i >= count; i--) {
                this.removeChild(children[i]);
            }
        }

        if (dirty) {

            cc.log('PAGE COUNT: ' + children.length + ', count: ' + count);
            var mWidth = 0;
            var mHeight = 0;
            for (var i = 0; i < this.getChildrenCount(); i++) {
                var child = this.getChildByTag(i);
                cc.log('i: ' + i + 'mWidth: ' + mWidth);
                child.setPositionX(mWidth);
                mWidth += child.getContentSize().width;
                mHeight = child.getContentSize().height; //(mHeight > child.getContentSize().height) ? mHeight :
            }
            var mSize = cc.size(mWidth, mHeight);
            this.setContentSize(mSize);
        }
    }
});