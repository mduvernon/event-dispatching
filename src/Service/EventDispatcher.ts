import { injectable, inject } from 'inversify';

import { TYPES } from '../Resources/Types';

import { MetadataRegistry } from '../Registry/MetadataRegistry';

/**
 * The EventDispatcher
 * - The EventDispatcher is a service that dispatches events to registered listeners.
 */
@injectable()
export class EventDispatcher {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    /**
     * The metadata registry
     *
     * @private
     */
    private _metadataRegistry: MetadataRegistry;

    /**
     * The handlers
     *
     * @private
     */
    private _handlers: { [eventName: string]: { attachedTo: any, callback: ((data: any) => void) }[] } = {};

    /**
     * The constructor
     */
    constructor(
        @inject(TYPES.MetadataRegistry) _metadataRegistry: MetadataRegistry,
    ) {
        this._metadataRegistry = _metadataRegistry;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    remove(eventName: string): void;
    remove(eventNames: string[]): void;
    remove(callback: (data: any) => void): void;
    remove(eventNameOrNamesOrCallback: string | string[] | ((data: any) => void)): void {
        if (eventNameOrNamesOrCallback instanceof Array) {
            eventNameOrNamesOrCallback.forEach(eventName => this.remove(eventName));

        } else if (eventNameOrNamesOrCallback instanceof Function) {
            Object.keys(this._handlers).forEach(key => {
                this._handlers[key]
                    .filter(handler => handler.callback === eventNameOrNamesOrCallback)
                    .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1));
            });

        } else if (typeof eventNameOrNamesOrCallback === "string") {
            this._handlers[eventNameOrNamesOrCallback] = [];
        }
    }

    detach(detachFrom: any, eventName?: string): void;
    detach(detachFrom: any, eventNames?: string[]): void;
    detach(detachFrom: any, callback?: (data: any) => void): void;
    detach(detachFrom: any, eventNameOrNamesOrCallback?: string | string[] | ((data: any) => void)): void {
        if (eventNameOrNamesOrCallback instanceof Array) {
            eventNameOrNamesOrCallback.forEach(eventName => this.remove(eventName));

        } else if (eventNameOrNamesOrCallback instanceof Function) {
            Object.keys(this._handlers).forEach(key => {
                this._handlers[key]
                    .filter(handler => handler.callback === eventNameOrNamesOrCallback)
                    .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1));
            });

        } else if (typeof eventNameOrNamesOrCallback === "string") {
            const key = eventNameOrNamesOrCallback;
            this._handlers[key]
                .filter(handler => handler.attachedTo === detachFrom)
                .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1))
        } else {
            Object.keys(this._handlers).forEach(key => {
                this._handlers[key]
                    .filter(handler => handler.attachedTo === detachFrom)
                    .forEach(handler => this._handlers[key].splice(this._handlers[key].indexOf(handler), 1));
            });
        }
    }

    attach(attachTo: any, eventName: string, callback: (data: any) => void): void;
    attach(attachTo: any, eventNames: string[], callback: (data: any) => void): void;
    attach(attachTo: any, eventNameOrNames: string | string[], callback: (data: any) => void) {
        let eventNames: string[] = [];
        if (eventNameOrNames instanceof Array) {
            eventNames = <string[]>eventNameOrNames;
        } else {
            eventNames = [<string>eventNameOrNames];
        }

        eventNames.forEach(eventName => {
            if (!this._handlers[eventName]) {
                this._handlers[eventName] = [];
            }

            this._handlers[eventName].push({ attachedTo: attachTo, callback: callback });
        });
    }

    on(eventName: string, callback: (data: any) => void): void;
    on(eventNames: string[], callback: (data: any) => void): void;
    on(eventNameOrNames: string | string[], callback: (data: any) => void) {
        this.attach(undefined, <any>eventNameOrNames, callback);
    }

    dispatch(eventName: string, data?: any): void;
    dispatch(eventNames: string[], data?: any): void;
    dispatch(eventNameOrNames: string | string[], data?: any): void {
        let eventNames: string[] = [];

        if (eventNameOrNames instanceof Array) {
            eventNames = <string[]>eventNameOrNames;

        } else if (typeof eventNameOrNames === "string") {
            eventNames = [eventNameOrNames];
        }

        eventNames.forEach(eventName => {
            if (this._handlers[eventName]) {
                this._handlers[eventName].forEach(handler => handler.callback(data));
            }

            const eventsHandlers = this._metadataRegistry
                .findAllEventsHandlersByEventName(eventName);

            for (const className in eventsHandlers) {
                const methods = eventsHandlers[className];

                for (const methodName in methods) {
                    const eventHandler: ((data: any) => void) | undefined = methods[methodName][eventName];

                    if (eventHandler) {
                        eventHandler(data);
                    }
                }
            }
        });
    }

    async asyncDispatch(eventName: string, data?: any): Promise<void>;
    async asyncDispatch(eventNames: string[], data?: any): Promise<void>;
    async asyncDispatch(eventNameOrNames: string | string[], data?: any): Promise<void> {
        let eventNames: string[] = [];

        if (eventNameOrNames instanceof Array) {
            eventNames = <string[]>eventNameOrNames;

        } else if (typeof eventNameOrNames === "string") {
            eventNames = [eventNameOrNames];
        }

        await Promise.all(eventNames.map(async eventName => {
            const eventsHandlers = this._metadataRegistry
                .findAllEventsHandlersByEventName(eventName);

            for (const className in eventsHandlers) {
                const methods = eventsHandlers[className];

                for (const methodName in methods) {
                    const eventHandler: ((data: any) => void) | undefined = methods[methodName][eventName];

                    if (eventHandler) {
                        await eventHandler(data);
                    }
                }
            }
        }));
    }
}
