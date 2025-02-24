import { exec } from 'child_process';

// 指定 python 解释器
const pyEnv = 'D:\\ML\\anaconda3\\envs\\d2l\\python.exe'
// 指定运行模块
const pyMod = 'py_mod.py';

// 创建子进程运行对应模块
exec(`${pyEnv} ${pyMod}`, (error, stdout, stderr) => {
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