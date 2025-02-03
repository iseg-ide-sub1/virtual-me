import ast
import sys
import os
from collections import defaultdict

class CBOAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.class_methods = defaultdict(set)      # {类名: {方法集合}}
        self.class_attributes = defaultdict(set)   # {类名: {属性集合}}
        self.class_dependencies = defaultdict(set) # {类名: {依赖的其他类}}
        self.imports = {}  # 记录 import 关系 {别名: 真实模块名}

    def visit_ImportFrom(self, node):
        """ 解析 'from module import ClassName' 语句 """
        for alias in node.names:
            self.imports[alias.name] = node.module  # 记录类名和模块名

    def visit_Import(self, node):
        """ 解析 'import module' 语句 """
        for alias in node.names:
            self.imports[alias.asname or alias.name] = alias.name  # 记录别名和真实模块名

    def visit_ClassDef(self, node):
        """ 解析类定义 """
        current_class = node.name
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                self.class_methods[current_class].add(item.name)  # 记录方法
            elif isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        self.class_attributes[current_class].add(target.id)  # 记录属性
        self.generic_visit(node)

    def visit_Attribute(self, node):
        """ 解析类中的属性访问 """
        if isinstance(node.value, ast.Name):  
            obj_name = node.value.id  
            attr_name = node.attr  
            for class_name in self.class_methods:
                if attr_name in self.class_methods[class_name] or attr_name in self.class_attributes[class_name]:
                    self.class_dependencies[obj_name].add(class_name)
        self.generic_visit(node)

    def analyze_file(self, filepath):
        """ 解析 Python 文件并提取 CBO 信息 """
        with open(filepath, "r", encoding="utf-8") as f:
            code = f.read()
        tree = ast.parse(code)
        self.visit(tree)

    def analyze_cbo(self, file1, file2):
        """ 计算两个文件之间的 CBO """
        self.analyze_file(file1)
        self.analyze_file(file2)

        cbo_count = 0
        for class_a in self.class_methods:
            for class_b in self.class_dependencies:
                if class_a in self.class_dependencies[class_b]:
                    cbo_count += 1
        
        return cbo_count

if __name__ == "__main__":
    file1, file2 = sys.argv[1], sys.argv[2]
    analyzer = CBOAnalyzer()
    cbo_result = analyzer.analyze_cbo(file1, file2)
    print(cbo_result)