import { MetadataRegistry } from '../Registry/MetadataRegistry';
/**
 * The EventDispatcher
 * - The EventDispatcher is a service that dispatches events to registered listeners.
 */
export declare class EventDispatcher {
    /**
     * The metadata registry
     *
     * @private
     */
    private _metadataRegistry;
    /**
     * The handlers
     *
     * @private
     */
    private _handlers;
    /**
     * The constructor
     */
    constructor(_metadataRegistry: MetadataRegistry);
    remove(eventName: string): void;
    remove(eventNames: string[]): void;
    remove(callback: (data: any) => void): void;
    detach(detachFrom: any, eventName?: string): void;
    detach(detachFrom: any, eventNames?: string[]): void;
    detach(detachFrom: any, callback?: (data: any) => void): void;
    attach(attachTo: any, eventName: string, callback: (data: any) => void): void;
    attach(attachTo: any, eventNames: string[], callback: (data: any) => void): void;
    on(eventName: string, callback: (data: any) => void): void;
    on(eventNames: string[], callback: (data: any) => void): void;
    dispatch(eventName: string, data?: any): void;
    dispatch(eventNames: string[], data?: any): void;
    asyncDispatch(eventName: string, data?: any): Promise<void>;
    asyncDispatch(eventNames: string[], data?: any): Promise<void>;
}
