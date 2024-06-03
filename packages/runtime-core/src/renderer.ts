import { ShapeFlags, log } from '@herovue3/shared';
import { createAppAPI } from './apiCreateApp';
import { createComponentInstance, setupComponent } from './component';
import { effect } from '@herovue3/reactivity';
import { CVnode, Text } from './vnode';
import { patchProps } from 'packages/runtime-dom/src/patchProps';

/**
 * 创建渲染器
 * @param renderOptionDom - 渲染选项DOM
 * @returns 渲染器对象
 */
export function createRenderer(renderOptionDom): any {
  // log('/** 执行 createRenderer 创建渲染器 **/', renderOptionDom);
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
  function processElement(n1, n2, container, anther) {
    if (n1 == null) {
      // 初始化元素
      mountElement(n2, container, anther);
    } else {
      // 更新属性
      patchElement(n1, n2, container, anther);
    }
  }

  /**
   * 同样的元素比对
   * @param n1
   * @param n2
   * @param container
   */
  function patchElement(n1, n2, container, anther) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    patchProps(el, oldProps, newProps);

    patchChildren(n1, n2, el);
  }

  /**
   * 比对子节点
   * @param n1
   * @param n2
   * @param el
   */
  function patchChildren(n1, n2, el) {
    const c1 = n1.children;
    const c2 = n2.children;

    const prevShapeFlag = n1.shapeFlag;
    const newShapeFlag = n2.shapeFlag;

    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新的子节点是文本节点
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        if (c2 !== c1) {
          hostSetElementText(el, c2);
        }
      } else {
        hostSetElementText(el, c2);
      }
    } else {
      // 新的子节点是数组，且旧的子节点是文本节点
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 清空旧的文本节点
        hostSetElementText(el, '');
        // 挂载新的子节点
        mountChildren(el, c2);
      } else {
        // 新旧子节点都是数组，进行 diff 操作
        patchKeyedChildren(c1, c2, el);
      }
    }
  }

  /**
   * vue3 的 diff 算法，“双端比较”
   * 这种算法的基本思想是：同时从新旧两个数组的两端开始比较。如果从两端开始的节点都相同，那么就直接移动到下一个节点。如果不同，那么就尝试从另一端进行比较
   * 这种方法可以有效地处理节点的移动和重排序
   * @param c1 旧子节点
   * @param c2 新子节点
   * @param el 父节点
   */
  function patchKeyedChildren(c1, c2, el) {
    let i = 0;
    let e1 = c1.length - 1; // 旧子节点的结束索引
    let e2 = c2.length - 1; // 新子节点的结束索引

    // 从头部开始比较，直到 i 大于 e1 或 e2
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }

    // 从尾部开始比较，此时 i 已经是从头部开始比较后的索引
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 此时 i 是从头部开始比较后的索引，e1 和 e2 是从尾部开始比较后的索引
    // 新子节点多于旧子节点，挂载新节点
    if (i > e1) {
      // 插入新节点的位置
      const nextPos = e2 + 1;
      const anther = nextPos < c2.length ? c2[nextPos].el : null;

      while (i <= e2) {
        patch(null, c2[i], el, anther);
        i++;
      }
    } else if (i > e2) {
      // 旧子节点多于新子节点，卸载多余的节点
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      // 乱序比对
      let s1 = i;
      let s2 = i;

      const toBePatched = e2 - s2 + 1; // 乱序新节点数量
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0); // 乱序新节点的索引映射
      log('/** newIndexToOldIndexMap **/', newIndexToOldIndexMap);

      // 创建新子节点的 key 与索引的映射
      const keyToNewIndexMap = new Map();

      for (let i = s2; i <= e2; i++) {
        // 遍历新子节点，将 key 与索引对应起来
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      log('/** keyToNewIndexMap **/', keyToNewIndexMap);

      for (let i = s1; i <= e1; i++) {
        const oldChild = c1[i];
        const newIndex = keyToNewIndexMap.get(oldChild.key);
        log('/** oldChild **/', oldChild, newIndex);
        // 旧子节点在新子节点中不存在，则卸载
        if (newIndex === undefined) {
          unmount(oldChild);
        } else {
          // 新乱序节点在老乱序节点中的索引
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          patch(oldChild, c2[newIndex], el);
        }
      }
      log('/** oldChild **/', newIndexToOldIndexMap);

      // 最长递增子序列
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
      log('/** increasingNewIndexSequence **/', increasingNewIndexSequence);

      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anther = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, el, anther);
        } else {
          if (i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, el, anther);
          } else {
            j--;
          }
        }
      }
    }
  }

  /**
   * 获取最长递增子序列
   * @param arr
   * @returns
   */
  function getSequence(arr) {
    let len = arr.length;
    // result 用于保存最长递增子序列的索引
    const result = [0];
    let start;
    let end;
    // p 用于保存每个元素在最长递增子序列 result 中的前一个元素的索引
    let p = arr.slice(0);

    for (let i = 0; i < len; i++) {
      // arrI 用于保存当前元素的值
      const arrI = arr[i];

      if (arrI !== 0) {
        // 获取 result 中的最后一个元素的索引
        const resultLastIndex = result[result.length - 1];

        // 如果当前元素大于 result 中的最后一个元素，那么就将当前元素添加到 result 中
        if (arr[resultLastIndex] < arrI) {
          /**
           * 根据当前索引 i，在 p 中设置对应项的值，这个值等于 i 在 result 中的前一个元素的索引
           * p 中索引 i 在 result 中的前一个元素的索引
           */
          p[i] = resultLastIndex;
          // 将当前元素的索引添加到 result 中
          result.push(i);
          continue;
        } else {
          // 否则，使用二分查找在 result 中找到当前元素应该插入的位置
          start = 0;
          end = result.length - 1;

          while (start < end) {
            const mid = start + (((end - start) / 2) | 0);

            if (arr[result[mid]] < arrI) {
              start = mid + 1;
            } else {
              end = mid;
            }
          }

          // 如果当前元素小于 result 中的元素，那么就更新 result 和 p
          if (arrI < arr[result[start]]) {
            if (start > 0) {
              p[i] = result[start - 1];
            }
            result[start] = i;
          }
        }
      }
    }

    // 从后向前遍历 result，使用 p 来找到最长递增子序列的具体序列
    let len1 = result.length;
    let last = result[len1 - 1];
    while (len1-- > 0) {
      result[len1] = last;
      last = p[last];
    }
    return result;
  }

  /**
   * 更新属性
   * @param el
   * @param oldProps
   * @param newProps
   */
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 遍历新的属性
      for (const key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev !== next) {
          // 新旧值不相同，则更新属性
          hostPatchProp(el, key, prev, next);
        }
      }

      // 遍历旧的属性
      for (const key in oldProps) {
        if (!(key in newProps)) {
          // 旧属性在新属性中不存在，则移除属性
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

  /**
   * 挂载元素
   * @param vnode
   * @param container
   */
  function mountElement(vnode, container, anther) {
    const { type, props, children, shapeFlag } = vnode;
    // 创建元素并保存到 vnode.el
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
    hostInsert(el, container, anther);
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
      // log('/** 初始化组件 processComponent **/', n2);
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
        // log('/** 初始化组件 setupRenderEffect **/', instance);
        const subTree = (instance.subTree = instance.render.call(proxy, proxy));
        // log('/** 初始化组件 setupRenderEffect subTree **/', subTree);
        // 将虚拟dom渲染到页面中
        patch(null, subTree, container);
        instance.isMounted = true;
      } else {
        // 更新组件
        // instance.render = instance.type.render(instance.props, instance.ctx);
        const proxy = instance.proxy;
        const prevSubTree = instance.subTree;
        const nextSubTree = instance.render.call(proxy, proxy);
        instance.subTree = nextSubTree;
        // log('/** 更新组件 setupRenderEffect **/', prevSubTree, nextSubTree);
        patch(prevSubTree, nextSubTree, container);
      }
    });
  }

  function isSameVNodeType(n1, n2) {
    return n1 && n2 && n1.type === n2.type && n1.key === n2.key;
  }

  function unmount(vnode) {
    // log('/** 执行 unmount **/', vnode);
    hostRemove(vnode.el);
  }

  /**
   * patch 方法，递归对比新旧 vnode，同时更新 DOM
   * @param n1 旧的 vnode
   * @param n2 新的 vnode
   * @param container render 的容器
   * @returns
   */
  function patch(n1, n2, container, anther = null) {
    /**
     * n1 存在，且 n1 和 n2 不是相同的节点
     * 则卸载 n1，重新挂载 n2
     */
    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1);
      n1 = null;
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
          processElement(n1, n2, container, anther);
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
