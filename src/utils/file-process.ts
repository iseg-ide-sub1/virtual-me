import * as vscode from 'vscode'
import * as logItem from "../types/log-item"

export function getLogItemFromOpenTextDocument(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.OpenTextDocument
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromCloseTextDocument(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.CloseTextDocument
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromChangeTextDocument(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.ChangeTextDocument
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromSaveFile(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.SaveFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromCreateFile(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.CreateFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromDeleteFile(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.DeleteFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromRenameFile(oldUri: string, newUri: string) {
    const artifact = new logItem.Artifact(newUri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.RenameFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromMoveFile(oldUri: string, newUri: string) {
    const artifact = new logItem.Artifact(newUri, logItem.ArtifactType.File)
    const eventType = logItem.EventType.MoveFile
    return new logItem.LogItem(eventType, artifact)
}