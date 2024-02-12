import { Container } from 'inversify';
import { Observable, BehaviorSubject } from 'rxjs';

import { TYPES } from '../Resources/Types';

import { MetadataRegistry } from "../Registry/MetadataRegistry";

// Registry initialization subject and observable
const registryInitializeSubject = new BehaviorSubject<boolean>(false);
const registryInitialized$: Observable<boolean> = registryInitializeSubject.asObservable();

/**
 * Default action registry is used as singleton and can be used to storage all metadatas.
 */
let _defaultMetadataRegistry: MetadataRegistry = null;

/**
 * Sets a given metadata registry.
 *
 * @param {Container} container
 */
const setMetadataRegistry = (container: Container) => {
    _defaultMetadataRegistry = container.get<MetadataRegistry>(TYPES.MetadataRegistry);

    registryInitializeSubject.next(true);
}

/**
 * Returns a default metadata registry.
 *
 * @return {MetadataRegistry}
 */
const getMetadataRegistry = (): MetadataRegistry => {
    if (!_defaultMetadataRegistry) {
        throw new Error('MetadataRegistry is not initialized');
    }

    return _defaultMetadataRegistry;
}

export {
    registryInitialized$,
    setMetadataRegistry,
    getMetadataRegistry,
}
