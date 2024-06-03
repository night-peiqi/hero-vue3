import { hasChanged, hasOwn, isArray, isIntegerKey, isObject } from '@herovue3/shared';
import { reactive, readonly } from './reactive';
import { TrackOpTypes, TriggerOpTypes } from './operations';
import { track, trigger } from './effect';

const createGetter = (isReadonly = false, shallow = false) => {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);

    // 如果不是只读的，就收集依赖
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key);
    }

    // 如果是shallow，直接返回
    if (shallow) {
      return res;
    }

    // 如果是对象, 递归代理(vue3的属性代理实在使用到的时候才会进行代理)
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
};

const createSetter = (shallow = false) => {
  return function (target, key, value, receiver) {
    const oldValue = target[key];

    // 判断target上有没有这个key
    // target 为数组时，key为索引，且类型为字符串，需要转换为数字
    const hasKey =
      isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);

    // 设置新值
    const result = Reflect.set(target, key, value, receiver);
    // console.log('hasKey', hasKey);
    // 没有，代表新增，有，代表修改
    if (!hasKey) {
      trigger(target, TriggerOpTypes.ADD, key, value);
    } else {
      if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue);
      }
    }

    return result;
  };
};

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter(true);

export const reactiveHandlers = {
  get,
  set
};

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
};

export const readonlyHandlers = {
  get: readonlyGet,
  set: (target, key, value) => {
    console.log(`set on key ${key} failed: target is readonly.`);
  }
};

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: (target, key, value) => {
    console.log(`set on key ${key} failed: target is readonly.`);
  }
};
