import clang.cindex
import json
import sys
import os

all_classes = []
all_functions = []
cnt = 0
MAX_FILE_SIZE = 10 * 1024  # 10KB的大小阈值

def get_code(file_path, start_line, end_line):
        """获取节点的代码"""
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return ''.join(lines[start_line - 1:end_line])

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

def traverse_ast(cursor, file_path):
    global cnt
    cnt += 1
    node = {
        "id": cnt,
        "name": cursor.displayname,
        "type": str(cursor.kind),
        "range": [cursor.extent.start.line, cursor.extent.end.line],
        "children": []
    }

    if is_function_cursor(cursor):
        function = {
            "id": cnt,
            "name": cursor.displayname,
            "file": file_path,
            "range": [cursor.extent.start.line, cursor.extent.end.line],
            "code": get_code(file_path, cursor.extent.start.line, cursor.extent.end.line)
        }
        all_functions.append(function)

    elif is_class_cursor(cursor):
        cla = {
            "id": cnt,
            "name": cursor.displayname,
            "file": file_path,
            "range": [cursor.extent.start.line, cursor.extent.end.line],
            "code": get_code(file_path, cursor.extent.start.line, cursor.extent.end.line)
        }
        all_classes.append(cla)

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
        # 检查文件大小，如果超过阈值则跳过该文件
        if os.path.getsize(file_path) > MAX_FILE_SIZE:
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
    # 从命令行参数接收文件路径列表
    file_paths = json.loads(sys.argv[1])  # 接收多个文件路径
    
    result = analyze_multiple_files(file_paths)
    print(result)  # 输出 JSON 结果