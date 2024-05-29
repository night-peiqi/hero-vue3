import { ShapeFlags, isObject, isString, log } from '@herovue3/shared';

interface IComponentType {
  setup: Function;
  render: Function;
}

/**
 * 创建虚拟节点
 * @param type - 节点类型：'div' | 'span' | IComponentType;
 * @param props - 节点属性
 * @param children - 子节点
 * @returns
 */
export function createVnode(type: any, props, children: any = null) {
  log('/** 执行 createVnode **/', type, props, children);
  // 判断是组件还是普通标签
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;

  const vnode = {
    _v_isVnode: true, // 标识是虚拟节点
    type, // 节点类型，如 div、span、组件（有个对象，包含组件的属性，例如：data、methods）等
    props,
    children,
    key: props && props.key,
    el: null, // 真实节点
    component: {},
    shapeFlag // 节点类型的位掩码
  };

  // 根据子节点类型设置 shapeFlag
  normalizeChildren(vnode, children);

  return vnode;
}

/**
 * 根据当前节点的子节点设置当前节点的 shapeFlag
 * @param vnode
 * @param children
 */
function normalizeChildren(vnode, children) {
  let type = 0;
  if (children === null) {
    // 不处理
  } else if (children && Array.isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }

  vnode.shapeFlag |= type;
}

export const Text = Symbol('Text');
/**
 * 子节点转换为虚拟节点
 * @param child
 * @returns
 */
export function CVnode(child) {
  if (isObject(child)) {
    return child;
  }
  return createVnode(Text, null, child);
}
