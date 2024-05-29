import { isFunction } from '@herovue3/shared';
import { effect, track, trigger } from './effect';
import { TrackOpTypes, TriggerOpTypes } from './operations';

/**
 * 参数可以是一个函数，也可以是一个对象
 */
export function computed(getterOrOptions) {
  let getter;
  let setter;

  /**
   * 根据用户的入参，给 getter 和 setter 赋值
   * 1. 入参为函数时，不允许修改值
   * 2. getter 和 setter 最终值都是一个函数
   */
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    // 传入的是一个函数，computed 的值是只读的
    setter = () => {
      console.warn('Write operation failed: computed value is readonly');
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new CompotedRefImpl(getter, setter);
}

class CompotedRefImpl {
  public _dirty = true;
  public _value;
  public effect;
  constructor(getter, public setter) {
    /**
     * 为什么要创建一个 effect
     * 因为要执行 getter 并对 getter 中的用到的响应式对象进行依赖收集
     */
    this.effect = effect(getter, {
      lazy: true, // computed 默认是懒执行，没有访问时不会执行
      scheduler: () => {
        /**
         * 当 computed 依赖的响应式对象发生变化时，会导致 computed 的值发生变化，此时：执行 computed 的 effect
         * 因为 computed 值变化并不会执行 set 方法，所以这里手动触发 computed 的 effect
         * 1. 设置 dirty 为 true
         * 2. 触发 computed 依赖更新
         */
        if (!this._dirty) {
          this._dirty = true;
          // 执行 computed 的 effect
          trigger(this, TriggerOpTypes.SET, 'value');
        }
      }
    });
  }

  /**
   * 访问 computed 的值
   */
  get value() {
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }

    // 收集 computed 的依赖
    track(this, TrackOpTypes.GET, 'value');
    return this._value;
  }

  set value(newValue) {
    this.setter(newValue);
  }
}
