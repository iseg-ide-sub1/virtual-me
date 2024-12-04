const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateLogsNum':
            updateLogsNum(message.logsNum);
            break;
    }
});

function updateLogsNum(logsNum) {
    target =  document.getElementById('logs-num');
    target.innerText = logsNum;
}

const btn_clear = document.getElementById('btn-clear');
btn_clear.addEventListener('click', () => {
    vscode.postMessage({ command: 'virtualme.clear' });
});

const btn_save = document.getElementById('btn-save');
btn_save.addEventListener('click', () => {
    vscode.postMessage({ command: 'virtualme.savelog' });
});

function onTaskChanged() {
    const selectedValue = document.querySelector('input[name="task"]:checked').value;
    const taskCommand = 'virtualme.settask.' + selectedValue;
    vscode.postMessage({ command: taskCommand });
}