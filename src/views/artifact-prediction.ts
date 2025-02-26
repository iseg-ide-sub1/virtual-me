import * as vscode from 'vscode';

export class ArtifactPredictionViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'virtualme.ArtifactPredictionView';
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
                <title>Artifact Prediction</title>
            </head>
            <body>
                工件预测模块<br>
                尚未开始开发
            </body>
            </html>`;
    }
}