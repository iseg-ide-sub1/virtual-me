import * as logItem from "../types/log-item"
import {EventType} from '../types/event-types'

const skippedFileTypes = new Set([
    'virtualme-logs',
    '.DS_Store',
    '.cache',
    '.conan',
    '.dart_tool',
    '.eslint',
    '.gradle',
    '.idea',
    '.git',
    '.m2',
    '.mvn',
    '.nuxt',
    '.output',
    '/_/',
    '.settings',
    '.stack-work',
    '.vscode',
    '.vscode-scm',
    'bin/',
    'build/',
    '_build',
    '.build',
    'composer.lock',
    'Cargo.lock',
    '.cargo',
    'Gemfile.lock',
    'mix.lock',
    'node_modules',
    'package-lock.json',
    'pnpm-lock.yaml',
    'poetry.lock',
    'pubspec.lock',
    '__pycache__',
    'site-packages',
    'vendor/',
    'virtualenv',
    'venv/',
    'vcpkg_installed',
    '.pyc',
    '.csproj',
    '.fsproj',
    '.vbproj',
    'packages',
]);


export function isFileSkipped(uri: string) {
    // 如果uri包含skippedFileTypes中的任何一个，则跳过，插件自身log文件也是
    for (const fileType of skippedFileTypes) {
        if (uri.includes(fileType)) {
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