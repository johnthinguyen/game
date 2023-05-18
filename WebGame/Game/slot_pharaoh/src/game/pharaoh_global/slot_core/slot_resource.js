Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotCore::SlotResource]";

    const ASSETS = {

        FNT_FONT_LEVEL: "res/game/pharaoh_global/slot_core/slot_fonts/font_level.fnt",
        PNG_FONT_LEVEL: "res/game/pharaoh_global/slot_core/slot_fonts/font_level.png",

        FNT_FONT_COUNTER: "res/game/pharaoh_global/slot_core/slot_fonts/font_spin_count.fnt",
        PNG_FONT_COUNTER: "res/game/pharaoh_global/slot_core/slot_fonts/font_spin_count.png",

        FNT_FONT_COIN_BOT: "res/game/pharaoh_global/slot_core/slot_fonts/font_coin_bot.fnt",
        PNG_FONT_COIN_BOT: "res/game/pharaoh_global/slot_core/slot_fonts/font_coin_bot.png",

        FNT_FONT_COIN_TOP: "res/game/pharaoh_global/slot_core/slot_fonts/font_coin_top_big.fnt",
        PNG_FONT_COIN_TOP: "res/game/pharaoh_global/slot_core/slot_fonts/font_coin_top_big.png",

        FNT_FONT_NUMBER: "res/game/pharaoh_global/slot_core/slot_fonts/font_number.fnt",
        PNG_FONT_NUMBER: "res/game/pharaoh_global/slot_core/slot_fonts/font_number.png",

        JSON_HEADER: "res/game/pharaoh_global/slot_core/slot_header.json",
        JSON_FOOTER: "res/game/pharaoh_global/slot_core/slot_footer.json",
        JSON_PROMPT: "res/game/pharaoh_global/slot_core/slot_prompt.json"
    };

    const SPRITES = {

        TEXT_BET: "slot_img/localize/%s/text_bet.png",
        TEXT_BUY: "slot_img/localize/%s/text_buy.png",

        TEXT_SPIN: "slot_img/localize/%s/text_spin.png",
        TEXT_AUTO: "slot_img/localize/%s/text_auto.png",
        TEXT_TAP_TO_STOP: "slot_img/localize/%s/text_tap_to_stop.png",
        TEXT_HOLD_FOR_AUTO: "slot_img/localize/%s/text_hold_for_auto.png",

        TEXT_LEVEL: "slot_img/localize/%s/text_level.png",

        TEXT_WIN: "slot_img/localize/%s/text_win.png",
        TEXT_MAX_BET: "slot_img/localize/%s/text_max_bet.png",

        TEXT_AUTO_STATE_ON: "slot_img/localize/%s/text_auto_turned_on.png",
        TEXT_AUTO_STATE_OFF: "slot_img/localize/%s/text_auto_turned_off.png",

        BACKGROUND_NOTIFY_AUTO: "slot_img/bg_notify_auto.png",

        ICON_VIP: "slot_img/icon_vip/icon_vip%d.png",

        ICON_SOUND_ON: "slot_img/icon_sound_on.png",
        ICON_SOUND_OFF: "slot_img/icon_sound_off.png"
    };

    const ANIMATIONS = {
        SLOT_LOADING: {
            name: "SLOT_LOADING",
            pattern: "slot_img/loading/loading_%d.png",
            start: 0,
            end: 19
        }
    };

    const SPRITESHEETS = [
        "res/game/pharaoh_global/slot_core/slot_sprites"
    ];

    let cachedAnimations = {};

    const SlotResource = {

        ASSETS: ASSETS,
        SPRITES: SPRITES,

        clearCache: function () {

            let animationCache = cc.AnimationCache.getInstance();

            if (cachedAnimations) {

                for (let key in cachedAnimations) {
                    try {
                        animationCache.removeAnimation(key);
                    } catch (err) {
                        cc.log("clearCache animation fail : ", err);
                    }
                }

                cachedAnimations = undefined;
            }
        },

        getResources: function () {

            let resources = []
                .concat(SPRITESHEETS.map(spritesheet => spritesheet + ".png"))
                .concat(SPRITESHEETS.map(spritesheet => spritesheet + ".plist"));

            for (let key in ASSETS) {
                resources.push(ASSETS[key]);
            }

            return resources;
        },

        getSpritesheets: function () {
            return SPRITESHEETS;
        },

        loadAnimation: function (name, pattern, start, end, delay = 1.0 / 30, step = 1) {

            cachedAnimations = cachedAnimations || {};

            let animCache = cc.AnimationCache.getInstance();
            let spriteCache = cc.SpriteFrameCache.getInstance();

            let animation = animCache.getAnimation(name);
            if (!animation) {

                let spriteFrames = [];

                let loopStep = step * (start <= end ? 1 : -1);
                for (let i = start; i <= end; i += loopStep) {
                    let spriteName = cc.formatStr(pattern, i);
                    let frame = spriteCache.getSpriteFrame(spriteName);
                    if (frame) {
                        spriteFrames.push(frame);
                    }
                }

                animation = cc.Animation.createWithSpriteFrames(spriteFrames, delay, 1);
                animCache.addAnimation(animation, name);

                cachedAnimations[name] = animation;
            }

            return animation;
        },

        getAnimationLoading: function () {
            let anim = ANIMATIONS.SLOT_LOADING;
            return this.loadAnimation(anim.name, anim.pattern, anim.start, anim.end);
        }
    };

    window.SlotResource = SlotResource;
    return SlotResource;
});