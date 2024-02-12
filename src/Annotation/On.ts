import { registryInitialized$, getMetadataRegistry } from "../Lib/metadataRegistry";

export function On(eventName: string): Function;
export function On(eventNames: string[]): Function;
export function On(eventNameOrNames: string | string[]): Function {
    return function (object: Object, methodName: string) {
        let eventNames: string[] = [];

        if (eventNameOrNames instanceof Array) {
            eventNames = <string[]>eventNameOrNames;

        } else {
            eventNames = [<string>eventNameOrNames];
        }

        registryInitialized$.subscribe((isInitialized: boolean) => {
            if (!isInitialized) {
                return;
            }

            getMetadataRegistry().addOnMetadata({
                object: object,
                className: object?.constructor?.name,
                methodName: methodName,
                eventNames: eventNames
            });
        });
    };
}
