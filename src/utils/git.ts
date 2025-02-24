import {isRecording, saveDir} from "../extension";
import path from 'path';
import vscode, {window} from "vscode";
import * as fs from "node:fs";
import {getFormattedTime, getFormattedTime1} from "./common";
import {IntervalCalculateTimer} from "./IntervalCalculateTimer";

const {execSync} = require('child_process');


let fileHistory = new Set<string>();  // 保存每隔一段时间的文件修改路径
const timer = new IntervalCalculateTimer(snapshot);  // 实例化一个定时器，每隔一段时间执行一次snapshot()函数
class SnapshotItem {
    timestamp: string;
    snapshot: string;

    constructor(timestamp: string, snapshot: string) {
        this.timestamp = timestamp;
        this.snapshot = snapshot;
    }
}

let snapshotLog: SnapshotItem[] = [];

export function addFileToHistory(filePath: string): void {
    fileHistory.add(filePath);
}

function checkFileHistory() {
    for (const file of fileHistory) {
        if (!fs.existsSync(file)) {
            fileHistory.delete(file)
        }
    }
}


function getGitDir(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return undefined;
    }
    const gitDir = path.join(workspaceFolders[0].uri.fsPath, saveDir.value, '.internal-git/');
    if (!fs.existsSync(gitDir)) {
        fs.mkdirSync(gitDir, {recursive: true})
    }
    return gitDir;
}

function getWorkTree(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return undefined;
    }
    return workspaceFolders[0].uri.fsPath;
}

async function runGitCommand(args: string[]): Promise<string> {
    const gitDir = getGitDir();
    if (!gitDir) {
        vscode.window.showErrorMessage('No gitDir found.');
        return 'Git Error: No workspace folder found.'
    }
    const workTree = getWorkTree();
    if (!workTree) {
        vscode.window.showErrorMessage('No workTree found.');
        return 'Git Error: No workspace folder found.'
    }

    args.unshift(`--work-tree=${workTree}`)
    args.unshift(`--git-dir=${gitDir}`)
    args.unshift('git')
    const cmd = args.join(' ')
    // console.log(`Running command: ${cmd}`)
    try {
        return execSync(cmd, {encoding: 'utf8'});
    } catch (error: any) {
        vscode.window.showErrorMessage(error.message)
        return `Git Error: ${error.message}`;
    }
}

function alreadyInit(): boolean {
    const gitDir = getGitDir();
    if (!gitDir) {
        return false
    }
    const files = fs.readdirSync(gitDir);
    return files.length !== 0;

}

export async function init(fromMain: boolean = false): Promise<string> {
    timer.start()  // 启动计时器，如果已经启动，也不会重新启动

    const workSpace = getWorkTree();
    if (!workSpace) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return 'Error: No workspace folder found.'
    }
    const gitDir = getGitDir();
    if (!gitDir) {
        vscode.window.showErrorMessage('No gitDir found.');
        return 'Error: No gitDir found.'
    }
    const files = fs.readdirSync(gitDir);
    if (files.length !== 0) {
        return 'Warn: Git already initialized'
    }

    const gitignorePath = path.join(workSpace, '.gitignore');
    // 如果没有.gitignore文件，则创建
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, '', {
            flag: 'a+',
            encoding: 'utf8'
        })
    }
    // 检查gitignorePath文件中是否有.virtualme/，如果没有则添加
    const gitignoreContent = fs.readFileSync(gitignorePath, {
        encoding: 'utf8'
    })
    if (!gitignoreContent.includes('.virtualme/')) {
        fs.writeFileSync(gitignorePath, '\n.virtualme/\n', {
            flag: 'a+',
            encoding: 'utf8'
        })
    }
    return await runGitCommand(['init'])
}

async function commit(filePaths: string[], commitMessage?: string): Promise<string> {
    if (!commitMessage) {
        // 去掉空格
        commitMessage = getFormattedTime1().replace(/\s+/g, '-')
    }

    const addRet = await runGitCommand(['add'].concat(filePaths))
    // console.log('addRet: ', addRet)
    const commitRet = await runGitCommand(['commit', '-m', commitMessage])
    // console.log('commitRet: ', commitRet)

    return commitRet
}

export async function snapshot(commitMessage?: string): Promise<string> {
    if (!isRecording) {
        return 'Recording is not enabled.'
    }
    if (!alreadyInit()) {
        const initRet = await init()
        if (initRet.includes('Error: ')) {
            return initRet
        }
    }

    checkFileHistory()
    if (fileHistory.size === 0) {
        // console.log('No file changed.')
        return 'No file changed.'
    }

    const commitRet = await commit(Array.from(fileHistory), commitMessage)
    if (commitRet.includes('Error: ')) {
        return commitRet
    }
    fileHistory.clear()  // 清空本次的文件路径记录

    const diffRet = await runGitCommand(['show', '--no-color', 'HEAD'])
    // console.log('diffRet: ', diffRet)
    snapshotLog.push(new SnapshotItem(getFormattedTime(), diffRet))  // 记录快照
    return diffRet
}

export async function saveSnapshotLog(saveDirectory: string, saveName: string) {
    await snapshot()

    const snapshotLogJSON = JSON.stringify(snapshotLog, (key, value) => {
        return value;
    }, 2);
    console.log(snapshotLogJSON)
    saveDirectory = path.join(saveDirectory, 'snapshot')
    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory, {recursive: true})
    }
    const savePath = path.join(saveDirectory, saveName + '_snapshot.json')
    fs.writeFileSync(savePath, snapshotLogJSON, {
        flag: 'a+',
        encoding: 'utf8'
    })
    // console.log(`Snapshot log saved to ${savePath}`)
    snapshotLog = []  // 清空快照记录
}