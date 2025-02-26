import ast
import json
import sys
from collections import defaultdict

class CodeStructureVisitor(ast.NodeVisitor):
    def __init__(self, file_path):
        self.file_path = file_path
        self.classes = {}  # 存储类信息
        self.functions = {}  # 存储函数信息
        self.imports = {}  # 存储导入信息
        self.current_class = None  # 当前类上下文

    def get_range(self, node):
        """获取节点的行号范围"""
        start = getattr(node, 'lineno', None)
        end = getattr(node, 'end_lineno', start)
        return [start, end]

    def get_code(self, node):
        """获取节点的代码"""
        start_line, end_line = self.get_range(node)
        with open(self.file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return ''.join(lines[start_line - 1:end_line]) if start_line else ''

    def visit_ClassDef(self, node):
        """处理类定义"""
        prev_class = self.current_class
        self.current_class = node.name
        methods = []
        for body_item in node.body:
            if isinstance(body_item, ast.FunctionDef):
                if not (body_item.name.startswith('__') and body_item.name.endswith('__')):
                    methods.append(body_item.name)
        class_info = {
            "name": node.name,
            "type": "Class",
            "range": self.get_range(node),
            "code": self.get_code(node),
            "class_id": None,  # 待分配的唯一ID
            "dependencies": [],  # 类依赖信息（实例化）
            "method_calls": [],  # 方法调用依赖
            "methods": methods,  # 类中定义的方法名
            "attribute_accesses": []  # 属性访问依赖
        }
        self.classes[node.name] = class_info
        self.generic_visit(node)
        self.current_class = prev_class

    def visit_FunctionDef(self, node):
        """处理函数定义"""
        prev_class = self.current_class
        self.current_class = None
        func_info = {
            "name": node.name,
            "type": "Function",
            "range": self.get_range(node),
            "code": self.get_code(node)
        }
        self.functions[node.name] = func_info
        self.generic_visit(node)
        self.current_class = prev_class

    def visit_Import(self, node):
        """处理 import 语句"""
        for alias in node.names:
            self.imports[alias.name] = {"type": "Import", "module": alias.name}

    def visit_ImportFrom(self, node):
        """处理 from ... import 语句"""
        for alias in node.names:
            self.imports[alias.name] = {"type": "ImportFrom", "module": node.module}

    def analyze_code_structure(self):
        return {
            "file": self.file_path,
            "classes": self.classes,
            "functions": self.functions,
            "imports": self.imports
        }


class CallVisitor(ast.NodeVisitor):
    def __init__(self, global_class_map):
        self.global_class_map = global_class_map
        self.current_class = None  # 当前类上下文

    def visit_ClassDef(self, node):
        """处理类定义时更新当前类上下文"""
        prev_class = self.current_class
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = prev_class

    def visit_Call(self, node):
        """跟踪类实例化"""
        func = node.func
        if isinstance(func, ast.Name):
            called_class_name = func.id
            current_class_name = self.current_class
            if current_class_name:
                current_class = self.global_class_map.get(current_class_name)
                called_class = self.global_class_map.get(called_class_name)
                if current_class and called_class:
                    # 更新当前类的依赖
                    current_class['dependencies'].append(called_class['class_id'])


class MethodCallVisitor(ast.NodeVisitor):
    def __init__(self, global_class_map, global_method_map):
        self.global_class_map = global_class_map
        self.global_method_map = global_method_map
        self.current_class = None  # 当前类上下文

    def visit_ClassDef(self, node):
        """处理类定义，更新当前类上下文"""
        prev_class = self.current_class
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = prev_class

    def visit_Call(self, node):
        """跟踪方法调用"""
        func = node.func
        method_name = None

        # 提取方法名
        if isinstance(func, ast.Attribute):
            method_name = func.attr
        elif isinstance(func, ast.Name):
            method_name = func.id

        if method_name and self.current_class:
            current_class = self.global_class_map.get(self.current_class)
            if current_class:
                # 查找所有定义了该方法名的类
                called_class_ids = self.global_method_map.get(method_name, [])
                for class_id in called_class_ids:
                    current_class['method_calls'].append(class_id)


class AttributeAccessVisitor(ast.NodeVisitor):
    def __init__(self, global_class_map):
        self.global_class_map = global_class_map
        self.current_class = None  # 当前类上下文

    def visit_ClassDef(self, node):
        """处理类定义，更新当前类上下文"""
        prev_class = self.current_class
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = prev_class

    def visit_Attribute(self, node):
        """跟踪属性访问"""
        if isinstance(node.value, ast.Name):
            # 假设属性访问的实例是类名
            class_name = node.value.id
            current_class = self.global_class_map.get(self.current_class)
            called_class = self.global_class_map.get(class_name)
            if current_class and called_class:
                current_class['attribute_accesses'].append(called_class['class_id'])


def analyze_multiple_files(file_paths):
    result = []
    all_classes = []
    all_functions = []
    class_id = 1  # 类ID分配

    # 第一次遍历：收集类定义和方法名
    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        tree = ast.parse(code)
        visitor = CodeStructureVisitor(file_path)
        visitor.visit(tree)
        result.append(visitor.analyze_code_structure())

    # 汇总类和函数
    for file_data in result:
        classes = list(file_data["classes"].values())
        all_classes.extend(classes)
        functions = list(file_data["functions"].values())
        all_functions.extend(functions)

    # 分配类ID
    for class_info in all_classes:
        class_info['class_id'] = class_id
        class_info['dependencies'] = []
        class_info['method_calls'] = []
        class_info['attribute_accesses'] = []
        class_id += 1

    # 创建全局类映射和方法映射
    global_class_map = {class_info['name']: class_info for class_info in all_classes}
    global_method_map = defaultdict(list)  # 方法名到 class_id 的映射

    # 收集所有类的方法名
    for class_info in all_classes:
        for method_call in class_info.get('methods', []):
            global_method_map[method_call].append(class_info['class_id'])

    # 第二次遍历：统计实例化依赖
    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        tree = ast.parse(code)
        visitor = CallVisitor(global_class_map)
        visitor.visit(tree)

    # 第三次遍历：统计方法调用依赖
    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        tree = ast.parse(code)
        visitor = MethodCallVisitor(global_class_map, global_method_map)
        visitor.visit(tree)

    # 第四次遍历：统计属性访问依赖
    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        tree = ast.parse(code)
        visitor = AttributeAccessVisitor(global_class_map)
        visitor.visit(tree)

    # 统计依赖次数
    for class_info in all_classes:
        # 实例化依赖统计
        dependency_counts = defaultdict(int)
        for class_id in class_info['dependencies']:
            dependency_counts[class_id] += 1
        class_info['dependencies'] = [
            {'class_id': key, 'count': value}
            for key, value in sorted(dependency_counts.items())
        ]

        # 方法调用统计
        method_call_counts = defaultdict(int)
        for class_id in class_info['method_calls']:
            method_call_counts[class_id] += 1
        class_info['method_calls'] = [
            {'class_id': key, 'count': value}
            for key, value in sorted(method_call_counts.items())
        ]

        # 属性访问统计
        attribute_access_counts = defaultdict(int)
        for class_id in class_info['attribute_accesses']:
            attribute_access_counts[class_id] += 1
        class_info['attribute_accesses'] = [
            {'class_id': key, 'count': value}
            for key, value in sorted(attribute_access_counts.items())
        ]

    return {
        "result": result,
        "all_classes": all_classes,
        "all_functions": all_functions
    }


if __name__ == "__main__":
    file_paths = json.loads(sys.argv[1])
    result = analyze_multiple_files(file_paths)
    print(json.dumps(result, indent=2))
    # with open('data.json', 'w') as json_file:
    #     json.dump(result, json_file, indent=2)