import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import ts from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import resolvePlugin from "@rollup/plugin-node-resolve";

/**
 * build.js开启子进程时会执行这个文件，这个文件的作用是：
 * 1. 获取子包的 rollup 配置
 */

// "buildOptions": {
//   "name": "VueReactivity",
//   "formats": [
//     "esm-bundler",
//     "esm-browser",
//     "cjs", 这是 CommonJS 格式，主要用于 Node.js 环境。CommonJS 使用 require() 和 module.exports 进行模块导入和导出。
//     "global" // 全局格式，可以在浏览器环境中通过全局变量访问，比如 window.VueReactivity，这种格式常用于 CDN 引入
//   ]
// },

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packagesDir = path.resolve(__dirname, "packages");

// TARGET是build.js开启子进程时注入的环境变量，值是packages目录下的子目录名
const packageDir = path.resolve(packagesDir, process.env.TARGET);
// 子包的绝对路径下
const resolve = (p) => path.resolve(packageDir, p);

const pkg = await fs.readJson(resolve("package.json"));
const packageOptions = pkg.buildOptions || {};
// 子包的名字
const name = path.basename(packageDir);

const outputConfigs = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  "esm-browser": {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};

const createConfig = (format, output) => {
  output.name = packageOptions.name;
  output.sourcemap = true;

  return {
    input: resolve("src/index.ts"),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
      }),
      resolvePlugin(),
    ],
  };
};

export default packageOptions.formats.map((format) =>
  createConfig(format, outputConfigs[format])
);
