import {getFormattedTime} from '../utils/common'
import {EventType} from './event-types'

/**
 * 任务类型，用于标记开发者当前正在进行的任务状态
 */
export enum TaskType {
    /** 环境配置 */
    Configuration = "Configuration",
    /** 调查阅读 */
    View = "View",
    /** 编写内容 */
    Coding = "Coding",
    /** 执行验证 */
    Execution = "Execution",
    /** 中性操作 */
    Unknown = "Unknown"
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
    Terminal = "Terminal",
    Unknown = "Unknown"
}

export class Artifact {
    constructor(
        public name: string,
        public type: ArtifactType,
        public hierarchy?: Artifact[],
        public references?: Artifact[]
    ) {
    }

    toString(): string {
        let ret = ""
        // 如果需要，请对照 demo 重新实现一下
        return ret
    }

    //定义相等性比较函数
    equals(other: Artifact): boolean {
        if (this.name !== other.name || this.type !== other.type)
            return false
        if (this.hierarchy && !other.hierarchy || !this.hierarchy && !other.hierarchy) {
            return false
        }
        if (this.hierarchy && other.hierarchy) {
            if (this.hierarchy.length !== other.hierarchy.length) {
                return false
            }
            for (let i = 0; i < this.hierarchy.length; i++) {
                if (this.hierarchy[i].name !== other.hierarchy[i].name ||
                    this.hierarchy[i].type !== other.hierarchy[i].type) {
                    return false
                }
            }
        }
        return true
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

export class LogItem {
    static #nextId = 1
    static currentTaskType: string = TaskType.Unknown
    id: number
    timeStamp: string
    eventType: EventType
    taskType: string
    artifact: Artifact
    context?: Context
    references?: Artifact[]

    constructor(eventType: EventType, artifact: Artifact, context?: Context, references?: Artifact[]) {
        this.id = LogItem.#nextId++
        this.taskType = LogItem.currentTaskType
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
