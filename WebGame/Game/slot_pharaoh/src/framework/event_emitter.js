'use strict';

/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
/*global define:false, require:false, exports:false, module:false, signals:false */

/**
 * Event emitter
 * @docs https://nodejs.org/dist/latest-v10.x/docs/api/events.html#events_emitter_addlistener_eventname_listener
 */

var EventEmitter = function () {
    // EventSignalBinding -------------------------------------------------
    //================================================================

    /**
     * Object that represents a binding between a EventSignal and a listener function.
     * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
     * <br />- inspired by Joa Ebert AS3 EventSignalBinding and Robert Penner's Slot classes.
     * @constructor
     * @internal
     * @name EventSignalBinding
     * @param {EventSignal} signal Reference to EventSignal object that listener is currently bound to.
     * @param {Function} listener Handler function bound to the signal.
     * @param {boolean} isOnce If binding should be executed just once.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. (default = 0).
     */
    function EventSignalBinding(signal, listener, isOnce, listenerContext, priority) {

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        this._listener = listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        this._isOnce = isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf EventSignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        this.context = listenerContext;

        /**
         * Reference to EventSignal object that listener is currently bound to.
         * @type EventSignal
         * @private
         */
        this._signal = signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        this._priority = priority || 0;
    }

    EventSignalBinding.prototype = {
        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active: true,

        /**
         * Default parameters passed to listener during `EventSignal.dispatch` and `EventSignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params: null,

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `EventSignal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute: function execute(paramsArr) {
            var handlerReturn = void 0,
                params = void 0;
            if (this.active && !!this._listener) {
                params = this.params ? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        },

        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach: function detach() {
            return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
        },

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound: function isBound() {
            return !!this._signal && !!this._listener;
        },

        /**
         * @return {boolean} If EventSignalBinding will only be executed once.
         */
        isOnce: function isOnce() {
            return this._isOnce;
        },

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener: function getListener() {
            return this._listener;
        },

        /**
         * @return {EventSignal} EventSignal that listener is currently bound to.
         */
        getSignal: function getSignal() {
            return this._signal;
        },

        /**
         * Delete instance properties
         * @private
         */
        _destroy: function _destroy() {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString: function toString() {
            return '[EventSignalBinding isOnce:' + this._isOnce + ', isBound:' + this.isBound() + ', active:' + this.active + ']';
        }

    };
    /*global EventSignalBinding:false*/

    // EventSignal --------------------------------------------------------
    //================================================================

    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error('listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
        }
    }

    /**
     * Custom event broadcaster
     * <br />- inspired by Robert Penner's AS3 Signals.
     * @name EventSignal
     * @constructor
     */
    function EventSignal() {
        /**
         * @type Array.<EventSignalBinding>
         * @private
         */
        this._bindings = [];
        this._prevParams = null;

        // enforce dispatch to aways work on same context (#47)
        var self = this;
        this.dispatch = function () {
            EventSignal.prototype.dispatch.apply(self, arguments);
        };
    }

    EventSignal.prototype = {
        /**
         * If EventSignal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if EventSignal was
         * already dispatched before.
         * @type boolean
         */
        memorize: false,

        /**
         * @type boolean
         * @private
         */
        _shouldPropagate: true,

        /**
         * If EventSignal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active: true,

        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {EventSignalBinding}
         * @private
         */
        _registerListener: function _registerListener(listener, isOnce, listenerContext, priority) {

            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding = void 0;

            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
                }
            } else {
                binding = new EventSignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }

            if (this.memorize && this._prevParams) {
                binding.execute(this._prevParams);
            }

            return binding;
        },

        /**
         * @param {EventSignalBinding} binding
         * @private
         */
        _addBinding: function _addBinding(binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do {
                --n;
            } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },

        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener: function _indexOfListener(listener, context) {
            var n = this._bindings.length,
                cur = void 0;
            while (n--) {
                cur = this._bindings[n];
                if (cur._listener === listener && cur.context === context) {
                    return n;
                }
            }
            return -1;
        },

        /**
         * Check if listener was attached to EventSignal.
         * @param {Function} listener
         * @param {Object} [context]
         * @return {boolean} if EventSignal has the specified listener.
         */
        has: function has(listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        },

        /**
         * Add a listener to the signal.
         * @param {Function} listener EventSignal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {EventSignalBinding} An Object representing the binding between the EventSignal and listener.
         */
        add: function add(listener, listenerContext, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        },

        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener EventSignal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {EventSignalBinding} An Object representing the binding between the EventSignal and listener.
         */
        addOnce: function addOnce(listener, listenerContext, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        },

        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove: function remove(listener, context) {
            validateListener(listener, 'remove');

            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a EventSignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },

        /**
         * Remove all listeners from the EventSignal.
         */
        removeAll: function removeAll() {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },

        /**
         * @return {number} Number of listeners attached to the EventSignal.
         */
        getNumListeners: function getNumListeners() {
            return this._bindings.length;
        },

        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see EventSignal.prototype.disable
         */
        halt: function halt() {
            this._shouldPropagate = false;
        },

        /**
         * Dispatch/Broadcast EventSignal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch: function dispatch(params) {
            if (!this.active) {
                return;
            }

            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings = void 0;

            if (this.memorize) {
                this._prevParams = paramsArr;
            }

            if (!n) {
                //should come after memorize
                return;
            }

            bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do {
                n--;
            } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },

        /**
         * Forget memorized arguments.
         * @see EventSignal.memorize
         */
        forget: function forget() {
            this._prevParams = null;
        },

        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy EventSignal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose: function dispose() {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString: function toString() {
            return '[EventSignal active:' + this.active + ' numListeners:' + this.getNumListeners() + ']';
        }
    };

    var EventEmitter = cc.Class.extend({
        ctor: function ctor() {
            //this.eventListeners         = [];
            this.__eventSignals = {};

            // Make sure emit is always call with this object
            this.emit = this.emit.bind(this);
        },

        /**
         * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
         * Returns true if the event had listeners, false otherwise.
         * @param {<string> | <symbol>} eventName
         * @param  {...any} args
         * @return {<boolean>}
         */
        emit: function emit(eventName) {
            if (this.__eventSignals && this.__eventSignals[eventName]) {
                var args = Array.prototype.slice.call(arguments, 1);
                var signal = this.__eventSignals[eventName];

                signal.dispatch.apply(this, args);

                return true;
            } else {
                return false;
            }
        },

        /**
         * Adds the listener function to the end of the listeners array for the event named eventName.
         * No checks are made to see if the listener has already been added.
         * Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
         * @param {<string> | <symbol>} eventName The name of the event.
         * @param {<Function>} listener The callback function
         * @return {<EventEmitter>}
         */
        on: function on(eventName, listener) {
            this.__eventSignals = this.__eventSignals || {};

            var signal = this.__eventSignals[eventName];
            if (!signal) {
                signal = new EventSignal();
                this.__eventSignals[eventName] = signal;
            }

            signal.add(listener);

            this.emit('newListener', eventName, listener);

            return this;
        },

        /**
         * Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.
         * @param {<string> | <symbol>} eventName The name of the event.
         * @param {<Function>} listener The callback function
         * @return {<EventEmitter>}
         */
        once: function once(eventName, listener) {
            this.__eventSignals = this.__eventSignals || {};

            var signal = this.__eventSignals[eventName];
            if (!signal) {
                signal = new EventSignal();
                this.__eventSignals[eventName] = signal;
            }

            signal.addOnce(listener);

            this.emit('newListener', eventName, listener);

            return this;
        },

        /**
         * Removes the specified listener from the listener array for the event named eventName.
         * @param {<string> | <symbol>} eventName
         * @param {<Function>} listener
         * @return {<EventEmitter>}
         */
        off: function off(eventName, listener) {
            this.__eventSignals = this.__eventSignals || {};

            var signal = this.__eventSignals[eventName];
            if (signal) {
                signal = new EventSignal();
                this.__eventSignals[eventName] = signal;

                signal.remove(listener);

                this.emit('removeListener', eventName, listener);
            }

            return this;
        },

        /**
         * Adds the listener function to the end of the listeners array for the event named eventName.
         * No checks are made to see if the listener has already been added.
         * Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
         * @note Alias for emitter.on(eventName, listener)
         * @param {<string> | <symbol>} eventName The name of the event.
         * @param {<Function>} listener The callback function
         * @return {<EventEmitter>}
         */
        addListener: function addListener(eventName, listener) {
            return this.on(eventName, listener);
        },

        /**
         * Removes the specified listener from the listener array for the event named eventName.
         * @note Alias for emitter.off(eventName, listener)
         * @param {<string> | <symbol>} eventName
         * @param {<Function>} listener
         * @return {<EventEmitter>}
         */
        removeListener: function removeListener(eventName, listener) {
            return this.off(eventName, listener);
        },

        /**
         * Removes all listeners, or those of the specified eventName.
         * Note that it is bad practice to remove listeners added elsewhere in the code, particularly when the EventEmitter instance was created by some other component or module (e.g. sockets or file streams).
         * Returns a reference to the EventEmitter, so that calls can be chained.
         * @param {<string> | <symbol>} eventName
         * @return {<EventEmitter>}
         */
        removeAllListeners: function removeAllListeners(eventName) {
            if (this.__eventSignals) {
                if (typeof eventName === "string") {
                    this.__eventSignals[eventName] = undefined;
                } else {
                    this.__eventSignals = {};
                }
            }
        },

        /**
         * @return {string} String representation of the object.
         */
        toString: function toString() {
            return '[EventEmitter]';
        }
    });

    /**
     * Make object become an event emitter
     */
    EventEmitter.define = function (object) {
        ///return Object.assign(object, new EventEmitter());
        cc.log("EventEmitter", "Warning: Not implement yet.");
    };

    //cc.log("EventEmitter", "%j", EventEmitter.define({ "hihi": "haha" }));

    return EventEmitter;
}();