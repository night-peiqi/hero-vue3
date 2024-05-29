import { ShapeFlags, log } from '@herovue3/shared';
import { createAppAPI } from './apiCreateApp';
import { createComponentInstance, setupComponent } from './component';
import { effect } from '@herovue3/reactivity';
import { CVnode, Text } from './vnode';

/**
 * 创建渲染器
 * @param renderOptionDom - 渲染选项DOM
 * @returns 渲染器对象
 */
export function createRenderer(renderOptionDom): any {
  log('/** 执行 createRenderer 创建渲染器 **/', renderOptionDom);
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProps: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText
  } = renderOptionDom;

  // ----------------------------------处理元素----------------------------------
  /**
   * 处理元素节点的 patch
   * @param n1
   * @param n2
   * @param container
   */
  function processElement(n1, n2, container) {
    if (n1 == null) {
      // 初始化元素
      mountElement(n2, container);
    } else {
      // 更新元素
      // updateElement(n1, n2);
    }
  }

  /**
   * 挂载元素
   * @param vnode
   * @param container
   */
  function mountElement(vnode, container) {
    const { type, props, children, shapeFlag } = vnode;
    // 创建元素
    const el = (vnode.el = hostCreateElement(type));
    // 设置属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    // 处理子节点
    if (children) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 处理文本子节点
        hostSetElementText(el, children);
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 处理数组子节点
        mountChildren(el, children);
      }
    }

    // 插入到容器中
    hostInsert(el, container);
  }

  /**
   * 挂载子节点
   * @param el
   * @param children
   */
  function mountChildren(el, children) {
    for (let i = 0; i < children.length; i++) {
      const child = CVnode(children[i]);
      // 递归挂载子节点
      patch(null, child, el);
    }
  }
  // ----------------------------------处理文本----------------------------------
  /**
   * 处理文本节点的 patch
   * @param n1
   * @param n2
   * @param container
   */
  function processText(n1, n2, container) {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    }
  }

  // ----------------------------------处理组件----------------------------------
  /**
   * 处理组件的 patch
   * @param n1
   * @param n2
   * @param container
   */
  function processComponent(n1, n2, container) {
    if (n1 == null) {
      // 初始化组件
      mountComponent(n2, container);
    } else {
      // 更新组件
      // updateComponent(n1, n2, container);
    }
  }

  function mountComponent(initialVNode, container) {
    // 创建组件实例
    const instance = (initialVNode.component = createComponentInstance(initialVNode));
    // 设置组件实例
    setupComponent(instance);

    setupRenderEffect(instance, container);
  }

  function setupRenderEffect(instance, container) {
    /**
     * 创建渲染 effect，在 effect 中执行 render 函数
     * 自动收集依赖，当依赖变化时重新执行 render 函数
     */
    instance.update = effect(function componentEffect() {
      if (!instance.isMounted) {
        const proxy = instance.proxy;
        // 执行 render 函数，返回虚拟dom
        const subTree = instance.render.call(proxy, proxy);
        // 将虚拟dom渲染到页面中
        patch(null, subTree, container);
        instance.isMounted = true;
      } else {
        // 更新组件
        // instance.render = instance.type.render(instance.props, instance.ctx);
        log('/** 更新组件 setupRenderEffect **/');
      }
    });
  }

  /**
   * patch 方法
   * @param n1 旧的 vnode
   * @param n2 新的 vnode
   * @param container render 的容器
   * @returns
   */
  function patch(n1, n2, container) {
    if (n1 === n2) {
      return;
    }
    const { type, shapeFlag } = n2;
    // log('/** 执行 patch **/', type, n2.children);

    switch (type) {
      case Text:
        // 处理文本节点
        processText(n1, n2, container);
        break;

      default:
        /**
         * 位与运算符，判断节点类型(如果 shapeFlag 包含 ShapeFlags.ELEMENT 标志位)
         * 如果 shapeFlag 包含 ShapeFlags.ELEMENT 标志位，则表示是元素节点，例如 div、span 等
         */
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // patch 组件
          processComponent(n1, n2, container);
        }
        break;
    }
  }

  /**
   * 渲染 vnode
   * render 调用 patch
   * patch 调用 process***
   * process*** 调用 mount***
   * mount*** 碰到children, 递归调用 patch，直到碰到文本节点
   * 否则，调用 hostInsert 插入到 container 中
   * @param vnode
   * @param container
   */
  function render(vnode, container) {
    // 调用 patch 方法，将 vnode 渲染到 container 中
    patch(null, vnode, container);
  }

  return {
    createApp: createAppAPI(render)
  };
}
