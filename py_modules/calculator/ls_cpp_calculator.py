import clang.cindex
import json
import sys
from itertools import combinations
import heapq 
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

all_classes = []
all_functions = []
similarity_results = []

"""
函数相关的 CursorKind
FUNCTION_DECL:表示函数声明。
CXX_METHOD:表示 C++ 类的成员函数。
DESTRUCTOR:表示析构函数。
CONSTRUCTOR:表示构造函数。
FUNCTION_TEMPLATE:表示函数模板。
"""
def is_function_cursor(cursor):
    function_kinds = [
        clang.cindex.CursorKind.FUNCTION_DECL,
        clang.cindex.CursorKind.CXX_METHOD,
        clang.cindex.CursorKind.CONSTRUCTOR,
        clang.cindex.CursorKind.DESTRUCTOR,
        clang.cindex.CursorKind.FUNCTION_TEMPLATE
    ]
    return cursor.kind in function_kinds


"""
类相关的 CursorKind
STRUCT_DECL:表示结构体声明。
CLASS_DECL:表示类声明。
UNION_DECL:表示联合体声明。
"""
def is_class_cursor(cursor):
    class_kinds = [
        clang.cindex.CursorKind.STRUCT_DECL,
        clang.cindex.CursorKind.CLASS_DECL,
        clang.cindex.CursorKind.UNION_DECL,
    ]
    return cursor.kind in class_kinds


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


def traverse_ast(cursor, file_path):
    node = {
        "name": cursor.displayname,
        "type": str(cursor.kind),
        "range": [cursor.extent.start.line, cursor.extent.end.line],
        "code": "",
        "children": []
    }

    if is_function_cursor(cursor):
        node["code"] = get_code(file_path, cursor.extent.start.line, cursor.extent.end.line)
        all_functions.append({
            "name": cursor.displayname,
            "file": file_path,
            "code": node["code"]
        })
    elif is_class_cursor(cursor):
        node["code"] = get_code(file_path, cursor.extent.start.line, cursor.extent.end.line)
        all_classes.append({
            "name": cursor.displayname,
            "file": file_path,
            "code": node["code"]
        })

    for child in cursor.get_children():
        node["children"].append(traverse_ast(child, file_path))

    return node

def analyze_code_structure(file_path):
    try:
        index = clang.cindex.Index.create()
        # 解析 C++ 文件并获取根节点
        translation_unit = index.parse(file_path)
        
        # 获取 AST 的树形结构
        ast_json = traverse_ast(translation_unit.cursor, file_path)
        return ast_json
    except Exception as e:
        return {"error": str(e)}

def analyze_multiple_files(file_paths):
    result = []

    for file_path in file_paths:
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

    # with open('data.json', 'w') as json_file:
    #     json.dump(similarity_results, json_file, indent=2)

if __name__ == "__main__":
    # 从命令行参数接收文件路径列表
    file_paths = json.loads(sys.argv[1])  # 接收多个文件路径
    
    result = analyze_multiple_files(file_paths)
    print(json.dumps(result, indent=2))  # 输出 JSON 结果