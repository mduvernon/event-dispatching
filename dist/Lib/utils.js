"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmpty = void 0;
/**
 * Is Empty
 *
 * @param {unknown} value
 * @returns {boolean}
 */
const isEmpty = (value) => (value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0));
exports.isEmpty = isEmpty;
//# sourceMappingURL=utils.js.map