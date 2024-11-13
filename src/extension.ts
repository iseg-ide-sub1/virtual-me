import * as vscode from 'vscode'
import * as logItem from './types/log-item'
import * as common from './utils/common'
import * as conextProcess from './utils/context-process'
import * as pluginTest from './test/plugin-test'

let logs: logItem.LogItem[] = []
let saved: boolean = false
export function activate(context: vscode.ExtensionContext) {

    // 测试LogItem的初始化和保存功能
    // 可以先去看看对应代码，无需使用时将下面注释掉
    pluginTest.saveTest()

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
		// 待实现
	})
	context.subscriptions.push(selectTextWatcher)
}

export function deactivate() {
	if(!saved && logs.length){ // 如果之前没有手动保存过则自动保存
		common.saveLog(common.logsToString(logs));
	}
}
