import json

path = '../../../virtualme-logs/test.json'
with open(path, 'r', encoding='utf-8') as f:
    log_data = json.load(f)
print(len(log_data))