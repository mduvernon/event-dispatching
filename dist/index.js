"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.module = void 0;
const tslib_1 = require("tslib");
require("reflect-metadata");
const EventDispatchingModule_1 = require("./EventDispatchingModule");
tslib_1.__exportStar(require("./Decorator"), exports);
tslib_1.__exportStar(require("./Interface"), exports);
tslib_1.__exportStar(require("./Lib"), exports);
tslib_1.__exportStar(require("./Registry"), exports);
tslib_1.__exportStar(require("./Resources"), exports);
tslib_1.__exportStar(require("./Service"), exports);
/**
 * @summary Import and call this function to add this module to your API.
 *
 * @param {{container: Container}} app The App {container: Container}
 * @returns {EventDispatchingModule}
 */
function bootstrap(app) {
    return EventDispatchingModule_1.EventDispatchingModule.getInstance().bootstrap(app);
}
exports.default = bootstrap;
/**
 * Import in this way () => module.bootstrap(<{container:Container}>)
 */
exports.module = { bootstrap };
//# sourceMappingURL=index.js.map