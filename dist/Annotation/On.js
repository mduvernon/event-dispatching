"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.On = void 0;
const metadataRegistry_1 = require("../Lib/metadataRegistry");
function On(eventNameOrNames) {
    return function (object, methodName) {
        let eventNames = [];
        if (eventNameOrNames instanceof Array) {
            eventNames = eventNameOrNames;
        }
        else {
            eventNames = [eventNameOrNames];
        }
        metadataRegistry_1.registryInitialized$.subscribe((isInitialized) => {
            var _a;
            if (!isInitialized) {
                return;
            }
            (0, metadataRegistry_1.getMetadataRegistry)().addOnMetadata({
                object: object,
                className: (_a = object === null || object === void 0 ? void 0 : object.constructor) === null || _a === void 0 ? void 0 : _a.name,
                methodName: methodName,
                eventNames: eventNames
            });
        });
    };
}
exports.On = On;
//# sourceMappingURL=On.js.map