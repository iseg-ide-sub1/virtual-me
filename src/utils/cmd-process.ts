import * as logItem from "../types/log-item"
import {EventType} from '../types/event-types'
import {getArtifactFromRange} from "./context-process";

const skippedCommands = [
    "setContext",
    '_workbench_openFolderSettings_file_',
    'virtualme',
]

const innerCmd = [
    'vscode_executeDocumentSymbolProvider',
    'vscode_prepareCallHierarchy',
    'vscode_provideIncomingCalls',
    'vscode_executeTypeDefinitionProvider',
    'vscode_executeDefinitionProvider',
    'vscode_executeReferenceProvider',
]

export function isCommandSkipped(commandName: string) {
    commandName = formatCommandName(commandName)
    for (const skippedCommand of skippedCommands) {
        if (commandName.includes(skippedCommand) || commandName === 'type') {
            return true
        }
    }
    return false
}

function formatCommandName(commandName: string) {
    return commandName.replace(/[.\-:#~ ]/g, '_');
}

function getEventTypeForCommand(commandName: string) {
    for (const eventType in EventType) {
        if (eventType === commandName) {
            return EventType[eventType as keyof typeof EventType]
        }
    }
    console.warn(`Command ${commandName} not found in EventType`)
    return EventType.Unknown
}

async function getArtifactFromCommand(args: any[] | undefined) {
    if (!args || args.length === 0)
        return new logItem.Artifact('null', logItem.ArtifactType.Null)
    if (args.length === 1 && args[0]._formatted) {  // �����ļ�
        return new logItem.Artifact(args[0]._formatted, logItem.ArtifactType.File)
    }
    if (args.length === 1 && args[0].uri) {// ��������
        return await getArtifactFromRange(args[0].uri, args[0].range.start, args[0].range.end)
    }
    if (args.length === 2) { // ������������uri��0, pos��1
        return await getArtifactFromRange(args[0], args[1], args[1])
    }
    return new logItem.Artifact('null', logItem.ArtifactType.Null)
}

export function deleteInnerCmdSeq(logs: logItem.LogItem[], thr = 10) {
    let seqCount = 0
    for (let i = 0; i < logs.length; i++) {
        if (innerCmd.includes(logs[i].eventType.toString())) {
            seqCount += 1
        }
        else {
            if (seqCount > thr) { // ɾ���������û���������������
                let start = Math.min(i - seqCount + 1, 0) // seqCount��ʼ��λ��
                logs.splice(start, seqCount); // ɾ�����seqCount������
                i = Math.max(start - 1, 0); // ��������
                console.warn('delete inner seq length: ', seqCount)
            }
            seqCount = 0
        }
    }
}

export async function handleCommand(commandName: string, args: any[] | undefined) {
    commandName = formatCommandName(commandName)
    const artifact = await getArtifactFromCommand(args)
    const eventType = getEventTypeForCommand(commandName)
    return new logItem.LogItem(eventType, artifact)
}



