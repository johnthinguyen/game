"use strict";

var SoundHelper = cc.Class.extend({

    musicEnabled: false,
    soundEnabled: false,

    isMusicPlaying: false,
    activeMusicName: null,

    audioEngine: null,

    ctor: function ctor() {

        this.musicEnabled = true;
        this.soundEnabled = true;

        this.isMusicPlaying = false;
        this.activeMusicName = "";

        this.audioEngine = cc.audioEngine;
    },

    preload: function preload(path) {
        if (!this.audioEngine) this.audioEngine = cc.audioEngine;
        this.audioEngine.preload(path);
    },

    setSwitchOffMusic: function setSwitchOffMusic(enabled) {
        this.musicEnabled = enabled;
    },

    getSwitchOfMusic: function getSwitchOfMusic() {
        return this.musicEnabled;
    },

    setSwitchOffEffect: function setSwitchOffEffect(enabled) {
        this.soundEnabled = enabled;
    },

    getSwitchOffEffect: function getSwitchOffEffect() {
        return this.soundEnabled;
    },

    playBackgroundMusic: function playBackgroundMusic(file) {
        var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (this.musicEnabled) {
            this.isMusicPlaying = true;
            this.activeMusicName = file;
            this.audioEngine.playMusic(file, loop);
        }
    },

    stopBackgroundMusic: function stopBackgroundMusic(name) {
        this.audioEngine.stopMusic(name);
        this.isMusicPlaying = false;
    },

    pauseBackgroundMusic: function pauseBackgroundMusic() {
        this.audioEngine.pauseMusic();
    },

    resumeBackgroundMusic: function resumeBackgroundMusic() {
        if (this.musicEnabled) {
            this.audioEngine.resumeMusic();
        }
    },

    playEffect: function playEffect(file) {
        var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (this.soundEnabled) {
            return this.audioEngine.playEffect(file, loop);
        }
        return 0;
    },

    setEffectsVolume: function setEffectsVolume(volume) {
        this.audioEngine.setEffectsVolume(volume);
    },

    getEffectsVolume: function getEffectsVolume() {
        return this.audioEngine.getEffectsVolume();
    },

    setBackgroundMusicVolume: function setBackgroundMusicVolume(volume) {
        this.audioEngine.setMusicVolume(volume);
    },

    getBackgroundMusicVolume: function getBackgroundMusicVolume() {
        return this.audioEngine.getBackgroundMusicVolume();
    },

    stopAllEffects: function stopAllEffects() {
        this.audioEngine.stopAllEffects();
    }
});

// Singleton
SoundHelper.instance = null;
SoundHelper.getInstance = function () {
    if (!SoundHelper.instance) {
        SoundHelper.instance = new SoundHelper();
    }
    return SoundHelper.instance;
};

//Global
var soundHelper = SoundHelper.getInstance();