import { isArray, isIntegerKey } from '@hero-vue3/shared';
import { TriggerOpTypes } from './operations';

let uid = 0;
// 当前正在执行的 effect 函数
let activeEffect: any;
// 保存所有 effect 的栈结构
const effectStack: any[] = [];

function createReactiveEffect(fn, options) {
  // 最终返回 _fn 函数，vue 中使用 effect 时就是执行的 _fn 函数
  const _fn = function reactiveEffect() {
    if (!effectStack.includes(_fn)) {
      // 执行新的 effect 时，将 activeEffect 设置为当前 effect，并将 effect 入栈
      try {
        activeEffect = _fn;
        // 入栈
        effectStack.push(activeEffect);
        fn();
      } finally {
        // 出栈
        // effect 中嵌套 effect 时，内部 effect 执行完毕后，将 activeEffect 恢复为外部 effect
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };

  _fn.id = uid++;
  _fn._isEffect = true;
  _fn.raw = fn; // 保存原始函数
  _fn.options = options; // 保存配置项
  return _fn;
}

/**
 * effect 函数
 * 每调用一次 effect 就会创建一个新的 effectFn
 * effect 中用到的所有响应式对象的属性都会收集(把属性和effectFn关联起来)
 * 当属性发生变化时，会执行属性关联的 effectFn 方法
 */
export function effect(fn, options) {
  const effectFn = createReactiveEffect(fn, options);

  // 默认立即执行一次 fn，fn 中用到的响应式对象属性会收集依赖
  if (!options || !options.lazy) {
    effectFn();
  }

  return effectFn;
}

/**
 * 依赖关系表
 * 每个响应对象都有一个对应的 depsMap
 * depsMap 中保存了属性和 effect 的关系
 * 数据结构：WeakMap(target -> Map(key -> Set(effect)))
 */
const targetMap = new WeakMap();

/**
 * 收集依赖，用于追踪属性的变化
 * 一个属性对应多个 effect
 */
export function track(target, type, key) {
  // 如果没有正在执行的 effect，就不需要收集依赖
  if (!activeEffect) {
    return;
  }

  // 当前target是否存在对应的depsMap，没有就创建一个
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  // 当前key是否存在对应的dep（关联的effect），没有就创建一个
  let dep = depsMap.get(key);
  if (!dep) {
    // 每个属性都有可能对应多个 effect，所以这里使用 Set（用于存储多个不重复的值）
    depsMap.set(key, (dep = new Set()));
  }

  // 如果 dep 中没有当前的 effect，就添加进去
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

/**
 * 触发更新
 */
export function trigger(target, type, key, value?, oldValue?) {
  console.log('触发更新', target, key, targetMap);

  const depsMap = targetMap.get(target);
  console.log('depsMap', depsMap);
  if (!depsMap) {
    return;
  }

  /**
   * 最终要执行的 effect 集合，这里为什么使用 Set 呢？
   * 1. 元素的唯一性：Set 数据结构内的所有元素都是唯一的，没有重复的值，如果add一个已经存在的值，不会有任何效果
   * 2. 性能优化：Set 在查找元素时的时间复杂度是 O(1)，而数组是 O(n)
   */
  const finalEffects = new Set();

  /**
   * effect 集合
   * @param effectsSet Set(effect)
   */
  const add = (effectsSet) => {
    if (effectsSet) {
      effectsSet.forEach((effect) => finalEffects.add(effect));
    }
  };

  /**
   * 特殊情况：
   * 如果修改的是数组的length属性（数组长度改变），则需要触发所有大于新数组长度的依赖
   * 注：数组长度改变了，那么大于数组长度的值都变成了undefined，而小于数组长度的值都不变化，所以不用处理小于数组长度的依赖
   * 此时 depsMap 是 数组(target)的依赖关系表 Map(key -> Set(effect))，key 是数组的索引
   * Map 有forEach方法：Map.forEach((value, key) => {})
   */
  if (isArray(target) && key === 'length') {
    depsMap.forEach((dep, _key) => {
      // 这里的 dep 是 _key 对应的 effect 集合 Set(effect)
      if (_key === 'length' || _key >= value) {
        add(dep);
      }
    });
  } else {
    // 正常添加依赖项effect
    if (key !== undefined) {
      add(depsMap.get(key));
    }

    switch (type) {
      case TriggerOpTypes.ADD:
        // 数组新增的情况，会改变数组的长度，所以需要触发 length 的依赖
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'));
        }
        break;
      case TriggerOpTypes.DELETE:
        // 数组删除的情况，会改变数组的长度，所以需要触发 length 的依赖
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'));
        }
        break;
      default:
        break;
    }
  }

  console.log('finalEffects', finalEffects);
  // 执行 effect
  finalEffects.forEach((effect: any) => effect());
  console.log('执行了 effect');
}
