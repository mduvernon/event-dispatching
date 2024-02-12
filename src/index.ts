import { Container } from 'inversify';

import { EventDispatcherModule } from './EventDispatcherModule';

export * from './Annotation'

export * from './Interface'

export * from './Lib'

export * from './Registry'

export * from './Resources'

export * from './Service'

/**
 * @summary Import and call this function to add this module to your API.
 *
 * @param {{container: Container}} app The App {container: Container}
 * @returns {EventDispatcherModule}
 */
export default function bootstrap(app: { container: Container }): EventDispatcherModule {
    return new EventDispatcherModule().bootstrap(app)
}

/**
 * Import in this way module.bootstrap(<{container:Container}>)
 */
export const module = { bootstrap }
