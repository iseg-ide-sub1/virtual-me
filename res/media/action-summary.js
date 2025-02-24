const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'fileChangeData':
            handleFileChangeData(message.data);
            break;
        case 'fileChangeError':
            document.getElementById('file-change').innerText = message.data;
    }
});

function handleFileChangeData(data){
    var layout = {
        margin: {
            l: 5,
            r: 5,
            b: 5,
            t: 5
        }
    };
    Plotly.newPlot('file-change', JSON.parse(data), layout);
    // console.log(JSON.parse(message.data));
}


document.getElementById('btn-refresh-fc').onclick = () => {
    vscode.postMessage({command: 'refresh.filechange'});
};