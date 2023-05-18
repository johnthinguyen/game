/*global module */

Module.define(function (require) {
    "use strict";

    const SPRITESHEETS = [
        "res/game/pharaoh_global/empire_sprites_common",
        "res/game/pharaoh_global/empire_spritesheets/empire_sprites_tutorial",
        "res/game/pharaoh_global/empire_spritesheets/empire_tutorial_text",

        "res/game/pharaoh_global/empire_spritesheets/empire_frame_gold_items",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_1_count_down_merge_1",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_1_highlight",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_2_fg_merge_0_3",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_2_fg_merge_1_2",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_2_nw",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_2_show",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_3_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_3_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_4_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_4_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_5_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_5_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_6_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_6_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_7_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_7_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_8_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_8_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_9_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_9_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_10_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_10_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_11_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_11_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_12_highlight",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_12_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_item_eliminate_0_1_2",
        "res/game/pharaoh_global/empire_spritesheets/empire_item_transfer",

        "res/game/pharaoh_global/empire_spritesheets/empire_sprites_fly_coin",

        "res/game/pharaoh_global/empire_spritesheets/empire_fg_character_0",
        "res/game/pharaoh_global/empire_spritesheets/empire_fg_character_1",
        "res/game/pharaoh_global/empire_spritesheets/empire_fg_character_2",
        "res/game/pharaoh_global/empire_spritesheets/empire_fg_character_3",
        "res/game/pharaoh_global/empire_spritesheets/empire_fg_character_4",
        "res/game/pharaoh_global/empire_spritesheets/empire_fg_character_5",
        "res/game/pharaoh_global/empire_spritesheets/empire_fg_character_6",
        "res/game/pharaoh_global/pharaoh_spritesheets/pharaoh_spritesheets",
    ];

    const ASSETS = {
        //pharaoh_main_layer
        CCS_MainLayer: "res/game/pharaoh_global/pharaoh_main_layer.json",
        CCS_Tutorial: "res/game/pharaoh_global/empire_tutorial_layer.json",
        CCS_ExtraSpin: "res/game/pharaoh_global/empire_extra_spin_layer.json",
        CCS_PopupJackpot: "res/game/pharaoh_global/empire_popup_jackpot.json",

 

        SPINE_ITEM_1_JSON: "res/game/pharaoh_global/empire_spine/item/item_1/skeleton.json",
        SPINE_ITEM_1_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_1/skeleton.atlas",
        SPINE_ITEM_1_PNG: "res/game/pharaoh_global/empire_spine/item/item_1/skeleton.png",

        SPINE_ITEM_2_JSON: "res/game/pharaoh_global/empire_spine/item/item_2/skeleton.json",
        SPINE_ITEM_2_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_2/skeleton.atlas",
        SPINE_ITEM_2_PNG: "res/game/pharaoh_global/empire_spine/item/item_2/skeleton.png",

        SPINE_ITEM_3_JSON: "res/game/pharaoh_global/empire_spine/item/item_3/skeleton.json",
        SPINE_ITEM_3_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_3/skeleton.atlas",
        SPINE_ITEM_3_PNG: "res/game/pharaoh_global/empire_spine/item/item_3/skeleton.png",

        SPINE_ITEM_4_JSON: "res/game/pharaoh_global/empire_spine/item/item_4/skeleton.json",
        SPINE_ITEM_4_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_4/skeleton.atlas",
        SPINE_ITEM_4_PNG: "res/game/pharaoh_global/empire_spine/item/item_4/skeleton.png",

        SPINE_ITEM_5_JSON: "res/game/pharaoh_global/empire_spine/item/item_5/skeleton.json",
        SPINE_ITEM_5_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_5/skeleton.atlas",
        SPINE_ITEM_5_PNG: "res/game/pharaoh_global/empire_spine/item/item_5/skeleton.png",

        SPINE_ITEM_6_JSON: "res/game/pharaoh_global/empire_spine/item/item_6/skeleton.json",
        SPINE_ITEM_6_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_6/skeleton.atlas",
        SPINE_ITEM_6_PNG: "res/game/pharaoh_global/empire_spine/item/item_6/skeleton.png",

        SPINE_ITEM_7_JSON: "res/game/pharaoh_global/empire_spine/item/item_7/skeleton.json",
        SPINE_ITEM_7_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_7/skeleton.atlas",
        SPINE_ITEM_7_PNG: "res/game/pharaoh_global/empire_spine/item/item_7/skeleton.png",

        SPINE_ITEM_8_JSON: "res/game/pharaoh_global/empire_spine/item/item_8/skeleton.json",
        SPINE_ITEM_8_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_8/skeleton.atlas",
        SPINE_ITEM_8_PNG: "res/game/pharaoh_global/empire_spine/item/item_8/skeleton.png",

        SPINE_ITEM_9_JSON: "res/game/pharaoh_global/empire_spine/item/item_9/skeleton.json",
        SPINE_ITEM_9_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_9/skeleton.atlas",
        SPINE_ITEM_9_PNG: "res/game/pharaoh_global/empire_spine/item/item_9/skeleton.png",

        SPINE_ITEM_10_JSON: "res/game/pharaoh_global/empire_spine/item/item_10/skeleton.json",
        SPINE_ITEM_10_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_10/skeleton.atlas",
        SPINE_ITEM_10_PNG: "res/game/pharaoh_global/empire_spine/item/item_10/skeleton.png",

        SPINE_ITEM_11_JSON: "res/game/pharaoh_global/empire_spine/item/item_11/skeleton.json",
        SPINE_ITEM_11_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_11/skeleton.atlas",
        SPINE_ITEM_11_PNG: "res/game/pharaoh_global/empire_spine/item/item_11/skeleton.png",

        SPINE_ITEM_12_JSON: "res/game/pharaoh_global/empire_spine/item/item_12/skeleton.json",
        SPINE_ITEM_12_ATLAS: "res/game/pharaoh_global/empire_spine/item/item_12/skeleton.atlas",
        SPINE_ITEM_12_PNG: "res/game/pharaoh_global/empire_spine/item/item_12/skeleton.png",

        SPINE_BIG_WIN_JSON: "res/game/pharaoh_global/empire_spine/fx_big_win/big_win.json",
        SPINE_BIG_WIN_ATLAS: "res/game/pharaoh_global/empire_spine/fx_big_win/big_win.atlas",
        SPINE_BIG_WIN_PNG: "res/game/pharaoh_global/empire_spine/fx_big_win/big_win.png",

        SPINES_jackpot_json: "res/game/pharaoh_global/empire_spine/jackpot/skeleton.json",
        SPINES_jackpot_atlas: "res/game/pharaoh_global/empire_spine/jackpot/skeleton.atlas",
        SPINES_jackpot_png: "res/game/pharaoh_global/empire_spine/jackpot/skeleton.png",

        STOP_REEL_SMOKE_JSON: "res/game/pharaoh_global/empire_spine/stop_reel_smoke/stop_reel_smoke.json",
        STOP_REEL_SMOKE_ATLAS: "res/game/pharaoh_global/empire_spine/stop_reel_smoke/stop_reel_smoke.atlas",
        STOP_REEL_SMOKE_PNG: "res/game/pharaoh_global/empire_spine/stop_reel_smoke/stop_reel_smoke.png",

        SPINE_FREE_GAME_START_JSON: "res/game/pharaoh_global/empire_spine/fx_freegame_start/freegame_start.json",
        SPINE_FREE_GAME_START_ATLAS: "res/game/pharaoh_global/empire_spine/fx_freegame_start/freegame_start.atlas",
        SPINE_FREE_GAME_START_PNG: "res/game/pharaoh_global/empire_spine/fx_freegame_start/freegame_start.png",

        SPINE_FREE_GAME_WIN_COIN_JSON: "res/game/pharaoh_global/empire_spine/fx_tong_ket_freegame/fx_tong_ket_fg.json",
        SPINE_FREE_GAME_WIN_COIN_ATLAS: "res/game/pharaoh_global/empire_spine/fx_tong_ket_freegame/fx_tong_ket_fg.atlas",
        SPINE_FREE_GAME_WIN_COIN_PNG: "res/game/pharaoh_global/empire_spine/fx_tong_ket_freegame/fx_tong_ket_fg.png",

        SPINE_FREE_GAME_FRAME_WIN_COIN_JSON: "res/game/pharaoh_global/empire_spine/fx_tong_ket_freegame/frame_win_coin/frame_win_coin.json",
        SPINE_FREE_GAME_FRAME_WIN_COIN_ATLAS: "res/game/pharaoh_global/empire_spine/fx_tong_ket_freegame/frame_win_coin/frame_win_coin.atlas",
        SPINE_FREE_GAME_FRAME_WIN_COIN_PNG: "res/game/pharaoh_global/empire_spine/fx_tong_ket_freegame/frame_win_coin/frame_win_coin.png",

        SPINE_FX_REEL_NEAR_WIN_JSON: "res/game/pharaoh_global/empire_spine/fx_reel_near_win/near_win.json",
        SPINE_FX_REEL_NEAR_WIN_ATLAS: "res/game/pharaoh_global/empire_spine/fx_reel_near_win/near_win.atlas",
        SPINE_FX_REEL_NEAR_WIN_PNG: "res/game/pharaoh_global/empire_spine/fx_reel_near_win/near_win.png",

        FNT_BALANCE_NUM: "res/game/pharaoh_global/empire_fonts/balance_num_font.fnt",
        FNT_BALANCE_NUM_PNG: "res/game/pharaoh_global/empire_fonts/balance_num_font.png",

        FNT_COMBO_COUNT_RED: "res/game/pharaoh_global/empire_fonts/combo_count_red.fnt",
        FNT_COMBO_COUNT_RED_PNG: "res/game/pharaoh_global/empire_fonts/combo_count_red.png",

        FNT_BALANCE: "res/game/pharaoh_global/empire_fonts/font_balance.fnt",
        FNT_BALANCE_PNG: "res/game/pharaoh_global/empire_fonts/font_balance.png",

        FNT_BET_WIN: "res/game/pharaoh_global/empire_fonts/font_bet_win.fnt",
        FNT_BET_WIN_PNG: "res/game/pharaoh_global/empire_fonts/font_bet_win.png",

        FNT_COUNT: "res/game/pharaoh_global/empire_fonts/font_count.fnt",
        FNT_COUNT_PNG: "res/game/pharaoh_global/empire_fonts/font_count.png",

        FNT_ELIMINATE: "res/game/pharaoh_global/empire_fonts/font_eliminate.fnt",
        FNT_ELIMINATE_PNG: "res/game/pharaoh_global/empire_fonts/font_eliminate.png",

        FNT_LEVEL: "res/game/pharaoh_global/empire_fonts/font_level.fnt",
        FNT_LEVEL_PNG: "res/game/pharaoh_global/empire_fonts/font_level.png",

        FNT_LINES: "res/game/pharaoh_global/empire_fonts/font_lines.fnt",
        FNT_LINES_PNG: "res/game/pharaoh_global/empire_fonts/font_lines.png",

        FNT_MEGA: "res/game/pharaoh_global/empire_fonts/jackpot_font.fnt",
        FNT_MEGA_PNG: "res/game/pharaoh_global/empire_fonts/jackpot_font.png",

        FNT_JACKPOT: "res/game/pharaoh_global/empire_fonts/jackpot_number.fnt",
        FNT_JACKPOT_PNG: "res/game/pharaoh_global/empire_fonts/jackpot_number.png",

        FNT_SPIN_COUNT: "res/game/pharaoh_global/empire_fonts/spin_count.fnt",
        FNT_SPIN_COUNT_PNG: "res/game/pharaoh_global/empire_fonts/spin_count.png",

        FNT_WILD_NUM: "res/game/pharaoh_global/empire_fonts/wild_num.fnt",
        FNT_WILD_NUM_PNG: "res/game/pharaoh_global/empire_fonts/wild_num.png",

        FNT_FG_ROUND: "res/game/pharaoh_global/empire_fonts/fg_round.fnt",
        FNT_FG_ROUND_PNG: "res/game/pharaoh_global/empire_fonts/fg_round.png",

        FNT_FG_START: "res/game/pharaoh_global/empire_fonts/font_start_free.fnt",
        FNT_FG_START_PNG: "res/game/pharaoh_global/empire_fonts/font_start_free.png",

        FNT_EFG_SPIN: "res/game/pharaoh_global/empire_fonts/font_free_spins.fnt",
        FNT_EFG_SPIN_PNG: "res/game/pharaoh_global/empire_fonts/font_free_spins.png",

        LEVEL_UP_BG: "res/game/pharaoh_global/empire_level_up/BgLevelUp.png",
        LEVEL_UP_BG_IconItem: "res/game/pharaoh_global/empire_level_up/IconItem.png",
        LEVEL_UP_BG_BgItem: "res/game/pharaoh_global/empire_level_up/BgItem.png",
        LEVEL_UP_BG_Close: "res/game/pharaoh_global/empire_level_up/Close.png",
        LEVEL_UP_BG_Recieve: "res/game/pharaoh_global/empire_level_up/BtnRecieve.png",

        SPINE_BG_FG_JSON: "res/game/pharaoh_global/empire_spine/background_fg/bg_fg.json",
        SPINE_BG_FG_ATLAS: "res/game/pharaoh_global/empire_spine/background_fg/bg_fg.atlas",
        SPINE_BG_FG_PNG: "res/game/pharaoh_global/empire_spine/background_fg/bg_fg.png",

        SPINE_BG_MG_JSON: "res/game/pharaoh_global/empire_spine/background_mg/bg_mg.json",
        SPINE_BG_MG_ATLAS: "res/game/pharaoh_global/empire_spine/background_mg/bg_mg.atlas",
        SPINE_BG_MG_PNG: "res/game/pharaoh_global/empire_spine/background_mg/bg_mg.png",

        SPINE_EXTRA_SPIN_JSON: "res/game/pharaoh_global/empire_spine/extra_spin/extra_spin.json",
        SPINE_EXTRA_SPIN_ATLAS: "res/game/pharaoh_global/empire_spine/extra_spin/extra_spin.atlas",
        SPINE_EXTRA_SPIN_PNG: "res/game/pharaoh_global/empire_spine/extra_spin/extra_spin.png",

        SPINE_MULTIPLIER_FG_JSON: "res/game/pharaoh_global/empire_spine/fg_multiplier/fg_multiplier.json",
        SPINE_MULTIPLIER_FG_ATLAS: "res/game/pharaoh_global/empire_spine/fg_multiplier/fg_multiplier.atlas",
        SPINE_MULTIPLIER_FG_PNG: "res/game/pharaoh_global/empire_spine/fg_multiplier/fg_multiplier.png",

        SPINE_FG_BOARD_JSON: "res/game/pharaoh_global/empire_spine/fg_board_light/fg_board_light.json",
        SPINE_FG_BOARD_ATLAS: "res/game/pharaoh_global/empire_spine/fg_board_light/fg_board_light.atlas",
        SPINE_FG_BOARD_PNG: "res/game/pharaoh_global/empire_spine/fg_board_light/fg_board_light.png",

        PARTICLE_FIRE_BALL: "res/game/pharaoh_global/empire_particle/fire_ball.plist",
        //// Pharaoh
        BG_BOARD_PNG: "res/game/pharaoh_global/pharaoh_img/board.png",

        FNT_EFG_SPIN_COLLECTION: "res/game/pharaoh_global/pharaoh_font/colection_fg_num.fnt",
        FNT_EFG_SPIN_COLLECTION_PNG: "res/game/pharaoh_global/pharaoh_font/colection_fg_num.png",

        FNT_NUM_WAY: "res/game/pharaoh_global/pharaoh_font/num_way.fnt",
        FNT_NUM_WAY_PNG: "res/game/pharaoh_global/pharaoh_font/num_way.png",

        FNT_FG_GOLD_NUM: "res/game/pharaoh_global/pharaoh_font/text_num_fg.fnt",
        FNT_FG_GOLD_NUM_PNG: "res/game/pharaoh_global/pharaoh_font/text_num_fg.png",

    };

    const SPRITES = {
        TUTORIAL_PAGE_1_TEXT_1: "empire_img/localize/%s/tutorial_page_1_text_1.png",

        TUTORIAL_PAGE_2_TEXT_1: "empire_img/localize/%s/tutorial_page_2_text_1.png",
        TUTORIAL_PAGE_2_TEXT_2: "empire_img/localize/%s/tutorial_page_2_text_2.png",
        
        TUTORIAL_PAGE_3_TEXT_1: "empire_img/localize/%s/tutorial_page_3_text_1.png",

        TUTORIAL_PAGE_6_TEXT_1: "empire_img/localize/%s/tutorial_page_6_text_1.png",

        TEXT_WILD_AND_SCATTER: "empire_img/localize/%s/tutorial_text_wild_scatter.png",
        TEXT_GOLDEN_FRAME: "empire_img/localize/%s/tutorial_text_golden_frame.png",
        TEXT_GAME_RULE: "empire_img/localize/%s/tutorial_text_game_rules.png",
        TEXT_PAY_TABLE: "empire_img/localize/%s/tutorial_text_pay_table.png",
        TEXT_TUTORIAL_FREE_GAME: "empire_img/localize/%s/text_free_game_tutorial.png",

        FG_START_FREE: "empire_img/localize/%s/fg_start_free.png",
        TUTORIAL_START_FREE: "empire_img/localize/%s/tutorial_start_free.png",
        CONGRAT_END_FREE: "empire_img/localize/%s/congrat_end_free.png",
        FREESPIN_END_FREE: "empire_img/localize/%s/freespin_end_free.png",
        TEXT_WIN_EXTRA: "empire_img/localize/%s/text_win_extra.png",

        TEXT_ELIMINATE: "empire_img/localize/%s/text_eliminate_time.png",
        TEXT_FREE_SPINS: "empire_img/localize/%s/text_free_spins.png",
        
        GOLD_ITEM_FRAME: "pharaoh_img/frame/merge_gold_%d.png",

        TUTORIAL_PAGE_INDEX: "empire_img/tutorial/page_index.png",
        TUTORIAL_PAGE_HIGHLIGHT: "empire_img/tutorial/page_current_index.png",
    };

    //
    // Export modules
    //

    const Resource = {
        ASSETS: ASSETS,
        SPRITES: SPRITES,

        SPRITESHEETS: SPRITESHEETS,

        preload: function (isL7 = false) {

            let state = { progress: 0.0, complete: false };

            let resources = Resource.getNeededResources();
            Resource.cachedResources = resources;
            Resource.cachedSpritesheets = Resource.cachedSpritesheets || [];

            let Loader = cc.Class.extend({
                ctor:function(state){
                    this.state = state;
                    this.resources = resources;

                    this.index = 0;
                    this.total  = this.resources.length;
                    this.isLoadDone = false;
                    this.isParseDone = false;

                    this.spritesheets = Resource.SPRITESHEETS.concat(SlotCore.getSpritesheets());
                },

                onLoadDone: function () {

                    this.index++;
                    this.state.progress = this.index / this.total;
                    this.state.progress = Math.max(0, this.state.progress);
                    this.state.progress = Math.min(this.state.progress, 0.9) * 100;

                    if (this.index == this.total && !this.isLoadDone) {
                        this.isLoadDone = true;
                    };
                },

                update: function (dt) {
                    if (resources.length > 0) {
                        let resource = resources.shift();
                        cc.loader.load(resource, _, this.onLoadDone.bind(this));
                    }

                    if (this.isLoadDone && !this.isParseDone) {
                        let spritesheet = this.spritesheets.shift();
                        cc.SpriteFrameCache.getInstance().addSpriteFrames(spritesheet + ".plist");
                        Resource.cachedSpritesheets.push(spritesheet);

                        if(this.spritesheets.length == 0){

                            this.isParseDone = true;

                            this.state.complete = true;
                            this.state.progress = 100;
                        }
                    }

                    if (this.isParseDone) {
                        cc.director.getScheduler().unscheduleUpdateForTarget(this);
                    }
                }
            });

            let loader = new Loader(state, resources);
            state = loader.state;
            cc.director.getScheduler().scheduleUpdateForTarget(loader);

            return state;
        },

        clearCache: function () {
            let animationCache = cc.AnimationCache.getInstance();
            let spriteFrameCache = cc.SpriteFrameCache.getInstance();

            if (Resource.cachedAnimations) {
                for (let key in Resource.cachedAnimations) {
                    try {
                        animationCache.removeAnimation(key);
                    } catch (err) {
                        cc.log("unload animation fail : ", err);
                    }
                }

                Resource.cachedAnimations = undefined;
            }

            if (cc.isArray(Resource.cachedSpritesheets)) {
                Resource.cachedSpritesheets.forEach(function (path) {
                    spriteFrameCache.removeSpriteFramesFromFile(path + ".plist");
                });

                Resource.cachedSpritesheets = undefined;
            }

            if (cc.isArray(Resource.cachedResources)) {
                Resource.cachedResources.forEach(function (path) {
                    cc.loader.release(path);
                });

                Resource.cachedResources = undefined;
            }
            
            SlotCore.destroy();
            SlotCore.clearCache();
        },

        // Callbacks

        handlePreloadComplete: function () {
            Resource.loadSpritesheets();
            Resource.loadAnimations();
        },

        // Load resource that without needed of IO

        loadSpritesheets: function () {

        },

        loadAnimations: function () {

        },

        getNeededResources: function () {
            let resources = []
                .concat(SPRITESHEETS.map(spritesheet => spritesheet + ".png"))
                .concat(SPRITESHEETS.map(spritesheet => spritesheet + ".plist"));

            for (let key in ASSETS) {
                resources.push(ASSETS[key]);
            }

            let audios = AudioHandler.getNeededResources();
            resources = resources.concat(audios);
            resources = resources.concat(SlotCore.getAssets());

            return resources;
        },

        // @note: default animation is 30fps
        loadAnimation: function (name, pattern, start, end, delay = 1.0 / 30, step = 1) {
            Resource.cachedAnimations = Resource.cachedAnimations || {};

            let animCache = cc.AnimationCache.getInstance();
            let animation = animCache.getAnimation(name);
            if (!animation) {
                let spriteCache = cc.SpriteFrameCache.getInstance();
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

                Resource.cachedAnimations[name] = animation;
            }

            return animation;
        },

        loadAnimationWithDuration: function (name, pattern, start, end, duration = 1.0, step = 1) {
            Resource.cachedAnimations = Resource.cachedAnimations || {};

            let animCache = cc.AnimationCache.getInstance();
            let animation = animCache.getAnimation(name);
            if (!animation) {

                let spriteCache = cc.SpriteFrameCache.getInstance();
                let spriteFrames = [];

                let loopStep = step * (start <= end ? 1 : -1);
                for (let i = start; i <= end; i += loopStep) {
                    let spriteName = cc.formatStr(pattern, i);
                    let frame = spriteCache.getSpriteFrame(spriteName);
                    if (frame) {
                        spriteFrames.push(frame);
                    }
                }

                let delay = duration / spriteFrames.length;
                animation = cc.Animation.createWithSpriteFrames(spriteFrames, delay, 1);
                animCache.addAnimation(animation, name);

                Resource.cachedAnimations[name] = animation;
            }

            return animation;
        },

        loadAnimationWithDefinition: function (name, definition) {
            let pattern = definition.pattern;
            let start = definition.start;
            let end = definition.end;
            let step = definition.step;

            if (definition.duration) {
                return Resource.loadAnimationWithDuration(name, pattern, start, end, definition.duration, step);
            } else {
                return Resource.loadAnimation(name, pattern, start, end, definition.delay, step);
            }
        },
    };

    window.Resource = Resource;
    return Resource;
});