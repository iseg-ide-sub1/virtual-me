import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import * as logItem from '../types/log-item'
import {EventType} from '../types/event-types'
import * as vscode from 'vscode'
import * as contextProcess from "./context-process";
import {deleteInnerCmdSeq} from "./cmd-process";
import {plugin_version} from '../extension'
import * as git from "./git";


export function concatEditLogs(log1: logItem.LogItem, log2: logItem.LogItem): logItem.LogItem[] {
    // 如果两个操作显然不能合并, 则直接返回两个操作
    if (log1.eventType != log2.eventType ||
        !log1.artifact.equals(log2.artifact) ||
        !log1.context ||
        !log2.context) {
        return [log1, log2]
    }
    const eventType = log1.eventType

    // 仅支持 AddTextDocument 和 DeleteTextDocument 的合并操作
    if (eventType != EventType.AddTextDocument && eventType != EventType.DeleteTextDocument) {
        return [log1, log2]
    } else {
        let log = new logItem.LogItem(log1.eventType, log1.artifact)
        // 如果log1.context.content.after包含以下字符，则说明上一次添加编辑有完成标志，此时不能合并，直接返回两个操作
        if (eventType == EventType.AddTextDocument &&
            (log1.context.content.after.includes('\n') ||
                log1.context.content.after.includes('\r') ||
                log1.context.content.after.includes('\t') ||
                log1.context.content.after.includes(' '))) {
            return [log1, log2]
        }
        // 合并上下文
        else {
            log.context = contextProcess.concatContexts(log1.context, log2.context)
        }
        return [log]
    }
}


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
    deleteInnerCmdSeq(logs)
    for (let i = 0; i < logs.length; i++) {
        if (logs[i]?.artifact?.references) {
            logs[i].references = JSON.parse(JSON.stringify(logs[i].artifact.references)) // 深拷贝
            delete logs[i].artifact.references // 删除 artifact.reference 属性，减少层级
        }
    }
    return JSON.stringify(logs, (key, value) => {
        return value;
    }, 2);
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
 * 将内容保存到指定路径文件夹中
 * @param content 要保存的文件内容
 * @param saveDirectory 保存的文件夹路径，默认为 /virtualme-log 文件夹
 */
export function saveLog(content: string, saveDirectory = '') {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }
    saveDirectory = path.join(workspaceFolders[0].uri.fsPath, saveDirectory);
    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory, {recursive: true})
    }
    // 名称用日期
    const fileName = plugin_version + '_' + getFormattedTime1()
    const filePath = path.join(saveDirectory, fileName + '.json')
    fs.writeFileSync(filePath, content, 'utf8') // 写入文件
    git.saveSnapshotLog(saveDirectory, fileName)  // 保存快照日志
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