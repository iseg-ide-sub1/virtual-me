import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import * as logItem from '../types/log-item'
import * as vscode from 'vscode'
/**
 * 获取格式化的当前时间字符串，包括年月日时分秒和毫秒。
 * @returns {string} 格式化的当前时间。
 */
export function getFormattedTime() {
    const now = new Date()
    // 获取年月日小时分钟秒和毫秒
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // getMonth() 返回的月份从0开始，所以需要加1
    const day = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const milliseconds = now.getMilliseconds()

    // 格式化月份、日期、小时、分钟、秒和毫秒，不足两位数的前面补零
    const formattedMonth = month.toString().padStart(2, '0')
    const formattedDay = day.toString().padStart(2, '0')
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')
    const formattedMilliseconds = milliseconds.toString().padStart(3, '0')

    // 组合成最终的字符串
    const formattedTime = `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`
    return formattedTime
}

/**
 * 将日志列表转换为文本字符串
 * @param logs 日志列表
 * @returns 日志列表的字符串
 */
export function logsToString(logs: logItem.LogItem[]): string {
    for(let i = 0; i < logs.length; i++){
        if(logs[i]?.artifact?.references){
            logs[i].references = JSON.parse(JSON.stringify(logs[i].artifact.references)) // 深拷贝
            delete logs[i].artifact.references // 删除 artifact.reference 属性，减少层级
        }
    }
    return JSON.stringify(logs, (key, value) => {
        return value;
    },2);
}

/**
 * 获取格式化的当前时间字符串，包括年月日时分秒，时间用点号分隔
 * @returns {string} 格式化的当前时间。
 */
export function getFormattedTime1() {
    const now = new Date()
    // 获取年月日小时分钟秒和毫秒
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // getMonth() 返回的月份从0开始，所以需要加1
    const day = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    // 格式化月份、日期、小时、分钟、秒和毫秒，不足两位数的前面补零
    const formattedMonth = month.toString().padStart(2, '0')
    const formattedDay = day.toString().padStart(2, '0')
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')

    // 组合成最终的字符串
    const formattedTime = `${year}-${formattedMonth}-${formattedDay} ${formattedHours}.${formattedMinutes}.${formattedSeconds}`
    return formattedTime
}

/**
 * 将内容保存到指定路径文件夹中，默认为 /res/log 文件夹
 * @param content 要保存的文件内容
 * @param isDev 是否处在开发环境，如果是保存到开发环境的 ./res/log 文件夹，否则保存到工作环境的 ./log 文件夹
 * @param fileName 文件名，默认为当前日期时间
 */
export function saveLog(content: string, isDev: boolean = true, fileName = ''){
    let saveDirectory: string = '';
    if(isDev){
        const extensionPath = path.join(__dirname, '..')
        saveDirectory = path.join(extensionPath, '/res/log')
    }
    else{
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }
        saveDirectory = path.join(workspaceFolders[0].uri.fsPath, './log');
    }
    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory, { recursive: true })
    }
    // 如果名称为空，用日期替代
    if(fileName === '') fileName = getFormattedTime1() + '.json'
    const filePath = path.join(saveDirectory, fileName)
    fs.writeFileSync(filePath, content, 'utf8') // 写入文件
}


// 辅助函数：将本地路径转换为file://格式的URL
export function convertToFilePathUri(filePath: string) {
    // 使用path模块规范化路径
    const normalizedPath = path.normalize(filePath)
    // 将路径中的反斜杠替换为正斜杠
    const slashPath = normalizedPath.replace(/\\/g, '/')
    // 使用url模块将路径转换为file://格式的URL
    const fileUri = url.format({
        protocol: 'file',
        slashes: true,
        pathname: slashPath
    })
    return fileUri
}