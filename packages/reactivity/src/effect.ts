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
 * @param fn
 * @param options
 * @returns
 */
export function effect(fn, options) {
  const effectFn = createReactiveEffect(fn, options);

  if (!options || !options.lazy) {
    effectFn();
  }

  return effectFn;
}

/**
 * 依赖关系表
 * 每个响应对象都有一个对应的 depsMap
 * depsMap 中保存了属性和 effect 的关系
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

  console.log('targetMap', targetMap);
}
