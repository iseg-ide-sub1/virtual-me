import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { spawn } from "child_process"
import { IntervalCalculateTimer } from "./IntervalCalculateTimer"
import { plugin_version } from '../extension'


// 常见的代码文件类型
const commonFileTypes = new Set([
    '.py', '.java', '.js', '.ts', '.c', '.cpp', '.cc', '.cxx', '.cs', '.go',
    '.rb', '.php', '.swift', '.kt', '.rs', '.sh', '.bash', '.html', '.htm',
    '.css', '.json', '.yaml', '.yml', '.xml', '.sql', '.md', '.markdown',
    '.r'
])

// 常见的需要被排除掉的目录
const commonExcludeDirs = new Set([
    '.virtualme',
    'virtualme-logs',
    '.DS_Store',
    '.cache',
    '.conan',
    '.dart_tool',
    '.eslint',
    '.gradle',
    '.idea',
    '.git',
    '.m2',
    '.mvn',
    '.nuxt',
    '.output',
    '/_/',
    '.settings',
    '.stack-work',
    '.vscode',
    '.vscode-scm',
    'bin/',
    'build/',
    '_build',
    '.build',
    'composer.lock',
    'Cargo.lock',
    '.cargo',
    'Gemfile.lock',
    'mix.lock',
    'node_modules',
    'package-lock.json',
    'pnpm-lock.yaml',
    'poetry.lock',
    'pubspec.lock',
    '__pycache__',
    'site-packages',
    'vendor/',
    'virtualenv',
    'venv/',
    'vcpkg_installed',
    '.pyc',
    '.csproj',
    '.fsproj',
    '.vbproj',
    'packages',
    'node_modules', 
    '.git', 
    '.idea', 
    'build', 
    'dist', 
    'out', 
    'tmp', 
    '.vscode', 
    'coverage', 
    'virtualme-logs', 
    'logs', 
    'venv', 
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
        const pythonProcess = spawn(path.resolve(__dirname, "../venv/bin/python3"), [scriptPath, JSON.stringify(filePaths)])
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
                    vscode.window.showInformationMessage(`JSON 解析错误: ${parseError}`)
                    console.warn(`JSON 解析错误: ${parseError}`)
                    resolve("")
                }
            } else {
                vscode.window.showInformationMessage(`计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                console.warn(`计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                resolve("")
            }
        })

        pythonProcess.on("error", (err) => {
            vscode.window.showInformationMessage(`Python 进程错误: ${err.message}`)
            console.warn(`Python 进程错误: ${err.message}`)
            resolve("")
        })
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
    const filesListByType = await listFiles(workspaceFolder, excludeDirs, true)

    const javaFiles = filesListByType['.java'] || []
    const pyFiles = filesListByType['.py'] || []
    const jsFiles = filesListByType['.js'] || []
    const tsFiles = filesListByType['.ts'] || []
    const cppFiles = [...(filesListByType['.cpp'] || []), ...(filesListByType['.c'] || [])]

    /** 计算: 
     *  1. files_list_by_type
     *      对repo中的file进行分类统计，形成列表，并记录每个file的[在repo中的路径]信息
     *  2. artifact_tree_by_structure
     *      生成每个代码文件的AST树，记录每个结点(function、Class、Import等)工件的[name, type, range, children]信息
     *  3. similarity_calculator
     *      计算每两个同类型工件(function、Class)的similarity_score
     *  4. cbo_calculator
     *      计算每两个同类型工件(function、Class)的cbo
     * 5. cea_calculator
     *      计算每两个同类型工件(function、Class)的cea
     * 6. rfc_calculator
     *      计算每两个同类型工件(function、Class)的rfc
     *         
    */

    const [pyAST, javaAST, jsAST, tsAST, cppAST] = await Promise.all([
        runPythonScript(path.resolve(__dirname, "../py_modules/calculator/ast_py_calculator.py"), pyFiles), 
        runPythonScript(path.resolve(__dirname, "../py_modules/calculator/ast_java_calculator.py"), javaFiles),
        runPythonScript(path.resolve(__dirname, "../py_modules/calculator/ast_js_calculator.py"), jsFiles),
        runPythonScript(path.resolve(__dirname, "../py_modules/calculator/ast_ts_calculator.py"), tsFiles),
        runPythonScript(path.resolve(__dirname, "../py_modules/calculator/ast_cpp_calculator.py"), cppFiles),
    ])




    const repoCalDir = path.join(saveDirectory, 'repo-cal/');
    if (!fs.existsSync(repoCalDir)) {
        fs.mkdirSync(repoCalDir, {recursive: true})
    }

    writeJsonToFile(path.join(saveDirectory, "repo-cal", `${saveName}_file_list.json`), filesListByType)
    writeJsonToFile(path.join(saveDirectory, "repo-cal", `${saveName}_ast.json`), {
        ".py": JSON.parse(pyAST)['ast'],
        ".java": JSON.parse(javaAST)['ast'],
        ".js": JSON.parse(jsAST)['ast'],
        ".ts": JSON.parse(tsAST)['ast'],
        ".cpp": JSON.parse(cppAST)['ast']
    })
    writeJsonToFile(path.join(saveDirectory, "repo-cal", `${saveName}_artifact_list.json`), {
        ".py": {
            "classes":JSON.parse(pyAST)['all_classes'],
            "functions":JSON.parse(pyAST)['all_functions']
        },
        ".java": {
            "classes":JSON.parse(javaAST)['all_classes'],
            "functions":JSON.parse(javaAST)['all_functions']
        },
        ".js": {
            "classes":JSON.parse(jsAST)['all_classes'],
            "functions":JSON.parse(jsAST)['all_functions']
        },
        ".ts": {
            "classes":JSON.parse(tsAST)['all_classes'],
            "functions":JSON.parse(tsAST)['all_functions']
        },
        ".cpp": {
            "classes":JSON.parse(cppAST)['all_classes'],
            "functions":JSON.parse(cppAST)['all_functions']
        }
    })
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
    const saveDirectory = path.join(workspaceFolders[0].uri.fsPath, '.virtualme')
    const saveName = plugin_version + '_' + getFormattedTime()

    // 调用保存代码分析结果的函数
    await saveRepoCal(workspaceFolders?.[0]?.uri.fsPath, saveDirectory, saveName);
    console.log('代码分析已保存')
}, 5 * 60 * 1000)  // 每 5 分钟执行一次

// 启动定时器
timer.start()