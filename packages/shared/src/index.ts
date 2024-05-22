/**
 * 判断是不是对象
 * @param value
 * @returns boolean
 */
export const isObject = (value) => typeof value === 'object' && value !== null;

export const extend = Object.assign;
