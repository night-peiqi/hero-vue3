import chalk from 'chalk';

export * from './shapeFlags';
/**
 * 判断是不是对象
 * @param value
 * @returns boolean
 */
export const isObject = (value) => typeof value === 'object' && value !== null;

export const extend = Object.assign;

export const isArray = Array.isArray;

export const isFunction = (val) => typeof val === 'function';

export const isString = (val) => typeof val === 'string';

export const isSymbol = (val) => typeof val === 'symbol';

export const isNumber = (val) => typeof val === 'number';

export const isVnode = (val) => val._v_isVNode;

export const groupLog = (msg, ...args) => console.group(chalk.cyan(msg), ...args);
export const log = (msg, ...args) => console.log('\r\n' + chalk.green(msg), ...args);
export const groupEnd = () => console.groupEnd();

const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * 判断对象是否有某个属性
 * @param val
 * @param key
 * @returns
 */
export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val =>
  hasOwnProperty.call(val, key);

/**
 * 判断是不是整数key
 * @param key 比如数组的索引，索引会被 proxy 转换为字符串，需要判断是否是整数字符串
 * @returns
 */
export const isIntegerKey = (key: any) =>
  isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;

export const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
