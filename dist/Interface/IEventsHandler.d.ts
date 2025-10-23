/**
 * IEventsHandler
 */
export interface IEventsHandler {
    /**
     * Event that could be executed. where eventName is the name of the event
     * And props is the props that should be passed to the handler.
     *
     * - Can have Many classes that could be executed for the same event.
     * - Can have many methods that could be executed for the same event.
     */
    [className: string]: {
        [methodName: string]: {
            [eventName: string]: (props: any) => void;
        };
    };
}
