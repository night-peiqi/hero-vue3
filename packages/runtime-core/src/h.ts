import { isObject, isVnode } from '@hero-vue3/shared';
import { createVnode } from './vnode';

/**
 * 根据参数创建虚拟节点
 * @param type
 * @param propsOrChildren
 * @param children
 * @returns vnode
 */
export function h(type, propsOrChildren: any, children) {
  const argsLen = arguments.length;

  if (argsLen === 2) {
    // 如果 propsOrChildren 是对象
    if (isObject(propsOrChildren)) {
      /**
       * 处理这种写法：h('div', h('span'))
       * propsOrChildren 是虚拟节点，作为子节点
       */
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren]);
      }

      // 处理这种写法：h('div', { id: 'app' })，propsOrChildren 是属性对象，没有子节点
      return createVnode(type, propsOrChildren);
    } else {
      // 处理这种写法：h('div', 'hello world')，propsOrChildren 是文本节点
      return createVnode(type, null, propsOrChildren);
    }
  } else {
    // 处理这种写法：h('div', { id: 'app' }, '文本节点', '文本节点', ...)，除了前两个参数外，其他都是子节点
    if (argsLen > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (argsLen === 3 && isVnode(children)) {
      // 处理这种写法：h('div', { id: 'app' }, h('span'))，propsOrChildren 是属性对象，children 是虚拟节点
      children = [children];
    }

    return createVnode(type, propsOrChildren, children);
  }
}
