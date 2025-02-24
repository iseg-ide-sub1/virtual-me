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

- 修改 `.gitignore`, `package.json`：忽略 `virtualme-logs` 文件夹，登记注册命令
- 更新 develop-log, README
- 新增 plugin-architecture-v2
- 记录命名规则改为 `版本_年-月-日 时.分.秒.json`

### 20240120-HiMeditator

- 测试全部指令并更新到 plugin-architecture-v2
- 更新架构图

### 20250120-Katock-Cricket

集成win32版的git（未启用）
git向上提供三个接口：

1. init，初始化virtualme内部的git存储，位于virtualme-logs/.internal-git
2. snapshot(filePaths?: string[], commitMessage?: string)，将某些文件保存快照，内部是commit
3. getDiffFromLastSnapshot(filePaths?: string[], commitMessage?: string)，获取当前情况与上一次快照的代码diff情况，内部是commit一次，与上次commit做对比。

问题：保存快照的时机、需要记录当前快照前、上一次快照后变更过的文件的路径，需要讨论。如果这个git记录全仓的文件变更，项目大了会很慢。

集成git
只使用用户本地的git

修复问题

1. saveDir过滤失效（循环引用问题，需要单独的文件存储states才能根本解决）
2. 按键失效（git测试按键注释掉）
3. 修改部分文件编码：GBK到UTF8

### 20240121-HiMeditator

- 继续更新文档
- 重构插件界面数据更新逻辑
- 增加检测，防止新增状态 id 重复
- 优化界面，插件激活后改为默认开始记录；停止记录改为暂停记录

### 20240121-syh

在前端添加一个 `repo-cal`模块，用于计算工作仓库中file级和artifact级的相关数据，作为知识提供给后端。
目前设计中，计算的内容包括：

1. file之间的cbo(耦合度)、cea(共享元素数量)和Jaccard文本相似度；
2. artifact之间的cbo、cea和Jaccard文本相似度【工件的粒度需要统一】
   目前通过命令 `Repo Cal`启动。

### 20240203-syh

添加针对python和java的cbo计算、单文件的rfc计算。

- 待优化：性能问题，当repo较大时计算python的cbo会启动很多计算线程，效率很低。

### 20250210-Katock-Cricket

完成代码快照功能

1. git.ts中有一个计数器每隔5分钟自动保存一次代码快照，原理是commit与之前的commit进行diff比对
2. 快照记录随主log保存触发时一起保存，后缀为_snapshot.json

### 20240210-HiMeditator

- 创建 python 模块文件夹
- 增加 virtualme 功能总结图 `/res/raw `

### 20240223-HiMeditator

- 重构插件 WebView View 页面结构框架


### 20240224-syh
1. 完成初版的repocal模块。
- file_list
	- 对repo中的file进行分类统计，形成列表，并记录每个file的[在repo中的路径]信息
- ast
	- 生成每个代码文件的AST树，记录每个结点(function、Class、Import等)工件的[id, name, type, range, children]信息
- artifact_list
	- 生成每类代码文件的工件列表(function、Class)，记录[id, name, file, range, code]信息。
- similarity_calculator
	- 计算每两个同类型工件(function、Class)的similarity_score
- cbo_calculator
	- 计算每两个同类型工件(function、Class)的cbo
- cea_calculator
	- 计算每两个同类型工件(function、Class)的cea
- rfc_calculator
	- 计算每两个同类型工件(function、Class)的rfc

  其中，file_list、ast和artifact_list是从用户repo中直接计算并收集上来的，similarity、cbo、cea、rfc依赖ast和artifact_list这两个中间结果计算。
  

2. 添加py module运行所需环境目录(venv)
- 启动虚拟环境: `source venv/bin/activate`
- 退出虚拟环境: `deactivate`
- 在插件中执行Python脚本，需要指定解释器


3. 更新`virtualme-logs/`结构
- .internal-git
- repo-cal
- snapshot
- event
