const vscode = acquireVsCodeApi();


// 监听插件发出的消息
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateLogsNum':
            updateLogsNum(message.logsNum);
            break;
        case 'updatePrevLog':
            updatePrevLog(message.prevLog);
            break;
    }
});

// 更新日志数量
function updateLogsNum(logsNum) {
    const target = document.getElementById('logs-num');
    target.innerText = logsNum;
}

// 更新上一次事件
function updatePrevLog(prevLog) {
    const target = document.getElementById('logs-prev');
    target.innerText = prevLog;
}

document.getElementById('btn-start').onclick = () => {
    vscode.postMessage({command: 'virtualme.start'});
};

document.getElementById('btn-stop').onclick = () => {
    vscode.postMessage({command: 'virtualme.stop'});
};

// 清空日志按钮被点击
const btn_clear = document.getElementById('btn-clear');
btn_clear.addEventListener('click', () => {
    showConfirmDialog();
});

// 显示确认清空日志的对话框
function showConfirmDialog() {
    document.getElementById('confirm-dialog').style.display = 'block';
}

// 确认删除日志
document.getElementById('confirm-yes').onclick = () => {
    vscode.postMessage({command: 'virtualme.clear'});
    document.getElementById('confirm-dialog').style.display = 'none';
};
// 取消删除日志
document.getElementById('confirm-no').onclick = () => {
    document.getElementById('confirm-dialog').style.display = 'none';
};


// 保存日志按钮被点击
const btn_save = document.getElementById('btn-save');
btn_save.addEventListener('click', () => {
    vscode.postMessage({command: 'virtualme.savelog'});
});


// 任务状态被改变
function onTaskChanged() {
    document.getElementById('confirm-input').style.display = 'none';
    const selectedValue = document.querySelector('input[type="radio"]:checked').id;
    const taskCommand = 'virtualme.settask.' + selectedValue;
    vscode.postMessage({command: taskCommand});
}


// 添加任务按钮被点击
function onAddTask() {
    document.getElementById('confirm-input').style.display = 'block';
}

// 确认添加任务
document.getElementById('input-yes').onclick = () => {
    const regex = /^[A-Za-z]+$/;
    const newTaskName = document.getElementById('new-task').value;
    const newLabelName = document.getElementById('new-label').value;
    if (!regex.test(newTaskName) || newLabelName.length === 0) {
        document.getElementById('input-error').style.display = 'block';
        return;
    }
    vscode.postMessage({command: 'virtualme.register.tasktype', arg: newTaskName});
    document.getElementById('input-error').style.display = 'none';
    document.getElementById('confirm-input').style.display = 'none';

    // 创建对应的状态单选框
    const taskDiv = document.querySelector('.task-div');
    const newTask = document.createElement('input');
    newTask.type = 'radio';
    newTask.name = 'task';
    newTask.id = newTaskName.toLowerCase();
    newTask.onchange = onTaskChanged;
    // 创建对应单选框的标签
    const newLabel = document.createElement('label');
    newLabel.htmlFor = newTask.id;
    newLabel.textContent = newLabelName;
    // 将新的 input 和 label 添加到 task-div 容器中
    taskDiv.appendChild(newTask);
    taskDiv.appendChild(newLabel);
    document.getElementById(newTaskName.toLowerCase()).checked = true;
    onTaskChanged();
};
// 取消添加任务
document.getElementById('input-no').onclick = () => {
    document.getElementById('confirm-input').style.display = 'none';
};