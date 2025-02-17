import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as acorn from 'acorn'
import * as walk from 'acorn-walk'
import { loadPyodide } from "pyodide"
import { spawn } from "child_process"
import pLimit from "p-limit"


const pythonPath = "python3"

// 常见的代码文件类型
const commonFileTypes = new Set([
    '.py', '.java', '.js', '.ts', '.c', '.cpp', '.cc', '.cxx', '.cs', '.go',
    '.rb', '.php', '.swift', '.kt', '.rs', '.sh', '.bash', '.html', '.htm',
    '.css', '.json', '.yaml', '.yml', '.xml', '.sql', '.md', '.markdown',
    '.r'
])

// 常见需要排除的目录
const commonExcludeDirs = new Set([
    'node_modules', '.git', '.idea', 'build', 'dist', 'out', 'tmp', '.vscode', 'coverage', 'virtualme-logs'
])

// 获取排除的目录或文件列表
export async function getExcludeDirs(workspaceFolder: string): Promise<Set<string>> {
    const excludeDirs = new Set(commonExcludeDirs);

    const gitignorePath = path.join(workspaceFolder, '.gitignore')
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
        const lines = gitignoreContent.split('\n')
        lines.forEach(line => {
            const trimmedLine = line.trim();
            // 排除空行和注释
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                // 将相对路径添加到排除目录中
                excludeDirs.add(trimmedLine)
            }
        })
    }

    return excludeDirs
}

// 递归遍历目录，获取文件类型
async function listFilesWithTypes(directory: string, excludeDirs: Set<string>): Promise<Record<string, number>> {
    const fileTypes: Record<string, number> = {}

    const readDir = (dirPath: string) => {
        const files = fs.readdirSync(dirPath)
        files.forEach(file => {
            const fullPath = path.join(dirPath, file)
            const stat = fs.statSync(fullPath)

            // 排除被标记为排除的目录
            const relativePath = path.relative(directory, fullPath)
            if (excludeDirs.has(relativePath) || excludeDirs.has(file)) {
                return // 跳过排除的目录或文件
            }

            if (stat.isDirectory()) {
                // 如果是目录，递归读取
                readDir(fullPath)
            } else {
                const extname = path.extname(file).toLowerCase()
                if (commonFileTypes.has(extname)) {
                    fileTypes[extname] = (fileTypes[extname] || 0) + 1
                }
            }
        })
    }

    try {
        readDir(directory)
    } catch (error) {
        console.log(error)
    }

    return fileTypes
}

// 按文件类型分类存储文件路径
const collectFilesByType = (
    directory: string,
    excludeDirs: Set<string>,
    commonFileTypes: Set<string>
): Record<string, string[]> => {
    const filesByType: Record<string, string[]> = {}

    const collect = (dir: string) => {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
            const fullPath = path.join(dir, file)
            const stat = fs.statSync(fullPath)

            // 排除不需要的目录
            const relativePath = path.relative(directory, fullPath)
            if (excludeDirs.has(relativePath) || excludeDirs.has(file)) {
                return
            }

            if (stat.isDirectory()) {
                collect(fullPath)
            } else {
                const extname = path.extname(file).toLowerCase()
                if (commonFileTypes.has(extname)) {
                    if (!filesByType[extname]) {
                        filesByType[extname] = []
                    }
                    filesByType[extname].push(fullPath)
                }
            }
        })
    }

    // 遍历工作区目录，收集文件
    collect(directory)

    return filesByType
}

async function calPythonCBO(filePaths: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, "../src/py_modules/calculator/python_cbo_calculator.py")
        const pythonProcess = spawn("python3", [scriptPath, JSON.stringify(filePaths)])

        let result = ""
        let error = ""

        // 监听标准输出
        pythonProcess.stdout.on("data", (data) => {
            result += data.toString();
        })

        // 监听错误输出
        pythonProcess.stderr.on("data", (data) => {
            error += data.toString();
        })

        // 监听 Python 进程结束
        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    // fs.writeFileSync(path.join(saveDirectory, saveName + '_cbo_python.json'), result.trim(), { encoding: 'utf8' })
                    resolve(result.trim())
                } catch (parseError) {
                    console.warn(`JSON 解析错误: ${parseError}`)
                    resolve("")
                }
            } else {
                console.warn(`CBO 计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                resolve("")
            }
        })

        // 监听 Python 进程错误
        pythonProcess.on("error", (err) => {
            console.warn(`Python 进程错误: ${err.message}`)
            resolve("")
        })
    })
}

async function calJavaCBO(filePaths: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, "../src/py_modules/calculator/java_cbo_calculator.py")
        const pythonProcess = spawn("python3", [scriptPath, JSON.stringify(filePaths)])

        let result = ""
        let error = ""

        // 监听标准输出
        pythonProcess.stdout.on("data", (data) => {
            result += data.toString();
        })

        // 监听错误输出
        pythonProcess.stderr.on("data", (data) => {
            error += data.toString();
        })

        // 监听 Python 进程结束
        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    // fs.writeFileSync(path.join(saveDirectory, saveName + '_cbo_java.json'), result.trim(), { encoding: 'utf8' })
                    resolve(result.trim())
                } catch (parseError) {
                    console.warn(`JSON 解析错误: ${parseError}`)
                    resolve("")
                }
            } else {
                console.warn(`CBO 计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                resolve("")
            }
        })

        // 监听 Python 进程错误
        pythonProcess.on("error", (err) => {
            console.warn(`Python 进程错误: ${err.message}`)
            resolve("")
        })
    })
}

async function calLS(filePaths: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, "../src/py_modules/calculator/similarity_calculator.py")
        const pythonProcess = spawn("python3", [scriptPath, JSON.stringify(filePaths)])

        let result = ""
        let error = ""

        // 监听标准输出
        pythonProcess.stdout.on("data", (data) => {
            result += data.toString();
        })

        // 监听错误输出
        pythonProcess.stderr.on("data", (data) => {
            error += data.toString();
        })

        // 监听 Python 进程结束
        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    // fs.writeFileSync(path.join(saveDirectory, saveName + '_cbo_java.json'), result.trim(), { encoding: 'utf8' })
                    resolve(result.trim())
                } catch (parseError) {
                    console.warn(`JSON 解析错误: ${parseError}`)
                    resolve("")
                }
            } else {
                console.warn(`LS 计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                resolve("")
            }
        })

        // 监听 Python 进程错误
        pythonProcess.on("error", (err) => {
            console.warn(`Python 进程错误: ${err.message}`)
            resolve("")
        })
    })
}

async function calPythonStructure(filePaths: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, "../src/py_modules/calculator/python_structure_calculator.py")
        const pythonProcess = spawn("python3", [scriptPath, JSON.stringify(filePaths)])

        let result = ""
        let error = ""

        // 监听标准输出
        pythonProcess.stdout.on("data", (data) => {
            result += data.toString();
        })

        // 监听错误输出
        pythonProcess.stderr.on("data", (data) => {
            error += data.toString();
        })

        // 监听 Python 进程结束
        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    // fs.writeFileSync(path.join(saveDirectory, saveName + '_cbo_java.json'), result.trim(), { encoding: 'utf8' })
                    resolve(result.trim())
                } catch (parseError) {
                    console.warn(`JSON 解析错误: ${parseError}`)
                    resolve("")
                }
            } else {
                console.warn(`PythonStructure 计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                resolve("")
            }
        })

        // 监听 Python 进程错误
        pythonProcess.on("error", (err) => {
            console.warn(`Python 进程错误: ${err.message}`)
            resolve("")
        })
    })
}

async function calPythonArtifactLS(filePaths: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, "../src/py_modules/calculator/artifact_similarity_calculator.py")
        const pythonProcess = spawn("python3", [scriptPath, JSON.stringify(filePaths)])

        let result = ""
        let error = ""

        // 监听标准输出
        pythonProcess.stdout.on("data", (data) => {
            result += data.toString()
        })

        // 监听错误输出
        pythonProcess.stderr.on("data", (data) => {
            error += data.toString()
        })

        // 监听 Python 进程结束
        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    console.log(result.trim())
                    resolve(result.trim())
                } catch (parseError) {
                    console.warn(`JSON 解析错误: ${parseError}`)
                    resolve("")
                }
            } else {
                console.warn(`PythonArtifactCBO 计算失败: ${error.trim() || `Python 进程退出码 ${code}`}`)
                resolve("")
            }
        })

        // 监听 Python 进程错误
        pythonProcess.on("error", (err) => {
            console.warn(`Python 进程错误: ${err.message}`)
            resolve("")
        })
    })
}

export async function saveRepoCal(workspaceFolder: string, saveDirectory: string, saveName: string) {
    const excludeDirs = await getExcludeDirs(workspaceFolder)

    const fileTypes = await listFilesWithTypes(workspaceFolder, excludeDirs)
    console.log('文件类型统计: \n' + JSON.stringify(fileTypes))
    const filesByType = collectFilesByType(workspaceFolder, excludeDirs, commonFileTypes)
    const filesByTypeJSON = JSON.stringify(filesByType, (key, value) => {
        return value
    }, 2)

    fs.writeFileSync(path.join(saveDirectory, saveName + '_files_by_types.json'), filesByTypeJSON, { encoding: 'utf8' })

    const javaFiles = filesByType['.java']
    const pythonFiles = filesByType['.py']
    let javaCBO = ""
    let javaLS = ""
    let pythonCBO = ""
    let pythonLS = ""
    let pythonStructure = ""
    let pythonArtifactLS = ""
    if (javaFiles && javaFiles.length > 0) {
        javaCBO = await calJavaCBO(javaFiles)
        javaLS = await calLS(javaFiles)
    }

    if (pythonFiles && pythonFiles.length > 0) {
        pythonCBO = await calPythonCBO(pythonFiles)
        pythonLS = await calLS(pythonFiles)
        pythonStructure = await calPythonStructure(pythonFiles)
        pythonArtifactLS = await calPythonArtifactLS(pythonFiles)
    }

    const CBO = {
        ".java": JSON.parse(javaCBO),
        ".py": JSON.parse(pythonCBO)
    }
    const CBOJSON = JSON.stringify(CBO, (key, value) => {
        return value
    }, 2)
    fs.writeFileSync(path.join(saveDirectory, saveName + '_fileCBO.json'), CBOJSON, { encoding: 'utf8' })

    const LS = {
        ".java": JSON.parse(javaLS),
        ".py": JSON.parse(pythonLS)
    }
    const LSJSON = JSON.stringify(LS, (key, value) => {
        return value
    }, 2)
    fs.writeFileSync(path.join(saveDirectory, saveName + '_ls.json'), LSJSON, { encoding: 'utf8' })

    const structure = {
        ".py": JSON.parse(pythonStructure)
    }
    const structureJSON = JSON.stringify(structure, (key, value) => {
        return value
    }, 2)
    fs.writeFileSync(path.join(saveDirectory, saveName + '_structure.json'), structureJSON, { encoding: 'utf8' })

    const artifactLS = {
        ".py": JSON.parse(pythonArtifactLS)
    }
    const artifactLSJSON = JSON.stringify(artifactLS, (key, value) => {
        return value
    }, 2)
    fs.writeFileSync(path.join(saveDirectory, saveName + '_artifactLS.json'), artifactLSJSON, { encoding: 'utf8' })

}

