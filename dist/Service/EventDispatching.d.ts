import { MetadataRegistry } from "../Registry/MetadataRegistry";
/**
 * Defines the shape of a callback function for an event.
 * Can be synchronous or asynchronous.
 */
type Callback<T = any> = (data: T) => void | Promise<void>;
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
export declare class EventDispatching {
    private readonly _metadataRegistry;
    /**
     * Internal storage for all dynamically attached event handlers.
     */
    private _handlers;
    /**
     * Constructor
     *
     * @param _metadataRegistry Optional MetadataRegistry for static event handlers.
     */
    constructor(_metadataRegistry: MetadataRegistry);
    /**
     * Registers a listener for a given event.
     *
     * @param event The name of the event to listen for.
     * @param callback The function to execute when the event is dispatched.
     */
    on<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void;
    /**
     * Registers a one-time listener for a given event.
     * The listener will be automatically removed after it is executed once.
     *
     * @param event The name of the event to listen for.
     * @param callback The function to execute when the event is dispatched.
     */
    once<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void;
    /**
     * Attaches a listener, optionally associating it with an "owner" object.
     * This is useful for automatically detaching listeners when an object is destroyed.
     *
     * @param attachedTo An "owner" object to associate the listener with.
     * @param eventNames The event name or array of event names.
     * @param callback The function to execute.
     * @param once If true, the listener will be removed after one execution.
     */
    attach(attachedTo: any, eventNames: string | string[], callback: Callback, once?: boolean): void;
    /**
     * Detaches listeners associated with a specific "owner" object.
     *
     * @param detachFrom The "owner" object.
     * @param eventNameOrNamesOrCallback
     * - If a callback, removes that specific callback for that owner.
     * - If an event name or array, removes all listeners for that owner and event(s).
     * - If omitted, removes *all* listeners associated with that owner for *all* events.
     */
    detach(detachFrom: any, eventNameOrNamesOrCallback?: string | string[] | Callback): void;
    /**
     * Removes listeners globally, regardless of their "owner".
     *
     * @param eventNameOrNamesOrCallback
     * - If a callback, removes that specific callback from *all* events.
     * - If an event name, removes *all* listeners for that event.
     * - If an array of event names, removes *all* listeners for those events.
     */
    remove(eventNameOrNamesOrCallback: string | string[] | Callback): void;
    /**
     * Removes all dynamically attached listeners from the dispatcher.
     */
    detachAll(): void;
    /**
     * Dispatches an event synchronously.
     * Executes all listeners and returns an array of non-empty results.
     *
     * @param eventNames The event name or array of event names to dispatch.
     * @param data The data payload to pass to the listeners.
     * @returns An array of results from listeners that returned a non-empty value.
     */
    dispatch<K extends keyof EventMap>(eventNames: K | K[], data?: EventMap[K]): any[];
    /**
     * Dispatches an event asynchronously.
     * Executes all listeners (awaiting promises) and returns an array of non-empty results.
     *
     * @param eventNames The event name or array of event names to dispatch.
     * @param data The data payload to pass to the listeners.
     * @returns A promise that resolves to an array of results from listeners.
     */
    asyncDispatch<K extends keyof EventMap>(eventNames: K | K[], data?: EventMap[K]): Promise<any[]>;
    /**
     * Gets a summary of all active listeners.
     * @returns A record where keys are event names and values are the listener count.
     */
    getActiveListeners(): Record<string, number>;
    /**
     * Gets all dynamic and metadata-based handlers for a given event.
     * @returns A copy of dynamic handlers and a list of metadata callbacks.
     */
    private _getHandlersForEvent;
    /**
     * Safely executes a single dynamic handler synchronously.
     */
    private _executeHandler;
    /**
     * Safely executes a single metadata handler synchronously.
     */
    private _executeMetaHandler;
    /**
     * Safely executes a single dynamic handler asynchronously.
     */
    private _executeAsyncHandler;
    /**
     * Safely executes a single metadata handler asynchronously.
     */
    private _executeAsyncMetaHandler;
    /**
     * Removes a specific "once" handler from the internal handlers list.
     */
    private _removeOnceHandler;
    /**
     * Filters the handlers list for a *single* event based on a predicate.
     */
    private _filterEventHandlers;
    /**
     * Filters the handlers list across *all* events based on a predicate.
     */
    private _filterHandlers;
}
export {};
