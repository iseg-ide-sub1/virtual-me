import * as vscode from 'vscode'
import * as logItem from "../types/log-item"
import {getArtifactFromRange} from "./context-process";


export async function getUsagesFromSymbol(
    uri: vscode.Uri,
    position: vscode.Position,
): Promise<logItem.Reference[]> {
    let usages: logItem.Reference[] = []
    const callHierarchyItems = await vscode.commands.executeCommand<vscode.CallHierarchyItem[]>(
        'vscode.prepareCallHierarchy',
        uri,
        position
    );
    if (!callHierarchyItems || callHierarchyItems.length === 0) {
        return usages;
    }

    const selfItem = callHierarchyItems[0]
    const incomingCalls = await vscode.commands.executeCommand<vscode.CallHierarchyIncomingCall[]>(
        'vscode.provideIncomingCalls',
        selfItem
    );

    if (!incomingCalls || incomingCalls.length === 0) {
        return usages;
    }

    for (const call of incomingCalls) {
        // console.log('incoming call: ', call)
        const artifact = await getArtifactFromRange(
            call.from.uri,
            call.from.selectionRange.start,
            call.from.selectionRange.end,
            false)
        if (artifact.hierarchy && artifact.hierarchy.length !== 0) {
            usages.push({hierarchy: artifact.hierarchy});
        }
    }

    return usages;
}