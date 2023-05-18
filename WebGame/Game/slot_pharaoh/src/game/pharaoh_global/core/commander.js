// Universal event emitter
Module.define(function (require) {
    "use strict";

    const LOGTAG = "[SlotPharaoh::Commander]";

    const Commander = cc.Class.extend({
        ctor: function () {
            this.mainSession = new EventEmitter();
            this.sessions = [ this.mainSession ];
        },

        emit: function () {
            let argv    = arguments;
            let emitted = 0;

            let sessionsToEmit = this.sessions.slice();
            sessionsToEmit.forEach(session => {
                if (session && session.emit.apply(session, argv)) {
                    emitted++;
                }
            });
            if (!emitted) {
                cc.log(LOGTAG, "No listener for command: " + argv[0]);
            }

            return emitted;
        },

        on: function (eventName, listener) {
            return this.mainSession.on(eventName, listener);
        },

        off: function (eventName, listener) {
            return this.mainSession.off(eventName, listener);
        },

        once: function (eventName, listener) {
            return this.mainSession.once(eventName, listener);
        },

        // Create command trigger
        createTrigger: function (command) {
            let args = [ command ];
            for (let i = 0, n = arguments.length; i < n; i++) {
                args.push(arguments[i]);
            }

            return this.emit.bind.apply(this.emit.bind(this), args);
        },

        // Create touch event trigger
        createTouchTrigger: function (command, haveEffect) {
            const result = (_, type) => {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    this.emit(command);
                }  
            };

            return result;
        },

        createSession: function () {
            let session = new EventEmitter();

            // Commander
            session.commander = this;

            // like cc.Node.removeFromParent
            session.dispose = () => {
                this.removeSession(session);
            };

            this.sessions.push(session);
            return session;
        },

        removeSession: function (session) {
            let index = this.sessions.indexOf(session);
            if (index > -1 && index < this.sessions.length) {
                this.sessions.splice(index, 1);
            }
        },
    });

    window.Commander = Commander;
    return Commander;
});