"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var Localize = Localize || function (cc, portalHelper) {
    /**
     * @typedef {{ [ key: string ]: string; }} LocalizeDictionary
     * @typedef {{ normal: string; bold: string; }} LocalizeFontConfig
     */

    var Localize = {};

    Localize.fontName = "Arial";
    Localize.fontSize = 16;

    /** @enum {number} */
    Localize.LANG_TYPE = {
        VI: 0,
        KM: 1,
        ZH: 2,
        ML: 3,
        TH: 4,
        EN: 5,
        MY: 6,
        PH: 7
    };

    /**
     * @deprecated
     */
    Localize.LANG = {
        VI: 0,
        CAM: 1,
        CHINA: 2,
        MALAY: 3,
        THAI: 4,
        EN: 5,
        MY: 6,
        PH: 7
    };

    /** @type {LocalizeFontConfig[]} */
    var COMMON_FONTS = {};
    COMMON_FONTS[Localize.LANG_TYPE.KM] = {
        normal: "hoYeah/Fonts/KhmerOSsys.ttf",
        bold: "hoYeah/Fonts/AngkorRegular.ttf"
    };
    COMMON_FONTS[Localize.LANG_TYPE.ZH] = {
        normal: "localize/font/Portal_Zh_Normal.ttf",
        bold: "localize/font/Portal_Zh_Bold.ttf"
    };
    COMMON_FONTS[Localize.LANG_TYPE.TH] = {
        normal: "localize/font/THSarabunPSK_Regular.ttf",
        bold: "localize/font/THSarabunPSK_Bold.ttf"
    };
    COMMON_FONTS[Localize.LANG_TYPE.MY] = {
        normal: "localize/font/Pyidaungsu_Regular.ttf",
        bold: "localize/font/Pyidaungsu_Bold.ttf"
    };

    /** @type {LocalizeDictionary[]} */
    var COMMON_TRANSLATE = [];
    COMMON_TRANSLATE[Localize.LANG_TYPE.VI] = LangSpinVi;
    COMMON_TRANSLATE[Localize.LANG_TYPE.KM] = LangSpinEn;
    COMMON_TRANSLATE[Localize.LANG_TYPE.ZH] = LangSpinKh;
    COMMON_TRANSLATE[Localize.LANG_TYPE.MY] = LangSpinEn;
    COMMON_TRANSLATE[Localize.LANG_TYPE.TH] = LangSpinEn;
    COMMON_TRANSLATE[Localize.LANG_TYPE.PH] = LangSpinEn;
    COMMON_TRANSLATE[Localize.LANG_TYPE.EN] = LangSpinEn;
    /**
     * @param {LocalizeDictionary} dictionary
     * @param {number} langId
     * @return {void}
     */
    Localize.loadCommonTranslate = function (dictionary, langId) {
        if (COMMON_TRANSLATE[langId]) {
            var commonTranslate = COMMON_TRANSLATE[langId];
            for (var key in commonTranslate) {
                dictionary[key] = commonTranslate[key];
            }
        }
    };

    /**
     * @param {LocalizeDictionary} translate
     * @param {number} langId
     * @return {boolean}
     */
    Localize.setTranslate = function (translate) {
        var langId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : portalHelper.getLanguageType();

        if (langId >= Localize.LANG_TYPE.VI && langId <= Localize.LANG_TYPE.MY) {
            Localize.translate = {};
            Localize.loadCommonTranslate(Localize.translate, langId);

            for (var key in translate) {
                Localize.translate[key] = translate[key];
            }

            return true;
        } else {
            return false;
        }
    };

    /**
     * @deprecated
     */
    Localize.updateCommon = function (langId) {
        Localize.lang = Localize.lang || {};
        if (COMMON_TRANSLATE[langId]) {
            var commonTranslate = COMMON_TRANSLATE[langId];
            for (var key in commonTranslate) {
                Localize.lang[key] = commonTranslate[key];
            }
        }
    };

    /**
     * @deprecated
     */
    Localize.setLanguage = function (lang) {
        Localize.updateCommon(portalHelper.getLanguageType());
        for (var key in lang) {
            Localize.lang[key] = lang[key];
        }
    };

    /**
     * @param {string} key
     * @return {string}
     */
    Localize.text = function (key) {
        if (Localize.translate && Localize.translate[key]) {
            return Localize.translate[key];
        }

        if (Localize.lang && Localize.lang[key]) {
            return Localize.lang[key];
        }

        return key;
    };

    /**
     * @param {string} key
     * @return {string}
     */
    Localize.format = function (key) {
        arguments[0] = Localize.text(key);
        if (typeof arguments[0] !== "string") {
            cc.log("Localize", "Input key is not exists: " + key);
            return "";
        } else {
            var result = StringUtils.formatString.apply(StringUtils, arguments);
            return result;
        }
    };

    /**
     * @param {string|{name: string}} font
     * @param {boolean=} replaceSystemFont
     * @return {void}
     */
    Localize.setFont = function (font) {
        var replaceSystemFont = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if ((typeof font === "undefined" ? "undefined" : _typeof(font)) === "object" && typeof font.name === "string") {
            Localize.fontName = font.name;
            Localize.replaceSystemFont = replaceSystemFont;
        } else if (typeof font === "string") {
            Localize.fontName = font;
            Localize.replaceSystemFont = replaceSystemFont;
        } else {
            cc.log("Localize", "Attempt to set font with invalid params: %j", font);
        }
    };

    /**
     * @param {number} fontSize
     * @param {string} translateKey
     * @return {Node}
     */
    Localize.createTextNode = function (fontSize, translateKey) {
        var text = Localize.format.apply(Localize, Array.from(arguments).slice(1));
        var node = new ccui.Text(text, Localize.fontName, fontSize);

        return node;
    };

    /**
     * @return {Node}
     */
    Localize.createRichTextNode = function () {
        var node = new ccui.RichText();
        node.setSystemFontInRes(Localize.replaceSystemFont);

        return node;
    };

    /**
     * @param {Node} text
     * @param {number=} fontSize
     * @param {boolean=} isBold
     * @return {void}
     */
    Localize.handleTextNodeFont = function (text) {
        var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
        var isBold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        if (!text || !cc.sys.isObjectValid(text)) {
            return;
        }

        var type = portalHelper.getLanguageType();
        var fontConfig = COMMON_FONTS[type];
        if (fontConfig !== undefined) {
            var fontName = Localize.getLocalizeFont(isBold);
            text.setFontName(fontName, true);
        }

        if (fontSize > 0) {
            text.setFontSize(fontSize);
        }
    };

    /**
     * @param {boolean=} isBold
     * @return {string}
     */
    Localize.getLocalizeFont = function () {
        var isBold = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var type = portalHelper.getLanguageType();

        var fontConfig = COMMON_FONTS[type];
        if (fontConfig) {
            return (isBold ? fontConfig.bold : fontConfig.normal) || Localize.fontName;
        }

        return "";
    };

    /** @type {number} */
    Localize.getLanguage = function () {
        return portalHelper.getLanguageType();
    };

    /** @type {number} */
    Localize.getLanguageStr = function () {
        switch (Localize.getLanguage()) {
            case Localize.LANG_TYPE.VI:
                return "vi";

            case Localize.LANG_TYPE.KM:
                return "km";

            case Localize.LANG_TYPE.ZH:
                return "zh";

            case Localize.LANG_TYPE.ML:
                return "ml";

            case Localize.LANG_TYPE.TH:
                return "th";

            case Localize.LANG_TYPE.EN:
                return "en";

            case Localize.LANG_TYPE.MY:
                return "my";

            case Localize.LANG_TYPE.PH:
                return "ph";
            default:
                return "en";
        }
    };

    return Localize;
}(cc, portalHelper);
