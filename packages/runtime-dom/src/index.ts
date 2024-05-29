import { extend } from '@herovue3/shared';
import { createRenderer } from '@herovue3/runtime-core';
import { nodeOps } from './nodeOps';
import { patchProps } from './patchProps';

/**
 * vue3中的dom操作方法
 * 根据不同运行平台，提供不同的dom操作方法
 * 但这里只提供了浏览器平台的dom操作方法
 */
const renderOptionDom = extend({ patchProps }, nodeOps);

export const createApp = (rootComponent, rootProps) => {
  /**
   * 创建渲染器，并挂载组件
   */
  const app = createRenderer(renderOptionDom).createApp(rootComponent, rootProps);
  let { mount } = app;

  app.mount = (container) => {
    // 挂载组件
    // 1. 清空容器
    container = nodeOps.querySelector(container);
    container.innerHTML = '';
    // 2. 创建组件实例，并挂载到容器
    mount(container);
  };
  return app;
};

export { renderOptionDom };

export * from '@herovue3/runtime-core';
