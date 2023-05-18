"use strict";

/**
 * State of finite state machine
 * @reference https://gameprogrammingpatterns.com/state.html
 */

var State = function (EventEmitter, cc) {
    var State = cc.Class.extend({
        ctor: function ctor() {},

        update: function update(dt) {
            return State.EXIT;
        },

        onEnter: function onEnter() {},

        onExit: function onExit() {},

        onPause: function onPause() {},

        onResume: function onResume() {}
    });

    // Instructions
    State.EXIT = 1;
    State.PAUSE = 2;
    State.CONTINUE = 3;

    // Transition instruction
    State.Transition = State.extend({
        ctor: function ctor(oldState, newState) {
            this._super();

            this.oldState = oldState;
            this.newState = newState;
        },

        update: function update(dt) {
            this._super(dt);

            if (this.oldState) {
                this.oldState.onExit();
            }

            return this.newState || State.EXIT;
        }
    });

    // Wait instruction
    State.DelayState = State.extend({});

    /**
     * WaitForState to complete then resume current state
     */
    State.WaitForState = State.DelayState.extend({
        ctor: function ctor(state) {
            this._super();

            this.state = state;
        }
    });

    /**
     *  Like WaitForSeconds in Unity
     */
    State.WaitForSeconds = State.DelayState.extend({
        ctor: function ctor(seconds, nextState) {
            this._super();

            this.seconds = seconds;
            this.nextState = nextState;
        },

        update: function update(dt) {
            this._super(dt);

            this.seconds -= dt;
            if (this.seconds <= 0) {
                if (this.nextState) {
                    this.stateMachine.overrideTopState(this.nextState);
                }
                return State.EXIT;
            } else {
                return State.CONTINUE;
            }
        }
    });

    /**
     * Sequence of states, like cc.Sequence
     */
    State.Sequence = State.extend({
        states: null,
        ctor: function ctor(states) {
            this._super();

            this.states = states;
            this.stateIndex = 0;
        },

        update: function update(dt) {
            this._super(dt);

            if (this.stateIndex < this.states.length) {
                return new State.WaitForState(this.states[this.stateIndex++]);
            } else {
                return State.EXIT;
            }
        }
    });

    // Export module
    return State;
}(EventEmitter, cc);

/**
 * Finite state machine
 * @reference https://gameprogrammingpatterns.com/state.html
 */
var StateMachine = function (EventEmitter, State, cc) {
    var LOGTAG = "[StateMachine]";
    var SCHEDULE_KEY = "__statemachine__";

    var EVENT_START = "start";
    var EVENT_STOP = "stop";
    var EVENT_CHANGE_STATE = "changeState";
    var EVENT_PAUSE = "pause";
    var EVENT_RESUME = "resume";

    var StateMachine = EventEmitter.extend({
        ctor: function ctor() {
            this._super();

            this.states = []; // State[]
            this.nextState = null; // State
            this.currentState = null; // State

            this.isRunning = false; // boolean
            this.deltaTime = 0.0; // number
            this.totalTime = 0.0; // number
            this.scheduler = cc.director.getScheduler();
        },

        setup: function setup(states) {
            this.states = states || [];
        },

        /**
         * Cleanup current state, next state, and state stack
         */
        clearStates: function clearStates() {
            this.nextState = null;
            this.currentState = null;
            this.states = [];
        },

        /**
         * Start the state machine schedule
         */
        start: function start(startState, scheduleTarget) {
            var schedulePriority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : cc.Scheduler.PRIORITY_SYSTEM + 1;

            if (startState instanceof State) {
                this.nextState = startState;

                if (scheduleTarget instanceof cc.Node) {
                    this.scheduleTarget = scheduleTarget;
                    this.scheduleTarget.schedule(this.update.bind(this), SCHEDULE_KEY);
                } else {
                    this.scheduler.scheduleUpdateForTarget(this, schedulePriority, false);
                }

                // Raise event
                this.emit(EVENT_START);

                // Done
                return this.started = true;
            }

            return false;
        },

        /**
         * Stop the state machine schedule
         */
        stop: function stop() {
            if (this.started) {
                this.stopping = true;
            }
        },

        /**
         * Check if the state machine have complete, mean there is no state is running
         * @return true if the current state machine have complete, false otherwise
         */
        isComplete: function isComplete() {
            return !this.currentState && !this.nextState;
        },

        /**
         * Progress of the state machine, call by scheduler
         * @param {number} dt 
         */
        update: function update(dt) {
            this.deltaTime = dt;
            this.totalTime = this.totalTime + dt;

            // Handle stop command from user
            if (this.stopping) {
                this.started = false;
                this.stopping = false;
                if (this.currentState) {
                    this.currentState.onExit();
                }

                this.nextState = null;
                this.currentState = null;

                if (this.scheduleTarget) {
                    this.scheduleTarget.unschedule(SCHEDULE_KEY);
                    this.scheduleTarget = null;
                } else {
                    this.scheduler.unscheduleUpdateForTarget(this);
                }

                // Raise event
                this.emit(EVENT_STOP);

                // Skip current frame
                return;
            }

            // Change state
            if (this.nextState) {
                if (this.currentState) {
                    if (!this.nextState.started && this.nextState instanceof State.DelayState) {
                        if (this.nextState instanceof State.WaitForState) {
                            this.nextState = this.nextState.state;
                        }

                        this.pushState();
                    } else {
                        this.currentState.onExit();
                    }
                }

                // Cache hot variable
                var newState = this.nextState;
                var oldState = this.currentState;

                // Move next state, and destroy current state
                this.currentState = newState;
                this.nextState = null;

                if (newState.started) {
                    newState.onResume();
                } else {
                    newState.stateMachine = this;
                    newState.started = true;
                    newState.onEnter();
                }

                // Success change state
                this.emit(EVENT_CHANGE_STATE, newState, oldState);

                // Skip current frame
                return;
            }

            // Update common routine of state
            if (this.currentState) {
                var output = this.currentState.update(dt) || State.CONTINUE;

                // Handling output
                if (output instanceof State) {
                    this.nextState = output;
                } else {
                    // Handle instruction
                    switch (output) {
                        case State.EXIT:
                            this.popState();
                            break;

                        case State.PAUSE:
                            this.pause();
                            break;

                        case State.CONTINUE:
                        default:
                            break;
                    }
                }

                // Skip current frame
                return;
            }

            // Stop state if have complete
            // if (this.isComplete())
            // {
            //     this.stop();
            // }
        },

        /**
         * Override the top state of the stack
         * @param {State} state 
         */
        overrideTopState: function overrideTopState(state) {
            if (this.states.length > 0) {
                var oldState = this.states[this.states.length - 1];
                this.states[this.states.length - 1] = new State.Transition(oldState, state);
            } else {
                this.pushState(state);
            }
        },

        /**
         * Push the current state to stack
         * @internal
         */
        pushState: function pushState() {
            this.currentState.onPause();
            this.states.push(this.currentState);
        },

        /**
         * Get the saved state from the stack
         * @internal
         */
        popState: function popState() {
            if (this.states.length > 0) {
                return this.nextState = this.states.pop();
            } else {
                this.currentState.onExit();
                this.currentState = null;
                return null;
            }
        },

        /**
         * Replace the current state with given state
         * @param {State} state 
         */
        replaceState: function replaceState(state) {
            //cc.log(LOGTAG, "DEPRECATED: cannot replace state, should return state in update function instead.");

            if (state instanceof State) {
                this.nextState = state;
            }
        },

        /**
         * Pause the state machine schedule
         */
        pause: function pause() {
            if (this.started) {
                if (this.scheduleTarget) {
                    this.scheduleTarget.unschedule(SCHEDULE_KEY);
                } else {
                    this.scheduler.pauseTarget(this);
                }

                this.emit(EVENT_PAUSE);
            }
        },

        /**
         * Resume the state machine schedule
         */
        resume: function resume() {
            if (this.started) {
                if (this.scheduleTarget) {
                    this.scheduleTarget.schedule(this.update.bind(this), SCHEDULE_KEY);
                } else {
                    this.scheduler.resumeTarget(this);
                }

                this.emit(EVENT_RESUME);
            }
        }
    });

    // Export constants
    StateMachine.LOGTAG = LOGTAG;
    StateMachine.EVENT_START = EVENT_START;
    StateMachine.EVENT_STOP = EVENT_STOP;
    StateMachine.EVENT_CHANGE_STATE = EVENT_CHANGE_STATE;
    StateMachine.EVENT_PAUSE = EVENT_PAUSE;
    StateMachine.EVENT_RESUME = EVENT_RESUME;

    // Export module
    return StateMachine;
}(EventEmitter, State, cc);