import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// 常见的代码文件类型
const commonFileTypes = new Set([
    '.py', '.java', '.js', '.ts', '.c', '.cpp', '.cc', '.cxx', '.cs', '.go', 
    '.rb', '.php', '.swift', '.kt', '.rs', '.sh', '.bash', '.html', '.htm', 
    '.css', '.json', '.yaml', '.yml', '.xml', '.sql', '.md', '.markdown', 
    '.r'
]);

// 常见需要排除的目录
const commonExcludeDirs = new Set([
    'node_modules', '.git', '.idea', 'build', 'dist', 'out', 'tmp', '.vscode', 'coverage'
]);

// 获取排除的目录或文件列表
export async function getExcludeDirs(workspaceFolder: string): Promise<Set<string>> {
    const excludeDirs = new Set(commonExcludeDirs);

    const gitignorePath = path.join(workspaceFolder, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        const lines = gitignoreContent.split('\n');
        lines.forEach(line => {
            const trimmedLine = line.trim();
            // 排除空行和注释
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                // 将相对路径添加到排除目录中
                excludeDirs.add(trimmedLine);
            }
        });
    }

    return excludeDirs;
}

// 递归遍历目录，获取文件类型
async function listFilesWithTypes(directory: string, excludeDirs: Set<string>): Promise<Record<string, number>> {
    const fileTypes: Record<string, number> = {};

    const readDir = (dirPath: string) => {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);

            // 排除被标记为排除的目录
            const relativePath = path.relative(directory, fullPath);
            if (excludeDirs.has(relativePath) || excludeDirs.has(file)) {
                return; // 跳过排除的目录或文件
            }

            if (stat.isDirectory()) {
                // 如果是目录，递归读取
                readDir(fullPath);
            } else {
                const extname = path.extname(file).toLowerCase();
                if (commonFileTypes.has(extname)) {
                    fileTypes[extname] = (fileTypes[extname] || 0) + 1;
                }
            }
        });
    };

    try {
        readDir(directory);
    } catch (error) {
        console.log(error);
    }

    return fileTypes;
}

// 提取文件中的词汇
function extractWords(text: string): Set<string> {
    const words = text.toLowerCase().match(/\b\w+\b/g);
    return new Set(words || []);
}

// 计算两个文件的词汇相似度（Jaccard 相似度）
async function calculateLexicalSimilarity(file1Path: string, file2Path: string): Promise<number> {
    // 读取文件内容
    const file1Content = fs.readFileSync(file1Path, 'utf-8');
    const file2Content = fs.readFileSync(file2Path, 'utf-8');

    // 提取文件中的词汇
    const file1Words = extractWords(file1Content);
    const file2Words = extractWords(file2Content);

    // 计算交集和并集的大小
    const intersection = new Set([...file1Words].filter(word => file2Words.has(word)));
    const union = new Set([...file1Words, ...file2Words]);

    // 计算词汇相似度（Jaccard 相似度）
    return intersection.size / union.size;
}

// todo: 计算两个文件的cbo
async function calculateCBO(file1Path: string, file2Path: string): Promise<number> {
    return 0
}

// todo: 计算两个文件的cea
async function calculateCEA(file1Path: string, file2Path: string): Promise<number> {
    return 0
}

// 自定义数据结构：两个文件的cbo, cea和词汇相似度
class FilePairSimilarity {
    file1Path: string
    file2Path: string
    cbo: number = 0
    cea: number = 0
    similarity: number = 0

    constructor(file1Path: string, file2Path: string) {
        this.file1Path = file1Path
        this.file2Path = file2Path
    }

    setCBO(cbo: number) {
        this.cbo = cbo
    }

    setCEA(cea: number) {
        this.cea = cea
    }

    setSIM(similarity: number) {
        this.similarity = similarity
    }
}

// 自定义数据结构：表示文件类型的cbo, cea和词汇相似度
class FileTypeSimilarity {
    fileType: string;
    filePairs: FilePairSimilarity[];

    constructor(fileType: string) {
        this.fileType = fileType;
        this.filePairs = [];
    }

    // 添加文件对
    addFilePair(file1Path: string, file2Path: string, similarity: number) {
        const filePairSimilarity = new FilePairSimilarity(file1Path, file2Path)
        filePairSimilarity.setSIM(similarity)
        this.filePairs.push(new FilePairSimilarity(file1Path, file2Path))
    }

    // todo: 获取前10个cbo最高的文件对
    getTopCBO(topN: number = 10): FilePairSimilarity[] {
        // 按cbo降序排序
        return this.filePairs
            .sort((a, b) => b.cbo - a.cbo)
            .slice(0, topN); // 返回前N个
    }

    // todo: 获取前10个cea最高的文件对
    getTopCEA(topN: number = 10): FilePairSimilarity[] {
        // 按cea降序排序
        return this.filePairs
            .sort((a, b) => b.cea - a.cea)
            .slice(0, topN); // 返回前N个
    }

    // 获取前10个相似度最高的文件对
    getTopSimilarities(topN: number = 10): FilePairSimilarity[] {
        // 按相似度降序排序
        return this.filePairs
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topN); // 返回前N个
    }
}

// 自定义数据结构：表示所有文件类型的相似度
class SimilarityData {
    fileTypeSimilarities: Map<string, FileTypeSimilarity>;

    constructor() {
        this.fileTypeSimilarities = new Map();
    }

    // 获取或创建一个文件类型的相似度对象
    getFileTypeSimilarity(fileType: string): FileTypeSimilarity {
        if (!this.fileTypeSimilarities.has(fileType)) {
            this.fileTypeSimilarities.set(fileType, new FileTypeSimilarity(fileType));
        }
        return this.fileTypeSimilarities.get(fileType)!;
    }

    // 输出
    printSimilarities() {
        this.fileTypeSimilarities.forEach((fileTypeSimilarity) => {
            console.log(`\n\n===========文件类型: ${fileTypeSimilarity.fileType}===============`)
            const topCBO = fileTypeSimilarity.getTopCBO()
            const topCEA = fileTypeSimilarity.getTopCEA()
            const topSimilarities = fileTypeSimilarity.getTopSimilarities()
            if (topCBO.length === 0 || topCEA.length === 0 || topSimilarities.length === 0) {
                console.log('没有相似的文件对')
                return
            }
            console.log("******** todo: top 10 cbo **************")
            topCBO.forEach((pair, index) => {
                console.log(`${index + 1}. ${pair.file1Path} <-> ${pair.file2Path}: ${pair.cbo.toFixed(4)}`)
            })
            console.log("\n******** todo: top 10 cea **************")
            topCEA.forEach((pair, index) => {
                console.log(`${index + 1}. ${pair.file1Path} <-> ${pair.file2Path}: ${pair.cea.toFixed(4)}`)
            })
            console.log("\n******** top 10 词汇相似度 **************")
            topSimilarities.forEach((pair, index) => {
                console.log(`${index + 1}. ${pair.file1Path} <-> ${pair.file2Path} 的相似度: ${pair.similarity.toFixed(4)}`)
            })
            
        })
    }
}




// 计算目录中所有文件类型的两两相似度并记录
export async function calculateSimilarityForAllFilesInDirectory(workspaceFolder: string, excludeDirs: Set<string>) {
    // 获取文件类型
    const fileTypes = await listFilesWithTypes(workspaceFolder, excludeDirs);
    console.log('文件类型统计: ' + JSON.stringify(fileTypes));

    // 按文件类型分类存储文件路径
    const filesByType: Record<string, string[]> = {};

    const collectFilesByType = (directory: string) => {
        const files = fs.readdirSync(directory);
        files.forEach(file => {
            const fullPath = path.join(directory, file);
            const stat = fs.statSync(fullPath);

            // 排除不需要的目录
            const relativePath = path.relative(workspaceFolder, fullPath);
            if (excludeDirs.has(relativePath) || excludeDirs.has(file)) {
                return;
            }

            if (stat.isDirectory()) {
                collectFilesByType(fullPath);
            } else {
                const extname = path.extname(file).toLowerCase();
                if (commonFileTypes.has(extname)) {
                    if (!filesByType[extname]) {
                        filesByType[extname] = [];
                    }
                    filesByType[extname].push(fullPath);
                }
            }
        });
    };

    // 遍历工作区目录，收集文件
    collectFilesByType(workspaceFolder);

    // 创建一个 SimilarityData 实例来存储所有相似度数据
    const similarityData = new SimilarityData();

    // 对每种文件类型计算两两之间的相似度并记录
    for (const [extname, files] of Object.entries(filesByType)) {
        const fileTypeSimilarity = similarityData.getFileTypeSimilarity(extname);

        for (let i = 0; i < files.length; i++) {
            for (let j = i + 1; j < files.length; j++) {
                const file1Path = files[i];
                const file2Path = files[j];

                try {
                    const lexicalSimilarity = await calculateLexicalSimilarity(file1Path, file2Path);
                    fileTypeSimilarity.addFilePair(file1Path, file2Path, lexicalSimilarity);
                } catch (error) {
                    console.log(`计算词汇相似度时出错: ${error}`);
                }
            }
        }
    }

    // 最后统一输出所有相似度结果
    similarityData.printSimilarities();
}

