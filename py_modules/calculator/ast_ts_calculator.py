import ast
import json
import sys
all_classes = []
all_functions = []

def analyze_multiple_files(file_paths):
    """ 解析多个 Java 文件并返回树状结构 """
    result = []
    return json.dumps({
        "ast": result,
        "all_classes": all_classes,
        "all_functions": all_functions
    }, indent=2)


if __name__ == "__main__":
    # 从命令行参数接收多个文件路径
    file_paths = json.loads(sys.argv[1])  # 接收文件列表
    result = analyze_multiple_files(file_paths)
    print(result)  # 返回 JSON 结果