import { MetadataRegistry } from "../Registry/MetadataRegistry";
type Callback<T = any> = (data: T) => void | Promise<void>;
type EventMap = {
    [eventName: string]: any;
};
/**
 * The EventDispatching
 * - The EventDispatching is a service that dispatches events to registered listeners.
 */
export declare class EventDispatching {
    private readonly _metadataRegistry?;
    /**
     * The handlers
     *
     * @private
     */
    private _handlers;
    /**
     * The constructor
     */
    constructor(_metadataRegistry?: MetadataRegistry);
    on<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void;
    once<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void;
    attach(attachedTo: any, eventNames: string | string[], callback: Callback, once?: boolean): void;
    detach(detachFrom: any, eventNameOrNamesOrCallback?: string | string[] | Callback): void;
    remove(eventNameOrNamesOrCallback: string | string[] | Callback): void;
    dispatch<K extends keyof EventMap>(eventNames: K | K[], data?: EventMap[K]): any[];
    asyncDispatch<K extends keyof EventMap>(eventNames: K | K[], data?: EventMap[K]): Promise<any[]>;
    detachAll(): void;
    getActiveListeners(): Record<string, number>;
    private _filterHandlers;
    private _filterEventHandlers;
}
export {};
