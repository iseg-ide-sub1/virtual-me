import * as logItem from "../types/log-item"
import {EventType} from '../types/event-types'
import {saveDir} from "../extension";

const skippedFileTypes = [
    'git',
    'vscode-scm',
]

export function isFileSkipped(uri: string) {
    // 如果uri以skippedFileTypes中的类型开头，则跳过，插件自身log文件也是
    for (const fileType of skippedFileTypes) {
        if (uri.startsWith(fileType)) {
            return true
        }
        if (uri.includes(saveDir)) {
            return true
        }
    }
    return false
}

export function getLogItemFromOpenTextDocument(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = EventType.OpenTextDocument
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromCloseTextDocument(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = EventType.CloseTextDocument
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromChangeTextDocument(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = EventType.ChangeTextDocument
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromSaveFile(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = EventType.SaveFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromCreateFile(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = EventType.CreateFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromDeleteFile(uri: string) {
    const artifact = new logItem.Artifact(uri, logItem.ArtifactType.File)
    const eventType = EventType.DeleteFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromRenameFile(oldUri: string, newUri: string) {
    const artifact = new logItem.Artifact(newUri, logItem.ArtifactType.File)
    const eventType = EventType.RenameFile
    return new logItem.LogItem(eventType, artifact)
}

export function getLogItemFromMoveFile(oldUri: string, newUri: string) {
    const artifact = new logItem.Artifact(newUri, logItem.ArtifactType.File)
    const eventType = EventType.MoveFile
    return new logItem.LogItem(eventType, artifact)
}