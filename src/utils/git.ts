import {extensionPath, saveDir} from "../extension";
import path from 'path';
import vscode from "vscode";
import * as fs from "node:fs";
import {getFormattedTime1} from "./common";

const {execFile} = require('child_process');

function getGitPath(): string | undefined {
    if (process.platform === 'win32') {
        return path.join(extensionPath, 'res/git/win32/cmd/git.exe')
    } else if (process.platform === 'linux') {
        return undefined
    } else if (process.platform === 'darwin') {
        return undefined
    } else {
        return undefined
    }
}

function getGitDir(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return undefined;
    }
    const gitDir = path.join(workspaceFolders[0].uri.fsPath, saveDir, '.internal-git/');
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

function runGitCommand(args: string[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const gitPath = getGitPath();
        if (!gitPath) {
            reject('unsupported platform')
            return;
        }
        const gitDir = getGitDir();
        if (!gitDir) {
            reject('No workspace folder found.')
            return;
        }
        const workTree = getWorkTree();
        if (!workTree) {
            reject('No workspace folder found.')
            return;
        }

        args.unshift(`--work-tree=${workTree}`)
        args.unshift(`--git-dir=${gitDir}`)

        execFile(gitPath, args, (error: { message: any; }, stdout: string | PromiseLike<string>, stderr: any) => {
            if (error) {
                reject(`Git Error: ${error.message}`)
            } else {
                resolve(stdout)
            }
        });
    });
}

export async function init(): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const workSpace = getWorkTree();
        if (!workSpace) {
            reject('No workspace folder found.')
            return
        }
        const gitDir = getGitDir();
        if (!gitDir) {
            reject('No gitDir found.')
            return
        }
        const files = fs.readdirSync(gitDir);
        if (files.length !== 0) {
            reject('already initialized')
            return
        }

        const gitignorePath = path.join(workSpace, '.gitignore');
        // 如果没有.gitignore文件，则创建
        if (!fs.existsSync(gitignorePath)) {
            fs.writeFileSync(gitignorePath, '', {
                flag: 'a+',
                encoding: 'utf8'
            })
        }
        // 检查gitignorePath文件中是否有virtualme-logs/，如果没有则添加
        const gitignoreContent = fs.readFileSync(gitignorePath, {
            encoding: 'utf8'
        })
        if (!gitignoreContent.includes('virtualme-logs/')) {
            fs.writeFileSync(gitignorePath, '\nvirtualme-logs/\n', {
                flag: 'a+',
                encoding: 'utf8'
            })
        }
        const ret = await runGitCommand(['init'])
        resolve(ret)
    })
}

export async function snapshot(filePaths?: string[], commitMessage?: string): Promise<string> {
    if (!filePaths){
        filePaths = ['.']
    }
    if (!commitMessage) {
        commitMessage = getFormattedTime1()
    }

    const addRet = await runGitCommand(['add'].concat(filePaths))
    const ret = await runGitCommand(['commit', '-m', commitMessage])

    return addRet + '\n' + ret
}

export async function getDiffFromLastSnapshot(filePaths?: string[], commitMessage?: string): Promise<string> {
    const snapshotRet = await snapshot(filePaths, commitMessage)
    console.log(snapshotRet)
    const lastCommitHash = await runGitCommand(['rev-parse', 'HEAD^'])
    const currentCommitHash = await runGitCommand(['rev-parse', 'HEAD'])
    const diffRet = await runGitCommand(['diff', lastCommitHash, currentCommitHash])
    return diffRet
}
