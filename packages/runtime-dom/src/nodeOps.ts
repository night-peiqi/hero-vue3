/**
 * dom 节点操作方法
 */

export const nodeOps = {
  createElement: (tag: string) => document.createElement(tag),
  insert: (child: Node, parent: Node, anchor: Node | null = null) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child: Node) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  querySelector: (selector: string) => document.querySelector(selector),
  setElementText: (el: Node, text: string) => {
    el.textContent = text;
  },
  createText: (text: string) => document.createTextNode(text),
  setText: (node: Node, text: string) => {
    node.nodeValue = text;
  }
};
