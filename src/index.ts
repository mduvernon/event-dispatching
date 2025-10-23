import 'reflect-metadata';

import { Container } from 'inversify';

import { EventDispatchingModule } from './EventDispatchingModule';

export * from './Decorator'

export * from './Interface'

export * from './Lib'

export * from './Registry'

export * from './Resources'

export * from './Service'

/**
 * @summary Import and call this function to add this module to your API.
 *
 * @param {{container: Container}} app The App {container: Container}
 * @returns {EventDispatchingModule}
 */
export default function bootstrap(app: { container: Container }): EventDispatchingModule {
    return EventDispatchingModule.getInstance().bootstrap(app)
}

/**
 * Import in this way () => module.bootstrap(<{container:Container}>)
 */
export const module = { bootstrap }
