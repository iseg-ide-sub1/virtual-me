import { exec } from 'child_process';

// 调用 Python 脚本路径
const pyPath = 'py_mod.py';

exec(`python ${pyPath}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`执行 Python 脚本时出错:\n${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Python 脚本错误输出:\n${stderr}`);
        return;
    }
    console.log(`Python 脚本标准输出:\n${stdout}`);
});