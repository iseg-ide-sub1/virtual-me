import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as log from './types/log-item'

let logs: log.LogItem[] = []

export function activate(context: vscode.ExtensionContext) {

	// 数据结构简单测试
	// 在 virtual-me.activate 指令后会创建一个logs列表
	// 并保存到 /res/log/test.json 中，用于测试类的初始化和json化
	{
		let var_1: log.LogItem;
		let var_2: log.LogItem;
		let test_logs: log.LogItem[] = []
		var_1 = new log.LogItem(
			log.EventType.EditTextDocument, // 事件类型
			new log.Artifact( // 工件
				'var_a', // 工件名称
				log.ArtifactType.Variable, // 工件类型
				[// 工件层级，可选
					new log.Artifact('main', log.ArtifactType.Function),
					new log.Artifact('a', log.ArtifactType.Variable)
				]
			),
			new log.Context( // 上下文，可选
				log.ChangeType.Edit,
				{before: "a", after: "var_a"},
				{line: 10, character: 4},
				{line: 10, character: 8}
			)
		);
		var_2 = new log.LogItem(
			log.EventType.EditTextDocument, // 事件类型
			new log.Artifact( // 工件
				'var_a', // 工件名称
				log.ArtifactType.Variable // 工件类型
			)
		);

		test_logs = [var_1, var_2] // 事件列表

		// 转换为字符串
		const test_JSON = JSON.stringify(test_logs, (key, value) => {
			return value;
		},2);

		const extensionPath = path.join(__dirname, '..')
		const logDirectory = path.join(extensionPath, '/res/log')
		if (!fs.existsSync(logDirectory)) {
			fs.mkdirSync(logDirectory, { recursive: true })
		}
		const fileName = 'test.json'
		const filePath = path.join(logDirectory, fileName)
		fs.writeFileSync(filePath, test_JSON, 'utf8') // 写入文件
	}


	/** 注册命令：virtual-me.activate */
    const disposable = vscode.commands.registerCommand('virtual-me.activate', () => {
        vscode.window.showInformationMessage('Recording starts. Thanks for using VirtualMe!');
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}
