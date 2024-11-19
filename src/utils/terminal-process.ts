import * as vscode from 'vscode'
import * as logItem from "../types/log-item"

export async function getLogItemFromOpenTerminal(
    terminal: vscode.Terminal
): Promise<logItem.LogItem> {
    const processId = await terminal.processId
    const artifact = new logItem.Artifact(
        // artifact.name: 终端进程 id
        processId ? processId.toString() : 'unknown',
        // artifact.type: “Terminal”
        logItem.ArtifactType.Terminal
    )
    
    return new logItem.LogItem(
        logItem.EventType.OpenTerminal,
        artifact
    )
}

export async function getLogItemFromCloseTerminal(
    terminal: vscode.Terminal
): Promise<logItem.LogItem> {
    const processId = await terminal.processId
    const artifact = new logItem.Artifact(
        // artifact.name: 终端进程 id
        processId ? processId.toString() : 'unknown',
        // artifact.type: "Terminal"
        logItem.ArtifactType.Terminal
    )
    
    return new logItem.LogItem(
        logItem.EventType.CloseTerminal,
        artifact
    )
}

export async function getLogItemFromChangeTerminal(
    fromTerminal: vscode.Terminal | undefined,
    toTerminal: vscode.Terminal
): Promise<logItem.LogItem> {
    const fromProcessId = fromTerminal ? await fromTerminal.processId : undefined
    const toProcessId = await toTerminal.processId
    
    const terminalName = `${fromProcessId ? fromProcessId.toString() : 'unknown'}->${toProcessId ? toProcessId.toString() : 'unknown'}`
    
    const artifact = new logItem.Artifact(
        terminalName,
        logItem.ArtifactType.Terminal
    )
    
    return new logItem.LogItem(
        logItem.EventType.ChangeActiveTerminal,
        artifact
    )
}
