import { Container } from 'inversify';
import { Observable } from 'rxjs';
import { MetadataRegistry } from "../Registry/MetadataRegistry";
declare const registryInitialized$: Observable<boolean>;
/**
 * Sets a given metadata registry.
 *
 * @param {Container} container
 */
declare const setMetadataRegistry: (container: Container) => void;
/**
 * Returns a default metadata registry.
 *
 * @return {MetadataRegistry}
 */
declare const getMetadataRegistry: () => MetadataRegistry;
export { registryInitialized$, setMetadataRegistry, getMetadataRegistry, };
