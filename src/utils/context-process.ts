import * as vscode from 'vscode'
import * as logItem from "../types/log-item"
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
 * 获取选择内容的层级
 * @param document 
 * @param position 
 * @returns 
 */
export async function getArtifactFromSelectedText(
    document: vscode.TextDocument,
    start: vscode.Position,
    end: vscode.Position
):Promise<logItem.Artifact> {
    let hierarchy: logItem.Artifact[] = [
        new logItem.Artifact(document.fileName, logItem.ArtifactType.File)
    ]
    // 获取该文件的符号表
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider', document.uri
    )
    console.log('debug(symbols) =',symbols)
    if(!symbols) return hierarchy[0] // 没有符号，直接返回

    let curSymbols = symbols // 当前层级的符号表
    while(curSymbols.length > 0) {
        let isFind: boolean = false
        for(const symbol of curSymbols){
            if(symbol.range.contains(start) && symbol.range.contains(end)){
                hierarchy.push(new logItem.Artifact(
                    symbol.name,getArtifactTypeFromSymbolKind(symbol.kind)
                ))
                curSymbols = symbol.children // 继续查找下一层级
                isFind = true
                break
            }
        }
        if(!isFind) break // 没有找到，退出循环
    }
    console.log('debug(hierarchy) =',hierarchy)
    let artifact: logItem.Artifact = new logItem.Artifact(
        hierarchy[hierarchy.length - 1].name,
        hierarchy[hierarchy.length - 1].type,
        hierarchy
    )
    return artifact
}

export async function getLogItemFromSelectedText(
    document: vscode.TextDocument,
    start: vscode.Position,
    end: vscode.Position
):Promise<logItem.LogItem> {
    return new logItem.LogItem(
        logItem.EventType.SelectText,
        await getArtifactFromSelectedText(document, start, end),
        new logItem.Context(
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
    );
}