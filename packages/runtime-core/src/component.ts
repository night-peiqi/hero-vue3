import { ShapeFlags, isFunction, isObject, log } from '@herovue3/shared';
import { PublicInstanceProxyHandlers } from './componentPublicInstance';

/**
 * 创建组件实例
 * @param vnode 组件虚拟dom
 * @returns
 */
export function createComponentInstance(vnode) {
  log('/** 执行 createComponentInstance 创建组件实例 **/');
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    setupState: {}, // setup 返回值
    ctx: {},
    proxy: {},
    render: null,
    isMounted: false
  };
  instance.ctx = { _: instance };

  return instance;
}

/**
 * 设置组件实例
 * @param instance 组件实例
 */
export function setupComponent(instance) {
  log('/** 执行 setupComponent 设置组件实例 **/');
  // 获取组件的 props 和 children
  const { props, children } = instance.vnode;
  // 通过 props 初始化组件实例
  instance.props = props;
  instance.children = children;
  // 是否是有状态的组件(即组件是否有 setup 函数)
  const isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
  if (isStateful) {
    setupStatefulComponent(instance);
  } else {
    //
  }
}

/**
 * 初始化有状态组件
 * @param instance 组件实例
 */
function setupStatefulComponent(instance) {
  log('/** 执行 setupStatefulComponent 初始化状态组件 **/');
  // 为 ctx 添加代理，使得可以通过 instance.ctx 访问到 instance.proxy
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers as any);
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    const setupContext = createSetupContext(instance);
    /**
     * setup 返回值，可能是对象或函数
     * 1. 如果是对象，则直接赋值给 instance.setupState
     * 2. 如果是函数，则作为render函数，执行render
     */
    const setupResult = setup(instance.props, setupContext);

    handleSetupResult(instance, setupResult);
  } else {
    // finishComponentSetup(instance);
  }
}

/**
 * 创建 setup 上下文
 * @param instance 组件实例
 * @returns
 */
function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {}
  };
}

/**
 * 处理 setup 返回值
 * @param instance 组件实例
 * @param setupResult setup 返回值
 */
function handleSetupResult(instance, setupResult) {
  log('/** 执行 handleSetupResult 处理 setup 返回值 **/', instance, setupResult);
  if (isFunction(setupResult)) {
    instance.render = setupResult;
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

/**
 * 完成组件设置
 * @param instance 组件实例
 */
function finishComponentSetup(instance) {
  const Component = instance.type;
  log('/** 执行 finishComponentSetup 完成组件设置 **/', instance);
  if (!instance.render) {
    // 如果组件没有 render 函数，则使用 template
    if (!Component.render && Component.template) {
    }

    instance.render = Component.render;
  }
}
