"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var Promise = Promise || function (Array, TypeError, setTimeout) {
    /** @enum {number} */
    var State = {
        None: 0,
        Pending: 1,
        Rejected: 2,
        Fulfilled: 3
    };

    /***/
    var handlers = {};

    /* istanbul ignore next */
    function internalExecutor() {}

    function Promise(executor) {
        if (typeof executor !== "function") {
            throw new TypeError("executor must be a function");
        }

        this.state = State.Pending;
        this.queue = [];
        this.outcome = void 0;

        if (executor !== internalExecutor) {
            safelyResolveThenable(this, executor);
        }
    };

    Promise.prototype.finally = function (onFinally) {
        if (typeof onFinally !== "function") {
            return this;
        }

        var resolve = function resolve(value) {
            return Promise.resolve(onFinally()).then(function () {
                return value;
            });
        };

        var reject = function reject(reason) {
            return Promise.reject(onFinally()).then(function () {
                throw reason;
            });
        };

        return this.then(resolve, reject);
    };

    Promise.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
        if (typeof onFulfilled !== "function" && this.state === State.Fulfilled || typeof onRejected !== "function" && this.state === State.Rejected) {
            return this;
        }

        var promise = new Promise(internalExecutor);
        if (this.state !== State.Pending) {
            var resolver = this.state === State.Fulfilled ? onFulfilled : onRejected;
            unwrap(promise, resolver, this.outcome);
        } else {
            this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
        }

        return promise;
    };

    /** 
     * @constructor
     * @param {Promise} promise
     * @param {(value: any) => void} onFulfilled
     * @param {(reason: any) => void} onRejected
     */
    function QueueItem(promise, onFulfilled, onRejected) {
        this.promise = promise;

        if (typeof onFulfilled === "function") {
            this.onFulfilled = onFulfilled;
            this.callFulfilled = this.otherCallFulfilled;
        }

        if (typeof onRejected === "function") {
            this.onRejected = onRejected;
            this.callRejected = this.otherCallRejected;
        }
    }

    QueueItem.prototype.callFulfilled = function (value) {
        handlers.resolve(this.promise, value);
    };

    QueueItem.prototype.otherCallFulfilled = function (value) {
        unwrap(this.promise, this.onFulfilled, value);
    };

    QueueItem.prototype.callRejected = function (value) {
        handlers.reject(this.promise, value);
    };

    QueueItem.prototype.otherCallRejected = function (value) {
        unwrap(this.promise, this.onRejected, value);
    };

    function unwrap(promise, func, value) {
        immediate(function () {
            try {
                var returnValue = func(value);
                if (returnValue === promise) {
                    handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
                } else {
                    handlers.resolve(promise, returnValue);
                }
            } catch (e) {
                return handlers.reject(promise, e);
            }
        });
    }

    handlers.resolve = function (self, value) {
        var result = tryCatch(getThen, value);
        if (result.status === 'error') {
            return handlers.reject(self, result.value);
        }

        var thenable = result.value;
        if (thenable) {
            safelyResolveThenable(self, thenable);
        } else {
            self.state = State.Fulfilled;
            self.outcome = value;

            self.queue.forEach(function (job) {
                job.callFulfilled(value);
            });
        }

        return self;
    };

    handlers.reject = function (self, reason) {
        self.state = State.Rejected;
        self.outcome = reason;

        self.queue.forEach(function (job) {
            job.callRejected(reason);
        });

        return self;
    };

    function getThen(obj) {
        var then = obj && obj.then;
        if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof object === "function") {
            if (typeof then === "function") {
                return function applyThen() {
                    then.apply(obj, arguments);
                };
            }
        }
    }

    function safelyResolveThenable(self, thenable) {
        var called = false;

        function onError(reason) {
            if (called) {
                return;
            }

            called = true;
            handlers.reject(self, reason);
        }

        function onSuccess(value) {
            if (called) {
                return;
            }

            called = true;
            handlers.resolve(self, value);
        }

        function tryToUnwrap() {
            thenable(onSuccess, onError);
        }

        var result = tryCatch(tryToUnwrap);
        if (result.status === 'error') {
            onError(result.value);
        }
    }

    function tryCatch(program, value) {
        var out = {};
        try {
            out.value = program(value);
            out.status = 'success';
        } catch (e) {
            out.value = e;
            out.status = 'error';
        }

        return out;
    }

    Promise.resolve = function (value) {
        if (value instanceof Promise) {
            return value;
        }

        return handlers.resolve(new Promise(internalExecutor), value);
    };

    Promise.reject = function (reason) {
        return handlers.reject(new Promise(internalExecutor), reason);
    };

    Promise.all = function (iterable) {
        if (!(iterable instanceof Array)) {
            return Promise.reject(new TypeError("must be an array"));
        }

        var length = iterable.length;
        if (length <= 0) {
            return Promise.resolve([]);
        }

        var called = false;
        var values = [];
        var resolved = 0;
        var promise = new Promise(internalExecutor);

        iterable.forEach(function (value, index) {
            Promise.resolve(value).then(function (outValue) {
                values[index] = outValue;

                if (++resolved === length && !called) {
                    called = true;
                    handlers.resolve(promise, values);
                }
            }, function (error) {
                if (called) {
                    return;
                }

                called = true;
                handlers.reject(promise, error);
            });
        });

        return promise;
    };

    Promise.race = function (iterable) {
        if (!(iterable instanceof Array)) {
            return Promise.reject(new TypeError("must be an array"));
        }

        var length = iterable.length;
        if (length <= 0) {
            return Promise.resolve([]);
        }

        var called = false;
        var promise = new Promise(internalExecutor);

        iterable.forEach(function (value) {
            Promise.resolve(value).then(function (response) {
                if (!called) {
                    called = true;
                    handlers.resolve(promise, response);
                }
            }, function (error) {
                if (!called) {
                    called = true;
                    handlers.reject(promise, error);
                }
            });
        });

        return promise;
    };

    /// Promise job queues

    var scheduleDrain = function () {
        return function () {
            setTimeout(nextTick, 0);
        };
    }();

    var draining = void 0;
    var queue = [];

    // named nextTick for less confusing stack traces
    function nextTick() {
        draining = true;
        var len = queue.length;
        while (len) {
            // the current jobs will be executed
            var oldQueue = queue;

            // make new storage for jobs
            // new jobs can be safely queued
            queue = [];

            // run the current jobs
            oldQueue.forEach(function (job) {
                job();
            });

            // if len > 0, continue the progress
            len = queue.length;
        }

        draining = false;
    }

    function immediate(job) {
        if (queue.push(job) === 1 && !draining) {
            scheduleDrain();
        }
    }

    // export the module
    return Promise;
}(Array, TypeError, setTimeout);