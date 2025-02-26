const vscode = acquireVsCodeApi();


// 监听插件发出的消息
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateDisplayInfo':
            updateDisplayInfo(message.displayInfo);
            break;
    }
});

function updateDisplayInfo(displayInfo) {
    // 更新日志数量
    const target1 = document.getElementById('logs-num');
    target1.innerText = displayInfo['logs-num'];
    // 更新上一次事件
    const target2 = document.getElementById('logs-prev');
    target2.innerText = displayInfo['logs-prev'];
}

// document.getElementById('btn-git-init').onclick = () => {
//     vscode.postMessage({command: 'virtualme.git-init'});
// }
//
// document.getElementById('btn-git-snapshot').onclick = () => {
//     vscode.postMessage({command: 'virtualme.git-snapshot'});
// }

// 清空日志按钮被点击
document.getElementById('btn-clear').onclick = () => {
    showConfirmDialog();
};

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
document.getElementById('btn-save').onclick = () => {
    vscode.postMessage({command: 'virtualme.savelog'});
};


// 记录状态被改变
function onRecordingSwitch() {
    const selectedValue = document.querySelector('.control-div input[type="radio"]:checked').id;
    if(selectedValue == 'rec-start'){
        vscode.postMessage({command: 'virtualme.start'});
    }
    else{
        vscode.postMessage({command: 'virtualme.stop'});
    }
}

// 任务状态被改变
function onTaskChanged() {
    document.getElementById('confirm-input').style.display = 'none';
    const selectedValue = document.querySelector('.task-div input[type="radio"]:checked').id;
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
    const findElement = document.getElementById(newTaskName.toLowerCase());
    if(findElement){
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