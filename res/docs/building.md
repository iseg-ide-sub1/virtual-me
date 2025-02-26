# Building virtual-me

A VS Code plugin for collecting and predicting developer action sequences in the IDE.

```
? What type of extension do you want to create? New Extension (TypeScript)
? What's the name of your extension? virtual-me
? What's the identifier of your extension? virtual-me
? What's the description of your extension? In-IDE data collection plugin
? Initialize a git repository? Yes
? Which bundler to use? webpack
? Which package manager to use? npm
```

## 开发前准备

1. 将仓库克隆到本地
2. 执行 `npm install` 安装项目依赖
3. 在编辑器中，打开 `src/extension.ts` 文件，然后按 `F5` 或者从命令面板运行 `Debug: Start Debugging`，这将编译并运行扩展程序在一个新的扩展开发主机窗口中

   > 如果发现修改了代码而没在插件中生效，可以先在控制台执行 `npm run watch` 再尝试运行
   >

## 插件打包

```bash
npm install vsce
vsce package
```

## 开发记录

在更改项目源代码后请将修改内容记录到 [develop-log.md](./res/docs/develop-log.md) 中。

## 文件说明

### /res

资源文件夹，用于保存项目相关的资源

#### /dataset

数据集文件夹，用于保存收集的高质量数据

#### /docs

用于保存项目文档

- [develop-log.md](./res/docs/develop-log.md) 开发记录文档
- [plugin-architecture.md](./res/docs/plugin-architecture.md) 插件架构文档

#### /raw

保存一些原始（非文本）内容

- [log-item.xmind](./res/raw/log-item.xmind) 事件类型数据结构的思维导图（用 `Xmind` 打开）
- [log-item.png](./res/raw/log-item.png) 事件类型数据结构的思维导图的图片

### /src

源代码文件夹

- [extension.ts](./src/extension.ts) 插件入口文件，导出两个函数 `activate` 和 `deactivate`

#### /types

保存数据结构声明文件

- [log-item.ts](./src/types/log-item.ts) 保存事件类型数据结构相关声明和实现

#### /utils

保存工具函数

- [common.ts](./src/utils/common.ts) 常用函数
- [context-process.ts](./src/utils/context-process.ts) 文本内容相关的处理函数
- [file-process.ts](./src/utils/file-process.ts) 文件相关的处理函数
- [terminal-process.ts](./src/utils/terminal-process.ts) 终端相关的处理函数
