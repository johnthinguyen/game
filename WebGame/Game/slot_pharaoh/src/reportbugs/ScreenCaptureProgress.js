"use strict";

var ReportBugs = ReportBugs || {};
ReportBugs.ScreenCaptureProgress = cc.Class.extend({
    ctor: function ctor() {
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.screenBuffer = null;

        this.proressBuffer = null;
        this.isProgressing = false;

        this.isResizingBuffer = false;
        this.isFlippingBuffer = false;
        this.isEncodingBuffer = false;
        this.isCompressingBuffer = false;
    },

    captureScreen: function captureScreen() {
        var screenSize = cc.view.getFrameSize();
        var screenWidth = screenSize.width;
        var screenHeight = screenSize.height;
        var screenBuffer = new Uint8Array(screenWidth * screenHeight * 4);

        gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
        gl.readPixels(0, 0, screenWidth, screenHeight, gl.RGBA, gl.UNSIGNED_BYTE, screenBuffer);

        return {
            width: screenWidth,
            height: screenHeight,
            buffer: screenBuffer
        };
    },

    update: function update(dt) {
        if (!this.isProgressing) {
            return;
        }

        if (this.currentTaskIndex === -1) {
            this.currentTaskIndex = 0;

            if (typeof this.onProgressStarted === "function") {
                this.onProgressStarted();
            }
        } else if (this.currentTaskIndex < this.tasks.length) {
            var currentTask = this.tasks[this.currentTaskIndex];
            if (currentTask) {
                if (!currentTask.isStarted) {
                    cc.log("[ScreenCapture]", "start task: " + (currentTask.name || this.currentTaskIndex));
                    currentTask.start(this.resultBuffer, this.resultWidth, this.resultHeight);
                } else {
                    currentTask.execute(dt);
                }

                if (currentTask.isCompleted) {
                    this.resultWidth = currentTask.resultWidth;
                    this.resultHeight = currentTask.resultHeight;
                    this.resultBuffer = currentTask.resultBuffer;

                    this.currentTaskIndex++;
                }

                this.progress = (this.currentTaskIndex + currentTask.progress) / this.tasks.length;
            } else {
                this.currentTaskIndex++;
                this.progress = this.currentTaskIndex / this.tasks.length;
            }

            if (this.currentTaskIndex >= this.tasks.length) {
                this.completeProgress();
            }
        }
    },

    startProgress: function startProgress() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { width: 1280, height: 720, flip: true, compress: true, encodeImage: true, encodeBase64: false };

        if (this.isProgressing) {
            return false;
        }

        var tasks = [];

        var screenSize = cc.view.getFrameSize();
        var screenWidth = screenSize.width;
        var screenHeight = screenSize.height;
        if (options.width !== screenWidth || options.height !== screenHeight) {
            tasks.push(new ReportBugs.TaskResizeImage(options.width, options.height));
        }

        if (options.flip) {
            tasks.push(new ReportBugs.TaskFlipImage());
        }

        if (options.compress) {
            tasks.push(new ReportBugs.TaskCompressImage());
        }

        if (options.encodeImage) {
            tasks.push(new ReportBugs.TaskEncodeImage());
        }

        if (options.encodeBase64) {
            tasks.push(new ReportBugs.TaskEncodeBase64());
        }

        if (tasks.length <= 0) {
            return false;
        } else {
            this.tasks = tasks;
        }

        this.isProgressing = true;

        var screen = this.captureScreen();
        this.resultWidth = screen.width;
        this.resultHeight = screen.height;
        this.resultBuffer = screen.buffer;

        this.currentTaskIndex = -1;

        this.scheduler = cc.director.getScheduler();
        this.scheduler.scheduleUpdateForTarget(this, cc.Scheduler.PRIORITY_SYSTEM, false);
        return this.isProgressing;
    },

    stopProgress: function stopProgress() {
        this.scheduler.unscheduleUpdateForTarget(this);
        this.currentTaskIndex = -1;
        this.tasks = null;

        if (typeof this.onProgressStopped === "function") {
            this.onProgressStopped(this.resultBuffer, this.resultWidth, this.resultHeight, this.progress);
        }
    },

    completeProgress: function completeProgress() {
        this.scheduler.unscheduleUpdateForTarget(this);
        this.currentTaskIndex = -1;
        this.tasks = null;

        if (typeof this.onProgressCompleted === "function") {
            this.onProgressCompleted(this.resultBuffer, this.resultWidth, this.resultHeight);
        }
    }
});