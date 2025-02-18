import * as vscode from 'vscode'
import * as logItem from "../../types/log-item"
import {EventType} from '../../types/event-types'
import * as os from 'os';
import * as commandTypes from './command-types'

const platform = os.platform();

let stripAnsi: any;
(async () => {
    stripAnsi = (await import("strip-ansi")).default;
})();

export class TerminalInfo {
    constructor(
        public readonly processId: string,
        public cmd: string,
        public output: string,
    ) { }

    public equals(other: TerminalInfo): boolean {
        return this.processId === other.processId && this.cmd === other.cmd && this.output === other.output;
    }
}

export function removeAnsi(input: string) {
    if (!stripAnsi) {
        console.error("Module strip-ansi is not loaded yet.");
        return input;
    }
    return stripAnsi(input);
}

// 获取命令类型，识别出命令中具有功能标志性的字段, 返回一个元组（命令类型、功能字段）,便于后续处理成in_features
// 如：输入 "npm run dev"，返回 ('CrossPlatformCommand', 'npm')
function getCmdType(cmd: string): [string, string] {
    //将cmd按空格拆分为数组
    const cmdArr = cmd.split(' ')
    for (const c of cmdArr) {
        // 如果c为参数则不是标志性字段
        if (c.startsWith('-') || c.startsWith('\\') || c.startsWith('/'))
            continue

        // 检查通用命令
        for (const type of Object.values(commandTypes.CrossPlatformCommand))
            if (c.includes(type))
                return ['CrossPlatform', type]

        // 检查Windows命令
        if (platform === 'win32')
            for (const type of Object.values(commandTypes.WindowsCommand))
                if (c.includes(type))
                    return ['Windows', type]
        // 检查Linux命令
        if (platform === 'linux')
            for (const type of Object.values(commandTypes.LinuxCommand))
                if (c.includes(type))
                    return ['Linux', type]
        // 检查Mac命令
        if (platform === 'darwin')
            for (const type of Object.values(commandTypes.LinuxCommand))
                if (c.includes(type))
                    return ['Mac', type]

        // 检查Python命令
        for (const type of Object.values(commandTypes.PythonProjectCommand))
            if (c.includes(type))
                return ['Python', type]

        // 检查JS命令
        for (const type of Object.values(commandTypes.JSProjectCommand))
            if (c.includes(type))
                return ['JS', type]

        // 检查Java命令
        for (const type of Object.values(commandTypes.JavaProjectCommand))
            if (c.includes(type))
                return ['Java', type]

        // 检查C++命令
        for (const type of Object.values(commandTypes.CProjectCommand))
            if (c.includes(type))
                return ['C++', type]

    }
    return ['Unknown', cmd]
}

export function getLogItemFromTerminalExecute(
    processId: string,
    cmd: string,
    output: string,
): logItem.LogItem {
    const artifact = new logItem.Artifact(
        processId,
        logItem.ArtifactType.Terminal
    )
    output = removeAnsi(output)
    console.log(output)
    const [cmdType, cmdFeature] = getCmdType(cmd)
    cmd = `<|${cmdType}|><|${cmdFeature}|>${cmd}`
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
