/**
 * 为元素添加或移除事件监听器。
 * @param el - 要操作的元素。
 * @param key - 事件属性的键名。
 * @param value - 新的事件监听器。
 * @param prevValue - 先前的事件监听器。
 */
export const patchEvent = (el, key, value, prevValue) => {
  const invokers = el._vei || (el._vei = {});
  const exists = invokers[key];

  if (exists && value) {
    // 如果已经存在相同的事件监听器，则更新它的回调函数
    exists.value = value;
  } else {
    const eventName = key.slice(2).toLowerCase();
    if (value) {
      // 添加事件监听器
      let invoker = (invokers[key] = createInvoker(value));
      el.addEventListener(eventName, invoker);
    } else {
      // 移除事件监听器
      el.removeEventListener(eventName, exists);
      invokers[key] = undefined;
    }
  }
};

/**
 * 创建一个事件调用器。
 * @param value - 事件处理函数
 * @returns 事件调用器函数
 */
function createInvoker(value) {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = value;
  return invoker;
}
