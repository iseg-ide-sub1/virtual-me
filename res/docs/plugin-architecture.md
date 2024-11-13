# 插件架构

## 事件总览

### 文件级事件

| 编号 | 名称           | 符号                 | 开发人员 | 是否实现 |
| ---- | -------------- | -------------------- | -------- | -------- |
| 1-1  | 打开文本文件   | `OpenTextDocument`   |          |          |
| 1-2  | 关闭文本文件   | `CloseTextDocument`  |          |          |
| 1-3  | 切换文本编辑器 | `ChangeTextDocument` |          |          |
| 1-4  | 新建文件       | `CreateFile`         |          |          |
| 1-5  | 删除文件       | `DeleteFile`         |          |          |
| 1-6  | 保存文件       | `SaveFile`           |          |          |
| 1-7  | 重命名文件     | `RenameFile`         |          | X        |
| 1-8  | 移动文件       | `MoveFile`           |          | X        |
| 1-9  | 粘贴文件       | `PasteFile`          |          | X        |

### 文本内容相关事件

| 编号 | 名称         | 符号                 | 开发人员 | 是否实现 |
| ---- | ------------ | -------------------- | -------- | -------- |
| 2-1  | 添加文件内容 | `AddTextDocument`    |          |          |
| 2-2  | 删除文件内容 | `DeleteTextDocument` |          |          |
| 2-3  | 修改文件内容 | `EditTextDocument`   |          |          |
| 2-4  | 重做文件内容 | `RedoTextDocument`   |          |          |
| 2-5  | 撤销文件内容 | `UndoTextDocument`   |          |          |
| 2-6  | 选中文本     | `SelectText`         |          |          |
| 2-7  | 查找文件内容 |                      |          | X        |
| 2-8  | 替换文件内容 |                      |          | X        |
| 2-9  | 重命名符号   |                      |          | X        |
| 2-10 | 文本跳转     |                      |          | X        |

### 终端事件

| 编号 | 名称         | 符号                   | 开发人员 | 是否实现 |
| ---- | ------------ | ---------------------- | -------- | -------- |
| 3-1  | 打开终端     | `OpenTerminal`         |          |          |
| 3-2  | 关闭终端     | `CloseTerminal`        |          |          |
| 3-3  | 切换终端     | `ChangeActiveTerminal` |          |          |
| 3-4  | 执行终端命令 |                        |          | X        |
| 3-5  | 终端输出内容 |                        |          | X        |

### 其他事件

| 编号 | 名称     | 符号 | 开发人员 | 是否实现 |
| ---- | -------- | ---- | -------- | -------- |
| 4-1  | 鼠标滚动 |      |          | X        |
| 4-2  | 版本控制 |      |          | X        |

## 事件属性

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

**触发条件：**

切换文本文件时触发，若当前关闭所有编辑视图，`editor` 值为 `undefined`

切换编辑视图，会触发两次此事件，第一次 `editor` 值为 `undefined`

插件不会记录 `editor` 值为 `undefined` 的情况

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

### 1-5 `DeleteFile`

### 1-6 `SaveFile`





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

`日期 时间 仓库名称.json`

```
2024-10-29 14-16-15 VirtualMe.json
```

### log

一个文件夹用于保存自己测试生成的数据（该文件夹放到 gitignore 中）

### dataset

一个文件夹用于专门保存有用的数据（数据集）
