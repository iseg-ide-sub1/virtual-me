import * as vscode from 'vscode'
import * as logItem from "../types/log-item"

export function handleCommand(commandName: string) {
    const artifact = new logItem.Artifact(commandName, logItem.ArtifactType.MenuItem)
    const eventType = logItem.EventType.ExecuteMenuItem
    const log = new logItem.LogItem(eventType, artifact)
    return log
}




