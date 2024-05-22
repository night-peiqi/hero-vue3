import { isObject } from '@hero-vue3/shared';
import { reactive, readonly } from './reactive';
import { TrackOpTypes } from './operations';
import { track } from './effect';

const createGetter = (isReadonly = false, shallow = false) => {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);

    // TODO 如果不是只读的，就收集依赖
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
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    // TODO 触发更新
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
