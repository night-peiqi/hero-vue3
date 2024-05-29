import { hasOwn } from '@hero-vue3/shared';

/**
 * 公共实例代理处理程序
 */
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props, data } = instance;

    if (key[0] === '$') {
      return;
    }

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    } else {
      return data[key];
    }
  },

  set({ _: instance }, key, value) {
    const { setupState, props, data } = instance;

    if (hasOwn(setupState, key)) {
      setupState[key] = value;
    } else if (hasOwn(props, key)) {
      props[key] = value;
    }
  }
};
