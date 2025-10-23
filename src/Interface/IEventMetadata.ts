/**
 * Options for the event decorator.
 * - `authRoles`: An array of roles required to access this event.
 */
export type EventOptions = {
    authRoles?: string[]; // Roles required to access this event
};

/**
 * Metadata for a Socket.IO event handler.
 * - `descriptor`: The method descriptor of the event handler.
 * - `eventName`: The name(s) of the event (without namespace prefix).
 * - `methodName`: The name of the decorated method.
 * - `target`: The controller class prototype.
 * - `options`: Additional options for the event, such as authentication roles.
 */
export interface IEventMetadata {
    className: string
    descriptor?: PropertyDescriptor; // Method descriptor
    eventNames: string[];           // Name of the event (without namespace prefix)
    methodName: string;    // Name of the decorated method
    object: Object;                 // The controller class prototype
    options?: EventOptions;         // Additional options for the event
}