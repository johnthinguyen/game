Module.define(function (require) {
    "use strict";
    
    const ImageUtils = {
        highlightMiniItem: function (item, actionTime = 0.5) {
            let sprite = item.sprite;
            actionTime = actionTime < 0.5 ? 0.5 : actionTime;
            sprite.stopAllActions();
            sprite.runAction(cc.sequence(
                cc.scaleTo(0.5 / 2, 1.35).easing(cc.easeBackOut(2)),
                cc.delayTime(0.75),
                cc.scaleTo(0.5 / 2, 1).easing(cc.easeBackIn(2)),
                cc.callFunc(() => {
                    item.stopHighlightAnimation();
                })
            ));
        },

        getFitScale: function () {
            return 1;
            // let scaleWidth = Math.min(cc.visibleRect.width / 1280, 1);
            // let scaleheight = Math.min(cc.visibleRect.height / 720, 1);
            // return Math.min(scaleWidth, scaleheight);
        },

        getFillScale: function () {
            return 1;
            // let scaleWidth = Math.max(cc.visibleRect.width / 1280, 1);
            // let scaleheight = Math.max(cc.visibleRect.height / 720, 1);
            // return Math.max(scaleWidth, scaleheight);
        },

        getWidthScale: function () {
            return 1;
            // return cc.visibleRect.width / 1280;
        },

        getHeightScale: function () {
            return 1;
            // return cc.visibleRect.height / 720;
        },

        localizeSpriteText: function (sprite, key) {
            let lang = "en";
            switch (portalHelper.getLanguageType()) {//portalHelper.getLanguageType()
                case Localize.LANG.CAM:
                case Localize.LANG.MY:
                case Localize.LANG.PH:
                    lang = portalHelper.getLanguageStr();
                    break;
                default:
                    break;
            }

            let str = cc.formatStr(key, lang);
            if (str != '' && cc.spriteFrameCache.getSpriteFrame(str)) {
                sprite.setSpriteFrame(str);
            }
        },

        rollWidget: function (options) {
            options = _.defaults(options, {
                widget: null,
                size: null, //cc.size
                speed: 100, // px/second
                delay: 2,
                padding:10
            });
        
            let padding = options.padding || 0;
            let widget = options.widget;
            if(!widget || !options.size || options.speed <=0){
                return;
            }
            
            let width = widget.width;
            if(width <= options.size.width && !widget.clipperRollWidget){
                return;
            }
        
            if(!widget.clipperRollWidget) {
            
                widget.clipperRollWidget = new ccui.Layout();
        
                widget.oriPositionRoller = widget.getPosition().x;
                widget.getParent().addChild(widget.clipperRollWidget);
                widget.clipperRollWidget.setClippingEnabled(true);
        
                widget.clipperRollWidget.setAnchorPoint(widget.getAnchorPoint());
                widget.clipperRollWidget.setContentSize(widget.getContentSize());
                widget.clipperRollWidget.setPosition(widget.getPosition());
                
                widget.setAnchorPoint(cc.p(0.5, 0.5));
                NodeUtils.switchParent(widget, widget.clipperRollWidget);
                
                widget.setAnchorPoint(cc.p(0.5, 0.5));
                widget.setPositionY(widget.clipperRollWidget.height / 2);
        
            }
            if(cc.sys.isObjectValid(widget.rollWidgetAction))
                widget.stopAction(widget.rollWidgetAction);
        
            if (width <= options.size.width || options.speed <= 0) {
                widget.clipperRollWidget.width = width;
                ccui.helper.doLayout(widget.clipperRollWidget);
                widget.clipperRollWidget.setPositionX(widget.oriPositionRoller);
                widget.setPositionX(width / 2);
                return;
            }
        
            widget.clipperRollWidget.setContentSize(options.size);
            ccui.helper.doLayout(widget.clipperRollWidget);
        
            widget.setPositionX(width / 2);
            widget.setPositionY(widget.clipperRollWidget.height / 2);
        
            let startPosition = cc.p(widget.width / 2  + (widget.clipperRollWidget.width - widget.width - padding), widget.getPosition().y);
            let endPosition = cc.p(widget.width / 2 + padding, widget.getPosition().y);
        
            let duration = options.size.width / options.speed;
            duration = Math.min(duration, 10);
            widget.rollWidgetAction = widget.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveTo(duration, startPosition),
                        cc.delayTime(options.delay),
                        cc.moveTo(duration, endPosition),
                        cc.delayTime(options.delay)
                    )
                )
            );
        },
    };

    window.ImageUtils = ImageUtils;
    return ImageUtils;
});