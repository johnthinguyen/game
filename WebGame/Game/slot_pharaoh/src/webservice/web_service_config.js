'use strict';

var WSConfig = {
    system: {
        GetConfig: 'ApiName=GetConfigServer&ConfigId={0}&GameVersion={1}&ServerCode={2}',
        Login: 'ApiName=LoginApiMobile&username={0}&pass={1}',
        Logout: 'ApiName=LogoutApi',
        Register: 'ApiName=RegisterApi&username={0}&displayname={1}&pass={2}&Capchar={3}',
        RegisterInstant: 'ApiName=RegisterInstantPlayApi&DisplayName={0}&utm_source={1}&PushToken={2}&AdsID={3}',
        LoginOpenID: 'ApiName=LoginOpenProvider&providerName={0}&access_token={1}', // providerName: Web,Yahoo,Google,Facebook,Mobile
        RegisterOpenID: 'ApiName=RegisterOpenProvider&providerName={0}&Email={1}&access_token={2}&DisplayName={3}&OpenProviderID={4}&utm_source={5}', // OpenProviderID: OpenUserID
        RenewToken: 'ApiName=ReNewToken&Token={0}',
        GetFlashVar: 'ApiName=GetFlashVar&GameId={0}',
        GetLinkMiniGame: 'ApiName={0}',
        GetLinkMiniGameByGameID: 'ApiName=GetLinkMiniGame&GameId={0}',
        GetCaptCha: 'ApiName=CreateCaptcha',
        GetEvent: 'ApiName=GetEventInfos',
        GetEventInfoDetail: 'ApiName=GetEventInfoDetail&ArticleId={0}',
        GetTopUser: 'ApiName=GetInfoDetailWebCall&ArticleId={0}&ArticleType={1}',
        GetUsersOnline: 'ApiName=GetUsersOnlineApi&PageNumber={0}&PageSize={1}',
        GetThirdPartner: 'ApiName=GetThirdPartnerLink',
        GetNapDoiExtLink: 'ApiName=GetNapDoiExtLink&Code={0}',
        GetLogJackpot: 'ApiName=GetLogJackPot',
        GetTopExchangeCard: 'ApiName=GetTopExchangeCard',
        GetAchievement: 'ApiName=Achievement',
        GetUserInfo: 'ApiName=UserInfoWebCall',
        GetMailBox: 'ApiName=GetOfflineMessage&MessageType={0}&PageNumber={1}&PageSize={2}',
        GetMailBoxDetail: 'ApiName=GetOfflineMessageDetails&MessageId={0}',
        GetHistoryCoin: 'ApiName=GetListHistoryCoin&PageNumber={0}&PageSize={1}',
        GetValueExchangeCard: 'ApiName=GetExchangeCard',
        GetSms: 'ApiName=GetInfoDetailWebCall&ArticleId={0}&ArticleType={1}',
        GetGuideInfo: 'ApiName=GetGuideInfos',
        GetGuideInfoDetail: 'ApiName=GetGuideInfoDetail&ArticleId={0}',

        GetUserBaseInfo: 'ApiName=GetUserBaseInfo',
        GetForumLink: 'ApiName=GetForumLink',
        GetKingGameInfo: 'ApiName=GetKingGameInfo',
        GetLinkHappy: 'ApiName=GetLinkHappy',

        getLinkAvatar: 'ApiName=GetLinkAvatar&ViewedUserId={0}',

        ChargeCard: 'ApiName=ChargeCard&CardType={0}&PinCode={1}&Serial={2}&Captcha={3}',
        ExchangeCard: 'ApiName=ExchangeCard&CardType={0}&CardAmount={1}',
        ChangePhone: 'ApiName=ChangePhone&Phone={0}',
        ChangeCMND: 'ApiName=ChangeCMND&CMND={0}',
        ChangePass: 'ApiName=ChangePass&OldPass={0}&NewPass={1}',
        UpLoadAvatar: 'ApiName=UploadAvatar&FileName={0}&AvatarData={1}',
        IAPGetListProduct: 'ApiName=IAPGetListProduct',
        IAPCredit: 'ApiName=IAPCredit&PackageName={0}&ProductID={1}&TokenIAP={2}',

        checkFirstTimePlaying: 'ApiName=GetUserPlayFirstGame&GameId={0}',

        GetFlashVarGameViaGameId: 'ApiName=GetFlashVarGameViaGameId&GameId={0}',
        GetRawByGameId: 'ApiName=GetRawByGameId&GameId={0}',

        GetLinkSupport: 'ApiName=GetSupportLink',

        ScreenCaptureGame: 'ApiName=ScreenCaptureGame',
        InfoScreenCaptureGame: 'ApiName=InfoScreenCaptureGame'
    },
    luckSpin: {
        CardSpinUserDetail: 'ApiName=CardSpinUserDetail',
        CardSpinGetUserWin: 'ApiName=CardSpinGetUserWin',
        CardSpinGetItems: 'ApiName=CardSpinGetItems',
        CardSpinGetItemRemain: 'ApiName=CardSpinGetItemRemain',
        CardSpinDoSpin: 'ApiName=CardSpinDoSpin&CardType={0}'
    },
    jackpot: {
        Jackpot2GetAllCoin: 'ApiName=Jackpot2GetAllCoin',
        Jackpot2CountTicket: 'ApiName=Jackpot2CountTicket',
        Jackpot2UpdateJackpotType: 'ApiName=Jackpot2UpdateJackpotType&TicketID={0}&JackpotType={1}&FlashVar={2}',
        Jackpot2OpenCard: 'ApiName=Jackpot2OpenCard&TicketID={0}&IndexOpen={1}&MatchID={2}&JackpotType={3}&FlashVar={4}',
        Jackpot2GetAllTop: 'ApiName=Jackpot2GetAllTop&Top={0}&Type={1}'
    },
    social: {
        deleteFriend: "ApiName=DeleteFriend&FriendID={0}",
        sendRequestFriend: "ApiName=SendRequestFriend&UserSendID={0}",
        getListMyFriends: "ApiName=GetListMyFriends&pageIndex={0}&pageSize={1}",
        getRewardFriend: "ApiName=GetRewardFriendRequest&Quantity={0}",
        getUserInfoViaName: "ApiName=GetUserInfoViaName&keyword={0}",
        getAcceptFriends: "ApiName=AcceptFriends&UserSendId={0}&StatusAccept={1}",
        getInviteFriendsOrAss: "ApiName=GetInviteFriendsOrAss&pageIndex={0}&pageSize={1}"
    },
    goldenHour: {
        GetGoldenHoursUserInfo: "ApiName=EventGoldenHoursUserInfo",
        GetGoldenHoursReceived: "ApiName=EventGoldenHoursReceive"
    },
    bigSixWheel: {
        BigSixWheelGetUserInfo: "ApiName=BigSixWheelGetUserInfo",
        BigSixWheelGetItem: "ApiName=BigSixWheelGetItem",
        BigSixWheelSpin: "ApiName=BigSixWheelSpin&Bets={0}",
        BigSixWheelGetHistorySpin: "ApiName=BigSixWheelGetHistorySpin",
        BigSixWheelGetTopUserWin: "ApiName=BigSixWheelGetTopUserWin"
    },
    tokenlessApi: ["ApiName=LoginApi", "ApiName=RegisterApi", "ApiName=LoginOpenProvider", "ApiName=RegisterOpenProvider", "ApiName=ReNewToke"],
    serverCode: 100
};