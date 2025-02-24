const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'fileListData':
            handleFileListData(message.data);
            break;
        case 'fileChangeData':
            handleFileChangeData(message.data);
            break;
        case 'fileChangeError':
            document.getElementById('file-change').innerText = message.data;
            break;
    }
});

function handleFileListData(data){
    // console.log(JSON.parse(data));
    let fileListData = JSON.parse(data);
    let fileName = fileListData[0];
    let fileItemNum = fileListData[1];
    const checkboxList = document.getElementById('recent-logs-list');
    
    for (let i = 0; i < fileName.length; i++) {
        // console.log(fileName[i], fileItemNum[i]);
        const li = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = fileName[i];
        label.appendChild(checkbox);
        const span = document.createElement('span');
        span.innerHTML = `${fileName[i]}&nbsp;&nbsp;<sub>${fileItemNum[i]}条数据</sub>`
        label.appendChild(span);
        li.appendChild(label);
        checkboxList.appendChild(li);
    }
}
function handleFileChangeData(data){
    console.log(JSON.parse(data));
    let layout = {
        margin: {
            l: 5,
            r: 5,
            b: 5,
            t: 5
        }
    };
    Plotly.newPlot('file-change', JSON.parse(data), layout);
}

document.getElementById('btn-get-logs').onclick = () => {
    vscode.postMessage({command: 'logs.get'});
};

document.getElementById('btn-sub').onclick = () => {
    const checkboxes = document.querySelectorAll('#recent-logs-list input[type="checkbox"]:checked');
    const selectedValues = Array.from(checkboxes).map(checkbox => checkbox.value);
    // console.log(selectedValues);
    vscode.postMessage({command: 'logs.summary', data: JSON.stringify(selectedValues)});
};