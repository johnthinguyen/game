/*global define */
"use strict";

Module.define(function (require) {
    "use strict";

    const SlotRule = {
        REELS: 6,
        ITEMS_PER_REEL: 7,
        SCORE_RATE: 1,
        BONUS_REEL: 3,

        FREE_GAME_COMBO_LENGTH: 5,
        FREE_GAMES_COMBO: [2, 3, 5, 6, 8],

        MIN_DELAY_STOP_REEL: 0.3,
        TIME_DELAY_STOP_PER_REEL: 0.33,
        TIME_DELAY_STOP_NEAR_WIN_REEL: 2,
        TIME_DELAY_COLLAPSE_PER_REEL: 0.05,
        TIME_HIGHLIGHT_SCATTER: 3,

        // BETTING CONFIG
        AUTO_SPIN_DELAY: 2,
        BIG_WIN_MULTI_CONFIG: 5,
        BET_RATES: [50, 100, 200, 500, 1000, 2000], //[ 1000, 2000, 5000, 10000, 20000, 50000, 100000 ],
        TOTAL_LINE_BET: 25,
        BET_CREDITS: [8, 18, 38, 68, 88],
        AUTO_SPIN_INFINITE: -9999,
        AUTO_SPIN: [10, 30, 50, 100, -9999],
        SMART_SELECT_BET_RATE: false,
        SMART_SELECT_BET_CREDITS: false,
        EMPTY_BETTING_WHEN_SELECT_FAILED: false,
        DRAWLINE_ENABLED: false,
        EFFECT_QUICK_HIDE_ENABLED: false,
        IS_AUTO_FAST_MODE: true,

        INIT_TYPE: 3,
        INTRO_REELS: [[8, 8, 6, 7, 6, 11, 9],[8, 8, 6, 7, 6, 11],[6, 3, 6, 7, 11],[8, 8, 6, 7],[6, 4, 5],[9, 4]],
        INTRO_REELS_LENGTH: [7, 6, 5, 4, 3, 2],
        INTRO_MERGE_ITEM: [0, 1, 2, 3, 4, 5],
        INTRO_GOLD_ITEM: [[1, 1, 1, 1, 1, 1, 1],[1, 1, 1, 1, 1, 1],[1, 1, 1, 1, 1],[1, 1, 1, 1],[1, 1, 1],[1, 1]],
        INTRO_REEL_TOP: 4,

        BIG_WIN_TYPE: {
            BIG_WIN: 0,
            MEGA_WIN: 1,
            SUPER_WIN: 2
        },

        ITEM_TYPE: {
            NONE: 1,
            WILD: 1,
            SCATTER: 2,
            RED_STONE_STATUE: 3,
            PURPLE_STONE_STATUE: 4,
            GREEN_STONE_STATUE: 5,
            BLUE_STONE_STATUE: 6,
            GREY_STONE_STATUE: 7,
            A: 8,
            K: 9,
            Q: 10,
            J: 11,
            TEN: 12,
            COLLECTION_STATUE: 13,
            JACKPOT_SERVER: 100,
        },

        ITEM_MERGE_TYPE: {
            NONE: 0,
            MERGE_1: 1,
            MERGE_2: 2,
            MERGE_3: 3,
            MERGE_4: 4,
            MERGE_5: 5
        },

        BONUS_TYPE: {
            NONE: 0,
        },

        JACKPOT_TYPE: {
            "-4": {NAME: 'MINI', index: 0},
            "-3": {NAME: 'MINOR', index: 1},
            "-2": {NAME: 'MAJOR', index: 2},
            "-1": {NAME: 'MEGA', index: 3}
        },

        RATE_FAST_MODE: 0.5,

        HIGHLIGHT_TIME: 0.83,
        
        HIGHLIGHT_TIME_EXTRA_SPIN: 3,
        HIGHLIGHT_TIME_SCATTER: 3,
        
        ELIMINATE_TIME: 1,
        CHANGE_TO_WILD_TIME: 1.067,
        COUNT_DOWN_WILD_TIME: 1.83,

        BIG_WIN_REQUIRED: 10,
        MEGA_WIN_REQUIRED: 20,
        SUPER_WIN_REQUIRED: 25,

        BIG_WIN_TIME: 3.0,
        MEGA_WIN_TIME: 6.0,
        SUPER_WIN_TIME: 9.0,

        SHOW_WIN_END_FREE_GAME_TIME: 6,

        FORCE_STOP_TOP_REELS_DATA: [4, 4, 4, 4, 4],
    };

    // ----
    // Some utils function that may helpful
    SlotRule.isValidItem = function (type) {
        return type >= SlotRule.ITEM_TYPE.WILD && type <= SlotRule.ITEM_TYPE.TEN;
    };

    SlotRule.isWildItem = function (type) {
        return type == SlotRule.ITEM_TYPE.WILD;
    };

    SlotRule.isMiniItem = function (type) {
        return type >= 8;
    };

    SlotRule.getRandomType = function () {
        let type;
        do {
            type = MathUtils.randomMinMax(SlotRule.ITEM_TYPE.SCATTER, SlotRule.ITEM_TYPE.TEN);
        } while (!SlotRule.isValidItem(type));
        return type;
    };

    SlotRule.getRandomTypeNoScatter = function () {
        let type;
        do {
            type = MathUtils.randomMinMax(SlotRule.ITEM_TYPE.RED_STONE_STATUE, SlotRule.ITEM_TYPE.TEN);
        } while (!SlotRule.isValidItem(type));
        return type;
    };


    SlotRule.getRandomReel = function () {
        let reelResult = [];
        for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
            let itemType = SlotRule.getRandomType();
            reelResult.push(itemType);
        }

        return reelResult;
    }

    SlotRule.getNumScatterInReel = function (reel) {
        let numScatter = 0;
        for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
            if(reel[i] == SlotRule.ITEM_TYPE.SCATTER) {
                numScatter++;
            }
        }

        return numScatter;
    },

    SlotRule.isReelHaveScatter = function (reel) {
        for (let i = 0; i < SlotRule.ITEMS_PER_REEL; i++) {
            if (reel[i] == SlotRule.ITEM_TYPE.SCATTER) {
                return true;
            }
        }

        return false;
    };

    window.SlotRule = SlotRule;
    return SlotRule;
});