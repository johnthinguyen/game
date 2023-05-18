"use strict";

var ReportBugs = ReportBugs || {};
ReportBugs.TaskResizeImage = cc.Class.extend({
    ctor: function ctor(targetWidth, targetHeight) {
        this.name = "resizeImage";

        this.progress = 0;
        this.isStarted = false;
        this.isCompleted = false;

        this.resultWidth = 0;
        this.resultHeight = 0;
        this.resultBuffer = null;

        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
    },

    start: function start(buffer, width, height) {
        this.progress = 0.0;
        this.isStarted = true;
        this.isCompleted = false;

        this.srcWidth = width;
        this.srcHeight = height;
        this.srcBuffer = buffer;

        this.resultWidth = this.targetWidth;
        this.resultHeight = this.targetHeight;
        this.resultBuffer = new Uint8Array(this.targetWidth * this.targetHeight * 4);

        this.currentIndex = 0;
        this.currentChunk = 0;
    },

    execute: function execute() {
        if (this.isCompleted) {
            return;
        }

        var CHUNK_SIZE = ReportBugs.Config.RESIZE_CHUNK_SIZE;

        var srcWidth = this.srcWidth;
        var srcHeight = this.srcHeight;
        var srcBuffer = this.srcBuffer;

        var dstWidth = this.resultWidth;
        var dstHeight = this.resultHeight;
        var dstBuffer = this.resultBuffer;

        var widthFactor = srcWidth / dstWidth;
        var heightFactor = srcHeight / dstHeight;

        var chunkCount = 0;
        while (this.currentIndex < dstWidth) {
            var dx = this.currentIndex++;
            var sx = Math.floor(dx * widthFactor);

            for (var dy = 0; dy < dstHeight; dy++) {
                var sy = Math.floor(dy * heightFactor);

                var indexDst = (dx + dy * dstWidth) * 4;
                var indexSrc = (sx + sy * srcWidth) * 4;

                dstBuffer[indexDst + 0] = srcBuffer[indexSrc + 0];
                dstBuffer[indexDst + 1] = srcBuffer[indexSrc + 1];
                dstBuffer[indexDst + 2] = srcBuffer[indexSrc + 2];
                dstBuffer[indexDst + 3] = srcBuffer[indexSrc + 3];
            }

            chunkCount += dstHeight * 4;
            if (chunkCount >= CHUNK_SIZE) {
                break;
            }
        }

        this.currentChunk += chunkCount;
        if (this.currentIndex >= dstWidth || this.currentChunk >= dstBuffer.byteLength) {
            this.progress = 1.0;
            this.isCompleted = true;
        } else {
            this.progress = this.currentChunk / dstBuffer.byteLength;
        }
    }
});