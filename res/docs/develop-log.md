# develop-log

阅读 [README.md](../../README.md)

## v0.0.1

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

## v0.0.2

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
- 完善 `plugin-architecture.md`文档

### 20241127-suyunhe

- 修复文档路径不统一的Bug

### 20241127-Katock-Cricket

终端命令与输出的捕获

1. 添加Log类型：`ExecuteTerminalCommand`
2. 添加Context类型：Terminal
3. 将命令放入context.content.before；输出放入context.content.after
4. 只用了api，理论上可以跨平台。
5. 控制字符的过滤还不完善，有乱码

### 20241202-HiMeditator

- 完善文档，修改文档，保证架构文档的正确性
- 添加指令执行的快捷键（`Ctrl+Alt+V` 和 `Ctrl+Alt+S`）
- 简单测试新增命令
- **发布版本由 `v0.0.1` 变更为 `v0.0.2`**

## v0.0.3

### 20241202- from sivenlu by HiMeditator

- 新增事件： `DebugConsoleOutput`（by sivenlun on 20241125）
- 合并 dev-lsw 到 develop 分支
- 因为当前功能存在一定问题，将该事件对应的函数注释了

### 20241203-suyunhe

- 完成对vscode内菜单项命令的收集(目前仅能在使用键盘快捷键执行的情况才能收集到)
- 完善文档

### 20241203-HiMeditator

- 新增 sidebar 图标按钮
- 创建对应的 webview 界面
- 界面增加清空记录和保存记录的按钮

### 20241204-HiMeditator

- 创建 `TaskType` 数据结构，修改 log-item 架构图片（`.xmind .png`）
- 新增 `virtualme.clear` 指令，用于清空 `logs` 数组，该指令不设快捷键
- 修改 `virtualme.activate` 指令的执行
- webview 界面新增记录收集记录数量的显示
- 实现标注当前所处任务的功能
- 优化界面样式，修复 webview 单选框 bug
- 更新 README 文档

## v0.1.0

### 20241210-HiMeditator

- 新增注册状态的指令 `virtualme.register.tasktype`
- `LogItem` 类的 `taskType` 属性类型由 `TaskType` 改为 `string`
- webview 界面新增添加状态的选项，并实现了对应功能

### 20241215-HiMeditator

- 删除 `extension.ts` 中 `saved` 全局变量
- 新增功能：每缓存 100 条记录自动保存

### 20241216-HiMeditator

- 实现选择操作合并，依据：时间间隔小于 2000ms、只需要记录最大的范围
- 文本变更合并**未实现**，原因：收集数据顺序可能错位，导致无法简单合并
- 在 README 文档中新增数据收集规范

### 20241217-suyunhe

- 修复未启动插件时快捷键无法正常使用和插件激活部分快捷键失效的bug
- 降低兼容版本 from 1.9.3 to 1.9.0

## v0.2.0

### 20241222-Katock-Cricket

重写编辑操作合并逻辑

1. 重写log合并办法
2. 细化context合并规则

### 20241228-Katock-Cricket

适配定制内核，添加CommandWatcher

1. 适配定制vscode内核，需要使用定制头文件，将定制头文件放到了./src/vscode，把vscode从npm依赖中删除
2. 添加CommandWatcher监听，请根据log内容的格式，添加对应的收集逻辑
3. 定制vscode的版本是1.95.3，兼容性应该OK的，但是需要进一步详细测试其功能是否完善

### 20250105-suyunhe

- feat:适配定制vscode，添加menucommand的收集
- (0108) fix:错误收集了一些不是由程序员执行的command

## v0.2.1

### 20250114-Katock-Cricket

0.2.1版本更新

1. 重构IDE命令的保存方式，使用eventType保存命令名称，对应的声明文件改为event-types.ts与之前的事件类型合并了。args带有文件或工件的命令，保存在artifact字段并计算ref。
2. 改善鼠标悬停记录逻辑，悬停超过1.5秒才记录
3. 修改插件激活逻辑：增加“开始记录”和”停止记录“按钮，手动开始和结束记录，结束时自动保存
4. 过滤掉一些无用IDE命令和inner命令序列，现在的数据log冗余信息减少了。

## v0.2.2

### 20250119-Katock-Cricket

更新0.2.2
1. GUI可见上一操作类型
2. 鼠标悬停1秒阈值
3. 完善文件忽略表

## next version

### 20240119-HiMeditator

- 修改 `.gitignore`, `package.json`
- 更新 develop-log, README
- 新增 plugin-architecture-v2
- 记录命名规则改为 `版本_年-月-日 时.分.秒.json`
- 文档更新尚未完成（进度 40%）
