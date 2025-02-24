import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

export class ActionSummaryViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'virtualme.ActionSummaryView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _logFolder: string
    ) {
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true, // 允许脚本
            localResourceRoots: [ // 允许装载资源的本地路径
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => {
            if(message.command === 'logs.get'){ // 获取最近文件
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders) {
                    vscode.window.showErrorMessage('No workspace folder found.');
                    return;
                }
                const eventPath = path.join(workspaceFolders[0].uri.fsPath, this._logFolder, 'event');
                try {
                    const eventFiles = fs.readdirSync(eventPath); // 读取目录中的文件列表
                    let eventItemNum: number[] = []
                    eventFiles.forEach(function(file) {
                        const filepath = path.join(eventPath, file);
                        if (!fs.statSync(filepath).isDirectory()) {
                            let fileContent = fs.readFileSync(filepath, 'utf8');
                            let fileData = JSON.parse(fileContent);
                            eventItemNum.push(fileData.length);
                        }
                    });
                    let filesData = `[${JSON.stringify(eventFiles)}, ${JSON.stringify(eventItemNum)}]`
                    webviewView.webview.postMessage({type: 'fileListData', data: filesData})
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to read files in ${eventPath}`);
                }
            }
            else if(message.command === 'logs.summary'){ // 刷新文件变化图
                // 指定 python 解释器
                const pyEnv = 'D:\\ML\\anaconda3\\envs\\d2l\\python.exe'
                // 指定运行模块
                const pyMod = path.join(this._extensionUri.fsPath, 'py_modules', 'log_summary', 'summary.py');
                // 创建子进程运行对应模块
                exec(`${pyEnv} ${pyMod}`, (error, stdout, stderr) => {
                    if (error) {
                        webviewView.webview.postMessage({type: 'fileChangeError', data: error.message})
                        return;
                    }
                    if (stderr) {
                        webviewView.webview.postMessage({type: 'fileChangeError', data: stderr})
                        return;
                    }
                    // console.log(stdout)
                    webviewView.webview.postMessage({type: 'fileChangeData', data: stdout})
                });
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {

        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/action-summary.js'));
        const plotlyUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/plotly-3.0.0.min.js'));
        
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/action-summary.css'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <script src="${plotlyUri}"></script>
                <title>Action Summary</title>
            </head>
            <body>
                <button id="btn-get-logs">获取最近操作记录</button>
                <ul id="recent-logs-list"></ul>
                <p id="result"></p>
                <button id="btn-sub">提交行为总结</button>
                <div id="file-change"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}