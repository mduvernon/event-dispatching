"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatching = void 0;
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Types_1 = require("../Resources/Types");
const MetadataRegistry_1 = require("../Registry/MetadataRegistry");
const utils_1 = require("../Lib/utils");
/**
 * The EventDispatching
 * - The EventDispatching is a service that dispatches events to registered listeners.
 */
let EventDispatching = class EventDispatching {
    /**
     * The constructor
     */
    constructor(_metadataRegistry) {
        this._metadataRegistry = _metadataRegistry;
        /**
         * The handlers
         *
         * @private
         */
        this._handlers = {};
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    on(event, callback) {
        this.attach(undefined, String(event), callback);
    }
    once(event, callback) {
        this.attach(undefined, String(event), callback, true);
    }
    attach(attachedTo, eventNames, callback, once = false) {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        for (const event of events) {
            if (!this._handlers[String(event)]) {
                this._handlers[String(event)] = [];
            }
            this._handlers[String(event)].push({
                attachedTo,
                callback,
                once
            });
        }
    }
    detach(detachFrom, eventNameOrNamesOrCallback) {
        if (typeof eventNameOrNamesOrCallback === 'function') {
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback || h.attachedTo !== detachFrom);
        }
        else if (typeof eventNameOrNamesOrCallback === 'string') {
            this._filterEventHandlers(eventNameOrNamesOrCallback, h => h.attachedTo !== detachFrom);
        }
        else if (Array.isArray(eventNameOrNamesOrCallback)) {
            for (const event of eventNameOrNamesOrCallback) {
                this._filterEventHandlers(event, h => h.attachedTo !== detachFrom);
            }
        }
        else {
            this._filterHandlers(h => h.attachedTo !== detachFrom);
        }
    }
    remove(eventNameOrNamesOrCallback) {
        if (typeof eventNameOrNamesOrCallback === 'function') {
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback);
        }
        else if (typeof eventNameOrNamesOrCallback === 'string') {
            delete this._handlers[eventNameOrNamesOrCallback];
        }
        else if (Array.isArray(eventNameOrNamesOrCallback)) {
            for (const event of eventNameOrNamesOrCallback) {
                delete this._handlers[String(event)];
            }
        }
    }
    dispatch(eventNames, data) {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        const results = [];
        for (const event of events) {
            const handlers = this._handlers[String(event)] || [];
            for (const handler of [...handlers]) {
                try {
                    const result = handler.callback(data);
                    if (!(0, utils_1.isEmpty)(result)) {
                        results.push(result);
                    }
                }
                catch (e) {
                    console.error(`Error in handler for event '${event}':`, e);
                }
                if (handler.once) {
                    this._handlers[String(event)] = this._handlers[String(event)].filter(h => h !== handler);
                }
            }
            const metaHandlers = this._metadataRegistry.findAllEventsHandlersByEventName(String(event));
            for (const className in metaHandlers) {
                for (const method in metaHandlers[className]) {
                    const fn = metaHandlers[className][method][String(event)];
                    if (typeof fn === 'function') {
                        const result = fn(data);
                        if (!(0, utils_1.isEmpty)(result)) {
                            results.push(result);
                        }
                    }
                }
            }
        }
        return results;
    }
    asyncDispatch(eventNames, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const events = Array.isArray(eventNames) ? eventNames : [eventNames];
            const results = [];
            for (const event of events) {
                const handlers = this._handlers[String(event)] || [];
                for (const handler of [...handlers]) {
                    try {
                        const result = yield handler.callback(data);
                        if (!(0, utils_1.isEmpty)(result)) {
                            results.push(result);
                        }
                    }
                    catch (e) {
                        console.error(`Error in async handler for event '${event}':`, e);
                    }
                    if (handler.once) {
                        this._handlers[String(event)] = this._handlers[String(event)].filter(h => h !== handler);
                    }
                }
                const metaHandlers = this._metadataRegistry.findAllEventsHandlersByEventName(String(event));
                for (const className in metaHandlers) {
                    for (const method in metaHandlers[className]) {
                        const fn = metaHandlers[className][method][String(event)];
                        if (typeof fn === 'function') {
                            const result = yield fn(data);
                            // If the result is not empty, push it to results
                            if (!(0, utils_1.isEmpty)(result)) {
                                results.push(result);
                            }
                        }
                    }
                }
            }
            return results;
        });
    }
    detachAll() {
        this._handlers = {};
    }
    getActiveListeners() {
        const summary = {};
        for (const key in this._handlers) {
            summary[key] = this._handlers[key].length;
        }
        return summary;
    }
    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------
    _filterHandlers(predicate) {
        for (const key in this._handlers) {
            this._handlers[key] = this._handlers[key].filter(predicate);
        }
    }
    _filterEventHandlers(event, predicate) {
        if (!this._handlers[String(event)]) {
            return;
        }
        this._handlers[String(event)] = this._handlers[String(event)].filter(predicate);
    }
};
exports.EventDispatching = EventDispatching;
exports.EventDispatching = EventDispatching = tslib_1.__decorate([
    (0, inversify_1.injectable)(),
    tslib_1.__param(0, (0, inversify_1.inject)(Types_1.TYPES.MetadataRegistry)),
    tslib_1.__metadata("design:paramtypes", [MetadataRegistry_1.MetadataRegistry])
], EventDispatching);
//# sourceMappingURL=EventDispatching.js.map