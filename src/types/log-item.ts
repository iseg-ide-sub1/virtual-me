import { getFormattedTime } from '../utils/common'

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

    /** 打开终端 */
    OpenTerminal = "OpenTerminal",
    /** 关闭终端 */
    CloseTerminal = "CloseTerminal",
    /** 切换终端 */
    ChangeActiveTerminal = "ChangeActiveTerminal",
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
    Terminal = "Terminal", // 自定义工件类型
    Unknown = "Unknown"
}

export enum ChangeType {
    Add = "Add",
    Delete = "Delete",
    Edit = "Edit",
    Redo = "Redo",
    Undo = "Undo",
    Unknown = "Unknown"
}

export class Artifact {
    constructor(
        public name: string,
        public type: ArtifactType,
        public hierarchy?: Artifact[]
    ) {}

    toString(): string {
        let ret = ""
        // 如果需要，请对照 demo 重新实现一下
        return ret
    }
}

export class Context {
    constructor(
        public type: ChangeType,
        public content: {before: string, after: string},
        public start: {line: number, character: number},
        public end: {line: number, character: number}
    ) {}
}

// Reference 类尚未实现，后续再考虑

export class LogItem {
    static #nextId = 1
    id: number
    timeStamp: string
    eventType: EventType
    artifact: Artifact
    context?: Context

    constructor(eventType: EventType, artifact: Artifact, context?: Context) {
        this.id = LogItem.#nextId++
        this.timeStamp = getFormattedTime()
        this.eventType = eventType
        this.artifact = artifact
        this.context = context
    }

    toString(): string {
        let ret = ""
        // 如果需要，请对照 demo 重新实现一下
        return ret
    }
}

// 以下继承的类不能直接使用，需要进行修改

// export class OpenTextDocumentLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.OpenTextDocument, artifact)
//     }
// }

// export class CloseTextDocumentLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.CloseTextDocument, artifact)
//     }
// }

// export class ChangeActiveTextDocumentLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.ChangeTextDocument, artifact)
//     }
// }

// export class AddTextDocumentLog extends LogItem {
//     constructor(artifact: Artifact, addContentLength: number, addContent: string) {
//         let detail = new Map<string, any>()
//         detail.set("addContentLength", addContentLength)
//         detail.set("addContent", addContent)
//         super(EventType.AddTextDocument, artifact, detail)
//     }
// }

// export class DeleteTextDocumentLog extends LogItem {
//     constructor(artifact: Artifact, deleteContentLength: number, deleteContent: string) {
//         let detail = new Map<string, any>()
//         detail.set("deleteContentLength", deleteContentLength)
//         detail.set("deleteContent", deleteContent)
//         super(EventType.DeleteTextDocument, artifact, detail)
//     }
// }

// export class EditTextDocumentLog extends LogItem {
//     constructor(
//         artifact: Artifact,
//         oldContent: string,
//         newContent: string
//     ) {
//         let detail = new Map<string, any>()
//         detail.set("oldContent", oldContent)
//         detail.set("newContent", newContent)
//         detail.set("contentLengthChange", newContent.length - oldContent.length)
//         super(EventType.EditTextDocument, artifact, detail)
//     }
// }

// export class RedoTextDocumentLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.RedoTextDocument, artifact)
//     }
// }

// export class UndoTextDocumentLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.UndoTextDocument, artifact)
//     }
// }

// export class CreateFileLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.CreateFile, artifact)
//     }
// }

// export class DeleteFileLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.DeleteFile, artifact)
//     }
// }

// export class SaveFileLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.SaveFile, artifact)
//     }
// }

// export class SelectTextLog extends LogItem {
//     constructor(artifact: Artifact) {
//         super(EventType.SelectText, artifact)
//     }
// }


// export class OpenTerminalLog extends LogItem {
//     constructor(artifact: Artifact, processId: number) {
//         let detail = new Map<string, any>()
//         detail.set("processId", processId)
//         super(EventType.OpenTerminal, artifact, detail)
//     }
// }

// export class CloseTerminalLog extends LogItem {
//     constructor(artifact: Artifact, processId: number) {
//         let detail = new Map<string, any>()
//         detail.set("processId", processId)
//         super(EventType.CloseTerminal, artifact, detail)
//     }
// }

// export class ChangeActiveTerminalLog extends LogItem {
//     constructor(artifact: Artifact, processId: number) {
//         let detail = new Map<string, any>()
//         detail.set("processId", processId)
//         super(EventType.ChangeActiveTerminal, artifact, detail)
//     }
// }
