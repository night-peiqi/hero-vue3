import { ShapeFlags } from '@hero-vue3/shared';
import { createAppAPI } from './apiCreateApp';

/**
 * 创建渲染器
 * @param renderOptionDom - 渲染选项DOM
 * @returns 渲染器对象
 */
export function createRenderer(renderOptionDom) {
  const mountComponent = (n2, container) => {};

  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      // 初始化组件
      mountComponent(n2, container);
    } else {
      // 更新组件
      // updateComponent(n1, n2, container);
    }
  };

  /**
   * patch 方法
   * @param n1 旧的 vnode
   * @param n2 新的 vnode
   * @param container render 的容器
   */
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      return;
    }

    const { type, shapeFlag } = n2;
    // 位与运算符，判断节点类型(如果 shapeFlag 包含 ShapeFlags.ELEMENT 标志位，则表示是元素节点)
    if (shapeFlag & ShapeFlags.ELEMENT) {
      // processElement(n1, n2, container);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container);
    }
  };

  // 渲染 vnode
  const render = (vnode, container) => {
    // 调用 patch 方法，将 vnode 渲染到 container 中
    patch(null, vnode, container);
  };

  return {
    createApp: createAppAPI(render)
  };
}
