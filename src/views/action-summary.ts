import * as vscode from 'vscode';
import * as path from 'path'
import { exec } from 'child_process';

export class ActionSummaryViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'virtualme.ActionSummaryView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
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
            if(message.command === 'refresh.filechange'){ // 刷新文件变化图
                // 指定 python 解释器
                const pyEnv = 'D:\\ML\\anaconda3\\envs\\d2l\\python.exe'
                // 指定运行模块
                const pyMod = path.join(this._extensionUri.fsPath, 'src', 'py_modules', 'log_summary', 'file_change.py');
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
                    console.log(stdout)
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
                <button id="btn-refresh-fc">获取文件变更记录</button>
                <div id="file-change"></div>
                <button id="btn-refresh-avf">获取工件访问频率</button>
                <div id="artifact-vis-freq"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}