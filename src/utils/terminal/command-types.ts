export enum CrossPlatformCommand {
    CD = "cd",            // 切换目录
    LS = "ls",            // 列出目录内容
    PWD = "pwd",          // 显示当前工作目录
    CP = "cp",            // 复制文件或目录
    MV = "mv",            // 移动或重命名文件
    RM = "rm",            // 删除文件或目录
    MKDIR = "mkdir",      // 创建目录
    RMDIR = "rmdir",      // 删除空目录
    TOUCH = "touch",      // 创建空文件
    FIND = "find",        // 查找文件
    WHICH = "which",      // 查找命令的路径
    CAT = "cat",          // 查看文件内容
    GREP = "grep",        // 查找文本
    HEAD = "head",        // 查看文件头部内容
    TAIL = "tail",        // 查看文件尾部内容
    SED = "sed",          // 文本流编辑
    AWK = "awk",          // 文本处理工具
    ECHO = "echo",        // 打印输出
    PING = "ping",        // 测试网络连接
    SSH = "ssh",          // 远程登录
    SCP = "scp",          // 远程拷贝
    TAR = "tar",          // 文件归档工具
    ZIP = "zip",          // 压缩文件
    UNZIP = "unzip",      // 解压文件
    CURL = "curl",        // 网络请求工具
    WGET = "wget",        // 网络请求工具
    SUDO = "sudo",        // 提升权限运行命令（主要是Linux和macOS）
    FREE = "free",        // 查看内存使用情况（主要是Linux和macOS）
    DF = "df",            // 查看磁盘空间
    DU = "du",            // 查看磁盘使用情况
    PS = "ps",            // 查看进程
    TOP = "top",          // 查看进程动态
    KILL = "kill",        // 终止进程
    SYSTEMCTL = "systemctl", // 管理系统服务（主要是Linux）
    NETSTAT = "netstat",  // 查看网络连接
    ROUTE = "route",      // 查看路由表
    LSBLK = "lsblk",      // 查看块设备（主要是Linux）
    WHO = "who",          // 查看当前登录用户
    W = "w",              // 查看当前用户信息
    LAST = "last",        // 查看用户登录历史
    ALIAS = "alias",      // 设置命令别名
    UNALIAS = "unalias",  // 删除命令别名
    SLEEP = "sleep"       // 暂停命令执行
}

export enum WindowsCommand {
    DIR = "dir",                // 列出目录内容
    DEL = "del",                // 删除文件
    COPY = "copy",              // 复制文件
    XCOPY = "xcopy",            // 复制文件和目录（比 COPY 更强大）
    MOVE = "move",              // 移动文件或目录
    REN = "ren",                // 重命名文件或目录
    ATTRIB = "attrib",          // 更改文件属性
    TYPE = "type",              // 显示文件内容
    FIND = "find",              // 查找文本
    SYSTEMINFO = "systeminfo",  // 显示系统信息
    VER = "ver",                // 显示操作系统版本
    HOSTNAME = "hostname",      // 显示主机名
    TASKLIST = "tasklist",      // 查看当前运行的进程
    TASKKILL = "taskkill",      // 终止进程
    SHUTDOWN = "shutdown",      // 关闭或重启计算机
    CLS = "cls",                // 清除屏幕
    SET = "set",                // 设置环境变量
    ECHO = "echo",              // 打印输出
    PING = "ping",              // 网络连通性测试
    IPCONFIG = "ipconfig",      // 配置或显示网络接口
    TRACERT = "tracert",        // 路由追踪
    NSLOOKUP = "nslookup",      // DNS 查询
    ROUTE = "route",            // 显示或修改路由表
    TELNET = "telnet",          // 远程登录
    NETSH = "netsh",            // 网络配置和管理
    NETUSE = "net use",         // 连接共享资源
    NETSTAT = "netstat",        // 查看网络连接
    DISKPART = "diskpart",      // 磁盘分区管理
    CHKDSK = "chkdsk",          // 检查磁盘
    DEFRAG = "defrag",          // 磁盘碎片整理
    FSUTIL = "fsutil",          // 文件系统工具
    NETUSER = "net user",       // 用户管理
    NETLOCALGROUP = "net localgroup", // 本地用户组管理
    WHOAMI = "whoami",          // 显示当前用户信息
    TASKMGR = "taskmgr",        // 启动任务管理器
    WMIC_PROCESS = "wmic process", // Windows 管理工具命令（查看进程信息）
    WBAKUP = "wbadmin",         // Windows 备份命令
    DATE = "date",              // 查看和设置系统日期
    TIME = "time",              // 查看和设置系统时间
    SCHTASKS = "schtasks",      // 创建、删除或显示计划任务
    SC = "sc",                  // 服务控制工具
    REG = "reg",                // 注册表编辑工具
    CALL = "call",              // 调用批处理程序中的其他批处理程序
    PAUSE = "pause",            // 暂停批处理文件的执行
    GOTO = "goto",              // 转到批处理文件中的指定标签
    IF = "if",                  // 条件语句
    FOR = "for",                // 循环语句
    EXIT = "exit"               // 退出命令提示符或批处理文件
}


export enum LinuxCommand {
    FIND = "find",                // 查找文件
    LOCATE = "locate",            // 查找文件
    CHMOD = "chmod",              // 更改文件权限
    CHOWN = "chown",              // 更改文件所有者
    CHGRP = "chgrp",              // 更改文件组
    UMASK = "umask",              // 设置文件权限掩码
    GREP = "grep",                // 查找文本
    AWK = "awk",                  // 文本处理工具
    SED = "sed",                  // 流编辑工具
    HTOP = "htop",                // 交互式查看进程信息
    NICE = "nice",                // 设置进程优先级
    RENICE = "renice",            // 改变进程的优先级
    UPTIME = "uptime",            // 查看系统运行时间
    FREE = "free",                // 查看内存使用情况
    IOSTAT = "iostat",            // 查看磁盘 I/O
    VMSTAT = "vmstat",            // 查看虚拟内存统计信息
    LSOF = "lsof",                // 列出打开的文件
    DMESG = "dmesg",              // 查看系统日志
    IFCONFIG = "ifconfig",        // 网络接口配置（被 `ip` 命令取代）
    IP = "ip",                    // 网络接口管理工具
    TRACEROUTE = "traceroute",    // 路由追踪
    DIG = "dig",                  // DNS 查询工具
    SS = "ss",                    // 查看网络连接（替代 `netstat`）
    SCP = "scp",                  // 远程文件复制
    SSH = "ssh",                  // 安全远程登录
    APT = "apt",                  // Debian 系列包管理工具
    YUM = "yum",                  // RedHat 系列包管理工具
    DPKG = "dpkg",                // Debian 系列包管理工具
    RPM = "rpm",                  // RedHat 系列包管理工具
    USERADD = "useradd",          // 添加用户
    USERMOD = "usermod",          // 修改用户
    USERDEL = "userdel",          // 删除用户
    PASSWD = "passwd",            // 修改用户密码
    ID = "id",                    // 查看用户和组的 ID
    GROUPS = "groups",            // 查看用户所在的组
    WHO = "who",                  // 显示当前登录的用户
    W = "w",                      // 查看当前登录的用户信息
    LAST = "last",                // 查看用户的登录历史
    FDISK = "fdisk",              // 磁盘分区工具
    PARTED = "parted",            // 磁盘分区工具
    MKFS = "mkfs",                // 创建文件系统
    MOUNT = "mount",              // 挂载文件系统
    UMOUNT = "umount",            // 卸载文件系统
    LSBLK = "lsblk",              // 列出块设备
    BLKID = "blkid",              // 查找块设备信息
    SYSTEMCTL = "systemctl",      // 管理系统服务
    JOURNALCTL = "journalctl",    // 查看日志
    SUDO = "sudo",                // 提升权限执行命令
    STRACE = "strace",            // 系统调用跟踪
    TAR = "tar",                  // 打包工具
    ZIP = "zip",                  // 文件压缩工具
    UNZIP = "unzip",              // 解压工具
    GZIP = "gzip",                // 压缩工具
    BZIP2 = "bzip2",              // 压缩工具
    UNBZIP2 = "unbzip2",          // 解压工具
    XZ = "xz",                    // 压缩工具
    UNXZ = "unxz",                // 解压工具
    CHROOT = "chroot",            // 改变根目录
    ALIAS = "alias",              // 创建命令别名
    UNALIAS = "unalias",          // 删除命令别名
    PASTE = "paste",              // 合并文本行
}

export enum MacCommand {
    BREW = "brew",
    SYSTEM_PROFILER = "system_profiler",
    OSASCRIPT = "osascript",
    OPEN = "open",
    DEFAULTS = "defaults",
    PMSET = "pmset",
    LAUNCHCTL = "launchctl",
    SCREENSAVER = "screensaver",
    SW_UTILITY = "softwareupdate",
    FSTAB = "fstab",
    ROUTE = "route",
    SUDO = "sudo",
    TASKSPY = "taskspy",
    DIAGNOSE = "diagnose",
    NETWORKSETUP = "networksetup",
    AIRPORT = "airport",
    CURL = "curl",
    FINDER = "Finder",
    HUP = "hup",
    SYSTEM_INFORMATION = "system_profiler",
    DISKUTIL = "diskutil",
    KEXTUTIL = "kextutil",
    SPOTLIGHT = "mdfind",
    DEVTOOLS = "devtools",
    SETTIME = "systemsetup",
    XCRUN = "xcrun",
    ECHO = "echo",
    TAR = "tar",
    ZIP = "zip",
    UNZIP = "unzip",
    GZIP = "gzip",
    BZIP2 = "bzip2",
    OPENLINK = "open",
    ALIAS = "alias",
    UNALIAS = "unalias",
    INOTIFY = "inotify"
}

export enum PythonProjectCommand {
    // 包管理工具
    PIP = "pip",
    CONDA = "conda",
    PIPENV = "pipenv",
    POETRY = "poetry",
    MAMBA = "mamba",
    PIPX = "pipx",
    PDM = "pdm",

    // 包执行命令
    PYINSTALLER = "pyinstaller",
    CXY_FREEZE = "cx_Freeze",
    PY2EXE = "py2exe",
    NUITKA = "nuitka",
    DOCKER = "docker",
    FABRIC = "fabric",
    CELERY = "celery",

    // 框架程序
    DJANGO = "django-admin",
    FLASK = "flask",
    FASTAPI = "uvicorn",
    PYRAMID = "pcreate",
    TORNADO = "python",
    BOTTLE = "python",

    // 测试工具
    PYTEST = "pytest",
    UNITTEST = "unittest",
    NOSE2 = "nose2",
    TOX = "tox",

    // 文档生成
    SPHINX = "sphinx",
}

export enum JSProjectCommand {
    // 脚本执行命令
    NPM_SCRIPTS = "npm run",
    GULP = "gulp",
    GRUNT = "grunt",

    // 包管理工具
    NPM = "npm",
    YARN = "yarn",
    PNPM = "pnpm",
    CNPM = "cnpm",

    // 项目构建与执行
    NODE = "node",
    WEBPACK = "webpack",
    PARCEL = "parcel",
    ROLLUP = "rollup",

    // 服务器相关
    EXPRESS = "express",
    PM2 = "pm2",
    NODEMON = "nodemon",

    // 数据库相关命令
    MONGODB = "mongo",
    MONGOD = "mongod",
    SEQUELIZE = "sequelize",

    // 测试相关命令
    MOCHA = "mocha",
    JEST = "jest",

    // 静态代码分析
    ESLINT = "eslint",
    PRETTIER = "prettier"
}

export enum JavaProjectCommand {
    // Java 编译与执行
    JAVAC = "javac",
    JAVA = "java",
    JAR = "jar",

    // 构建工具命令
    MAVEN = "mvn",
    GRADLE = "gradle",

    // 打包和构建 JAR 包
    MAVEN_PACKAGE = "mvn package",
    GRADLE_BUILD = "gradle build",
}

export enum CProjectCommand {
    // 编译相关命令
    GCC = "gcc",                // GCC 编译器
    GPP = "g++",                // G++ 编译器
    CLANG = "clang",            // Clang 编译器
    CLANGPP = "clang++",        // Clang++ 编译器

    // 调试相关命令
    GDB = "gdb",                // GNU 调试器

    // 构建工具
    MAKE = "make",              // 使用 Makefile 构建项目
    CMAKE = "cmake",            // 使用 CMake 构建项目
    GN = "gn",                  // 使用 GN 构建项目

    // 测试命令
    CTEST = "ctest",            // 使用 CTest 执行测试（CMake 配合使用）
    VALGRIND = "valgrind",      // 使用 Valgrind 检测内存泄漏
    GTEST = "gtest",            // 使用 Google Test 运行测试
    CATCH2 = "catch2",          // 使用 Catch2 运行测试
    CLANG_TIDY = "clang-tidy",  // 使用 Clang-Tidy 进行代码静态分析
}



