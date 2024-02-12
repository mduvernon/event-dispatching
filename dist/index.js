"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.module = void 0;
const tslib_1 = require("tslib");
const EventDispatcherModule_1 = require("./EventDispatcherModule");
tslib_1.__exportStar(require("./Annotation"), exports);
tslib_1.__exportStar(require("./Interface"), exports);
tslib_1.__exportStar(require("./Lib"), exports);
tslib_1.__exportStar(require("./Registry"), exports);
tslib_1.__exportStar(require("./Resources"), exports);
tslib_1.__exportStar(require("./Service"), exports);
/**
 * @summary Import and call this function to add this module to your API.
 *
 * @param {{container: Container}} app The App {container: Container}
 * @returns {EventDispatcherModule}
 */
function bootstrap(app) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield new EventDispatcherModule_1.EventDispatcherModule().bootstrap(app);
    });
}
exports.default = bootstrap;
/**
 * Import in this way () => await module.bootstrap(<{container:Container}>)
 */
exports.module = { bootstrap };
//# sourceMappingURL=index.js.map