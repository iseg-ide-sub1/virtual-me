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

### 20241119-sivenlu

- 实现简单的终端操作

  - 打开终端
  - 关闭终端
  - 切换终端

- 研究如何获取开发者在终端输入的命令

  - 使用系统的 shell history 文件（如 bash 的 .bash_history 或者 zsh 的.zsh_history），缺点如下
    - 隐私问题（这个文件中的历史记录不止是开发者在使用插件期间的记录）
    - 不够实时。一般是关闭终端之后，这个文件才更新

  ### 20241120-suyunhe
  - 完成文件部分的移植
    - 待讨论：重命名或移动文件时，若文件已被打开，需不需要记录对应的打开和关闭事件
