import esprima
import json
import sys
import os
from itertools import combinations
import heapq 
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

all_classes = []
all_functions = []
similarity_results = []

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


def get_code(file_path, start_line, end_line):
        """获取节点的代码"""
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return ''.join(lines[start_line - 1:end_line])


def get_name(node):
    """
    获取节点的名称：
    - 对于函数、类、变量声明等，尝试从 id 中提取名称。
    - 如果节点中有直接的 name 属性，则返回该属性。
    """
    node_type = node.get("type")
    if node_type in ("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"):
        if node.get("id") and "name" in node["id"]:
            return node["id"]["name"]
    if node_type == "ClassDeclaration":
        if node.get("id") and "name" in node["id"]:
            return node["id"]["name"]
    if node_type == "VariableDeclarator":
        if node.get("id") and "name" in node["id"]:
            return node["id"]["name"]
    if "name" in node and isinstance(node["name"], str):
        return node["name"]
    return ""


def transform_node(file_path, node):
    """
    将 AST 的一个节点转换为目标 JSON 格式：
    - 提取 name、type、range 信息。
    - 递归查找并转换所有子节点。
    """
    transformed = {
        "name": get_name(node),
        "type": node.get("type"),
        "range": [],
        "code": "",
        "children":[]
    }

    if "loc" in node:
        transformed["range"] = [node["loc"]["start"]["line"], node["loc"]["end"]["line"]]

    if node.get("type") == "ClassDeclaration":
        transformed["code"] = get_code(file_path, node["loc"]["start"]["line"], node["loc"]["end"]["line"])
        all_classes.append({
            "name": transformed["name"],
            "file": file_path,
            "code": transformed["code"]
        })
    elif node.get("type") in ("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"):
        transformed["code"] = get_code(file_path, node["loc"]["start"]["line"], node["loc"]["end"]["line"])
        all_functions.append({
            "name": transformed["name"],
            "file": file_path,
            "code": transformed["code"]
        })
    
    # 遍历节点所有属性，寻找子节点
    for key, value in node.items():
        # 跳过位置信息和 tokens 等无关信息
        if key in ("loc", "range", "tokens"):
            continue
        # 如果属性为字典且包含 type，则视为一个子节点
        if isinstance(value, dict) and "type" in value:
            transformed["children"].append(transform_node(file_path, value))
        # 如果属性为列表，则检查列表中每个元素是否为节点
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict) and "type" in item:
                    transformed["children"].append(transform_node(file_path, item))
    
    return transformed


def analyze_code_structure(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        source_code = f.read()

    # 解析 TypeScript 代码（注：esprima 同样支持解析 JavaScript 代码）
    try:
        ast = esprima.parseScript(source_code, options={'loc': True, 'range': True, 'tokens': True})
        ast_dict = ast.toDict()
        transformed_ast = transform_node(file_path, ast_dict)
        return transformed_ast
    except Exception as e:
        return {"error": f"Error parsing TypeScript in {file_path}: {e}"}


def analyze_multiple_files(file_paths):
    """ 解析多个 JavaScript 文件并返回all_classes, all_functions """
    result = []

    for file_path in file_paths:
        if not os.path.exists(file_path):
            result.append({"file": file_path, "error": "File not found"})
        else:
            tree_structure = analyze_code_structure(file_path)
            result.append({"file": file_path, "structure": tree_structure})

    for class1, class2 in combinations(all_classes, 2):
        similarity_score = calculate_similarity(class1["code"], class2["code"])
        similarity_results.append({
                "artifact1": {
                    "name": class1["name"],
                    "file": class1["file"],
                    "type": "class"
                },
                "artifact2": {
                    "name": class2["name"],
                    "file": class2["file"],
                    "type": "class"
                },
                "similarity_score": similarity_score
            })

    for func1, func2 in combinations(all_functions, 2):
        similarity_score = calculate_similarity(func1["code"], func2["code"])
        similarity_results.append({
                "artifact1": {
                    "name": func1["name"],
                    "file": func1["file"],
                    "type": "function"
                },
                "artifact2": {
                    "name": func1["name"],
                    "file": func1["file"],
                    "type": "function"
                },
                "similarity_score": similarity_score
            })


if __name__ == "__main__":
    # 从命令行接收一个 JSON 格式的文件路径列表
    file_paths = json.loads(sys.argv[1])  # 接收文件列表

    analyze_multiple_files(file_paths)

    # with open('data.json', 'w') as json_file:
    #     json.dump(similarity_results, json_file, indent=2)
    print(json.dumps(similarity_results, indent=2))  # 返回 JSON 结果