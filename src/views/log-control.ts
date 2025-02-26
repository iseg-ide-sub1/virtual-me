import * as vscode from 'vscode';

export class LogControlViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'virtualme.LogControlView';
    private _view?: vscode.WebviewView;
    private _logsNum: number = 0;
    private _prevLog: string = "";
    private _displayInfo = {};

    // 需要在插件界面的更新的全部信息保存到字典里，一次性全部更新
    set displayInfo(newValue: any) {
        this._displayInfo = newValue;
        if (this._view) {
            this._view.webview.postMessage({command: 'updateDisplayInfo', displayInfo: this._displayInfo})
        }
    }

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
        // console.log(logItem.LogItem.currentTaskType.toLowerCase())
        webviewView.webview.onDidReceiveMessage(message => {
            // console.log("Msg form webview:", message);
            if (message?.debug) console.log("WebView DebugInfo:", message.debug);
            else if (message?.arg) vscode.commands.executeCommand(message.command, message.arg);
            else vscode.commands.executeCommand(message.command);
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/log-control.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/res/media/log-control.css'));
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>Log Control</title>
            </head>
            <body>
                <div class="control-div">
                    <input type="radio" name="rec-control" onchange="onRecordingSwitch()" id="rec-start" checked>
                    <label for="rec-start">正在记录</label>
                    <input type="radio" name="rec-control" onchange="onRecordingSwitch()" id="rec-stop">
                    <label for="rec-stop">暂停记录</label>
                </div>
<!--                <button id="btn-git-init" class="btn-macro">git init</button>-->
<!--                <button id="btn-git-snapshot" class="btn-macro">git snapshot</button>-->
                <p>如果觉得当收集的记录存在问题，可以通过下面的按钮清空当前缓存记录。</p>
                <button id="btn-clear">清空缓存</button>
                <div id="confirm-dialog" style="display:none;">
                    <p>你确定要清空缓存记录吗？</p>
                    <button id="confirm-yes" class="confirm-btn-l">是</button>
                    <button id="confirm-no" class="confirm-btn-r">否</button>
                </div>
                <p>插件会在 VS Code 关闭时自动保存缓存的记录，也可以通过下面的按钮手动保存记录。每次保存记录后将清空缓存的记录。</p>
                <button id="btn-save">保存记录</button>
                <hr style="margin: 20px 10%;">
                <p>下面表示的是您当前所处的开发状态，需要您手动选择当前所处于的状态。这相当于对收集数据进行标注，将为我们的模型训练提供依据。</p>
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
                    <input type="radio" name="task" onchange="onAddTask()" id="add-task">
                    <label for="add-task">新增状态</label>
                </div>
                <div id="confirm-input" style="display:none;">
                    <input type="text" id="new-task" class="task-input" placeholder="请输入新任务名称">
                    <input type="text" id="new-label" class="task-input" placeholder="请输入新任务标签">
                    <button id="input-yes" class="confirm-btn-l">是</button>
                    <button id="input-no" class="confirm-btn-r">否</button>
                    <div id="input-error" class="input-error" style="display:none;">
                        输入不符合要求！可能原因：
                        <li>新任务名称不完全由英文字母构成</li>
                        <li>新任务名称已经存在</li>
                        <li>新任务标签为空</li>
                    </div>
                </div>
                <hr style="margin: 20px 10%;">
                <div class="num-div">
                    <span>已收集数据：</span>
                    <b id="logs-num">0</b>
                </div>
                <div class="num-div">
                    <span>上一个动作：</span>
                    <b id="logs-prev">no logs</b>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}