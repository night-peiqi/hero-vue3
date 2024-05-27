/**
 * 更新元素的 class 属性。
 * @param el - 要更新 class 属性的元素。
 * @param value - 新的 class 值。
 */
export const patchClass = (el, value) => {
  if (value == null) {
    value = '';
  }
  el.className = value;
};
