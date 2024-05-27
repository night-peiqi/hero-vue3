import { createVnode } from './vnode';

/**
 * 创建虚拟dom，并render虚拟dom
 * @param {Function} render - 渲染函数，用于将虚拟节点渲染到容器中。
 * @returns {Function} - 返回一个函数，用于创建应用程序实例。
 */
export function createAppAPI(render) {
  return function createApp(rootComponent, rootProps) {
    let app = {
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      mount(container) {
        // 创建 vnode
        let vnode = createVnode(rootComponent, rootProps);

        // 渲染 vnode
        render(vnode, container);

        app._container = container;
      }
    };

    return app;
  };
}
