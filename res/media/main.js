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
    const target =  document.getElementById('logs-num');
    target.innerText = logsNum;
}

const btn_clear = document.getElementById('btn-clear');
btn_clear.addEventListener('click', () => {
    showConfirmDialog();
});

const btn_save = document.getElementById('btn-save');
btn_save.addEventListener('click', () => {
    vscode.postMessage({ command: 'virtualme.savelog' });
});

function onTaskChanged() {
    const selectedValue = document.querySelector('input[type="radio"]:checked').id;
    const taskCommand = 'virtualme.settask.' + selectedValue;
    vscode.postMessage({ command: taskCommand });
}

document.getElementById('confirm-yes').onclick = () => {
    vscode.postMessage({ command: 'virtualme.clear' });
    document.getElementById('confirm-dialog').style.display = 'none';
};

document.getElementById('confirm-no').onclick = () => {
    document.getElementById('confirm-dialog').style.display = 'none';
};

function showConfirmDialog() {
    document.getElementById('confirm-dialog').style.display = 'block';
}