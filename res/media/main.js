const vscode = acquireVsCodeApi();

const btn_start = document.getElementById('btn-start');
btn_start.addEventListener('click', () => {
    vscode.postMessage({ command: 'virtualme.activate' });
});

const btn_save = document.getElementById('btn-save');
btn_save.addEventListener('click', () => {
    vscode.postMessage({ command: 'virtualme.savelog' });
});