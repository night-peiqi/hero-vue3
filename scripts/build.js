import fs from "fs";
import { execa } from "execa";

const dirs = fs.readdirSync("packages").filter((p) => {
  return fs.statSync(`packages/${p}`).isDirectory();
});

console.log("dirs: ", dirs);

const buildHandler = async (dir) => {
  // 开启子进程执行 rollup 命令，使用跟目录下的 rollup.config.js 配置文件，同时写入环境变量 TARGET
  await execa("rollup", ["-c", "--environment", `TARGET:${dir}`], {
    stdio: "inherit", // stdio: 'inherit' 表示子进程的 stdin、stdout 和 stderr 应该继承自父进程。这意味着 rollup 的所有输出都将直接显示在父进程的控制台中。
  });
};

// 并行打包
const runParaller = async (dirs, buildHandler) => {
  const pList = [];
  for (const dir of dirs) {
    pList.push(buildHandler(dir));
  }

  return Promise.all(pList);
};

runParaller(dirs, buildHandler).then((res) => {
  console.log("打包完成");
});
