import * as vscode from 'vscode';

export class LogDisplayViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'virtualme.LogDisplayView';
    private _view?: vscode.WebviewView;

    constructor() {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Log Display</title>
            </head>
            <body>
                应该用 TreeView 形式展示，可以用树状结构展示但是收集记录的内容。优先度较低，到底要不要做？
            </body>
            </html>`;
    }
}