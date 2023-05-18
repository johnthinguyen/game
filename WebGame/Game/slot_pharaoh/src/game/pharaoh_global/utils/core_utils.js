Module.define(function (require) {
    "use strict";

    const CoreUtils = {
        randomMinMax: function (min, max) {
            min = Math.min(min, max);
            max = Math.max(max, min);
            return min + Math.round(Math.random() * (max - min));
        },

        isArrayInclues: function (arr = [], item) {
            if (arr.length == 0) {
                return false;
            }

            for (let i = 0; i < arr.length; i++) {
                if (arr[i] == item) {
                    return true;
                }
            }

            return false;
        }
    }

    window.CoreUtils = CoreUtils;
    return CoreUtils;
});