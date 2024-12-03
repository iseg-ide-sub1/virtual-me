import * as vscode from 'vscode';

export class VirtualMeGUIViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'virtualme.GUIView';
    private _view?: vscode.WebviewView;
    private _logsNum: number = 0;
    set logsNum(newValue: number) {
        console.log(`Setting the value of myProperty to: ${newValue}`);
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
        webviewView.webview.onDidReceiveMessage(message => {
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
                <button id="btn-clear">Clear Log</button>
                <button id="btn-save">Save Log</button>
                <script src="${scriptUri}"></script>
                <h2>
                    <span>Items: </span>
                    <b id="logs-num">${this.logsNum}</b>
                </h2>
            </body>
            </html>`;
  }
}