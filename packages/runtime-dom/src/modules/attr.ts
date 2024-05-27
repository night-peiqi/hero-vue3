/**
 * 更新元素的自定义属性
 * @param el 元素
 * @param key 属性名
 * @param value 属性值
 */
export const patchAttr = (el, key, value) => {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};
