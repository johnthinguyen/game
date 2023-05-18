/*global module */

// SlotNetwork is internal module that handle networking for SlotManager only
// Donot use by other module, or listen events from this module
// instead you can listen from SlotManager
Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotEmpire::SlotNetwork]";

    const Protocol = {
        MAIN_ID: 1002,
        REQUEST: {
            SPIN_SLOT: 2,
        },

        RESPONSE: {
            FIRST_SPIN_INFO: 7,
            SPIN_SLOT: 2,

            LEVEL_UP: 50,
        }
    };

    const SlotSchema = {
        FirstSpinInfo: Schema.Switch({
            BetCoins: Schema.Array(Schema.UInt8, Schema.UInt32),
            oneLineBet: Schema.UInt32,
            HeSoCuoc: Schema.UInt8,
            numFreeSpin: Schema.UInt8,
            winCoinAll: Schema.UInt64,
            multiplier: Schema.UInt8,
            reelResult: Schema.Array(Schema.UInt8, Schema.Int8),
            headResult: Schema.Array(Schema.UInt8, Schema.Int8),
            MergeItems: Schema.Array(Schema.UInt8, {
                MergeItemListIdx: Schema.Array(Schema.UInt8, Schema.Int8),
                MergeItemId: Schema.UInt8,
                MergeItemCol: Schema.UInt8
            }),
            GoldItems: Schema.Array(Schema.UInt8, {
                GoldItemListIdx: Schema.Array(Schema.UInt8, Schema.Int8),
                GoldItemId: Schema.UInt8,
                GoldItemCol: Schema.UInt8,
                GoldItemTimesCanUse: Schema.UInt8,
                GoldItemIsUse: Schema.Bool
            })
        }),

        SpinSlotRequest: Schema.Switch({
            oneLineBet: Schema.UInt32,
            toolResult: function (value) {
                if (value.toolResult) {
                    return Schema.Array(15, Schema.Int8);
                }
            }
        }),

        SpinSlotResponse: Schema({
            matchId: Schema.UInt32,
            betCoin: Schema.UInt32,
            winCoinAll: Schema.UInt32,
            numScatter: Schema.UInt8,
            numExtraSpin: Schema.UInt8,
            numFreeSpin: Schema.UInt8,
            HeSoCuoc: Schema.UInt8,
            FreeGameWinCoinAll: Schema.UInt64,
            listReelResult: Schema.Array(Schema.UInt8, {
                reelResult: Schema.Array(Schema.UInt8, Schema.Int8),
                headResult: Schema.Array(Schema.UInt8, Schema.Int8),
                MergeItems: Schema.Array(Schema.UInt8, {
                    MergeItemListIdx: Schema.Array(Schema.UInt8, Schema.Int8),
                    MergeItemId: Schema.UInt8,
                    MergeItemCol: Schema.UInt8
                }),
                GoldItems: Schema.Array(Schema.UInt8, {
                    GoldItemListIdx: Schema.Array(Schema.UInt8, Schema.Int8),
                    GoldItemId: Schema.UInt8,
                    GoldItemCol: Schema.UInt8,
                    GoldItemTimesCanUse: Schema.UInt8,
                    GoldItemIsUse: Schema.Bool
                }),
                multiplier: Schema.UInt8,
                LineCanWin: Schema.UInt16,
                lineWinResults: Schema.Array(Schema.UInt8, {
                    itemTrungId: Schema.Int8,
                    winCoin: Schema.UInt32,
                    numIdTrung: Schema.UInt8,
                }),
                winCoin: Schema.Int32,
            })
            
        }),

        UserLevelUp: Schema({
            Level: Schema.UInt32,
            RewardCoin: Schema.UInt32,
        }),
    };

    const Events = {
        ON_FIRST_SPIN_INFO: "onFirstSpinInfo",
        ON_SPIN_SLOT: "onSpinSlot",
        ON_SLOT_HONOR_INFO: "onSlotHonorInfo",

        ON_BROADCAST_MSG: "onBroadcastMessage",
        ON_GAME_MAINTAIN: "onGameMaintain",

        ON_GAME_SEND_ERROR: "onGameSendError",
        ON_GAME_SEND_MESSAGE: "onGameSendMessage", 

        ON_USER_LEVEL_UP: "onGameUserLevelUp",
    };

    const SlotNetwork = cc.class("SlotNetwork", KingLogic, {
        ctor: function (queue = false) {
            this._super();
            this.initEmitter();

            this.useQueue = queue;
            this.queueMessages = [];
        },

        setSlotManager: function (slotManager) {
            this.slotManager = slotManager;
        },

        // Lifecycle

        startListenEvents: function () {
            //cc.log("check start event listener");
            this.slotManager.mainController.addListener(this.slotManager.mainController.LISTENER_TYPE.MAIN, LOGTAG, this);
            this.slotManager.mainController.addListener(this.slotManager.mainController.LISTENER_TYPE.GAME, LOGTAG, this);

            cc.director.getScheduler().schedule(this, this.tick, 0.1, -1, 0, false);
        },

        stopListenEvents: function () {
            cc.director.getScheduler().unschedule(this, this.tick);

            this.slotManager.mainController.removeListener(this.slotManager.mainController.LISTENER_TYPE.MAIN, LOGTAG, this);
            this.slotManager.mainController.removeListener(this.slotManager.mainController.LISTENER_TYPE.GAME, LOGTAG, this);
        },

        queueMessage: function (type, payload, priority = 0) {
            if (this.useQueue) {
                this.queueMessages.push({
                    type: type,
                    payload: payload,
                    priority: priority
                });
            } else {
                this.dispatchEvent(type, payload);
            }
        },

        tick: function (dt) {
            let messages = this.queueMessages;
            this.queueMessages = [];

            messages
                .sort((a, b) => a.priority - b.priority)
                .forEach((message) => {
                    this.dispatchEvent(message.type, message.payload);
                });
        },

        // Commands

        sendRequestSpinSlot: function (betCoin) {
            cc.log('========== SEND REQUEST ================= betCoin: %j', betCoin);

            this.slotManager.mainController.sendMessage(
                Protocol.MAIN_ID,
                Protocol.REQUEST.SPIN_SLOT,
                SlotSchema.SpinSlotRequest, {
                    oneLineBet: betCoin,
                    toolResult: Array(15).fill(0)
                }
            );
        },

        sendRequestSpinTopUpGame: function () {

        },

        onGameUserLevelUp: function (payload) {
            cc.log(LOGTAG, "onGameUserLevelUp", "payload: %j", payload);
            this.queueMessage(Events.ON_USER_LEVEL_UP, payload);
        },

        onGameSendError: function (payload) {
            cc.log(LOGTAG, "onGameSendError", "payload: %j", payload);
            this.queueMessage(Events.ON_GAME_SEND_ERROR, payload);
        },
        
        onGameSendMessage: function (payload) {
            cc.log(LOGTAG, "onGameSendMessage", "payload: %j", payload);
            this.queueMessage(Events.ON_GAME_SEND_MESSAGE, payload);
        },

        onGameMaintain: function (payload) {
            cc.log(LOGTAG, "onGameMaintain", "payload: %j", payload);
            this.queueMessage(Events.ON_GAME_MAINTAIN, payload);
        },

        onGameBroadcastMessage: function (payload) {
            cc.log(LOGTAG, "onGameBroadcastMessage %j", payload);
            this.queueMessage(Events.ON_BROADCAST_MSG, payload);
        },

        onSocketMessage: function (message) {
            let mainId = message.getMainId();
            if (mainId !== Protocol.MAIN_ID) {
                return;
            }

            let assistantId = message.getAssistantId();
            let content = message.getContent();
            switch (assistantId) {
                case Protocol.RESPONSE.FIRST_SPIN_INFO: {
                    let payload = Schema.decode(SlotSchema.FirstSpinInfo, content);
                    //this.log("firstSpinInfo: %j", payload);
                    this.queueMessage(Events.ON_FIRST_SPIN_INFO, payload);
                    break;
                }

                case Protocol.RESPONSE.SPIN_SLOT: {
                    let payload = Schema.decode(SlotSchema.SpinSlotResponse, content);
                    //cc.log("spinslot: %j", payload);
                    this.queueMessage(Events.ON_SPIN_SLOT, payload);
                    break;
                }

                case Protocol.RESPONSE.LEVEL_UP:{
                    let payload = Schema.decode(SlotSchema.UserLevelUp, content);
                    //this.log("Level up: %j", payload);
                    this.queueMessage(Events.ON_USER_LEVEL_UP, payload);
                    break;
                }

                default:
                    break;
            }
        }
    });

    // Export modules
    SlotNetwork.LOGTAG = LOGTAG;
    SlotNetwork.Events = Events;
    SlotNetwork.Protocol = Protocol;
    
    window.SlotNetwork = SlotNetwork;
    return SlotNetwork;
});