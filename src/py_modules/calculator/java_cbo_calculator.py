import sys
import json
import javalang
from itertools import combinations
from collections import defaultdict

class CBOAnalyzer:
    def __init__(self):
        self.class_methods = defaultdict(set)  # {类名: {方法集合}}
        self.class_dependencies = defaultdict(list)  # {类名: {方法调用的其他类}}，这里保存每个调用的类
        self.class_inheritance = defaultdict(set)  # {类名: {继承或实现的类}}
        self.class_fields = defaultdict(set)  # {类名: {访问的其他类字段}}
    
    def analyze_java_file(self, filepath):
        """ 解析 Java 文件并提取类与方法调用关系 """
        with open(filepath, "r", encoding="utf-8") as f:
            code = f.read()

        try:
            tree = javalang.parse.parse(code)  # 解析 Java 代码
        except javalang.parser.JavaSyntaxError:
            return  # 跳过解析失败的文件

        for _, node in tree.filter(javalang.tree.ClassDeclaration):
            class_name = node.name

            # 处理继承类
            if node.extends:  # 检查是否有继承
                for base in node.extends:
                    self.class_inheritance[class_name].add(base)  # 记录继承的类
            else:
                self.class_inheritance[class_name] = set()  # 没有继承的类

            # 处理实现接口
            if node.implements:  # 检查是否有实现接口
                for imp in node.implements:
                    self.class_inheritance[class_name].add(imp)  # 记录实现的接口
            else:
                self.class_inheritance[class_name] = set()  # 没有实现接口

            # 记录类的方法
            for method in node.methods:
                self.class_methods[class_name].add(method.name)  # 记录方法名

        # 处理方法调用
        for _, node in tree.filter(javalang.tree.MethodInvocation):
            if node.qualifier:  # 方法调用
                self.class_dependencies[node.qualifier].append(node.member)

        # 处理字段访问，使用 MemberReference 而不是 FieldReference
        for _, node in tree.filter(javalang.tree.MemberReference):
            if node.qualifier:  # 字段或方法访问
                self.class_fields[node.qualifier].add(node.member)



    def compute_cbo(self, file1, file2):
        """ 计算两个文件之间的 CBO（考虑调用次数、继承关系、字段访问等） """
        shared_dependencies = 0
        for class1 in self.class_methods:
            for class2 in self.class_dependencies:
                # 检查类间的调用关系
                shared_dependencies += self.class_dependencies[class2].count(class1)

            # 考虑继承关系
            for class2 in self.class_inheritance:
                if class1 in self.class_inheritance[class2]:
                    shared_dependencies += 2  # 继承关系加权值

            # 考虑字段访问
            for class2 in self.class_fields:
                if class1 in self.class_fields[class2]:
                    shared_dependencies += 1  # 字段访问增加 CBO

        return shared_dependencies

    def analyze_all_files(self, file_list):
        """ 解析所有 Java 文件并计算 CBO """
        for file in file_list:
            self.analyze_java_file(file)

        cbo_results = []

        # 遍历文件列表，生成所有文件对的组合
        for file1, file2 in combinations(file_list, 2):
            cbo_result = self.compute_cbo(file1, file2)
    
            cbo_results.append({
                "file1": file1,
                "file2": file2,
                "cbo": cbo_result
            })

        # 将结果转换为 JSON 格式的字符串
        json_results = json.dumps(cbo_results, indent=4)

        return json_results


if __name__ == "__main__":
    input_files = json.loads(sys.argv[1])  # 从前端接收 Java 文件列表
    analyzer = CBOAnalyzer()
    result = analyzer.analyze_all_files(input_files)

    print(result)  # 返回 JSON 结果