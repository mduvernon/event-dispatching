"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataRegistry = exports.setMetadataRegistry = exports.registryInitialized$ = void 0;
const rxjs_1 = require("rxjs");
const Types_1 = require("../Resources/Types");
// Registry initialization subject and observable
const registryInitializeSubject = new rxjs_1.BehaviorSubject(false);
const registryInitialized$ = registryInitializeSubject.asObservable();
exports.registryInitialized$ = registryInitialized$;
/**
 * Default action registry is used as singleton and can be used to storage all metadatas.
 */
let _defaultMetadataRegistry = null;
/**
 * Sets a given metadata registry.
 *
 * @param {Container} container
 */
const setMetadataRegistry = (container) => {
    _defaultMetadataRegistry = container.get(Types_1.TYPES.MetadataRegistry);
    registryInitializeSubject.next(true);
};
exports.setMetadataRegistry = setMetadataRegistry;
/**
 * Returns a default metadata registry.
 *
 * @return {MetadataRegistry}
 */
const getMetadataRegistry = () => {
    if (!_defaultMetadataRegistry) {
        throw new Error('MetadataRegistry is not initialized');
    }
    return _defaultMetadataRegistry;
};
exports.getMetadataRegistry = getMetadataRegistry;
//# sourceMappingURL=metadataRegistry.js.map