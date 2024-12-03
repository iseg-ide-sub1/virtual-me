import * as vscode from 'vscode'
import * as path from 'path'

import * as logItem from './types/log-item'
import * as common from './utils/common'
import * as fileProcess from './utils/file-process'
import * as conextProcess from './utils/context-process'
import * as terminalProcess from './utils/terminal-process'
import * as menuProcess from './utils/menu-process'

let logs: logItem.LogItem[] = []
let isDev: boolean = false // 是否处在开发环境，该值影响数据的保存位置
let saved: boolean = false // 是否执行过保存指令
let lastText: string // 保存上一次编辑后的代码
let currentTerminal: vscode.Terminal | undefined; // 记录当前活动终端
let openFile : boolean = false // 是否打开了文件
export let isCalculatingArtifact = {value: false} // 防止调用相关API时的vs内部的文件开关事件被记录

export function activate(context: vscode.ExtensionContext) {

    /** 注册命令：virtual-me.activate */
    const disposable = vscode.commands.registerCommand('virtualme.activate', () => {
        logs = [] // 执行该命令会清空日志
        vscode.window.showInformationMessage('Recording starts. Thanks for using VirtualMe!');
    });
    context.subscriptions.push(disposable);

    /** 注册命令：保存日志 */
    const saveLogCommand = vscode.commands.registerCommand('virtualme.savelog', () => {
        saved = true;
        common.saveLog(common.logsToString(logs), isDev);
        vscode.window.showInformationMessage('Log file has been saved!');
        logs = [] // 清空保存的记录
    })
    context.subscriptions.push(saveLogCommand);

    /** 打开文件 */
    const openTextDocumentWatcher = vscode.workspace.onDidOpenTextDocument(doc => {
        openFile = true
        const log = fileProcess.getLogItemFromOpenTextDocument(doc.uri.toString())
        if (!isCalculatingArtifact.value){
            logs.push(log)
        }
    })
    context.subscriptions.push(openTextDocumentWatcher)

    /** 关闭文件 */
    const closeTextDocumentWatcher = vscode.workspace.onDidCloseTextDocument(doc => {
        const log = fileProcess.getLogItemFromCloseTextDocument(doc.uri.toString())
        if (!isCalculatingArtifact.value){
            logs.push(log)
        }
    })
    context.subscriptions.push(closeTextDocumentWatcher)

    /** 切换当前文件 */
    const changeActiveTextDocumentWatcher = vscode.window.onDidChangeActiveTextEditor(editor => {
        // 若当前关闭所有编辑视图，editor 值为 undefined
        // 切换编辑视图，会触发两次此事件，第一次 editor 值为 undefined
        if (editor === undefined || openFile) {
            openFile = false
            return
        }
        openFile = false
        const log = fileProcess.getLogItemFromChangeTextDocument(editor.document.uri.toString())
        logs.push(log)
    })
    context.subscriptions.push(changeActiveTextDocumentWatcher)

    if (vscode.workspace.workspaceFolders) {
        const filesWatcher = vscode.workspace.createFileSystemWatcher('**/*')
        /** 文件保存 */
        filesWatcher.onDidChange(uri => {
            const log = fileProcess.getLogItemFromSaveFile(uri.toString())
            logs.push(log)
        })
        /** 文件创建 */
        filesWatcher.onDidCreate(uri => {
            const log = fileProcess.getLogItemFromCreateFile(uri.toString())
            logs.push(log)
        })
        /** 文件删除 */
        filesWatcher.onDidDelete(uri => {
            const log = fileProcess.getLogItemFromDeleteFile(uri.toString())
            logs.push(log)
        })
    } else {
        vscode.window.showInformationMessage('No workspace folders are open.')
    }
    /** 文件重命名或移动 */
    const renameFileWatcher = vscode.workspace.onDidRenameFiles((event) => {
        for (const rename of event.files) {
            const oldPath = rename.oldUri.fsPath
            const newPath = rename.newUri.fsPath
            const oldUri = common.convertToFilePathUri(oldPath)
            const newUri = common.convertToFilePathUri(newPath)
            // 检查路径是否发生变化
            if (path.dirname(oldPath) === path.dirname(newPath)) {
                // 文件名改变了，认为是重命名
                const log = fileProcess.getLogItemFromRenameFile(oldUri, newUri)
                logs.push(log)
            } else {
                // 路径改变了，认为是移动
                const log = fileProcess.getLogItemFromMoveFile(oldUri, newUri)
                logs.push(log)
            }
        }
    })
    context.subscriptions.push(renameFileWatcher)

    /** 用光标选择文本内容 */
    const selectTextWatcher = vscode.window.onDidChangeTextEditorSelection(async event => {
        const selection = event.selections[0] // 只考虑有一个选区的情况
        if (selection.isEmpty) return // 只有选择内容不为空才记录
        if(event.textEditor.document.uri.scheme !== 'file') return // 非文件不记录
        const start = selection.start // 选择开始位置
        const end = selection.end // 选择结束位置
        const document = event.textEditor.document // 当前编辑的文件
        // console.log(document.uri.scheme)
        const log = await conextProcess.getLogItemFromSelectedText(document, start, end)
        logs.push(log)
        // console.log(event)
        // console.log(log)
    })
    context.subscriptions.push(selectTextWatcher)

    /** 修改文件内容(新增、删除、修改、Redo、Undo) */
    const changeTextDocumentWatcher = vscode.workspace.onDidChangeTextDocument(async (event: vscode.TextDocumentChangeEvent) => {
        if(event.contentChanges.length === 0){ // 脏状态改变
            lastText = event.document.getText()
            // console.log(lastText)
            return
        }
        if(event.document.uri.scheme !== 'file') return // 非文件不记录
        // console.log(event.document.uri.scheme)
        let changeLogs = await conextProcess.getLogItemsFromChangedText(event,lastText)
        logs = logs.concat(changeLogs)
        lastText = event.document.getText()
        // console.log(event)
        // console.log(changeLogs)
    })
    context.subscriptions.push(changeTextDocumentWatcher)

    /** 鼠标悬停触发hover事件 */
    const hoverCollector = vscode.languages.registerHoverProvider('*', {
        async provideHover(document, position, token) {
            const log = await conextProcess.getLogItemsFromHoverCollector(document, position)
            logs.push(log)
            // console.log(log)
            return null;
        }
    })

    /** 打开终端 */
    const terminalOpenWatcher = vscode.window.onDidOpenTerminal(async (terminal: vscode.Terminal) => {
        const log = await terminalProcess.getLogItemFromOpenTerminal(terminal)
        logs.push(log)
    })
    context.subscriptions.push(terminalOpenWatcher)

    /** 关闭终端 */
    const terminalCloseWatcher = vscode.window.onDidCloseTerminal(async (terminal: vscode.Terminal) => {
        const log = await terminalProcess.getLogItemFromCloseTerminal(terminal)
        logs.push(log)
    })
    context.subscriptions.push(terminalCloseWatcher)

    /** 切换终端 */
    const terminalChangeWatcher = vscode.window.onDidChangeActiveTerminal(async (terminal: vscode.Terminal | undefined) => {
        if (!terminal) return; // 如果没有活动终端，则不记录
        const log = await terminalProcess.getLogItemFromChangeTerminal(currentTerminal, terminal)
        currentTerminal = terminal; // 更新当前终端
        logs.push(log)
    })
    context.subscriptions.push(terminalChangeWatcher)

    /** 执行菜单项 */
    const menuItemCommands = generateCommands()
    menuItemCommands.forEach(({ command, callback }) => {
        const menuItemWatcher = vscode.commands.registerCommand(command, callback)
        context.subscriptions.push(menuItemWatcher)
    })

    /** 终端执行 */
    const terminalExecuteWatcher = vscode.window.onDidStartTerminalShellExecution(async (event: vscode.TerminalShellExecutionStartEvent) => {
        const terminal = event.terminal;
        const execution = event.execution;
        const cmd = execution.commandLine.value;
        const stream = execution.read();
        let output = '';
        for await (const data of stream) {
            output += data.toString();
        }
        const log = await terminalProcess.getLogItemFromTerminalExecute(terminal, cmd, output)
        logs.push(log)
    })
    context.subscriptions.push(terminalExecuteWatcher)

}

export function deactivate() {
	if(!saved && logs.length){ // 如果之前没有手动保存过则自动保存
		common.saveLog(common.logsToString(logs), isDev);
	}
}

function generateCommands(): { command: string, callback: () => void }[] {
    return menuProcess.commandDescriptions.map<{ command: string, callback: () => void }>((commandDesc) => {
        return {
            command: commandDesc.newCommand,
            callback: () => handleCommand(commandDesc.description, commandDesc.oldCommand) 
        }
    });
}

function handleCommand(commandName: string, oldCommand: string): void {
    const artifact = new logItem.Artifact(commandName, logItem.ArtifactType.MenuItem)
    const eventType = logItem.EventType.ExecuteMenuItem
    const log = new logItem.LogItem(eventType, artifact)
    logs.push(log)
    vscode.commands.executeCommand(oldCommand)
}