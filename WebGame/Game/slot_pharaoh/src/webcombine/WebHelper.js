"use strict";

var currentOverlay = null;
var listCurrentOverlay = [];
var isFullScreen = false;
var rootUrl = '//live777.com';

var WebHelper = {
    ///////////////////////

    articleTutorial: {
        509: rootUrl + '/ok3-solo/guide'
    },

    ///////////////////////
    _setWebConfig: function _setWebConfig() {
        this.gameContainer = document.getElementById('gameContainer');
        var flashVars = this.gameContainer.getAttribute('data-flashvars');

        if (flashVars === undefined) {

        } else {
            if (flashVars === '') {//user chưa login
                this.userID = 0;
                this.email = '';
                this.password = '';
                this.zoneName = this.gameContainer.getAttribute('data-zone');
                this.roomToJoinInfo = {};
                this.loginState = this.gameContainer.getAttribute('data-logintype');
                this.flashVars = '';
                this.socketKey = '';
                this.host = '';
                this.port = '';
                this.md5Pass = '';
            } else {//user đã login
                this.host = '';
                this.port = '';

                var socketKey = this.gameContainer.getAttribute('data-socketkey');
                var arrSocketKey = socketKey.split(':');
                if (arrSocketKey.length > 1) {
                    this.host = arrSocketKey[0];
                    this.port = arrSocketKey[1];
                }

                this.userID = parseInt(this.gameContainer.getAttribute('data-userID'));
                this.email = this.gameContainer.getAttribute('data-email');
                this.password = '';
                this.zoneName = this.gameContainer.getAttribute('data-zone');
                this.roomToJoinInfo = {};
                this.loginState = this.gameContainer.getAttribute('data-logintype');
                this.flashVars = this.gameContainer.getAttribute('data-flashvars');
                this.flashVarsOld = this.gameContainer.getAttribute('data-flashvarold');
                this.md5Pass = this.gameContainer.getAttribute('data-pfish');
                this.socketKey = socketKey;

            }
        }

    },

    _parseConfigAccount: function _parseConfigAccount() {
        // this.userID = 215598;
        // this.userName = 215598;
        // this.port = 2190;
        // this.password = '64150BC0CCB2D425D6483E35381893C1';

        return {
            userId: this.userID,
            userName: this.userName,
            userEmail: this.email,
            userPass: this.password,
            flashVars: this.flashVars,
            gameLang: portalHelper.getLanguageStr(),
            betCoin: -1,
            roomType: -1,
            host: this.host,
            port: this.port,
            md5Pass: this.md5Pass,
            isOnline: true
        };
    },

    getFullScreen: function changeZoom() {
        isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if (isFullScreen === undefined) return true; else return isFullScreen;
    },

    changeZoom: function changeZoom(target) {
        if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen();
            }
        }
        // cc.view.setContentTranslateLeftTop(0, 0);
        cc.view.setDesignResolutionSize(cc.director.getWinSize().width, cc.director.getWinSize().height, cc.ResolutionPolicy.SHOW_ALL);
        cc.view.setOrientation(cc.ORIENTATION_LANDSCAPE);
        if (target && target.overlayFullScreen) {
            for (var i = 0; i < listCurrentOverlay.length; i++) {
                listCurrentOverlay[i].setVisible(false);
            }
        }
        // target.removeChildByTag(2);
    },

    initFullScreen: function initFullScreen(target) {
        if (cc.sys.isMobile) {
            if (target.overlayFullScreen === undefined) {
                target.overlayFullScreen = ccui.Layout.create();
                target.addChild(target.overlayFullScreen, 9999);
            }
            target.overlayFullScreen.setPosition(cc.p(0, 0));
            target.overlayFullScreen.setContentSize(cc.winSize);
            target.overlayFullScreen.setAnchorPoint(cc.p(0, 0));
            target.overlayFullScreen.setTouchEnabled(true);
            target.overlayFullScreen.setColor(cc.color.WHITE);
            target.overlayFullScreen.setBackGroundColor(cc.color(0, 0, 0));
            target.overlayFullScreen.setBackGroundColorOpacity(0);
            target.overlayFullScreen.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            target.overlayFullScreen.addTouchEventListener(function (_, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    if (/Crosswalk/i.test(navigator.userAgent)) document.getElementsByTagName('body')[0].style.zoom = 1;

                    WebHelper.changeZoom(target);

                    if (/Crosswalk/i.test(navigator.userAgent)) document.getElementsByTagName('body')[0].style.zoom = 1;
                }
            });
            target.overlayFullScreen.setVisible(!WebHelper.getFullScreen());
            currentOverlay = target.overlayFullScreen;
            listCurrentOverlay.push(currentOverlay);

            window.addEventListener("resize", function () {
                if (!WebHelper.getFullScreen()) {
                    if (currentOverlay) {
                        currentOverlay.setVisible(true);
                    }
                }
            });
        }
    },
    /*
    * Ve trang chu
    * */
    onRequestBackToLobby: function onRequestBackToLobby() {
        window.open(window.location.protocol + '//' + document.location.host + '/', '_self').focus();
    },//WebHelper.onRequestBackToLobby();

    /*
    * Mo nap
    * */
    openPageDeposit: function openPageDeposit() {
        ClientWebHelper.showDepositOhYeaInGame();
    },

    /*
    * Huong dan
    * */
    openTutorialGame: function openTutorialGame(gameId) {
        this.openLinkNewBlank(this.getUrlTutorialGame(gameId));
    },

    openLinkNewBlank: function openLinkNewBlank(link) {
        if (link) {
            var _window = window.open(link, '_blank');
            _window.focus();
        }
    },

    getUrlTutorialGame: function getUrlTutorialGame(gameId) {
        return (this.articleTutorial[gameId]) ? this.articleTutorial[gameId] : null;
    }

};
