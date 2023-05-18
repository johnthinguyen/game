"use strict";

var EventStream = function () {
    "use strict";

    var EventStream = Observable.extend({
        ctor: function ctor() {
            this._super(function () {});

            this.subscribers = [];
        },

        next: function next(value) {
            if (this.isClosed) {
                return;
            }

            this.subscribers.forEach(function (subscriber) {
                subscriber.next(value);
            });
        },

        error: function error(_error) {
            if (this.isClosed) {
                return;
            }

            this.isClosed = true;
            this.subscribers.forEach(function (subscriber) {
                subscriber.error(_error);
            });
        },

        complete: function complete() {
            if (this.isClosed) {
                return;
            }

            this.isClosed = true;
            this.subscribers.forEach(function (subscriber) {
                subscriber.complete();
            });
        },

        subscribe: function subscribe(subscriber, error, complete) {
            subscriber = typeof subscriber === "function" ? { next: subscriber, error: error, complete: complete } : subscriber;
            this.subscribers.push(subscriber);
        }
    });

    return EventStream;
}();