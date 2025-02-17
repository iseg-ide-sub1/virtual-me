import ast
import json
import sys
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from itertools import combinations
import heapq  # 用于获取最大相似度对

class CodeStructureVisitor(ast.NodeVisitor):
    def __init__(self, file_path):
        self.file_path = file_path  # 文件路径
        self.classes = {}  # 存储类信息
        self.functions = {}  # 存储函数信息
        self.imports = {}  # 存储导入信息
        self.class_dependencies = defaultdict(set)  # 存储类之间的依赖关系
        self.function_dependencies = defaultdict(set)  # 存储函数之间的依赖关系

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
        return ''.join(lines[start_line - 1:end_line])

    def visit_ClassDef(self, node):
        """处理类定义"""
        class_info = {
            "name": node.name,
            "type": "Class",
            "range": self.get_range(node),
            "code": self.get_code(node)
        }
        self.classes[node.name] = class_info

        # 处理类内部的函数定义
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                self.visit(item)

    def visit_FunctionDef(self, node):
        """处理函数定义"""
        func_info = {
            "name": node.name,
            "type": "Function",
            "range": self.get_range(node),
            "code": self.get_code(node)
        }
        self.functions[node.name] = func_info

        # 处理函数体内的调用
        for item in node.body:
            if isinstance(item, ast.Call):
                # 记录函数依赖
                if isinstance(item.func, ast.Attribute):
                    # 函数调用了类的方法
                    self.function_dependencies[node.name].add(item.func.attr)
                elif isinstance(item.func, ast.Name):
                    # 函数调用了其他函数
                    self.function_dependencies[node.name].add(item.func.id)

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

def calculate_similarity(code1, code2):
    """ 计算两个工件之间的语义相似度 """
    if not code1 or not code2:  # 如果任何一个文件为空，返回 0 相似度
        return 0.0
    # 使用TF-IDF向量化器将代码文本转换为向量
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([code1, code2])
    
    # 计算余弦相似度
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])
    return similarity[0][0]

def analyze_multiple_files(file_paths):
    """解析多个 Python 文件并返回工件之间的语义相似度"""
    result = []
    all_classes = []
    all_functions = []
    similarity_results = []

    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()

        tree = ast.parse(code)
        visitor = CodeStructureVisitor(file_path)
        visitor.visit(tree)

        result.append(visitor.analyze_code_structure())

    for file_data in result:
        file_path = file_data["file"]
        classes = file_data["classes"]
        functions = file_data["functions"]
        for class_name, class_info in classes.items():
            all_classes.append((file_path, class_name, class_info))
        for func_name, func_info in functions.items():
            all_functions.append((file_path, func_name, func_info))
    
    # 对于每个类，只记录与其相似度最高的前10个类
    for (file1, class1, info1), (file2, class2, info2) in combinations(all_classes, 2):
        similarity_score = calculate_similarity(info1["code"], info2["code"])
        similarity_results.append({
                "artifact1": {
                    "name": class1,
                    "file": file1,
                    "type": "class"
                },
                "artifact2": {
                    "name": class2,
                    "file": file2,
                    "type": "class"
                },
                "similarity_score": similarity_score
            })

    # 为每个类，选择与其最相似的前10个类
    class_similarity_results = defaultdict(list)
    for result in similarity_results:
        class_similarity_results[result["artifact1"]["name"]].append(result)
        class_similarity_results[result["artifact2"]["name"]].append(result)

    # 使用 heapq 选择每个类与其他类的前5个相似度最高的结果
    top_class_similarities = []
    for class_name, similarities in class_similarity_results.items():
        top_similarities = heapq.nlargest(5, similarities, key=lambda x: x["similarity_score"])
        for similarity in top_similarities:
            top_class_similarities.append(similarity)

    # 对于每个函数，只记录与其相似度最高的前5个函数
    for (file1, func1, info1), (file2, func2, info2) in combinations(all_functions, 2):
        similarity_score = calculate_similarity(info1["code"], info2["code"])
        similarity_results.append({
                "artifact1": {
                    "name": func1,
                    "file": file1,
                    "type": "function"
                },
                "artifact2": {
                    "name": func2,
                    "file": file2,
                    "type": "function"
                },
                "similarity_score": similarity_score
            })

    # 为每个函数，选择与其最相似的前5个函数
    function_similarity_results = defaultdict(list)
    for result in similarity_results:
        function_similarity_results[result["artifact1"]["name"]].append(result)
        function_similarity_results[result["artifact2"]["name"]].append(result)

    # 使用 heapq 选择每个函数与其他函数的前5个相似度最高的结果
    top_function_similarities = []
    for func_name, similarities in function_similarity_results.items():
        top_similarities = heapq.nlargest(5, similarities, key=lambda x: x["similarity_score"])
        for similarity in top_similarities:
            top_function_similarities.append(similarity)

    # 将类和函数的最相似度对合并
    final_results = top_class_similarities + top_function_similarities

    return json.dumps(final_results, indent=2)

if __name__ == "__main__":
    file_paths = json.loads(sys.argv[1])  # 接收文件列表

    result = analyze_multiple_files(file_paths)
    print(result)  # 输出 LS 结果