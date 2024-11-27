# develop-log

阅读 [README.md](../../README.md)

## virtual-me

### 20241112-HiMeditator

- 初始化仓库
- 修改 `package.json`：重命名指令
- 修改 `.gitignore`：忽略 log 文件夹，忽略 .obsidian 文件夹
- 新增文件夹和文件，见 `README.md`
- 基本实现 `LogItem` 类，但是子类还没实现
- 修改了指令名称，见 `package.json`

### 20241113-HiMeditator

- 创建 `src/test/plugin-test.ts`，可以在里面编写一些函数用于测试功能
- 在 `common.ts` 中新增了保存文件的函数
- 实现选中文本 `SelectText` 事件
- `Context` 类的 `ChangeType` 属性修改为 `ContextType`，其中新增了 `Select` 标签

### 20241118-HiMeditator

- 删除 `SelectText` 事件中的预处理操作
- 实现 5 个修改文本文件的事件（增加、删除、修改、Redo、Undo），**未进行预处理**

### 20241119-Katock-Cricket

增加Reference字段

1. 将Reference加到Artifact字段里了，因为分开做的话重构成本太大。目前设计的是在获取层级结构时就去算ref，因为需要每层的symbol的position，而artifact没存position
2. 依赖关系的寻找是递归结构，但目前默认深度为1，即不递归，因为调用查找引用这个command非常耗时，且依赖通常存在循环，第二层开始就出现回环了。
3. 优化部分代码可读性。

### 20241119-sivenlu

- 实现简单的终端操作

  - 打开终端
  - 关闭终端
  - 切换终端
- 研究如何获取开发者在终端输入的命令

  - 使用系统的 shell history 文件（如 bash 的 .bash_history 或者 zsh 的.zsh_history），缺点如下
    - 隐私问题（这个文件中的历史记录不止是开发者在使用插件期间的记录）
    - 不够实时。一般是关闭终端之后，这个文件才更新

### 20241120-HiMeditator

- 文本内容相关事件仅对文件生效（`document.uri.scheme === 'file'`）
- 修改 log-item 结构图，`log-item` 是实际架构，`log-item-surface` 是表面看上去的架构
- 修改 `README.md`
- 修改保存逻辑，在开发阶段数据保存到开发环境的 `./res/log` 文件夹，发布后数据保存到工作环境的 `./log` 文件夹

### 20241120-suyunhe

- 完成文件部分的移植
  - 待讨论：重命名或移动文件时，若文件已被打开，需不需要记录对应的打开和关闭事件

### 20241123-Katock-Cricket

优化ref计算延迟

1. `export let isCalculatingArtifact = {value: false}` // 防止调用相关API时的vs内部的文件开关事件被记录
2. 改用call hiecrachy的API避免全局字符串匹配耗时
3. 取消在hiecrachy每层都算ref，只算最小那级的ref，取消递归，优化延迟，目前延迟小于1s

### 20241125-HiMeditator

- 将文本内容处理的常用函数 `getArtifactFromSelectedText` 重命名为 `getArtifactFromRange`
- 实现鼠标悬停事件 `MouseHover`

### 20241125-suyunhe
- 完成对vscode内所有菜单项命令的收集
- 完善`plugin-architecture.md`文档

### 20241127-suyunhe
- 修复文档路径不统一的Bug