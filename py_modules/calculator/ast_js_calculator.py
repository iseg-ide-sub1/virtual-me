import esprima
import json
import sys
import os

all_classes = []
all_functions = []
cnt = 0

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


def transform_node(node, file_path):
    """
    将 AST 的一个节点转换为目标 JSON 格式：
    - 提取 name、type、range 信息。
    - 递归查找并转换所有子节点。
    """
    global cnt
    cnt += 1
    transformed = {
        "id": cnt,
        "name": get_name(node),
        "type": node.get("type"),
        "range": [],
        "children": []
    }
    
    if "loc" in node:
        transformed["range"] = [node["loc"]["start"]["line"], node["loc"]["end"]["line"]]
        if node.get("type") == "ClassDeclaration":
            cla = {
                "id": cnt,
                "name": get_name(node),
                "file": file_path,
                "range": [node["loc"]["start"]["line"], node["loc"]["end"]["line"]],
                "code": get_code(file_path, node["loc"]["start"]["line"], node["loc"]["end"]["line"])
            }
            all_classes.append(cla)

        elif node.get("type") in ("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"):
            func = {
                "id": cnt,
                "name": get_name(node),
                "file": file_path,
                "range": [node["loc"]["start"]["line"], node["loc"]["end"]["line"]],
                "code": get_code(file_path, node["loc"]["start"]["line"], node["loc"]["end"]["line"])
            }
            all_functions.append(func)
    
    # 遍历节点所有属性，寻找子节点
    for key, value in node.items():
        # 跳过位置信息和 tokens 等无关信息
        if key in ("loc", "range", "tokens"):
            continue
        # 如果属性为字典且包含 type，则视为一个子节点
        if isinstance(value, dict) and "type" in value:
            transformed["children"].append(transform_node(value, file_path))
        # 如果属性为列表，则检查列表中每个元素是否为节点
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict) and "type" in item:
                    transformed["children"].append(transform_node(item, file_path))
    
    return transformed


def analyze_code_structure(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        source_code = f.read()

    try:
        ast = esprima.parseScript(source_code, options={'loc': True, 'range': True, 'tokens': True})
        ast_dict = ast.toDict()
        transformed_ast = transform_node(ast_dict, file_path)
        return transformed_ast
    except Exception as e:
        return {"error": f"Error parsing TypeScript in {file_path}: {e}"}


def analyze_multiple_files(file_paths):
    """ 解析多个 TypeScript 文件并返回树状结构 """
    result = []

    for file_path in file_paths:
        if not os.path.exists(file_path):
            result.append({"file": file_path, "error": "File not found"})
        else:
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
    # 从命令行接收一个 JSON 格式的文件路径列表
    file_paths = json.loads(sys.argv[1])  # 接收文件列表

    result = analyze_multiple_files(file_paths)
    print(result)  # 返回 JSON 结果