import fs from "fs";
import { execa } from "execa";

const buildHandler = async (dir) => {
  // 开启子进程执行 rollup 命令，使用跟目录下的 rollup.config.js 配置文件，同时写入环境变量 TARGET
  // -cw 表示 watch 模式，即监听文件变化，实时打包
  await execa("rollup", ["-cw", "--environment", `TARGET:${dir}`], {
    stdio: "inherit", // stdio: 'inherit' 表示子进程的 stdin、stdout 和 stderr 应该继承自父进程。这意味着 rollup 的所有输出都将直接显示在父进程的控制台中。
  });
};

buildHandler("reactivity");
