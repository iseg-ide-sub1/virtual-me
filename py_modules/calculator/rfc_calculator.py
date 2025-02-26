import ast
import sys

class RFCAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.method_count = 0  # 类内部方法数
        self.external_calls = set()  # 类外部方法调用集合

    def visit_ClassDef(self, node):
        """ 进入类定义，分析方法和调用 """
        self.method_count = 0
        self.external_calls.clear()

        for body_item in node.body:
            if isinstance(body_item, ast.FunctionDef):  # 统计类内部方法
                self.method_count += 1

            if isinstance(body_item, ast.Expr) and isinstance(body_item.value, ast.Call):
                self.visit_Call(body_item.value)  # 统计类方法调用

        rfc_value = self.method_count + len(self.external_calls)
        print(f"类 {node.name} 的 RFC 值: {rfc_value}")

    def visit_Call(self, node):
        """ 统计方法调用 """
        if isinstance(node.func, ast.Attribute):  # 例如 self.foo() 或 obj.foo()
            method_name = node.func.attr
            self.external_calls.add(method_name)

    def analyze(self, source_code):
        tree = ast.parse(source_code)
        self.visit(tree)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_code = sys.argv[1]
        analyzer = RFCAnalyzer()
        analyzer.analyze(user_code)
    else:
        print("error: no input provided")