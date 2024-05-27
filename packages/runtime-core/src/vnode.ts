import { ShapeFlags, isObject, isString } from '@hero-vue3/shared';

export function createVnode(type, props, children = null) {
  // 判断是组件还是普通标签
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;

  const vnode = {
    _v_isVnode: true, // 标识是虚拟节点
    type,
    props,
    children,
    key: props && props.key,
    el: null, // 真实节点
    shapeFlag // 节点类型
  };

  // 根据子节点类型设置 shapeFlag
  normalizeChildren(vnode, children);

  return vnode;
}

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
