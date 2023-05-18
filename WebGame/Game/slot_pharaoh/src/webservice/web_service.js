"use strict";

var WebServiceController = cc.Class.extend({
    LOGTAG: "[WebServiceController]",

    ctor: function ctor() {
        this.isTokenTimeout = false;
        this.listWSWaitRenewTokenComplete = [];
    },

    callWS: function callWS(paramString, paramArray, completeHandler, errorHandler, additionHeaderArray) {
        var escapingParam = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

        cc.log(this.LOGTAG, "callWS:", paramString, ", %j", paramArray, "userId:", portalHelper.getUserId(), "userPass:", portalHelper.getUserPass(), "userToken:", portalHelper.getUserToken());
        this.callWSWithUrl(portalHelper.getWSAPI(), paramString, paramArray, completeHandler, errorHandler, additionHeaderArray, escapingParam);
    },

    callWSWithUrl: function callWSWithUrl(url, paramString, paramArray, completeHandler, errorHandler, additionHeaderArray) {
        var escapingParam = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

        cc.log(this.LOGTAG, "callWSWithUrl:", "url:", url, paramString, ", %j", paramArray, "userId:", portalHelper.getUserId(), "userPass:", portalHelper.getUserPass(), "userToken:", portalHelper.getUserToken());

        // ex: paramString = 'ApiName=GetConfigServer&ConfigId=1&GameVersion=1.7&ServerCode=', paramArray = ['GetConfigServer', 1, 1.7, '']

        if (this.isTokenTimeout && this.checkWSNeedToken(paramString)) {
            this.listWSWaitRenewTokenComplete.push([paramString, paramArray, completeHandler, errorHandler]);
        } else {

            // ApiName=LoginApi&username={0}&pass={1}
            var strSign = paramString.split('&')[0].split('=')[1];

            // ex: strSign = GetConfigServer11.7
            for (var i = 0; i < paramArray.length; i++) {
                strSign += paramArray[i];
            }

            var joiningParams = paramArray;
            if (escapingParam) {
                joiningParams = paramArray.map(function (item) {
                    // return item.replace(/\"/g, "&quote;");
                    return encodeURI(item);
                });
            }

            paramString = StringUtils.formatString(paramString, joiningParams);

            // ex: signtxt = "GetConfigServer11.7201.7ASDWQESD@32312"
            // signtxt = [apiName][params][platformId][userId][appVersion][deviceId][userToken]
            var signtxt = strSign + StringUtils.formatString('{0}{1}{2}{3}{4}', portalHelper.getPlatformId(), portalHelper.getUserId(), portalHelper.getVersionGame(), portalHelper.getDeviceId(), portalHelper.getUserToken());
            var sign = CryptoUtils.MD5.encode(signtxt);

            cc.log(this.LOGTAG, "callWS", "signTxt:", signtxt);
            cc.log(this.LOGTAG, "callWS", "sign:", sign);

            paramString += StringUtils.formatString('&ChannelID={0}&PlatformID={1}&UserID={2}&AppVersion={3}&HardwareID={4}&Sign={5}&BundleID={6}&Lang={7}', portalHelper.getChannelId(), portalHelper.getPlatformId(), portalHelper.getUserId(), portalHelper.getVersionGame(), portalHelper.getDeviceId(), sign, portalHelper.getBundleId(), portalHelper.getLanguageStr());

            this.callAPI(url, paramString, HttpRequest.METHOD.POST, completeHandler, errorHandler, additionHeaderArray);
        }
    },

    callWSGetLink: function callWSGetLink(articleId, extension, paramString, paramArray, completeHandler, errorHandler) {

        if (paramString.length > 4096) return;

        paramString = StringUtils.formatString(paramString, paramArray);

        var strSign = "";
        paramArray.forEach(function (param) {
            strSign += param;
        });

        var signtxt = strSign + articleId + StringUtils.formatString('{0}{1}{2}{3}{4}', portalHelper.getPlatformId(), portalHelper.getUserId(), portalHelper.getVersionGame(), portalHelper.getDeviceId(), portalHelper.getUserToken());
        var sign = CryptoUtils.MD5.encode(signtxt);

        cc.log(this.LOGTAG, "callWSGetLink", "signTxt:", signtxt);
        cc.log(this.LOGTAG, "callWSGetLink", "sign:", sign);

        paramString += StringUtils.formatString('{0}&ChannelID={1}&PlatformID={2}&UserID={3}&AppVersion={4}&HardwareID={5}&Sign={6}&BundleID={7}&Lang={8}', extension, portalHelper.getChannelId(), portalHelper.getPlatformId(), portalHelper.getUserId(), portalHelper.getVersionGame(), portalHelper.getDeviceId(), sign, portalHelper.getBundleId(), portalHelper.getLanguageStr());

        this.callAPI(portalHelper.getWSAPI(), paramString, HttpRequest.METHOD.POST, completeHandler, errorHandler);
    },

    callWSTokenless: function callWSTokenless(paramString, paramArray, completeHandler, errorHandler) {
        cc.log(this.LOGTAG, "callWSTokenless: ", paramString, ", %j", paramArray);

        // ex: paramString = 'ApiName=GetConfigServer&ConfigId=1&GameVersion=1.7&ServerCode=', paramArray = ['GetConfigServer', 1, 1.7, '']

        // ApiName=LoginApi&username={0}&pass={1}
        var strSign = paramString.split('&')[0].split('=')[1];

        // ex: strSign = GetConfigServer11.7
        for (var i = 0; i < 1; i++) {
            strSign += paramArray[i];
        }

        paramString = StringUtils.formatString(paramString, paramArray);

        // ex: signtxt = "GetConfigServer11.7201.7ASDWQESD@32312"
        var signtxt = strSign + StringUtils.formatString('{0}{1}{2}{3}{4}', portalHelper.getPlatformId(), portalHelper.getUserId(), portalHelper.getVersionGame(), portalHelper.getDeviceId(), portalHelper.getUserToken());
        var sign = CryptoUtils.MD5.encode(signtxt);
        paramString += StringUtils.formatString('&ChannelID={0}&PlatformID={1}&UserID={2}&AppVersion={3}&HardwareID={4}&Sign={5}&BundleID={6}', portalHelper.getChannelId(), portalHelper.getPlatformId(), portalHelper.getUserId(), portalHelper.getVersionGame(), portalHelper.getDeviceId(), sign, portalHelper.getBundleId());

        this.callAPI(portalHelper.getWSAPI(), paramString, HttpRequest.METHOD.POST, completeHandler, errorHandler);
    },

    callAPI: function callAPI(url, paramString, method, completeHandler, errorHandler, additionHeaderArray) {
        cc.log(this.LOGTAG, "callAPI: ", url + paramString);

        var headers = [{
            key: 'Content-type',
            value: 'application/x-www-form-urlencoded'
        }, {
            key: 'DeviceInfo',
            value: portalHelper.getDeviceId()
        }];

        if (additionHeaderArray) headers = additionHeaderArray.concat(headers);

        HttpRequest.load(url, paramString, method, headers, this.onCallAPISuccess.bind(this, completeHandler), this.onCallAPIError.bind(this, errorHandler));
    },

    onCallAPISuccess: function onCallAPISuccess(completeHandler, data, httpRequest) {
        cc.log(this.LOGTAG, "onCallAPISuccess: %j", data);

        // if (data && data.Result !== undefined) {
        //     if (data.Result === ErrorCode.WSError.TOKENTIMEOUT || data.Result === ErrorCode.WSError.SIGN_FAIL) {
        //         if (this.isTokenTimeout) {
        //             // renew token but wrong user info, clear storage and redirect to lobby for user login again
        //             this.onRenewTokenFailed();
        //         } else {
        //             cc.log(this.LOGTAG, "Token timeout. Begin renew token");
        //             this.isTokenTimeout = true;
        //
        //             // recall ws after renew token.
        //             // paramString already have failed sign params.
        //
        //             let paramArray = [];
        //             let paramString = urlLoader.paramString.substring(0, urlLoader.paramString.lastIndexOf('&ChannelID='));
        //             let paramValueKeyArray = paramString.split('&');
        //
        //             for (let i = 1; i < paramValueKeyArray.length; i++) {
        //                 paramArray.push(paramValueKeyArray[i].split('=')[1]);
        //             }
        //
        //             this.listWSWaitRenewTokenComplete.push([paramString, paramArray, completeHandler, urlLoader.onErrorCallback]);
        //             this.renewToken(portalHelper.getUserToken(), this.onRenewTokenCompleted.bind(this));
        //         }
        //     } else {
        //         if (completeHandler)
        //             completeHandler(data);
        //         urlLoader.dispose();
        //     }
        // }

        if (data && data.Result !== undefined && data.Result !== ErrorCode.WSError.TOKENTIMEOUT && data.Result !== ErrorCode.WSError.SIGN_FAIL && completeHandler) completeHandler(data);
        httpRequest.dispose();
    },

    onRenewTokenCompleted: function onRenewTokenCompleted(data) {
        cc.log(this.LOGTAG, "onRenewTokenCompleted: %j", data);

        if (data.Result === ErrorCode.WSError.SUCCESS) {

            // portalHelper.setUserToken(data.Data);

            this.isTokenTimeout = false;

            while (this.listWSWaitRenewTokenComplete.length > 0) {
                var argument = this.listWSWaitRenewTokenComplete.shift();
                this.callWS(argument[0], argument[1], argument[2], argument[3]);
            }
        } else {
            // renew token but wrong user info, clear storge and redirect to lobby for user login again
            this.onRenewTokenFailed();
        }
    },

    onRenewTokenFailed: function onRenewTokenFailed() {
        // TODO: Clear local storage
        // TODO: Popup informing user
    },

    onCallAPIError: function onCallAPIError(errorHandler, data) {
        if (errorHandler) errorHandler(data);
    },

    checkWSNeedToken: function checkWSNeedToken(urlOrParamString) {
        for (var i = 0; i < WSConfig.tokenlessApi.length; i++) {
            if (urlOrParamString.indexOf(WSConfig.tokenlessApi[i]) !== -1) return false;
        }
        return true;
    },

    getConfig: function getConfig(completeHandler, errorHandler) {

        // ApiName=GetConfigServer&ConfigId=1&GameVersion=1.7&ServerCode=&ChannelID=24&PlatformID=2&UserID=0&AppVersion=1.7&HardwareID=ASDWQESD@32312&Sign=22e3f9815ae753869bde6276c55249f3'
        // {"Result":1,"Code":0,"Message":"Thành công","Data":{"IsEncrypt":true,"Content":"004c001......0059001300"}}
        // Decrypted Content: {"IsNewFish":true,"ChanelId":24,"AppId":1,"ChanelName":"Ban Ca San Thuong","GameIpServer":"ggm1.bancasanthuong.com","GamePortServer":"3168","VersionWp":"1.7","VersionAndroid":"1.7","VersionIos":"1.7","ForceUpdate":"0","Message":"Các b?n hãy c?p nh?t phiên b?n m?i nh?t d? tr?i nghi?m t?t hon","MustUpgrade":false,"IsExchangeCard":true,"IsChargeCard":true,"ServerPort":"","WpLink":"","IosLink":"","AndroidLink":"bcst.bancasanthuong","LinkFanpage":"https://www.facebook.com/B?n-Cá-San-Thu?ng-B?n-Ðã-Tay-Rinh-Quà-Mê-Say-1813422628881197/","ApiUrl":"http://mxyz.bancasanthuong.com/portal?","PhoneSupport":" 84988573984","AppsflyerId":"GCR3gWL64qaocgeMYUnBuR","LinkForum":"https://www.facebook.com/B?n-Cá-San-Thu?ng-B?n-Ðã-Tay-Rinh-Quà-Mê-Say-1813422628881197/","EnableIap":true,"AllowSignUp":true,"InviteReward":0,"IsIpForeign":false,"IsReview":false,"IsEnableMarket":false,"IsEnable7Ocean":false,"ConnectionType":"rs","ExtendLink":[{"Type":3,"OrderNo":3,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=3","HasImages":true},{"Type":4,"OrderNo":4,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=4","HasImages":true},{"Type":6,"OrderNo":6,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=6","HasImages":true},{"Type":7,"OrderNo":7,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=7","HasImages":true},{"Type":8,"OrderNo":8,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=8","HasImages":true},{"Type":10,"OrderNo":10,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=10","HasImages":true},{"Type":11,"OrderNo":11,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=11","HasImages":true},{"Type":12,"OrderNo":12,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=12","HasImages":true},{"Type":13,"OrderNo":13,"Link":"ApiName=GetEventInfoDetail&ArticleId=0&ArticleType=13","HasImages":true}],"LessPointFree":10,"LessPointBigGun":100000,"LessPointDaiGiaGun":1000000,"LinkCheckIP":"https://ipinfo.io/json"}

        this.callWS(WSConfig.system.GetConfig, [portalHelper.getPlatformId(), portalHelper.getVersionGame(), WSConfig.serverCode], completeHandler, errorHandler);
    },

    // API Authenticating

    login: function login(username, passwordEncrypted, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.Login, [username, passwordEncrypted], completeHandler, errorHandler);
    },

    logout: function logout(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.Logout, [], completeHandler, errorHandler);
    },

    register: function register(username, passwordEncrypted, displayName, capCha, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.Register, [username, passwordEncrypted, displayName, capCha], completeHandler, errorHandler);
    },

    registerInstant: function registerInstant(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.RegisterInstant, ["", "", "", ""], completeHandler, errorHandler);
    },

    loginOpenID: function loginOpenID(providerName, accessToken, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.LoginOpenID, [providerName, accessToken], completeHandler, errorHandler);
    },

    registerOpenID: function registerOpenID(providerName, email, accessToken, displayName, openUserID, utmSource, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.RegisterOpenID, [providerName, email, accessToken, displayName, openUserID, utmSource], completeHandler, errorHandler);
    },

    renewToken: function renewToken(oldToken, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.RenewToken, [oldToken], completeHandler, errorHandler);
    },

    getFlashVar: function getFlashVar(gameAlias, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetFlashVar, [gameAlias], completeHandler, errorHandler);
    },

    getCaptCha: function getCaptCha(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetCaptCha, [], completeHandler, errorHandler);
    },

    // API System

    getEvent: function getEvent(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetEvent, [], completeHandler, errorHandler);
    },

    getEventInfoDetail: function getEventInfoDetail(articleId, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetEventInfoDetail, [articleId], completeHandler, errorHandler);
    },

    getTopUser: function getTopUser(articleId, articleType, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetTopUser, [articleId, articleType], completeHandler, errorHandler);
    },

    getUsersOnline: function getUsersOnline(pageNumber, pageSize, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetUsersOnline, [pageNumber, pageSize], completeHandler, errorHandler);
    },

    getThirdPartner: function getThirdPartner(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetThirdPartner, [], completeHandler, errorHandler);
    },

    GetNapDoiExtLink: function GetNapDoiExtLink(codeName, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetNapDoiExtLink, [codeName], completeHandler, errorHandler);
    },

    getLogJackpot: function getLogJackpot(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetLogJackpot, [], completeHandler, errorHandler);
    },

    getTopExchangeCard: function getTopExchangeCard(completeHandler, errorHandler) {
        this.callWS(WSConfig.GetTopExchangeCard, [], completeHandler, errorHandler);
    },

    getSupportLink: function getSupportLink(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetLinkSupport, [], completeHandler, errorHandler);
    },

    // API User Data

    getAchievement: function getAchievement(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetAchievement, [], completeHandler, errorHandler);
    },

    getUserInfo: function getUserInfo(userID, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetUserInfo, [], completeHandler, errorHandler);
    },

    getMailBox: function getMailBox(messageType, pageNumber, pageSize, completeHandler, errorHandler) {
        this.callWS(WSConfig.GetMailBox, [messageType, pageNumber, pageSize], completeHandler, errorHandler);
    },

    getMailBoxDetail: function getMailBoxDetail(messageId, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetMailBoxDetail, [messageId], completeHandler, errorHandler);
    },

    getListHistoryCoin: function getListHistoryCoin(pageNumBer, pageSize, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetHistoryCoin, [pageNumBer, pageSize], completeHandler, errorHandler);
    },

    getValueExchangeCard: function getValueExchangeCard(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetValueExchangeCard, [], completeHandler, errorHandler);
    },

    getGuideInfo: function getGuideInfo(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetGuideInfo, [], completeHandler, errorHandler);
    },

    getGuideInfoDetail: function getGuideInfoDetail(articleId, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetGuideInfoDetail, [articleId], completeHandler, errorHandler);
    },

    getSms: function getSms(articleId, articleType, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetSms, [articleId, articleType], completeHandler, errorHandler);
    },

    chargeCard: function chargeCard(cardType, pinCode, serial, captcha, completeHandler, errorHandler) {
        this.callWS(WSConfig.ChargeCard, [cardType, pinCode, serial, captcha], completeHandler, errorHandler);
    },

    exchangeCard: function exchangeCard(cardType, cardAmount, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.ExchangeCard, [cardType, cardAmount], completeHandler, errorHandler);
    },

    changeCMND: function changeCMND(cmnd, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.ChangeCMND, [cmnd], completeHandler, errorHandler);
    },

    changePhone: function changePhone(phone, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.ChangePhone, [phone], completeHandler, errorHandler);
    },

    changePass: function changePass(oldPass, newPass, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.ChangePass, [oldPass, newPass], completeHandler, errorHandler);
    },

    uploadAvatar: function uploadAvatar(fileName, avatarData, completeHandler, errorHandler) {
        this.callWSTokenless(WSConfig.system.UpLoadAvatar, [fileName, avatarData], completeHandler, errorHandler);
    },

    IAPGetListProduct: function IAPGetListProduct(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.IAPGetListProduct, [], completeHandler, errorHandler);
    },

    IAPCredit: function IAPCredit(packageName, productID, tokenIAP, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.IAPCredit, [packageName, productID, ''], completeHandler, errorHandler, [{
            key: 'tokenIAP',
            value: tokenIAP
        }]);
    },

    getFlashVarGameViaGameId: function getFlashVarGameViaGameId(gameId, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetFlashVarGameViaGameId, [gameId], completeHandler, errorHandler);
    },

    getRawByGameId: function getRawByGameId(gameId, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetRawByGameId, [gameId], completeHandler, errorHandler);
    },

    getRawByGameIdWithUrl: function getRawByGameIdWithUrl(url, gameId, completeHandler, errorHandler) {
        this.callWSWithUrl(url, WSConfig.system.GetRawByGameId, [gameId], completeHandler, errorHandler);
    },

    getLinkMiniGame: function getLinkMiniGame(acticleId, acticleType, completeHandler, errorHandler) {
        var extension = cc.formatStr("&ArticleId=%d&ArticleType=%d", acticleId, acticleType);
        this.callWSGetLink(acticleId + '', extension, WSConfig.system.GetLinkMiniGame, ['GetEventInfoDetail'], completeHandler, errorHandler);
    },

    getLinkMiniGameByGameID: function getLinkMiniGameByGameID(gameID, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetLinkMiniGameByGameID, [gameID], completeHandler, errorHandler);
    },

    checkFirstTimePlaying: function checkFirstTimePlaying(gameID, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.checkFirstTimePlaying, [gameID], completeHandler, errorHandler);
    },

    getUserBaseInfo: function getUserBaseInfo(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetUserBaseInfo, [], completeHandler, errorHandler);
    },

    getForumLink: function getForumLink(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetForumLink, [], completeHandler, errorHandler);
    },

    getKingGameInfo: function getKingGameInfo(completeHandler, errorHandler) {
        this.callWS(WSConfig.system.GetKingGameInfo, [], completeHandler, errorHandler);
    },

    getLinkHappy: function getLinkHappy(completeHandler, errorHandler) {
        // this.callWS(WSConfig.system.GetLinkHappy, [], completeHandler, errorHandler);
        WebHelper.openPageDeposit();
    },
    getLinkAvatar: function getLinkAvatar(userID, completeHandler, errorHandler) {
        this.callWS(WSConfig.system.getLinkAvatar, [portalHelper.getUserId()], completeHandler, errorHandler);
    },

    // API Lucky Spin

    cardSpinUserDetail: function cardSpinUserDetail(completeHandler, errorHandler) {
        this.callWS(WSConfig.luckSpin.CardSpinUserDetail, [], completeHandler, errorHandler);
    },

    cardSpinGetUserWin: function cardSpinGetUserWin(completeHandler, errorHandler) {
        this.callWS(WSConfig.luckSpin.CardSpinGetUserWin, [], completeHandler, errorHandler);
    },

    cardSpinGetItems: function cardSpinGetItems(completeHandler, errorHandler) {
        this.callWS(WSConfig.luckSpin.CardSpinGetItems, [], completeHandler, errorHandler);
    },

    cardSpinGetItemRemain: function cardSpinGetItemRemain(completeHandler, errorHandler) {
        this.callWS(WSConfig.luckSpin.CardSpinGetItemRemain, [], completeHandler, errorHandler);
    },

    cardSpinDoSpin: function cardSpinDoSpin(cardType, completeHandler, errorHandler) {
        this.callWS(WSConfig.luckSpin.CardSpinDoSpin, [cardType], completeHandler, errorHandler);
    },

    // API Jackpot

    jackpot2GetAllCoin: function jackpot2GetAllCoin(completeHandler, errorHandler) {
        this.callWS(WSConfig.jackpot.Jackpot2GetAllCoin, [], completeHandler, errorHandler);
    },

    jackpot2CountTicket: function jackpot2CountTicket(completeHandler, errorHandler) {
        this.callWS(WSConfig.jackpot.Jackpot2CountTicket, [], completeHandler, errorHandler);
    },

    jackpot2UpdateJackpotType: function jackpot2UpdateJackpotType(ticketID, jackpotType, flashVar, completeHandler, errorHandler) {
        this.callWS(WSConfig.jackpot.Jackpot2UpdateJackpotType, [ticketID, jackpotType, flashVar], completeHandler, errorHandler);
    },

    jackpot2OpenCard: function jackpot2OpenCard(ticketID, indexOpen, matchID, jackpotType, flashVar, completeHandler, errorHandler) {
        this.callWS(WSConfig.jackpot.Jackpot2OpenCard, [ticketID, indexOpen, matchID, jackpotType, flashVar], completeHandler, errorHandler);
    },

    jackpot2GetAllTop: function jackpot2GetAllTop(top, type, completeHandler, errorHandler) {
        this.callWS(WSConfig.jackpot.Jackpot2GetAllTop, [top, type], completeHandler, errorHandler);
    },

    // API Social

    deleteFriend: function deleteFriend(friendId, completeHandler, errorHandler) {
        this.callWS(WSConfig.social.deleteFriend, [friendId], completeHandler, errorHandler);
    },

    sendRequestFriend: function sendRequestFriend(userId, completeHandler, errorHandler) {
        this.callWS(WSConfig.social.sendRequestFriend, [userId], completeHandler, errorHandler);
    },

    getListMyFriend: function getListMyFriend(pageIndex, pageSize, completeHandler, errorHandler) {
        this.callWS(WSConfig.social.getListMyFriends, [pageIndex, pageSize], completeHandler, errorHandler);
    },

    getRewardFriend: function getRewardFriend(quantity, completeHandler, errorHandler) {
        this.callWS(WSConfig.social.getRewardFriend, [quantity], completeHandler, errorHandler);
    },

    getAcceptFriends: function getAcceptFriends(senderId, statusAccept, completeHandler, errorHandler) {
        this.callWS(WSConfig.social.getAcceptFriends, [senderId, statusAccept], completeHandler, errorHandler);
    },

    getUserInfoViaName: function getUserInfoViaName(keyword, completeHandler, errorHandler) {
        this.callWS(WSConfig.social.getUserInfoViaName, [keyword], completeHandler, errorHandler);
    },

    getGetInviteFriendsOrAss: function getGetInviteFriendsOrAss(pageIndex, pageSize, completeHandler, errorHandler) {
        this.callWS(WSConfig.social.getInviteFriendsOrAss, [pageIndex, pageSize], completeHandler, errorHandler);
    },

    // API Golden Hour

    getGoldenHoursUserInfo: function getGoldenHoursUserInfo(completeHandler, errorHandler) {
        this.callWS(WSConfig.goldenHour.GetGoldenHoursUserInfo, [], completeHandler, errorHandler);
    },

    getGoldenHoursReceived: function getGoldenHoursReceived(completeHandler, errorHandler) {
        this.callWS(WSConfig.goldenHour.GetGoldenHoursReceived, [], completeHandler, errorHandler);
    },

    // API Big Wheel

    getBigSixWheelUserInfo: function getBigSixWheelUserInfo(completeHandler, errorHandler) {
        this.callWS(WSConfig.bigSixWheel.BigSixWheelGetUserInfo, [], completeHandler, errorHandler);
    },

    getBigSixWheelItem: function getBigSixWheelItem(completeHandler, errorHandler) {
        this.callWS(WSConfig.bigSixWheel.BigSixWheelGetItem, [], completeHandler, errorHandler);
    },

    getBigSixWheelSpin: function getBigSixWheelSpin(strBets, completeHandler, errorHandler) {
        this.callWS(WSConfig.bigSixWheel.BigSixWheelSpin, [strBets], completeHandler, errorHandler, null, [], true);
    },

    getBigSixWheelHistorySpin: function getBigSixWheelHistorySpin(completeHandler, errorHandler) {
        this.callWS(WSConfig.bigSixWheel.BigSixWheelGetHistorySpin, [], completeHandler, errorHandler);
    },

    getBigSixWheelTopUserWin: function getBigSixWheelTopUserWin(completeHandler, errorHandler) {
        this.callWS(WSConfig.bigSixWheel.BigSixWheelGetTopUserWin, [], completeHandler, errorHandler);
    },

    // Screenshot

    getScreenCaptureGameInfo: function getScreenCaptureGameInfo(completeHandler, errorHandler) {
        WebService.callWS(WSConfig.system.InfoScreenCaptureGame, [], completeHandler, errorHandler);
    },

    sendScreenCaptureGame: function sendScreenCaptureGame(dataFile, gameId, matchId, roomId, reasonId, completeHandler, errorHandler) {
        //let url = "http://localhost:60800";
        //let url = "http://192.168.1.115:5015/portal";
        var url = portalHelper.getWSAPI();
        var finalUrl = url + "?" + WSConfig.system.ScreenCaptureGame;

        var apiName = WSConfig.system.ScreenCaptureGame.split("=")[1];

        // ex: signtxt = "GetConfigServer11.7201.7ASDWQESD@32312"
        // signtxt = [apiName][params][platformId][userId][appVersion][deviceId][userToken]
        var userId = portalHelper.getUserId();
        var paramsSignTxt = apiName + gameId.toString();
        var metaSignText = StringUtils.formatString('{0}{1}{2}{3}{4}', portalHelper.getPlatformId(), userId, portalHelper.getVersionGame(), portalHelper.getDeviceId(), portalHelper.getUserToken());
        var signtxt = paramsSignTxt + metaSignText;
        var sign = CryptoUtils.MD5.encode(signtxt);

        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open(HttpRequest.METHOD.POST, finalUrl, true);
        xhr.responseType = "text";

        xhr.onerror = function (e) {
            if (typeof errorHandler === "function") {
                errorHandler(e.message);
            }
        };

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (!xhr.isComplete) {
                    xhr.isComplete = true;
                    var status = xhr.status || HttpRequest.STATUS.OK;
                    if (status === HttpRequest.STATUS.OK || status === HttpRequest.STATUS.EMPTY || HttpRequest.STATUS.UNSENT && xhr.responseText.length > 0) {
                        var data = null;
                        try {
                            data = JSON.parse(xhr.responseText);
                        } catch (e) {
                            if (typeof errorHandler === "function") {
                                errorHandler("Failed to parse response json", xhr);
                            }
                            return;
                        }

                        if (data) {
                            if (typeof completeHandler === "function") {
                                completeHandler(data, this);
                            }
                        }
                    } else {
                        //cc.error(this.LOGTAG, this.xhr.status + " - " + this.xhr.statusText + ":" + this.xhr.responseURL);
                        if (typeof errorHandler === "function") {
                            errorHandler(xhr.statusMessage, xhr);
                        }
                    }
                }
            }
        };

        xhr.ontimeout = function () {
            if (typeof errorHandler === "function") {
                errorHandler(xhr.statusMessage, xhr);
            }
        };

        var body = {

            // Meta
            ApiName: apiName,
            ChannelID: portalHelper.getChannelId(),
            PlatformID: portalHelper.getPlatformId(),
            UserID: userId,
            AppVersion: portalHelper.getVersionGame(),
            HardwareID: portalHelper.getDeviceId(),
            Sign: sign,
            BundleID: portalHelper.getBundleId(),
            Lang: portalHelper.getLanguageStr(),

            // Api fields
            GameId: gameId,
            MatchId: matchId,
            RoomId: roomId,
            ReasonId: reasonId,
            DataFile: dataFile
        };

        var bodyParams = [];
        for (var key in body) {
            bodyParams.push(key + "=" + body[key]);
        }

        var xform = bodyParams.join("&");

        // xhr.setRequestHeader("Content-Length", xform.length);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("DeviceInfo", portalHelper.getDeviceId());

        xhr.send(xform);
    }
});

// Singleton

WebServiceController.instance = null;
WebServiceController.getInstance = function () {
    if (!WebServiceController.instance) WebServiceController.instance = new WebServiceController();
    return WebServiceController.instance;
};

// Global

var WebService = WebServiceController.getInstance();
