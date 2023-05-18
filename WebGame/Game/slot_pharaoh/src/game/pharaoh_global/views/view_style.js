"use strict";

Module.define(function (require){
    const ViewStyle = {
        LAYER_ORDER: {
            BACKGROUND: -1,
            MAINGROUND:  0,
            FOREGROUND:  1,
    
            EFFECT:      999,
    
            POPUP:       9999,
            WAITING:     9999,
    
            NANO_GAME:   8888,
        },
    
        BOARD_ORDER: {
            HIGHLIGHT_ITEM: 0,
            MOTIONS_STREAK: 9999,
            WIN_INFO: 999999,
            FX_NEAR_WIN: 20,
        },
    
        SHOW_ACTION_TIME: 1.0,
        HIDE_ACTION_TIME: 1.0,
        WAIT_ACTION_TIME: 10.0,
    
        ITEM_ORDER: {
            SCATTER: 18,
            DEFAULT: 10,
            HIGHLIGHT_CHANGE: 20
        },
    
        WIN_COIN_TEXT_COLOR: cc.color("#fff5ce"),
        RED_COIN_TEXT_COLOR: cc.color("#00FFD8"),
        GREEN_COIN_TEXT_COLOR: cc.color("#FF0022"),
        YELLOW_COIN_TEXT_COLOR: cc.color("#fdff1f"),
        BLUE_COIN_TEXT_COLOR: cc.color("#194fff"),
        ORANGE_COIN_TEXT_COLOR: cc.color("#ffffcd"),
        BACKGROUND_FREE_GAME_COLOR: cc.color(255, 209, 0),
        DISABLED_COLOR: cc.color(60, 60, 60),
        ORANGE_COLOR: "#ffad33",
        WHITE_COLOR: "#FFFFFF",
    };

    window.ViewStyle = ViewStyle;
    return ViewStyle;
});