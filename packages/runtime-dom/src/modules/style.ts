/**
 * 更新元素的样式属性。
 * @param el - 要更新样式的元素。
 * @param prev - 先前的样式属性。
 * @param next - 新的样式属性。
 */
export const patchStyle = (el, prev, next) => {
  const style = el.style;
  if (next == null) {
    el.removeAttribute('style');
  } else {
    // 移除不再需要的样式属性
    if (prev != null) {
      for (const key in prev) {
        if (next[key] == null) {
          style[key] = '';
        }
      }
    }

    // 把新的样式属性应用到元素上
    for (const key in next) {
      style[key] = next[key];
    }
  }
};
