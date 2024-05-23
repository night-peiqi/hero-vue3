import { hasChanged, isArray } from '@hero-vue3/shared';
import { track, trigger } from './effect';
import { TrackOpTypes, TriggerOpTypes } from './operations';

export function ref(target) {
  return createRef(target);
}

export function shallowRef(target) {
  return createRef(target, true);
}

/**
 * 创建一个 ref 对象，不需要响应式
 * @param target
 * @param key
 * @returns ObjectRefImpl
 */
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

export function toRefs(target) {
  const res = isArray(target) ? new Array(target.length) : {};
  for (const key in target) {
    res[key] = toRef(target, key);
  }
  return res;
}

function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow);
}

class RefImpl {
  public __v_isRef = true;
  public _value;
  public _shallow;

  // 下面 public shallow 的写法等同于在构造函数中执行 this.shallow = shallow;
  constructor(public rawValue, public shallow) {
    this._value = rawValue;
  }

  get value() {
    track(this, TrackOpTypes.GET, 'value');
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._value)) {
      this._value = newValue;
      this.rawValue = newValue;
      trigger(this, TriggerOpTypes.SET, 'value', newValue);
    }
  }
}

class ObjectRefImpl {
  public __v_isRef = true;
  public _shallow;

  constructor(public target, public key) {
    this._shallow = false;
  }

  get value() {
    track(this, TrackOpTypes.GET, this.key);
    return this.target[this.key];
  }

  set value(newValue) {
    this.target[this.key] = newValue;
    trigger(this, TriggerOpTypes.SET, this.key, newValue);
  }
}
