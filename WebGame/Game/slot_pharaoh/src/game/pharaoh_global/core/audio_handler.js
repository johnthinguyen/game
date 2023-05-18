/*global module */

Module.define(function (require) {
    "use strict";
    const EXT = ".mp3";

    const res = {
        MAIN_GAME_BGM: "res/game/pharaoh_global/empire_sound/mg_bgm" + EXT,
        FREE_GAME_BGM: "res/game/pharaoh_global/empire_sound/fg_bgm" + EXT,
        REEL_STOP: "res/game/pharaoh_global/empire_sound/reel_stop" + EXT,
        CLICK_SPIN: "res/game/pharaoh_global/empire_sound/spin" + EXT,
        WIN_LINE: "res/game/pharaoh_global/empire_sound/win_line" + EXT,
        FREE_GAME_START: "res/game/pharaoh_global/empire_sound/fg_show" + EXT,
        INCREASE_ELIMINATE: "res/game/pharaoh_global/empire_sound/fg_add_spin_panel" + EXT,
        FREE_GAME_END: "res/game/pharaoh_global/empire_sound/fg_end" + EXT,
        HIGHLIGHT_SCATTER: "res/game/pharaoh_global/empire_sound/mg_scatter_highlight" + EXT,
        REEL_NEAR_WIN: "res/game/pharaoh_global/empire_sound/mg_near_win" + EXT,
        CLICK_SOUND: "res/game/pharaoh_global/empire_sound/spin_click" + EXT,
        JACKPOT: "res/game/pharaoh_global/empire_sound/reward_jackpot" + EXT,
        EFFECT_BIG_WIN: "res/game/pharaoh_global/empire_sound/effect_bigwin" + EXT,
        EFFECT_BIG_WIN_END: "res/game/pharaoh_global/empire_sound/effect_bigwin_end" + EXT,
        EFFECT_CHANGE_WIN: "res/game/pharaoh_global/empire_sound/effect_change_win" + EXT,
        SCATTER_1: "res/game/pharaoh_global/empire_sound/mg_scatter0" + EXT,
        SCATTER_2: "res/game/pharaoh_global/empire_sound/mg_scatter1" + EXT,
        SCATTER_3: "res/game/pharaoh_global/empire_sound/mg_scatter2" + EXT,
        HIGHLIGHT_FREE_GAME_ITEM: "res/game/pharaoh_global/empire_sound/fg_add_highlight_item" + EXT,
        SYMBOL_CHANGE: "res/game/pharaoh_global/empire_sound/symbol_change" + EXT,
    };

    let isEnabled = true;
    let audioEngine = null;

    function playMusic(name, loop = false) {
        if (isEnabled && audioEngine != null) {
            return audioEngine.playMusic(name, loop);
        } else {
            return 0;
        }
    }

    function pauseMusic () {
        if (audioEngine != null) {
            audioEngine.pauseMusic();
        }
    }

    function resumeBackgroundMusic () {
        soundHelper.resumeBackgroundMusic()
    }

    function playEffect(name, loop = false) {
        if (isEnabled && audioEngine != null) {
            return audioEngine.playEffect(name, loop);
        } else {
            return 0;
        }
    }

    function stopEffect(id) {
        if (isEnabled && audioEngine != null) {
            return audioEngine.stopEffect(id);
        } else {
            return 0;
        }
    }

    const AudioHandler = {
        init: function (isL7 = false) {
            this.isL7 = isL7;
            // if (!this.isL7) {
            //     isEnabled = portalHelper.getLocalInt(portalHelper.ENABLE_AUDIO_FISHING, 0) > 0;
            // }
            audioEngine = cc.AudioEngine.getInstance();
            audioEngine.getEffectsVolume();
            this.setEnabled(isEnabled);
        },

        quit: function () {
            this.stopEffectGoodLuck();
            audioEngine = null;
        },

        updateState: function () {
            audioEngine.setEffectsVolume(isEnabled ? 1.0 : 0.0);
            audioEngine.setMusicVolume(isEnabled ? 0.8 : 0.0);

            if (isEnabled) {
                audioEngine.resumeMusic();
            } else {
                audioEngine.stopAllEffects();
                audioEngine.pauseMusic();
            }

            // if (!this.isL7) {
            //     portalHelper.setLocalInt(portalHelper.ENABLE_AUDIO_FISHING, isEnabled ? 1 : -1);
            // }
        },

        isEnabled: function () {
            return isEnabled;
        },

        setEnabled: function (value) {
            isEnabled = value;
            AudioHandler.updateState();
        },

        getNeededResources: function () {
            let resources = [];
            for (let key in res) {
                resources.push(res[key]);
            }

            return resources;
        },

        stopBackground: function (delayTime = 0.3) {
            pauseMusic();

            cc.director.getRunningScene().scheduleOnce(() => {
                audioEngine.stopMusic();
            }, delayTime);
        },
        
        pauseBackground: function () {
            pauseMusic();
        },

        resumeBackground: function () {
            if (isEnabled) {
                resumeBackgroundMusic();
            }
        },

        stopJackpot: function () {
            if (this.effectJackPot) {
                stopEffect(this.effectJackPot);
            }
        },

        stopReelNearWin: function () {
            if (this.effecReelNearWin) {
                stopEffect(this.effecReelNearWin);
            }
        },

        stopEffectBigWin: function () {
            if (this.effectBigWin) {
                stopEffect(this.effectBigWin);
            }
        },

        //--------------------------

        playBackground:function () {
            this.musicBg = playMusic(res.MAIN_GAME_BGM, true);
        },
        
        playBackgroundFreeGame: function () {
            this.musicBg = playMusic(res.FREE_GAME_BGM, true);
        },

        playFreeGameEnd: function () {
            this.musicBg = playMusic(res.FREE_GAME_END, false);
        },

        playClickSpin: function () {
            playEffect(res.CLICK_SPIN, false);
        },

        playReelStop: function () {
            playEffect(res.REEL_STOP, false);
        },

        playWinLine: function () {
            playEffect(res.WIN_LINE, false);
        } ,

        playFreeGameItem: function () {
            playEffect(res.HIGHLIGHT_FREE_GAME_ITEM, false);
        },

        playIncreaseEliminate: function () {
            playEffect(res.INCREASE_ELIMINATE, false);
        },

        playHighlightScatter: function () {
            playEffect(res.HIGHLIGHT_SCATTER, false);
        },

        playFreeGameStart: function () {
            playEffect(res.FREE_GAME_START, false);
        },

        playReelNearWin: function () {
            this.effecReelNearWin = playEffect(res.REEL_NEAR_WIN, false);
        },

        playClickSound: function () {
            playEffect(res.CLICK_SOUND, false);
        },

        playJackpot: function () {
            this.effectJackPot = playEffect(res.JACKPOT, true);
        },

        playEffectBigWin: function () {
            this.stopEffectBigWin();
            this.effectBigWin = playEffect(res.EFFECT_BIG_WIN, false);
        },

        stopEffectGoodLuck: function(){
            clearInterval(this.intervalGoodLuck);
        },

        playEffectNearFreeGame: function(numbItem){
            switch (numbItem) {
                case 1:
                    playEffect(res.SCATTER_1, false);
                    break;
                case 2:
                    playEffect(res.SCATTER_2, false);
                    break;
                case 3:
                case 4:
                case 5:
                    playEffect(res.SCATTER_3, false);
                    break;
                default:
                    break;
            };
        },

        playEffectBigWinEnd: function(){
            this.stopEffectBigWin();
            this.effectBigWin = playEffect(res.EFFECT_BIG_WIN_END, false);
        },

        playEffectBigWinChange: function(){
            playEffect(res.EFFECT_CHANGE_WIN, false);
        },

        playEffectSymbolChange: function(){
            if(!this.effectSymbolChange)
                this.effectSymbolChange = playEffect(res.SYMBOL_CHANGE, false);
        },

        clearEffectSymbolChange: function(){
            this.effectSymbolChange = 0;
        }
    };

    window.AudioHandler = AudioHandler;
    return AudioHandler;
});
