Module.define(function (require) {
    "use strict";

    const KingLoginEvents = {
        ON_LOGIN_SUCCESS: "onLoginSuccess",             // được gọi khi login thành công
        ON_LOGIN_FAILED: "onLoginFailed",               // được gọi khi login không thành công, hoặc bị mất kết nối,...
        ON_LOGIN_RETRY: "onLoginRetry",                 // được gọi mỗi lần bắt đầu một lượt retry login mới.
        ON_LOGIN_KICK: "onLoginKick",                   // được gọi khi account được đăng nhập ở device khác, hoặc bị kick bởi server
        ON_LOGIN_KICK_AFK: "onLoginKickAFK",            // được gọi khi account bị kick bởi server
        ON_LOGOUT: "onLogout",                          // được gọi khi user chủ động logout thành công
    };

    window.KingLoginEvents = KingLoginEvents;
    return KingLoginEvents;
});