"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubscriber = void 0;
const metadataRegistry_1 = require("../Lib/metadataRegistry");
function EventSubscriber() {
    return function (object) {
        metadataRegistry_1.registryInitialized$.subscribe((isInitialized) => {
            var _a;
            if (!isInitialized) {
                return;
            }
            (0, metadataRegistry_1.getMetadataRegistry)().addSubscriberMetadata({
                object: object,
                className: (_a = object === null || object === void 0 ? void 0 : object.constructor) === null || _a === void 0 ? void 0 : _a.name,
                instance: undefined,
            });
        });
    };
}
exports.EventSubscriber = EventSubscriber;
//# sourceMappingURL=EventSubscriber.js.map