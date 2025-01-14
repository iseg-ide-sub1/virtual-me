import * as vscode from 'vscode'
import * as path from 'path'

import * as logItem from './types/log-item'
import {VirtualMeGUIViewProvider} from './types/gui-view'
import * as common from './utils/common'
import * as fileProcess from './utils/file-process'
import * as contextProcess from './utils/context-process'
import * as terminalProcess from './utils/terminal-process'
import * as menuProcess from './utils/cmd-process'

let logs: logItem.LogItem[] = []
export const saveDir = 'virtualme-logs' // 数据的保存位置
let lastText: string // 保存上一次编辑后的代码

let currentTerminal: vscode.Terminal | undefined; // 记录当前活动终端
let openFile: boolean = false // 是否打开了文件
export let isCalculatingArtifact = {value: 0} // 防止调用相关API时的vs内部的文件开关事件被记录
let isRecording = {value: false} // 是否正在记录

// 用于合并选择操作
let lastSelectStamp: number = 0;
let lastSelectStart: vscode.Position;
let lastSelectEnd: vscode.Position;
let lastSelectLog: logItem.LogItem;

// let cmdList: string[] = []


export function checkVersion() {
    try {
        const CommandWatcher = vscode.commands.onDidExecuteCommand((event: vscode.Command) => {
        })
    } catch (error) {
        vscode.window.showErrorMessage('VirtualMe 无法运行，请检查 VSCode 是否为定制内核！')
        return false
    }
    return true
}

export function activate(context: vscode.ExtensionContext) {
    if (!checkVersion()) {
        return
    }

    // 设置上下文变量，表示扩展已激活
    vscode.commands.executeCommand('setContext', 'virtualme.active', true)

    /** 注册命令：virtual-me.activate */
    const disposable = vscode.commands.registerCommand('virtualme.activate', () => {
        // 空命令，执行可以激活插件而不产生其他影响
    });
    context.subscriptions.push(disposable);

    /** 注册命令：virtual-me.start */
    const startCommand = vscode.commands.registerCommand('virtualme.start', () => {
        isRecording.value = true;
        vscode.window.showInformationMessage('VirtualMe 开始记录！');
    });
    context.subscriptions.push(startCommand);

    /** 注册命令：virtual-me.stop */
    const stopCommand = vscode.commands.registerCommand('virtualme.stop', () => {
        isRecording.value = false;
        if (logs.length === 0) return;
        common.saveLog(common.logsToString(logs), saveDir);
        vscode.window.showInformationMessage('停止记录！数据已保存至工作目录', saveDir);
        logs = [] // 清空保存的记录
    });
    context.subscriptions.push(stopCommand);

    /** 注册命令：virtual-me.clear */
    const clearLogs = vscode.commands.registerCommand('virtualme.clear', () => {
        logs = []
        vscode.window.showInformationMessage('已清除缓存数据!');
    });
    context.subscriptions.push(clearLogs);

    /** 注册命令：保存日志 */
    const saveLogCommand = vscode.commands.registerCommand('virtualme.savelog', () => {
        common.saveLog(common.logsToString(logs), saveDir);
        vscode.window.showInformationMessage('数据已保存至工作目录', saveDir);
        logs = [] // 清空保存的记录
    })
    context.subscriptions.push(saveLogCommand);

    /** 注册命令：注册状态类型 */
    const registerTaskCommand = vscode.commands.registerCommand('virtualme.register.tasktype', (taskType: string) => {
        console.log('Register Task Type:', taskType)
        const commandName = 'virtualme.settask.' + taskType.toLowerCase();
        const taskSetCommand = vscode.commands.registerCommand(commandName, () => {
            logItem.LogItem.currentTaskType = taskType;
        })
        context.subscriptions.push(taskSetCommand);
    })
    context.subscriptions.push(registerTaskCommand);

    /** 注册用于标记当前任务的命令 */
    for (const task of Object.values(logItem.TaskType)) {
        vscode.commands.executeCommand("virtualme.register.tasktype", task);
    }

    /** 提供图形化界面 */
    const GUIProvider = new VirtualMeGUIViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            VirtualMeGUIViewProvider.viewType,
            GUIProvider,
            {webviewOptions: {retainContextWhenHidden: true}}
        )
    );

    /** 打开文件 */
    const openTextDocumentWatcher = vscode.workspace.onDidOpenTextDocument(doc => {
        if (!isRecording.value) return;

        openFile = true
        if (fileProcess.isFileSkipped(doc.uri.toString())) return
        const log = fileProcess.getLogItemFromOpenTextDocument(doc.uri.toString())
        if (!isCalculatingArtifact.value) {
            logs.push(log)
        }
    })
    context.subscriptions.push(openTextDocumentWatcher)

    /** 关闭文件 */
    const closeTextDocumentWatcher = vscode.workspace.onDidCloseTextDocument(doc => {
        if (!isRecording.value) return;

        if (fileProcess.isFileSkipped(doc.uri.toString())) return
        const log = fileProcess.getLogItemFromCloseTextDocument(doc.uri.toString())
        if (!isCalculatingArtifact.value) {
            logs.push(log)
        }
    })
    context.subscriptions.push(closeTextDocumentWatcher)

    /** 切换当前文件 */
    const changeActiveTextDocumentWatcher = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (!isRecording.value) return;

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
            if (!isRecording.value) return;

            const log = fileProcess.getLogItemFromSaveFile(uri.toString())
            logs.push(log)
        })
        /** 文件创建 */
        filesWatcher.onDidCreate(uri => {
            if (!isRecording.value) return;

            const log = fileProcess.getLogItemFromCreateFile(uri.toString())
            logs.push(log)
        })
        /** 文件删除 */
        filesWatcher.onDidDelete(uri => {
            if (!isRecording.value) return;

            const log = fileProcess.getLogItemFromDeleteFile(uri.toString())
            logs.push(log)
        })
    } else {
        vscode.window.showInformationMessage('No workspace folders are open.')
    }
    /** 文件重命名或移动 */
    const renameFileWatcher = vscode.workspace.onDidRenameFiles((event) => {
        if (!isRecording.value) return;

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
        if (!isRecording.value) return;

        const selection = event.selections[0] // 只考虑第一个选区
        if (selection.isEmpty) return // 只有选择内容不为空才记录
        if (event.textEditor.document.uri.scheme !== 'file') return // 非文件不记录
        const start = selection.start // 选择开始位置
        const end = selection.end // 选择结束位置
        const document = event.textEditor.document // 当前编辑的文件
        const log = await contextProcess.getLogItemFromSelectedText(document, start, end)
        if (lastSelectStamp !== 0) {
            if (new Date().getTime() - lastSelectStamp > 2000 || start.compareTo(lastSelectStart) > 0 || end.compareTo(lastSelectEnd) < 0) {
                // 不满足合并条件
                logs.push(lastSelectLog)
            }
        }
        // console.log(log)
        lastSelectLog = log
        lastSelectStamp = new Date().getTime()
        lastSelectStart = start
        lastSelectEnd = end
    })
    context.subscriptions.push(selectTextWatcher)

    /** 修改文件内容(新增、删除、修改、Redo、Undo) */
    const changeTextDocumentWatcher = vscode.workspace.onDidChangeTextDocument(async (event: vscode.TextDocumentChangeEvent) => {
        if (!isRecording.value) return;

        if (event.contentChanges.length === 0) { // 脏状态改变
            lastText = event.document.getText()
            return
        }
        if (event.document.uri.scheme !== 'file') return // 非文件不记录
        let changeLogs = await contextProcess.getLogItemsFromChangedText(event, lastText)
        lastText = event.document.getText()
        // 重写合并逻辑，当用户手敲代码时，每次敲击键盘会被单独记录一次，形成长度为1的changeLogs，只检查这种情况下能否合并
        if (changeLogs.length !== 1 || logs.length === 0) {
            logs = logs.concat(changeLogs)
            return
        }
        // 合并日志
        let curLog = changeLogs[0]
        let lastLog = logs[logs.length - 1]
        const concatLogs = common.concatEditLogs(lastLog, curLog)
        logs.pop()
        logs = logs.concat(concatLogs)
    })
    context.subscriptions.push(changeTextDocumentWatcher)

    /** 鼠标悬停触发hover事件 */
    const hoverCollector = vscode.languages.registerHoverProvider('*', {
        async provideHover(document: vscode.TextDocument,
                           position: vscode.Position,
                           token: vscode.CancellationToken): Promise<vscode.Hover | undefined> {
            if (!isRecording.value) return;

            // 等待2秒，为了减少hover事件的触发频率
            const hoverTimeout = new Promise<{ cancelled: boolean }>((resolve) => {
                const timer = setTimeout(() => resolve({cancelled: false}), 1500); // 2秒延迟
                token.onCancellationRequested(() => {
                    clearTimeout(timer);
                    resolve({cancelled: true}); // 如果取消请求，则清除计时器
                });
            })

            // 如果2秒内被取消，返回 undefined，否则继续处理
            const timedOut = await hoverTimeout;
            if (timedOut.cancelled) {
                return undefined; // 悬停不足2秒，退出
            }

            // 2秒后继续执行逻辑
            const log = await contextProcess.getLogItemsFromHoverCollector(document, position)
            logs.push(log)
            return undefined;
        }
    })


    /** 打开终端 */
    const terminalOpenWatcher = vscode.window.onDidOpenTerminal(async (terminal: vscode.Terminal) => {
        if (!isRecording.value) return;

        const log = await terminalProcess.getLogItemFromOpenTerminal(terminal)
        logs.push(log)
    })
    context.subscriptions.push(terminalOpenWatcher)

    /** 关闭终端 */
    const terminalCloseWatcher = vscode.window.onDidCloseTerminal(async (terminal: vscode.Terminal) => {
        if (!isRecording.value) return;

        const log = await terminalProcess.getLogItemFromCloseTerminal(terminal)
        logs.push(log)
    })
    context.subscriptions.push(terminalCloseWatcher)

    /** 切换终端 */
    const terminalChangeWatcher = vscode.window.onDidChangeActiveTerminal(async (terminal: vscode.Terminal | undefined) => {
        if (!isRecording.value) return;

        if (!terminal) return; // 如果没有活动终端，则不记录
        const log = await terminalProcess.getLogItemFromChangeTerminal(currentTerminal, terminal)
        currentTerminal = terminal; // 更新当前终端
        logs.push(log)
    })
    context.subscriptions.push(terminalChangeWatcher)


    /** 终端执行 */
    const terminalExecuteWatcher = vscode.window.onDidStartTerminalShellExecution(async (event: vscode.TerminalShellExecutionStartEvent) => {
        if (!isRecording.value) return;

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

    /** IDE命令执行 */
    const CommandWatcher = vscode.commands.onDidExecuteCommand(async (event: vscode.Command) => {
        if (isCalculatingArtifact.value) return;
        if (!isRecording.value) return;
        if (menuProcess.isCommandSkipped(event.command)) return

        const log = await menuProcess.handleCommand(event.command, event.arguments)
        logs.push(log)
    })
    context.subscriptions.push(CommandWatcher)

    /** 每隔 500ms 更新一次日志数量 */
    function tntervalGetLogsNumTask() {
        const interval = setInterval(() => {
            if (logs.length >= 1000) {
                common.saveLog(common.logsToString(logs), saveDir);
                logs = [];
            }
            GUIProvider.logsNum = logs.length
        }, 500);
        return interval;
    }

    const updateLogsNumIntervalId = tntervalGetLogsNumTask();
    /** 销毁时清除定时任务 */
    context.subscriptions.push({
        dispose: () => {
            clearInterval(updateLogsNumIntervalId);
            console.log('Interval cleared.');
        },
    });
}


export function deactivate() {
    if (logs.length > 0) { // 如果还有没有保存的内容则自动保存
        if (lastSelectLog) logs.push(lastSelectLog);
        common.saveLog(common.logsToString(logs), saveDir);
    }
    // 清除上下文变量
    vscode.commands.executeCommand('setContext', 'virtualme.active', false)
}
