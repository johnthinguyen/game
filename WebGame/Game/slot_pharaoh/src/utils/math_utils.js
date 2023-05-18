"use strict";

var MathUtils = MathUtils || {};

MathUtils.randomMax = function (max) {
    return MathUtils.randomMinMax(0, Math.max(max - 1));
};

MathUtils.randomMinMax = function (min, max) {
    min = Math.min(min, max);
    max = Math.max(max, min);
    return min + Math.round(Math.random() * (max - min));
};