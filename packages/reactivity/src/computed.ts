export function computed(getterOrOptions) {
  // 参数可以是一个函数，也可以是一个对象
  // return new CompotedRefImpl(fn, options);
}

class CompotedRefImpl {
  // constructor(fn, options) {
  //   this._dirty = true;
  //   this._value = undefined;
  //   this._fn = fn;
  //   this._effect = effect(fn, {
  //     lazy: true,
  //     scheduler: () => {
  //       if (!this._dirty) {
  //         this._dirty = true;
  //         trigger(this, TriggerOpTypes.SET, 'value');
  //       }
  //     }
  //   });
  // }
  // get value() {
  //   if (this._dirty) {
  //     this._value = this._fn();
  //     this._dirty = false;
  //   }
  //   track(this, TrackOpTypes.GET, 'value');
  //   return this._value;
  // }
}
