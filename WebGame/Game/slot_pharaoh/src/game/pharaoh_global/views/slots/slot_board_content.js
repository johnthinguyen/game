/*global define */

Module.define(function (require) {
    "use strict";
    const SlotBoardContent = cc.Class.extend({
        ctor: function (slotManager, commander, options) {
            this.slotManager = slotManager;
            this.commander = commander;
            this.slotReels = [];
            // this.slotReelTops = [];
            this.listWinItems = [];
            // this.listWinTopItems = [];

            this.mainNode = options.node;

            this.isSpinning = false;

            this.timeOut = null;
            this.reelWidthCenter = 0;
            this.numFreeSpin = 0;
            this.freeGameComboHighlight = -1;

            this.numbScatter = 0;
        },

        initComponents: function () {
            this.pnlSlotReels = this.mainNode.getChildByName("panel_reels_container");
            this.pnlSlotReels.reels = [];
            let index = 0;
            let indexLenghtReel = 0;
            let arrResultIntro = [];
            // this.pnlSlotReelTops = this.mainNode.getChildByName("panel_reel_top_container");
            // this.pnlSlotReelTops.reels = [];

            for (let i = 0; i < SlotRule.REELS; i++) {
                let child = this.pnlSlotReels.getChildByName("panel_reel_" + i);
                let reel = new SlotReelItem(this.commander, this.slotManager, child, this.pnlSlotReels, this.mainNode, i, false);
                reel.initNormalSpinItem(SlotRule.INIT_TYPE);
                console.log({arrResultIntro});
                reel.introGame(SlotRule.INTRO_REELS[i], SlotRule.INTRO_MERGE_ITEM[i], SlotRule.INTRO_GOLD_ITEM[i], SlotRule.INTRO_REELS_LENGTH[i]);
                reel.initHighlightItem();
                this.slotReels.push(reel);
                this.pnlSlotReels.reels.push(child);

            }


            this.reelWidthCenter = this.pnlSlotReels.reels[0].getContentSize().width * 0.5;

            this.pnlWinLines = this.mainNode.getChildByName("panel_win_lines");
            this.pnlWinLines.valueWinLine = this.pnlWinLines.getChildByName("value_win_lines");
            this.pnlWinLines.logoGameName = this.pnlWinLines.getChildByName("pharaoh_sprite");
            this.pnlWinLines.pnlFg = this.pnlWinLines.getChildByName("panel_fg");
            this.pnlWinLines.pnlFg.setVisible(false);
            this.pnlWinLines.valueWinLine.setString(7500);
            

            this.panelFreeGameInfo = this.mainNode.getChildByName("panel_free_game_info");
            this.panelFreeGameInfo.setLocalZOrder(-1);
            this.panelFreeGameInfo.setVisible(false);


            this.panelMultiPlier = this.mainNode.getChildByName("panel_multiplier");
            this.panelMultiPlier.rePeatLight = this.panelMultiPlier.getChildByName("light_item");
            let fadeOut = cc.fadeOut(0.5);
            let fadeIn = cc.fadeIn(0.5);
            let flickerAnimation = cc.sequence(fadeOut, fadeIn);
            let repeatFlicker = cc.repeatForever(flickerAnimation);
            this.panelMultiPlier.rePeatLight.runAction(repeatFlicker);

            // let textEliminate = this.panelFreeGameInfo.getChildByName("text_eliminate_time");
            // ImageUtils.localizeSpriteText(textEliminate,Resource.SPRITES.TEXT_ELIMINATE);
            // ImageUtils.rollWidget({
            //     widget: textEliminate,
            //     size: cc.size(this.panelFreeGameInfo.getContentSize().width, textEliminate.getContentSize().height)
            // });

            // let textFreeSpins = this.panelFreeGameInfo.getChildByName("text_free_spins");
            // ImageUtils.localizeSpriteText(textFreeSpins,Resource.SPRITES.TEXT_FREE_SPINS);
            // ImageUtils.rollWidget({
            //     widget: textFreeSpins,
            //     size: cc.size(this.panelFreeGameInfo.getContentSize().width, textFreeSpins.getContentSize().height)
            // });
            
            // this.valueEliminateTime = this.panelFreeGameInfo.getChildByName("value_eliminate_time");
            // this.valueFreeSpin = this.panelFreeGameInfo.getChildByName("value_free_spins");

            //-------------------NEAR WIN SPINE-------------------------

            // this.fxReelNearWinNode = this.mainNode.getChildByName("fx_near_win_node");
            // this.fxReelNearWin = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_FX_REEL_NEAR_WIN_JSON, Resource.ASSETS.SPINE_FX_REEL_NEAR_WIN_ATLAS);
            // this.fxReelNearWinNode.addChild(this.fxReelNearWin);
            // this.fxReelNearWinNode.setVisible(false);
            // this.fxReelNearWinNode.setLocalZOrder(ViewStyle.BOARD_ORDER.FX_NEAR_WIN);


            //-------------------MULTIPLIER SPINE-------------------------

            this.fxMultiplier = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.SPINE_MULTIPLIER_FG_JSON, Resource.ASSETS.SPINE_MULTIPLIER_FG_ATLAS);
            this.panelFreeGameInfo.addChild(this.fxMultiplier);
            this.fxMultiplier.setAnchorPoint(cc.p(0.5, 0.5));
            this.fxMultiplier.setNormalizedPosition(cc.p(0.5, 0.62));
            this.fxMultiplier.setVisible(false);
            this.fxMultiplier.setLocalZOrder(ViewStyle.BOARD_ORDER.FX_NEAR_WIN);

            //-------------------draw lines panel-------------------------
            if (!SlotRule.DRAWLINE_ENABLED) {
                return;
            }

            this.lineContainer = new ccui.Layout();
            this.lineContainer.setContentSize(this.pnlSlotReels.getContentSize());
            this.pnlSlotReels.addChild(this.lineContainer);
            this.lineContainer.setNormalizedPosition(cc.p(0, 0));

            this.line1 = new cc.DrawNode();
            this.line2 = new cc.DrawNode();
            this.line3 = new cc.DrawNode();
            this.line4 = new cc.DrawNode();

            this.lineContainer.addChild(this.line1);
            this.lineContainer.addChild(this.line2);
            this.lineContainer.addChild(this.line3);
            this.lineContainer.addChild(this.line4);

            this.lineContainer.setVisible(true);
            this.lineContainer.setLocalZOrder(99999999);

            this.drawLines = [this.line1, this.line2, this.line3, this.line4];
        },

        updateScaleResolution: function () {
            this.mainNode.setScale(ImageUtils.getFitScale());
            this.mainNode.setPosition(cc.p(cc.visibleRect.width * 0.5, cc.visibleRect.height * 0.45));
            this.initComponents();
        },

        lineTextAnimation: function (actionTime) {
            this.lineText.runAction(cc.sequence(
                cc.blink(actionTime, 4),
                cc.callFunc(() => {
                    this.lineText.setVisible(true);
                })
            ));
        },

        setTextInfo: function (content) {
            this.lineText.setVisible(true)
            this.lineText.setString(content);
            this.lineTextAnimation(2.8);
        },

        startSpin: function (isInFreeGame = false) {
            this.isSpinning = true;
            this.numbScatter = 0;
            this.pnlWinLines.valueWinLine.setString(0);

            // Start spin for each reel
            this.slotReels.forEach((reel) => {
                reel.startSpin(0, isInFreeGame);
            });

            // this.slotReelTops.forEach((reel) => {
            //     reel.startSpin(0, isInFreeGame);
            // });
        },

        forceStopSpinImmediately: function () {
            this.mainNode.stopAllActions();
            for (let i = 0, n = SlotRule.REELS; i < n; i++) {
                let reel = this.slotReels[i];
                reel.stopSpinImmediately();
                reel.unscheduleUpdate()
            }
        },

        forceStopSpin: function (delayTimePerReel = SlotRule.TIME_DELAY_STOP_PER_REEL) {

            if (!cc.sys.isObjectValid(this.mainNode))
                return;

            if (!this.isSpinning) {
                return;
            }

            //let startSpeedUpReel = this.slotManager.startSpeedUpReel;
            // let topReel = this.slotReelTops[0];

            // this.mainNode.runAction(cc.sequence(
            //     cc.delayTime(SlotRule.MIN_DELAY_STOP_REEL),
            //     cc.callFunc(topReel.stopSpin.bind(topReel, SlotRule.FORCE_STOP_TOP_REELS_DATA, null, null, this.completeReel.bind(this, 0, startSpeedUpReel),0))
            // ));

            for (let i = 0, n = SlotRule.REELS; i < n; i++) {
                let reel = this.slotReels[i];
                this.mainNode.runAction(cc.sequence(
                    cc.delayTime(SlotRule.MIN_DELAY_STOP_REEL + i * (delayTimePerReel - 0.13)),
                    cc.callFunc(reel.stopSpin.bind(reel, SlotRule.INTRO_REELS[i], SlotRule.INTRO_MERGE_ITEM[i], SlotRule.INTRO_GOLD_ITEM[i], this.completeReel.bind(this, i, 5),0))
                ));
            }
        },

        stopSpin: function (delayTimePerReel = SlotRule.TIME_DELAY_STOP_PER_REEL) {
            // Make sure command is valid
            if (!this.isSpinning) {
                return;
            }

            if(this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE){
                delayTimePerReel = 0;
            }

            let startSpeedUpReel = this.slotManager.startSpeedUpReel;
            cc.log("--------- scatterReelIndex  ", startSpeedUpReel)

            // for (let i = 0, n = 1; i < n; i++) {
            //     let reel = this.slotReelTops[i];
            //     let reelIndex = i;

            //     this.mainNode.runAction(cc.sequence(
            //         cc.delayTime(SlotRule.MIN_DELAY_STOP_REEL + reelIndex * (delayTimePerReel)),
            //         cc.callFunc(reel.stopSpin.bind(reel, this.slotManager.slotItemReelTop, null, null, this.completeReel.bind(this, reelIndex, startSpeedUpReel), this.numbScatter))
            //     ));
            // }

            for (let i = 0, n = SlotRule.REELS; i < n; i++) {
                let reel = this.slotReels[i];
                let reelIndex = i;
                let delayTime = 0;
                let delayTimeStartSpeedUp = 0;
                if (reelIndex > startSpeedUpReel && delayTimePerReel > 0) {
                    delayTimeStartSpeedUp = SlotRule.TIME_DELAY_STOP_NEAR_WIN_REEL * (i - 1 - startSpeedUpReel);
                    delayTime = SlotRule.TIME_DELAY_STOP_NEAR_WIN_REEL;
                }

                if (reelIndex == 5) {
                    console.log({stopSpin123: this.slotManager.listCanUseTimes[reelIndex]});
                }
                this.mainNode.runAction(cc.sequence(
                    cc.delayTime(SlotRule.MIN_DELAY_STOP_REEL + reelIndex * (delayTimePerReel)),
                    cc.delayTime(delayTimeStartSpeedUp),
                    cc.callFunc(() => {
                        if (delayTime > 0) {
                            this.showEffectNearWin(reelIndex);
                        }
                    }),
                    cc.delayTime(delayTime),
                    cc.callFunc(this.countScatter(this.slotManager.slotItemReels[reelIndex])),
                    cc.callFunc(this.showEffectLinesCanWin.bind(this,reelIndex,reelIndex == SlotRule.REELS - 1)),
                    
                    cc.callFunc(reel.stopSpin.bind(reel, this.slotManager.slotItemReels[reelIndex], this.slotManager.mergeItemInReels[reelIndex], this.slotManager.listCanUseTimes[reelIndex], this.completeReel.bind(this, reelIndex, startSpeedUpReel), this.numbScatter, this.slotManager.reelLenghtResult[reelIndex]))
                ));
            }
        },

        countScatter: function (reel) {
            if (this.numbScatter < 3 && this.numbScatter + SlotRule.getNumScatterInReel(reel) >= 3) {
                this.willStartScatterWait = true;
            } else {
                this.willStartScatterWait = false;
            }
            this.numbScatter += SlotRule.getNumScatterInReel(reel);
        },

        showEffectNearWin: function (reelIndex, timeScale = 1) {
            cc.log("show effect near win at reel: ",reelIndex);
            AudioHandler.stopReelNearWin();
            AudioHandler.playReelNearWin();
            this.isShowEffectNearWin = true;
            this.commander.emit("slot.playScatter.wait", reelIndex);
            this.fxReelNearWinNode.setPosition(this.pnlSlotReels.reels[reelIndex].getPositionX() + 50, this.pnlSlotReels.reels[reelIndex].getPositionY() * 1.2);
            this.fxReelNearWin.setOpacity(0);

            this.fxReelNearWin.clearTrack(0);
            this.fxReelNearWin.setToSetupPose();
            this.fxReelNearWin.stopAllActions();

            this.fxReelNearWinNode.setOpacity(255);
            this.fxReelNearWinNode.setVisible(true);

            this.fxReelNearWin.runAction(cc.sequence(
                cc.show(),
                cc.fadeIn(0.2)
            ));

            this.fxReelNearWin.setTimeScale(timeScale);
            this.fxReelNearWin.setAnimation(0, "FG_Frame_Light", true);
        },

        hideEffectNearWin: function () {
            this.isShowEffectNearWin = false;
            cc.log("hide effect near win");
            AudioHandler.stopReelNearWin();

            this.fxReelNearWin.runAction(cc.sequence(
                cc.fadeOut(0.2),
                cc.hide(),
                cc.callFunc(() => {
                    this.fxReelNearWinNode.setVisible(false);
                    this.fxReelNearWin.clearTrack(0);
                    this.fxReelNearWin.setToSetupPose();
                })
            ))

        },

        completeReel: function (indexReel, startSpeedUpReel) {
            let targetIndex = SlotRule.REELS - 1;

            if (indexReel === targetIndex) {
                this.commander.emit("slot.spinStopped");
                this.stopWaitScatter();
                this.isSpinning = false;
            }
        },

        onBeforeReelStop: function (reelIndex) {
            let targetIndex = SlotRule.REELS - 1;
            if (!this.slotManager.isAutoSpin || (this.slotManager.isAutoSpin && !SlotRule.IS_AUTO_FAST_MODE)) {
                AudioHandler.playReelStop();
            }

            if (reelIndex === targetIndex) {
                if (this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE) {
                    AudioHandler.playReelStop();
                }

                if (this.isShowEffectNearWin) {
                    this.hideEffectNearWin();
                }
            }
        },

        turnOffHighlightItems: function (isStopScatter = true) {
            if (cc.isArray(this.slotReels)) {
                this.slotReels.forEach(function (reel) {
                    reel.turnOffHighlightItems(isStopScatter);
                });
            }
        },

        // disableColorAllItems: function () {
        //     this.slotReels.forEach((reel) => {
        //         for (let i = -1; i <= SlotRule.ITEMS_PER_REEL; i++) {
        //             let item = reel.getItem(i);
        //             item.setEnabledColor(false);
        //         }
        //     })
        // },

        highlightWinItems: function (lineWinResults, lineWinTops, isShowAll) {
            this.listWinItems = [];
            //this.listWinTopItems = [];
            for (let i = 0; i < SlotRule.REELS; i++) {
                this.listWinItems[i] = [];
            }

            //board
            for (let reelIndex = 0; reelIndex < lineWinResults.length; reelIndex++) {
                let itemWinInReel = lineWinResults[reelIndex];
                let idxReel = reelIndex;

                for (let i = 0; i < itemWinInReel.length; i++) {
                    let index = i;
                    let itemIndex = itemWinInReel[i];
                    let item = this.slotReels[reelIndex].getItem(itemIndex);
                    let itemHighlight = this.slotReels[reelIndex].getHighlightItem(itemIndex);
                    itemHighlight.setType(item.getType(), item.getMergeType(), item.getIsGoldItem(), item.getRemainUse());
                    if (itemHighlight.getIsGoldItem()) {
                        AudioHandler.playEffectSymbolChange();
                        //is gold item => show change to wild
                        this.mainNode.scheduleOnce(
                            itemHighlight.showChangeToWild.bind(
                                itemHighlight, index == (itemWinInReel.length - 1) && idxReel == (lineWinResults.length - 1), item
                            ), 0.1
                        );
                    } else {
                        this.mainNode.scheduleOnce(
                            itemHighlight.showHighlightAnimation.bind(
                                itemHighlight, index == (itemWinInReel.length - 1) && idxReel == (lineWinResults.length - 1), item
                            ), 0.1
                        );
                    }
                                        
                    if (item.getIsGoldItem() && item.getType() == SlotRule.ITEM_TYPE.WILD && item.getRemainUse() == 1) {
                        for (let i = 0; i < item.getMergeType(); i++) {
                            this.listWinItems[reelIndex].indexOf(itemIndex + i + 1) < 0 && this.listWinItems[reelIndex].push(itemIndex + i + 1);
                        }
                        this.listWinItems[reelIndex].indexOf(itemIndex) < 0 && this.listWinItems[reelIndex].push(itemIndex);
                    }

                    if (!item.getIsGoldItem()) {
                        this.listWinItems[reelIndex].indexOf(itemIndex) < 0 && this.listWinItems[reelIndex].push(itemIndex);
                        if (item.getMergeType() > 0) {
                            for (let i = 0; i < item.getMergeType(); i++) {
                                this.listWinItems[reelIndex].indexOf(itemIndex + i + 1) < 0 && this.listWinItems[reelIndex].push(itemIndex + i + 1);
                            }
                        }
                    }
                }
            }
            AudioHandler.clearEffectSymbolChange();

            //top
            // for (let idx = 0; idx < lineWinTops.length; idx++) {
            //     let itemIndex = lineWinTops[idx];
            //     let item = this.slotReelTops[0].getItem(itemIndex);
            //     let itemHighlight = this.slotReelTops[0].getHighlightItem(itemIndex);
            //     itemHighlight.setType(item.getType());
            //     this.mainNode.scheduleOnce(itemHighlight.showHighlightAnimation.bind(itemHighlight, idx == (lineWinTops.length - 1), item), 0.1);

            //     this.listWinTopItems.indexOf(itemIndex) < 0 && this.listWinTopItems.push(itemIndex);
            // }

            let destroyTime = SlotRule.HIGHLIGHT_TIME + SlotRule.ELIMINATE_TIME;
            if(this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE){
                destroyTime = (SlotRule.HIGHLIGHT_TIME * SlotRule.RATE_FAST_MODE) + (SlotRule.ELIMINATE_TIME * SlotRule.RATE_FAST_MODE);
            }

            this.mainNode.scheduleOnce(() => {
                this.destroyItem();
            }, destroyTime);
        },

        startWaitScatter: function (reelStartWaitIndex) {
            // if (reelStartWaitIndex == SlotRule.REELS - 1) {
            //     return;
            // }

            this.isScatterWaiting = true;
            for (let reelIndex = 0; reelIndex < reelStartWaitIndex; reelIndex++) {
                if (SlotRule.isReelHaveScatter(this.slotManager.slotItemReels[reelIndex])) {
                    let reel = this.slotReels[reelIndex];
                    for (let itemIndex = 0; itemIndex < SlotRule.ITEMS_PER_REEL; itemIndex++) {
                        let item = reel.getItem(itemIndex);
                        if (item.getType() == SlotRule.ITEM_TYPE.SCATTER) {
                            let highlightItem = reel.getHighlightItem(itemIndex);
                            highlightItem.setType(item.getType(), item.getMergeType());
                            highlightItem.playAnimScatter(item, Animation.SCATTERS.WAIT, false);
                        }
                    }
                }
            }
        },

        stopWaitScatter: function () {
            cc.log("stop wait scatter");
            if (!this.isScatterWaiting) {
                return;
            }

            this.isScatterWaiting = false;
            if (this.numbScatter >= 4) {
                return;
            }

            for (let reelIndex = 0; reelIndex < SlotRule.REELS; reelIndex++) {
                if (SlotRule.isReelHaveScatter(this.slotManager.slotItemReels[reelIndex])) {
                    let reel = this.slotReels[reelIndex];
                    for (let itemIndex = 0; itemIndex < SlotRule.ITEMS_PER_REEL; itemIndex++) {
                        let item = reel.getItem(itemIndex);
                        if (item.getType() == SlotRule.ITEM_TYPE.SCATTER) {
                            let highlightItem = reel.getHighlightItem(itemIndex);
                            highlightItem.setType(item.getType(), item.getMergeType());
                            highlightItem.stopHighlightAnimation(true);
                        }
                    }
                }
            }
        },

        highlightScatter: function (scatterReelIndex = []) {
            scatterReelIndex.length > 0 && scatterReelIndex.forEach((reelIndex) => {
                let reel = this.slotReels[reelIndex];
                for (let itemIndex = 0; itemIndex < SlotRule.ITEMS_PER_REEL; itemIndex++) {
                    let item = reel.getItem(itemIndex);
                    if (item.getType() == SlotRule.ITEM_TYPE.SCATTER) {
                        let highlightItem = reel.getHighlightItem(itemIndex);
                        highlightItem.setType(item.getType(), item.getMergeType());
                        highlightItem.playAnimScatter(item, Animation.SCATTERS.GET, false);
                        continue;
                    }
                }
            })
        },

        highlightExtraSpin: function () {
            AudioHandler.playFreeGameItem();
            // this.disableColorAllItems();
            let lastItem;
            this.slotReels.forEach((reel) => {
                for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
                    let item = reel.getItem(i);
                    if (false) {
                        let itemHighlight = reel.getHighlightItem(i);
                        itemHighlight.setType(item.getType(), item.getMergeType());
                        itemHighlight.showHighlightAnimation(false, item, false);
                        lastItem = itemHighlight;
                    }
                }
            })
            lastItem.isLastHighlightItem = true;
        },

        // showPanelWinCoin: function (winCoin) {
        //     this.panelWinCoin.text.setScale(0.95);
        //     this.panelWinCoin.text.setOpacity(255);
        //     this.panelWinCoin.text.setString(0);
        //     TextUtils.tweenCoin(this.panelWinCoin.text, 0, winCoin, 0.5, this.hidePanelWinCoin.bind(this), true);
        //     this.panelWinCoin.setScale(0.1);
        //     this.panelWinCoin.setOpacity(255);
        //     this.panelWinCoin.runAction(cc.sequence(
        //         cc.show(),
        //         cc.scaleTo(0.3, 0.8).easing(cc.easeBackOut(2))
        //     ));
        // },

        // hidePanelWinCoin: function () {
        //     this.panelWinCoin.setScale(0.8);
        //     this.panelWinCoin.stopAllActions();
        //     this.panelWinCoin.runAction(cc.sequence(
        //         cc.delayTime(0.5),
        //         cc.callFunc(() => {
        //             this.panelWinCoin.text.runAction(cc.spawn(
        //                 new cc.EaseSineIn(cc.scaleTo(0.5, 0.1)),
        //                 cc.fadeOut(0.25)
        //             ));
        //         }),
        //         cc.fadeOut(0.5),
        //         cc.hide()
        //     ));
        // },

        isExitItem: function (items, itemID) {
            for (let item of items) {
                if (item === itemID)
                    return true;
            }
            return false;
        },

        drawLine: function (lineId) {
            for (let i = 0; i < SlotRule.REELS - 1; i++) {
                this.drawLines[i].clear();
            }

            if (lineId <= 0) {
                return;
            }

            let winLine = SlotRule.WIN_LINE[lineId];
            let drawPos = [];

            for (let i = 0; i < SlotRule.REELS; i++) {
                let item = this.slotReels[i].getItem(winLine[i]);
                let pos = this.pnlSlotReels.reels[i].convertToWorldSpace(item.getPosition());
                pos = this.pnlSlotReels.convertToNodeSpace(pos);
                pos.x += this.reelWidthCenter;
                drawPos.push(pos);
            }

            for (let i = 0; i < SlotRule.REELS - 1; i++) {
                this.drawLines[i].drawSegment(drawPos[i], drawPos[i + 1], 3, cc.color("#fdff1f"));
            }
        },

        getSlotReel: function () {
            return this.slotReels;
        },

        itemIsnotHide: function (arrayIndexItem) {
            //return -1 if all items are hide
            let result = -1;
            for (let idx = 0; idx < arrayIndexItem.length; idx++) {
                if (arrayIndexItem[idx] != null && arrayIndexItem[idx] != -1) {
                    result = idx;
                }
            }
            return result;
        },

        updateBoardItems: function () {
            //board
            for (let i = 0; i < SlotRule.REELS; i++) {
                let itemTypes = this.slotManager.slotItemReels[i];
                let mergeItems = this.slotManager.mergeItemInReels[i];
                let canUses = this.slotManager.listCanUseTimes[i];
                let reel = this.slotReels[i];
                //cc.log("updateBoardItems: %j", itemTypes);
                //cc.log("updateBoardMergeItems: %j", mergeItems);
                reel.updateItemType(itemTypes, mergeItems, canUses);
                reel.getItem(-1).setType(this.slotManager.listTopItems[i]);
                let isLastReel = i == SlotRule.REELS - 1;
                let delayTime = SlotRule.TIME_DELAY_COLLAPSE_PER_REEL;
                reel.collapseItems(isLastReel, delayTime);
            }
            //top
            // let itemTopTypes = this.slotManager.slotItemReelTop;
            // let reelTop = this.slotReelTops[0];
            // //cc.log("updateTopItems: %j",itemTopTypes);
            // reelTop.updateItemType(itemTopTypes);
            // reelTop.collapseTopItems(SlotRule.TIME_DELAY_COLLAPSE_PER_REEL);
            this.updateLinesCanWin();
        },

        showEffectFreeSpinAdded: function(numFreeSpin){
            this.valueFreeSpin.runAction(cc.sequence(
                // cc.delayTime(0.4),
                    cc.callFunc(() =>{
                        this.valueFreeSpin.setGlobalZOrder(1);
                        this.valueFreeSpin.setString(numFreeSpin);
                    }),
                    cc.scaleTo(0.1, 1.5),
                    cc.delayTime(0.25),
                    cc.scaleTo(0.1, 1),
                    cc.callFunc(() =>{
                        this.valueFreeSpin.setGlobalZOrder(0);
                    })
            ))

        },

        destroyItem: function () {
            //top
            // let reelTop = this.slotReelTops[0];
            // if (reelTop) {
            //     reelTop.turnOffHighlightItems();
            //     reelTop.destroyItem(this.listWinTopItems, false);
            // }

            //board
            for (let i = 0; i < SlotRule.REELS; i++) {
                let reel = this.slotReels[i];

                if (!reel)
                    continue;

                reel.turnOffHighlightItems();
                this.listWinItems[i].sort(function (a, b) {
                    return a - b;
                });
                let isLastReel = i == SlotRule.REELS - 1 ? true : false;

                reel.destroyItem(this.listWinItems[i], isLastReel);
            }
        },

        highlightEliminate: function () {
            cc.log("highlight eliminate");
            this.fxMultiplier.runAction(cc.sequence(
                cc.show(),
                // cc.fadeIn(0.5),
                cc.callFunc(() => {
                    this.fxMultiplier.clearTrack(0);
                    this.fxMultiplier.setToSetupPose();
                    this.fxMultiplier.setOpacity(255);
                    this.fxMultiplier.setVisible(true);
                    this.fxMultiplier.setAnimation(0, "FG_Multiplier", false);
                }),
                cc.delayTime(0.5),
                cc.fadeOut(0.5),
                cc.hide()
            ))
        },

        updatePanelFreeGame: function (isShow, numFreeSpin = 0, freeGameEliminate = 0, numExtraSpin = 0) {
            this.numFreeSpin = numFreeSpin + numExtraSpin;
            if (isShow) {
                if (numExtraSpin > 0) {
                    // this.valueFreeSpin.setGlobalZOrder(1);
                    this.valueFreeSpin.runAction(cc.sequence(
                        cc.callFunc(() => {
                            this.valueFreeSpin.setString(this.numFreeSpin);
                        }),
                        // cc.scaleTo(0.4, 0.75).easing(cc.easeBackOut(2)),
                        // cc.scaleTo(0.4, 0.5).easing(cc.easeBackOut(2)),
                        cc.delayTime(0.5),
                        cc.callFunc(() => {
                            // this.valueFreeSpin.setGlobalZOrder(0);
                            this.commander.emit("slot.showExtraSpin.done");
                        })
                    ));
                } else {
                    return;
                    this.valueFreeSpin.setString(this.numFreeSpin);
                }
                if (this.slotManager.hasWinSlots())
                    this.highlightEliminate();

                if (!this.panelFreeGameInfo.isVisible()) {
                    this.panelFreeGameInfo.runAction(cc.sequence(
                        cc.show()
                    ));
                }
            } else {
                this.valueFreeSpin.setString(0);
                // this.panelFreeGameInfo.setPositionY(this.mainNode.getContentSize().height * 0.985);
                this.panelFreeGameInfo.runAction(cc.sequence(
                    // cc.moveTo(0.5, cc.p(this.panelFreeGameInfo.getPositionX(), this.mainNode.getContentSize().height * 0.8)),
                    cc.hide()
                ));
            }
        },

        showFreeGameEliminateCount: function (freeGameEliminate) {
            return;
            AudioHandler.playIncreaseEliminate();
            this.valueEliminateTime.setString("X" + freeGameEliminate);
            this.valueEliminateTime.setOpacity(255);
            // this.valueEliminateTime.runAction(cc.sequence(
            //     cc.show(),
            //     cc.fadeIn(0.2),
            //     cc.delayTime(0.7),
            //     cc.fadeOut(0.3),
            //     cc.hide()
            // ));
        },

        showEffectLinesCanWin: function(reelIndex,isLastReel = false){
            
            if(isLastReel){
                this.pnlWinLines.valueWinLine.setString(this.slotManager.lineCanWin);
                return;
            }

            let count = 1
            for(let i = 0; i <= reelIndex;i++){
                count *= 5;
            }
            this.pnlWinLines.valueWinLine.setString(count);
        },

        updateLinesCanWin: function(){
            this.pnlWinLines.valueWinLine.setString(this.slotManager.lineCanWin);
        },
    });

    window.SlotBoardContent = SlotBoardContent;
    return SlotBoardContent;
});