const vscode = acquireVsCodeApi();

document.getElementById('btn-summary').onclick = () => {
    vscode.postMessage({command: 'virtualme.logsummary'});
};