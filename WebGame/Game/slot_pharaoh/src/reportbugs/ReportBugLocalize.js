"use strict";

var ReportBugs = ReportBugs || {};
ReportBugs.Localize = {
    "en": {
        "LANG_MESSAGE_SENT": "Sent",
        "LANG_MESSAGE_SENDING": "Sending",
        "LANG_MESSAGE_SEND_FAILED": "Failed to send",

        "LANG_MESSAGE_REASON_0": "Unable to play",
        "LANG_MESSAGE_REASON_1": "Can't finish the match or the result",
        "LANG_MESSAGE_REASON_2": "Win but didn't receive any reward",

        "LANG_TITLE_POPUP_REASON_SELECTOR": "Report the error match",

        "LANG_LABEL_CANCEL": "CANCEL",
        "LANG_LABEL_OKAY": "OKAY"
    },

    "km": {
        "LANG_MESSAGE_SENT": "បានផ្ញើ",
        "LANG_MESSAGE_SENDING": "កំពុងផ្ញើរ",
        "LANG_MESSAGE_SEND_FAILED": "ផ្ញើរបរាជ័យ",

        "LANG_MESSAGE_REASON_0": "លេងមិនបាន",
        "LANG_MESSAGE_REASON_1": "មិនបញ្ចប់វគ្គប្រកួតឬមានលទ្ធផល",
        "LANG_MESSAGE_REASON_2": "ឈ្នះតែមិនទទួលបានរង្វាន់",

        "LANG_TITLE_POPUP_REASON_SELECTOR": "ប្រាប់វគ្គមានកំហុស",

        "LANG_LABEL_CANCEL": "បដិសេធ",
        "LANG_LABEL_OKAY": "យល់ព្រម"
    },

    getText: function getText(key) {
        var translations = this[portalHelper.getLanguageStr()] || this["en"];
        return translations[key] || key;
    }
};