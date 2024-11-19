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
