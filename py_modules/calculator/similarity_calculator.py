import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from itertools import combinations


class SimilarityAnalyzer:
    def __init__(self):
        pass

    def calculate_similarity(self, file1, file2):
        """ 计算两个文件之间的语义相似度 """
        with open(file1, 'r', encoding='utf-8') as f1, open(file2, 'r', encoding='utf-8') as f2:
            code1 = f1.read().strip()  # 使用 strip() 去除空白字符
            code2 = f2.read().strip()

        if not code1 or not code2:  # 如果任何一个文件为空，返回 0 相似度
            return 0.0

        # 使用TF-IDF向量化器将代码文本转换为向量
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([code1, code2])
        
        # 计算余弦相似度
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])
        return similarity[0][0]

    def analyze_all_files(self, file_list):
        """ 解析所有文件并计算文件之间的语义相似度 """
        similarity_results = []

        # 遍历文件列表，生成所有文件对的组合
        for file1, file2 in combinations(file_list, 2):
            similarity_score = self.calculate_similarity(file1, file2)
    
            similarity_results.append({
                "file1": file1,
                "file2": file2,
                "similarity_score": similarity_score
            })

        # 将结果转换为 JSON 格式的字符串
        json_results = json.dumps(similarity_results, indent=4)

        return json_results


if __name__ == "__main__":
    input_files = json.loads(sys.argv[1])  # 从前端接收文件列表
    analyzer = SimilarityAnalyzer()
    result = analyzer.analyze_all_files(input_files)

    print(result)  # 返回 JSON 结果