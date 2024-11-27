import {getFormattedTime} from '../utils/common'
import vscode from "vscode";

/**
 * 事件类型枚举
 * @note
 * - 如果当前枚举中没有需要的事件类型，请自行添加
 * - 如果添加的是之前没命名的枚举值，请同步更新 plugin-architecture.md
 */
export enum EventType {
    /** 打开文本文件 */
    OpenTextDocument = "OpenTextDocument",
    /** 关闭文本文件 */
    CloseTextDocument = "CloseTextDocument",
    /** 切换文本编辑器 */
    ChangeTextDocument = "ChangeTextDocument",
    /** 新建文件 */
    CreateFile = "CreateFile",
    /** 删除文件 */
    DeleteFile = "DeleteFile",
    /** 保存文件 */
    SaveFile = "SaveFile",
    /** 重命名文件 */
    RenameFile = "RenameFile",
    /** 移动文件 */
    MoveFile = "MoveFile",

    /** 添加文件内容 */
    AddTextDocument = "AddTextDocument",
    /** 删除文件内容 */
    DeleteTextDocument = "DeleteTextDocument",
    /** 修改文件内容 */
    EditTextDocument = "EditTextDocument",
    /** Redo文件内容 */
    RedoTextDocument = "RedoTextDocument",
    /** Undo文件内容 */
    UndoTextDocument = "UndoTextDocument",
    /** 选中文本 */
    SelectText = "SelectText",
    /** 鼠标在文件悬停 */
    MouseHover = "MouseHover",
    /** 鼠标点击跳转 */
    MouseClick = "MouseJump",

    /** 打开终端 */
    OpenTerminal = "OpenTerminal",
    /** 关闭终端 */
    CloseTerminal = "CloseTerminal",
    /** 切换终端 */
    ChangeActiveTerminal = "ChangeActiveTerminal",

    /** 执行菜单项 */
    ExecuteMenuItem = "ExecuteMenuItem",
}

export enum ArtifactType {
    File = "File",
    Module = "Module",
    Namespace = "Namespace",
    Package = "Package",
    Class = "Class",
    Method = "Method",
    Property = "Property",
    Field = "Field",
    Constructor = "Constructor",
    Enum = "Enum",
    Interface = "Interface",
    Function = "Function",
    Variable = "Variable",
    Constant = "Constant",
    String = "String",
    Number = "Number",
    Boolean = "Boolean",
    Array = "Array",
    Object = "Object",
    Key = "Key",
    Null = "Null",
    EnumMember = "EnumMember",
    Struct = "Struct",
    Event = "Event",
    Operator = "Operator",
    TypeParameter = "TypeParameter",
    Terminal = "Terminal",
    MenuItem = "MenuItem",
    Unknown = "Unknown"
}

export enum ContextType {
    Add = "Add",
    Delete = "Delete",
    Edit = "Edit",
    Redo = "Redo",
    Undo = "Undo",
    Select = "Select",
    Hover = "Hover",
    Unknown = "Unknown"
}

export class Artifact {
    constructor(
        public name: string,
        public type: ArtifactType,
        public hierarchy?: Artifact[],
        public references?: Reference[]
    ) {
    }

    toString(): string {
        let ret = ""
        // 如果需要，请对照 demo 重新实现一下
        return ret
    }
}

export class Context {
    constructor(
        public type: ContextType,
        public content: { before: string, after: string },
        public start: { line: number, character: number },
        public end: { line: number, character: number }
    ) {
    }
}

export class Reference {
    constructor(
        public hierarchy: Artifact[],
    ) {
    }
}

export class LogItem {
    static #nextId = 1
    id: number
    timeStamp: string
    eventType: EventType
    artifact: Artifact
    context?: Context
    references?: Reference[]

    constructor(eventType: EventType, artifact: Artifact, context?: Context, references?: Reference[]) {
        this.id = LogItem.#nextId++
        this.timeStamp = getFormattedTime()
        this.eventType = eventType
        this.artifact = artifact
        this.context = context
        this.references = references
    }

    toString(): string {
        let ret = ""
        // 如果需要，请对照 demo 重新实现一下
        return ret
    }
}
