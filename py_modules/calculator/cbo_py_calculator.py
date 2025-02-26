import clang.cindex
import json
import sys
from itertools import combinations
import heapq 
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

all_classes = []
all_functions = []

class_counter = 1  # 用于类的自增编号
function_counter = 1  # 用于函数的自增编号

class ClassInfo:
    def __init__(self, id, name, file, code):
        self.id = id
        self.name = name
        self.file = file
        self.code = code
        self.instances = []  # 存储被当前类实例化的类编号
        self.called_methods = []  # 存储当前类调用的类 B 的编号
        self.accessed_attributes = []  # 存储当前类访问的类 B 的编号

    def add_instance(self, class_id):
        if class_id not in self.instances:
            self.instances.append(class_id)

    def add_called_method(self, class_id):
        if class_id not in self.called_methods:
            self.called_methods.append(class_id)

    def add_accessed_attribute(self, class_id):
        if class_id not in self.accessed_attributes:
            self.accessed_attributes.append(class_id)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "file": self.file,
            "code": self.code,
            "instances": self.instances,
            "called_methods": self.called_methods,
            "accessed_attributes": self.accessed_attributes
        }

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


def get_code(file_path, start_line, end_line):
        """获取节点的代码"""
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return ''.join(lines[start_line - 1:end_line])


def traverse_ast(cursor, file_path):
    global class_counter, function_counter  # 使用全局的计数器
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
            "id": function_counter,  # 为每个函数添加自增编号
            "name": cursor.displayname,
            "file": file_path,
            "code": node["code"]
        })
        function_counter += 1  # 自增

    elif is_class_cursor(cursor):
        node["code"] = get_code(file_path, cursor.extent.start.line, cursor.extent.end.line)
        class_info = ClassInfo(class_counter, cursor.displayname, file_path, node["code"])
        all_classes.append(class_info)  # 存储 ClassInfo 对象
        class_counter += 1  # 自增

        # 遍历子节点寻找实例化的类
        for child in cursor.get_children():
            if child.kind == clang.cindex.CursorKind.CXX_NEW_EXPR:  # 查找 new 表达式（可能表示实例化）
                if child.type and child.type.spelling:  # 如果类型存在，检查是否为类实例化
                    instantiated_class_name = child.type.spelling
                    for c in all_classes:
                        if c.name == instantiated_class_name and c.file != file_path:
                            class_info.add_instance(c.id)

            # 查找方法调用
            if child.kind == clang.cindex.CursorKind.CXX_CALL_EXPR:  # 查找方法调用
                if child.semantic_parent and is_class_cursor(child.semantic_parent):
                    called_class_name = child.semantic_parent.displayname
                    for c in all_classes:
                        if c.name == called_class_name and c.file != file_path:
                            class_info.add_called_method(c.id)

            # 查找成员变量访问
            if child.kind == clang.cindex.CursorKind.CXX_MEMBER_REF_EXPR:  # 查找成员变量访问
                # 获取成员变量的所属类
                if child.semantic_parent and is_class_cursor(child.semantic_parent):
                    accessed_class_name = child.semantic_parent.displayname
                    for c in all_classes:
                        if c.name == accessed_class_name and c.file != file_path:
                            class_info.add_accessed_attribute(c.id)

    for child in cursor.get_children():
        traverse_ast(child, file_path)

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


if __name__ == "__main__":
    # 从命令行参数接收文件路径列表
    file_paths = json.loads(sys.argv[1])  # 接收多个文件路径
    
    result = analyze_multiple_files(file_paths)
    
    # 输出结果
    print(json.dumps({
        "all_classes": [class_info.to_dict() for class_info in all_classes],
        "all_functions": all_functions
    }, indent=2))  # 输出 JSON 结果