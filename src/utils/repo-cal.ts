import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { spawn } from "child_process"
import { IntervalCalculateTimer } from "./IntervalCalculateTimer"
import {plugin_version} from '../extension'


// const timer = new IntervalCalculateTimer();  // 实例化一个定时器，每隔一段时间执行一次snapshot()函数
const commonFileTypes = new Set([
    '.py', '.java', '.js', '.ts', '.c', '.cpp', '.cc', '.cxx', '.cs', '.go',
    '.rb', '.php', '.swift', '.kt', '.rs', '.sh', '.bash', '.html', '.htm',
    '.css', '.json', '.yaml', '.yml', '.xml', '.sql', '.md', '.markdown',
    '.r'
])

const commonExcludeDirs = new Set([
    'node_modules', '.git', '.idea', 'build', 'dist', 'out', 'tmp', '.vscode', 'coverage', 'virtualme-logs'
])

// 获取排除的目录或文件列表
export async function getExcludeDirs(workspaceFolder: string): Promise<Set<string>> {
    const excludeDirs = new Set(commonExcludeDirs)
    const gitignorePath = path.join(workspaceFolder, '.gitignore')

    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
        gitignoreContent.split('\n').forEach(line => {
            const trimmedLine = line.trim()
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                excludeDirs.add(trimmedLine)
            }
        })
    }
    return excludeDirs
}

// 统一的函数，用于运行 Python 脚本并返回结果
async function runPythonScript(scriptPath: string, filePaths: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn("python3", [scriptPath, JSON.stringify(filePaths)])
        let result = ""
        let error = ""

        pythonProcess.stdout.on("data", (data) => {
            result += data.toString()
        })

        pythonProcess.stderr.on("data", (data) => {
            error += data.toString()
        })

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    resolve(result.trim())
                } catch (parseError) {
                    console.warn(`JSON 解析错误: ${parseError}`)
                    resolve("")
                }
            } else {
                console.warn(`计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                resolve("")
            }
        });

        pythonProcess.on("error", (err) => {
            console.warn(`Python 进程错误: ${err.message}`)
            resolve("")
        });
    });
}

// 递归遍历目录，获取文件类型
async function listFiles(directory: string, excludeDirs: Set<string>, collectTypes: boolean = false): Promise<Record<string, any>> {
    const filesByType: Record<string, string[]> = {}

    const processDirectory = (dir: string) => {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
            const fullPath = path.join(dir, file)
            const stat = fs.statSync(fullPath)

            const relativePath = path.relative(directory, fullPath)
            if (excludeDirs.has(relativePath) || excludeDirs.has(file)) return

            if (stat.isDirectory()) {
                processDirectory(fullPath)
            } else {
                const extname = path.extname(file).toLowerCase()
                if (commonFileTypes.has(extname)) {
                    if (collectTypes) {
                        filesByType[extname] = filesByType[extname] || []
                        filesByType[extname].push(fullPath)
                    }
                }
            }
        })
    }

    try {
        processDirectory(directory)
    } catch (error) {
        console.error("Error reading directory:", error)
    }

    return filesByType
}

function writeJsonToFile(filePath: string, data: any): void {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, { encoding: 'utf8' })
}

// 保存代码分析结果
export async function saveRepoCal(workspaceFolder: string, saveDirectory: string, saveName: string) {
    const excludeDirs = await getExcludeDirs(workspaceFolder)
    const filesByType = await listFiles(workspaceFolder, excludeDirs, true)



    const javaFiles = filesByType['.java'] || []
    const pythonFiles = filesByType['.py'] || []

    const [javaCBO, javaLS, pythonCBO, pythonLS, pythonStructure, pythonArtifactLS] = await Promise.all([
        runPythonScript(path.resolve(__dirname, "../src/py_modules/calculator/java_cbo_calculator.py"), javaFiles),
        runPythonScript(path.resolve(__dirname, "../src/py_modules/calculator/similarity_calculator.py"), javaFiles),
        runPythonScript(path.resolve(__dirname, "../src/py_modules/calculator/python_cbo_calculator.py"), pythonFiles),
        runPythonScript(path.resolve(__dirname, "../src/py_modules/calculator/similarity_calculator.py"), pythonFiles),
        runPythonScript(path.resolve(__dirname, "../src/py_modules/calculator/python_structure_calculator.py"), pythonFiles),
        runPythonScript(path.resolve(__dirname, "../src/py_modules/calculator/artifact_similarity_calculator.py"), pythonFiles),
    ])

    writeJsonToFile(path.join(saveDirectory, `${saveName}_files_by_types.json`), filesByType)
    writeJsonToFile(path.join(saveDirectory, `${saveName}_file_cbo.json`), { ".java": JSON.parse(javaCBO), ".py": JSON.parse(pythonCBO) })
    writeJsonToFile(path.join(saveDirectory, `${saveName}_file_ls.json`), { ".java": JSON.parse(javaLS), ".py": JSON.parse(pythonLS) })
    writeJsonToFile(path.join(saveDirectory, `${saveName}_artifact_structure.json`), { ".py": JSON.parse(pythonStructure) })
    writeJsonToFile(path.join(saveDirectory, `${saveName}_artifactLS.json`), { ".py": JSON.parse(pythonArtifactLS) })
}


function getFormattedTime() {
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

// 定时器设置
const timer = new IntervalCalculateTimer(async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return
    }
    const saveDirectory = path.join(workspaceFolders[0].uri.fsPath, '/virtualme-logs')
    const saveName = plugin_version + '_' + getFormattedTime()

    // 调用保存代码分析结果的函数
    await saveRepoCal(workspaceFolders?.[0]?.uri.fsPath, saveDirectory, saveName);
    console.log('代码分析已保存')
}, 5* 60 * 1000)  // 每 5 分钟执行一次

// 启动定时器
timer.start()