import * as vscode from 'vscode'
import * as logItem from "../types/log-item"
import {getArtifactFromSelectedText} from "./context-process";


export async function getDefinitionsFromSymbol(
    uri: vscode.Uri,
    start: vscode.Position,
    end: vscode.Position,
    depth: number = 4
): Promise<logItem.RefNode> {
    let defRoot: logItem.RefNode = {
        hierarchy: [],
        reference: []
    }
    // console.log(depth)
    if (depth < 0) {
        return defRoot;
    }

    const artifact = await getArtifactFromSelectedText(uri, start, end, false)
    if (!artifact.hierarchy) {
        return defRoot;
    }
    defRoot.hierarchy = artifact.hierarchy;

    const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider',
        uri,
        start
    );

    if (definitions && definitions.length > 0) {
        for (const definition of definitions) {
            if (definition.uri.path.toLowerCase() === uri.path.toLowerCase() &&
                definition.range.start.line == start.line) {
                // console.log('skip the definition of the symbol itself')
                continue;
            }

            let defNode = await getDefinitionsFromSymbol(
                definition.uri,
                definition.range.start,
                definition.range.end,
                depth - 1);
            if (defNode.hierarchy.length !== 0) {
                defRoot.reference.push(defNode);
            }
        }
    }
    return defRoot;
}

export async function getUsagesFromSymbol(
    uri: vscode.Uri,
    start: vscode.Position,
    end: vscode.Position,
    depth: number = 4
): Promise<logItem.RefNode> {
    let usageRoot: logItem.RefNode = {
        hierarchy: [],
        reference: []
    }
    // console.log(depth)
    if (depth < 0) {
        return usageRoot;
    }

    const artifact = await getArtifactFromSelectedText(uri, start, end, false)
    if (!artifact.hierarchy) {
        return usageRoot;
    }
    usageRoot.hierarchy = artifact.hierarchy;

    const usages = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeReferenceProvider',
        uri,
        start
    );

    if (usages && usages.length > 0) {
        for (const usage of usages) {
            if (usage.uri.path.toLowerCase() === uri.path.toLowerCase() &&
                usage.range.start.line === start.line) {
                // console.log('skip the usage of the symbol itself')
                continue;
            }
            let usageNode = await getUsagesFromSymbol(
                usage.uri,
                usage.range.start,
                usage.range.end,
                depth - 1);
            if (usageNode.hierarchy.length !== 0) {
                usageRoot.reference.push(usageNode);
            }
        }
    }
    return usageRoot;
}