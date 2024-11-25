import * as vscode from 'vscode'
import * as logItem from "../types/log-item"
import * as refUtils from "./ref-process"
import {isCalculatingArtifact} from '../extension'

/**
 * 将 SymbolKind 枚举值转换为对应的 ArtifactType 枚举描述。
 * @param kind SymbolKind 枚举值。
 * @returns 对应的 ArtifactType 枚举值。
 */
function getArtifactTypeFromSymbolKind(kind: vscode.SymbolKind): logItem.ArtifactType {
    switch (kind) {
        case vscode.SymbolKind.File:
            return logItem.ArtifactType.File
        case vscode.SymbolKind.Module:
            return logItem.ArtifactType.Module
        case vscode.SymbolKind.Namespace:
            return logItem.ArtifactType.Namespace
        case vscode.SymbolKind.Package:
            return logItem.ArtifactType.Package
        case vscode.SymbolKind.Class:
            return logItem.ArtifactType.Class
        case vscode.SymbolKind.Method:
            return logItem.ArtifactType.Method
        case vscode.SymbolKind.Property:
            return logItem.ArtifactType.Property
        case vscode.SymbolKind.Field:
            return logItem.ArtifactType.Field
        case vscode.SymbolKind.Constructor:
            return logItem.ArtifactType.Constructor
        case vscode.SymbolKind.Enum:
            return logItem.ArtifactType.Enum
        case vscode.SymbolKind.Interface:
            return logItem.ArtifactType.Interface
        case vscode.SymbolKind.Function:
            return logItem.ArtifactType.Function
        case vscode.SymbolKind.Variable:
            return logItem.ArtifactType.Variable
        case vscode.SymbolKind.Constant:
            return logItem.ArtifactType.Constant
        case vscode.SymbolKind.String:
            return logItem.ArtifactType.String
        case vscode.SymbolKind.Number:
            return logItem.ArtifactType.Number
        case vscode.SymbolKind.Boolean:
            return logItem.ArtifactType.Boolean
        case vscode.SymbolKind.Array:
            return logItem.ArtifactType.Array
        case vscode.SymbolKind.Object:
            return logItem.ArtifactType.Object
        case vscode.SymbolKind.Key:
            return logItem.ArtifactType.Key
        case vscode.SymbolKind.Null:
            return logItem.ArtifactType.Null
        case vscode.SymbolKind.EnumMember:
            return logItem.ArtifactType.EnumMember
        case vscode.SymbolKind.Struct:
            return logItem.ArtifactType.Struct
        case vscode.SymbolKind.Event:
            return logItem.ArtifactType.Event
        case vscode.SymbolKind.Operator:
            return logItem.ArtifactType.Operator
        case vscode.SymbolKind.TypeParameter:
            return logItem.ArtifactType.TypeParameter
        default:
            return logItem.ArtifactType.Unknown
    }
}

/**
 * 获取文件的对于范围的工件信息（包含当前位置的工件信息和当前位置的工件层级）
 * @param uri 给定文件的uri即路径
 * @param start 给定范围开始位置
 * @param end 给定范围结束位置
 * @param getRef 是否获取引用信息
 * @returns 给定范围的工件信息
 */
export async function getArtifactFromSelectedText(
    uri: vscode.Uri,
    start: vscode.Position,
    end: vscode.Position,
    getRef: boolean = true
): Promise<logItem.Artifact> {

    let hierarchy: logItem.Artifact[] = [
        new logItem.Artifact(uri.toString(), logItem.ArtifactType.File)
    ]
    isCalculatingArtifact.value = true // 标记正在计算引用信息, 防止API内的文件开关行为被记录
    // 获取该文件的符号表
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider', uri
    )
    // console.log('hierarchy symbols =',symbols)
    if (!symbols) return hierarchy[0] // 没有符号，直接返回
    let curSymbols = symbols // 当前层级的符号表
    let symbolSelf = undefined
    while (curSymbols.length > 0) {
        let isFind: boolean = false
        for (const symbol of curSymbols) {
            if (symbol.range.contains(start) && symbol.range.contains(end)) {
                symbolSelf = symbol
                // 构造hierarchy
                hierarchy.push(new logItem.Artifact(
                    symbol.name,
                    getArtifactTypeFromSymbolKind(symbol.kind)
                ))
                // 继续查找下一层级
                curSymbols = symbol.children
                isFind = true
                break
            }
        }
        if (!isFind) break // 没有找到，退出循环
    }
    // console.log('hierarchy =',hierarchy)
    const artifactSelf = hierarchy[hierarchy.length - 1]

    // 构造reference
    let references: logItem.Reference[] = []
    if (getRef && symbolSelf) {
        // const st = new Date().getTime()
        const start = symbolSelf.selectionRange.start
        references = await refUtils.getUsagesFromSymbol(uri, start);
        // const et = new Date().getTime()
        // console.log('getRef time(ms) = ', et - st)
    }
    isCalculatingArtifact.value = false // 标记计算引用信息结束
    return new logItem.Artifact(
        artifactSelf.name,
        artifactSelf.type,
        hierarchy,
        references
    )
}

/**
 * 从选中的文本中获取 LogItem 对象
 * @param document 当前文本文件的文件对象
 * @param start 选择开始位置
 * @param end 选择结束位置
 * @returns 返回 LogItem 对象
 */
export async function getLogItemFromSelectedText(
    document: vscode.TextDocument,
    start: vscode.Position,
    end: vscode.Position
): Promise<logItem.LogItem> {
    const eventType = logItem.EventType.SelectText
    const artifact = await getArtifactFromSelectedText(document.uri, start, end)
    const context = new logItem.Context(
        logItem.ContextType.Select,
        {
            before: document.getText(new vscode.Range(start, end)),
            after: ''
        },
        {
            line: start.line + 1,
            character: start.character + 1
        },
        {
            line: end.line + 1,
            character: end.character + 1
        }
    )
    return new logItem.LogItem(eventType, artifact, context);
}


export async function getLogItemsFromChangedText(
    event: vscode.TextDocumentChangeEvent,
    lastText: string
): Promise<logItem.LogItem[]> {
    let logItems: logItem.LogItem[] = [] // 存放返回的 LogItem，每个修改对应一个 LogItem
    let document = event.document
    let reason = event.reason // 文件修改的原因，可能是 Undo、Redo 和 Undefined
    for (let change of event.contentChanges) { // 遍历每次修改的内容
        let start = change.range.start
        let end = change.range.end
        let eventType: logItem.EventType = logItem.EventType.EditTextDocument
        let contextType: logItem.ContextType = logItem.ContextType.Edit
        let before: string = ''
        let after: string = change.text // 增加的内容

        if (change.rangeLength > 0) { // 说明有删除内容
            before = lastText.substring(change.rangeOffset, change.rangeOffset + change.rangeLength)
        }
        if (reason === vscode.TextDocumentChangeReason.Undo) {
            eventType = logItem.EventType.UndoTextDocument
            contextType = logItem.ContextType.Undo
        } else if (reason === vscode.TextDocumentChangeReason.Redo) {
            eventType = logItem.EventType.RedoTextDocument
            contextType = logItem.ContextType.Redo
        } else {
            if (before !== '' && after !== '') { // 删除和增加内容均有，说明是修改操作
                eventType = logItem.EventType.EditTextDocument
                contextType = logItem.ContextType.Edit
            } else if (before !== '') { // 只有删除内容，说明是删除操作
                eventType = logItem.EventType.DeleteTextDocument
                contextType = logItem.ContextType.Delete
            } else if (after !== '') { // 只有增加内容，说明是增加操作
                eventType = logItem.EventType.AddTextDocument
                contextType = logItem.ContextType.Add
            }
        }

        // console.log('before',before,'after',after)
        const artifact = await getArtifactFromSelectedText(document.uri, start, end)
        const context = new logItem.Context(
            contextType,
            {
                before,
                after
            },
            {
                line: start.line + 1,
                character: start.character + 1
            },
            {
                line: end.line + 1,
                character: end.character + 1
            }
        )
        logItems.push(new logItem.LogItem(eventType, artifact, context))
    }
    return logItems
}

/**
 * 从 Debug Console 输出中获取 LogItem 对象
 * @param output Debug Console 输出对象
 * @returns LogItem 对象
 */
export async function getLogItemFromDebugConsole(
    output: { output: string, category?: string, line?: number }
): Promise<logItem.LogItem> {
    const eventType = logItem.EventType.DebugConsoleOutput
    
    // 获取当前活动的编辑器和文档
    const editor = vscode.window.activeTextEditor
    let artifact: logItem.Artifact
    
    if (editor) {
        // 如果有活动的编辑器，获取当前文件的工件信息
        artifact = await getArtifactFromSelectedText(
            editor.document.uri,
            editor.selection.start,
            editor.selection.end,
            false // 不获取引用信息
        )
    } else {
        // 如果没有活动的编辑器，创建一个基础的工件信息
        artifact = new logItem.Artifact(
            'Debug Console',
            logItem.ArtifactType.Unknown
        )
    }
    
    // 创建上下文信息
    const context = new logItem.Context(
        logItem.ContextType.Unknown,
        {
            before: '',
            after: output.output
        },
        {
            line: output.line || 0,
            character: 0
        },
        {
            line: output.line || 0,
            character: output.output.length
        }
    )
    
    return new logItem.LogItem(eventType, artifact, context)
}
