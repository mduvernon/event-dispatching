import { injectable, inject } from "inversify";

import { TYPES } from "../Resources/Types";

import { MetadataRegistry } from "../Registry/MetadataRegistry";

import { isEmpty } from "../Lib/utils";

/**
 * Defines the shape of a callback function for an event.
 * Can be synchronous or asynchronous.
 */
type Callback<T = any> = (data: T) => void | Promise<void>;

/**
 * Internal representation of an attached event handler.
 */
interface Handler<T = any> {
    /** The object this handler is attached to (for lifecycle management). */
    attachedTo: any;
    /** The callback function to execute. */
    callback: Callback<T>;
    /** If true, the handler will be removed after one execution. */
    once: boolean;
}

/**
 * A map of event names to their data payload types.
 * This is intended to be extended via declaration merging for type safety.
 *
 * @example
 * declare global {
 *  interface EventMap {
 *      "user:created": { userId: string; name: string };
 *      "system:shutdown": void;
 *  }
 * }
 */
export type EventMap = {
    [eventName: string]: any;
};

/**
 * EventDispatching
 * A service that dispatches events to registered listeners, supporting both
 * dynamically attached listeners and static listeners from a MetadataRegistry.
 */
@injectable()
export class EventDispatching {

    /**
     * Internal storage for all dynamically attached event handlers.
     */
    private _handlers: Record<string, Handler[]> = {};

    /**
     * Constructor
     * 
     * @param _metadataRegistry Optional MetadataRegistry for static event handlers.
     */
    constructor(@inject(TYPES.MetadataRegistry) private readonly _metadataRegistry: MetadataRegistry) { }

    // -------------------------------------------------------------------------
    // Public API: Registering Listeners
    // -------------------------------------------------------------------------

    /**
     * Registers a listener for a given event.
     *
     * @param event The name of the event to listen for.
     * @param callback The function to execute when the event is dispatched.
     */
    public on<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void {
        this.attach(undefined, String(event), callback);
    }

    /**
     * Registers a one-time listener for a given event.
     * The listener will be automatically removed after it is executed once.
     *
     * @param event The name of the event to listen for.
     * @param callback The function to execute when the event is dispatched.
     */
    public once<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void {
        this.attach(undefined, String(event), callback, true);
    }

    /**
     * Attaches a listener, optionally associating it with an "owner" object.
     * This is useful for automatically detaching listeners when an object is destroyed.
     *
     * @param attachedTo An "owner" object to associate the listener with.
     * @param eventNames The event name or array of event names.
     * @param callback The function to execute.
     * @param once If true, the listener will be removed after one execution.
     */
    public attach(
        attachedTo: any,
        eventNames: string | string[],
        callback: Callback,
        once: boolean = false
    ): void {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];

        for (const event of events) {
            const eventKey = String(event);

            if (!this._handlers[eventKey]) {
                this._handlers[eventKey] = [];
            }

            this._handlers[eventKey].push({
                attachedTo,
                callback,
                once
            });
        }
    }

    // -------------------------------------------------------------------------
    // Public API: Removing Listeners
    // -------------------------------------------------------------------------

    /**
     * Detaches listeners associated with a specific "owner" object.
     *
     * @param detachFrom The "owner" object.
     * @param eventNameOrNamesOrCallback
     * - If a callback, removes that specific callback for that owner.
     * - If an event name or array, removes all listeners for that owner and event(s).
     * - If omitted, removes *all* listeners associated with that owner for *all* events.
     */
    public detach(
        detachFrom: any,
        eventNameOrNamesOrCallback?: string | string[] | Callback
    ): void {
        if (typeof eventNameOrNamesOrCallback === "function") {
            // Detach by callback instance
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback || h.attachedTo !== detachFrom);
        } else if (typeof eventNameOrNamesOrCallback === "string") {
            // Detach all for a specific event
            this._filterEventHandlers(eventNameOrNamesOrCallback, h => h.attachedTo !== detachFrom);
        } else if (Array.isArray(eventNameOrNamesOrCallback)) {
            // Detach all for multiple events
            for (const event of eventNameOrNamesOrCallback) {
                this._filterEventHandlers(event, h => h.attachedTo !== detachFrom);
            }
        } else {
            // Detach all for this owner
            this._filterHandlers(h => h.attachedTo !== detachFrom);
        }
    }

    /**
     * Removes listeners globally, regardless of their "owner".
     *
     * @param eventNameOrNamesOrCallback
     * - If a callback, removes that specific callback from *all* events.
     * - If an event name, removes *all* listeners for that event.
     * - If an array of event names, removes *all* listeners for those events.
     */
    public remove(eventNameOrNamesOrCallback: string | string[] | Callback): void {
        if (typeof eventNameOrNamesOrCallback === "function") {
            // Remove by callback instance globally
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback);
        } else if (typeof eventNameOrNamesOrCallback === "string") {
            // Remove all handlers for a specific event
            delete this._handlers[eventNameOrNamesOrCallback];
        } else if (Array.isArray(eventNameOrNamesOrCallback)) {
            // Remove all handlers for multiple events
            for (const event of eventNameOrNamesOrCallback) {
                delete this._handlers[String(event)];
            }
        }
    }

    /**
     * Removes all dynamically attached listeners from the dispatcher.
     */
    public detachAll(): void {
        this._handlers = {};
    }

    // -------------------------------------------------------------------------
    // Public API: Dispatching Events
    // -------------------------------------------------------------------------

    /**
     * Dispatches an event synchronously.
     * Executes all listeners and returns an array of non-empty results.
     *
     * @param eventNames The event name or array of event names to dispatch.
     * @param data The data payload to pass to the listeners.
     * @returns An array of results from listeners that returned a non-empty value.
     */
    public dispatch<K extends keyof EventMap>(
        eventNames: K | K[],
        data?: EventMap[K]
    ): any[] {
        const events = Array.isArray(eventNames) ?
            eventNames :
            [eventNames];

        const allResults: any[] = [];

        for (const event of events) {
            const eventKey = String(event);

            const {
                dynamicHandlers,
                metaCallbacks
            } = this._getHandlersForEvent(eventKey);

            // Execute dynamic handlers
            const dynamicResults = dynamicHandlers?.map(handler =>
                this._executeHandler(handler, data, eventKey)
            );

            // Execute metadata handlers
            const metaResults = metaCallbacks?.map(fn =>
                this._executeMetaHandler(fn, data, eventKey)
            );

            allResults.push(...dynamicResults, ...metaResults);
        }

        // Filter out any empty/undefined results
        return allResults.filter(r => !isEmpty(r));
    }

    /**
     * Dispatches an event asynchronously.
     * Executes all listeners (awaiting promises) and returns an array of non-empty results.
     *
     * @param eventNames The event name or array of event names to dispatch.
     * @param data The data payload to pass to the listeners.
     * @returns A promise that resolves to an array of results from listeners.
     */
    public async asyncDispatch<K extends keyof EventMap>(
        eventNames: K | K[],
        data?: EventMap[K]
    ): Promise<any[]> {
        const events = Array.isArray(eventNames) ?
            eventNames :
            [eventNames];

        const allResults: any[] = [];

        for (const event of events) {
            const eventKey = String(event);

            const {
                dynamicHandlers,
                metaCallbacks
            } = this._getHandlersForEvent(eventKey);

            // Execute dynamic handlers
            const dynamicPromises = dynamicHandlers?.map(handler =>
                this._executeAsyncHandler(handler, data, eventKey)
            );

            // Execute metadata handlers
            const metaPromises = metaCallbacks?.map(fn =>
                this._executeAsyncMetaHandler(fn, data, eventKey)
            );

            // Await all results
            const dynamicResults = await Promise.all(dynamicPromises);
            const metaResults = await Promise.all(metaPromises);

            allResults.push(...dynamicResults, ...metaResults);
        }

        // Filter out any empty/undefined results
        return allResults.filter(r => !isEmpty(r));
    }

    // -------------------------------------------------------------------------
    // Public API: Utilities
    // -------------------------------------------------------------------------

    /**
     * Gets a summary of all active listeners.
     * @returns A record where keys are event names and values are the listener count.
     */
    public getActiveListeners(): Record<string, number> {
        const summary: Record<string, number> = {};

        for (const key in this._handlers) {
            if (this._handlers[key].length > 0) {
                summary[key] = this._handlers[key].length;
            }
        }

        return summary;
    }

    // -------------------------------------------------------------------------
    // Private Helpers: Dispatch Logic
    // -------------------------------------------------------------------------

    /**
     * Gets all dynamic and metadata-based handlers for a given event.
     * @returns A copy of dynamic handlers and a list of metadata callbacks.
     */
    private _getHandlersForEvent(event: string): { dynamicHandlers: Handler[], metaCallbacks: Callback[] } {
        // Get dynamic handlers (create a copy to prevent mutation during iteration)
        const dynamicHandlers = [...(this._handlers[event] || [])];
        const metaCallbacks: Callback[] = [];

        // Safely get handlers from metadata registry, if it exists
        if (this._metadataRegistry) {
            const metaHandlers = this._metadataRegistry.findAllEventsHandlersByEventName(event);

            // Extract the callback functions from the nested metadata structure
            for (const classMethods of Object.values(metaHandlers)) {
                for (const eventMap of Object.values(classMethods)) {

                    const fn = eventMap[event];

                    if (typeof fn === "function") {
                        metaCallbacks.push(fn);
                    }
                }
            }
        }

        return {
            dynamicHandlers,
            metaCallbacks
        };
    }

    /**
     * Safely executes a single dynamic handler synchronously.
     */
    private _executeHandler(handler: Handler, data: any, event: string): any {
        try {
            const result = handler.callback(data);

            if (handler.once) {
                this._removeOnceHandler(event, handler);
            }

            return result;
        } catch (e) {
            console.error(`Error in handler for event "${event}":`, e);

            return undefined;
        }
    }

    /**
     * Safely executes a single metadata handler synchronously.
     */
    private _executeMetaHandler(fn: Callback, data: any, event: string): any {
        try {

            return fn(data);

        } catch (e) {

            console.error(`Error in metadata handler for event "${event}":`, e);

            return undefined;
        }
    }

    /**
     * Safely executes a single dynamic handler asynchronously.
     */
    private async _executeAsyncHandler(handler: Handler, data: any, event: string): Promise<any> {
        try {
            const result = await handler.callback(data);

            if (handler.once) {
                this._removeOnceHandler(event, handler);
            }

            return result;
        } catch (e) {
            console.error(`Error in async handler for event "${event}":`, e);

            return undefined;
        }
    }

    /**
     * Safely executes a single metadata handler asynchronously.
     */
    private async _executeAsyncMetaHandler(fn: Callback, data: any, event: string): Promise<any> {
        try {

            return await fn(data);

        } catch (e) {
            console.error(`Error in async metadata handler for event "${event}":`, e);

            return undefined;
        }
    }

    /**
     * Removes a specific "once" handler from the internal handlers list.
     */
    private _removeOnceHandler(event: string, handler: Handler): void {
        if (!this._handlers[event]) {
            return;
        }

        this._handlers[event] = this._handlers[event].filter(h => h !== handler);
    }

    // -------------------------------------------------------------------------
    // Private Helpers: Filtering
    // -------------------------------------------------------------------------

    /**
     * Filters the handlers list for a *single* event based on a predicate.
     */
    private _filterEventHandlers(event: string, predicate: (handler: Handler) => boolean): void {
        const eventKey = String(event);

        if (!this._handlers[eventKey]) {
            return;
        }

        this._handlers[eventKey] = this._handlers[eventKey].filter(predicate);
    }

    /**
     * Filters the handlers list across *all* events based on a predicate.
     */
    private _filterHandlers(predicate: (handler: Handler) => boolean): void {

        for (const key in this._handlers) {
            this._handlers[key] = this._handlers[key].filter(predicate);

            // Clean up empty event arrays
            if (this._handlers[key].length === 0) {
                delete this._handlers[key];
            }
        }

    }
}
