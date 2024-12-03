const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateLogsNum':
            updateLogsNum(message.logsNum);
            break;
    }
});

const btn_start = document.getElementById('btn-clear');
btn_start.addEventListener('click', () => {
    vscode.postMessage({ command: 'virtualme.clear' });
});

const btn_save = document.getElementById('btn-save');
btn_save.addEventListener('click', () => {
    vscode.postMessage({ command: 'virtualme.savelog' });
});

function updateLogsNum(logsNum) {
    target =  document.getElementById('logs-num');
    target.innerText = logsNum;
}