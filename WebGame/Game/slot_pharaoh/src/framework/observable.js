"use strict";

var Observable = function () {
    "use strict";

    var Observable = cc.Class.extend({
        ctor: function ctor(subscriber) {
            this.subscriber = subscriber || function (observer) {
                observer.complete();
            };
        },

        subscribe: function subscribe(observer, error, complete) {
            observer = typeof observer === "function" ? { next: observer, error: error, complete: complete } : observer;

            var _isClosed = false;
            var subscription = {
                isClosed: function isClosed() {
                    return _isClosed;
                },

                next: function next(value) {
                    if (_isClosed) {
                        return;
                    } else {
                        if (typeof observer.next === "function") {
                            observer.next(value);
                        }
                    }
                },

                error: function error(value) {
                    if (_isClosed) {
                        return;
                    } else {
                        _isClosed = true;
                        cleanup();

                        if (typeof observer.error === "function") {
                            observer.error(value);
                        }
                    }
                },

                complete: function complete() {
                    if (_isClosed) {
                        return;
                    } else {
                        _isClosed = true;
                        cleanup();

                        if (typeof observer.complete === "function") {
                            observer.complete();
                        }
                    }
                },

                unsubscribe: function unsubscribe() {
                    _isClosed = true;
                    cleanup();
                }
            };

            var subscriber = this.subscriber;
            var cleaner = subscriber(subscription);

            function cleanup() {
                if (typeof cleaner === "function") {
                    cleaner();

                    cleaner = null;
                }
            }

            return subscription;
        },

        map: function map(project) {
            var _this = this;

            return new Observable(function (observer) {
                _this.subscribe({
                    next: function next(value) {
                        try {
                            observer.next(project(value));
                        } catch (e) {
                            observer.error(e);
                        }
                    },

                    error: function error(value) {
                        observer.error(value);
                    },

                    complete: function complete() {
                        observer.complete();
                    }
                });
            });
        },

        filter: function filter(predecate) {
            var _this2 = this;

            return new Observable(function (observer) {
                _this2.subscribe({
                    next: function next(value) {
                        try {
                            if (predecate(value)) {
                                observer.next(value);
                            }
                        } catch (e) {
                            observer.error(e);
                        }
                    },

                    error: function error(value) {
                        observer.error(value);
                    },

                    complete: function complete() {
                        observer.complete();
                    }
                });
            });
        },

        reduce: function reduce(sum, initialValue) {
            var _this3 = this;

            var isFirst = !initialValue;
            var accumulator = initialValue;

            return new Observable(function (observer) {
                _this3.subscribe({
                    next: function next(value) {
                        try {
                            if (!isFirst) {
                                accumulator = sum(accumulator, value);
                            } else {
                                accumulator = value;
                            }
                        } catch (e) {
                            observer.error(e);
                        }
                    },

                    error: function error(value) {
                        observer.error(value);
                    },

                    complete: function complete() {
                        if (isFirst) {
                            observer.error(new TypeError("Cannot reduce an empty sequence"));
                        } else {
                            observer.next(accumulator);
                            observer.complete();
                        }
                    }
                });
            });
        },

        scan: function scan(sum, initialValue) {
            var _this4 = this;

            var isFirst = !initialValue;
            var accumulator = initialValue;

            return new Observable(function (observer) {
                _this4.subscribe({
                    next: function next(value) {
                        try {
                            if (!isFirst) {
                                accumulator = sum(accumulator, value);
                            } else {
                                accumulator = value;
                            }

                            observer.next(accumulator);
                        } catch (e) {
                            observer.error(e);
                        }
                    },

                    error: function error(value) {
                        observer.error(value);
                    },

                    complete: function complete() {
                        if (isFirst) {
                            observer.error(new TypeError("Cannot reduce an empty sequence"));
                        } else {
                            observer.complete();
                        }
                    }
                });
            });
        },

        concat: function concat() {
            var _this5 = this;

            var sources = Array.from(arguments);

            return new Observable(function (observer) {
                var subscription = void 0;
                var index = 0;

                routine(_this5);
                function routine(observable) {
                    subscription = observable.subscribe({
                        next: function next(value) {
                            observer.next(value);
                        },
                        error: function error(_error) {
                            observer.error(_error);
                        },
                        complete: function complete() {
                            if (index === sources.length) {
                                subscription = null;
                                observer.complete();
                            } else {
                                routine(sources[index++]);
                            }
                        }
                    });
                }

                return function () {
                    if (subscription) {
                        subscription.unsubscribe();
                        subscription = null;
                    }
                };
            });
        },

        takeUntil: function takeUntil(subject) {
            var _this6 = this;

            return new Observable(function (observer) {
                _this6.subscribe({
                    next: function next(value) {
                        if (!subject.isClosed) {
                            observer.next(value);
                        } else {
                            observer.complete();
                        }
                    },

                    error: function error(_error2) {
                        observer.error(_error2);
                    },

                    complete: function complete() {
                        observer.complete();
                    }
                });
            });
        },

        take: function take(count) {
            var _this7 = this;

            return new Observable(function (observer) {
                var current = 0;
                _this7.subscribe({
                    next: function next(value) {
                        if (current < count) {
                            current++;
                            observer.next(value);
                            if (current == count) {
                                observer.complete();
                            }
                        }
                    },

                    error: function error(_error3) {
                        observer.error(_error3);
                    },

                    complete: function complete() {
                        observer.complete();
                    }
                });
            });
        },

        first: function first() {
            return this.take(1);
        }
    });

    Observable.sequence = function () {
        var sources = Array.from(arguments);

        return new Observable(function (observer) {
            var subscription = routine(sources, 0);

            function routine(sources, index) {
                return sources[index].subscribe({
                    next: function next(value) {
                        observer.next(value);
                    },
                    error: function error(_error4) {
                        observer.error(_error4);
                    },
                    complete: function complete() {
                        if (index >= sources.length - 1) {
                            subscription = null;
                            observer.complete();
                        } else {
                            subscription = routine(sources, index + 1);
                        }
                    }
                });
            }

            return function () {
                if (subscription) {
                    subscription.unsubscribe();
                    subscription = null;
                }
            };
        });
    };

    Observable.of = function () {
        var values = Array.from(arguments);

        return new Observable(function (observer) {
            routine(values, 0);
            function routine(values, index) {
                setTimeout(function () {
                    observer.next(values[index]);
                    if (index === values.length - 1) {
                        observer.complete();
                    }

                    routine(values, index + 1);
                }, 10);
            }
        });
    };

    return Observable;
}();