/*global define */

Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::SlotManager]";
    const LISTENER_ID = "__pharaoh_slotmanager__";

    const SlotManager = cc.Class.extend({
        ctor: function (gameId, commander, isL7) {

            this.LOGTAG = LOGTAG;
            this.construct();

            this.isL7 = isL7;
            this.gameId = gameId;

            this.commander = commander;

            this.slotNetwork = new SlotNetwork();
            this.slotNetwork.setSlotManager(this);

            this.isFirstSpinInfo = true;
            this.isGameLoaded = false;

            this.matchId = 0;
            this.winCoinAll = 0;
            this.multiplier = 1;
            this.winCoin = 0;
            this.winCoinGetFreeGame = 0;
            this.balance = 0;
            this.previousBalance = -1;
            this.lineWin = [];

            this.listReelResult = [];

            this.reelResultIndex = 0;
            this.reelResultLength = 0;
            // this.lineWinResults = [];
            // this.listLineWinId = [];
            this.listWinResults = [];

            this.reelLenghtResult = [];

            this.jackpotWinType = 0;
            this.jackpotWinCoin = 0;
            this.jackpotConfigs = [];
            this.jackpotRewards = [0, 0, 0, 0];

            this.scatterReelIndex = [];
            this.startSpeedUpReel = SlotRule.REELS;
            this.numScatter = 0;
            this.numFreeSpin = 0;
            this.numExtraSpin = 0;
            this.freeGameWinCoinAll = 0;
            this.totalFreeGameSpinned = 0;
            this.isSpinningFreeGame = false;

            this.isAutoSpin = false;
            this.isInfiniteAutoSpin = false;
            this.autoSpinCount = 0;

            this.betCoinsConfig = [];
            this.HeSoCuoc = 1;
            this.indexBetRate = 0;
            this.indexBetCredit = 0;
            this.currentBetRate = 0;
            this.currentBetCredit = 0;
            this.minBetRate = 0;
            this.maxBetRate = 0;

            this.isSpinError = false;

            // Internal state
            this.waitForSpinResponse = false;

            this.betMoney = 0;

            this.selectBetRate(0);
            this.selectBetCredit(0);

            this.lineWins = [];
            this.hasEnterGameScene = false;

            this.lineCanWin = 0;
        },

        construct: function () {

            let tag = "[MAIN]";

            this.mainController = new KingSlotController();
            this.mainController.setTag(tag);

            this.userData = new KingUserInfo();

            this.loginManager = new KingSlotLoginManager(this.mainController);
            this.loginManager.setTag(tag);
            this.loginManager.setAutoRetry(true);
            this.loginManager.setMaxRetry(5);

            // Binding controllers

            this.loginManager.setUserManager(this.userData);
            this.mainController.setUserManager(this.userData);
        },

        destroy: function () {

            this.clearHandlers();

            this.close();
            this.clear();
        },

        close: function () {
            if (this.mainController)
                this.mainController.close();
        },

        clear: function () {

            if (this.loginManager)
                this.loginManager.clear();

            delete this.userData;

            delete this.loginManager;

            delete this.mainController;
        },

        clearHandlers: function () {

            if (this.loginManager)
                this.loginManager.clearAllListeners();

            if (this.mainController)
                this.mainController.clearAllListeners();
        },

        clearLineWinResult: function () {
            // this.lineWinResults = [];
            // this.listLineWinId = [];
            this.listWinResults = [];
        },

        startListenEvents: function () {
            this.slotNetwork.startListenEvents();
            this.slotNetwork.addListener(LISTENER_ID, this);
            //cc.log('LISTENER_ID slot manager j%', LISTENER_ID);

            this.mainController.addListener(LISTENER_ID, this);

            this.commandSession = this.commander.createSession();
            this.commandSession.on("game.init", () => {
                // Wait for first spin info
                this.isFirstSpinInfo = true;
            });

            this.commandSession.on("game.quit", () => {
                this.stopListenEvents();

                // Wait for first spin info
                this.isFirstSpinInfo = true;
            });

            this.commandSession.on("game.download.done", () => {
                this.isGameLoaded = true;
            });

            // Quay thuong
            this.commandSession.on("slot.requestSpin", () => {
                if (this.requestNewSpin()) {
                    this.commander.emit("slot.spinRequested");
                    //this.commander.emit("setTextInfo", Localize.text("LANG_TEXT_GOOD_LUCK"))
                } else {
                    this.commander.emit("slot.spinFailed");
                }
            });

            this.commandSession.on("login.success", () => {
                if (this.isFirstSpinInfo) {
                    this.balance = this.userData.coin || this.balance;
                }
            });
        },

        stopListenEvents: function () {
            this.slotNetwork.removeListener(LISTENER_ID);
            this.slotNetwork.stopListenEvents();

            this.mainController.removeListener(LISTENER_ID);

            if (this.commandSession) {
                this.commandSession.dispose();
                this.commandSession = null;
            }
        },

        // Helpers

        getCurrentStake: function () {
            return this.currentBetRate * this.HeSoCuoc;
        },

        hasWinJackpot: function () {
            return this.jackpotWinCoin > 0;
        },

        hasBigWin: function () {
            return this.winCoinAll >= this.getCurrentStake() * SlotRule.BIG_WIN_REQUIRED;
        },

        hasMegaWin: function () {
            return this.winCoinAll >= this.getCurrentStake() * SlotRule.MEGA_WIN_REQUIRED;
        },

        hasSuperWin: function(){
            return this.winCoinAll >= this.getCurrentStake() * SlotRule.SUPER_WIN_REQUIRED;
        },

        hasWinSlots: function () {
            return this.winCoinAll > 0 && this.listWinResults.length > 0;
        },

        hasFreeGame: function () {
            return this.numFreeSpin > 0;
        },

        // increaseFreeGameCombo: function () {
        //     this.freeGameCombo++;
        // },

        // Playing commands
        requestNewSpin: function () {
            cc.log('requestNewSpin======== %j', this.currentBetRate * this.HeSoCuoc);
            this.isSpinError = false;

            if (this.waitForSpinResponse) {
                return false;
            }

            this.miniGameHasAcculumation = false;
            this.previousBalance = this.balance;
            if (this.balance >= this.currentBetRate * this.HeSoCuoc) {
                if (this.numFreeSpin <= 0) {
                    this.balance -= this.currentBetRate * this.HeSoCuoc;
                    this.isSpinningFreeGame = false;
                } else {
                    this.isSpinningFreeGame = true;
                }

                this.winCoinAll = 0;
                this.winCoin = 0;
                this.lineCanWin = 0;
                this.listReelResult = [];
                // this.lineWinResults = [];
                // this.listLineWinId = [];
                this.listWinResults = [];
                this.jackpotWinCoin = 0;
                this.scatterReelIndex = [];
                // this.freeGameCombo = 0;
                this.numExtraSpin = 0;
                this.numScatter = 0;
                this.startSpeedUpReel = SlotRule.REELS;
                this.waitForSpinResponse = true;
                this.slotNetwork.sendRequestSpinSlot(this.currentBetRate);
                return true;
            } else {
                return false;
            }
        },

        // Bet selection
        increaseBet: function () {
            let index = (this.indexBetRate + 1) % this.betCoinsConfig.length;
            this.selectBetRate(index);
        },

        decreaseBet: function () {
            let index = (this.betCoinsConfig.length + this.indexBetRate - 1) % this.betCoinsConfig.length;
            this.selectBetRate(index);
        },

        isCurrentMinBetRate: function () {
            if (this.indexBetRate === 0) {
                return true;
            } else if (SlotRule.SMART_SELECT_BET_RATE) {
                let index = (SlotRule.BET_RATES.length + this.indexBetRate - 1) % SlotRule.BET_RATES.length;
                let betCoin = SlotRule.BET_RATES[index];
                return betCoin < this.minBetRate;
            } else {
                return false;
            }
        },

        isCurrentMaxBetRate: function () {
            if (this.indexBetRate === SlotRule.BET_RATES.length - 1) {
                return true;
            } else if (SlotRule.SMART_SELECT_BET_RATE) {
                let index = (this.indexBetRate + 1) % SlotRule.BET_RATES.length;
                let betCoin = SlotRule.BET_RATES[index];
                return betCoin > this.maxBetRate;
            } else {
                return false;
            }
        },

        increaseBetCredit: function () {
            let index = (this.indexBetCredit + 1) % SlotRule.BET_CREDITS.length;
            this.selectBetCredit(index);
        },

        decreaseBetCredit: function () {
            let index = (SlotRule.BET_CREDITS.length + this.indexBetCredit - 1) % SlotRule.BET_CREDITS.length;
            this.selectBetCredit(index);
        },

        selectBetRate: function (index) {
            cc.log("betCoins: %j", this.betCoinsConfig)
            this.indexBetRate = index;
            this.currentBetRate = this.betCoinsConfig[index];
        },

        selectBetCredit: function (index) {
            if (SlotRule.SMART_SELECT_BET_CREDITS) {
                let savedIndex = index;

                if (index > -1 && index < SlotRule.BET_CREDITS.length) {
                    do {
                        this.indexBetCredit = index--;
                        this.currentBetCredit = SlotRule.BET_CREDITS[this.indexBetCredit];
                    } while (index > -2 && this.getCurrentStake() > this.balance);

                    if (index === -2) {
                        if (this.indexBetRate > 0) {
                            this.indexBetRate--;
                            this.currentBetRate = SlotRule.BET_RATES[this.indexBetCredit];
                            return this.selectBetCredit(savedIndex);
                        } else {
                            this.indexBetRate = 0;
                            this.currentBetRate = SlotRule.BET_RATES[this.indexBetRate];

                            this.indexBetCredit = 0;
                            this.currentBetCredit = SlotRule.BET_CREDITS[this.indexBetCredit];

                            if (SlotRule.EMPTY_BETTING_WHEN_SELECT_FAILED && this.getCurrentStake() > this.balance) {
                                this.indexBetRate = -1;
                                this.currentBetRate = 0;

                                this.indexBetCredit = -1;
                                this.currentBetCredit = 0;
                            }
                        }
                    } else {
                        return true;
                    }
                }

                return false;
            } else {
                if (index > -1 && index < SlotRule.BET_RATES.length) {
                    this.indexBetCredit = index;
                    this.currentBetCredit = SlotRule.BET_CREDITS[this.indexBetCredit];
                    return true;
                } else {
                    return false;
                }
            }
        },

        selectMaxBetRate: function () {
            return this.selectBetRate(SlotRule.BET_RATES.length - 1);
        },

        selectMaxBetLine: function () {
            return this.selectBetCredit(SlotRule.BET_CREDITS.length - 1);
        },

        selectMaxBet: function () {
            this.indexBetRate = this.betCoinsConfig.length - 1;
            this.currentBetRate = this.betCoinsConfig[this.indexBetRate];
        },

        isCurrentMinBet: function () {
            return this.isCurrentMinBetRate() && (this.indexBetCredit === 0) && this.getCurrentStake() <= this.balance;
        },

        isCurrentMaxBet: function () {
            return this.isCurrentMaxBetRate() && this.getCurrentStake() <= this.balance;
        },

        setAutoSpin: function (value, count = 0) {
            this.isAutoSpin = value;
            this.autoSpinCount = count;
            if (count == SlotRule.AUTO_SPIN_INFINITE) {
                this.isInfiniteAutoSpin = true;
            } else {
                this.isInfiniteAutoSpin = false
            }
        },

        reduceAutoSpin: function () {
            this.autoSpinCount--;
            if (this.autoSpinCount <= 0) {
                this.setAutoSpin(false);
            }
        },

        // Handle events
        handleResponse: function (isGameErrorResponse = false) {
            this.isSpinError = isGameErrorResponse;
            this.waitForSpinResponse = false;
        },

        handleFirstSpinInfo: function (payload) {
            cc.log("handleFirstSpinInfo: %j", payload);

            this.balance = this.userData.coin;
            var betConfig = payload.BetCoins || SlotRule.BET_RATES;
            this.betCoinsConfig = betConfig;
            this.HeSoCuoc = payload.HeSoCuoc;
            this.minBetRate = betConfig[0] || 0;
            this.maxBetRate = betConfig[betConfig.length - 1] || Number.POSITIVE_INFINITY;
    
            this.numFreeSpin = payload.numFreeSpin;
            this.multiplier = payload.multiplier;
            cc.log("HeSoCuoc asd",this.HeSoCuoc);
            let betRange = this.betCoinsConfig.map(item => item * this.HeSoCuoc);
            cc.log("handleFirstSpinInfo asd",betRange);
            this.commander.emit(SlotCore.FOOTER.SET.BET_RANGE, betRange);

            if (!this.isFirstSpinInfo) {
                this.commander.emit("login.reconnect");
            } else {
                this.selectBetRate(0);
            }

            this.isFirstSpinInfo = false;
        },

        onFirstSpinInfo: function (payload) {
            //cc.log(LOGTAG, "onFirstSpinInfo: %j", payload);
            this.handleFirstSpinInfo(payload);
        },

        onSpinSlot: function (payload) {
            payload = {
              matchId: 82831,
              betCoin: 500,
              winCoinAll: 8050,
              numScatter: 3,
              numExtraSpin: 0,
              numFreeSpin: 0,
              HeSoCuoc: 1,
              FreeGameWinCoinAll: 0,
              listReelResult: [
                {
                //   reelResult: [
                //     4, 5, 9,
                //     11,11,10,3,
                //     6,3,6,7,11,3,6,
                //     8,8,6,7,6,11,9,
                //     4,3,
                //     6,3,6,7,6,8,3
                //   ],
                  reelResult: [
                    8,8,6,7,6,11,9,
                    8,8,6,7,6,11,
                    6,3,6,7,11,
                    8,8,6,7,6,
                    4, 5, 9,
                    4,3
                  ],
                //   reelLenghtResult: [
                //     3, 4, 7, 7, 2, 7
                //   ],
                  reelLenghtResult: [
                    7, 6, 5, 4, 3, 2
                  ],
                //   MergeItems: [4, 3, 0, 0, 5, 0],
                  MergeItems: [0, 1, 2, 3, 4, 5],
                  GoldItems: [1, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0,0, 0, 0, 0,0, 0, 0,0, 1],
                  multiplier: 1,
                  LineCanWin: 32400,
                  lineWinResults: [],
                  winCoin: 0,
                },
              ],
            };
            //payload = {"matchId":82830,"betCoin":500,"winCoinAll":8500,"numScatter":4,"numExtraSpin":0,"numFreeSpin":8,"HeSoCuoc":1,"FreeGameWinCoinAll":0,"listReelResult":[{"reelResult":[5,7,5,10,6,3,11,8,10,10,11,3,10,10,10,9,11,3,5,11,10,4,4,3,8,11,10,8,5,6],"headResult":[8,3,8,3],"MergeItems":[{"MergeItemListIdx":[8,14,20,26],"MergeItemId":10,"MergeItemCol":2},{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[19,25],"GoldItemId":11,"GoldItemCol":1,"GoldItemTimesCanUse":2,"GoldItemIsUse":false},{"GoldItemListIdx":[10,16],"GoldItemId":11,"GoldItemCol":4,"GoldItemTimesCanUse":2,"GoldItemIsUse":false}],"multiplier":1,"LineCanWin":13500,"lineWinResults":[{"itemTrungId":10,"winCoin":200,"numIdTrung":8}],"winCoin":200},{"reelResult":[4,11,8,4,6,3,5,7,3,11,11,3,11,8,8,9,11,3,5,11,6,4,4,3,8,11,5,8,5,6],"headResult":[8,3,8,3],"MergeItems":[{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[19,25],"GoldItemId":11,"GoldItemCol":1,"GoldItemTimesCanUse":2,"GoldItemIsUse":false},{"GoldItemListIdx":[10,16],"GoldItemId":11,"GoldItemCol":4,"GoldItemTimesCanUse":2,"GoldItemIsUse":false}],"multiplier":1,"LineCanWin":13500,"lineWinResults":[{"itemTrungId":8,"winCoin":1200,"numIdTrung":5}],"winCoin":1200},{"reelResult":[10,5,2,5,6,3,4,11,4,4,11,3,5,7,3,11,11,3,11,11,6,9,4,3,5,11,5,4,5,6],"headResult":[3,3,8,6],"MergeItems":[{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[19,25],"GoldItemId":11,"GoldItemCol":1,"GoldItemTimesCanUse":2,"GoldItemIsUse":false},{"GoldItemListIdx":[10,16],"GoldItemId":11,"GoldItemCol":4,"GoldItemTimesCanUse":2,"GoldItemIsUse":false}],"multiplier":1,"LineCanWin":13500,"lineWinResults":[{"itemTrungId":5,"winCoin":900,"numIdTrung":6}],"winCoin":900},{"reelResult":[2,6,11,9,2,3,5,11,2,4,6,3,10,7,4,11,11,3,4,11,3,9,11,3,11,11,6,4,4,6],"headResult":[3,3,8,6],"MergeItems":[{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[19,25],"GoldItemId":11,"GoldItemCol":1,"GoldItemTimesCanUse":2,"GoldItemIsUse":true},{"GoldItemListIdx":[16,22],"GoldItemId":11,"GoldItemCol":4,"GoldItemTimesCanUse":2,"GoldItemIsUse":true}],"multiplier":1,"LineCanWin":13500,"lineWinResults":[{"itemTrungId":11,"winCoin":150,"numIdTrung":4}],"winCoin":150},{"reelResult":[8,4,10,11,2,3,2,6,2,9,6,3,5,7,4,4,1,3,10,1,3,9,1,3,4,1,6,4,4,6],"headResult":[3,3,8,6],"MergeItems":[{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[19,25],"GoldItemId":1,"GoldItemCol":1,"GoldItemTimesCanUse":2,"GoldItemIsUse":true},{"GoldItemListIdx":[16,22],"GoldItemId":1,"GoldItemCol":4,"GoldItemTimesCanUse":2,"GoldItemIsUse":true}],"multiplier":1,"LineCanWin":13500,"lineWinResults":[{"itemTrungId":10,"winCoin":50,"numIdTrung":2},{"itemTrungId":4,"winCoin":4800,"numIdTrung":6}],"winCoin":4850},{"reelResult":[9,8,11,10,4,3,3,6,4,9,2,3,8,7,2,11,6,3,2,1,3,9,1,3,5,1,6,9,1,6],"headResult":[3,3,8,6],"MergeItems":[{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[19,25],"GoldItemId":1,"GoldItemCol":1,"GoldItemTimesCanUse":1,"GoldItemIsUse":true},{"GoldItemListIdx":[22,28],"GoldItemId":1,"GoldItemCol":4,"GoldItemTimesCanUse":1,"GoldItemIsUse":false}],"multiplier":1,"LineCanWin":13500,"lineWinResults":[{"itemTrungId":3,"winCoin":1000,"numIdTrung":4}],"winCoin":1000},{"reelResult":[4,4,2,10,4,3,9,3,11,9,2,3,8,8,4,11,6,3,2,6,2,9,1,3,5,7,6,9,1,6],"headResult":[8,6,6,4],"MergeItems":[{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[22,28],"GoldItemId":1,"GoldItemCol":4,"GoldItemTimesCanUse":1,"GoldItemIsUse":false}],"multiplier":1,"LineCanWin":16200,"lineWinResults":[{"itemTrungId":4,"winCoin":200,"numIdTrung":3}],"winCoin":200},{"reelResult":[9,8,10,10,4,3,9,3,2,9,2,3,8,8,11,11,6,3,2,6,2,9,1,3,5,7,6,9,1,6],"headResult":[8,6,6,4],"MergeItems":[{"MergeItemListIdx":[5,11,17],"MergeItemId":3,"MergeItemCol":5}],"GoldItems":[{"GoldItemListIdx":[22,28],"GoldItemId":1,"GoldItemCol":4,"GoldItemTimesCanUse":1,"GoldItemIsUse":false}],"multiplier":1,"LineCanWin":16200,"lineWinResults":[],"winCoin":0}]};
            cc.log(LOGTAG, "onSpinSlot %j", payload);
            
            if (this.isSpinningFreeGame) {
                this.totalFreeGameSpinned++;
            } else {
                this.totalFreeGameSpinned = 0;
            }

            this.winCoinAll = 0;
            this.freeGameWinCoinAll = payload.FreeGameWinCoinAll || 0;
            this.numScatter = payload.numScatter || 0;
            this.numFreeSpin = payload.numFreeSpin || 0;
            this.numExtraSpin = payload.numExtraSpin || 0
            this.previousBalance = -1;
            
            this.matchId = payload.matchId || 0;
            this.betMoney = payload.betCoin;
            this.commander.emit("main.header.setMatchID", this.matchId)
            var curBetRate = payload.betCoin / this.HeSoCuoc;
            //cc.log("============== curBetRate", this.betCoinsConfig.indexOf(curBetRate));
            if (this.betCoinsConfig.indexOf(curBetRate) >= 0) {
                this.selectBetRate(this.betCoinsConfig.indexOf(curBetRate));
                this.updateFooterBetMoney();
            }

            // Xu li mang ket qua:
            this.slotReelResult(payload.listReelResult);
            this.reelResultIndex = 0;
            this.getLinesWin(this.listReelResult[this.reelResultIndex]);
            this.reelResultLength = this.listReelResult.length;
            this.slotItemReels = this.listReelResult[this.reelResultIndex].slotItemReels;
            this.slotItemReelTop = this.listReelResult[this.reelResultIndex].slotItemReelTop;
            this.mergeItemInReels = this.listReelResult[this.reelResultIndex].mergeItemInReels;
            this.listCanUseTimes = this.listReelResult[this.reelResultIndex].listCanUseTimes;
            this.multiplier = this.listReelResult[this.reelResultIndex].multiplier;
            this.listWinItemsTop = this.listReelResult[this.reelResultIndex].listWinItemsTop;
            this.lineCanWin = this.listReelResult[this.reelResultIndex].lineCanWin;
            // this.reelLenghtResult = this.listReelResult.reelLenghtResult;

            this.balance += this.winCoinAll;
            //cc.log(LOGTAG, '---------------- winCoin %d', this.winCoinAll);

            this.winCoin = this.listReelResult[this.reelResultIndex].winCoin;
            
            this.winCoinGetFreeGame = payload.winCoinAll - this.winCoinAll;
            //cc.log(LOGTAG, '---------------- winCoinGetFreeGame %d', this.winCoinGetFreeGame);

            this.balance += this.winCoinGetFreeGame;

            // Xu li result data khi co line thang:
            // this.listLineWinId = [];
            // this.lineWinResults = [];

            this.listWinResults = [];
            if (this.listReelResult[this.reelResultIndex]) {
                this.listWinResults = this.listReelResult[this.reelResultIndex].listWinItems;
            }

            let scatterCount = 0;
            for (let reelIndex = 0; reelIndex < SlotRule.REELS; reelIndex++) {
                for (let itemIndex = 0; itemIndex < SlotRule.ITEMS_PER_REEL; itemIndex++) {
                    if (this.slotItemReels[reelIndex][itemIndex] === SlotRule.ITEM_TYPE.SCATTER) {
                        scatterCount += 1;
                    }
                }
                if (scatterCount >= 3) {
                    this.startSpeedUpReel = reelIndex;
                    break;
                }
            }
           
     

            for (let i = 0; i < SlotRule.REELS; i++) {
                if (SlotRule.isReelHaveScatter(this.slotItemReels[i])) {
                    this.scatterReelIndex.push(i);
                }
            }

            //cc.log("scatterReelIndex: %j", this.scatterReelIndex);

            this.handleResponse();
            this.onSpinRespinsed();
        },

        onSpinRespinsed: function () {
            this.commander.emit("slot.spinResponsed");
        },

        updateFooterBetMoney: function () {
            this.commander.emit("slot.footer.updateBetMoney");
        },

        slotReelResult: function (listReelResult) {
            listReelResult.forEach((result, resultIndex) => {
                let index = 0;
                let indexLenghtReel = 0;
                // 6 reels, max 7 item per reel
                let arrResult = [];

                let listCanUseTimes = [];
                // 
                let reelResult = result.reelResult;
                let goldItemResult = result.GoldItems;
                let reelLenghtResult = result.reelLenghtResult;
                this.reelLenghtResult = reelLenghtResult;
                // cắt reelResult theo lenght trả về
                for (let reelIndex = 0; reelIndex < SlotRule.REELS; reelIndex++) {
                    // console.log({indexLenghtReel});
                    arrResult.push(reelResult.slice(indexLenghtReel, reelLenghtResult[reelIndex] + indexLenghtReel));
                    listCanUseTimes.push(goldItemResult.slice(indexLenghtReel, reelLenghtResult[reelIndex] + indexLenghtReel));

                    indexLenghtReel += reelLenghtResult[index];
                    index += 1;
                }
                
                console.log({reelResultTest:arrResult, listCanUseTimes});

                let mergeItemInReels = [];
                mergeItemInReels = result.MergeItems;
                // let mergeItemInReels = [];
                // result.MergeItems.forEach((mergeItem) => {
                //     let indexRoot = mergeItem.MergeItemListIdx[0];
                //     let rootItemReelIndex = indexRoot % SlotRule.REELS;
                //     let rootItemIndex = Math.floor(indexRoot / SlotRule.REELS);
                //     mergeItemInReels[rootItemReelIndex][rootItemIndex] = mergeItem.MergeItemListIdx.length - 1;
                //     for (let i = 1; i < mergeItem.MergeItemListIdx.length; i++) {
                //         let index = mergeItem.MergeItemListIdx[i];
                //         let itemReelIndex = index % SlotRule.REELS;
                //         let itemIndex = Math.floor(index / SlotRule.REELS);
                //         arrResult[itemReelIndex][itemIndex] = -1;
                //     }
                // })

                // let listCanUseTimes = [];
                // result.GoldItems.forEach((goldItems) => {
                //     let indexRoot = goldItems.GoldItemListIdx[0];
                //     let rootItemReelIndex = indexRoot % SlotRule.REELS;
                //     let rootItemIndex = Math.floor(indexRoot / SlotRule.REELS);
                //     mergeItemInReels[rootItemReelIndex][rootItemIndex] = goldItems.GoldItemListIdx.length - 1;
                //     listCanUseTimes[rootItemReelIndex][rootItemIndex] = goldItems.GoldItemTimesCanUse;
                //     for (let i = 1; i < goldItems.GoldItemListIdx.length; i++) {
                //         let index = goldItems.GoldItemListIdx[i];
                //         let itemReelIndex = index % SlotRule.REELS;
                //         let itemIndex = Math.floor(index / SlotRule.REELS);
                //         arrResult[itemReelIndex][itemIndex] = -1;
                //         listCanUseTimes[itemReelIndex][itemIndex] = goldItems.GoldItemTimesCanUse;
                //     }
                // })

                //clone data lineWinResults
                let tempLineWinResults = [];
                result.lineWinResults.forEach((lineWinResult) => {
                    tempLineWinResults.push(lineWinResult);
                });

                // find linked line from results
                let listWinItems = [];
                let listWinItemsTop = [];
                for (let reelIndex = 0; reelIndex < SlotRule.REELS; reelIndex++) {
                    let itemTopIndex = (SlotRule.REELS - 1) - reelIndex;
                    let winItemInReel = [];
                    
                    for (let itemIndex = 0; itemIndex < SlotRule.ITEMS_PER_REEL; itemIndex++) {
                        tempLineWinResults.forEach((lineWinResult) => {
                            let itemId = arrResult[reelIndex][itemIndex];
                            if ((itemId == lineWinResult.itemTrungId || SlotRule.isWildItem(itemId)) && !CoreUtils.isArrayInclues(winItemInReel, itemIndex)) {
                                winItemInReel.push(itemIndex);
                            }
                        })
                    }
                    if (winItemInReel.length <= 0 && !CoreUtils.isArrayInclues(listWinItemsTop, itemTopIndex)) {
                        break;
                    } else {
                        let removeIndex = [];
                        tempLineWinResults.forEach((lineWinResult, idx) => {
                            let isExist = false;
                            for (let i = 0; i < winItemInReel.length; i++) {
                                if (arrResult[reelIndex][winItemInReel[i]] == lineWinResult.itemTrungId || SlotRule.isWildItem(arrResult[reelIndex][winItemInReel[i]])) {
                                    isExist = true;
                                }
                            }

                            if (!isExist) {
                                removeIndex.push(idx);
                            }
                        })

                        if (removeIndex.length > 0) {
                            for (let i = 0; i < removeIndex.length; i++) {
                                tempLineWinResults.splice(removeIndex[i], 1);
                            }
                        }
                    }

                    listWinItems.push(winItemInReel);
                }

                // determine how many win items in each reel
                let numWinItemInReels = [];
                for (let i = 0; i < SlotRule.REELS; i++) {
                    let winItemInReel = [];
                    listWinItems.forEach((lineWin) => {
                        if (lineWin[i] != null && !CoreUtils.isArrayInclues(winItemInReel, lineWin[i])) {
                            winItemInReel.push(lineWin[i]);
                        }
                    })
                    numWinItemInReels.push(winItemInReel.length);
                }

                // total win coin
                this.winCoinAll += result.winCoin;
                this.multiplier = result.multiplier;
                this.listReelResult.push({
                    slotItemReels: arrResult,
                    lineWinResults: result.lineWinResults,
                    winCoin: result.winCoin,
                    listCanUseTimes: listCanUseTimes,
                    listWinItems: listWinItems,
                    numWinItemInReels: numWinItemInReels,
                    slotItemReelTop: [],
                    mergeItemInReels: mergeItemInReels,
                    multiplier: result.multiplier,
                    listWinItemsTop: listWinItemsTop,
                    lineCanWin: result.LineCanWin,
                })
            })
        },


        updateReelResut: function () {
            this.reelResultIndex++;
            if (this.reelResultIndex >= this.reelResultLength) {
                return;
            }

            this.slotItemReels = this.listReelResult[this.reelResultIndex].slotItemReels;
            this.slotItemReelTop = this.listReelResult[this.reelResultIndex].slotItemReelTop;
            this.mergeItemInReels = this.listReelResult[this.reelResultIndex].mergeItemInReels;
            this.listCanUseTimes = this.listReelResult[this.reelResultIndex].listCanUseTimes;
            this.multiplier = this.listReelResult[this.reelResultIndex].multiplier;
            this.listWinItemsTop = this.listReelResult[this.reelResultIndex].listWinItemsTop;
            this.lineCanWin = this.listReelResult[this.reelResultIndex].lineCanWin;

            this.listWinResults = [];
            if (this.listReelResult[this.reelResultIndex]) {
                // this.listLineWinId = this.listReelResult[this.reelResultIndex].listLineWinId;
                this.listWinResults = this.listReelResult[this.reelResultIndex].listWinItems;
            }
            
            this.winCoin = this.listReelResult[this.reelResultIndex].winCoin;

            this.scatterReelIndex = [];
            for (let i = 0; i < SlotRule.REELS; i++) {
                if (SlotRule.isReelHaveScatter(this.slotItemReels[i])) {
                    this.scatterReelIndex.push(i);
                }
            }



            //cc.log("scatterReelIndex: %j", this.scatterReelIndex);

            this.commander.emit("slot.updateSlotBoard");
        },

        getLinesWin : function(payload){
            this.lineWins = payload.lineWinResults;
        },

        isWinWithWild: function(colIndex){
            
            let col = colIndex + 1;
            //0: ko co line win nhung co wild
            //1: co line win nhung ko lien quan den wild
            //2: co line win va lien quan den wild

            if(this.lineWins.length <= 0) return 0;

            for(let element of this.lineWins){
                if(col <= element.numIdTrung){
                    return 2;
                }
            }

            return 1;
        },

        onGameSendError: function (payload) {
            //cc.log(LOGTAG, "onGameSendError %j", payload);

            if (payload) {
                if (this.previousBalance >= 0) {
                    if (this.numFreeSpin === 0) {
                        this.balance = this.previousBalance;
                    }
                    this.previousBalance = -1;
                }
                this.isSpinError = true;
                this.commander.emit("game.gameError");
                this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
                if (payload.errorCode == 23 || payload.errorCode == 20) 
                {

                    let textBuy = (Localize.text("LANG_LABEL_BUY") || "").toLowerCase();
                    textBuy = textBuy.charAt(0).toUpperCase() + textBuy.slice(1);

                    let options = {
                        textButtonAccept: textBuy
                    };

                    if (this.hasEnterGameScene) {
                        this.commander.emit(SlotCore.POPUP.FUNC.SHOW_CONFIRM, payload.message,
                            this.commander.createTrigger("game.returnToLobbyForPurchasing"), null, options
                        );
                    } else {
                        this.enterMainSceneCallback = (() => {
                            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_CONFIRM, payload.message,
                                this.commander.createTrigger("game.returnToLobbyForPurchasing"), null, options
                            );
                        })
                    }
                } else {
                    this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, payload.message);
                }
            }
        },

        onGameSendMessage: function (payload) {
            //cc.log(LOGTAG, "onGameSendMessage %j", payload);

            if (payload) {
                this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
                this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, payload.message);
            }
        },

        onGameMaintain: function (payload) {
            //cc.log(LOGTAG, "onGameMaintain: %j", payload);

            if (payload) {
                this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
                this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, Localize.text("LANG_PROMPT_SERVER_MAINTANCE"), Commander.trigger("game.returnToLobby"));
            }
        },

        onBroadcastMessage: function (payload) {
            
        },

        onGameJackpotWin: function (payload) {
            cc.log(LOGTAG, 'onGameJackpotWin %j', payload);

            this.jackpotWinCoin = (payload.winCoin || 0);
            if (this.jackpotWinCoin > 0) {
                this.commander.emit("main.popupjackpot.show", this.jackpotWinCoin);
            }
        },

        onGameJackpotConfig: function (payload) {
            // cc.log(LOGTAG, 'onGameJackpotConfig %j', payload);

            // this.jackpotConfigs = (payload.c || []).slice();
            // this.commander.emit("slot.jackpot.config", this.jackpotConfigs);
        },

        onUserUpdateCoin: function (payload) {
            cc.log('========================================================= %j', payload);
            var userCoin = payload.coin;
            this.userData.coin = userCoin;
            this.balance = userCoin;
            this.commander.emit("slot.data.updateCoin");
        },

        onGameJackpotData: function (payload) {

            if (!cc.isArray(payload.jackpotData) || payload.jackpotData.length < 1)
                return;

            this.jackpotRewards = payload.jackpotData[0].coin || [];
            this.jackpotConfigs = payload.jackpotData[0].betCoin || [];
            // cc.log("============ onGameJackpotData %j, %j", this.jackpotRewards, this.jackpotConfigs)
            // this.commander.emit("slot.jackpot.reward", this.jackpotRewards);
            // this.commander.emit("slot.jackpot.config", this.jackpotConfigs);
        },

        onSlotHonorInfo: function (payload) {
            // cc.log(LOGTAG, "onSlotHonorInfo: %j ", payload);

            let time = payload.teff;
            let type = payload.typ || -1;
            let winCoin = payload.wcoin;
            let userName = payload.un;
            let freeSpin = payload.fs;

            this.commander.emit("slot.honor", time, userName, winCoin, type, freeSpin);
        },

        onUserVariablesUpdate: function (payload) {
            cc.log(LOGTAG, "onUserVariablesUpdate: %j ", payload);

            let newBalance = this.userData.coin;
            this.balance = newBalance;
            this.commander.emit("user.update", payload.u, newBalance);
        },

        onGameUserLevelUp: function (payload) {
            // payload =  {"c":18000,"lvn":9,"gif":0,"nEXP":1650000,"es":1200000};
            let coin = (payload.RewardCoin || 0);
            let level = (payload.Level || 0);
            this.balance += coin;
            this.commander.emit("user.level.up", coin, level);
        },

    });

    window.SlotManager = SlotManager;
    return SlotManager;
});
