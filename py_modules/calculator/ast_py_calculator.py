import ast
import json
import sys
import os

all_classes = []
all_functions = []
cnt = 0
MAX_FILE_SIZE = 10 * 1024  # 10KB的大小阈值

class CodeStructureVisitor(ast.NodeVisitor):
    def __init__(self, file_path):
        self.file_path = file_path  # 将 file_path 保存为实例变量
        self.tree = {}

    def get_range(self, node):
        """获取节点的行号范围"""
        start = getattr(node, 'lineno', None)
        end = getattr(node, 'end_lineno', start)  # 如果没有 end_lineno，则使用 start 作为结束行号
        return [start, end]

    def get_code(self, node):
        """获取节点的代码"""
        start_line, end_line = self.get_range(node)
        with open(self.file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return ''.join(lines[start_line - 1:end_line])

    def visit_Module(self, node):
        global cnt
        cnt += 1
        """处理模块顶层"""
        start_line = getattr(node, 'lineno', 1)
        # 读取文件总行数作为模块的结束行号
        with open(self.file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        end_line = len(lines)  # 文件的总行数作为结束行号

        self.tree = {"id": cnt, "name": self.file_path, "type": "File", "range": [start_line, end_line], "children": []}
        for item in node.body:
            child_info = self.visit(item)
            if child_info:  # 如果子节点不为空
                self.tree["children"].append(child_info)

    def visit_FunctionDef(self, node):
        """处理函数定义"""
        global cnt
        cnt += 1
        func_info = {
            "id": cnt, 
            "name": node.name,
            "type": "Function",
            "range": self.get_range(node),
            "children": []
        }
        all_functions.append({
            "id": cnt,
            "name": node.name,
            "file": self.file_path,
            "range": self.get_range(node),
            "code": self.get_code(node)
        })

        # 处理函数体中的每个节点
        for item in node.body:
            child_info = self.visit(item)  # 获取每个节点的结构
            if child_info:  # 只有非空的子节点才加入
                func_info["children"].append(child_info)
        return func_info

    def visit_ClassDef(self, node):
        """处理类定义"""
        global cnt
        cnt += 1
        class_info = {
            "id": cnt, 
            "name": node.name,
            "type": "Class",
            "range": self.get_range(node),
            "children": []
        }
        all_classes.append({
            "id": cnt,
            "name": node.name,
            "file": self.file_path,
            "range": self.get_range(node),
            "code": self.get_code(node)
        })

        # 递归处理类体中的每个节点
        for item in node.body:
            child_info = self.visit(item)  # 获取每个节点的结构
            if child_info:  # 只有非空的子节点才加入
                class_info["children"].append(child_info)
        return class_info

    def visit_Import(self, node):
        """处理 import 语句"""
        global cnt
        cnt += 1
        import_info = {
            "id": cnt,
            "name": ", ".join([alias.name for alias in node.names]),
            "type": "Import",
            "range": self.get_range(node),
            "children": []
        }
        return import_info

    def visit_ImportFrom(self, node):
        """处理 from ... import 语句"""
        global cnt
        cnt += 1
        import_info = {
            "id": cnt,
            "name": node.module,
            "type": "ImportFrom",
            "range": self.get_range(node),
            "children": [{"name": alias.name, "type": "ImportName", "range": self.get_range(alias), "children": []} for alias in node.names],
        }
        return import_info

    def visit_Assign(self, node):
        """处理赋值语句"""
        global cnt
        cnt += 1
        assign_info = {
            "id": cnt, 
            "name": "Assign",
            "type": "Assign",
            "range": self.get_range(node),
            "children": [self.visit(node.value)]  # 递归访问赋值语句的右侧表达式
        }
        # 如果子节点为空（比如 value 为 None 或无效），返回 None
        if assign_info["children"] and assign_info["children"][0]:
            return assign_info
        return None

    def visit_Expr(self, node):
        """处理表达式"""
        global cnt
        cnt += 1
        expr_info = {
            "id": cnt,
            "name": "Expr",
            "type": "Expr",
            "range": self.get_range(node),
            "children": []
        }
        # 递归访问表达式的子节点
        value_info = self.visit(node.value)
        if value_info:
            expr_info["children"].append(value_info)
        # 如果子节点不为空才返回
        if expr_info["children"]:
            return expr_info
        return None

    def visit_Name(self, node):
        global cnt
        cnt += 1
        """处理名称节点"""
        return {
            "id": cnt,
            "name": node.id,
            "type": "Name",
            "range": self.get_range(node),
            "children": []
        }

    def visit_BinOp(self, node):
        global cnt
        cnt += 1
        """处理二元操作符"""
        return {
            "id": cnt, 
            "name": "BinOp",
            "type": "BinOp",
            "range": self.get_range(node),
            "children": [self.visit(node.left), self.visit(node.right)]
        }

    def visit_Num(self, node):
        global cnt
        cnt += 1
        """处理数字常量"""
        return {
            "id": cnt,
            "name": str(node.n),
            "type": "Num",
            "range": self.get_range(node),
            "children": []
        }

    def visit_Str(self, node):
        global cnt
        cnt += 1
        """处理字符串常量"""
        return {
            "id": cnt,
            "name": node.s,
            "type": "Str",
            "range": self.get_range(node),
            "children": []
        }

    def generic_visit(self, node):
        """访问节点时调用的通用方法"""
        if isinstance(node, ast.AST):
            for field, value in ast.iter_fields(node):
                if isinstance(value, list):
                    for item in value:
                        if isinstance(item, ast.AST):
                            self.visit(item)
                elif isinstance(value, ast.AST):
                    self.visit(value)


def analyze_code_structure(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 解析代码为 AST 树
    tree = ast.parse(code)
    
    # 使用自定义的 CodeStructureVisitor 进行遍历并提取代码结构
    visitor = CodeStructureVisitor(file_path)  # 将 file_path 传递给访客类
    visitor.visit(tree)

    return visitor.tree


def analyze_multiple_files(file_paths):
    """ 解析多个 Python 文件并返回树状结构 """
    result = []

    for file_path in file_paths:
        # 检查文件大小，如果超过阈值则跳过该文件
        if os.path.getsize(file_path) > MAX_FILE_SIZE:
            result.append({"file": file_path, "error": "File is too large to analyze"})
            continue
        tree_structure = analyze_code_structure(file_path)
        result.append({"file": file_path, "structure": tree_structure})

    # with open('data.json', 'w') as json_file:
    #     json.dump({
    #         "ast": result,
    #         "all_classes": all_classes,
    #         "all_functions": all_functions
    #     }, json_file, indent=2)

    return json.dumps({
            "ast": result,
            "all_classes": all_classes,
            "all_functions": all_functions
        }, indent=2)


if __name__ == "__main__":
    # 从命令行参数接收多个文件路径
    file_paths = json.loads(sys.argv[1])  # 接收文件列表
    # file_paths = ["C:/code/virtual-me/py_modules/calculator/artifact_cbo_calculator.py"]

    result = analyze_multiple_files(file_paths)
    print(result)  # 返回 JSON 结果