Module.define(function (require) {
    "use strict";

    const animationDefintions = {
        "FLY_COIN": {
            pattern: "empire_img/fly_coin/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.33
        },

        "FLY_DIAMON": {
            pattern: "empire_img/fly_coin/diamon_sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.33
        },

        "STAR_EFFECT": {
            pattern: "empire_img/fly_coin/star_%d.png",
            start: 0,
            end: 0,
            duration: 1
        },

        "LOADING": {
            pattern: "empire_img/loading/loading_%d.png",
            start: 0,
            end: 19,
            duration: 1.0
        },

        "NEAR_WIN_FIRE": {
            pattern: "empire_anim/near_win_fire/sprite_%d.png",
            start: 0,
            end: 4,
            duration: 0.25
        },

        "FX_THUNDER": {
            pattern: "empire_anim/thunder_lightning/sprite_%d.png",
            start: 0,
            end: 2,
            duration: 0.15
        },

        "ITEM_1_MERGE_0":{
            pattern: "empire_anim/items/item_1/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        
        "ITEM_1_MERGE_1":{
            pattern: "empire_anim/items/item_1/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },

        "ITEM_1_MERGE_2":{
            pattern: "empire_anim/items/item_1/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },

        "ITEM_1_MERGE_3":{
            pattern: "empire_anim/items/item_1/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },

        "SCATTER_SHOW_MERGE_0":{
            pattern: "empire_anim/items/item_2/highlight_show/merge_0/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },

        "SCATTER_SHOW_MERGE_1":{
            pattern: "empire_anim/items/item_2/highlight_show/merge_1/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },
        "SCATTER_SHOW_MERGE_2":{
            pattern: "empire_anim/items/item_2/highlight_show/merge_2/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },
        "SCATTER_SHOW_MERGE_3":{
            pattern: "empire_anim/items/item_2/highlight_show/merge_3/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },
        "SCATTER_GET_MERGE_0":{
            pattern: "empire_anim/items/item_2/highlight_fg/merge_0/sprite_%d.png",
            start: 0,
            end: 91,
            duration: 3.06
        },
        "SCATTER_GET_MERGE_1":{
            pattern: "empire_anim/items/item_2/highlight_fg/merge_1/sprite_%d.png",
            start: 0,
            end: 91,
            duration: 3.06
        },
        "SCATTER_GET_MERGE_2":{
            pattern: "empire_anim/items/item_2/highlight_fg/merge_2/sprite_%d.png",
            start: 0,
            end: 91,
            duration: 3.06
        },
        "SCATTER_GET_MERGE_3":{
            pattern: "empire_anim/items/item_2/highlight_fg/merge_3/sprite_%d.png",
            start: 0,
            end: 91,
            duration: 3.06
        },
        "SCATTER_WAIT_MERGE_0":{
            pattern: "empire_anim/items/item_2/highlight_nearwin/merge_0/sprite_%d.png",
            start: 0,
            end: 24,
            duration: 0.83
        },
        "SCATTER_WAIT_MERGE_1":{
            pattern: "empire_anim/items/item_2/highlight_nearwin/merge_1/sprite_%d.png",
            start: 0,
            end: 24,
            duration: 0.83
        },
        "SCATTER_WAIT_MERGE_2":{
            pattern: "empire_anim/items/item_2/highlight_nearwin/merge_2/sprite_%d.png",
            start: 0,
            end: 24,
            duration: 0.83
        },
        "SCATTER_WAIT_MERGE_3":{
            pattern: "empire_anim/items/item_2/highlight_nearwin/merge_3/sprite_%d.png",
            start: 0,
            end: 24,
            duration: 0.83
        },
        "ITEM_3_MERGE_0":{
            pattern: "empire_anim/items/item_3/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_3_MERGE_1":{
            pattern: "empire_anim/items/item_3/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_3_MERGE_2":{
            pattern: "empire_anim/items/item_3/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_3_MERGE_3":{
            pattern: "empire_anim/items/item_3/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_4_MERGE_0":{
            pattern: "empire_anim/items/item_4/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_4_MERGE_1":{
            pattern: "empire_anim/items/item_4/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_4_MERGE_2":{
            pattern: "empire_anim/items/item_4/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_4_MERGE_3":{
            pattern: "empire_anim/items/item_4/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_5_MERGE_0":{
            pattern: "empire_anim/items/item_5/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_5_MERGE_1":{
            pattern: "empire_anim/items/item_5/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_5_MERGE_2":{
            pattern: "empire_anim/items/item_5/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_5_MERGE_3":{
            pattern: "empire_anim/items/item_5/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_6_MERGE_0":{
            pattern: "empire_anim/items/item_6/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_6_MERGE_1":{
            pattern: "empire_anim/items/item_6/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_6_MERGE_2":{
            pattern: "empire_anim/items/item_6/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_6_MERGE_3":{
            pattern: "empire_anim/items/item_6/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_7_MERGE_0":{
            pattern: "empire_anim/items/item_7/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_7_MERGE_1":{
            pattern: "empire_anim/items/item_7/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_7_MERGE_2":{
            pattern: "empire_anim/items/item_7/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_7_MERGE_3":{
            pattern: "empire_anim/items/item_7/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_8_MERGE_0":{
            pattern: "empire_anim/items/item_8/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_8_MERGE_1":{
            pattern: "empire_anim/items/item_8/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_8_MERGE_2":{
            pattern: "empire_anim/items/item_8/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_8_MERGE_3":{
            pattern: "empire_anim/items/item_8/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_9_MERGE_0":{
            pattern: "empire_anim/items/item_9/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_9_MERGE_1":{
            pattern: "empire_anim/items/item_9/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_9_MERGE_2":{
            pattern: "empire_anim/items/item_9/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_9_MERGE_3":{
            pattern: "empire_anim/items/item_9/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_10_MERGE_0":{
            pattern: "empire_anim/items/item_10/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_10_MERGE_1":{
            pattern: "empire_anim/items/item_10/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_10_MERGE_2":{
            pattern: "empire_anim/items/item_10/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_10_MERGE_3":{
            pattern: "empire_anim/items/item_10/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_11_MERGE_0":{
            pattern: "empire_anim/items/item_11/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_11_MERGE_1":{
            pattern: "empire_anim/items/item_11/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_11_MERGE_2":{
            pattern: "empire_anim/items/item_11/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_11_MERGE_3":{
            pattern: "empire_anim/items/item_11/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_12_MERGE_0":{
            pattern: "empire_anim/items/item_12/highlight/merge_0/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_12_MERGE_1":{
            pattern: "empire_anim/items/item_12/highlight/merge_1/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_12_MERGE_2":{
            pattern: "empire_anim/items/item_12/highlight/merge_2/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_12_MERGE_3":{
            pattern: "empire_anim/items/item_12/highlight/merge_3/sprite_%d.png",
            start: 0,
            end: 34,
            duration: 1.16
        },
        "ITEM_ELIMINATE_MERGE_0":{
            pattern: "empire_anim/items/item_eliminate/merge_0/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },
        "ITEM_ELIMINATE_MERGE_1":{
            pattern: "empire_anim/items/item_eliminate/merge_1/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },
        "ITEM_ELIMINATE_MERGE_2":{
            pattern: "empire_anim/items/item_eliminate/merge_2/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },
        "ITEM_ELIMINATE_MERGE_3":{
            pattern: "empire_anim/items/item_eliminate/merge_3/sprite_%d.png",
            start: 0,
            end: 19,
            duration: 0.66
        },
        "FRAME_GOLD_0":{
            pattern: "empire_anim/frame_gold/frame_0/sprite_%d.png",
            start: 0,
            end: 13,
            duration: 0.466
        },
        "FRAME_GOLD_1":{
            pattern: "empire_anim/frame_gold/frame_1/sprite_%d.png",
            start: 0,
            end: 13,
            duration: 0.466
        },
        "FRAME_GOLD_2":{
            pattern: "empire_anim/frame_gold/frame_2/sprite_%d.png",
            start: 0,
            end: 13,
            duration: 0.466
        },
        "FRAME_GOLD_3":{
            pattern: "empire_anim/frame_gold/frame_3/sprite_%d.png",
            start: 0,
            end: 13,
            duration: 0.466
        },

        "TO_WILD_END_0": {
            pattern: "empire_anim/items/item_transfer_to_wild/merge_0/sprite_%d.png",
            start: 32,
            end: 54,
            duration: 0.767
        },

        "TO_WILD_END_1": {
            pattern: "empire_anim/items/item_transfer_to_wild/merge_1/sprite_%d.png",
            start: 32,
            end: 54,
            duration: 0.767
        },

        "TO_WILD_END_2": {
            pattern: "empire_anim/items/item_transfer_to_wild/merge_2/sprite_%d.png",
            start: 32,
            end: 54,
            duration: 0.767
        },

        "TO_WILD_END_3": {
            pattern: "empire_anim/items/item_transfer_to_wild/merge_3/sprite_%d.png",
            start: 32,
            end: 54,
            duration: 0.767
        },

        "FG_CHARACTER_SHOW": {
            pattern: "empire_anim/fg_end_character/show/sprite_%d.png",
            start: 0,
            end: 16,
            duration: 0.7083333333333333
        },

        "FG_CHARACTER_SHOW_LOOP": {
            pattern: "empire_anim/fg_end_character/show/sprite_%d.png",
            start: 17,
            end: 72,
            duration: 2.333333333333333
        },

        "FG_CHARACTER_SHOW_HIDE": {
            pattern: "empire_anim/fg_end_character/hide/sprite_%d.png",
            start: 0,
            end: 7,
            duration: 0.3333333333333333
        }
    };

    const Animation = {
        SCATTERS: {
            SHOW: 0,
            WAIT: 1,
            GET: 2
        },

        addDefinition: function (name, definition, override = false) {
            if (!override && animationDefintions[name]) {
                cc.log("ATTEMPT TO REDEFINE ANIMATION: " + name);
                return false;
            }

            if (animationDefintions[name] !== definition) {
                animationDefintions[name] = definition;

                Resource.unloadAnimation(name);
            }

            return true;
        },

        removeDefinition: function (name) {
            animationDefintions[name] = undefined;
        },

        get: function (name, definition) {
            if (definition) {
                return Resource.loadAnimationWithDefinition(name, definition);
            } else if (animationDefintions[name]) {
                return Resource.loadAnimationWithDefinition(name, animationDefintions[name]);
            } else {
                return null;
            }
        }
    };
    
    window.Animation = Animation;
    return Animation;
});