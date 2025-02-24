import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { exec } from 'child_process';

import * as logItem from './types/log-item'
import * as common from './utils/common'
import * as fileProcess from './utils/file-process'
import * as contextProcess from './utils/context-process'
import * as terminalProcess from './utils/terminal/terminal-process'
import {TerminalInfo} from './utils/terminal/terminal-process'
import * as menuProcess from './utils/cmd-process'
import * as git from './utils/git'

import {LogControlViewProvider} from './views/log-control'
import {ActionSummaryViewProvider} from './views/action-summary'
import {DeveloperAnalysisViewProvider} from './views/developer-analysis'


//*****************************************************************
// 需要人工配置的内容，每次发布新版本前都要检查一下
export const saveDir = {value: 'virtualme-logs'} // 数据的保存位置
export const plugin_version = 'v0.3.0' // 插件版本
export const maxLogItemsNum = 1000 // 允许缓存的最大命令数量，超过后自动进行保存
//*****************************************************************


let logs: logItem.LogItem[] = []
let terminal_cache: terminalProcess.TerminalInfo[] = []

let lastText: string // 保存上一次编辑后的代码

let currentTerminal: vscode.Terminal | undefined; // 记录当前活动终端
let openFile: boolean = false // 是否打开了文件
export let isCalculatingArtifact = {value: 0} // 防止调用相关API时的vs内部的文件开关事件被记录
export let isRecording = {value: true} // 是否正在记录，默认激活插件时开始记录

// 用于合并选择操作
let lastSelectStamp: number = 0;
let lastSelectStart: vscode.Position;
let lastSelectEnd: vscode.Position;
let lastSelectLog: logItem.LogItem;
export let extensionPath = '';

export function checkVersion() {
    try {
        const CommandWatcher = vscode.commands.onDidExecuteCommand((event: vscode.Command) => {
        })
    } catch (error) {
        vscode.window.showErrorMessage('VirtualMe 无法运行，请检查 VS Code 是否为定制内核！')
        return false
    }
    return true
}

export async function activate(context: vscode.ExtensionContext) {
    if (!checkVersion()) {
        return
    }
    // 保存扩展路径
    extensionPath = context.extensionPath;
    console.log(extensionPath)
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
        vscode.window.showInformationMessage('VirtualMe 暂停记录！');

        // common.saveLog(common.logsToString(logs), saveDir.value);
        // vscode.window.showInformationMessage(`记录停止，数据已保存至工作目录 ${saveDir.value}`);
        // logs = [] // 清空保存的记录
    });
    context.subscriptions.push(stopCommand);

    /** 注册命令：virtual-me.git-init */
    const gitCommandInit = vscode.commands.registerCommand('virtualme.git-init', async () => {
        await git.init()
    });
    context.subscriptions.push(gitCommandInit);

    /** 注册命令：virtual-me.git-snapshot */
    const gitCommandSnapshot = vscode.commands.registerCommand('virtualme.git-snapshot', async () => {
        await git.snapshot()
    });
    context.subscriptions.push(gitCommandSnapshot);

    /** 注册命令：virtual-me.clear */
    const clearLogs = vscode.commands.registerCommand('virtualme.clear', () => {
        logs = []
        vscode.window.showInformationMessage('已清除缓存数据!');
    });
    context.subscriptions.push(clearLogs);

    /** 注册命令：保存日志 */
    const saveLogCommand = vscode.commands.registerCommand('virtualme.savelog', () => {
        common.saveLog(common.logsToString(logs), saveDir.value);
        vscode.window.showInformationMessage(`数据已保存至工作目录 ${saveDir.value}`);
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




    // 以下计划已经废弃，待删除 2025.02.23
    // /** 注册命令：virtualme.logsummary，展示日志总结页面 */
    // const logSummary = vscode.commands.registerCommand('virtualme.logsummary', () => {
    //     const summaryPanel = vscode.window.createWebviewPanel(
    //         'logSummary',
    //         "Log Summary",
    //         vscode.ViewColumn.One,
    //         {
    //             localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'res', 'media'))]
    //         }
    //     );
    //     summaryPanel.webview.html = `<!DOCTYPE html>
    //         <html lang="en">
    //         <head>
    //             <meta charset="UTF-8">
    //             <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //             <script src='https://cdn.plot.ly/plotly-3.0.0.min.js'></script>
    //             <title>Action Summary</title>
    //         </head>
    //         <body>
    //             <button>刷新</button>
    //             <div id="file-change"></div>
    //             <script>
    //                 data = [{
    //                     type: "treemap",
    //                     labels: ["Eve", "Cain", "Seth", "Enos", "Noam", "Abel", "Awan", "Enoch", "Azura"],
    //                     parents: ["", "Eve", "Eve", "Seth", "Seth", "Eve", "Eve", "Awan", "Eve" ]
    //                 }]
    //                 Plotly.newPlot('file-change', data)
    //             </script>
    //         </body>
    //         </html>`;
    // });
    // context.subscriptions.push(logSummary);




    /** 提供图形化界面 */
    // 调试命令：Developer: Toggle Developer Tools
    // 日志控制页面
    const logControlViewProvider = new LogControlViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            LogControlViewProvider.viewType,
            logControlViewProvider,
            {webviewOptions: {retainContextWhenHidden: true}}
        )
    );
    // 行为总结页面
    const actionSummaryViewProvider = new ActionSummaryViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ActionSummaryViewProvider.viewType,
            actionSummaryViewProvider,
            {webviewOptions: {retainContextWhenHidden: true}}
        )
    );
    // 开发者分析页面
    const developerAnalysisViewProvider = new DeveloperAnalysisViewProvider();
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            DeveloperAnalysisViewProvider.viewType,
            developerAnalysisViewProvider,
            {webviewOptions: {retainContextWhenHidden: true}}
        )
    );



    
    /** 打开文件 */
    const openTextDocumentWatcher = vscode.workspace.onDidOpenTextDocument(doc => {
        if (!isRecording.value) return;

        openFile = true
        if (fileProcess.isFileSkipped(doc.uri.fsPath.toString())) return
        const log = fileProcess.getLogItemFromOpenTextDocument(doc.uri.fsPath.toString())
        if (!isCalculatingArtifact.value) {
            logs.push(log)
        }
    })
    context.subscriptions.push(openTextDocumentWatcher)

    /** 关闭文件 */
    const closeTextDocumentWatcher = vscode.workspace.onDidCloseTextDocument(doc => {
        if (!isRecording.value) return;

        if (fileProcess.isFileSkipped(doc.uri.fsPath.toString())) return
        const log = fileProcess.getLogItemFromCloseTextDocument(doc.uri.fsPath.toString())
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
        const log = fileProcess.getLogItemFromChangeTextDocument(editor.document.uri.fsPath.toString())
        logs.push(log)
    })
    context.subscriptions.push(changeActiveTextDocumentWatcher)

    if (vscode.workspace.workspaceFolders) {
        const filesWatcher = vscode.workspace.createFileSystemWatcher('**/*')
        /** 文件保存 */
        filesWatcher.onDidChange(uri => {
            if (!isRecording.value) return;
            if (fileProcess.isFileSkipped(uri.fsPath.toString())) return
            git.addFileToHistory(uri.fsPath.toString())

            const log = fileProcess.getLogItemFromSaveFile(uri.fsPath.toString())
            logs.push(log)
        })
        /** 文件创建 */
        filesWatcher.onDidCreate(uri => {
            if (!isRecording.value) return;
            if (fileProcess.isFileSkipped(uri.fsPath.toString())) return
            git.addFileToHistory(uri.fsPath.toString())

            const log = fileProcess.getLogItemFromCreateFile(uri.fsPath.toString())
            logs.push(log)
        })
        /** 文件删除 */
        filesWatcher.onDidDelete(uri => {
            if (!isRecording.value) return;
            if (fileProcess.isFileSkipped(uri.fsPath.toString())) return
            git.addFileToHistory(uri.fsPath.toString())

            const log = fileProcess.getLogItemFromDeleteFile(uri.fsPath.toString())
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
            if (fileProcess.isFileSkipped(oldUri.toString())) continue
            if (fileProcess.isFileSkipped(newUri.toString())) continue
            git.addFileToHistory(newUri.toString())

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
                // 不满足合并条件，不能合并，将上一次选区操作放入记录
                logs.push(lastSelectLog)
            }
        }
        // console.log(log)
        // 满足条件合并上一次选区记录
        lastSelectLog = log
        lastSelectStamp = new Date().getTime()
        lastSelectStart = start
        lastSelectEnd = end
    })
    context.subscriptions.push(selectTextWatcher)

    /** 修改文件内容(新增、删除、修改、Redo、Undo) */
    const changeTextDocumentWatcher = vscode.workspace.onDidChangeTextDocument(async (event: vscode.TextDocumentChangeEvent) => {
        if (!isRecording.value) return;
        if (fileProcess.isFileSkipped(event.document.uri.fsPath.toString())) return
        git.addFileToHistory(event.document.uri.fsPath.toString())

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
                const timer = setTimeout(() => resolve({cancelled: false}), 1000); // 1秒延迟
                token.onCancellationRequested(() => {
                    clearTimeout(timer);
                    resolve({cancelled: true}); // 如果取消请求，则清除计时器
                });
            })

            // 如果1秒内被取消，返回 undefined，否则继续处理
            const timedOut = await hoverTimeout;
            if (timedOut.cancelled) {
                return undefined; // 悬停时间不足，退出
            }

            // 延迟后继续执行逻辑
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


    /** 终端执行开始，记录命令、输出 */
    const terminalExecuteStartWatcher = vscode.window.onDidStartTerminalShellExecution(async (event: vscode.TerminalShellExecutionStartEvent) => {
        if (!isRecording.value) return;

        const processId_ori = await event.terminal.processId;
        const processId = processId_ori ? processId_ori.toString() : 'unknown'
        const execution = event.execution;
        const cmd = execution.commandLine.value;
        const stream = execution.read();
        let output = '';

        let terminal_log = new TerminalInfo(
            processId,
            cmd,
            output,
        )
        terminal_cache.push(terminal_log)

        console.log('terminal execute record start')
        for await (const data of stream) {
            output += data.toString();
        }
        console.log('terminal execute record end')
        if (terminal_log.output.length > 0) { // 另一个watcher已经记录了成功情况
            output = terminal_log.output.concat(output)
            const log = terminalProcess.getLogItemFromTerminalExecute(processId, cmd, output)
            logs.push(log)
            // 删除缓存中的这条记录
            for (let i = 0; i < terminal_cache.length; i++) {
                if (terminal_cache[i].equals(terminal_log)) {
                    terminal_cache.splice(i, 1);
                }
            }
        } else { // 尚未记录成功情况，该记录留在缓存中
            terminal_log.output = output
        }
    })
    context.subscriptions.push(terminalExecuteStartWatcher)

    /** 终端执行结束，记录执行成功或失败 */
    const terminalExecuteEndWatcher = vscode.window.onDidEndTerminalShellExecution(async (event: vscode.TerminalShellExecutionEndEvent) => {
        if (!isRecording.value) return;

        const processId_ori = await event.terminal.processId;
        const processId = processId_ori ? processId_ori.toString() : 'unknown'
        const execution = event.execution;
        const exitCode = event.exitCode;
        const cmd = execution.commandLine.value;
        console.log('terminal execute end, in function')

        // 检查已缓存的terminal_logs中与之对应的命令，倒序遍历
        for (let i = terminal_cache.length - 1; i >= 0; i--) {
            const terminal_log = terminal_cache[i];
            if (terminal_log.processId === processId && terminal_log.cmd === cmd) { // 找到对应的记录，更新其输出内容和状态
                let tag = ''
                if (exitCode === undefined) {
                    tag = 'Executed Unknown'
                } else if (exitCode === 0) {
                    tag = 'Executed Successfully'
                } else {
                    tag = 'Executed Failed'
                }

                if (terminal_log.output.length > 0) { // 另一个watcher已经记录了输出情况，对应另一个watcher的else分支
                    const output = `<|${tag}|>${terminal_log.output}`
                    const log = terminalProcess.getLogItemFromTerminalExecute(processId, cmd, output)
                    logs.push(log)
                    // 从缓存中删除该记录
                    terminal_cache.splice(i, 1)
                } else { // 尚未记录输出情况，对应另一个watcher的if分支
                    terminal_log.output = `<|${tag}|>`
                }
                return
            }
        }
        console.warn('terminal execute end, no corresponding log found')
    })
    context.subscriptions.push(terminalExecuteEndWatcher)

    /** IDE命令执行 */
    const CommandWatcher = vscode.commands.onDidExecuteCommand(async (event: vscode.Command) => {
        if (isCalculatingArtifact.value) {
            console.warn('Calculating artifact, skip command:', event.command)
            return
        }
        if (!isRecording.value) return
        if (menuProcess.isCommandSkipped(event.command)) {
            console.warn('Command skipped:', event.command)
            return
        }

        const log = await menuProcess.handleCommand(event.command, event.arguments)
        logs.push(log)
    })
    context.subscriptions.push(CommandWatcher)

    /** 每隔 500ms 更新一次日志数量和上一次操作的事件类型 */
    function intervalUpdater() {
        const interval = setInterval(() => {
            if (logs.length >= 1000) {
                common.saveLog(common.logsToString(logs), saveDir.value);
                logs = [];
            }
            let displayInfo = {
                'logs-num': logs.length,
                'logs-prev': logs.length === 0 ? "no logs" : logs[logs.length - 1].eventType.toString()
            }
            logControlViewProvider.displayInfo = displayInfo
        }, 500);
        return interval;
    }

    const updater = intervalUpdater();
    /** 销毁时清除定时任务 */
    context.subscriptions.push({
        dispose: () => {
            clearInterval(updater);
            console.log('Interval cleared.');
        },
    })

    await git.init() // 初始化internal-git
}


export function deactivate() {
    if (logs.length > 0) { // 如果还有没有保存的内容则自动保存
        if (lastSelectLog) logs.push(lastSelectLog);
        common.saveLog(common.logsToString(logs), saveDir.value);
    }
}





