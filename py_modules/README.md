本地调试的时候需要先配环境：
1. 在根目录下运行`python -m venv venv`，名字得是venv，因为现在插件里写死了；
2. 进入虚拟环境安装依赖：
		win: `venv\Scripts\activate`
		mac: `source venv/bin/activate`
`py_modules/`里有requirements.txt，进入py_modules目录执行`pip install -r requirements.txt`安装。
3. 如果添加了python脚本，提交前执行以下`pipreqs /virtual-me/py_modules --force`更新requirements.txt。