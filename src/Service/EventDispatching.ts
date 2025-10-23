import { injectable, inject } from 'inversify';

import { TYPES } from '../Resources/Types';

import { MetadataRegistry } from '../Registry/MetadataRegistry';
import { isEmpty } from '../Lib/utils';

type Callback<T = any> = (data: T) => void | Promise<void>;

interface Handler<T = any> {
    attachedTo: any;
    callback: Callback<T>;
    once: boolean;
}

type EventMap = {
    [eventName: string]: any;
};

/**
 * The EventDispatching
 * - The EventDispatching is a service that dispatches events to registered listeners.
 */
@injectable()
export class EventDispatching {

    /**
     * The handlers
     *
     * @private
     */
    private _handlers: Record<string, Handler[]> = {};

    /**
     * The constructor
     */
    constructor(
        @inject(TYPES.MetadataRegistry) private readonly _metadataRegistry?: MetadataRegistry
    ) { }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    public on<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void {
        this.attach(undefined, String(event), callback);
    }

    public once<K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): void {
        this.attach(undefined, String(event), callback, true);
    }

    public attach(
        attachedTo: any,
        eventNames: string | string[],
        callback: Callback,
        once: boolean = false
    ): void {
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

    public detach(
        detachFrom: any,
        eventNameOrNamesOrCallback?: string | string[] | Callback
    ): void {
        if (typeof eventNameOrNamesOrCallback === 'function') {
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback || h.attachedTo !== detachFrom);

        } else if (typeof eventNameOrNamesOrCallback === 'string') {
            this._filterEventHandlers(eventNameOrNamesOrCallback, h => h.attachedTo !== detachFrom);

        } else if (Array.isArray(eventNameOrNamesOrCallback)) {
            for (const event of eventNameOrNamesOrCallback) {
                this._filterEventHandlers(event, h => h.attachedTo !== detachFrom);
            }

        } else {
            this._filterHandlers(h => h.attachedTo !== detachFrom);
        }
    }

    public remove(eventNameOrNamesOrCallback: string | string[] | Callback): void {
        if (typeof eventNameOrNamesOrCallback === 'function') {
            this._filterHandlers(h => h.callback !== eventNameOrNamesOrCallback);

        } else if (typeof eventNameOrNamesOrCallback === 'string') {
            delete this._handlers[eventNameOrNamesOrCallback];

        } else if (Array.isArray(eventNameOrNamesOrCallback)) {
            for (const event of eventNameOrNamesOrCallback) {
                delete this._handlers[String(event)];
            }
        }
    }

    public dispatch<K extends keyof EventMap>(eventNames: K | K[], data?: EventMap[K]): any[] {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        const results: any[] = [];

        for (const event of events) {
            const handlers = this._handlers[String(event)] || [];

            for (const handler of [...handlers]) {
                try {
                    const result = handler.callback(data);

                    if (!isEmpty(result)) {
                        results.push(result);
                    }
                } catch (e) {
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

                        if (!isEmpty(result)) {
                            results.push(result);
                        }
                    }
                }
            }
        }

        return results;
    }

    public async asyncDispatch<K extends keyof EventMap>(
        eventNames: K | K[],
        data?: EventMap[K]
    ): Promise<any[]> {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        const results: any[] = [];

        for (const event of events) {
            const handlers = this._handlers[String(event)] || [];

            for (const handler of [...handlers]) {
                try {
                    const result = await handler.callback(data);

                    if (!isEmpty(result)) {
                        results.push(result);
                    }
                } catch (e) {
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
                        const result = await fn(data);

                        // If the result is not empty, push it to results
                        if (!isEmpty(result)) {
                            results.push(result);
                        }
                    }
                }
            }
        }

        return results;
    }

    public detachAll(): void {
        this._handlers = {};
    }

    public getActiveListeners(): Record<string, number> {
        const summary: Record<string, number> = {};

        for (const key in this._handlers) {
            summary[key] = this._handlers[key].length;
        }

        return summary;
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    private _filterHandlers(predicate: (handler: Handler) => boolean): void {
        for (const key in this._handlers) {
            this._handlers[key] = this._handlers[key].filter(predicate);
        }
    }

    private _filterEventHandlers(event: string, predicate: (handler: Handler) => boolean): void {
        if (!this._handlers[String(event)]) {
            return;
        }

        this._handlers[String(event)] = this._handlers[String(event)].filter(predicate);
    }
}
