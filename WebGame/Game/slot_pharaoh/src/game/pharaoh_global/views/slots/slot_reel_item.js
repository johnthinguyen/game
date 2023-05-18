/*global define */

Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::SlotReel]";

    const BUFFER_ITEM_COUNT = 16;

    const ROLLING_ACCEL = 0;
    const ROLLING_SPEED = 4000; // pixel/s
    // const ROLLING_SPEED_UP = 5000;
    const STOP_ROLLING_OFFSET = 0;    // NOTE: Make sure this offset donot cause overflow, 0 is always best fit value

    const TARGET_FPS = 60.0;
    const TARGET_DELTA_TIME = 1.0 / TARGET_FPS;

    const SlotReelItem = cc.Node.extend({
        ctor: function (commander, slotManager, parent, container, board, reelIndex, isReelTop, showItems = SlotRule.ITEMS_PER_REEL, bufferCount = BUFFER_ITEM_COUNT) {
            this._super();

            this.commander = commander;
            this.slotManager = slotManager;

            this.container = container;
            this.board = board;
            this.reelIndex = reelIndex;

            let size = parent.getContentSize();
            this.setAnchorPoint(cc.p(0.5, 0.5));
            this.setPosition(cc.p(size.width * 0.5, 0));
            parent.addChild(this);

            this.items = [];
            this.highlightItems = [];

            this.reelLenght = SlotRule.ITEMS_PER_REEL;
            console.log({reelLenght:this.reelLenght});
            // showItems = 4; 
            this.itemSize = cc.size(size.width, size.height / this.reelLenght);
            // if (isReelTop) {
            //     this.itemSize = cc.size((size.width / 4) * 0.98, size.height);
            // }
            this.showItems = showItems;
            this.bufferCount = bufferCount;

            this.limitPosY = -((bufferCount - showItems - 6) * 0.55 * this.itemSize.height);
            this.startPosY = this.limitPosY + bufferCount * this.itemSize.height;

            this.limitPosX = -((bufferCount - 9) * 0.42 * this.itemSize.width);
            this.startPosX = this.limitPosX + bufferCount * this.itemSize.width;

            this.posX = parent.getPositionX();
            this.posYtop = parent.getPositionY();

            this.anim = sp.SkeletonAnimation.createWithJsonFile(Resource.ASSETS.STOP_REEL_SMOKE_JSON, Resource.ASSETS.STOP_REEL_SMOKE_ATLAS);
            this.anim.setVisible(false);
            this.anim.setPosition(cc.p(parent.getPositionX(), parent.height * 0.105));

            this.container.addChild(this.anim, ViewStyle.LAYER_ORDER.EFFECT);

            // Fields for update, we use fixed-deltaTime update loop
            // @ref: https://gameprogrammingpatterns.com/update-method.html
            // @ref: https://gameprogrammingpatterns.com/game-loop.html
            this.elapsedTime = 0.0;
            this.isUpdating = false; // Is update scheduling
            this.isSpinning = false;
            this.currSpeed = 0.0;

            this.isReelTop = isReelTop;
        },

        initNormalSpinItem: function (initType) {
            let posY = this.startPosY;
            let item;
            this.itemsPosY = [];
            for (let i = 0; i < this.bufferCount; i++) {
                item = new Item(this.commander, this.slotManager, false, false, this.itemSize);
                this.container.addChild(item);
                this.itemsPosY.push(posY);
                item.setPosition(cc.p(this.posX, posY));
                item.setType(initType);
                posY -= this.itemSize.height;

                this.items[i] = item;
            }
        },

        initNormalSpinItemTop: function (initType) {
            let posX = this.startPosX;
            let item;
            this.itemPosX = [];
            for (let i = 0; i < this.bufferCount; i++) {
                item = new Item(this.commander, this.slotManager, false, true, this.itemSize);
                this.container.addChild(item);
                this.itemPosX.push(posX);
                item.setAnchorPoint(0.5, 0.5);
                item.setPosition(cc.p(posX, this.posYtop));
                item.setType(initType);
                posX -= (this.itemSize.width * 1.025);
                this.items[i] = item;
            }
        },

        introGame: function(expectTypes, mergeItems, canUses, reelLength){
            console.log({expectTypes, mergeItems});
            let posYbuffer = 0;
            for (let i = 0; i < this.showItems; i++) {
                let item = this.getItem(i);
                let nextItem = this.getItem(i+1);
                if (i < reelLength) {
                    let type = expectTypes[i];
                    // let mergeType = mergeItems[i];
                    let canUse = canUses[i];
                    let isGoldItem = canUse > 0;
                    item.setType(type, mergeItems, isGoldItem);
                    let posY = item.y;
                    if (i > 0) {
                        switch (reelLength) {
                            case 6:
                                posY = nextItem.y + (item.height * (0.9 - posYbuffer));
                                posYbuffer += 0.16; 
                                break;
                            case 5:
                                posY = nextItem.y + (item.height * (0.63 - posYbuffer));
                                posYbuffer += 0.38; 
                                break;
                            case 4:
                                posY = nextItem.y + (item.height * (0.29 - posYbuffer));
                                posYbuffer += 0.72; 
                                break;
                            case 3:
                                posY = nextItem.y + (item.height * (-0.285 - posYbuffer));
                                posYbuffer += 1.3; 
                                break;
                            case 2:
                                posY = nextItem.y + (item.height * (-1.4));
                                break;
                        
                            default:
                                break;
                        }  
                    }
           
                    item.setPosition(cc.p(item.x, posY));
                } else {
                    item.setType(-1, 0, false);
                }
              
            }
        },

        initHighlightItem: function () {
            let item;
            for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
                item = new Item(this.commander, this.slotManager, true, this.isReelTop, this.itemSize);
                this.board.addChild(item, ViewStyle.BOARD_ORDER.HIGHLIGHT_ITEM + i);
                let worldSpace = this.container.convertToWorldSpace(this.getItem(i).getPosition());
                let nodeSpace = this.board.convertToNodeSpace(worldSpace);
                item.setPosition(nodeSpace);
                item.setVisible(false);
                this.highlightItems.push(item);
            }
        },

        prepareToSpin: function () {
            this.resetItemsPosition();

            for (let i = 0, n = this.items.length; i < n; i++) {
                let item = this.items[i];
                item.setSpinningType(item.type);
            }

            for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
                let highlightItem = this.getHighlightItem(i);
                highlightItem.stopHighlightAnimation();
            }
        },

        resetItemsPosition: function () {
            // let posY = this.startPosY;
            let pos = this.isReelTop ? this.startPosX : this.startPosY;

            for (let i = 0, n = this.items.length; i < n; i++) {
                let item = this.items[i];
                if (this.isReelTop) {
                    item.x = pos;
                    pos -= this.itemSize.width;
                } else {
                    item.y = pos;
                    pos -= this.itemSize.height;
                }
            }
        },

        startSpin: function (delayTime = 0.0, isInFreeGame = false) {
            this.currSpeed = ROLLING_SPEED;
            this.isUpdating = true;
            this.isSpinning = true;
            this.readyToEnd = false;
            this.elapsedTime = 0.0;

            for (let i = 0, len = this.items.length; i < len; i++) {
                let item = this.items[i];

                item.runAction(cc.sequence(
                    cc.delayTime(0.3),
                    cc.callFunc(() => {
                        item.setTypeRandomly(isInFreeGame);
                    }, this)
                ));
            }

            // Start update routine
            this.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(() => {
                    this.prepareToSpin();
                    this.scheduleUpdate();
                })
            ));
        },

        clearSpineAnim: function () {
            if (!cc.sys.isObjectValid(this.anim)) {
                return;
            }

            this.anim.clearTrack(0);
            this.anim.setToSetupPose();
        },

        // Khi dung 1 reel
        stopSpin: function (expectTypes, mergeItems, canUses, callback, numbScatter, lengthPerReel) {
            let offset = STOP_ROLLING_OFFSET;
            this.reelLenght = lengthPerReel;
            cc.log("expectTypes: %j", expectTypes);
            cc.log("expect merge Items: %j", mergeItems);
            if (!cc.isArray(expectTypes)) {
                cc.log("stopSpin Err");
            } else {
                for (let i = 0; i < this.showItems; i++) {
                    let itemIndex = offset + i;
                    let item = this.items[itemIndex];

                    item.visible = true;
                    let type = expectTypes[i];
                    if (type == null) {
                        cc.log('Warning: SlotReel.beforeStopRolling: type of slot item is not valid, make expectTypes is valid.');
                        type = -1;
                        // return;
                    }

                    if (this.isReelTop) {
                        item.setType(type)
                    } else {
                        let mergeType = mergeItems;
                   
                        // if (lengthPerReel == 2) {
                          
                        // }
                        let canUse = canUses[i];
                        let isItemGold = canUse > 0;
                        if (canUses.length !== lengthPerReel) {
                            isItemGold = false;
                            console.log({canUses: canUses.length, lengthPerReel});
                        }
                
                     

                        item.setType(type, mergeType, isItemGold, canUse);
                    }

                    if (item.getIsGoldItem()) {
                        item.showFxGoldItems();
                    }
                    if (item.getType() == SlotRule.ITEM_TYPE.SCATTER) {
                        item.playAnimScatter(item, null, true);
                    }
                }

                // AudioHandler.playReelStop();

                this.clearSpineAnim()
                this.anim.setTimeScale(0.9);
                this.anim.setAnimation(0, "Symbol_Smoke", false);
                this.anim.setVisible(true);

                this.scheduleOnce(()=>{
                    if (SlotRule && AudioHandler && SlotRule.isReelHaveScatter(expectTypes))
                    AudioHandler.playEffectNearFreeGame(numbScatter);
                }, 0.25);
            }


            this.readyToEnd = true;
            this.elapsedSwapTimes = this.items.length / 2 - offset;

            this.stopSpinCallback = callback;
        },

        updateItemType: function (itemTypes = [0, 0, 0, 0, 0], mergeItems = [], canUses = []) {
            for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
                let item = this.getItem(i);
                let type = itemTypes[i];
                
                if (type == null) {
                    cc.log('Warning: updateItemType => type of slot item is not valid, make expectTypes is valid.');
                    return;
                }

                if (this.isReelTop) {
                    item.setType(type)
                } else {
                    let mergeType = mergeItems[i];
                    let canUse = canUses[i];
                    let isItemGold = canUse > 0;

                    item.setType(type, mergeType, isItemGold, canUse);
                }
            }
        },

        setZOrderSceneGraph: function (item, type, idxItem) {
            switch (type) {
                case SlotRule.ITEM_TYPE.SCATTER:
                    item.setLocalZOrder(ViewStyle.ITEM_ORDER.SCATTER);
                    break;
                default:
                    item.setLocalZOrder(idxItem);
                    break;
            }
        },

        stopSpinImmediately: function () {
            this.stopSpin(); // keep the random items
        },

        finishSpinning: function () {
            if (!this.isBonusReel) {
                // Stop update
                this.isUpdating = false;
                this.unscheduleUpdate();
                let finishgReelLenght = this.reelLenght;
                // console.log({finishgReelLenght});
                // console.log({itemsPosY:this.itemsPosY});

                // Positioning items
                //this.items.length
                let posYbuffer = 0;
                for (let i = 0, n = this.items.length; i < n; i++) {
                    let item = this.items[i];
                    if (item) {
                        let posY =  this.itemsPosY[i];
                        if (i > 8) {
                            switch (finishgReelLenght) {
                                case 6:
                                    posY = this.itemsPosY[i + 1] + (this.items[i].height * (0.9 - posYbuffer));
                                    posYbuffer += 0.16; 
                                    break;
                                case 5:
                                    posY = this.itemsPosY[i + 1] + (this.items[i].height * (0.63 - posYbuffer));
                                    posYbuffer += 0.38; 
                                    break;
                                case 4:
                                    posY = this.itemsPosY[i + 1] + (this.items[i].height * (0.29 - posYbuffer));
                                    posYbuffer += 0.72; 
                                    break;
                                case 3:
                                    posY = this.itemsPosY[i + 1] + (this.items[i].height * (-0.285 - posYbuffer));
                                    posYbuffer += 1.3; 
                                    break;
                                case 2:
                                    posY = this.itemsPosY[i + 1] + (this.items[i].height * (-1.4));
                                    break;
                            
                                default:
                                    break;
                            }          
                        }
                   
                        item.runAction(cc.sequence(
                            cc.moveTo(0.05, item.x, posY)
                        ));
                    }
                }
            }

            // Raise callback
            this.runAction(cc.sequence(
                cc.callFunc(() => {
                    this.commander.emit("slot.beforeReelFinishStop", this.reelIndex);
                }),
                cc.delayTime(0.05),
                cc.callFunc(() => {
                    this.isSpinning = false;

                    if (typeof this.stopSpinCallback === "function") {
                        this.stopSpinCallback();
                    }
                })
            ));
        },

        // Update & routines

        update: function (dt) {
            this.elapsedTime += dt;
            while (this.isUpdating && this.elapsedTime >= TARGET_DELTA_TIME) {
                this.elapsedTime -= TARGET_DELTA_TIME;

                let reachLimit = false;
                if (this.isReelTop) {
                    for (let i = 0, n = this.items.length; i < n; i++) {
                        let item = this.items[i];
                        item.x -= this.currSpeed * TARGET_DELTA_TIME;
                        reachLimit = (item.x <= this.limitPosX); // We just care about last slot item
                    }
                } else {
                    for (let i = 0, n = this.items.length; i < n; i++) {
                        let item = this.items[i];
                        item.y -= this.currSpeed * TARGET_DELTA_TIME;
                        reachLimit = (item.y <= this.limitPosY); // We just care about last slot item
                    }
                }

                if (reachLimit) {
                    if (this.isReelTop) {
                        this.moveLeftItemToRight();
                    } else {
                        this.moveBotItemToTop();
                    }

                    if (this.readyToEnd) {
                        this.elapsedSwapTimes--;
                        if (this.elapsedSwapTimes <= 0) {
                            this.finishSpinning();
                        }
                    }
                }

                // Speed change
                this.currSpeed += ROLLING_ACCEL * TARGET_DELTA_TIME;
            }
        },

        moveBotItemToTop: function () {
            let idx = this.items.length - 1;
            let bot = this.items[idx];

            // Sorting
            this.items.pop();
            this.items.unshift(bot);

            // Random sprite for new top item
            let top = bot;
            let nextTop = this.items[1];
            top.visible = true;
            top.y = nextTop.y + this.itemSize.height;
        },

        moveLeftItemToRight: function () {
            let idx = this.items.length - 1;
            let left = this.items[idx];

            // // Sorting
            this.items.pop();
            this.items.unshift(left);

            // // Random sprite for new top item
            let right = left;
            let nextRight = this.items[1];
            right.visible = true;
            right.x = nextRight.x + this.itemSize.width;
        },

        // Helpers

        getItem: function (index) {
            let id = Math.round(this.items.length * 0.5) + index;
            let item = this.items[id];

            return item;
        },

        getHighlightItem: function (index) {
            return this.highlightItems[index];
        },

        turnOffHighlightItems: function (isStopScatter = true) {
            for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
                let highlightItem = this.getHighlightItem(i);
                highlightItem.stopHighlightAnimation(isStopScatter);
            }
        },

        //not really destroy it
        destroyItem: function (listIndex = [], isLastReel = false) {
            listIndex.forEach(index => {
                this.swapIndexItems(index);
            });

            if (isLastReel) {
                this.slotManager.updateReelResut();
            }
        },

        swapIndexItems: function (index) {
            let item = this.getItem(index);
            if (item) {
                if (this.isReelTop) {
                    item.setPositionX(this.itemPosX[0] + this.itemSize.width);
                } else {
                    item.setPositionY(this.itemsPosY[0] + this.itemSize.height);
                }
            }
            let id = Math.round(this.items.length * 0.5) + index;
            this.items.unshift(this.items.splice(id, 1)[0]);
            item.setVisible(true);
            item.setTypeRandomly(true);
        },

        collapseTopItems: function (delayTime = 0.1) {
            
            let id = Math.round(this.items.length * 0.5) + 6;
            let idInboard = Math.round(this.items.length * 0.5) + 1;

            for (let i = 0; i < id; i++) {
                let item = this.items[i];

                if (!item)
                    continue;

                if (parseInt(item.getPositionX()) != parseInt(this.itemPosX[i])) {
                    let action = null;
                    if (parseInt(item.getPositionX()) > parseInt(this.itemPosX[idInboard])) {
                        action = cc.sequence(
                            cc.delayTime(delayTime + 0.33),
                            cc.moveTo(0.1, this.itemPosX[i], item.y).easing(cc.easeIn(2))
                        )
                    } else {
                        action = cc.sequence(
                            cc.delayTime(delayTime),
                            cc.moveTo(0.1, this.itemPosX[i], item.y).easing(cc.easeIn(2))
                        )
                    }
                    item.runAction(action);
                }
            }
        },

        collapseItems: function (isLastReel = false, delayTime = 0.1) {
            let id = Math.round(this.items.length * 0.5) + 6;
            let idInboard = Math.round(this.items.length * 0.5);
            for (let i = 0; i < id; i++) {
                let item = this.items[i];

                if (!item)
                    continue;

                let index = i;

                if (parseInt(item.getPositionY()) != parseInt(this.itemsPosY[i])) {//item.getPositionY() != this.itemsPosY[i]
                    let action = null;
                    if (parseInt(item.getPositionY()) > parseInt(this.itemsPosY[idInboard])) {
                        action = cc.sequence(
                            cc.delayTime(delayTime + 0.33),
                            cc.moveTo(0.2, cc.p(this.posX, this.itemsPosY[i])).easing(cc.easeIn(8)),
                            cc.moveTo(0.03, item.x, this.itemsPosY[i] - this.itemSize.height * 0.05).easing(cc.easeSineOut(2)),
                            cc.moveTo(0.06, item.x, this.itemsPosY[i] + this.itemSize.height * 0.15).easing(cc.easeSineOut(2)),
                            cc.moveTo(0.04, item.x, this.itemsPosY[i]).easing(cc.easeIn(1)),
                            cc.callFunc(this.collapseItemsDone.bind(this, isLastReel, i, id - 1))
                        );
                    } else {
                        action = cc.sequence(
                            cc.delayTime(delayTime),
                            cc.moveTo(0.2, cc.p(this.posX, this.itemsPosY[i])).easing(cc.easeIn(8)),
                            cc.moveTo(0.03, item.x, this.itemsPosY[i] - this.itemSize.height * 0.05).easing(cc.easeSineOut(2)),
                            cc.moveTo(0.06, item.x, this.itemsPosY[i] + this.itemSize.height * 0.15).easing(cc.easeSineOut(2)),
                            cc.moveTo(0.04, item.x, this.itemsPosY[i]).easing(cc.easeIn(1)),
                            cc.callFunc(this.collapseItemsDone.bind(this, isLastReel, i, id - 1))
                        );
                    }

                    item.runAction(action);
                } else {
                    this.scheduleOnce(() => {
                        this.collapseItemsDone(isLastReel, index + 1, id);
                    }, delayTime + 0.385);
                }
            }
        },

        collapseItemsDone: function (isLastReel, index, targetIndex) {
            if (!isLastReel) {
                return;
            }

            if (index != targetIndex) {
                return;
            }

            if (this.commander && this.slotManager)
                this.commander.emit("slot.highlightWinItems.done", this.slotManager.listWinResults, this.slotManager.listWinItemsTop);
        },
    });

    window.SlotReelItem = SlotReelItem;
    return SlotReelItem;
});