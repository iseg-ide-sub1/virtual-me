import * as vscode from 'vscode'
import * as logItem from "../types/log-item"
import {EventType} from '../types/event-types'
import * as os from 'os';

const platform = os.platform();

export function removeAnsi(input: string) {
    const ansiRegex = /(?:\x1B\[[0-9;]*[A-Za-z])|(?:\x1B\][^\a]*\a)/g;
    return input.replace(ansiRegex, '');
}


export async function getLogItemFromTerminalExecute(
    terminal: vscode.Terminal,
    cmd: string,
    output: string,
): Promise<logItem.LogItem> {
    const processId = await terminal.processId
    const artifact = new logItem.Artifact(
        processId ? processId.toString() : 'unknown',
        logItem.ArtifactType.Terminal
    )
    output = removeAnsi(output)
    console.log(output)
    let context = new logItem.Context(
        logItem.ContextType.Terminal,
        {
            'before': cmd,
            'after': output,
        },
        {
            'line': 0,
            'character': 0,
        },
        {
            'line': 0,
            'character': 0,
        }
    )

    return new logItem.LogItem(
        EventType.ExecuteTerminalCommand,
        artifact,
        context
    )
}


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
        EventType.OpenTerminal,
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
        EventType.CloseTerminal,
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
        EventType.ChangeActiveTerminal,
        artifact
    )
}
