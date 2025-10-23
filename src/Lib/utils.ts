

/**
 * Is Empty
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isEmpty = (value: unknown): boolean => (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
)
