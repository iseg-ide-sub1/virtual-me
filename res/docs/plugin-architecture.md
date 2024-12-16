# 插件架构

## 事件总览

### 文件级事件

| 编号  | 名称      | 符号                   | 开发人员 | 是否实现 |
|-----|---------|----------------------|------|------|
| 1-1 | 打开文本文件  | `OpenTextDocument`   | SYH  | Y    |
| 1-2 | 关闭文本文件  | `CloseTextDocument`  |      | Y    |
| 1-3 | 切换文本编辑器 | `ChangeTextDocument` |      | Y    |
| 1-4 | 新建文件    | `CreateFile`         |      | Y    |
| 1-5 | 删除文件    | `DeleteFile`         |      | Y    |
| 1-6 | 保存文件    | `SaveFile`           |      | Y    |
| 1-7 | 重命名文件   | `RenameFile`         |      | Y    |
| 1-8 | 移动文件    | `MoveFile`           |      | Y    |
|     | 粘贴文件    | `PasteFile`          |      | X    |

### 文本内容相关事件

| 编号 | 名称         | 符号                 | 开发人员  | 是否实现 |
| ---- | ------------ | -------------------- | --------- | -------- |
| 2-1  | 添加文件内容 | `AddTextDocument`    | PZP & LYH | Y        |
| 2-2  | 删除文件内容 | `DeleteTextDocument` |           | Y        |
| 2-3  | 修改文件内容 | `EditTextDocument`   |           | Y        |
| 2-4  | 重做文件内容 | `RedoTextDocument`   |           | Y        |
| 2-5  | 撤销文件内容 | `UndoTextDocument`   |           | Y        |
| 2-6  | 选中文本     | `SelectText`         |           | Y        |
| 2-7  | 鼠标悬停     | `MouseHover`         |           | Y        |
|      | 鼠标点击跳转 |                      |           | X        |
|      | 查找文件内容 |                      |           | X        |
|      | 替换文件内容 |                      |           | X        |
|      | 重命名符号   |                      |           | X        |
|      | 文本跳转     |                      |           | X        |

**说明：**

1. 鼠标点击操作无法被插件监听，技术上无法实现。而 `Ctrl + 鼠标左键` 实际上执行内置的”跳转到定义“或”查看定义“命令，因此可以新增指令绑定这两个命令的快捷键，实现部分功能，但是缺点是：必须要按快捷键或执行对应指令才能激活命令，而且一旦用户更改了对应的快捷键，那么将收集到错误的信息。

### 终端事件

| 编号 | 名称               | 符号                     | 开发人员 | 是否实现         |
| ---- | ------------------ | ------------------------ | -------- | ---------------- |
| 3-1  | 打开终端           | `OpenTerminal`           | LSW      | Y                |
| 3-2  | 关闭终端           | `CloseTerminal`          | LSW      | Y                |
| 3-3  | 切换终端           | `ChangeActiveTerminal`   | LSW      | Y                |
| 3-4  | 执行终端命令       | `ExecuteTerminalCommand` | LYH      | Y（待优化）      |
| 3-5  | 获取调试控制台输出 | `DebugConsoleOutput`     | LSW      | （当前存在问题） |

### 执行菜单项事件
| 编号  | 名称    | 符号                     | 开发人员 | 是否实现 |
|-----|-------| ------------------------ |------| -------- |
| 4-1 | 执行菜单项 | `ExecuteMenuItem`         | SYH  | （当前存在问题） |

**说明** 
目前能够收集到的菜单项如下表所示。

| 命令字符串                                                              | 英文描述                              | 中文描述            | 键盘快捷键                     |
|:-------------------------------------------------------------------|:----------------------------------|:----------------|:--------------------------|
| `virtualme.editor.action.clipboardCutAction`                       | Cut Line (Empty Selection)        | 剪切行（空选择）        | Ctrl+X                    |
| `virtualme.editor.action.clipboardCopyAction`                      | Copy Line (Empty Selection)       | 复制行（空选择）        | Ctrl+C                    |
| `virtualme.editor.action.deleteLines`                              | Delete Line                       | 删除行             | Ctrl+Shift+K              |
| `virtualme.editor.action.insertLineAfter`                          | Insert Line Below                 | 在下方插入行          | Ctrl+Enter                |
| `virtualme.editor.action.insertLineBefore`                         | Insert Line Above                 | 在上方插入行          | Ctrl+Shift+Enter          |
| `virtualme.editor.action.moveLinesDownAction`                      | Move Lines Down                   | 向下移动行           | Alt+Down                  |
| `virtualme.editor.action.moveLinesUpAction`                        | Move Lines Up                     | 向上移动行           | Alt+Up                    |
| `virtualme.editor.action.copyLinesDownAction`                      | Copy Line Down                    | 向下复制行           | Shift+Alt+Down            |
| `virtualme.editor.action.copyLinesUpAction`                        | Copy Line Up                      | 向上复制行           | Shift+Alt+Up              |
| `virtualme.editor.action.addSelectionToNextFindMatch`              | Add Selection To Next Match       | 添加选择到下一个匹配项     | Ctrl+D                    |
| `virtualme.editor.action.moveSelectionToNextFindMatch`             | Move Selection To Next Match      | 移动选择到下一个匹配项     | Ctrl+K Ctrl+D             |
| `virtualme.cursorUndo`                                             | Undo                              | 撤销              | Ctrl+U                    |
| `virtualme.editor.action.insertCursorAtEndOfEachLineSelected`      | Insert Cursor At End Of Each Line | 在每行末尾插入光标       | Shift+Alt+I               |
| `virtualme.editor.action.selectHighlights`                         | Select All Occurrences            | 选择所有出现项         | Ctrl+Shift+L              |
| `virtualme.editor.action.changeAll`                                | Select All Occurrences            | 全部替换            | Ctrl+F2                   |
| `virtualme.expandLineSelection`                                    | Expand Line Selection             | 扩展行选择           | Ctrl+I                    |
| `virtualme.editor.action.insertCursorBelow`                        | Insert Cursor Below               | 在下方插入光标         | Ctrl+Alt+Down             |
| `virtualme.editor.action.insertCursorAbove`                        | Insert Cursor Above               | 在上方插入光标         | Ctrl+Alt+Up               |
| `virtualme.editor.action.jumpToBracket`                            | Jump To Bracket                   | 跳转到括号           | Ctrl+Shift+\|             |
| `virtualme.editor.action.indentLines`                              | Indent Line                       | 缩进行             | Ctrl+\]                   |
| `virtualme.editor.action.outdentLines`                             | Outdent Line                      | 取消缩进行           | Ctrl+\[                   |
| `virtualme.cursorHome`                                             | Move to Line Start                | 移动到行首           | Home                      |
| `virtualme.cursorEnd`                                              | Move to Line End                  | 移动到行尾           | End                       |
| `virtualme.cursorBottom`                                           | Move to File End                  | 移动到文件末尾         | Ctrl+End                  |
| `virtualme.cursorTop`                                              | Move to File Start                | 移动到文件开头         | Ctrl+Home                 |
| `virtualme.scrollLineDown`                                         | Scroll Line Down                  | 滚动行下            | Ctrl+Down                 |
| `virtualme.scrollLineUp`                                           | Scroll Line Up                    | 滚动行上            | Ctrl+Up                   |
| `virtualme.scrollPageDown`                                         | Scroll Page Down                  | 滚动页面下           | Alt+PageDown              |
| `virtualme.scrollPageUp`                                           | Scroll Page Up                    | 滚动页面上           | Alt+PageUp                |
| `virtualme.editor.fold`                                            | Fold Region                       | 折叠区域            | Ctrl+Shift+\[             |
| `virtualme.editor.unfoldRecursively`                               | Unfold Region                     | 展开区域            | Ctrl+Shift+\]             |
| `virtualme.editor.foldAll`                                         | Fold All Regions                  | 折叠所有区域          | Ctrl+K Ctrl+0             |
| `virtualme.editor.unfoldAll`                                       | Unfold All Regions                | 展开所有区域          | Ctrl+K Ctrl+J             |
| `virtualme.editor.action.addCommentLine`                           | Add Line Comment                  | 添加行注释           | Ctrl+K Ctrl+C             |
| `virtualme.editor.action.removeCommentLine`                        | Remove Line Comment               | 移除行注释           | Ctrl+K Ctrl+U             |
| `virtualme.editor.action.commentLine`                              | Toggle Line Comment               | 切换行注释           | Ctrl+/                    |
| `virtualme.editor.action.blockComment`                             | Toggle Block Comment              | 切换块注释           | Shift+Alt+A               |
| `virtualme.actions.find`                                           | Find                              | 查找              | Ctrl+F                    |
| `virtualme.editor.action.startFindReplaceAction`                   | Replace                           | 替换              | Ctrl+H                    |
| `virtualme.editor.action.nextMatchFindAction`                      | Find Next                         | 查找下一个           | F3                        |
| `virtualme.editor.action.previousMatchFindAction`                  | Find Previous                     | 查找上一个           | Shift+F3                  |
| `virtualme.editor.action.selectAllMatches`                         | Select All Matches                | 选择所有匹配项         | Alt+Enter                 |
| `virtualme.toggleFindCaseSensitive`                                | Toggle Find Case Sensitive        | 切换查找大小写敏感       | Alt+C                     |
| `virtualme.toggleFindRegex`                                        | Toggle Find Regex                 | 切换查找正则表达式       | Alt+R                     |
| `virtualme.toggleFindWholeWord`                                    | Toggle Find Whole Word            | 切换查找全字匹配        | Alt+W                     |
| `virtualme.editor.action.toggleTabFocusMode`                       | Toggle Tab Focus Mode             | 切换标签焦点模式        | Ctrl+M                    |
| `virtualme.toggleRenderWhitespace`                                 | Toggle Render Whitespace          | 切换渲染空白字符        | unassigned                |
| `virtualme.editor.action.toggleWordWrap`                           | Toggle Word Wrap                  | 切换自动换行          | Alt+Z                     |
| `virtualme.editor.action.triggerSuggest`                           | Trigger Suggestion                | 触发建议            | Ctrl+Space                |
| `virtualme.editor.action.triggerParameterHints`                    | Trigger Parameter Hints           | 触发参数提示          | Ctrl+Shift+Space          |
| `virtualme.editor.action.formatDocument`                           | Format Document                   | 格式化文档           | Shift+Alt+F               |
| `virtualme.editor.action.formatSelection`                          | Format Selection                  | 格式化选择区域         | Ctrl+K Ctrl+F             |
| `virtualme.editor.action.revealDefinition`                         | Go to Definition                  | 跳转到定义           | F12                       |
| `virtualme.editor.action.showHover`                                | Show Hover                        | 显示悬浮提示          | Ctrl+K Ctrl+I             |
| `virtualme.editor.action.peekDefinition`                           | Peek Definition                   | 预览定义            | Alt+F12                   |
| `virtualme.editor.action.revealDefinitionAside`                    | Reveal Definition Aside           | 在旁边显示定义         | Ctrl+K F12                |
| `virtualme.editor.action.quickFix`                                 | Quick Fix                         | 快速修复            | Ctrl+. Ctrl+.             |
| `virtualme.editor.action.referenceSearch.trigger`                  | Reference Search                  | 引用搜索            | Shift+F12                 |
| `virtualme.editor.action.rename`                                   | Rename Symbol                     | 重命名符号           | F2                        |
| `virtualme.editor.action.inPlaceReplace.down`                      | Replace with Next Value           | 替换为下一个值         | Ctrl+Shift+. Ctrl+Shift+. |
| `virtualme.editor.action.inPlaceReplace.up`                        | Replace with Previous Value       | 替换为上一个值         | Ctrl+Shift+,              |
| `virtualme.editor.action.smartSelect.grow`                         | Expand AST Selection              | 扩展AST选择区域       | Shift+Alt+Right           |
| `virtualme.editor.action.smartSelect.shrink`                       | Shrink AST Selection              | 缩小AST选择区域       | Shift+Alt+Left            |
| `virtualme.editor.action.trimTrailingWhitespace`                   | Trim Trailing Whitespace          | 修剪尾随空白字符        | Ctrl+K Ctrl+X             |
| `virtualme.workbench.action.editor.changeLanguageMode`             | Change Language Mode              | 更改语言模式          | Ctrl+K M                  |
| `virtualme.workbench.action.showAllSymbols`                        | Show All Symbols                  | 显示所有符号          | Ctrl+T                    |
| `virtualme.workbench.action.gotoLine`                              | Go to Line                        | 跳转到行            | Ctrl+G                    |
| `virtualme.workbench.action.quickOpen`                             | Quick Open                        | 快速打开            | Ctrl+P                    |
| `virtualme.workbench.action.gotoSymbol`                            | Go to Symbol                      | 跳转到符号           | Ctrl+Shift+O              |
| `virtualme.workbench.actions.view.problems`                        | View Problems                     | 查看问题            | Ctrl+Shift+M              |
| `virtualme.editor.action.marker.nextInFiles`                       | Next Error or Warning             | 下一个错误或警告        | F8                        |
| `virtualme.editor.action.marker.prevInFiles`                       | Previous Error or Warning         | 上一个错误或警告        | Shift+F8                  |
| `virtualme.workbench.action.showCommands`                          | Show Commands                     | 显示命令            | Ctrl+Shift+P              |
| `virtualme.workbench.action.openPreviousRecentlyUsedEditorInGroup` | Open Previous Editor in Group     | 在组中打开上一个编辑器     | Ctrl+Shift+Tab            |
| `virtualme.workbench.action.navigateBack`                          | Navigate Back                     | 后退              | Alt+Left                  |
| `virtualme.workbench.action.quickInputBack`                        | Quick Input Back                  | 快速输入后退          | Alt+Left                  |
| `virtualme.workbench.action.navigateForward`                       | Navigate Forward                  | 前进              | Alt+Right                 |
| `virtualme.workbench.action.newWindow`                             | New Window                        | 新建窗口            | Ctrl+Shift+N              |
| `virtualme.workbench.action.closeWindow`                           | Close Window                      | 关闭窗口            | Ctrl+Shift+W              |
| `virtualme.workbench.action.closeActiveEditor`                     | Close Editor                      | 关闭编辑器           | Ctrl+F4                   |
| `virtualme.workbench.action.closeFolder`                           | Close Folder                      | 关闭文件夹           | Ctrl+K F                  |
| `virtualme.workbench.action.navigateEditorGroups`                  | Navigate Editor Groups            | 导航编辑器组          | unassigned                |
| `virtualme.workbench.action.splitEditor`                           | Split Editor                      | 分割编辑器           | Ctrl+ .                   |                    |
| `virtualme.workbench.action.focusFirstEditorGroup`                 | Focus First Editor Group          | 聚焦第一个编辑器组       | Ctrl+1                    |
| `virtualme.workbench.action.focusSecondEditorGroup`                | Focus Second Editor Group         | 聚焦第二个编辑器组       | Ctrl+2                    |
| `virtualme.workbench.action.focusThirdEditorGroup`                 | Focus Third Editor Group          | 聚焦第三个编辑器组       | Ctrl+3                    |
| `virtualme.workbench.action.focusPreviousGroup`                    | Focus Previous Group              | 聚焦上一个组          | unassigned                |
| `virtualme.workbench.action.focusNextGroup`                        | Focus Next Group                  | 聚焦下一组           | unassigned                |
| `virtualme.workbench.action.moveEditorLeftInGroup`                 | Move Editor Left                  | 将编辑器向左移动        | Ctrl+Shift+PageUp         |
| `virtualme.workbench.action.moveEditorRightInGroup`                | Move Editor Right                 | 将编辑器向右移动        | Ctrl+Shift+PageDown       |
| `virtualme.workbench.action.moveActiveEditorGroupLeft`             | Move Active Editor Group Left     | 将当前编辑器组向左移动     | Ctrl+K Left               |
| `virtualme.workbench.action.moveActiveEditorGroupRight`            | Move Active Editor Group Right    | 将当前编辑器组向右移动     | Ctrl+K Right              |
| `virtualme.workbench.action.moveEditorToNextGroup`                 | Move Editor to Next Group         | 将编辑器移动到下一组      | Ctrl+Alt+Right            |
| `virtualme.workbench.action.moveEditorToPreviousGroup`             | Move Editor to Previous Group     | 将编辑器移动到上一组      | Ctrl+Alt+Left             |
| `virtualme.workbench.action.files.newUntitledFile`                 | New File                          | 新建文件            | Ctrl+N                    |
| `virtualme.workbench.action.files.openFile`                        | Open File...                      | 打开文件...         | Ctrl+O                    |
| `virtualme.workbench.action.files.save`                            | Save                              | 保存              | Ctrl+S                    |
| `virtualme.workbench.action.files.saveAll`                         | Save All                          | 保存全部            | Ctrl+K S                  |
| `virtualme.workbench.action.files.saveAs`                          | Save As...                        | 另存为...          | Ctrl+Shift+S              |
| `virtualme.workbench.action.closeOtherEditors`                     | Close Other Editors               | 关闭其他编辑器         | unassigned                |
| `virtualme.workbench.action.closeEditorsInGroup`                   | Close Editors In Group            | 关闭组中的编辑器        | Ctrl+K W                  |
| `virtualme.workbench.action.closeEditorsInOtherGroups`             | Close Editors In Other Groups     | 关闭其他组中的编辑器      | unassigned                |
| `virtualme.workbench.action.closeEditorsToTheLeft`                 | Close Editors To The Left         | 关闭左侧的编辑器        | unassigned                |
| `virtualme.workbench.action.closeEditorsToTheRight`                | Close Editors To The Right        | 关闭右侧的编辑器        | unassigned                |
| `virtualme.workbench.action.closeAllEditors`                       | Close All Editors                 | 关闭所有编辑器         | Ctrl+K Ctrl+W             |
| `virtualme.workbench.action.reopenClosedEditor`                    | Reopen Closed Editor              | 重新打开已关闭的编辑器     | Ctrl+Shift+T              |
| `virtualme.workbench.action.keepEditor`                            | Keep Editor                       | 保持编辑器           | Ctrl+K Enter              |
| `virtualme.workbench.action.openNextRecentlyUsedEditorInGroup`     | Open Next Editor                  | 在组中打开下一个编辑器     | Ctrl+Tab                  |
| `virtualme.workbench.action.files.copyPathOfActiveFile`            | Copy Path Of Active File          | 复制活动文件的路径       | Ctrl+K P                  |
| `virtualme.workbench.action.files.revealActiveFileInWindows`       | Reveal Active File In Windows     | 在Windows中显示活动文件 | Ctrl+K R                  |
| `virtualme.workbench.action.files.showOpenedFileInNewWindow`       | Show Opened File In New Window    | 在新窗口中显示已打开的文件   | Ctrl+K O                  |
| `virtualme.workbench.files.action.compareFileWith`                 | Compare File With...              | 比较文件...         | unassigned                |
| `virtualme.workbench.action.toggleFullScreen`                      | Toggle Full Screen                | 切换全屏模式          | F11                       |
| `virtualme.workbench.action.toggleZenMode`                         | Toggle Zen Mode                   | 切换禅模式           | Ctrl+K Z                  |
| `virtualme.workbench.action.exitZenMode`                           | Exit Zen Mode                     | 退出禅模式           | Escape                    |
| `virtualme.workbench.action.zoomIn`                                | Zoom In                           | 放大              | Ctrl+=                    |
| `virtualme.workbench.action.zoomOut`                               | Zoom Out                          | 缩小              | Ctrl+-                    |
| `virtualme.workbench.action.zoomReset`                             | Reset Zoom                        | 重置缩放            | Ctrl+Numpad0              |
| `virtualme.workbench.action.toggleSidebarVisibility`               | Toggle Sidebar Visibility         | 切换侧边栏可见性        | Ctrl+B                    |
| `virtualme.workbench.view.explorer`                                | Show Explorer                     | 显示资源管理器         | Ctrl+Shift+E              |
| `virtualme.workbench.view.scm`                                     | Show SCM                          | 显示源代码管理         | Ctrl+Shift+G              |
| `virtualme.workbench.view.debug`                                   | Show Debug                        | 显示调试            | Ctrl+Shift+D              |
| `virtualme.workbench.view.extensions`                              | Show Extensions                   | 显示扩展            | Ctrl+Shift+X              |
| `virtualme.workbench.action.output.toggleOutput`                   | Toggle Output                     | 切换输出面板          | Ctrl+Shift+U              |
| `virtualme.workbench.action.quickOpenView`                         | Quick Open View                   | 快速打开视图          | Ctrl+Q Ctrl+Q             |
| `virtualme.workbench.action.terminal.openNativeConsole`            | Open Native Console               | 打开原生控制台         | Ctrl+Shift+C              |
| `virtualme.markdown.showPreview`                                   | Toggle Markdown Preview           | 切换Markdown预览    | Ctrl+V                    |
| `virtualme.markdown.showPreviewToSide`                             | Markdown Preview To Side          | 侧边Markdown预览    | Ctrl+K V                  |
| `virtualme.workbench.action.terminal.toggleTerminal`               | Toggle Terminal                   | 切换终端面板          | Ctrl+`                    |
| `virtualme.workbench.view.search`                                  | Show Search                       | 显示搜索            | Ctrl+Shift+F              |
| `virtualme.workbench.action.replaceInFiles`                        | Replace in Files                  | 在文件中替换          | Ctrl+Shift+H              |
| `virtualme.toggleSearchCaseSensitive`                              | Toggle Match Case                 | 切换匹配大小写         | Alt+C                     |
| `virtualme.toggleSearchWholeWord`                                  | Toggle Match Whole Word           | 切换匹配整个单词        | Alt+W                     |
| `virtualme.toggleSearchRegex`                                      | Toggle Search Regex               | 切换搜索正则表达式       | Alt+R                     |
| `virtualme.workbench.action.search.toggleQueryDetails`             | Toggle Search Details             | 切换搜索详情          | Ctrl+Shift+J              |
| `virtualme.search.action.focusNextSearchResult`                    | Focus Next Search Result          | 聚焦下一个搜索结果       | F4                        |
| `virtualme.search.action.focusPreviousSearchResult`                | Focus Previous Search Result      | 聚焦上一个搜索结果       | Shift+F4                  |
| `virtualme.history.showNext`                                       | Show Next Search Term             | 显示下一个搜索词        | Down                      |
| `virtualme.history.showPrevious`                                   | Show Previous Search Term         | 显示上一个搜索词        | Up                        |
| `virtualme.workbench.action.openSettings`                          | Open Settings                     | 打开设置            | Ctrl+,                    |
| `virtualme.workbench.action.openWorkspaceSettings`                 | Open Workspace Settings           | 打开工作区设置         | unassigned                |
| `virtualme.workbench.action.openGlobalKeybindings`                 | Open Keyboard Shortcuts           | 打开键盘快捷键         | Ctrl+K Ctrl+S             |
| `virtualme.workbench.action.openSnippets`                          | Open User Snippets                | 打开用户代码片段        | unassigned                |
| `virtualme.workbench.action.selectTheme`                           | Select Color Theme                | 选择主题            | Ctrl+K Ctrl+T             |
| `virtualme.workbench.action.configureLocale`                       | Configure Display Language        | 配置显示语言          | unassigned                |
| `virtualme.editor.debug.action.toggleBreakpoint`                   | Toggle Breakpoint                 | 切换断点            | F9                        |
| `virtualme.workbench.action.debug.start`                           | Start Debugging                   | 开始调试            | F5                        |
| `virtualme.workbench.action.debug.continue`                        | Continue                          | 继续              | F5                        |
| `virtualme.workbench.action.debug.run`                             | Start Without Debugging           | 无调试模式启动         | Ctrl+F5                   |
| `virtualme.workbench.action.debug.pause`                           | Pause                             | 暂停              | F6                        |
| `virtualme.workbench.action.debug.stepInto`                        | Step Into                         | 步入              | F11                       |
| `virtualme.workbench.action.debug.stepOut`                         | Step Out                          | 步出              | Shift+F11                 |
| `virtualme.workbench.action.debug.stepOver`                        | Step Over                         | 步过              | F10                       |
| `virtualme.workbench.action.debug.stop`                            | Stop                              | 停止              | Shift+F5                  |
| `virtualme.editor.debug.action.showDebugHover`                     | Show Debug Hover                  | 显示调试悬浮提示        | Ctrl+K Ctrl+I             |
| `virtualme.workbench.action.tasks.build`                           | Run Build Task                    | 运行构建任务          | Ctrl+Shift+B              |
| `virtualme.workbench.action.tasks.test`                            | Run Test Task                     | 运行测试任务          | unassigned                |
| `virtualme.workbench.extensions.action.installExtension`           | Install Extension                 | 安装扩展            | unassigned                |
| `virtualme.workbench.extensions.action.showInstalledExtensions`    | Show Installed Extensions         | 显示已安装的扩展        | unassigned                |
| `virtualme.workbench.extensions.action.listOutdatedExtensions`     | List Outdated Extensions          | 列出过时的扩展         | unassigned                |
| `virtualme.workbench.extensions.action.showRecommendedExtensions`  | Show Recommended Extensions       | 显示推荐的扩展         | unassigned                |
| `virtualme.workbench.extensions.action.showPopularExtensions`      | Show Popular Extensions           | 显示流行的扩展         | unassigned                |
| `virtualme.workbench.extensions.action.updateAllExtensions`        | Update All Extensions             | 更新所有扩展          | unassigned                |




### 其他事件

| 编号 | 名称     | 符号 | 开发人员 | 是否实现 |
| ---- | -------- | ---- | -------- | -------- |
| 4-1  | 鼠标滚动 |      |          | X        |
| 4-2  | 版本控制 |      |          | X        |

## 事件属性

[log-item.xmind](../raw/log-item.xmind)

输出结构：

![](../raw/log-item-surface.png)

实际结构：

![](../raw/log-item.png)

### 通用属性

以下属性为通用属性，每个事件类型都会包含

- `id: number`  在本次记录中的序号
- `timeStamp: string`  记录本事件的时间戳
- `eventType: EventType`  事件类型
- `artifact: Artifact`  操作工件
  - `name: string` 工件名称
  - `type: ArtifactType` 工件类型
  - `hierarchy?: Artifact[]` 该工件的层级（可能没有）

### 1-1 `OpenTextDocument`

**实现API：**`vscode.workspace.onDidOpenTextDocument`

**触发条件：**打开文本文件时触发

**附加属性：**无

**示例数据：**

```json
  {
    "id": 1,
    "timeStamp": "2024-11-11 15:25:19.823",
    "eventType": "Open text document",
    "artifact": {
      "name": "file:///c%3A/Users/hiron/Desktop/Code/test.c",
      "type": "File"
    }
  }
```

### 1-2 `	CloseTextDocument`

**实现API：**`vscode.workspace.onDidCloseTextDocument`

**触发条件：**关闭文本文件时触发

**附加属性：**无

**示例数据：**

```json
  {
    "id": 1,
    "timeStamp": "2024-11-11 15:28:27.566",
    "eventType": "Close text document",
    "artifact": {
      "name": "file:///c%3A/Users/hiron/Desktop/Code/test.c",
      "type": "File"
    },
    "detail": {}
  }
```

### 1-3 `	CloseTextDocument`

**实现API：**`vscode.window.onDidChangeActiveTextEditor`

**触发条件：**切换文本文件时触发

**注意：**

1. 若当前关闭所有编辑视图，`editor` 值为 `undefined`
2. 切换编辑视图，会触发两次此事件，第一次 `editor` 值为 `undefined`
3. 插件不会记录 `editor` 值为 `undefined` 的情况

**附加属性：**无

**示例数据：**

```json
  {
    "id": 3,
    "timeStamp": "2024-11-11 15:28:28.243",
    "eventType": "Change text document",
    "artifact": {
      "name": "file:///c%3A/Users/hiron/Desktop/Code/test2.c",
      "type": "File"
    },
    "detail": {}
  }
```

### 1-4 `CreateFile`

**实现技术：**

```typescript
const filesWatcher = vscode.workspace.createFileSystemWatcher('**/*')
filesWatcher.onDidCreate(uri => {...})
```

**触发条件：**创建文件时触发

**附加属性：**无

**示例数据：**

```json
  {
    "id": 2,
    "timeStamp": "2024-11-20 21:38:14.496",
    "eventType": "CreateFile",
    "artifact": {
      "name": "file:///c%3A/Users/hiron/Desktop/Code/new-file.cpp",
      "type": "File"
    }
  }
```

### 1-5 `DeleteFile`

**实现技术：**

```typescript
const filesWatcher = vscode.workspace.createFileSystemWatcher('**/*')
filesWatcher.onDidDelete(uri => {...})
```

**触发条件：**删除文件时触发

**附加属性：**无

**示例数据：**

```json
  {
    "id": 27,
    "timeStamp": "2024-11-20 21:43:32.637",
    "eventType": "DeleteFile",
    "artifact": {
      "name": "file:///c%3A/Users/hiron/Desktop/Code/new.txt",
      "type": "File"
    }
  }
```

### 1-6 `SaveFile`

**实现技术：**

```typescript
const filesWatcher = vscode.workspace.createFileSystemWatcher('**/*')
filesWatcher.onDidChange(uri => {...})
```

**触发条件：**文件发生改变时触发

**附加属性：**无

**示例数据：**

```json
  {
    "id": 4,
    "timeStamp": "2024-11-20 21:50:44.805",
    "eventType": "SaveFile",
    "artifact": {
      "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
      "type": "File"
    }
  }
```

### 2-1 to 2-5 `*TextDocument`

**实现API：**`vscode.workspace.onDidChangeTextDocument`

**触发条件：**文本文件发生改变

**注意：**

1. 包含 5 种情况：增加内容、删除内容、修改内容、撤销内容、重做内容

**附加属性：**`context`、`refernence`

**示例数据：**

```json
  {
    "id": 155,
    "timeStamp": "2024-11-20 21:57:01.848",
    "eventType": "AddTextDocument",
    "artifact": {
      "name": "main()",
      "type": "Function",
      "hierarchy": [
        {
          "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
          "type": "File"
        },
        {
          "name": "main()",
          "type": "Function"
        }
      ]
    },
    "context": {
      "type": "Add",
      "content": {
        "before": "",
        "after": "printf(\"Press any key to exit.\\n\");"
      },
      "start": {
        "line": 38,
        "character": 5
      },
      "end": {
        "line": 38,
        "character": 5
      }
    },
    "reference": {
      "definitionsMap": [
        {
          "hierarchy": [
            {
              "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
              "type": "File"
            },
            {
              "name": "main()",
              "type": "Function"
            }
          ],
          "reference": []
        }
      ],
      "usagesMap": [
        {
          "hierarchy": [
            {
              "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
              "type": "File"
            },
            {
              "name": "main()",
              "type": "Function"
            }
          ],
          "reference": [
            {
              "hierarchy": [
                {
                  "name": "file:///c%3A/Users/hiron/Desktop/Code/new-f.c",
                  "type": "File"
                },
                {
                  "name": "main()",
                  "type": "Function"
                }
              ],
              "reference": []
            },
            {
              "hierarchy": [
                {
                  "name": "file:///c%3A/Users/hiron/Desktop/Code/new-file.c",
                  "type": "File"
                },
                {
                  "name": "main()",
                  "type": "Function"
                }
              ],
              "reference": []
            },
            {
              "hierarchy": [
                {
                  "name": "file:///c%3A/Users/hiron/Desktop/Code/test.c",
                  "type": "File"
                },
                {
                  "name": "main()",
                  "type": "Function"
                }
              ],
              "reference": []
            },
            {
              "hierarchy": [
                {
                  "name": "file:///c%3A/Users/hiron/Desktop/Code/testplus.cpp",
                  "type": "File"
                },
                {
                  "name": "main()",
                  "type": "Function"
                }
              ],
              "reference": []
            }
          ]
        }
      ]
    }
  }
```

### 2-6 `SelectText`

**实现API：**`vscode.window.onDidChangeTextEditorSelection`

**触发条件：**鼠标、键盘、命令都可能触发该事件，仅仅移动光标，也会触发此事件

**注意：**

1. 插件进行了处理，只有选择的文本内容不为空时才记录
2. 如果选择的内容横跨多个工件，按整体进行计算（也就是层级中的工件需要同时包含选择内容的开始位置和结束位置）
3. **为节省空间 `artifact.conext.before` 一定为空**
4. 在使用鼠标或键盘进行选择时，选择区域每扩大一次就会记录一次选中，这使得记录内容暴增，优化：当连续选择时，如果两次选择操作间隔小于2000毫秒，且上次选择内容是新选择内容的子集，那么删除上次选择记录

**附加属性：**`context`、`refernence`

**示例数据：**

```json
{
    "id": 31,
    "timeStamp": "2024-11-20 21:52:09.495",
    "eventType": "SelectText",
    "artifact": {
      "name": "next",
      "type": "Field",
      "hierarchy": [
        {
          "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
          "type": "File"
        },
        {
          "name": "Node",
          "type": "Struct"
        },
        {
          "name": "next",
          "type": "Field"
        }
      ]
    },
    "context": {
      "type": "Select",
      "content": {
        "before": "",
        "after": "struct Node *next;"
      },
      "start": {
        "line": 5,
        "character": 5
      },
      "end": {
        "line": 5,
        "character": 23
      }
    },
    "reference": {
      "definitionsMap": [
        {
          "hierarchy": [
            {
              "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
              "type": "File"
            },
            {
              "name": "Node",
              "type": "Struct"
            }
          ],
          "reference": []
        },
        {
          "hierarchy": [
            {
              "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
              "type": "File"
            },
            {
              "name": "Node",
              "type": "Struct"
            },
            {
              "name": "next",
              "type": "Field"
            }
          ],
          "reference": [
            {
              "hierarchy": [
                {
                  "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
                  "type": "File"
                },
                {
                  "name": "Node",
                  "type": "Struct"
                }
              ],
              "reference": []
            }
          ]
        }
      ],
      "usagesMap": [
        {
          "hierarchy": [
            {
              "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
              "type": "File"
            },
            {
              "name": "Node",
              "type": "Struct"
            }
          ],
          "reference": []
        },
        {
          "hierarchy": [
            {
              "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
              "type": "File"
            },
            {
              "name": "Node",
              "type": "Struct"
            },
            {
              "name": "next",
              "type": "Field"
            }
          ],
          "reference": []
        }
      ]
    }
  }
```

### 2-7 `MouseHover`

**实现技术：**

```typescript
    const hoverCollector = vscode.languages.registerHoverProvider('*', {
        async provideHover(document, position, token) {...}
    })
```

**触发条件：**鼠标悬停在文本上，触发 VS Code 的悬停内容显示

**注意：**

1. **为节省空间 `artifact.conext.before` 一定为空**

**附加属性：**`context`、`refernence`

**示例数据：**

```json
  {
    "id": 11,
    "timeStamp": "2024-11-25 17:08:20.901",
    "eventType": "MouseHover",
    "artifact": {
      "name": "main()",
      "type": "Function",
      "hierarchy": [
        {
          "name": "file:///c%3A/Users/hiron/Desktop/Code/algorithmCheck.c",
          "type": "File"
        },
        {
          "name": "main()",
          "type": "Function"
        }
      ]
    },
    "context": {
      "type": "Hover",
      "content": {
        "before": "",
        "after": "reverseSingleLinkedList"
      },
      "start": {
        "line": 33,
        "character": 16
      },
      "end": {
        "line": 33,
        "character": 39
      }
    },
    "references": []
  }
```

### 3-1 `OpenTerminal`

**实现 API**：`vscode.window.onDidStartTerminalShellExecution`

**触发条件**：在 Vs Code 中打开新的终端

**示例数据**：

```json
  {
    "id": 4,
    "timeStamp": "2024-11-19 23:00:58.141",
    "eventType": "OpenTerminal",
    "artifact": {
      "name": "2168", // 进程 id，用于区别不同终端
      "type": "Terminal"
    }
  },
```

### 3-2 `CloseTerminal`

**实现 API**：`vscode.window.onDidCloseTerminal`

**触发条件**：在 Vs Code 中关闭终端

**示例数据**：

```json
  {
    "id": 2,
    "timeStamp": "2024-11-19 23:00:53.373",
    "eventType": "CloseTerminal",
    "artifact": {
      "name": "2085",
      "type": "Terminal"
    }
  },
```

### 3-3 `ChangeActiveTerminal`

**实现 API**：`vscode.window.onDidChangeActiveTerminal`

**触发条件**：在 Vs Code 中切换不同的终端

**示例数据**：

```json
  {
    "id": 8,
    "timeStamp": "2024-11-19 22:19:28.982",
    "eventType": "ChangeActiveTerminal",
    "artifact": {
      "name": "64942->65654", // 涉及到的终端进程 id
      "type": "Terminal"
    }
  }
```

### 3-4 `ExecuteTerminalCommand`

**实现 API**：`vscode.window.onDidChangeActiveTerminal`

**触发条件**：Shell 指令被执行，只有终端的 [shell integration](https://code.visualstudio.com/docs/terminal/shell-integration) 被激活时才会执行

**注意：**

1. 只有显示“已激活 Shell 集成”的终端才会记录对应的信息
2. 记录的输出信息与实际输出有所出入（编码类型不一样？）

**示例数据**：

```json
  {
    "id": 34,
    "timeStamp": "2024-12-02 18:50:25.749",
    "eventType": "ExecuteTerminalCommand",
    "artifact": {
      "name": "824",
      "type": "Terminal"
    },
    "context": {
      "type": "Terminal",
      "content": {
        "before": "git log",
        "after": "d2\u0007tal: not a git repository (or any of the parent directories): .git\r\n\u001b]633;D;128\u0007"
      },
      "start": {
        "line": 0,
        "character": 0
      },
      "end": {
        "line": 0,
        "character": 0
      }
    }
  }
```

### 3-5 `DebugConsoleOutput`

**实现 API**：`vscode.debug.registerDebugAdapterTrackerFactory`

**触发条件**：使用 Vs Code 进行代码调试，过程中 debug console 输出的所有内容都将被捕获

```json
  {
    "id": 56,
    "timeStamp": "2024-11-25 19:18:31.554",
    "eventType": "DebugConsoleOutput",
    "artifact": {
      "name": "file:///Users/Documents/test.js",
      "type": "File",
      "hierarchy": [
        {
          "name": "file:///Users/Documents/test.js",
          "type": "File"
        }
      ]
    },
    "context": {
      "type": "Unknown",
      "content": {
        "before": "",
        "after": "Uncaught TypeError TypeError: Cannot read properties of null (reading 'property')\n    at <anonymous> (/Users/Documents/test.js:7:17)\n    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1550:14)\n    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1702:10)\n    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1307:32)\n    at <anonymous> (<node_internals>/internal/modules/cjs/loader:1121:12)\n    at traceSync (<node_internals>/diagnostics_channel:322:14)\n    at wrapModuleLoad (<node_internals>/internal/modules/cjs/loader:219:24)\n    at executeUserEntryPoint (<node_internals>/internal/modules/run_main:170:5)\n    at <anonymous> (<node_internals>/internal/main/run_main_module:36:49)\n"
      },
      "start": {
        "line": 7,
        "character": 0
      },
      "end": {
        "line": 7,
        "character": 765
      }
    },
    "references": []
  }
```

### 4-1 `ExecuteMenuItem`

**实现 API**：

```typescript
    const menuItemCommands = generateCommands()
    menuItemCommands.forEach(({ command, callback }) => {
        const menuItemWatcher = vscode.commands.registerCommand(command, callback)
        context.subscriptions.push(menuItemWatcher)
    })
```

**触发条件**：按下了对应的快捷键（快捷键列表见 `package.json`）

```json
  {
    "id": 168,
    "timeStamp": "2024-12-04 20:49:02.190",
    "eventType": "ExecuteMenuItem",
    "taskType": "Unknown",
    "artifact": {
      "name": "Show Command Palette",
      "type": "MenuItem"
    }
  }
```

## 插件代码组织结构

### `extension.ts`

插件入口，全局变量（LogItem），Subscriptions

### `log-item.ts`

事件数据结构

### `utils/common.ts`

保存通用函数

### `utils/process.ts`

保存数据预处理函数

## 数据保存约定

### 文件命名

> 时间日期时保存记录时的事件日期

`日期 时间.json`

```
2024-10-29 14.16.15.json
```

### res/log

一个文件夹用于保存自己测试生成的数据（该文件夹放到 gitignore 中）

### res/dataset

一个文件夹用于专门保存有用的数据（数据集）
