import { EventOptions } from "../Interface";
export declare const DECORATOR_ON_META_KEY: unique symbol;
/**
 * Method decorator to subscribe a method to a specific event.
 *
 * @param {string | string[]} eventNameOrNames The name of the client-side event to listen for (without namespace prefix).
 * @param {EventOptions} [options] Optional event options.
 */
declare function OnFn(eventNameOrNames: string | string[], options?: EventOptions): MethodDecorator;
export declare const on: typeof OnFn;
export declare const On: typeof OnFn;
export {};
