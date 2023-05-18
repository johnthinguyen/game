/*global define */

Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::MainScene]";

    // Note: MainScene is also a view controller
    // that control its own components, and listen events from Commander
    const MainScene = cc.Scene.extend({
        ctor: function (commander, slotManager) {
            this._super();
            this.isSpinning = false;
            this.isReturnLobbyBuyChips = false;
            this.isInFreeGame = false;
            this.isKicked = false;
            this.isDisconnected = false;
            this.goodLuckArr = [];

            this.commander = commander;
            this.slotManager = slotManager;

            this.ui = ccs._load(Resource.ASSETS.CCS_MainLayer);
            this.addChild(this.ui);
            this.pnlMain = this.ui.getChildByName("main_panel");
            this.initComponents(this.pnlMain);
            this.listenComponentEvents();
            this.updateScaleResolution();
            this.disableSpinButton();

            let betRange = this.slotManager.betCoinsConfig.map(item => item * this.slotManager.HeSoCuoc);
            this.commander.emit(SlotCore.FOOTER.SET.BET_RANGE, betRange);

            WebHelper.initFullScreen(this);
        },

        initComponents: function (mainPanel) {
            this.mainSceneComponent = [];

            let background = mainPanel.getChildByName("bg");
            this.background = new Background({node: background});
            this.backgroundImg = background.getChildByName("bg_img");
            this.background.show();
            this.mainSceneComponent.push(background);

            let board = mainPanel.getChildByName("board");
            window.board = board;
            this.cover = mainPanel.getChildByName("cover");
            this.cover.addTouchEventListener(this.onCoverTouched.bind(this));
            this.cover.setVisible(false);

            this.slotBoard = new SlotBoardContent(this.slotManager, this.commander, {node: board});
            this.popupTutorial = new PopupTutorial({node: mainPanel});

            this.effectBigWin = new EffectBigWin(this.slotManager, this.commander, {node: mainPanel});
            this.effectExtraSpin = new EffectExtraSpin(this.slotManager, this.commander, {node: mainPanel});
            this.effectFreeGameWinCoin = new EffectFreeGameWinCoin(this.slotManager, this.commander, {node: mainPanel});
            this.effectStartFreeGame = new EffectStartFreeGame(this.slotManager, this.commander, {node: mainPanel})
       
            let header = mainPanel.getChildByName("header");
            let footer = mainPanel.getChildByName("footer");

            this.header = SlotCore.createHeader(header);
            this.footer = SlotCore.createFooter(footer);
            window.footer = this.footer;
            this.notifyAuto = SlotCore.createNotifyAuto(mainPanel);
        },

        updateScaleResolution: function () {
            cc.log("check fill scale: %d", ImageUtils.getFillScale());
            ccui.helper.doLayout(this.pnlMain);

            this.cover.setContentSize(cc.visibleRect);
            this.cover.setPosition(cc.visibleRect.center);

            this.background.updateScaleResolution();
            this.slotBoard.updateScaleResolution();

            let headerRoot = this.pnlMain.getChildByName("header");
            headerRoot.y = cc.visibleRect.height;

            let header = SlotCore.getValue(SlotCore.HEADER.GET.NODE);
            header.setScale(ImageUtils.getFitScale());
            header.setContentSize(cc.size(header.getContentSize().width / ImageUtils.getFitScale(), header.getContentSize().height * (ImageUtils.getHeightScale() > 1 ? ImageUtils.getHeightScale() : 1)));
            ccui.helper.doLayout(header);

            let footer = SlotCore.getValue(SlotCore.FOOTER.GET.NODE);
           
            footer.setScale(ImageUtils.getFitScale());
            footer.setContentSize(cc.size(footer.getContentSize().width / ImageUtils.getFitScale(), footer.getContentSize().height * (ImageUtils.getHeightScale() > 1 ? ImageUtils.getHeightScale() : 1)));
            ccui.helper.doLayout(footer);
        },

        // SLOT CORE
        
        setBalance: function (coin) {
            this.commander.emit(SlotCore.HEADER.SET.COIN, coin);
        },

        getHeaderBalance: function(){
            return SlotCore.getValue(SlotCore.HEADER.GET.COIN);
        },

        tweenBalance: function(coin){
            this.commander.emit(SlotCore.HEADER.SET.TWEEN_COIN, this.getHeaderBalance(), coin);
        },

        handleHeader: function(){
            let onTapSound = (button, soundEnable) => {
                ButtonUtils.playClickSound();
                AudioHandler.setEnabled(soundEnable);
            };
            this.commander.emit(SlotCore.HEADER.SET.ON_TAP_SOUND, onTapSound);

            let onTapHome = (button) => {
                ButtonUtils.playClickSound();
                this.requestQuit();
            };
            this.commander.emit(SlotCore.HEADER.SET.ON_TAP_HOME, onTapHome);

            let onTapBuy = (button) => {
                ButtonUtils.playClickSound();
                this.requestBuy();
            };
            this.commander.emit(SlotCore.HEADER.SET.ON_TAP_BUY, onTapBuy);
        },

        randTextGoodLuck: function () {
            if (this.goodLuckArr.length <= 0) {
                this.goodLuckArr = [
                    Localize.text("LANG_TEXT_GOOD_LUCK_0"),
                    Localize.text("LANG_TEXT_GOOD_LUCK_1"),
                    Localize.text("LANG_TEXT_GOOD_LUCK_2"),
                    Localize.text("LANG_TEXT_GOOD_LUCK_3"),
                    Localize.text("LANG_TEXT_GOOD_LUCK_4")
                ];
            }

            let index = MathUtils.randomMinMax(0, this.goodLuckArr.length - 1);
            let text = this.goodLuckArr[index];
            this.goodLuckArr.splice(index, 1);

            return text;
        },

        updateAutoSpinCount: function () {
            if (this.slotManager.isAutoSpin) {
                this.commander.emit(SlotCore.FOOTER.SET.AUTO_SPIN_COUNT, this.slotManager.autoSpinCount);
            } else {
                this.slotManager.setAutoSpin(false);
                this.commander.emit(SlotCore.FOOTER.SET.BUTTON_SPIN_STATE.DEFAULT);

                this.onAutoSpinChanged();
            }
        },

        enableSpinButton: function (isFull = true) {

            this.commander.emit(SlotCore.FOOTER.SET.ENABLE_BUTTON_SPIN, true);

            if (!isFull) {
                return;
            }

            this.commander.emit(SlotCore.FOOTER.SET.ENABLE_BUTTON_MAX_BET, true);
            this.commander.emit(SlotCore.FOOTER.SET.ENABLE_BUTTON_INCREASE_DECREASE, true);
        },

        disableSpinButton: function (isDisableBtnSpin = true) {

            if (isDisableBtnSpin) {
                this.commander.emit(SlotCore.FOOTER.SET.ENABLE_BUTTON_SPIN, false);
            }   

            this.commander.emit(SlotCore.FOOTER.SET.ENABLE_BUTTON_MAX_BET, false);
            this.commander.emit(SlotCore.FOOTER.SET.ENABLE_BUTTON_INCREASE_DECREASE, false);
        },

        setWinCoin: function(coin, useTween = false){
            if (!useTween) {
                this.commander.emit(SlotCore.FOOTER.SET.WIN_COIN, coin);
                return;
            }

            let winCoin = SlotCore.getValue(SlotCore.FOOTER.GET.WIN_COIN);
            this.commander.emit(SlotCore.FOOTER.SET.TWEEN_WIN_COIN, winCoin, coin);
        },

        updateBetMoney: function () {
            cc.log('updateBetMoney',this.slotManager.indexBetRate);
            this.commander.emit(SlotCore.FOOTER.SET.BET_INDEX, this.slotManager.indexBetRate);
        },

        getFooterWinCoin: function(){
            return SlotCore.getValue(SlotCore.FOOTER.GET.WIN_COIN);
        },

        handleFooter: function(){

            let onTapSpin = (button) => {
                let isShow = SlotCore.getValue(SlotCore.FOOTER.GET.PANEL_AUTO_SHOWING);

                if (!isShow) {
                    if (this.slotManager.isAutoSpin) {
                        this.slotManager.setAutoSpin(false);
                        this.updateAutoSpinCount();
                    } else {
                        AudioHandler.playClickSpin();
                        this.handleSpinClick();
                    }  
                } 
                else{
                    SlotCore.getValue(SlotCore.FOOTER.FUNC.HIDE_PANEL_AUTO);
                }
            }
            this.commander.emit(SlotCore.FOOTER.SET.ON_TAP_SPIN, onTapSpin);

            let onTapIncreaseBet = (button, betCoin) => {
                AudioHandler.playClickSound();
                this.increaseBet();
            }
            this.commander.emit(SlotCore.FOOTER.SET.ON_TAP_INCREASE_BET, onTapIncreaseBet);

            let onTapDecreaseBet = (button, betCoin) => {
                AudioHandler.playClickSound();
                this.decreaseBet();
            }
            this.commander.emit(SlotCore.FOOTER.SET.ON_TAP_DECREASE_BET, onTapDecreaseBet);

            let onTapMaxBet = (button, betCoin) => {
                AudioHandler.playClickSound();
                this.selectMaxBet()
            }
            this.commander.emit(SlotCore.FOOTER.SET.ON_TAP_MAX_BET, onTapMaxBet);

            let onTapGuide = (button) => {
                AudioHandler.playClickSound();
                this.showTutorial()
            }
            this.commander.emit(SlotCore.FOOTER.SET.ON_TAP_GUIDE, onTapGuide);

            let onHoldSpin = (button) => {
                if (this.slotManager.isAutoSpin)
                    return;

                let isShow = SlotCore.getValue(SlotCore.FOOTER.GET.PANEL_AUTO_SHOWING);
                if (isShow){
                    return;
                }

                this.commander.emit(SlotCore.FOOTER.FUNC.SHOW_PANEL_AUTO);
            }
            this.commander.emit(SlotCore.FOOTER.SET.ON_HOLD_SPIN, onHoldSpin);

            let onTapSpinItemSpin = (button, numberAutoSpin) => {
                this.slotManager.setAutoSpin(true, numberAutoSpin);

                if (numberAutoSpin == SlotRule.AUTO_SPIN_INFINITE) {
                    this.commander.emit(SlotCore.FOOTER.SET.BUTTON_SPIN_STATE.AUTO_INFINITY);
                } else {
                    this.commander.emit(SlotCore.FOOTER.SET.BUTTON_SPIN_STATE.AUTO_NUMBER);
                    this.commander.emit(SlotCore.FOOTER.SET.AUTO_SPIN_COUNT, this.slotManager.autoSpinCount);
                }

                this.onAutoSpinChanged();
            }

            this.commander.emit(SlotCore.FOOTER.SET.ON_TAP_SPIN_COUNT_ITEM, onTapSpinItemSpin);
        
        },

        // END SLOT CORE

        onTimeOutSpinning: function () {
            if (!this.slotManager) {
                return;
            }

            if (this.isKicked) {
                return;
            }

            if (this.slotManager.isAutoSpin) {
                this.slotManager.setAutoSpin(false);
                this.updateAutoSpinCount();
            }
            this.slotManager.handleResponse(true);
            this.slotBoard.forceStopSpin();
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, Localize.text("LANG_PROMPT_NETWORK_ERROR"), null);
        },

        clearTimeoutSpinning: function () {
            this.unschedule(this.onTimeOutSpinning);
        },

        onReconnect: function () {
            this.isKicked = false;
            this.isDisconnected = false;

            if (!this.isInFreeGame) {
                this.setBalance(this.slotManager.balance);
            }

            if (this.isSpinning) {
                this.slotManager.handleResponse();
                this.slotManager.requestNewSpin();

                this.clearTimeoutSpinning();
                this.scheduleOnce(this.onTimeOutSpinning, 15);
            } else if (this.isInFreeGame && this.isFreeGameIdle) {
                this.commander.emit("slot.requestSpin");
            }
            if (this.slotManager.isAutoSpin && this.isIdle) {
                this.handleSpinClick();
            }
        },

        onExitingGame: function () {
            AudioHandler.stopBackground();
            if (this.isSpinning) {
                this.slotBoard.forceStopSpinImmediately();
            }
        },

        handleKeyBack: function () {
            if (!this.popupTutorial.isClosed) {
                this.popupTutorial.close();
                return;
            } 

            let isShow = false;
            let popups = SlotCore.getValue(SlotCore.POPUP.GET.POPUPS);

            popups.forEach(prompt => {
                if (cc.sys.isObjectValid(prompt) && prompt.isVisible()){
                    isShow = true;
                }
            });

            if (isShow) {
                this.commander.emit(SlotCore.POPUP.FUNC.HIDE_POPUPS);
                return;
            } 

            this.commander.emit("handle.back.action");
        },

        onLoginFailed: function (isStopSpinning = false) {
            this.clearTimeoutSpinning();
            this.isDisconnected = true;
            if (this.isSpinning && this.slotManager.waitForSpinResponse && isStopSpinning) {
                this.slotManager.handleResponse();
                this.slotBoard.forceStopSpin();
            }
        },

        onLoginKicked: function () {
            this.isKicked = true;
            this.clearTimeoutSpinning();
            if (this.slotManager.isAutoSpin) {
                this.slotManager.setAutoSpin(false);
                this.updateAutoSpinCount();
            }

            if (this.isSpinning && this.slotManager.waitForSpinResponse) {
                this.slotManager.handleResponse();
                this.slotBoard.forceStopSpin();
            }
        },

        onGameError: function () {
            if (!this.isSpinning) {
                return;
            }

            if (this.header && !this.isInFreeGame) {
                this.setBalance(this.slotManager.balance);
            }

            this.clearTimeoutSpinning();

            if (this.slotManager.isAutoSpin && !this.isInFreeGame) {
                this.slotManager.setAutoSpin(false);
                this.updateAutoSpinCount();
            }

            this.slotManager.handleResponse(true);
            this.slotBoard.forceStopSpin();
        },

        listenComponentEvents: function () {
            this.keyBackListener = {
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: (keyCode, event) => {
                    if (keyCode === cc.KEY.back) {
                        this.handleKeyBack();
                    } else if (keyCode === cc.KEY.backspace) {
                        this.handleKeyBack();
                    } else if (keyCode === cc.KEY.escape) {
                        this.handleKeyBack();
                    }
                }
            };

            cc.eventManager.addListener(this.keyBackListener, this);

            this.handleHeader();
            this.handleFooter();
        },

        startDeposit: function () {
            if (this.linkDeposit && this.linkDeposit !== "") {
                cc.sys.openURL(this.linkDeposit);
            } else {
                let onError = () => {
                    cc.log("error get link happy");
                    this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
                    this.commander.emit("game.returnToLobbyForPurchasing");
                };

                let onSuccess = (payload) => {
                    this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);

                    if (payload.Result === 1 && payload.Data !== null && payload.Data !== undefined && payload.Data.Link && payload.Data.Link !== "") {
                        this.linkDeposit = payload.Data.Link;
                        cc.sys.openURL(this.linkDeposit);
                    } else {
                        onError();
                    }
                };

                WebService.getLinkHappy(onSuccess, onError);
            }
        },

        // Lifecycle

        onEnter: function () {
            this._super();
            AudioHandler.setEnabled(true);
            this.updateDisplay();
            this.startListenEvents();
            AudioHandler.playBackground();
            this.slotManager.hasEnterGameScene = true;
            this.slotManager.enterMainSceneCallback && this.slotManager.enterMainSceneCallback();

            this.commander.emit(SlotCore.FOOTER.SET.TEXT_MESSAGE, this.randTextGoodLuck());
        },

        onExit: function () {
            this._super();

            this.commander.emit(SlotCore.POPUP.FUNC.HIDE_POPUPS);
            this.commander.emit(SlotCore.POPUP.FUNC.HIDE_WAITING);
            
            this.stopListenEvents();

            AudioHandler.quit();
            Resource.clearCache();

            if (portalHelper.notifyGame) {
                portalHelper.notifyGame(portalHelper.EVENT_GAME_LEAVE_ROOM, {sender: this.layerNano || this});
            }
        },

        startSpinReel: function (isSpinningBonus) {
            this.slotBoard.startSpin(isSpinningBonus, this.isInFreeGame);
            if (!this.isInFreeGame) {
                // this.background.playLightIdle();
            }

            if (!isSpinningBonus) {
                if (this.slotManager.isAutoSpin && !this.slotManager.isInfiniteAutoSpin) {
                    this.slotManager.reduceAutoSpin();
                    this.updateAutoSpinCount();
                }
            }
            if (this.isInFreeGame){
                this.effectStartFreeGame.backgroundHighlight(false);
            }
        },
        // Dung Quay
        stopSpinReel: function (data) {
            this.slotBoard.stopSpin();
        },

        onBeforeReelStop: function (reelIndex) {
            this.slotBoard.onBeforeReelStop(reelIndex);
        },

        enterIdle: function () {
            this.isIdle = true;
            this.setBalance(this.slotManager.balance);
            if (this.slotManager.isAutoSpin) {
                return;
            }
            this.enableSpinButton();
        },

        exitIdle: function () {
            this.isIdle = false;
            if (SlotRule.DRAWLINE_ENABLED) {
                this.slotBoard.drawLine(-1);
            }
            this.slotBoard.turnOffHighlightItems();
            if (!this.slotManager.isAutoSpin) {
                this.disableSpinButton();
            } else {
                this.disableSpinButton(false);
            }
        },

        enterSpinning: function () {
            this.isSpinning = true;

            if (this.slotManager.isSpinError) {
                this.onGameError();
                return;
            }

            this.scheduleOnce(this.onTimeOutSpinning, 15);
            if (!this.slotManager.waitForSpinResponse) {
                this.commander.emit("slot.spinResponsed");
            }

            this.commander.emit(SlotCore.FOOTER.SET.TEXT_MESSAGE, this.randTextGoodLuck());
        },

        exitSpinning: function () {
            this.clearTimeoutSpinning();
            this.isSpinning = false;
        },

        enterFreeGameIdle: function () {
            this.isFreeGameIdle = true;
            if (this.slotManager.isSpinError) {
                if (this.slotManager.isAutoSpin) {
                    this.slotManager.setAutoSpin(false);
                    this.updateAutoSpinCount();
                }
                this.enableSpinButton(false);
            }
            this.slotBoard.updatePanelFreeGame(this.isInFreeGame, this.slotManager.numFreeSpin, this.slotManager.multiplier);
        },

        exitFreeGameIdle: function () {
            this.isFreeGameIdle = false;
            if (this.slotManager.numFreeSpin > 0) {
                // this.slotBoard.updatePanelFreeGame(this.isInFreeGame, this.slotManager.numFreeSpin - 1, 0);
                this.slotBoard.updatePanelFreeGame(this.isInFreeGame, this.slotManager.numFreeSpin - 1, this.slotManager.multiplier);
            }

            this.slotBoard.turnOffHighlightItems();
            if (!this.slotManager.isAutoSpin) {
                this.disableSpinButton();
            } else {
                this.disableSpinButton(false);
            }
        },

        highlightWinItems: function (lineWinResults, lineWinTopResults, isShowAll) {
            AudioHandler.playWinLine();
            this.commander.emit(SlotCore.FOOTER.SET.TEXT_MESSAGE, this.randTextGoodLuck());

            this.slotBoard.highlightWinItems(lineWinResults, lineWinTopResults, isShowAll);
            if (isShowAll) {
                if (!this.isInFreeGame) {
                    this.tweenBalance(Math.min(this.slotManager.balance, this.getHeaderBalance() + this.slotManager.winCoin));
                }

                this.setWinCoin(this.getFooterWinCoin() + this.slotManager.winCoin, true);
            } else {
                if (SlotRule.DRAWLINE_ENABLED) {
                    this.slotBoard.drawLine(lineWinResults.data.lines[0]);
                }
            }

            if (this.isInFreeGame) {
                // this.slotManager.increaseFreeGameCombo();
                this.effectStartFreeGame.backgroundHighlight(true);
                this.scheduleOnce(() =>{
                    this.slotBoard.showFreeGameEliminateCount(this.slotManager.multiplier);
                    this.slotBoard.updatePanelFreeGame(this.isInFreeGame, this.slotBoard.numFreeSpin, this.slotManager.multiplier);
                }, 2)
            }
        },

        turnOffHighlightItems: function () {
            this.slotBoard.turnOffHighlightItems();
        },

        startWaitScatter: function (reelStartWaitIndex = 0) {
            if (this.slotManager.isAutoSpin && SlotRule.IS_AUTO_FAST_MODE) {
                return;
            }

            this.slotBoard.startWaitScatter(reelStartWaitIndex)
        },

        highlightScatter: function (scatterReelIndex = []) {
            AudioHandler.playHighlightScatter();
            this.slotBoard.highlightScatter(scatterReelIndex);
            this.scheduleOnce(() => {
                this.commander.emit("slot.highlightScatter.done");
            }, SlotRule.TIME_HIGHLIGHT_SCATTER);
        },

        highlightExtraSpin: function () {
            this.slotBoard.highlightExtraSpin();
        },

        showExtraSpin: function () {
            this.enableCover();
            this.effectExtraSpin.show(this.slotManager.numExtraSpin, this.highlightExtraSpinPanel.bind(this));
        },

        highlightExtraSpinPanel: function () {
            this.slotBoard.turnOffHighlightItems();
            this.slotBoard.updatePanelFreeGame(this.isInFreeGame, this.slotBoard.numFreeSpin, this.slotManager.multiplier, this.slotManager.numExtraSpin);
        },

        updateSlotBoard: function () {
            this.slotBoard.updateBoardItems();
        },

        spinError: function (message) {
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_MESSAGE, message);
        },

        spinFail: function () {
            this.slotBoard.forceStopSpin();
            //Không đủ tiền
            if (this.slotManager.isAutoSpin) {
                this.slotManager.setAutoSpin(false);
                this.updateAutoSpinCount();
            }
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_CONFIRM, Localize.text("LANG_PROMPT_OUT_OF_MONEY"),
                this.commander.createTrigger("game.returnToLobbyForPurchasing"), null
            );
        },

        updateJackpotInGame: function () {
            //cc.log("has been commanded jacpotInGame j%");
        },

        updateMatchId: function (matchId) {
            this.commander.emit(SlotCore.HEADER.SET.MATCH_ID, matchId);
        },

        startListenEvents: function () {
            this.commandSession = this.commander.createSession();

            this.commandSession.on("slot.data.updateCoin", () => {
                //cc.log('update user Coin', this.slotManager.balance);
                if (!this.isInFreeGame) {
                    this.setBalance(this.slotManager.balance);
                }
            });

            this.commandSession.on("slot.footer.updateBetMoney", () => {
                this.updateBetMoney();
            });

            this.commandSession.on("main.header.setMatchID", this.updateMatchId.bind(this));

            this.commandSession.on("slot.spinStarted", this.startSpinReel.bind(this));
            this.commandSession.on("slot.spinStop", this.stopSpinReel.bind(this));
            this.commandSession.on("slot.highlightWinItems", this.highlightWinItems.bind(this));
            this.commandSession.on("slot.updateSlotBoard", this.updateSlotBoard.bind(this));
            this.commandSession.on("slot.bigwin.show", this.showBigWin.bind(this));
            this.commandSession.on("slot.spinFailed", this.spinFail.bind(this));
            this.commandSession.on("slot.turnOffHighlightItems", this.turnOffHighlightItems.bind(this));
            this.commandSession.on("slot.highlightScatter", this.highlightScatter.bind(this));
            // this.commandSession.on("slot.highlightExtraSpinItem", this.highlightExtraSpin.bind(this));
            this.commandSession.on("slot.showExtraSpin", this.showExtraSpin.bind(this));
            this.commandSession.on("slot.beforeReelFinishStop", this.onBeforeReelStop.bind(this));
            this.commandSession.on("slot.requestFreeSpin", this.requestFreeSpin.bind(this));
            this.commandSession.on("slot.playScatter.wait", this.startWaitScatter.bind(this));

            this.commandSession.on("state.enterIdle", this.enterIdle.bind(this));
            this.commandSession.on("state.enterIdle.callAuto", this.requestAutoSpin.bind(this));
            this.commandSession.on("state.exitIdle", this.exitIdle.bind(this));
            this.commandSession.on("state.enterSpinning", this.enterSpinning.bind(this));
            this.commandSession.on("state.exitSpinning", this.exitSpinning.bind(this));
            this.commandSession.on("state.enterIdleFreeGame", this.enterFreeGameIdle.bind(this));
            this.commandSession.on("state.exitIdleFreeGame", this.exitFreeGameIdle.bind(this));
            this.commandSession.on("state.startFreeGame", this.showStartFreeGameAnim.bind(this));
            this.commandSession.on("state.exitFreeGame", this.exitFreeGame.bind(this));

            this.commandSession.on("game.quit", this.onExitingGame.bind(this));
            this.commandSession.on("game.gameError", this.onGameError.bind(this));

            this.commandSession.on("handle.back.action", this.requestQuit.bind(this));

            this.commandSession.on("login.reconnect", this.onReconnect.bind(this));
            this.commandSession.on("login.loginFailed", this.onLoginFailed.bind(this));
            this.commandSession.on("login.loginKicked", this.onLoginKicked.bind(this));

            this.commandSession.on("user.level.up", this.showEffectLevelUp.bind(this));
            this.commandSession.on("main.popupjackpot.show", this.showWinJackPot.bind(this));
            this.commandSession.on("main.enableCover", this.enableCover.bind(this));
            this.commandSession.on("main.disableCover", this.disableCover.bind(this));
            this.commandSession.on("main.enabledMainScene", this.setEnabledMainScene.bind(this));
            this.commandSession.on("main.setSceneFreeGame", this.setSceneFreeGame.bind(this));

            this.commandSession.on("slot.showEffectFreeSpinAdded", this.showEffectFreeSpinAdded.bind(this));
        },

        stopListenEvents: function () {
            if (this.commandSession) {
                this.commandSession.dispose();
                this.commandSession = null;
            }
        },

        // Working with components
        updateDisplay: function () {
            this.commander.emit(SlotCore.HEADER.SET.USERNAME, this.slotManager.userData.nickName);
            this.commander.emit(SlotCore.HEADER.SET.USER_ID, this.slotManager.userData.id);
            this.commander.emit(SlotCore.HEADER.SET.VIP, this.slotManager.userData.vipLevel);
            this.commander.emit(SlotCore.HEADER.SET.LEVEL, this.slotManager.userData.level);
            this.commander.emit(SlotCore.HEADER.SET.LEVEL_PROGRESS, this.slotManager.userData.currExp, this.slotManager.userData.nextExp);
            this.commander.emit(SlotCore.HEADER.SET.SOUND,AudioHandler.isEnabled());
            this.commander.emit(SlotCore.HEADER.SET.COIN, this.slotManager.balance);

            this.updateBetMoney();
        },

        selectBetCredit: function (index) {
            this.slotManager.selectBetCredit(index);
        },

        showTutorial: function () {
            this.popupTutorial.show();
        },

        delayHideNotifyAuto: function(){
            this.commander.emit(SlotCore.NOTIFY_AUTO.FUNC.HIDE);
        },

        onAutoSpinChanged: function () {

            this.commander.emit(this.slotManager.isAutoSpin ? SlotCore.NOTIFY_AUTO.FUNC.SHOW_TEXT_START_AUTO : SlotCore.NOTIFY_AUTO.FUNC.SHOW_TEXT_END_AUTO);

            this.unschedule(this.delayHideNotifyAuto);
            this.scheduleOnce(this.delayHideNotifyAuto.bind(this), 1.6);

            if (!this.slotManager.isAutoSpin && !this.isIdle) {
                this.disableSpinButton();
            }

            if (this.slotManager.isAutoSpin && (this.isIdle || this.isFreeGameIdle)) {
                this.handleSpinClick();
            }
        },

        requestQuit: function () {
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_CONFIRM, Localize.text("LANG_PROMPT_RETURN_LOBBY"),
                this.commander.createTrigger("game.returnToLobby"), null
            );
        },

        requestBuy: function () {
            this.commander.emit(SlotCore.POPUP.FUNC.SHOW_CONFIRM, Localize.text("LANG_PROMPT_RETURN_LOBBY_FOR_PURCHASING"),
                this.commander.createTrigger("game.returnToLobbyForPurchasing"), null
            );
        },

        setSceneFreeGame: function () {
            this.slotBoard.showFreeGameEliminateCount(this.slotManager.multiplier);
            this.slotBoard.updatePanelFreeGame(true, this.slotManager.numFreeSpin, this.slotManager.multiplier);
        },

        showEffectFreeSpinAdded: function(){
            this.slotBoard.showEffectFreeSpinAdded(this.slotManager.numFreeSpin);
        },

        startFreeGame: function (multiplier, numFreeSpin = 0) {

            cc.log("startFreeGame", numFreeSpin);
            this.scheduleOnce(() => {
                AudioHandler.playBackgroundFreeGame();
            }, 2);
            
            this.isInFreeGame = true;
            this.commander.emit("state.startFreeGame.done");
        },

        showStartFreeGameAnim: function (multiplier, numFreeSpin) {
            AudioHandler.playFreeGameStart();
            AudioHandler.stopBackground(0.5);
            this.enableCover();
            this.effectStartFreeGame.show(numFreeSpin, this.startFreeGame.bind(this, multiplier, numFreeSpin));
        },

        exitFreeGame: function () {
            if (this.getFooterWinCoin() > 0) {
                AudioHandler.playFreeGameEnd();
                this.enableCover();
                this.slotBoard.updatePanelFreeGame(false);
                this.effectFreeGameWinCoin.show(this.getFooterWinCoin(), this.slotManager.totalFreeGameSpinned, this.onExitFreeGame.bind(this));
                return;
            }
            this.slotBoard.updatePanelFreeGame(false);
            this.onExitFreeGame();
        },

        onExitFreeGame: function () {
            this.isInFreeGame = false;
            // this.backgroundImg.setColor(cc.WHITE);
            // this.background.changeColorAllLights(ViewStyle.WHITE_COLOR);
            // this.background.playLightIdle();
            this.effectStartFreeGame.hide();
            this.commander.emit("state.exitFreeGame.done");
        },

        showEffectLevelUp: function (coin, level) {
            this.commander.emit(SlotCore.HEADER.SET.LEVEL, level);
            this.setBalance(Math.min(this.slotManager.balance, this.getHeaderBalance() + coin));
            EffectLevelUp.show(coin, level, () => {
            });
        },

        showWinJackPot: function (winCoin) {
            let jackpotPopup = this.getChildByName('mainScene.popupJackpot');
            if (!jackpotPopup) {
                jackpotPopup = new PopupJackpot();
                jackpotPopup.setName('mainScene.popupJackpot');
                this.addChild(jackpotPopup, ViewStyle.LAYER_ORDER.POPUP + 1);
            }
            jackpotPopup.show(winCoin, this.onShowRewardDone.bind(this, winCoin));
        },

        onShowRewardDone: function (rewardCoin) {
            this.tweenBalance(this.getHeaderBalance() + rewardCoin);
        },

        showBigWin: function (type, winCoin) {
            this.enableCover();
            this.effectBigWin.show(type, winCoin);
        },

        handleSpinClick: function () {
            if (this.isFreeGameIdle) {
                this.commander.emit("slot.requestSpin");
                return;
            }

            if (!this.isIdle) {
                return;
            }
            //cc.log("handledSpinClick!!!!");
            if (!this.isInFreeGame) {
                this.setWinCoin(0, false);
            }
            let value = this.slotManager.getCurrentStake();
            if (this.slotManager.balance >= value) {
                if (!this.isSpinning) {
                    this.commander.emit("slot.requestSpin");
                }
            } else {
                if (this.slotManager.isAutoSpin) {
                    this.slotManager.setAutoSpin(false);
                    this.updateAutoSpinCount();
                }
                this.commander.emit(SlotCore.POPUP.FUNC.SHOW_CONFIRM, Localize.text("LANG_PROMPT_OUT_OF_MONEY"),
                    this.commander.createTrigger("game.returnToLobbyForPurchasing"), null
                );
            }
        },

        requestFreeSpin: function () {
            if (!this.isDisconnected && !this.isKicked) {
                this.commander.emit("slot.requestSpin");
            }
        },

        requestAutoSpin: function () {
            if (!this.isDisconnected && !this.isKicked) {
                this.handleSpinClick();
            }
        },

        increaseBet: function () {
            this.slotManager.increaseBet();
            this.updateBetMoney();
        },

        decreaseBet: function () {
            this.slotManager.decreaseBet();
            this.updateBetMoney();
        },

        selectMaxBet: function () {
            this.slotManager.selectMaxBet();
            this.updateBetMoney();
        },

        enableCover: function () {
            this.cover.runAction(cc.sequence(
                cc.show(),
                cc.fadeIn(0.02)
            ));
        },

        disableCover: function () {
            this.cover.runAction(cc.sequence(
                cc.fadeOut(0.02),
                cc.hide()
            ));
        },

        onCoverTouched: function (widget, type) {
            if (!SlotRule.EFFECT_QUICK_HIDE_ENABLED) {
                return;
            }

            if (type === ccui.Widget.TOUCH_ENDED) {
                this.effectBigWin.hide(0);
                this.effectFreeGameWinCoin.hide();
            }
        },

        setEnabledMainScene: function (enabled = true) {
            this.mainSceneComponent.forEach((component) => {
                if (cc.sys.isObjectValid(component)) {
                    component.setVisible(enabled);
                }
            })
        }
    });

    window.MainScene = MainScene;
    return MainScene;
});
