import * as vscode from 'vscode'
import * as logItem from './types/log-item'
import * as common from './utils/common'
import * as conextProcess from './utils/context-process'
import * as pluginTest from './test/plugin-test'

let logs: logItem.LogItem[] = []
let saved: boolean = false
// 以下数据用于 selectText 事件
let lastSelectStamp: number = 0;
let lastSelectStart: vscode.Position;
let lastSelectEnd: vscode.Position;
let lastSelectLogID: number;
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
		const selection = event.selections[0]
		if (selection.isEmpty) return // 只有选择内容不为空才记录
        const start = selection.start // 选择开始位置
        const end = selection.end // 选择结束位置
        if(new Date().getTime() - lastSelectStamp < 1000 && start.compareTo(lastSelectStart) <= 0 && end.compareTo(lastSelectEnd) >= 0){
            for(let i = logs.length - 1; i >= 0; i--) if(logs[i].id === lastSelectLogID){
                // 在鼠标连续选择时会产生大量高度相似数据，采用此方法删除满足条件的记录
                logs.splice(i, 1)
                break
            }
        }
        const document = event.textEditor.document // 当前编辑的文件
        const log = await conextProcess.getLogItemFromSelectedText(document, start, end)
        console.log('debug(log) =', log)
        logs.push(log)
        lastSelectStamp = new Date().getTime()
        lastSelectStart = start
        lastSelectEnd = end
        lastSelectLogID = log.id
	})
	context.subscriptions.push(selectTextWatcher)
}

export function deactivate() {
	if(!saved && logs.length){ // 如果之前没有手动保存过则自动保存
		common.saveLog(common.logsToString(logs));
	}
}
