import * as vscode from 'vscode'
import * as logItem from './types/log-item'
import * as common from './utils/common'
import * as conextProcess from './utils/context-process'
import * as pluginTest from './test/plugin-test'
import * as terminalProcess from './utils/terminal-process'

let logs: logItem.LogItem[] = []
let saved: boolean = false // 是否执行过保存指令
let lastText: string // 保存上一次编辑后的代码
export function activate(context: vscode.ExtensionContext) {

    // 测试LogItem的初始化和保存功能
    // 可以先去看看对应代码，无需使用时将下面注释掉
    // pluginTest.saveTest()

    /** 注册命令：virtual-me.activate */
    const disposable = vscode.commands.registerCommand('virtualme.activate', () => {
		logs = [] // 启动时清空日志
        vscode.window.showInformationMessage('Recording starts. Thanks for using VirtualMe!');
    });
    context.subscriptions.push(disposable);

    /** 注册命令：保存日志 */
    const saveLogCommand = vscode.commands.registerCommand('virtualme.savelog', () => {
		saved = true;
        common.saveLog(common.logsToString(logs));
        vscode.window.showInformationMessage('Log file has been saved!');
    })
    context.subscriptions.push(saveLogCommand);

    /** 用光标选择文本内容 */
	const selectTextWatcher = vscode.window.onDidChangeTextEditorSelection(async event => {
		const selection = event.selections[0] // 只考虑有一个选区的情况
		if (selection.isEmpty) return // 只有选择内容不为空才记录
        const start = selection.start // 选择开始位置
        const end = selection.end // 选择结束位置
        const document = event.textEditor.document // 当前编辑的文件
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
        let changeLogs = await conextProcess.getLogItemsFromChangedText(event,lastText)
        logs = logs.concat(changeLogs)
        lastText = event.document.getText()
        // console.log(event)
        // console.log(changeLogs)
	})
	context.subscriptions.push(changeTextDocumentWatcher)
    /** 打开终端 */
    const terminalOpenWatcher = vscode.window.onDidOpenTerminal(async terminal => {
        const log = await terminalProcess.getLogItemFromOpenTerminal(terminal)
        logs.push(log)
    })
    context.subscriptions.push(terminalOpenWatcher)
    /** 关闭终端 */
    const terminalCloseWatcher = vscode.window.onDidCloseTerminal(async terminal => {
        const log = await terminalProcess.getLogItemFromCloseTerminal(terminal)
        logs.push(log)
    })
    context.subscriptions.push(terminalCloseWatcher)
}

export function deactivate() {
	if(!saved && logs.length){ // 如果之前没有手动保存过则自动保存
		common.saveLog(common.logsToString(logs));
	}
}
