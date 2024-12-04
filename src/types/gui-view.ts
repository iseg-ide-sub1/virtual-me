import * as vscode from 'vscode';
import * as logItem from '../types/log-item'

export class VirtualMeGUIViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'virtualme.GUIView';
    private _view?: vscode.WebviewView;
    private _logsNum: number = 0;
    set logsNum(newValue: number) {
        // console.log(`Setting the value of myProperty to: ${newValue}`);
        this._logsNum = newValue;
        if(this._view){
            this._view.webview.postMessage({command: 'updateLogsNum', logsNum: this._logsNum})
        }
    }
    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

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
        console.log(logItem.LogItem.currentTaskType.toLowerCase())
        webviewView.webview.onDidReceiveMessage(message => {
            // console.log("Msg form webview:", message);
            vscode.commands.executeCommand(message.command);
		});
    }
    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/main.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/main.css'));
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>VirtualMe</title>
            </head>
            <body>
                <p>如果觉得当收集的记录存在问题，可以通过下面的按钮清空当前缓存记录。</p>
                <button id="btn-clear">清空记录</button>
                <div id="confirm-dialog" style="display:none;">
                    <p>你确定要清空记录吗？</p>
                    <button id="confirm-yes" class="confirm-btn">是</button>
                    <button id="confirm-no" class="confirm-btn">否</button>
                </div>
                <p>插件会在 VS Code 关闭时自动保存缓存的记录，也可以通过下面的按钮手动保存记录。每次保存记录后将清空缓存的记录。</p>
                <button id="btn-save">保存记录</button>
                <p>若要了解插件的更多信息。请参阅<a href="https://github.com/iseg-ide-sub1/virtual-me">我们的项目</a>。</p>
                <hr style="margin: 20px 10%;">
                <p>下面是您当前所处开发状态的标记，为了我们项目的模型训练，需要您在处于选择对应状态。</p>
                <div class="task-div">
                    <input type="radio" name="task" onchange="onTaskChanged()" id="configuration" >
                    <label for="configuration">环境配置</label>
                    <input type="radio" name="task" onchange="onTaskChanged()" id="view">
                    <label for="view">调查阅读</label>
                    <input type="radio" name="task" onchange="onTaskChanged()" id="coding">
                    <label for="coding">编写代码</label>
                    <input type="radio" name="task" onchange="onTaskChanged()" id="execution">
                    <label for="execution">执行验证</label>
                    <input type="radio" name="task" onchange="onTaskChanged()" id="unknown" checked>
                    <label for="unknown">未选择</label>
                </div>
                <hr style="margin: 20px 10%;">
                <div class="num-div">
                    <span>已收集数据：</span>
                    <b id="logs-num">${this.logsNum}</b>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
  }
}