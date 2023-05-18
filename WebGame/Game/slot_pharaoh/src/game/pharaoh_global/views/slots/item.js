/*global define */

Module.define(function (require) {
    "use strict";

    const SPINE_ITEM_JSON = "res/game/pharaoh_global/empire_spine/item/item_%d/skeleton.json";
    const SPINE_ITEM_ATLAS = "res/game/pharaoh_global/empire_spine/item/item_%d/skeleton.atlas";

    const LOGTAG = "[SlotPharaoh::SlotItem]";
    // size for display item
    function getSpriteNameByType(type, merge = 0, isGoldItem = false, remain = 0) {
        if (type == 0 || type == SlotRule.ITEM_TYPE.JACKPOT_SERVER)
            return;

        let str = cc.formatStr("pharaoh_img/items/item%d/item%d_merge%d.png", type, type, merge);
        if (isGoldItem) {
            if (type == SlotRule.ITEM_TYPE.SCATTER)
                return;
        }

        // if (type == SlotRule.ITEM_TYPE.WILD) {
        //     if (remain > 0 && merge > 0) {
        //         str = cc.formatStr("pharaoh_img/items/item_%d/merge_gold_%d_rm_%d.png", type, merge, remain);
        //     } else {
        //         str = cc.formatStr("pharaoh_img/items/item_%d/merge_gold_0.png", type);
        //     }
        // }
        return str;
    }

    function getHighlightAnimation(type, actionTime = SlotRule.HIGHLIGHT_TIME, mergeType = 0) {
        if (type == SlotRule.ITEM_TYPE.SCATTER || type == SlotRule.ITEM_TYPE.JACKPOT_SERVER)
            return;

        let name = "empire_anim/items/item_" + type + "/highlight" + "/merge_" + mergeType;
        let pattern = name + "/sprite_%d.png";
        let num = 24;
    
        let animation = Resource.loadAnimationWithDuration(name, pattern, 0, num, actionTime);

        if (animation && animation.getFrames().length > 0) {
            animation.setDelayPerUnit(actionTime / animation.getFrames().length);
        } else {
            cc.log(LOGTAG, "Animation of type (" + type + ") is not found.");
        }
        return animation;
    }

    function getChangeToWildAnimation(type,mergeType = 0,actionTime = SlotRule.CHANGE_TO_WILD_TIME){
        if(type == SlotRule.ITEM_TYPE.WILD || type == SlotRule.ITEM_TYPE.SCATTER || type == SlotRule.ITEM_TYPE.JACKPOT_SERVER){
            return;
        }

        let name = "empire_anim/items/item_" + type + "/tranfer" + "/merge_" + mergeType;
        let pattern = name + "/sprite_%d.png";
        let num = 31;
        let animation = Resource.loadAnimationWithDuration(name, pattern, 0, num, actionTime);

        if (animation && animation.getFrames().length > 0) {
            animation.setDelayPerUnit(actionTime / animation.getFrames().length);
        } else {
            cc.log(LOGTAG, "Animation of wild type (" + mergeType + ") is not found.");
        }
        return animation;
    }

    function getCoutDownWildAnimation(type,mergeType = 0,countDown,actionTime = SlotRule.COUNT_DOWN_WILD_TIME){
        if(type != SlotRule.ITEM_TYPE.WILD){
            return;
        }

        let name = "empire_anim/items/item_1" + "/countdown" + "/merge_" + mergeType + "/count_to_" + countDown;
        let pattern = name + "/sprite_%d.png";
        let num = 54;

        let animation = Resource.loadAnimationWithDuration(name, pattern, 0, num, actionTime);

        if (animation && animation.getFrames().length > 0) {
            animation.setDelayPerUnit(actionTime / animation.getFrames().length);
        } else {
            cc.log(LOGTAG, "Animation of count down wild type (" + mergeType + ") is not found.");
        }
        return animation;
    }

    function getEliminateAnimation(actionTime = SlotRule.ELIMINATE_TIME, mergeType = 0) {
        let name = "empire_anim/items/item_eliminate/merge_" + mergeType;
        let pattern = name + "/sprite_%d.png";
        let num = 54;
        
        let animation = Resource.loadAnimationWithDuration(name, pattern, 25, num, actionTime);

        if (animation && animation.getFrames().length > 0) {
            animation.setDelayPerUnit(actionTime / animation.getFrames().length);
        } else {
            cc.log(LOGTAG, "Animation of merge type (" + mergeType + ") is not found.");
        }
        return animation;
    }

    const Item = ccui.Widget.extend({
        ctor: function (commander, slotManager, isItemHighlight = false, isItemTop = false, itemSize) {
            this._super();

            this.commander = commander;
            this.slotManager = slotManager;
            this.isItemHighlight = isItemHighlight;
            this.isEliminating = false;
            this.isSpinning = false;
            this.highlight = false;
            this.oriItem = null;
            this.anim = null;
            this.spine = null;

            this.type = SlotRule.ITEM_TYPE.NONE;
            this.mergeType = SlotRule.ITEM_MERGE_TYPE.NONE;

            this.setAnchorPoint(cc.p(0.5, 0.5));
            this.setContentSize(itemSize);

            this.sprite = new cc.Sprite();
            this.sprite.setNormalizedPosition(cc.p(0.5, 0.5));
            this.addChild(this.sprite);

            this.goldCardEff = new cc.Sprite();
            this.goldCardEff.setNormalizedPosition(cc.p(0.5, 0.5));
            this.addChild(this.goldCardEff);
            this.goldCardEff.setVisible(false);

            this.isItemTop = isItemTop;

            return true;
        },

        setType: function (type, merge = 0, isGoldItem = false, canUse = 0, isVisible = true) {

            this.isSpinning = false;

            if (this.type == type && this.mergeType == merge && this.goldItem == isGoldItem && this.canUse == canUse) {
                this.setVisible(isVisible && type != -1);

                let isFrameGoldVisible = isGoldItem && !(type == SlotRule.ITEM_TYPE.WILD) && !(type == SlotRule.ITEM_TYPE.SCATTER);
                this.goldCardEff.setVisible(isFrameGoldVisible);
               
                return;
            } else {
                this.type = type;
                this.mergeType = merge;
                this.goldItem = isGoldItem;
                this.canUse = canUse;
            }

            if (type == -1) {
                this.setVisible(false);
             
                
                return;
            }
            // if (merge > 0) {
            //     console.log("setType3");
            // }
            
            this.goldCardEff.spriteName = cc.formatStr(Resource.SPRITES.GOLD_ITEM_FRAME, merge);
            this.goldCardEff.setSpriteFrame(this.goldCardEff.spriteName);
            let isFrameGoldVisible = isGoldItem && !(type == SlotRule.ITEM_TYPE.WILD) && !(type == SlotRule.ITEM_TYPE.SCATTER);
            this.goldCardEff.setVisible(isFrameGoldVisible);

            this.setVisible(isVisible);
            let spriteName = getSpriteNameByType(type,merge,isGoldItem,canUse);
            if (spriteName != '' && cc.spriteFrameCache.getSpriteFrame(spriteName)) {
                this.sprite.setSpriteFrame(spriteName);
            }

            switch (type) {              
                case SlotRule.ITEM_TYPE.SCATTER:
                    switch (merge) {
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_1:
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.15));
                            break;
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_2:
                            this.sprite.setNormalizedPosition(cc.p(0.5, -0.35));
                            break;
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_3:
                            this.sprite.setNormalizedPosition(cc.p(0.5, -0.85));
                            break;
                        default:
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.65));
                            break;
                    }
                    break;
                default:
                    switch (merge) {
                        
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_1:
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.55));
                            this.goldCardEff.setNormalizedPosition(cc.p(0.5, 0.55));
                            break;
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_2:
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.41));
                            this.goldCardEff.setNormalizedPosition(cc.p(0.5, 0.41));
                            break;
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_3:
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.25));
                            this.goldCardEff.setNormalizedPosition(cc.p(0.51, 0.25));
                            break;
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_4:
                          
                            this.sprite.setNormalizedPosition(cc.p(0.51, -0.05));
                            this.goldCardEff.setNormalizedPosition(cc.p(0.51, -0.05));
                            break;
                        case SlotRule.ITEM_MERGE_TYPE.MERGE_5:
                            this.sprite.setNormalizedPosition(cc.p(0.51, -0.63));
                            this.goldCardEff.setNormalizedPosition(cc.p(0.51, -0.63));
                            break;
                        default:
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.63));
                            this.goldCardEff.setNormalizedPosition(cc.p(0.5, 0.625));
                            break;
                    }
                    break;
            }
        },

        showFxGoldItems: function () {
            this.goldCardEff.stopAllActions();
            this.goldCardEff.setVisible(true);
            if (this.mergeType > 3) { //để tạm mốt xóa.
                return;
            }
            let str = cc.formatStr("FRAME_GOLD_%d", this.mergeType);
            this.goldCardEff.runAction(cc.sequence(
                cc.animate(Animation.get(str)),
                cc.callFunc(() => {
                    cc.log("");
                    this.goldCardEff.setSpriteFrame(this.goldCardEff.spriteName);
                })
            ));
        },

        getType: function () {
            return this.type;
        },

        getMergeType: function () {
            return this.mergeType;
        },

        getIsGoldItem: function () {
            return this.goldItem;
        },

        getRemainUse: function(){
            return this.canUse;
        },

        setTypeRandomly: function (isRandomNoScatter = false) {
            let type = isRandomNoScatter ? SlotRule.getRandomTypeNoScatter() : SlotRule.getRandomType();
            this.setType(type);
            return type;
        },

        setSpinningType: function (type) {
            this.type = type;
            this.isSpinning = true;
        },

        adjustSpinePosition: function () {
            if (!this.spine) {
                return;
            }

            switch (this.mergeType) {
                case SlotRule.ITEM_MERGE_TYPE.MERGE_1:
                    this.spine.setNormalizedPosition(cc.p(0.5, 0.15));
                    this.spine.setSkin("03");
                    break;
                case SlotRule.ITEM_MERGE_TYPE.MERGE_2:
                    this.spine.setNormalizedPosition(cc.p(0.5, -0.35));
                    this.spine.setSkin("02");
                    break;
                case SlotRule.ITEM_MERGE_TYPE.MERGE_3:
                    this.spine.setNormalizedPosition(cc.p(0.5, -0.8));
                    this.spine.setSkin("01");
                    break;
                default:
                    if (this.isItemTop) {
                        this.spine.setNormalizedPosition(cc.p(0.5, 0.5));
                    } else {
                        this.spine.setNormalizedPosition(cc.p(0.5, 0.67));
                    }
                   
                    this.spine.setSkin("04");
                    break;
            }
        },

        playAnimScatter: function (oriItem = null, type = null, isShow = true) {
            this.isPlayingScatter = true;
            this.isShowScatter = isShow;
            this.setVisible(true);
            if (oriItem != null && !this.isShowScatter) {
                oriItem.setVisible(false);
                this.oriItem = oriItem;
            }
            this.setLocalZOrder(this.getLocalZOrder() + ViewStyle.ITEM_ORDER.SCATTER);
            this.sprite.setOpacity(255);
            this.sprite.setVisible(true);
            
            if (this.mergeType > SlotRule.ITEM_MERGE_TYPE.MERGE_1) {
                this.sprite.setVisible(false);
                this.spine = sp.SkeletonAnimation.createWithJsonFile(cc.formatStr(SPINE_ITEM_JSON, this.type), cc.formatStr(SPINE_ITEM_ATLAS, this.type));
                this.addChild(this.spine);
                this.adjustSpinePosition();

                if (this.isShowScatter) {
                    this.oriItem = oriItem;
                    this.spine.setAnimation(0, "Symbol_12", false);
                    this.spine.setCompleteListener(() => {
                        this.sprite.setVisible(true);
                        this.scheduleOnce(() => {
                            if (!this.spine) {
                                return;
                            }

                            this.spine.removeFromParent();
                            this.spine = null;
                        }, 0.1);
                    })
                    return;
                }

                switch (type) {
                    case Animation.SCATTERS.WAIT:
                        this.spine.setAnimation(0, cc.formatStr("Symbol_12_NearWin%d", 4 - this.mergeType), true);
                        break;
                    case Animation.SCATTERS.GET:
                        this.spine.setAnimation(0, cc.formatStr("Symbol_12_FG%d", 4 - this.mergeType), true);
                        break;
                }
                return;
            }

            this.sprite.setNormalizedPosition(cc.p(0.5, 0.5));
            this.sprite.stopAllActions();

            let animate;

            switch (this.mergeType) {
                case SlotRule.ITEM_MERGE_TYPE.NONE:
                    switch (type) {
                        case Animation.SCATTERS.WAIT:
                            animate = cc.animate(Animation.get("SCATTER_WAIT_MERGE_0"));
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.55));
                            break;
                        case Animation.SCATTERS.GET:
                            animate = cc.animate(Animation.get("SCATTER_GET_MERGE_0"));
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.65));
                            break;
                    }
                    break;
                case SlotRule.ITEM_MERGE_TYPE.MERGE_1:
                    switch (type) {
                        case Animation.SCATTERS.WAIT:
                            animate = cc.animate(Animation.get("SCATTER_WAIT_MERGE_1"));
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.05));
                            break;
                        case Animation.SCATTERS.GET:
                            animate = cc.animate(Animation.get("SCATTER_GET_MERGE_1"));
                            this.sprite.setNormalizedPosition(cc.p(0.5, 0.15));
                            break;
                    }
                    break;
                case SlotRule.ITEM_MERGE_TYPE.MERGE_2:
                    switch (type) {
                        case Animation.SCATTERS.WAIT:
                            animate = cc.animate(Animation.get("SCATTER_WAIT_MERGE_2"));
                            this.sprite.setNormalizedPosition(cc.p(0.5, -0.41));
                            break;
                        case Animation.SCATTERS.GET:
                            animate = cc.animate(Animation.get("SCATTER_GET_MERGE_2"));
                            this.sprite.setNormalizedPosition(cc.p(0.5, -0.35));
                            break;
                    }
                    break;
                case SlotRule.ITEM_MERGE_TYPE.MERGE_3:
                    switch (type) {
                        case Animation.SCATTERS.WAIT:
                            animate = cc.animate(Animation.get("SCATTER_WAIT_MERGE_3"));
                            this.sprite.setNormalizedPosition(cc.p(0.5, -0.9));
                            break;
                        case Animation.SCATTERS.GET:
                            animate = cc.animate(Animation.get("SCATTER_GET_MERGE_3"));
                            this.sprite.setNormalizedPosition(cc.p(0.49, -0.85));
                            break;
                    }
                    break;
            }

            if (this.isShowScatter) {
                this.oriItem = oriItem;
                cc.log("play anim scatter show");
                switch (this.mergeType) {
                    case SlotRule.ITEM_MERGE_TYPE.NONE:
                        animate = cc.animate(Animation.get("SCATTER_SHOW_MERGE_0"));
                        this.sprite.setNormalizedPosition(cc.p(0.5, 0.65));
                        break;
                    case SlotRule.ITEM_MERGE_TYPE.MERGE_1:
                        animate = cc.animate(Animation.get("SCATTER_SHOW_MERGE_1"));
                        this.sprite.setNormalizedPosition(cc.p(0.5, 0.15));
                        break;
                    case SlotRule.ITEM_MERGE_TYPE.MERGE_2:
                        animate = cc.animate(Animation.get("SCATTER_SHOW_MERGE_2"));
                        this.sprite.setNormalizedPosition(cc.p(0.5, -0.35));
                        break;
                    case SlotRule.ITEM_MERGE_TYPE.MERGE_3:
                        animate = cc.animate(Animation.get("SCATTER_SHOW_MERGE_3"));
                        this.sprite.setNormalizedPosition(cc.p(0.5, -0.85));
                        break;
                }
                this.sprite.runAction(
                    animate
                );
                return;
            }
            cc.log("play anim scatter wait/ win");

            this.sprite.runAction(cc.repeatForever(animate))

        },

        showChangeToWild: function(isLastChangeItem = false,oriItem = null){
            this.isLastChangeItem = isLastChangeItem;
            if (this.highlight) {
                return;
            }
            this.sprite.setVisible(true);
            this.sprite.setOpacity(255);
            if (oriItem != null) {
                oriItem.setVisible(false);
                oriItem.goldCardEff.setVisible(false);
                this.oriItem = oriItem;
            }

            this.goldCardEff.setVisible(false);
            this.highlight = true;
            this.setLocalZOrder(this.getLocalZOrder() + ViewStyle.ITEM_ORDER.HIGHLIGHT_CHANGE);

            if (this.mergeType > SlotRule.ITEM_MERGE_TYPE.MERGE_1) {
                this.sprite.setVisible(false);
                this.spine = sp.SkeletonAnimation.createWithJsonFile(cc.formatStr(SPINE_ITEM_JSON, this.type), cc.formatStr(SPINE_ITEM_ATLAS, this.type));
                if (this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE) {
                    this.spine.setTimeScale(1 / SlotRule.RATE_FAST_MODE);
                }
                this.addChild(this.spine);
                this.adjustSpinePosition();
                
                if (this.type != SlotRule.ITEM_TYPE.WILD) {
                    oriItem.setType(SlotRule.ITEM_TYPE.WILD, this.mergeType, this.isGoldItem, this.canUse, false);
                    this.spine.setAnimation(0, "Symbol_Transfer", false);
                } else {
                    --this.canUse;
                    if (this.canUse > 0) {
                        oriItem.setType(SlotRule.ITEM_TYPE.WILD, this.mergeType, this.isGoldItem, this.canUse, false);
                        this.spine.setAnimation(0, cc.formatStr("Symbol_Num_Change_%d", this.canUse), false);
                    } else {
                        this.spine.setAnimation(0, "Symbol_Remove", false);
                        this.isGoldItem = false;
                    }
                }

                this.spine.setCompleteListener(() => {
                    this.stopHighlightAnimation();
                    this.scheduleOnce(() => {
                        this.spine.removeFromParent();
                        this.spine = null;
                    }, 0.1);
                })
                return;
            }

            let animate = null;
            if (this.type != SlotRule.ITEM_TYPE.WILD) {
                oriItem.setType(SlotRule.ITEM_TYPE.WILD, this.mergeType, this.isGoldItem, this.canUse, false);
                
                let actionTime = SlotRule.CHANGE_TO_WILD_TIME;
                if(this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE){
                    actionTime = SlotRule.CHANGE_TO_WILD_TIME * SlotRule.RATE_FAST_MODE;
                }

                let eliminateAnimation = getChangeToWildAnimation(this.type, this.mergeType,actionTime);
                let toWildEnd = cc.animate(Animation.get(cc.formatStr("TO_WILD_END_%d", this.mergeType)));
                animate = cc.sequence(
                    cc.animate(eliminateAnimation),
                    toWildEnd
                );
                this.setType(SlotRule.ITEM_TYPE.WILD, this.mergeType, this.isGoldItem, this.canUse);
            } else {
                --this.canUse;
                
                let actionTimeCountDown = SlotRule.COUNT_DOWN_WILD_TIME;
                let actionTimeEliminate = SlotRule.ELIMINATE_TIME;
                let actionTimeHighlight = SlotRule.HIGHLIGHT_TIME;
                if(this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE){
                    actionTimeEliminate = SlotRule.ELIMINATE_TIME * SlotRule.RATE_FAST_MODE;
                    actionTimeCountDown = SlotRule.COUNT_DOWN_WILD_TIME * SlotRule.RATE_FAST_MODE;
                    actionTimeHighlight = SlotRule.HIGHLIGHT_TIME * SlotRule.RATE_FAST_MODE;
                }
                
                if (this.canUse > 0) {
                    oriItem.setType(SlotRule.ITEM_TYPE.WILD, this.mergeType, this.isGoldItem, this.canUse, false);
                    let animation = getCoutDownWildAnimation(this.type, this.mergeType, this.canUse,actionTimeCountDown);
                    animate = cc.animate(animation);
                } else {
                    let eliminateAnimation = getEliminateAnimation(actionTimeEliminate, this.mergeType);
                    let animation = getHighlightAnimation(this.type, actionTimeHighlight, this.mergeType);
                    animate = cc.sequence(
                        cc.animate(animation),
                        cc.animate(eliminateAnimation)
                    );
                    this.isGoldItem = false;
                }
            }

            this.sprite.runAction(cc.sequence(
                animate,
                cc.callFunc(this.stopHighlightAnimation.bind(this))
            ));
        },

        showHighlightAnimation: function (isLastHighlightItem = false, oriItem = null, isLoop = false) {
            this.isLastHighlightItem = isLastHighlightItem;
            if (this.highlight) {
                return;
            }

            this.sprite.setVisible(true);
            this.sprite.setOpacity(255);

            if (oriItem != null) {
                oriItem.setVisible(false);
                this.oriItem = oriItem;
            }

            if (this.mergeType > SlotRule.ITEM_MERGE_TYPE.MERGE_1) {
                this.sprite.setVisible(false);
                this.spine = sp.SkeletonAnimation.createWithJsonFile(cc.formatStr(SPINE_ITEM_JSON, this.type), cc.formatStr(SPINE_ITEM_ATLAS, this.type));
                if (this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE) {
                    this.spine.setTimeScale(1 / SlotRule.RATE_FAST_MODE);
                }
                this.addChild(this.spine);     
                this.adjustSpinePosition();

                this.spine.setAnimation(0, "Symbol_Remove", false);
                this.spine.setCompleteListener(() => {
                    this.stopHighlightAnimation();
                    this.scheduleOnce(() => {
                        this.spine.removeFromParent();
                        this.spine = null;
                    }, 0.1);
                })
                return;
            }

            this.highlight = true;
            this.setLocalZOrder(this.getLocalZOrder() + ViewStyle.ITEM_ORDER.HIGHLIGHT_CHANGE);

            let actionTime = SlotRule.HIGHLIGHT_TIME;
            if(this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE){
                actionTime = SlotRule.HIGHLIGHT_TIME * SlotRule.RATE_FAST_MODE;
            }

            let animation = getHighlightAnimation(this.type, actionTime, this.mergeType);
            let animate = cc.animate(animation);

            let eliminateTime = SlotRule.ELIMINATE_TIME;
            if(this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE){
                eliminateTime = SlotRule.ELIMINATE_TIME * SlotRule.RATE_FAST_MODE;
            }

            let eliminateAnimation = getEliminateAnimation(eliminateTime, this.mergeType);
            let eliminateAnimate = cc.animate(eliminateAnimation);

            this.sprite.runAction(cc.sequence(
                animate,
                eliminateAnimate,
                cc.callFunc(this.stopHighlightAnimation.bind(this))
            ));
        },

        stopHighlightAnimation: function (isStopScatter = true) {
            if (this.isEliminating || (this.isPlayingScatter && !isStopScatter && !this.isShowScatter)) {
                return;
            }

            if (this.isPlayingScatter) {
                this.setLocalZOrder(this.getLocalZOrder() - ViewStyle.ITEM_ORDER.SCATTER);
                if (this.spine != null) {
                    this.spine.removeFromParent()
                    this.spine = null;
                }
            }

            if (this.highlight == true) {
                this.setLocalZOrder(this.getLocalZOrder() - ViewStyle.ITEM_ORDER.HIGHLIGHT_CHANGE);
            }
            this.highlight = false;
            this.isPlayingScatter = false;
            this.sprite.stopAllActions();

            if (this.oriItem != null) {
                if (this.canUse > 0) {
                    this.oriItem.setVisible(true);
                }
                if(isStopScatter){
                    this.oriItem.setVisible(true);
                }
                this.oriItem = null;
            }

            if (this.isSpinning) {
                this.setSpinningType(this.type);
            } else {
                this.setType(this.type);
            }

            if (this.isLastHighlightItem) {
                this.isLastHighlightItem = false;
                this.commander.emit("slot.turnOffHighlightItems");
                // this.commander.emit("slot.highlightScatter.done");
            }

            if (this.isItemHighlight) {
                this.setVisible(false);
            }
        }
    });

    // Contants
    Item.ITEM_TYPE = SlotRule.ITEM_TYPE;

    window.Item = Item;
    return Item;
});