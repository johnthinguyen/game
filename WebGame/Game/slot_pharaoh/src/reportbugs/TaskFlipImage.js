"use strict";

var ReportBugs = ReportBugs || {};
ReportBugs.TaskFlipImage = cc.Class.extend({
    ctor: function ctor() {
        this.name = "flipImage";

        this.progress = 0;
        this.isStarted = false;
        this.isCompleted = false;

        this.resultWidth = 0;
        this.resultHeight = 0;
        this.resultBuffer = null;
    },

    start: function start(buffer, width, height) {
        this.progress = 0;
        this.isStarted = true;
        this.isCompleted = false;

        this.width = width;
        this.height = height;
        this.buffer = buffer;

        this.resultWidth = width;
        this.resultHeight = height;
        this.resultBuffer = new Uint8Array(buffer.byteLength);

        this.currentIndex = 0;
        this.currentChunk = 0;
    },

    execute: function execute() {
        if (this.isCompleted) {
            return;
        }

        var CHUNK_SIZE = ReportBugs.Config.FLIP_CHUNK_SIZE;

        var width = this.width;
        var height = this.height;
        var buffer = this.buffer;
        var flippedBuffer = this.resultBuffer;

        var chunkCount = 0;
        while (this.currentIndex < height) {
            var i = this.currentIndex++;
            for (var j = 0; j < width; j++) {
                var dstIndex = ((height - i - 1) * width + j) * 4;
                var srcIndex = (i * width + j) * 4;

                flippedBuffer[dstIndex + 0] = buffer[srcIndex + 0];
                flippedBuffer[dstIndex + 1] = buffer[srcIndex + 1];
                flippedBuffer[dstIndex + 2] = buffer[srcIndex + 2];
                flippedBuffer[dstIndex + 3] = buffer[srcIndex + 3];
            }

            chunkCount += 4 * width;
            if (chunkCount >= CHUNK_SIZE) {
                break;
            }
        }

        this.currentChunk += chunkCount;
        if (this.currentIndex >= height || this.currentChunk >= flippedBuffer.byteLength) {
            this.progress = 1.0;
            this.isCompleted = true;
        } else {
            this.progress = this.currentChunk / flippedBuffer.byteLength;
        }
    }
});